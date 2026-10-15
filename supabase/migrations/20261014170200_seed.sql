-- Sonshine Hollistic — reference content and demonstration data.
-- Team and service copy comes from sonshinehollistic.co.uk; ALL prices, capacities, dates and schedules
-- (apart from the published sound healing / reiki prices) are DEMONSTRATION values pending studio confirmation.

create function public.seed_reference() returns void
language plpgsql security definer set search_path = public as $$
declare u text := 'https://images.unsplash.com/'; q text := '?auto=format&fit=crop&w=900&q=75';
begin
  insert into instructors (id, name, role, ini, bio, sort) values
    ('son', 'Son', 'Co-Founder & Yoga Instructor', 'SA', 'Passionate about bringing yoga to everyone, Son specialises in accessible and inclusive yoga practices.', 1),
    ('ruth', 'Ruth', 'Co-Founder & Yoga Instructor', 'RH', 'Ruth brings years of experience and a nurturing approach to every class she teaches.', 2),
    ('jacqui', 'Jacqui', 'Yoga Instructor', 'J', 'Jacqui specialises in pregnancy yoga, providing safe and nurturing classes for expectant mothers throughout their journey.', 3),
    ('magda', 'Magda', 'Yoga Instructor', 'M', 'Magda focuses on Pilates, helping students build core strength, improve posture, and enhance overall body awareness.', 4),
    ('katie', 'Katie', 'Yoga Instructor', 'K', 'Katie runs Chair Yoga Workshops specifically designed for those dealing with chronic pain and stiffness, making yoga accessible to everyone.', 5),
    ('mel', 'Mel', 'Yoga Instructor', 'M', 'Mel focuses on Core Strength yoga, combining traditional poses with targeted exercises to build a strong and stable foundation.', 6),
    ('kelly', 'Kelly', 'Yoga Instructor', 'K', 'Kelly teaches Kundalini yoga, guiding students through transformative practices that awaken inner energy and consciousness.', 7),
    ('morven', 'Morven', 'Yoga Instructor', 'M', 'Morven is a newly qualified teacher who is passionate about helping students build core strength while having fun and moving to the beat.', 8),
    ('caroline', 'Caroline', 'Yoga Instructor', 'C', 'Caroline is a newly qualified teacher who leads soulful flow classes designed to help you feel nurtured and energised on your yoga journey.', 9),
    ('lyndsay', 'Lyndsay', 'Yoga Instructor', 'L', 'Lyndsay is an experienced hatha and vinyasa flow yoga teacher, passionate about yoga being available to everyone.', 10)
  on conflict (id) do update set name = excluded.name, role = excluded.role, ini = excluded.ini, bio = excluded.bio, sort = excluded.sort, active = true;

  insert into classes (id, name, cat, ins, dur, level, price, pass, format, img, descr, access) values
    ('gentle', 'Gentle Yoga', 'Gentle', 'ruth', 60, 'Beginner friendly', 900, true, 'In studio', 'assets/studio-mats.png', 'Slow, mindful movement and longer holds to ease stiffness and quieten a busy mind. A lovely place to start if you are new to yoga.', 'Blocks and bolsters provided. Options are offered for every posture.'),
    ('vin', 'Vinyasa Flow', 'Vinyasa & Flow', 'lyndsay', 60, 'All levels', 900, true, 'Hybrid', 'assets/hero-classes.jpg', 'Breath-led flowing sequences that build heat, strength and focus, finishing with a long relaxation.', ''),
    ('pil', 'Pilates', 'Pilates', 'magda', 60, 'All levels', 900, true, 'In studio', 'assets/studio-mats.png', 'Mat Pilates to build core strength, improve posture and enhance overall body awareness.', ''),
    ('chair', 'Chair Yoga', 'Chair Yoga', 'katie', 60, 'Beginner friendly', 900, true, 'In studio', 'assets/studio-buddha.png', 'Yoga supported by a chair, designed for those dealing with chronic pain and stiffness — making yoga accessible to everyone.', 'Seated and standing options; no need to get down onto the floor.'),
    ('core', 'Core Strength Yoga', 'Core Strength', 'mel', 60, 'Some experience helpful', 900, true, 'In studio', 'assets/hero-classes.jpg', 'Traditional poses combined with targeted exercises to build a strong and stable foundation.', ''),
    ('kund', 'Kundalini Yoga', 'Kundalini', 'kelly', 60, 'All levels', 900, true, 'In studio', u || 'photo-1447452001602-7090c7ab2db3' || q, 'Breath, movement, mantra and meditation in transformative practices that awaken inner energy and consciousness.', ''),
    ('hatha', 'Hatha Yoga', 'Hatha', 'son', 60, 'All levels', 900, true, 'In studio', 'assets/hero-home.jpg', 'Classic postures held with attention to alignment and breath. Calm, grounding and suitable for everyone.', ''),
    ('live', 'Live-Stream Hatha', 'Hatha', 'son', 60, 'All levels', 900, true, 'Online', 'assets/studio-mats.png', 'Join Son from your own living room. Your joining link appears in your booking once it is confirmed.', 'You will need a mat and a little floor space.'),
    ('preg', 'Pregnancy Yoga', 'Pregnancy', 'jacqui', 60, 'All stages', 1000, false, 'In studio', 'assets/studio-buddha.png', 'Safe and nurturing classes for expectant mothers throughout their pregnancy journey.', ''),
    ('shred', 'Yoga Shred', 'Yoga Shred', 'morven', 60, 'Some experience helpful', 900, true, 'In studio', 'assets/hero-classes.jpg', 'A high-energy, music-led class mixing yoga with strength work. Fun, sweaty and moving to the beat.', ''),
    ('soul', 'Soulful Flow', 'Vinyasa & Flow', 'caroline', 60, 'All levels', 900, true, 'In studio', 'assets/hero-home.jpg', 'A soulful, gently paced flow designed to help you feel nurtured and energised.', ''),
    ('sleepy', 'Sleepy Yoga & Sound Bath', 'Sleepy Yoga', 'ruth', 75, 'All levels', 900, true, 'In studio', u || 'photo-1593810451410-8fbb422cc15e' || q, 'Slow, restorative yoga to wind down your weekend, finishing with a mini sound bath for deep relaxation.', ''),
    ('kids', 'Kids Yoga (5–8)', 'Kids & Teens', 'son', 45, 'Ages 5–8', 600, false, 'In studio', 'assets/kids-bigger.png', 'Playful yoga with stories, games and breathing to help little ones build confidence, focus and calm.', ''),
    ('teen', 'Teen Yoga', 'Kids & Teens', 'son', 60, 'Ages 12–16', 600, false, 'In studio', 'assets/kids-teen.png', 'Strength, flexibility and simple tools for managing stress, in a relaxed and supportive group.', '')
  on conflict (id) do update set name = excluded.name, cat = excluded.cat, ins = excluded.ins, dur = excluded.dur, level = excluded.level,
    price = excluded.price, pass = excluded.pass, format = excluded.format, img = excluded.img, descr = excluded.descr, access = excluded.access;

  insert into products (id, name, descr, price, credits, weeks, scope, on_sale, sort) values
    ('p5', '5 Class Pass', 'Five classes to use across our adult timetable.', 4000, 5, 8, 'adult', true, 1),
    ('p10', '10 Class Pass', 'Best value for a regular practice.', 7500, 10, 12, 'adult', true, 2),
    ('pkids', 'Kids Term Pass', 'Six kids or teen classes for your little yogi.', 3000, 6, 10, 'kids', true, 3)
  on conflict (id) do update set name = excluded.name, descr = excluded.descr, price = excluded.price, credits = excluded.credits,
    weeks = excluded.weeks, scope = excluded.scope, on_sale = true, sort = excluded.sort;

  insert into services (id, name, practitioner, img, duration, price_label, location, descr, prep, caution, sort) values
    ('s121', 'Mind·Body·Soul 121', 'Ruth', u || 'photo-1593810451410-8fbb422cc15e' || q, '60 or 90 minutes', '£60 for 60 minutes · £80 for 90 minutes', 'Barden House, Livingston',
     'A one-to-one session with Ruth including meditation, breathwork, yoga and a sound bath, with the option of a short reiki treatment during your relaxation. All personalised to your individual needs — perfect when your body, mind and soul need a little nourishment, or as a gift for someone else.',
     'Ruth will reach out beforehand so you can explain what you would like to get from the session.',
     'Sound healing might not be suitable if you are in the early stages of pregnancy. Anyone with serious mental health issues, sound-induced epilepsy or a pacemaker should consult a doctor before attending.', 1),
    ('sreiki', 'Reiki Treatment', 'Ruth & Sonja', u || 'photo-1599659593072-10de2e109486' || q, '60 minutes', '£40 per session', 'The Snug, Livingston — details sent when you book',
     'Reiki is a system of natural healing developed in Japan at the end of the 19th century by Mikao Usui. A gentle, relaxing hands-on treatment where healing vibrations are channelled through the practitioner’s hands — suitable for people of all ages.',
     'The Snug is at Sonja’s home; we will send the details once your appointment is confirmed.', '', 2),
    ('sprivate', 'Private One-to-One Yoga', 'Son', 'assets/studio-buddha.png', 'To suit you', 'Price on request', 'Barden House or online',
     'A personalised session built around your body, goals and experience — ideal if you are new to yoga or want to deepen your practice.',
     'Tell us a little about what you are looking for and Son will be in touch.', '', 3)
  on conflict (id) do update set name = excluded.name, practitioner = excluded.practitioner, img = excluded.img, duration = excluded.duration,
    price_label = excluded.price_label, location = excluded.location, descr = excluded.descr, prep = excluded.prep, caution = excluded.caution, sort = excluded.sort;

  update settings set cancel_hours = 6, offer_hours = 2, reminders = true where id;
