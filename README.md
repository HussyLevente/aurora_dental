# Aurora Dental Studio

A nine-page site for a fictional three-studio dental practice in Budapest.
No build step, no dependencies to install — open `index.html` and it runs.

---

## Pages

| File | What it does |
|---|---|
| `index.html` | Hero, method, pinned horizontal treatments, team, locations, reviews, plans, FAQ |
| `about.html` | Founder, values grid, timeline, equipment, careers |
| `services.html` | 18 treatments as expandable rows, category filter, comparison table |
| `team.html` | 10 clinicians, department filter, slide-in biography drawer |
| `pricing.html` | Full price list with tabs, membership plans, instalment calculator |
| `locations.html` | Three studios, live opening state, hours, transport, embedded maps |
| `reviews.html` | Rating summary, filter + sort, load-more, "write a review" form |
| `booking.html` | Six-step booking wizard with a live calendar, plus your saved appointments |
| `contact.html` | Validated contact form, response stats, FAQ, map |

---

## Structure

```
css/
  base.css      design tokens, reset, typography, grid, utilities
  app.css       chrome (nav, menu, loader, cursor, transitions) + components
  pages.css     section and page layouts
js/
  data.js       ← ALL CONTENT lives here
  store.js      ← THE BACKEND SEAM
  motion.js     Lenis + GSAP ScrollTrigger, reveals, cursor, page transitions
  ui.js         nav/menu/footer injection, accordion, drawer, modal, toasts
  pages.js      one controller function per page
  booking.js    the booking wizard
```

Nav and footer are injected by `ui.js` so all nine pages stay in sync — edit
them once in `chrome()` and `footer()`.

---

## Replacing the JavaScript backend

Everything server-shaped is isolated behind `AURORA.Store` in `js/store.js`.
No UI code touches `localStorage` directly, so you can swap the method bodies
for `fetch` calls and nothing above needs to change.

| Method | Replace with |
|---|---|
| `Store.bookings()` / `upcoming()` / `past()` | `GET /api/appointments` |
| `Store.addBooking(data)` | `POST /api/appointments` → return the record with `ref` |
| `Store.cancelBooking(ref)` | `DELETE /api/appointments/:ref` |
| `Store.slotsFor({date, clinic, dentist, duration})` | `GET /api/availability` — return `{state:'open', slots:[{time,free,period,reason}]}` |
| `Store.dayHasSpace(...)` | `GET /api/availability/month` (one call per month beats one per day) |
| `Store.reviews()` / `addReview(r)` | `GET` / `POST /api/reviews` |
| `Store.addMessage(m)` | `POST /api/messages` |
| `Store.subscribe(email)` | `POST /api/newsletter` |

Two notes for whoever writes the API:

- **`slotsFor` is currently deterministic, not random.** It seeds a PRNG from
  `date + clinic + dentist` so the same day always shows the same diary across
  reloads. Real availability replaces this wholesale.
- **The callers are synchronous.** When you move to `fetch`, make these return
  promises and `await` them in `js/booking.js` (`paintCalendar`, `paintSlots`)
  and `js/pages.js`. Those are the only call sites.

Content — services, team, locations, prices, reviews, FAQ, opening hours —
is all in `js/data.js` and can move behind a CMS the same way.

---

## Design notes

- **Type:** Bricolage Grotesque (display) + Inter Tight (body). No serifs anywhere.
- **Colour:** white and `#f4f8fb` grounds, near-black `#0a1922` ink, and the
  logo blue `#4bbbe8` used sparingly as an accent — never as a background wash.
- **Motion:** custom loader, per-word headline reveals, magnetic buttons, a
  custom cursor, pinned horizontal scrolling, parallax, and full-page
  transitions between pages. All of it is skipped under
  `prefers-reduced-motion`, and the site degrades to a plain
  IntersectionObserver fallback if the GSAP or Lenis CDN fails.
- **Responsive:** verified with no horizontal overflow at 503px, 869px and
  1600px on all nine pages.

---

## Known placeholders

- Social, privacy, terms and complaints links are `#`.
- Maps are OpenStreetMap embeds; swap for a keyed provider if you want styling.
- Photography is from Unsplash and Pexels — replace with real practice photos
  before this goes anywhere near production.
- Addresses, phone numbers, staff and reviews are invented.
