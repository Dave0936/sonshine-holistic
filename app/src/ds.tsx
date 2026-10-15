// Sonshine Hollistic design-system primitives (ported from the Claude Design bundle: Button, GlassButton, SmallButton, Avatar).
import { useState, type CSSProperties, type ReactNode } from 'react';

type Common = { children?: ReactNode; onClick?: () => void; href?: string; target?: string; style?: CSSProperties; disabled?: boolean };

const useHover = () => {
  const [h, setH] = useState(false);
  return [h, { onMouseEnter: () => setH(true), onMouseLeave: () => setH(false) }] as const;
};
const shadowLg = '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)';
const shadowMd = '0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -2px rgba(0,0,0,0.1)';

function Tag({ href, target, onClick, disabled, style, children, hp }: Common & { hp: object }) {
  if (href) return <a href={href} target={target} rel={target ? 'noopener noreferrer' : undefined} style={style} {...hp}>{children}</a>;
  return <button type="button" onClick={onClick} disabled={disabled} style={style} {...hp}>{children}</button>;
}

export function Button({ variant = 'block', fullWidth, ...p }: Common & { variant?: 'hero' | 'block' | 'outline'; fullWidth?: boolean }) {
  const [h, hp] = useHover();
  const base: CSSProperties = {
    boxSizing: 'border-box', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8,
    fontFamily: 'var(--font-body)', fontWeight: 600, whiteSpace: 'nowrap', cursor: p.disabled ? 'default' : 'pointer', textDecoration: 'none', border: 'none',
    transition: 'transform 150ms cubic-bezier(0.4,0,0.2,1), background 150ms, color 150ms', color: 'var(--color-white-solid)', opacity: p.disabled ? 0.7 : 1
  };
  const v: CSSProperties = variant === 'hero'
    ? { padding: '16px 32px', fontSize: 18, lineHeight: '28px', background: h ? 'var(--brand-gradient-rev)' : 'var(--brand-gradient)', boxShadow: shadowLg, transform: h ? 'scale(1.05)' : 'none' }
    : variant === 'block'
      ? { padding: '12px 24px', fontSize: 16, lineHeight: '24px', background: 'var(--brand-gradient)', boxShadow: shadowMd, width: '100%' }
      : { padding: '12px 32px', fontSize: 16, lineHeight: '24px', border: '2px solid var(--color-rose-49)', background: h ? 'var(--color-rose-49)' : 'var(--color-white-solid)',
          color: h ? 'var(--color-white-solid)' : 'var(--color-rose-49)', boxShadow: shadowMd };
  return <Tag {...p} hp={hp} style={{ ...base, ...v, ...(fullWidth ? { width: '100%' } : {}), ...p.style }} />;
}

export function GlassButton(p: Common) {
  const [h, hp] = useHover();
  return <Tag {...p} hp={hp} style={{
    boxSizing: 'border-box', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '12px 24px', borderRadius: 8,
    border: '2px solid var(--color-white-solid)', background: h ? 'var(--color-white-solid)' : 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)', color: h ? 'var(--color-rose-49)' : 'var(--color-white-solid)', fontFamily: 'var(--font-body)', fontWeight: 500,
    fontSize: 16, lineHeight: '24px', whiteSpace: 'nowrap', cursor: 'pointer', textDecoration: 'none', transform: h ? 'scale(1.05)' : 'none',
    transition: 'all 150ms cubic-bezier(0.4,0,0.2,1)', ...p.style
  }} />;
}

const TONES = {
  rose: { bg: 'var(--color-rose-49)', fg: 'var(--color-white-solid)', border: '', flat: false },
  soft: { bg: 'var(--color-rose-60)', fg: 'var(--color-white-solid)', border: '', flat: false },
  whatsapp: { bg: 'var(--color-spring-green-49)', fg: 'var(--color-chartreuse-green-10)', border: '', flat: false },
  outline: { bg: 'transparent', fg: 'var(--color-blue-4)', border: '1px solid rgba(9,9,11,0.1)', flat: true }
};

export function SmallButton({ tone = 'soft', width, ...p }: Common & { tone?: keyof typeof TONES; width?: number }) {
  const [h, hp] = useHover();
  const t = TONES[tone];
  return <Tag {...p} hp={hp} style={{
    boxSizing: 'border-box', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 36, width, padding: '5px 11px',
    borderRadius: 8, border: t.border || '1px solid transparent', background: t.bg, color: t.fg, flex: 'none',
    boxShadow: t.flat ? 'none' : '0px 1px 3px 0px rgba(0,0,0,0.1), 0px 1px 2px -1px rgba(0,0,0,0.1), inset 0px 1px 0px 0px rgba(255,255,255,0.15)',
    fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, lineHeight: '24px', whiteSpace: 'nowrap', cursor: 'pointer', textDecoration: 'none',
    filter: h && !t.flat ? 'brightness(0.94)' : 'none', backgroundColor: t.flat && h ? 'rgba(9,9,11,0.05)' : undefined,
    transition: 'filter 150ms, background-color 150ms', ...p.style
  }} />;
}

export function Avatar({ initials, size = 40 }: { initials: string; size?: number }) {
  return <div aria-hidden="true" style={{
    width: size, height: size, borderRadius: 9999, background: 'var(--color-rose-60)', boxShadow: 'inset 0px 0px 0px 1px rgba(0,0,0,0.05)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-white-solid)', fontFamily: 'var(--font-ui-alt)',
    fontWeight: 400, fontSize: size * 0.48, lineHeight: 1, flexShrink: 0
  }}>{initials}</div>;
}
