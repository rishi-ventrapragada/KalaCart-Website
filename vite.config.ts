import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/**
 * The absolute origin this build is served from, for the link-unfurl tags.
 *
 * WHY IT CANNOT BE A LITERAL IN index.html. `og:image` must be absolute: most
 * scrapers resolve a relative path against the page URL, but several - notably
 * WhatsApp, which is the channel this project's own artisans use - do not, and
 * show no preview at all. There is no committed production domain to hardcode,
 * and a guessed one is worse than a relative path: it breaks every unfurl
 * permanently instead of only on the strict scrapers.
 *
 * So it is read from the deployment. `VERCEL_PROJECT_PRODUCTION_URL` is the
 * stable production domain (no scheme, hence the prefix here) and is set for
 * every Vercel build including previews, which keeps preview deploys pointing
 * at production's image rather than at a URL that dies with the branch.
 *
 * Locally there is no such variable and the tags fall back to a relative path,
 * which is correct: nothing unfurls localhost anyway.
 */
const productionUrl = process.env['VERCEL_PROJECT_PRODUCTION_URL']
const origin = productionUrl ? `https://${productionUrl}` : ''

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'kalacart-absolute-og-urls',
      transformIndexHtml: {
        order: 'pre',
        handler: (html: string) => html.replaceAll('%ORIGIN%', origin),
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
