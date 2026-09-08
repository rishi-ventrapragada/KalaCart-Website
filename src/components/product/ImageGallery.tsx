import { useRef, useState } from 'react'

import { RemoteImage } from '@/components/ui/RemoteImage'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils/cn'

interface ImageGalleryProps {
  images: string[]
  /** The product title, so the cover's alt text says what is pictured. */
  title: string
}

/**
 * The product gallery (PRD 11.4): a cover with a thumbnail strip beneath.
 *
 * Keyboard navigable, which is the part that is easy to get wrong. The
 * thumbnails are real buttons in a tablist, so Tab reaches the strip once
 * rather than once per image, and Left/Right (plus Home/End) move between them
 * the way a tablist is expected to behave. A row of divs with click handlers
 * would look identical and be unreachable without a mouse.
 *
 * The cover is announced through a live region rather than by moving focus, so
 * a screen-reader user hears "Image 2 of 5" without being thrown out of the
 * strip they are navigating.
 */
export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [active, setActive] = useState(0)
  const stripRef = useRef<HTMLDivElement>(null)
  const t = useT()

  const total = images.length
  const cover = images[active] ?? images[0] ?? ''

  /** Moves selection and focus together, as a tablist must. */
  const focusTab = (index: number): void => {
    const clamped = (index + total) % total
    setActive(clamped)
    const tabs = stripRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
    tabs?.[clamped]?.focus()
  }

  const onKeyDown = (event: React.KeyboardEvent): void => {
    const keys: Record<string, number> = {
      ArrowRight: active + 1,
      ArrowLeft: active - 1,
      Home: 0,
      End: total - 1,
    }
    const next = keys[event.key]
    if (next === undefined) return
    event.preventDefault()
    focusTab(next)
  }

  return (
    <div className="flex flex-col gap-3">
      <RemoteImage
        src={cover}
        alt={title}
        wrapperClassName="aspect-square w-full rounded-card border border-line"
      />

      {/*
        Announced politely: the cover changing is information, not a reason to
        steal focus from the strip the reader is arrowing through.
      */}
      <p aria-live="polite" className="sr-only">
        {t('product.galleryPosition', { current: active + 1, total })}
      </p>

      {total > 1 && (
        <div
          ref={stripRef}
          role="tablist"
          aria-label={t('product.galleryLabel')}
          onKeyDown={onKeyDown}
          className="grid grid-cols-5 gap-2"
        >
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={t('product.viewImage', { n: index + 1 })}
              // Roving tabindex: the strip is one tab stop, and the arrow keys
              // move within it.
              tabIndex={index === active ? 0 : -1}
              onClick={() => {
                setActive(index)
              }}
              className={cn(
                'overflow-hidden rounded-[14px] border transition-colors duration-200 ease-site',
                index === active ? 'border-accent' : 'border-line hover:border-line-strong',
              )}
            >
              <RemoteImage src={image} alt="" wrapperClassName="aspect-square w-full" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
