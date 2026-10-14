// Sonshine Hollistic — view-models + handlers for the customer app and owner dashboard.
(function () {
  const H = () => window.SonshineData;
  const SEL = { bg: '#EC0F8C', fg: '#FFFFFF', bd: '#EC0F8C' }, UNSEL = { bg: '#FFFFFF', fg: '#374151', bd: '#E5E7EB' };
  const chip = on => (on ? SEL : UNSEL);
  const tg = on => ({ bg: on ? '#EC0F8C' : '#D1D5DB', x: on ? '20px' : '0px', on });
  const STATUS = {
    confirmed: { label: 'Confirmed', bg: '#FCE7F3', fg: '#BE185D' }, waitlisted: { label: 'Waitlisted', bg: '#F3F4F6', fg: '#374151' },
    offered: { label: 'Place offered', bg: '#EC0F8C', fg: '#FFFFFF' }, attended: { label: 'Attended ✓', bg: '#DCFCE7', fg: '#166534' },
    noshow: { label: 'No-show', bg: '#F3F4F6', fg: '#4B5563' }, cancelled: { label: 'Cancelled', bg: '#F3F4F6', fg: '#6B7280' },
    pending: { label: 'Pending — not confirmed', bg: '#FEF9C3', fg: '#854D0E' }, accepted: { label: 'Accepted', bg: '#DCFCE7', fg: '#166534' },
    declined: { label: 'Declined', bg: '#F3F4F6', fg: '#6B7280' }, completed: { label: 'Completed', bg: '#F3F4F6', fg: '#374151' },
    succeeded: { label: 'Paid', bg: '#DCFCE7', fg: '#166534' }, failed: { label: 'Failed', bg: '#FEE2E2', fg: '#991B1B' }, refunded: { label: 'Refunded', bg: '#F3F4F6', fg: '#374151' }
  };
  const st = k => STATUS[k] || { label: k, bg: '#F3F4F6', fg: '#374151' };
  const TODAY = () => H().iso(new Date());
  const greetWord = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };
  const download = (name, text, type) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); };
  const payLabel = (e, b) => {
    if (!b.method) return '';
    if (b.method === 'pass') { const p = e.db.passes.find(x => x.id === b.pass); return 'Paid with ' + (p ? e.prod(p.product).name : 'pass') + (b.status === 'cancelled' && !b.late ? ' · credit returned' : ''); }
    if (b.method === 'card') { const p = e.db.payments.find(x => x.id === b.payment); return p ? `${H().gbp(p.amount)} · ${st(p.status).label}${p.status !== 'failed' ? ' (test)' : ''}` : 'Card'; }
    if (b.method === 'manual') return 'Added by studio';
    return 'Free';
  };

  function days(sel, uid, e, pick) {
    const h = H(), t = new Date(); t.setHours(0, 0, 0, 0);
    return Array.from({ length: 14 }, (_, i) => { const d = h.addDays(t, i), ds = h.iso(d), on = ds === sel;
      const mine = uid && e.db.bookings.some(b => b.user === uid && b.status === 'confirmed' && e.sess(b.session).date === ds);
      return { key: ds, dow: i === 0 ? 'Today' : h.DOW[d.getDay()], num: d.getDate(), bg: on ? '#EC0F8C' : '#FFFFFF', fg: on ? '#FFFFFF' : '#1F2937', sub: on ? '#FFFFFF' : '#6B7280', dot: mine ? (on ? '#FFFFFF' : '#EC0F8C') : 'transparent', pick: () => pick(ds), label: h.fmtDL(ds) };
    });
  }

  function sv(e, s, uid) {
    const h = H(), c = e.cls(s.cls), ins = e.ins(s.ins), taken = e.taken(s.id), left = Math.max(0, s.cap - taken), past = e.start(s) < Date.now();
    const my = uid ? e.myB(uid, s.id) : null, cancelled = s.status === 'cancelled';
    const space = cancelled ? 'Cancelled' : past ? 'Finished' : left <= 0 ? (s.waitlist ? 'Full · waitlist' : 'Full') : left <= 3 ? `Only ${left} left` : `${left} spaces`;
    return { id: s.id, s, c, ins, taken, left, past, my, cancelled, full: left <= 0,
      time: h.fmtT(s.start), endTime: h.fmtT(h.endT(s.start, s.dur)), durLabel: s.dur + ' min', name: c.name, insName: ins.name, insIni: ins.ini, format: s.format, level: c.level,
      dateLabel: h.fmtD(s.date), img: h.res(c.img), priceLabel: c.price === 0 ? 'Free' : c.pass ? `${h.gbp(c.price)} or pass` : h.gbp(c.price),
      spaceLabel: space, spaceBg: (left <= 3 && !past && !cancelled) ? '#FCE7F3' : '#F3F4F6', spaceFg: (left <= 3 && !past && !cancelled) ? '#BE185D' : '#4B5563',
      pct: Math.min(100, Math.round(taken / s.cap * 100)) + '%', opacity: past || cancelled ? 0.55 : 1 };
  }

  // ---------------- CUSTOMER ----------------
  function customer(cmp) {
    const h = H(), e = cmp.eng, S = cmp.state, uid = S.cUid, u = uid ? e.user(uid) : null, scr = S.cScreen;
    const set = (o) => cmp.setState(o);
    const go = (screen, p) => () => cmp.cGo(screen, p || {});
    const TABS = ['home', 'timetable', 'bookings', 'passes', 'profile'];
    const isTab = TABS.includes(scr);
    const titles = { auth: S.authMode === 'signin' ? 'Sign In' : 'Create Account', cls: 'Class Details', events: 'Workshops & Events', event: 'Event Details', services: 'Specialist Services', service: 'Service', team: 'Meet the Team', instructor: 'Instructor', studio: 'Our Studio', policy: 'Booking & Cancellation', notifs: 'Notifications' };
    const toast = (m) => cmp.toast('c', m);
    const needAuth = (after) => { set({ pendingAuth: after, authMode: 'signin', authErr: '', authNote: '' }); cmp.cGo('auth', {}); };
    const sc = {}; ['welcome', 'auth', 'home', 'timetable', 'cls', 'confirm', 'bookings', 'passes', 'profile', 'events', 'event', 'services', 'service', 'team', 'instructor', 'studio', 'policy', 'notifs'].forEach(k => sc[k] = scr === k);
    const myNotifs = uid ? e.db.notifs.filter(n => n.user === uid) : [];
    const unread = myNotifs.filter(n => !n.read).length;
    const tabC = {}; TABS.forEach(t => tabC[t] = scr === t ? '#EC0F8C' : '#6B7280');
    const navs = {}; TABS.forEach(t => navs[t] = () => cmp.cTab(t));
    Object.assign(navs, { events: go('events'), services: go('services'), team: go('team'), studio: go('studio'), policy: go('policy'), notifs: () => { myNotifs.forEach(n => n.read = true); cmp.commit(); cmp.cGo('notifs', {}); },
      signin: () => { set({ authMode: 'signin', authErr: '', authNote: '' }); cmp.cGo('auth', {}); }, register: () => { set({ authMode: 'register', authErr: '', authNote: '' }); cmp.cGo('auth', {}); } });

    const openBook = (sid) => {
      if (!uid) return needAuth({ screen: S.cScreen, p: S.cP, sheet: 'book', sid });
      const s = e.sess(sid), c = e.cls(s.cls), el = e.eligible(uid, c);
      set({ cSheet: 'book', sheetSid: sid, bk: { opt: el[0] ? 'pass:' + el[0].id : (c.price === 0 ? 'free' : 'card'), card: 'ok', busy: false, err: '' } });
    };
    const joinWait = (sid) => { if (!uid) return needAuth({ screen: S.cScreen, p: S.cP }); const r = e.joinWait(uid, sid); cmp.commit(); toast(r.err || `You’re number ${r.pos} on the waitlist. We’ll notify you if a place opens.`); };
    const quick = (v) => (ev) => { if (ev && ev.stopPropagation) ev.stopPropagation(); if (v.full && !v.my) joinWait(v.id); else openBook(v.id); };
    const item = (v, showDate) => ({ ...v, showDate, open: go('cls', { sid: v.id }), quick: quick(v),
      canQuick: !v.past && !v.cancelled && !v.my && (!v.full || v.s.waitlist), quickLabel: v.full ? 'Waitlist' : 'Book',
      booked: !!v.my, bookedLabel: v.my ? (v.my.status === 'confirmed' ? '✓ Booked' : v.my.status === 'offered' ? 'Place offered' : v.my.status === 'waitlisted' ? 'Waitlisted' : st(v.my.status).label) : '' });

    const out = { sc, title: titles[scr] || '', headerTab: isTab, headerBack: !isTab && !['welcome', 'confirm'].includes(scr), back: () => cmp.cBack(), showTabs: isTab || ['events', 'services', 'team', 'studio', 'policy', 'notifs', 'event', 'service', 'instructor'].includes(scr),
      tab: tabC, go: navs, unread, hasUnread: unread > 0, signedIn: !!u, guest: !u, toast: S.cToast, hasToast: !!S.cToast, closeSheet: () => set({ cSheet: null }), sheetOpen: !!S.cSheet,
      sh: { book: S.cSheet === 'book', cancel: S.cSheet === 'cancel', filters: S.cSheet === 'filters', buy: S.cSheet === 'buy', request: S.cSheet === 'request', eventBook: S.cSheet === 'eventBook', del: S.cSheet === 'del' },
      user: u ? { first: u.first, last: u.last, email: u.email, initials: (u.first[0] + u.last[0]).toUpperCase(), joined: h.fmtTs(u.joined) } : { first: '', last: '', email: '', initials: '' },
      needsVerify: !!u && !u.verified, verify: () => { u.verified = true; cmp.commit(); toast('Email verified — thank you!'); }, resendVerify: () => toast('Verification email queued. (Demo: email delivery isn’t connected yet.)'),
      browseGuest: () => cmp.cTab('home'), startRegister: navs.register, startSignin: navs.signin };

    // auth
    const F = S.form, fset = k => ev => set({ form: { ...S.form, [k]: k === 'terms' ? ev.target.checked : ev.target.value }, authErr: '' });
    const afterAuth = (id) => { const p = S.pendingAuth; cmp.setState({ cUid: id, pendingAuth: null, cStack: [], cScreen: p ? p.screen : 'home', cP: p ? p.p : {}, form: { ...S.form, pw: '', pw2: '' } }, () => { cmp.persist(); if (p && p.sheet === 'book') openBookAfter(p.sid, id); }); };
    const openBookAfter = (sid, id) => { const s = e.sess(sid), c = e.cls(s.cls), el = e.eligible(id, c); cmp.setState({ cSheet: 'book', sheetSid: sid, bk: { opt: el[0] ? 'pass:' + el[0].id : (c.price === 0 ? 'free' : 'card'), card: 'ok', busy: false, err: '' } }); };
    Object.assign(out, { isSignin: S.authMode === 'signin', isRegister: S.authMode === 'register', segIn: chip(S.authMode === 'signin'), segUp: chip(S.authMode === 'register'),
      setSignin: () => set({ authMode: 'signin', authErr: '', authNote: '' }), setRegister: () => set({ authMode: 'register', authErr: '', authNote: '' }),
      cf: F, cfOn: { first: fset('first'), last: fset('last'), email: fset('email'), pw: fset('pw'), pw2: fset('pw2'), terms: fset('terms') },
      authErr: S.authErr, hasAuthErr: !!S.authErr, authNote: S.authNote, hasAuthNote: !!S.authNote,
      forgot: () => set({ authNote: 'If an account exists for that email, we’ll send a password reset link. (Demo: email delivery isn’t connected yet.)', authErr: '' }),
      submitSignin: () => { const x = e.db.users.find(z => z.email.toLowerCase() === F.email.trim().toLowerCase());
        if (!F.email.trim() || !F.pw) return set({ authErr: 'Please enter your email and password.' });
        if (!x || x.pw !== h.pwHash(F.pw)) return set({ authErr: 'That email and password don’t match an account.' });
        if (!x.active) return set({ authErr: 'This account has been deactivated. Please contact the studio.' });
        afterAuth(x.id); toast(`Welcome back, ${x.first}`); },
      submitRegister: () => { const em = F.email.trim().toLowerCase();
        if (!F.first.trim() || !F.last.trim()) return set({ authErr: 'Please enter your first and last name.' });
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return set({ authErr: 'Please enter a valid email address.' });
        if (e.db.users.some(z => z.email.toLowerCase() === em)) return set({ authErr: 'An account with this email already exists — try signing in.' });
        if (F.pw.length < 8) return set({ authErr: 'Your password needs at least 8 characters.' });
        if (F.pw !== F.pw2) return set({ authErr: 'Those passwords don’t match.' });
        if (!F.terms) return set({ authErr: 'Please accept the terms and privacy policy to continue.' });
        const id = h.gid('u-'); e.db.users.push({ id, first: F.first.trim(), last: F.last.trim(), email: em, role: 'customer', pw: h.pwHash(F.pw), verified: false, joined: Date.now(), phone: '', notes: '', active: true, prefs: { reminders: true, marketing: false } });
        e.notify(id, 'Welcome to Sonshine Hollistic! Please verify your email address.'); cmp.commit(); afterAuth(id); toast('Account created — welcome!'); } });

    // home
    const now = Date.now();
    const myBk = uid ? e.db.bookings.filter(b => b.user === uid) : [];
    const upcomingMine = myBk.filter(b => b.status === 'confirmed' && e.start(e.sess(b.session)) > now).sort((a, b) => e.start(e.sess(a.session)) - e.start(e.sess(b.session)));
    const nb = upcomingMine[0];
    if (nb) { const s = e.sess(nb.session), v = sv(e, s, uid); out.next = { name: v.name, date: h.fmtDL(s.date), time: `${v.time} – ${v.endTime}`, ins: v.insName, loc: e.loc(s), pay: payLabel(e, nb), open: go('cls', { sid: s.id }) }; }
    const ap = uid ? e.activePasses(uid) : [];
    const mainPass = ap.sort((a, b) => a.expires - b.expires)[0];
    out.hasNext = !!nb; out.noNext = !nb; out.next = out.next || {};
    out.hasPass = !!mainPass; out.noPassSigned = !!u && !mainPass;
    out.passSum = mainPass ? { name: e.prod(mainPass.product).name, left: e.bal(mainPass.id), total: mainPass.total, expires: h.fmtTs(mainPass.expires), pct: Math.round(e.bal(mainPass.id) / mainPass.total * 100) + '%', more: ap.length > 1 ? `+ ${ap.length - 1} more pass${ap.length > 2 ? 'es' : ''}` : '' } : {};
    out.greet = u ? `${greetWord()}, ${u.first}` : 'Welcome to Sonshine Hollistic';
    out.todayLabel = h.fmtDL(TODAY());
    const futureS = e.db.sessions.filter(s => s.status !== 'cancelled' && e.start(s) > now).sort((a, b) => e.start(a) - e.start(b));
    out.upcoming = futureS.slice(0, 8).map(s => item(sv(e, s, uid), true));
    const evs = e.db.events.filter(x => x.published);
    const evVM = x => { const price = e.evPrice(x), left = x.cap ? x.cap - e.evTaken(x.id) : null;
      return { id: x.id, name: x.name, sub: x.sub || '', hasSub: !!x.sub, img: h.res(x.img), dateLabel: x.date ? h.fmtDL(x.date) : 'Dates on enquiry', timeLabel: x.start ? `${h.fmtT(x.start)} – ${h.fmtT(x.finish)}` : '', host: x.host, venue: x.venue,
        priceLabel: price == null ? 'Enquire' : price === 0 ? 'Free' : h.gbp(price), spaces: left == null ? '' : left <= 0 ? 'Fully booked' : `${left} places left`, open: go('event', { eid: x.id }) }; };
    out.featured = evs.map(evVM); out.hasFeatured = evs.length > 0;
    const IMG = h.IMG;
    out.img = IMG;

    // timetable
    const fl = S.cF, q = S.cQ.trim().toLowerCase();
    out.days = days(S.cDay, uid, e, ds => set({ cDay: ds }));
    out.cats = ['All', ...h.CATS].map(l => ({ label: l === 'All' ? 'All Classes' : l, ...chip(S.cCat === l), pick: () => set({ cCat: l }) }));
    out.q = S.cQ; out.onQ = ev => set({ cQ: ev.target.value }); out.clearQ = () => set({ cQ: '' }); out.searching = !!q;
    const nF = (fl.ins ? 1 : 0) + (fl.format ? 1 : 0) + (fl.level ? 1 : 0);
    out.filterLabel = nF ? `Filters · ${nF}` : 'Filters'; out.filterBtn = chip(nF > 0); out.openFilters = () => set({ cSheet: 'filters' });
    const match = s => { const c = e.cls(s.cls), ins = e.ins(s.ins);
      if (S.cCat !== 'All' && c.cat !== S.cCat) return false; if (fl.ins && s.ins !== fl.ins) return false;
      if (fl.format && !(s.format === fl.format || (s.format === 'Hybrid' && fl.format !== 'Hybrid'))) return false; if (fl.level && c.level !== fl.level) return false;
      if (q && !(c.name + ' ' + ins.name + ' ' + c.cat + ' ' + c.desc).toLowerCase().includes(q)) return false; return true; };
    const tl = e.db.sessions.filter(s => (q ? e.start(s) > now - 36e5 : s.date === S.cDay) && match(s)).sort((a, b) => e.start(a) - e.start(b));
    out.list = tl.map(s => item(sv(e, s, uid), !!q)); out.listEmpty = tl.length === 0;
    out.dayTitle = q ? `RESULTS FOR “${S.cQ.trim().toUpperCase()}”` : h.fmtDL(S.cDay).toUpperCase();
    out.emptyText = q ? 'No upcoming classes match your search.' : (S.cCat !== 'All' || nF) ? 'No classes match these filters on this day.' : 'There are no classes scheduled on this day.';
    out.resetFilters = () => set({ cCat: 'All', cF: { ins: '', format: '', level: '' }, cQ: '' }); out.hasAnyFilter = S.cCat !== 'All' || nF > 0 || !!q;
    const fpick = (k, v) => () => set({ cF: { ...S.cF, [k]: S.cF[k] === v ? '' : v } });
    out.fIns = e.db.instructors.filter(i => i.active).map(i => ({ label: i.name, ...chip(fl.ins === i.id), pick: fpick('ins', i.id) }));
    out.fFormat = ['In studio', 'Online', 'Hybrid'].map(l => ({ label: l, ...chip(fl.format === l), pick: fpick('format', l) }));
    out.fLevel = [...new Set(h.CLASSES.map(c => c.level))].map(l => ({ label: l, ...chip(fl.level === l), pick: fpick('level', l) }));

    // class detail
    if (sc.cls) {
      const s = e.sess(S.cP.sid), v = sv(e, s, uid), c = v.c, my = v.my, hrs = (e.start(s) - now) / 36e5, set_ = e.db.settings;
      const waitPos = my && my.status === 'waitlisted' ? e.waiting(s.id).findIndex(b => b.id === my.id) + 1 : 0;
      out.s = { ...v, cat: c.cat, dateLong: h.fmtDL(s.date), timeRange: `${v.time} – ${v.endTime}`, loc: e.loc(s), desc: c.desc, access: c.access || 'Please let your instructor know about any injuries or conditions before class. Accessibility details for this class are to be confirmed by the studio.',
        priceLine: c.price === 0 ? 'Free class' : `${h.gbp(c.price)} drop-in`, passLine: c.pass ? 'Included in adult class passes' : c.cat === 'Kids & Teens' ? 'Included in the Kids Term Pass' : 'Not included in class passes — paid separately',
        availLabel: `${v.taken} of ${s.cap} places booked`, policy: `Cancel at least ${set_.cancelHours} hours before the class starts to have your pass credit returned or your payment refunded. Later cancellations aren’t refunded, though exceptions are at management’s discretion.`,
        isOnline: s.format !== 'In studio', showLink: !!my && my.status === 'confirmed' && s.format !== 'In studio', hideLink: !(my && my.status === 'confirmed') && s.format !== 'In studio', link: s.link,
        booked: !!my && my.status === 'confirmed', bookedPay: my ? payLabel(e, my) : '', cancel: () => my && set({ cSheet: 'cancel', sheetBid: my.id }), openIns: go('instructor', { iid: s.ins }), insRole: v.ins.role,
        waitMsg: my && my.status === 'waitlisted' ? `You’re number ${waitPos} on the waitlist.` : my && my.status === 'offered' ? `A place has opened for you — claim it by ${h.fmtTsT(my.offerUntil)}.` : '', hasWaitMsg: !!my && ['waitlisted', 'offered'].includes(my.status) };
      out.s.hasWaitMsg = out.s.hasWaitMsg; 
      let label = 'Book This Class', act = () => openBook(s.id), dis = false, note = c.price === 0 ? 'Free' : c.pass ? h.gbp(c.price) + ' or 1 pass credit' : h.gbp(c.price);
      if (v.cancelled) { label = 'Session Cancelled'; dis = true; }
      else if (v.past) { label = hrs > -s.dur / 60 ? 'Class Has Started' : 'Class Finished'; dis = true; }
      else if (my && my.status === 'confirmed') { label = 'Cancel Booking'; act = out.s.cancel; note = 'You’re booked'; }
      else if (my && my.status === 'offered') { label = 'Claim Your Place'; }
      else if (my && my.status === 'waitlisted') { label = 'Leave Waitlist'; act = () => { e.cancelB(my.id, uid); cmp.commit(); toast('You’ve left the waitlist.'); }; note = 'On the waitlist'; }
      else if (v.full) { if (s.waitlist) { label = 'Join Waitlist'; act = () => joinWait(s.id); note = 'Class is full'; } else { label = 'Fully Booked'; dis = true; } }
      out.bar = { label, act, dis, enabled: !dis, note, outline: !!my && ['confirmed', 'waitlisted'].includes(my.status), solid: !dis && !(my && ['confirmed', 'waitlisted'].includes(my.status)) };
    }

    // book sheet
    if (S.cSheet === 'book' && S.sheetSid) {
      const s = e.sess(S.sheetSid), c = e.cls(s.cls), el = e.eligible(uid, c), bk = S.bk;
      const opts = el.map(p => ({ key: 'pass:' + p.id, label: e.prod(p.product).name, sub: `Uses 1 credit · ${e.bal(p.id)} left · expires ${h.fmtTs(p.expires)}` }));
      if (c.price === 0) opts.push({ key: 'free', label: 'Free class', sub: 'No payment needed' }); else opts.push({ key: 'card', label: `Pay ${h.gbp(c.price)} by card`, sub: 'Secure hosted checkout · TEST MODE' });
      const mineAny = e.activePasses(uid).length > 0;
      out.bk = { name: c.name, when: `${h.fmtDL(s.date)} · ${h.fmtT(s.start)} – ${h.fmtT(h.endT(s.start, s.dur))}`, ins: e.ins(s.ins).name, loc: e.loc(s),
        opts: opts.map(o => ({ ...o, bd: bk.opt === o.key ? '#EC0F8C' : '#E5E7EB', bw: bk.opt === o.key ? '2px' : '1px', dot: bk.opt === o.key ? '#EC0F8C' : '#FFFFFF', pick: () => set({ bk: { ...S.bk, opt: o.key, err: '' } }) })),
        isCard: bk.opt === 'card', ok: chip(bk.card === 'ok'), fail: chip(bk.card === 'fail'), pickOk: () => set({ bk: { ...S.bk, card: 'ok', err: '' } }), pickFail: () => set({ bk: { ...S.bk, card: 'fail', err: '' } }),
        btn: bk.busy ? 'Processing…' : bk.opt === 'card' ? `Confirm & Pay ${h.gbp(c.price)}` : 'Confirm Booking', busy: bk.busy, notBusy: !bk.busy, err: bk.err, hasErr: !!bk.err,
        noPassNote: mineAny && !el.length ? 'Your current passes don’t cover this class.' : '', hasNoPassNote: mineAny && !el.length,
        policy: `Free cancellation up to ${e.db.settings.cancelHours} hours before the class.`,
        confirm: () => { if (cmp.busy) return; cmp.busy = true; set({ bk: { ...S.bk, busy: true, err: '' } });
          setTimeout(() => { const b = cmp.state.bk; const method = b.opt.startsWith('pass:') ? 'pass' : b.opt; const r = e.book(uid, s.id, { method, passId: b.opt.slice(5), card: b.card }); cmp.busy = false; cmp.commit();
            if (r.err) return cmp.setState({ bk: { ...cmp.state.bk, busy: false, err: r.err } });
            cmp.setState(x => ({ cSheet: null, lastB: r.booking.id, cStack: [...x.cStack, { screen: x.cScreen, p: x.cP }], cScreen: 'confirm', cP: { bid: r.booking.id } })); }, 900); } };
    }
    if (sc.confirm) {
      const b = e.db.bookings.find(x => x.id === S.cP.bid), s = e.sess(b.session), c = e.cls(s.cls), pay = b.payment && e.db.payments.find(p => p.id === b.payment);
      out.conf = { name: c.name, when: `${h.fmtDL(s.date)} · ${h.fmtT(s.start)} – ${h.fmtT(h.endT(s.start, s.dur))}`, ins: e.ins(s.ins).name, loc: e.loc(s),
        pay: b.method === 'pass' ? `1 credit used · ${e.bal(b.pass)} left on your ${e.prod(e.db.passes.find(p => p.id === b.pass).product).name}` : b.method === 'card' ? `${h.gbp(b.amount)} paid by card (test mode)` : 'Free — no payment taken',
        ref: pay ? pay.ref : b.id, isOnline: s.format !== 'In studio', link: s.link, policy: `Need to cancel? Do it from My Bookings at least ${e.db.settings.cancelHours} hours before the class to have your ${b.method === 'pass' ? 'credit returned' : 'payment refunded'}.` };
      out.addCal = () => { const f = d => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z', a = new Date(e.start(s)), z = new Date(a.getTime() + s.dur * 6e4);
        download('sonshine-' + c.id + '.ics', ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Sonshine Hollistic//Booking//EN', 'BEGIN:VEVENT', 'UID:' + b.id + '@sonshinehollistic.co.uk', 'DTSTAMP:' + f(new Date()), 'DTSTART:' + f(a), 'DTEND:' + f(z), 'SUMMARY:' + c.name + ' with ' + e.ins(s.ins).name, 'LOCATION:' + (s.format === 'Online' ? 'Online' : h.STUDIO.address), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n'), 'text/calendar'); };
      out.confDone = () => cmp.cTab('bookings'); out.confMore = () => cmp.cTab('timetable');
    }

    // bookings
    const bt = S.btab;
    const groups = {
      upcoming: myBk.filter(b => b.status === 'confirmed' && e.start(e.sess(b.session)) > now),
      waitlist: myBk.filter(b => ['waitlisted', 'offered'].includes(b.status) && e.start(e.sess(b.session)) > now),
      past: myBk.filter(b => ['attended', 'noshow'].includes(b.status) || (b.status === 'confirmed' && e.start(e.sess(b.session)) <= now)),
      cancelled: myBk.filter(b => b.status === 'cancelled')
    };
    const myEv = uid ? e.db.eventBookings.filter(b => b.user === uid && b.status === 'confirmed') : [];
    const myReq = uid ? e.db.requests.filter(r => r.user === uid) : [];
    out.btabs = [['upcoming', 'Upcoming'], ['waitlist', 'Waitlist'], ['past', 'Past'], ['cancelled', 'Cancelled']].map(([k, l]) => ({ label: `${l}${groups[k].length + (k === 'upcoming' ? myEv.length : 0) ? ' · ' + (groups[k].length + (k === 'upcoming' ? myEv.length : 0)) : ''}`, ...chip(bt === k), pick: () => set({ btab: k }) }));
    const sorted = groups[bt].slice().sort((a, b) => (bt === 'past' || bt === 'cancelled' ? -1 : 1) * (e.start(e.sess(a.session)) - e.start(e.sess(b.session))));
    out.blist = sorted.map(b => { const s = e.sess(b.session), c = e.cls(s.cls), d = h.parseD(s.date), stt = b.status === 'confirmed' && e.start(s) <= now ? st('completed') : st(b.status);
      const pos = b.status === 'waitlisted' ? e.waiting(s.id).findIndex(x => x.id === b.id) + 1 : 0;
      return { id: b.id, day: d.getDate(), mon: h.MON[d.getMonth()].toUpperCase(), dow: h.DOW[d.getDay()], name: c.name, time: `${h.fmtT(s.start)} · ${s.dur} min`, ins: 'with ' + e.ins(s.ins).name, statusLabel: stt.label, statusBg: stt.bg, statusFg: stt.fg,
        pay: payLabel(e, b), hasPay: !!b.method, canCancel: b.status === 'confirmed' && e.start(s) > now, cancel: () => set({ cSheet: 'cancel', sheetBid: b.id }), open: go('cls', { sid: s.id }),
        isOffered: b.status === 'offered', claim: () => openBook(s.id), offerLabel: b.offerUntil ? `Claim by ${h.fmtTsT(b.offerUntil)}` : '',
        isWait: b.status === 'waitlisted', waitLabel: `Number ${pos} on the waitlist`, leave: () => { e.cancelB(b.id, uid); cmp.commit(); toast('You’ve left the waitlist.'); },
        sessionCancelled: s.status === 'cancelled' };
    });
    out.evList = bt === 'upcoming' ? myEv.map(b => { const x = e.db.events.find(z => z.id === b.event); const d = h.parseD(x.date); return { day: d.getDate(), mon: h.MON[d.getMonth()].toUpperCase(), name: x.name, time: `${h.fmtT(x.start)} – ${h.fmtT(x.finish)}`, pay: b.amount ? `${h.gbp(b.amount)} paid (test)` : 'Free', open: go('event', { eid: x.id }) }; }) : [];
    out.hasEvList = out.evList.length > 0;
    out.reqList = bt === 'upcoming' ? myReq.map(r => { const svc = h.SERVICES.find(z => z.id === r.service), x = st(r.status); return { name: svc.name, when: `Preferred: ${h.fmtD(r.date)} · ${r.slot}`, statusLabel: x.label, statusBg: x.bg, statusFg: x.fg }; }) : [];
    out.hasReqList = out.reqList.length > 0;
    out.bEmpty = !!u && out.blist.length === 0 && !out.hasEvList && !out.hasReqList;
    out.bEmptyText = { upcoming: 'You have no upcoming classes booked.', waitlist: 'You’re not on any waitlists.', past: 'Your class history will appear here.', cancelled: 'No cancelled bookings.' }[bt];

    if (S.cSheet === 'cancel' && S.sheetBid) {
      const b = e.db.bookings.find(x => x.id === S.sheetBid), s = e.sess(b.session), c = e.cls(s.cls), hrs = (e.start(s) - now) / 36e5, late = hrs < e.db.settings.cancelHours;
      const what = b.method === 'pass' ? 'your pass credit will be returned' : b.method === 'card' ? `your ${h.gbp(b.amount)} payment will be refunded (test mode)` : 'your place will be released';
      out.cx = { name: c.name, when: `${h.fmtDL(s.date)} · ${h.fmtT(s.start)}`, late, onTime: !late,
        msg: late ? `This class starts in ${hrs < 1 ? 'under an hour' : Math.floor(hrs) + ' hour' + (Math.floor(hrs) === 1 ? '' : 's')}, inside the ${e.db.settings.cancelHours}-hour notice period, so ${b.method === 'pass' ? 'your credit won’t be returned' : b.method === 'card' ? 'your payment won’t be refunded' : 'no refund applies'}. If something has come up, WhatsApp Son or Ruth — exceptions are at management’s discretion.` : `You’re cancelling more than ${e.db.settings.cancelHours} hours before the class, so ${what}.`,
        confirm: () => { const r = e.cancelB(b.id, uid); cmp.commit(); set({ cSheet: null }); toast(r.err || (r.restore ? 'Booking cancelled — ' + (b.method === 'pass' ? 'credit returned.' : b.method === 'card' ? 'refund issued (test).' : 'place released.') : 'Booking cancelled. No credit returned (late cancellation).')); } };
    }

    // passes
    const mine = uid ? e.db.passes.filter(p => p.user === uid) : [];
    const scopeLabel = pr => pr.scope === 'kids' ? 'Kids & Teen classes' : 'All adult classes marked “or pass”';
    out.wallet = mine.filter(p => p.expires > now && e.bal(p.id) > 0).map(p => { const pr = e.prod(p.product), b = e.bal(p.id); return { name: pr.name, left: b, total: p.total, expires: h.fmtTs(p.expires), elig: scopeLabel(pr), pct: Math.round(b / p.total * 100) + '%', bought: h.fmtTs(p.purchased) }; });
    out.hasWallet = out.wallet.length > 0; out.noWallet = !!u && !out.hasWallet;
    out.old = mine.filter(p => !(p.expires > now && e.bal(p.id) > 0)).map(p => ({ name: e.prod(p.product).name, state: p.expires <= now ? 'Expired ' + h.fmtTs(p.expires) : 'All credits used', used: `${p.total - e.bal(p.id)} of ${p.total} used` }));
    out.hasOld = out.old.length > 0;
    out.products = e.db.products.filter(p => p.onSale).map(p => ({ name: p.name, desc: p.desc, price: h.gbp(p.price), credits: `${p.credits} classes`, validity: `Valid ${p.weeks} weeks from purchase`, elig: scopeLabel(p), per: `${h.gbp(Math.round(p.price / p.credits))} per class`,
      buy: () => { if (!uid) return needAuth({ screen: 'passes', p: {} }); set({ cSheet: 'buy', sheetPid: p.id, bk: { opt: 'card', card: 'ok', busy: false, err: '' } }); } }));
    out.ledger = mine.flatMap(p => e.db.ledger.filter(l => l.pass === p.id)).sort((a, b) => b.at - a.at).slice(0, 12).map(l => ({ when: h.fmtTs(l.at), reason: l.reason, delta: (l.delta > 0 ? '+' : '') + l.delta, fg: l.delta > 0 ? '#166534' : '#374151' }));
    out.hasLedger = out.ledger.length > 0;
    if (S.cSheet === 'buy' && S.sheetPid) { const p = e.prod(S.sheetPid), bk = S.bk;
      out.buy = { name: p.name, price: h.gbp(p.price), credits: `${p.credits} classes`, validity: `Valid for ${p.weeks} weeks from today`, elig: scopeLabel(p), ok: chip(bk.card === 'ok'), fail: chip(bk.card === 'fail'),
        pickOk: () => set({ bk: { ...S.bk, card: 'ok', err: '' } }), pickFail: () => set({ bk: { ...S.bk, card: 'fail', err: '' } }), btn: bk.busy ? 'Verifying payment…' : `Pay ${h.gbp(p.price)}`, busy: bk.busy, err: bk.err, hasErr: !!bk.err,
        confirm: () => { if (cmp.busy) return; cmp.busy = true; set({ bk: { ...S.bk, busy: true, err: '' } }); setTimeout(() => { const r = e.buyPass(uid, p.id, cmp.state.bk.card); cmp.busy = false; cmp.commit();
          if (r.err) return cmp.setState({ bk: { ...cmp.state.bk, busy: false, err: r.err } }); cmp.setState({ cSheet: null }); toast(`${p.name} added — ${p.credits} credits ready to use.`); }, 1100); } }; }

    // profile
    if (u) { out.prefs = { rem: tg(u.prefs.reminders), mkt: tg(u.prefs.marketing) };
      out.togRem = () => { u.prefs.reminders = !u.prefs.reminders; cmp.commit(); }; out.togMkt = () => { u.prefs.marketing = !u.prefs.marketing; cmp.commit(); }; }
    else out.prefs = { rem: tg(false), mkt: tg(false) };
    out.signOut = () => { cmp.setState({ cUid: null, cScreen: 'welcome', cStack: [], cSheet: null }, () => cmp.persist()); };
    out.askDelete = () => set({ cSheet: 'del' }); out.delRequested = !!u && e.db.deleteRequests.some(d => d.user === uid);
    out.confirmDelete = () => { e.db.deleteRequests.push({ user: uid, at: Date.now() }); e.audit(uid, 'Account deletion requested'); cmp.commit(); set({ cSheet: null }); toast('Request received — we’ll confirm by email.'); };

    // events
    out.eventList = evs.map(evVM);
    if (sc.event) { const x = e.db.events.find(z => z.id === S.cP.eid), v = evVM(x), price = e.evPrice(x), mineB = uid && e.db.eventBookings.some(b => b.event === x.id && b.user === uid && b.status === 'confirmed');
      const closed = x.deadline && now > h.dt(x.deadline, '23:59').getTime(), full = x.cap && e.evTaken(x.id) >= x.cap;
      out.ev = { ...v, desc: x.desc, info: x.info, hasInfo: !!x.info, deadline: x.deadline ? 'Book by ' + h.fmtDL(x.deadline) : '', hasDeadline: !!x.deadline,
        priceLine: price == null ? 'Pricing on enquiry' : price === 0 ? 'Free' : h.gbp(price), early: x.early != null && price === x.early ? `Early-bird price until ${h.fmtD(x.earlyUntil)} (then ${h.gbp(x.price)})` : '', hasEarly: x.early != null && price === x.early,
        policy: 'Event places follow their own policy — please contact the studio if you can no longer attend.', booked: !!mineB };
      let label = price === 0 ? 'Book My Place' : 'Book & Pay ' + (price != null ? h.gbp(price) : ''), act = () => { if (!uid) return needAuth({ screen: 'event', p: S.cP }); set({ cSheet: 'eventBook', sheetEid: x.id, bk: { opt: 'card', card: 'ok', busy: false, err: '' } }); }, dis = false;
      if (x.kind === 'enquire') { label = 'Enquire About This Training'; act = () => { if (!uid) return needAuth({ screen: 'event', p: S.cP }); set({ cSheet: 'request', sheetSvc: 'enquiry:' + x.id, rq: { date: '', slot: 'Any time', msg: '', err: '', done: false } }); }; }
      else if (mineB) { label = 'You’re Booked ✓'; dis = true; } else if (closed) { label = 'Bookings Closed'; dis = true; } else if (full) { label = 'Fully Booked'; dis = true; }
      out.evBar = { label, act, dis, enabled: !dis, note: out.ev.priceLine };
    }
    if (S.cSheet === 'eventBook' && S.sheetEid) { const x = e.db.events.find(z => z.id === S.sheetEid), price = e.evPrice(x), bk = S.bk;
      out.evb = { name: x.name, when: `${h.fmtDL(x.date)} · ${h.fmtT(x.start)} – ${h.fmtT(x.finish)}`, isPaid: price > 0, ok: chip(bk.card === 'ok'), fail: chip(bk.card === 'fail'),
        pickOk: () => set({ bk: { ...S.bk, card: 'ok', err: '' } }), pickFail: () => set({ bk: { ...S.bk, card: 'fail', err: '' } }), btn: bk.busy ? 'Processing…' : price > 0 ? `Pay ${h.gbp(price)}` : 'Confirm Place', err: bk.err, hasErr: !!bk.err, busy: bk.busy,
        confirm: () => { if (cmp.busy) return; cmp.busy = true; set({ bk: { ...S.bk, busy: true, err: '' } }); setTimeout(() => { const r = e.bookEvent(uid, x.id, cmp.state.bk.card); cmp.busy = false; cmp.commit();
          if (r.err) return cmp.setState({ bk: { ...cmp.state.bk, busy: false, err: r.err } }); cmp.setState({ cSheet: null }); toast('You’re booked onto ' + x.name + '.'); }, 900); } }; }

    // services
    out.svcList = h.SERVICES.map(s => ({ ...s, img: h.res(s.img), open: go('service', { svc: s.id }) }));
    if (sc.service) { const s = h.SERVICES.find(z => z.id === S.cP.svc); out.svc = { ...s, img: h.res(s.img), hasCaution: !!s.caution, request: () => { if (!uid) return needAuth({ screen: 'service', p: S.cP }); set({ cSheet: 'request', sheetSvc: s.id, rq: { date: '', slot: '', msg: '', err: '', done: false } }); } }; out.title = s.name; }
    if (S.cSheet === 'request') { const rq = S.rq, isEnq = String(S.sheetSvc).startsWith('enquiry:'), t = new Date(); t.setHours(0, 0, 0, 0);
      const name = isEnq ? e.db.events.find(x => x.id === S.sheetSvc.slice(8)).name : h.SERVICES.find(z => z.id === S.sheetSvc).name;
      out.rq = { name, isEnq, notEnq: !isEnq, msg: rq.msg, onMsg: ev => set({ rq: { ...S.rq, msg: ev.target.value } }), done: rq.done, notDone: !rq.done, err: rq.err, hasErr: !!rq.err,
        dates: Array.from({ length: 10 }, (_, i) => { const ds = h.iso(h.addDays(t, i + 1)); return { label: h.fmtD(ds), ...chip(rq.date === ds), pick: () => set({ rq: { ...S.rq, date: ds, err: '' } }) }; }),
        slots: ['Morning', 'Afternoon', 'Evening'].map(l => ({ label: l, ...chip(rq.slot === l), pick: () => set({ rq: { ...S.rq, slot: l, err: '' } }) })),
        submit: () => { if (isEnq) { if (!rq.msg.trim()) return set({ rq: { ...S.rq, err: 'Please add a short message.' } }); e.db.requests.unshift({ id: h.gid('R'), user: uid, service: 's121', enquiry: name, date: h.iso(new Date()), slot: 'Enquiry', msg: '[Teacher Training enquiry] ' + rq.msg, status: 'pending', created: Date.now() }); e.notify(uid, 'Thanks — your Teacher Training enquiry has been sent.'); }
          else { if (!rq.date || !rq.slot) return set({ rq: { ...S.rq, err: 'Please choose a preferred date and time of day.' } }); e.request(uid, S.sheetSvc, rq.date, rq.slot, rq.msg.trim()); }
          cmp.commit(); set({ rq: { ...S.rq, done: true } }); } };
    }

    // team
    out.team = e.db.instructors.filter(i => i.active).map(i => ({ ...i, open: go('instructor', { iid: i.id }) }));
    if (sc.instructor) { const i = e.ins(S.cP.iid); const ss = futureS.filter(s => s.ins === i.id).slice(0, 6).map(s => item(sv(e, s, uid), true));
      out.insD = { ...i, sessions: ss, has: ss.length > 0, none: ss.length === 0 }; out.title = i.name; }
    out.studio = h.STUDIO; out.mapUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(h.STUDIO.address);
    out.waSon = 'https://wa.me/447747729300'; out.waRuth = 'https://wa.me/447957134792'; out.mailto = 'mailto:' + h.STUDIO.email;
    out.cancelHours = e.db.settings.cancelHours; out.offerHours = e.db.settings.offerHours;
    out.notifs = myNotifs.slice(0, 30).map(n => ({ text: n.text, when: h.fmtTsT(n.at) })); out.noNotifs = myNotifs.length === 0;
    return out;
  }

  // ---------------- OWNER ----------------
  function owner(cmp) {
    const h = H(), e = cmp.eng, S = cmp.state, uid = S.oUid, me = uid ? e.user(uid) : null, scr = S.oScreen, set = o => cmp.setState(o), now = Date.now();
    const go = (screen, p) => () => cmp.oGo(screen, p || {});
    const toast = m => cmp.toast('o', m);
    const TABS = ['dash', 'sessions', 'bookings', 'customers', 'more'];
    const isTab = TABS.includes(scr);
    const sc = {}; ['login', 'dash', 'sessions', 'session', 'newSession', 'bookings', 'customers', 'customer', 'more', 'requests', 'events', 'products', 'payments', 'reports', 'instructors', 'settings', 'audit'].forEach(k => sc[k] = scr === k);
    const titles = { session: 'Session', newSession: 'Add Sessions', customer: 'Customer', requests: 'Appointment Requests', events: 'Events & Workshops', products: 'Passes & Pricing', payments: 'Payments', reports: 'Reports', instructors: 'Instructors', settings: 'Studio Settings', audit: 'Audit Log' };
    const tabC = {}; TABS.forEach(t => tabC[t] = scr === t ? '#EC0F8C' : '#6B7280');
    const navs = {}; TABS.forEach(t => navs[t] = () => cmp.oTab(t));
    ['requests', 'events', 'products', 'payments', 'reports', 'instructors', 'settings', 'audit'].forEach(k => navs[k] = go(k));
    const confirm = (title, body, label, run) => set({ oSheet: 'confirm', oConfirm: { title, body, label, run } });
    const safe = fn => { try { const r = fn(); cmp.commit(); return r || {}; } catch (er) { toast('Not authorised.'); return { err: er.message }; } };
    const out = { sc, title: titles[scr] || '', headerTab: isTab, headerBack: !isTab && scr !== 'login', back: () => cmp.oBack(), showTabs: scr !== 'login', tab: tabC, go: navs,
      toast: S.oToast, hasToast: !!S.oToast, sheetOpen: !!S.oSheet, closeSheet: () => set({ oSheet: null }), sh: { confirm: S.oSheet === 'confirm', booking: S.oSheet === 'booking', adjust: S.oSheet === 'adjust' },
      cf: S.oConfirm || {}, runConfirm: () => { const c = S.oConfirm; set({ oSheet: null }); c && c.run && c.run(); },
      me: me ? { name: me.first + ' ' + me.last, role: me.role === 'owner' ? 'Owner' : 'Administrator', ini: (me.first[0] + me.last[0]).toUpperCase() } : {} };
    // login
    const L = S.oForm;
    Object.assign(out, { of: L, ofOn: { email: ev => set({ oForm: { ...S.oForm, email: ev.target.value, err: '' } }), pw: ev => set({ oForm: { ...S.oForm, pw: ev.target.value, err: '' } }) }, loginErr: L.err, hasLoginErr: !!L.err,
      login: () => { const x = e.db.users.find(z => z.email.toLowerCase() === L.email.trim().toLowerCase());
        if (!x || x.pw !== h.pwHash(L.pw)) return set({ oForm: { ...L, err: 'That email and password don’t match an account.' } });
        if (!e.isStaff(x.id)) { e.audit(x.id, 'Blocked attempt to access studio management'); cmp.commit(); return set({ oForm: { ...L, err: 'This account doesn’t have studio access. Customer accounts can’t open the management area.' } }); }
        cmp.setState({ oUid: x.id, oScreen: 'dash', oStack: [], oForm: { ...L, pw: '' } }, () => cmp.persist()); },
      signOut: () => cmp.setState({ oUid: null, oScreen: 'login', oStack: [], oSheet: null }, () => cmp.persist()) });
    if (!me) return out;

    const today = h.iso(new Date());
    const ov = s => { const v = sv(e, s, null); const w = e.waiting(s.id).length; return { ...v, open: go('session', { sid: s.id }), occ: `${v.taken}/${s.cap}`, barBg: v.taken >= s.cap ? '#BE185D' : '#EC0F8C', wait: w ? `${w} waiting` : '', hasWait: w > 0, statusLabel: v.cancelled ? 'Cancelled' : v.past ? 'Finished' : v.full ? 'Full' : `${v.left} left` }; };
    const todayS = e.db.sessions.filter(s => s.date === today).sort((a, b) => e.start(a) - e.start(b));
    const todayB = e.db.bookings.filter(b => todayS.some(s => s.id === b.session) && window.SonshineEngine.HOLDS.includes(b.status));
    const pend = e.db.requests.filter(r => r.status === 'pending');
    const failed7 = e.db.payments.filter(p => p.status === 'failed' && p.at > now - 7 * 864e5);
    out.greet = `${greetWord()}, ${me.first}`; out.todayLabel = h.fmtDL(today);
    out.stats = [
      { label: 'Booked today', value: String(todayB.length), sub: `${todayS.filter(s => s.status !== 'cancelled').length} classes` },
      { label: 'Places left today', value: String(todayS.filter(s => s.status !== 'cancelled' && e.start(s) > now).reduce((a, s) => a + Math.max(0, s.cap - e.taken(s.id)), 0)), sub: 'in upcoming classes' },
      { label: 'Pending requests', value: String(pend.length), sub: 'appointments to review' },
      { label: 'Payment issues', value: String(failed7.length), sub: 'failed in last 7 days' }];
    out.todayList = todayS.map(ov); out.todayEmpty = todayS.length === 0;
    const soon = e.db.sessions.filter(s => s.status !== 'cancelled' && e.start(s) > now && e.start(s) < now + 7 * 864e5 && e.taken(s.id) / s.cap >= 0.8);
    out.attention = [
      ...soon.slice(0, 3).map(s => ({ text: `${e.cls(s.cls).name}, ${h.fmtD(s.date)} ${h.fmtT(s.start)} is ${e.taken(s.id) >= s.cap ? 'full' : 'nearly full'} (${e.taken(s.id)}/${s.cap})${e.waiting(s.id).length ? ' · ' + e.waiting(s.id).length + ' waiting' : ''}`, label: 'View', act: go('session', { sid: s.id }) })),
      ...(pend.length ? [{ text: `${pend.length} appointment request${pend.length > 1 ? 's' : ''} awaiting a reply`, label: 'Review', act: navs.requests }] : []),
      ...(failed7.length ? [{ text: `${failed7.length} failed card payment${failed7.length > 1 ? 's' : ''} this week`, label: 'Payments', act: navs.payments }] : []),
      ...(e.db.deleteRequests.length ? [{ text: `${e.db.deleteRequests.length} account deletion request${e.db.deleteRequests.length > 1 ? 's' : ''}`, label: 'Audit', act: navs.audit }] : [])];
    out.hasAttention = out.attention.length > 0; out.noAttention = !out.hasAttention;
    out.recent = e.db.bookings.filter(b => b.created <= now).sort((a, b) => b.created - a.created).slice(0, 5).map(b => { const s = e.sess(b.session), x = st(b.status), u = e.user(b.user); return { name: `${u.first} ${u.last}`, cls: `${e.cls(s.cls).name} · ${h.fmtD(s.date)}`, when: h.fmtTsT(b.created), statusLabel: x.label, statusBg: x.bg, statusFg: x.fg }; });
    out.newCust = e.db.users.filter(u => u.role === 'customer').sort((a, b) => b.joined - a.joined).slice(0, 3).map(u => ({ name: `${u.first} ${u.last}`, joined: 'Joined ' + h.fmtTs(u.joined), open: go('customer', { uid: u.id }) }));

    // sessions
    out.days = days(S.oDay, null, e, ds => set({ oDay: ds }));
    const dayS = e.db.sessions.filter(s => s.date === S.oDay).sort((a, b) => e.start(a) - e.start(b));
    out.list = dayS.map(ov); out.listEmpty = dayS.length === 0; out.dayTitle = h.fmtDL(S.oDay).toUpperCase();
    out.addSession = () => { set({ oNew: { ...S.oNew, date: S.oDay } }); cmp.oGo('newSession', {}); };
    if (sc.session) { const s = e.sess(S.oP.sid), v = ov(s);
      out.ss = { ...v, dateLong: h.fmtDL(s.date), timeRange: `${v.time} – ${v.endTime}`, insId: s.ins, cap: s.cap, notCancelled: !v.cancelled, waitTg: tg(s.waitlist), link: s.link, hasLink: !!s.link };
      out.capDec = () => { const r = safe(() => e.setCap(s.id, s.cap - 1, uid)); if (r.err) toast(r.err); };
      out.capInc = () => safe(() => e.setCap(s.id, s.cap + 1, uid));
      out.toggleWait = () => safe(() => { e.staffOnly(uid); s.waitlist = !s.waitlist; e.audit(uid, `Waitlist ${s.waitlist ? 'enabled' : 'disabled'} for ${e.cls(s.cls).name} ${h.fmtD(s.date)}`); });
      out.insOpts = e.db.instructors.filter(i => i.active || i.id === s.ins).map(i => ({ id: i.id, name: i.name }));
      out.changeIns = ev => { safe(() => e.setIns(s.id, ev.target.value, uid)); toast('Instructor updated — booked customers notified.'); };
      const roster = e.db.bookings.filter(b => b.session === s.id && ['confirmed', 'attended', 'noshow', 'offered'].includes(b.status));
      out.roster = roster.map(b => { const u = e.user(b.user), x = st(b.status);
        return { name: `${u.first} ${u.last}`, method: payLabel(e, b), statusLabel: x.label, statusBg: x.bg, statusFg: x.fg, att: () => safe(() => e.setAttendance(b.id, 'attended', uid)), ns: () => safe(() => e.setAttendance(b.id, 'noshow', uid)),
          attSel: chip(b.status === 'attended'), nsSel: chip(b.status === 'noshow'), canMark: b.status !== 'offered',
          cancel: () => confirm(`Cancel ${u.first}’s booking?`, 'As a staff override, their credit or payment will be returned regardless of the notice period. This is recorded in the audit log.', 'Cancel & Restore', () => { safe(() => e.cancelB(b.id, uid, true)); toast('Booking cancelled — customer notified.'); }) }; });
      out.rosterEmpty = roster.length === 0;
      out.waitlist = e.waiting(s.id).map((b, i) => ({ name: `${i + 1}. ${e.user(b.user).first} ${e.user(b.user).last}`, when: 'Joined ' + h.fmtTsT(b.created) })); out.hasWaitlist = out.waitlist.length > 0;
      out.custOpts = [{ id: '', name: 'Choose a customer…' }, ...e.db.users.filter(u => u.role === 'customer' && u.active && !e.myB(u.id, s.id)).map(u => ({ id: u.id, name: `${u.first} ${u.last}` }))];
      out.manualSel = S.oManual; out.onManual = ev => set({ oManual: ev.target.value });
      out.addManual = () => { if (!S.oManual) return toast('Choose a customer first.'); const r = safe(() => e.manualBook(s.id, S.oManual, uid)); set({ oManual: '' }); toast(r.err || 'Customer added and notified.'); };
      out.cancelSession = () => confirm('Cancel this session?', `All ${v.taken} booked customers will be notified and have their credit or payment returned. This can’t be undone.`, 'Cancel Session', () => { safe(() => e.cancelSession(s.id, uid)); toast('Session cancelled — customers notified.'); });
    }
    if (sc.newSession) { const N = S.oNew, t = new Date(); t.setHours(0, 0, 0, 0); const nset = k => ev => set({ oNew: { ...S.oNew, [k]: ['cap', 'repeat'].includes(k) ? Number(ev.target.value) : ev.target.value } });
      out.nf = N; out.nfOn = { cls: nset('cls'), date: nset('date'), start: nset('start'), cap: nset('cap'), repeat: nset('repeat') };
      out.clsOpts = h.CLASSES.map(c => ({ id: c.id, name: `${c.name} — ${e.ins(c.ins).name}` }));
      out.dateOpts = Array.from({ length: 28 }, (_, i) => { const ds = h.iso(h.addDays(t, i)); return { id: ds, name: h.fmtDL(ds) }; });
      out.repeatOpts = [1, 4, 8, 12].map(n => ({ id: n, name: n === 1 ? 'Just once' : `Weekly for ${n} weeks` }));
      out.nfSummary = `${e.cls(N.cls).name} · ${h.fmtD(N.date)} at ${h.fmtT(N.start || '00:00')} · ${N.cap} places${N.repeat > 1 ? ` · repeats weekly ×${N.repeat}` : ''}`;
      out.createSession = () => { if (!N.start || !N.cap || N.cap < 1) return toast('Please add a start time and capacity.'); const n = safe(() => e.createSessions(N, uid)); cmp.setState({ oDay: N.date }); cmp.oBack(); toast(`${typeof n === 'number' ? n : 1} session${n > 1 ? 's' : ''} added to the timetable.`); };
    }

    // bookings list
    const bq = S.oQ.trim().toLowerCase();
    out.oq = S.oQ; out.onQ = ev => set({ oQ: ev.target.value });
    out.bst = [['all', 'All'], ['confirmed', 'Confirmed'], ['waitlisted', 'Waitlist'], ['cancelled', 'Cancelled'], ['attended', 'Attended']].map(([k, l]) => ({ label: l, ...chip(S.oBStatus === k), pick: () => set({ oBStatus: k }) }));
    const bl = e.db.bookings.filter(b => { const s = e.sess(b.session), u = e.user(b.user);
      if (S.oBStatus !== 'all' && !(b.status === S.oBStatus || (S.oBStatus === 'waitlisted' && b.status === 'offered'))) return false;
      if (bq && !(`${u.first} ${u.last} ${u.email} ${e.cls(s.cls).name} ${e.ins(s.ins).name}`.toLowerCase().includes(bq))) return false; return Math.abs(e.start(s) - now) < 14 * 864e5; })
      .sort((a, b) => Math.abs(e.start(e.sess(a.session)) - now) - Math.abs(e.start(e.sess(b.session)) - now)).slice(0, 60);
    out.blist = bl.map(b => { const s = e.sess(b.session), u = e.user(b.user), x = st(b.status); return { name: `${u.first} ${u.last}`, cls: e.cls(s.cls).name, when: `${h.fmtD(s.date)} · ${h.fmtT(s.start)}`, statusLabel: x.label, statusBg: x.bg, statusFg: x.fg, pay: payLabel(e, b), open: () => set({ oSheet: 'booking', oSel: b.id }) }; });
    out.bEmpty = bl.length === 0;
    if (S.oSheet === 'booking' && S.oSel) { const b = e.db.bookings.find(x => x.id === S.oSel), s = e.sess(b.session), u = e.user(b.user), x = st(b.status), late = (e.start(s) - now) / 36e5 < e.db.settings.cancelHours;
      const pay = b.payment && e.db.payments.find(p => p.id === b.payment);
      out.bd = { name: `${u.first} ${u.last}`, email: u.email, cls: e.cls(s.cls).name, when: `${h.fmtDL(s.date)} · ${h.fmtT(s.start)}`, ins: e.ins(s.ins).name, statusLabel: x.label, statusBg: x.bg, statusFg: x.fg, pay: payLabel(e, b) || '—', ref: pay ? pay.ref : '—',
        canAct: ['confirmed', 'attended', 'noshow', 'waitlisted', 'offered'].includes(b.status), isActive: b.status !== 'cancelled', lateNote: late ? `Inside the ${e.db.settings.cancelHours}-hour window — a standard cancellation won’t return credit or payment.` : `Outside the ${e.db.settings.cancelHours}-hour window — credit/payment is returned as standard.`,
        att: () => { safe(() => e.setAttendance(b.id, 'attended', uid)); set({ oSheet: null }); toast('Marked as attended.'); }, ns: () => { safe(() => e.setAttendance(b.id, 'noshow', uid)); set({ oSheet: null }); toast('Marked as no-show.'); },
        cancelStd: () => { const r = safe(() => e.cancelB(b.id, uid, false)); set({ oSheet: null }); toast(r.err || (r.restore ? 'Cancelled — credit/payment returned.' : 'Cancelled — no credit returned (late).')); },
        cancelOverride: () => { const r = safe(() => e.cancelB(b.id, uid, true)); set({ oSheet: null }); toast(r.err || 'Cancelled with override — credit/payment returned.'); },
        openCustomer: () => { set({ oSheet: null }); cmp.oGo('customer', { uid: u.id }); } };
    }

    // customers
    const cq = S.oCQ.trim().toLowerCase();
    out.cq = S.oCQ; out.onCQ = ev => set({ oCQ: ev.target.value });
    out.clist = e.db.users.filter(u => u.role === 'customer' && (!cq || `${u.first} ${u.last} ${u.email}`.toLowerCase().includes(cq))).sort((a, b) => a.first.localeCompare(b.first))
      .map(u => { const cr = e.activePasses(u.id).reduce((a, p) => a + e.bal(p.id), 0); return { name: `${u.first} ${u.last}`, email: u.email, ini: (u.first[0] + u.last[0]).toUpperCase(), credits: cr ? `${cr} credits` : 'No pass', inactive: !u.active, open: go('customer', { uid: u.id }) }; });
    out.cEmpty = out.clist.length === 0;
    if (sc.customer) { const u = e.user(S.oP.uid), bks = e.db.bookings.filter(b => b.user === u.id).sort((a, b) => e.start(e.sess(b.session)) - e.start(e.sess(a.session)));
      const att = bks.filter(b => b.status === 'attended').length, ns = bks.filter(b => b.status === 'noshow').length;
      out.cu = { name: `${u.first} ${u.last}`, email: u.email, ini: (u.first[0] + u.last[0]).toUpperCase(), joined: 'Customer since ' + h.fmtTs(u.joined), verified: u.verified ? 'Email verified' : 'Email not verified',
        stats: `${att} attended · ${ns} no-show · ${bks.filter(b => b.status === 'cancelled').length} cancelled`, marketing: u.prefs.marketing ? 'Opted in to marketing' : 'Essential messages only',
        passes: e.db.passes.filter(p => p.user === u.id).sort((a, b) => b.purchased - a.purchased).map(p => ({ name: e.prod(p.product).name, bal: `${e.bal(p.id)} / ${p.total} credits`, exp: (p.expires > now ? 'Expires ' : 'Expired ') + h.fmtTs(p.expires), active: p.expires > now,
          adjust: () => set({ oSheet: 'adjust', oSel: p.id, oAdj: { delta: 1, reason: '', err: '' } }) })),
        bookings: bks.slice(0, 8).map(b => { const s = e.sess(b.session), x = st(b.status); return { cls: e.cls(s.cls).name, when: `${h.fmtD(s.date)} · ${h.fmtT(s.start)}`, statusLabel: x.label, statusBg: x.bg, statusFg: x.fg, open: () => set({ oSheet: 'booking', oSel: b.id }) }; }),
        payments: e.db.payments.filter(p => p.user === u.id).sort((a, b) => b.at - a.at).slice(0, 6).map(p => { const x = st(p.status); return { label: p.label, amount: h.gbp(p.amount), when: h.fmtTs(p.at), statusLabel: x.label, statusBg: x.bg, statusFg: x.fg }; }),
        notes: S.oNotes != null ? S.oNotes : u.notes, activeTg: tg(u.active), activeLabel: u.active ? 'Account active' : 'Account deactivated' };
      out.cu.hasPasses = out.cu.passes.length > 0; out.cu.noPasses = !out.cu.hasPasses; out.cu.hasBookings = out.cu.bookings.length > 0; out.cu.hasPayments = out.cu.payments.length > 0;
      out.onNotes = ev => set({ oNotes: ev.target.value });
      out.saveNotes = () => { safe(() => { e.staffOnly(uid); u.notes = S.oNotes != null ? S.oNotes : u.notes; e.audit(uid, `Updated internal notes for ${u.first} ${u.last}`); }); set({ oNotes: null }); toast('Internal note saved (never shown to the customer).'); };
      out.toggleActive = () => confirm(u.active ? `Deactivate ${u.first}’s account?` : `Reactivate ${u.first}’s account?`, u.active ? 'They won’t be able to sign in or book. Their history is kept.' : 'They’ll be able to sign in and book again.', u.active ? 'Deactivate' : 'Reactivate', () => safe(() => { e.staffOnly(uid); u.active = !u.active; e.audit(uid, `${u.active ? 'Reactivated' : 'Deactivated'} account ${u.email}`); }));
      out.grantPass = () => { safe(() => { e.staffOnly(uid); const pr = e.prod('p5'); const pass = { id: h.gid('PS'), user: u.id, product: 'p5', purchased: now, expires: now + pr.weeks * 7 * 864e5, total: 1, comp: true }; e.db.passes.push(pass); e.db.ledger.push({ id: h.gid('L'), pass: pass.id, delta: 1, reason: 'Complimentary credit from studio', at: now, by: uid }); e.notify(u.id, 'The studio has added a complimentary class credit to your account.'); e.audit(uid, `Granted 1 complimentary credit to ${u.first} ${u.last}`); }); toast('Complimentary credit granted.'); };
    }
    if (S.oSheet === 'adjust' && S.oSel) { const p = e.db.passes.find(x => x.id === S.oSel), A = S.oAdj;
      out.adj = { name: e.prod(p.product).name, bal: e.bal(p.id), delta: (A.delta > 0 ? '+' : '') + A.delta, after: e.bal(p.id) + A.delta, reason: A.reason, err: A.err, hasErr: !!A.err,
        dec: () => set({ oAdj: { ...A, delta: A.delta - 1 === 0 ? -1 : A.delta - 1, err: '' } }), inc: () => set({ oAdj: { ...A, delta: A.delta + 1 === 0 ? 1 : A.delta + 1, err: '' } }),
        onReason: ev => set({ oAdj: { ...A, reason: ev.target.value, err: '' } }),
        save: () => { const r = safe(() => e.adjustCredits(p.id, A.delta, A.reason, uid)); if (r.err) return set({ oAdj: { ...A, err: r.err } }); set({ oSheet: null }); toast('Credits adjusted and logged.'); } };
    }

    // requests
    out.pendingCount = pend.length; out.hasPending = pend.length > 0;
    out.reqs = e.db.requests.slice().sort((a, b) => (a.status === 'pending' ? -1 : 1) - (b.status === 'pending' ? -1 : 1) || b.created - a.created).map(r => { const svc = h.SERVICES.find(z => z.id === r.service), u = e.user(r.user), x = st(r.status);
      return { name: `${u.first} ${u.last}`, svc: r.enquiry || svc.name, pref: r.slot === 'Enquiry' ? 'General enquiry' : `Preferred ${h.fmtD(r.date)} · ${r.slot}`, msg: r.msg ? `“${r.msg}”` : '', hasMsg: !!r.msg, received: 'Received ' + h.fmtTsT(r.created), statusLabel: x.label.replace(' — not confirmed', ''), statusBg: x.bg, statusFg: x.fg,
        isPending: r.status === 'pending', isAccepted: r.status === 'accepted', accept: () => { safe(() => e.setRequest(r.id, 'accepted', uid)); toast('Accepted — customer notified.'); }, decline: () => { safe(() => e.setRequest(r.id, 'declined', uid)); toast('Declined — customer notified.'); }, complete: () => safe(() => e.setRequest(r.id, 'completed', uid)) }; });
    out.reqEmpty = out.reqs.length === 0;
    // events
    out.evs = e.db.events.map(x => ({ name: x.name, dateLabel: x.date ? `${h.fmtD(x.date)} · ${h.fmtT(x.start)}` : 'Dates on enquiry', booked: x.cap ? `${e.evTaken(x.id)} / ${x.cap} booked` : 'Enquiries only', price: x.price == null ? 'On enquiry' : h.gbp(x.price) + (x.early != null ? ` · early-bird ${h.gbp(x.early)}` : ''), pub: tg(x.published), pubLabel: x.published ? 'Published' : 'Hidden',
      toggle: () => safe(() => { e.staffOnly(uid); x.published = !x.published; e.audit(uid, `${x.published ? 'Published' : 'Unpublished'} event ${x.name}`); }) }));
    // products
    out.prods = e.db.products.map(p => { const sold = e.db.payments.filter(x => x.kind === 'Pass' && x.label === p.name && x.status !== 'failed');
      return { name: p.name, meta: `${p.credits} credits · ${p.weeks} weeks · ${p.scope === 'kids' ? 'Kids & Teens' : 'Adult classes'}`, price: h.gbp(p.price), sold: `${sold.length} sold · ${h.gbp(sold.reduce((a, x) => a + x.amount, 0))}`, sale: tg(p.onSale), saleLabel: p.onSale ? 'On sale' : 'Not on sale',
        toggle: () => safe(() => { e.staffOnly(uid); p.onSale = !p.onSale; e.audit(uid, `${p.name} ${p.onSale ? 'put on sale' : 'withdrawn from sale'}`); }),
        input: S.oPrice[p.id] != null ? S.oPrice[p.id] : (p.price / 100).toFixed(2), onInput: ev => set({ oPrice: { ...S.oPrice, [p.id]: ev.target.value } }),
        save: () => { const v = parseFloat(S.oPrice[p.id]); if (isNaN(v) || v < 0) return toast('Enter a valid price.'); const old = p.price; safe(() => { e.staffOnly(uid); p.price = Math.round(v * 100); e.audit(uid, `${p.name} price changed ${h.gbp(old)} → ${h.gbp(p.price)} (past purchases unchanged)`); }); toast('Price updated for future purchases.'); } }; });
    // payments
    const pq = S.oPQ.trim().toLowerCase();
    out.pq = S.oPQ; out.onPQ = ev => set({ oPQ: ev.target.value });
    out.pays = e.db.payments.filter(p => p.at <= now).filter(p => { const u = e.user(p.user); return !pq || `${u.first} ${u.last} ${p.label} ${p.ref}`.toLowerCase().includes(pq); }).sort((a, b) => b.at - a.at).slice(0, 50)
      .map(p => { const u = e.user(p.user), x = st(p.status); return { name: `${u.first} ${u.last}`, label: p.label, amount: h.gbp(p.amount), ref: p.ref, when: h.fmtTsT(p.at), statusLabel: x.label, statusBg: x.bg, statusFg: x.fg, canRefund: p.status === 'succeeded',
        refund: () => confirm(`Refund ${h.gbp(p.amount)} to ${u.first}?`, `${p.label} · ${p.ref}. In test mode no money moves; in production this calls the payment provider and is confirmed by webhook.`, 'Issue Refund', () => { const r = safe(() => e.refund(p.id, uid)); toast(r.err || 'Refund recorded.'); }) }; });
    // reports
    const P = S.rPeriod, from = now - P * 864e5;
    const pays = e.db.payments.filter(p => p.at >= from && p.at <= now && p.status !== 'failed');
    const gross = pays.reduce((a, p) => a + p.amount, 0), refunds = pays.filter(p => p.status === 'refunded').reduce((a, p) => a + p.amount, 0);
    const pastS = e.db.sessions.filter(s => s.status !== 'cancelled' && e.start(s) >= from && e.start(s) <= now);
    const pastB = e.db.bookings.filter(b => pastS.some(s => s.id === b.session));
    const att = pastB.filter(b => b.status === 'attended').length, ns = pastB.filter(b => b.status === 'noshow').length;
    const occ = pastS.length ? Math.round(pastS.reduce((a, s) => a + e.taken(s.id) / s.cap, 0) / pastS.length * 100) : 0;
    const allB = e.db.bookings.filter(b => b.created >= from && b.created <= now);
    const byCls = {}; pastB.filter(b => ['attended', 'noshow'].includes(b.status)).forEach(b => { const n = e.cls(e.sess(b.session).cls).name; byCls[n] = (byCls[n] || 0) + 1; });
    const top = Object.entries(byCls).sort((a, b) => b[1] - a[1]).slice(0, 5), mx = top.length ? top[0][1] : 1;
    const passPays = pays.filter(p => p.kind === 'Pass');
    out.periods = [7, 30, 90].map(n => ({ label: `Last ${n} days`, ...chip(P === n), pick: () => set({ rPeriod: n }) }));
    out.rep = { gross: h.gbp(gross), refunds: '−' + h.gbp(refunds), net: h.gbp(gross - refunds), bookings: String(allB.length), attendance: att + ns ? Math.round(att / (att + ns) * 100) + '%' : '—', occupancy: occ + '%', classes: String(pastS.length),
      newCust: String(e.db.users.filter(u => u.role === 'customer' && u.joined >= from).length), cancelRate: allB.length ? Math.round(allB.filter(b => b.status === 'cancelled').length / allB.length * 100) + '%' : '—',
      passSales: `${passPays.length} · ${h.gbp(passPays.reduce((a, p) => a + p.amount, 0))}`, credits: String(e.db.ledger.filter(l => l.delta < 0 && l.at >= from && l.at <= now).length) };
    out.popular = top.map(([name, n]) => ({ name, count: String(n), pct: Math.round(n / mx * 100) + '%' })); out.hasPopular = top.length > 0;
    out.exportCsv = () => { e.audit(uid, `Exported bookings CSV (last ${P} days)`); cmp.commit();
      const rows = [['Booking ID', 'Customer', 'Email', 'Class', 'Date', 'Time', 'Instructor', 'Status', 'Method', 'Amount (GBP)']].concat(pastB.map(b => { const s = e.sess(b.session), u = e.user(b.user); return [b.id, `${u.first} ${u.last}`, u.email, e.cls(s.cls).name, s.date, s.start, e.ins(s.ins).name, b.status, b.method || '', (b.amount / 100).toFixed(2)]; }));
      download(`sonshine-bookings-last-${P}-days.csv`, rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n'), 'text/csv'); toast('CSV downloaded.'); };
    // instructors
    out.insList = e.db.instructors.map(i => ({ name: i.name, role: i.role, ini: i.ini, count: `${e.db.sessions.filter(s => s.ins === i.id && e.start(s) > now && s.status !== 'cancelled').length} upcoming sessions`, act: tg(i.active), actLabel: i.active ? 'Active' : 'Hidden',
      toggle: () => safe(() => { e.staffOnly(uid); i.active = !i.active; e.audit(uid, `${i.active ? 'Reactivated' : 'Deactivated'} instructor ${i.name}`); }) }));
    // settings
    const ST = e.db.settings, chg = (k, d, min, max, label) => () => safe(() => { e.staffOnly(uid); ST[k] = Math.max(min, Math.min(max, ST[k] + d)); e.audit(uid, `${label} set to ${ST[k]} hours`); });
    out.set = { cancelHours: ST.cancelHours, offerHours: ST.offerHours, rem: tg(ST.reminders) };
    out.chDec = chg('cancelHours', -1, 0, 72, 'Cancellation notice'); out.chInc = chg('cancelHours', 1, 0, 72, 'Cancellation notice');
    out.ohDec = chg('offerHours', -1, 1, 24, 'Waitlist claim window'); out.ohInc = chg('offerHours', 1, 1, 24, 'Waitlist claim window');
    out.togRem = () => safe(() => { e.staffOnly(uid); ST.reminders = !ST.reminders; e.audit(uid, `Class reminders ${ST.reminders ? 'enabled' : 'disabled'}`); });
    out.studio = h.STUDIO;
    out.resetDemo = () => confirm('Reset demonstration data?', 'All demo bookings, passes, payments and changes are replaced with a fresh demo set. Use “remove demo data” in production setup instead.', 'Reset Demo', () => cmp.resetDemo());
    out.isOwner = me.role === 'owner';
    out.auditList = e.db.audit.slice(0, 60).map(a => ({ when: h.fmtTsT(a.at), actor: a.actor, action: a.action }));
    return out;
  }

  window.SonshineViews = { customer, owner };
})();
