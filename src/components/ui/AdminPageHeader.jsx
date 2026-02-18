/**
 * Sayfa başlığı - admin-page-header yapısını sarmalayan bileşen
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Lucide ikon bileşeni
 * @param {string} props.title - Başlık metni
 * @param {React.ReactNode} [props.action] - Sağ taraftaki buton/aksiyon (opsiyonel)
 */
export default function AdminPageHeader({ icon: Icon, title, action }) {
  return (
    <div className="admin-page-header">
      <h1 className="admin-page-title">
        {Icon && <Icon size={28} className="text-emerald-600" />}
        {title}
      </h1>
      {action && action}
    </div>
  );
}
