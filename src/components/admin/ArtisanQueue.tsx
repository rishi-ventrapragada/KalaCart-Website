import { useState } from 'react'

import { QueueList } from '@/components/admin/QueueList'
import { QueuePreview } from '@/components/admin/QueuePreview'
import { QueueRow } from '@/components/admin/QueueRow'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { Artisan, Category } from '@/lib/data'
import type { AsyncState } from '@/lib/data/useAsyncData'
import { useT } from '@/lib/i18n'

interface QueueApi {
  visible: Artisan[]
  isPending: (id: string) => boolean
  approve: (item: Artisan) => void
  reject: (item: Artisan) => void
}

interface ArtisanQueueProps {
  state: AsyncState
  categories: Category[]
  onRetry: () => void
  /** Owned by the route, so the tab badge and this list agree (see useQueue). */
  queue: QueueApi
}

/** The Artisans tab (PRD 11.6). */
export function ArtisanQueue({ state, categories, onRetry, queue }: ArtisanQueueProps) {
  const t = useT()
  const [confirming, setConfirming] = useState<Artisan | null>(null)
  const [previewing, setPreviewing] = useState<Artisan | null>(null)

  const categoryOf = (artisan: Artisan): Category | undefined =>
    categories.find((c) => c.id === artisan.categoryId)

  return (
    <>
      <QueueList
        state={state}
        count={queue.visible.length}
        emptyTitle={t('admin.queue.emptyArtisans')}
        onRetry={onRetry}
        tab="artisans"
      >
        {queue.visible.map((artisan) => (
          <QueueRow
            key={artisan.id}
            imageUrl={artisan.photoUrl}
            name={artisan.name}
            category={categoryOf(artisan)}
            region={artisan.region}
            createdAt={artisan.createdAt}
            busy={queue.isPending(artisan.id)}
            onApprove={() => {
              queue.approve(artisan)
            }}
            onReject={() => {
              setConfirming(artisan)
            }}
            onPreview={() => {
              setPreviewing(artisan)
            }}
          />
        ))}
      </QueueList>

      {/* The confirm step PRD 11.6 requires before a reject. */}
      <ConfirmDialog
        open={confirming !== null}
        onCancel={() => {
          setConfirming(null)
        }}
        onConfirm={() => {
          if (confirming) queue.reject(confirming)
          setConfirming(null)
        }}
        title={t('admin.queue.confirmArtisanTitle')}
        body={t('admin.queue.confirmArtisanBody')}
        confirmLabel={t('admin.queue.confirmReject')}
        destructive
      />

      {previewing && (
        <QueuePreview
          open
          onClose={() => {
            setPreviewing(null)
          }}
          name={previewing.name}
          images={[previewing.photoUrl]}
          createdAt={previewing.createdAt}
          fields={[
            { label: t('admin.queue.previewCraft'), value: categoryOf(previewing)?.name ?? '' },
            { label: t('admin.queue.previewRegion'), value: previewing.region },
            { label: t('admin.queue.previewPhone'), value: previewing.phone },
          ]}
        />
      )}
    </>
  )
}
