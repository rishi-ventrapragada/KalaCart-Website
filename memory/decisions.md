# Architectural & Engineering Decisions

*Expanded reasoning behind Section D of CLAUDE.md.*

- **2026-09-07 · Typed Data Seam over Direct Supabase Calls**
  - *Context:* Companion Android app is simultaneously modifying the shared schema.
  - *Decision:* Build UI against `src/lib/data/` interfaces implemented by `mockProvider` with latency simulation.
  - *Why:* Decouples frontend development from backend deploy cycles; prevents schema instability from breaking UI work.

- **2026-09-07 · Inquiry Linkage over Cart/Checkout Flow**
  - *Context:* Indian artisans often deal with made-to-order, custom, or bulk craft requests.
  - *Decision:* Omit cart and payment gateways. Use verified inquiry modal and direct communication channels.
  - *Why:* Matches the SIH26090 requirement and avoids regulatory/logistical overhead of direct e-commerce transactions.

- **2026-09-07 · 200-Line File Limit & Strict Composition**
  - *Context:* Large monolitihic components degrade maintainability and challenge LLM context windows.
  - *Decision:* Keep all source files under ~200 lines by aggressively extracting hooks and subcomponents.
  - *Why:* Keeps files focused, testable, and prevents context degradation during development.

- **2026-09-07 · Scoped Motion System (Home Route Only)**
  - *Context:* Heavy scroll-driven animations can slow down catalog browsing and administrative work.
  - *Decision:* Run the full motion system and Lenis-driven progress on Home only. Rest of site uses lightweight scroll reveals.
  - *Why:* Preserves 60fps performance and high usability across data-dense views.

- **2026-09-08 · Hero Motion is Type, Colour and Lateral Travel, not Parallax Depth** *(Increment 7)*
  - *Context:* PRD 10.2 specified a layered parallax hero: tinted backdrop, far and mid craft-silhouette planes, a floating product-card mockup, and a pinned front silhouette the card emerged from behind (the "front-occlusion signature move"). It was built in full and verified at 284 assertions.
  - *What happened:* Rejected on review. Three further directions were built and shown:
    1. **Layered jharokha arches** — rejected. The motif read as Rajasthani *architecture*, but the product is craft *objects*; it was heritage-generic rather than about the goods. The owner also removed the floating card, which took the front-occlusion effect with it, leaving four planes drifting ~77px — technically correct and emotionally flat.
    2. **The loom** (warp threads struck on load, weft drawn across by scroll, cloth building under the copy) — rejected. The mechanic worked, but at hero scale it read as graph paper rather than as cloth.
    3. **Kinetic type + material field + craft rail** — accepted.
  - *Decision:* The hero's motion is the headline assembling, a dye underline drawing under one marked word, and a category rail travelling laterally against the vertical scroll. No depth planes.
  - *Why:* Four planes sliding at slightly different rates is the most conservative device in the scroll vocabulary — nothing *happens*, you only notice it if you look for it. Lateral travel moves in a direction the reader is not producing themselves, which is what actually reads as alive. It also uses the dye palette (PRD 9.3) that was otherwise sitting unused in the token file.

- **2026-09-08 · No Illustrated Craft Motif in the Hero** *(Increment 7)*
  - *Context:* PRD 10.2 asked to "choose one craft motif and commit" — block-print border, jharokha arches, or pottery/loom shapes.
  - *Decision:* None of them. The hero ground is texture only: a bias-woven grain at 45°/135°.
  - *Why:* Every illustrated option tried read as decoration laid over the page rather than as the subject. A drawn motif also dates badly against the real product photography arriving in Increments 8 and 10, and competes with the Fraunces headline that PRD 9.4 makes the page's voice. Texture gives the canvas a surface without introducing a subject that argues with the type.
  - *Also rejected under this heading:* large blurred dye washes. At hero scale a soft colour bloom reads as a **lighting effect sitting on top of the page**, not as material, and it dirtied the canvas either side of the copy.

- **2026-09-08 · Decoration Yields to Legibility Where They Overlap** *(Increment 7)*
  - *Context:* Making the woven grain visible enough to read as texture pushed `muted` body copy to ~3.3:1 in light and ~3.9:1 in dark — both under the 4.5:1 AA floor the Increment 5 contrast pass established.
  - *Decision:* Mask the grain away from the reading column rather than thinning it globally. Full strength across the open side of the frame, faded to nothing under the copy.
  - *Why:* Thinning the threads far enough to clear AA everywhere left nothing visible at all — the fix destroyed the feature. Masking keeps both: the texture reads where there is nothing to read, and yields exactly where words are. Measured after: 4.59:1 light, 6.24:1 dark for body copy; 10.09:1 for the headline.

