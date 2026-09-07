# PRD — KalaCart (Artisan Marketplace Website)

> Kickoff build spec for **Claude (in the Antigravity terminal)**.
> Problem statement: **SIH26090 — AI-Driven Market Linkage and Smart Cataloging for Marginalized Artisans** (Ministry of Social Justice & Empowerment).
> Read `CLAUDE.md` first. It is the engineering constitution and outranks habit.

---

## 0. How to use this document

This PRD is the single source of truth for the **website front-end**. Read it fully before writing code. When something here conflicts with a default, this document wins. When something is genuinely ambiguous (especially the shared data schema in §8), stop and ask rather than guessing.

**North star: design polish.** In the Q&A that shaped this project, the one thing we want judges to remember is that the site looks and feels polished. Every scope call below favors a smaller feature set executed to a high visual and interaction standard over a broad set of rough features.

---

## 1. Context

Two products share one Supabase backend, built by two people:

| Product | Owner | Users | Stack |
|---|---|---|---|
| Mobile app | Teammate | Artisans (supply side) | Java, Android Studio, FastAPI, Firebase OTP |
| **Website (this repo)** | You | Buyers + Admin | React, TypeScript, Tailwind, Supabase, Vercel |

This PRD covers the website only. The front-end is built against a **typed mock data layer first** (see §7.2) so progress never blocks on the teammate's backend. Wiring real Supabase comes later and is out of scope for this build unless stated.

---

## 2. Goals and non-goals

### Goals
1. A buyer can land on a polished home page, browse and search products, and view a product with a multi-image gallery.
2. A buyer can contact an artisan about a product through an inquiry form and a WhatsApp link. No purchase happens on the site.
3. An admin (a Ministry of Social Justice and Empowerment official) can log in, work a verification queue, manage artisans, and read impact numbers.
4. The site ships two full themes (light "Raw Cotton" and dark "Gallery Wall") with a working toggle.
5. The home page carries a premium scroll-motion system; the rest of the site stays fast and legible.
6. All copy is i18n-ready so Hindi and regional languages can be added later without a refactor.
7. The front-end runs entirely on typed mock data, deployable to Vercel from day one.

### Non-goals (this build)
- Real Supabase reads and writes (mock layer only for now).
- Real auth backend (admin login is a mocked gate, see §11.1).
- Cart, checkout, payments, or any purchase flow. The model is market linkage only.
- The artisan upload flow (that lives in the mobile app).
- Full multi-language content (English only now, but architected for more, see §7.4).
- SEO or SSR.

---

## 3. Users and roles

| Role | Auth | Can do |
|---|---|---|
| **Buyer** (anonymous) | None | Browse, search, filter, view product and artisan, send inquiry, open WhatsApp |
| **Admin** (MoSJE official) | Login gate | Everything a buyer can, plus verification queue, artisan management, analytics |

There is no artisan role on the website. Artisans live entirely in the mobile app.

---

## 4. Tech stack

| Concern | Choice | Notes |
|---|---|---|
| Build tool | **Vite** | Fast, zero-config Vercel deploys. |
| Framework | **React 18** + **TypeScript** (strict) | |
| Styling | **Tailwind CSS** (installed, not CDN) | Theme tokens as CSS variables, see §9. |
| Routing | **React Router** | |
| Smooth scroll | **Lenis** | Initialized once at the app shell. Powers the home motion engine. |
| Icons | **lucide-react** | |
| Charts (admin) | **Recharts** | |
| i18n | **react-i18next** or a typed dictionary | Single strings source, see §7.4. |
| Data | **Typed mock module** now, Supabase later | Single swap point, see §7.2. |
| Deploy | **Vercel** | Deploy an empty skeleton on day one. |

Do not add other dependencies (state libraries, UI kits, animation libraries) without asking. React context plus hooks is enough for this scope.

---

## 5. Architecture

### 5.1 The file-size law
No source file exceeds about **200 lines**. One route is one thin page component that composes many small component files. When a file nears the cap, extract a component or a hook.

