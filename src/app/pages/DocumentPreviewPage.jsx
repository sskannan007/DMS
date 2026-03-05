import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Download, FileText, Calendar, Building2, FileType, CheckCircle } from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { Container, Row, Col, Card, Button } from "react-bootstrap";

const mockDocument = {
  id: 1,
  title: "Annual Budget Report 2026",
  department: "Finance",
  date: "2026-03-01",
  type: "Report",
  status: "Active",
  description:
    "This comprehensive budget report outlines the financial allocations for all departments in fiscal year 2026, including detailed breakdowns of operational expenses and capital investments.",
};

export function DocumentPreviewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <AppLayout
      variant="back"
      showSearch={true}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onSearch={handleSearch}
    >
      <Container fluid className="container-page-padding">
        <Row className="g-4">
          <Col xs={12} lg={8}>
            <Card className="card-custom p-5 min-vh-100 border">
              <div
                className="d-flex align-items-center justify-content-center border border-2 border-dashed rounded-3"
                style={{ minHeight: "600px", borderColor: "var(--border)" }}
              >
                <div className="text-center">
                  <FileText size={96} className="text-muted mb-3" />
                  <p className="h5 fw-medium mb-2" style={{ color: "var(--foreground)" }}>
                    Document Preview
                  </p>
                  <p className="small text-muted mb-0">PDF/Document viewer would be displayed here</p>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={12} lg={4}>
            <Card className="card-custom p-4 sticky-top border" style={{ top: "6rem" }}>
              <Card.Body>
                <h2 className="h5 fw-semibold mb-3" style={{ color: "var(--foreground)" }}>
                  {mockDocument.title}
                </h2>
                <p className="small text-muted mb-4">{mockDocument.description}</p>

                <div className="border-top pt-4 mb-4">
                  <div className="d-flex gap-3 mb-3">
                    <Calendar size={20} className="text-muted flex-shrink-0 mt-1" />
                    <div>
                      <div className="small text-muted">Date</div>
                      <div className="small fw-medium">{mockDocument.date}</div>
                    </div>
                  </div>
                  <div className="d-flex gap-3 mb-3">
                    <Building2 size={20} className="text-muted flex-shrink-0 mt-1" />
                    <div>
                      <div className="small text-muted">Department</div>
                      <div className="small fw-medium">{mockDocument.department}</div>
                    </div>
                  </div>
                  <div className="d-flex gap-3 mb-3">
                    <FileType size={20} className="text-muted flex-shrink-0 mt-1" />
                    <div>
                      <div className="small text-muted">Type</div>
                      <div className="small fw-medium">{mockDocument.type}</div>
                    </div>
                  </div>
                  <div className="d-flex gap-3">
                    <CheckCircle size={20} className="text-muted flex-shrink-0 mt-1" />
                    <div>
                      <div className="small text-muted">Status</div>
                      <span className="badge badge-indexed">{mockDocument.status}</span>
                    </div>
                  </div>
                </div>

                <div className="border-top pt-4 d-flex flex-column gap-2">
                  <Button variant="primary" className="d-flex align-items-center justify-content-center gap-2">
                    <Download size={16} />
                    Download
                  </Button>
                  <Button variant="outline-primary" onClick={() => navigate(-1)}>
                    Back
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </AppLayout>
  );
}
