import { useNavigate } from "react-router";
import { ArrowLeft, FileText, Search, User } from "lucide-react";
import { Navbar, Container, Form, FormControl, Button } from "react-bootstrap";
import { addRecentSearch } from "../utils/recentSearches";

export function AppLayout({
  children,
  variant = "default",
  showSearch = true,
  headerSearchMobile = true,
  searchQuery = "",
  onSearchChange,
  onSearch,
  backLabel = "Back",
}) {
  const navigate = useNavigate();
  const isBack = variant === "back";
  const isCentered = variant === "centered";

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery);
    }
    onSearch?.(e);
  };

  const Logo = () => (
    <div className="logo-wrap">
      <div className="logo-icon shadow-sm">
        <FileText size={20} />
      </div>
      <span className="text-lg fw-semibold" style={{ color: "var(--foreground)" }}>
        DMS
      </span>
    </div>
  );

  return (
    <div className="min-vh-100" style={{ backgroundColor: "var(--background)" }}>
      <Navbar className="navbar sticky-top border-bottom" style={{ borderColor: "var(--border)" }}>
        <Container fluid className="px-4 px-sm-5 px-lg-5">
          <div className="d-flex align-items-center justify-content-between w-100" style={{ minHeight: "4rem" }}>
            {/* Left */}
            <div className="d-flex align-items-center gap-3 flex-shrink-0 min-w-0">
              {isBack && (
                <Button
                  variant="link"
                  className="d-flex align-items-center gap-2 text-decoration-none p-0 border-0 bg-transparent"
                  style={{ color: "var(--foreground)" }}
                  onClick={() => navigate("/dashboard")}
                >
                  <ArrowLeft size={20} />
                  <Logo />
                </Button>
              )}
              {isCentered && (
                <Button
                  variant="link"
                  className="d-flex align-items-center gap-2 text-decoration-none p-0 border-0 bg-transparent"
                  style={{ color: "var(--foreground)" }}
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft size={20} />
                  <span className="fw-medium">{backLabel}</span>
                </Button>
              )}
              {variant === "default" && (
                <Button
                  variant="link"
                  className="p-0 border-0 bg-transparent text-decoration-none"
                  onClick={() => navigate("/dashboard")}
                >
                  <Logo />
                </Button>
              )}
            </div>

            {/* Center - search (hidden on mobile when headerSearchMobile=false) */}
            {showSearch && (
              <Form
                onSubmit={handleSearch}
                className={`flex-grow-1 mx-4 mx-lg-5 ${!headerSearchMobile ? "d-none d-md-flex" : ""}`}
                style={{ maxWidth: "36rem" }}
              >
                <div className="search-input-wrap position-relative">
                  <Search
                    className="search-icon position-absolute"
                    size={20}
                    style={{ left: "1rem", top: "50%", transform: "translateY(-50%)" }}
                  />
                  <FormControl
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    placeholder="Search documents, keywords, or metadata..."
                    className="form-control search-control"
                  />
                </div>
              </Form>
            )}
            {isCentered && (
              <div className="flex-grow-1 d-flex justify-content-start ms-3">
                <Logo />
              </div>
            )}

            {/* Right - profile */}
            <div className="flex-shrink-0">
              <Button
                variant="link"
                className="profile-avatar p-0 d-flex align-items-center justify-content-center"
                onClick={() => navigate("/admin")}
                title="Profile"
              >
                <User size={20} />
              </Button>
            </div>
          </div>
        </Container>
      </Navbar>

      <main>{children}</main>
    </div>
  );
}
