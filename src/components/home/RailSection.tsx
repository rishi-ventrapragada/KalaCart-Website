import { CraftRail } from '@/components/home/CraftRail'
import { Container } from '@/components/layout/Container'
import { Reveal } from '@/components/motion/Reveal'
import { useT } from '@/lib/i18n'

/**
 * The browse-by-craft strip (PRD 11.2).
 *
 * The rail is deliberately NOT inside the Container: it runs edge to edge and
 * off both sides of the frame. For a continuous loop that bleed is structural
 * rather than stylistic - a marquee constrained to the container would show its
 * cards appearing and vanishing at two hard vertical boundaries, which reads as
 * a bug. The viewport's edges are faded instead, so cards arrive and leave
 * through soft ends and the band reads as genuinely endless.
 *
 * The heading stays contained and centred over it, so it lines up with every
 * other section's copy while the row beneath runs the full width.
 */
export function RailSection() {
  const t = useT()

  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <Container>
        <Reveal>
          <h2 className="pb-10 text-center text-2xl sm:text-3xl">{t('home.rail.heading')}</h2>
        </Reveal>
      </Container>

      <CraftRail />
    </section>
  )
}