end $$;

-- Creates (or reuses) a confirmed email/password login for a demo person.
create function public.ensure_demo_user(p_email text, p_first text, p_last text, p_role user_role, p_joined timestamptz)
returns uuid
language plpgsql security definer set search_path = public, extensions as $$
declare uid uuid;
begin
  select id into uid from auth.users where email = p_email;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current,
      phone_change, phone_change_token, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', p_email,
      crypt('demo1234', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', jsonb_build_object('first', p_first, 'last', p_last), p_joined, now(),
      '', '', '', '', '', '', '', '');
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, uid::text,
      jsonb_build_object('sub', uid::text, 'email', p_email, 'email_verified', true), 'email', now(), p_joined, now());
  end if;
  insert into profiles (id, email, first, last) values (uid, p_email, p_first, p_last) on conflict (id) do nothing;
  update profiles set first = p_first, last = p_last, role = p_role, active = true, demo = true, joined = p_joined,
    reminders = true, marketing = false
  where id = uid;
  return uid;
end $$;

-- Demo data is rebuilt in pieces (the Supabase SQL endpoint rejects some very large statements).
create function public.wipe_demo_data() returns void
language plpgsql security definer set search_path = public as $$
begin
  truncate table ledger, bookings, event_bookings, passes, payments, requests, notifications,
    delete_requests, customer_notes, session_links, sessions, events;