### 5.2 The data-access seam (most important architectural decision)
All data access goes through a single module, `src/lib/data/`. Components never import mock data and never call Supabase directly. They call typed functions:

```
src/lib/data/
  types.ts            // the shared data model (§8), the contract with the teammate's schema
  index.ts            // re-exports the active provider
  mockProvider.ts     // returns mock data with simulated latency
  supabaseProvider.ts // STUB for now, same signatures, throws "not wired yet"
```

Both providers expose identical signatures:

```typescript
getProducts(filters?: ProductFilters): Promise<Product[]>
getProductById(id: string): Promise<Product | null>
getArtisanById(id: string): Promise<Artisan | null>
getCategories(): Promise<Category[]>
getPendingArtisans(): Promise<Artisan[]>       // admin
setArtisanStatus(id, status): Promise<void>    // admin
getAllArtisans(filters?): Promise<Artisan[]>   // admin
createInquiry(input: NewInquiry): Promise<void>
getAnalyticsSummary(): Promise<AnalyticsSummary> // admin
```

When the backend is ready, swapping `index.ts` from `mockProvider` to `supabaseProvider` is the only change needed in the app. Build the whole UI against this seam.

### 5.3 Folder structure
```
src/
  main.tsx
  App.tsx                // router + providers only, thin
  app/
    AppShell.tsx         // Lenis init, theme provider, nav, footer, progress bar
    ThemeProvider.tsx
    theme.ts             // token maps for both themes
  routes/
    Home.tsx
    Browse.tsx
    ProductDetail.tsx
    ArtisanProfile.tsx
    admin/
      AdminLogin.tsx
      AdminLayout.tsx
      VerificationQueue.tsx
      ArtisanManagement.tsx
      Analytics.tsx
  components/
    layout/              // Navbar, Footer, Container, ProgressBar, ThemeToggle
    home/                // ParallaxHero, CraftLayer, FloatingProductCard, HomeCTA, CategoryStrip
    motion/              // Reveal, useScrollEngine, useReveal
    product/             // ProductCard, ProductGrid, ImageGallery, PriceTag, CategoryChip
    artisan/             // ArtisanCard, ArtisanMiniCard, ArtisanHeader
    admin/               // QueueTable, QueueRow, DataTable, StatCard, StatusBadge, chart cards
    ui/                  // Button, Input, Select, Modal, ConfirmDialog, Toast, Skeleton, EmptyState, Badge, Chip
  lib/
    data/                // §5.2
    i18n/                // §7.4
    hooks/               // useDebounce, useProducts
    utils/               // cn, formatInr, buildWhatsappLink
  styles/
    index.css
```

### 5.4 Three states are not optional
Every data-driven view handles loading (skeletons, never a bare spinner on a blank page), empty (purposeful, tells the user what to do next), and error (plain, explains what failed and offers retry).

---

## 6. Design north star and surface scoping

Design polish is the goal, so two rules govern where visual effort concentrates:

1. **Motion is scoped by surface.** The full scroll-motion system (§10) runs on the **home page only**. Browse and admin use lightweight reveal-on-scroll and nothing heavier, so product photos and data tables stay fast and legible. Applying parallax everywhere would fight the products.
2. **Two themes, both first-class.** Light "Raw Cotton" and dark "Gallery Wall" are both fully designed, not one dimmed into the other (§9). A visible toggle switches them and the choice persists for the session.

---

## 7. Cross-cutting seams

### 7.1 Theme seam
Themes are CSS variables set on the root element via `data-theme="light"` or `data-theme="dark"`. Tailwind reads those variables through its config so components use semantic classes (for example `bg-canvas`, `text-ink`, `border-line`, `text-brand`) and never hardcode hex. Default theme: **light**. The toggle lives in the nav.

### 7.2 Data seam
See §5.2. Mock provider ships realistic content (see §8).

