// Customer app: welcome, sign-in, home, timetable, class details and booking, bookings, passes, profile,
// events, services, team, studio, policy and notifications.
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Button, GlassButton, SmallButton, Avatar } from '../ds';
import { Model, chip } from '../lib/model';
import { useStudio } from '../lib/studio';
import { CATS, MAILTO, MAP_URL, STUDIO, WA_RUTH, WA_SON, st } from '../lib/content';
import { IMG, addDays, download, dt, endT, fmtD, fmtDL, fmtT, fmtTs, fmtTsT, gbp, greetWord, hhmm, img, iso, ms, parseD, todayIso, MON, DOW } from '../lib/format';
import type { Booking, EventRow, Session } from '../lib/types';
import { BackHeader, ClassRowItem, Chip, Err, ICONS, NavRow, Phone, Pill, Rows, Scroll, Sheet, Spinner, LoadError, TabBar, Toast, Toggle, DayStrip, type ClassItem } from '../ui';

type Nav = { screen: string; p: Record<string, string> };
type SheetName = null | 'book' | 'cancel' | 'filters' | 'buy' | 'request' | 'eventBook' | 'del';
type Pending = { screen: string; p: Record<string, string>; sid?: string } | null;

const TABS = ['home', 'timetable', 'bookings', 'passes', 'profile'];
const SUBPAGES = ['events', 'services', 'team', 'studio', 'policy', 'notifs', 'event', 'service', 'instructor'];
const TITLES: Record<string, string> = { cls: 'Class Details', events: 'Workshops & Events', event: 'Event Details', services: 'Specialist Services', service: 'Service', team: 'Meet the Team', instructor: 'Instructor', studio: 'Our Studio', policy: 'Booking & Cancellation', notifs: 'Notifications' };
const card = { ok: 'ok', fail: 'fail' } as const;

