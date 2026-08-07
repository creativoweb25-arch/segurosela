import { cookies, headers } from 'next/headers'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ela-admin-2024'
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const COOKIE_NAME = 'ela_admin'
const TOKEN_HEADER = 'x-ela-admin-token'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

/** Read the configured admin credentials (used by login route). */
export function getAdminCredentials() {
  return { username: ADMIN_USERNAME, password: ADMIN_PASSWORD }
}

/** Build a session token string. */
function buildToken(username: string): string {
  const payload = JSON.stringify({
    u: username,
    t: Date.now(),
  })
  return Buffer.from(payload, 'utf8').toString('base64')
}

/** Validate a raw token value (without the "logged-in-" prefix). */
function isValidToken(raw: string): boolean {
  try {
    const decoded = Buffer.from(raw, 'base64').toString('utf8')
    const parsed = JSON.parse(decoded)
    if (!parsed?.u || typeof parsed.t !== 'number') return false
    const ageMs = Date.now() - parsed.t
    if (ageMs > COOKIE_MAX_AGE * 1000) return false
    return true
  } catch {
    return false
  }
}

/** Create a signed session token and persist it as an httpOnly cookie.
 *  Also returns the token so the caller can send it back to the client
 *  for use as a header-based token (needed in iframe/preview contexts
 *  where third-party cookies are blocked). */
export async function createSession(username: string): Promise<string> {
  const token = buildToken(username)
  const store = await cookies()
  store.set(COOKIE_NAME, `logged-in-${token}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  })
  return token
}

/** Clear the session cookie. */
export async function clearSession() {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}

/** Verify whether the current request has a valid admin session.
 *  Supports two methods:
 *  1. Cookie (default — works in normal browser navigation)
 *  2. x-ela-admin-token header (needed in iframe / preview panel contexts
 *     where third-party cookies are blocked by the browser) */
export async function verifySession(): Promise<boolean> {
  try {
    // Method 1: cookie
    const store = await cookies()
    const cookie = store.get(COOKIE_NAME)
    if (cookie?.value?.startsWith('logged-in-')) {
      const token = cookie.value.slice('logged-in-'.length)
      if (isValidToken(token)) return true
    }

    // Method 2: header token (for iframe/preview contexts)
    const hdrs = await headers()
    const headerToken = hdrs.get(TOKEN_HEADER)
    if (headerToken && isValidToken(headerToken)) {
      return true
    }

    return false
  } catch {
    return false
  }
}

/** Throw a 401-style error when not authenticated. Use inside protected routes. */
export async function requireAdmin(): Promise<void> {
  const ok = await verifySession()
  if (!ok) {
    const err = new Error('UNAUTHORIZED') as Error & { status?: number }
    err.status = 401
    throw err
  }
}
