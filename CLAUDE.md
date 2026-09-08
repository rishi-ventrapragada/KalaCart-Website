# KalaCart — CLAUDE.md
*Last updated: 2026-09-08 · Owner: Rishi Ventrapragada*

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
- **Libraries:** Lenis (smooth scroll) · Lucide React · Recharts · react-i18next
- **Hosting / infra:** Vercel
- **Key services:** Supabase (shared backend via data seam)
- **Run locally:** `npm run dev`
- **Key files:** `PRD.md` · `src/lib/data/` (data seam) · `src/lib/i18n/` · `src/App.tsx`

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
