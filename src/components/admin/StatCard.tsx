import { Skeleton } from '@/components/ui/Skeleton'

/** Grouped the way an Indian reader expects: 1,00,000 rather than 100,000. */
const NUMBER = new Intl.NumberFormat('en-IN')

interface StatCardProps {
  label: string
  value: number | null
}

/**
 * One headline number on the analytics page (PRD 11.8).
 *
 * Owns its own loading state rather than being swapped out for a skeleton by
 * the grid: the card keeps its real height and border either way, so the five
 * cards do not reflow when the numbers land.
 */
export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-card border border-line bg-card px-5 py-5">
      {value === null ? (
        <Skeleton className="h-9 w-16 rounded-lg" />
      ) : (
        /*
          `tabular-nums` so the digits sit on a fixed grid. Without it the five
          cards' numbers drift out of alignment with each other, which on a
          page whose whole job is numbers looks like a rendering fault.
        */
        <p className="font-display text-3xl leading-none tabular-nums text-ink">
          {NUMBER.format(value)}
        </p>
      )}
      <p className="text-sm text-muted">{label}</p>
    </div>
  )
}
