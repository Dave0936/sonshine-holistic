import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import { addDays, iso } from './format';
import type { Db, Result } from './types';

const URL = import.meta.env.VITE_SUPABASE_URL as string;
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

// The customer app and the studio app keep separate sign-ins, so both can be open side by side.
export const makeClient = (storageKey: string) =>
  createClient(URL, KEY, { auth: { storageKey, persistSession: true, autoRefreshToken: true, detectSessionInUrl: storageKey === 'sonshine-customer' } });

// Supabase caps a response at 1000 rows, so page through anything that can grow.
async function all<T>(sb: SupabaseClient, table: string, order: string, filter?: (q: any) => any): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += 1000) {
    let q = sb.from(table).select('*').order(order).range(from, from + 999);
    if (filter) q = filter(q);
    const { data, error } = await q;
    if (error) throw error;
    out.push(...(data as T[]));
    if (!data || data.length < 1000) return out;
  }
}

async function snapshot(sb: SupabaseClient, user: User | null, staff: boolean): Promise<Db> {
  const today = new Date();
  const from = iso(addDays(today, -120)), to = iso(addDays(today, 90));
  const signed = !!user;
  const none = async () => [] as any[];
  const [settings, instructors, classes, products, services, events, sessions, avail, evAvail,
    profiles, bookings, passes, ledger, payments, eventBookings, requests, notifs, audit, deleteRequests, notes, links, waitPos] = await Promise.all([
    sb.from('settings').select('*').single().then(r => r.data),
    all(sb, 'instructors', 'sort'), all(sb, 'classes', 'name'), all(sb, 'products', 'sort'), all(sb, 'services', 'sort'), all(sb, 'events', 'date'),
    all(sb, 'sessions', 'date', q => q.gte('date', from).lte('date', to)),
    sb.rpc('session_availability', { p_from: from, p_to: to }).then(r => r.data || []),
    sb.rpc('event_availability').then(r => r.data || []),
    signed ? all(sb, 'profiles', 'first') : none(),
    signed ? all(sb, 'bookings', 'created') : none(),
    signed ? all(sb, 'passes', 'purchased') : none(),
    signed ? all(sb, 'ledger', 'at') : none(),
    signed ? all(sb, 'payments', 'at') : none(),
    signed ? all(sb, 'event_bookings', 'created') : none(),
    signed ? all(sb, 'requests', 'created') : none(),
    signed ? sb.from('notifications').select('*').eq('user_id', user!.id).order('at', { ascending: false }).limit(50).then(r => r.data || []) : none(),
    staff ? sb.from('audit').select('*').order('at', { ascending: false }).limit(100).then(r => r.data || []) : none(),
    signed ? all(sb, 'delete_requests', 'at') : none(),
    staff ? all(sb, 'customer_notes', 'user_id') : none(),
    signed ? all(sb, 'session_links', 'session_id') : none(),
    signed && !staff ? sb.rpc('my_waitlist_positions').then(r => r.data || []) : none()
  ]);
  return {
    settings: settings || { cancel_hours: 6, offer_hours: 2, reminders: true },
    instructors, classes, products, services, events, sessions, profiles, bookings, passes, ledger, payments, eventBookings, requests,
    notifs, audit, deleteRequests,
    notes: Object.fromEntries((notes as any[]).map(n => [n.user_id, n.notes])),
    links: Object.fromEntries((links as any[]).map(l => [l.session_id, l.link])),
    avail: Object.fromEntries((avail as any[]).map(a => [a.session_id, { taken: a.taken, waiting: a.waiting }])),
    evTaken: Object.fromEntries((evAvail as any[]).map(a => [a.event_id, a.taken])),
    waitPos: Object.fromEntries((waitPos as any[]).map(w => [w.booking_id, w.pos]))
  } as Db;
}

const TABLES = ['bookings', 'sessions', 'notifications', 'payments', 'passes', 'ledger', 'event_bookings', 'events', 'products', 'settings', 'instructors', 'requests', 'profiles', 'audit'];

export function useStudio(sb: SupabaseClient, name: string) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [db, setDb] = useState<Db | null>(null);
  const [error, setError] = useState('');
  const seq = useRef(0);
  const userRef = useRef<User | null>(null);

  const load = useCallback(async () => {
    const n = ++seq.current, u = userRef.current;
    try {
      const staff = !!u && (await sb.rpc('is_staff', { uid: u.id })).data === true;
      const next = await snapshot(sb, u, staff);
      if (n === seq.current) { setDb(next); setError(''); }
    } catch (e: any) {
      if (n === seq.current) setError(/fetch|network/i.test(e?.message || '') ? 'Couldn’t reach the studio — check your connection and try again.' : e?.message || 'Something went wrong loading the studio.');
    }
  }, [sb]);

  useEffect(() => {
    sb.auth.getSession().then(({ data }) => { userRef.current = data.session?.user ?? null; setUser(userRef.current); });
    const { data } = sb.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null;
      if (u?.id !== userRef.current?.id || (u && u.email_confirmed_at !== userRef.current?.email_confirmed_at)) { userRef.current = u; setUser(u); }
    });
    return () => data.subscription.unsubscribe();
  }, [sb]);

  // Reload on sign-in/out, on live changes, when the app comes back to the foreground, and every 30s for capacity counts.
  useEffect(() => {
    if (user === undefined) return;
    load();
    let t: ReturnType<typeof setTimeout> | undefined;
    const soon = () => { clearTimeout(t); t = setTimeout(load, 350); };
    const ch = sb.channel(name + '-' + (user?.id || 'guest'));
    TABLES.forEach(table => ch.on('postgres_changes' as any, { event: '*', schema: 'public', table }, soon));
    ch.subscribe();
    const iv = setInterval(load, 30000);
    const vis = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', vis);
    return () => { clearTimeout(t); clearInterval(iv); document.removeEventListener('visibilitychange', vis); sb.removeChannel(ch); };
  }, [user, sb, load, name]);

  // Calls a booking-engine function, then refreshes so every screen reflects the result.
  const rpc = useCallback(async (fn: string, args: Record<string, unknown> = {}): Promise<Result> => {
    const { data, error } = await sb.rpc(fn, args);
    await load();
    if (error) return { err: /Not authorised/.test(error.message) ? 'Not authorised.' : 'Something went wrong — please try again. (' + error.message + ')' };
    return (data as Result) ?? { ok: true };
  }, [sb, load]);

  return { user, db, error, reload: load, rpc };
}
