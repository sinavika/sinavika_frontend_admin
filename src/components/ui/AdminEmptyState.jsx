/**
 * Boş liste durumu - admin-empty-state
 * @param {string} message - Gösterilecek mesaj
 */
export default function AdminEmptyState({ message = "Henüz kayıt bulunmuyor." }) {
  return <div className="admin-empty-state">{message}</div>;
}
