import { useEffect, useState } from "react";
import {
  FileText,
  Trash2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Upload,
  FileJson,
  BookOpen,
} from "lucide-react";
import toast from "react-hot-toast";
import { getAllExams } from "@/services/adminExamService";
import { getSectionsByExamId } from "@/services/adminExamSectionService";
import {
  getBookletsByExamId,
  addQuestionToBookletByCode,
  updateBookletOrder,
  deleteBookletItem,
  bulkImportJson,
  bulkImportExcel,
} from "@/services/adminBookletService";
import { ERROR_MESSAGES } from "@/constants";

const Booklets = () => {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [sections, setSections] = useState([]);
  const [booklets, setBooklets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookletsLoading, setBookletsLoading] = useState(false);
  const [addCodeSectionId, setAddCodeSectionId] = useState(null);
  const [addCodeValue, setAddCodeValue] = useState("");
  const [addCodeSubmitting, setAddCodeSubmitting] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(null);
  const [bulkTab, setBulkTab] = useState("json"); // "json" | "excel"
  const [bulkJson, setBulkJson] = useState("");
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const [expandedSectionId, setExpandedSectionId] = useState(null);
  const [firstLoadDone, setFirstLoadDone] = useState(false);

  const loadExams = async () => {
    setLoading(true);
    try {
      const data = await getAllExams();
      setExams(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.FETCH_FAILED);
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  useEffect(() => {
    if (!selectedExam?.id) {
      setSections([]);
      setBooklets([]);
      setExpandedSectionId(null);
      return;
    }
    setFirstLoadDone(false);
    setBookletsLoading(true);
    Promise.all([
      getSectionsByExamId(selectedExam.id),
      getBookletsByExamId(selectedExam.id),
    ])
      .then(([secData, bookData]) => {
        const secList = Array.isArray(secData) ? secData : [];
        setSections(secList);
        setBooklets(Array.isArray(bookData) ? bookData : []);
        if (secList.length > 0 && !firstLoadDone) {
          setExpandedSectionId(secList[0].id);
          setFirstLoadDone(true);
        }
      })
      .catch((err) => {
        toast.error(err.message || ERROR_MESSAGES.FETCH_FAILED);
        setSections([]);
        setBooklets([]);
      })
      .finally(() => setBookletsLoading(false));
  }, [selectedExam?.id]);

  const bookletsBySection = sections.map((sec) => ({
    section: sec,
    items: booklets
      .filter((b) => String(b.examSectionId) === String(sec.id))
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)),
  }));

  const getSectionName = (section) => {
    return section?.name || `Bölüm ${section?.orderIndex ?? ""}`.trim() || section?.id;
  };

  const handleAddByCode = async (examSectionId) => {
    const code = addCodeValue?.trim();
    if (!code || !selectedExam?.id) {
      toast.error("Soru kodu girin.");
      return;
    }
    setAddCodeSubmitting(true);
    try {
      await addQuestionToBookletByCode({
        examId: selectedExam.id,
        examSectionId,
        questionCode: code,
      });
      toast.success("Soru kitapçığa eklendi.");
      setAddCodeValue("");
      setAddCodeSectionId(null);
      const data = await getBookletsByExamId(selectedExam.id);
      setBooklets(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || "Soru eklenemedi.");
    } finally {
      setAddCodeSubmitting(false);
    }
  };

  const handleMoveOrder = async (item, direction) => {
    const sectionItems = booklets
      .filter((b) => String(b.examSectionId) === String(item.examSectionId))
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
    const idx = sectionItems.findIndex((i) => i.id === item.id);
    if (idx < 0) return;
    const current = sectionItems[idx].orderIndex ?? 0;
    const newIndex =
      direction === "up"
        ? Math.max(0, current - 1)
        : Math.min(
            sectionItems.length - 1,
            current + 1
          );
    if (newIndex === current) return;
    setOrderSubmitting(item.id);
    try {
      await updateBookletOrder(item.id, { orderIndex: newIndex });
      toast.success("Sıra güncellendi.");
      const data = await getBookletsByExamId(selectedExam.id);
      setBooklets(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || "Sıra güncellenemedi.");
    } finally {
      setOrderSubmitting(null);
    }
  };

  const handleDelete = async (item) => {
    setDeleteSubmitting(item.id);
    try {
      await deleteBookletItem(item.id);
      toast.success("Kayıt kaldırıldı.");
      const data = await getBookletsByExamId(selectedExam.id);
      setBooklets(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || "Kaldırılamadı.");
    } finally {
      setDeleteSubmitting(null);
    }
  };

  const handleBulkImportJson = async (e) => {
    e.preventDefault();
    const raw = bulkJson?.trim();
    if (!raw) {
      toast.error("JSON metni girin.");
      return;
    }
    setBulkSubmitting(true);
    setBulkResult(null);
    try {
      const result = await bulkImportJson({ json: raw });
      setBulkResult(result);
      toast.success(
        `${result?.createdCount ?? 0} soru havuzuna eklendi.`
      );
      if (result?.errorCount > 0 && result?.errors?.length) {
        result.errors.forEach((err) => toast.error(err));
      }
    } catch (err) {
      toast.error(err.message || "Toplu yükleme başarısız.");
    } finally {
      setBulkSubmitting(false);
    }
  };

  const handleBulkImportExcel = async (e) => {
    e.preventDefault();
    if (!bulkFile) {
      toast.error("Excel dosyası seçin.");
      return;
    }
    setBulkSubmitting(true);
    setBulkResult(null);
    try {
      const result = await bulkImportExcel(bulkFile);
      setBulkResult(result);
      toast.success(
        `${result?.createdCount ?? 0} soru havuzuna eklendi.`
      );
      setBulkFile(null);
      if (result?.errorCount > 0 && result?.errors?.length) {
        result.errors.forEach((err) => toast.error(err));
      }
    } catch (err) {
      toast.error(err.message || "Toplu yükleme başarısız.");
    } finally {
      setBulkSubmitting(false);
    }
  };

  return (
    <div className="admin-page-wrapper">
      <div className="admin-page-header">
        <div className="flex flex-col gap-1">
          <h1 className="admin-page-title">
            <FileText size={28} className="text-emerald-600 shrink-0" />
            Kitapçıklar
          </h1>
          <p className="text-slate-500 text-sm">
            Sınava göre kitapçık sorularını yönetin veya soru havuzuna toplu yükleme yapın.
          </p>
        </div>
      </div>

      {/* Sınav seçimi */}
      <div className="admin-card p-4 mb-4">
        <label className="admin-label mb-2 block">Sınav seçin</label>
        <select
          className="admin-input max-w-md"
          value={selectedExam?.id ?? ""}
          onChange={(e) => {
            const id = e.target.value;
            setSelectedExam(exams.find((ex) => String(ex.id) === id) || null);
          }}
          disabled={loading}
        >
          <option value="">— Sınav seçin —</option>
          {exams.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.title}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="admin-loading-center">
          <span className="admin-spinner" />
        </div>
      ) : !selectedExam ? (
        <div className="admin-empty-state rounded-xl">
          <BookOpen size={48} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium text-slate-600">
            Kitapçık içeriğini görmek için yukarıdan bir sınav seçin.
          </p>
        </div>
      ) : bookletsLoading ? (
        <div className="admin-loading-center">
          <span className="admin-spinner" />
        </div>
      ) : (
        <div className="space-y-4">
          {bookletsBySection.map(({ section, items }) => (
            <div
              key={section.id}
              className="admin-card admin-card-elevated overflow-hidden"
            >
              <button
                type="button"
                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50/80 transition-colors"
                onClick={() =>
                  setExpandedSectionId((id) =>
                    id === section.id ? null : section.id
                  )
                }
              >
                <div className="flex items-center gap-2">
                  {expandedSectionId === section.id ? (
                    <ChevronDown size={20} className="text-slate-500" />
                  ) : (
                    <ChevronRight size={20} className="text-slate-500" />
                  )}
                  <span className="font-semibold text-slate-800">
                    {getSectionName(section)}
                  </span>
                  <span className="admin-badge admin-badge-neutral text-xs">
                    {items.length} soru
                  </span>
                </div>
              </button>
              {expandedSectionId === section.id && (
                <div className="border-t border-slate-200 bg-slate-50/50">
                  <div className="p-4 flex flex-wrap items-center gap-2 border-b border-slate-200">
                    <input
                      type="text"
                      className="admin-input flex-1 min-w-[200px] max-w-xs"
                      placeholder="Soru kodu (örn. MAT123456)"
                      value={
                        addCodeSectionId === section.id ? addCodeValue : ""
                      }
                      onChange={(e) => {
                        setAddCodeSectionId(section.id);
                        setAddCodeValue(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddByCode(section.id);
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="admin-btn admin-btn-primary"
                      disabled={addCodeSubmitting}
                      onClick={() => handleAddByCode(section.id)}
                    >
                      {addCodeSubmitting ? "Ekleniyor…" : "Soru ekle"}
                    </button>
                  </div>
                  <div className="admin-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th className="w-10">Sıra</th>
                          <th>Kod</th>
                          <th>Soru metni</th>
                          <th>Ders</th>
                          <th className="text-right w-28">İşlem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center text-slate-500 py-6">
                              Bu bölümde henüz soru yok. Yukarıdan soru kodu ile ekleyin.
                            </td>
                          </tr>
                        ) : (
                          items.map((item) => (
                            <tr key={item.id}>
                              <td>
                                <div className="flex items-center gap-0.5">
                                  <button
                                    type="button"
                                    className="admin-btn admin-btn-ghost admin-btn-icon p-1"
                                    onClick={() => handleMoveOrder(item, "up")}
                                    disabled={orderSubmitting === item.id || items.findIndex((i) => i.id === item.id) === 0}
                                    title="Yukarı taşı"
                                  >
                                    <ChevronUp size={16} className="text-slate-500" />
                                  </button>
                                  <button
                                    type="button"
                                    className="admin-btn admin-btn-ghost admin-btn-icon p-1"
                                    onClick={() => handleMoveOrder(item, "down")}
                                    disabled={orderSubmitting === item.id || items.findIndex((i) => i.id === item.id) === items.length - 1}
                                    title="Aşağı taşı"
                                  >
                                    <ChevronDown size={16} className="text-slate-500" />
                                  </button>
                                  <span className="text-slate-500 text-sm w-6 ml-1">
                                    {item.orderIndex ?? "—"}
                                  </span>
                                </div>
                              </td>
                              <td className="font-mono text-sm">
                                {item.questionCode ?? "—"}
                              </td>
                              <td className="max-w-xs truncate text-slate-700" title={item.stem}>
                                {item.stem ? `${item.stem.slice(0, 80)}${item.stem.length > 80 ? "…" : ""}` : "—"}
                              </td>
                              <td className="text-slate-600 text-sm">
                                {item.lessonName ?? "—"}
                              </td>
                              <td className="text-right">
                                <button
                                  type="button"
                                  className="admin-btn admin-btn-ghost admin-btn-icon text-red-600 hover:bg-red-50"
                                  title="Kaldır"
                                  disabled={deleteSubmitting === item.id}
                                  onClick={() => handleDelete(item)}
                                >
                                  <Trash2 size={18} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Toplu soru yükleme (havuza) */}
      <div className="mt-10 admin-card admin-card-elevated overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Upload size={20} className="text-emerald-600" />
            Soru havuzuna toplu yükleme
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            JSON veya Excel ile soruları havuza ekleyin. Kitapçığa eklemek için yukarıdan &quot;Soru ekle&quot; kullanın.
          </p>
        </div>
        <div className="p-4">
          <div className="flex gap-2 border-b border-slate-200 mb-4">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                bulkTab === "json"
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              onClick={() => setBulkTab("json")}
            >
              <FileJson size={16} className="inline mr-2" />
              JSON
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                bulkTab === "excel"
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              onClick={() => setBulkTab("excel")}
            >
              <Upload size={16} className="inline mr-2" />
              Excel
            </button>
          </div>

          {bulkTab === "json" && (
            <form onSubmit={handleBulkImportJson} className="space-y-4">
              <div className="admin-form-group">
                <label className="admin-label">
                  JSON dizisi (her eleman: stem, options, correctOptionKey, lessonId, lessonSubId?, publisherId?)
                </label>
                <textarea
                  className="admin-input min-h-[200px] font-mono text-sm"
                  value={bulkJson}
                  onChange={(e) => setBulkJson(e.target.value)}
                  placeholder={'[{"stem":"2+2 kaçtır?","options":[{"optionKey":"A","text":"3"},{"optionKey":"B","text":"4"}],"correctOptionKey":"B","lessonId":"..."}]'}
                />
              </div>
              <button
                type="submit"
                disabled={bulkSubmitting}
                className="admin-btn admin-btn-primary"
              >
                {bulkSubmitting ? "Yükleniyor…" : "Havuza yükle"}
              </button>
            </form>
          )}

          {bulkTab === "excel" && (
            <form onSubmit={handleBulkImportExcel} className="space-y-4">
              <div className="admin-form-group">
                <label className="admin-label">Excel dosyası (.xlsx)</label>
                <input
                  type="file"
                  accept=".xlsx"
                  className="admin-input"
                  onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Sütunlar: Stem, OptionA, OptionB, OptionC, OptionD, OptionE, CorrectOptionKey, LessonId, LessonSubId, PublisherId
                </p>
              </div>
              <button
                type="submit"
                disabled={bulkSubmitting || !bulkFile}
                className="admin-btn admin-btn-primary"
              >
                {bulkSubmitting ? "Yükleniyor…" : "Havuza yükle"}
              </button>
            </form>
          )}

          {bulkResult && (
            <div className="mt-4 p-4 rounded-lg bg-slate-100 border border-slate-200">
              <p className="font-medium text-slate-700">Sonuç</p>
              <p className="text-sm text-slate-600">
                Toplam: {bulkResult.totalRows ?? 0}, Oluşturulan:{" "}
                {bulkResult.createdCount ?? 0}, Hata: {bulkResult.errorCount ?? 0}
              </p>
              {bulkResult.errors?.length > 0 && (
                <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
                  {bulkResult.errors.slice(0, 5).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                  {bulkResult.errors.length > 5 && (
                    <li>… ve {bulkResult.errors.length - 5} hata daha</li>
                  )}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Booklets;
