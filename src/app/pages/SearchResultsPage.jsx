import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { FileText, Download, X, SearchX, SlidersHorizontal, Loader2 } from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { SearchBar } from "../components/SearchBar";
import { Container, Row, Col, Card, Form, Button, Modal } from "react-bootstrap";
import { documents, getDocumentById } from "../data/filesManifest";
import { searchDocuments } from "../api/search";

const documentTypes = ["All Types", "act", "GO", "judgements", "policy"];

export function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [dateRange, setDateRange] = useState("all");
  const [selectedType, setSelectedType] = useState("All Types");
  const [sortBy, setSortBy] = useState("relevance");
  const [activeFilters, setActiveFilters] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [apiResults, setApiResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearchQuery(q);
  }, [searchParams]);

  // Fetch from Elasticsearch API when search query or filters change
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setApiResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    searchDocuments({ query: q, type: selectedType, dateRange })
      .then((data) => {
        setApiResults(data);
      })
      .finally(() => setLoading(false));
  }, [searchQuery, selectedType, dateRange]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Local fallback: metadata-only filter (filename, title, type)
  const filteredDocumentsLocal = useMemo(() => {
    return documents.filter((doc) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        doc.title.toLowerCase().includes(query) ||
        doc.type.toLowerCase().includes(query) ||
        doc.filename.toLowerCase().includes(query);
      const matchesType = selectedType === "All Types" || doc.type === selectedType;
      const matchesDateRange =
        !doc.date ||
        dateRange === "all" ||
        (() => {
          const docDate = new Date(doc.date);
          const now = new Date();
          if (dateRange === "today") return docDate.toDateString() === now.toDateString();
          if (dateRange === "week") {
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return docDate >= weekAgo;
          }
          if (dateRange === "month") {
            const monthAgo = new Date(now);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return docDate >= monthAgo;
          }
          if (dateRange === "year") {
            const yearAgo = new Date(now);
            yearAgo.setFullYear(yearAgo.getFullYear() - 1);
            return docDate >= yearAgo;
          }
          return true;
        })();
      return matchesSearch && matchesType && matchesDateRange;
    });
  }, [searchQuery, selectedType, dateRange]);

  // Use API results when available, else local
  const displayDocs = useMemo(() => {
    if (apiResults && apiResults.results?.length >= 0) {
      return apiResults.results.map((r) => {
        const local = getDocumentById(r.id);
        return {
          ...r,
          url: local?.url,
          date: r.date || local?.date,
        };
      });
    }
    return filteredDocumentsLocal.map((doc) => ({ ...doc, highlights: [] }));
  }, [apiResults, filteredDocumentsLocal]);

  const sortedDocuments = useMemo(() => {
    return [...displayDocs].sort((a, b) => {
      if (sortBy === "date") return (b.date || "").localeCompare(a.date || "");
      if (sortBy === "title") return (a.title || "").localeCompare(b.title || "");
      return 0;
    });
  }, [displayDocs, sortBy]);

  const totalCount = apiResults?.total ?? filteredDocumentsLocal.length;

  const clearFilters = () => {
    setDateRange("all");
    setSelectedType("All Types");
    setActiveFilters([]);
  };

  const removeFilter = (filter) => {
    setActiveFilters(activeFilters.filter((f) => f !== filter));
  };

  return (
    <AppLayout
      variant="back"
      showSearch={true}
      headerSearchMobile={false}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onSearch={handleSearch}
    >
      <Container fluid className="container-page-padding">
        <div className="mb-4 d-md-none">
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearch={handleSearch}
          />
        </div>
        <Row className="g-4">
          <Col xs={12} md={3} lg={3} className="order-2 order-md-1 d-none d-md-block">
            <Card className="card-custom p-4 sticky-top" style={{ top: "6rem" }}>
              <Card.Body>
                <h3 className="h6 fw-semibold mb-3" style={{ color: "var(--foreground)" }}>
                  Date Range
                </h3>
                <Form.Select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="mb-4"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </Form.Select>

                <h3 className="h6 fw-semibold mb-3" style={{ color: "var(--foreground)" }}>
                  Document Type (File Type)
                </h3>
                <Form.Select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="mb-4"
                >
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Form.Select>

                <Button variant="outline-primary" className="w-100" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} md={9} lg={9} className="order-1 order-md-2">
            <Card className="card-custom p-4 mb-4">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                <span className="h5 fw-semibold mb-0" style={{ color: "var(--foreground)" }}>
                  {loading ? (
                    <span className="d-flex align-items-center gap-2">
                      <Loader2 size={20} className="text-primary spinner-icon" />
                      Searching...
                    </span>
                  ) : (
                    `${totalCount} ${totalCount === 1 ? "Result" : "Results"}`
                  )}
                </span>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="d-md-none d-flex align-items-center gap-1"
                    onClick={() => setShowFilterModal(true)}
                  >
                    <SlidersHorizontal size={16} />
                    Filter
                  </Button>
                  <span className="small text-muted">Sort by:</span>
                  <Form.Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{ width: "auto" }}
                  >
                    <option value="relevance">Relevance</option>
                    <option value="date">Date</option>
                    <option value="title">Title</option>
                  </Form.Select>
                </div>
              </div>
              {activeFilters.length > 0 && (
                <div className="d-flex flex-wrap gap-2">
                  {activeFilters.map((filter, index) => (
                    <span
                      key={index}
                      className="d-inline-flex align-items-center gap-1 px-3 py-1 rounded-pill small fw-medium"
                      style={{ backgroundColor: "rgba(79, 70, 229, 0.1)", color: "var(--primary)" }}
                    >
                      {filter}
                      <Button
                        variant="link"
                        className="p-0 ms-1 text-decoration-none"
                        onClick={() => removeFilter(filter)}
                      >
                        <X size={14} />
                      </Button>
                    </span>
                  ))}
                </div>
              )}
            </Card>

            <div className="d-flex flex-column gap-4">
              {sortedDocuments.length > 0 ? (
                sortedDocuments.map((doc) => (
                  <Card
                    key={doc.id}
                    className="card-custom p-4 card-hover border"
                    onClick={() => navigate(`/document/${encodeURIComponent(doc.id)}`)}
                  >
                    <Card.Body className="p-0">
                      <div className="d-flex justify-content-between gap-4">
                        <div className="flex-grow-1 min-w-0">
                          <h3 className="h5 fw-semibold mb-2" style={{ color: "var(--foreground)" }}>
                            {doc.title}
                          </h3>
                          <div className="small text-muted mb-0">
                            {doc.date ? `${doc.date.slice(0, 4)} · ` : ""}{doc.type}
                          </div>
                          {doc.highlights?.length > 0 && (
                            <div className="small text-muted mt-2" style={{ fontSize: "0.85rem" }}>
                              {doc.highlights.slice(0, 2).map((h, i) => (
                                <div
                                  key={i}
                                  className="mb-1"
                                  dangerouslySetInnerHTML={{
                                    __html: h.replace(/<em>/g, '<mark class="search-highlight">').replace(/<\/em>/g, "</mark>"),
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        {doc.url && (
                          <a
                            href={doc.url}
                            download={doc.filename}
                            className="p-2 flex-shrink-0 text-decoration-none d-inline-flex"
                            style={{ color: "var(--primary)" }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Download size={20} />
                          </a>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                ))
              ) : (
                <Card className="card-custom p-5 text-center">
                  <SearchX size={64} className="text-muted mx-auto mb-3" />
                  <h3 className="h5 fw-semibold mb-2" style={{ color: "var(--foreground)" }}>
                    No data available
                  </h3>
                  <p className="small text-muted mb-0 mx-auto" style={{ maxWidth: "24rem" }}>
                    {searchQuery.trim()
                      ? "No documents match your search. Try different keywords or clear the filters."
                      : "No documents match the selected filters. Try adjusting your filters."}
                  </p>
                </Card>
              )}
            </div>
          </Col>
        </Row>

        <Modal show={showFilterModal} onHide={() => setShowFilterModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Filters</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="mb-4">
              <Form.Label className="fw-semibold small">Date Range</Form.Label>
              <Form.Select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="mt-1"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </Form.Select>
            </div>
            <div className="mb-4">
              <Form.Label className="fw-semibold small">Document Type (File Type)</Form.Label>
              <Form.Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="mt-1"
              >
                {documentTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Form.Select>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-primary" className="flex-grow-1" onClick={clearFilters}>
                Clear Filters
              </Button>
              <Button variant="primary" className="flex-grow-1" onClick={() => setShowFilterModal(false)}>
                Apply
              </Button>
            </div>
          </Modal.Body>
        </Modal>
      </Container>
    </AppLayout>
  );
}
