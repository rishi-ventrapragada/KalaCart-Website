/**
 * The reduced-motion acceptance checks (PRD 10.7).
 *
 * Separated from the per-route sweep because these assert whole-page behaviour
 * under one specific condition rather than one route at one width, and because
 * the rail check asserts rendered geometry, which needs its own explanation.
 */

/**
 * PRD 10.7: with motion off the craft rail must still be reachable by hand, or
 * every craft past the fold is stranded. This asserts the rendered geometry
 * rather than the presence of a class, which is what caught the Increment 7
 * dead-scroll bug.
 */
export async function auditRailFallback(browser, BASE, record) {
  for (const width of [360, 1280]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: 'reduce',
    })
    const page = await context.newPage()
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1400)

    const rail = await page.evaluate(() => {
      const el = document.querySelector('.craft-rail')
      if (!el) return null
      const last = el.children[el.children.length - 1]
      last.scrollIntoView({ block: 'nearest', inline: 'end' })
      const box = last.getBoundingClientRect()
      return {
        scrollable: el.scrollWidth > el.clientWidth,
        lastReachable: box.right <= window.innerWidth + 2 && box.left >= -2,
      }
    })

    const label = `[${String(width)} rm] craft rail`
    if (!rail) record(label, ['.craft-rail not found'])
    else {
      if (!rail.scrollable) record(label, ['rail cannot scroll with motion off'])
      if (!rail.lastReachable) record(label, ['last card unreachable with motion off'])
    }
    await context.close()
  }
}

/** Reveals must resolve to their end state under reduced motion (PRD 10.7). */
export async function auditReducedMotion(browser, BASE, record) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1400)

  const hidden = await page.evaluate(
    () =>
      [...document.querySelectorAll('[data-reveal]')].filter(
        (el) => parseFloat(getComputedStyle(el).opacity) < 0.9,
      ).length,
  )
  if (hidden) record('[rm] /', [`${String(hidden)} reveals still hidden with motion off`])
  await context.close()
}
