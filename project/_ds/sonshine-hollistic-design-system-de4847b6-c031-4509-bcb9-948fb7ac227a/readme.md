# Sonshine Hollistic — Design System

Sonshine Hollistic is a boutique yoga studio in Livingston, West Lothian (Scotland), run by instructors Son Anderson and Ruth Hollis from Barden House, Hamilton Square. It offers adult and kids yoga classes, pilates, sound healing, reiki, events and teacher training, plus online/live-streamed sessions and one-to-ones. The only product surface represented is the **public marketing website** (sonshinehollistic.co.uk) — timetable, class info, booking entry points.

## Sources
- Figma file "Untitled (3).fig" (mounted VFS, an html.to.design capture of the live site, 13/10/2026):
  - Page 1 — `https://www.sonshinehollistic.co.uk/` frame (node 1:636) + component sheet (1:182)
  - Page 2 — `https://www.sonshinehollistic.co.uk/childClasses` frame (2:742) + component sheet (2:332)
  - One variable collection "www.sonshinehollistic.co.uk" (103 variables, 1 mode). No text styles.
- Uploads: full-page screenshots of `/`, `/classes`, `/childClasses`, and `logo.webp`.

## Index
- `styles.css` — global entry (imports only) → `tokens/fonts.css`, `tokens/fig-tokens.css` (raw Figma variables, verbatim), `tokens/colors.css`, `tokens/typography.css`, `tokens/layout.css`.
- `components/` — React primitives (see list below).
- `ui_kits/website/` — click-through site recreation (Home, Yoga for Adults, Yoga for Kids).
- `guidelines/` — foundation specimen cards (colors, type, spacing, radii, shadows, brand).
- `assets/` — `logo.webp` (full mark), `logo-figma.png` (header crop from Figma), `images/` (hero + studio + kids photos).
- `SKILL.md` — agent-skill entry point.

## Components
Figma names every set generically ("Component 1…9"); the file has two pages that each carry 9 sets (18 families, 7 are duplicates across pages). Mapping:

| Figma set | Built as |
|---|---|
| Component 1 (p1, 1:180) | `Button` (hero / block / outline) |
| Component 2 (p1, 1:192) | `GlassButton` |
| Component 3 (p1 1:198, p2 2:355) | `Icon` (11 glyphs) + `Avatar` (p2 variants 1–3, "SA" initials) |
| Component 4 (both) | `SocialLink` |
| Component 5 (both) | `FooterLink` |
| Component 6 (both) | `EmailLink` |
| Component 7 (both) | `BackToTop` |
| Component 8 (both) | `NavLink` |
| Component 9 (both) | `NavDropdown` |
| Component 1 (p2, 2:330) | `ClassRow` (+ `ClassHeaderRow`) |
| Component 2 (p2, 2:343) | `ClassCardText` |

Directories: `components/buttons` (Button, GlassButton, SmallButton), `components/icons` (Icon, Avatar), `components/navigation` (NavLink, NavDropdown), `components/footer` (SocialLink, FooterLink, EmailLink, BackToTop), `components/classes` (ClassRow, ClassHeaderRow, ClassCardText).

### Intentional additions
The Figma sets are only called "Component 1…9", so every component is exported under a descriptive name (the Figma name is also exported as an alias, `Component1` = `Button` … `Component9` = `NavDropdown`). Each semantic name below is an intentional addition:
- `Button` — intentional addition; semantic name for Figma "Component 1" (p1).
- `GlassButton` — intentional addition; semantic name for Figma "Component 2" (p1).
- `Icon` — intentional addition; semantic name for Figma "Component 3".
- `Avatar` — intentional addition; page-2 "Component 3" variants 1–3 (initials disc).
- `SocialLink` — intentional addition; semantic name for Figma "Component 4".
- `FooterLink` — intentional addition; semantic name for Figma "Component 5".
- `EmailLink` — intentional addition; semantic name for Figma "Component 6".
- `BackToTop` — intentional addition; semantic name for Figma "Component 7".
- `NavLink` — intentional addition; semantic name for Figma "Component 8".
- `NavDropdown` — intentional addition; semantic name for Figma "Component 9" (the open menu panel is a minimal stand-in).
- `ClassRow` — intentional addition; semantic name for page-2 "Component 1" (timetable row).
- `ClassCardText` — intentional addition; semantic name for page-2 "Component 2".
- `ClassHeaderRow` — intentional addition; column-label row of the timetable table (frame-level in Figma).
- `CLASS_COLUMNS` — intentional addition; ClassRow column-width constant.
- `SmallButton` — intentional addition; the 36px Book / Sign In / cookie / WhatsApp button repeated ~10× across frames.

