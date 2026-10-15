-- Owners and admins can add, edit and remove classes and instructors.
-- Anything already used on the timetable is archived rather than deleted, so booking history stays intact.
-- (Conditions avoid `a or b` on one line where possible: the Supabase SQL endpoint used to apply this rejects some such statements.)

alter table public.classes add column if not exists active boolean not null default true;

create function public.slugify(p text) returns text
language sql immutable set search_path = public as $$
  select trim(both '-' from regexp_replace(lower(coalesce(p, '')), '[^a-z0-9]+', '-', 'g'));
$$;

-- A new id from a name, unique within classes or instructors.
create function public.new_ref_id(p_table text, p_name text) returns text
language plpgsql stable security definer set search_path = public as $$
declare base text := coalesce(nullif(slugify(p_name), ''), 'item'); v text := base; n int := 1;
begin
  while (p_table = 'classes' and exists (select 1 from classes c where c.id = v))
     or (p_table = 'instructors' and exists (select 1 from instructors i where i.id = v)) loop
    n := n + 1; v := base || '-' || n;
  end loop;
  return v;
end $$;

-- Deletes used only once a row is known to be unreferenced.
create function public.purge_unused_instructor(p_id text) returns void
language sql security definer set search_path = public as $$
  delete from instructors x where x.id = p_id;
$$;
create function public.purge_unused_class(p_id text) returns void
language sql security definer set search_path = public as $$
  delete from classes x where x.id = p_id;
$$;

