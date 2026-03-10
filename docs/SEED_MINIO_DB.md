# Seed MinIO & Database from src/app/files/

Use the PDFs in `src/app/files/` to populate MinIO and a local SQLite database for testing.

---

## Prerequisites

- **Docker** (for MinIO)
- **Node.js** 18+

---

## Step 1: Install dependencies

```bash
cd DMS
npm install
```

---

## Step 2: Start MinIO

```bash
docker-compose up -d minio
```

MinIO will run at:
- **API:** http://localhost:9000
- **Console UI:** http://localhost:9001 (login: minioadmin / minioadmin)

---

## Step 3: Create .env file

Copy the example and adjust if needed:

```bash
cp .env.example .env
```

Default values work with Docker MinIO:
- `MINIO_ENDPOINT=localhost`
- `MINIO_PORT=9000`
- `MINIO_ACCESS_KEY=minioadmin`
- `MINIO_SECRET_KEY=minioadmin`
- `MINIO_BUCKET=dms-documents`

---

## Step 4: Run the seed script

```bash
npm run seed
```

This will:
1. Read all PDFs from `src/app/files/` (act, GO, judgements, policy)
2. Upload each file to MinIO bucket `dms-documents`
3. Create `data/dms.db` (SQLite) with document metadata

---

## Output

```
Seed: src/app/files → MinIO + SQLite

Found 20 PDF(s)

Created bucket: dms-documents
  [1/20] act/2025_ST_Forest_Dwellers_act_2006_e.pdf
  [2/20] act/2025_tngs_act_2016_amended_12042023.pdf
  ...

Done. MinIO bucket: dms-documents, DB: data/dms.db
```

---

## Verify

### MinIO Console
1. Open http://localhost:9001
2. Login: minioadmin / minioadmin
3. Open bucket `dms-documents`
4. Confirm folders: `act/`, `GO/`, `judgements/`, `policy/`

### SQLite database
```bash
sqlite3 data/dms.db "SELECT id, title, type, minio_key FROM documents LIMIT 5;"
```

---

## Database schema

| Column    | Type | Description                    |
|-----------|------|--------------------------------|
| id        | TEXT | Document ID (e.g. act/filename.pdf) |
| title     | TEXT | Display title                 |
| filename  | TEXT | Original filename             |
| type      | TEXT | act, GO, judgements, policy   |
| date      | TEXT | YYYY-MM-DD                    |
| minio_key | TEXT | Object key in MinIO           |
| status    | TEXT | indexed / processing / failed |
| created_at| TEXT | Insert timestamp              |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `MinIO error` | Ensure MinIO is running: `docker-compose ps` |
| `ECONNREFUSED` | Check MINIO_ENDPOINT and MINIO_PORT in .env |
| `No PDF files found` | Ensure PDFs exist in `src/app/files/{type}/*.pdf` |
| `better-sqlite3` build fails | Use Node 18+; on Windows, ensure build tools are installed |

---

## Next steps

- **Backend API:** Build a FastAPI/Node server that reads from `data/dms.db` and serves pre-signed URLs from MinIO
- **Elasticsearch:** Add text extraction and indexing (see `docs/FULLTEXT_SEARCH_DESIGN.md`)