### 7.3 Motion seam
A single scroll-driven engine (§10) lives in `components/motion/useScrollEngine` and mounts only on Home. Reveals elsewhere use an IntersectionObserver hook (`useReveal`) that works under Lenis without per-component scroll listeners.

### 7.4 i18n seam
No user-facing string is hardcoded in a component. All copy comes from a single strings source (`lib/i18n`). For this build there is one language file (English). Adding Hindi later is one new file, not a refactor. Use keys like `home.hero.title`, not raw text, in components. Also pick Devanagari-capable fonts now as fallbacks (Mukta or Hind) so a later language switch does not break type.

---

## 8. Data model (the shared contract)

> Coordinate these exact field names and the `status` enum with your teammate before wiring Supabase. For the mock build, use these as-is.

```typescript
type Status = 'pending' | 'approved' | 'rejected';

interface Category {
  id: string;
  name: string;         // "Handloom Textiles"
  slug: string;         // "handloom-textiles"
  dye: 'indigo' | 'madder' | 'marigold' | 'brass'; // category color-coding, see §9
}

interface Artisan {
  id: string;
  name: string;
  categoryId: string;   // their craft
  region: string;       // "Kutch, Gujarat"
  photoUrl: string;
  phone: string;        // for WhatsApp / contact
  status: Status;
  createdAt: string;    // ISO
  productCount?: number;
}
// Artisan profile is intentionally MINIMAL: name, craft, region. No long bio.

interface Product {
  id: string;
  artisanId: string;
  title: string;
  description: string;
  priceInr: number;     // whole rupees
  categoryId: string;
  imageUrls: string[];  // GALLERY: first image is the cover, rest shown in the gallery
  status: Status;
  createdAt: string;
}

interface Inquiry {
  id: string;
  productId: string;
  buyerName: string;
  buyerContact: string;
  message: string;
  createdAt: string;
}
type NewInquiry = Omit<Inquiry, 'id' | 'createdAt'>;

interface ProductFilters {
  query?: string;
  categoryId?: string;
  region?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'price-asc' | 'price-desc';
}

interface AnalyticsSummary {
  totalArtisans: number;
  approvedArtisans: number;
  pendingArtisans: number;
  totalProducts: number;
  totalInquiries: number;
  artisansByCategory: { category: string; count: number }[];
  signupsOverTime: { month: string; count: number }[];
}
```

Mock data should ship at least 8 artisans across 5+ categories and about 30 products, each with 3 to 5 gallery images, a realistic mix of statuses (several `pending` so the admin queue is not empty), real-sounding Indian craft names and regions, and placeholder images. Good mock data is what makes the demo land. Treat it as content, not filler.

---

## 9. Design system

### 9.1 Theme A — Light "Raw Cotton" (cool brand on warm neutral)
| Token | Hex | Role |
|---|---|---|
| canvas | `#F5F0E6` | page background |
| card | `#FFFFFF` | raised surfaces |
| ink (text) | `#241E1A` | primary text |
| muted | `#6F6559` | secondary text |
| line | `#E3D9C6` | decorative dividers only |
| line-strong | `#9C8555` | functional boundaries — **resolved Increment 5** |
| brand / accent (indigo) | `#2E4374` | the single accent |
| brand-deep / accent-deep | `#1B2A4A` | accent hover and pressed |
| highlight / secondary (brass) | `#B8862F` | non-text only — **resolved Increment 5** |

### 9.2 Theme B — Dark "Gallery Wall" (warm metallic on warm charcoal)
| Token | Hex | Role |
|---|---|---|
| canvas | `#17130F` | page background |
| card | `#201A15` | raised surfaces |
| ink (text) | `#F3ECE0` | primary text |
| muted | `#A79A88` | secondary text |
| line | `rgba(255,255,255,.10)` | decorative dividers only |
| line-strong | `rgba(255,255,255,.36)` | functional boundaries — **resolved Increment 5** |
| accent (marigold/brass) | `#C9922B` | the single accent |
| accent-deep | `#A8761F` | accent hover and pressed — **resolved Increment 1** |
| secondary (madder) | `#A63A3A` | non-text only — **resolved Increment 5** |

