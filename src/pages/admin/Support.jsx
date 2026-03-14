import { useEffect, useState, useCallback } from "react";
import { Headphones, ChevronRight, X, RefreshCw, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import {
  getSupportTickets,
  getSupportTicketById,
  updateSupportTicketStatus,
} from "@/services/adminSupportService";
import { ERROR_MESSAGES } from "@/constants";

const getApiError = (err) =>
  err?.response?.data?.Error ||
  err?.response?.data?.error ||
  err?.message ||
  ERROR_MESSAGES.FETCH_FAILED;

const SUPPORT_STATUS = [
  { value: 0, label: "Destek alındı" },
  { value: 1, label: "İletişime geçildi" },
  { value: 2, label: "İlgili birime aktarıldı" },
  { value: 3, label: "Çözüm bekleniyor" },
  { value: 4, label: "Belge bekleniyor" },
  { value: 5, label: "İade talebi" },
  { value: 6, label: "Tamamlandı" },
  { value: 7, label: "Kapatıldı" },
];

const PAGE_SIZE = 20;

const formatDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  return date.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Support = () => {
  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ status: 0, adminNotes: "" });

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSupportTickets(page * PAGE_SIZE, PAGE_SIZE);
      setItems(Array.isArray(data?.items) ? data.items : []);
      setTotalCount(Number(data?.totalCount) ?? 0);
    } catch (err) {
      toast.error(getApiError(err));
      setItems([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const openDetail = async (ticket) => {
    setSelectedTicket(ticket);
    setModal("detail");
    setForm({ status: ticket?.status ?? 0, adminNotes: ticket?.adminNotes ?? "" });
    setDetailLoading(true);
    try {
      const full = await getSupportTicketById(ticket.id);
      setSelectedTicket(full);
      setForm((f) => ({
        ...f,
        status: full?.status ?? 0,
        adminNotes: full?.adminNotes ?? "",
      }));
    } catch (err) {
      toast.error(getApiError(err));
      setModal(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedTicket?.id) return;
    setSubmitting(true);
    try {
      const updated = await updateSupportTicketStatus(selectedTicket.id, {
        status: form.status,
        adminNotes: form.adminNotes?.trim() || undefined,
      });
      setSelectedTicket(updated);
      toast.success("Talep durumu güncellendi.");
      loadTickets();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusLabel = (status) =>
    SUPPORT_STATUS.find((s) => s.value === status)?.label ?? status;

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const hasPrev = page > 0;
  const hasNext = page < totalPages - 1;

  return (
    <div className="support-page p-4 sm:p-6 md:p-8">
      <div className="admin-page-header admin-page-header-gradient mb-6 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="admin-page-title text-slate-800">
            <Headphones size={28} className="text-sky-600" aria-hidden />
            Destek Merkezi
          </h1>
          <button
            type="button"
            className="admin-btn admin-btn-secondary flex items-center gap-2 w-fit"
            onClick={loadTickets}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Yenile
          </button>
        </div>
        <p className="text-sm text-slate-600 mt-1">
          Destek taleplerini görüntüleyin, detay alın ve durum güncelleyin.
        </p>
      </div>

      <div className="admin-card rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="font-semibold text-slate-700">Talepler</span>
          <span className="text-sm text-slate-500">Toplam {totalCount} talep</span>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="admin-loading-center py-16">
              <span className="admin-spinner" />
            </div>
          ) : items.length === 0 ? (
            <div className="admin-empty-state py-12 px-6">
              <MessageSquare size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">Henüz destek talebi yok.</p>
            </div>
          ) : (
            <>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Konu</th>
                    <th>E-posta</th>
                    <th>Ad</th>
                    <th className="w-40">Durum</th>
                    <th className="w-36">Tarih</th>
                    <th className="w-12" aria-label="Detay" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="cursor-pointer hover:bg-sky-50/50 transition-colors"
                      onClick={() => openDetail(ticket)}
                    >
                      <td>
                        <span className="font-medium text-slate-800 truncate block max-w-[200px]" title={ticket.subject}>
                          {ticket.subject || "—"}
                        </span>
                      </td>
                      <td className="text-slate-600 text-sm">{ticket.email || "—"}</td>
                      <td className="text-slate-600 text-sm">{ticket.name || "—"}</td>
                      <td>
                        <span
                          className={`admin-badge ${
                            ticket.status === 6 || ticket.status === 7
                              ? "admin-badge-success"
                              : ticket.status === 0
                                ? "admin-badge-warning"
                                : "admin-badge-neutral"
                          }`}
                        >
                          {getStatusLabel(ticket.status)}
                        </span>
                      </td>
                      <td className="text-slate-500 text-sm whitespace-nowrap">
                        {formatDate(ticket.createdAt)}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="admin-btn admin-btn-ghost admin-btn-icon text-sky-600 hover:bg-sky-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetail(ticket);
                          }}
                          title="Detay"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
                  <p className="text-sm text-slate-500">
                    Sayfa {page + 1} / {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={!hasPrev}
                    >
                      Önceki
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary"
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={!hasNext}
                    >
                      Sonraki
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {modal === "detail" && selectedTicket && (
        <div
          className="admin-modal-backdrop"
          onClick={() => !submitting && setModal(null)}
        >
          <div
            className="admin-modal admin-modal-lg max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header flex items-center justify-between shrink-0">
              <span className="flex items-center gap-2">
                <Headphones size={20} className="text-sky-600" />
                Talep detayı
              </span>
              <button
                type="button"
                className="admin-btn admin-btn-icon admin-btn-ghost"
                onClick={() => !submitting && setModal(null)}
                aria-label="Kapat"
              >
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body overflow-y-auto flex-1 space-y-4">
              {detailLoading ? (
                <div className="py-8 flex justify-center">
                  <span className="admin-spinner" />
                </div>
              ) : (
                <>
                  <div className="rounded-lg border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <td className="px-4 py-2 font-medium text-slate-500 w-32">Konu</td>
                          <td className="px-4 py-2 text-slate-800">{selectedTicket.subject || "—"}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="px-4 py-2 font-medium text-slate-500">Mesaj</td>
                          <td className="px-4 py-2 text-slate-800 whitespace-pre-wrap">{selectedTicket.message || "—"}</td>
                        </tr>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <td className="px-4 py-2 font-medium text-slate-500">E-posta</td>
                          <td className="px-4 py-2 text-slate-800">{selectedTicket.email || "—"}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="px-4 py-2 font-medium text-slate-500">Ad</td>
                          <td className="px-4 py-2 text-slate-800">{selectedTicket.name || "—"}</td>
                        </tr>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <td className="px-4 py-2 font-medium text-slate-500">Telefon</td>
                          <td className="px-4 py-2 text-slate-800">{selectedTicket.phone || "—"}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="px-4 py-2 font-medium text-slate-500">Durum</td>
                          <td className="px-4 py-2">
                            <span className="admin-badge admin-badge-neutral">
                              {getStatusLabel(selectedTicket.status)}
                            </span>
                          </td>
                        </tr>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <td className="px-4 py-2 font-medium text-slate-500">Oluşturulma</td>
                          <td className="px-4 py-2 text-slate-800">{formatDate(selectedTicket.createdAt)}</td>
                        </tr>
                        {selectedTicket.updatedAt && (
                          <tr className="border-b border-slate-200">
                            <td className="px-4 py-2 font-medium text-slate-500">Son güncelleme</td>
                            <td className="px-4 py-2 text-slate-800">{formatDate(selectedTicket.updatedAt)}</td>
                          </tr>
                        )}
                        {selectedTicket.adminNotes && (
                          <tr className="bg-amber-50/50 border-b border-slate-200">
                            <td className="px-4 py-2 font-medium text-slate-600">Admin notu</td>
                            <td className="px-4 py-2 text-slate-700 whitespace-pre-wrap">{selectedTicket.adminNotes}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <form onSubmit={handleUpdateStatus} className="border-t border-slate-200 pt-4">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Durum güncelle</h3>
                    <div className="admin-form-group">
                      <label className="admin-label admin-label-required">Durum</label>
                      <select
                        className="admin-input"
                        value={form.status}
                        onChange={(e) => setForm((f) => ({ ...f, status: Number(e.target.value) }))}
                        required
                      >
                        {SUPPORT_STATUS.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Admin notu (iç not, talep sahibine gösterilmez)</label>
                      <textarea
                        className="admin-input min-h-[80px]"
                        value={form.adminNotes ?? ""}
                        onChange={(e) => setForm((f) => ({ ...f, adminNotes: e.target.value }))}
                        placeholder="İsteğe bağlı not..."
                        rows={3}
                      />
                    </div>
                    <div className="admin-modal-footer px-0 pb-0">
                      <button
                        type="button"
                        className="admin-btn admin-btn-secondary"
                        onClick={() => setModal(null)}
                        disabled={submitting}
                      >
                        Kapat
                      </button>
                      <button
                        type="submit"
                        className="admin-btn admin-btn-primary"
                        disabled={submitting}
                      >
                        {submitting ? <span className="admin-spinner w-5 h-5 border-2" /> : "Durumu kaydet"}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;
