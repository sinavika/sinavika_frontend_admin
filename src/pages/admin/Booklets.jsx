import { useEffect, useState, useMemo } from "react";
import {
  FileText,
  Trash2,
  ChevronDown,
  ChevronRight,
  Plus,
  LayoutTemplate,
} from "lucide-react";
import toast from "react-hot-toast";
import { getAllExams } from "@/services/adminExamService";
import { getBookletsByExamId, addQuestionToBooklet, deleteBookletItem } from "@/services/adminBookletService";
import { getAllBookletTemplates } from "@/services/adminBookletTemplateService";
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

// Doc: Şablon setleri questionsTemplateId ile gruplanır; tek satırlı sette questionsTemplateId null olabilir (set id = row id).
function buildTemplateSets(templates) {
  if (!Array.isArray(templates) || templates.length === 0) return [];
  const bySet = new Map();
  for (const t of templates) {
    const setId = t.questionsTemplateId ?? t.id;
    if (!bySet.has(setId)) bySet.set(setId, []);
    bySet.get(setId).push(t);
  }
  return Array.from(bySet.entries()).map(([setId, rows]) => {
    const sorted = [...rows].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
    const label = sorted[0]?.name ?? sorted[0]?.code ?? `Şablon seti`;
    return { setId, label, rows: sorted };
  });
}

