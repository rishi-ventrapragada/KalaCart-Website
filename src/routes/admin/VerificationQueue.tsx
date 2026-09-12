import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useDocumentTitle } from '@/app/useDocumentTitle'
import { ArtisanQueue } from '@/components/admin/ArtisanQueue'
import { ProductQueue } from '@/components/admin/ProductQueue'
import { QueueTabs, type QueueTab } from '@/components/admin/QueueTabs'
import { useToast } from '@/components/ui/useToast'
// Imported from the Supabase provider directly, NOT through the `@/lib/data`
// seam, which still points at `mockProvider`. The queue is the one surface that
// must read and write the shared database — approving here is what makes a
// listing visible in the mobile app — while the public site keeps serving mock
// data until real product content exists. memory/decisions.md, 2026-09-12.
import { supabaseProvider } from '@/lib/data/supabaseProvider'
import type { Artisan, Product } from '@/lib/data'
import { useAsyncData } from '@/lib/data/useAsyncData'
import { useQueue } from '@/lib/admin/useQueue'
import { useT } from '@/lib/i18n'

/** PRD 11.6 names the tabs; the param is ours, so it stays short and readable. */
const TAB_PARAM = 'tab'

const isTab = (value: string | null): value is QueueTab =>
  value === 'artisans' || value === 'products'

export default function VerificationQueue() {
  const [params, setParams] = useSearchParams()
  const { showToast } = useToast()
  const t = useT()

  useDocumentTitle(undefined, 'meta.adminQueue')

  // The tab lives in the URL, like Browse's filters: a reviewer can send a
  // colleague straight to the products awaiting review, and Back works.
  const raw = params.get(TAB_PARAM)
  const tab: QueueTab = isTab(raw) ? raw : 'artisans'

  const setTab = (next: QueueTab): void => {
    const updated = new URLSearchParams(params)
    updated.set(TAB_PARAM, next)
    // `replace`: flipping a tab is not a place you should have to press Back
    // through on the way out of the desk.
    setParams(updated, { replace: true })
  }

  // One read for the whole desk. Both tabs plus the lookups they need to name
  // a craft and a maker, so switching tabs costs no second spinner.
  const fetchQueue = useCallback(async () => {
    const [artisans, products, categories, allArtisans] = await Promise.all([
      supabaseProvider.getPendingArtisans(),
      supabaseProvider.getPendingProducts(),
      supabaseProvider.getCategories(),
      supabaseProvider.getAllArtisans(),
    ])
    return { artisans, products, categories, allArtisans }
  }, [])

  const page = useAsyncData(fetchQueue)
  const data = page.data

  const label = useCallback((item: Artisan | Product) => ('name' in item ? item.name : item.title), [])
  const onApproved = useCallback(
    (name: string) => {
      showToast(t('admin.queue.approvedToast', { name }), 'success')
    },
    [showToast, t],
  )
  const onRejected = useCallback(
    (name: string) => {
      showToast(t('admin.queue.rejectedToast', { name }))
    },
    [showToast, t],
  )
  const onFailed = useCallback(
    (name: string) => {
      showToast(t('admin.queue.failedToast', { name }), 'error')
    },
    [showToast, t],
  )

  /*
   * Both hooks are called every render regardless of the active tab - hooks
   * cannot be conditional, and it also means a decision made on one tab is not
   * forgotten when the reviewer switches away and back.
   */
  const artisanQueue = useQueue<Artisan>({
    items: data?.artisans ?? [],
    setStatus: supabaseProvider.setArtisanStatus,
    label,
    onApproved,
    onRejected,
    onFailed,
  })

  const productQueue = useQueue<Product>({
    items: data?.products ?? [],
    setStatus: supabaseProvider.setProductStatus,
    label,
    onApproved,
    onRejected,
    onFailed,
  })

  const ready = page.state === 'ready'

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl">{t('admin.queue.title')}</h1>
        <p className="text-sm text-muted">{t('admin.queue.intro')}</p>
      </div>

      <QueueTabs
        active={tab}
        onChange={setTab}
        artisanCount={ready ? artisanQueue.visible.length : null}
        productCount={ready ? productQueue.visible.length : null}
      />

      {tab === 'artisans' ? (
        <ArtisanQueue
          state={page.state}
          categories={data?.categories ?? []}
          onRetry={page.retry}
          queue={artisanQueue}
        />
      ) : (
        <ProductQueue
          state={page.state}
          categories={data?.categories ?? []}
          artisans={data?.allArtisans ?? []}
          onRetry={page.retry}
          queue={productQueue}
        />
      )}
    </section>
  )
}
