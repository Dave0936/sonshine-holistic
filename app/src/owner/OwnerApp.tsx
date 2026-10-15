// Studio management app for owners and administrators.
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Avatar, Button, SmallButton } from '../ds';
import { Model, HOLDS, chip } from '../lib/model';
import { useStudio } from '../lib/studio';
import { STUDIO, st } from '../lib/content';
import { IMG, addDays, download, fmtD, fmtDL, fmtT, fmtTs, fmtTsT, gbp, greetWord, hhmm, iso, ms, todayIso } from '../lib/format';
import type { Session } from '../lib/types';
import { BackHeader, Chip, DayStrip, Err, ICONS, NavRow, Phone, Pill, Scroll, Sheet, Spinner, LoadError, Stepper, TabBar, Toast, Toggle } from '../ui';

type Nav = { screen: string; p: Record<string, string> };
type SheetName = null | 'confirm' | 'booking' | 'adjust';
type Confirm = { title: string; body: string; label: string; run: () => void };

const TABS = ['dash', 'sessions', 'bookings', 'customers', 'more'];
const TITLES: Record<string, string> = { session: 'Session', newSession: 'Add Sessions', customer: 'Customer', requests: 'Appointment Requests', events: 'Events & Workshops', products: 'Passes & Pricing', payments: 'Payments', reports: 'Reports', instructors: 'Instructors', settings: 'Studio Settings', audit: 'Audit Log' };

