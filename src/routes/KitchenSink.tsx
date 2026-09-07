import { SearchX } from 'lucide-react'
import { useState } from 'react'

import { Container } from '@/components/layout/Container'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { Spinner } from '@/components/ui/Spinner'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/useToast'
import { useT } from '@/lib/i18n'

/**
 * DEVELOPMENT ONLY. Every primitive in one place so the Increment 4 acceptance
 * line can be checked in both themes, and so the Increment 5 design pass has a
 * single surface to work against. Not linked from the nav; removed in the
 * Increment 16 polish pass.
 */
export default function KitchenSink() {
  const t = useT()
  const { showToast } = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <Container className="flex flex-col gap-14 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl">{t('kitchenSink.title')}</h1>
        <p className="text-sm leading-relaxed text-muted">{t('kitchenSink.subtitle')}</p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-medium tracking-[0.02em] text-muted">{t('kitchenSink.buttons')}</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">{t('common.confirm')}</Button>
          <Button variant="secondary">{t('common.cancel')}</Button>
          <Button variant="ghost">{t('common.dismiss')}</Button>
          <Button variant="destructive">{t('kitchenSink.confirmAction')}</Button>
          <Button loading>{t('common.loading')}</Button>
          <Button disabled>{t('common.confirm')}</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">{t('common.confirm')}</Button>
          <Button size="md">{t('common.confirm')}</Button>
          <Button size="lg">{t('common.confirm')}</Button>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-xs font-medium tracking-[0.02em] text-muted">{t('kitchenSink.forms')}</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label={t('kitchenSink.sampleLabel')} hint={t('kitchenSink.sampleHint')} />
          <Input label={t('kitchenSink.sampleLabel')} error={t('kitchenSink.sampleError')} />
          <Select
            label={t('browse.title')}
            placeholder={t('ui.selectPlaceholder')}
            options={[
              { value: 'a', label: 'Handloom Textiles' },
              { value: 'b', label: 'Blue Pottery' },
            ]}
          />
          <Textarea label={t('kitchenSink.sampleMessage')} />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-medium tracking-[0.02em] text-muted">{t('kitchenSink.feedback')}</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Badge>{t('common.loading')}</Badge>
          <Badge tone="positive">{t('common.confirm')}</Badge>
          <Badge tone="pending">{t('common.loading')}</Badge>
          <Badge tone="negative">{t('kitchenSink.confirmAction')}</Badge>
          <Chip dye="indigo">Handloom Textiles</Chip>
          <Chip dye="madder" selected>
            Madhubani Painting
          </Chip>
          <Chip dye="marigold">Block Printing</Chip>
          <Chip dye="brass">Brassware</Chip>
          <Spinner />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              setModalOpen(true)
            }}
          >
            {t('kitchenSink.openModal')}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setConfirmOpen(true)
            }}
          >
            {t('kitchenSink.openConfirm')}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              showToast(t('kitchenSink.toastMessage'), 'success')
            }}
          >
            {t('kitchenSink.showToast')}
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-medium tracking-[0.02em] text-muted">{t('kitchenSink.states')}</h2>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-72" />
          <Skeleton className="h-32 w-full max-w-sm" />
        </div>
        <EmptyState
          icon={SearchX}
          title={t('kitchenSink.emptyTitle')}
          body={t('kitchenSink.emptyBody')}
          action={<Button size="sm">{t('common.clearFilters')}</Button>}
          className="max-w-md"
        />
      </section>

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
        }}
        title={t('kitchenSink.modalTitle')}
        footer={
          <Button
            onClick={() => {
              setModalOpen(false)
            }}
          >
            {t('common.close')}
          </Button>
        }
      >
        {t('kitchenSink.modalBody')}
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        destructive
        onCancel={() => {
          setConfirmOpen(false)
        }}
        onConfirm={() => {
          setConfirmOpen(false)
          showToast(t('kitchenSink.toastMessage'), 'success')
        }}
        title={t('kitchenSink.confirmTitle')}
        body={t('kitchenSink.confirmBody')}
        confirmLabel={t('kitchenSink.confirmAction')}
      />
    </Container>
  )
}
