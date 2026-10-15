// Shared building blocks for both apps: the phone frame, headers, tab bar, sheets and small widgets.
import { forwardRef, type CSSProperties, type ReactNode } from 'react';
import { IMG } from './lib/format';
import { SmallButton } from './ds';
import type { SV } from './lib/model';

// ---------------------------------------------------------------- frame
// On a computer the app sits in a 390×844 phone; on a phone it fills the screen.
export function Phone({ mobile, dark, label, children }: { mobile: boolean; dark?: boolean; label: string; children: ReactNode }) {
  const outer: CSSProperties = mobile
    ? { width: '100vw', height: '100dvh' }
    : { width: 410, height: 864, borderRadius: 56, background: '#0F172A', padding: 10, boxShadow: '0 25px 50px -12px rgba(0,0,0,.35)', flex: 'none' };
  const inner: CSSProperties = { position: 'relative', width: '100%', height: '100%', borderRadius: mobile ? 0 : 46, overflow: 'hidden', background: 'var(--surface-alt)', display: 'flex', flexDirection: 'column' };
  return (
    <section aria-label={label} style={outer}>
      <div style={inner}>
        {mobile
          ? <div style={{ height: 'env(safe-area-inset-top, 0px)', flex: 'none', background: dark ? '#0F172A' : '#fff' }} />
          : <StatusBar dark={dark} />}
        {children}
      </div>
    </section>
  );
}

function StatusBar({ dark }: { dark?: boolean }) {
  return (
    <div aria-hidden="true" style={{ height: 44, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px 0 34px',
      font: '600 15px/20px var(--font-ui-alt)', color: dark ? '#fff' : 'var(--text-strong)', background: dark ? '#0F172A' : '#fff' }}>
      <span>9:41</span>
      <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5" width="3" height="7" rx="1" /><rect x="10" y="2" width="3" height="10" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
        <svg width="26" height="12" viewBox="0 0 26 12" fill="none" stroke="currentColor"><rect x="0.5" y="0.5" width="22" height="11" rx="3" /><rect x="2.5" y="2.5" width="16" height="7" rx="1.5" fill="currentColor" stroke="none" /></svg>
      </span>
    </div>
  );
}

export const Scroll = forwardRef<HTMLDivElement, { children: ReactNode }>(({ children }, ref) => (
  <div ref={ref} className="phone-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>{children}</div>
));

export const Back = ({ onClick, color }: { onClick: () => void; color: string }) => (
  <button className="iconbtn" onClick={onClick} aria-label="Back" style={{ color }}>
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
  </button>
);