- **2026-09-08 · Explicit `transition: none` on Every Scroll-Driven Property** *(Increment 7)*
  - *Context:* PRD 10.2 warns to split `transition` from `transform`. Verification found `transition-property: all` computed on the rail and the blooms.
  - *Decision:* Scroll-driven elements declare `transition: none` explicitly, never merely inherit a zero duration.
  - *Why:* The CSS initial value for `transition-property` is `all`. The duration happened to be `0s`, so nothing lagged *yet* — but any inherited duration anywhere above those elements would have silently reintroduced a full-beat lag behind the scroll, and it would have been very hard to trace back.

- **2026-09-08 · Public Numbers Come From Buyer Reads, Not the Admin Summary** *(Increment 8)*
  - *Context:* The Home impact band initially showed `getAnalyticsSummary().totalProducts`, which is 30. Browse will show the 23 approved products.
  - *Decision:* Count products and traditions from `getProducts()` (approved only); take only the inquiry total from the summary.
  - *Why:* The summary is an admin view and includes pending and rejected rows. A public band asserting 30 crafts next to a catalogue of 23 is a factual error, and on a ministry programme page that is worse than a slow extra request. Applies to any future public stat.

- **2026-09-08 · Remote Images Cannot Break a Card** *(Increment 8)*
  - *Context:* Product and artisan imagery is served from a remote host (picsum now, Supabase Storage later), so a 404 or a blocked request is normal rather than exceptional. A bare `<img>` that fails collapses to its alt text and drags the card's layout with it.
  - *Decision:* All remote imagery renders through `RemoteImage`. The wrapper owns the aspect ratio and paints a tonal placeholder; the image sits on top and is removed on error.
  - *Why:* Verified by blocking the image host entirely — all 8 cards keep their geometry, titles stay readable, no horizontal overflow. The placeholder also shows while the image is in flight, so there is no layout shift on arrival.

- **2026-09-08 · Rail Travel Maps to Real Overflow, Not a Fixed Fraction** *(Increment 8)*
  - *Context:* The craft rail used a fixed fraction of its overflow, tuned at 1280px. At 360px the rail is over four viewports wide: the first card started off-screen to the right (x=468) and the last was never reachable.
  - *Decision:* Map the section's progress onto the rail's actual overflow, clamped, so the first card is flush on entry and the last is reached on exit at any width.
  - *Why:* A phone reader otherwise arrives at an apparently empty strip and can never see the later crafts. Now asserted in the harness at both widths so it cannot regress.

- **2026-09-08 · Mock Behaviour Is Disclosed in the UI, Not Just in Code** *(Increment 10)*
  - *Context:* The inquiry form's success toast was planned as "Your message has been sent", with a code comment marking the write as MOCK.
  - *Decision:* The copy reads "Inquiry saved. In the full version this reaches the artisan directly."
  - *Why:* `createInquiry` writes to an in-memory store that resets on reload. Nothing reaches any artisan. A judge or ministry reviewer seeing the site demoed takes on-screen copy at face value and has no way to read a code comment, so the honest disclosure has to be where they are looking. Applies to the mocked admin auth in Increment 12 too.

- **2026-09-08 · Focus-on-Invalid Must Not Query the DOM Synchronously** *(Increment 10)*
  - *Context:* The inquiry form focused the first invalid field with `querySelector('[aria-invalid="true"]')` inside the submit handler. Verification found focus stayed on the submit button.
  - *Decision:* Derive the first invalid field from the validation result's field order, then index into the form's controls.
  - *Why:* The handler runs before React re-renders, so `aria-invalid` is not on the DOM yet and the query returns nothing. The fields were correctly marked and correctly focusable; only the timing was wrong, which is exactly the kind of defect that looks fine in a screenshot and fails for a keyboard user.

