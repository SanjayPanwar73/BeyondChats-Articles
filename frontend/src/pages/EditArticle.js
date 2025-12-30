import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
const API = `${API_BASE}/api/articles`;

export default function EditArticle() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: "",
    originalContent: "",
    updatedContent: "",
    sourceUrl: "",
    references: [""],
    isUpdated: false
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await axios.get(`${API}/${id}`);
        const article = res.data;
        setFormData({
          title: article.title || "",
          originalContent: article.originalContent || "",
          updatedContent: article.updatedContent || "",
          sourceUrl: article.sourceUrl || "",
          references: article.references && article.references.length > 0 ? article.references : [""],
          isUpdated: article.isUpdated || false
        });
      } catch (err) {
        setError("Failed to load article for editing.");
        console.error("Error fetching article:", err);
      } finally {
        setFetchLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleReferenceChange = (index, value) => {
    const newReferences = [...formData.references];
    newReferences[index] = value;
    setFormData(prev => ({
      ...prev,
      references: newReferences
    }));
  };

  const addReference = () => {
    setFormData(prev => ({
      ...prev,
      references: [...prev.references, ""]
    }));
  };

  const removeReference = (index) => {
    if (formData.references.length > 1) {
      const newReferences = formData.references.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        references: newReferences
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Filter out empty references
    const filteredReferences = formData.references.filter(ref => ref.trim() !== "");

    const dataToSend = {
      ...formData,
      references: filteredReferences
    };

    try {
      await axios.put(`${API}/${id}`, dataToSend);
      navigate(`/article/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update article. Please try again.");
      console.error("Error updating article:", err);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
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

  if (error && !formData.title) {
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

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f8fafc",
      padding: "20px"
    }}>
      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        padding: "40px"
      }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <Link
            to={`/article/${id}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "#6b7280",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: "500",
              marginBottom: "20px",
              transition: "color 0.2s"
            }}
            onMouseOver={(e) => e.target.style.color = "#374151"}
            onMouseOut={(e) => e.target.style.color = "#6b7280"}
          >
            ← Back to Article
          </Link>

          <h1 style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            color: "#111827",
            margin: "0"
          }}>
            Edit Article
          </h1>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "24px",
            color: "#dc2626"
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px"
            }}>
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "16px",
                outline: "none",
                transition: "border-color 0.2s"
              }}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
              placeholder="Enter article title"
            />
          </div>

          {/* Original Content */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px"
            }}>
              Original Content *
            </label>
            <textarea
              name="originalContent"
              value={formData.originalContent}
              onChange={handleInputChange}
              required
              rows={8}
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "16px",
                outline: "none",
                transition: "border-color 0.2s",
                resize: "vertical",
                fontFamily: "inherit"
              }}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
              placeholder="Enter the original article content"
            />
          </div>

          {/* Updated Content */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px"
            }}>
              Updated Content
            </label>
            <textarea
              name="updatedContent"
              value={formData.updatedContent}
              onChange={handleInputChange}
              rows={8}
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "16px",
                outline: "none",
                transition: "border-color 0.2s",
                resize: "vertical",
                fontFamily: "inherit"
              }}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
              placeholder="Enter the updated/enhanced article content"
            />
          </div>

          {/* Is Updated Checkbox */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              cursor: "pointer"
            }}>
              <input
                type="checkbox"
                name="isUpdated"
                checked={formData.isUpdated}
                onChange={handleInputChange}
                style={{
                  width: "16px",
                  height: "16px",
                  cursor: "pointer"
                }}
              />
              Mark as Updated/Enhanced Article
            </label>
          </div>

          {/* Source URL */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px"
            }}>
              Source URL
            </label>
            <input
              type="url"
              name="sourceUrl"
              value={formData.sourceUrl}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "16px",
                outline: "none",
                transition: "border-color 0.2s"
              }}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
              placeholder="https://example.com/article"
            />
          </div>

          {/* References */}
          <div style={{ marginBottom: "32px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px"
            }}>
              References
            </label>
            {formData.references.map((ref, index) => (
              <div key={index} style={{
                display: "flex",
                gap: "8px",
                marginBottom: "8px",
                alignItems: "center"
              }}>
                <input
                  type="url"
                  value={ref}
                  onChange={(e) => handleReferenceChange(index, e.target.value)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "16px",
                    outline: "none",
                    transition: "border-color 0.2s"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                  onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  placeholder="https://example.com/reference"
                />
                {formData.references.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeReference(index)}
                    style={{
                      padding: "12px",
                      backgroundColor: "#dc2626",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "16px",
                      transition: "background-color 0.2s"
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = "#b91c1c"}
                    onMouseOut={(e) => e.target.style.backgroundColor = "#dc2626"}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addReference}
              style={{
                padding: "8px 16px",
                backgroundColor: "#f3f4f6",
                color: "#374151",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                transition: "background-color 0.2s"
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = "#e5e7eb"}
              onMouseOut={(e) => e.target.style.backgroundColor = "#f3f4f6"}
            >
              + Add Reference
            </button>
          </div>

          {/* Submit Button */}
          <div style={{ display: "flex", gap: "16px" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: "14px",
                backgroundColor: loading ? "#9ca3af" : "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background-color 0.2s"
              }}
              onMouseOver={(e) => {
                if (!loading) e.target.style.backgroundColor = "#2563eb";
              }}
              onMouseOut={(e) => {
                if (!loading) e.target.style.backgroundColor = "#3b82f6";
              }}
            >
              {loading ? "Updating..." : "Update Article"}
            </button>

            <Link
              to={`/article/${id}`}
              style={{
                padding: "14px 24px",
                backgroundColor: "#f3f4f6",
                color: "#374151",
                textDecoration: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                textAlign: "center",
                transition: "background-color 0.2s"
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = "#e5e7eb"}
              onMouseOut={(e) => e.target.style.backgroundColor = "#f3f4f6"}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}