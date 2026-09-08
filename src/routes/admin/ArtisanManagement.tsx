import { useCallback, useState } from 'react'

import { ArtisanFilterBar } from '@/components/admin/ArtisanFilterBar'
import { ArtisanTable } from '@/components/admin/ArtisanTable'
import { ArtisanTableRow } from '@/components/admin/ArtisanTableRow'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { SelectOption } from '@/components/ui/Select'
import { useToast } from '@/components/ui/useToast'
import type { StatusAction } from '@/lib/admin/artisanActions'
import { useArtisanAdmin } from '@/lib/admin/useArtisanAdmin'
import { useArtisanFilters } from '@/lib/admin/useArtisanFilters'
import { getAllArtisans, getCategories } from '@/lib/data'
import type { Artisan, Status } from '@/lib/data'
import { useAsyncData } from '@/lib/data/useAsyncData'
import { useT } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n/types'

/** Which toast a completed change announces, in buyer-visible terms. */
const CHANGED_TOAST: Record<Status, TranslationKey> = {
  approved: 'admin.artisans.changedApproved',
  rejected: 'admin.artisans.changedRejected',
  pending: 'admin.artisans.changedPending',
}

/** A row plus the action awaiting confirmation. */
interface PendingConfirm {
  artisan: Artisan
  action: StatusAction
}

export default function ArtisanManagement() {
  const filterState = useArtisanFilters()
  const { filters, active, clearAll } = filterState
  const { showToast } = useToast()
  const t = useT()
  const [confirming, setConfirming] = useState<PendingConfirm | null>(null)

  /*
   * The filters go to the seam rather than being applied here, so the mock and
   * the eventual Supabase query filter the same way.
   *
   * The fetcher depends on the four primitive values rather than on `filters`,
   * which useMemo rebuilds whenever the params object changes. useAsyncData
   * requires a stable fetcher, and depending on the object would refetch on
   * every render; depending on the strings refetches exactly when a filter
   * really changed.
   */
  const { query, status, categoryId, region } = filters
  const fetchPage = useCallback(async () => {
    const applied: typeof filters = {}
    if (query) applied.query = query
    if (status) applied.status = status
    if (categoryId) applied.categoryId = categoryId
    if (region) applied.region = region

    const [artisans, categories] = await Promise.all([
      getAllArtisans(applied),
      getCategories(),
    ])
    return { artisans, categories }
  }, [query, status, categoryId, region])

  const page = useAsyncData(fetchPage)
  const data = page.data

  const onChanged = useCallback(
    (name: string, status: Status) => {
      showToast(t(CHANGED_TOAST[status], { name }), status === 'rejected' ? 'neutral' : 'success')
    },
    [showToast, t],
  )
  const onFailed = useCallback(
    (name: string) => {
      showToast(t('admin.artisans.failedToast', { name }), 'error')
    },
    [showToast, t],
  )

  const admin = useArtisanAdmin({
    artisans: data?.artisans ?? [],
    onChanged,
    onFailed,
  })

  const categories = data?.categories ?? []
  const categoryOptions: SelectOption[] = categories.map((c) => ({ value: c.id, label: c.name }))

  /*
   * Regions come from the rows currently loaded. With filters applied that is a
   * narrowed list, which is the honest thing to offer: a region that would
   * return nothing under the other active filters is not a useful choice.
   */
  const regionOptions: SelectOption[] = [...new Set(admin.rows.map((a) => a.region))]
    .sort((a, b) => a.localeCompare(b))
    .map((r) => ({ value: r, label: r }))

  const runAction = (artisan: Artisan, action: StatusAction): void => {
    // Confirm only where the action changes what buyers can see.
    if (action.confirm) setConfirming({ artisan, action })
    else admin.setStatus(artisan, action.next)
  }

  const confirmIsRemoval = confirming?.action.next === 'rejected'

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl">{t('admin.artisans.title')}</h1>
        <p className="text-sm text-muted">{t('admin.artisans.intro')}</p>
      </div>

      <ArtisanFilterBar
        state={filterState}
        categories={categoryOptions}
        regions={regionOptions}
      />

      {page.state === 'ready' && admin.rows.length > 0 && (
        // Announced politely: changing a filter with a screen reader gives the
        // new count without the page stealing focus.
        <p aria-live="polite" className="text-sm text-muted">
          {admin.rows.length === 1
            ? t('admin.artisans.countOne')
            : t('admin.artisans.count', { count: admin.rows.length })}
        </p>
      )}

      <ArtisanTable
        state={page.state}
        count={admin.rows.length}
        onRetry={page.retry}
        onClear={clearAll}
        filtered={active}
      >
        {admin.rows.map((artisan) => (
          <ArtisanTableRow
            key={artisan.id}
            artisan={artisan}
            category={categories.find((c) => c.id === artisan.categoryId)}
            busy={admin.isPending(artisan.id)}
            onAction={(action) => {
              runAction(artisan, action)
            }}
          />
        ))}
      </ArtisanTable>

      <ConfirmDialog
        open={confirming !== null}
        onCancel={() => {
          setConfirming(null)
        }}
        onConfirm={() => {
          if (confirming) admin.setStatus(confirming.artisan, confirming.action.next)
          setConfirming(null)
        }}
        title={t(
          confirmIsRemoval
            ? 'admin.artisans.confirmRemoveTitle'
            : 'admin.artisans.confirmApproveTitle',
        )}
        body={t(
          confirmIsRemoval
            ? 'admin.artisans.confirmRemoveBody'
            : 'admin.artisans.confirmApproveBody',
        )}
        confirmLabel={t(
          confirmIsRemoval
            ? 'admin.artisans.confirmRemoveAction'
            : 'admin.artisans.confirmApproveAction',
        )}
        destructive={confirmIsRemoval}
      />
    </section>
  )
}
