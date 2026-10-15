-- Sonshine Hollistic — booking engine.
-- Every write the apps make is one of these functions. They run as SECURITY DEFINER, check who is
-- calling, lock the rows they touch and enforce: capacity, one booking per person per class, an
-- append-only credit ledger, payments recorded separately from bookings, the cancellation window,
-- waitlist offers, staff-only actions and an audit log of staff changes.
-- Expected problems come back as {"err": "..."} so the apps can show them; authorisation failures raise.

-- ---------------------------------------------------------------- formatting (matches the app copy)
create function public.fmt_d(d date) returns text language sql immutable as $$ select to_char(d, 'Dy FMDD Mon') $$;
create function public.fmt_dl(d date) returns text language sql immutable as $$ select to_char(d, 'FMDay FMDD FMMonth') $$;
create function public.fmt_t(t time) returns text language sql immutable as $$ select lower(to_char(t, 'FMHH12:MIAM')) $$;
create function public.fmt_tst(ts timestamptz) returns text language sql stable as $$
  select to_char(ts at time zone 'Europe/London', 'FMDD Mon, ') || public.fmt_t((ts at time zone 'Europe/London')::time) $$;
create function public.gbp(p int) returns text language sql immutable as $$ select '£' || to_char(p / 100.0, 'FM999999990.00') $$;
create function public.session_start(d date, t time) returns timestamptz language sql immutable as $$
  select (d + t) at time zone 'Europe/London' $$;

-- ---------------------------------------------------------------- internals
create function public.notify(p_user uuid, p_text text) returns void
language sql security definer set search_path = public as $$
  insert into notifications (user_id, text) values (p_user, p_text);
$$;

create function public.audit_log(p_actor uuid, p_action text) returns void
language sql security definer set search_path = public as $$
  insert into audit (actor, actor_label, action)
  select p_actor, coalesce((select first || ' ' || last || ' (' || role || ')' from profiles where id = p_actor), 'System'), p_action;
$$;

create function public.require_staff() returns uuid
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_staff(auth.uid()) then raise exception 'Not authorised' using errcode = '42501'; end if;
  return auth.uid();
end $$;

-- The signed-in, active user, or null.
create function public.active_uid() returns uuid
language sql stable security definer set search_path = public as $$
  select id from profiles where id = auth.uid() and active;
$$;

create function public.taken(p_session uuid) returns int
language sql stable security definer set search_path = public as $$
  select count(*)::int from bookings where session_id = p_session and status in ('confirmed', 'attended', 'noshow', 'offered');
$$;

create function public.pass_balance(p_pass uuid) returns int
language sql stable security definer set search_path = public as $$
  select coalesce(sum(delta), 0)::int from ledger where pass_id = p_pass;
$$;

create function public.pass_covers(p_product text, p_cls text) returns boolean
language sql stable security definer set search_path = public as $$
  select case when pr.scope = 'kids' then c.cat = 'Kids & Teens' else c.pass end
  from products pr, classes c where pr.id = p_product and c.id = p_cls;
$$;

create function public.test_payment(p_user uuid, p_amount int, p_kind text, p_label text, p_card text, p_product text default null)
returns payments
language plpgsql security definer set search_path = public as $$
declare p payments;
begin
  insert into payments (user_id, ref, amount, kind, label, status, product_id)
  values (p_user, 'pi_test_' || upper(substr(md5(gen_random_uuid()::text), 1, 14)), p_amount, p_kind, p_label,
          case when p_card = 'fail' then 'failed' else 'succeeded' end, p_product)
  returning * into p;
  return p;
end $$;

-- Offer freed places to the waitlist, in joining order. Stale offers lapse first.
create function public.promote(p_session uuid) returns void
language plpgsql security definer set search_path = public as $$
declare s sessions; c classes; nxt bookings; hrs int; st timestamptz; lapsed bookings;
begin
  select * into s from sessions where id = p_session;
  st := session_start(s.date, s.start_time);
  if s.status = 'cancelled' or st < now() then return; end if;
  select * into c from classes where id = s.cls;
  for lapsed in update bookings set status = 'cancelled', cancelled_at = now()
      where session_id = p_session and status = 'offered' and offer_until < now() returning * loop
    perform notify(lapsed.user_id, format('Your waitlist offer for %s, %s has lapsed.', c.name, fmt_d(s.date)));
  end loop;
  select offer_hours into hrs from settings;
  while taken(p_session) < s.cap loop
    select * into nxt from bookings where session_id = p_session and status = 'waitlisted' order by created limit 1;
    exit when not found;
    update bookings set status = 'offered', offer_until = least(now() + make_interval(hours => hrs), st) where id = nxt.id
      returning * into nxt;
    perform notify(nxt.user_id, format('A place has opened on %s, %s. Claim it by %s.', c.name, fmt_d(s.date), fmt_tst(nxt.offer_until)));
  end loop;
