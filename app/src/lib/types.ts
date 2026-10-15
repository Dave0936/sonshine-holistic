// Row shapes as returned by Supabase (see supabase/migrations).
export type Role = 'customer' | 'admin' | 'owner';
export type Format = 'In studio' | 'Online' | 'Hybrid';
export type BookingStatus = 'confirmed' | 'waitlisted' | 'offered' | 'attended' | 'noshow' | 'cancelled';

export interface Settings { cancel_hours: number; offer_hours: number; reminders: boolean }
export interface Instructor { id: string; name: string; role: string; ini: string; bio: string; active: boolean; sort: number }
export interface ClassRow { id: string; name: string; cat: string; ins: string; dur: number; level: string; price: number; pass: boolean; format: Format; img: string; descr: string; access: string }
export interface Product { id: string; name: string; descr: string; price: number; credits: number; weeks: number; scope: 'adult' | 'kids'; on_sale: boolean; sort: number }
export interface Service { id: string; name: string; practitioner: string; img: string; duration: string; price_label: string; location: string; descr: string; prep: string; caution: string; sort: number }
export interface EventRow {
  id: string; name: string; sub: string | null; img: string; date: string | null; start_time: string | null; finish_time: string | null;
  host: string; venue: string; price: number | null; early: number | null; early_until: string | null; cap: number | null;
  deadline: string | null; published: boolean; kind: 'book' | 'enquire'; descr: string; info: string
}
export interface Profile { id: string; first: string; last: string; email: string; role: Role; phone: string; active: boolean; reminders: boolean; marketing: boolean; joined: string }
export interface Session { id: string; cls: string; date: string; start_time: string; dur: number; cap: number; ins: string; status: 'scheduled' | 'cancelled'; waitlist: boolean; format: Format }
export interface Payment { id: string; user_id: string; ref: string; amount: number; kind: 'Class' | 'Pass' | 'Event'; label: string; at: string; status: 'succeeded' | 'failed' | 'refunded'; booking_id: string | null; product_id: string | null; refunded_at: string | null }
export interface Pass { id: string; user_id: string; product: string; purchased: string; expires: string; total: number; payment_id: string | null; comp: boolean }
export interface Ledger { id: string; pass_id: string; delta: number; reason: string; booking_id: string | null; at: string; by: string | null }
export interface Booking {
  id: string; user_id: string; session_id: string; status: BookingStatus; method: 'pass' | 'card' | 'free' | 'manual' | null;
  pass_id: string | null; payment_id: string | null; amount: number; created: string; cancelled_at: string | null; late: boolean; offer_until: string | null
}
export interface EventBooking { id: string; user_id: string; event_id: string; status: 'confirmed' | 'cancelled'; payment_id: string | null; amount: number; created: string }
export interface Request { id: string; user_id: string; service: string; enquiry: string | null; date: string; slot: string; msg: string; status: 'pending' | 'accepted' | 'declined' | 'completed'; created: string }
export interface Notification { id: string; user_id: string; text: string; at: string; read: boolean }
export interface AuditRow { id: string; at: string; actor: string | null; actor_label: string; action: string }

export interface Db {
  settings: Settings; instructors: Instructor[]; classes: ClassRow[]; products: Product[]; services: Service[]; events: EventRow[];
  sessions: Session[]; profiles: Profile[]; bookings: Booking[]; passes: Pass[]; ledger: Ledger[]; payments: Payment[];
  eventBookings: EventBooking[]; requests: Request[]; notifs: Notification[]; audit: AuditRow[]; deleteRequests: { user_id: string; at: string }[];
  notes: Record<string, string>; links: Record<string, string>;
  avail: Record<string, { taken: number; waiting: number }>; evTaken: Record<string, number>; waitPos: Record<string, number>;
}

export interface Result { ok?: boolean; err?: string; [k: string]: unknown }
