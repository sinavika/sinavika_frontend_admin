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
import {
  getBookletsByExamId,
  createBooklet,
  addQuestionToBooklet,
  removeQuestionFromBooklet,
  deleteBookletItem,
} from "@/services/adminBookletService";
import { getAllBookletTemplates } from "@/services/adminBookletTemplateService";
import { getAllLessons } from "@/services/adminLessonService";
import { ERROR_MESSAGES } from "@/constants";

const OPTION_KEYS = ["A", "B", "C", "D", "E"];

const defaultCreateBookletForm = () => ({
  questionsTemplateId: "",
  lessonId: "",
  name: "",
  orderIndex: 0,
  examId: "",
});

const defaultQuestionForm = () => ({
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
  const [createBookletModalOpen, setCreateBookletModalOpen] = useState(false);
  const [createBookletForm, setCreateBookletForm] = useState(defaultCreateBookletForm);
  const [createBookletSection, setCreateBookletSection] = useState(null);
  const [createBookletSubmitting, setCreateBookletSubmitting] = useState(false);
  const [addQuestionModalOpen, setAddQuestionModalOpen] = useState(false);
  const [addQuestionForm, setAddQuestionForm] = useState(defaultQuestionForm);
  const [addQuestionBooklet, setAddQuestionBooklet] = useState(null);
  const [addQuestionSectionName, setAddQuestionSectionName] = useState("");
  const [addQuestionSubmitting, setAddQuestionSubmitting] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(null);
  const [removeQuestionSubmitting, setRemoveQuestionSubmitting] = useState(null);

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
      setBookletsLoading(false);
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

  const openCreateBookletModal = (section) => {
    const templateRowId = section.id;
    const count = booklets.filter(
      (b) =>
        String(b.questionsTemplateId) === String(templateRowId) ||
        String(b.examSectionId) === String(templateRowId)
    ).length;
    setCreateBookletSection(section);
    setCreateBookletForm({
      ...defaultCreateBookletForm(),
      questionsTemplateId: templateRowId,
      orderIndex: count,
      examId: selectedExam?.id ?? "",
    });
    setCreateBookletModalOpen(true);
  };

  const closeCreateBookletModal = () => {
    setCreateBookletModalOpen(false);
    setCreateBookletSection(null);
    setCreateBookletForm(defaultCreateBookletForm());
  };

  const handleCreateBooklet = async (e) => {
    e.preventDefault();
    if (!createBookletForm.questionsTemplateId?.trim()) {
      toast.error("Bölüm şablonu gerekli.");
      return;
    }
    if (!createBookletForm.lessonId?.trim()) {
      toast.error("Ders seçin.");
      return;
    }
    setCreateBookletSubmitting(true);
    try {
      const data = await createBooklet({
        questionsTemplateId: createBookletForm.questionsTemplateId.trim(),
        lessonId: createBookletForm.lessonId.trim(),
        name: createBookletForm.name?.trim() || null,
        orderIndex: createBookletForm.orderIndex ?? 0,
        examId: createBookletForm.examId?.trim() || null,
      });
      toast.success("Kitapçık oluşturuldu. Şimdi soru ekleyebilirsiniz.");
      if (selectedExam?.id && data.examId) {
        const list = await getBookletsByExamId(selectedExam.id);
        setBooklets(Array.isArray(list) ? list : []);
      } else {
        setBooklets((prev) => [...prev, data]);
      }
      closeCreateBookletModal();
    } catch (err) {
      toast.error(err.message || "Kitapçık oluşturulamadı.");
    } finally {
      setCreateBookletSubmitting(false);
    }
  };

  const openAddQuestionModal = (booklet, sectionName) => {
    setAddQuestionBooklet(booklet);
    setAddQuestionSectionName(sectionName ?? "");
    setAddQuestionForm(defaultQuestionForm());
    setAddQuestionModalOpen(true);
  };

  const closeAddQuestionModal = () => {
    setAddQuestionModalOpen(false);
    setAddQuestionBooklet(null);
    setAddQuestionSectionName("");
    setAddQuestionForm(defaultQuestionForm());
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!addQuestionBooklet?.id) return;
    if (!addQuestionForm.stem?.trim()) {
      toast.error("Soru metni (stem) zorunludur.");
      return;
    }
    const options = addQuestionForm.options
      .filter((o) => o.text?.trim())
      .map((o, i) => ({ ...o, orderIndex: i + 1 }));
    if (options.length < 2) {
      toast.error("En az 2 şık girin.");
      return;
    }
    if (!addQuestionForm.correctOptionKey || !options.some((o) => o.optionKey === addQuestionForm.correctOptionKey)) {
      toast.error("Doğru şık seçin.");
      return;
    }
    setAddQuestionSubmitting(true);
    try {
      await addQuestionToBooklet(addQuestionBooklet.id, {
        stem: addQuestionForm.stem.trim(),
        options,
        correctOptionKey: addQuestionForm.correctOptionKey,
      });
      toast.success("Soru kitapçığa eklendi.");
      closeAddQuestionModal();
      if (selectedExam?.id) {
        const data = await getBookletsByExamId(selectedExam.id);
        setBooklets(Array.isArray(data) ? data : []);
      } else {
        setBooklets((prev) =>
          prev.map((b) =>
            b.id === addQuestionBooklet.id
              ? { ...b, questionId: true, stem: addQuestionForm.stem.trim(), correctOptionKey: addQuestionForm.correctOptionKey, questionCode: b.code }
              : b
          )
        );
      }
    } catch (err) {
      toast.error(err.message || "Soru eklenemedi.");
    } finally {
      setAddQuestionSubmitting(false);
    }
  };

  const refetchBooklets = async () => {
    if (selectedExam?.id) {
      const data = await getBookletsByExamId(selectedExam.id);
      setBooklets(Array.isArray(data) ? data : []);
    }
  };

  const handleRemoveQuestion = async (booklet) => {
    setRemoveQuestionSubmitting(booklet.id);
    try {
      await removeQuestionFromBooklet(booklet.id);
      toast.success("Soru kitapçıktan kaldırıldı.");
      if (selectedExam?.id) {
        await refetchBooklets();
      } else {
        setBooklets((prev) =>
          prev.map((b) =>
            b.id === booklet.id ? { ...b, questionId: null, stem: null, correctOptionKey: null, questionCode: null } : b
          )
        );
      }
    } catch (err) {
      toast.error(err.message || "Soru kaldırılamadı.");
    } finally {
      setRemoveQuestionSubmitting(null);
    }
  };

  const handleDelete = async (item) => {
    const examIdToRefetch = selectedExam?.id || item.examId;
    setDeleteSubmitting(item.id);
    try {
      await deleteBookletItem(item.id);
      toast.success("Kitapçık satırı kaldırıldı.");
      if (examIdToRefetch) {
        const data = await getBookletsByExamId(examIdToRefetch);
        setBooklets(Array.isArray(data) ? data : []);
      } else {
        setBooklets((prev) => prev.filter((b) => b.id !== item.id));
      }
    } catch (err) {
      toast.error(err.message || "Kaldırılamadı.");
    } finally {
      setDeleteSubmitting(null);
    }
  };

  const setOptionText = (index, text) => {
    setAddQuestionForm((f) => ({
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
            Kitapçık şablonu seçin; şablonun bölümlerine soru ekleyerek kitapçık oluşturun. Soru eklerken sorunun hangi sınava ait olacağını seçersiniz.
          </p>
        </div>
      </div>

      <div className="admin-booklet-flow mb-6">
        <strong>Adımlar:</strong>
        <span className="admin-booklet-flow-step">Kitapçık şablonu seçin</span>
        <span className="text-slate-500">→</span>
        <span className="admin-booklet-flow-step">Bölüm için kitapçık oluştur</span>
        <span className="text-slate-500">→</span>
        <span className="admin-booklet-flow-step">Kitapçığa soru ekle</span>
      </div>

      <div className="admin-card p-4 mb-6 rounded-xl border border-slate-200 shadow-sm">
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
          Şablonu seçtiğinizde bölümler listelenir; her bölüm için önce &quot;Kitapçık oluştur&quot;, sonra oluşan kitapçığa &quot;Soru ekle&quot; ile soru ekleyebilirsiniz. Mevcut kitapçıkları görmek için aşağıdan sınav seçin.
        </p>
        {templateSets.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <label className="admin-label mb-1 block text-sm text-slate-500">Mevcut soruları görmek için sınav seçin (opsiyonel)</label>
            <select
              className="admin-input max-w-md text-sm"
              value={selectedExam?.id ?? ""}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedExam(exams.find((ex) => String(ex.id) === id) || null);
              }}
              disabled={loading}
            >
              <option value="">— Sınav seçmeden devam edebilirsiniz —</option>
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="admin-loading-center">
          <span className="admin-spinner" />
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
                  onClick={() => openCreateBookletModal(section)}
                  title="Bu bölüm için kitapçık oluştur"
                >
                  <Plus size={18} />
                  Kitapçık oluştur
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
                              Bu bölümde henüz kitapçık yok. &quot;Kitapçık oluştur&quot; ile ekleyin.
                            </td>
                          </tr>
                        ) : (
                          items.map((item) => (
                            <tr key={item.id}>
                              <td>{item.orderIndex ?? "—"}</td>
                              <td className="font-mono text-sm">{item.code ?? item.questionCode ?? "—"}</td>
                              <td className="max-w-xs truncate text-slate-700" title={item.stem}>
                                {item.stem
                                  ? `${item.stem.slice(0, 80)}${item.stem.length > 80 ? "…" : ""}`
                                  : "—"}
                              </td>
                              <td className="text-slate-600 text-sm">{item.lessonName ?? "—"}</td>
                              <td className="font-medium">{item.correctOptionKey ?? "—"}</td>
                              <td className="text-right flex items-center justify-end gap-1">
                                {item.questionId || item.stem ? (
                                  <>
                                    <button
                                      type="button"
                                      className="admin-btn admin-btn-ghost admin-btn-icon text-amber-600 hover:bg-amber-50"
                                      title="Soru kaldır"
                                      disabled={removeQuestionSubmitting === item.id}
                                      onClick={() => handleRemoveQuestion(item)}
                                    >
                                      Soru kaldır
                                    </button>
                                    <button
                                      type="button"
                                      className="admin-btn admin-btn-ghost admin-btn-icon text-red-600 hover:bg-red-50"
                                      title="Kitapçık sil"
                                      disabled={deleteSubmitting === item.id}
                                      onClick={() => handleDelete(item)}
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      className="admin-btn admin-btn-ghost text-emerald-600 hover:bg-emerald-50"
                                      title="Soru ekle"
                                      onClick={() => openAddQuestionModal(item, getSectionName(section))}
                                    >
                                      Soru ekle
                                    </button>
                                    <button
                                      type="button"
                                      className="admin-btn admin-btn-ghost admin-btn-icon text-red-600 hover:bg-red-50"
                                      title="Kitapçık sil"
                                      disabled={deleteSubmitting === item.id}
                                      onClick={() => handleDelete(item)}
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </>
                                )}
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

      {/* Modal: Kitapçık oluştur */}
      {createBookletModalOpen && createBookletSection && (
        <div className="admin-modal-backdrop" onClick={closeCreateBookletModal}>
          <div
            className="admin-modal admin-modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              Kitapçık oluştur: {getSectionName(createBookletSection)}
            </div>
            <form onSubmit={handleCreateBooklet}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Ders</label>
                  <select
                    className="admin-input"
                    value={createBookletForm.lessonId}
                    onChange={(e) =>
                      setCreateBookletForm((f) => ({ ...f, lessonId: e.target.value }))
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
                  <label className="admin-label">Ad (opsiyonel)</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={createBookletForm.name}
                    onChange={(e) =>
                      setCreateBookletForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Örn. Matematik bölümü"
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Sıra no</label>
                  <input
                    type="number"
                    className="admin-input w-24"
                    min={0}
                    value={createBookletForm.orderIndex}
                    onChange={(e) =>
                      setCreateBookletForm((f) => ({
                        ...f,
                        orderIndex: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Sınava ata (opsiyonel)</label>
                  <select
                    className="admin-input"
                    value={createBookletForm.examId}
                    onChange={(e) =>
                      setCreateBookletForm((f) => ({ ...f, examId: e.target.value }))
                    }
                  >
                    <option value="">— Sonra atayabilirsiniz —</option>
                    {exams.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={closeCreateBookletModal}
                  className="admin-btn admin-btn-secondary"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={createBookletSubmitting}
                  className="admin-btn admin-btn-primary"
                >
                  {createBookletSubmitting ? "Oluşturuluyor…" : "Kitapçık oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Soru ekle (kitapçığa) */}
      {addQuestionModalOpen && addQuestionBooklet && (
        <div className="admin-modal-backdrop" onClick={closeAddQuestionModal}>
          <div
            className="admin-modal admin-modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              {addQuestionSectionName ? `Soru ekle: ${addQuestionSectionName}` : "Kitapçığa soru ekle"}
            </div>
            <form onSubmit={handleAddQuestion}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Soru metni</label>
                  <textarea
                    className="admin-input min-h-[100px]"
                    value={addQuestionForm.stem}
                    onChange={(e) =>
                      setAddQuestionForm((f) => ({ ...f, stem: e.target.value }))
                    }
                    placeholder="Soruyu buraya yazın..."
                    required
                  />
                </div>
                <div className="admin-form-divider" />
                <div>
                  <label className="admin-label block mb-2">Şıklar (en az 2 dolu olmalı)</label>
                  <div className="space-y-2">
                    {addQuestionForm.options.map((opt, index) => (
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
                    value={addQuestionForm.correctOptionKey}
                    onChange={(e) =>
                      setAddQuestionForm((f) => ({ ...f, correctOptionKey: e.target.value }))
                    }
                  >
                    {addQuestionForm.options.map((o) => (
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
                  onClick={closeAddQuestionModal}
                  className="admin-btn admin-btn-secondary"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={addQuestionSubmitting}
                  className="admin-btn admin-btn-primary"
                >
                  {addQuestionSubmitting ? "Ekleniyor…" : "Ekle"}
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
