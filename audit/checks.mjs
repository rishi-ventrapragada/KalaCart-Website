/**
 * The individual page checks, each a pure function of an evaluated snapshot.
 *
 * Split from the runner so a new check is one exported function plus one line
 * in `run.mjs`, and so each stays readable on its own.
 */

/** WCAG relative luminance, per the sRGB definition. */
function luminance([r, g, b]) {
  const channel = (v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

export function contrastRatio(fg, bg) {
  const a = luminance(fg)
  const b = luminance(bg)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

/**
 * Runs inside the page. Returns raw measurements only - every judgement is made
 * on the Node side, so the assertions stay in one place and are easy to read.
 *
 * Serialised and injected via page.evaluate, so it must not close over anything.
 */
export const snapshot = () => {
  const parseRgb = (value) => {
    const m = /rgba?\(([^)]+)\)/.exec(value || '')
    if (!m) return null
    const parts = m[1].split(',').map((n) => parseFloat(n))
    // Fully transparent backgrounds tell us nothing about what is behind.
    if (parts.length > 3 && parts[3] === 0) return null
    return [parts[0], parts[1], parts[2]]
  }

  /** Walks up for the first painted background, as the eye would see it. */
  const effectiveBg = (el) => {
    let node = el
    while (node && node !== document.documentElement) {
      const c = parseRgb(getComputedStyle(node).backgroundColor)
      if (c) return c
      node = node.parentElement
    }
    return parseRgb(getComputedStyle(document.body).backgroundColor) || [255, 255, 255]
  }

  const visible = (el) => {
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'
  }

  // Text nodes with real content, for the contrast pass.
  const textSamples = []
  for (const el of document.querySelectorAll('p,span,a,h1,h2,h3,h4,li,td,th,button,label')) {
    const own = [...el.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .join('')
    if (!own || !visible(el)) continue
    // sr-only text is not seen, so its contrast is irrelevant.
    const cs = getComputedStyle(el)
    if (cs.clipPath === 'inset(50%)' || parseFloat(cs.opacity) === 0) continue
    textSamples.push({
      tag: el.tagName,
      text: own.slice(0, 32),
      fg: parseRgb(cs.color),
      bg: effectiveBg(el),
      size: parseFloat(cs.fontSize),
      weight: parseInt(cs.fontWeight, 10) || 400,
    })
  }

  const overflowing = [...document.querySelectorAll('*')]
    .filter((el) => {
      const r = el.getBoundingClientRect()
      return r.width > 0 && (r.right > window.innerWidth + 1 || r.left < -1)
    })
    .slice(0, 5)
    .map((el) => `${el.tagName}.${String(el.className).slice(0, 40)}`)

  return {
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    overflowing,
    headings: [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
      .filter(visible)
      .map((h) => Number(h.tagName[1])),
    landmarks: {
      main: document.querySelectorAll('main').length,
      nav: document.querySelectorAll('nav').length,
      h1: document.querySelectorAll('h1').length,
    },
    imgNoAlt: [...document.querySelectorAll('img')].filter((i) => !i.hasAttribute('alt')).length,
    unnamedControls: [...document.querySelectorAll('button,a')]
      .filter(
        (el) =>
          visible(el) &&
          !el.textContent.trim() &&
          !el.getAttribute('aria-label') &&
          !el.getAttribute('title'),
      )
      .map((el) => `${el.tagName}.${String(el.className).slice(0, 30)}`)
      .slice(0, 4),
    textSamples,
  }
}

/** PRD 14: responsive from 360px, no horizontal scroll. */
export function checkOverflow(s) {
  if (s.scrollWidth <= s.clientWidth) return []
  return [`horizontal scroll ${s.scrollWidth}>${s.clientWidth} via ${s.overflowing.join(', ')}`]
}

/** Exactly one h1, and no skipped heading level on the way down. */
export function checkHeadings(s) {
  const issues = []
  if (s.landmarks.h1 !== 1) issues.push(`h1 count is ${s.landmarks.h1}, expected 1`)
  if (s.landmarks.main !== 1) issues.push(`main landmark count is ${s.landmarks.main}, expected 1`)

  let prev = 0
  for (const level of s.headings) {
    if (prev && level > prev + 1) issues.push(`heading jumps h${prev} to h${level}`)
    prev = level
  }
  return issues
}

export function checkLabels(s) {
  const issues = []
  if (s.imgNoAlt) issues.push(`${s.imgNoAlt} img without alt`)
  if (s.unnamedControls.length)
    issues.push(`controls with no accessible name: ${s.unnamedControls.join(', ')}`)
  return issues
}

/**
 * The Increment 5 contrast floor: 4.5:1 for body copy, 3:1 for large text
 * (18.66px bold or 24px regular), per WCAG AA.
 */
export function checkContrast(s) {
  const issues = []
  for (const t of s.textSamples) {
    if (!t.fg || !t.bg) continue
    const large = t.size >= 24 || (t.size >= 18.66 && t.weight >= 700)
    const floor = large ? 3 : 4.5
    const ratio = contrastRatio(t.fg, t.bg)
    if (ratio < floor) {
      issues.push(
        `contrast ${ratio.toFixed(2)}:1 (floor ${String(floor)}) on ${t.tag} "${t.text}"`,
      )
    }
  }
  // One line per distinct failure, not per element, or a repeated row floods it.
  return [...new Set(issues)]
}
