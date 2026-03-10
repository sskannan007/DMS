/**
 * Seed script: Upload PDFs from src/app/files/ to MinIO and insert metadata into SQLite.
 * Run: node scripts/seed-minio-db.js
 * Requires: MinIO running (see docker-compose), .env with MinIO credentials
 */
import "dotenv/config";
import * as Minio from "minio";
import { readdirSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILES_DIR = join(__dirname, "../src/app/files");
const BUCKET = process.env.MINIO_BUCKET || "dms-documents";

// MinIO config
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  port: parseInt(process.env.MINIO_PORT || "9000", 10),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
});

function getTitleFromPath(path) {
  const parts = path.replace(/\\/g, "/").split("/");
  const filename = parts[parts.length - 1] || "";
  return filename.replace(/\.pdf$/i, "").replace(/_/g, " ");
}

function collectPdfs(dir, base = "") {
  const results = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const rel = base ? `${base}/${e.name}` : e.name;
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      results.push(...collectPdfs(full, rel));
    } else if (e.name.toLowerCase().endsWith(".pdf")) {
      const match = rel.match(/^([^/]+)\/([^/]+)$/);
      const type = match ? match[1] : "unknown";
      const filename = match ? match[2] : e.name;
      const yearMatch = filename.match(/^(\d{4})/);
      const date = yearMatch ? `${yearMatch[1]}-01-01` : "";
      results.push({
        relPath: rel,
        fullPath: full,
        type,
        filename,
        title: getTitleFromPath(rel),
        date,
        id: `${type}/${filename}`,
      });
    }
  }
  return results;
}

async function ensureBucket() {
  const exists = await minioClient.bucketExists(BUCKET);
  if (!exists) {
    await minioClient.makeBucket(BUCKET);
    console.log(`Created bucket: ${BUCKET}`);
  }
}

async function uploadToMinio(doc) {
  const objectName = doc.relPath; // e.g. act/2025_ST_Forest_Dwellers_act_2006_e.pdf
  const fileBuffer = readFileSync(doc.fullPath);
  await minioClient.putObject(BUCKET, objectName, fileBuffer, fileBuffer.length, {
    "Content-Type": "application/pdf",
  });
  return objectName;
}

function initDb(dbPath) {
  const db = new Database(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      filename TEXT NOT NULL,
      type TEXT NOT NULL,
      date TEXT,
      minio_key TEXT NOT NULL,
      status TEXT DEFAULT 'indexed',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
    CREATE INDEX IF NOT EXISTS idx_documents_date ON documents(date);
  `);
  return db;
}

async function main() {
  console.log("Seed: src/app/files → MinIO + SQLite\n");

  if (!existsSync(FILES_DIR)) {
    console.error(`Files directory not found: ${FILES_DIR}`);
    process.exit(1);
  }

  const pdfs = collectPdfs(FILES_DIR);
  if (pdfs.length === 0) {
    console.log("No PDF files found in src/app/files/");
    process.exit(0);
  }

  console.log(`Found ${pdfs.length} PDF(s)\n`);

  // 1. Ensure MinIO bucket exists
  try {
    await ensureBucket();
  } catch (err) {
    console.error("MinIO error. Is MinIO running? (docker-compose up -d minio)");
    console.error(err.message);
    process.exit(1);
  }

  // 2. Init SQLite DB
  const dataDir = join(__dirname, "../data");
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
  const dbPath = join(dataDir, "dms.db");
  const db = initDb(dbPath);
  const insert = db.prepare(`
    INSERT OR REPLACE INTO documents (id, title, filename, type, date, minio_key, status)
    VALUES (@id, @title, @filename, @type, @date, @minio_key, 'indexed')
  `);

  // 3. Upload each file and insert metadata
  for (let i = 0; i < pdfs.length; i++) {
    const doc = pdfs[i];
    try {
      const minioKey = await uploadToMinio(doc);
      insert.run({
        id: doc.id,
        title: doc.title,
        filename: doc.filename,
        type: doc.type,
        date: doc.date || null,
        minio_key: minioKey,
      });
      console.log(`  [${i + 1}/${pdfs.length}] ${doc.relPath}`);
    } catch (err) {
      console.error(`  [${i + 1}/${pdfs.length}] FAILED ${doc.relPath}:`, err.message);
    }
  }

  db.close();
  console.log(`\nDone. MinIO bucket: ${BUCKET}, DB: ${dbPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
