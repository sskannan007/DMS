/**
 * Search API server - queries Elasticsearch for full-text search.
 * Run: npm run server
 * Requires: Elasticsearch running, npm run index (to populate)
 */
import "dotenv/config";
import express from "express";
import cors from "cors";
import { Client } from "@elastic/elasticsearch";

const app = express();
const PORT = process.env.PORT || 3001;
const ES_URL = process.env.ELASTICSEARCH_URL || "http://localhost:9200";
const INDEX_NAME = "dms_documents";

const es = new Client({ node: ES_URL });

app.use(cors());
app.use(express.json());

app.get("/api/search", async (req, res) => {
  const q = (req.query.q || "").trim();
  const type = req.query.type || "";
  const dateRange = req.query.dateRange || "all";

  if (!q) {
    return res.json({ total: 0, results: [] });
  }

  try {
    const must = [
      {
        multi_match: {
          query: q,
          fields: ["content^2", "title^1.5", "filename"],
          type: "best_fields",
          fuzziness: 0,
        },
      },
    ];

    const filter = [];
    if (type && type !== "All Types") {
      filter.push({ term: { type } });
    }
    if (dateRange && dateRange !== "all") {
      const now = new Date();
      let gte;
      if (dateRange === "today") {
        gte = now.toISOString().slice(0, 10);
      } else if (dateRange === "week") {
        const d = new Date(now);
        d.setDate(d.getDate() - 7);
        gte = d.toISOString().slice(0, 10);
      } else if (dateRange === "month") {
        const d = new Date(now);
        d.setMonth(d.getMonth() - 1);
        gte = d.toISOString().slice(0, 10);
      } else if (dateRange === "year") {
        const d = new Date(now);
        d.setFullYear(d.getFullYear() - 1);
        gte = d.toISOString().slice(0, 10);
      }
      if (gte) filter.push({ range: { date: { gte } } });
    }

    const body = {
      query: {
        bool: {
          must,
          ...(filter.length ? { filter } : {}),
        },
      },
      highlight: {
        fields: {
          content: { fragment_size: 150, number_of_fragments: 3 },
          title: { fragment_size: 100, number_of_fragments: 1 },
        },
      },
      size: 50,
    };

    const { hits } = await es.search({ index: INDEX_NAME, body });

    const results = hits.hits.map((hit) => {
      const src = hit._source;
      const highlights = hit.highlight
        ? [...(hit.highlight.content || []), ...(hit.highlight.title || [])]
        : [];
      return {
        id: src.id,
        title: src.title,
        filename: src.filename,
        type: src.type,
        date: src.date,
        score: hit._score,
        highlights,
      };
    });

    res.json({
      total: hits.total?.value ?? hits.hits.length,
      results,
    });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: err.message, total: 0, results: [] });
  }
});

app.get("/api/health", async (req, res) => {
  try {
    await es.ping();
    res.json({ ok: true, elasticsearch: "connected" });
  } catch {
    res.status(503).json({ ok: false, elasticsearch: "disconnected" });
  }
});

app.listen(PORT, () => {
  console.log(`Search API: http://localhost:${PORT}`);
  console.log(`  GET /api/search?q=...&type=...&dateRange=...`);
});
