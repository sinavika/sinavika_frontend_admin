import AdminModal from "./AdminModal";

/**
 * Silme / onay modalı - tek butonla onay
 * @param {Object} props
 * @param {string} props.title - Modal başlığı (örn. "Kategoriyi Sil")
 * @param {string} props.message - Onay mesajı
 * @param {Function} props.onConfirm - Onay callback
 * @param {Function} props.onCancel - İptal callback
 * @param {boolean} [props.loading] - Yükleme durumu
 * @param {string} [props.confirmLabel] - Onay butonu metni (varsayılan: "Sil")
 * @param {string} [props.confirmVariant] - "danger" | "primary"
 */
export default function AdminConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
  loading = false,
  confirmLabel = "Sil",
  confirmVariant = "danger",
}) {
  const confirmClass =
    confirmVariant === "danger" ? "admin-btn admin-btn-danger" : "admin-btn admin-btn-primary";

  const footer = (
    <>
      <button type="button" onClick={onCancel} className="admin-btn admin-btn-secondary">
        İptal
      </button>
      <button type="button" onClick={onConfirm} disabled={loading} className={confirmClass}>
        {loading ? "İşleniyor…" : confirmLabel}
      </button>
    </>
  );

  return (
    <AdminModal title={title} onClose={onCancel} footer={footer}>
      <p className="text-slate-600">{message}</p>
    </AdminModal>
  );
}