end $$;

-- ---------------------------------------------------------------- read helpers (aggregate only)
create function public.session_availability(p_from date, p_to date)
returns table (session_id uuid, taken int, waiting int)
language sql stable security definer set search_path = public as $$
  select s.id,
    count(b.id) filter (where b.status in ('confirmed', 'attended', 'noshow', 'offered'))::int,
    count(b.id) filter (where b.status = 'waitlisted')::int
  from sessions s left join bookings b on b.session_id = s.id
  where s.date between p_from and p_to
  group by s.id;
$$;

create function public.event_availability()
returns table (event_id text, taken int)
language sql stable security definer set search_path = public as $$
  select e.id, count(b.id) filter (where b.status = 'confirmed')::int
  from events e left join event_bookings b on b.event_id = e.id
  group by e.id;
$$;

create function public.my_waitlist_positions()
returns table (booking_id uuid, pos int)
language sql stable security definer set search_path = public as $$
  select m.id, (select count(*)::int from bookings o
                where o.session_id = m.session_id and o.status = 'waitlisted' and o.created <= m.created)
  from bookings m where m.user_id = auth.uid() and m.status = 'waitlisted';
$$;

-- ---------------------------------------------------------------- customer actions
create function public.book_class(p_session uuid, p_method text, p_pass uuid default null, p_card text default 'ok')
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := active_uid(); s sessions; c classes; ex bookings; pp passes; pay payments; b bookings;
  claiming boolean := false;
begin
  if uid is null then
    return jsonb_build_object('err', case when auth.uid() is null then 'Please sign in to book.'
      else 'This account has been deactivated. Please contact the studio.' end);
  end if;
  select * into s from sessions where id = p_session for update; -- serialises capacity checks
  if not found or s.status = 'cancelled' then return jsonb_build_object('err', 'This session has been cancelled.'); end if;
  if session_start(s.date, s.start_time) < now() then return jsonb_build_object('err', 'This class has already started.'); end if;
  select * into c from classes where id = s.cls;
  select * into ex from bookings where user_id = uid and session_id = p_session
    and status in ('confirmed', 'waitlisted', 'offered', 'attended', 'noshow');
  if found and ex.status in ('confirmed', 'attended', 'noshow') then
    return jsonb_build_object('err', 'You already have a place on this class.', 'dup', true);
  end if;
  if found and ex.status = 'offered' then
    if ex.offer_until < now() then
      perform promote(p_session);
      return jsonb_build_object('err', 'Sorry — this offer has lapsed and the place has passed to the next person.');
    end if;
    claiming := true;
  end if;
  if not claiming and taken(p_session) >= s.cap then
    return jsonb_build_object('err', 'Sorry — the last place has just been taken. You can join the waitlist instead.', 'full', true);
  end if;

  if p_method = 'pass' then
    select * into pp from passes where id = p_pass and user_id = uid for update;
    if not found then return jsonb_build_object('err', 'Pass not found.'); end if;
    if pp.expires < now() then return jsonb_build_object('err', 'This pass has expired.'); end if;
    if not pass_covers(pp.product, c.id) then return jsonb_build_object('err', 'This pass can’t be used for this class.'); end if;
    if pass_balance(pp.id) < 1 then return jsonb_build_object('err', 'There aren’t enough credits on this pass.'); end if;
  elsif p_method = 'card' then
    if c.price <= 0 then return jsonb_build_object('err', 'This class is free — no payment needed.'); end if;
    pay := test_payment(uid, c.price, 'Class', c.name || ' · ' || fmt_d(s.date), p_card);
    if pay.status = 'failed' then
      return jsonb_build_object('err', 'Your card was declined (test card 4000 0000 0000 0002). No booking was made and you have not been charged.');
    end if;
  elsif p_method = 'free' then
    if c.price > 0 then return jsonb_build_object('err', 'This class isn’t free — please choose a way to pay.'); end if;
  else
    return jsonb_build_object('err', 'Please choose how to pay.');
  end if;

  if ex.id is not null then
    update bookings set status = 'confirmed', method = p_method, pass_id = pp.id, payment_id = pay.id,
      amount = coalesce(pay.amount, 0), offer_until = null
    where id = ex.id returning * into b;
  else
    insert into bookings (user_id, session_id, status, method, pass_id, payment_id, amount)
    values (uid, p_session, 'confirmed', p_method, pp.id, pay.id, coalesce(pay.amount, 0)) returning * into b;
  end if;
  if pay.id is not null then update payments set booking_id = b.id where id = pay.id; end if;
  if pp.id is not null then
    insert into ledger (pass_id, delta, reason, booking_id) values (pp.id, -1, c.name || ' · ' || fmt_d(s.date), b.id);
  end if;
  perform notify(uid, format('Booking confirmed: %s, %s at %s.', c.name, fmt_d(s.date), fmt_t(s.start_time)));
  return jsonb_build_object('ok', true, 'booking_id', b.id);
