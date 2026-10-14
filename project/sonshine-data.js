// Sonshine Hollistic — demo data + date helpers. ALL prices, capacities, dates and schedules here are DEMONSTRATION values pending studio confirmation.
(function () {
  const pad = n => String(n).padStart(2, '0');
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const parseD = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const dt = (date, time) => { const d = parseD(date); const [h, mi] = time.split(':').map(Number); d.setHours(h, mi, 0, 0); return d; };
  const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const DOWL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MONL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const fmtT = t => { let [h, m] = t.split(':').map(Number); const ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12; return `${h}:${pad(m)}${ap}`; };
  const endT = (t, dur) => { const [h, m] = t.split(':').map(Number); const x = h * 60 + m + dur; return `${pad(Math.floor(x / 60) % 24)}:${pad(x % 60)}`; };
  const gbp = p => '£' + (p / 100).toFixed(2);
  const fmtD = s => { const d = parseD(s); return `${DOW[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`; };
  const fmtDL = s => { const d = parseD(s); return `${DOWL[d.getDay()]} ${d.getDate()} ${MONL[d.getMonth()]}`; };
  const fmtTs = ts => { const d = new Date(ts); return `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`; };
  const fmtTsT = ts => { const d = new Date(ts); return `${d.getDate()} ${MON[d.getMonth()]}, ${fmtT(pad(d.getHours()) + ':' + pad(d.getMinutes()))}`; };
  const gid = p => p + Math.random().toString(36).slice(2, 9).toUpperCase();
  const hash = s => { let x = 5381; for (const ch of String(s)) x = ((x * 33) ^ ch.charCodeAt(0)) >>> 0; return x; };
  const pwHash = s => 'demo$' + hash('sonshine-salt:' + s).toString(16);
  const U = id => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=75`;

  const IMG = {
    hero: 'assets/hero-home.jpg', heroClasses: 'assets/hero-classes.jpg', mats: 'assets/studio-mats.png',
    exterior: 'assets/studio-exterior.png', buddha: 'assets/studio-buddha.png', kids: 'assets/kids-bigger.png', teen: 'assets/kids-teen.png',
    bowl: U('photo-1593810451410-8fbb422cc15e'), reiki: U('photo-1599659593072-10de2e109486'),
    sunset: U('photo-1544367567-0f2fcb009e0b'), fog: U('photo-1447452001602-7090c7ab2db3')
  };

  // Team copy from sonshinehollistic.co.uk/team (subject to client confirmation)
  const INS = [
    { id: 'son', name: 'Son', role: 'Co-Founder & Yoga Instructor', ini: 'SA', bio: 'Passionate about bringing yoga to everyone, Son specialises in accessible and inclusive yoga practices.' },
    { id: 'ruth', name: 'Ruth', role: 'Co-Founder & Yoga Instructor', ini: 'RH', bio: 'Ruth brings years of experience and a nurturing approach to every class she teaches.' },
    { id: 'jacqui', name: 'Jacqui', role: 'Yoga Instructor', ini: 'J', bio: 'Jacqui specialises in pregnancy yoga, providing safe and nurturing classes for expectant mothers throughout their journey.' },
    { id: 'magda', name: 'Magda', role: 'Yoga Instructor', ini: 'M', bio: 'Magda focuses on Pilates, helping students build core strength, improve posture, and enhance overall body awareness.' },
    { id: 'katie', name: 'Katie', role: 'Yoga Instructor', ini: 'K', bio: 'Katie runs Chair Yoga Workshops specifically designed for those dealing with chronic pain and stiffness, making yoga accessible to everyone.' },
    { id: 'mel', name: 'Mel', role: 'Yoga Instructor', ini: 'M', bio: 'Mel focuses on Core Strength yoga, combining traditional poses with targeted exercises to build a strong and stable foundation.' },
    { id: 'kelly', name: 'Kelly', role: 'Yoga Instructor', ini: 'K', bio: 'Kelly teaches Kundalini yoga, guiding students through transformative practices that awaken inner energy and consciousness.' },
    { id: 'morven', name: 'Morven', role: 'Yoga Instructor', ini: 'M', bio: 'Morven is a newly qualified teacher who is passionate about helping students build core strength while having fun and moving to the beat.' },
    { id: 'caroline', name: 'Caroline', role: 'Yoga Instructor', ini: 'C', bio: 'Caroline is a newly qualified teacher who leads soulful flow classes designed to help you feel nurtured and energised on your yoga journey.' },
    { id: 'lyndsay', name: 'Lyndsay', role: 'Yoga Instructor', ini: 'L', bio: 'Lyndsay is an experienced hatha and vinyasa flow yoga teacher, passionate about yoga being available to everyone.' }
  ];

  const C = (o) => Object.assign({ dur: 60, level: 'All levels', price: 900, pass: true, format: 'In studio', access: '' }, o);
  const CLASSES = [
    C({ id: 'gentle', name: 'Gentle Yoga', cat: 'Gentle', ins: 'ruth', level: 'Beginner friendly', img: IMG.mats, desc: 'Slow, mindful movement and longer holds to ease stiffness and quieten a busy mind. A lovely place to start if you are new to yoga.', access: 'Blocks and bolsters provided. Options are offered for every posture.' }),
    C({ id: 'vin', name: 'Vinyasa Flow', cat: 'Vinyasa & Flow', ins: 'lyndsay', format: 'Hybrid', img: IMG.heroClasses, desc: 'Breath-led flowing sequences that build heat, strength and focus, finishing with a long relaxation.' }),
    C({ id: 'pil', name: 'Pilates', cat: 'Pilates', ins: 'magda', img: IMG.mats, desc: 'Mat Pilates to build core strength, improve posture and enhance overall body awareness.' }),
    C({ id: 'chair', name: 'Chair Yoga', cat: 'Chair Yoga', ins: 'katie', level: 'Beginner friendly', img: IMG.buddha, desc: 'Yoga supported by a chair, designed for those dealing with chronic pain and stiffness — making yoga accessible to everyone.', access: 'Seated and standing options; no need to get down onto the floor.' }),
    C({ id: 'core', name: 'Core Strength Yoga', cat: 'Core Strength', ins: 'mel', level: 'Some experience helpful', img: IMG.heroClasses, desc: 'Traditional poses combined with targeted exercises to build a strong and stable foundation.' }),
    C({ id: 'kund', name: 'Kundalini Yoga', cat: 'Kundalini', ins: 'kelly', img: IMG.fog, desc: 'Breath, movement, mantra and meditation in transformative practices that awaken inner energy and consciousness.' }),
    C({ id: 'hatha', name: 'Hatha Yoga', cat: 'Hatha', ins: 'son', img: IMG.hero, desc: 'Classic postures held with attention to alignment and breath. Calm, grounding and suitable for everyone.' }),
    C({ id: 'live', name: 'Live-Stream Hatha', cat: 'Hatha', ins: 'son', format: 'Online', img: IMG.mats, desc: 'Join Son from your own living room. Your joining link appears in your booking once it is confirmed.', access: 'You will need a mat and a little floor space.' }),
    C({ id: 'preg', name: 'Pregnancy Yoga', cat: 'Pregnancy', ins: 'jacqui', price: 1000, pass: false, level: 'All stages', img: IMG.buddha, desc: 'Safe and nurturing classes for expectant mothers throughout their pregnancy journey.' }),
    C({ id: 'shred', name: 'Yoga Shred', cat: 'Yoga Shred', ins: 'morven', level: 'Some experience helpful', img: IMG.heroClasses, desc: 'A high-energy, music-led class mixing yoga with strength work. Fun, sweaty and moving to the beat.' }),
    C({ id: 'soul', name: 'Soulful Flow', cat: 'Vinyasa & Flow', ins: 'caroline', img: IMG.hero, desc: 'A soulful, gently paced flow designed to help you feel nurtured and energised.' }),
    C({ id: 'sleepy', name: 'Sleepy Yoga & Sound Bath', cat: 'Sleepy Yoga', ins: 'ruth', dur: 75, img: IMG.bowl, desc: 'Slow, restorative yoga to wind down your weekend, finishing with a mini sound bath for deep relaxation.' }),
    C({ id: 'kids', name: 'Kids Yoga (5–8)', cat: 'Kids & Teens', ins: 'son', dur: 45, price: 600, pass: false, level: 'Ages 5–8', img: IMG.kids, desc: 'Playful yoga with stories, games and breathing to help little ones build confidence, focus and calm.' }),
    C({ id: 'teen', name: 'Teen Yoga', cat: 'Kids & Teens', ins: 'son', price: 600, pass: false, level: 'Ages 12–16', img: IMG.teen, desc: 'Strength, flexibility and simple tools for managing stress, in a relaxed and supportive group.' })
  ];
  const CATS = ['Vinyasa & Flow', 'Hatha', 'Gentle', 'Pilates', 'Chair Yoga', 'Core Strength', 'Kundalini', 'Pregnancy', 'Yoga Shred', 'Sleepy Yoga', 'Kids & Teens'];

  const WEEK = [
    { dow: 1, t: '09:30', c: 'gentle' }, { dow: 1, t: '18:00', c: 'vin' }, { dow: 1, t: '19:15', c: 'pil' },
    { dow: 2, t: '10:00', c: 'chair' }, { dow: 2, t: '18:30', c: 'core' }, { dow: 2, t: '19:45', c: 'kund' },
    { dow: 3, t: '09:30', c: 'hatha' }, { dow: 3, t: '16:45', c: 'kids', cap: 12 }, { dow: 3, t: '18:00', c: 'preg', cap: 8 }, { dow: 3, t: '19:15', c: 'shred' },
    { dow: 4, t: '10:00', c: 'pil' }, { dow: 4, t: '18:00', c: 'soul' }, { dow: 4, t: '19:30', c: 'live', cap: 30 },
    { dow: 5, t: '09:30', c: 'vin' }, { dow: 5, t: '18:00', c: 'gentle' },
    { dow: 6, t: '09:00', c: 'hatha' }, { dow: 6, t: '10:30', c: 'teen', cap: 12 },
    { dow: 0, t: '10:00', c: 'core' }, { dow: 0, t: '19:00', c: 'sleepy' }
  ];

  const PRODUCTS = [
    { id: 'p5', name: '5 Class Pass', desc: 'Five classes to use across our adult timetable.', price: 4000, credits: 5, weeks: 8, scope: 'adult', onSale: true },
    { id: 'p10', name: '10 Class Pass', desc: 'Best value for a regular practice.', price: 7500, credits: 10, weeks: 12, scope: 'adult', onSale: true },
    { id: 'pkids', name: 'Kids Term Pass', desc: 'Six kids or teen classes for your little yogi.', price: 3000, credits: 6, weeks: 10, scope: 'kids', onSale: true }
  ];

  // Services copy from /soundHealing and /reiki (prices published on the site)
  const SERVICES = [
    { id: 's121', name: 'Mind·Body·Soul 121', practitioner: 'Ruth', img: IMG.bowl, duration: '60 or 90 minutes', price: '£60 for 60 minutes · £80 for 90 minutes', location: 'Barden House, Livingston', desc: 'A one-to-one session with Ruth including meditation, breathwork, yoga and a sound bath, with the option of a short reiki treatment during your relaxation. All personalised to your individual needs — perfect when your body, mind and soul need a little nourishment, or as a gift for someone else.', prep: 'Ruth will reach out beforehand so you can explain what you would like to get from the session.', caution: 'Sound healing might not be suitable if you are in the early stages of pregnancy. Anyone with serious mental health issues, sound-induced epilepsy or a pacemaker should consult a doctor before attending.' },
    { id: 'sreiki', name: 'Reiki Treatment', practitioner: 'Ruth & Sonja', img: IMG.reiki, duration: '60 minutes', price: '£40 per session', location: 'The Snug, Livingston — details sent when you book', desc: 'Reiki is a system of natural healing developed in Japan at the end of the 19th century by Mikao Usui. A gentle, relaxing hands-on treatment where healing vibrations are channelled through the practitioner’s hands — suitable for people of all ages.', prep: 'The Snug is at Sonja’s home; we will send the details once your appointment is confirmed.', caution: '' },
    { id: 'sprivate', name: 'Private One-to-One Yoga', practitioner: 'Son', img: IMG.buddha, duration: 'To suit you', price: 'Price on request', location: 'Barden House or online', desc: 'A personalised session built around your body, goals and experience — ideal if you are new to yoga or want to deepen your practice.', prep: 'Tell us a little about what you are looking for and Son will be in touch.', caution: '' }
  ];

  const EVENTS = today => { const d = n => iso(addDays(today, n)); return [
    { id: 'e-bath', name: 'Full Moon Sound Bath', img: IMG.bowl, date: d(9), start: '19:30', finish: '21:00', host: 'Ruth', venue: 'Barden House, Livingston', price: 2000, early: 1500, earlyUntil: d(3), cap: 20, deadline: d(8), published: true, kind: 'book', desc: 'An evening of deep relaxation as crystal and Tibetan singing bowls, gongs and chimes wash over you.', info: 'Mats, bolsters and blankets provided. Arrive 10 minutes early to settle in.' },
    { id: 'e-morning', name: 'Yoga & Sound Healing Morning', img: IMG.mats, date: d(16), start: '10:00', finish: '12:30', host: 'Son & Ruth', venue: 'Barden House, Livingston', price: 3500, early: null, earlyUntil: null, cap: 16, deadline: d(15), published: true, kind: 'book', desc: 'A gentle flow with Son followed by a restorative sound bath with Ruth.', info: '' },
    { id: 'e-ytt', name: 'EMPOWER Core Strength Vinyasa & Sacred Cycles', sub: '230 Hour Foundation Teacher Training', img: IMG.sunset, date: null, start: null, finish: null, host: 'Anya Hawkes, Core Revolution Yoga', venue: 'Barden House + Zoom', price: null, cap: null, deadline: null, published: true, kind: 'enquire', desc: 'A revolutionary teacher training combining the science of Biomechanics with the ancient wisdom of Yoga and Sacred Cycles — a blend of Zoom sessions and in-studio weekends, culminating in a studio graduation.', info: 'Dates and pricing on enquiry.' }
  ]; };

  const STUDIO = { name: 'Sonshine Hollistic', address: 'Barden House, 5 Hamilton Square, Livingston, West Lothian, EH54 9JZ', email: 'sonshinehollistic@gmail.com', waSon: '07747 729300', waRuth: '07957 134792', tz: 'Europe/London', currency: 'GBP (£)' };

  const res = p => { if (!p || !p.startsWith('assets/')) return p; const el = document.querySelector('img[data-asset="' + p + '"]'); return (el && el.src) || p; };
  window.SonshineData = { res, pad, iso, addDays, parseD, dt, DOW, DOWL, MON, MONL, fmtT, endT, gbp, fmtD, fmtDL, fmtTs, fmtTsT, gid, hash, pwHash, IMG, INS, CLASSES, CATS, WEEK, PRODUCTS, SERVICES, EVENTS, STUDIO };
})();
