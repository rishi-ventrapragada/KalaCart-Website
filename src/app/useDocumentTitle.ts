import { useEffect } from 'react'

import { t } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n/types'

/**
 * The suffix every title carries, so a tab reads "Browse crafts · KalaCart"
 * rather than a bare page name that says nothing about which site it belongs to.
 */
const SUFFIX = t('meta.siteName')

/** Home's title is the brand plus the positioning line, not "Home · KalaCart". */
const HOME_TITLE = t('meta.home')

/**
 * Sets `document.title` for the route that mounts it.
 *
 * WHY A HOOK RATHER THAN A <title> IN THE MARKUP. This is a client-rendered SPA:
 * index.html carries one static title and the router swaps views underneath it,
 * so without this every route - product pages, artisan profiles, the whole admin
 * desk - shares the single title "KalaCart". A screen reader announces the
 * document title on navigation, so all ten routes announced identically, and a
 * reader with several tabs open could not tell them apart.
 *
 * It writes on every change of `title` rather than only on mount, which is what
 * the two dynamic routes need: ProductDetail and ArtisanProfile call this with
 * `undefined` while their seam read is in flight and with the real name once it
 * lands, so the tab shows the generic name first and the product second. Passing
 * `undefined` deliberately falls back to the route's own generic title instead
 * of leaving the previous route's title standing.
 *
 * NOT RESTORED ON UNMOUNT. Every route sets its own title on mount, so a restore
 * would only ever write a value the next route immediately overwrites - and
 * doing it in a cleanup would briefly flash the old page's name during a
 * transition. The last route to mount owns the title, which is correct.
 */
export function useDocumentTitle(title: string | undefined, fallbackKey: TranslationKey): void {
  const resolved = title ?? t(fallbackKey)

  useEffect(() => {
    document.title = resolved === HOME_TITLE ? resolved : `${resolved} · ${SUFFIX}`
  }, [resolved])
}

/**
 * Home's variant. Separate rather than a flag on the hook above, because Home is
 * the one route whose title is not "<page> · KalaCart" - the brand is already
 * the first word, and "KalaCart · KalaCart" is what a suffix rule produces if it
 * is applied without thinking.
 */
export function useHomeDocumentTitle(): void {
  useDocumentTitle(HOME_TITLE, 'meta.home')
}
