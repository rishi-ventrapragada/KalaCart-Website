/**
 * MOCK AUTH. THIS IS NOT SECURITY (PRD 11.1).
 *
 * The credential below ships in the public JavaScript bundle. Anyone can read
 * it in DevTools, and anyone who knows the storage key can grant themselves the
 * flag directly from the console. It gates nothing that an attacker could not
 * reach by typing two lines. It exists so the demo has a front door and so the
 * admin routes have something to redirect to.
 *
 * Because of that, the login screen SAYS SO ON SCREEN and prints the
 * credential (see MockAuthNotice). A page that looks like a real login is
 * presenting itself as real security whatever a code comment says, and PRD 11.1
 * ends with the instruction not to present it as real. A reviewer reads the
 * page, not this file.
 *
 * Replacing this with Supabase email/password means deleting the two constants
 * and rewriting AdminProvider.signIn to await the real call. Nothing else in
 * the app reads them.
 */

export const MOCK_ADMIN_EMAIL = 'admin@kalacart.in'
export const MOCK_ADMIN_PASSWORD = 'kalacart2026'

/**
 * STORAGE EXCEPTION. CLAUDE.md law 8 permits browser storage for exactly two
 * things: the theme (see ThemeProvider) and this flag. Both are documented at
 * their definition. sessionStorage, not localStorage, so signing in dies with
 * the tab rather than persisting on a shared machine.
 */
export const ADMIN_STORAGE_KEY = 'kalacart-admin'

/** The one value the flag is allowed to hold. Anything else reads as signed out. */
export const ADMIN_STORAGE_VALUE = 'true'

/** Where the gate sends an unauthenticated visitor, and where sign-out returns them. */
export const ADMIN_LOGIN_PATH = '/admin/login'

/** Where a successful sign-in lands when there is no attempted destination. */
export const ADMIN_HOME_PATH = '/admin/queue'

/**
 * The mock credential check. Case-insensitive on the email because a demo
 * typed on a phone keyboard should not fail on a capital letter.
 */
export function isValidMockCredential(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === MOCK_ADMIN_EMAIL && password === MOCK_ADMIN_PASSWORD
  )
}