const Booklets = () => {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedTemplateSetId, setSelectedTemplateSetId] = useState("");
  const [booklets, setBooklets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookletsLoading, setBookletsLoading] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [expandedSectionId, setExpandedSectionId] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState(defaultAddForm);
  const [addSectionName, setAddSectionName] = useState("");
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(null);

  const templateSets = useMemo(() => buildTemplateSets(templates), [templates]);

  const selectedSetSections = useMemo(() => {
    if (!selectedTemplateSetId) return [];
    const set = templateSets.find((s) => s.setId === selectedTemplateSetId);
    return set ? set.rows : [];
  }, [selectedTemplateSetId, templateSets]);

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
    getAllBookletTemplates()
      .then((data) => setTemplates(Array.isArray(data) ? data : []))
      .catch(() => setTemplates([]));
  }, []);

  useEffect(() => {
    if (!selectedExam?.id) {
      setBooklets([]);
      setExpandedSectionId(null);
      return;
    }
    setBookletsLoading(true);
    getBookletsByExamId(selectedExam.id)
      .then((data) => setBooklets(Array.isArray(data) ? data : []))
      .catch((err) => {
        toast.error(err.message || ERROR_MESSAGES.FETCH_FAILED);
        setBooklets([]);
      })
      .finally(() => setBookletsLoading(false));
  }, [selectedExam?.id]);

  // Bölümler = seçilen kitapçık şablonunun satırları (QuestionBookletTemplate). Her satırın id'si = bölüm şablonu Id.
  const bookletsBySection = useMemo(() => {
    return selectedSetSections.map((section) => {
      const templateRowId = section.id;
      const items = booklets
        .filter(
          (b) =>
            String(b.questionsTemplateId) === String(templateRowId) ||
            String(b.examSectionId) === String(templateRowId)
        )
        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
      return {
        section,
        items,
        targetQuestionCount: section.targetQuestionCount ?? null,
      };
    }, [selectedSetSections, booklets]);
  }, [selectedSetSections, booklets]);

  const getSectionName = (section) =>
    section?.name ?? section?.code ?? `Bölüm ${section?.orderIndex ?? ""}`.trim() ?? "—";

  const openAddModal = (section) => {
    // section = QuestionBookletTemplate satırı; section.id = bölüm şablonu Id (doc: add-question için zorunlu).
    const templateRowId = section.id;
    setAddSectionName(getSectionName(section));
    setAddForm({
      ...defaultAddForm(),
      examSectionId: templateRowId,
      questionsTemplateId: templateRowId,
      orderIndex: booklets.filter(
        (b) =>
          String(b.questionsTemplateId) === String(templateRowId) ||
          String(b.examSectionId) === String(templateRowId)
      ).length,
    });
    setAddModalOpen(true);
  };

  const closeAddModal = () => {
    setAddModalOpen(false);
    setAddSectionName("");
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
    const templateRowId = addForm.questionsTemplateId || addForm.examSectionId;
    if (!templateRowId) {
      toast.error("Bölüm şablonu belirtilmeli. Lütfen sayfadan bir kitapçık şablonu seçip bölüme tekrar girin.");
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
        examSectionId: templateRowId,
        questionsTemplateId: templateRowId,
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
      <div className="admin-page-header admin-page-header-gradient flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex flex-col gap-1">
          <h1 className="admin-page-title">
            <FileText size={28} className="text-emerald-600 shrink-0" />
            Kitapçıklar
          </h1>
          <p className="text-slate-500 text-sm">
            Sınav ve kitapçık şablonu seçin; şablonun bölümlerine soru ekleyerek o sınavın kitapçığını doldurun. Önce Kitapçık şablonları sayfasında şablon seti oluşturun.
          </p>
        </div>
      </div>

      <div className="admin-booklet-flow mb-6">
        <strong>Adımlar:</strong>
        <span className="admin-booklet-flow-step">Sınav seçin</span>
        <span className="text-slate-500">→</span>
        <span className="admin-booklet-flow-step">Kitapçık şablonu seçin</span>
        <span className="text-slate-500">→</span>
        <span className="admin-booklet-flow-step">Bölüme soru ekleyin</span>
      </div>

      <div className="admin-card p-4 mb-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <label className="admin-label mb-2 block font-semibold text-slate-700">Sınav seçin</label>
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
        <div>
          <label className="admin-label mb-2 block font-semibold text-slate-700">
            <LayoutTemplate size={18} className="inline-block mr-1 align-middle text-emerald-600" />
            Kitapçık şablonu seçin
          </label>
          <select
            className="admin-input max-w-md"
            value={selectedTemplateSetId}
            onChange={(e) => {
              setSelectedTemplateSetId(e.target.value);
              const firstRow = templateSets.find((s) => s.setId === e.target.value)?.rows?.[0];
              if (firstRow) setExpandedSectionId(firstRow.id);
            }}
            disabled={loading || templates.length === 0}
          >
            <option value="">— Kitapçık şablonu seçin —</option>
            {templateSets.map((set) => (
              <option key={set.setId} value={set.setId}>
                {set.label} ({set.rows.length} bölüm)
              </option>
            ))}
          </select>
          <p className="text-sm text-slate-500 mt-1">
            Şablon seti seçildikten sonra bölümler listelenir; her bölüme soru ekleyebilirsiniz.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading-center">
          <span className="admin-spinner" />
        </div>
      ) : !selectedExam ? (
        <div className="admin-empty-state rounded-xl py-12">
          <FileText size={48} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium text-slate-600">
            Önce bir sınav seçin.
          </p>
          <p className="text-sm mt-1 text-slate-500">Sınav ve kitapçık şablonu seçtiğinizde bölümler açılır.</p>
        </div>
      ) : !selectedTemplateSetId ? (
        <div className="admin-empty-state rounded-xl py-12">
          <LayoutTemplate size={48} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium text-slate-600">
            Kitapçık şablonu seçin.
          </p>
          <p className="text-sm mt-1 text-slate-500">
            Yukarıdaki &quot;Kitapçık şablonu seçin&quot; alanından bir şablon seti seçin. Kitapçık şablonu yoksa Kitapçık şablonları sayfasından oluşturun.
          </p>
        </div>
      ) : bookletsLoading ? (
        <div className="admin-loading-center">
          <span className="admin-spinner" />
        </div>
      ) : (
        <div className="space-y-4">
          {bookletsBySection.map(({ section, items, targetQuestionCount }) => {
            const isFull = targetQuestionCount != null && items.length >= targetQuestionCount;
            return (
            <div
              key={section.id}
              className="admin-booklet-section-card"
            >
              <div className="admin-booklet-section-header">
                <button
                  type="button"
                  className="flex items-center gap-2 text-left hover:opacity-90 transition-opacity flex-1 min-w-0"
                  onClick={() =>
                    setExpandedSectionId((id) =>
                      id === section.id ? null : section.id
                    )
                  }
                >
                  {expandedSectionId === section.id ? (
                    <ChevronDown size={20} className="text-slate-500 shrink-0" />
                  ) : (
                    <ChevronRight size={20} className="text-slate-500 shrink-0" />
                  )}
                  <span className="font-semibold text-slate-800 truncate">
                    {getSectionName(section)}
                  </span>
                  <span className={`admin-badge text-xs tabular-nums ${isFull ? "admin-badge-success" : "admin-badge-neutral"}`}>
                    {targetQuestionCount != null
                      ? `${items.length} / ${targetQuestionCount} soru`
                      : `${items.length} soru`}
                  </span>
                  {targetQuestionCount != null && items.length < targetQuestionCount && (
                    <span className="text-xs text-amber-600 font-medium">
                      ({targetQuestionCount - items.length} soru daha ekleyin)
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-primary shrink-0"
                  onClick={() => openAddModal(section)}
                  title="Bu bölüme soru ekle"
                >
                  <Plus size={18} />
                  Soru ekle
                </button>
              </div>
              {expandedSectionId === section.id && (
                <div className="admin-booklet-section-body">
                  <div className="admin-table-wrapper">
                    <table className="admin-table admin-booklet-table-row-hover">
                      <thead>
                        <tr>
                          <th className="w-12 admin-table-header-gradient">Sıra</th>
                          <th className="admin-table-header-gradient">Kod</th>
                          <th className="admin-table-header-gradient">Soru metni</th>
                          <th className="admin-table-header-gradient">Ders</th>
                          <th className="admin-table-header-gradient">Doğru</th>
                          <th className="admin-table-header-gradient text-right w-28">İşlem</th>
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
          );})}
          {selectedSetSections.length === 0 && selectedTemplateSetId && (
            <div className="admin-empty-state rounded-xl py-12">
              <p className="font-medium text-slate-600">
                Bu şablon setinde bölüm satırı yok.
              </p>
              <p className="text-sm mt-1 text-slate-500">
                Kitapçık şablonları sayfasından bu sete bölüm ekleyin veya başka bir şablon seçin.
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
            <div className="admin-modal-header">
              {addSectionName ? `Bölüme soru ekle: ${addSectionName}` : "Kitapçık bölümüne soru ekle"}
            </div>
            <form onSubmit={handleAddQuestion}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Soru metni</label>
                  <textarea
                    className="admin-input min-h-[100px]"
                    value={addForm.stem}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, stem: e.target.value }))
                    }
                    placeholder="Soruyu buraya yazın..."
                    required
                  />
                </div>
                <div className="admin-form-divider" />
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
                    <label className="admin-label">Satır adı (opsiyonel)</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={addForm.name}
                      onChange={(e) =>
                        setAddForm((f) => ({ ...f, name: e.target.value }))
                      }
                      placeholder="Örn. Matematik - Soru 1"
                    />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Sıra no</label>
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
                <div className="admin-form-divider" />
                <div>
                  <label className="admin-label block mb-2">Şıklar (en az 2 dolu olmalı)</label>
                  <div className="space-y-2">
                    {addForm.options.map((opt, index) => (
                      <div key={opt.optionKey} className="flex items-center gap-2">
                        <span className="w-6 font-medium text-slate-600">{opt.optionKey}.</span>
                        <input
                          type="text"
                          className="admin-input flex-1"
                          value={opt.text}
                          onChange={(e) => setOptionText(index, e.target.value)}
                          placeholder={`Şık ${opt.optionKey}`}
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