- **2026-09-08 · Hand-Rolled SVG Charts, Not Recharts** *(Increment 15)*
  - *Context:* CLAUDE.md §C listed Recharts in the stack and PRD 11.8 names it explicitly for the analytics bar and line charts. It was never actually installed — `package.json` has no charting dependency at all, so Increment 15 was the point where the library either arrived or was dropped.
  - *Decision:* Drop it. Both charts are inline SVG, built from the `AnalyticsSummary` the seam already returns. This supersedes §C and PRD 11.8.
  - *Why:* Three reasons, in order of weight. **Bundle:** Recharts pulls a set of D3 sub-packages, roughly 90 kB gzipped, to draw a six-row bar list and a nine-point line on a single admin-gated page no buyer ever loads — the whole current dependency tree is smaller than that. **Theme integration:** the entire design system is CSS variables swapped under `[data-theme]`, and inline SVG inherits `var(--accent)` and the per-category dye tones for free, in both themes, with no re-render. Recharts takes colours as JS props, so dual-theme support would mean reading resolved variables in JS and threading them through `ResponsiveContainer` — a wrapper whose only job is to undo the library's assumption that colour is static. **Size:** the charts are ~60 lines of SVG each, comfortably inside the 200-line law, so the library was not saving meaningful work either.
  - *Trade-off accepted:* no tooltips or animated transitions out of the box. Neither is required by 11.8, and the accessible `<table>` fallback each chart card carries gives exact values without hover — which serves a keyboard or screen-reader user better than a tooltip would.
  - *Revisit if:* a later increment needs genuinely interactive charts (brushing, zoom, dense time series). Two static charts is not that.

- **2026-09-08 · The Acceptance Criteria Are a Committed Script, Not a Habit** *(Increment 16)*
  - *Context:* PRD 14 lists eleven global acceptance criteria. Through fifteen increments they were checked by hand, or by a Playwright harness in `lab/` that was gitignored and thrown away after each use. Increment 16's whole deliverable is the claim "everything built so far still holds", which is exactly the claim nobody can check by reading a commit.
  - *Decision:* `audit/` is committed and run with `npm run audit`. It sweeps every route at 360/768/1024/1280 in both themes, plus a reduced-motion pass, and exits non-zero on failure.
  - *Why:* A disposable harness verifies one moment and then stops existing; the next person to touch a component has no way to know what it used to guarantee. Committing it turns the acceptance criteria into something executable, and it found a real defect on its first full run (see below) that fifteen increments of manual checking had missed.
  - *Design:* `checks.mjs` splits `snapshot()` (runs in the page, measures only) from the assertions (run in Node, judge only), so every judgement is readable in one place rather than buried in a string serialised into a browser. `motion.mjs` holds the reduced-motion checks. Adding a check is one exported function plus one line in the runner.
  - *Deliberately excluded:* anything about whether a page looks right. The sweep proves contrast, overflow, focus and heading order; both themes still need a human pass. A harness that claimed to check taste would be trusted for something it cannot do.

- **2026-09-08 · Rendered Geometry, Not Class Presence** *(Increment 16, restating Increment 7)*
  - *Context:* The reduced-motion craft-rail check could have asserted that `.craft-rail` carries `overflow-x: auto`. The Increment 7 dead-scroll bug would have passed that check while the rail sat motionless.
  - *Decision:* The sweep scrolls the last card into view and asserts its measured bounding box is actually on screen.
  - *Why:* The class was always present in that bug; what was wrong was the computed geometry (`scrollWidth === clientWidth` on a `w-max` element). A check that asserts intent rather than outcome will pass for exactly the bugs that matter. Worth applying to any future check of a scroll-driven or layout-dependent behaviour.

- **2026-09-08 · Loading Is Derived, Never Set** *(Increment 16)*
  - *Context:* Adding a retry to the craft rail's error state, the obvious implementation called `setState('loading')` at the top of the effect. oxlint's `react(set-state-in-effect)` flagged it.
  - *Decision:* Store the attempt a result belongs to, and derive `loading` by comparing it against the current attempt - the trick `useAsyncData` already uses.
  - *Why:* Setting state synchronously in an effect starts a second render pass on every run. The rail hand-rolls its fetch because the drift ref makes the hook awkward, and in doing so it had quietly diverged from the pattern the hook exists to enforce. Any component that hand-rolls a fetch should copy the attempt-comparison, not the naive version.

