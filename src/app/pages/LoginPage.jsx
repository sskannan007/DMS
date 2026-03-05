import { useState } from "react";
import { useNavigate } from "react-router";
import { FileText } from "lucide-react";
import { Card, Form, Button } from "react-bootstrap";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center px-4"
      style={{ backgroundColor: "var(--background)" }}
    >
      <Card className="border shadow-lg w-100" style={{ maxWidth: "420px", borderRadius: "1rem" }}>
        <Card.Body className="p-5">
          <div className="d-flex flex-column align-items-center mb-4">
            <div
              className="p-4 rounded-3 mb-4 shadow"
              style={{ backgroundColor: "var(--primary)" }}
            >
              <FileText size={40} className="text-white" />
            </div>
            <h1 className="h4 fw-semibold mb-1 text-center" style={{ color: "var(--foreground)" }}>
              Document Management System
            </h1>
            <p className="small text-muted">Sign in to continue</p>
          </div>

          <Form onSubmit={handleLogin} className="d-flex flex-column gap-4">
            <Form.Group>
              <Form.Label className="fw-medium" style={{ color: "var(--foreground)" }}>
                Username
              </Form.Label>
              <Form.Control
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </Form.Group>

            <Form.Group>
              <Form.Label className="fw-medium" style={{ color: "var(--foreground)" }}>
                Password
              </Form.Label>
              <Form.Control
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </Form.Group>

            <Button type="submit" variant="primary" className="w-100 py-3 fw-medium">
              Sign in
            </Button>
          </Form>

          <p className="text-center small text-muted mt-4 mb-0">Secure Enterprise Access</p>
        </Card.Body>
      </Card>
    </div>
  );
}
