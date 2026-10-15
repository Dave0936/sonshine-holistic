// Date, time and money helpers. Dates are 'YYYY-MM-DD' strings in the studio's local time (Europe/London).
export const pad = (n: number) => String(n).padStart(2, '0');
export const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const parseD = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const dt = (date: string, time: string) => { const d = parseD(date); const [h, mi] = time.split(':').map(Number); d.setHours(h, mi, 0, 0); return d; };
export const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DOWL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const MONL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const hhmm = (t: string) => t.slice(0, 5);
export const fmtT = (t: string) => { let [h, m] = t.split(':').map(Number); const ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12; return `${h}:${pad(m)}${ap}`; };
export const endT = (t: string, dur: number) => { const [h, m] = t.split(':').map(Number); const x = h * 60 + m + dur; return `${pad(Math.floor(x / 60) % 24)}:${pad(x % 60)}`; };
export const gbp = (p: number) => '£' + (p / 100).toFixed(2);
export const fmtD = (s: string) => { const d = parseD(s); return `${DOW[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`; };
export const fmtDL = (s: string) => { const d = parseD(s); return `${DOWL[d.getDay()]} ${d.getDate()} ${MONL[d.getMonth()]}`; };
export const ms = (ts: string | number) => (typeof ts === 'number' ? ts : new Date(ts).getTime());
export const fmtTs = (ts: string | number) => { const d = new Date(ms(ts)); return `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`; };
export const fmtTsT = (ts: string | number) => { const d = new Date(ms(ts)); return `${d.getDate()} ${MON[d.getMonth()]}, ${fmtT(pad(d.getHours()) + ':' + pad(d.getMinutes()))}`; };
export const todayIso = () => iso(new Date());
export const greetWord = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };

// Images stored as 'assets/…' ship with the app; anything else is a full URL.
export const img = (p: string) => (p && p.startsWith('assets/') ? import.meta.env.BASE_URL + p : p);
const U = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=75`;
export const IMG = {
  hero: img('assets/hero-home.jpg'), heroClasses: img('assets/hero-classes.jpg'), mats: img('assets/studio-mats.png'),
  exterior: img('assets/studio-exterior.png'), buddha: img('assets/studio-buddha.png'), kids: img('assets/kids-bigger.png'),
  teen: img('assets/kids-teen.png'), logo: img('assets/logo.webp'), bowl: U('photo-1593810451410-8fbb422cc15e')
};

export const download = (name: string, text: string, type: string) => {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
};
