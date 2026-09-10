# KalaCart — CLAUDE.md
*Last updated: 2026-09-10 · Owner: Rishi Ventrapragada*

---

## A · What this folder is
The web front-end for KalaCart — a direct-linkage buyer marketplace and administrative moderation dashboard supporting Indian artisans (SIH26090, Ministry of Social Justice & Empowerment). It is built against a typed mock data layer first and shares a Supabase backend with a companion Android app.
Stage: active development / pre-launch.

## B · The Goal
- **Why it exists:** Connect rural and traditional Indian artisans directly with conscious buyers and institutions, bypassing middlemen and preserving heritage craft.
- **Done looks like:** A responsive, dual-themed web portal with fluid Home motion, faceted catalog filtering, artisan storytelling, direct inquiry modals, and an admin verification desk, verified across both themes.
- **Out of scope:** Payment gateways, shopping carts, or checkout flows (linkage model only); native device features handled by the Android app.

## C · Stack
- **Languages:** TypeScript (strict mode, no uninspected `any`)
- **Frameworks:** React 18 · Vite · Tailwind CSS · React Router
- **Libraries:** Lenis (smooth scroll) · Lucide React · react-i18next · GSAP (Home maker fan only, see §D). Admin charts are hand-rolled SVG, not Recharts (see §D).
- **Hosting / infra:** Vercel
- **Key services:** Supabase (shared backend via data seam)
- **Run locally:** `npm run dev`
- **Key files:** `PRD.md` · `src/lib/data/` (data seam) · `src/lib/i18n/` · `src/App.tsx` · `audit/` (acceptance sweep)
- **Verify:** `npm run build && npm run preview -- --port 4173`, then `npm run audit` in another terminal

