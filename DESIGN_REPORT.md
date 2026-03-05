# Document Management System — Design Report

**Purpose:** Design approval document for the Document Management System (DMS) UI/UX  
**Prepared for:** Manager Review  
**Status:** Frontend prototype (mock data) — ready for backend integration

---

## Project Overview

The Document Management System is an enterprise web application for uploading, searching, and managing documents. The frontend is built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**. The design follows current UI trends with a warm neutral palette, indigo accents, and Plus Jakarta Sans typography.

**Planned Backend Flow:**
- **Upload:** User → FastAPI → MinIO → Database → Elasticsearch
- **Search:** User → FastAPI → Elasticsearch (via Kibana) → Database → MinIO → UI

---

## Backend Architecture (Stakeholder Requirements)

| Component | Purpose |
|-----------|---------|
| **Elasticsearch** | Index documents with **unique ID**; metadata + document content integration for full-text search |
| **Kibana Search** | Use Kibana for search — query Elasticsearch indices, build search dashboards |
| **MinIO** | File storage — stores actual document files (~3 crore / 30 million files) |
| **Database** | Document metadata and listing — department, type, date, status, etc. |
| **Index (Unique ID)** | Each document has a unique ID in Elasticsearch index; links metadata, content, and MinIO file reference |

**Integration Flow:**
- **Metadata + Document** — Index stores both metadata and extracted text for search
- **Database** — Maintains document listing and relational data
- **Elasticsearch** — Search engine; indexed by unique ID
- **Kibana** — Search interface; used to query and explore Elasticsearch data

---

## Shared Components

### Header (Navigation Bar)

Present on all pages except when explicitly overridden. Includes:

- **Logo (left)** — DMS branding, links to Dashboard
- **Search bar (center)** — Global search; submits navigate to Search Results
- **Profile icon (right)** — Links to Admin Indexing Dashboard
- **Back button** — On non-dashboard pages, returns to Dashboard

---

## Page-by-Page Description

---

### 1. Login Page  
**Route:** `/`  
**Purpose:** Entry point for authenticated access to the system.

**Elements:**
- DMS logo and title
- Username and password fields
- Sign in button
- “Secure Enterprise Access” footer
- Full header with search (users can search before logging in)

**User flow:** User enters credentials → Clicks Sign in → Redirected to Dashboard.

**Backend integration:** Will connect to authentication API (e.g., JWT/OAuth).

---

### 2. Dashboard Page  
**Route:** `/dashboard`  
**Purpose:** Main landing page after login; quick access to documents and search.

**Elements:**
- **Welcome section** — “Welcome back” with short description
- **Stats cards (4)** — Total Documents, Recent Uploaded, Today Viewed, Downloaded (clickable, link to filtered search)
- **Recent Searches** — Up to 5 recent search terms (newest first)
  - Click to re-run search
  - “Clear all” on the same line as the title
- **Recent Documents** — 6 document cards (title, date, department, type)
  - “View all” link to Search page
  - Click opens Document Preview

**User flow:** User sees overview → Clicks stat card or recent search for quick search → Clicks document for preview.

**Backend integration:** Stats, recent searches, and recent documents will come from APIs.

---

### 3. Search Results Page  
**Route:** `/search`  
**Purpose:** Search and filter documents.

**Elements:**
- **Left sidebar** — Filters:
  - Date Range (All Time, Today, Week, Month, Year)
  - Department
  - Document Type
  - Status
  - Clear Filters button
- **Main area** — Results header with:
  - Result count
  - Sort by (Relevance, Date, Title)
- **Results list** — Document cards with:
  - Title
  - Date, department, type
  - Snippet
  - Download button

**Behavior:**
- Search filters by title, department, type, and snippet
- Sidebar filters narrow results
- Empty state: “No data available” when no matches
- Clicking a result opens Document Preview

**User flow:** User enters query → Applies filters → Clicks result → Opens preview.

**Backend integration:** Search via Kibana/Elasticsearch; FastAPI queries Elasticsearch index (unique ID), enriches with Database metadata and MinIO file URLs.

---

### 4. Document Preview Page  
**Route:** `/document/:id`  
**Purpose:** View document details and metadata.

**Elements:**
- **Left (main content)** — Document viewer area (placeholder for PDF/Document viewer)
- **Right sidebar** — Metadata (sticky):
  - Title and description
  - Date
  - Department
  - Type
  - Status badge
  - Download button
  - Back to Results button

**User flow:** User opens from Search or Dashboard → Views document and metadata → Downloads or returns to results.

**Backend integration:** Will fetch document metadata from API and file from MinIO for preview/download.

---

### 5. Upload Page  
**Route:** `/upload`  
**Purpose:** Upload new documents with metadata.

**Elements:**
- **Drag & drop zone** — File upload (click or drag)
- **Metadata form** — Date, Department, Type, Status
- **Status feedback** — Processing, Successfully Indexed, or Failed
- **Actions** — Submit and Back to Admin

**User flow:** User selects/drops file → Fills metadata → Submits → Sees processing/success/failure.

**Backend integration:** Will send file and metadata to FastAPI; backend stores in MinIO, DB, and indexes in Elasticsearch.

---

### 6. Admin Indexing Dashboard  
**Route:** `/admin`  
**Purpose:** Admin view for uploads and indexing status.

**Elements:**
- **Header** — Title and “Upload Document” button
- **Stats cards (3)** — Indexed, Processing, Failed
- **Filters** — Status and Date
- **Table** — Columns:
  - File Name
  - Upload Time
  - Department
  - Status (Indexed / Processing / Failed)
  - Error Message (for failed items)

**User flow:** Admin monitors indexing → Clicks Upload Document for new uploads → Uses filters to inspect status.

**Backend integration:** Will fetch indexing status from API; status reflects Elasticsearch indexing pipeline.

---

## Navigation Summary

| From        | To              | Action                          |
|------------|------------------|---------------------------------|
| Login      | Dashboard        | Sign in                         |
| Dashboard  | Search           | Search bar, recent search, stat |
| Dashboard  | Document Preview | Recent document click          |
| Dashboard  | Admin            | Profile icon                    |
| Search     | Document Preview | Result click                    |
| Search     | Dashboard        | Back button                     |
| Document   | Search           | Back to Results                 |
| Admin      | Upload           | Upload Document button          |
| Upload     | Admin            | Back to Admin                   |

---

## Design System

- **Colors:** Indigo primary (#4f46e5), warm neutral background (#faf9f7)
- **Typography:** Plus Jakarta Sans
- **Components:** Rounded corners (xl/2xl), soft shadows, hover states
- **Responsive:** Layout adapts for mobile and desktop

---

## Current State & Next Steps

**Current:** Frontend prototype with mock data; all pages and flows implemented.

**Next steps for backend integration:**
1. FastAPI backend with upload and search endpoints
2. MinIO for file storage (~3 crore files scale)
3. Database for document listing and metadata
4. Elasticsearch — index with unique ID; metadata + document content integration
5. Kibana — use for search (query Elasticsearch indices)
6. Replace mock data with API calls in the frontend

---

*Document prepared for design approval. Please review and provide feedback.*
