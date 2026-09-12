import { createClient } from '@supabase/supabase-js'

/**
 * The shared Supabase project, read with the publishable key.
 *
 * The key is public by design and RLS is the boundary — see the caveat in
 * `supabaseProvider.ts` about what that boundary currently is.
 *
 * The legacy `anon` JWT that used to live in `.env.local` was disabled
 * project-wide on 2026-09-12, so a stale value here fails every request with
 * "Your legacy API keys (anon, service_role) were disabled". `assertKeyShape`
 * below turns that into a named error at startup rather than a 401 per call.
 */

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

function assertConfigured(): void {
  if (!url || !key) {
    throw new Error(
      'Supabase is not configured: set VITE_SUPABASE_URL and ' +
        'VITE_SUPABASE_ANON_KEY in .env.local (and in the Vercel project ' +
        'settings for deployed builds).',
    )
  }
  if (key.startsWith('eyJ')) {
    throw new Error(
      'VITE_SUPABASE_ANON_KEY is a legacy JWT key. Those were disabled on this ' +
        'project on 2026-09-12 and every request will 401. Replace it with the ' +
        'sb_publishable_… key from Supabase → Project Settings → API Keys.',
    )
  }
}

assertConfigured()

export const supabase = createClient(url, key, {
  auth: {
    // The admin gate is a mock gate (Increment 12) and nothing here signs in,
    // so there is no session to persist or refresh. Leaving these on makes the
    // client write to localStorage and start a refresh timer for a session that
    // never exists.
    persistSession: false,
    autoRefreshToken: false,
  },
})
