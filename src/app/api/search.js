/**
 * Search API client - full-text search via Elasticsearch backend.
 * Falls back to empty results if API is unavailable.
 */
const API_URL = import.meta.env.VITE_API_URL || "";

export async function searchDocuments({ query, type, dateRange }) {
  if (!API_URL) return null;

  const params = new URLSearchParams();
  if (query?.trim()) params.set("q", query.trim());
  if (type && type !== "All Types") params.set("type", type);
  if (dateRange && dateRange !== "all") params.set("dateRange", dateRange);

  try {
    const res = await fetch(`${API_URL}/api/search?${params}`);
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
  } catch {
    return null;
  }
}

export async function checkSearchApi() {
  if (!API_URL) return false;
  try {
    const res = await fetch(`${API_URL}/api/health`);
    return res.ok && (await res.json()).ok;
  } catch {
    return false;
  }
}
