# KalaCart — Website

Buyer-facing marketplace plus admin dashboard for an Indian artisan-craft
platform (SIH26090, Ministry of Social Justice & Empowerment).

Read `CLAUDE.md` for how to work in this repo and `PRD.md` for what to build.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build
npm run lint     # oxlint
```

Node 22.x (pinned in `engines` to match the Vercel build image).

## Deploy

Vercel, linked via the CLI. `vercel --prod` from the project root.
`vercel.json` rewrites paths to `/index.html` so client-side deep links such as
`/browse` resolve instead of 404ing.

The rewrite excludes the root-level static assets (`favicon.ico`,
`favicon.svg`, `apple-touch-icon.svg`, `og-image.svg`, `assets/`) through a
negative lookahead. It used to match `/(.*)` with no exclusions, which meant a
request for an asset that did not exist was answered with the app shell instead
of a 404 — and since browsers request `/favicon.ico` by convention whether or
not it is declared, the browser received an HTML page where it expected an icon
and kept displaying whichever favicon it had cached previously. Assets must
404 when missing; only routes fall through.

Note the `$` anchors in the pattern: only exact root-level paths are excluded,
so `/deep/favicon.ico` still resolves as an SPA route.

## Decisions that diverge from PRD.md

The PRD was written before the scaffold existed. Two stack lines were settled
differently during Increment 0, both approved:

- **Tailwind v4, not v3.** PRD 7.1 says Tailwind "reads those variables through
  its config", which is v3 phrasing. v4 has no JS config; theme tokens are
  declared in CSS. The theme seam is unchanged in substance — raw palette values
  live as plain custom properties under `:root` and `[data-theme="dark"]`, and
  `@theme inline` aliases them so utilities emit `var(--token)` and resolve at
  runtime. The `inline` keyword is load-bearing: without it Tailwind bakes one
  palette in at build time and the runtime theme swap breaks.
- **React 19, not 18.** PRD 4 says React 18; `create-vite` now ships 19 and every
  dependency in the stack supports it.

Also note: the Vite template ships `oxlint` rather than ESLint, and sets no
`strict` flag anywhere, so `strict` is declared explicitly in
`tsconfig.app.json` to satisfy CLAUDE.md law 5.