// onStaffSignIn: an owner or admin who signs in here is moved to Studio Management instead.
export default function CustomerApp({ sb, mobile, onSwitch, onStaffSignIn }: { sb: SupabaseClient; mobile: boolean; onSwitch?: () => void; onStaffSignIn?: (email: string, pw: string) => Promise<string | null> }) {
  const { user, db, error, rpc, reload } = useStudio(sb, 'customer');
  const [nav, setNav] = useState<Nav>({ screen: '', p: {} });
  const [stack, setStack] = useState<Nav[]>([]);
  const [sheet, setSheet] = useState<SheetName>(null);
  const [toastText, setToastText] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();
  const scrollRef = useRef<HTMLDivElement>(null);

  // timetable, auth, sheet and form state
  const [day, setDay] = useState(todayIso());
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const [fl, setFl] = useState({ ins: '', format: '', level: '' });
  const [btab, setBtab] = useState('upcoming');
  const [authMode, setAuthMode] = useState<'signin' | 'register' | 'reset'>('signin');
  const [form, setForm] = useState({ first: '', last: '', email: '', pw: '', pw2: '', terms: false });
  const [authErr, setAuthErr] = useState('');
  const [authNote, setAuthNote] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [pending, setPending] = useState<Pending>(null);
  const [sheetSid, setSheetSid] = useState('');
  const [sheetBid, setSheetBid] = useState('');
  const [sheetPid, setSheetPid] = useState('');
  const [sheetEid, setSheetEid] = useState('');
  const [sheetSvc, setSheetSvc] = useState('');
  const [bk, setBk] = useState({ opt: 'card', card: 'ok' as string, busy: false, err: '' });
  const [rq, setRq] = useState({ date: '', slot: '', msg: '', err: '', done: false, busy: false });

  const toast = (m: string) => { clearTimeout(toastTimer.current); setToastText(m); toastTimer.current = setTimeout(() => setToastText(''), 3200); };
  const go = (screen: string, p: Record<string, string> = {}) => { setStack(s => [...s, nav]); setNav({ screen, p }); setSheet(null); };
  const tab = (t: string) => { setStack([]); setNav({ screen: t, p: {} }); setSheet(null); };
  const back = () => { const prev = stack[stack.length - 1]; setSheet(null); if (prev) { setStack(stack.slice(0, -1)); setNav(prev); } else setNav({ screen: user ? 'home' : 'welcome', p: {} }); };

  // First screen once we know whether someone is signed in.
  useEffect(() => { if (user !== undefined && !nav.screen) setNav({ screen: user ? 'home' : 'welcome', p: {} }); }, [user, nav.screen]);
  useEffect(() => { scrollRef.current?.scrollTo(0, 0); }, [nav]);
  useEffect(() => {
    const { data } = sb.auth.onAuthStateChange(e => { if (e === 'PASSWORD_RECOVERY') { setAuthMode('reset'); setAuthErr(''); setAuthNote(''); setStack([]); setNav({ screen: 'auth', p: {} }); } });
    return () => data.subscription.unsubscribe();
  }, [sb]);

  const e = useMemo(() => (db ? new Model(db) : null), [db]);
  const uid = user?.id ?? null;
  const me = e && uid ? e.user(uid) : undefined;

  // Resume a booking the guest started before signing in, once their data has loaded.
  useEffect(() => {
    if (!pending || !e || !me) return;
    const p = pending; setPending(null);
    setStack([]); setNav({ screen: p.screen, p: p.p });
    if (p.sid) openBookFor(p.sid);
  });

  if (!e || !nav.screen) {
    return <Phone mobile={mobile} label="Customer App">{error ? <LoadError text={error} onRetry={reload} /> : <Spinner />}</Phone>;
  }

  const now = Date.now();
  const scr = nav.screen, P = nav.p;
  const isTab = TABS.includes(scr);
  const needAuth = (after: Pending) => { setPending(after); setAuthMode('signin'); setAuthErr(''); setAuthNote(''); go('auth'); };

  function openBookFor(sid: string) {
    const s = e!.sess(sid); if (!s || !uid) return;
    const c = e!.cls(s.cls), el = e!.eligible(uid, c);
    setSheetSid(sid); setBk({ opt: el[0] ? 'pass:' + el[0].id : c.price === 0 ? 'free' : 'card', card: 'ok', busy: false, err: '' }); setSheet('book');
  }
  const openBook = (sid: string) => { if (!uid) return needAuth({ screen: scr, p: P, sid }); openBookFor(sid); };
  const joinWait = async (sid: string) => {
    if (!uid) return needAuth({ screen: scr, p: P });
    const r = await rpc('join_waitlist', { p_session: sid });
    toast(r.err || `You’re number ${r.pos} on the waitlist. We’ll notify you if a place opens.`);
  };
  const item = (s: Session, showDate: boolean): ClassItem => {
    const v = e.sv(s, uid);
    return { ...v, showDate, open: () => go('cls', { sid: v.id }), quick: () => (v.full && !v.my ? joinWait(v.id) : openBook(v.id)),
      canQuick: !v.past && !v.cancelled && !v.my && (!v.full || s.waitlist), quickLabel: v.full ? 'Waitlist' : 'Book', booked: !!v.my,
      bookedLabel: v.my ? (v.my.status === 'confirmed' ? '✓ Booked' : v.my.status === 'offered' ? 'Place offered' : v.my.status === 'waitlisted' ? 'Waitlisted' : st(v.my.status).label) : '' };
  };

  const myNotifs = uid ? db!.notifs.filter(n => n.user_id === uid) : [];
  const unread = myNotifs.filter(n => !n.read).length;
  const myBk = uid ? db!.bookings.filter(b => b.user_id === uid && e.sess(b.session_id)) : [];
  const evs = db!.events.filter(x => x.published);
  const evVM = (x: EventRow) => {
    const price = e.evPrice(x), left = x.cap ? x.cap - e.evTaken(x.id) : null;
    return { ...x, img: img(x.img), dateLabel: x.date ? fmtDL(x.date) : 'Dates on enquiry', timeLabel: x.start_time ? `${fmtT(hhmm(x.start_time))} – ${fmtT(hhmm(x.finish_time!))}` : '',
      priceLabel: price == null ? 'Enquire' : price === 0 ? 'Free' : gbp(price), spaces: left == null ? '' : left <= 0 ? 'Fully booked' : `${left} places left`, open: () => go('event', { eid: x.id }) };
  };
  const scopeLabel = (scope: string) => (scope === 'kids' ? 'Kids & Teen classes' : 'All adult classes marked “or pass”');
  const cancelHours = db!.settings.cancel_hours;

  // ---------------------------------------------------------------- auth
  const F = form, fset = (k: keyof typeof form) => (ev: { target: HTMLInputElement }) => { setForm({ ...form, [k]: k === 'terms' ? ev.target.checked : ev.target.value }); setAuthErr(''); };
  const afterAuth = (msg: string) => {
    if (pending) return toast(msg); // the pending effect takes over once data loads
    setStack([]); setNav({ screen: 'home', p: {} }); setForm(f => ({ ...f, pw: '', pw2: '' })); toast(msg);
  };
  const submitSignin = async () => {
    if (!F.email.trim() || !F.pw) return setAuthErr('Please enter your email and password.');
    setAuthBusy(true);
    const { data, error: er } = await sb.auth.signInWithPassword({ email: F.email.trim().toLowerCase(), password: F.pw });
    if (er || !data.user) { setAuthBusy(false); return setAuthErr(/confirm/i.test(er?.message || '') ? 'Please confirm your email address first — check your inbox for the link.' : 'That email and password don’t match an account.'); }
    const { data: prof } = await sb.from('profiles').select('first, active, role').eq('id', data.user.id).single();
    if (prof && !prof.active) { setAuthBusy(false); await sb.auth.signOut(); return setAuthErr('This account has been deactivated. Please contact the studio.'); }
    if (prof && prof.role !== 'customer' && onStaffSignIn) {
      const err = await onStaffSignIn(F.email.trim().toLowerCase(), F.pw);
      await sb.auth.signOut(); setAuthBusy(false); setForm(f => ({ ...f, pw: '', pw2: '' }));
      setStack([]); setNav({ screen: 'welcome', p: {} });
      if (err) return setAuthErr(err);
      return;
    }
    setAuthBusy(false);
    afterAuth(`Welcome back${prof?.first ? ', ' + prof.first : ''}`);
  };
  const submitRegister = async () => {
    const em = F.email.trim().toLowerCase();
    if (!F.first.trim() || !F.last.trim()) return setAuthErr('Please enter your first and last name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return setAuthErr('Please enter a valid email address.');
    if (F.pw.length < 8) return setAuthErr('Your password needs at least 8 characters.');
    if (F.pw !== F.pw2) return setAuthErr('Those passwords don’t match.');
    if (!F.terms) return setAuthErr('Please accept the terms and privacy policy to continue.');
    setAuthBusy(true);
    const { data, error: er } = await sb.auth.signUp({ email: em, password: F.pw, options: { data: { first: F.first.trim(), last: F.last.trim() }, emailRedirectTo: location.origin + location.pathname } });
    setAuthBusy(false);
    if (er) return setAuthErr(/registered|exists/i.test(er.message) ? 'An account with this email already exists — try signing in.' : er.message);
    if (data.user && data.user.identities && data.user.identities.length === 0) return setAuthErr('An account with this email already exists — try signing in.');
    if (!data.session) { setAuthMode('signin'); setAuthNote(`Nearly there — we’ve emailed a confirmation link to ${em}. Open it, then sign in here.`); return; }
    afterAuth('Account created — welcome!');
  };
  const forgot = async () => {
    const em = F.email.trim().toLowerCase();
    if (!em) return setAuthErr('Enter your email address above, then tap “Forgotten your password?”.');
    await sb.auth.resetPasswordForEmail(em, { redirectTo: location.origin + location.pathname });
    setAuthErr(''); setAuthNote('If an account exists for that email, we’ve sent a password reset link.');
  };
  const submitReset = async () => {
    if (F.pw.length < 8) return setAuthErr('Your password needs at least 8 characters.');
    if (F.pw !== F.pw2) return setAuthErr('Those passwords don’t match.');
    setAuthBusy(true);
    const { error: er } = await sb.auth.updateUser({ password: F.pw });
    setAuthBusy(false);
    if (er) return setAuthErr(er.message);
    setAuthMode('signin'); afterAuth('Password updated.');
  };
  const signOut = async () => { await sb.auth.signOut(); setStack([]); setSheet(null); setNav({ screen: 'welcome', p: {} }); };

  // ---------------------------------------------------------------- screens
  const screens: Record<string, () => ReactNode> = {
    welcome: () => (
      <div style={{ position: 'relative', flex: 1, minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: '#111827' }}>
        <img src={IMG.hero} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,.25) 0%,rgba(0,0,0,.6) 45%,rgba(0,0,0,.88) 100%)' }} />
        <div style={{ position: 'relative', padding: '0 24px 40px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <img src={IMG.logo} alt="Sonshine Hollistic" style={{ width: 132, background: '#fff', borderRadius: 12, padding: '8px 12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,.2)' }} />
          <h1 style={{ margin: 0, font: '700 36px/42px var(--font-display)', color: '#fff', textWrap: 'pretty' as never }}>Livingston’s Premier Boutique Yoga Studio</h1>
          <p style={{ margin: 0, font: '400 16px/24px var(--font-body)', color: '#fff' }}>Book classes, manage your passes and explore sound healing, reiki and workshops at Barden House.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 6 }}>
            <Button onClick={() => { setAuthMode('register'); setAuthErr(''); setAuthNote(''); go('auth'); }}>Create an Account</Button>
            <GlassButton onClick={() => { setAuthMode('signin'); setAuthErr(''); setAuthNote(''); go('auth'); }} style={{ width: '100%' }}>Sign In</GlassButton>
            <button onClick={() => tab('home')} style={{ border: 'none', background: 'none', color: '#fff', font: '500 15px/24px var(--font-body)', textDecoration: 'underline', cursor: 'pointer', padding: 10 }}>Browse the timetable as a guest</button>
          </div>
        </div>
      </div>
    ),

    auth: () => (
      <div style={{ padding: '20px 20px 40px', display: 'flex', flexDirection: 'column', gap: 18, background: '#fff', flex: 1 }}>
        {authMode !== 'reset' && <div role="tablist" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, background: 'var(--surface-sunken)', borderRadius: 10, padding: 4 }}>
          {(['signin', 'register'] as const).map(m => { const c = chip(authMode === m); return (
            <button key={m} role="tab" aria-selected={authMode === m} onClick={() => { setAuthMode(m); setAuthErr(''); setAuthNote(''); }} style={{ height: 40, border: 'none', borderRadius: 8, cursor: 'pointer', font: '600 14px/20px var(--font-body)', background: c.bg, color: c.fg }}>{m === 'signin' ? 'Sign In' : 'Create Account'}</button>); })}
        </div>}
        {authMode === 'signin' && <div className="col" style={{ gap: 16 }}>
          <div><h1 className="t-h1" style={{ marginBottom: 4 }}>Welcome Back</h1><p className="t-lead" style={{ color: 'var(--text-muted)' }}>Sign in to book classes and manage your passes.</p></div>
          <label className="field">Email address<input className="input" type="email" autoComplete="email" value={F.email} onChange={fset('email')} /></label>
          <label className="field">Password<input className="input" type="password" autoComplete="current-password" value={F.pw} onChange={fset('pw')} onKeyDown={ev => ev.key === 'Enter' && submitSignin()} /></label>
          <button onClick={forgot} className="t-link" style={{ alignSelf: 'flex-start', padding: 0 }}>Forgotten your password?</button>
          <Err text={authErr} />
          {authNote && <div role="status" className="note">{authNote}</div>}
          <Button onClick={submitSignin} disabled={authBusy}>{authBusy ? 'Signing in…' : 'Sign In'}</Button>
        </div>}
        {authMode === 'register' && <div className="col" style={{ gap: 14 }}>
          <div><h1 className="t-h1" style={{ marginBottom: 4 }}>Join Our Community</h1><p className="t-lead" style={{ color: 'var(--text-muted)' }}>Whether you’re a seasoned yogi or stepping onto the mat for the first time.</p></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <label className="field">First name<input className="input" style={{ padding: '0 12px' }} autoComplete="given-name" value={F.first} onChange={fset('first')} /></label>
            <label className="field">Last name<input className="input" style={{ padding: '0 12px' }} autoComplete="family-name" value={F.last} onChange={fset('last')} /></label>
          </div>
          <label className="field">Email address<input className="input" type="email" autoComplete="email" value={F.email} onChange={fset('email')} /></label>
          <label className="field">Password<input className="input" type="password" autoComplete="new-password" value={F.pw} onChange={fset('pw')} /><span className="t-meta">At least 8 characters</span></label>
          <label className="field">Confirm password<input className="input" type="password" autoComplete="new-password" value={F.pw2} onChange={fset('pw2')} /></label>
          <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', font: '400 14px/20px var(--font-body)', color: 'var(--text-body)', cursor: 'pointer' }}>
            <input type="checkbox" checked={F.terms} onChange={fset('terms')} style={{ width: 20, height: 20, accentColor: '#EC0F8C', margin: 0, flex: 'none' }} />
            <span>I agree to the Terms and Privacy Policy. Marketing emails are optional and can be chosen later.</span>
          </label>
          <Err text={authErr} />
          <Button onClick={submitRegister} disabled={authBusy}>{authBusy ? 'Creating account…' : 'Create Account'}</Button>
        </div>}
        {authMode === 'reset' && <div className="col" style={{ gap: 16 }}>
          <div><h1 className="t-h1" style={{ marginBottom: 4 }}>Choose a New Password</h1><p className="t-lead" style={{ color: 'var(--text-muted)' }}>Enter a new password for your account.</p></div>
          <label className="field">New password<input className="input" type="password" autoComplete="new-password" value={F.pw} onChange={fset('pw')} /><span className="t-meta">At least 8 characters</span></label>
          <label className="field">Confirm password<input className="input" type="password" autoComplete="new-password" value={F.pw2} onChange={fset('pw2')} /></label>
          <Err text={authErr} />
          <Button onClick={submitReset} disabled={authBusy}>Save Password</Button>
        </div>}
      </div>
    ),

    home: () => {
      const upcomingMine = myBk.filter(b => b.status === 'confirmed' && e.start(e.sess(b.session_id)!) > now).sort((a, b) => e.start(e.sess(a.session_id)!) - e.start(e.sess(b.session_id)!));
      const nb = upcomingMine[0];
      const next = nb ? (() => { const s = e.sess(nb.session_id)!, v = e.sv(s, uid); return { name: v.name, date: fmtDL(s.date), time: `${v.time} – ${v.endTime}`, ins: v.insName, loc: e.loc(s), pay: e.payLabel(nb), open: () => go('cls', { sid: s.id }) }; })() : null;
      const ap = uid ? e.activePasses(uid).sort((a, b) => ms(a.expires) - ms(b.expires)) : [];
      const mp = ap[0];
      const tiles: [string, string, () => void][] = [[IMG.bowl, 'Sound Healing & Reiki', () => go('services')], [IMG.heroClasses, 'Meet the Team', () => go('team')], [IMG.kids, 'Kids & Teens', () => { setCat('Kids & Teens'); tab('timetable'); }], [IMG.exterior, 'Our Studio', () => go('studio')]];
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28, padding: '20px 0 32px' }}>
          <div style={{ padding: '0 20px' }} className="col">
            <span style={{ font: '500 13px/20px var(--font-body)', color: 'var(--text-subtle)' }}>{fmtDL(todayIso())}</span>
            <h1 className="t-h1">{me ? `${greetWord()}, ${me.first}` : 'Welcome to Sonshine Hollistic'}</h1>
          </div>
          {user && !user.email_confirmed_at && <div className="card-md" style={{ margin: '0 20px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span className="t-strong14">Please verify your email address</span><span style={{ font: '400 13px/18px var(--font-body)', color: 'var(--text-muted)' }}>We’ve sent a link to {user.email}.</span>
            <div><SmallButton tone="outline" onClick={async () => { await sb.auth.resend({ type: 'signup', email: user.email! }); toast('Verification email sent.'); }}>Resend</SmallButton></div>
          </div>}
          {!uid && <div style={{ margin: '0 20px', borderRadius: 16, overflow: 'hidden', position: 'relative', minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', boxShadow: '0 20px 25px -5px rgba(0,0,0,.1)' }}>
            <img src={IMG.mats} alt="The studio at Barden House" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,.1),rgba(0,0,0,.8))' }} />
            <div style={{ position: 'relative', padding: 20, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ font: '700 22px/28px var(--font-display)', color: '#fff' }}>Find your class, book in seconds</span>
              <GlassButton onClick={() => tab('timetable')}>View Class Timetable</GlassButton>
            </div>
          </div>}
          {next && <div className="gradient-card" style={{ margin: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ alignSelf: 'flex-start', font: '600 11px/18px var(--font-body)', letterSpacing: '.08em', textTransform: 'uppercase', background: 'rgba(255,255,255,.2)', borderRadius: 6, padding: '2px 8px' }}>Your Next Class</span>
            <span style={{ font: '700 24px/30px var(--font-display)' }}>{next.name}</span>
            <div className="col" style={{ gap: 2, font: '400 14px/20px var(--font-body)' }}><span style={{ fontWeight: 600 }}>{next.date} · {next.time}</span><span>with {next.ins} · {next.loc}</span><span>✓ Confirmed · {next.pay}</span></div>
            <GlassButton onClick={next.open} style={{ alignSelf: 'flex-start', marginTop: 4 }}>View Booking</GlassButton>
          </div>}
          {!next && uid && <div className="card-lg" style={{ margin: '0 20px', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ font: '600 20px/28px var(--font-display)', color: 'var(--brand-rose)' }}>Nothing booked yet</span>
            <span className="t-small">Whether you want to chill out or work out, we have a class for you.</span>
            <Button onClick={() => tab('timetable')}>View Class Timetable</Button>
          </div>}
          {mp && <div onClick={() => tab('passes')} role="button" tabIndex={0} className="card-lg" style={{ margin: '0 20px', padding: 16, display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--surface-blush-strong)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
              <span style={{ font: '700 24px/26px var(--font-display)', color: 'var(--brand-rose)' }}>{e.bal(mp.id)}</span><span style={{ font: '500 10px/12px var(--font-body)', color: 'var(--brand-rose-ink)' }}>left</span>
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ font: '600 16px/22px var(--font-body)', color: 'var(--text-strong)' }}>{e.prod(mp.product).name}</span>
              <div className="bar"><div style={{ width: Math.round(e.bal(mp.id) / mp.total * 100) + '%' }} /></div>
              <span className="t-meta">{e.bal(mp.id)} of {mp.total} classes · expires {fmtTs(mp.expires)} {ap.length > 1 ? `+ ${ap.length - 1} more pass${ap.length > 2 ? 'es' : ''}` : ''}</span>
            </div>
          </div>}
          {uid && !mp && <div className="card-lg" style={{ margin: '0 20px', padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div className="col" style={{ gap: 2 }}><span style={{ font: '600 15px/22px var(--font-body)', color: 'var(--text-strong)' }}>No active class pass</span><span style={{ font: '400 13px/18px var(--font-body)', color: 'var(--text-muted)' }}>Save on regular classes with a pass.</span></div>
            <SmallButton tone="rose" onClick={() => tab('passes')}>View Passes</SmallButton>
          </div>}
          <div className="col" style={{ gap: 12 }}>
            <SectionHead title="Coming Up" action="Full Timetable" onAction={() => tab('timetable')} />
            <div className="hscroll" style={{ gap: 12, padding: '4px 20px 16px', scrollSnapType: 'x mandatory' }}>
              {e.futureSessions().slice(0, 8).map(s => { const u = item(s, true); return (
                <div key={u.id} onClick={u.open} role="button" tabIndex={0} className="card" style={{ width: 200, flex: 'none', overflow: 'hidden', cursor: 'pointer', scrollSnapAlign: 'start', display: 'flex', flexDirection: 'column' }}>
                  <img src={u.img} alt="" style={{ width: '100%', height: 96, objectFit: 'cover' }} />
                  <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                    <span style={{ font: '600 12px/16px var(--font-body)', color: 'var(--brand-rose)' }}>{u.dateLabel} · {u.time}</span>
                    <span className="t-card">{u.name}</span>
                    <span className="t-muted12">with {u.insName}</span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 6 }}>
                      <span style={{ font: '500 12px/20px var(--font-body)', padding: '0 8px', borderRadius: 6, background: u.spaceBg, color: u.spaceFg }}>{u.spaceLabel}</span>
                      {u.booked && <span style={{ font: '600 12px/16px var(--font-body)', color: 'var(--brand-rose)' }}>{u.bookedLabel}</span>}
                    </div>
                  </div>
                </div>); })}
            </div>
          </div>
          {evs.length > 0 && <div className="col" style={{ gap: 12 }}>
            <SectionHead title="Workshops & Events" action="See All" onAction={() => go('events')} />
            <div className="hscroll" style={{ gap: 12, padding: '4px 20px 16px' }}>
              {evs.map(evVM).map(ev => (
                <div key={ev.id} onClick={ev.open} role="button" tabIndex={0} style={{ width: 280, height: 170, flex: 'none', borderRadius: 16, overflow: 'hidden', position: 'relative', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(0,0,0,.1)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <img src={ev.img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,0) 20%,rgba(0,0,0,.85))' }} />
                  <div style={{ position: 'relative', padding: 14, display: 'flex', flexDirection: 'column', gap: 2, color: '#fff' }}>
                    <span style={{ font: '600 12px/16px var(--font-body)' }}>{ev.dateLabel}</span><span style={{ font: '700 18px/23px var(--font-display)' }}>{ev.name}</span><span style={{ font: '500 12px/16px var(--font-body)' }}>{ev.priceLabel} · {ev.host}</span>
                  </div>
                </div>))}
            </div>
          </div>}
          <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2 className="t-h2">Discover Your Practice</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {tiles.map(([src, label, act]) => (
                <button key={label} onClick={act} style={{ height: 120, border: 'none', borderRadius: 12, overflow: 'hidden', position: 'relative', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'flex-end', boxShadow: '0 4px 6px -1px rgba(0,0,0,.1)' }}>
                  <img src={src} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,.75))' }} />
                  <span style={{ position: 'relative', padding: 12, font: '700 16px/20px var(--font-display)', color: '#fff', textAlign: 'left' }}>{label}</span>
                </button>))}
            </div>
          </div>
          <div className="card-md" style={{ margin: '0 20px', display: 'flex', flexDirection: 'column' }}>
            <NavRow label="Location & Directions" onClick={() => go('studio')} />
            <NavRow label="Booking & Cancellation Policy" onClick={() => go('policy')} />
            <div style={{ padding: '14px 16px', display: 'flex', flexWrap: 'wrap', gap: 8, borderTop: '1px solid var(--border-default)' }}>
              <SmallButton tone="whatsapp" href={WA_SON} target="_blank">WhatsApp Son</SmallButton><SmallButton tone="whatsapp" href={WA_RUTH} target="_blank">WhatsApp Ruth</SmallButton>
            </div>
          </div>
        </div>
      );
    },

    timetable: () => {
      const ql = q.trim().toLowerCase(), nF = (fl.ins ? 1 : 0) + (fl.format ? 1 : 0) + (fl.level ? 1 : 0);
      const match = (s: Session) => {
        const c = e.cls(s.cls), ins = e.ins(s.ins);
        if (cat !== 'All' && c.cat !== cat) return false; if (fl.ins && s.ins !== fl.ins) return false;
        if (fl.format && !(s.format === fl.format || (s.format === 'Hybrid' && fl.format !== 'Hybrid'))) return false; if (fl.level && c.level !== fl.level) return false;
        if (ql && !(c.name + ' ' + ins.name + ' ' + c.cat + ' ' + c.descr).toLowerCase().includes(ql)) return false; return true;
      };
      const list = db!.sessions.filter(s => (ql ? e.start(s) > now - 36e5 : s.date === day) && match(s)).sort((a, b) => e.start(a) - e.start(b));
      const fb = chip(nF > 0), hasAny = cat !== 'All' || nF > 0 || !!ql;
      return (
        <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: 28 }}>
          <div style={{ background: '#fff', padding: '16px 0 12px', display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 1px 2px rgba(0,0,0,.05)' }}>
            <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" style={{ position: 'absolute', left: 12, top: 13 }} aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
                <input type="search" aria-label="Search classes and instructors" placeholder="Search classes or instructors" value={q} onChange={ev => setQ(ev.target.value)} className="input sm" style={{ paddingLeft: 38 }} />
              </div>
              <button onClick={() => setSheet('filters')} style={{ height: 44, padding: '0 14px', borderRadius: 8, border: `1px solid ${fb.bd}`, background: fb.bg, color: fb.fg, font: '600 14px/20px var(--font-body)', cursor: 'pointer', whiteSpace: 'nowrap' }}>{nF ? `Filters · ${nF}` : 'Filters'}</button>
            </div>
            <DayStrip days={e.days(day, uid, setDay)} pad={20} />
            <div className="hscroll" style={{ padding: '2px 20px' }}>
              {['All', ...CATS].map(l => <Chip key={l} on={cat === l} label={l === 'All' ? 'All Classes' : l} onClick={() => setCat(l)} />)}
            </div>
          </div>
          <div style={{ margin: '16px 20px 0', background: 'var(--brand-rose)', borderRadius: '8px 8px 0 0', padding: '10px 16px', font: '700 16px/24px var(--font-display)', color: '#fff', letterSpacing: '.02em' }}>
            {ql ? `RESULTS FOR “${q.trim().toUpperCase()}”` : fmtDL(day).toUpperCase()}
          </div>
          <div style={{ margin: '0 20px', background: 'var(--surface-cream)', borderRadius: '0 0 12px 12px', padding: 12, display: 'flex', flexDirection: 'column', gap: 10, boxShadow: '0 4px 6px -1px rgba(0,0,0,.08)' }}>
            {list.map(s => <ClassRowItem key={s.id} it={item(s, !!ql)} />)}
            {list.length === 0 && <div style={{ padding: '28px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
              <span style={{ font: '600 18px/24px var(--font-display)', color: 'var(--text-heading)' }}>Nothing here</span>
              <span className="t-small">{ql ? 'No upcoming classes match your search.' : cat !== 'All' || nF ? 'No classes match these filters on this day.' : 'There are no classes scheduled on this day.'}</span>
              {hasAny && <SmallButton tone="outline" onClick={resetFilters}>Clear Filters</SmallButton>}
            </div>}
          </div>
        </div>
      );
    },

    cls: () => {
      const s = e.sess(P.sid); if (!s) return <Missing />;
      const v = e.sv(s, uid), c = v.c, my = v.my, hrs = (e.start(s) - now) / 36e5;
      const waitPos = my && my.status === 'waitlisted' ? e.waitPos(my) : 0;
      const booked = !!my && my.status === 'confirmed';
      const link = db!.links[s.id];
      let label = 'Book This Class', act: () => void = () => openBook(s.id), dis = false, note = c.price === 0 ? 'Free' : c.pass ? gbp(c.price) + ' or 1 pass credit' : gbp(c.price);
      if (v.cancelled) { label = 'Session Cancelled'; dis = true; }
      else if (v.past) { label = hrs > -s.dur / 60 ? 'Class Has Started' : 'Class Finished'; dis = true; }
      else if (booked) { label = 'Cancel Booking'; act = () => { setSheetBid(my!.id); setSheet('cancel'); }; note = 'You’re booked'; }
      else if (my && my.status === 'offered') { label = 'Claim Your Place'; }
      else if (my && my.status === 'waitlisted') { label = 'Leave Waitlist'; act = async () => { const r = await rpc('cancel_booking', { p_booking: my.id }); toast(r.err || 'You’ve left the waitlist.'); }; note = 'On the waitlist'; }
      else if (v.full) { if (s.waitlist) { label = 'Join Waitlist'; act = () => joinWait(s.id); note = 'Class is full'; } else { label = 'Fully Booked'; dis = true; } }
      const outline = !!my && ['confirmed', 'waitlisted'].includes(my.status);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
          <div style={{ position: 'relative', height: 220, flex: 'none' }}>
            <img src={v.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,0) 40%,rgba(0,0,0,.7))' }} />
            <span style={{ position: 'absolute', left: 20, bottom: 16, font: '600 12px/20px var(--font-body)', textTransform: 'uppercase', letterSpacing: '.06em', color: '#fff', background: 'var(--brand-rose)', borderRadius: 6, padding: '2px 10px' }}>{c.cat}</span>
          </div>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 18, flex: 1 }}>
            <div className="col" style={{ gap: 10 }}>
              <h1 className="t-h1">{v.name}</h1>
              <button onClick={() => go('instructor', { iid: s.ins })} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 10, border: 'none', background: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
                <Avatar initials={v.insIni} size={40} />
                <span className="col"><span style={{ font: '600 15px/20px var(--font-body)', color: 'var(--text-strong)' }}>with {v.insName}</span><span style={{ font: '400 12px/16px var(--font-body)', color: 'var(--brand-rose)' }}>{v.ins.role} ›</span></span>
              </button>
            </div>
            {booked && <div role="status" className="blush" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}><span style={{ font: '600 15px/22px var(--font-body)', color: 'var(--brand-rose-ink)' }}>✓ You’re booked on this class</span><span style={{ font: '400 13px/18px var(--font-body)', color: 'var(--text-body)' }}>{e.payLabel(my!)}</span></div>}
            {my && ['waitlisted', 'offered'].includes(my.status) && <div role="status" className="blush" style={{ padding: '14px 16px', font: '500 14px/20px var(--font-body)', color: 'var(--brand-rose-ink)' }}>
              {my.status === 'waitlisted' ? `You’re number ${waitPos} on the waitlist.` : `A place has opened for you — claim it by ${fmtTsT(my.offer_until!)}.`}</div>}
            <Rows cols={2} rows={[['Date', fmtDL(s.date)], ['Time', `${v.time} – ${v.endTime}`], ['Where', e.loc(s)], ['Format', `${v.format} · ${v.durLabel}`], ['Level', v.level], ['Availability', v.spaceLabel]]} />
            <div className="col" style={{ gap: 6 }}><span style={{ font: '500 12px/16px var(--font-body)', color: 'var(--text-subtle)' }}>{v.taken} of {s.cap} places booked</span><div className="bar"><div style={{ width: v.pct }} /></div></div>
            <div className="col" style={{ gap: 8 }}><h2 className="t-rose">About This Class</h2><p className="t-body">{c.descr}</p></div>
            <div className="col" style={{ gap: 8 }}><h2 className="t-rose">Accessibility</h2><p className="t-body" style={{ fontSize: 14, lineHeight: '22px' }}>{c.access || 'Please let your instructor know about any injuries or conditions before class. Accessibility details for this class are to be confirmed by the studio.'}</p></div>
            {s.format !== 'In studio' && <div className="card-md" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ font: '600 15px/22px var(--font-body)', color: 'var(--text-strong)' }}>Joining online</span>
              {booked && link ? <><a href={link} target="_blank" rel="noopener noreferrer" style={{ font: '600 14px/20px var(--font-body)', wordBreak: 'break-all' }}>{link}</a><span className="t-meta">Only visible to customers with a confirmed booking.</span></>
                : <span style={{ font: '400 13px/20px var(--font-body)', color: 'var(--text-muted)' }}>Your private joining link appears here once your booking is confirmed.</span>}
            </div>}
            <div className="blush" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ font: '600 15px/22px var(--font-body)', color: 'var(--brand-rose)' }}>Price &amp; Passes</span>
              <span style={{ font: '400 14px/20px var(--font-body)', color: 'var(--text-body)' }}>{c.price === 0 ? 'Free class' : `${gbp(c.price)} drop-in`} · {c.pass ? 'Included in adult class passes' : c.cat === 'Kids & Teens' ? 'Included in the Kids Term Pass' : 'Not included in class passes — paid separately'}</span>
              <span style={{ font: '600 15px/22px var(--font-body)', color: 'var(--brand-rose)', marginTop: 6 }}>Cancellation</span>
              <span style={{ font: '400 13px/20px var(--font-body)', color: 'var(--text-body)' }}>Cancel at least {cancelHours} hours before the class starts to have your pass credit returned or your payment refunded. Later cancellations aren’t refunded, though exceptions are at management’s discretion.</span>
            </div>
          </div>
          <div className="sticky-bar" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ flex: 'none', maxWidth: 120, font: '700 16px/20px var(--font-body)', color: 'var(--brand-rose)' }}>{note}</div>
            <div style={{ flex: 1 }}>
              {dis ? <div aria-disabled="true" className="disabled-bar">{label}</div> : outline ? <Button variant="outline" fullWidth onClick={act}>{label}</Button> : <Button onClick={act}>{label}</Button>}
            </div>
          </div>
        </div>
      );
    },

    confirm: () => {
      const b = db!.bookings.find(x => x.id === P.bid); const s = b && e.sess(b.session_id); if (!b || !s) return <Missing />;
      const c = e.cls(s.cls), pay = b.payment_id ? db!.payments.find(p => p.id === b.payment_id) : undefined, link = db!.links[s.id];
      const pass = b.pass_id ? db!.passes.find(p => p.id === b.pass_id) : undefined, start = hhmm(s.start_time);
      const addCal = () => {
        const f = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z', a = new Date(e.start(s)), z = new Date(a.getTime() + s.dur * 6e4);
        download('sonshine-' + c.id + '.ics', ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Sonshine Hollistic//Booking//EN', 'BEGIN:VEVENT', 'UID:' + b.id + '@sonshinehollistic.co.uk', 'DTSTAMP:' + f(new Date()), 'DTSTART:' + f(a), 'DTEND:' + f(z), 'SUMMARY:' + c.name + ' with ' + e.ins(s.ins).name, 'LOCATION:' + (s.format === 'Online' ? 'Online' : STUDIO.address), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n'), 'text/calendar');
      };
      return (
        <div style={{ padding: '36px 20px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center', background: '#fff', flex: 1 }}>
          <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'var(--surface-blush-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#EC0F8C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></div>
          <h1 role="status" style={{ margin: 0, font: '700 30px/36px var(--font-display)', color: 'var(--text-strong)' }}>You’re Booked!</h1>
          <p className="t-lead" style={{ color: 'var(--text-muted)' }}>We can’t wait to see you on the mat.</p>
          <div className="card" style={{ width: '100%', textAlign: 'left', padding: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ font: '600 20px/26px var(--font-display)', color: 'var(--brand-rose)' }}>{c.name}</span>
            <span className="t-strong14">{fmtDL(s.date)} · {fmtT(start)} – {fmtT(endT(start, s.dur))}</span>
            <span style={{ font: '400 14px/20px var(--font-body)', color: 'var(--text-body)' }}>with {e.ins(s.ins).name} · {e.loc(s)}</span>
            <div style={{ height: 1, background: 'var(--border-default)', margin: '4px 0' }} />
            <span style={{ font: '400 13px/20px var(--font-body)', color: 'var(--text-body)' }}>{b.method === 'pass' && pass ? `1 credit used · ${e.bal(pass.id)} left on your ${e.prod(pass.product).name}` : b.method === 'card' ? `${gbp(b.amount)} paid by card (test mode)` : 'Free — no payment taken'}</span>
            <span className="t-meta">Reference {pay ? pay.ref : b.id.slice(0, 8).toUpperCase()}</span>
            {s.format !== 'In studio' && link && <a href={link} target="_blank" rel="noopener noreferrer" style={{ font: '600 13px/20px var(--font-body)', wordBreak: 'break-all' }}>Joining link: {link}</a>}
          </div>
          <div className="blush" style={{ width: '100%', textAlign: 'left', padding: '12px 14px', font: '400 13px/20px var(--font-body)', color: 'var(--text-body)' }}>Need to cancel? Do it from My Bookings at least {cancelHours} hours before the class to have your {b.method === 'pass' ? 'credit returned' : 'payment refunded'}.</div>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            <Button onClick={() => tab('bookings')}>View My Bookings</Button>
            <Button variant="outline" fullWidth onClick={addCal}>Add to Calendar</Button>
            <button onClick={() => tab('timetable')} className="t-link" style={{ fontSize: 15 }}>Book Another Class</button>
          </div>
        </div>
      );
    },

    bookings: () => {
      const groups: Record<string, Booking[]> = {
        upcoming: myBk.filter(b => b.status === 'confirmed' && e.start(e.sess(b.session_id)!) > now),
        waitlist: myBk.filter(b => ['waitlisted', 'offered'].includes(b.status) && e.start(e.sess(b.session_id)!) > now),
        past: myBk.filter(b => ['attended', 'noshow'].includes(b.status) || (b.status === 'confirmed' && e.start(e.sess(b.session_id)!) <= now)),
        cancelled: myBk.filter(b => b.status === 'cancelled')
      };
      const myEv = uid ? db!.eventBookings.filter(b => b.user_id === uid && b.status === 'confirmed') : [];
      const myReq = uid ? db!.requests.filter(r => r.user_id === uid) : [];
      const sorted = groups[btab].slice().sort((a, b) => (btab === 'past' || btab === 'cancelled' ? -1 : 1) * (e.start(e.sess(a.session_id)!) - e.start(e.sess(b.session_id)!)));
      const evList = btab === 'upcoming' ? myEv.map(b => ({ b, x: db!.events.find(z => z.id === b.event_id) })).filter(r => r.x && r.x.date) : [];
      const reqList = btab === 'upcoming' ? myReq : [];
      const empty = !!uid && sorted.length === 0 && evList.length === 0 && reqList.length === 0;
      return (
        <div style={{ padding: '20px 20px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h1 className="t-h1">My Bookings</h1>
          {!uid && <SignInCard title="Sign in to see your bookings" text="Your upcoming classes, waitlists and history live here." onSignIn={startSignin} />}
          {uid && <>
            <div className="hscroll" style={{ margin: '0 -20px', padding: '0 20px' }}>
              {[['upcoming', 'Upcoming'], ['waitlist', 'Waitlist'], ['past', 'Past'], ['cancelled', 'Cancelled']].map(([k, l]) => { const n = groups[k].length + (k === 'upcoming' ? myEv.length : 0); return <Chip key={k} on={btab === k} label={`${l}${n ? ' · ' + n : ''}`} onClick={() => setBtab(k)} style={{ height: 36 }} />; })}
            </div>
            {sorted.map(b => {
              const s = e.sess(b.session_id)!, c = e.cls(s.cls), d = parseD(s.date), stt = b.status === 'confirmed' && e.start(s) <= now ? st('completed') : st(b.status);
              const canCancel = b.status === 'confirmed' && e.start(s) > now, open = () => go('cls', { sid: s.id });
              return (
                <div key={b.id} className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div onClick={open} role="button" tabIndex={0} style={{ display: 'flex', gap: 14, cursor: 'pointer' }}>
                    <DateBadge dow={DOW[d.getDay()]} day={d.getDate()} mon={MON[d.getMonth()].toUpperCase()} />
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span className="t-card">{c.name}</span>
                      <span style={{ font: '400 13px/18px var(--font-body)', color: 'var(--text-muted)' }}>{fmtT(hhmm(s.start_time))} · {s.dur} min · with {e.ins(s.ins).name}</span>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 2, alignItems: 'center' }}>
                        <Pill tone={stt}>{stt.label}</Pill>{b.method && <span style={{ font: '400 11px/20px var(--font-body)', color: 'var(--text-subtle)' }}>{e.payLabel(b)}</span>}
                        {s.status === 'cancelled' && <span style={{ font: '400 11px/20px var(--font-body)', color: 'var(--text-subtle)' }}>Class cancelled by studio</span>}
                      </div>
                    </div>
                  </div>
                  {b.status === 'waitlisted' && <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <span style={{ font: '500 13px/18px var(--font-body)', color: 'var(--text-body)' }}>Number {e.waitPos(b)} on the waitlist</span>
                    <SmallButton tone="outline" onClick={async () => { const r = await rpc('cancel_booking', { p_booking: b.id }); toast(r.err || 'You’ve left the waitlist.'); }}>Leave Waitlist</SmallButton>
                  </div>}
                  {b.status === 'offered' && <div className="blush" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, borderRadius: 8, padding: '8px 10px' }}>
                    <span style={{ font: '600 13px/18px var(--font-body)', color: 'var(--brand-rose-ink)' }}>A place is free! {b.offer_until ? `Claim by ${fmtTsT(b.offer_until)}` : ''}</span>
                    <SmallButton tone="rose" onClick={() => openBook(s.id)}>Claim Place</SmallButton>
                  </div>}
                  {canCancel && <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <SmallButton tone="outline" onClick={() => { setSheetBid(b.id); setSheet('cancel'); }}>Cancel</SmallButton>
                    <SmallButton onClick={open}>Details</SmallButton>
                  </div>}
                </div>
              );
            })}
            {evList.map(({ b, x }) => { const d = parseD(x!.date!); return (
              <div key={b.id} onClick={() => go('event', { eid: x!.id })} role="button" tabIndex={0} className="card-lg" style={{ padding: 14, display: 'flex', gap: 14, cursor: 'pointer' }}>
                <div style={{ width: 56, height: 64, flex: 'none', borderRadius: 10, background: 'var(--brand-gradient)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <span style={{ font: '700 22px/26px var(--font-display)' }}>{d.getDate()}</span><span style={{ font: '600 10px/12px var(--font-body)' }}>{MON[d.getMonth()].toUpperCase()}</span>
                </div>
                <div className="col" style={{ gap: 3 }}>
                  <span style={{ font: '600 11px/14px var(--font-body)', color: 'var(--brand-rose)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Event</span>
                  <span className="t-card">{x!.name}</span>
                  <span style={{ font: '400 13px/18px var(--font-body)', color: 'var(--text-muted)' }}>{fmtT(hhmm(x!.start_time!))} – {fmtT(hhmm(x!.finish_time!))} · {b.amount ? `${gbp(b.amount)} paid (test)` : 'Free'}</span>
                </div>
              </div>); })}
            {reqList.length > 0 && <>
              <h2 className="t-rose" style={{ marginTop: 8 }}>Appointment Requests</h2>
              {reqList.map(r => { const t = st(r.status), name = r.enquiry || e.svc(r.service)?.name || r.service; return (
                <div key={r.id} className="card-md" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ font: '600 15px/22px var(--font-body)', color: 'var(--text-strong)' }}>{name}</span>
                  <span style={{ font: '400 13px/18px var(--font-body)', color: 'var(--text-muted)' }}>{r.slot === 'Enquiry' ? 'Enquiry sent ' + fmtD(r.date) : `Preferred: ${fmtD(r.date)} · ${r.slot}`}</span>
                  <Pill tone={t}>{t.label}</Pill>
                </div>); })}
            </>}
            {empty && <div className="card-md" style={{ padding: '28px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
              <span style={{ font: '600 18px/24px var(--font-display)', color: 'var(--text-heading)' }}>{({ upcoming: 'You have no upcoming classes booked.', waitlist: 'You’re not on any waitlists.', past: 'Your class history will appear here.', cancelled: 'No cancelled bookings.' } as Record<string, string>)[btab]}</span>
              <SmallButton tone="rose" onClick={() => tab('timetable')}>Browse Timetable</SmallButton>
            </div>}
          </>}
        </div>
      );
    },

    passes: () => {
      const mine = uid ? db!.passes.filter(p => p.user_id === uid) : [];
      const wallet = mine.filter(p => ms(p.expires) > now && e.bal(p.id) > 0);
      const old = mine.filter(p => !(ms(p.expires) > now && e.bal(p.id) > 0));
      const ledger = mine.flatMap(p => db!.ledger.filter(l => l.pass_id === p.id)).sort((a, b) => ms(b.at) - ms(a.at)).slice(0, 12);
      return (
        <div style={{ padding: '20px 20px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h1 className="t-h1">My Passes</h1>
          {wallet.map(p => { const pr = e.prod(p.product), b = e.bal(p.id); return (
            <div key={p.id} className="gradient-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div className="col" style={{ gap: 2 }}><span style={{ font: '700 22px/28px var(--font-display)' }}>{pr.name}{p.comp ? ' (complimentary)' : ''}</span><span style={{ font: '400 13px/18px var(--font-body)' }}>{scopeLabel(pr.scope)}</span></div>
                <div style={{ textAlign: 'right' }}><div style={{ font: '700 36px/38px var(--font-display)' }}>{b}</div><div style={{ font: '500 12px/16px var(--font-body)' }}>of {p.total} left</div></div>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,.3)', overflow: 'hidden' }}><div style={{ height: '100%', width: Math.round(b / p.total * 100) + '%', background: '#fff' }} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', font: '500 12px/16px var(--font-body)' }}><span>Bought {fmtTs(p.purchased)}</span><span>Expires {fmtTs(p.expires)}</span></div>
            </div>); })}
          {uid && wallet.length === 0 && <div className="card-md" style={{ padding: 18, font: '400 14px/20px var(--font-body)', color: 'var(--text-muted)' }}>You don’t have an active pass. Choose one below to save on regular classes.</div>}
          <h2 className="t-h2" style={{ marginTop: 6 }}>Buy a Pass</h2>
          {db!.products.filter(p => p.on_sale).map(p => (
            <div key={p.id} className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}><span style={{ font: '600 20px/26px var(--font-display)', color: 'var(--text-heading)' }}>{p.name}</span><span style={{ font: '700 22px/28px var(--font-display)', color: 'var(--brand-rose)' }}>{gbp(p.price)}</span></div>
              <span style={{ font: '400 14px/20px var(--font-body)', color: 'var(--text-body)' }}>{p.descr}</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <span className="tag" style={{ lineHeight: '22px', background: 'var(--surface-blush)', color: 'var(--brand-rose-ink)' }}>{p.credits} classes</span>
                <span className="tag" style={{ lineHeight: '22px', background: 'var(--surface-sunken)', color: 'var(--text-body)' }}>Valid {p.weeks} weeks from purchase</span>
                <span className="tag" style={{ lineHeight: '22px', background: 'var(--surface-sunken)', color: 'var(--text-body)' }}>{gbp(Math.round(p.price / p.credits))} per class</span>
              </div>
              <span className="t-meta">Valid for: {scopeLabel(p.scope)}</span>
              <Button onClick={() => { if (!uid) return needAuth({ screen: 'passes', p: {} }); setSheetPid(p.id); setBk({ opt: 'card', card: 'ok', busy: false, err: '' }); setSheet('buy'); }}>Buy {p.name}</Button>
            </div>))}
          {ledger.length > 0 && <>
            <h2 className="t-h2" style={{ marginTop: 6 }}>Credit History</h2>
            <div className="card-md col">
              {ledger.map(l => <div key={l.id} className="listrow" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
                <div className="col" style={{ minWidth: 0 }}><span style={{ font: '500 14px/20px var(--font-body)', color: 'var(--text-strong)' }}>{l.reason}</span><span className="t-meta">{fmtTs(l.at)}</span></div>
                <span style={{ font: '700 15px/20px var(--font-body)', color: l.delta > 0 ? '#166534' : '#374151', flex: 'none' }}>{(l.delta > 0 ? '+' : '') + l.delta}</span>
              </div>)}
            </div>
          </>}
          {old.length > 0 && <>
            <h2 style={{ margin: '6px 0 0', font: '600 18px/24px var(--font-display)', color: 'var(--text-muted)' }}>Expired &amp; Used</h2>
            {old.map(p => <div key={p.id} style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div className="col"><span style={{ font: '600 14px/20px var(--font-body)', color: 'var(--text-muted)' }}>{e.prod(p.product).name}</span><span className="t-meta">{ms(p.expires) <= now ? 'Expired ' + fmtTs(p.expires) : 'All credits used'}</span></div>
              <span style={{ font: '400 12px/20px var(--font-body)', color: 'var(--text-subtle)' }}>{p.total - e.bal(p.id)} of {p.total} used</span>
            </div>)}
          </>}
        </div>
      );
    },

    profile: () => {
      const delRequested = !!uid && db!.deleteRequests.some(d => d.user_id === uid);
      return (
        <div style={{ padding: '20px 20px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {!me && <div className="card-lg" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ font: '700 22px/28px var(--font-display)', color: 'var(--text-heading)' }}>Join Sonshine Hollistic</span>
            <span className="t-small">Create an account to book classes, buy passes and request appointments.</span>
            <Button onClick={startRegister}>Create an Account</Button>
            <Button variant="outline" fullWidth onClick={startSignin}>Sign In</Button>
          </div>}
          {me && <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Avatar initials={(me.first[0] + me.last[0]).toUpperCase()} size={64} />
              <div className="col" style={{ gap: 2, minWidth: 0 }}><span style={{ font: '700 24px/30px var(--font-display)', color: 'var(--text-strong)' }}>{me.first} {me.last}</span><span className="t-small" style={{ overflowWrap: 'anywhere' }}>{me.email}</span><span className="t-meta">Member since {fmtTs(me.joined)}</span></div>
            </div>
            <div className="card-md col">
              <span className="t-caps" style={{ padding: '14px 16px 6px' }}>Notifications</span>
              <Toggle on={me.reminders} label="Class reminders" sub="Booking confirmations are always sent" onClick={() => rpc('update_my_prefs', { p_reminders: !me.reminders, p_marketing: me.marketing })} style={{ minHeight: 56, padding: '8px 16px', borderBottom: '1px solid var(--border-default)' }} />
              <Toggle on={me.marketing} label="News & offers" sub="Workshops, events and studio news" onClick={() => rpc('update_my_prefs', { p_reminders: me.reminders, p_marketing: !me.marketing })} style={{ minHeight: 56, padding: '8px 16px' }} />
            </div>
          </>}
          <div className="card-md col">
            <span className="t-caps" style={{ padding: '14px 16px 6px' }}>Studio</span>
            <NavRow label="Workshops & Events" onClick={() => go('events')} />
            <NavRow label="Sound Healing, Reiki & 1:1" onClick={() => go('services')} />
            <NavRow label="Meet the Team" onClick={() => go('team')} />
            <NavRow label="Location & Contact" onClick={() => go('studio')} />
            <NavRow label="Booking & Cancellation Policy" onClick={() => go('policy')} />
          </div>
          {onSwitch && <button onClick={onSwitch} className="t-quiet">Studio staff? Open Studio Management</button>}
          {me && <>
            <Button variant="outline" fullWidth onClick={signOut}>Sign Out</Button>
            {delRequested && <span style={{ font: '400 13px/18px var(--font-body)', color: 'var(--text-subtle)', textAlign: 'center' }}>Account deletion requested — we’ll confirm by email.</span>}
            <button onClick={() => setSheet('del')} className="t-quiet" style={{ textDecoration: 'underline' }}>Request account deletion</button>
          </>}
        </div>
      );
    },

    events: () => (
      <div style={{ padding: '20px 20px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p className="t-lead">Sound baths, special workshops and teacher training at Barden House.</p>
        {evs.map(evVM).map(ev => (
          <div key={ev.id} onClick={ev.open} role="button" tabIndex={0} className="card" style={{ overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
            <img src={ev.img} alt="" style={{ width: '100%', height: 150, objectFit: 'cover' }} />
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ font: '600 12px/16px var(--font-body)', color: 'var(--brand-rose)' }}>{ev.dateLabel}</span>
              <span style={{ font: '600 19px/25px var(--font-display)', color: 'var(--text-heading)' }}>{ev.name}</span>
              {ev.sub && <span style={{ font: '500 13px/18px var(--font-body)', color: 'var(--text-body)' }}>{ev.sub}</span>}
              <span style={{ font: '400 13px/18px var(--font-body)', color: 'var(--text-muted)' }}>with {ev.host}</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}><span style={{ font: '700 16px/22px var(--font-body)', color: 'var(--brand-rose)' }}>{ev.priceLabel}</span><span style={{ font: '500 12px/16px var(--font-body)', color: 'var(--text-subtle)' }}>{ev.spaces}</span></div>
            </div>
          </div>))}
        {evs.length === 0 && <span className="t-small">No workshops are listed right now — check back soon.</span>}
      </div>
    ),

    event: () => {
      const x = db!.events.find(z => z.id === P.eid); if (!x) return <Missing />;
      const v = evVM(x), price = e.evPrice(x), mineB = !!uid && db!.eventBookings.some(b => b.event_id === x.id && b.user_id === uid && b.status === 'confirmed');
      const closed = !!x.deadline && now > dt(x.deadline, '23:59').getTime(), full = !!x.cap && e.evTaken(x.id) >= x.cap;
      const early = x.early != null && price === x.early;
      const priceLine = price == null ? 'Pricing on enquiry' : price === 0 ? 'Free' : gbp(price);
      let label = price === 0 ? 'Book My Place' : 'Book & Pay ' + (price != null ? gbp(price) : ''), dis = false;
      let act = () => { if (!uid) return needAuth({ screen: 'event', p: P }); setSheetEid(x.id); setBk({ opt: 'card', card: 'ok', busy: false, err: '' }); setSheet('eventBook'); };
      if (x.kind === 'enquire') { label = 'Enquire About This Training'; act = () => { if (!uid) return needAuth({ screen: 'event', p: P }); setSheetSvc('enquiry:' + x.id); setRq({ date: '', slot: '', msg: '', err: '', done: false, busy: false }); setSheet('request'); }; }
      else if (mineB) { label = 'You’re Booked ✓'; dis = true; } else if (closed) { label = 'Bookings Closed'; dis = true; } else if (full) { label = 'Fully Booked'; dis = true; }
      return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
          <img src={v.img} alt="" style={{ width: '100%', height: 220, objectFit: 'cover', flex: 'none' }} />
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
            <div className="col" style={{ gap: 4 }}><h1 className="t-h1s">{x.name}</h1>{x.sub && <span style={{ font: '500 15px/22px var(--font-body)', color: 'var(--brand-rose)' }}>{x.sub}</span>}</div>
            {mineB && <div role="status" className="blush" style={{ padding: '12px 16px', font: '600 14px/20px var(--font-body)', color: 'var(--brand-rose-ink)' }}>✓ You have a place at this event</div>}
            <Rows rows={[['When', `${v.dateLabel} ${v.timeLabel}`], ['Where', x.venue], ['Led by', x.host],
              ['Price', <>{priceLine} <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>{v.spaces}</span>{early && <div style={{ font: '500 12px/16px var(--font-body)', color: 'var(--brand-rose)' }}>Early-bird price until {fmtD(x.early_until!)} (then {gbp(x.price!)})</div>}</>]]} />
            <p className="t-body">{x.descr}</p>
            {x.info && <p className="t-body" style={{ fontSize: 14, lineHeight: '22px' }}>{x.info}</p>}
            <div className="blush" style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 4, font: '400 13px/20px var(--font-body)', color: 'var(--text-body)' }}>
              {x.deadline && <span style={{ fontWeight: 600, color: 'var(--brand-rose-ink)' }}>Book by {fmtDL(x.deadline)}</span>}
              <span>Event places follow their own policy — please contact the studio if you can no longer attend.</span>
            </div>
          </div>
          <div className="sticky-bar">{dis ? <div aria-disabled="true" className="disabled-bar">{label}</div> : <Button onClick={act}>{label}</Button>}</div>
        </div>
      );
    },

    services: () => (
      <div style={{ padding: '20px 20px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p className="t-lead">One-to-one treatments to nourish body, mind and soul. Send a request and we’ll be in touch to arrange a time.</p>
        {db!.services.map(s => (
          <div key={s.id} onClick={() => go('service', { svc: s.id })} role="button" tabIndex={0} className="card-lg" style={{ overflow: 'hidden', cursor: 'pointer', display: 'flex' }}>
            <img src={img(s.img)} alt="" style={{ width: 110, objectFit: 'cover', flex: 'none' }} />
            <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
              <span style={{ font: '600 18px/23px var(--font-display)', color: 'var(--text-heading)' }}>{s.name}</span>
              <span className="t-muted12">with {s.practitioner} · {s.duration}</span>
              <span style={{ font: '600 13px/18px var(--font-body)', color: 'var(--brand-rose)', marginTop: 4 }}>{s.price_label}</span>
            </div>
          </div>))}
      </div>
    ),

    service: () => {
      const s = e.svc(P.svc); if (!s) return <Missing />;
      return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
          <img src={img(s.img)} alt="" style={{ width: '100%', height: 220, objectFit: 'cover', flex: 'none' }} />
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
            <h1 className="t-h1s">{s.name}</h1>
            <Rows rows={[['With', s.practitioner], ['Duration', s.duration], ['Price', s.price_label, 'var(--brand-rose)'], ['Where', s.location]]} />
            <p className="t-body">{s.descr}</p>
            <p className="t-body" style={{ fontSize: 14, lineHeight: '22px' }}>{s.prep}</p>
            {s.caution && <div className="warn" style={{ fontSize: 13 }}><strong>Please note:</strong> {s.caution}</div>}
          </div>
          <div className="sticky-bar"><Button onClick={() => { if (!uid) return needAuth({ screen: 'service', p: P }); setSheetSvc(s.id); setRq({ date: '', slot: '', msg: '', err: '', done: false, busy: false }); setSheet('request'); }}>Request an Appointment</Button></div>
        </div>
      );
    },

    team: () => (
      <div style={{ padding: '20px 20px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p className="t-lead" style={{ marginBottom: 4 }}>Our welcoming team of instructors, here to support you every step of the way.</p>
        {db!.instructors.filter(i => i.active).map(i => (
          <div key={i.id} onClick={() => go('instructor', { iid: i.id })} role="button" tabIndex={0} className="card-md" style={{ padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'center', cursor: 'pointer' }}>
            <Avatar initials={i.ini} size={48} />
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ font: '600 17px/22px var(--font-display)', color: 'var(--text-heading)' }}>{i.name}</span><span style={{ font: '400 12px/16px var(--font-body)', color: 'var(--brand-rose)' }}>{i.role}</span></div>
            <span style={{ color: 'var(--brand-rose)', font: '400 20px/20px var(--font-body)' }}>›</span>
          </div>))}
      </div>
    ),

    instructor: () => {
      const i = e.ins(P.iid), ss = e.futureSessions().filter(s => s.ins === i.id).slice(0, 6).map(s => item(s, true));
      return (
        <div style={{ padding: '24px 20px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
            <Avatar initials={i.ini} size={88} /><h1 className="t-h1s">{i.name}</h1><span style={{ font: '500 14px/20px var(--font-body)', color: 'var(--brand-rose)' }}>{i.role}</span>
          </div>
          <p className="t-body" style={{ textAlign: 'center' }}>{i.bio}</p>
          <h2 className="t-rose" style={{ marginTop: 8 }}>Upcoming Classes</h2>
          {ss.map(it => <ClassRowItem key={it.id} it={it} />)}
          {ss.length === 0 && <span className="t-small">No classes scheduled in the next two weeks.</span>}
        </div>
      );
    },

    studio: () => (
      <div className="col">
        <img src={IMG.exterior} alt="Barden House, Livingston" style={{ width: '100%', height: 200, objectFit: 'cover' }} />
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h1 className="t-h1s">Barden House, Livingston</h1>
          <p className="t-body">Our serene studio sanctuary in the heart of West Lothian — a welcoming space to breathe, move and connect.</p>
          <div className="card-lg" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ font: '500 12px/16px var(--font-body)', color: 'var(--text-subtle)' }}>Address</span><span className="t-strong14">{STUDIO.address}</span>
            <Button variant="outline" fullWidth href={MAP_URL} target="_blank">Get Directions</Button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <img src={IMG.mats} alt="The studio" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 12 }} />
            <img src={IMG.buddha} alt="Studio details" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 12 }} />
          </div>
          <div className="card-lg" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ font: '600 18px/24px var(--font-display)', color: 'var(--brand-rose)' }}>Get in Touch</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}><SmallButton tone="whatsapp" href={WA_SON} target="_blank">WhatsApp Son</SmallButton><SmallButton tone="whatsapp" href={WA_RUTH} target="_blank">WhatsApp Ruth</SmallButton></div>
            <a href={MAILTO} style={{ font: '500 14px/20px var(--font-body)' }}>{STUDIO.email}</a>
          </div>
        </div>
      </div>
    ),

    policy: () => (
      <div style={{ padding: '20px 20px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[['Cancelling a Class', `Cancel at least ${cancelHours} hours before your class starts and your pass credit is returned or your card payment refunded. Later cancellations and no-shows aren’t refunded — exceptions are at management’s discretion, so do get in touch if something has come up.`],
          ['Waitlists', `When a full class has a cancellation, the first person on the waitlist is offered the place and has ${db!.settings.offer_hours} hours to claim it before it passes to the next person.`],
          ['Class Passes', 'Passes are valid from the date of purchase for the period shown and can’t be extended. Pregnancy yoga, workshops and events are paid separately.'],
          ['If We Cancel', 'If the studio has to cancel a class, everyone booked is notified and their credit or payment is returned in full.']].map(([h, t]) => (
          <div key={h} className="card-lg" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ font: '600 20px/26px var(--font-display)', color: 'var(--brand-rose)' }}>{h}</span>
            <span style={{ font: '400 14px/22px var(--font-body)', color: 'var(--text-body)' }}>{t}</span>
          </div>))}
        <span style={{ font: '400 12px/18px var(--font-body)', color: 'var(--text-subtle)' }}>Policy wording is a draft for the studio to confirm.</span>
      </div>
    ),

    notifs: () => (
      <div style={{ padding: '16px 20px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {myNotifs.slice(0, 30).map(n => <div key={n.id} className="card-sm" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ font: '400 14px/20px var(--font-body)', color: 'var(--text-strong)' }}>{n.text}</span><span className="t-meta">{fmtTsT(n.at)}</span>
        </div>)}
        {myNotifs.length === 0 && <span className="t-small" style={{ textAlign: 'center', padding: 24 }}>You’re all caught up.</span>}
      </div>
    )
  };

  function resetFilters() { setCat('All'); setFl({ ins: '', format: '', level: '' }); setQ(''); }
  function startSignin() { setAuthMode('signin'); setAuthErr(''); setAuthNote(''); go('auth'); }
  function startRegister() { setAuthMode('register'); setAuthErr(''); setAuthNote(''); go('auth'); }

  // ---------------------------------------------------------------- sheets
  const TestCard = ({ value, set }: { value: string; set: (c: string) => void }) => (
    <div style={{ background: 'var(--surface-alt)', borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ font: '600 12px/16px var(--font-body)', color: 'var(--text-body)' }}>Test card (demo checkout)</span>
      <div style={{ display: 'flex', gap: 8 }}>
        {([['ok', '4242 · succeeds'], ['fail', '0002 · declines']] as const).map(([k, l]) => { const c = chip(value === k); return (
          <button key={k} onClick={() => set(card[k])} aria-pressed={value === k} style={{ flex: 1, height: 40, borderRadius: 8, border: `1px solid ${c.bd}`, background: c.bg, color: c.fg, font: '500 12px/16px var(--font-body)', cursor: 'pointer' }}>{l}</button>); })}
      </div>
    </div>
  );
  const pickCard = (c: string) => setBk(b => ({ ...b, card: c, err: '' }));

  const sheets: Record<string, () => ReactNode> = {
    book: () => {
      const s = e.sess(sheetSid); if (!s || !uid) return null;
      const c = e.cls(s.cls), el = e.eligible(uid, c), start = hhmm(s.start_time);
      const opts = el.map(p => ({ key: 'pass:' + p.id, label: e.prod(p.product).name, sub: `Uses 1 credit · ${e.bal(p.id)} left · expires ${fmtTs(p.expires)}` }));
      opts.push(c.price === 0 ? { key: 'free', label: 'Free class', sub: 'No payment needed' } : { key: 'card', label: `Pay ${gbp(c.price)} by card`, sub: 'Secure hosted checkout · TEST MODE' });
      const confirm = async () => {
        if (bk.busy) return;
        setBk(b => ({ ...b, busy: true, err: '' }));
        const method = bk.opt.startsWith('pass:') ? 'pass' : bk.opt;
        const r = await rpc('book_class', { p_session: s.id, p_method: method, p_pass: method === 'pass' ? bk.opt.slice(5) : null, p_card: bk.card });
        if (r.err) return setBk(b => ({ ...b, busy: false, err: r.err! }));
        setBk(b => ({ ...b, busy: false })); setSheet(null); setStack(st => [...st, nav]); setNav({ screen: 'confirm', p: { bid: String(r.booking_id) } });
      };
      return <div className="col" style={{ gap: 14 }}>
        <div className="col" style={{ gap: 4 }}><span className="t-sheet">{c.name}</span><span style={{ font: '500 14px/20px var(--font-body)', color: 'var(--text-body)' }}>{fmtDL(s.date)} · {fmtT(start)} – {fmtT(endT(start, s.dur))}</span><span style={{ font: '400 13px/18px var(--font-body)', color: 'var(--text-muted)' }}>with {e.ins(s.ins).name} · {e.loc(s)}</span></div>
        <span className="t-caps">How would you like to pay?</span>
        {opts.map(o => { const on = bk.opt === o.key; return (
          <button key={o.key} onClick={() => setBk(b => ({ ...b, opt: o.key, err: '' }))} aria-pressed={on} style={{ display: 'flex', gap: 12, alignItems: 'center', textAlign: 'left', padding: 14, borderRadius: 12, border: `${on ? 2 : 1}px solid ${on ? '#EC0F8C' : '#E5E7EB'}`, background: '#fff', cursor: 'pointer' }}>
            <span style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${on ? '#EC0F8C' : '#E5E7EB'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: on ? '#EC0F8C' : '#fff' }} /></span>
            <span className="col"><span style={{ font: '600 15px/20px var(--font-body)', color: 'var(--text-strong)' }}>{o.label}</span><span className="t-muted12">{o.sub}</span></span>
          </button>); })}
        {e.activePasses(uid).length > 0 && !el.length && <span style={{ font: '400 13px/18px var(--font-body)', color: 'var(--text-muted)' }}>Your current passes don’t cover this class.</span>}
        {bk.opt === 'card' && <TestCard value={bk.card} set={pickCard} />}
        <Err text={bk.err} />
        <span className="t-meta">Free cancellation up to {cancelHours} hours before the class.</span>
        <Button onClick={confirm} disabled={bk.busy}>{bk.busy ? 'Processing…' : bk.opt === 'card' ? `Confirm & Pay ${gbp(c.price)}` : 'Confirm Booking'}</Button>
      </div>;
    },
    cancel: () => {
      const b = db!.bookings.find(x => x.id === sheetBid), s = b && e.sess(b.session_id); if (!b || !s) return null;
      const c = e.cls(s.cls), hrs = (e.start(s) - now) / 36e5, late = hrs < cancelHours;
      const what = b.method === 'pass' ? 'your pass credit will be returned' : b.method === 'card' ? `your ${gbp(b.amount)} payment will be refunded (test mode)` : 'your place will be released';
      const msg = late ? `This class starts in ${hrs < 1 ? 'under an hour' : Math.floor(hrs) + ' hour' + (Math.floor(hrs) === 1 ? '' : 's')}, inside the ${cancelHours}-hour notice period, so ${b.method === 'pass' ? 'your credit won’t be returned' : b.method === 'card' ? 'your payment won’t be refunded' : 'no refund applies'}. If something has come up, WhatsApp Son or Ruth — exceptions are at management’s discretion.`
        : `You’re cancelling more than ${cancelHours} hours before the class, so ${what}.`;
      const confirm = async () => {
        const r = await rpc('cancel_booking', { p_booking: b.id }); setSheet(null);
        toast(r.err || (r.restore ? 'Booking cancelled — ' + (b.method === 'pass' ? 'credit returned.' : b.method === 'card' ? 'refund issued (test).' : 'place released.') : 'Booking cancelled. No credit returned (late cancellation).'));
      };
      return <div className="col" style={{ gap: 14 }}>
        <span className="t-sheet">Cancel this booking?</span>
        <div className="col" style={{ gap: 2 }}><span style={{ font: '600 15px/22px var(--font-body)', color: 'var(--text-strong)' }}>{c.name}</span><span className="t-small">{fmtDL(s.date)} · {fmtT(hhmm(s.start_time))}</span></div>
        <div className={late ? 'warn' : 'blush'} style={late ? undefined : { padding: '12px 14px', font: '400 14px/20px var(--font-body)', color: 'var(--text-body)' }}>{msg}</div>
        <Button onClick={confirm}>Yes, Cancel Booking</Button>
        <Button variant="outline" fullWidth onClick={() => setSheet(null)}>Keep My Place</Button>
      </div>;
    },
    filters: () => {
      const fpick = (k: keyof typeof fl, v: string) => () => setFl(f => ({ ...f, [k]: f[k] === v ? '' : v }));
      const levels = [...new Set(db!.classes.map(c => c.level))];
      const group = (title: string, items: [string, string][], k: keyof typeof fl) => <>
        <span className="t-caps">{title}</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{items.map(([v, l]) => <Chip key={v} on={fl[k] === v} label={l} onClick={fpick(k, v)} style={{ height: 36 }} />)}</div>
      </>;
      return <div className="col" style={{ gap: 14 }}>
        <span className="t-sheet">Filter Classes</span>
        {group('Instructor', db!.instructors.filter(i => i.active).map(i => [i.id, i.name]), 'ins')}
        {group('Format', ['In studio', 'Online', 'Hybrid'].map(f => [f, f]), 'format')}
        {group('Level', levels.map(l => [l, l]), 'level')}
        <div style={{ display: 'flex', gap: 10, marginTop: 6 }}><div style={{ flex: 1 }}><Button variant="outline" fullWidth onClick={resetFilters}>Clear</Button></div><div style={{ flex: 1 }}><Button onClick={() => setSheet(null)}>Show Classes</Button></div></div>
      </div>;
    },
    buy: () => {
      const p = e.prod(sheetPid); if (!p) return null;
      const confirm = async () => {
        if (bk.busy) return; setBk(b => ({ ...b, busy: true, err: '' }));
        const r = await rpc('buy_pass', { p_product: p.id, p_card: bk.card });
        if (r.err) return setBk(b => ({ ...b, busy: false, err: r.err! }));
        setBk(b => ({ ...b, busy: false })); setSheet(null); toast(`${p.name} added — ${p.credits} credits ready to use.`);
      };
      return <div className="col" style={{ gap: 14 }}>
        <span className="t-sheet">{p.name}</span>
        <div className="blush" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ font: '700 26px/32px var(--font-display)', color: 'var(--brand-rose)' }}>{gbp(p.price)}</span>
          <span style={{ font: '500 14px/20px var(--font-body)', color: 'var(--text-body)' }}>{p.credits} classes · Valid for {p.weeks} weeks from today</span>
          <span className="t-muted12">Valid for: {scopeLabel(p.scope)}</span>
        </div>
        <TestCard value={bk.card} set={pickCard} />
        <Err text={bk.err} />
        <Button onClick={confirm} disabled={bk.busy}>{bk.busy ? 'Verifying payment…' : `Pay ${gbp(p.price)}`}</Button>
        <span className="t-meta" style={{ textAlign: 'center' }}>Credits are added once payment is confirmed. Test mode — no money is taken.</span>
      </div>;
    },
    eventBook: () => {
      const x = db!.events.find(z => z.id === sheetEid); if (!x || !x.date) return null;
      const price = e.evPrice(x) || 0;
      const confirm = async () => {
        if (bk.busy) return; setBk(b => ({ ...b, busy: true, err: '' }));
        const r = await rpc('book_event', { p_event: x.id, p_card: bk.card });
        if (r.err) return setBk(b => ({ ...b, busy: false, err: r.err! }));
        setBk(b => ({ ...b, busy: false })); setSheet(null); toast('You’re booked onto ' + x.name + '.');
      };
      return <div className="col" style={{ gap: 14 }}>
        <span className="t-sheet">{x.name}</span>
        <span style={{ font: '500 14px/20px var(--font-body)', color: 'var(--text-body)' }}>{fmtDL(x.date)} · {fmtT(hhmm(x.start_time!))} – {fmtT(hhmm(x.finish_time!))}</span>
        {price > 0 && <TestCard value={bk.card} set={pickCard} />}
        <Err text={bk.err} />
        <Button onClick={confirm} disabled={bk.busy}>{bk.busy ? 'Processing…' : price > 0 ? `Pay ${gbp(price)}` : 'Confirm Place'}</Button>
      </div>;
    },
    request: () => {
      const isEnq = sheetSvc.startsWith('enquiry:');
      const name = isEnq ? db!.events.find(x => x.id === sheetSvc.slice(8))?.name : e.svc(sheetSvc)?.name;
      const t = new Date(); t.setHours(0, 0, 0, 0);
      const submit = async () => {
        if (rq.busy) return;
        if (isEnq && !rq.msg.trim()) return setRq({ ...rq, err: 'Please add a short message.' });
        if (!isEnq && (!rq.date || !rq.slot)) return setRq({ ...rq, err: 'Please choose a preferred date and time of day.' });
        setRq({ ...rq, busy: true, err: '' });
        const r = isEnq ? await rpc('enquire_event', { p_event: sheetSvc.slice(8), p_msg: rq.msg })
          : await rpc('request_service', { p_service: sheetSvc, p_date: rq.date, p_slot: rq.slot, p_msg: rq.msg });
        setRq(x => ({ ...x, busy: false, err: r.err || '', done: !r.err }));
      };
      if (rq.done) return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center', padding: '10px 0' }}>
        <span className="t-sheet">Request Sent</span>
        <span style={{ font: '400 14px/20px var(--font-body)', color: 'var(--text-body)' }}>Thank you — we’ll be in touch to confirm a time. You can see your request in My Bookings.</span>
        <Button onClick={() => setSheet(null)}>Done</Button>
      </div>;
      return <div className="col" style={{ gap: 14 }}>
        <span className="t-sheet">{name}</span>
        {!isEnq && <>
          <span className="t-caps">Preferred date</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{Array.from({ length: 10 }, (_, i) => iso(addDays(t, i + 1))).map(ds => <Chip key={ds} on={rq.date === ds} label={fmtD(ds)} onClick={() => setRq({ ...rq, date: ds, err: '' })} style={{ height: 36, padding: '0 12px' }} />)}</div>
          <span className="t-caps">Time of day</span>
          <div style={{ display: 'flex', gap: 8 }}>{['Morning', 'Afternoon', 'Evening'].map(l => { const c = chip(rq.slot === l); return <button key={l} onClick={() => setRq({ ...rq, slot: l, err: '' })} aria-pressed={rq.slot === l} style={{ flex: 1, height: 40, borderRadius: 8, border: `1px solid ${c.bd}`, background: c.bg, color: c.fg, font: '500 13px/20px var(--font-body)', cursor: 'pointer' }}>{l}</button>; })}</div>
        </>}
        <label className="field">Message<textarea className="input" rows={3} value={rq.msg} onChange={ev => setRq({ ...rq, msg: ev.target.value })} placeholder={isEnq ? 'What would you like to know?' : 'Anything we should know?'} /></label>
        <Err text={rq.err} />
        <Button onClick={submit} disabled={rq.busy}>{rq.busy ? 'Sending…' : 'Send Request'}</Button>
        <span className="t-meta" style={{ textAlign: 'center' }}>This is a request, not a confirmed booking. No payment is taken now.</span>
      </div>;
    },
    del: () => <div className="col" style={{ gap: 14 }}>
      <span className="t-sheet">Delete your account?</span>
      <span style={{ font: '400 14px/22px var(--font-body)', color: 'var(--text-body)' }}>We’ll remove your personal details. Payment records we’re legally required to keep are retained in anonymised form. Unused pass credits will be lost.</span>
      <Button onClick={async () => { await rpc('request_account_deletion'); setSheet(null); toast('Request received — we’ll confirm by email.'); }}>Request Deletion</Button>
      <Button variant="outline" fullWidth onClick={() => setSheet(null)}>Keep My Account</Button>
    </div>
  };

  // ---------------------------------------------------------------- chrome
  const title = scr === 'service' ? e.svc(P.svc)?.name || 'Service' : scr === 'instructor' ? e.ins(P.iid).name : scr === 'auth' ? (authMode === 'register' ? 'Create Account' : authMode === 'reset' ? 'Reset Password' : 'Sign In') : TITLES[scr] || '';
  const showTabs = isTab || SUBPAGES.includes(scr);
  const openNotifs = async () => { go('notifs'); if (unread) await rpc('mark_notifications_read'); };

  return (
    <Phone mobile={mobile} label="Customer App">
      {isTab && <div style={{ height: 60, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px 0 16px', background: 'rgba(255,255,255,.9)', backdropFilter: 'blur(8px)', boxShadow: '0 1px 2px rgba(0,0,0,.05)', position: 'relative', zIndex: 2 }}>
        <img src={IMG.logo} alt="Sonshine Hollistic" style={{ height: 44 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {!uid && <SmallButton tone="rose" onClick={startSignin}>Sign In</SmallButton>}
          {uid && <button onClick={openNotifs} aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`} className="iconbtn" style={{ position: 'relative', color: 'var(--text-strong)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 01-3.4 0" /></svg>
            {unread > 0 && <span style={{ position: 'absolute', top: 6, right: 5, minWidth: 18, height: 18, borderRadius: 9, background: 'var(--brand-rose)', color: '#fff', font: '600 11px/18px var(--font-body)', textAlign: 'center', padding: '0 4px' }}>{unread}</span>}
          </button>}
        </div>
      </div>}
      {!isTab && !['welcome', 'confirm'].includes(scr) && <BackHeader title={title} onBack={back} />}
      <Scroll ref={scrollRef}>{(screens[scr] || Missing)()}</Scroll>
      <Toast text={toastText} />
      {showTabs && <TabBar label="Main" mobile={mobile} active={scr} onPick={tab} tabs={[
        { key: 'home', label: 'Home', icon: ICONS.home }, { key: 'timetable', label: 'Timetable', icon: ICONS.calendar }, { key: 'bookings', label: 'Bookings', icon: ICONS.check },
        { key: 'passes', label: 'Passes', icon: ICONS.ticket }, { key: 'profile', label: 'Profile', icon: ICONS.user }]} />}
      <Sheet open={!!sheet} onClose={() => setSheet(null)} mobile={mobile}>{sheet && sheets[sheet]()}</Sheet>
    </Phone>
  );
}

function SectionHead({ title, action, onAction }: { title: string; action: string; onAction: () => void }) {
  return <div style={{ padding: '0 20px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}><h2 className="t-h2">{title}</h2><button onClick={onAction} className="t-link">{action}</button></div>;
}
function SignInCard({ title, text, onSignIn }: { title: string; text: string; onSignIn: () => void }) {
  return <div className="card-lg" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
    <span style={{ font: '600 18px/24px var(--font-display)', color: 'var(--text-heading)' }}>{title}</span><span className="t-small">{text}</span><Button onClick={onSignIn}>Sign In</Button>
  </div>;
}
function DateBadge({ dow, day, mon }: { dow: string; day: number; mon: string }) {
  return <div style={{ width: 56, height: 64, flex: 'none', borderRadius: 10, background: 'var(--surface-blush)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
    <span style={{ font: '500 11px/14px var(--font-body)', color: 'var(--brand-rose-ink)' }}>{dow}</span><span style={{ font: '700 22px/26px var(--font-display)', color: 'var(--brand-rose)' }}>{day}</span><span style={{ font: '600 10px/12px var(--font-body)', color: 'var(--brand-rose-ink)' }}>{mon}</span>
  </div>;
}
function Missing() {
  return <div style={{ padding: 24 }} className="t-small">This item is no longer available.</div>;
}
