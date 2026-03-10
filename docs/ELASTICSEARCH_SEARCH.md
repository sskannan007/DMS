# Elasticsearch Full-Text Search

Search by **filename** and **inside document text** using Elasticsearch. No metadata DB or MinIO required for this flow.

---

## Quick start

### 1. Start Elasticsearch
```bash
docker-compose up -d elasticsearch
```
Wait ~30 seconds for ES to be ready.

### 2. Index PDFs (extract text + index)
```bash
npm run index
```
Reads `src/app/files/`, extracts text from each PDF, indexes to Elasticsearch.

### 3. Start the search API
```bash
npm run server
```
API runs at http://localhost:3001

### 4. Configure frontend
Create `.env` in project root:
```
VITE_API_URL=http://localhost:3001
```

### 5. Run the app
```bash
npm run dev
```
Search in the search box — results come from Elasticsearch (filename + content).

---

## Flow

```
User types in search box
        │
        ▼
Frontend → GET /api/search?q=...&type=...&dateRange=...
        │
        ▼
Server → Elasticsearch (multi_match on content, title, filename)
        │
        ▼
Results + highlights → Frontend
```

---

## What gets indexed

| Field   | Source              | Searchable |
|---------|---------------------|------------|
| content | Extracted PDF text  | Yes (primary) |
| title   | Filename (no ext)   | Yes |
| filename| Full filename       | Yes |
| type    | Folder (act, GO, etc) | Filter |
| date    | From filename (YYYY) | Filter |

---

## Fallback

If `VITE_API_URL` is not set or the API is down, search falls back to **metadata-only** (filename, title, type) using the local document list. No content search in that case.

---

## Commands

| Command        | Purpose |
|----------------|---------|
| `npm run index` | Index PDFs from src/app/files/ to Elasticsearch |
| `npm run server` | Start search API (port 3001) |
| `npm run dev`  | Start frontend (Vite) |
