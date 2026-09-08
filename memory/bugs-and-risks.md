# Bugs and Risks

## Active Watch-outs
1. **Motion Performance on Mobile:** Lenis smooth scrolling paired with CSS transforms must not degrade below 60fps on lower-end devices. Fallback to native scrolling when needed.
2. **Theme Seam Discipline:** Risk of hardcoded hex values slipping in during rapid component creation. Regularly lint/grep for raw hex values.
3. **Shared Backend Schema Parity:** Ensure field names and types in `mockProvider` strictly match the Android app's Supabase schema (defined in `PRD.md` §8 & §16).
4. **File Size Drift:** Keep components strictly below 200 lines to avoid Claude skimming and cognitive overload.

## Resolved (Increment 7)
These were all caught by the Playwright dead-scroll check asserting *rendered
values* rather than attribute flips. Worth keeping the pattern for Increments
8-10, where more scroll-driven surfaces arrive.

5. **Engine mount-paint gap.** `useScrollEngine` skipped element-gated
   subscribers on first paint, because the IntersectionObserver had not yet
   reported and every gated subscriber still read as inactive. The scene sat
   untransformed until the reader scrolled. Fixed by rendering any subscriber
   the observer has not reported on yet (`reported` flag).
6. **`rotate-180` silently discarded.** A CSS class transform on an element the
   engine writes an inline transform to is replaced wholesale, not composed.
   The bookend's mirrored scene vanished. Any flip must live in SVG user space
   or on a wrapper the engine does not touch.
7. **Rail dead scroll.** Lateral travel computed from the rail's own
   `scrollWidth - clientWidth`, which is always 0 for a `w-max` element. Must be
   measured against the containing section.
8. **`transition: all` on scroll-driven elements.** Duration was `0s` so nothing
   lagged yet, but one inherited duration would have reintroduced it invisibly.
   Now declared `transition: none` explicitly.
9. **Grain vs AA.** Making the hero texture visible pushed body copy under the
   4.5:1 floor. Fixed by masking the grain off the reading column, not by
   thinning it. **Watch this whenever a decorative layer sits behind text.**

## Active watch-out added Increment 7
5. **Reduced motion can strand content.** With the craft rail's drift frozen,
   its later cards would be parked off-screen and unreachable. Any scroll-driven
   *positioning* (as opposed to decoration) needs a hand-reachable fallback —
   the rail takes `overflow-x: auto` with snap points. Applies to anything
   similar in Increments 8-10.

## Resolved (Increment 16)
10. **Dead per-frame work in `MaterialField`.** Both instances (hero and the
    closing bookend) subscribed to the scroll engine and wrote `--field-p` and
    `--field-drift` every frame. Nothing had read either since the dye washes
    were removed in Increment 7 — a `getBoundingClientRect` plus two style
    writes per frame, on the one route already carrying the whole motion
    system, feeding nothing. Component is now static; the two custom properties
    are gone from the CSS. Verified the grain renders identically before and
    after scroll.
11. **The craft rail's error state had no retry.** It rendered bare text telling
    the reader to reload the page — the only error state on the site without an
    action, contradicting PRD 5.4, which requires a retry on every one. Now uses
    `ErrorState` with a real retry, and the copy no longer mentions reloading.
12. **Cascading render in the rail's retry.** The first fix called
    `setState('loading')` at the top of the effect, which starts a second render
    pass on every run; oxlint's `react(set-state-in-effect)` caught it. Loading
    is now *derived* by comparing the attempt a result belongs to against the
    current one — the same trick `useAsyncData` already uses. **Worth copying
    wherever a component hand-rolls a fetch instead of using that hook.**
13. **`ArtisanRow` had no empty state.** With no approved artisans it rendered a
    heading and a "See all artisans" link over an empty grid, which reads as a
    broken layout. Now matches `ProductGrid`.
14. **Twelve orphaned i18n keys**, including one added the increment before and
    never used. Removed. The typed key union means the build proves they were
    unreferenced.

## Active watch-out added Increment 16
6. **A dev-only route ships to production unless deliberately removed.**
   `/kitchen-sink` was in the public bundle and reachable by URL for nine
   increments, only ever caught because a comment said to remove it. Anything
   added "temporarily" needs an owner and a removal increment written down at
   the moment it is added, not a comment hoping someone reads it.
7. **The audit sweep is structure, not looks.** `npm run audit` proves contrast,
   overflow, focus and heading order. It says nothing about whether a page reads
   well or a chart is legible, so both themes still need a human pass.

