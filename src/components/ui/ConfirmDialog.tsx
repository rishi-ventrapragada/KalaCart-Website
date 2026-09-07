import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useT } from '@/lib/i18n'

interface ConfirmDialogProps {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
  title: string
  body: string
  /** Copy for the confirming action. Says what happens, per CLAUDE.md. */
  confirmLabel: string
  /** Destructive styling for irreversible actions, e.g. rejecting an artisan. */
  destructive?: boolean
}

/** The confirm step PRD 11.6 requires before a reject. */
export function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title,
  body,
  confirmLabel,
  destructive = false,
}: ConfirmDialogProps) {
  const t = useT()

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button variant={destructive ? 'destructive' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {body}
    </Modal>
  )
}
