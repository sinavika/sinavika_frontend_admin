/**
 * Admin modal - admin-modal-backdrop ve admin-modal yapısı
 * @param {Object} props
 * @param {string} props.title - Modal başlığı
 * @param {React.ReactNode} props.children - Modal içeriği (body)
 * @param {Function} props.onClose - Kapatma callback
 * @param {React.ReactNode} [props.footer] - Footer (butonlar vb.)
 * @param {string} [props.size] - "default" | "lg" | "xl"
 */
export default function AdminModal({ title, children, onClose, footer, size = "default" }) {
  const sizeClass = size === "lg" ? "admin-modal-lg" : size === "xl" ? "admin-modal-xl" : "";

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div
        className={`admin-modal ${sizeClass}`.trim()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-header">{title}</div>
        {children && <div className="admin-modal-body">{children}</div>}
        {footer && <div className="admin-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
