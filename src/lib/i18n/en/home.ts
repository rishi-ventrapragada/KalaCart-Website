/** The Home route (PRD 11.2): hero, craft rail, sections and closing CTA. */
export const home = {
  home: {
    hero: {
      /*
       * The headline ships as two keys, not one string the component splits.
       * PRD 10.4 masks each line separately, and where a line breaks is a
       * typographic decision per language: measuring a width to find the break
       * would put Hindi at the mercy of an English rhythm.
       */
      titleLineOne: 'Handmade goods,',
      /*
       * {accent} marks the word that carries the dye underline. It is a
       * placeholder rather than markup so a translator can move the emphasis to
       * whichever word carries it in their language.
       */
      titleLineTwo: 'direct from the {accent}.',
      accentWord: 'artisan',
      /** Screen readers get the headline as one sentence, unsplit. */
      titleLabel: 'Handmade goods, direct from the artisan.',
      subtitle:
        'Buy straight from the people who make it. No middlemen, no commission, and the full story of every craft.',
      cta: 'Browse crafts',
      /** Names the hero section for assistive technology. */
      sceneLabel: 'Introduction',
    },
    rail: {
      heading: 'Browse by craft',
      error: 'Could not load crafts.',
    },
    artisans: {
      heading: 'Meet the makers',
      body: 'Verified artisans listing their own work, in their own words.',
      error: 'Could not load artisans.',
      seeAll: 'See all artisans',
      /*
       * Names the fanned group for assistive technology. The fan is a visual
       * arrangement of the same links the grid renders below `lg`, so the label
       * describes the set rather than the gesture: nobody navigating by list
       * needs to know the cards overlap.
       */
      fanLabel: 'Featured artisans',
      /* Matches the products grid: a section that resolves to nothing says so
         rather than leaving a heading over an empty row (PRD 5.4). */
      empty: 'No artisans are listed yet.',
    },
    products: {
      heading: 'Recently listed',
      body: 'New work from approved artisans across six crafts.',
      error: 'Could not load crafts.',
      seeAll: 'Browse all crafts',
      empty: 'No crafts are listed yet.',
    },
    impact: {
      heading: 'The programme so far',
      error: 'Could not load programme numbers.',
      /*
       * Labels state exactly what is counted, and nothing more. No outcome is
       * claimed - "artisans onboarded" is a fact about the platform, whereas
       * anything like "incomes raised" would be a claim this build cannot
       * support. CLAUDE.md forbids invented statistics.
       */
      artisans: 'Artisans onboarded',
      products: 'Crafts listed',
      crafts: 'Craft traditions',
      inquiries: 'Buyer inquiries sent',
    },
    closing: {
      title: 'Find the maker behind the craft.',
      body: 'Every listing links you straight to the artisan who made it.',
      cta: 'Browse crafts',
    },
    progressLabel: 'Reading progress',
  },
} as const
