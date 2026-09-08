import { Modal } from '@/components/ui/Modal'
import { RemoteImage } from '@/components/ui/RemoteImage'
import { useT } from '@/lib/i18n'
import { formatDate } from '@/lib/utils/formatDate'

export interface PreviewField {
  label: string
  value: string
}

interface QueuePreviewProps {
  open: boolean
  onClose: () => void
  name: string
  /** Cover first. Empty for an artisan, who has only a portrait. */
  images: string[]
  fields: PreviewField[]
  description?: string | undefined
  createdAt: string
}

/**
 * "A way to preview details" (PRD 11.6).
 *
 * A reviewer approving on behalf of a ministry needs to see what they are
 * approving - the photographs above all, since that is most of what a listing
 * is. Built on the shared Modal, so focus trapping, Escape and the backdrop
 * click come from the primitive rather than being re-implemented here.
 *
 * Read-only by design: the approve and reject actions stay on the row. A dialog
 * that both shows detail and acts on it invites a decision made while the
 * reviewer is still reading.
 */
export function QueuePreview({
  open,
  onClose,
  name,
  images,
  fields,
  description,
  createdAt,
}: QueuePreviewProps) {
  const t = useT()

  return (
    <Modal open={open} onClose={onClose} title={name}>
      <div className="flex flex-col gap-5">
        {images.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((url, i) => (
              <RemoteImage
                key={url}
                src={url}
                alt=""
                // Same reasoning as QueueRow: the card radius is too heavy at
                // thumbnail scale. The cover earns a little more than the rest.
                wrapperClassName={
                  i === 0
                    ? 'size-28 shrink-0 rounded-xl'
                    : 'size-20 shrink-0 rounded-lg'
                }
              />
            ))}
          </div>
        )}

        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          {fields.map((field) => (
            <div key={field.label} className="contents">
              <dt className="text-2xs text-muted">{field.label}</dt>
              <dd className="text-ink">{field.value}</dd>
            </div>
          ))}
          <dt className="text-2xs text-muted">{t('admin.queue.previewSubmitted')}</dt>
          <dd className="text-ink">{formatDate(createdAt)}</dd>
        </dl>

        {description ? (
          <div className="flex flex-col gap-1.5">
            <h3 className="text-2xs text-muted">{t('admin.queue.previewDescription')}</h3>
            <p className="max-w-prose text-sm leading-relaxed text-ink">{description}</p>
          </div>
        ) : null}
      </div>
    </Modal>
  )
}