end $$;

-- Events plus the standard week, from three weeks ago to two weeks ahead.
create function public.seed_demo_timetable(today date) returns void
language plpgsql security definer set search_path = public as $$
declare d date;
begin
  insert into events (id, name, sub, img, date, start_time, finish_time, host, venue, price, early, early_until, cap, deadline, published, kind, descr, info) values
    ('e-bath', 'Full Moon Sound Bath', null, 'https://images.unsplash.com/photo-1593810451410-8fbb422cc15e?auto=format&fit=crop&w=900&q=75',
     today + 9, '19:30', '21:00', 'Ruth', 'Barden House, Livingston', 2000, 1500, today + 3, 20, today + 8, true, 'book',
     'An evening of deep relaxation as crystal and Tibetan singing bowls, gongs and chimes wash over you.', 'Mats, bolsters and blankets provided. Arrive 10 minutes early to settle in.'),
    ('e-morning', 'Yoga & Sound Healing Morning', null, 'assets/studio-mats.png',
     today + 16, '10:00', '12:30', 'Son & Ruth', 'Barden House, Livingston', 3500, null, null, 16, today + 15, true, 'book',
     'A gentle flow with Son followed by a restorative sound bath with Ruth.', ''),
    ('e-ytt', 'EMPOWER Core Strength Vinyasa & Sacred Cycles', '230 Hour Foundation Teacher Training',
     'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=75',
     null, null, null, 'Anya Hawkes, Core Revolution Yoga', 'Barden House + Zoom', null, null, null, null, null, true, 'enquire',
     'A revolutionary teacher training combining the science of Biomechanics with the ancient wisdom of Yoga and Sacred Cycles — a blend of Zoom sessions and in-studio weekends, culminating in a studio graduation.', 'Dates and pricing on enquiry.');

  for off in -21 .. 13 loop
    d := today + off;
    insert into sessions (cls, date, start_time, dur, cap, ins, format)
    select w.c, d, w.t::time, cl.dur, w.cap, cl.ins, cl.format
    from (values (1,'09:30','gentle',14),(1,'18:00','vin',14),(1,'19:15','pil',14),
                 (2,'10:00','chair',14),(2,'18:30','core',14),(2,'19:45','kund',14),
                 (3,'09:30','hatha',14),(3,'16:45','kids',12),(3,'18:00','preg',8),(3,'19:15','shred',14),
                 (4,'10:00','pil',14),(4,'18:00','soul',14),(4,'19:30','live',30),
                 (5,'09:30','vin',14),(5,'18:00','gentle',14),
                 (6,'09:00','hatha',14),(6,'10:30','teen',12),
                 (0,'10:00','core',14),(0,'19:00','sleepy',14)) as w(dow, t, c, cap)
    join classes cl on cl.id = w.c
    where w.dow = extract(dow from d)::int;
  end loop;
  insert into session_links select id, zoom_link(date::text || start_time::text) from sessions where format <> 'In studio';
