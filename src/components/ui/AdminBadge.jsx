/**
 * Durum etiketi - admin-badge sınıfları
 * @param {string} variant - "success" | "danger" | "warning" | "neutral"
 * @param {string} children - Etiket metni
 */
export default function AdminBadge({ variant = "neutral", children }) {
  const variantClass = {
    success: "admin-badge-success",
    danger: "admin-badge-danger",
    warning: "admin-badge-warning",
    neutral: "admin-badge-neutral",
  }[variant] || "admin-badge-neutral";

  return <span className={`admin-badge ${variantClass}`}>{children}</span>;
}
