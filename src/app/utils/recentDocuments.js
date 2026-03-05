const STORAGE_KEY = "dms-recent-documents";
const MAX_RECENT = 6;

export function addRecentDocument(doc) {
  if (!doc || !doc.id) return;

  let recent = getRecentDocuments();
  recent = recent.filter((d) => d.id !== doc.id);
  recent.unshift({
    id: doc.id,
    title: doc.title,
    department: doc.department ?? doc.type,
    date: doc.date,
    type: doc.type,
  });
  if (recent.length > MAX_RECENT) {
    recent = recent.slice(0, MAX_RECENT);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
}

export function getRecentDocuments() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function clearRecentDocuments() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
}
