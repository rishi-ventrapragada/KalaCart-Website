import { useState } from 'react'

import { QueueList } from '@/components/admin/QueueList'
import { QueuePreview } from '@/components/admin/QueuePreview'
import { QueueRow } from '@/components/admin/QueueRow'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { Artisan, Category, Product } from '@/lib/data'
import type { AsyncState } from '@/lib/data/useAsyncData'
import { useT } from '@/lib/i18n'
import { formatPrice } from '@/lib/utils/formatPrice'

interface QueueApi {
  visible: Product[]
  isPending: (id: string) => boolean
  approve: (item: Product) => void
  reject: (item: Product) => void
}

interface ProductQueueProps {
  state: AsyncState
  categories: Category[]
  /** Every artisan, so a row can name the maker and their region. */
  artisans: Artisan[]
  onRetry: () => void
  /** Owned by the route, so the tab badge and this list agree (see useQueue). */
  queue: QueueApi
}

/** The Products tab (PRD 11.6). */
export function ProductQueue({
  state,
  categories,
  artisans,
  onRetry,
  queue,
}: ProductQueueProps) {
  const t = useT()
  const [confirming, setConfirming] = useState<Product | null>(null)
  const [previewing, setPreviewing] = useState<Product | null>(null)

  const categoryOf = (product: Product): Category | undefined =>
    categories.find((c) => c.id === product.categoryId)
  const artisanOf = (product: Product): Artisan | undefined =>
    artisans.find((a) => a.id === product.artisanId)

  return (
    <>
      <QueueList
        state={state}
        count={queue.visible.length}
        emptyTitle={t('admin.queue.emptyProducts')}
        onRetry={onRetry}
        tab="products"
      >
        {queue.visible.map((product) => (
          <QueueRow
            key={product.id}
            imageUrl={product.imageUrls[0] ?? ''}
            name={product.title}
            category={categoryOf(product)}
            region={artisanOf(product)?.region}
            createdAt={product.createdAt}
            busy={queue.isPending(product.id)}
            onApprove={() => {
              queue.approve(product)
            }}
            onReject={() => {
              setConfirming(product)
            }}
            onPreview={() => {
              setPreviewing(product)
            }}
          />
        ))}
      </QueueList>

      <ConfirmDialog
        open={confirming !== null}
        onCancel={() => {
          setConfirming(null)
        }}
        onConfirm={() => {
          if (confirming) queue.reject(confirming)
          setConfirming(null)
        }}
        title={t('admin.queue.confirmProductTitle')}
        body={t('admin.queue.confirmProductBody')}
        confirmLabel={t('admin.queue.confirmReject')}
        destructive
      />

      {previewing && (
        <QueuePreview
          open
          onClose={() => {
            setPreviewing(null)
          }}
          name={previewing.title}
          images={previewing.imageUrls}
          description={previewing.description}
          createdAt={previewing.createdAt}
          fields={[
            { label: t('admin.queue.previewCraft'), value: categoryOf(previewing)?.name ?? '' },
            {
              label: t('admin.queue.previewArtisan'),
              value: artisanOf(previewing)?.name ?? '',
            },
            { label: t('admin.queue.previewPrice'), value: formatPrice(previewing.priceInr) },
          ]}
        />
      )}
    </>
  )
}
