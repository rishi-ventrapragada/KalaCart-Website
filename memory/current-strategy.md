# Current Strategy — KalaCart Web

*Updated: 2026-09-08*

## Where the build stands
All sixteen increments of the PRD 13 build sequence are complete. The front end
is feature-complete against the typed mock provider: buyer surfaces (Home,
Browse, product detail, artisan profile, 404), the inquiry linkage flow, and the
admin desk (mock gate, verification queue, artisan management, analytics).

The PRD 14 acceptance criteria are now enforced by `npm run audit` rather than by
memory — every route, four widths, both themes, plus reduced-motion. It exits
non-zero on failure, so it can gate a deploy.

## Current Focus
1. **Hold the line the sweep draws.** Run `npm run audit` against the production
   build after any change to a surface. Its first full run found a heading-order
   defect on `/browse` that fifteen increments of manual checking had missed.
2. **Both themes still need human eyes.** The sweep proves structure, contrast,
   overflow and focus. It says nothing about whether a page reads well. Anything
   visual gets a manual pass in both themes before it ships.
3. **Keep the seams intact.** Every data read through `src/lib/data/`, every
   string through `src/lib/i18n/`, every colour through a semantic token. These
   are what make the Supabase swap a one-line change rather than a refactor.

## What comes next
Supabase wiring is the next body of work and is deliberately a separate task
(PRD 15). It is blocked on the four open questions in PRD 16 — table and column
names, the `status` enum, who owns the `admins` table, whether the mobile app
writes products as `pending` before an artisan is approved, and the Storage path
convention for gallery URLs. Those are conversations with the teammate, not
front-end decisions.

Two smaller items carried forward:
- No `featured` flag in the shared schema, so the Home grid uses recency. Worth
  raising alongside the PRD 16 questions.
- Brass and marigold sit close in hue in the category chart (a 1.18 luminance
  ratio between them). Cosmetic, acknowledged, and explicitly not blocking:
  nothing is encoded in colour alone, since every bar is labelled in text.
