// Sonshine Hollistic — booking engine (demo, in-browser). Mirrors the server-side rules a production backend must enforce:
// capacity checks, idempotent bookings, append-only credit ledger, payment records separate from bookings, audit log.
(function () {
  const H = window.SonshineData;
  const ACTIVE = ['confirmed', 'waitlisted', 'offered', 'attended', 'noshow'];
  const HOLDS = ['confirmed', 'attended', 'noshow', 'offered'];

  function seed() {
    const today = new Date(); today.setHours(0, 0, 0, 0); const now = Date.now(); const day = 864e5;
    const db = { users: [], sessions: [], bookings: [], passes: [], ledger: [], payments: [], eventBookings: [], requests: [], notifs: [], audit: [], deleteRequests: [],
      settings: { cancelHours: 6, offerHours: 2, reminders: true },
      products: H.PRODUCTS.map(p => ({ ...p })), instructors: H.INS.map(x => ({ ...x, active: true })), events: H.EVENTS(today) };
    const addU = (id, first, last, role, ago) => db.users.push({ id, first, last, email: first.toLowerCase() + '@demo.test', role, pw: H.pwHash('demo1234'), verified: true, joined: now - ago * day, phone: '', notes: '', active: true, prefs: { reminders: true, marketing: false } });
    addU('u-emma', 'Emma', 'Wallace', 'customer', 40);
    addU('u-son', 'Son', 'Anderson', 'owner', 400);
    addU('u-ruth', 'Ruth', 'Hollis', 'admin', 400);
    [['Fiona', 'MacLeod', 2], ['Gemma', 'Reid', 5], ['Karen', 'Stewart', 12], ['Lewis', 'Grant', 20], ['Aileen', 'Murray', 35], ['Hannah', 'Baird', 60], ['Ross', 'Duncan', 90], ['Claire', 'Paterson', 120], ['Megan', 'Hughes', 150]]
      .forEach(([f, l, a]) => addU('u-' + f.toLowerCase(), f, l, 'customer', a));
    for (let off = -21; off < 14; off++) {
      const d = H.addDays(today, off), ds = H.iso(d);
      H.WEEK.filter(w => w.dow === d.getDay()).forEach(w => {
        const c = H.CLASSES.find(x => x.id === w.c);
        db.sessions.push({ id: 'S' + ds.replace(/-/g, '') + w.t.replace(':', ''), cls: c.id, date: ds, start: w.t, dur: c.dur, cap: w.cap || 14, ins: c.ins, status: 'scheduled', waitlist: true, format: c.format,
          link: c.format !== 'In studio' ? 'https://zoom.us/j/' + String(H.hash(ds + w.t)).slice(0, 10) : '' });
      });
    }
    const pay = (user, amount, kind, label, at, status = 'succeeded') => { const p = { id: H.gid('PAY'), user, ref: 'pi_test_' + H.gid(''), amount, kind, label, at, status }; db.payments.push(p); return p; };
    const oth = db.users.filter(u => u.role === 'customer' && u.id !== 'u-emma');
    const start = s => H.dt(s.date, s.start).getTime();
    const pregNext = db.sessions.find(s => s.cls === 'preg' && start(s) > now);
    db.sessions.forEach(s => {
      const c = H.CLASSES.find(x => x.id === s.cls), past = start(s) < now;
      const n = s === pregNext ? s.cap : H.hash(s.id) % (s.cap - 3);
      for (let i = 0; i < n && i < oth.length; i++) {
        const u = oth[(H.hash(s.id) + i) % oth.length]; const created = start(s) - (2 + (i % 3)) * day;
        const p = pay(u.id, c.price, 'Class', c.name + ' · ' + H.fmtD(s.date), Math.min(created, now));
        const b = { id: H.gid('B'), user: u.id, session: s.id, status: past ? (H.hash(s.id + i) % 9 === 0 ? 'noshow' : 'attended') : 'confirmed', method: 'card', pass: null, payment: p.id, amount: c.price, created: Math.min(created, now - 36e5) };
        if (!past && H.hash(s.id + 'x' + i) % 11 === 0) { b.status = 'cancelled'; b.cancelledAt = now - day; p.status = 'refunded'; p.refundedAt = now - day; }
        p.booking = b.id; db.bookings.push(b);
      }
    });
    oth.slice(0, 3).forEach((u, i) => pay(u.id, 7500, 'Pass', '10 Class Pass', now - (4 + i * 6) * day));
    pay('u-lewis', 900, 'Class', 'Vinyasa Flow · card declined', now - 2 * day, 'failed');
    // Emma
    const E = 'u-emma';
    const pp = pay(E, 4000, 'Pass', '5 Class Pass', now - 10 * day);
    const pass = { id: 'PS-emma1', user: E, product: 'p5', purchased: now - 10 * day, expires: now + 46 * day, total: 5, payment: pp.id };
    const old = { id: 'PS-emma0', user: E, product: 'p5', purchased: now - 120 * day, expires: now - 64 * day, total: 5 };
    db.passes.push(pass, old);
    db.ledger.push({ id: H.gid('L'), pass: old.id, delta: 5, reason: 'Purchased 5 Class Pass', at: old.purchased });
    for (let k = 0; k < 5; k++) db.ledger.push({ id: H.gid('L'), pass: old.id, delta: -1, reason: 'Class booked', at: old.purchased + (k + 1) * 7 * day });
    db.ledger.push({ id: H.gid('L'), pass: pass.id, delta: 5, reason: 'Purchased 5 Class Pass', at: pass.purchased });
    const addE = (s, method, status, extra) => { const b = Object.assign({ id: H.gid('B'), user: E, session: s.id, status, method, pass: method === 'pass' ? pass.id : null, payment: null, amount: 0, created: now - 3 * day }, extra); db.bookings.push(b); return b; };
    const pastVin = db.sessions.filter(s => start(s) < now && s.cls === 'vin').pop();
    if (pastVin) { const b = addE(pastVin, 'pass', 'attended', { created: start(pastVin) - 2 * day }); db.ledger.push({ id: H.gid('L'), pass: pass.id, delta: -1, reason: 'Vinyasa Flow · ' + H.fmtD(pastVin.date), booking: b.id, at: b.created }); }
    const f1 = db.sessions.find(s => start(s) > now + 20 * 36e5 && ['soul', 'pil', 'gentle', 'vin', 'hatha'].includes(s.cls) && !db.bookings.some(b => b.session === s.id && b.user === E));
    if (f1) { const b = addE(f1, 'pass', 'confirmed'); db.ledger.push({ id: H.gid('L'), pass: pass.id, delta: -1, reason: H.CLASSES.find(c => c.id === f1.cls).name + ' · ' + H.fmtD(f1.date), booking: b.id, at: b.created }); }
    const sleepy = db.sessions.find(s => s.cls === 'sleepy' && start(s) > now);
    if (sleepy) { const p = pay(E, 900, 'Class', 'Sleepy Yoga & Sound Bath · ' + H.fmtD(sleepy.date), now - 2 * day); const b = addE(sleepy, 'card', 'confirmed', { payment: p.id, amount: 900 }); p.booking = b.id; }
    const pastHatha = db.sessions.filter(s => start(s) < now && s.cls === 'hatha').pop();
    if (pastHatha) { const p = pay(E, 900, 'Class', 'Hatha Yoga · ' + H.fmtD(pastHatha.date), now - 12 * day, 'refunded'); p.refundedAt = now - 11 * day; const b = addE(pastHatha, 'card', 'cancelled', { payment: p.id, amount: 900, cancelledAt: now - 11 * day }); p.booking = b.id; }
    if (pregNext) addE(pregNext, null, 'waitlisted', { created: now - day });
    db.eventBookings.push(...oth.slice(0, 6).map((u, i) => { const p = pay(u.id, 1500, 'Event', 'Full Moon Sound Bath', now - (i + 1) * day); return { id: H.gid('EB'), user: u.id, event: 'e-bath', status: 'confirmed', payment: p.id, amount: 1500, created: p.at }; }));
    db.requests.push({ id: H.gid('R'), user: 'u-fiona', service: 'sreiki', date: H.iso(H.addDays(today, 4)), slot: 'Evening', msg: 'First time trying reiki — any evening works for me.', status: 'pending', created: now - 5 * 36e5 },
      { id: H.gid('R'), user: 'u-gemma', service: 's121', date: H.iso(H.addDays(today, 7)), slot: 'Morning', msg: 'Would love the 90 minute session as a birthday treat.', status: 'pending', created: now - day });
    db.notifs.push({ id: H.gid('N'), user: E, text: 'You’re on the waitlist for Pregnancy Yoga. We’ll let you know if a place opens up.', at: now - day, read: false },
      { id: H.gid('N'), user: E, text: 'Payment received: £9.00 for Sleepy Yoga & Sound Bath (test mode).', at: now - 2 * day, read: true });
    db.audit.push({ id: H.gid('A'), at: now, actor: 'System', action: 'Demonstration data loaded — remove before launch.' });
    return db;
  }

  class Engine {
    constructor(db) { this.db = db; }
    user(id) { return this.db.users.find(u => u.id === id); }
    cls(id) { return H.CLASSES.find(c => c.id === id); }
    ins(id) { return this.db.instructors.find(i => i.id === id) || { name: 'TBC', ini: '?', role: '' }; }
    sess(id) { return this.db.sessions.find(s => s.id === id); }
    prod(id) { return this.db.products.find(p => p.id === id); }
    start(s) { return H.dt(s.date, s.start).getTime(); }
    taken(sid) { return this.db.bookings.filter(b => b.session === sid && HOLDS.includes(b.status)).length; }
    waiting(sid) { return this.db.bookings.filter(b => b.session === sid && b.status === 'waitlisted').sort((a, b) => a.created - b.created); }
    myB(uid, sid) { return this.db.bookings.find(b => b.user === uid && b.session === sid && ACTIVE.includes(b.status)); }
    bal(pid) { return this.db.ledger.filter(l => l.pass === pid).reduce((a, l) => a + l.delta, 0); }
    passOk(p, c) { const pr = this.prod(p.product); return pr && (pr.scope === 'kids' ? c.cat === 'Kids & Teens' : c.pass); }
    eligible(uid, c) { const now = Date.now(); return this.db.passes.filter(p => p.user === uid && p.expires > now && this.bal(p.id) > 0 && this.passOk(p, c)); }
    activePasses(uid) { const now = Date.now(); return this.db.passes.filter(p => p.user === uid && p.expires > now && this.bal(p.id) > 0); }
    notify(uid, text) { this.db.notifs.unshift({ id: H.gid('N'), user: uid, text, at: Date.now(), read: false }); }
    audit(actorId, action) { const u = this.user(actorId); this.db.audit.unshift({ id: H.gid('A'), at: Date.now(), actor: u ? `${u.first} ${u.last} (${u.role})` : 'System', action }); }
    isStaff(uid) { const u = this.user(uid); return !!u && u.active && (u.role === 'owner' || u.role === 'admin'); }
    staffOnly(uid) { if (!this.isStaff(uid)) throw new Error('Not authorised'); }
    loc(s) { return s.format === 'Online' ? 'Online — link shown in your booking' : s.format === 'Hybrid' ? 'Barden House or online' : 'Barden House, Livingston'; }

    book(uid, sid, opt) {
      const db = this.db, s = this.sess(sid);
      if (!uid || !this.user(uid)) return { err: 'Please sign in to book.' };
      if (!s || s.status === 'cancelled') return { err: 'This session has been cancelled.' };
      if (this.start(s) < Date.now()) return { err: 'This class has already started.' };
      const c = this.cls(s.cls), ex = this.myB(uid, sid);
      if (ex && ex.status === 'confirmed') return { err: 'You already have a place on this class.', dup: true };
      const offered = ex && ex.status === 'offered';
      if (!offered && this.taken(sid) >= s.cap) return { err: 'Sorry — the last place has just been taken. You can join the waitlist instead.', full: true };
      let pay = null, passId = null;
      if (opt.method === 'pass') {
        const p = db.passes.find(x => x.id === opt.passId && x.user === uid);
        if (!p) return { err: 'Pass not found.' };
        if (p.expires < Date.now()) return { err: 'This pass has expired.' };
        if (!this.passOk(p, c)) return { err: 'This pass can’t be used for this class.' };
        if (this.bal(p.id) < 1) return { err: 'There aren’t enough credits on this pass.' };
        passId = p.id;
      } else if (opt.method === 'card') {
        if (c.price <= 0) return { err: 'This class is free — no payment needed.' };
        const p = { id: H.gid('PAY'), user: uid, ref: 'pi_test_' + H.gid(''), amount: c.price, kind: 'Class', label: c.name + ' · ' + H.fmtD(s.date), at: Date.now(), status: opt.card === 'fail' ? 'failed' : 'succeeded' };
        db.payments.push(p);
        if (p.status === 'failed') return { err: 'Your card was declined (test card 4000 0000 0000 0002). No booking was made and you have not been charged.' };
        pay = p;
      }
      const b = offered ? ex : { id: H.gid('B'), user: uid, session: sid, created: Date.now() };
      Object.assign(b, { status: 'confirmed', method: opt.method, pass: passId, payment: pay ? pay.id : null, amount: pay ? pay.amount : 0 });
      if (!offered) db.bookings.push(b);
      if (pay) pay.booking = b.id;
      if (passId) db.ledger.push({ id: H.gid('L'), pass: passId, delta: -1, reason: c.name + ' · ' + H.fmtD(s.date), booking: b.id, at: Date.now() });
      this.notify(uid, `Booking confirmed: ${c.name}, ${H.fmtD(s.date)} at ${H.fmtT(s.start)}.`);
      return { ok: true, booking: b };
    }
    joinWait(uid, sid) {
      const s = this.sess(sid); if (!s || !s.waitlist) return { err: 'The waitlist isn’t open for this session.' };
      if (this.myB(uid, sid)) return { err: 'You’re already on this class or its waitlist.' };
      const b = { id: H.gid('B'), user: uid, session: sid, status: 'waitlisted', method: null, pass: null, payment: null, amount: 0, created: Date.now() };
      this.db.bookings.push(b); const pos = this.waiting(sid).findIndex(x => x.id === b.id) + 1;
      this.notify(uid, `You’re number ${pos} on the waitlist for ${this.cls(s.cls).name}.`);
      return { ok: true, pos };
    }
    promote(sid) {
      const s = this.sess(sid); if (!s || s.status === 'cancelled' || this.start(s) < Date.now()) return;
      while (this.taken(sid) < s.cap) {
        const next = this.waiting(sid)[0]; if (!next) return;
        next.status = 'offered'; next.offerUntil = Math.min(Date.now() + this.db.settings.offerHours * 36e5, this.start(s));
        this.notify(next.user, `A place has opened on ${this.cls(s.cls).name}, ${H.fmtD(s.date)}. Claim it by ${H.fmtTsT(next.offerUntil)}.`);
      }
    }
    cancelB(bid, by, override) {
      const b = this.db.bookings.find(x => x.id === bid); if (!b) return { err: 'Booking not found.' };
      const staff = this.isStaff(by); if (b.user !== by && !staff) return { err: 'Not authorised.' };
      if (b.status === 'cancelled') return { err: 'Already cancelled.' };
      const s = this.sess(b.session), c = this.cls(s.cls);
      const held = HOLDS.includes(b.status);
      if (b.status === 'waitlisted' || b.status === 'offered') { b.status = 'cancelled'; b.cancelledAt = Date.now(); if (held) this.promote(s.id); return { ok: true, waitlist: true }; }
      const hrs = (this.start(s) - Date.now()) / 36e5, late = hrs < this.db.settings.cancelHours;
      const restore = !late || (staff && override);
      b.status = 'cancelled'; b.cancelledAt = Date.now(); b.late = late && !restore;
      if (restore && b.pass) this.db.ledger.push({ id: H.gid('L'), pass: b.pass, delta: 1, reason: 'Credit returned — cancelled ' + c.name, booking: b.id, at: Date.now() });
      if (restore && b.payment) { const p = this.db.payments.find(x => x.id === b.payment); if (p && p.status === 'succeeded') { p.status = 'refunded'; p.refundedAt = Date.now(); } }
      this.notify(b.user, `Booking cancelled: ${c.name}, ${H.fmtD(s.date)}. ${restore ? (b.pass ? 'Your credit has been returned.' : b.payment ? 'Your refund is on its way (test mode).' : '') : 'This was inside the notice period, so no credit or refund applies.'}`);
      if (b.user !== by) this.audit(by, `Cancelled ${this.user(b.user).first} ${this.user(b.user).last}’s booking for ${c.name} ${H.fmtD(s.date)}${override ? ' (override: credit/refund restored)' : ''}`);
      this.promote(s.id);
      return { ok: true, late, restore };
    }
    cancelSession(sid, by) {
      this.staffOnly(by); const s = this.sess(sid), c = this.cls(s.cls);
      this.db.bookings.filter(b => b.session === sid && ['confirmed', 'waitlisted', 'offered'].includes(b.status)).forEach(b => {
        if (b.pass && b.status === 'confirmed') this.db.ledger.push({ id: H.gid('L'), pass: b.pass, delta: 1, reason: 'Credit returned — class cancelled by studio', booking: b.id, at: Date.now() });
        if (b.payment) { const p = this.db.payments.find(x => x.id === b.payment); if (p && p.status === 'succeeded') { p.status = 'refunded'; p.refundedAt = Date.now(); } }
        b.status = 'cancelled'; b.cancelledAt = Date.now();
        this.notify(b.user, `Class cancelled: ${c.name} on ${H.fmtD(s.date)} has been cancelled by the studio. Any credit or payment has been returned.`);
      });
      s.status = 'cancelled'; this.audit(by, `Cancelled session ${c.name} ${H.fmtD(s.date)} ${H.fmtT(s.start)}`);
    }
    setAttendance(bid, status, by) { this.staffOnly(by); const b = this.db.bookings.find(x => x.id === bid); const s = this.sess(b.session); b.status = status; this.audit(by, `Marked ${this.user(b.user).first} ${status === 'noshow' ? 'no-show' : status} — ${this.cls(s.cls).name} ${H.fmtD(s.date)}`); }
    setCap(sid, cap, by) { this.staffOnly(by); const s = this.sess(sid); const min = this.taken(sid); if (cap < min) return { err: `${min} people are booked — capacity can’t go lower.` }; s.cap = cap; this.audit(by, `Capacity for ${this.cls(s.cls).name} ${H.fmtD(s.date)} set to ${cap}`); this.promote(sid); return { ok: true }; }
    setIns(sid, insId, by) { this.staffOnly(by); const s = this.sess(sid); s.ins = insId; const n = this.ins(insId).name, c = this.cls(s.cls);
      this.db.bookings.filter(b => b.session === sid && b.status === 'confirmed').forEach(b => this.notify(b.user, `Instructor change: ${c.name} on ${H.fmtD(s.date)} will now be led by ${n}.`));
      this.audit(by, `Instructor for ${c.name} ${H.fmtD(s.date)} changed to ${n}`); }
    manualBook(sid, uid, by) { this.staffOnly(by); const s = this.sess(sid);
      if (this.myB(uid, sid)) return { err: 'Already booked or waitlisted.' };
      if (this.taken(sid) >= s.cap) return { err: 'This session is full — increase capacity first.' };
      this.db.bookings.push({ id: H.gid('B'), user: uid, session: sid, status: 'confirmed', method: 'manual', pass: null, payment: null, amount: 0, created: Date.now() });
      this.notify(uid, `The studio has booked you onto ${this.cls(s.cls).name}, ${H.fmtD(s.date)} at ${H.fmtT(s.start)}.`);
      this.audit(by, `Manual booking: ${this.user(uid).first} ${this.user(uid).last} onto ${this.cls(s.cls).name} ${H.fmtD(s.date)}`); return { ok: true }; }
    createSessions(o, by) { this.staffOnly(by); const c = this.cls(o.cls); let n = 0;
      for (let w = 0; w < o.repeat; w++) { const ds = H.iso(H.addDays(H.parseD(o.date), w * 7));
        this.db.sessions.push({ id: H.gid('S'), cls: c.id, date: ds, start: o.start, dur: c.dur, cap: o.cap, ins: c.ins, status: 'scheduled', waitlist: true, format: c.format, link: c.format !== 'In studio' ? 'https://zoom.us/j/' + String(H.hash(ds + o.start)).slice(0, 10) : '' }); n++; }
      this.audit(by, `Created ${n} session${n > 1 ? 's' : ''} of ${c.name} from ${H.fmtD(o.date)} at ${H.fmtT(o.start)}`); return n; }
    adjustCredits(pid, delta, reason, by) { this.staffOnly(by);
      if (!reason.trim()) return { err: 'Please give a reason — it’s kept in the audit log.' };
      if (this.bal(pid) + delta < 0) return { err: 'Balance can’t go below zero.' };
      const p = this.db.passes.find(x => x.id === pid);
      this.db.ledger.push({ id: H.gid('L'), pass: pid, delta, reason: `Manual adjustment: ${reason.trim()}`, at: Date.now(), by });
      this.notify(p.user, `Your ${this.prod(p.product).name} was adjusted by ${delta > 0 ? '+' : ''}${delta} credit${Math.abs(delta) > 1 ? 's' : ''}.`);
      this.audit(by, `Credits ${delta > 0 ? '+' : ''}${delta} on ${this.user(p.user).first}’s ${this.prod(p.product).name} — “${reason.trim()}”`); return { ok: true }; }
    buyPass(uid, pid, card) {
      const pr = this.prod(pid); if (!pr || !pr.onSale) return { err: 'This pass isn’t currently on sale.' };
      const p = { id: H.gid('PAY'), user: uid, ref: 'pi_test_' + H.gid(''), amount: pr.price, kind: 'Pass', label: pr.name, at: Date.now(), status: card === 'fail' ? 'failed' : 'succeeded' };
      this.db.payments.push(p);
      if (p.status === 'failed') return { err: 'Your card was declined (test card 4000 0000 0000 0002). No pass was created and you have not been charged.' };
      const pass = { id: H.gid('PS'), user: uid, product: pid, purchased: Date.now(), expires: Date.now() + pr.weeks * 7 * 864e5, total: pr.credits, payment: p.id };
      this.db.passes.push(pass); this.db.ledger.push({ id: H.gid('L'), pass: pass.id, delta: pr.credits, reason: 'Purchased ' + pr.name, at: Date.now() });
      this.notify(uid, `Payment received: ${H.gbp(pr.price)} for ${pr.name} (test mode). ${pr.credits} credits added.`); return { ok: true, pass };
    }
    evPrice(e) { if (e.price == null) return null; return e.early != null && e.earlyUntil && Date.now() < H.dt(e.earlyUntil, '23:59').getTime() ? e.early : e.price; }
    evTaken(eid) { return this.db.eventBookings.filter(b => b.event === eid && b.status === 'confirmed').length; }
    bookEvent(uid, eid, card) {
      const e = this.db.events.find(x => x.id === eid);
      if (!e || !e.published) return { err: 'This event isn’t available.' };
      if (this.db.eventBookings.some(b => b.event === eid && b.user === uid && b.status === 'confirmed')) return { err: 'You already have a place at this event.' };
      if (e.deadline && Date.now() > H.dt(e.deadline, '23:59').getTime()) return { err: 'Bookings for this event have closed.' };
      if (this.evTaken(eid) >= e.cap) return { err: 'Sorry — this event is now full.' };
      const price = this.evPrice(e); let pay = null;
      if (price > 0) { pay = { id: H.gid('PAY'), user: uid, ref: 'pi_test_' + H.gid(''), amount: price, kind: 'Event', label: e.name, at: Date.now(), status: card === 'fail' ? 'failed' : 'succeeded' }; this.db.payments.push(pay);
        if (pay.status === 'failed') return { err: 'Your card was declined (test card 4000 0000 0000 0002). No place was booked and you have not been charged.' }; }
      const b = { id: H.gid('EB'), user: uid, event: eid, status: 'confirmed', payment: pay && pay.id, amount: price || 0, created: Date.now() };
      this.db.eventBookings.push(b); this.notify(uid, `Event booked: ${e.name}, ${H.fmtD(e.date)}.`); return { ok: true };
    }
    request(uid, sid, date, slot, msg) {
      const svc = H.SERVICES.find(x => x.id === sid); this.db.requests.unshift({ id: H.gid('R'), user: uid, service: sid, date, slot, msg, status: 'pending', created: Date.now() });
      this.notify(uid, `Request received for ${svc.name}. This isn’t confirmed yet — ${svc.practitioner} will be in touch.`); return { ok: true };
    }
    setRequest(rid, status, by) { this.staffOnly(by); const r = this.db.requests.find(x => x.id === rid); r.status = status; const svc = H.SERVICES.find(x => x.id === r.service);
      const msg = { accepted: `Your ${svc.name} appointment for ${H.fmtD(r.date)} (${r.slot.toLowerCase()}) is confirmed.`, declined: `We can’t offer your requested ${svc.name} time — please get in touch to find another.`, completed: `Thanks for visiting for ${svc.name}.` }[status];
      if (msg) this.notify(r.user, msg); this.audit(by, `Appointment request ${status}: ${this.user(r.user).first} — ${svc.name}`); }
    refund(payId, by) { this.staffOnly(by); const p = this.db.payments.find(x => x.id === payId); if (!p || p.status !== 'succeeded') return { err: 'Only successful payments can be refunded.' };
      p.status = 'refunded'; p.refundedAt = Date.now(); this.notify(p.user, `Refund issued: ${H.gbp(p.amount)} for ${p.label} (test mode).`); this.audit(by, `Refunded ${H.gbp(p.amount)} — ${p.label} (${p.ref})`); return { ok: true }; }
  }

  window.SonshineEngine = { seed, Engine, ACTIVE, HOLDS };
})();