Light leans cool and brand-led with indigo as the single accent; dark leans warm and gallery-lit with brass as the single accent. That difference in accent logic is intentional.

Both palettes use one canonical token set so a single semantic class is correct in either theme. The §9.1 names (`ink`, `brand`, `highlight`) and the §9.2 names (`text`, `accent`, `secondary`) describe the same roles; the code uses `ink` / `accent` / `secondary` throughout, and `accent` therefore means indigo in light and brass in dark by design.

### 9.2a Accessibility floor (resolved Increment 5)

Every token pair that renders as text or as a UI boundary was measured against WCAG AA in both themes. Three failures found in Increment 4 are resolved as follows, and the values above reflect the fixes:

1. **`secondary` is never a text or label colour.** Brass (`#B8862F`) and madder (`#A63A3A`) are both mid-tone and fail AA against light and dark surfaces alike (3.24:1 and 2.69:1 on card). Error copy and destructive-button labels use `ink` instead, which measures 5.09:1 on brass and 5.44:1 on madder. `secondary` survives on borders, dye marks and chips — the non-text uses it was always intended for.
2. **Borders come in two tiers.** `line` keeps §9.2's soft value for decorative dividers, where no contrast floor applies. `line-strong` is the functional boundary for inputs, interactive cards and focus targets, and clears the 3:1 that AA requires of UI components against **both** canvas and card: light `#9C8555` at 3.13:1 / 3.56:1, dark `rgba(255,255,255,.36)` at 3.33:1 / 3.33:1. The previous values (light `#D6C9B0` at 1.44:1, dark `.14` at 1.50:1) did not.
3. **Badge and chip tones live in the border, not the label.** Only `accent`, which clears AA in both themes, is allowed to colour a word.

### 9.3 Category color-coding
Each craft category maps to one dye tone (`indigo`, `madder`, `marigold`, `brass`) used on its chip and small accents. This is the one place the multi-color palette appears; the marketplace chrome otherwise stays disciplined to a single accent per theme.

### 9.4 Typography
Fraunces for display and headings. Hanken Grotesk for body. Editorial scale, generous whitespace, calm and confident. Keep Mukta or Hind available as Devanagari-capable fallbacks for future languages.

**Resolved Increment 5.** Both faces are loaded and sit ahead of Mukta in the stacks:

```
--font-display: 'Fraunces', ui-serif, Georgia, 'Mukta', serif;
--font-body:    'Hanken Grotesk', ui-sans-serif, system-ui, 'Mukta', sans-serif;
```

Fraunces is set at weight 600 with `SOFT 30, WONK 1`, tracking `-0.02em`. Weight and a little optical wonk rather than thin high-contrast strokes: a sturdy, printerly serif reads as woodblock and hand-cut type, which is the subject matter, and avoids the thin-serif craft-page cliché §9.8 warns about. Scale is a 1.25 minor third off a 16px body.

### 9.5 Shape binary (strict)
Interactive controls (buttons, chips, badges) are full capsules, `border-radius: 999px`. Containers and cards are soft rounded rectangles, 18 to 28px. Do not mix these.

### 9.6 Accent rule (strict)
The accent color appears only as glows, the chip dot, the progress bar, button hover shadow, focus rings, and link highlights. It is never a large fill surface.

### 9.7 One easing curve
Every transition on the site uses `cubic-bezier(.22, 1, .36, 1)`. Nothing bounces or overshoots. Define it once as a token and reuse it.

### 9.8 Invoke the design skill
On any visual pass, use the design skill plugin already installed in the terminal. Follow it for token application, spacing, and critique. Avoid the generic-AI craft-page tells: cream plus terracotta plus thin high-contrast serif, fade-up on every card, all-caps eyebrow labels, identical grey-shadow cards.

---

## 10. Motion system (home page only)

