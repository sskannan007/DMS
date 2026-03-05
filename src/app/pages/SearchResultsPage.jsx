import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { FileText, Download, X, SearchX, SlidersHorizontal } from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { Container, Row, Col, Card, Form, Button, Modal } from "react-bootstrap";

const mockDocuments = [
  {
    id: 1,
    title: "Annual Budget Report 2026",
    department: "Finance",
    date: "2026-03-01",
    type: "Report",
    status: "Active",
    snippet:
      "This comprehensive budget report outlines the financial allocations for all departments in fiscal year 2026.",
  },
  {
    id: 2,
    title: "Marketing Campaign Analysis Q4 2025",
    department: "Marketing",
    date: "2026-02-28",
    type: "Analysis",
    status: "Active",
    snippet: "Detailed analysis of Q4 marketing campaigns showing ROI metrics and conversion data.",
  },
  {
    id: 3,
    title: "Employee Onboarding Guide",
    department: "HR",
    date: "2026-02-27",
    type: "Guide",
    status: "Active",
    snippet: "Complete onboarding guide for new employees including orientation schedules.",
  },
  {
    id: 4,
    title: "Software License Agreement - Enterprise Suite",
    department: "Legal",
    date: "2026-02-26",
    type: "Contract",
    status: "Active",
    snippet: "Enterprise software licensing agreement covering terms and conditions.",
  },
  {
    id: 5,
    title: "Product Roadmap Q1 2026",
    department: "Product",
    date: "2026-02-25",
    type: "Planning",
    status: "Active",
    snippet: "Strategic product development roadmap for Q1 2026.",
  },
  {
    id: 6,
    title: "Security Policy Update March 2026",
    department: "IT",
    date: "2026-02-24",
    type: "Policy",
    status: "Active",
    snippet: "Updated security policies addressing data protection.",
  },
  {
    id: 7,
    title: "Client Proposal - Digital Transformation",
    department: "Sales",
    date: "2026-02-23",
    type: "Proposal",
    status: "Active",
    snippet: "Comprehensive proposal for client digital transformation.",
  },
  {
    id: 8,
    title: "Quarterly Performance Review Template",
    department: "HR",
    date: "2026-02-22",
    type: "Template",
    status: "Active",
    snippet: "Standardized template for conducting quarterly performance reviews.",
  },
];

const departments = ["All Departments", "Finance", "Marketing", "HR", "Legal", "Product", "IT", "Sales"];
const documentTypes = ["All Types", "Report", "Analysis", "Guide", "Contract", "Planning", "Policy", "Proposal", "Template"];
const statuses = ["All Status", "Active", "Archived", "Draft"];

export function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [dateRange, setDateRange] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [sortBy, setSortBy] = useState("relevance");
  const [activeFilters, setActiveFilters] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const filteredDocuments = mockDocuments.filter((doc) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      doc.title.toLowerCase().includes(query) ||
      doc.department.toLowerCase().includes(query) ||
      doc.type.toLowerCase().includes(query) ||
      doc.snippet.toLowerCase().includes(query);
    const matchesDepartment = selectedDepartment === "All Departments" || doc.department === selectedDepartment;
    const matchesType = selectedType === "All Types" || doc.type === selectedType;
    const matchesStatus = selectedStatus === "All Status" || doc.status === selectedStatus;
    return matchesSearch && matchesDepartment && matchesType && matchesStatus;
  });

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    if (sortBy === "date") return b.date.localeCompare(a.date);
    if (sortBy === "title") return a.title.localeCompare(b.title);
    return 0;
  });

  const clearFilters = () => {
    setDateRange("all");
    setSelectedDepartment("All Departments");
    setSelectedType("All Types");
    setSelectedStatus("All Status");
    setActiveFilters([]);
  };

  const removeFilter = (filter) => {
    setActiveFilters(activeFilters.filter((f) => f !== filter));
  };

  return (
    <AppLayout
      variant="back"
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onSearch={handleSearch}
    >
      <Container fluid className="container-page-padding">
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
                  Department
                </h3>
                <Form.Select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="mb-4"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </Form.Select>

                <h3 className="h6 fw-semibold mb-3" style={{ color: "var(--foreground)" }}>
                  Document Type
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

                <h3 className="h6 fw-semibold mb-3" style={{ color: "var(--foreground)" }}>
                  Status
                </h3>
                <Form.Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="mb-4"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
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
                  {filteredDocuments.length} {filteredDocuments.length === 1 ? "Result" : "Results"}
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
                    onClick={() => navigate(`/document/${doc.id}`)}
                  >
                    <Card.Body className="p-0">
                      <div className="d-flex justify-content-between gap-4">
                        <div className="flex-grow-1 min-w-0">
                          <h3 className="h5 fw-semibold mb-2" style={{ color: "var(--foreground)" }}>
                            {doc.title}
                          </h3>
                          <div className="small text-muted mb-2">
                            {doc.date} · {doc.department} · {doc.type}
                          </div>
                          <p className="small line-clamp-2 mb-0">{doc.snippet}</p>
                        </div>
                        <Button
                          variant="link"
                          className="p-2 flex-shrink-0 text-decoration-none"
                          style={{ color: "var(--primary)" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Download size={20} />
                        </Button>
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
              <Form.Label className="fw-semibold small">Department</Form.Label>
              <Form.Select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="mt-1"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </Form.Select>
            </div>
            <div className="mb-4">
              <Form.Label className="fw-semibold small">Document Type</Form.Label>
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
            <div className="mb-4">
              <Form.Label className="fw-semibold small">Status</Form.Label>
              <Form.Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="mt-1"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
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
