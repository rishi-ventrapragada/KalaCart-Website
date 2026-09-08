import type { ReactNode } from 'react'

import { Skeleton } from '@/components/ui/Skeleton'

interface ChartCardProps {
  title: string
  caption: string
  loading: boolean
  /** Column headers for the accessible table. */
  columns: string[]
  /** One row of cells per datum, already formatted for reading. */
  rows: string[][]
  /** Names the table for a screen reader, e.g. "Artisans by craft, as a table". */
  tableLabel: string
  /** The SVG. Rendered aria-hidden - the table is the accessible copy. */
  children: ReactNode
}

/**
 * The frame both analytics charts sit in (PRD 11.8).
 *
 * Carries the heading, the loading branch and - the part that matters - the
 * accessible representation. The SVG is hidden from assistive technology and
 * the same numbers are published as a real `<table>`, visually hidden.
 *
 * A table rather than ARIA chart roles because it is the honest structure: the
 * data IS tabular, `sr-only` markup is still selectable and copyable, and
 * support for the graphics roles is uneven enough that a screen-reader user
 * could easily get nothing at all. A chart nobody can read is not a chart.
 */
export function ChartCard({
  title,
  caption,
  loading,
  columns,
  rows,
  tableLabel,
  children,
}: ChartCardProps) {
  return (
    <section className="flex flex-col gap-1 rounded-card border border-line bg-card px-5 py-5">
      <h2 className="text-lg text-ink">{title}</h2>
      <p className="text-sm text-muted">{caption}</p>

      {loading ? (
        /*
          Approximates the plotted height so the page does not jump when the
          numbers land. The two charts differ a little in natural height; this
          sits between them rather than tracking either exactly, which would
          couple this frame to one chart's internals.
        */
        <Skeleton className="mt-4 h-72 w-full" />
      ) : (
        <div className="mt-4">
          <div aria-hidden>{children}</div>

          <table className="sr-only">
            <caption>{tableLabel}</caption>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column} scope="col">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((cells) => (
                <tr key={cells[0]}>
                  {cells.map((cell, index) =>
                    /* The first cell names the row, so it is a header too. */
                    index === 0 ? (
                      <th key={cell} scope="row">
                        {cell}
                      </th>
                    ) : (
                      <td key={`${cells[0] ?? ''}-${String(index)}`}>{cell}</td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
