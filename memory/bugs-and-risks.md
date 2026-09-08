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