end $$;

create function public.join_waitlist(p_session uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := active_uid(); s sessions; b bookings; pos int;
begin
  if uid is null then return jsonb_build_object('err', 'Please sign in to join the waitlist.'); end if;
  select * into s from sessions where id = p_session for update;
  if not found or s.status = 'cancelled' then return jsonb_build_object('err', 'This session has been cancelled.'); end if;
  if session_start(s.date, s.start_time) < now() then return jsonb_build_object('err', 'This class has already started.'); end if;
  if not s.waitlist then return jsonb_build_object('err', 'The waitlist isn’t open for this session.'); end if;
  if exists (select 1 from bookings where user_id = uid and session_id = p_session
             and status in ('confirmed', 'waitlisted', 'offered', 'attended', 'noshow')) then
    return jsonb_build_object('err', 'You’re already on this class or its waitlist.');
  end if;
  insert into bookings (user_id, session_id, status) values (uid, p_session, 'waitlisted') returning * into b;
  select count(*) into pos from bookings where session_id = p_session and status = 'waitlisted' and created <= b.created;
  perform notify(uid, format('You’re number %s on the waitlist for %s.', pos, (select name from classes where id = s.cls)));
  perform promote(p_session); -- in case a place is already free
  return jsonb_build_object('ok', true, 'pos', pos);
end $$;

create function public.cancel_booking(p_booking uuid, p_override boolean default false) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := active_uid(); staff boolean; b bookings; s sessions; c classes; cu profiles;
  hrs numeric; v_late boolean; v_restore boolean; was text; msg text;
begin
  if uid is null then return jsonb_build_object('err', 'Please sign in.'); end if;
  staff := is_staff(uid);
  select * into b from bookings where id = p_booking;
  if not found then return jsonb_build_object('err', 'Booking not found.'); end if;
  if b.user_id <> uid and not staff then return jsonb_build_object('err', 'Not authorised.'); end if;
  select * into s from sessions where id = b.session_id for update;
  select * into b from bookings where id = p_booking for update;
  if b.status = 'cancelled' then return jsonb_build_object('err', 'Already cancelled.'); end if;
  select * into c from classes where id = s.cls;
  was := b.status;

  if was in ('waitlisted', 'offered') then
    update bookings set status = 'cancelled', cancelled_at = now() where id = b.id;
    if was = 'offered' then perform promote(s.id); end if;
    return jsonb_build_object('ok', true, 'waitlist', true);
  end if;
  if not staff and (was <> 'confirmed' or session_start(s.date, s.start_time) < now()) then
    return jsonb_build_object('err', 'This booking can no longer be cancelled.');
  end if;

  hrs := extract(epoch from session_start(s.date, s.start_time) - now()) / 3600;
  v_late := hrs < (select cancel_hours from settings);
  v_restore := not v_late or (staff and p_override);
  update bookings set status = 'cancelled', cancelled_at = now(), late = (v_late and not v_restore) where id = b.id;
  if v_restore and b.pass_id is not null then
    insert into ledger (pass_id, delta, reason, booking_id, by)
    values (b.pass_id, 1, 'Credit returned — cancelled ' || c.name, b.id, case when b.user_id <> uid then uid end);
  end if;
  if v_restore and b.payment_id is not null then
    update payments set status = 'refunded', refunded_at = now() where id = b.payment_id and status = 'succeeded';
  end if;
  msg := format('Booking cancelled: %s, %s. ', c.name, fmt_d(s.date)) ||
    case when not v_restore then 'This was inside the notice period, so no credit or refund applies.'
         when b.pass_id is not null then 'Your credit has been returned.'
         when b.payment_id is not null then 'Your refund is on its way (test mode).'
         else '' end;
  perform notify(b.user_id, msg);
  if b.user_id <> uid then
    select * into cu from profiles where id = b.user_id;
    perform audit_log(uid, format('Cancelled %s %s’s booking for %s %s%s', cu.first, cu.last, c.name, fmt_d(s.date),
      case when p_override then ' (override: credit/refund restored)' else '' end));
  end if;
  perform promote(s.id);
  return jsonb_build_object('ok', true, 'late', v_late, 'restore', v_restore);
end $$;

create function public.buy_pass(p_product text, p_card text default 'ok') returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := active_uid(); pr products; pay payments; pp passes;
begin
  if uid is null then return jsonb_build_object('err', 'Please sign in to buy a pass.'); end if;
  select * into pr from products where id = p_product;
  if not found or not pr.on_sale then return jsonb_build_object('err', 'This pass isn’t currently on sale.'); end if;
  pay := test_payment(uid, pr.price, 'Pass', pr.name, p_card, pr.id);
  if pay.status = 'failed' then
    return jsonb_build_object('err', 'Your card was declined (test card 4000 0000 0000 0002). No pass was created and you have not been charged.');
  end if;
  insert into passes (user_id, product, expires, total, payment_id)
  values (uid, pr.id, now() + make_interval(weeks => pr.weeks), pr.credits, pay.id) returning * into pp;
  insert into ledger (pass_id, delta, reason) values (pp.id, pr.credits, 'Purchased ' || pr.name);
  perform notify(uid, format('Payment received: %s for %s (test mode). %s credits added.', gbp(pr.price), pr.name, pr.credits));
  return jsonb_build_object('ok', true, 'pass_id', pp.id);
end $$;

create function public.event_price(e events) returns int
language sql stable as $$
  select case when e.price is null then null
    when e.early is not null and e.early_until is not null and now() < session_start(e.early_until, '23:59') then e.early
    else e.price end;
$$;

create function public.book_event(p_event text, p_card text default 'ok') returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := active_uid(); e events; price int; pay payments;
begin
  if uid is null then return jsonb_build_object('err', 'Please sign in to book.'); end if;
  select * into e from events where id = p_event for update;
  if not found or not e.published or e.kind <> 'book' then return jsonb_build_object('err', 'This event isn’t available.'); end if;
  if exists (select 1 from event_bookings where event_id = e.id and user_id = uid and status = 'confirmed') then
    return jsonb_build_object('err', 'You already have a place at this event.');
  end if;
  if e.deadline is not null and now() > session_start(e.deadline, '23:59') then
    return jsonb_build_object('err', 'Bookings for this event have closed.');
  end if;
  if e.cap is not null and (select count(*) from event_bookings where event_id = e.id and status = 'confirmed') >= e.cap then
    return jsonb_build_object('err', 'Sorry — this event is now full.');
  end if;
  price := coalesce(event_price(e), 0);
  if price > 0 then
    pay := test_payment(uid, price, 'Event', e.name, p_card);
    if pay.status = 'failed' then
      return jsonb_build_object('err', 'Your card was declined (test card 4000 0000 0000 0002). No place was booked and you have not been charged.');
    end if;
  end if;
  insert into event_bookings (user_id, event_id, payment_id, amount) values (uid, e.id, pay.id, price);
  perform notify(uid, format('Event booked: %s, %s.', e.name, fmt_d(e.date)));
  return jsonb_build_object('ok', true);
end $$;

create function public.request_service(p_service text, p_date date, p_slot text, p_msg text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := active_uid(); sv services;
begin
  if uid is null then return jsonb_build_object('err', 'Please sign in to send a request.'); end if;
  select * into sv from services where id = p_service;
  if not found then return jsonb_build_object('err', 'Service not found.'); end if;
  if p_date is null or p_date <= (now() at time zone 'Europe/London')::date or p_slot not in ('Morning', 'Afternoon', 'Evening') then
    return jsonb_build_object('err', 'Please choose a preferred date and time of day.');
  end if;
  insert into requests (user_id, service, date, slot, msg) values (uid, sv.id, p_date, p_slot, left(trim(coalesce(p_msg, '')), 1000));
  perform notify(uid, format('Request received for %s. This isn’t confirmed yet — %s will be in touch.', sv.name, sv.practitioner));
  return jsonb_build_object('ok', true);
end $$;

create function public.enquire_event(p_event text, p_msg text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := active_uid(); e events;
begin
  if uid is null then return jsonb_build_object('err', 'Please sign in to send an enquiry.'); end if;
  select * into e from events where id = p_event and published;
  if not found then return jsonb_build_object('err', 'This event isn’t available.'); end if;
  if trim(coalesce(p_msg, '')) = '' then return jsonb_build_object('err', 'Please add a short message.'); end if;
  insert into requests (user_id, service, enquiry, date, slot, msg)
  values (uid, 'enquiry', e.name, (now() at time zone 'Europe/London')::date, 'Enquiry', left(trim(p_msg), 1000));
  perform notify(uid, 'Thanks — your ' || e.name || ' enquiry has been sent.');
  return jsonb_build_object('ok', true);
end $$;

create function public.update_my_prefs(p_reminders boolean, p_marketing boolean) returns void
language sql security definer set search_path = public as $$
  update profiles set reminders = p_reminders, marketing = p_marketing where id = auth.uid();
$$;

create function public.mark_notifications_read() returns void
language sql security definer set search_path = public as $$
  update notifications set read = true where user_id = auth.uid() and not read;
$$;

create function public.request_account_deletion() returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return; end if;
  insert into delete_requests (user_id) values (auth.uid()) on conflict do nothing;
  perform audit_log(auth.uid(), 'Account deletion requested');
end $$;

-- Called by the owner app when a non-staff account tries to sign in there.
create function public.log_blocked_staff_access() returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not is_staff(auth.uid()) then
    perform audit_log(auth.uid(), 'Blocked attempt to access studio management');
  end if;
end $$;

-- ---------------------------------------------------------------- staff actions
create function public.cancel_session(p_session uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := require_staff(); s sessions; c classes; b bookings;
begin
  select * into s from sessions where id = p_session for update;
  if not found or s.status = 'cancelled' then return jsonb_build_object('err', 'This session is already cancelled.'); end if;
  select * into c from classes where id = s.cls;
  for b in select * from bookings where session_id = p_session and status in ('confirmed', 'waitlisted', 'offered') for update loop
    if b.pass_id is not null and b.status = 'confirmed' then
      insert into ledger (pass_id, delta, reason, booking_id, by) values (b.pass_id, 1, 'Credit returned — class cancelled by studio', b.id, uid);
    end if;
    if b.payment_id is not null then
      update payments set status = 'refunded', refunded_at = now() where id = b.payment_id and status = 'succeeded';
    end if;
    update bookings set status = 'cancelled', cancelled_at = now() where id = b.id;
    perform notify(b.user_id, format('Class cancelled: %s on %s has been cancelled by the studio. Any credit or payment has been returned.', c.name, fmt_d(s.date)));
  end loop;
  update sessions set status = 'cancelled' where id = p_session;
  perform audit_log(uid, format('Cancelled session %s %s %s', c.name, fmt_d(s.date), fmt_t(s.start_time)));
  return jsonb_build_object('ok', true);
end $$;

create function public.set_attendance(p_booking uuid, p_status text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := require_staff(); b bookings; s sessions; cu profiles;
begin
  if p_status not in ('attended', 'noshow') then return jsonb_build_object('err', 'Unknown status.'); end if;
  select * into b from bookings where id = p_booking for update;
  if not found or b.status not in ('confirmed', 'attended', 'noshow') then
    return jsonb_build_object('err', 'Only confirmed bookings can be marked.');
  end if;
  update bookings set status = p_status where id = b.id;
  select * into s from sessions where id = b.session_id;
  select * into cu from profiles where id = b.user_id;
  perform audit_log(uid, format('Marked %s %s — %s %s', cu.first, case when p_status = 'noshow' then 'no-show' else p_status end,
    (select name from classes where id = s.cls), fmt_d(s.date)));
  return jsonb_build_object('ok', true);
end $$;

create function public.set_capacity(p_session uuid, p_cap int) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := require_staff(); s sessions; n int;
begin
  select * into s from sessions where id = p_session for update;
  n := taken(p_session);
  if p_cap < greatest(n, 1) then
    return jsonb_build_object('err', format('%s people are booked — capacity can’t go lower.', n));
  end if;
  update sessions set cap = p_cap where id = p_session;
  perform audit_log(uid, format('Capacity for %s %s set to %s', (select name from classes where id = s.cls), fmt_d(s.date), p_cap));
  perform promote(p_session);
  return jsonb_build_object('ok', true);
end $$;

create function public.set_session_instructor(p_session uuid, p_ins text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := require_staff(); s sessions; n text; cname text; b bookings;
begin
  select * into s from sessions where id = p_session for update;
  select name into n from instructors where id = p_ins;
  if n is null then return jsonb_build_object('err', 'Instructor not found.'); end if;
  update sessions set ins = p_ins where id = p_session;
  cname := (select name from classes where id = s.cls);
  for b in select * from bookings where session_id = p_session and status = 'confirmed' loop
    perform notify(b.user_id, format('Instructor change: %s on %s will now be led by %s.', cname, fmt_d(s.date), n));
  end loop;
  perform audit_log(uid, format('Instructor for %s %s changed to %s', cname, fmt_d(s.date), n));
  return jsonb_build_object('ok', true);
end $$;

create function public.set_session_waitlist(p_session uuid, p_open boolean) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := require_staff(); s sessions;
begin
  update sessions set waitlist = p_open where id = p_session returning * into s;
  perform audit_log(uid, format('Waitlist %s for %s %s', case when p_open then 'enabled' else 'disabled' end,
    (select name from classes where id = s.cls), fmt_d(s.date)));
  return jsonb_build_object('ok', true);
end $$;

create function public.manual_book(p_session uuid, p_user uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := require_staff(); s sessions; c classes; cu profiles;
begin
  select * into s from sessions where id = p_session for update;
  if not found or s.status = 'cancelled' then return jsonb_build_object('err', 'This session has been cancelled.'); end if;
  select * into cu from profiles where id = p_user and active;
  if not found then return jsonb_build_object('err', 'Customer not found.'); end if;
  if exists (select 1 from bookings where user_id = p_user and session_id = p_session
             and status in ('confirmed', 'waitlisted', 'offered', 'attended', 'noshow')) then
    return jsonb_build_object('err', 'Already booked or waitlisted.');
  end if;
  if taken(p_session) >= s.cap then return jsonb_build_object('err', 'This session is full — increase capacity first.'); end if;
  select * into c from classes where id = s.cls;
  insert into bookings (user_id, session_id, status, method) values (p_user, p_session, 'confirmed', 'manual');
  perform notify(p_user, format('The studio has booked you onto %s, %s at %s.', c.name, fmt_d(s.date), fmt_t(s.start_time)));
  perform audit_log(uid, format('Manual booking: %s %s onto %s %s', cu.first, cu.last, c.name, fmt_d(s.date)));
  return jsonb_build_object('ok', true);
end $$;

create function public.zoom_link(p_seed text) returns text language sql immutable as $$
  select 'https://zoom.us/j/' || lpad((abs(hashtext(p_seed)) % 10000000000)::text, 10, '7');
$$;

create function public.create_sessions(p_cls text, p_date date, p_start time, p_cap int, p_repeat int) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := require_staff(); c classes; d date; sid uuid; n int := 0;
begin
  select * into c from classes where id = p_cls;
  if not found then return jsonb_build_object('err', 'Class not found.'); end if;
  if p_cap is null or p_cap < 1 or p_start is null then return jsonb_build_object('err', 'Please add a start time and capacity.'); end if;
  if p_repeat not between 1 and 52 then return jsonb_build_object('err', 'Repeat must be between 1 and 52 weeks.'); end if;
  for w in 0 .. p_repeat - 1 loop
    d := p_date + w * 7;
    insert into sessions (cls, date, start_time, dur, cap, ins, format)
    values (c.id, d, p_start, c.dur, p_cap, c.ins, c.format) returning id into sid;
    if c.format <> 'In studio' then insert into session_links values (sid, zoom_link(d::text || p_start::text || sid::text)); end if;
    n := n + 1;
  end loop;
  perform audit_log(uid, format('Created %s session%s of %s from %s at %s', n, case when n > 1 then 's' else '' end, c.name, fmt_d(p_date), fmt_t(p_start)));
  return jsonb_build_object('ok', true, 'count', n);
end $$;

create function public.adjust_credits(p_pass uuid, p_delta int, p_reason text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := require_staff(); pp passes; pname text; cu profiles;
begin
  if trim(coalesce(p_reason, '')) = '' then return jsonb_build_object('err', 'Please give a reason — it’s kept in the audit log.'); end if;
  if coalesce(p_delta, 0) = 0 then return jsonb_build_object('err', 'Choose how many credits to add or remove.'); end if;
  select * into pp from passes where id = p_pass for update;
  if not found then return jsonb_build_object('err', 'Pass not found.'); end if;
  if pass_balance(pp.id) + p_delta < 0 then return jsonb_build_object('err', 'Balance can’t go below zero.'); end if;
  insert into ledger (pass_id, delta, reason, by) values (pp.id, p_delta, 'Manual adjustment: ' || trim(p_reason), uid);
  select name into pname from products where id = pp.product;
  select * into cu from profiles where id = pp.user_id;
  perform notify(pp.user_id, format('Your %s was adjusted by %s%s credit%s.', pname, case when p_delta > 0 then '+' else '' end, p_delta,
    case when abs(p_delta) > 1 then 's' else '' end));
  perform audit_log(uid, format('Credits %s%s on %s’s %s — “%s”', case when p_delta > 0 then '+' else '' end, p_delta, cu.first, pname, trim(p_reason)));
  return jsonb_build_object('ok', true);
end $$;

create function public.grant_comp_credit(p_user uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := require_staff(); cu profiles; pr products; pp passes;
begin
  select * into cu from profiles where id = p_user;
  if not found then return jsonb_build_object('err', 'Customer not found.'); end if;
  select * into pr from products where id = 'p5';
  insert into passes (user_id, product, expires, total, comp)
  values (p_user, pr.id, now() + make_interval(weeks => pr.weeks), 1, true) returning * into pp;
  insert into ledger (pass_id, delta, reason, by) values (pp.id, 1, 'Complimentary credit from studio', uid);
  perform notify(p_user, 'The studio has added a complimentary class credit to your account.');
  perform audit_log(uid, format('Granted 1 complimentary credit to %s %s', cu.first, cu.last));
  return jsonb_build_object('ok', true);
end $$;

create function public.save_customer_note(p_user uuid, p_notes text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := require_staff(); cu profiles;
begin
  select * into cu from profiles where id = p_user;
  if not found then return jsonb_build_object('err', 'Customer not found.'); end if;
  insert into customer_notes (user_id, notes) values (p_user, coalesce(p_notes, ''))
  on conflict (user_id) do update set notes = excluded.notes, updated_at = now();
  perform audit_log(uid, format('Updated internal notes for %s %s', cu.first, cu.last));
  return jsonb_build_object('ok', true);
end $$;

create function public.set_customer_active(p_user uuid, p_active boolean) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := require_staff(); cu profiles;
begin
  select * into cu from profiles where id = p_user;
  if not found or cu.role <> 'customer' then return jsonb_build_object('err', 'Only customer accounts can be changed here.'); end if;
  update profiles set active = p_active where id = p_user;
  perform audit_log(uid, format('%s account %s', case when p_active then 'Reactivated' else 'Deactivated' end, cu.email));
  return jsonb_build_object('ok', true);
end $$;

create function public.set_request_status(p_request uuid, p_status text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := require_staff(); r requests; sname text; cu profiles; msg text;
begin
  if p_status not in ('accepted', 'declined', 'completed') then return jsonb_build_object('err', 'Unknown status.'); end if;
  update requests set status = p_status where id = p_request returning * into r;
  if not found then return jsonb_build_object('err', 'Request not found.'); end if;
  sname := coalesce(r.enquiry, (select name from services where id = r.service), r.service);
  msg := case p_status
    when 'accepted' then format('Your %s appointment for %s (%s) is confirmed.', sname, fmt_d(r.date), lower(r.slot))
    when 'declined' then format('We can’t offer your requested %s time — please get in touch to find another.', sname)
    else format('Thanks for visiting for %s.', sname) end;
  perform notify(r.user_id, msg);
  select * into cu from profiles where id = r.user_id;
  perform audit_log(uid, format('Appointment request %s: %s — %s', p_status, cu.first, sname));
  return jsonb_build_object('ok', true);
end $$;

create function public.refund_payment(p_payment uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := require_staff(); p payments;
begin
  update payments set status = 'refunded', refunded_at = now() where id = p_payment and status = 'succeeded' returning * into p;
  if not found then return jsonb_build_object('err', 'Only successful payments can be refunded.'); end if;
  perform notify(p.user_id, format('Refund issued: %s for %s (test mode).', gbp(p.amount), p.label));
  perform audit_log(uid, format('Refunded %s — %s (%s)', gbp(p.amount), p.label, p.ref));
  return jsonb_build_object('ok', true);
end $$;

create function public.set_event_published(p_event text, p_published boolean) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := require_staff(); e events;
begin
  update events set published = p_published where id = p_event returning * into e;
  perform audit_log(uid, format('%s event %s', case when p_published then 'Published' else 'Unpublished' end, e.name));
  return jsonb_build_object('ok', true);
end $$;

create function public.set_product_on_sale(p_product text, p_on_sale boolean) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := require_staff(); p products;
begin
  update products set on_sale = p_on_sale where id = p_product returning * into p;
  perform audit_log(uid, format('%s %s', p.name, case when p_on_sale then 'put on sale' else 'withdrawn from sale' end));
  return jsonb_build_object('ok', true);
end $$;

create function public.set_product_price(p_product text, p_price int) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := require_staff(); p products; old_price int;
begin
  if p_price is null or p_price < 0 then return jsonb_build_object('err', 'Enter a valid price.'); end if;
  select price into old_price from products where id = p_product for update;
  update products set price = p_price where id = p_product returning * into p;
  perform audit_log(uid, format('%s price changed %s %s %s (past purchases unchanged)', p.name, gbp(old_price), chr(8594), gbp(p_price)));
  return jsonb_build_object('ok', true);
end $$;

create function public.set_instructor_active(p_ins text, p_active boolean) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := require_staff(); i instructors;
begin
  update instructors set active = p_active where id = p_ins returning * into i;
  perform audit_log(uid, format('%s instructor %s', case when p_active then 'Reactivated' else 'Deactivated' end, i.name));
  return jsonb_build_object('ok', true);
end $$;

create function public.set_settings(p_cancel_hours int, p_offer_hours int, p_reminders boolean) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := require_staff(); prev public.settings;
begin
  select * into prev from public.settings limit 1;
  if p_cancel_hours < 0 or p_cancel_hours > 72 or p_offer_hours < 1 or p_offer_hours > 24 then
    return jsonb_build_object('err', 'That value is out of range.');
  end if;
  update public.settings set cancel_hours = p_cancel_hours, offer_hours = p_offer_hours, reminders = p_reminders where id;
  if prev.cancel_hours <> p_cancel_hours then perform audit_log(uid, format('Cancellation notice set to %s hours', p_cancel_hours)); end if;
  if prev.offer_hours <> p_offer_hours then perform audit_log(uid, format('Waitlist claim window set to %s hours', p_offer_hours)); end if;
  if prev.reminders <> p_reminders then
    perform audit_log(uid, format('Class reminders %s', case when p_reminders then 'enabled' else 'disabled' end));
  end if;
  return jsonb_build_object('ok', true);
end $$;

create function public.log_export(p_days int) returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid := require_staff();
begin
  perform audit_log(uid, format('Exported bookings CSV (last %s days)', p_days));
end $$;

-- ---------------------------------------------------------------- permissions
-- Internals are callable only from other functions.
revoke execute on function public.notify(uuid, text), public.audit_log(uuid, text), public.promote(uuid),
  public.test_payment(uuid, int, text, text, text, text), public.require_staff(), public.active_uid(),
  public.taken(uuid), public.pass_balance(uuid), public.pass_covers(text, text)
  from public, anon, authenticated;

-- Customer actions need a signed-in user.
revoke execute on function public.book_class(uuid, text, uuid, text), public.join_waitlist(uuid), public.cancel_booking(uuid, boolean),
  public.buy_pass(text, text), public.book_event(text, text), public.request_service(text, date, text, text), public.enquire_event(text, text),
  public.update_my_prefs(boolean, boolean), public.mark_notifications_read(), public.request_account_deletion(),
  public.log_blocked_staff_access(), public.my_waitlist_positions(),
  public.cancel_session(uuid), public.set_attendance(uuid, text), public.set_capacity(uuid, int), public.set_session_instructor(uuid, text),
  public.set_session_waitlist(uuid, boolean), public.manual_book(uuid, uuid), public.create_sessions(text, date, time, int, int),
  public.adjust_credits(uuid, int, text), public.grant_comp_credit(uuid), public.save_customer_note(uuid, text),
  public.set_customer_active(uuid, boolean), public.set_request_status(uuid, text), public.refund_payment(uuid),
  public.set_event_published(text, boolean), public.set_product_on_sale(text, boolean), public.set_product_price(text, int),
  public.set_instructor_active(text, boolean), public.set_settings(int, int, boolean), public.log_export(int)
  from public, anon;
