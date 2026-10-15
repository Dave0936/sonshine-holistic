// Read-side helpers over a loaded snapshot — the same questions the prototype's engine answered,
// but every change now goes through the database functions.
import { addDays, dt, endT, fmtD, fmtDL, fmtT, gbp, hhmm, img, iso, ms, DOW } from './format';
import { st } from './content';
import type { Booking, ClassRow, Db, EventRow, Instructor, Pass, Session } from './types';

export const HOLDS = ['confirmed', 'attended', 'noshow', 'offered'];
export const ACTIVE = ['confirmed', 'waitlisted', 'offered', 'attended', 'noshow'];
export const SEL = { bg: '#EC0F8C', fg: '#FFFFFF', bd: '#EC0F8C' }, UNSEL = { bg: '#FFFFFF', fg: '#374151', bd: '#E5E7EB' };
export const chip = (on: boolean) => (on ? SEL : UNSEL);

const NO_INS: Instructor = { id: '', name: 'TBC', ini: '?', role: '', bio: '', active: true, sort: 0 };

export class Model {
  constructor(public db: Db) {}
  user(id: string) { return this.db.profiles.find(u => u.id === id); }
  userName(id: string) { const u = this.user(id); return u ? `${u.first} ${u.last}` : 'Customer'; }
  cls(id: string) { return this.db.classes.find(c => c.id === id)!; }
  ins(id: string) { return this.db.instructors.find(i => i.id === id) || NO_INS; }
  sess(id: string) { return this.db.sessions.find(s => s.id === id); }
  prod(id: string) { return this.db.products.find(p => p.id === id)!; }
  svc(id: string) { return this.db.services.find(s => s.id === id); }
  start(s: Session) { return dt(s.date, hhmm(s.start_time)).getTime(); }
  taken(sid: string) { return this.db.avail[sid]?.taken ?? 0; }
  waiting(sid: string) { return this.db.bookings.filter(b => b.session_id === sid && b.status === 'waitlisted').sort((a, b) => ms(a.created) - ms(b.created)); }
  myB(uid: string, sid: string) { return this.db.bookings.find(b => b.user_id === uid && b.session_id === sid && ACTIVE.includes(b.status)); }
  bal(pid: string) { return this.db.ledger.filter(l => l.pass_id === pid).reduce((a, l) => a + l.delta, 0); }
  passOk(p: Pass, c: ClassRow) { const pr = this.prod(p.product); return !!pr && (pr.scope === 'kids' ? c.cat === 'Kids & Teens' : c.pass); }
  activePasses(uid: string) { const now = Date.now(); return this.db.passes.filter(p => p.user_id === uid && ms(p.expires) > now && this.bal(p.id) > 0); }
  eligible(uid: string, c: ClassRow) { return this.activePasses(uid).filter(p => this.passOk(p, c)); }
  loc(s: Session) { return s.format === 'Online' ? 'Online — link shown in your booking' : s.format === 'Hybrid' ? 'Barden House or online' : 'Barden House, Livingston'; }
  evPrice(e: EventRow) { if (e.price == null) return null; return e.early != null && e.early_until && Date.now() < dt(e.early_until, '23:59').getTime() ? e.early : e.price; }
  evTaken(eid: string) { return this.db.evTaken[eid] ?? 0; }
  waitPos(b: Booking) { return this.db.waitPos[b.id] ?? (this.waiting(b.session_id).findIndex(x => x.id === b.id) + 1); }
  futureSessions() { const now = Date.now(); return this.db.sessions.filter(s => s.status !== 'cancelled' && this.start(s) > now).sort((a, b) => this.start(a) - this.start(b)); }

  payLabel(b: Booking) {
    if (!b.method) return '';
    if (b.method === 'pass') { const p = this.db.passes.find(x => x.id === b.pass_id); return 'Paid with ' + (p ? this.prod(p.product).name : 'pass') + (b.status === 'cancelled' && !b.late ? ' · credit returned' : ''); }
    if (b.method === 'card') { const p = this.db.payments.find(x => x.id === b.payment_id); return p ? `${gbp(p.amount)} · ${st(p.status).label}${p.status !== 'failed' ? ' (test)' : ''}` : 'Card'; }
    if (b.method === 'manual') return 'Added by studio';
    return 'Free';
  }

  // A session prepared for display (prototype `sv`).
  sv(s: Session, uid: string | null) {
    const c = this.cls(s.cls), ins = this.ins(s.ins), taken = this.taken(s.id), left = Math.max(0, s.cap - taken), past = this.start(s) < Date.now();
    const my = uid ? this.myB(uid, s.id) : undefined, cancelled = s.status === 'cancelled', start = hhmm(s.start_time);
    const low = left <= 3 && !past && !cancelled;
    return {
      id: s.id, s, c, ins, taken, left, past, my, cancelled, full: left <= 0,
      time: fmtT(start), endTime: fmtT(endT(start, s.dur)), durLabel: s.dur + ' min', name: c.name, insName: ins.name, insIni: ins.ini,
      format: s.format, level: c.level, dateLabel: fmtD(s.date), img: img(c.img),
      priceLabel: c.price === 0 ? 'Free' : c.pass ? `${gbp(c.price)} or pass` : gbp(c.price),
      spaceLabel: cancelled ? 'Cancelled' : past ? 'Finished' : left <= 0 ? (s.waitlist ? 'Full · waitlist' : 'Full') : left <= 3 ? `Only ${left} left` : `${left} spaces`,
      spaceBg: low ? '#FCE7F3' : '#F3F4F6', spaceFg: low ? '#BE185D' : '#4B5563',
      pct: Math.min(100, Math.round(taken / s.cap * 100)) + '%', opacity: past || cancelled ? 0.55 : 1
    };
  }

  // The 14-day strip used by both timetables.
  days(sel: string, uid: string | null, pick: (d: string) => void) {
    const t = new Date(); t.setHours(0, 0, 0, 0);
    return Array.from({ length: 14 }, (_, i) => {
      const d = addDays(t, i), ds = iso(d), on = ds === sel;
      const mine = !!uid && this.db.bookings.some(b => b.user_id === uid && b.status === 'confirmed' && this.sess(b.session_id)?.date === ds);
      return { key: ds, dow: i === 0 ? 'Today' : DOW[d.getDay()], num: d.getDate(), bg: on ? '#EC0F8C' : '#FFFFFF', fg: on ? '#FFFFFF' : '#1F2937', sub: on ? '#FFFFFF' : '#6B7280',
        dot: mine ? (on ? '#FFFFFF' : '#EC0F8C') : 'transparent', pick: () => pick(ds), label: fmtDL(ds) };
    });
  }
}

export type SV = ReturnType<Model['sv']>;
