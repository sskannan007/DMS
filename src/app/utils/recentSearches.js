const STORAGE_KEY = "dms-recent-searches";
const MAX_RECENT = 5;

export function addRecentSearch(query) {
  const trimmed = query.trim();
  if (!trimmed) return;

  let recent = getRecentSearches();
  recent = recent.filter((s) => s !== trimmed);
  recent.unshift(trimmed);
  if (recent.length > MAX_RECENT) {
    recent = recent.slice(0, MAX_RECENT);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
}

export function getRecentSearches() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function clearRecentSearches() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
}

export function initRecentSearchesIfEmpty(defaultSearches) {
  if (localStorage.getItem(STORAGE_KEY) === null) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSearches));
  }
}