## D · Decisions
*One line each. Date · what · why.*
- `2026-09-07` — Typed mock data provider before Supabase to decouple UI progress from schema shifts.
- `2026-09-07` — Inquiry linkage model over cart/checkout flow per SIH26090 artisan requirements.
- `2026-09-07` — Strict 200-line file cap per component to enforce modularity.
- `2026-09-07` — Semantic CSS variables for dual themes ("Raw Cotton" light, "Gallery Wall" dark).
- `2026-09-07` — Full motion system restricted to Home route; lightweight reveals elsewhere.
- `2026-09-08` — Hero motion is type, colour and lateral travel, not parallax depth. Layered planes read as flat and the illustrated motifs (jharokha arches, self-weaving loom, dye washes) all read as decoration laid over the page rather than as the goods. See `memory/decisions.md`.
- `2026-09-08` — No illustrated craft motif in the hero. Texture only (a bias-woven grain), so nothing competes with the headline or dates against real product photography.
- `2026-09-08` — Decoration yields to legibility where they overlap: the hero grain is masked away from the reading column rather than thinned globally, because thinning enough to clear AA leaves nothing visible.
- `2026-09-08` — Buyer-facing numbers are counted from buyer-facing reads, never from `getAnalyticsSummary()`, which is an admin view including pending and rejected rows.
- `2026-09-08` — Remote imagery renders through `RemoteImage`: the wrapper owns the geometry so a dead image cannot collapse a card's layout.
- `2026-09-08` — Mock behaviour is disclosed in the UI, not just in code comments. A demo reviewer takes on-screen copy at face value and cannot read a comment.
- `2026-09-08` — Admin charts are hand-rolled SVG, not Recharts. Supersedes the Recharts mention in §C and PRD 11.8. Two charts on one gated page do not justify ~90 kB gzipped of D3, and inline SVG reads the theme's CSS variables and category dye tones directly instead of needing a theme-reading wrapper around `ResponsiveContainer`. See `memory/decisions.md`.
- `2026-09-10` — Real product photography **is** allowed in the hero, as a rotating spiral beside the headline. This reopens the texture-only hero decision on that decision's own grounds: the illustrated motifs were rejected for being *drawn subjects* competing with the headline, and specifically for dating badly against the real photography arriving in Increments 8 and 10. Photography is not a competing subject — it is the goods. It also sits in its own column beside the copy, never under it, so the grain's legibility mask is untouched. Texture-only still governs the hero *ground*. See `memory/decisions.md`.
- `2026-09-10` — GSAP is a dependency, scoped to the Home maker fan (Increment 18, adopted under §I). It is the first package added for a single component, so the scope is the point: the tween engine drives the fan's deal and hover-push, and nothing else on the site imports it. Its easings do **not** come with it — `elastic.out` and `back.out` are overshoot curves the single-easing law forbids, so both are replaced by `CustomEase.create('kalacart-site', '0.22, 1, 0.36, 1')`. That registration is load-bearing, not decorative: GSAP does not parse CSS easing syntax, `parseEase('cubic-bezier(…)')` returns `undefined`, and a tween given an unrecognised ease **silently** falls back to `power1.out` (measured 0.4375 at quarter progress against the real curve's 0.7649). Every tween would have broken the motion discipline while looking correct. See `memory/decisions.md`.
- `2026-09-10` — The maker fan is desktop-only, with the existing grid below `lg`. A fan needs hover to open and overlaps its own cards by design, so on a touch screen it would present five makers with three partly covered and no gesture to reveal them. Both presentations render the same links from the same read.
- `2026-09-08` — Acceptance criteria are enforced by a committed sweep (`npm run audit`), not by memory. Structure, contrast, overflow, focus and reduced-motion are checked on the production build across four widths and both themes; looks still need a human pass. See `audit/README.md`.
- `2026-09-10` — **The acceptance sweep is blind to texture contrast.** Its contrast pass resolves a background by walking up for the first painted `background-color` (`effectiveBg`, `audit/checks.mjs`), so a texture painted as a `background-image` — every `.material-field__grain`, and any future one — is invisible to it: text is compared against the flat canvas behind the texture. A green sweep is therefore **not** evidence that a ground is legible. Any texture change needs worst-pixel sampling of the rendered page (screenshot the surface, take the darkest local average under the copy, compute the ratio) before it ships. Measured this way against `muted`: hero **4.32:1** with the deep weave (4.58:1 with the default), closing bookend **4.54:1**; the sweep reports none of them and passes 64/64 either way. See `memory/decisions.md`.
- `2026-09-10` — The hero ground is the **deep** weave (26%/20% at 1.25px), the bookend stays the default. Same bias structure, heavier yarn — matched by measurement to 98% of a rejected knit prototype's ink coverage, where the default sits at 25%. Per-surface because the hero's mask clears its reading column and the bookend's centred copy has no such cover. **Known cost, accepted knowingly:** the hero's `muted` body copy drops from 4.58:1 to **4.32:1**, i.e. under the 4.5 AA floor, in light only (dark is unaffected at 6.71:1 — brass never darkens past the canvas). The bookend keeps the default and stays at 4.54:1. `MaterialField` takes a `weight` prop; a knit structure was prototyped and rejected (it read as quilting in light). See `memory/decisions.md`.
- `2026-09-10` — Spiral cards **overlap by design** (~60%); the invariant is paint *order*, not separation. Corrects the "Spiral Card Separation Is a Geometric Invariant" entry above, which misdiagnosed a depth-tiebreak bug as a spacing bug and flattened the helix into a thin ribbon to fix it. Overlap is the depth cue; the real defect was two cards at identical `cos()` depth resolved by array index. `hasCardSeparation()` is replaced by `frontCardIsClear()` in `src/lib/home/spiralInvariant.ts`. See `memory/decisions.md`.

## E · Memory Map
What lives under `/memory`:
- `project-brief.md` — the original kickoff and core mandates, frozen
- `current-strategy.md` — the *now* state and immediate focus, edited weekly
- `decisions.md` — the long-form context and reasoning behind every D entry
- `next-actions.md` — the punch list and build sequence
- `sessions/` — dated session wrap-ups (`YYYY-MM-DD-{short-slug}.md`)
- `bugs-and-risks.md` — active watch-outs, mobile performance, and edge cases

