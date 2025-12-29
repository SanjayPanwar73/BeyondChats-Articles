import { Link } from "react-router-dom";

export default function ArticleCard({ article }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getContentPreview = (content) => {
    if (!content) return "No content available";
    return content.length > 150 ? content.slice(0, 150) + "..." : content;
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)",
        border: "1px solid #e5e7eb",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        cursor: "pointer",
        height: "100%",
        display: "flex",
        flexDirection: "column"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.07)";
      }}
    >
      {/* Status Badge */}
      <div style={{ marginBottom: "16px" }}>
        {article.isUpdated ? (
          <span
            style={{
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
            }}
          >
            ✓ Enhanced
          </span>
        ) : (
          <span
            style={{
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
            }}
          >
            Original
          </span>
        )}
      </div>

      {/* Title */}
      <h3 style={{
        margin: "0 0 12px 0",
        color: "#111827",
        fontSize: "18px",
        fontWeight: "600",
        lineHeight: "1.4",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden"
      }}>
        {article.title}
      </h3>

      {/* Content Preview */}
      <p style={{
        color: "#6b7280",
        fontSize: "14px",
        lineHeight: "1.6",
        margin: "0 0 16px 0",
        flex: 1,
        display: "-webkit-box",
        WebkitLineClamp: 3,
        WebkitBoxOrient: "vertical",
        overflow: "hidden"
      }}>
        {getContentPreview(article.updatedContent || article.originalContent)}
      </p>

      {/* Metadata */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "auto",
        paddingTop: "16px",
        borderTop: "1px solid #f3f4f6"
      }}>
        <span style={{
          color: "#9ca3af",
          fontSize: "12px",
          fontWeight: "500"
        }}>
          {formatDate(article.createdAt)}
        </span>

        <Link
          to={`/article/${article._id}`}
          style={{
            color: "#3b82f6",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: "600",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            transition: "color 0.2s ease"
          }}
          onMouseEnter={(e) => e.target.style.color = "#1d4ed8"}
          onMouseLeave={(e) => e.target.style.color = "#3b82f6"}
        >
          Read More
          <span style={{ fontSize: "16px" }}>→</span>
        </Link>
      </div>

      {/* References indicator */}
      {article.isUpdated && article.references && article.references.length > 0 && (
        <div style={{
          marginTop: "12px",
          padding: "8px 12px",
          backgroundColor: "#f0f9ff",
          borderRadius: "6px",
          border: "1px solid #bae6fd"
        }}>
          <span style={{
            color: "#0369a1",
            fontSize: "12px",
            fontWeight: "500"
          }}>
            📚 {article.references.length} reference{article.references.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
}
