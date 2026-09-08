import { Badge, type BadgeTone } from '@/components/ui/Badge'
import type { Status } from '@/lib/data'
import { useT } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n/types'

/**
 * Approved is `positive` rather than `neutral` because being visible to buyers
 * is the state the whole desk exists to grant. Rejected is `negative` but not
 * alarming - it is a routine decision, not a fault.
 */
const TONES: Record<Status, BadgeTone> = {
  pending: 'pending',
  approved: 'positive',
  rejected: 'negative',
}

const LABELS: Record<Status, TranslationKey> = {
  pending: 'admin.artisans.statusPending',
  approved: 'admin.artisans.statusApproved',
  rejected: 'admin.artisans.statusRejected',
}

interface StatusBadgeProps {
  status: Status
}

/** One artisan's or listing's status (PRD 12 names this component). */
export function StatusBadge({ status }: StatusBadgeProps) {
  const t = useT()
  return <Badge tone={TONES[status]}>{t(LABELS[status])}</Badge>
}
