import { useRef, useState } from 'react'

import {
  validateInquiry,
  type InquiryDraft,
  type InquiryErrors,
} from '@/components/product/inquiryValidation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/useToast'
import { createInquiry } from '@/lib/data'
import { useT } from '@/lib/i18n'

const EMPTY: InquiryDraft = { buyerName: '', buyerContact: '', message: '' }

interface InquiryModalProps {
  open: boolean
  onClose: () => void
  productId: string
}

/**
 * The inquiry form (PRD 11.4). Calls `createInquiry`. No purchase, ever.
 *
 * Two behaviours that matter more than they look:
 *
 * A failed send keeps the modal open with everything the buyer typed. Losing a
 * written message because a request failed is the worst outcome this form has,
 * and it is the one a naive implementation produces by closing on submit.
 *
 * The modal cannot be dismissed while the write is in flight. Escape and the
 * backdrop are inert until it settles, so a request cannot complete into a
 * closed dialog and leave the buyer unsure whether it was sent.
 */
export function InquiryModal({ open, onClose, productId }: InquiryModalProps) {
  const [draft, setDraft] = useState<InquiryDraft>(EMPTY)
  const [errors, setErrors] = useState<InquiryErrors>({})
  const [sending, setSending] = useState(false)
  const [failed, setFailed] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const { showToast } = useToast()
  const t = useT()

  const set = (key: keyof InquiryDraft) => (value: string) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const submit = (event: React.FormEvent): void => {
    event.preventDefault()
    if (sending) return

    const found = validateInquiry(draft)
    setErrors(found)

    if (Object.keys(found).length > 0) {
      // Focus the first invalid control. Marking fields red without moving
      // focus leaves a keyboard or screen-reader user with no idea what
      // happened when the dialog does not close.
      //
      // The field is found by ORDER, not by querying [aria-invalid]: this runs
      // synchronously inside the submit handler, before React has re-rendered
      // with the new errors, so that attribute is not on the DOM yet and the
      // query returns nothing. Focus stayed on the submit button.
      const order: (keyof InquiryDraft)[] = ['buyerName', 'buyerContact', 'message']
      const firstInvalid = order.findIndex((key) => found[key] !== undefined)
      if (firstInvalid >= 0) {
        const controls = formRef.current?.querySelectorAll<HTMLElement>('input, textarea')
        controls?.[firstInvalid]?.focus()
      }
      return
    }

    setSending(true)
    setFailed(false)

    createInquiry({ productId, ...draft })
      .then(() => {
        // Honest about what actually happened: this build writes to an
        // in-memory mock that resets on reload. "Your message has been sent"
        // would read as literally true to anyone seeing the site demoed.
        showToast(`${t('inquiry.successTitle')}. ${t('inquiry.successBody')}`)
        setDraft(EMPTY)
        setErrors({})
        onClose()
      })
      .catch(() => {
        setFailed(true)
      })
      .finally(() => {
        setSending(false)
      })
  }

  return (
    <Modal
      open={open}
      // Inert while the write is in flight, so it cannot settle into a closed
      // dialog. The Modal's own Escape and backdrop handlers call this.
      onClose={sending ? () => undefined : onClose}
      title={t('inquiry.title')}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={sending}>
            {t('inquiry.cancel')}
          </Button>
          <Button type="submit" form="inquiry-form" loading={sending}>
            {sending ? t('inquiry.sending') : t('inquiry.send')}
          </Button>
        </>
      }
    >
      <form id="inquiry-form" ref={formRef} onSubmit={submit} className="flex flex-col gap-4">
        <p className="text-sm text-muted">{t('inquiry.intro')}</p>

        <Input
          label={t('inquiry.name')}
          hint={t('inquiry.nameHint')}
          value={draft.buyerName}
          disabled={sending}
          {...(errors.buyerName ? { error: t(errors.buyerName) } : {})}
          onChange={(e) => {
            set('buyerName')(e.target.value)
          }}
        />

        <Input
          label={t('inquiry.contact')}
          hint={t('inquiry.contactHint')}
          value={draft.buyerContact}
          disabled={sending}
          {...(errors.buyerContact ? { error: t(errors.buyerContact) } : {})}
          onChange={(e) => {
            set('buyerContact')(e.target.value)
          }}
        />

        <Textarea
          label={t('inquiry.message')}
          placeholder={t('inquiry.messagePlaceholder')}
          rows={4}
          value={draft.message}
          disabled={sending}
          {...(errors.message ? { error: t(errors.message) } : {})}
          onChange={(e) => {
            set('message')(e.target.value)
          }}
        />

        {failed && (
          // `ink`, not `secondary`: the mid-tone dyes fail AA as text, and this
          // is text that has to be read (Increment 5).
          <p role="alert" className="text-sm text-ink">
            {t('inquiry.failure')}
          </p>
        )}
      </form>
    </Modal>
  )
}
