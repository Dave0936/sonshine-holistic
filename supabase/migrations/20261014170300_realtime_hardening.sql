-- Live updates for both apps (realtime respects the row-level security above).
alter publication supabase_realtime add table public.bookings, public.sessions, public.notifications, public.payments,
  public.passes, public.ledger, public.event_bookings, public.events, public.products, public.settings, public.instructors,
  public.requests, public.profiles, public.audit;

-- Pin search_path on the plain helper functions; the sign-up trigger is never called directly.
alter function public.fmt_d(date) set search_path = public;
alter function public.fmt_dl(date) set search_path = public;
alter function public.fmt_t(time) set search_path = public;
alter function public.fmt_tst(timestamptz) set search_path = public;
alter function public.gbp(int) set search_path = public;
alter function public.session_start(date, time) set search_path = public;
alter function public.event_price(public.events) set search_path = public;
alter function public.zoom_link(text) set search_path = public;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