Adapted from a reference landing page. The whole thing is driven by one smoothed scroll value and one render function, not per-component scroll listeners. It runs on Home only.

### 10.1 The engine
- Lenis provides an inertia-smoothed virtual scroll, initialized once in the app shell.
- On the Home route, a single `useScrollEngine` reads Lenis's scroll value inside one requestAnimationFrame loop and calls one `render(y)` that updates every scroll-reactive element: parallax layers, the progress bar, and nav state.
- Sections off-screen skip their per-frame math (IntersectionObserver gate with a generous rootMargin so state warms up before entering view).

### 10.2 The parallax hero (signature effect)
Build a depth scene from separate layers, each with a numeric drift rate as a data attribute, positioned absolutely, centered with `left:50%; translateX(-50%)`, sized larger than the container:
- A soft gradient backdrop tinted by the theme accent (no drift).
- Far and mid craft-silhouette layers that drift slowly (far slowest).
- A floating product-card mockup at mid-depth that drifts slightly.
- A front craft-silhouette layer that is **pinned** (rate 0) and sits in front of the floating card, so the card emerges from behind it as you scroll and gets clipped again. This front-occlusion is the signature move.
- Fade the oversized layers into the page background at the section's bottom edge with a gradient overlay so no hard clip line shows.

Implementation notes that matter:
- Split `transition` from `transform`. The parallax writes an inline `transform` every frame; never put `transform` in a CSS `transition` on those elements or it lags a full beat behind scroll. Scope any reveal transition to `opacity` only.
- Give each drifting layer `will-change: transform`.
- Choose one craft motif and commit (block-print border pattern, temple or jharokha arches, or a row of pottery and loom shapes). Consistency reads as intent.

### 10.3 Reveal system
One reusable reveal: elements start at `opacity: 0; translateY(18px)` and resolve to `opacity: 1; translateY(0)` when revealed, using the one easing curve, staggered by a `data-delay`. Used on hero elements (badge, headline, subhead, button cascading about 80ms apart) and on section cards site-wide.

### 10.4 Headline line-mask
The Fraunces hero headline wraps each line in an `overflow: hidden` mask with an inner span that starts translated 110% down and slides up into place on load, second line trailing the first by about 80ms.

### 10.5 Persistent chrome
- Nav: fixed, a soft top-down gradient at rest, becomes frosted glass (blur plus hairline border) after about 40px of scroll, toggled by a single class flip.
- Progress bar: a 2px line pinned to the very top, glowing in the theme accent, scaled horizontally by scroll progress via `transform: scaleX(p)` from a left origin (not width, so it stays GPU-composited).

### 10.6 Closing CTA bookend
The closing CTA on Home reuses the same craft-scene layers as the hero, reversed, as a visual bookend into the footer.

### 10.7 Reduced motion
Under `prefers-reduced-motion: reduce`, all reveals resolve instantly to their end state and every parallax transform is frozen. The page is fully usable with motion off.

### 10.8 Elsewhere
Browse and admin use only the `useReveal` IntersectionObserver reveal. No parallax, no progress bar, no line-mask. Legibility and speed first.

---

## 11. Routes and page specs

```
PUBLIC
  /                 Home        (full motion system)
  /browse           Browse and search (reveal-only)
  /product/:id      Product detail (reveal-only)
  /artisan/:id      Artisan profile (reveal-only)

ADMIN (gated)
  /admin/login      Login
  /admin            redirect to /admin/queue
  /admin/queue      Verification queue
  /admin/artisans   Artisan management
  /admin/analytics  Analytics
```
Unknown routes go to a designed 404 that routes back to Home or Browse.

### 11.0 Global chrome
Navbar (logo to Home, links to Browse, a search entry, the theme toggle, a discreet Admin link, collapses to a mobile menu), Footer (short program line, categories, an SIH 2026 credit is fine), Container (shared max-width and padding), ProgressBar (Home only).

