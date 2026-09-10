import { cn } from '@/lib/utils/cn'

/**
 * THE MATERIAL FIELD: the hero's ground.
 *
 * A fine woven paper grain, and nothing else. The large soft dye blooms this
 * once carried were removed at the owner's request: at that scale a blurred
 * colour wash reads as a lighting effect sitting on top of the page rather than
 * as material, and it dirtied the canvas either side of the copy.
 *
 * The grain stays because it is texture at the paper's own scale: it gives the
 * canvas a surface without introducing a light source.
 *
 * Static by design (Increment 16). This component used to subscribe to the
 * scroll engine and write `--field-p` and `--field-drift` every frame, kept
 * "for anything downstream that wants scroll position". Nothing downstream ever
 * read them - the blooms they drove had already been removed - so the hero paid
 * a getBoundingClientRect and two style writes per frame to feed nothing. The
 * subscription is gone; if a later scene needs hero scroll position it can
 * register for itself, which is cheaper than speculatively maintaining it here.
 */
interface MaterialFieldProps {
  className?: string
  /**
   * How heavily the ground is woven.
   *
   * `default` is the fine bias grain, and stays the default because it is the
   * weight that stays legible unmasked - which the closing bookend needs, since
   * it centres its copy in the open middle of the frame where the legibility
   * mask has already faded to nothing.
   *
   * `deep` is the same cloth in a heavier yarn, for the hero. It is only safe
   * there because the hero masks the texture away from its reading column,
   * leaving the copy at about a quarter strength. Opt in per surface rather
   * than by default: measured worst-pixel against `muted` body text, `deep`
   * reads 4.60:1 behind the hero's mask but only 3.47:1 unmasked.
   *
   * Verify any change here by sampling pixels, not by running the sweep: its
   * contrast pass only walks up for a painted `background-color`, so a texture
   * painted as a `background-image` on this sibling element is invisible to it
   * (CLAUDE.md D, 2026-09-10).
   */
  weight?: 'default' | 'deep'
}

export function MaterialField({ className, weight = 'default' }: MaterialFieldProps) {
  return (
    <div className={cn('material-field', className)} aria-hidden>
      <div
        className={cn(
          'material-field__grain',
          weight === 'deep' && 'material-field__grain--deep',
        )}
      />
    </div>
  )
}
