/**
 * THE ACCEPTANCE SWEEP (PRD 14, Increment 16).
 *
 * Drives every route at four widths in both themes, plus a reduced-motion pass,
 * and asserts the global acceptance criteria: no horizontal scroll, no console
 * errors, visible focus, AA contrast, sane heading order and landmarks.
 *
 * Run against the PRODUCTION build, not the dev server:
 *
 *   npm run build && npm run preview -- --port 4173
 *   npm run audit
 *
 * Dev-server module loading masked a real loading-state result during
 * Increment 15, which is why the default target is the preview port.
 *
 * Exits non-zero if anything fails, so it can gate a deploy later.
 */
import { chromium } from 'playwright-core'

import {
  checkContrast,
  checkHeadings,
  checkLabels,
  checkOverflow,
  snapshot,
} from './checks.mjs'
import { auditRailFallback, auditReducedMotion } from './motion.mjs'

const BASE = process.env.AUDIT_BASE ?? 'http://localhost:4173'

/**
 * Every route a reader can reach.
 *
 * `/admin/*` needs the mock flag set, which is the default below. `/admin/login`
 * is the one route that must be visited WITHOUT it: signed in, it redirects to
 * the queue on mount, so auditing it with the flag would silently measure the
 * queue a second time under a login label. That is not hypothetical - it is why
 * this route went unaudited until Increment 19, and why its missing `main`
 * landmark survived sixteen increments of a passing sweep.
 */
const ROUTES = [
  '/',
  '/browse',
  '/artisans',
  '/product/p1',
  '/artisan/a1',
  '/no-such-page',
  { path: '/admin/login', admin: false },
  '/admin/queue',
  '/admin/artisans',
  '/admin/analytics',
]

/** Routes are either a bare path (signed in) or a path plus its flags. */
const routeSpec = (route) =>
  typeof route === 'string' ? { path: route, admin: true } : { admin: true, ...route }

/* 360 is the floor PRD 14 names; 768 and 1024 straddle the `lg:` breakpoint,
   which is where a layout that passes at both extremes tends to break. */
const WIDTHS = [360, 768, 1024, 1280]

const failures = []
const record = (label, issues) => {
  for (const issue of issues) failures.push(`${label}  ${issue}`)
}

/** Tab through the page and report anything focusable with no visible ring. */
async function checkFocusRings(page, label) {
  const bad = []
  for (let i = 0; i < 12; i += 1) {
    await page.keyboard.press('Tab')
    const el = await page.evaluate(() => {
      const node = document.activeElement
      if (!node || node === document.body) return null
      const cs = getComputedStyle(node)
      return {
        tag: node.tagName,
        name: (node.textContent || '').trim().slice(0, 24),
        ring:
          (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) ||
          (cs.boxShadow && cs.boxShadow !== 'none'),
      }
    })
    if (el && !el.ring) bad.push(`no focus ring on ${el.tag} "${el.name}"`)
  }
  record(label, [...new Set(bad)])
}

async function auditRoute(browser, { route, width, theme, reducedMotion }) {
  const { path, admin } = routeSpec(route)
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    reducedMotion: reducedMotion ? 'reduce' : 'no-preference',
  })
  const page = await context.newPage()
  const label = `[${String(width)} ${theme}${reducedMotion ? ' rm' : ''}] ${path}`

  const consoleErrors = []
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 140))
  })
  page.on('pageerror', (e) => {
    consoleErrors.push(`pageerror: ${e.message.slice(0, 140)}`)
  })

  await page.addInitScript(
    ([t, signedIn]) => {
      if (signedIn) sessionStorage.setItem('kalacart-admin', 'true')
      sessionStorage.setItem('kalacart-theme', t)
    },
    [theme, admin],
  )

  await page.goto(BASE + path, { waitUntil: 'networkidle' })
  // Mock latency is up to ~520ms; wait past it so views are settled, not loading.
  await page.waitForTimeout(1200)

  const applied = await page.evaluate(() => document.documentElement.dataset.theme)
  if (applied !== theme) record(label, [`theme did not apply: wanted ${theme}, got ${applied}`])

  const snap = await page.evaluate(snapshot)
  record(label, checkOverflow(snap))
  record(label, checkHeadings(snap))
  record(label, checkLabels(snap))
  record(label, checkContrast(snap))
  record(label, consoleErrors)

  // Focus is width-independent; checking it once per route keeps the run short.
  if (width === 1280 && !reducedMotion) await checkFocusRings(page, label)

  await context.close()
}

const browser = await chromium.launch({ channel: 'chrome' })
let checked = 0

const total = WIDTHS.length * 2 * ROUTES.length
for (const width of WIDTHS) {
  for (const theme of ['light', 'dark']) {
    // One line per width/theme pass, so a long run visibly progresses.
    process.stdout.write(`  ${String(width)}px ${theme}… `)
    const before = failures.length
    for (const route of ROUTES) {
      await auditRoute(browser, { route, width, theme, reducedMotion: false })
      checked += 1
    }
    const found = failures.length - before
    console.log(`${String(checked)}/${String(total)}${found ? ` — ${String(found)} issue(s)` : ''}`)
  }
}

process.stdout.write('  reduced-motion… ')
await auditRailFallback(browser, BASE, record)
await auditReducedMotion(browser, BASE, record)
console.log('done')
await browser.close()

console.log(`swept ${String(checked)} route/width/theme combinations`)
if (failures.length) {
  console.error(`\n${String(failures.length)} issue(s):\n`)
  for (const f of failures) console.error(`  ${f}`)
  process.exit(1)
}
console.log('all acceptance checks passed')
