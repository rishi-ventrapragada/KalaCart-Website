import { CraftRail } from '@/components/home/CraftRail'
import { Container } from '@/components/layout/Container'
import { Reveal } from '@/components/motion/Reveal'
import { useT } from '@/lib/i18n'

/**
 * The browse-by-craft strip (PRD 11.2), and the page's lateral move.
 *
 * The rail is deliberately NOT inside the Container: it runs edge to edge and
 * off the right of the frame, which is what makes the sideways travel read as
 * travel rather than as a row that happens to be wide. Only the heading is
 * contained, so it stays aligned with every other section's copy.
 */
export function RailSection() {
  const t = useT()

  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <Container>
        <Reveal>
          <h2 className="pb-8 text-2xl sm:text-3xl">{t('home.rail.heading')}</h2>
        </Reveal>
      </Container>

      <CraftRail />
    </section>
  )
}