### 11.1 Admin auth gate (mocked)
`/admin/login` takes email and password. For the mock build, accept one hardcoded credential defined in a single documented constant and store an `isAdmin` flag in context plus `sessionStorage`. All `/admin/*` routes redirect to login when not authenticated. Mark clearly in code as MOCK AUTH, replace with Supabase email/password before demo if time allows. Do not present it as real security.

### 11.2 Home (`/`)
Purpose: make a buyer immediately understand this is where they find handmade goods directly from Indian artisans, and feel the polish. Full motion system from §10.
Sections top to bottom: parallax hero (badge, line-mask headline, subhead, capsule "Browse crafts" button, floating product card emerging from behind the front layer), browse-by-craft category strip (dye-coded chips, reveal-staggered), featured artisans row (minimal cards), featured products grid (about 8 approved products), a quiet how-it-works or impact band, closing CTA bookend.
States: loading (skeleton hero and grids), error (retry).

### 11.3 Browse and search (`/browse`)
Purpose: the core discovery surface. Reveal-only motion.
URL is the state: all filters live in query params (`?query=&category=&region=&sort=&min=&max=`) so results are shareable and back works.
Layout: filter panel (drawer on mobile) plus results. Filters: debounced text search, category, region, price min and max, sort. Results: ProductGrid with a count, cards link to product detail.
States: loading (skeleton cards), empty ("No crafts match these filters" plus a one-tap Clear filters), error (retry).

### 11.4 Product detail (`/product/:id`)
Purpose: everything a buyer needs, plus contact. Reveal-only motion.
Layout: two columns on desktop, stacked on mobile.
- Left: ImageGallery over the product's `imageUrls` (cover plus thumbnails, keyboard-navigable, this is the gallery requirement).
- Right: title, price in rupees, dye-coded category chip, description, and a minimal artisan mini-card (name, craft, region) linking to the artisan.
- Primary action: "Contact artisan" opens InquiryModal. Secondary: a WhatsApp button built from the artisan phone via `buildWhatsappLink`.
- Below: "More from this artisan" mini grid.
InquiryModal: buyerName, buyerContact, message, validated, submitting state, success toast, failure message. Calls `createInquiry`. No purchase, ever.
States: loading (skeleton layout), not-found (designed empty state plus link back to Browse), error.

### 11.5 Artisan profile (`/artisan/:id`)
Purpose: minimal artisan context plus their catalog. Reveal-only motion.
Layout: a compact ArtisanHeader (photo, name, craft, region, no long story) and a ProductGrid of that artisan's approved products.
States: loading, not-found, error, empty ("This artisan has not listed products yet").

### 11.6 Admin verification queue (`/admin/queue`)
Purpose: the operational heart for the MoSJE official. Reveal-only.
Layout: tabs for Artisans and Products, each a list of `pending` items. Row: thumbnail, name or title, category, region, submitted date, Approve and Reject actions, a way to preview details.
Interactions: Approve or Reject calls the status setter, optimistic update, toast, row leaves the pending list, a confirm step on Reject.
States: loading (skeleton rows), empty ("Nothing waiting for review, you are all caught up"), error.

### 11.7 Admin artisan management (`/admin/artisans`)
Purpose: see and manage all artisans. Searchable and filterable table (status, category, region), row actions to change status. States: loading, empty, error.

### 11.8 Admin analytics (`/admin/analytics`)
Purpose: the impact story in numbers, framed for a ministry official. Stat cards (total artisans, approved, pending, total products, total inquiries), a bar chart of artisans by category, a line chart of signups over time (Recharts, each wrapped so pages stay under the line cap). Real mock numbers, not zeros. States: loading (skeleton cards and chart placeholders), error.

---