end $$;

-- Other customers' bookings, deterministic per session so the demo looks the same each time.
create function public.seed_demo_crowd(oth uuid[], preg_next uuid) returns void
language plpgsql security definer set search_path = public as $$
declare s sessions; c classes; st timestamptz; n int; h bigint; u uuid; made timestamptz; pay payments; bid uuid; is_past boolean;
begin
  for s in select * from sessions order by date, start_time loop
    select * into c from classes where id = s.cls;
    st := session_start(s.date, s.start_time);
    is_past := st < now();
    h := abs(hashtext(s.id::text));
    n := case when s.id = preg_next then s.cap else (h % (s.cap - 3))::int end;
    for k in 0 .. least(n, array_length(oth, 1)) - 1 loop
      u := oth[((h + k) % array_length(oth, 1))::int + 1];
      made := least(st - (2 + k % 3) * interval '1 day', now() - interval '1 hour');
      insert into payments (user_id, ref, amount, kind, label, at, status)
      values (u, 'pi_test_' || upper(substr(md5(s.id::text || k::text), 1, 14)), c.price, 'Class', c.name || ' · ' || fmt_d(s.date), made, 'succeeded')
      returning * into pay;
      insert into bookings (user_id, session_id, status, method, payment_id, amount, created)
      values (u, s.id,
        case when not is_past then 'confirmed' when abs(hashtext(s.id::text || k::text)) % 9 = 0 then 'noshow' else 'attended' end,
        'card', pay.id, c.price, made)
      returning id into bid;
      update payments set booking_id = bid where id = pay.id;
      if not is_past and abs(hashtext(s.id::text || 'x' || k::text)) % 11 = 0 then
        update bookings set status = 'cancelled', cancelled_at = now() - interval '1 day' where id = bid;
        update payments set status = 'refunded', refunded_at = now() - interval '1 day' where id = pay.id;
      end if;
    end loop;
  end loop;
end $$;

