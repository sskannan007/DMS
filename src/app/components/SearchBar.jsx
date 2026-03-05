import { Search } from "lucide-react";
import { Form, FormControl } from "react-bootstrap";
import { addRecentSearch } from "../utils/recentSearches";

export function SearchBar({ searchQuery, onSearchChange, onSearch, className = "", maxWidth = "36rem" }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery?.trim()) {
      addRecentSearch(searchQuery);
    }
    onSearch?.(e);
  };

  return (
    <Form onSubmit={handleSubmit} className={className} style={{ maxWidth }}>
      <div className="search-input-wrap position-relative">
        <Search
          className="search-icon position-absolute"
          size={20}
          style={{ left: "1rem", top: "50%", transform: "translateY(-50%)" }}
        />
        <FormControl
          type="text"
          value={searchQuery || ""}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Search documents, keywords, or metadata..."
          className="form-control search-control"
        />
      </div>
    </Form>
  );
}
