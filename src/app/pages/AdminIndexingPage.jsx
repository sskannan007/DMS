import { useState } from "react";
import { useNavigate } from "react-router";
import { FileText, Filter, Upload, CheckCircle, Loader2, XCircle } from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { Container, Row, Col, Card, Button, Table, Form } from "react-bootstrap";

const mockIndexedDocuments = [
  { id: 1, fileName: "annual-budget-2026.pdf", uploadTime: "2026-03-03 09:15:22", department: "Finance", status: "indexed" },
  { id: 2, fileName: "marketing-campaign-q4.pdf", uploadTime: "2026-03-03 08:42:11", department: "Marketing", status: "indexed" },
  { id: 3, fileName: "employee-onboarding.docx", uploadTime: "2026-03-03 08:30:45", department: "HR", status: "processing" },
  { id: 4, fileName: "license-agreement.pdf", uploadTime: "2026-03-03 07:55:33", department: "Legal", status: "indexed" },
  { id: 5, fileName: "product-roadmap-q1.pdf", uploadTime: "2026-03-03 07:20:18", department: "Product", status: "indexed" },
  { id: 6, fileName: "security-policy-update.pdf", uploadTime: "2026-03-03 06:45:52", department: "IT", status: "failed", errorMessage: "Unable to extract text from document" },
  { id: 7, fileName: "client-proposal-digital.pdf", uploadTime: "2026-03-03 06:12:39", department: "Sales", status: "indexed" },
  { id: 8, fileName: "performance-review-template.xlsx", uploadTime: "2026-03-03 05:38:21", department: "HR", status: "processing" },
  { id: 9, fileName: "quarterly-report.pdf", uploadTime: "2026-03-03 05:05:14", department: "Finance", status: "indexed" },
  { id: 10, fileName: "training-materials.pptx", uploadTime: "2026-03-03 04:22:47", department: "HR", status: "failed", errorMessage: "File format not supported" },
];

