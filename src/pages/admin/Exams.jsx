import { useEffect, useState, useCallback } from "react";
import {
  FileCheck,
  Plus,
  Filter,
  RefreshCw,
  X,
  Send,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getAllExams,
  getExamsByStatus,
  getExamById,
  createExam,
  setExamStatus,
} from "@/services/adminExamService";
import { getBookletList } from "@/services/adminQuestionBookletService";
import { ERROR_MESSAGES } from "@/constants";

const getApiError = (err) =>
  err.response?.data?.error ||
  err.response?.data?.Error ||
  err.message ||
  ERROR_MESSAGES.FETCH_FAILED;

const EXAM_STATUS_LABELS = {
  0: "Taslak",
  1: "Zamanlanmış",
  2: "Yayında",
  3: "Devam ediyor",
  4: "Kapalı",
  5: "Sona erdi",
  6: "Arşivlendi",
};

const formatDateTime = (v) => {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return v;
  }
};

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [examsLoading, setExamsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [bookletList, setBookletList] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [modal, setModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({});

  const loadExams = useCallback(async () => {
    setExamsLoading(true);
    try {
      const data =
        statusFilter !== ""
          ? await getExamsByStatus(Number(statusFilter))
          : await getAllExams();
      setExams(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(getApiError(err));
      setExams([]);
    } finally {
      setExamsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  const loadBookletList = useCallback(async () => {
    try {
      const data = await getBookletList();
      setBookletList(Array.isArray(data) ? data : []);
    } catch {
      setBookletList([]);
    }
  }, []);

  useEffect(() => {
    if (modal === "create-exam") loadBookletList();
  }, [modal, loadBookletList]);

  const openCreateExam = () => {
    setForm({
      title: "",
      description: "",
      instructions: "",
      bookletCode: "",
      startsAt: "",
      endsAt: "",
      accessDurationDays: 7,
      participationQuota: "",
      isAdaptive: false,
    });
    setModal("create-exam");
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    if (!form.bookletCode?.trim()) {
      toast.error("Kitapçık kodu (BookletCode) zorunludur.");
      return;
    }
    if (!form.title?.trim()) {
      toast.error("Sınav başlığı zorunludur.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await createExam({
        title: form.title.trim(),
        description: form.description?.trim() || undefined,
        instructions: form.instructions?.trim() || undefined,
        bookletCode: form.bookletCode.trim(),
        startsAt: form.startsAt || undefined,
        endsAt: form.endsAt || undefined,
        accessDurationDays: form.accessDurationDays != null ? Number(form.accessDurationDays) : undefined,
        participationQuota: form.participationQuota !== "" ? Number(form.participationQuota) : undefined,
        isAdaptive: form.isAdaptive === true,
      });
      toast.success(result?.message || "Sınav oluşturuldu.");
      setModal(null);
      loadExams();
      if (result?.examId) setSelectedExam({ id: result.examId, bookletCode: result.bookletCode, title: form.title });
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const openSetStatus = (exam) => {
    setForm({ id: exam.id, status: exam.status ?? 0 });
    setModal("set-status");
  };

  const handleSetStatus = async (e) => {
    e.preventDefault();
    if (!form.id) return;
    setSubmitting(true);
    try {
      await setExamStatus(form.id, Number(form.status));
      toast.success("Sınav durumu güncellendi.");
      setModal(null);
      loadExams();
      if (selectedExam?.id === form.id) {
        const updated = await getExamById(form.id).catch(() => null);
        if (updated) setSelectedExam(updated);
      }
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="exams-page p-4 sm:p-6 md:p-8">
      <div className="admin-page-header admin-page-header-gradient mb-6 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="admin-page-title text-slate-800">
            <FileCheck size={28} className="text-emerald-600" aria-hidden />
            Sınavlar
          </h1>
          <button
            type="button"
            className="admin-btn admin-btn-primary flex items-center gap-2"
            onClick={openCreateExam}
          >
            <Plus size={18} /> Yeni sınav
          </button>
        </div>
        <p className="text-sm text-slate-600 mt-1">
          Sınavlar tek kitapçık kodu (BookletCode) ile oluşturulur; kategori ve yayınevi kitapçıktan alınır. Raporda tanımlı endpoint’ler: listele, duruma göre listele, detay, oluştur, durum güncelle.
        </p>
      </div>

      <div className="admin-card rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-3">
          <Filter size={18} className="text-slate-500" />
          <span className="font-medium text-slate-700">Durum filtresi</span>
          <select
            className="admin-input w-auto min-w-[140px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tümü</option>
            {Object.entries(EXAM_STATUS_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <button
            type="button"
            className="admin-btn admin-btn-secondary flex items-center gap-2"
            onClick={loadExams}
            disabled={examsLoading}
          >
            <RefreshCw size={16} className={examsLoading ? "animate-spin" : ""} />
            Yenile
          </button>
        </div>
        <div className="overflow-x-auto">
          {examsLoading ? (
            <div className="admin-loading-center py-12"><span className="admin-spinner" /></div>
          ) : exams.length === 0 ? (
            <div className="admin-empty-state py-12 px-6">Sınav bulunamadı. Yeni sınav ekleyin.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Başlık</th>
                  <th>Kitapçık kodu</th>
                  <th>Durum</th>
                  <th>Başlangıç</th>
                  <th>Bitiş</th>
                  <th className="w-28">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr
                    key={exam.id}
                    className={selectedExam?.id === exam.id ? "bg-emerald-50/60" : ""}
                  >
                    <td>
                      <button
                        type="button"
                        className="font-medium text-slate-800 hover:text-emerald-600 text-left"
                        onClick={() => setSelectedExam(exam)}
                      >
                        {exam.title ?? "—"}
                      </button>
                    </td>
                    <td><code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">{exam.bookletCode ?? exam.questionBookletId ?? "—"}</code></td>
                    <td>
                      <span className="admin-badge admin-badge-neutral">
                        {EXAM_STATUS_LABELS[exam.status] ?? exam.status}
                      </span>
                    </td>
                    <td className="text-sm text-slate-600">{formatDateTime(exam.startsAt)}</td>
                    <td className="text-sm text-slate-600">{formatDateTime(exam.endsAt)}</td>
                    <td>
                      <button type="button" className="admin-btn admin-btn-ghost admin-btn-icon" onClick={() => openSetStatus(exam)} title="Durum değiştir"><Send size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedExam && (
        <div className="admin-card rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-gradient-to-r from-emerald-50 to-white border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-800">{selectedExam.title}</h2>
            <p className="text-sm text-slate-500">
              Kitapçık: <code className="bg-slate-100 px-1 rounded">{selectedExam.bookletCode ?? selectedExam.questionBookletId ?? "—"}</code>
              {selectedExam.questionBookletId && (
                <span className="ml-2">(ID: {String(selectedExam.questionBookletId).slice(0, 8)}…)</span>
              )}
            </p>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div><span className="text-slate-500">Durum</span><br />{EXAM_STATUS_LABELS[selectedExam.status] ?? selectedExam.status}</div>
            <div><span className="text-slate-500">Başlangıç</span><br />{formatDateTime(selectedExam.startsAt)}</div>
            <div><span className="text-slate-500">Bitiş</span><br />{formatDateTime(selectedExam.endsAt)}</div>
            <div><span className="text-slate-500">Erişim süresi (gün)</span><br />{selectedExam.accessDurationDays ?? "—"}</div>
            <div><span className="text-slate-500">Katılım kotası</span><br />{selectedExam.participationQuota ?? "—"}</div>
            <div><span className="text-slate-500">Kilitli</span><br />{selectedExam.isLocked ? "Evet" : "Hayır"}</div>
            {selectedExam.description && (
              <div className="sm:col-span-2"><span className="text-slate-500">Açıklama</span><br />{selectedExam.description}</div>
            )}
          </div>
          <div className="px-5 pb-4">
            <button type="button" className="admin-btn admin-btn-secondary flex items-center gap-2" onClick={() => openSetStatus(selectedExam)}>
              <Send size={16} /> Durum değiştir
            </button>
          </div>
        </div>
      )}

      {modal === "create-exam" && (
        <div className="admin-modal-backdrop" onClick={() => !submitting && setModal(null)}>
          <div className="admin-modal admin-modal-xl" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header flex items-center justify-between">
              <span>Yeni sınav</span>
              <button type="button" className="admin-btn admin-btn-icon admin-btn-ghost" onClick={() => !submitting && setModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateExam}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Kitapçık kodu (BookletCode)</label>
                  <select
                    className="admin-input"
                    value={form.bookletCode ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, bookletCode: e.target.value }))}
                    required
                  >
                    <option value="">Seçin</option>
                    {bookletList.map((b) => (
                      <option key={b.id} value={b.code}>{b.name} — {b.code}</option>
                    ))}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Başlık</label>
                  <input type="text" className="admin-input" value={form.title ?? ""} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Açıklama</label>
                  <textarea className="admin-input min-h-[80px]" value={form.description ?? ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Talimatlar</label>
                  <textarea className="admin-input min-h-[80px]" value={form.instructions ?? ""} onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))} />
                </div>
                <div className="admin-form-row admin-form-row-3">
                  <div className="admin-form-group">
                    <label className="admin-label">Başlangıç</label>
                    <input type="datetime-local" className="admin-input" value={form.startsAt ?? ""} onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Bitiş</label>
                    <input type="datetime-local" className="admin-input" value={form.endsAt ?? ""} onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Erişim süresi (gün)</label>
                    <input type="number" min={0} className="admin-input" value={form.accessDurationDays ?? 7} onChange={(e) => setForm((f) => ({ ...f, accessDurationDays: e.target.value }))} required />
                  </div>
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Katılım kotası</label>
                    <input type="number" min={0} className="admin-input" value={form.participationQuota ?? ""} onChange={(e) => setForm((f) => ({ ...f, participationQuota: e.target.value }))} placeholder="Boş bırakılabilir" />
                  </div>
                  <div className="admin-form-group flex items-center gap-2 pt-8">
                    <input type="checkbox" checked={form.isAdaptive === true} onChange={(e) => setForm((f) => ({ ...f, isAdaptive: e.target.checked }))} className="rounded border-slate-300 text-emerald-600" />
                    <label className="admin-label mb-0">Uyarlanabilir (isAdaptive)</label>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setModal(null)} disabled={submitting}>İptal</button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={submitting}>{submitting ? <span className="admin-spinner w-5 h-5 border-2" /> : "Oluştur"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === "set-status" && (
        <div className="admin-modal-backdrop" onClick={() => !submitting && setModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header flex items-center justify-between">
              <span>Sınav durumunu değiştir</span>
              <button type="button" className="admin-btn admin-btn-icon admin-btn-ghost" onClick={() => !submitting && setModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSetStatus}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-label">Durum (ExamStatus 0–6)</label>
                  <select className="admin-input" value={form.status ?? 0} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                    {Object.entries(EXAM_STATUS_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setModal(null)} disabled={submitting}>İptal</button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={submitting}>{submitting ? <span className="admin-spinner w-5 h-5 border-2" /> : "Kaydet"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exams;
