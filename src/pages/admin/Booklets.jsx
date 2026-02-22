import { useEffect, useState } from "react";
import {
  FileText,
  Trash2,
  ChevronDown,
  ChevronRight,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";
import { getAllExams } from "@/services/adminExamService";
import { getSectionsByExamId } from "@/services/adminExamSectionService";
import { getBookletsByExamId, addQuestionToBooklet, deleteBookletItem } from "@/services/adminBookletService";
import { getAllLessons } from "@/services/adminLessonService";
import { ERROR_MESSAGES } from "@/constants";

const OPTION_KEYS = ["A", "B", "C", "D", "E"];

const defaultAddForm = () => ({
  examSectionId: "",
  questionsTemplateId: "",
  lessonId: "",
  name: "",
  orderIndex: 0,
  stem: "",
  options: OPTION_KEYS.slice(0, 4).map((key, i) => ({
    optionKey: key,
    text: "",
    orderIndex: i + 1,
  })),
  correctOptionKey: "A",
});

const Booklets = () => {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [sections, setSections] = useState([]);
  const [booklets, setBooklets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookletsLoading, setBookletsLoading] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [expandedSectionId, setExpandedSectionId] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState(defaultAddForm);
  const [addSectionId, setAddSectionId] = useState(null);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(null);

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
    getAllLessons()
      .then((data) => setLessons(Array.isArray(data) ? data : []))
      .catch(() => setLessons([]));
  }, []);

  useEffect(() => {
    if (!selectedExam?.id) {
      setSections([]);
      setBooklets([]);
      setExpandedSectionId(null);
      return;
    }
    setBookletsLoading(true);
    Promise.all([
      getSectionsByExamId(selectedExam.id),
      getBookletsByExamId(selectedExam.id),
    ])
      .then(([secData, bookData]) => {
        setSections(Array.isArray(secData) ? secData : []);
        setBooklets(Array.isArray(bookData) ? bookData : []);
        if (secData?.length > 0 && !expandedSectionId)
          setExpandedSectionId(secData[0].id);
      })
      .catch((err) => {
        toast.error(err.message || ERROR_MESSAGES.FETCH_FAILED);
        setSections([]);
        setBooklets([]);
      })
      .finally(() => setBookletsLoading(false));
  }, [selectedExam?.id]);

  const bookletsBySection = sections.map((sec) => {
    const sectionOrTemplateId = sec.questionsTemplateId || sec.id;
    return {
      section: sec,
      items: booklets
        .filter((b) => String(b.examSectionId) === String(sectionOrTemplateId))
        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)),
    };
  });

  const getSectionName = (section) =>
    section?.name ?? `Bölüm ${section?.orderIndex ?? ""}`.trim() ?? section?.id;

  const openAddModal = (section) => {
    const sectionOrTemplateId = section?.questionsTemplateId || section?.id;
    setAddSectionId(section?.id);
    setAddForm({
      ...defaultAddForm(),
      examSectionId: sectionOrTemplateId || "",
      questionsTemplateId: section?.questionsTemplateId || "",
      orderIndex: booklets.filter((b) => String(b.examSectionId) === String(sectionOrTemplateId)).length,
    });
    setAddModalOpen(true);
  };

  const closeAddModal = () => {
    setAddModalOpen(false);
    setAddSectionId(null);
    setAddForm(defaultAddForm());
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!selectedExam?.id) return;
    if (!addForm.stem?.trim()) {
      toast.error("Soru metni (stem) zorunludur.");
      return;
    }
    const options = addForm.options
      .filter((o) => o.text?.trim())
      .map((o, i) => ({ ...o, orderIndex: i + 1 }));
    if (options.length < 2) {
      toast.error("En az 2 şık girin.");
      return;
    }
    if (!addForm.correctOptionKey || !options.some((o) => o.optionKey === addForm.correctOptionKey)) {
      toast.error("Doğru şık seçin.");
      return;
    }
    if (!addForm.examSectionId && !addForm.questionsTemplateId) {
      toast.error("Bölüm şablonu (examSectionId veya questionsTemplateId) belirtin.");
      return;
    }
    if (!addForm.lessonId?.trim()) {
      toast.error("Ders seçin.");
      return;
    }
    setAddSubmitting(true);
    try {
      await addQuestionToBooklet({
        examId: selectedExam.id,
        examSectionId: addForm.examSectionId || undefined,
        questionsTemplateId: addForm.questionsTemplateId || undefined,
        lessonId: addForm.lessonId.trim(),
        name: addForm.name?.trim() || "Soru",
        orderIndex: addForm.orderIndex ?? 0,
        stem: addForm.stem.trim(),
        options,
        correctOptionKey: addForm.correctOptionKey,
        lessonSubId: undefined,
        publisherId: undefined,
      });
      toast.success("Soru kitapçığa eklendi.");
      closeAddModal();
      const data = await getBookletsByExamId(selectedExam.id);
      setBooklets(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || "Soru eklenemedi.");
    } finally {
      setAddSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    setDeleteSubmitting(item.id);
    try {
      await deleteBookletItem(item.id);
      toast.success("Kitapçık satırı kaldırıldı.");
      const data = await getBookletsByExamId(selectedExam.id);
      setBooklets(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || "Kaldırılamadı.");
    } finally {
      setDeleteSubmitting(null);
    }
  };

  const setOptionText = (index, text) => {
    setAddForm((f) => ({
      ...f,
      options: f.options.map((o, i) =>
        i === index ? { ...o, text } : o
      ),
    }));
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
            Sınava göre kitapçık satırlarını yönetin; bölüme soru ekleyin (stem, şıklar, doğru cevap).
          </p>
        </div>
      </div>

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
          <FileText size={48} className="mx-auto mb-3 text-slate-300" />
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
              <div className="w-full flex items-center justify-between p-4 border-b border-slate-200">
                <button
                  type="button"
                  className="flex items-center gap-2 text-left hover:opacity-90"
                  onClick={() =>
                    setExpandedSectionId((id) =>
                      id === section.id ? null : section.id
                    )
                  }
                >
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
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-primary"
                  onClick={() => openAddModal(section)}
                >
                  <Plus size={18} />
                  Soru ekle
                </button>
              </div>
              {expandedSectionId === section.id && (
                <div className="border-t border-slate-200 bg-slate-50/50">
                  <div className="admin-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th className="w-12">Sıra</th>
                          <th>Kod</th>
                          <th>Soru metni</th>
                          <th>Ders</th>
                          <th>Doğru</th>
                          <th className="text-right w-28">İşlem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center text-slate-500 py-6">
                              Bu bölümde henüz soru yok. &quot;Soru ekle&quot; ile ekleyin.
                            </td>
                          </tr>
                        ) : (
                          items.map((item) => (
                            <tr key={item.id}>
                              <td>{item.orderIndex ?? "—"}</td>
                              <td className="font-mono text-sm">{item.questionCode ?? "—"}</td>
                              <td className="max-w-xs truncate text-slate-700" title={item.stem}>
                                {item.stem
                                  ? `${item.stem.slice(0, 80)}${item.stem.length > 80 ? "…" : ""}`
                                  : "—"}
                              </td>
                              <td className="text-slate-600 text-sm">{item.lessonName ?? "—"}</td>
                              <td className="font-medium">{item.correctOptionKey ?? "—"}</td>
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
          {sections.length === 0 && (
            <div className="admin-empty-state rounded-xl">
              <p className="text-slate-600">
                Bu sınav için henüz bölüm atanmamış. Önce sınav bölümlerini (şablon atama) tanımlayın.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal: Soru ekle */}
      {addModalOpen && (
        <div className="admin-modal-backdrop" onClick={closeAddModal}>
          <div
            className="admin-modal admin-modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">Kitapçık bölümüne soru ekle</div>
            <form onSubmit={handleAddQuestion}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Soru metni (stem)</label>
                  <textarea
                    className="admin-input min-h-[100px]"
                    value={addForm.stem}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, stem: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Ders</label>
                    <select
                      className="admin-input"
                      value={addForm.lessonId}
                      onChange={(e) =>
                        setAddForm((f) => ({ ...f, lessonId: e.target.value }))
                      }
                      required
                    >
                      <option value="">Seçin</option>
                      {lessons.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Bölüm adı (name)</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={addForm.name}
                      onChange={(e) =>
                        setAddForm((f) => ({ ...f, name: e.target.value }))
                      }
                      placeholder="Örn. Türkçe"
                    />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Sıra (orderIndex)</label>
                  <input
                    type="number"
                    className="admin-input w-24"
                    min={0}
                    value={addForm.orderIndex}
                    onChange={(e) =>
                      setAddForm((f) => ({
                        ...f,
                        orderIndex: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="admin-label block mb-2">Şıklar</label>
                  <div className="space-y-2">
                    {addForm.options.map((opt, index) => (
                      <div key={opt.optionKey} className="flex items-center gap-2">
                        <span className="w-6 font-medium text-slate-600">{opt.optionKey}.</span>
                        <input
                          type="text"
                          className="admin-input flex-1"
                          value={opt.text}
                          onChange={(e) => setOptionText(index, e.target.value)}
                          placeholder={`Şık ${opt.optionKey} metni`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Doğru şık</label>
                  <select
                    className="admin-input w-24"
                    value={addForm.correctOptionKey}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, correctOptionKey: e.target.value }))
                    }
                  >
                    {addForm.options.map((o) => (
                      <option key={o.optionKey} value={o.optionKey}>
                        {o.optionKey}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="admin-btn admin-btn-secondary"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={addSubmitting}
                  className="admin-btn admin-btn-primary"
                >
                  {addSubmitting ? "Ekleniyor…" : "Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booklets;