## F · References
- **Repo:** https://github.com/rishi-ventrapragada/KalaCart-Website
- **PRD:** [PRD.md](file:///d:/aiml/KalaCart-Website/PRD.md)
- **Hosting:** Vercel Dashboard

## G · Project-specific overrides & Laws
- **The 200-line law:** No source file exceeds ~200 lines. Extract subcomponents and hooks aggressively.
- **The data seam:** Never call Supabase or import mock fixtures directly in components. All access goes through `src/lib/data/`.
- **The theme seam:** Use semantic Tailwind tokens mapped to CSS variables. Never hardcode raw hex values in components.
- **The i18n seam:** No hardcoded user strings. Reference copy from `src/lib/i18n/`.
- **Three states, always:** Every data view must handle loading (skeletons), empty, and error states with retry.
- **Quality floor:** Responsive from 360px, visible focus rings, Esc-closable modals, reduced-motion respected.
- **Motion discipline:** Single easing curve `cubic-bezier(.22, 1, .36, 1)`. One Lenis rAF loop on Home only. Anything the engine writes per frame carries `transition: none` **explicitly** — a zero duration is not enough, because `transition-property` defaults to `all` and one inherited duration silently reintroduces the lag. Shape binary: 999px capsule controls, 18–28px card radii.
- **Workflow & Git:** Plan before non-trivial building; inspect read-only first; verify in browser on both themes; stage explicit file paths only (never `git add .`); use heredoc commit messages.

## H · Memory Save Protocol
When explicitly asked to save, store, wrap up, or remember the conversation (e.g. "save this", "wrap this up", "remember this"):
1. Write a markdown summary to `memory/sessions/YYYY-MM-DD-{short-slug}.md` using today's date.
2. Structure: H1 title, one-line TL;DR, **What we discussed**, **What we decided**, and **What's next**.
3. Keep it punchy and concrete — no fluff.
4. Never write to `memory/sessions/` without an explicit trigger from the user in chat.

## I · External Component Adoption Protocol
Governs any component pasted in from outside this repo — reactbits, Codrops, a CodePen, a reference site, another project. External components are written against no constraints; this codebase has eight. Run every step, in order, **before** integrating. Where a step conflicts with the source component, the codebase wins.

1. **Scope.** Name the route and section it lands in. Home carries the full motion budget; every other route is reveal-only, with no continuous animation.
2. **Motion audit.** Does it start its own `requestAnimationFrame` loop or attach its own scroll listener? If it is scroll-linked and going on Home, it registers through `useScrollEngine.register()` — never a second independent scroll source alongside the Lenis singleton, which would read a different value than the rest of the page and drift out of phase. A self-contained, non-scroll-linked animation (a continuous auto-rotation, say) is lower risk, but still owes step 3.
3. **Reduced motion.** Under `prefers-reduced-motion` the loop must *stop*, not slow down and not zero its visual delta. No idling loops. Match `useScrollEngine`: compute the resting state, write it once, and never call `requestAnimationFrame` at all.
4. **Colour audit.** Every raw hex, `rgba()` and named colour mapped to an existing semantic token, verified in both themes. A genuinely new colour needs a §D decision first.
5. **Dependency check.** If it needs a package the stack does not already carry (framer-motion, GSAP, three.js), **stop and ask.** Never install silently.
6. **Data.** Real content is read through `src/lib/data/`, never the component's own fetch. If the read is async it owes the three-states rule — and if a state is deliberately omitted, say so and why rather than letting it pass unnoticed.
7. **i18n.** Every user-facing string extracted into `src/lib/i18n/`. No hardcoded copy.
8. **File-size cap.** Split to fit the ~200-line law. Logic comes out into hooks; pure maths comes out into its own module.
9. **Accessibility.** Verify keyboard operability, focus visibility, `alt` text and ARIA roles **by hand.** Do not assume the source got any of it right — it usually did not.
10. **Decision conflicts.** If adopting it reopens or contradicts a §D decision, record a new §D entry giving the reasoning, rather than silently overriding the old one.
