# Full-Text Search Design — Elasticsearch + MinIO + Backend

**Purpose:** Concrete design for searching inside document content (sentences, paragraphs, text)  
**Status:** Design specification — ready for implementation  
**Last updated:** March 2025

> **Quick test setup:** To seed MinIO + SQLite from `src/app/files/`, see [SEED_MINIO_DB.md](./SEED_MINIO_DB.md).

---

## 1. Overview

| Current | Target |
|---------|--------|
| Search by filename, title, type only | Search by **content** (any text inside PDF) |
| In-memory filter on bundled files | Elasticsearch full-text search |
| Local files in `src/app/files/` | MinIO object storage + PostgreSQL metadata |

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React + Vite)                            │
│  SearchBar → /search?q=...  │  DocumentPreview  │  AdminIndexing  │  Upload     │
└─────────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND API (FastAPI / Node.js)                         │
│  GET  /api/search?q=...&type=...&date=...  →  Elasticsearch                       │
│  GET  /api/documents/:id                   →  DB + MinIO pre-signed URL         │
│  POST /api/upload                           →  MinIO + DB + Indexer               │
│  GET  /api/admin/indexing                   →  DB (indexing status)               │
└─────────────────────────────────────────────────────────────────────────────────┘
         │                    │                    │                    │
         ▼                    ▼                    ▼                    ▼
