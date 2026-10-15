// Studio facts and fixed lists that aren't edited from the app.
export const STUDIO = {
  name: 'Sonshine Hollistic',
  address: 'Barden House, 5 Hamilton Square, Livingston, West Lothian, EH54 9JZ',
  email: 'sonshinehollistic@gmail.com',
  tz: 'Europe/London',
  currency: 'GBP (£)'
};
export const WA_SON = 'https://wa.me/447747729300';
export const WA_RUTH = 'https://wa.me/447957134792';
export const MAP_URL = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(STUDIO.address);
export const MAILTO = 'mailto:' + STUDIO.email;
export const CATS = ['Vinyasa & Flow', 'Hatha', 'Gentle', 'Pilates', 'Chair Yoga', 'Core Strength', 'Kundalini', 'Pregnancy', 'Yoga Shred', 'Sleepy Yoga', 'Kids & Teens'];

export type Tone = { label: string; bg: string; fg: string };
const STATUS: Record<string, Tone> = {
  confirmed: { label: 'Confirmed', bg: '#FCE7F3', fg: '#BE185D' }, waitlisted: { label: 'Waitlisted', bg: '#F3F4F6', fg: '#374151' },
  offered: { label: 'Place offered', bg: '#EC0F8C', fg: '#FFFFFF' }, attended: { label: 'Attended ✓', bg: '#DCFCE7', fg: '#166534' },
  noshow: { label: 'No-show', bg: '#F3F4F6', fg: '#4B5563' }, cancelled: { label: 'Cancelled', bg: '#F3F4F6', fg: '#6B7280' },
  pending: { label: 'Pending — not confirmed', bg: '#FEF9C3', fg: '#854D0E' }, accepted: { label: 'Accepted', bg: '#DCFCE7', fg: '#166534' },
  declined: { label: 'Declined', bg: '#F3F4F6', fg: '#6B7280' }, completed: { label: 'Completed', bg: '#F3F4F6', fg: '#374151' },
  succeeded: { label: 'Paid', bg: '#DCFCE7', fg: '#166534' }, failed: { label: 'Failed', bg: '#FEE2E2', fg: '#991B1B' }, refunded: { label: 'Refunded', bg: '#F3F4F6', fg: '#374151' }
};
export const st = (k: string): Tone => STATUS[k] || { label: k, bg: '#F3F4F6', fg: '#374151' };
