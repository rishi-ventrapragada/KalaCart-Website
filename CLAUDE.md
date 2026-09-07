# CLAUDE.md — Engineering Constitution

This file governs how you work in this repository. It outranks habit and default behavior. Read `PRD.md` for what to build; this file is how to build it. When the two conflict, ask.

---

## Project

**KalaCart** — the buyer-facing marketplace plus admin dashboard for an Indian artisan-craft platform (SIH26090, Ministry of Social Justice & Empowerment). Companion to a separate Java/Android app built by a teammate against the **same Supabase backend**. This repo is the **website front-end**, built against a **typed mock data layer** first (see `PRD.md` §5.2).

**North star: design polish.** When trading scope against quality, cut scope. A smaller site that feels refined beats a broad one that feels rough.

**Stack:** Vite · React 18 · TypeScript (strict) · Tailwind CSS · React Router · Lenis · lucide-react · Recharts · react-i18next (or a typed dictionary) · deployed on Vercel.

---

## The laws (non-negotiable)

1. **File-size law.** No source file exceeds about **200 lines**. One route is one thin page component composing many small component files. When a file nears the cap, extract a component or a hook.

2. **The data seam.** Components never import mock data and never call Supabase directly. All data access goes through `src/lib/data/`. Both `mockProvider` and `supabaseProvider` expose the same typed signatures, so the backend can be swapped in one file later.

3. **The theme seam.** Two first-class themes (light "Raw Cotton", dark "Gallery Wall") via CSS variables on the root element. Components use semantic Tailwind classes mapped to those variables. Never hardcode a hex value in a component. The toggle persists for the session.

4. **The i18n seam.** No user-facing string is hardcoded in a component. All copy comes from the single strings source in `lib/i18n`, referenced by key. Adding a language later must be one new file, not a refactor.

5. **TypeScript strict.** No `any` without a one-line comment justifying it. Every component has a typed props interface. No build warnings.

6. **Three states, always.** Every data-driven view handles loading (skeletons), empty (purposeful, tells the user what to do), and error (plain, with retry). A happy-path-only screen is not done.

7. **Quality floor.** Responsive from 360px, visible keyboard focus, focus-trapped modals that close on Esc, `prefers-reduced-motion` respected, accessible contrast in both themes. Build this in, do not bolt it on.

8. **No browser storage** except the single documented mock-auth flag.

---

## Motion discipline

- **One easing curve** for every transition on the site: `cubic-bezier(.22, 1, .36, 1)`. Define it once, reuse it. Nothing bounces or overshoots.
- **The full motion system runs on the Home route only** (parallax hero, floating product card emerging from behind the pinned front layer, line-mask headline, scroll-progress bar, nav-to-glass). Browse and admin get only the lightweight reveal-on-scroll. Do not put parallax behind product grids or data tables.
- **One scroll value drives everything on Home.** Read Lenis's scroll inside one requestAnimationFrame loop and fan out to every scroll-reactive element via one render function. Never attach per-component scroll listeners.
- **Split transition from transform** on parallax elements. Position is written as an inline `transform` every frame; never put `transform` in a CSS transition on those elements, or it lags behind scroll. Scope reveal transitions to `opacity`.
- **The accent color is for glows and highlights only** (chip dot, progress bar, hover shadow, focus ring, links). Never a large fill.
- **Shape binary:** interactive controls are full capsules (`border-radius: 999px`); containers and cards are soft rounded rectangles (18 to 28px). Keep it strict.
- **Reduced motion:** reveals resolve instantly, parallax freezes. Fully usable with motion off.

---

## Workflow

1. **Plan before building.** For any non-trivial task, present a short plan first (files you will create or change, the approach) and wait for a go-ahead. Do not start editing on an ambiguous request.

2. **Investigate read-only first.** Before changing existing code, read it. Understand the current state before proposing edits.

3. **Build in increments.** Follow the build sequence in `PRD.md` §13. Finish one increment, including its states and a browser check, before starting the next.

4. **Deploy day one, verify in the browser.** The empty skeleton goes to Vercel first. After each increment, verify the change in the running app, in both themes, not by assuming it works. Undeployed or unbuilt code does not run. Check the actual rendered page before calling something done.

---

## Design

- On any visual pass, **invoke the design skill plugin** installed in the terminal, and follow it for token application, spacing, type, and critique.
- The two themes are defined in `PRD.md` §9. Apply them through the theme seam, never as inline hex.
- **Avoid the generic-AI craft-page tells:** cream background plus terracotta accent plus thin high-contrast serif, fade-up on every card, all-caps eyebrow labels, identical grey-shadow cards, an arrow appended to every link. Make choices grounded in the craft subject matter.
- Spend boldness in one place per screen; keep everything around it quiet.

---

## Git

- **Stage explicit paths only.** Never `git add -A` or `git add .`. Add the specific files for the change.
- **Small, focused commits**, one increment or one coherent change each.
- **Commit messages with special characters** (`@`, quotes, backticks) break shell quoting. Use a heredoc rather than inline `-m`:
  ```
  git commit -F- <<'EOF'
  feat: add product detail with gallery and inquiry modal
  EOF
  ```
- Do not commit secrets or `.env`. The mock-auth credential is fine to commit only because it is explicitly a mock; label it as such.

---

## Code conventions

- **Naming:** PascalCase for components and their files, camelCase for functions and variables, `useX` for hooks.
- **Styling:** Tailwind utilities mapped to theme variables. No inline hex in components. Use a `cn()` helper for conditional classes.
- **Data functions** are async and return typed values; the mock provider simulates latency so loading states are real.
- **Copy:** plain, active voice, sentence case, referenced by i18n key. CTAs say what happens ("Send inquiry", not "Submit"). Errors explain what happened and how to fix it, no apologies. Empty states invite an action.
- **Money:** format rupees through one `formatInr` helper.

---

## When to stop and ask

- The request contradicts `PRD.md` or this file.
- A data-model field or the `status` enum is ambiguous (`PRD.md` §8 and §16, shared with the teammate's schema).
- A task would need a dependency not listed in the stack.
- Something cannot be verified in the browser and you are unsure it works.

A short question beats guessing and building the wrong thing.

---

## Don't

- Don't add state libraries, UI kits, or dependencies beyond the stack without asking.
- Don't call Supabase directly from components (use the seam).
- Don't hardcode strings (use i18n) or hex colors (use theme tokens).
- Don't put the full motion system anywhere but Home.
- Don't present the mock auth as real security.
- Don't add any purchase, cart, or checkout flow. The model is linkage only.
- Don't mark work done without a browser check in both themes.
- Don't let a file cross about 200 lines.
- Don't `git add -A`.