┌──────────────┐    ┌────────────────┐    ┌──────────────┐    ┌────────────────┐
│ Elasticsearch│    │   PostgreSQL   │    │    MinIO     │    │  Indexer Job    │
│ (full-text)  │    │  (metadata)    │    │  (PDF files) │    │  (text extract) │
└──────────────┘    └────────────────┘    └──────────────┘    └────────────────┘
```

---

## 3. Component Responsibilities

### 3.1 Elasticsearch

- **Index:** `dms_documents`
- **Role:** Full-text search over extracted PDF text + metadata
- **Fields indexed:**
  - `content` — extracted text (full-text, analyzed)
  - `title`, `filename`, `type` — metadata (keyword + text)
  - `date`, `department`, `status` — filters
  - `minio_key` — reference to file in MinIO

### 3.2 PostgreSQL (or chosen DB)

- **Tables:** `documents`, `indexing_jobs`
- **Role:** Source of truth for metadata, document listing, indexing status
- **Links:** `document_id` → Elasticsearch `_id`, MinIO object key

### 3.3 MinIO

- **Buckets:** `dms-documents`
- **Object key:** `{type}/{year}/{uuid}_{filename}.pdf`
- **Role:** Store actual PDF files; serve via pre-signed URLs

### 3.4 Indexer (Backend service)

- **Trigger:** On upload, or batch job for existing files
- **Steps:**
  1. Fetch PDF from MinIO (or local path during migration)
  2. Extract text (pdf-parse / pdfjs-dist / pdfplumber)
  3. Index into Elasticsearch
  4. Update DB with indexing status

---

## 4. Elasticsearch Index Design

### 4.1 Index Mapping

```json
{
  "mappings": {
    "properties": {
      "document_id": { "type": "keyword" },
      "title": {
        "type": "text",
        "fields": { "keyword": { "type": "keyword" } }
      },
      "filename": {
        "type": "text",
        "fields": { "keyword": { "type": "keyword" } }
      },
      "type": { "type": "keyword" },
      "date": { "type": "date" },
      "department": { "type": "keyword" },
      "status": { "type": "keyword" },
      "minio_key": { "type": "keyword" },
      "content": {
        "type": "text",
        "analyzer": "standard"
      },
      "page_highlights": {
        "type": "nested",
        "properties": {
          "page": { "type": "integer" },
          "text": { "type": "text" }
        }
      }
    }
  },
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  }
}
```

### 4.2 Search Query (multi_match + filters)

```json
{
  "query": {
    "bool": {
      "must": [
        {
          "multi_match": {
            "query": "{{user_query}}",
            "fields": ["content^2", "title^1.5", "filename"],
            "type": "best_fields",
            "fuzziness": "AUTO"
          }
        }
      ],
      "filter": [
        { "term": { "type": "act" } },
        { "range": { "date": { "gte": "2020-01-01" } } }
      ]
    }
  },
  "highlight": {
    "fields": {
      "content": { "fragment_size": 150, "number_of_fragments": 3 }
    }
  }
}
```

---

## 5. API Contracts

### 5.1 Search API

```
GET /api/search?q={query}&type={type}&dateRange={range}&page={n}&limit={n}
```

**Response:**
```json
{
  "total": 42,
  "page": 1,
  "limit": 10,
  "results": [
    {
      "id": "act/2024_budget_act.pdf",
      "title": "2024 budget act",
      "filename": "2024_budget_act.pdf",
      "type": "act",
      "date": "2024-01-15",
      "score": 12.5,
      "highlights": ["...budget allocation for **2024** fiscal year..."]
    }
  ]
}
```

### 5.2 Document Detail (for preview)

```
GET /api/documents/:id
```

**Response:**
```json
{
  "id": "act/2024_budget_act.pdf",
  "title": "2024 budget act",
  "filename": "2024_budget_act.pdf",
  "type": "act",
  "date": "2024-01-15",
  "previewUrl": "https://minio.../presigned-url?expires=3600"
}
```

### 5.3 Upload (triggers indexing)

```
POST /api/upload
Content-Type: multipart/form-data
file: <binary>
type: act
department: Finance
```

**Response:**
```json
{
  "id": "act/2024_new_doc.pdf",
  "status": "processing",
  "message": "File uploaded. Indexing in progress."
}
```

---

## 6. Backend Structure (FastAPI example)

```
backend/
├── main.py                 # FastAPI app
├── config.py               # ES, MinIO, DB config
├── routers/
│   ├── search.py           # GET /api/search
│   ├── documents.py        # GET /api/documents/:id
│   ├── upload.py           # POST /api/upload
│   └── admin.py            # GET /api/admin/indexing
├── services/
│   ├── elasticsearch_svc.py # ES client, search, index
│   ├── minio_svc.py        # upload, pre-signed URL
│   ├── indexer.py          # extract text, index to ES
│   └── db.py               # DB operations
├── models/
│   └── document.py        # Pydantic models
└── requirements.txt
```

### 6.1 Dependencies (Python)

```
fastapi
uvicorn
elasticsearch>=8.0
minio
pdfplumber          # or pdf-parse (Node) / pdfjs (browser)
sqlalchemy
psycopg2-binary
python-multipart
```

---

## 7. Text Extraction Options

| Library | Runtime | Pros | Cons |
|---------|---------|------|------|
| **pdfplumber** | Python | Good layout, tables | Python only |
| **pdf-parse** | Node.js | Simple API | Less accurate on complex PDFs |
| **pdfjs-dist** | Node/browser | Same as viewer | Need getDocument + getPage |
| **PyMuPDF** | Python | Fast, accurate | Extra binary |

**Recommended:** `pdfplumber` (Python) or `pdf-parse` (Node) for backend extraction.

---

## 8. Frontend Integration

### 8.1 Search Flow

1. User types in SearchBar → submit → `navigate(/search?q=...)`
2. `SearchResultsPage` fetches `GET /api/search?q=...` instead of filtering `documents`
3. Display results with highlights
4. Click result → `navigate(/document/:id)` → fetch `GET /api/documents/:id` for `previewUrl`

### 8.2 Fallback (no backend)

- If `VITE_API_URL` is unset or request fails → fall back to current `filesManifest` + metadata filter
- Allows development without backend

### 8.3 New/Updated Files

| File | Change |
|------|--------|
| `src/app/api/search.js` | `searchDocuments(query, filters)` → fetch `/api/search` |
| `src/app/api/documents.js` | `getDocument(id)` → fetch `/api/documents/:id` |
| `SearchResultsPage.jsx` | Use API when available, else local |
| `DocumentPreviewPage.jsx` | Use `doc.previewUrl` when from API |
| `filesManifest.js` | Keep for local/dev fallback |

---

## 9. Implementation Phases

### Phase 1 — Backend + Elasticsearch (2–3 weeks)

1. Set up Elasticsearch (Docker or cloud)
2. Create index mapping
3. Implement indexer (extract text from local PDFs, index to ES)
4. Implement `GET /api/search` and `GET /api/documents/:id` (local file URLs for now)

### Phase 2 — MinIO + DB (1–2 weeks)

1. Set up MinIO bucket
2. Add PostgreSQL (or chosen DB) for metadata
3. Implement `POST /api/upload` → MinIO + DB + indexer
4. Serve pre-signed URLs for preview

### Phase 3 — Frontend Integration (1 week)

1. Add API client and env config
2. Switch SearchResultsPage to API
3. Switch DocumentPreviewPage to use `previewUrl` when from API
4. Add loading/error states and fallback

### Phase 4 — Admin & Polish

1. Wire AdminIndexingPage to real indexing status
2. Add search highlights in results
3. Optional: “Jump to page” from highlight

---

## 10. Environment Variables

```env
# Backend
ELASTICSEARCH_URL=http://localhost:9200
MINIO_ENDPOINT=localhost
MINIO_ACCESS_KEY=...
MINIO_SECRET_KEY=...
DATABASE_URL=postgresql://...
MINIO_BUCKET=dms-documents

# Frontend
VITE_API_URL=http://localhost:8000
```

---

## 11. Docker Compose (Dev)

```yaml
version: "3.8"
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
  minio:
    image: minio/minio:latest
    command: server /data
    ports:
      - "9000:9000"
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: dms
      POSTGRES_USER: dms
      POSTGRES_PASSWORD: dms
    ports:
      - "5432:5432"
```

---

## 12. Summary

| Item | Choice |
|------|--------|
| Search engine | Elasticsearch |
| Storage | MinIO |
| Metadata DB | PostgreSQL |
| Backend | FastAPI (or Node.js) |
| Text extraction | pdfplumber (Python) or pdf-parse (Node) |
| Frontend | Existing React app + API client |

This design supports full-text search inside document content, with metadata filters, highlights, and a clear path from local files to MinIO + Elasticsearch.
