import { useEffect, useRef, useState } from 'react'

import { prefersReducedMotion } from '@/app/lenis'
import { cn } from '@/lib/utils/cn'

interface LineMaskProps {
  /**
   * One entry per rendered line. The split is editorial, never measured.
   *
   * A line containing `{accent}` has that placeholder replaced by
   * `accentWord`, wrapped so it can carry the dye underline.
   */
  lines: readonly string[]
  /** The word that carries the dye underline, if a line marks one. */
  accentWord?: string
  /**
   * The unsplit sentence. The visible lines are hidden from assistive
   * technology and this is announced instead, so a screen reader gets one
   * headline rather than a list of fragments.
   */
  label: string
  /** Milliseconds each line trails the one above it (PRD 10.4 asks for ~80). */
  stagger?: number
  className?: string
}

/**
 * Splits a line on the {accent} placeholder and wraps the accent word so its
 * dye underline has something to attach to. A line with no placeholder is
 * returned untouched, so only the line that marks one pays for this.
 */
function renderLine(line: string, accentWord: string | undefined): React.ReactNode {
  if (!accentWord || !line.includes('{accent}')) return line

  const [before, after] = line.split('{accent}')
  return (
    <>
      {before}
      <span className="accent-word">{accentWord}</span>
      {after}
    </>
  )
}

/**
 * THE HEADLINE LINE-MASK (PRD 10.4).
 *
 * Every line sits in its own `overflow: hidden` mask with an inner span that
 * starts translated 110% down and slides up into place on load, each line
 * trailing the one above it.
 *
 * The transform lives in CSS keyed off `data-revealed`, not in an inline style,
 * because this is the one place on Home where transitioning a transform is
 * correct: the headline animates once on load and is never driven by the scroll
 * value, so it cannot lag behind a scroll it does not listen to (PRD 10.2's
 * warning is about scroll-driven elements).
 *
 * Under reduced motion the lines are marked revealed on mount and the CSS drops
 * the transform outright, so the headline is simply present (PRD 10.7).
 */
export function LineMask({
  lines,
  label,
  accentWord,
  stagger = 80,
  className,
}: LineMaskProps) {
  const [revealed, setRevealed] = useState(prefersReducedMotion)
  const frame = useRef(0)

  useEffect(() => {
    if (prefersReducedMotion()) return

    // Two frames: one for the masked start state to be committed, the next to
    // flip it. Setting both in the same frame gives the browser no start value
    // to interpolate from and the lines would simply appear.
    frame.current = requestAnimationFrame(() => {
      frame.current = requestAnimationFrame(() => {
        setRevealed(true)
      })
    })

    return () => {
      cancelAnimationFrame(frame.current)
    }
  }, [])

  return (
    <h1 className={cn(className)}>
      <span className="sr-only">{label}</span>
      <span aria-hidden>
        {lines.map((line, index) => (
          <span key={line} className="line-mask" {...(revealed ? { 'data-revealed': '' } : {})}>
            <span style={{ '--line-delay': `${String(index * stagger)}ms` } as React.CSSProperties}>
              {renderLine(line, accentWord)}
            </span>
          </span>
        ))}
      </span>
    </h1>
  )
}
