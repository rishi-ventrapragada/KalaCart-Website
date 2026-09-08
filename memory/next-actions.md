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
      reduced-motion. *Not yet deployed: awaiting owner sign-off.*
- [x] **8** Home sections — featured artisans row, featured products grid (8
      newest approved), impact band. All three states each, `useAsyncData`
      extracted, `ProductCard` set as the reusable pattern for Increment 9.
      352 assertions green. *Not yet deployed.*

## Next
- [ ] **9** Browse and search — URL-driven filters, reveal-only motion
- [ ] **10** Product detail + ImageGallery + InquiryModal + WhatsApp
- [ ] **11** Artisan profile (minimal)
- [ ] **12** Admin auth gate + AdminLayout
- [ ] **13** Verification queue
- [ ] **14** Artisan management
- [ ] **15** Analytics
- [ ] **16** Polish pass: responsive audit, focus states, reduced-motion, 404

## Carried debt
- `MaterialField` still subscribes to the scroll engine and writes `--field-p`
  every frame, but nothing paints from it since the dye washes were removed.
  Drop the subscription if the grain stays as-is.
- No `featured` flag in the shared schema, so the Home grid uses recency.
  Worth raising with the teammate — belongs in PRD 16's open questions.
- `ProductCard` is now the shared pattern. Increment 9 should import it rather
  than writing a second card, and move it out of `components/home/` when it
  gains a second caller.
- `lab/` (Playwright harness + screenshots) is gitignored and local only.
- Increment 7 is built and verified but **not pushed to Vercel** by request.