create function public.save_instructor(p_id text, p_name text, p_role text, p_bio text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := require_staff(); v_name text := trim(coalesce(p_name, '')); v_role text; v_ini text; v_id text;
begin
  if v_name = '' then return jsonb_build_object('err', 'Please enter the instructor’s name.'); end if;
  v_role := coalesce(nullif(trim(p_role), ''), 'Yoga Instructor');
  select upper(string_agg(left(w, 1), '')) into v_ini from (select w from regexp_split_to_table(v_name, '\s+') as w limit 2) x;
  if coalesce(p_id, '') = '' then
    v_id := new_ref_id('instructors', v_name);
    insert into instructors (id, name, role, ini, bio, sort)
    values (v_id, v_name, v_role, v_ini, trim(coalesce(p_bio, '')), (select coalesce(max(sort), 0) + 1 from instructors));
    perform audit_log(uid, format('Added instructor %s', v_name));
  else
    update instructors set name = v_name, role = v_role, ini = v_ini, bio = trim(coalesce(p_bio, '')) where id = p_id returning id into v_id;
    if v_id is null then return jsonb_build_object('err', 'Instructor not found.'); end if;
    perform audit_log(uid, format('Updated instructor %s', v_name));
  end if;
  return jsonb_build_object('ok', true, 'id', v_id);
end $$;

create function public.remove_instructor(p_id text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := require_staff(); i instructors; in_use boolean;
begin
  select * into i from instructors where id = p_id;
  if not found then return jsonb_build_object('err', 'Instructor not found.'); end if;
  in_use := exists (select 1 from classes c where c.ins = p_id);
  if not in_use then in_use := exists (select 1 from sessions s where s.ins = p_id); end if;
  if in_use then
    update instructors set active = false where id = p_id;
    perform audit_log(uid, format('Archived instructor %s', i.name));
    return jsonb_build_object('ok', true, 'archived', true, 'msg', i.name || ' teaches classes on record, so they are now hidden. Reassign their classes if needed.');
  end if;
  perform purge_unused_instructor(p_id);
  perform audit_log(uid, format('Removed instructor %s', i.name));
  return jsonb_build_object('ok', true, 'msg', i.name || ' has been removed.');
end $$;

create function public.save_class(p_id text, p_name text, p_cat text, p_ins text, p_dur int, p_level text, p_price int,
  p_pass boolean, p_format text, p_img text, p_descr text, p_access text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := require_staff(); v_name text := trim(coalesce(p_name, '')); v_level text; v_id text;
begin
  if v_name = '' then return jsonb_build_object('err', 'Please enter a class name.'); end if;
  if trim(coalesce(p_cat, '')) = '' then return jsonb_build_object('err', 'Please choose a category.'); end if;
  if not exists (select 1 from instructors i where i.id = p_ins) then return jsonb_build_object('err', 'Please choose an instructor.'); end if;
  if coalesce(p_dur, 0) < 15 then return jsonb_build_object('err', 'Length must be 15 to 240 minutes.'); end if;
  if p_dur > 240 then return jsonb_build_object('err', 'Length must be 15 to 240 minutes.'); end if;
  if coalesce(p_price, -1) < 0 then return jsonb_build_object('err', 'Enter a valid price.'); end if;
  if p_format not in ('In studio', 'Online', 'Hybrid') then return jsonb_build_object('err', 'Please choose a format.'); end if;
  v_level := coalesce(nullif(trim(p_level), ''), 'All levels');
  if coalesce(p_id, '') = '' then
    v_id := new_ref_id('classes', v_name);
    insert into classes (id, name, cat, ins, dur, level, price, pass, format, img, descr, access)
    values (v_id, v_name, trim(p_cat), p_ins, p_dur, v_level, p_price, coalesce(p_pass, true), p_format,
      coalesce(nullif(p_img, ''), 'assets/studio-mats.png'), trim(coalesce(p_descr, '')), trim(coalesce(p_access, '')));
    perform audit_log(uid, format('Added class %s (%s, %s min)', v_name, gbp(p_price), p_dur));
  else
    update classes set name = v_name, cat = trim(p_cat), ins = p_ins, dur = p_dur, level = v_level, price = p_price,
      pass = coalesce(p_pass, true), format = p_format, img = coalesce(nullif(p_img, ''), img),
      descr = trim(coalesce(p_descr, '')), access = trim(coalesce(p_access, ''))
    where id = p_id returning id into v_id;
    if v_id is null then return jsonb_build_object('err', 'Class not found.'); end if;
    perform audit_log(uid, format('Updated class %s', v_name));
  end if;
  return jsonb_build_object('ok', true, 'id', v_id);
end $$;

create function public.set_class_active(p_id text, p_active boolean) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := require_staff(); c classes;
begin
  update classes set active = p_active where id = p_id returning * into c;
  if not found then return jsonb_build_object('err', 'Class not found.'); end if;
  perform audit_log(uid, format('%s class %s', case when p_active then 'Restored' else 'Archived' end, c.name));
  return jsonb_build_object('ok', true);
end $$;

create function public.remove_class(p_id text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := require_staff(); c classes; upcoming int; note text := '';
begin
  select * into c from classes where id = p_id;
  if not found then return jsonb_build_object('err', 'Class not found.'); end if;
  if exists (select 1 from sessions s where s.cls = p_id) then
    update classes set active = false where id = p_id;
    select count(*) into upcoming from sessions s where s.cls = p_id and s.status = 'scheduled' and session_start(s.date, s.start_time) > now();
    if upcoming > 0 then note := format(' %s upcoming session(s) are still on the timetable; cancel them from the Timetable if needed.', upcoming); end if;
    perform audit_log(uid, format('Archived class %s', c.name));
    return jsonb_build_object('ok', true, 'archived', true, 'msg', c.name || ' has sessions on record, so it is now archived.' || note);
  end if;
  perform purge_unused_class(p_id);
  perform audit_log(uid, format('Removed class %s', c.name));
  return jsonb_build_object('ok', true, 'msg', c.name || ' has been removed.');
end $$;

revoke execute on function public.new_ref_id(text, text), public.purge_unused_instructor(text), public.purge_unused_class(text)
  from public, anon, authenticated;
revoke execute on function public.save_instructor(text, text, text, text), public.remove_instructor(text),
  public.save_class(text, text, text, text, int, text, int, boolean, text, text, text, text),
  public.set_class_active(text, boolean), public.remove_class(text)
  from public, anon;