## CONTENT FUNDAMENTALS
- **Voice:** warm, welcoming, community-first; speaks as "we/our" to "you". "Whether you're a seasoned yogi or stepping onto the mat for the first time, our welcoming and inclusive community… is here to support you every step of the way."
- **Local SEO is part of the voice:** place names everywhere — "Livingston", "West Lothian", "Edinburgh West", "Livingston's Premier Boutique Yoga Studio", "Yoga Classes for Kids in Livingston".
- **Casing:** Title Case for headings and buttons ("View Class Timetable", "Purchase a Class Pass", "Get Started Today", "Read More Testimonials"). Table day bars are UPPERCASE ("MONDAY", "ALL CLASSES").
- **Spelling:** British — "personalised", "specialised", £ prices ("£9.00"). (Mixed: "Personalized Yoga Experience" heading uses -ize.) The brand name is spelled **"Hollistic"** (double L) consistently — keep it.
- **Wellness vocabulary:** serene, sanctuary, inner self, self-care, transformative, togetherness, breathe in unison, deep relaxation.
- **CTAs** are short imperative phrases; secondary contact is very human ("WhatsApp Son at 07747 729300", "Contact Sonja to discuss your needs").
- **Testimonials** are quoted verbatim, italic, with loose punctuation preserved ("body & mind....The timetable is endless").
- No emoji. Times written "4:45pm - 5:45pm"; days "Mondays at …".

## VISUAL FOUNDATIONS
- **Colour:** one hot magenta-rose `#EC0F8C` does all accent work — CTAs, card headings, table bars, nav active/hover, icons, prices. Gradient CTA `90deg #EC0F8C→#DB2777` (flips on hover). Softer `#EC4899` for small buttons/avatars. Neutrals are cool Tailwind greys (#111827…#D1D5DB). Footer is deep navy `#0F172A` with a black "Powered by" strip. WhatsApp green `#25D366` only for WhatsApp pills.
- **Type:** Playfair Display Bold for all headings (60 hero, 48 page hero, 36 section, 24 footer, 20 SemiBold card titles in rose, 18 uppercase table bars). Poppins for everything else (400 body 16/24 & 18/28, 500 labels/nav 14/20, 600 buttons). Italic Poppins 18 for quotes. Inter appears only for avatar initials.
- **Backgrounds:** sections alternate full-width washes — blush `#FDF2F8`, white, `#F9FAFB`, light grey `#F3F4F6` on inner pages. No textures, patterns or illustrations. Heroes are full-bleed photos under a flat 60% black overlay (home) or 50%-opacity photo + 75→85% black vertical gradient (inner pages).
- **Imagery:** bright, natural daylight studio photography (white walls, blue mats, wooden cladding), real class/people shots; kids pages use colourful stock. Warm-neutral, un-graded, no grain.
- **Layout:** 1536px max container, 32px side padding inside 42.5px section padding, 64px vertical section padding, 48px gaps between section blocks, 32px between cards (16px for photo/button rows). Text-heavy blocks narrow to 896px; ledes to 768px. Sticky 80px header with 90% white + 8px backdrop blur.
- **Cards:** white, 12px radius, no border, shadow-lg (`0 10px 15px -3px / 0 4px 6px -4px rgba(0,0,0,.1)`), 32px padding. Large panels/photos use 16px radius + shadow-xl. Intro panels on inner pages are 95% white. Feature icons sit in a 64px `#FCE7F3` circle.
- **Tables:** rose header bar (Playfair 18 uppercase white), cream body `rgba(255,237,213,.6)`, rose Poppins Medium column labels, `#E5E7EB` row dividers, right-aligned 96px Book buttons; rows tint `rgba(255,247,237,.8)` on hover.
- **Radii:** 6 (chips), 7 (inner button fill), 8 (buttons, nav), 12 (cards), 16 (panels, photos), full (avatars).
- **Shadows:** soft Tailwind-style black shadows only (xs header, sm small buttons, md tables/block buttons, lg cards, xl panels). Small buttons add an inset 1px white 15% top highlight.
- **Hover states:** CTAs scale to 1.05 and reverse gradient; outline buttons fill rose; glass button turns solid white with rose text; nav gets a 15% rose wash; footer links go from grey to rose. Simple ~150ms transitions, no bounces.
- **Transparency & blur:** header (90% white, blur 8), hero glass button (10% white, blur 4). Nothing else.
- **Borders:** rarely used — 2px rose on outline buttons, 1px rose on the active nav item, hairlines in tables and the footer divider.

## ICONOGRAPHY
- A small bespoke glyph set captured in Figma "Component 3": devices (virtual yoga), house-with-heart (personalised), community/people (studio classes), Instagram, Facebook, mail, WhatsApp, chevron-down. Filled, solid glyphs (Font-Awesome-like weight), painted single-colour — rose by default, grey `#9CA3AF` for muted social icons.
- Implemented as the `Icon` component with path data copied verbatim from Figma; recolour via `color` (currentColor).
- No icon font, no PNG icons, no emoji. The `/classes` page uses ✓ / ✕ marks for "Included / Not Included" (green / red) — not present in the Figma file; the UI kit uses the unicode ✓/✕ characters as a stand-in.

## Fonts
Playfair Display, Poppins and Inter load from Google Fonts (`tokens/fonts.css`) — no font binaries were supplied. These are the exact families named in Figma.
