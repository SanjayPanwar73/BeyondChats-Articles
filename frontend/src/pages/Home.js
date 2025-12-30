import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import ArticleCard from "../components/ArticleCard.js";

// Temporary fix: hardcode production URL
const API_BASE = "https://beyondchats-backend-1pir.onrender.com";
const API = `${API_BASE}/api/articles`;

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all, updated, not-updated
  const [currentPage, setCurrentPage] = useState(1);

  const fetchArticles = useCallback(async (page = 1, searchTerm = "", filterType = "all") => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "6"
      });

      if (searchTerm) params.append("search", searchTerm);
      if (filterType !== "all") params.append("isUpdated", filterType === "updated" ? "true" : "false");

      const res = await axios.get(`${API}?${params}`);
      setArticles(res.data.articles || []);
      setPagination(res.data.pagination || null);
    } catch (err) {
      setError("Failed to load articles. Please check backend connection.");
      console.error("Error fetching articles:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles(currentPage, search, filter);
  }, [currentPage, search, filter, fetchArticles]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchArticles(1, search, filter);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div style={{
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "20px",
      minHeight: "100vh",
      backgroundColor: "#f8fafc"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px"
      }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src="/RankWrite_logo.png" alt="RankWrite Logo" style={{ height: "50px", marginRight: "10px" }} />
          <h1 style={{
            margin: "0",
            color: "#1f2937",
            fontSize: "2.5rem",
            fontWeight: "bold"
          }}>
            BeyondChats Articles
          </h1>
        </div>

        <Link
          to="/create"
          style={{
            padding: "12px 24px",
            backgroundColor: "#10b981",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "600",
            transition: "background-color 0.2s",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px"
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = "#059669"}
          onMouseOut={(e) => e.target.style.backgroundColor = "#10b981"}
        >
          + Create New Article
        </Link>
      </div>

      {/* Search and Filter Section */}
      <div style={{
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        marginBottom: "30px"
      }}>
        <form onSubmit={handleSearch} style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                minWidth: "200px",
                padding: "12px",
                border: "2px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "16px",
                outline: "none",
                transition: "border-color 0.2s"
              }}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
            />
            <button
              type="submit"
              style={{
                padding: "12px 24px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "background-color 0.2s"
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = "#2563eb"}
              onMouseOut={(e) => e.target.style.backgroundColor = "#3b82f6"}
            >
              Search
            </button>
          </div>
        </form>

        {/* Filter Buttons */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {[
            { value: "all", label: "All Articles" },
            { value: "updated", label: "Updated" },
            { value: "not-updated", label: "Not Updated" }
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleFilterChange(value)}
              style={{
                padding: "8px 16px",
                backgroundColor: filter === value ? "#3b82f6" : "#f3f4f6",
                color: filter === value ? "white" : "#374151",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div style={{
            display: "inline-block",
            width: "40px",
            height: "40px",
            border: "4px solid #e5e7eb",
            borderTop: "4px solid #3b82f6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }}></div>
          <p style={{ marginTop: "20px", color: "#6b7280" }}>Loading articles...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{
          textAlign: "center",
          padding: "40px",
          backgroundColor: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "8px",
          color: "#dc2626"
        }}>
          <p style={{ fontSize: "18px", fontWeight: "500" }}>{error}</p>
          <button
            onClick={() => fetchArticles(currentPage, search, filter)}
            style={{
              marginTop: "10px",
              padding: "8px 16px",
              backgroundColor: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Articles Grid */}
      {!loading && !error && (
        <>
          {articles.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "60px 20px",
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
            }}>
              <p style={{ fontSize: "18px", color: "#6b7280" }}>
                {search || filter !== "all" ? "No articles match your search criteria." : "No articles found."}
              </p>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: "20px",
              marginBottom: "40px"
            }}>
              {articles.map(article => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px",
              marginTop: "40px",
              flexWrap: "wrap"
            }}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrev}
                style={{
                  padding: "10px 16px",
                  backgroundColor: pagination.hasPrev ? "#3b82f6" : "#e5e7eb",
                  color: pagination.hasPrev ? "white" : "#9ca3af",
                  border: "none",
                  borderRadius: "6px",
                  cursor: pagination.hasPrev ? "pointer" : "not-allowed",
                  fontWeight: "500"
                }}
              >
                Previous
              </button>

              <span style={{
                padding: "10px 16px",
                backgroundColor: "#f3f4f6",
                borderRadius: "6px",
                fontWeight: "500",
                color: "#374151"
              }}>
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNext}
                style={{
                  padding: "10px 16px",
                  backgroundColor: pagination.hasNext ? "#3b82f6" : "#e5e7eb",
                  color: pagination.hasNext ? "white" : "#9ca3af",
                  border: "none",
                  borderRadius: "6px",
                  cursor: pagination.hasNext ? "pointer" : "not-allowed",
                  fontWeight: "500"
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
