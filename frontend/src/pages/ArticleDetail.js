import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
const API = `${API_BASE}/api/articles`;

export default function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/${id}`);
        setArticle(res.data);
      } catch (err) {
        setError("Failed to load article. Please check the URL and try again.");
        console.error("Error fetching article:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      try {
        setDeleteLoading(true);
        await axios.delete(`${API}/${id}`);
        navigate('/');
      } catch (err) {
        alert('Failed to delete article. Please try again.');
        console.error('Error deleting article:', err);
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f8fafc"
      }}>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px"
        }}>
          <div style={{
            width: "50px",
            height: "50px",
            border: "5px solid #e5e7eb",
            borderTop: "5px solid #3b82f6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }}></div>
          <p style={{ color: "#6b7280", fontSize: "16px" }}>Loading article...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        padding: "20px"
      }}>
        <div style={{
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
          maxWidth: "500px"
        }}>
          <h2 style={{ color: "#dc2626", marginBottom: "16px" }}>Error Loading Article</h2>
          <p style={{ color: "#6b7280", marginBottom: "24px" }}>{error}</p>
          <Link
            to="/"
            style={{
              display: "inline-block",
              padding: "12px 24px",
              backgroundColor: "#3b82f6",
              color: "white",
              textDecoration: "none",
              borderRadius: "8px",
              fontWeight: "500",
              transition: "background-color 0.2s"
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#2563eb"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#3b82f6"}
          >
            ← Back to Articles
          </Link>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        padding: "20px"
      }}>
        <div style={{
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
          maxWidth: "500px"
        }}>
          <h2 style={{ color: "#6b7280", marginBottom: "16px" }}>Article Not Found</h2>
          <p style={{ color: "#9ca3af", marginBottom: "24px" }}>
            The article you're looking for doesn't exist or may have been removed.
          </p>
          <Link
            to="/"
            style={{
              display: "inline-block",
              padding: "12px 24px",
              backgroundColor: "#3b82f6",
              color: "white",
              textDecoration: "none",
              borderRadius: "8px",
              fontWeight: "500",
              transition: "background-color 0.2s"
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#2563eb"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#3b82f6"}
          >
            ← Back to Articles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f8fafc",
      padding: "20px"
    }}>
      <div style={{
        maxWidth: "900px",
        margin: "0 auto",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{
          padding: "40px",
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: "#f8fafc"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px"
          }}>
            <Link
              to="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                color: "#6b7280",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "500",
                transition: "color 0.2s"
              }}
              onMouseOver={(e) => e.target.style.color = "#374151"}
              onMouseOut={(e) => e.target.style.color = "#6b7280"}
            >
              ← Back to Articles
            </Link>

            <div style={{ display: "flex", gap: "12px" }}>
              <Link
                to={`/edit/${id}`}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#f59e0b",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "background-color 0.2s"
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = "#d97706"}
                onMouseOut={(e) => e.target.style.backgroundColor = "#f59e0b"}
              >
                Edit Article
              </Link>

              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                style={{
                  padding: "8px 16px",
                  backgroundColor: deleteLoading ? "#9ca3af" : "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: deleteLoading ? "not-allowed" : "pointer",
                  transition: "background-color 0.2s"
                }}
                onMouseOver={(e) => {
                  if (!deleteLoading) e.target.style.backgroundColor = "#b91c1c";
                }}
                onMouseOut={(e) => {
                  if (!deleteLoading) e.target.style.backgroundColor = "#dc2626";
                }}
              >
                {deleteLoading ? "Deleting..." : "Delete Article"}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            {article.isUpdated ? (
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "6px 12px",
                backgroundColor: "#dcfce7",
                color: "#166534",
                fontSize: "12px",
                fontWeight: "600",
                borderRadius: "20px",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                ✓ Enhanced Article
              </span>
            ) : (
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "6px 12px",
                backgroundColor: "#fef3c7",
                color: "#92400e",
                fontSize: "12px",
                fontWeight: "600",
                borderRadius: "20px",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                Original Article
              </span>
            )}
          </div>

          <h1 style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            color: "#111827",
            lineHeight: "1.2",
            margin: "0 0 16px 0"
          }}>
            {article.title}
          </h1>

          <p style={{
            color: "#6b7280",
            fontSize: "14px",
            margin: "0"
          }}>
            Published on {formatDate(article.createdAt)}
            {article.updatedAt && article.updatedAt !== article.createdAt && (
              <span> • Updated on {formatDate(article.updatedAt)}</span>
            )}
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: "40px" }}>
          {/* Original Content */}
          <section style={{ marginBottom: "40px" }}>
            <h2 style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#111827",
              marginBottom: "20px",
              paddingBottom: "10px",
              borderBottom: "2px solid #e5e7eb"
            }}>
              Original Content
            </h2>
            <div style={{
              color: "#374151",
              lineHeight: "1.8",
              fontSize: "16px",
              whiteSpace: "pre-wrap"
            }}>
              {article.originalContent}
            </div>
          </section>

          {/* Enhanced Content */}
          {article.isUpdated && article.updatedContent && (
            <section style={{ marginBottom: "40px" }}>
              <h2 style={{
                fontSize: "1.5rem",
                fontWeight: "600",
                color: "#111827",
                marginBottom: "20px",
                paddingBottom: "10px",
                borderBottom: "2px solid #e5e7eb"
              }}>
                Enhanced Content
              </h2>
              <div style={{
                color: "#374151",
                lineHeight: "1.8",
                fontSize: "16px",
                whiteSpace: "pre-wrap",
                backgroundColor: "#f8fafc",
                padding: "24px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb"
              }}>
                {article.updatedContent}
              </div>
            </section>
          )}

          {/* References */}
          {article.isUpdated && article.references && article.references.length > 0 && (
            <section>
              <h2 style={{
                fontSize: "1.5rem",
                fontWeight: "600",
                color: "#111827",
                marginBottom: "20px",
                paddingBottom: "10px",
                borderBottom: "2px solid #e5e7eb"
              }}>
                References
              </h2>
              <div style={{
                backgroundColor: "#f0f9ff",
                border: "1px solid #bae6fd",
                borderRadius: "8px",
                padding: "24px"
              }}>
                <p style={{
                  color: "#0369a1",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "16px"
                }}>
                  This enhanced article was created using the following reference sources:
                </p>
                <ol style={{ paddingLeft: "20px" }}>
                  {article.references.map((ref, index) => (
                    <li key={index} style={{ marginBottom: "8px" }}>
                      <a
                        href={ref}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#0369a1",
                          textDecoration: "none",
                          fontWeight: "500",
                          transition: "color 0.2s"
                        }}
                        onMouseOver={(e) => e.target.style.color = "#0284c7"}
                        onMouseOut={(e) => e.target.style.color = "#0369a1"}
                      >
                        {ref}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
