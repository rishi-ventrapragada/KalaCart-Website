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
export function MaterialField({ className }: { className?: string }) {
  return (
    <div className={cn('material-field', className)} aria-hidden>
      <div className="material-field__grain" />
    </div>
  )
}
