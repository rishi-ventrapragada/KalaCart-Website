import { Link } from 'react-router-dom'

import { RemoteImage } from '@/components/ui/RemoteImage'
import type { Artisan, Category } from '@/lib/data'
import { useT } from '@/lib/i18n'

interface ArtisanMiniCardProps {
  artisan: Artisan
  category?: Category | undefined
}

/**
 * The maker behind the piece (PRD 11.4): name, craft, region, linking to their
 * profile. Deliberately minimal - the long story lives in the mobile app.
 */
export function ArtisanMiniCard({ artisan, category }: ArtisanMiniCardProps) {
  const t = useT()

  return (
    <Link
      to={`/artisan/${artisan.id}`}
      className="flex items-center gap-3 rounded-card border border-line bg-card p-3 transition-colors duration-200 ease-site hover:border-accent"
    >
      <RemoteImage src={artisan.photoUrl} alt="" wrapperClassName="size-12 shrink-0 rounded-full" />
      <div className="flex flex-col gap-0.5">
        <span className="text-2xs text-muted">{t('product.by')}</span>
        <span className="font-display text-base leading-tight text-ink">{artisan.name}</span>
        <span className="text-2xs text-muted">
          {category ? `${category.name} · ` : ''}
          {artisan.region}
        </span>
      </div>
    </Link>
  )
}
