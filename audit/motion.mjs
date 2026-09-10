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
      /*
       * The VIEWPORT is the scroll region, not the rail itself. The rail is the
       * animated track inside it and is sized to its content, so its own
       * scrollWidth and clientWidth are always equal - asserting against it
       * would test nothing. Repointed when the drift became a marquee
       * (2026-09-11); the assertion below is unchanged.
       */
      const el = document.querySelector('.craft-rail-viewport')
      if (!el) return null
      /*
       * Reach the last actual CARD, not the last wrapper. The cards are two
       * levels down now (viewport > rail > track > card), and measuring a
       * full-width track's box would pass regardless of whether a card is
       * reachable, which is precisely the class of false pass this check exists
       * to prevent.
       */
      const cards = el.querySelectorAll('.craft-rail__track > *')
      const last = cards[cards.length - 1]
      if (!last) return null
      last.scrollIntoView({ block: 'nearest', inline: 'end' })
      const box = last.getBoundingClientRect()
      return {
        scrollable: el.scrollWidth > el.clientWidth,
        lastReachable: box.right <= window.innerWidth + 2 && box.left >= -2,
      }
    })

    const label = `[${String(width)} rm] craft rail`
    if (!rail) record(label, ['.craft-rail-viewport not found, or it holds no cards'])
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
