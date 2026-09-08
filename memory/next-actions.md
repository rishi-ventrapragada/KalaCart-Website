# Next Actions — Punch List

*Derived from PRD.md §13 build sequence, which is authoritative. An earlier
version of this file used a different, conflicting numbering; it was replaced on
2026-09-08 rather than reconciled.*

## Done
- [x] **0** Scaffold Vite + TS + Tailwind + Router + Lenis
- [x] **1** Theme system: both palettes, ThemeProvider, toggle
- [x] **2** Data seam + types + mock data
- [x] **3** i18n seam + English strings
- [x] **4** `ui/` primitives + layout chrome
- [x] **5** Design pass; type and contrast locked (AA floor resolved)
- [x] **6** Motion primitives: Lenis shell, useReveal, useScrollEngine
- [x] **7** Home hero — material field, line-mask headline with accent underline,
      craft rail, progress bar, nav glass. Both themes, 360/1280,
      reduced-motion. Shipped in `6b44172`.
- [x] **8** Home sections — featured artisans row, featured products grid (8
      newest approved), impact band. All three states each, `useAsyncData`
      extracted, `ProductCard` set as the reusable pattern for Increment 9.
      352 assertions green. Shipped in `6b44172`.
- [x] **9** Browse and search — URL-driven filters, reveal-only motion,
      `ProductCard` moved to `components/product/`, i18n dictionary split into
      six per-surface segments. 416 assertions green. Shipped in `d4d6715`.

- [x] **10** Product detail — keyboard-navigable gallery, validated inquiry
      modal with honest mock-write copy, WhatsApp link, not-found state.
      113 assertions green.

- [x] **11** Artisan profile — header plus their approved products.
- [x] **12** Admin auth gate + AdminLayout — mock gate, disclosed on screen.
- [x] **13** Verification queue — approve/reject with confirm, toast, rollback.
- [x] **14** Artisan management — searchable, filterable table with row actions.
- [x] **15** Analytics — five stat cards and two hand-rolled SVG/CSS charts.
      Recharts dropped; see CLAUDE.md section D. Shipped in `b5bc8ae`.

- [x] **16** Polish pass — designed 404, `/kitchen-sink` removed from the public
      bundle, dead per-frame work cleared, craft-rail error given a real retry,
      `ArtisanRow` empty state added, twelve orphaned i18n keys removed, and a
      committed acceptance sweep (`npm run audit`) that found and fixed a
      heading-order break on `/browse`.

## Next
- [ ] Supabase wiring (PRD 15) — blocked on the four PRD 16 open questions.
      Separate task; do not start it inside a front-end increment.

## Carried debt
- ~~`MaterialField` writes `--field-p` every frame with nothing painting from
  it.~~ Cleared in Increment 16: both instances (hero and closing bookend) are
  now static, and the two dead custom properties are gone from the CSS.
- No `featured` flag in the shared schema, so the Home grid uses recency.
  Worth raising with the teammate — belongs in PRD 16's open questions.
- `lab/` was gitignored and local only. Superseded in Increment 16 by
  `audit/`, a committed acceptance sweep run with `npm run audit`.

## Deployment
PRD 13 governs: **each increment ends deployed to Vercel and verified in the
browser before the next begins.** There is no separate sign-off step.

*Correction, 2026-09-08:* a one-time instruction during Increment 7 to hold that
increment back from Vercel was wrongly generalised into a standing "no deploy
without sign-off" policy and written into this file and into agent memory. It
was never a policy, and it contradicted PRD 13 the whole time. Removed. A
specific increment can still be held back, but only when asked for that
increment.
