import { ChartCard } from '@/components/admin/ChartCard'
import type { LinePoint } from '@/lib/admin/analyticsView'
import { useT } from '@/lib/i18n'

/**
 * The plot's own coordinate space. Fixed, and scaled to the container by the
 * viewBox, so no measurement and no resize listener is needed.
 */
const W = 320
const H = 190
const PAD = { top: 14, right: 10, bottom: 30, left: 32 }

/**
 * Type inside the plot is sized in user units, which the uniform viewBox scales
 * with the container. At 1280 the card is roughly its natural width so these
 * land near their nominal size; the axis stays legible rather than being
 * pinned to a px value that would shrink with the box.
 */
const TICK_SIZE = 10

interface LineChartCardProps {
  data: LinePoint[]
  loading: boolean
}

/**
 * Artisans on the platform over time (PRD 11.8).
 *
 * Plots the CUMULATIVE total, not the monthly signups the summary carries
 * directly - see `toCumulativeSeries` for why, and note the heading says "on
 * the platform" to match. Hand-rolled SVG per the Increment 15 decision.
 */
export function LineChartCard({ data, loading }: LineChartCardProps) {
  const t = useT()

  const plotW = W - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom
  const max = Math.max(1, ...data.map((d) => d.total))

  /*
   * A single point would divide by zero on the x step, so it is pinned to the
   * left edge. Real for a store one month old, and cheaper than a special case
   * further down.
   */
  const x = (index: number): number =>
    data.length <= 1 ? PAD.left : PAD.left + (index / (data.length - 1)) * plotW
  const y = (value: number): number => PAD.top + plotH - (value / max) * plotH

  const coords = data.map((point, i) => ({ x: x(i), y: y(point.total) }))
  const line = coords.map((p) => `${String(p.x)},${String(p.y)}`).join(' ')

  /* The same points closed down to the baseline, for the tonal fill beneath. */
  const baseline = PAD.top + plotH
  const area =
    coords.length > 0
      ? [
          `M ${String(coords[0]?.x ?? 0)} ${String(baseline)}`,
          ...coords.map((p) => `L ${String(p.x)} ${String(p.y)}`),
          `L ${String(coords[coords.length - 1]?.x ?? 0)} ${String(baseline)}`,
          'Z',
        ].join(' ')
      : ''

  /*
   * Every label would collide at 360px across a year of months, so only the
   * ends and the midpoint are drawn. The table underneath carries all of them,
   * which is where a reader who wants exact values is better served anyway.
   */
  const ticks = tickIndices(data.length)

  return (
    <ChartCard
      title={t('admin.analytics.overTimeTitle')}
      caption={t('admin.analytics.overTimeCaption')}
      loading={loading}
      columns={[
        t('admin.analytics.overTimeColMonth'),
        t('admin.analytics.overTimeColAdded'),
        t('admin.analytics.overTimeColTotal'),
      ]}
      rows={data.map((d) => [d.month, String(d.added), String(d.total)])}
      tableLabel={t('admin.analytics.tableLabel', { title: t('admin.analytics.overTimeTitle') })}
    >
      <svg viewBox={`0 0 ${String(W)} ${String(H)}`} className="h-72 w-full" role="presentation">
        {/* Baseline and top gridline: enough to read height against, no more. */}
        <line
          x1={PAD.left}
          y1={PAD.top + plotH}
          x2={W - PAD.right}
          y2={PAD.top + plotH}
          className="stroke-line-strong"
          strokeWidth={1}
        />
        <line
          x1={PAD.left}
          y1={PAD.top}
          x2={W - PAD.right}
          y2={PAD.top}
          className="stroke-line"
          strokeWidth={1}
          strokeDasharray="2 3"
        />

        {/* Value axis: nothing between 0 and the max earns the ink. */}
        <text
          x={PAD.left - 6}
          y={PAD.top + 4}
          textAnchor="end"
          fontSize={TICK_SIZE}
          className="fill-muted"
        >
          {max}
        </text>
        <text
          x={PAD.left - 6}
          y={PAD.top + plotH + 3}
          textAnchor="end"
          fontSize={TICK_SIZE}
          className="fill-muted"
        >
          0
        </text>

        {area ? <path d={area} className="fill-accent opacity-10" /> : null}

        <polyline
          points={line}
          fill="none"
          className="stroke-accent"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {data.map((point, i) => (
          <circle
            key={point.month}
            cx={x(i)}
            cy={y(point.total)}
            r={2.5}
            className="fill-accent"
          />
        ))}

        {ticks.map((i) => {
          const point = data[i]
          if (!point) return null
          /* End labels anchor inward so neither runs off the plot's edge. */
          let anchor: 'start' | 'middle' | 'end' = 'middle'
          if (i === 0) anchor = 'start'
          else if (i === data.length - 1) anchor = 'end'

          return (
            <text
              key={point.month}
              x={x(i)}
              y={H - 8}
              textAnchor={anchor}
              fontSize={TICK_SIZE}
              className="fill-muted"
            >
              {point.month}
            </text>
          )
        })}
      </svg>
    </ChartCard>
  )
}

/** First, middle and last - de-duplicated for very short series. */
function tickIndices(length: number): number[] {
  if (length === 0) return []
  if (length <= 2) return [...Array(length).keys()]
  return [...new Set([0, Math.floor((length - 1) / 2), length - 1])]
}
