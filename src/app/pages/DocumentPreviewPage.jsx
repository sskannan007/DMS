import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { Download, FileText, Calendar, FileType, Loader2 } from "lucide-react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { AppLayout } from "../components/AppLayout";
import { SearchBar } from "../components/SearchBar";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { getDocumentById } from "../data/filesManifest";
import { addRecentDocument } from "../utils/recentDocuments";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";
import "@react-pdf-viewer/page-navigation/lib/styles/index.css";

export function DocumentPreviewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const doc = getDocumentById(id ? decodeURIComponent(id) : "");

  const zoomPluginRef = useRef(null);
  const pageNavPluginRef = useRef(null);
  if (!zoomPluginRef.current) zoomPluginRef.current = zoomPlugin();
  if (!pageNavPluginRef.current) pageNavPluginRef.current = pageNavigationPlugin();
  const zoomPluginInstance = zoomPluginRef.current;
  const pageNavigationPluginInstance = pageNavPluginRef.current;

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
          <Col xs={12} lg={8} className="order-2 order-lg-1">
            <Card className="card-custom doc-review p-3 border">
              <h5 className="doc-review-title">Document Preview</h5>
              <div
                className="d-flex flex-column rounded-3 overflow-hidden"
                style={{ minHeight: "600px", borderColor: "var(--border)" }}
              >
                <div
                  className="d-flex flex-wrap align-items-center justify-content-center gap-2 p-2 border-bottom"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
                >
                  <div className="d-flex align-items-center gap-1">
                    <zoomPluginInstance.ZoomOutButton />
                    <zoomPluginInstance.ZoomPopover />
                    <zoomPluginInstance.ZoomInButton />
                  </div>
                  <div className="d-flex align-items-center gap-1 ms-2">
                    <pageNavigationPluginInstance.GoToFirstPageButton />
                    <pageNavigationPluginInstance.GoToPreviousPageButton />
                    <div className="d-flex align-items-center gap-1">
                      <pageNavigationPluginInstance.CurrentPageInput />
                      <pageNavigationPluginInstance.CurrentPageLabel>
                        {(props) => (
                          <span className="text-muted small ms-1">
                            / {props.numberOfPages}
                          </span>
                        )}
                      </pageNavigationPluginInstance.CurrentPageLabel>
                    </div>
                    <pageNavigationPluginInstance.GoToNextPageButton />
                    <pageNavigationPluginInstance.GoToLastPageButton />
                  </div>
                </div>
                <Worker workerUrl="/pdf.worker.min.js">
                  <div className="pdf-viewer-container flex-grow-1" style={{ height: "550px", width: "100%", minHeight: "350px" }}>
                    <Viewer
                      fileUrl={doc.url}
                      plugins={[zoomPluginInstance, pageNavigationPluginInstance]}
                      renderLoader={(percentages) => (
                        <div className="d-flex flex-column align-items-center justify-content-center h-100 gap-2" style={{ minHeight: "400px" }}>
                          <Loader2 size={40} className="text-primary spinner-icon" />
                          <span className="small text-muted">
                            {percentages === 0 ? "Loading document..." : `Loading... ${Math.round(percentages)}%`}
                          </span>
                        </div>
                      )}
                    />
                  </div>
                </Worker>
              </div>
            </Card>
          </Col>

          <Col xs={12} lg={4} className="order-1 order-lg-2">
            <Card className="card-custom doc-title-card p-4 sticky-top border" style={{ top: "6rem" }}>
              <Card.Body>
                <h2 className="h5 fw-semibold mb-3 doc-title-right" style={{ color: "var(--foreground)" }}>
                  File Name: {doc.title}
                </h2>

                <div className="border-top pt-4 mb-4 d-flex flex-wrap align-items-center justify-content-center gap-4">
                  <div className="d-flex align-items-center gap-2">
                    <Calendar size={20} className="text-muted flex-shrink-0" />
                    <div className="text-center">
                      <div className="small text-muted">Year</div>
                      <div className="small fw-medium">{doc.date ? doc.date.slice(0, 4) : "-"}</div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <FileType size={20} className="text-muted flex-shrink-0" />
                    <div className="text-center">
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
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </AppLayout>
  );
}
