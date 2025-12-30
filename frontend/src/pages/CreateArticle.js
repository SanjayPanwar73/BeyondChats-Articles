import axios from "axios";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

// Temporary fix: hardcode production URL
const API_BASE = "https://beyondchats-backend-1pir.onrender.com";
const API = `${API_BASE}/api/articles`;

export default function CreateArticle() {
  const [formData, setFormData] = useState({
    title: "",
    originalContent: "",
    sourceUrl: "",
    references: [""]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      const res = await axios.post(API, dataToSend);
      navigate(`/article/${res.data.article._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create article. Please try again.");
      console.error("Error creating article:", err);
    } finally {
      setLoading(false);
    }
  };

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
            to="/"
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
            ← Back to Articles
          </Link>

          <h1 style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            color: "#111827",
            margin: "0"
          }}>
            Create New Article
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
              {loading ? "Creating..." : "Create Article"}
            </button>

            <Link
              to="/"
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