## 12. Component inventory
`ui/`: Button (primary, secondary, ghost, destructive), Input, Textarea, Select, Modal, ConfirmDialog, Toast/Toaster, Skeleton, EmptyState, Badge, Chip, Spinner, ThemeToggle.
`layout/`: Navbar, Footer, Container, MobileMenu, ProgressBar.
`motion/`: Reveal, useReveal, useScrollEngine.
`home/`: ParallaxHero, CraftLayer, FloatingProductCard, CategoryStrip, HomeCTA.
`product/`: ProductCard, ProductGrid, ImageGallery, PriceTag, CategoryChip.
`artisan/`: ArtisanCard, ArtisanMiniCard, ArtisanHeader.
`admin/`: AdminLayout, QueueTable, QueueRow, DataTable, StatCard, StatusBadge, BarChartCard, LineChartCard.
Each is its own file, under the line cap, with a typed props interface.

---

## 13. Build sequence

Each increment ends deployed to Vercel and verified in the browser before the next begins.

| # | Increment | Done when |
|---|---|---|
| 0 | Scaffold Vite + TS + Tailwind + Router + Lenis, deploy empty skeleton | Live URL renders a placeholder Home |
| 1 | Theme system: tokens for both themes, ThemeProvider, toggle | Toggling swaps the whole palette, persists for the session |
| 2 | Data seam + types + mock data (§5.2, §8) | Data functions return mock data with simulated latency |
| 3 | i18n seam + English strings (§7.4) | No hardcoded copy in components |
| 4 | `ui/` primitives + layout chrome (Navbar, Footer, Container) | Buttons, inputs, skeletons, empty state, both themes |
| 5 | Design pass via the design skill, lock tokens and type | Palette, type, spacing applied to primitives in both themes |
| 6 | Motion primitives: Lenis shell, useReveal, useScrollEngine | Reveals work site-wide; engine ready for Home |
| 7 | Home hero: parallax layers, floating card, line-mask headline, progress bar, nav glass | Full hero motion in both themes, reduced-motion frozen |
| 8 | Home sections + closing CTA bookend | All sections render from mock data with all states |
| 9 | Browse and search (URL-driven filters, reveal-only) | Filtering, sorting, search work and are shareable |
| 10 | Product detail + ImageGallery + InquiryModal + WhatsApp | View a product, browse the gallery, send a mock inquiry, open WhatsApp |
| 11 | Artisan profile (minimal) | Header plus their products render |
| 12 | Admin auth gate + AdminLayout | `/admin/*` gated, login and logout work (mock) |
| 13 | Verification queue | Approve and reject move items, confirm plus toast |
| 14 | Artisan management | Table with search, filter, status change |
| 15 | Analytics | Stat cards plus two charts from mock summary |
| 16 | Polish pass: responsive audit, focus states, reduced-motion, 404 | Mobile clean, keyboard-navigable, no console errors, both themes |

Only after all 16: revisit wiring real Supabase (separate task).

---

## 14. Acceptance criteria (global)
- TypeScript strict, no `any` without a written reason, no build warnings.
- No source file over about 200 lines.
- Every data-driven view handles loading, empty, and error.
- Both themes fully styled; the toggle works and persists for the session.
- Full motion only on Home; browse and admin are reveal-only.
- Responsive from 360px, no horizontal scroll.
- Visible keyboard focus everywhere; modals trap focus and close on Esc.
- `prefers-reduced-motion` respected: reveals instant, parallax frozen.
- No hardcoded user-facing strings; all copy from the i18n source.
- No `localStorage` or `sessionStorage` beyond the documented mock-auth flag.
- Runs on the mock provider with zero backend dependencies.

---

## 15. Out of scope / future
Real Supabase wiring (swap the data provider), real admin auth plus RLS (public `anon` read of `approved` rows, admin writes), Hindi and regional languages (drop in new i18n files), any purchase or payments flow, SEO or SSR.

---

## 16. Open questions to resolve with the teammate
1. Exact Supabase table and column names and the `status` enum values (§8).
2. Who owns the `admins` table and the approval flow.
3. Does the mobile app write products directly as `pending`, or must an artisan be approved first, then products.
4. Image storage path convention in Supabase Storage so gallery URLs resolve later.
