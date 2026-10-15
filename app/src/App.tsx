import { useEffect, useState } from 'react';
import CustomerApp from './customer/CustomerApp';
import OwnerApp from './owner/OwnerApp';
import { makeClient } from './lib/studio';
import { IMG } from './lib/format';
import type { Session } from '@supabase/supabase-js';

const customerClient = makeClient('sonshine-customer');
const ownerClient = makeClient('sonshine-owner');

// ?app=owner opens Studio Management on a phone; ?layout=customer|owner shows one phone on a computer.
const params = new URLSearchParams(location.search);

// Staff who sign in on the customer side are moved to Studio Management with the same session.
const staffSignIn = (show: () => void) => async (session: Session) => {
  const { error } = await ownerClient.auth.setSession({ access_token: session.access_token, refresh_token: session.refresh_token });
  if (error) return 'Couldn’t open Studio Management — please sign in there directly.';
  show();
  return null;
};

export default function App() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 600);
  const [mApp, setMApp] = useState(params.get('app') === 'owner' ? 'owner' : 'customer');
  useEffect(() => { const f = () => setMobile(window.innerWidth < 600); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f); }, []);

  if (mobile) {
    const to = (a: string) => () => { setMApp(a); const u = new URL(location.href); if (a === 'owner') u.searchParams.set('app', 'owner'); else u.searchParams.delete('app'); history.replaceState(null, '', u); };
    return mApp === 'owner'
      ? <OwnerApp sb={ownerClient} mobile onSwitch={to('customer')} />
      : <CustomerApp sb={customerClient} mobile onSwitch={to('owner')} onStaffSignIn={staffSignIn(to('owner'))} />;
  }

  const layout = params.get('layout');
  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-blush)', padding: '32px 20px 72px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
      <header style={{ width: '100%', maxWidth: 900, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src={IMG.logo} alt="Sonshine Hollistic" style={{ height: 56, background: '#fff', borderRadius: 12, padding: '6px 10px', boxShadow: '0 4px 6px -1px rgba(0,0,0,.08)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ font: '700 24px/30px var(--font-display)', color: 'var(--text-strong)' }}>Sonshine Hollistic App</span>
            <span style={{ font: '400 14px/20px var(--font-body)', color: 'var(--text-muted)' }}>Customer booking app and studio management, sharing one booking system</span>
          </div>
        </div>
        <div style={{ font: '500 12px/18px var(--font-body)', color: 'var(--brand-rose-ink)', background: '#fff', borderRadius: 8, padding: '8px 12px', maxWidth: 340, boxShadow: '0 1px 2px rgba(0,0,0,.05)' }}>
          Demo data — prices, dates and capacities are demonstration values. Payments are test mode only. Try emma@demo.test or son@demo.test · password demo1234
        </div>
      </header>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 56, justifyContent: 'center', alignItems: 'flex-start' }}>
        {layout !== 'owner' && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <span style={{ font: '600 12px/20px var(--font-body)', letterSpacing: '.08em', textTransform: 'uppercase', color: '#fff', background: 'var(--brand-rose)', borderRadius: 6, padding: '4px 12px' }}>Customer App</span>
          <CustomerApp sb={customerClient} mobile={false} onStaffSignIn={staffSignIn(() => document.querySelector('[aria-label="Studio Management"]')?.scrollIntoView({ behavior: 'smooth' }))} />
        </div>}
        {layout !== 'customer' && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <span style={{ font: '600 12px/20px var(--font-body)', letterSpacing: '.08em', textTransform: 'uppercase', color: '#fff', background: '#0F172A', borderRadius: 6, padding: '4px 12px' }}>Studio Management</span>
          <OwnerApp sb={ownerClient} mobile={false} />
        </div>}
      </div>
    </div>
  );
}
