import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Download, FileText, Calendar, FileType } from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { SearchBar } from "../components/SearchBar";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { getDocumentById } from "../data/filesManifest";
import { addRecentDocument } from "../utils/recentDocuments";

export function DocumentPreviewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const doc = getDocumentById(id ? decodeURIComponent(id) : "");

  useEffect(() => {
    if (doc) addRecentDocument(doc);
  }, [id]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  if (!doc) {
    return (
      <AppLayout variant="back" showSearch={true}>
        <Container fluid className="container-page-padding document-preview-page">
          <Card className="card-custom p-5 text-center">
            <FileText size={64} className="text-muted mb-3" />
            <h3 className="h5 fw-semibold mb-2">Document not found</h3>
            <Button variant="primary" onClick={() => navigate("/search")}>
              Back to Search
            </Button>
          </Card>
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      variant="back"
      showSearch={true}
      headerSearchMobile={false}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onSearch={handleSearch}
    >
      <Container fluid className="container-page-padding document-preview-page">
        <div className="mb-4 d-md-none">
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearch={handleSearch}
          />
        </div>
        <Row className="g-4">
          <Col xs={12} lg={8}>
            <Card className="card-custom doc-review p-5 min-vh-100 border">
              <div
                className="d-flex align-items-center justify-content-center border border-2 border-dashed rounded-3"
                style={{ minHeight: "600px", borderColor: "var(--border)" }}
              >
                <iframe
                  src={doc.url}
                  title={doc.title}
                  className="w-100 h-100"
                  style={{ minHeight: "600px", border: "none" }}
                />
              </div>
            </Card>
          </Col>

          <Col xs={12} lg={4}>
            <Card className="card-custom p-4 sticky-top border" style={{ top: "6rem" }}>
              <Card.Body>
                <h2 className="h5 fw-semibold mb-3" style={{ color: "var(--foreground)" }}>
                  {doc.title}
                </h2>

                <div className="border-top pt-4 mb-4">
                  <div className="d-flex gap-3 mb-3">
                    <Calendar size={20} className="text-muted flex-shrink-0 mt-1" />
                    <div>
                      <div className="small text-muted">Year</div>
                      <div className="small fw-medium">{doc.date ? doc.date.slice(0, 4) : "-"}</div>
                    </div>
                  </div>
                  <div className="d-flex gap-3 mb-3">
                    <FileType size={20} className="text-muted flex-shrink-0 mt-1" />
                    <div>
                      <div className="small text-muted">Type</div>
                      <div className="small fw-medium">{doc.type}</div>
                    </div>
                  </div>
                </div>

                <div className="border-top pt-4 d-flex flex-column gap-2">
                  <a
                    href={doc.url}
                    download={doc.filename}
                    className="btn btn-primary d-flex align-items-center justify-content-center gap-2"
                  >
                    <Download size={16} />
                    Download
                  </a>
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
