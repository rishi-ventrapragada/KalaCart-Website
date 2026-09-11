import { ChartCard } from '@/components/admin/ChartCard'
import type { BarDatum } from '@/lib/admin/analyticsView'
import { useT } from '@/lib/i18n'

/**
 * Tailwind class per dye tone (PRD 9.3). Written out in full rather than
 * built as `bg-${dye}`, because Tailwind scans source text and never sees a
 * class that only exists once a template literal has run.
 */
const BAR_FILL: Record<BarDatum['dye'], string> = {
  indigo: 'bg-indigo',
  madder: 'bg-madder',
  marigold: 'bg-marigold',
  brass: 'bg-brass',
}

interface BarChartCardProps {
  data: BarDatum[]
  loading: boolean
}

/**
 * Artisans by craft (PRD 11.8).
 *
 * Horizontal bars rather than vertical columns because the labels are craft
 * names, not dates: a label like "Wood Craft" or "Jewellery" under a vertical
 * column has to be rotated or truncated, and at 360px that is unreadable. Lying
 * the bars down gives every label a full line at any width.
 *
 * Laid out with CSS rather than SVG, which an earlier draft used. A bar chart
 * of one row per craft is a list of divs with widths - the SVG version needed a
 * non-uniform `preserveAspectRatio` to stretch, which would have distorted any
 * `<text>` inside it, forcing the labels out into a separate list where they no
 * longer sat beside their own bars. CSS keeps label, bar and value on one row,
 * inherits the type scale, and stays selectable. SVG earns its place on the
 * line chart, where there is a real path to plot.
 */
export function BarChartCard({ data, loading }: BarChartCardProps) {
  const t = useT()

  /*
   * Scale to the largest bar, floored at 1 so a store where every craft has a
   * single artisan still draws full-width bars instead of dividing by zero.
   * The axis is the ranking, not an absolute scale.
   */
  const max = Math.max(1, ...data.map((d) => d.value))

  return (
    <ChartCard
      title={t('admin.analytics.byCategoryTitle')}
      caption={t('admin.analytics.byCategoryCaption')}
      loading={loading}
      columns={[t('admin.analytics.byCategoryColLabel'), t('admin.analytics.byCategoryColValue')]}
      rows={data.map((d) => [d.label, String(d.value)])}
      tableLabel={t('admin.analytics.tableLabel', { title: t('admin.analytics.byCategoryTitle') })}
    >
      <ul className="flex flex-col gap-3">
        {data.map((datum) => (
          <li key={datum.label} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <span className="text-ink">{datum.label}</span>
              <span className="tabular-nums text-muted">{datum.value}</span>
            </div>

            {/* The track, so a short bar still reads against a full row. */}
            <div className="h-3.5 w-full overflow-hidden rounded-full bg-line">
              <div
                /*
                  `transition-none` explicitly, not merely an absent duration.
                  CLAUDE.md motion discipline: `transition-property` defaults to
                  `all`, so any inherited duration above this would otherwise
                  make every bar animate its width on a re-render.
                */
                className={`h-full rounded-full transition-none ${BAR_FILL[datum.dye]}`}
                style={{ width: `${String((datum.value / max) * 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </ChartCard>
  )
}
