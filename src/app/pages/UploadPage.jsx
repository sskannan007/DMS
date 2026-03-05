import { useState } from "react";
import { useNavigate } from "react-router";
import { FileText, Upload as UploadIcon, CheckCircle, XCircle, Loader } from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";

const departments = ["Finance", "Marketing", "HR", "Legal", "Product", "IT", "Sales", "Operations"];
const documentTypes = ["Report", "Analysis", "Guide", "Contract", "Planning", "Policy", "Proposal", "Template", "Memo"];
const statuses = ["Active", "Draft", "Review"];

export function UploadPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [fileName, setFileName] = useState("");
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [date, setDate] = useState("");
  const [department, setDepartment] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setFileName(files[0].name);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFileName(files[0].name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setUploadStatus("processing");
    setTimeout(() => {
      const success = Math.random() > 0.2;
      setUploadStatus(success ? "indexed" : "failed");
    }, 2000);
  };

  const getStatusIndicator = () => {
    switch (uploadStatus) {
      case "processing":
        return (
          <div className="alert alert-warning-custom d-flex align-items-center gap-2 mb-0">
            <Loader size={20} className="spinner-icon" />
            <span className="fw-medium">Processing...</span>
          </div>
        );
      case "indexed":
        return (
          <div className="alert alert-success-custom d-flex align-items-center gap-2 mb-0">
            <CheckCircle size={20} />
            <span className="fw-medium">Successfully Indexed</span>
          </div>
        );
      case "failed":
        return (
          <div className="alert alert-danger-custom d-flex align-items-center gap-2 mb-0">
            <XCircle size={20} />
            <span className="fw-medium">Upload Failed - Please try again</span>
          </div>
        );
      default:
        return null;
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
      <Container className="container-page-padding" style={{ maxWidth: "42rem" }}>
        <div className="mb-5">
          <h1 className="h3 h4-sm fw-bold mb-1" style={{ color: "var(--foreground)" }}>
            Upload Document
          </h1>
          <p className="text-muted">Add a new document to the system with metadata for indexing</p>
        </div>

        <Card className="card-custom border shadow-sm">
          <Card.Body className="p-5">
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4">
                <Form.Label className="fw-medium">Document File</Form.Label>
                <div
                  className={`drop-zone rounded-3 p-5 text-center ${isDragging ? "dragging" : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <UploadIcon size={48} className="text-muted mb-3" />
                  <p className="fw-medium mb-2" style={{ color: "var(--foreground)" }}>
                    Drag and drop your file here, or click to browse
                  </p>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="d-none"
                    id="file-upload"
                  />
                  <Form.Label
                    htmlFor="file-upload"
                    className="btn btn-primary cursor-pointer mb-0"
                  >
                    Choose File
                  </Form.Label>
                </div>
                {fileName && (
                  <div className="d-flex align-items-center gap-2 mt-3 small">
                    <FileText size={16} style={{ color: "var(--primary)" }} />
                    <span className="fw-medium">{fileName}</span>
                  </div>
                )}
              </Form.Group>

              <Row className="g-4 mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label htmlFor="date">Date</Form.Label>
                    <Form.Control
                      type="date"
                      id="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label htmlFor="department">Department</Form.Label>
                    <Form.Select
                      id="department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label htmlFor="type">Type</Form.Label>
                    <Form.Select
                      id="type"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      required
                    >
                      <option value="">Select Type</option>
                      {documentTypes.map((docType) => (
                        <option key={docType} value={docType}>
                          {docType}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label htmlFor="status">Status</Form.Label>
                    <Form.Select
                      id="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      required
                    >
                      <option value="">Select Status</option>
                      {statuses.map((stat) => (
                        <option key={stat} value={stat}>
                          {stat}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {uploadStatus !== "idle" && <div className="mb-4">{getStatusIndicator()}</div>}

              <div className="d-flex gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-grow-1"
                  disabled={!fileName || uploadStatus === "processing"}
                >
                  {uploadStatus === "processing" ? "Processing..." : "Submit"}
                </Button>
                <Button type="button" variant="outline-primary" onClick={() => navigate("/admin")}>
                  Back to Admin
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </AppLayout>
  );
}