-- Emma: a part-used 5 Class Pass, an expired one, and a mix of bookings.
create function public.seed_demo_emma(emma uuid, preg_next uuid) returns void
language plpgsql security definer set search_path = public as $$
declare pay payments; bid uuid; v_pass uuid; old_id uuid; tgt sessions; one_day interval := interval '1 day';
begin
  insert into payments (user_id, ref, amount, kind, label, at, status, product_id)
  values (emma, 'pi_test_' || upper(substr(md5('emma-pass'), 1, 14)), 4000, 'Pass', '5 Class Pass', now() - 10 * one_day, 'succeeded', 'p5') returning * into pay;
  insert into passes (user_id, product, purchased, expires, total, payment_id)
  values (emma, 'p5', now() - 10 * one_day, now() + 46 * one_day, 5, pay.id) returning id into v_pass;
  insert into passes (user_id, product, purchased, expires, total)
  values (emma, 'p5', now() - 120 * one_day, now() - 64 * one_day, 5) returning id into old_id;
  insert into ledger (pass_id, delta, reason, at) values (old_id, 5, 'Purchased 5 Class Pass', now() - 120 * one_day);
  for k in 1 .. 5 loop
    insert into ledger (pass_id, delta, reason, at) values (old_id, -1, 'Class booked', now() - 120 * one_day + k * 7 * one_day);
  end loop;
  insert into ledger (pass_id, delta, reason, at) values (v_pass, 5, 'Purchased 5 Class Pass', now() - 10 * one_day);

  select * into tgt from sessions where cls = 'vin' and session_start(date, start_time) < now() order by date desc, start_time desc limit 1;
  if found then
    insert into bookings (user_id, session_id, status, method, pass_id, created)
    values (emma, tgt.id, 'attended', 'pass', v_pass, session_start(tgt.date, tgt.start_time) - 2 * one_day) returning id into bid;
    insert into ledger (pass_id, delta, reason, booking_id, at)
    values (v_pass, -1, 'Vinyasa Flow · ' || fmt_d(tgt.date), bid, session_start(tgt.date, tgt.start_time) - 2 * one_day);
  end if;

  select * into tgt from sessions where cls in ('soul', 'pil', 'gentle', 'vin', 'hatha')
    and session_start(date, start_time) > now() + interval '20 hours' order by date, start_time limit 1;
  if found then
    insert into bookings (user_id, session_id, status, method, pass_id, created)
    values (emma, tgt.id, 'confirmed', 'pass', v_pass, now() - 3 * one_day) returning id into bid;
    insert into ledger (pass_id, delta, reason, booking_id, at)
    values (v_pass, -1, (select name from classes where id = tgt.cls) || ' · ' || fmt_d(tgt.date), bid, now() - 3 * one_day);
  end if;

  select * into tgt from sessions where cls = 'sleepy' and session_start(date, start_time) > now() order by date limit 1;
  if found then
    insert into payments (user_id, ref, amount, kind, label, at, status)
    values (emma, 'pi_test_' || upper(substr(md5('emma-sleepy'), 1, 14)), 900, 'Class', 'Sleepy Yoga & Sound Bath · ' || fmt_d(tgt.date), now() - 2 * one_day, 'succeeded')
    returning * into pay;
    insert into bookings (user_id, session_id, status, method, payment_id, amount, created)
    values (emma, tgt.id, 'confirmed', 'card', pay.id, 900, now() - 2 * one_day) returning id into bid;
    update payments set booking_id = bid where id = pay.id;
  end if;

  select * into tgt from sessions where cls = 'hatha' and session_start(date, start_time) < now() order by date desc limit 1;
  if found then
    insert into payments (user_id, ref, amount, kind, label, at, status, refunded_at)
    values (emma, 'pi_test_' || upper(substr(md5('emma-hatha'), 1, 14)), 900, 'Class', 'Hatha Yoga · ' || fmt_d(tgt.date), now() - 12 * one_day, 'refunded', now() - 11 * one_day)
    returning * into pay;
    insert into bookings (user_id, session_id, status, method, payment_id, amount, created, cancelled_at)
    values (emma, tgt.id, 'cancelled', 'card', pay.id, 900, now() - 12 * one_day, now() - 11 * one_day) returning id into bid;
    update payments set booking_id = bid where id = pay.id;
  end if;

  if preg_next is not null then
    insert into bookings (user_id, session_id, status, created) values (emma, preg_next, 'waitlisted', now() - one_day);
  end if;
end $$;

