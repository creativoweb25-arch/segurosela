/**
 * Simple fetcher helper for client components.
 * Calls fetch, parses JSON, and returns the inner `data` field.
 *
 * Usage:
 *   const services = await fetcher<Service[]>("/api/services");
 */
export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`fetcher: ${res.status} ${res.statusText} ${text}`);
  }
  const json = (await res.json()) as { success?: boolean; data?: T };
  // API endpoints return { success, data }. Be defensive in case of bare payloads.
  if (json && typeof json === "object" && "data" in json) {
    return json.data as T;
  }
  return json as unknown as T;
}
