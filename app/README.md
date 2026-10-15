# Sonshine Hollistic app

Mobile-first booking app for Sonshine Hollistic (Barden House, Livingston), built from the Claude Design prototype in `../project/`.
It contains two apps that share one Supabase backend:

- **Customer app**: welcome, sign-in and sign-up, home, timetable (search, filters, 14-day strip), class details and booking (pass, test card or free), waitlists and claiming offered places, My Bookings, passes and credit history, profile, events, services and appointment requests, team, studio and policy, and notifications.
- **Studio Management** (owners and admins): dashboard, timetable and class registers (capacity, instructor, waitlist, attendance, manual bookings, cancelling a session), adding sessions, bookings, customers (credit adjustments, complimentary credits, internal notes, deactivation), appointment requests, events, passes and pricing, payments and refunds, reports with CSV export, instructors, settings and the audit log.

On a computer the page shows both phones side by side; `?layout=customer` or `?layout=owner` shows just one.
On a phone the app fills the screen. It opens on the customer app; open Studio Management from the bottom of Profile, or with `?app=owner`.
It's a PWA, so on iPhone you can use Safari's Share menu, then Add to Home Screen.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static files in dist/, deploy to any static host (Netlify, Vercel, Cloudflare Pages…)
```

`.env` points at the **Sonshine Holistic** Supabase project (`klaouirswcctyjnkllhr`). The publishable key is meant to be public: every rule is enforced in the database.

## Backend (`../supabase/migrations`)

- Clients can only **read**, and row-level security controls what: customers see their own bookings, passes and payments, and staff see everything. Joining links for online classes are only visible to people with a confirmed place, and internal notes are visible to staff only.
- Every **change** goes through a `SECURITY DEFINER` function (`book_class`, `cancel_booking`, `join_waitlist`, `buy_pass`, `set_capacity`, …). These functions:
  - check who is calling
  - lock the class while checking capacity
  - refuse double bookings (there is also a unique index)
  - keep an append-only credit ledger
  - apply the cancellation window, with a staff override
  - offer freed places to the waitlist with a claim deadline
  - write staff actions to the audit log
- Changes reach both apps live through Supabase Realtime. The apps also refresh every 30 seconds and when you come back to them.

## Demo data

The demo data is built around the day it was loaded: a timetable from three weeks ago to two weeks ahead, plus demo bookings, passes, payments, events and requests.
In Studio Management, the owner can rebuild it for the current day under **More → Studio Settings → Reset Demo Data**.

| Login | Role |
|---|---|
| emma@demo.test | customer with a pass, bookings and a waitlist place |
| son@demo.test | owner |
| ruth@demo.test | admin |
| fiona@, gemma@, karen@ … @demo.test | other customers |

The password for all of them is `demo1234`.

## Before launch

- **Payments are simulated test payments.** Test card choice "4242" succeeds and "0002" declines. To take real money, connect Stripe Checkout and confirm payments by webhook in an edge function that replaces `test_payment`.
- **Email:** Supabase Auth sends sign-up confirmation and password-reset emails. Class reminders and booking emails are not sent yet: they only appear as in-app notifications.
- **Prices, capacities, the timetable and the policy wording are placeholders** for the studio to confirm. The exceptions are the sound healing and reiki prices, which come from the studio's website.
- **Remove the demo data:** delete the `@demo.test` users and take the Reset Demo button out of the app.
- **Auth settings:** in the Supabase dashboard, turn on leaked-password protection and set the site URL and redirect URLs to the deployed address.
- **Waitlist offers** lapse the next time anything touches that class. Add a scheduled `pg_cron` job if they should lapse on time even when nothing else happens.
