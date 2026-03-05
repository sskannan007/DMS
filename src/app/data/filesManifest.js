/**
 * Fetches document list from src/app/files/ using Vite's glob import.
 * Each file path: files/{type}/{filename}.pdf
 */
const modules = import.meta.glob("../files/**/*.pdf", { eager: true, query: "?url", import: "default" });

function getTitleFromPath(path) {
  const normalized = path.replace(/\\/g, "/");
  const parts = normalized.split("/");
  const filename = parts[parts.length - 1] || "";
  return filename.replace(/\.pdf$/i, "").replace(/_/g, " ");
}

export const documents = Object.entries(modules).map(([path, url]) => {
  const normalizedPath = path.replace(/\\/g, "/");
  const match = normalizedPath.match(/files\/([^/]+)\/([^/]+)$/);
  const type = match ? match[1] : "unknown";
  const filename = match ? match[2] : path.split("/").pop() || "";
  const title = getTitleFromPath(path);
  const yearMatch = filename.match(/^(\d{4})/);
  const date = yearMatch ? `${yearMatch[1]}-01-01` : "";
  const id = match ? `${match[1]}/${match[2]}` : path;
  return {
    id,
    title,
    type,
    date,
    url,
    filename,
  };
});

export function getDocumentById(id) {
  return documents.find((d) => d.id === id || d.id === decodeURIComponent(id));
}
