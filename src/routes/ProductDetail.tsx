import { useParams } from 'react-router-dom'

import { Container } from '@/components/layout/Container'
import { useT } from '@/lib/i18n'

/** Increment 0 placeholder. Built in Increment 10. */
export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const t = useT()

  return (
    <Container className="py-16">
      <h1 className="text-2xl font-semibold">
        {t('product.detailTitle', { id: id ?? '' })}
      </h1>
    </Container>
  )
}