export function BackHeader({ title, onBack, dark }: { title: string; onBack: () => void; dark?: boolean }) {
  return (
    <div style={{ height: 56, flex: 'none', display: 'flex', alignItems: 'center', gap: 2, padding: '0 8px', position: 'relative', zIndex: 2,
      ...(dark ? { background: '#0F172A', color: '#fff' } : { background: 'rgba(255,255,255,.9)', backdropFilter: 'blur(8px)', boxShadow: '0 1px 2px rgba(0,0,0,.05)', color: 'var(--text-strong)' }) }}>
      <Back onClick={onBack} color={dark ? '#fff' : 'var(--text-strong)'} />
      <h1 style={{ margin: 0, font: '700 18px/24px var(--font-display)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</h1>
    </div>
  );
}

export const Toast = ({ text }: { text: string }) => text ? <div role="status" aria-live="polite" className="toast">{text}</div> : null;

export function Sheet({ open, onClose, mobile, children }: { open: boolean; onClose: () => void; mobile: boolean; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="sheet-wrap">
      <div className="sheet-bg" onClick={onClose} />
      <div role="dialog" aria-modal="true" className={'sheet phone-scroll' + (mobile ? ' mobile' : '')}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', minHeight: 28 }}>
          <span style={{ width: 40, height: 5, borderRadius: 3, background: '#D1D5DB' }} />
          <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', right: -8, top: -4, width: 44, height: 44, border: 'none', background: 'none', cursor: 'pointer', font: '400 24px/24px var(--font-body)', color: 'var(--text-muted)' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export type TabDef = { key: string; label: string; icon: ReactNode };
export function TabBar({ tabs, active, onPick, mobile, label }: { tabs: TabDef[]; active: string; onPick: (k: string) => void; mobile: boolean; label: string }) {
  return (
    <nav aria-label={label} className={'tabbar' + (mobile ? ' mobile' : '')}>
      {tabs.map(t => (
        <button key={t.key} onClick={() => onPick(t.key)} aria-current={active === t.key ? 'page' : undefined} style={{ color: active === t.key ? '#EC0F8C' : '#6B7280' }}>
          {t.icon}{t.label}
        </button>
      ))}
    </nav>
  );
}

const svg = (children: ReactNode, fill = 'none') => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={fill} stroke={fill === 'none' ? 'currentColor' : 'none'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);
export const ICONS = {
  home: svg(<path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1z" />),
  calendar: svg(<><rect x="3" y="4.5" width="18" height="16.5" rx="2" /><path d="M3 9.5h18M8 2.5v4M16 2.5v4" /></>),
  check: svg(<><path d="M9 11l2.5 2.5L16 9" /><rect x="3" y="3" width="18" height="18" rx="3" /></>),
  ticket: svg(<><path d="M3 8a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 000 4v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 000-4z" /><path d="M14 6v12" strokeDasharray="2 2" /></>),
  user: svg(<><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>),
  dash: svg(<><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>),
  people: svg(<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c1-3.5 3.5-5 6.5-5s5.5 1.5 6.5 5" /><circle cx="17" cy="9" r="2.5" /><path d="M17 14c2.3 0 3.8 1.2 4.5 3.5" /></>),
  more: svg(<><circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" /></>, 'currentColor')
};

// ---------------------------------------------------------------- widgets
export function Toggle({ on, label, sub, onClick, style }: { on: boolean; label?: ReactNode; sub?: string; onClick: () => void; style?: CSSProperties }) {
  const knob = <span className="toggle" style={{ background: on ? '#EC0F8C' : '#D1D5DB' }}><span style={{ transform: `translateX(${on ? 20 : 0}px)` }} /></span>;
  return (
    <button role="switch" aria-checked={on} onClick={onClick} style={{ border: 'none', background: 'none', padding: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left', width: '100%', font: '500 14px/20px var(--font-body)', color: 'var(--text-strong)', ...style }}>
      {label != null && (sub ? <span className="col"><span style={{ font: '500 15px/20px var(--font-body)', color: 'var(--text-strong)' }}>{label}</span><span className="t-meta">{sub}</span></span> : <span>{label}</span>)}
      {knob}
    </button>
  );
}

export function Chip({ on, label, onClick, style }: { on: boolean; label: string; onClick: () => void; style?: CSSProperties }) {
  return <button className="chip" onClick={onClick} aria-pressed={on} style={{ borderColor: on ? '#EC0F8C' : '#E5E7EB', background: on ? '#EC0F8C' : '#fff', color: on ? '#fff' : '#374151', ...style }}>{label}</button>;
}

export const Pill = ({ tone, children, style }: { tone: { bg: string; fg: string }; children: ReactNode; style?: CSSProperties }) =>
  <span className="pill" style={{ background: tone.bg, color: tone.fg, ...style }}>{children}</span>;

export const NavRow = ({ label, onClick, right }: { label: string; onClick: () => void; right?: ReactNode }) => (
  <button className="navrow" onClick={onClick}>{label}<span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{right}<span style={{ color: 'var(--brand-rose)' }}>›</span></span></button>
);

export const Err = ({ text }: { text?: string }) => text ? <div role="alert" className="err">{text}</div> : null;

export const Stepper = ({ value, onDec, onInc, label }: { value: ReactNode; onDec: () => void; onInc: () => void; label: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    <button className="step" onClick={onDec} aria-label={'Decrease ' + label}>−</button>
    <span style={{ minWidth: 40, textAlign: 'center', font: '700 16px/20px var(--font-body)', color: 'var(--text-strong)' }}>{value}</span>
    <button className="step" onClick={onInc} aria-label={'Increase ' + label}>+</button>
  </div>
);

export type Day = { key: string; dow: string; num: number; bg: string; fg: string; sub: string; dot: string; pick: () => void; label: string };
export const DayStrip = ({ days, pad, dots = true }: { days: Day[]; pad: number; dots?: boolean }) => (
  <div className="hscroll" style={{ padding: `2px ${pad}px` }}>
    {days.map(d => (
      <button key={d.key} onClick={d.pick} aria-label={d.label} aria-pressed={d.bg === '#EC0F8C'} style={{ width: 52, height: dots ? 68 : 64, flex: 'none', borderRadius: 12, border: '1px solid #E5E7EB', background: d.bg, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, padding: 0 }}>
        <span style={{ font: '500 11px/14px var(--font-body)', color: d.sub }}>{d.dow}</span>
        <span style={{ font: '700 20px/24px var(--font-display)', color: d.fg }}>{d.num}</span>
        {dots && <span style={{ width: 5, height: 5, borderRadius: '50%', background: d.dot }} />}
      </button>
    ))}
  </div>
);

export const LoadError = ({ text, onRetry }: { text: string; onRetry: () => void }) => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, background: '#fff', textAlign: 'center' }}>
    <img src={IMG.logo} alt="Sonshine Hollistic" style={{ width: 120 }} /><span className="t-small">{text}</span><SmallButton tone="rose" onClick={onRetry}>Try Again</SmallButton>
  </div>
);

export const Spinner = () => <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, background: '#fff' }}>
  <img src={IMG.logo} alt="Sonshine Hollistic" style={{ width: 140, opacity: .9 }} /><div className="spinner" aria-label="Loading" />
</div>;

export const Rows = ({ rows, cols = 1 }: { rows: [string, ReactNode, string?][]; cols?: 1 | 2 }) => (
  <div className="card-lg" style={cols === 2 ? { display: 'grid', gridTemplateColumns: '1fr 1fr' } : { display: 'flex', flexDirection: 'column' }}>
    {rows.map(([k, v, color], i) => {
      const lastRow = cols === 2 ? i >= rows.length - 2 : i === rows.length - 1;
      return (
        <div key={k} style={{ padding: cols === 2 ? '14px 16px' : '12px 16px', borderBottom: lastRow ? 'none' : '1px solid var(--border-default)', borderRight: cols === 2 && i % 2 === 0 ? '1px solid var(--border-default)' : 'none' }}>
          <div style={{ font: '500 12px/16px var(--font-body)', color: 'var(--text-subtle)' }}>{k}</div>
          <div style={{ font: '600 14px/20px var(--font-body)', color: color || 'var(--text-strong)' }}>{v}</div>
        </div>
      );
    })}
  </div>
);

// A timetable entry used on the customer timetable, instructor page and search results.
export type ClassItem = SV & { showDate: boolean; open: () => void; quick: (e?: { stopPropagation?: () => void }) => void; canQuick: boolean; quickLabel: string; booked: boolean; bookedLabel: string };
export function ClassRowItem({ it }: { it: ClassItem }) {
  return (
    <div onClick={it.open} onKeyDown={e => e.key === 'Enter' && it.open()} role="button" tabIndex={0} style={{ display: 'flex', gap: 12, alignItems: 'center', background: '#fff', borderRadius: 12, padding: '14px 12px', boxShadow: '0 1px 3px rgba(0,0,0,.08)', cursor: 'pointer', opacity: it.opacity }}>
      <div style={{ width: 58, flex: 'none', display: 'flex', flexDirection: 'column', gap: 2, borderRight: '1px solid var(--border-default)', paddingRight: 8 }}>
        <span className="t-strong14">{it.time}</span><span className="t-meta">{it.durLabel}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {it.showDate && <span style={{ font: '600 11px/14px var(--font-body)', color: 'var(--brand-rose)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{it.dateLabel}</span>}
        <span className="t-card">{it.name}</span>
        <span style={{ font: '400 12px/17px var(--font-body)', color: 'var(--text-muted)' }}>with {it.insName} · {it.format}</span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 3 }}>
          <span className="tag" style={{ background: 'var(--surface-blush)', color: 'var(--brand-rose-ink)' }}>{it.priceLabel}</span>
          <span className="tag" style={{ background: it.spaceBg, color: it.spaceFg }}>{it.spaceLabel}</span>
        </div>
      </div>
      <div style={{ flex: 'none', display: 'flex', alignItems: 'center' }}>
        {it.booked && <span style={{ font: '600 12px/16px var(--font-body)', color: 'var(--brand-rose)', maxWidth: 64, textAlign: 'right' }}>{it.bookedLabel}</span>}
        {it.canQuick && <span onClick={e => e.stopPropagation()}><SmallButton width={76} onClick={() => it.quick()} style={{ background: 'var(--color-rose-60)' }}>{it.quickLabel}</SmallButton></span>}
      </div>
    </div>
  );
}
