import { EmptyState } from '@/components/ui/EmptyState'
import { useT } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n/types'

interface AdminPlaceholderProps {
  titleKey: TranslationKey
  bodyKey: TranslationKey
}

/**
 * A stub for an admin surface that a later increment builds.
 *
 * Increment 12 delivers the gate and the frame; the queue, the artisan table
 * and the analytics charts are Increments 13, 14 and 15. Each tab says which
 * increment fills it rather than rendering an empty panel that reads as broken
 * to anyone clicking through the desk.
 *
 * Deleted as each surface lands.
 */
export function AdminPlaceholder({ titleKey, bodyKey }: AdminPlaceholderProps) {
  const t = useT()

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl">{t(titleKey)}</h1>
      {/* The heading names the surface; the panel says what is coming. */}
      <EmptyState title={t(bodyKey)} />
    </section>
  )
}
