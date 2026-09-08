import { ArtisanRow } from '@/components/home/ArtisanRow'
import { ClosingCta } from '@/components/home/ClosingCta'
import { HeroSection } from '@/components/home/HeroSection'
import { ImpactBand } from '@/components/home/ImpactBand'
import { ProductGrid } from '@/components/home/ProductGrid'
import { RailSection } from '@/components/home/RailSection'

/**
 * Home. The one route that runs the full motion system (PRD 6, 10).
 *
 * The engine itself is mounted by MotionProvider in the app shell, which
 * enables it on this path only: the navbar's glass flip and the progress bar
 * are chrome above the router outlet and have to read the same scroll value as
 * the hero (PRD 10.1). This route just composes the sections.
 *
 * Order is PRD 11.2's: the hero states what this is, the rail offers a way in
 * by craft, the makers give it faces, the grid gives it goods, the band gives
 * it scale, and the close asks for the one action.
 */
export default function Home() {
  return (
    <>
      <HeroSection />
      <RailSection />
      <ArtisanRow />
      <ProductGrid />
      <ImpactBand />
      <ClosingCta />
    </>
  )
}