export default function OwnerApp({ sb, mobile, onSwitch }: { sb: SupabaseClient; mobile: boolean; onSwitch?: () => void }) {
  const { user, db, error, rpc, reload } = useStudio(sb, 'owner');
  const [nav, setNav] = useState<Nav>({ screen: 'dash', p: {} });
  const [stack, setStack] = useState<Nav[]>([]);
  const [sheet, setSheet] = useState<SheetName>(null);
  const [cf, setCf] = useState<Confirm | null>(null);
  const [sel, setSel] = useState('');
  const [toastText, setToastText] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [login, setLogin] = useState({ email: '', pw: '', err: '', busy: false });
  const [day, setDay] = useState(todayIso());
  const [bq, setBq] = useState(''); const [bStatus, setBStatus] = useState('all');
  const [cq, setCq] = useState(''); const [pq, setPq] = useState('');
  const [manual, setManual] = useState('');
  const [nw, setNw] = useState({ cls: 'vin', date: todayIso(), start: '18:00', cap: 14, repeat: 1 });
  const [adj, setAdj] = useState({ delta: 1, reason: '', err: '' });
  const [notes, setNotes] = useState<string | null>(null);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [period, setPeriod] = useState(30);

  const toast = (m: string) => { clearTimeout(toastTimer.current); setToastText(m); toastTimer.current = setTimeout(() => setToastText(''), 3200); };
  const go = (screen: string, p: Record<string, string> = {}) => { setStack(s => [...s, nav]); setNav({ screen, p }); setSheet(null); setNotes(null); };
  const tab = (t: string) => { setStack([]); setNav({ screen: t, p: {} }); setSheet(null); };
  const back = () => { const prev = stack[stack.length - 1]; setSheet(null); if (prev) { setStack(stack.slice(0, -1)); setNav(prev); } else setNav({ screen: 'dash', p: {} }); };
  const confirm = (title: string, body: string, label: string, run: () => void) => { setCf({ title, body, label, run }); setSheet('confirm'); };
  // Staff actions: show the server's message, or a default success toast.
  const act = async (fn: string, args: Record<string, unknown>, ok?: string) => { const r = await rpc(fn, args); if (r.err) toast(r.err); else if (ok) toast(ok); return r; };

  useEffect(() => { scrollRef.current?.scrollTo(0, 0); }, [nav]);

  const e = useMemo(() => (db ? new Model(db) : null), [db]);
  const me = e && user ? e.user(user.id) : undefined;
  const staff = !!me && me.active && (me.role === 'owner' || me.role === 'admin');

  if (user === undefined || (user && !db)) {
    return <Phone mobile={mobile} dark label="Studio Management">{error ? <LoadError text={error} onRetry={reload} /> : <Spinner />}</Phone>;
  }

  // ---------------------------------------------------------------- login
  if (!user || !staff || !e) {
    const signIn = async () => {
      if (!login.email.trim() || !login.pw) return setLogin({ ...login, err: 'Please enter your email and password.' });
      setLogin({ ...login, busy: true, err: '' });
      const { data, error: er } = await sb.auth.signInWithPassword({ email: login.email.trim().toLowerCase(), password: login.pw });
      if (er || !data.user) return setLogin(l => ({ ...l, busy: false, err: 'That email and password don’t match an account.' }));
      const { data: ok } = await sb.rpc('is_staff', { uid: data.user.id });
      if (!ok) {
        await sb.rpc('log_blocked_staff_access'); await sb.auth.signOut();
        return setLogin(l => ({ ...l, busy: false, err: 'This account doesn’t have studio access. Customer accounts can’t open the management area.' }));
      }
      setLogin({ email: login.email, pw: '', err: '', busy: false }); setStack([]); setNav({ screen: 'dash', p: {} });
    };
    // A signed-in customer session on this device is not staff — offer a clean sign-in.
    const stray = !!user && !!db && !staff;
    return (
      <Phone mobile={mobile} dark label="Studio Management">
        <Scroll>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16, padding: '28px 24px', background: '#fff' }}>
            <img src={IMG.logo} alt="Sonshine Hollistic" style={{ width: 140, alignSelf: 'center' }} />
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 4 }}><h1 className="t-h1s">Studio Management</h1><span className="t-small">For owners and administrators only</span></div>
            {stray && <div className="note">This account doesn’t have studio access. <button className="t-link" style={{ padding: 0 }} onClick={() => sb.auth.signOut()}>Sign out</button></div>}
            <label className="field">Email address<input className="input" type="email" autoComplete="username" value={login.email} onChange={ev => setLogin({ ...login, email: ev.target.value, err: '' })} /></label>
            <label className="field">Password<input className="input" type="password" autoComplete="current-password" value={login.pw} onChange={ev => setLogin({ ...login, pw: ev.target.value, err: '' })} onKeyDown={ev => ev.key === 'Enter' && signIn()} /></label>
            <Err text={login.err} />
            <Button onClick={signIn} disabled={login.busy}>{login.busy ? 'Signing in…' : 'Sign In'}</Button>
            {onSwitch && <button onClick={onSwitch} className="t-link" style={{ padding: 8 }}>Back to the Customer App</button>}
            <span style={{ font: '400 12px/18px var(--font-body)', color: 'var(--text-subtle)', textAlign: 'center' }}>Demo: son@demo.test (owner) or ruth@demo.test (admin) · demo1234. Customer logins are refused.</span>
          </div>
        </Scroll>
      </Phone>
    );
  }

  const D = db!, now = Date.now(), scr = nav.screen, P = nav.p;
  const isTab = TABS.includes(scr);
  const today = todayIso();
  const meLabel = { name: `${me!.first} ${me!.last}`, role: me!.role === 'owner' ? 'Owner' : 'Administrator', ini: (me!.first[0] + me!.last[0]).toUpperCase() };

  const ov = (s: Session) => {
    const v = e.sv(s, null), w = e.waiting(s.id).length;
    return { ...v, open: () => go('session', { sid: s.id }), occ: `${v.taken}/${s.cap}`, barBg: v.taken >= s.cap ? '#BE185D' : '#EC0F8C', wait: w ? `${w} waiting` : '',
      statusLabel: v.cancelled ? 'Cancelled' : v.past ? 'Finished' : v.full ? 'Full' : `${v.left} left` };
  };
  const SessionCard = ({ s }: { s: Session }) => { const v = ov(s); return (
    <div onClick={v.open} role="button" tabIndex={0} className="card-sm" style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8, cursor: 'pointer', opacity: v.opacity }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}><span style={{ font: '600 15px/20px var(--font-display)', color: 'var(--text-heading)' }}>{v.time} · {v.name}</span><span style={{ font: '700 14px/20px var(--font-body)', color: 'var(--text-strong)', flex: 'none' }}>{v.occ}</span></div>
      <div className="bar"><div style={{ width: v.pct, background: v.barBg }} /></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', font: '400 12px/16px var(--font-body)', color: 'var(--text-muted)' }}><span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{v.insName} · {v.format}</span><span style={{ flex: 'none', paddingLeft: 8 }}>{v.statusLabel} {v.wait}</span></div>
    </div>); };
  const pend = D.requests.filter(r => r.status === 'pending');

  // ---------------------------------------------------------------- screens
  const screens: Record<string, () => ReactNode> = {
    dash: () => {
      const todayS = D.sessions.filter(s => s.date === today).sort((a, b) => e.start(a) - e.start(b));
      const todayB = D.bookings.filter(b => todayS.some(s => s.id === b.session_id) && HOLDS.includes(b.status));
      const failed7 = D.payments.filter(p => p.status === 'failed' && ms(p.at) > now - 7 * 864e5);
      const stats = [
        ['Booked today', String(todayB.length), `${todayS.filter(s => s.status !== 'cancelled').length} classes`],
        ['Places left today', String(todayS.filter(s => s.status !== 'cancelled' && e.start(s) > now).reduce((a, s) => a + Math.max(0, s.cap - e.taken(s.id)), 0)), 'in upcoming classes'],
        ['Pending requests', String(pend.length), 'appointments to review'],
        ['Payment issues', String(failed7.length), 'failed in last 7 days']];
      const soon = D.sessions.filter(s => s.status !== 'cancelled' && e.start(s) > now && e.start(s) < now + 7 * 864e5 && e.taken(s.id) / s.cap >= 0.8).sort((a, b) => e.start(a) - e.start(b));
      const attention: [string, string, () => void][] = [
        ...soon.slice(0, 3).map(s => [`${e.cls(s.cls).name}, ${fmtD(s.date)} ${fmtT(hhmm(s.start_time))} is ${e.taken(s.id) >= s.cap ? 'full' : 'nearly full'} (${e.taken(s.id)}/${s.cap})${e.waiting(s.id).length ? ' · ' + e.waiting(s.id).length + ' waiting' : ''}`, 'View', () => go('session', { sid: s.id })] as [string, string, () => void]),
        ...(pend.length ? [[`${pend.length} appointment request${pend.length > 1 ? 's' : ''} awaiting a reply`, 'Review', () => go('requests')] as [string, string, () => void]] : []),
        ...(failed7.length ? [[`${failed7.length} failed card payment${failed7.length > 1 ? 's' : ''} this week`, 'Payments', () => go('payments')] as [string, string, () => void]] : []),
        ...(D.deleteRequests.length ? [[`${D.deleteRequests.length} account deletion request${D.deleteRequests.length > 1 ? 's' : ''}`, 'Audit', () => go('audit')] as [string, string, () => void]] : [])];
      const recent = D.bookings.filter(b => ms(b.created) <= now && e.sess(b.session_id)).sort((a, b) => ms(b.created) - ms(a.created)).slice(0, 5);
      const newCust = D.profiles.filter(u => u.role === 'customer').sort((a, b) => ms(b.joined) - ms(a.joined)).slice(0, 3);
      return (
        <div style={{ padding: '20px 16px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="col" style={{ gap: 2 }}><span style={{ font: '500 13px/20px var(--font-body)', color: 'var(--text-subtle)' }}>{fmtDL(today)}</span><h1 className="t-h1s">{greetWord()}, {me!.first}</h1></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {stats.map(([l, v, s]) => <div key={l} className="card-md" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ font: '500 12px/16px var(--font-body)', color: 'var(--text-muted)' }}>{l}</span><span style={{ font: '700 30px/36px var(--font-display)', color: 'var(--brand-rose)' }}>{v}</span><span style={{ font: '400 11px/14px var(--font-body)', color: 'var(--text-subtle)' }}>{s}</span>
            </div>)}
          </div>
          {attention.length > 0 && <div className="col" style={{ gap: 8 }}><h2 className="t-h2o">Needs Attention</h2>
            {attention.map(([t, l, a], i) => <div key={i} className="card-sm" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-rose)', flex: 'none' }} /><span style={{ flex: 1, font: '400 13px/18px var(--font-body)', color: 'var(--text-strong)' }}>{t}</span><SmallButton tone="outline" onClick={a}>{l}</SmallButton>
            </div>)}
          </div>}
          <div className="col" style={{ gap: 8 }}><h2 className="t-h2o">Today’s Classes</h2>
            {todayS.map(s => <SessionCard key={s.id} s={s} />)}
            {todayS.length === 0 && <span className="t-small">No classes scheduled today.</span>}
          </div>
          <div className="col" style={{ gap: 8 }}><h2 className="t-h2o">Recent Bookings</h2>
            <div className="card-md col">
              {recent.map(b => { const s = e.sess(b.session_id)!, x = st(b.status); return <button key={b.id} className="listbtn" onClick={() => { setSel(b.id); setSheet('booking'); }} style={{ padding: '12px 14px' }}>
                <span className="col" style={{ minWidth: 0 }}><span className="t-strong14">{e.userName(b.user_id)}</span><span className="t-muted12">{e.cls(s.cls).name} · {fmtD(s.date)}</span></span><Pill tone={x} style={{ alignSelf: 'center' }}>{x.label}</Pill>
              </button>; })}
            </div>
          </div>
          <div className="col" style={{ gap: 8 }}><h2 className="t-h2o">New Customers</h2>
            {newCust.map(u => <div key={u.id} onClick={() => go('customer', { uid: u.id })} role="button" tabIndex={0} className="card-sm" style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
              <span className="t-strong14">{u.first} {u.last}</span><span style={{ font: '400 12px/20px var(--font-body)', color: 'var(--text-muted)' }}>Joined {fmtTs(u.joined)}</span>
            </div>)}
          </div>
        </div>
      );
    },

    sessions: () => {
      const dayS = D.sessions.filter(s => s.date === day).sort((a, b) => e.start(a) - e.start(b));
      return (
        <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: 28 }}>
          <div style={{ background: '#fff', padding: '14px 0 12px', display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 1px 2px rgba(0,0,0,.05)' }}>
            <div style={{ padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h1 className="t-h1o">Timetable</h1><SmallButton tone="rose" onClick={() => { setNw({ ...nw, date: day }); go('newSession'); }}>+ Add Session</SmallButton></div>
            <DayStrip days={e.days(day, null, setDay)} pad={16} dots={false} />
          </div>
          <div style={{ margin: '16px 16px 0', background: 'var(--brand-rose)', borderRadius: '8px 8px 0 0', padding: '10px 16px', font: '700 16px/24px var(--font-display)', color: '#fff' }}>{fmtDL(day).toUpperCase()}</div>
          <div style={{ margin: '0 16px', background: 'var(--surface-cream)', borderRadius: '0 0 12px 12px', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {dayS.map(s => <SessionCard key={s.id} s={s} />)}
            {dayS.length === 0 && <span className="t-small" style={{ textAlign: 'center', padding: 20 }}>No sessions on this day.</span>}
          </div>
        </div>
      );
    },

    session: () => {
      const s = e.sess(P.sid); if (!s) return <Missing />;
      const v = ov(s), c = e.cls(s.cls), link = D.links[s.id];
      const roster = D.bookings.filter(b => b.session_id === s.id && ['confirmed', 'attended', 'noshow', 'offered'].includes(b.status));
      const waitlist = e.waiting(s.id);
      const custOpts = D.profiles.filter(u => u.role === 'customer' && u.active && !e.myB(u.id, s.id));
      return (
        <div style={{ padding: '16px 16px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="col" style={{ gap: 4 }}><h1 className="t-h1o">{c.name}</h1><span style={{ font: '500 14px/20px var(--font-body)', color: 'var(--text-body)' }}>{fmtDL(s.date)} · {v.time} – {v.endTime}</span><span style={{ font: '400 13px/18px var(--font-body)', color: 'var(--text-muted)' }}>{v.format} · {v.statusLabel}</span></div>
          <div className="card-md" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ font: '500 14px/20px var(--font-body)', color: 'var(--text-strong)' }}>Capacity · {v.occ} booked</span>
              <Stepper label="capacity" value={s.cap} onDec={() => act('set_capacity', { p_session: s.id, p_cap: s.cap - 1 })} onInc={() => act('set_capacity', { p_session: s.id, p_cap: s.cap + 1 })} /></div>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, font: '500 14px/20px var(--font-body)', color: 'var(--text-strong)' }}>Instructor
              <select value={s.ins} onChange={ev => act('set_session_instructor', { p_session: s.id, p_ins: ev.target.value }, 'Instructor updated — booked customers notified.')} style={{ height: 40, border: '1px solid #D1D5DB', borderRadius: 8, padding: '0 10px', font: '400 14px/20px var(--font-body)', background: '#fff' }}>
                {D.instructors.filter(i => i.active || i.id === s.ins).map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select></label>
            <Toggle on={s.waitlist} label="Waitlist open" onClick={() => act('set_session_waitlist', { p_session: s.id, p_open: !s.waitlist })} />
            {link && <span style={{ font: '400 12px/16px var(--font-body)', color: 'var(--text-muted)', wordBreak: 'break-all' }}>Online link: {link}</span>}
          </div>
          <div className="col" style={{ gap: 8 }}><h2 className="t-h2s">Register</h2>
            {roster.map(b => { const u = e.user(b.user_id), x = st(b.status), a = chip(b.status === 'attended'), n = chip(b.status === 'noshow'); return (
              <div key={b.id} className="card-sm" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><div className="col" style={{ minWidth: 0 }}><span className="t-strong14">{u ? `${u.first} ${u.last}` : 'Customer'}</span><span style={{ font: '400 11px/16px var(--font-body)', color: 'var(--text-muted)' }}>{e.payLabel(b)}</span></div><Pill tone={x}>{x.label}</Pill></div>
                {b.status !== 'offered' && <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => act('set_attendance', { p_booking: b.id, p_status: 'attended' })} style={{ flex: 1, height: 36, borderRadius: 8, border: `1px solid ${a.bd}`, background: a.bg, color: a.fg, font: '600 12px/16px var(--font-body)', cursor: 'pointer' }}>Attended</button>
                  <button onClick={() => act('set_attendance', { p_booking: b.id, p_status: 'noshow' })} style={{ flex: 1, height: 36, borderRadius: 8, border: `1px solid ${n.bd}`, background: n.bg, color: n.fg, font: '600 12px/16px var(--font-body)', cursor: 'pointer' }}>No-show</button>
                  <button onClick={() => confirm(`Cancel ${u?.first || 'this customer'}’s booking?`, 'As a staff override, their credit or payment will be returned regardless of the notice period. This is recorded in the audit log.', 'Cancel & Restore', () => act('cancel_booking', { p_booking: b.id, p_override: true }, 'Booking cancelled — customer notified.'))} style={{ height: 36, padding: '0 10px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', color: 'var(--text-body)', font: '600 12px/16px var(--font-body)', cursor: 'pointer' }}>Cancel</button>
                </div>}
              </div>); })}
            {roster.length === 0 && <span className="t-small">No one booked yet.</span>}
          </div>
          {waitlist.length > 0 && <div className="col" style={{ gap: 6 }}><h2 className="t-h2s">Waitlist</h2>
            {waitlist.map((b, i) => <div key={b.id} style={{ background: '#fff', borderRadius: 10, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', font: '400 13px/18px var(--font-body)', color: 'var(--text-strong)' }}><span>{i + 1}. {e.userName(b.user_id)}</span><span style={{ color: 'var(--text-subtle)', fontSize: 11 }}>Joined {fmtTsT(b.created)}</span></div>)}
          </div>}
          {s.status !== 'cancelled' && <>
            <div className="card-md" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span className="t-strong14">Add customer manually</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <select value={manual} onChange={ev => setManual(ev.target.value)} aria-label="Customer" style={{ flex: 1, minWidth: 0, height: 40, border: '1px solid #D1D5DB', borderRadius: 8, padding: '0 10px', font: '400 14px/20px var(--font-body)', background: '#fff' }}>
                  <option value="">Choose a customer…</option>
                  {custOpts.map(u => <option key={u.id} value={u.id}>{u.first} {u.last}</option>)}
                </select>
                <SmallButton tone="rose" onClick={async () => { if (!manual) return toast('Choose a customer first.'); const r = await act('manual_book', { p_session: s.id, p_user: manual }, 'Customer added and notified.'); if (!r.err) setManual(''); }}>Add</SmallButton>
              </div>
            </div>
            <Button variant="outline" fullWidth onClick={() => confirm('Cancel this session?', `All ${v.taken} booked customers will be notified and have their credit or payment returned. This can’t be undone.`, 'Cancel Session', () => act('cancel_session', { p_session: s.id }, 'Session cancelled — customers notified.'))}>Cancel This Session</Button>
          </>}
        </div>
      );
    },

    newSession: () => {
      const t = new Date(); t.setHours(0, 0, 0, 0);
      const c = e.cls(nw.cls);
      const create = async () => {
        if (!nw.start || !nw.cap || nw.cap < 1) return toast('Please add a start time and capacity.');
        const r = await rpc('create_sessions', { p_cls: nw.cls, p_date: nw.date, p_start: nw.start, p_cap: nw.cap, p_repeat: nw.repeat });
        if (r.err) return toast(r.err);
        setDay(nw.date); back(); const n = Number(r.count) || 1; toast(`${n} session${n > 1 ? 's' : ''} added to the timetable.`);
      };
      return (
        <div style={{ padding: '20px 16px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label className="field">Class<select className="input" value={nw.cls} onChange={ev => setNw({ ...nw, cls: ev.target.value })}>{D.classes.map(x => <option key={x.id} value={x.id}>{x.name} — {e.ins(x.ins).name}</option>)}</select></label>
          <label className="field">Date<select className="input" value={nw.date} onChange={ev => setNw({ ...nw, date: ev.target.value })}>{Array.from({ length: 56 }, (_, i) => iso(addDays(t, i))).map(ds => <option key={ds} value={ds}>{fmtDL(ds)}</option>)}</select></label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <label className="field">Start time<input className="input" type="time" value={nw.start} onChange={ev => setNw({ ...nw, start: ev.target.value })} style={{ fontSize: 15, padding: '0 12px' }} /></label>
            <label className="field">Capacity<input className="input" type="number" min={1} value={nw.cap} onChange={ev => setNw({ ...nw, cap: Number(ev.target.value) })} style={{ fontSize: 15, padding: '0 12px' }} /></label>
          </div>
          <label className="field">Repeat<select className="input" value={nw.repeat} onChange={ev => setNw({ ...nw, repeat: Number(ev.target.value) })}>{[1, 4, 8, 12].map(n => <option key={n} value={n}>{n === 1 ? 'Just once' : `Weekly for ${n} weeks`}</option>)}</select></label>
          <div className="blush" style={{ padding: '12px 14px', font: '500 13px/20px var(--font-body)', color: 'var(--brand-rose-ink)' }}>{c?.name} · {fmtD(nw.date)} at {fmtT(nw.start || '00:00')} · {nw.cap} places{nw.repeat > 1 ? ` · repeats weekly ×${nw.repeat}` : ''}</div>
          <Button onClick={create}>Add to Timetable</Button>
        </div>
      );
    },

    bookings: () => {
      const ql = bq.trim().toLowerCase();
      const bl = D.bookings.filter(b => {
        const s = e.sess(b.session_id); if (!s) return false; const u = e.user(b.user_id);
        if (bStatus !== 'all' && !(b.status === bStatus || (bStatus === 'waitlisted' && b.status === 'offered'))) return false;
        if (ql && !(`${u?.first} ${u?.last} ${u?.email} ${e.cls(s.cls).name} ${e.ins(s.ins).name}`.toLowerCase().includes(ql))) return false;
        return Math.abs(e.start(s) - now) < 14 * 864e5;
      }).sort((a, b) => Math.abs(e.start(e.sess(a.session_id)!) - now) - Math.abs(e.start(e.sess(b.session_id)!) - now)).slice(0, 60);
      return (
        <div style={{ padding: '16px 16px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h1 className="t-h1o">Bookings</h1>
          <input type="search" aria-label="Search bookings" placeholder="Search name, email, class or instructor" value={bq} onChange={ev => setBq(ev.target.value)} className="input sm" />
          <div className="hscroll" style={{ margin: '0 -16px', padding: '0 16px' }}>{[['all', 'All'], ['confirmed', 'Confirmed'], ['waitlisted', 'Waitlist'], ['cancelled', 'Cancelled'], ['attended', 'Attended']].map(([k, l]) => <Chip key={k} on={bStatus === k} label={l} onClick={() => setBStatus(k)} style={{ padding: '0 12px' }} />)}</div>
          <span className="t-meta">Showing bookings within two weeks of today</span>
          <div className="card-md col">
            {bl.map(b => { const s = e.sess(b.session_id)!, x = st(b.status); return <button key={b.id} className="listbtn" style={{ padding: '12px 14px' }} onClick={() => { setSel(b.id); setSheet('booking'); }}>
              <span className="col" style={{ minWidth: 0 }}><span className="t-strong14">{e.userName(b.user_id)}</span><span className="t-muted12">{e.cls(s.cls).name} · {fmtD(s.date)} · {fmtT(hhmm(s.start_time))}</span></span><Pill tone={x} style={{ alignSelf: 'center' }}>{x.label}</Pill>
            </button>; })}
            {bl.length === 0 && <span className="t-small" style={{ textAlign: 'center', padding: 20 }}>No bookings match.</span>}
          </div>
        </div>
      );
    },

    customers: () => {
      const ql = cq.trim().toLowerCase();
      const list = D.profiles.filter(u => u.role === 'customer' && (!ql || `${u.first} ${u.last} ${u.email}`.toLowerCase().includes(ql))).sort((a, b) => a.first.localeCompare(b.first));
      return (
        <div style={{ padding: '16px 16px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h1 className="t-h1o">Customers</h1>
          <input type="search" aria-label="Search customers" placeholder="Search by name or email" value={cq} onChange={ev => setCq(ev.target.value)} className="input sm" />
          <div className="card-md col">
            {list.map(u => { const cr = e.activePasses(u.id).reduce((a, p) => a + e.bal(p.id), 0); return <button key={u.id} className="listbtn" style={{ padding: '10px 14px', gap: 12, justifyContent: 'flex-start' }} onClick={() => go('customer', { uid: u.id })}>
              <Avatar initials={((u.first[0] || '?') + (u.last[0] || '')).toUpperCase()} size={36} />
              <span style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}><span className="t-strong14">{u.first} {u.last}{!u.active ? ' (deactivated)' : ''}</span><span className="t-muted12" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</span></span>
              <span style={{ font: '500 12px/16px var(--font-body)', color: 'var(--brand-rose)', flex: 'none' }}>{cr ? `${cr} credits` : 'No pass'}</span>
            </button>; })}
            {list.length === 0 && <span className="t-small" style={{ textAlign: 'center', padding: 20 }}>No customers match.</span>}
          </div>
        </div>
      );
    },

    customer: () => {
      const u = e.user(P.uid); if (!u) return <Missing />;
      const bks = D.bookings.filter(b => b.user_id === u.id && e.sess(b.session_id)).sort((a, b) => e.start(e.sess(b.session_id)!) - e.start(e.sess(a.session_id)!));
      const att = bks.filter(b => b.status === 'attended').length, ns = bks.filter(b => b.status === 'noshow').length;
      const passes = D.passes.filter(p => p.user_id === u.id).sort((a, b) => ms(b.purchased) - ms(a.purchased));
      const pays = D.payments.filter(p => p.user_id === u.id).sort((a, b) => ms(b.at) - ms(a.at)).slice(0, 6);
      const noteVal = notes ?? D.notes[u.id] ?? '';
      return (
        <div style={{ padding: '16px 16px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Avatar initials={((u.first[0] || '?') + (u.last[0] || '')).toUpperCase()} size={56} />
            <div className="col" style={{ gap: 2, minWidth: 0 }}><span style={{ font: '700 22px/28px var(--font-display)', color: 'var(--text-strong)' }}>{u.first} {u.last}</span><span style={{ font: '400 13px/18px var(--font-body)', color: 'var(--text-muted)', overflowWrap: 'anywhere' }}>{u.email}</span><span style={{ font: '400 11px/16px var(--font-body)', color: 'var(--text-subtle)' }}>Customer since {fmtTs(u.joined)}</span></div></div>
          <div className="card-sm" style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 2, font: '400 13px/20px var(--font-body)', color: 'var(--text-body)' }}>
            <span>{att} attended · {ns} no-show · {bks.filter(b => b.status === 'cancelled').length} cancelled</span><span style={{ color: 'var(--text-subtle)' }}>{u.marketing ? 'Opted in to marketing' : 'Essential messages only'}</span>
          </div>
          <div className="col" style={{ gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h2 className="t-h2s">Passes</h2><SmallButton tone="outline" onClick={() => act('grant_comp_credit', { p_user: u.id }, 'Complimentary credit granted.')}>+ Comp Credit</SmallButton></div>
            {passes.map(p => { const active = ms(p.expires) > now; return <div key={p.id} className="card-sm" style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <div className="col"><span className="t-strong14">{e.prod(p.product).name}{p.comp ? ' (comp)' : ''}</span><span className="t-muted12">{e.bal(p.id)} / {p.total} credits · {active ? 'Expires ' : 'Expired '}{fmtTs(p.expires)}</span></div>
              {active && <SmallButton onClick={() => { setSel(p.id); setAdj({ delta: 1, reason: '', err: '' }); setSheet('adjust'); }}>Adjust</SmallButton>}
            </div>; })}
            {passes.length === 0 && <span style={{ font: '400 13px/18px var(--font-body)', color: 'var(--text-muted)' }}>No passes.</span>}
          </div>
          {bks.length > 0 && <div className="col" style={{ gap: 8 }}><h2 className="t-h2s">Bookings</h2><div className="card-sm col">
            {bks.slice(0, 8).map(b => { const s = e.sess(b.session_id)!, x = st(b.status); return <button key={b.id} className="listbtn" style={{ padding: '10px 14px' }} onClick={() => { setSel(b.id); setSheet('booking'); }}>
              <span className="col"><span style={{ font: '600 13px/18px var(--font-body)', color: 'var(--text-strong)' }}>{e.cls(s.cls).name}</span><span className="t-muted12">{fmtD(s.date)} · {fmtT(hhmm(s.start_time))}</span></span><Pill tone={x} style={{ alignSelf: 'center' }}>{x.label}</Pill>
            </button>; })}
          </div></div>}
          {pays.length > 0 && <div className="col" style={{ gap: 8 }}><h2 className="t-h2s">Payments</h2><div className="card-sm col">
            {pays.map(p => <div key={p.id} className="listrow" style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <span className="col" style={{ minWidth: 0 }}><span style={{ font: '500 13px/18px var(--font-body)', color: 'var(--text-strong)' }}>{p.label}</span><span style={{ font: '400 11px/16px var(--font-body)', color: 'var(--text-muted)' }}>{fmtTs(p.at)} · {st(p.status).label}</span></span>
              <span style={{ font: '700 13px/18px var(--font-body)', color: 'var(--text-strong)', flex: 'none' }}>{gbp(p.amount)}</span>
            </div>)}
          </div></div>}
          <div className="col" style={{ gap: 8 }}><h2 className="t-h2s">Internal Notes</h2>
            <textarea className="input" rows={3} value={noteVal} onChange={ev => setNotes(ev.target.value)} placeholder="Injuries, preferences… (never shown to the customer)" aria-label="Internal notes" style={{ fontSize: 14, lineHeight: '20px' }} />
            <SmallButton tone="rose" onClick={async () => { const r = await act('save_customer_note', { p_user: u.id, p_notes: noteVal }, 'Internal note saved (never shown to the customer).'); if (!r.err) setNotes(null); }} style={{ alignSelf: 'flex-end' }}>Save Note</SmallButton>
          </div>
          <Button variant="outline" fullWidth onClick={() => confirm(u.active ? `Deactivate ${u.first}’s account?` : `Reactivate ${u.first}’s account?`, u.active ? 'They won’t be able to sign in or book. Their history is kept.' : 'They’ll be able to sign in and book again.', u.active ? 'Deactivate' : 'Reactivate', () => act('set_customer_active', { p_user: u.id, p_active: !u.active }))}>{u.active ? 'Account active' : 'Account deactivated'} — Change</Button>
        </div>
      );
    },

    more: () => (
      <div style={{ padding: '16px 16px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Avatar initials={meLabel.ini} size={48} /><div className="col"><span style={{ font: '700 20px/26px var(--font-display)', color: 'var(--text-strong)' }}>{meLabel.name}</span><span style={{ font: '500 13px/18px var(--font-body)', color: 'var(--brand-rose)' }}>{meLabel.role}</span></div></div>
        <div className="card-md col">
          <NavRow label="Appointment Requests" onClick={() => go('requests')} right={pend.length > 0 && <span style={{ minWidth: 22, height: 22, borderRadius: 11, background: 'var(--brand-rose)', color: '#fff', font: '600 12px/22px var(--font-body)', textAlign: 'center', padding: '0 6px' }}>{pend.length}</span>} />
          <NavRow label="Events & Workshops" onClick={() => go('events')} />
          <NavRow label="Passes & Pricing" onClick={() => go('products')} />
          <NavRow label="Payments" onClick={() => go('payments')} />
          <NavRow label="Reports & Export" onClick={() => go('reports')} />
          <NavRow label="Instructors" onClick={() => go('instructors')} />
          <NavRow label="Studio Settings" onClick={() => go('settings')} />
          <NavRow label="Audit Log" onClick={() => go('audit')} />
        </div>
        <Button variant="outline" fullWidth onClick={() => { sb.auth.signOut(); setStack([]); setSheet(null); }}>Sign Out</Button>
        {onSwitch && <button onClick={onSwitch} className="t-quiet">Switch to the Customer App</button>}
      </div>
    ),

    requests: () => {
      const reqs = D.requests.slice().sort((a, b) => (a.status === 'pending' ? -1 : 1) - (b.status === 'pending' ? -1 : 1) || ms(b.created) - ms(a.created));
      return (
        <div style={{ padding: '16px 16px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reqs.map(r => { const x = st(r.status); return (
            <div key={r.id} className="card-md" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><span style={{ font: '600 15px/20px var(--font-body)', color: 'var(--text-strong)' }}>{e.userName(r.user_id)}</span><Pill tone={x}>{x.label.replace(' — not confirmed', '')}</Pill></div>
              <span style={{ font: '600 13px/18px var(--font-body)', color: 'var(--brand-rose)' }}>{r.enquiry || e.svc(r.service)?.name || r.service}</span>
              <span style={{ font: '400 13px/18px var(--font-body)', color: 'var(--text-body)' }}>{r.slot === 'Enquiry' ? 'General enquiry' : `Preferred ${fmtD(r.date)} · ${r.slot}`}</span>
              {r.msg && <span style={{ font: 'italic 400 13px/20px var(--font-body)', color: 'var(--text-body)' }}>“{r.msg}”</span>}
              <span style={{ font: '400 11px/16px var(--font-body)', color: 'var(--text-subtle)' }}>Received {fmtTsT(r.created)}</span>
              {r.status === 'pending' && <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <SmallButton tone="rose" onClick={() => act('set_request_status', { p_request: r.id, p_status: 'accepted' }, 'Accepted — customer notified.')}>Accept</SmallButton>
                <SmallButton tone="outline" onClick={() => act('set_request_status', { p_request: r.id, p_status: 'declined' }, 'Declined — customer notified.')}>Decline</SmallButton>
              </div>}
              {r.status === 'accepted' && <SmallButton tone="outline" onClick={() => act('set_request_status', { p_request: r.id, p_status: 'completed' })} style={{ alignSelf: 'flex-start' }}>Mark Completed</SmallButton>}
            </div>); })}
          {reqs.length === 0 && <span className="t-small" style={{ textAlign: 'center', padding: 20 }}>No requests yet.</span>}
        </div>
      );
    },

    events: () => (
      <div style={{ padding: '16px 16px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {D.events.map(x => <div key={x.id} className="card-md" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span className="t-card">{x.name}</span>
          <span className="t-muted12">{x.date ? `${fmtD(x.date)} · ${fmtT(hhmm(x.start_time!))}` : 'Dates on enquiry'} · {x.price == null ? 'On enquiry' : gbp(x.price) + (x.early != null ? ` · early-bird ${gbp(x.early)}` : '')}</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ font: '600 13px/18px var(--font-body)', color: 'var(--brand-rose)' }}>{x.cap ? `${e.evTaken(x.id)} / ${x.cap} booked` : 'Enquiries only'}</span>
            <Toggle on={x.published} label={<span style={{ font: '500 12px/16px var(--font-body)', color: 'var(--text-body)' }}>{x.published ? 'Published' : 'Hidden'}</span>} onClick={() => act('set_event_published', { p_event: x.id, p_published: !x.published })} style={{ width: 'auto', gap: 8 }} />
          </div>
        </div>)}
      </div>
    ),

    products: () => (
      <div style={{ padding: '16px 16px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{ font: '400 13px/20px var(--font-body)', color: 'var(--text-muted)' }}>Price changes apply to future purchases only. Existing passes keep their credits and expiry.</span>
        {D.products.map(p => {
          const sold = D.payments.filter(x => x.kind === 'Pass' && x.product_id === p.id && x.status !== 'failed');
          const input = prices[p.id] ?? (p.price / 100).toFixed(2);
          const save = async () => { const v = parseFloat(input); if (isNaN(v) || v < 0) return toast('Enter a valid price.'); const r = await act('set_product_price', { p_product: p.id, p_price: Math.round(v * 100) }, 'Price updated for future purchases.'); if (!r.err) setPrices(({ [p.id]: _, ...rest }) => rest); };
          return (
            <div key={p.id} className="card-md" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><span className="t-card">{p.name}</span><span style={{ font: '700 16px/21px var(--font-body)', color: 'var(--brand-rose)' }}>{gbp(p.price)}</span></div>
              <span className="t-muted12">{p.credits} credits · {p.weeks} weeks · {p.scope === 'kids' ? 'Kids & Teens' : 'Adult classes'} · {sold.length} sold · {gbp(sold.reduce((a, x) => a + x.amount, 0))}</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ font: '600 14px/20px var(--font-body)', color: 'var(--text-body)' }}>£</span>
                <input inputMode="decimal" aria-label={`${p.name} price`} value={input} onChange={ev => setPrices({ ...prices, [p.id]: ev.target.value })} style={{ width: 90, height: 36, border: '1px solid #D1D5DB', borderRadius: 8, padding: '0 10px', font: '400 14px/20px var(--font-body)' }} />
                <SmallButton onClick={save}>Save</SmallButton>
                <span style={{ flex: 1 }} />
                <Toggle on={p.on_sale} label={<span style={{ font: '500 12px/16px var(--font-body)', color: 'var(--text-body)' }}>{p.on_sale ? 'On sale' : 'Not on sale'}</span>} onClick={() => act('set_product_on_sale', { p_product: p.id, p_on_sale: !p.on_sale })} style={{ width: 'auto', gap: 8 }} />
              </div>
            </div>);
        })}
      </div>
    ),

    payments: () => {
      const ql = pq.trim().toLowerCase();
      const pays = D.payments.filter(p => ms(p.at) <= now).filter(p => !ql || `${e.userName(p.user_id)} ${p.label} ${p.ref}`.toLowerCase().includes(ql)).sort((a, b) => ms(b.at) - ms(a.at)).slice(0, 50);
      return (
        <div style={{ padding: '16px 16px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input type="search" aria-label="Search payments" placeholder="Search name, item or reference" value={pq} onChange={ev => setPq(ev.target.value)} className="input sm" />
          <span style={{ font: '500 12px/16px var(--font-body)', color: 'var(--brand-rose-ink)', background: 'var(--surface-blush)', borderRadius: 6, padding: '6px 10px' }}>Test mode — no real money moves</span>
          <div className="card-md col">
            {pays.map(p => { const x = st(p.status), name = e.userName(p.user_id); return <div key={p.id} className="listrow" style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><span style={{ font: '600 13px/18px var(--font-body)', color: 'var(--text-strong)' }}>{name}</span><span style={{ font: '700 13px/18px var(--font-body)', color: 'var(--text-strong)' }}>{gbp(p.amount)}</span></div>
              <span className="t-muted12">{p.label}</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <span style={{ font: '400 11px/16px var(--font-body)', color: 'var(--text-subtle)' }}>{fmtTsT(p.at)} · <span style={{ padding: '0 6px', borderRadius: 4, background: x.bg, color: x.fg, fontWeight: 600 }}>{x.label}</span></span>
                {p.status === 'succeeded' && <button onClick={() => confirm(`Refund ${gbp(p.amount)} to ${name.split(' ')[0]}?`, `${p.label} · ${p.ref}. In test mode no money moves; in production this calls the payment provider and is confirmed by webhook.`, 'Issue Refund', () => act('refund_payment', { p_payment: p.id }, 'Refund recorded.'))} className="t-link" style={{ padding: '6px 0', fontSize: 12, lineHeight: '16px' }}>Refund</button>}
              </div>
            </div>; })}
          </div>
        </div>
      );
    },

    reports: () => {
      const from = now - period * 864e5;
      const pays = D.payments.filter(p => ms(p.at) >= from && ms(p.at) <= now && p.status !== 'failed');
      const gross = pays.reduce((a, p) => a + p.amount, 0), refunds = pays.filter(p => p.status === 'refunded').reduce((a, p) => a + p.amount, 0);
      const pastS = D.sessions.filter(s => s.status !== 'cancelled' && e.start(s) >= from && e.start(s) <= now);
      const pastIds = new Set(pastS.map(s => s.id));
      const pastB = D.bookings.filter(b => pastIds.has(b.session_id));
      const att = pastB.filter(b => b.status === 'attended').length, ns = pastB.filter(b => b.status === 'noshow').length;
      const occ = pastS.length ? Math.round(pastS.reduce((a, s) => a + e.taken(s.id) / s.cap, 0) / pastS.length * 100) : 0;
      const allB = D.bookings.filter(b => ms(b.created) >= from && ms(b.created) <= now);
      const byCls: Record<string, number> = {};
      pastB.filter(b => ['attended', 'noshow'].includes(b.status)).forEach(b => { const n = e.cls(e.sess(b.session_id)!.cls).name; byCls[n] = (byCls[n] || 0) + 1; });
      const top = Object.entries(byCls).sort((a, b) => b[1] - a[1]).slice(0, 5), mx = top.length ? top[0][1] : 1;
      const passPays = pays.filter(p => p.kind === 'Pass');
      const tiles: [string, string][] = [['Bookings', String(allB.length)], ['Classes run', String(pastS.length)], ['Avg occupancy', occ + '%'], ['Attendance rate', att + ns ? Math.round(att / (att + ns) * 100) + '%' : '—'],
        ['Cancellation rate', allB.length ? Math.round(allB.filter(b => b.status === 'cancelled').length / allB.length * 100) + '%' : '—'], ['New customers', String(D.profiles.filter(u => u.role === 'customer' && ms(u.joined) >= from).length)]];
      const exportCsv = async () => {
        await rpc('log_export', { p_days: period });
        const rows = [['Booking ID', 'Customer', 'Email', 'Class', 'Date', 'Time', 'Instructor', 'Status', 'Method', 'Amount (GBP)']].concat(pastB.map(b => {
          const s = e.sess(b.session_id)!, u = e.user(b.user_id);
          return [b.id, u ? `${u.first} ${u.last}` : '', u?.email || '', e.cls(s.cls).name, s.date, hhmm(s.start_time), e.ins(s.ins).name, b.status, b.method || '', (b.amount / 100).toFixed(2)];
        }));
        download(`sonshine-bookings-last-${period}-days.csv`, rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n'), 'text/csv');
        toast('CSV downloaded.');
      };
      return (
        <div style={{ padding: '16px 16px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', gap: 8 }}>{[7, 30, 90].map(n => <Chip key={n} on={period === n} label={`Last ${n} days`} onClick={() => setPeriod(n)} style={{ flex: 1, height: 36, fontSize: 12, padding: 0 }} />)}</div>
          <div style={{ borderRadius: 16, padding: 18, background: 'var(--brand-gradient)', color: '#fff', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ font: '500 12px/16px var(--font-body)' }}>Net revenue (test mode)</span><span style={{ font: '700 34px/40px var(--font-display)' }}>{gbp(gross - refunds)}</span><span style={{ font: '400 12px/16px var(--font-body)' }}>{gbp(gross)} taken · −{gbp(refunds)} refunded</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {tiles.map(([l, v]) => <div key={l} className="card-sm" style={{ padding: '12px 14px' }}><div style={{ font: '500 12px/16px var(--font-body)', color: 'var(--text-muted)' }}>{l}</div><div style={{ font: '700 24px/30px var(--font-display)', color: 'var(--text-strong)' }}>{v}</div></div>)}
          </div>
          <div className="card-sm" style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', font: '500 13px/20px var(--font-body)', color: 'var(--text-body)' }}><span>Pass sales</span><span style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{passPays.length} · {gbp(passPays.reduce((a, p) => a + p.amount, 0))}</span></div>
          {top.length > 0 && <div className="card-md" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ font: '600 16px/22px var(--font-display)', color: 'var(--text-strong)' }}>Most Popular Classes</span>
            {top.map(([name, n]) => <div key={name} className="col" style={{ gap: 4 }}><div style={{ display: 'flex', justifyContent: 'space-between', font: '500 13px/18px var(--font-body)', color: 'var(--text-body)' }}><span>{name}</span><span>{n}</span></div><div className="bar"><div style={{ width: Math.round(n / mx * 100) + '%' }} /></div></div>)}
          </div>}
          <Button variant="outline" fullWidth onClick={exportCsv}>Export Bookings CSV</Button>
        </div>
      );
    },

    instructors: () => (
      <div style={{ padding: '16px 16px 28px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {D.instructors.map(i => <div key={i.id} className="card-sm" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar initials={i.ini} size={40} />
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}><span className="t-strong14">{i.name}</span><span style={{ font: '400 11px/16px var(--font-body)', color: 'var(--text-muted)' }}>{D.sessions.filter(s => s.ins === i.id && e.start(s) > now && s.status !== 'cancelled').length} upcoming sessions</span></div>
          <Toggle on={i.active} onClick={() => act('set_instructor_active', { p_ins: i.id, p_active: !i.active })} style={{ width: 'auto' }} />
        </div>)}
      </div>
    ),

    settings: () => {
      const S = D.settings;
      const save = (o: Partial<typeof S>) => act('set_settings', { p_cancel_hours: o.cancel_hours ?? S.cancel_hours, p_offer_hours: o.offer_hours ?? S.offer_hours, p_reminders: o.reminders ?? S.reminders });
      return (
        <div style={{ padding: '16px 16px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card-md" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <span className="col"><span style={{ font: '500 14px/20px var(--font-body)', color: 'var(--text-strong)' }}>Cancellation notice</span><span style={{ font: '400 11px/16px var(--font-body)', color: 'var(--text-subtle)' }}>Hours before class for a free cancellation</span></span>
              <Stepper label="cancellation notice" value={`${S.cancel_hours}h`} onDec={() => S.cancel_hours > 0 && save({ cancel_hours: S.cancel_hours - 1 })} onInc={() => S.cancel_hours < 72 && save({ cancel_hours: S.cancel_hours + 1 })} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <span className="col"><span style={{ font: '500 14px/20px var(--font-body)', color: 'var(--text-strong)' }}>Waitlist claim window</span><span style={{ font: '400 11px/16px var(--font-body)', color: 'var(--text-subtle)' }}>Time to claim an offered place</span></span>
              <Stepper label="claim window" value={`${S.offer_hours}h`} onDec={() => S.offer_hours > 1 && save({ offer_hours: S.offer_hours - 1 })} onInc={() => S.offer_hours < 24 && save({ offer_hours: S.offer_hours + 1 })} />
            </div>
            <Toggle on={S.reminders} label="Class reminder emails" onClick={() => save({ reminders: !S.reminders })} />
          </div>
          <div className="card-md" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 6, font: '400 13px/20px var(--font-body)', color: 'var(--text-body)' }}>
            <span style={{ font: '600 16px/22px var(--font-display)', color: 'var(--text-strong)' }}>Studio Details</span><span>{STUDIO.name}</span><span>{STUDIO.address}</span><span>{STUDIO.email}</span><span>Time zone {STUDIO.tz} · Currency {STUDIO.currency}</span>
          </div>
          {me!.role === 'owner' && <Button variant="outline" fullWidth onClick={() => confirm('Reset demonstration data?', 'All bookings, passes, payments and requests are replaced with a fresh demo set built around today. The audit log is kept. Don’t use this once the studio is live.', 'Reset Demo', () => act('reset_demo', {}, 'Demo data reset.'))}>Reset Demo Data</Button>}
        </div>
      );
    },

    audit: () => (
      <div style={{ padding: '16px 16px 28px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {D.audit.slice(0, 60).map(a => <div key={a.id} style={{ background: '#fff', borderRadius: 10, padding: '10px 12px', boxShadow: '0 1px 3px rgba(0,0,0,.06)', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ font: '500 13px/18px var(--font-body)', color: 'var(--text-strong)' }}>{a.action}</span><span style={{ font: '400 11px/16px var(--font-body)', color: 'var(--text-subtle)' }}>{a.actor_label} · {fmtTsT(a.at)}</span>
        </div>)}
      </div>
    )
  };

  // ---------------------------------------------------------------- sheets
  const sheets: Record<string, () => ReactNode> = {
    confirm: () => cf && <>
      <span className="t-sheet">{cf.title}</span>
      <span style={{ font: '400 14px/22px var(--font-body)', color: 'var(--text-body)' }}>{cf.body}</span>
      <Button onClick={() => { setSheet(null); cf.run(); }}>{cf.label}</Button>
      <Button variant="outline" fullWidth onClick={() => setSheet(null)}>Go Back</Button>
    </>,
    booking: () => {
      const b = D.bookings.find(x => x.id === sel), s = b && e.sess(b.session_id); if (!b || !s) return null;
      const u = e.user(b.user_id), x = st(b.status), late = (e.start(s) - now) / 36e5 < D.settings.cancel_hours;
      const pay = b.payment_id ? D.payments.find(p => p.id === b.payment_id) : undefined;
      const run = async (fn: string, args: Record<string, unknown>, ok: (r: Record<string, unknown>) => string) => { setSheet(null); const r = await rpc(fn, args); toast(r.err || ok(r)); };
      return <>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
          <div className="col" style={{ minWidth: 0 }}><span className="t-sheet">{u ? `${u.first} ${u.last}` : 'Customer'}</span><span style={{ font: '400 13px/18px var(--font-body)', color: 'var(--text-muted)', overflowWrap: 'anywhere' }}>{u?.email}</span></div>
          <Pill tone={x} style={{ lineHeight: '22px' }}>{x.label}</Pill>
        </div>
        <div style={{ background: 'var(--surface-alt)', borderRadius: 12, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 4, font: '400 13px/20px var(--font-body)', color: 'var(--text-body)' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{e.cls(s.cls).name}</span><span>{fmtDL(s.date)} · {fmtT(hhmm(s.start_time))} · {e.ins(s.ins).name}</span><span>{e.payLabel(b) || '—'}</span><span style={{ color: 'var(--text-subtle)', fontSize: 11 }}>Ref {pay ? pay.ref : '—'}</span>
        </div>
        {b.status !== 'cancelled' && <>
          {['confirmed', 'attended', 'noshow'].includes(b.status) && <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}><Button variant="outline" fullWidth onClick={() => run('set_attendance', { p_booking: b.id, p_status: 'attended' }, () => 'Marked as attended.')}>Attended</Button></div>
            <div style={{ flex: 1 }}><Button variant="outline" fullWidth onClick={() => run('set_attendance', { p_booking: b.id, p_status: 'noshow' }, () => 'Marked as no-show.')}>No-show</Button></div>
          </div>}
          <span style={{ font: '400 12px/18px var(--font-body)', color: 'var(--text-muted)' }}>{late ? `Inside the ${D.settings.cancel_hours}-hour window — a standard cancellation won’t return credit or payment.` : `Outside the ${D.settings.cancel_hours}-hour window — credit/payment is returned as standard.`}</span>
          <Button variant="outline" fullWidth onClick={() => run('cancel_booking', { p_booking: b.id, p_override: false }, r => (r.restore || r.waitlist ? 'Cancelled — credit/payment returned.' : 'Cancelled — no credit returned (late).'))}>Cancel (Standard Policy)</Button>
          <Button onClick={() => run('cancel_booking', { p_booking: b.id, p_override: true }, () => 'Cancelled with override — credit/payment returned.')}>Cancel &amp; Restore Credit/Refund</Button>
        </>}
        <button onClick={() => { setSheet(null); go('customer', { uid: b.user_id }); }} className="t-link" style={{ padding: 8 }}>View Customer Profile</button>
      </>;
    },
    adjust: () => {
      const p = D.passes.find(x => x.id === sel); if (!p) return null;
      const bal = e.bal(p.id);
      const save = async () => { const r = await rpc('adjust_credits', { p_pass: p.id, p_delta: adj.delta, p_reason: adj.reason }); if (r.err) return setAdj({ ...adj, err: r.err }); setSheet(null); toast('Credits adjusted and logged.'); };
      return <>
        <span className="t-sheet">Adjust Credits</span>
        <span style={{ font: '400 14px/20px var(--font-body)', color: 'var(--text-body)' }}>{e.prod(p.product).name} · current balance {bal}</span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <button className="step" style={{ width: 48, height: 48, borderRadius: 10, fontSize: 20 }} aria-label="Decrease" onClick={() => setAdj({ ...adj, delta: adj.delta - 1 === 0 ? -1 : adj.delta - 1, err: '' })}>−</button>
          <span style={{ font: '700 32px/40px var(--font-display)', color: 'var(--brand-rose)', minWidth: 60, textAlign: 'center' }}>{(adj.delta > 0 ? '+' : '') + adj.delta}</span>
          <button className="step" style={{ width: 48, height: 48, borderRadius: 10, fontSize: 20 }} aria-label="Increase" onClick={() => setAdj({ ...adj, delta: adj.delta + 1 === 0 ? 1 : adj.delta + 1, err: '' })}>+</button>
        </div>
        <span style={{ font: '500 13px/18px var(--font-body)', color: 'var(--text-muted)', textAlign: 'center' }}>New balance: {bal + adj.delta}</span>
        <label className="field">Reason (required)<input className="input" value={adj.reason} onChange={ev => setAdj({ ...adj, reason: ev.target.value, err: '' })} placeholder="e.g. Goodwill — class moved" style={{ fontSize: 15, padding: '0 12px' }} /></label>
        <Err text={adj.err} />
        <Button onClick={save}>Save Adjustment</Button>
      </>;
    }
  };

  const title = TITLES[scr] || '';
  return (
    <Phone mobile={mobile} dark label="Studio Management">
      {isTab && <div style={{ height: 60, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', background: '#0F172A', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><img src={IMG.logo} alt="Sonshine Hollistic" style={{ height: 36, background: '#fff', borderRadius: 8, padding: '3px 6px' }} /><span style={{ font: '600 13px/18px var(--font-body)' }}>Studio</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ font: '500 12px/16px var(--font-body)', color: '#D1D5DB' }}>{meLabel.role}</span><Avatar initials={meLabel.ini} size={34} /></div>
      </div>}
      {!isTab && <BackHeader title={title} onBack={back} dark />}
      <Scroll ref={scrollRef}>{(screens[scr] || Missing)()}</Scroll>
      <Toast text={toastText} />
      <TabBar label="Studio" mobile={mobile} active={scr} onPick={tab} tabs={[
        { key: 'dash', label: 'Dashboard', icon: ICONS.dash }, { key: 'sessions', label: 'Timetable', icon: ICONS.calendar }, { key: 'bookings', label: 'Bookings', icon: ICONS.check },
        { key: 'customers', label: 'Customers', icon: ICONS.people }, { key: 'more', label: 'More', icon: ICONS.more }]} />
      <Sheet open={!!sheet} onClose={() => setSheet(null)} mobile={mobile}>{sheet && sheets[sheet]()}</Sheet>
    </Phone>
  );
}

function Missing() {
  return <div style={{ padding: 24 }} className="t-small">This item is no longer available.</div>;
}