export function AdminIndexingPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const getStatusBadge = (status) => {
    const variant = status === "indexed" ? "badge-indexed" : status === "processing" ? "badge-processing" : "badge-failed";
    return (
      <span className={`badge rounded-pill ${variant}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredDocuments = mockIndexedDocuments.filter((doc) => {
    if (statusFilter !== "all" && doc.status !== statusFilter) return false;
    return true;
  });

  const stats = {
    indexed: mockIndexedDocuments.filter((d) => d.status === "indexed").length,
    processing: mockIndexedDocuments.filter((d) => d.status === "processing").length,
    failed: mockIndexedDocuments.filter((d) => d.status === "failed").length,
  };

  return (
    <AppLayout variant="back" showSearch={false}>
      <Container fluid className="container-page-padding">
        <div className="admin-header d-flex flex-column flex-md-row align-items-stretch align-items-md-start justify-content-between gap-3 gap-md-4 mb-4 mb-md-5">
          <div>
            <h1 className="admin-title fw-bold mb-1" style={{ color: "var(--foreground)" }}>
              Admin Indexing Dashboard
            </h1>
            <p className="text-muted mb-0 small">Upload documents and monitor indexing status</p>
          </div>
          <Button
            variant="primary"
            className="d-flex align-items-center justify-content-center gap-2 admin-upload-btn"
            onClick={() => navigate("/upload")}
          >
            <Upload size={20} />
            Upload Document
          </Button>
        </div>

        <Row className="g-3 g-md-4 mb-3 mb-md-4 admin-stats-row">
          <Col xs={12} sm={6} md={4}>
            <Card className="card-custom p-3 p-md-4 border admin-stat-card">
              <div className="d-flex align-items-center gap-2 gap-md-3">
                <div className="p-2 rounded-3 bg-success bg-opacity-25 text-success flex-shrink-0">
                  <CheckCircle size={20} />
                </div>
                <div className="min-w-0">
                  <div className="admin-stat-count fw-bold mb-0">{stats.indexed}</div>
                  <div className="small text-muted">Indexed</div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Card className="card-custom p-3 p-md-4 border admin-stat-card">
              <div className="d-flex align-items-center gap-2 gap-md-3">
                <div className="p-2 rounded-3 bg-warning bg-opacity-25 text-warning flex-shrink-0">
                  <Loader2 size={20} />
                </div>
                <div className="min-w-0">
                  <div className="admin-stat-count fw-bold mb-0">{stats.processing}</div>
                  <div className="small text-muted">Processing</div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Card className="card-custom p-3 p-md-4 border admin-stat-card">
              <div className="d-flex align-items-center gap-2 gap-md-3">
                <div className="p-2 rounded-3 bg-danger bg-opacity-25 text-danger flex-shrink-0">
                  <XCircle size={20} />
                </div>
                <div className="min-w-0">
                  <div className="admin-stat-count fw-bold mb-0">{stats.failed}</div>
                  <div className="small text-muted">Failed</div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <Card className="card-custom p-3 p-md-4 mb-3 mb-md-4 border admin-filters-card">
          <div className="admin-filters d-flex flex-column flex-md-row flex-wrap align-items-stretch align-items-md-center gap-3 gap-md-4">
            <div className="d-flex align-items-center gap-2">
              <Filter size={16} className="text-muted flex-shrink-0" />
              <span className="small fw-medium">Filters:</span>
            </div>
            <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2 flex-grow-1">
              <div className="d-flex align-items-center gap-2">
                <Form.Label htmlFor="status-filter" className="small text-muted mb-0 flex-shrink-0" style={{ minWidth: "3.5rem" }}>
                  Status:
                </Form.Label>
                <Form.Select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  size="sm"
                  className="flex-grow-1 flex-sm-grow-0"
                  style={{ minWidth: "7rem" }}
                >
                  <option value="all">All</option>
                  <option value="indexed">Indexed</option>
                  <option value="processing">Processing</option>
                  <option value="failed">Failed</option>
                </Form.Select>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Form.Label htmlFor="date-filter" className="small text-muted mb-0 flex-shrink-0" style={{ minWidth: "3.5rem" }}>
                  Date:
                </Form.Label>
                <Form.Select
                  id="date-filter"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  size="sm"
                  className="flex-grow-1 flex-sm-grow-0"
                  style={{ minWidth: "7rem" }}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </Form.Select>
              </div>
            </div>
            <div className="small text-muted">
              <span className="fw-semibold" style={{ color: "var(--foreground)" }}>
                {filteredDocuments.length}
              </span>{" "}
              documents
            </div>
          </div>
        </Card>

        <Card className="card-custom border overflow-hidden admin-table-card">
          <Table responsive hover className="mb-0 d-none d-md-table">
            <thead>
              <tr className="bg-light">
                <th className="text-uppercase small fw-medium text-muted">File Name</th>
                <th className="text-uppercase small fw-medium text-muted">Upload Time</th>
                <th className="text-uppercase small fw-medium text-muted">Department</th>
                <th className="text-uppercase small fw-medium text-muted">Status</th>
                <th className="text-uppercase small fw-medium text-muted">Error Message</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <FileText size={16} style={{ color: "var(--primary)" }} />
                      <span className="small fw-medium">{doc.fileName}</span>
                    </div>
                  </td>
                  <td className="small text-muted">{doc.uploadTime}</td>
                  <td className="small text-muted">{doc.department}</td>
                  <td>{getStatusBadge(doc.status)}</td>
                  <td className="small text-danger">{doc.errorMessage || "-"}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="d-md-none admin-mobile-list">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="admin-mobile-item d-flex flex-column gap-2 p-3 border-bottom"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="d-flex align-items-start gap-2">
                  <FileText size={18} className="flex-shrink-0 mt-1" style={{ color: "var(--primary)" }} />
                  <div className="min-w-0 flex-grow-1">
                    <div className="small fw-medium text-break" style={{ color: "var(--foreground)" }}>
                      {doc.fileName}
                    </div>
                    <div className="small text-muted mt-1">{doc.uploadTime}</div>
                  </div>
                  {getStatusBadge(doc.status)}
                </div>
                <div className="d-flex flex-wrap gap-2 small">
                  <span className="badge bg-light text-dark">{doc.department}</span>
                  {doc.errorMessage && (
                    <span className="text-danger text-break">{doc.errorMessage}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </Container>
    </AppLayout>
  );
}
