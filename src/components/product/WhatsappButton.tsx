import { MessageCircle } from 'lucide-react'

import { buttonBase, buttonSizes, buttonVariants } from '@/components/ui/buttonStyles'
import { useT } from '@/lib/i18n'
import { buildWhatsappLink } from '@/lib/utils/buildWhatsappLink'
import { cn } from '@/lib/utils/cn'

interface WhatsappButtonProps {
  phone: string
  productTitle: string
}

/**
 * The secondary contact route (PRD 11.4).
 *
 * Renders nothing when the number cannot make a valid link. A broken wa.me URL
 * opens WhatsApp on an "invalid number" screen, which reads as the site being
 * broken; an absent button reads as a contact method not offered.
 */
export function WhatsappButton({ phone, productTitle }: WhatsappButtonProps) {
  const t = useT()
  const href = buildWhatsappLink(phone, t('product.whatsappMessage', { title: productTitle }))

  if (!href) return null

  return (
    <a
      href={href}
      target="_blank"
      // noreferrer as well as noopener: the tab being opened should not be told
      // which page sent it.
      rel="noopener noreferrer"
      className={cn(buttonBase, buttonVariants.secondary, buttonSizes.lg)}
    >
      <MessageCircle size={16} aria-hidden />
      {t('product.whatsapp')}
    </a>
  )
}