-- Wipes bookings, passes, payments, requests and notifications, then rebuilds a realistic
-- three-weeks-back / two-weeks-ahead timetable around today. Audit history is kept.
create function public.seed_demo() returns void
language plpgsql security definer set search_path = public as $$
declare
  today date := (now() at time zone 'Europe/London')::date;
  one_day interval := interval '1 day';
  emma uuid; oth uuid[] := array[]::uuid[]; preg_next uuid; pay payments;
  names text[][] := array[
    ['Fiona','MacLeod','2'],['Gemma','Reid','5'],['Karen','Stewart','12'],['Lewis','Grant','20'],['Aileen','Murray','35'],
    ['Hannah','Baird','60'],['Ross','Duncan','90'],['Claire','Paterson','120'],['Megan','Hughes','150']];
begin
  perform seed_reference();
  perform wipe_demo_data();

  emma := ensure_demo_user('emma@demo.test', 'Emma', 'Wallace', 'customer', now() - 40 * one_day);
  perform ensure_demo_user('son@demo.test', 'Son', 'Anderson', 'owner', now() - 400 * one_day);
  perform ensure_demo_user('ruth@demo.test', 'Ruth', 'Hollis', 'admin', now() - 400 * one_day);
  for i in 1 .. array_length(names, 1) loop
    oth := oth || ensure_demo_user(lower(names[i][1]) || '@demo.test', names[i][1], names[i][2], 'customer', now() - names[i][3]::int * one_day);
  end loop;

  perform seed_demo_timetable(today);
  select id into preg_next from sessions where cls = 'preg' and session_start(date, start_time) > now() order by date, start_time limit 1;
  perform seed_demo_crowd(oth, preg_next);

  for i in 1 .. 3 loop
    insert into payments (user_id, ref, amount, kind, label, at, status, product_id)
    values (oth[i], 'pi_test_' || upper(substr(md5('pass' || i::text), 1, 14)), 7500, 'Pass', '10 Class Pass', now() - (4 + (i - 1) * 6) * one_day, 'succeeded', 'p10');
  end loop;
  insert into payments (user_id, ref, amount, kind, label, at, status)
  values (oth[4], 'pi_test_' || upper(substr(md5('declined'), 1, 14)), 900, 'Class', 'Vinyasa Flow · card declined', now() - 2 * one_day, 'failed');

  perform seed_demo_emma(emma, preg_next);

  for i in 1 .. 6 loop
    insert into payments (user_id, ref, amount, kind, label, at, status)
    values (oth[i], 'pi_test_' || upper(substr(md5('bath' || i::text), 1, 14)), 1500, 'Event', 'Full Moon Sound Bath', now() - i * one_day, 'succeeded')
    returning * into pay;
    insert into event_bookings (user_id, event_id, payment_id, amount, created) values (oth[i], 'e-bath', pay.id, 1500, pay.at);
  end loop;
  insert into requests (user_id, service, date, slot, msg, created) values
    (oth[1], 'sreiki', today + 4, 'Evening', 'First time trying reiki — any evening works for me.', now() - interval '5 hours'),
    (oth[2], 's121', today + 7, 'Morning', 'Would love the 90 minute session as a birthday treat.', now() - one_day);
  insert into notifications (user_id, text, at, read) values
    (emma, 'You’re on the waitlist for Pregnancy Yoga. We’ll let you know if a place opens up.', now() - one_day, false),
    (emma, 'Payment received: £9.00 for Sleepy Yoga & Sound Bath (test mode).', now() - 2 * one_day, true);
  insert into audit (actor_label, action) values ('System', 'Demonstration data loaded — remove before launch.');
end $$;

-- Owner-only button in Studio Settings.
create function public.reset_demo() returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from profiles where id = auth.uid() and role = 'owner' and active) then
    raise exception 'Not authorised' using errcode = '42501';
  end if;
  perform seed_demo();
  perform audit_log(auth.uid(), 'Reset demonstration data');
  return jsonb_build_object('ok', true);
end $$;

revoke execute on function public.seed_reference(), public.ensure_demo_user(text, text, text, user_role, timestamptz), public.seed_demo(),
  public.wipe_demo_data(), public.seed_demo_timetable(date), public.seed_demo_crowd(uuid[], uuid), public.seed_demo_emma(uuid, uuid)
  from public, anon, authenticated;
revoke execute on function public.reset_demo() from public, anon;

select public.seed_demo();
