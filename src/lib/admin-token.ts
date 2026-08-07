"use client";

/** Admin token storage — uses localStorage so the token survives page reloads
 *  and works inside iframes / preview panels where third-party cookies are
 *  blocked by the browser. */

const TOKEN_KEY = "ela_admin_token";

/** Save the admin token to localStorage. */
export function saveToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // localStorage might be unavailable (private mode, etc.)
  }
}

/** Read the admin token from localStorage. */
export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/** Remove the admin token from localStorage. */
export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

/** Build headers that include the admin token (if available). */
export function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  const token = getToken();
  if (token) {
    headers["x-ela-admin-token"] = token;
  }
  return headers;
}
