# Acceptance sweep

Automated checks for the global acceptance criteria in PRD §14. Added in
Increment 16, and meant to be re-run whenever a surface changes — the point of
committing it is that "everything still holds" is a claim anyone can verify
rather than take on trust.

## Running it

```bash
npm run build
npm run preview -- --port 4173   # in another terminal
npm run audit
```

Point it elsewhere with `AUDIT_BASE=http://localhost:5173 npm run audit`.

**Run it against the production build, not the dev server.** Dev-server module
loading masked a real loading-state result during Increment 15: the page under
test was still resolving modules when the probe sampled it, so a working
skeleton looked like a missing one.

Exits non-zero if anything fails, so it can gate a deploy later.

## What it checks

Every route at 360, 768, 1024 and 1280px, in both themes:

- **No horizontal scroll** (PRD §14), naming the offending element when it finds one
- **No console or page errors**
- **Contrast** against the WCAG AA floor the Increment 5 design pass set — 4.5:1
  for body copy, 3:1 for large text — measured on the *effective* background,
  walking up the tree for the first painted colour rather than trusting the
  element's own transparent one
- **One `h1` and one `main` per route**, and no skipped heading level
- **Every image has `alt`; every control has an accessible name**
- **Visible focus ring** on everything tabbable (checked once per route, at 1280)

Plus a reduced-motion pass:

- **Reveals resolve** to their end state rather than staying hidden
- **The craft rail stays reachable.** With the drift frozen, its later cards
  would otherwise be parked off-screen forever. This asserts *rendered geometry*
  — that the rail can actually scroll and the last card can actually be brought
  into view — because the Increment 7 dead-scroll bug passed every check that
  only looked for the presence of a CSS class.

## Layout

- `run.mjs` — the runner: what to visit, in what configuration, and what to report
- `checks.mjs` — `snapshot()` (runs in the page, measures only) and the
  assertions (run in Node, judge only). Adding a check is one exported function
  plus one line in the runner.

The split keeps every judgement on the Node side, where it is readable, instead
of buried in a string that gets serialised into a browser.

## What it does not cover

It checks structure and contrast, not whether a page looks right. Both themes
still need a human pass on anything visual — and the sweep deliberately says
nothing about whether copy is good, only that it is present and legible.