- **2026-09-10 · Real Product Photography Is Allowed in the Hero** *(Increment 17)*
  - *Context:* A rotating 3D image-spiral was proposed for the hero, beside the headline, showing real product photos. Two standing decisions appeared to forbid it: "No Illustrated Craft Motif in the Hero" (texture only) and "Decoration Yields to Legibility Where They Overlap".
  - *Decision:* Adopt it. The spiral renders real listings from the data seam, in its own column to the right of the copy.
  - *Why:* The earlier rejection was of *drawn subjects*, on two grounds that do not transfer. First, an illustration is a second subject arguing with the Fraunces headline for the page's voice; photography of the goods is the page's actual subject, the same frames Browse renders. Second, that decision explicitly rejected illustration for "dating badly against the real product photography arriving in Increments 8 and 10" — this *is* that photography, so the objection now argues for it. The legibility rule is untouched because nothing overlaps: the spiral is a grid sibling of the copy, not a layer behind it, and the grain mask still clears the reading column.
  - *Scope:* Texture-only still governs the hero **ground**. `MaterialField` is unchanged.
  - *Also decided:* The hero gains **no** loading or error state. The headline column paints independently, so first paint and LCP are unaffected; the spiral is absent until its data lands and renders nothing at all on error. A deliberate exception to the three-states rule on the grounds that this is decoration, not a data view — the same reasoning that makes `RemoteImage` swallow a dead image rather than surface it.
  - *Also decided:* Front-of-spiral positions carry object-forward crops (blue pottery, Madhubani, brassware); scene-like frames (a weaver at a loom, a vendor in a stall) sit toward the back where the edge blur abstracts them. Checked by eye at render size: the scene frames dissolve into indistinct texture below about 110px, and block printing at 88px is a plain blue rectangle. This is an ordering choice within the existing pool — no fixture changed, and Browse and the featured grid, which render at full card size, are untouched.

- **2026-09-10 · The Hero Spiral Is the One Continuous rAF Loop Outside Lenis** *(Increment 17)*
  - *Context:* The adopted component (`InfiniteSpiral`, external) shipped its own rAF loop *and* a `window` scroll listener. The listener was attached unconditionally — the `animationMode` check sat inside the handler — so restricting the mode would have left the listener in place, merely inert.
  - *Decision:* The scroll listener is deleted outright, not disabled. The rAF loop stays, because it is not scroll-linked: it advances on its own clock and never reads scroll position, so it cannot drift out of phase with the Lenis singleton the way a second scroll source would.
  - *Why:* The motion discipline forbids a second *scroll source*, not a second animation. A clock-driven loop on Home, the one route with the motion budget, is in policy; a second reader of scroll position is not, because it would sample raw `window.scrollY` while everything else reads the Lenis-smoothed value.
  - *Also decided:* Under `prefers-reduced-motion` the loop **never starts** — `requestAnimationFrame` is not called once. The source zeroed its speed and kept the loop alive forever, writing transform, opacity, filter and zIndex to every card every frame to produce a static picture. Verified by counting rAF calls in the page: 0 under reduced motion, ~180 per 1.5s otherwise.
  - *Also decided:* The subtree is `aria-hidden` with no roles, no `alt` text and nothing focusable. The source announced eight list items labelled "Spiral image 1…8" and put rotating links in the tab order — focusable targets that move away and can sit at `opacity: 0`. Generated alt text of that kind passes the sweep's `img has alt` check while being worse than silence, which is why §I step 9 requires checking accessibility by hand.

- **2026-09-10 · Spiral Card Separation Is a Geometric Invariant, Not a Tuning Choice** *(Increment 17)*
  - *Context:* Cards overlapped as they came round the front of the helix — one image sliding across the one before it instead of floating into place. Measured across a full rotation: up to **67% overlap, on every single frame**.
  - *Cause:* Two independent errors, both inherited from the adopted component's defaults. 132px cards were rising only 58px between neighbours, so they overlapped by 74px before anything moved; and the perspective term was clamped at 1.45, letting the front card inflate to 183px against that same 58px gap — a 125px overlap at the front of the turn. The horizontal swing could never rescue it: the swing is a sine, so twice per turn it passes through zero, and at exactly those moments vertical spacing is the only separation there is. Its peak (130px) was in any case below the 132px card width.
  - *Decision:* `verticalSpacing` must be at or above `cardHeight × centerScale × DEPTH_SCALE_MAX`. Shipped as 112px cards, 140px spacing, centreScale 1.08, depth clamped to 1.12 (invariant: 140 ≥ 135.48). Verified 0.000000 worst-case overlap across the full cycle at four container widths, and 0 on real rendered boxes over 40 browser samples.
  - *Why an invariant rather than tuned numbers:* the failure looks like a design choice. Overlapping cards read as a deliberate stack, so nobody files it as a bug — it went out in the first pass unnoticed. `hasCardSeparation()` is exported from the transform module and asserted at module load in development, so a later change to spacing, card size or centre scale fails loudly at the source instead of surfacing weeks later in a screenshot.
  - *Cost accepted:* centre emphasis drops from 1.18 to 1.08 and cards from 132px to 112px. The front card is less dominant than the first pass, which is the price of never colliding; the depth read now comes from the blur and fade rather than from scale alone.
