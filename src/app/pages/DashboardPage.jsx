import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { FileText, Clock, Upload, FileSignature, BarChart3 } from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { getRecentSearches, clearRecentSearches, initRecentSearchesIfEmpty } from "../utils/recentSearches";
import { Container, Row, Col, Card, Button } from "react-bootstrap";

const initialRecentSearches = [
  "Q4 Financial Reports",
  "Employee Handbook 2026",
  "Marketing Strategy",
  "Legal Contracts",
  "Project Proposals",
];

const quickFilters = [
  { name: "Total Documents", count: "24,570,342", icon: FileText },
  { name: "Recent Uploaded", count: "1,56,000", icon: Upload },
  { name: "Today Viewed", count: "89", icon: FileSignature },
  { name: "Downloaded", count: "234", icon: BarChart3 },
];

const recentDocuments = [
  { id: 1, title: "Annual Budget Report 2026", department: "Finance", date: "2026-03-01", type: "Report" },
  { id: 2, title: "Marketing Campaign Analysis", department: "Marketing", date: "2026-02-28", type: "Analysis" },
  { id: 3, title: "Employee Onboarding Guide", department: "HR", date: "2026-02-27", type: "Guide" },
  { id: 4, title: "Software License Agreement", department: "Legal", date: "2026-02-26", type: "Contract" },
  { id: 5, title: "Product Roadmap Q1", department: "Product", date: "2026-02-25", type: "Planning" },
  { id: 6, title: "Security Policy Update", department: "IT", date: "2026-02-24", type: "Policy" },
];

export function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState(() => getRecentSearches());
  const navigate = useNavigate();

  useEffect(() => {
    initRecentSearchesIfEmpty(initialRecentSearches);
    setRecentSearches(getRecentSearches());
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleRecentSearch = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleClearRecentSearches = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  return (
    <AppLayout searchQuery={searchQuery} onSearchChange={setSearchQuery} onSearch={handleSearch}>
      <Container fluid className="container-page-padding">
        <div className="mb-5 welcome-section">
          <h1 className="h3 h4-sm fw-bold mb-1" style={{ color: "var(--foreground)" }}>
            Welcome back
          </h1>
          <p className="text-muted">Quick access to your documents and recent activity</p>
        </div>

        <Row className="g-4 mb-5 quick-filter-row">
          {quickFilters.map((filter, index) => {
            const Icon = filter.icon;
            return (
              <Col key={index} xs={6} lg={3}>
                <Card
                  className="card-custom hii p-4 h-100 card-hover cursor-pointer border position-relative overflow-hidden"
                  onClick={() =>
                    navigate(`/search?filter=${filter.name.toLowerCase().replace(" ", "")}`)
                  }
                >
                  <div
                    className="quick-filter-corner-shape"
                    aria-hidden
                  />
                  <Card.Body className="p-0">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div
                        className="p-2 rounded-3"
                        style={{ backgroundColor: "rgba(79, 70, 229, 0.1)", color: "var(--primary)" }}
                      >
                        <Icon size={20} />
                      </div>
                    </div>
                    <div className="h5 fw-bold mb-1 quick-filter-count" style={{ color: "var(--foreground)" }}>
                      {filter.count}
                    </div>
                    <div className="small text-muted">{filter.name}</div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>

        <div className="mb-5">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center gap-2">
              <Clock size={20} style={{ color: "var(--primary)" }} />
              <h2 className="h5 fw-semibold mb-0" style={{ color: "var(--foreground)" }}>
                Recent Searches
              </h2>
            </div>
            {recentSearches.length > 0 && (
              <Button
                variant="link"
                className="small fw-medium text-muted text-decoration-none p-0"
                onClick={handleClearRecentSearches}
              >
                Clear all
              </Button>
            )}
          </div>
          <div className="d-flex flex-wrap gap-2">
            {recentSearches.map((search, index) => (
              <Button
                key={index}
                variant="outline-light"
                className="rounded-pill border shadow-sm"
                style={{ color: "var(--foreground)" }}
                onClick={() => handleRecentSearch(search)}
              >
                {search}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h2 className="h5 fw-semibold mb-0" style={{ color: "var(--foreground)" }}>
              Recent Documents
            </h2>
            <Button
              variant="link"
              className="small fw-medium p-0 text-decoration-none"
              style={{ color: "var(--primary)" }}
              onClick={() => navigate("/search")}
            >
              View all
            </Button>
          </div>
          <Row className="g-4">
            {recentDocuments.map((doc) => (
              <Col key={doc.id} xs={12} sm={6} lg={4}>
                <Card
                  className="card-custom p-3 p-sm-4 h-100 card-hover cursor-pointer border"
                  onClick={() => navigate(`/document/${doc.id}`)}
                >
                  <Card.Body className="p-0 overflow-hidden">
                    <div className="d-flex gap-2 gap-sm-3 align-items-start">
                      <div
                        className="p-2 p-sm-3 rounded-3 flex-shrink-0"
                        style={{ backgroundColor: "rgba(79, 70, 229, 0.1)" }}
                      >
                        <FileText size={20} style={{ color: "var(--primary)" }} />
                      </div>
                      <div className="flex-grow-1 min-w-0 overflow-hidden">
                        <h3 className="fw-semibold mb-2 line-clamp-2" style={{ color: "var(--foreground)", fontSize: "clamp(1rem, 2.5vw, 1.5rem)" }}>
                          {doc.title}
                        </h3>
                        <div className="d-flex flex-wrap align-items-center gap-1 gap-sm-2 small text-muted">
                          <span>{doc.date}</span>
                          <span>·</span>
                          <span className="badge bg-secondary">{doc.department}</span>
                          <span className="badge" style={{ backgroundColor: "rgba(79, 70, 229, 0.2)", color: "var(--primary)" }}>
                            {doc.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Container>
    </AppLayout>
  );
}
