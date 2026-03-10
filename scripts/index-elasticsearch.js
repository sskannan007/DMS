/**
 * Index PDFs from src/app/files/ into Elasticsearch (filename + extracted text).
 * Run: npm run index
 * Requires: Elasticsearch running (docker-compose up -d elasticsearch)
 */
import "dotenv/config";
import { createRequire } from "module";
import { Client } from "@elastic/elasticsearch";
import { readdirSync, readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILES_DIR = join(__dirname, "../src/app/files");
const INDEX_NAME = "dms_documents";
const ES_URL = process.env.ELASTICSEARCH_URL || "http://localhost:9200";

const es = new Client({ node: ES_URL });

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

async function ensureIndex() {
  const exists = await es.indices.exists({ index: INDEX_NAME });
  if (exists) {
    await es.indices.delete({ index: INDEX_NAME });
    console.log(`Deleted existing index: ${INDEX_NAME}`);
  }
  await es.indices.create({
    index: INDEX_NAME,
    body: {
      mappings: {
        properties: {
          id: { type: "keyword" },
          title: { type: "text", fields: { keyword: { type: "keyword" } } },
          filename: { type: "text", fields: { keyword: { type: "keyword" } } },
          type: { type: "keyword" },
          date: { type: "date" },
          content: { type: "text", analyzer: "standard" },
        },
      },
    },
  });
  console.log(`Created index: ${INDEX_NAME}`);
}

async function extractText(filePath) {
  const buffer = readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text || "";
}

async function main() {
  console.log("Index: src/app/files → Elasticsearch\n");

  if (!existsSync(FILES_DIR)) {
    console.error(`Files directory not found: ${FILES_DIR}`);
    process.exit(1);
  }

  const pdfs = collectPdfs(FILES_DIR);
  if (pdfs.length === 0) {
    console.log("No PDF files found.");
    process.exit(0);
  }

  console.log(`Found ${pdfs.length} PDF(s)\n`);

  try {
    await es.ping();
  } catch (err) {
    console.error("Elasticsearch not reachable. Start it: docker-compose up -d elasticsearch");
    console.error(err.message);
    process.exit(1);
  }

  await ensureIndex();

  for (let i = 0; i < pdfs.length; i++) {
    const doc = pdfs[i];
    try {
      const content = await extractText(doc.fullPath);
      await es.index({
        index: INDEX_NAME,
        id: doc.id,
        document: {
          id: doc.id,
          title: doc.title,
          filename: doc.filename,
          type: doc.type,
          date: doc.date || null,
          content: content.slice(0, 100000),
        },
      });
      console.log(`  [${i + 1}/${pdfs.length}] ${doc.relPath}`);
    } catch (err) {
      console.error(`  [${i + 1}/${pdfs.length}] FAILED ${doc.relPath}:`, err.message);
    }
  }

  await es.indices.refresh({ index: INDEX_NAME });
  console.log(`\nDone. Indexed ${pdfs.length} documents to ${INDEX_NAME}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
