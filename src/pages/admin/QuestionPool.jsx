import { useEffect, useState } from "react";
import { Database, Plus, Pencil, Trash2, Eye, BookOpen } from "lucide-react";
import toast from "react-hot-toast";
import {
  getAllQuestions,
  getQuestionsByLesson,
  getQuestionsByLessonSub,
  getQuestionsByPublisher,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "@/services/adminQuestionService";
import {
  getSolutionsByQuestionId,
  createQuestionSolution,
  updateQuestionSolution,
  deleteQuestionSolution,
} from "@/services/adminQuestionSolutionService";
import { getAllPublishers } from "@/services/adminPublisherService";
import { getAllLessons } from "@/services/adminLessonService";
import { getLessonSubsByLessonId } from "@/services/adminLessonSubService";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";
import { formatDate } from "@/utils/format";

const SOLUTION_TYPES = [
  { value: 0, label: "Metin açıklaması" },
  { value: 1, label: "Video" },
  { value: 2, label: "PDF" },
  { value: 3, label: "Link" },
];

const DIFFICULTY_LEVELS = [
  { value: 0, label: "Kolay" },
  { value: 1, label: "Orta" },
  { value: 2, label: "Zor" },
];

const DEFAULT_OPTIONS = [
  { optionKey: "A", text: "" },
  { optionKey: "B", text: "" },
  { optionKey: "C", text: "" },
  { optionKey: "D", text: "" },
];

const QuestionPool = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [publishers, setPublishers] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [lessonSubs, setLessonSubs] = useState([]);
  const [lessonSubsForForm, setLessonSubsForForm] = useState([]);
  const [filter, setFilter] = useState({
    type: "all",
    lessonId: "",
    lessonSubId: "",
    publisherId: "",
  });
  const [form, setForm] = useState({
    stem: "",
    difficultyLevel: 1,
    publisherId: "",
    lessonId: "",
    lessonSubId: "",
    options: [...DEFAULT_OPTIONS],
    correctOptionKey: "A",
  });
  const [solutionQuestion, setSolutionQuestion] = useState(null);
  const [solutionList, setSolutionList] = useState([]);
  const [solutionModal, setSolutionModal] = useState(null);
  const [solutionForm, setSolutionForm] = useState({ type: 0, title: "", contentText: "", url: "", orderIndex: 0, isActive: true });
  const [solutionEditId, setSolutionEditId] = useState(null);
  const [solutionLoading, setSolutionLoading] = useState(false);
  const [solutionSubmitting, setSolutionSubmitting] = useState(false);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      let data;
      if (filter.type === "lesson" && filter.lessonId) {
        data = await getQuestionsByLesson(filter.lessonId);
      } else if (filter.type === "lessonSub" && filter.lessonSubId) {
        data = await getQuestionsByLessonSub(filter.lessonSubId);
      } else if (filter.type === "publisher" && filter.publisherId) {
        data = await getQuestionsByPublisher(filter.publisherId);
      } else {
        data = await getAllQuestions();
      }
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.FETCH_FAILED);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPublishersAndLessons = async () => {
    try {
      const [pubData, lessData] = await Promise.all([
        getAllPublishers(),
        getAllLessons(),
      ]);
      setPublishers(Array.isArray(pubData) ? pubData : []);
      setLessons(Array.isArray(lessData) ? lessData : []);
    } catch {
      setPublishers([]);
      setLessons([]);
    }
  };

  useEffect(() => {
    loadPublishersAndLessons();
  }, []);

  useEffect(() => {
    if (filter.type === "lessonSub" && filter.lessonId) {
      let cancelled = false;
      getLessonSubsByLessonId(filter.lessonId).then((data) => {
        if (!cancelled) setLessonSubs(Array.isArray(data) ? data : []);
      }).catch(() => { if (!cancelled) setLessonSubs([]); });
      return () => { cancelled = true; };
    }
    setLessonSubs([]);
  }, [filter.type, filter.lessonId]);

  useEffect(() => {
    if (form.lessonId) {
      let cancelled = false;
      getLessonSubsByLessonId(form.lessonId).then((data) => {
        if (!cancelled) setLessonSubsForForm(Array.isArray(data) ? data : []);
      }).catch(() => { if (!cancelled) setLessonSubsForForm([]); });
      return () => { cancelled = true; };
    }
    setLessonSubsForForm([]);
  }, [form.lessonId]);

  useEffect(() => {
    loadQuestions();
  }, [filter.type, filter.lessonId, filter.lessonSubId, filter.publisherId]);

  const resetForm = () => {
    setForm({
      stem: "",
      difficultyLevel: 1,
      publisherId: "",
      lessonId: "",
      lessonSubId: "",
      options: [...DEFAULT_OPTIONS],
      correctOptionKey: "A",
    });
    setSelected(null);
  };

  const openCreate = () => {
    resetForm();
    setModal("create");
  };

  const openEdit = async (item) => {
    try {
      const detail = await getQuestionById(item.id, true);
      setSelected(detail);
      const opts = detail.options?.length
        ? detail.options.map((o) => ({
            optionKey: o.optionKey,
            text: o.text || "",
          }))
        : [...DEFAULT_OPTIONS];
      while (opts.length < 4) {
        opts.push({
          optionKey: String.fromCharCode(65 + opts.length),
          text: "",
        });
      }
      setForm({
        stem: detail.stem || "",
        difficultyLevel: detail.difficultyLevel ?? 1,
        publisherId: detail.publisherId || "",
        lessonId: "",
        lessonSubId: detail.lessonSubId || "",
        options: opts.slice(0, 4),
        correctOptionKey:
          detail.options?.find((o) => o.id === detail.correctOptionId)
            ?.optionKey || "A",
      });
      setModal("edit");
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.FETCH_FAILED);
    }
  };

  const openView = async (item) => {
    try {
      const detail = await getQuestionById(item.id, true);
      setSelected(detail);
      setModal("view");
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.FETCH_FAILED);
    }
  };

  const openDelete = (item) => {
    setSelected(item);
    setModal("delete");
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    resetForm();
  };

  const setOptionText = (index, text) => {
    setForm((f) => {
      const opts = [...f.options];
      if (opts[index]) opts[index] = { ...opts[index], text };
      return { ...f, options: opts };
    });
  };

  const buildPayload = () => ({
    stem: form.stem.trim(),
    difficultyLevel: Number(form.difficultyLevel) ?? 1,
    publisherId: form.publisherId?.trim() || undefined,
    lessonSubId: form.lessonSubId?.trim() || undefined,
    options: form.options
      .filter((o) => o.text?.trim())
      .map((o) => ({ optionKey: o.optionKey, text: o.text.trim() })),
    correctOptionKey: form.correctOptionKey,
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.stem.trim()) {
      toast.error("Soru metni zorunludur.");
      return;
    }
    const opts = form.options.filter((o) => o.text?.trim());
    if (opts.length < 2) {
      toast.error("En az 2 şık girilmelidir.");
      return;
    }
    if (!opts.some((o) => o.optionKey === form.correctOptionKey)) {
      toast.error("Doğru şık belirtilmelidir.");
      return;
    }
    setSubmitting(true);
    try {
      await createQuestion(buildPayload());
      toast.success(SUCCESS_MESSAGES.CREATE_SUCCESS);
      closeModal();
      loadQuestions();
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.CREATE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selected) return;
    const opts = form.options.filter((o) => o.text?.trim());
    if (opts.length < 2) {
      toast.error("En az 2 şık girilmelidir.");
      return;
    }
    if (!opts.some((o) => o.optionKey === form.correctOptionKey)) {
      toast.error("Doğru şık belirtilmelidir.");
      return;
    }
    setSubmitting(true);
    try {
      await updateQuestion(selected.id, buildPayload());
      toast.success(SUCCESS_MESSAGES.UPDATE_SUCCESS);
      closeModal();
      loadQuestions();
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.UPDATE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await deleteQuestion(selected.id);
      toast.success(SUCCESS_MESSAGES.DELETE_SUCCESS);
      closeModal();
      loadQuestions();
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.DELETE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  const difficultyLabel = (val) =>
    DIFFICULTY_LEVELS.find((d) => d.value === val)?.label ?? val;

  const getPublisherName = (id) =>
    publishers.find((p) => p.id === id)?.name || "—";

  const openSolutionsModal = async (question) => {
    setSolutionQuestion(question);
    setSolutionModal("list");
    setSolutionLoading(true);
    try {
      const data = await getSolutionsByQuestionId(question.id);
      setSolutionList(Array.isArray(data) ? data : []);
    } catch {
      setSolutionList([]);
      toast.error("Çözümler yüklenemedi.");
    } finally {
      setSolutionLoading(false);
    }
  };

  const closeSolutionsModal = () => {
    setSolutionQuestion(null);
    setSolutionList([]);
    setSolutionModal(null);
    setSolutionEditId(null);
    setSolutionForm({ type: 0, title: "", contentText: "", url: "", orderIndex: 0, isActive: true });
  };

  const openSolutionCreate = () => {
    setSolutionEditId(null);
    setSolutionForm({ type: 0, title: "", contentText: "", url: "", orderIndex: solutionList.length, isActive: true });
    setSolutionModal("create");
  };

  const openSolutionEdit = (sol) => {
    setSolutionEditId(sol.id);
    setSolutionForm({
      type: sol.type ?? 0,
      title: sol.title ?? "",
      contentText: sol.contentText ?? "",
      url: sol.url ?? "",
      orderIndex: sol.orderIndex ?? 0,
      isActive: sol.isActive !== false,
    });
    setSolutionModal("edit");
  };

  const handleSolutionCreate = async (e) => {
    e.preventDefault();
    if (!solutionQuestion) return;
    setSolutionSubmitting(true);
    try {
      await createQuestionSolution({
        questionId: solutionQuestion.id,
        type: solutionForm.type,
        title: solutionForm.title?.trim() || null,
        contentText: solutionForm.contentText?.trim() || null,
        url: solutionForm.url?.trim() || null,
        orderIndex: Number(solutionForm.orderIndex) || 0,
        isActive: solutionForm.isActive,
      });
      toast.success("Çözüm eklendi.");
      const data = await getSolutionsByQuestionId(solutionQuestion.id);
      setSolutionList(Array.isArray(data) ? data : []);
      setSolutionModal("list");
      setSolutionForm({ type: 0, title: "", contentText: "", url: "", orderIndex: 0, isActive: true });
    } catch (err) {
      toast.error(err.response?.data?.Error || err.response?.data?.error || err.message || "Eklenemedi.");
    } finally {
      setSolutionSubmitting(false);
    }
  };

  const handleSolutionUpdate = async (e) => {
    e.preventDefault();
    if (!solutionEditId) return;
    setSolutionSubmitting(true);
    try {
      await updateQuestionSolution(solutionEditId, {
        type: solutionForm.type,
        title: solutionForm.title?.trim() || null,
        contentText: solutionForm.contentText?.trim() || null,
        url: solutionForm.url?.trim() || null,
        orderIndex: Number(solutionForm.orderIndex) || 0,
        isActive: solutionForm.isActive,
      });
      toast.success("Çözüm güncellendi.");
      if (solutionQuestion) {
        const data = await getSolutionsByQuestionId(solutionQuestion.id);
        setSolutionList(Array.isArray(data) ? data : []);
      }
      setSolutionModal("list");
      setSolutionEditId(null);
      setSolutionForm({ type: 0, title: "", contentText: "", url: "", orderIndex: 0, isActive: true });
    } catch (err) {
      toast.error(err.response?.data?.Error || err.response?.data?.error || err.message || "Güncellenemedi.");
    } finally {
      setSolutionSubmitting(false);
    }
  };

  const handleSolutionDelete = async (id) => {
    setSolutionSubmitting(true);
    try {
      await deleteQuestionSolution(id);
      toast.success("Çözüm silindi.");
      if (solutionQuestion) {
        const data = await getSolutionsByQuestionId(solutionQuestion.id);
        setSolutionList(Array.isArray(data) ? data : []);
      }
      setSolutionModal("list");
    } catch (err) {
      toast.error(err.response?.data?.Error || err.response?.data?.error || err.message || "Silinemedi.");
    } finally {
      setSolutionSubmitting(false);
    }
  };

  const solutionTypeLabel = (type) => SOLUTION_TYPES.find((t) => t.value === type)?.label ?? type;

  return (
    <div className="admin-page-wrapper">
      <div className="admin-page-header">
        <h1 className="admin-page-title">
          <Database size={28} className="text-emerald-600" />
          Soru Havuzu
        </h1>
        <button type="button" onClick={openCreate} className="admin-btn admin-btn-primary">
          <Plus size={18} />
          Yeni Soru
        </button>
      </div>

      {/* Filtreler */}
      <div className="admin-card p-4 mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="admin-label">Filtre</label>
            <select
              className="admin-input w-auto min-w-[140px]"
              value={filter.type}
              onChange={(e) =>
                setFilter((f) => ({ ...f, type: e.target.value }))
              }
            >
              <option value="all">Tümü</option>
              <option value="lesson">Derse göre</option>
              <option value="lessonSub">Alt konuya göre</option>
              <option value="publisher">Yayınevine göre</option>
            </select>
          </div>
          {filter.type === "lesson" && (
            <div>
              <label className="admin-label">Ders</label>
              <select
                className="admin-input w-auto min-w-[180px]"
                value={filter.lessonId}
                onChange={(e) =>
                  setFilter((f) => ({ ...f, lessonId: e.target.value }))
                }
              >
                <option value="">Seçin</option>
                {lessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {filter.type === "lessonSub" && (
            <>
              <div>
                <label className="admin-label">Ders</label>
                <select
                  className="admin-input w-auto min-w-[180px]"
                  value={filter.lessonId}
                  onChange={(e) =>
                    setFilter((f) => ({ ...f, lessonId: e.target.value, lessonSubId: "" }))
                  }
                >
                  <option value="">Seçin</option>
                  {lessons.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="admin-label">Alt konu</label>
                <select
                  className="admin-input w-auto min-w-[180px]"
                  value={filter.lessonSubId}
                  onChange={(e) =>
                    setFilter((f) => ({ ...f, lessonSubId: e.target.value }))
                  }
                  disabled={!filter.lessonId}
                >
                  <option value="">{filter.lessonId ? "Seçin" : "Önce ders seçin"}</option>
                  {lessonSubs.map((ls) => (
                    <option key={ls.id} value={ls.id}>{ls.name} ({ls.code})</option>
                  ))}
                </select>
              </div>
            </>
          )}
          {filter.type === "publisher" && (
            <div>
              <label className="admin-label">Yayınevi</label>
              <select
                className="admin-input w-auto min-w-[180px]"
                value={filter.publisherId}
                onChange={(e) =>
                  setFilter((f) => ({ ...f, publisherId: e.target.value }))
                }
              >
                <option value="">Seçin</option>
                {publishers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="admin-loading-center">
          <span className="admin-spinner" />
        </div>
      ) : list.length === 0 ? (
        <div className="admin-empty-state">
          Henüz soru yok veya filtre sonucu boş. &quot;Yeni Soru&quot; ile ekleyebilirsiniz.
        </div>
      ) : (
        <div className="admin-card admin-card-elevated">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Kod</th>
                  <th>Soru metni</th>
                  <th>Zorluk</th>
                  <th>Yayınevi</th>
                  <th>Oluşturulma</th>
                  <th className="text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item) => (
                  <tr key={item.id}>
                    <td className="font-mono text-sm">{item.code || "—"}</td>
                    <td className="max-w-[300px] truncate" title={item.stem}>
                      {item.stem || "—"}
                    </td>
                    <td>{difficultyLabel(item.difficultyLevel)}</td>
                    <td className="text-slate-600 text-sm">
                      {getPublisherName(item.publisherId)}
                    </td>
                    <td className="text-slate-500 text-sm">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="text-right">
                      <div className="admin-exam-actions flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openSolutionsModal(item)}
                          className="admin-btn admin-btn-ghost admin-btn-icon"
                          title="Çözümler"
                        >
                          <BookOpen size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openView(item)}
                          className="admin-btn admin-btn-ghost admin-btn-icon"
                          title="Görüntüle"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="admin-btn admin-btn-ghost admin-btn-icon"
                          title="Düzenle"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDelete(item)}
                          className="admin-btn admin-btn-ghost admin-btn-icon text-red-600 hover:bg-red-50"
                          title="Sil"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create */}
      {modal === "create" && (
        <div className="admin-modal-backdrop" onClick={closeModal}>
          <div
            className="admin-modal admin-modal-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">Yeni Soru</div>
            <form onSubmit={handleCreate}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">
                    Soru metni
                  </label>
                  <textarea
                    className="admin-input min-h-[100px]"
                    value={form.stem}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, stem: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">
                      Yayınevi (opsiyonel)
                    </label>
                    <select
                      className="admin-input"
                      value={form.publisherId}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, publisherId: e.target.value }))
                      }
                    >
                      <option value="">Seçin</option>
                      {publishers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Zorluk</label>
                    <select
                      className="admin-input"
                      value={form.difficultyLevel}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          difficultyLevel: parseInt(e.target.value, 10),
                        }))
                      }
                    >
                      {DIFFICULTY_LEVELS.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Ders</label>
                    <select
                      className="admin-input"
                      value={form.lessonId}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, lessonId: e.target.value, lessonSubId: "" }))
                      }
                    >
                      <option value="">Seçin (opsiyonel)</option>
                      {lessons.map((l) => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Alt konu</label>
                    {form.lessonId ? (
                      <select
                        className="admin-input"
                        value={form.lessonSubId}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, lessonSubId: e.target.value }))
                        }
                      >
                        <option value="">Seçin</option>
                        {lessonSubsForForm.map((ls) => (
                          <option key={ls.id} value={ls.id}>{ls.name} ({ls.code})</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        className="admin-input font-mono text-sm"
                        placeholder="Alt konu ID (Guid)"
                        value={form.lessonSubId}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, lessonSubId: e.target.value }))
                        }
                      />
                    )}
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">
                    Şıklar
                  </label>
                  <div className="space-y-2">
                    {form.options.map((opt, i) => (
                      <div key={opt.optionKey} className="flex items-center gap-2">
                        <span className="w-6 font-medium">{opt.optionKey}.</span>
                        <input
                          type="text"
                          className="admin-input flex-1"
                          placeholder={`Şık ${opt.optionKey}`}
                          value={opt.text}
                          onChange={(e) => setOptionText(i, e.target.value)}
                        />
                        <label className="flex items-center gap-1 shrink-0">
                          <input
                            type="radio"
                            name="correctOption"
                            checked={form.correctOptionKey === opt.optionKey}
                            onChange={() =>
                              setForm((f) => ({
                                ...f,
                                correctOptionKey: opt.optionKey,
                              }))
                            }
                          />
                          <span className="text-sm">Doğru</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={closeModal}
                  className="admin-btn admin-btn-secondary"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="admin-btn admin-btn-primary"
                >
                  {submitting ? "Kaydediliyor…" : "Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit */}
      {modal === "edit" && selected && (
        <div className="admin-modal-backdrop" onClick={closeModal}>
          <div
            className="admin-modal admin-modal-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">Soru Düzenle</div>
            <form onSubmit={handleUpdate}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">
                    Soru metni
                  </label>
                  <textarea
                    className="admin-input min-h-[100px]"
                    value={form.stem}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, stem: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Yayınevi</label>
                    <select
                      className="admin-input"
                      value={form.publisherId}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, publisherId: e.target.value }))
                      }
                    >
                      <option value="">Seçin</option>
                      {publishers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Zorluk</label>
                    <select
                      className="admin-input"
                      value={form.difficultyLevel}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          difficultyLevel: parseInt(e.target.value, 10),
                        }))
                      }
                    >
                      {DIFFICULTY_LEVELS.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Ders</label>
                    <select
                      className="admin-input"
                      value={form.lessonId}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, lessonId: e.target.value, lessonSubId: "" }))
                      }
                    >
                      <option value="">Seçin (opsiyonel)</option>
                      {lessons.map((l) => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Alt konu</label>
                    {form.lessonId ? (
                      <select
                        className="admin-input"
                        value={form.lessonSubId}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, lessonSubId: e.target.value }))
                        }
                      >
                        <option value="">Seçin</option>
                        {lessonSubsForForm.map((ls) => (
                          <option key={ls.id} value={ls.id}>{ls.name} ({ls.code})</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        className="admin-input font-mono text-sm"
                        placeholder="Alt konu ID (Guid)"
                        value={form.lessonSubId}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, lessonSubId: e.target.value }))
                        }
                      />
                    )}
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">
                    Şıklar
                  </label>
                  <div className="space-y-2">
                    {form.options.map((opt, i) => (
                      <div key={opt.optionKey} className="flex items-center gap-2">
                        <span className="w-6 font-medium">{opt.optionKey}.</span>
                        <input
                          type="text"
                          className="admin-input flex-1"
                          value={opt.text}
                          onChange={(e) => setOptionText(i, e.target.value)}
                        />
                        <label className="flex items-center gap-1 shrink-0">
                          <input
                            type="radio"
                            name="correctOptionEdit"
                            checked={form.correctOptionKey === opt.optionKey}
                            onChange={() =>
                              setForm((f) => ({
                                ...f,
                                correctOptionKey: opt.optionKey,
                              }))
                            }
                          />
                          <span className="text-sm">Doğru</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={closeModal}
                  className="admin-btn admin-btn-secondary"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="admin-btn admin-btn-primary"
                >
                  {submitting ? "Güncelleniyor…" : "Güncelle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View */}
      {modal === "view" && selected && (
        <div className="admin-modal-backdrop" onClick={closeModal}>
          <div
            className="admin-modal admin-modal-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">Soru Detayı</div>
            <div className="admin-modal-body space-y-4">
              <p className="text-slate-700 whitespace-pre-wrap">{selected.stem}</p>
              <div className="text-sm text-slate-500">
                Zorluk: {difficultyLabel(selected.difficultyLevel)} | Yayınevi:{" "}
                {getPublisherName(selected.publisherId)}
              </div>
              {selected.options?.length > 0 && (
                <div>
                  <div className="font-medium mb-2">Şıklar:</div>
                  <ul className="space-y-1">
                    {selected.options.map((o) => (
                      <li key={o.id} className="flex items-center gap-2">
                        <span
                          className={
                            o.id === selected.correctOptionId
                              ? "font-bold text-emerald-600"
                              : ""
                          }
                        >
                          {o.optionKey}. {o.text}
                          {o.id === selected.correctOptionId && " ✓"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="text-xs text-slate-400 pt-2">
                Oluşturulma: {formatDate(selected.createdAt)}
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                onClick={closeModal}
                className="admin-btn admin-btn-secondary"
              >
                Kapat
              </button>
              <button
                type="button"
                onClick={() => {
                  setModal(null);
                  openEdit(selected);
                }}
                className="admin-btn admin-btn-primary"
              >
                Düzenle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete */}
      {modal === "delete" && selected && (
        <div className="admin-modal-backdrop" onClick={closeModal}>
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">Soruyu Sil</div>
            <div className="admin-modal-body">
              <p className="text-slate-600">
                Bu soruyu kalıcı olarak silmek istediğinize emin misiniz? Bu
                işlem geri alınamaz.
              </p>
              <p className="text-sm text-slate-500 mt-2 truncate max-w-full">
                {selected.stem}
              </p>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                onClick={closeModal}
                className="admin-btn admin-btn-secondary"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                className="admin-btn admin-btn-danger"
              >
                {submitting ? "Siliniyor…" : "Sil"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Soru çözümleri */}
      {solutionQuestion && (
        <div className="admin-modal-backdrop" onClick={closeSolutionsModal}>
          <div className="admin-modal admin-modal-xl" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header flex items-center justify-between">
              <span className="truncate max-w-[70%]">Çözümler: {solutionQuestion.code ?? solutionQuestion.id}</span>
              <button type="button" onClick={closeSolutionsModal} className="admin-btn admin-btn-ghost admin-btn-icon">×</button>
            </div>
            <div className="admin-modal-body max-h-[70vh] overflow-y-auto">
              {solutionModal === "list" && (
                <>
                  {solutionLoading ? (
                    <div className="admin-loading-center py-8"><span className="admin-spinner" /></div>
                  ) : (
                    <>
                      <div className="flex justify-end mb-3">
                        <button type="button" onClick={openSolutionCreate} className="admin-btn admin-btn-primary admin-btn-sm">
                          <Plus size={16} /> Yeni çözüm
                        </button>
                      </div>
                      {solutionList.length === 0 ? (
                        <div className="admin-empty-state py-8">Bu soru için henüz çözüm yok.</div>
                      ) : (
                        <ul className="space-y-2">
                          {solutionList.map((sol) => (
                            <li key={sol.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                              <div>
                                <span className="admin-badge admin-badge-neutral mr-2">{solutionTypeLabel(sol.type)}</span>
                                <span className="font-medium">{sol.title || "—"}</span>
                                {(sol.type === 0 && sol.contentText) && <p className="text-sm text-slate-600 mt-1 line-clamp-2">{sol.contentText}</p>}
                                {(sol.type === 1 || sol.type === 2 || sol.type === 3) && sol.url && <a href={sol.url} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-600 hover:underline">{sol.url}</a>}
                              </div>
                              <div className="flex gap-1 shrink-0">
                                <button type="button" onClick={() => openSolutionEdit(sol)} className="admin-btn admin-btn-ghost admin-btn-icon" title="Düzenle"><Pencil size={14} /></button>
                                <button type="button" onClick={() => handleSolutionDelete(sol.id)} disabled={solutionSubmitting} className="admin-btn admin-btn-ghost admin-btn-icon text-red-600" title="Sil"><Trash2 size={14} /></button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </>
              )}
              {solutionModal === "create" && (
                <form onSubmit={handleSolutionCreate} className="space-y-4">
                  <div className="admin-form-group">
                    <label className="admin-label">Tip</label>
                    <select className="admin-input" value={solutionForm.type} onChange={(e) => setSolutionForm((f) => ({ ...f, type: parseInt(e.target.value, 10) }))}>
                      {SOLUTION_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Başlık</label>
                    <input type="text" className="admin-input" value={solutionForm.title} onChange={(e) => setSolutionForm((f) => ({ ...f, title: e.target.value }))} placeholder="Örn. Metin açıklaması" />
                  </div>
                  {solutionForm.type === 0 && (
                    <div className="admin-form-group">
                      <label className="admin-label">İçerik metni</label>
                      <textarea className="admin-input min-h-[120px]" value={solutionForm.contentText} onChange={(e) => setSolutionForm((f) => ({ ...f, contentText: e.target.value }))} />
                    </div>
                  )}
                  {(solutionForm.type === 1 || solutionForm.type === 2 || solutionForm.type === 3) && (
                    <div className="admin-form-group">
                      <label className="admin-label">URL</label>
                      <input type="url" className="admin-input" value={solutionForm.url} onChange={(e) => setSolutionForm((f) => ({ ...f, url: e.target.value }))} placeholder="https://..." />
                    </div>
                  )}
                  <div className="admin-form-row admin-form-row-2">
                    <div className="admin-form-group">
                      <label className="admin-label">Sıra</label>
                      <input type="number" className="admin-input" min={0} value={solutionForm.orderIndex} onChange={(e) => setSolutionForm((f) => ({ ...f, orderIndex: e.target.value }))} />
                    </div>
                    <div className="admin-form-group flex items-end">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={solutionForm.isActive} onChange={(e) => setSolutionForm((f) => ({ ...f, isActive: e.target.checked }))} className="rounded border-slate-300 text-emerald-600" />
                        Aktif
                      </label>
                    </div>
                  </div>
                  <div className="admin-modal-footer border-t pt-4 flex gap-2">
                    <button type="button" onClick={() => setSolutionModal("list")} className="admin-btn admin-btn-secondary">İptal</button>
                    <button type="submit" disabled={solutionSubmitting} className="admin-btn admin-btn-primary">{solutionSubmitting ? "Ekleniyor…" : "Ekle"}</button>
                  </div>
                </form>
              )}
              {solutionModal === "edit" && (
                <form onSubmit={handleSolutionUpdate} className="space-y-4">
                  <div className="admin-form-group">
                    <label className="admin-label">Tip</label>
                    <select className="admin-input" value={solutionForm.type} onChange={(e) => setSolutionForm((f) => ({ ...f, type: parseInt(e.target.value, 10) }))}>
                      {SOLUTION_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Başlık</label>
                    <input type="text" className="admin-input" value={solutionForm.title} onChange={(e) => setSolutionForm((f) => ({ ...f, title: e.target.value }))} />
                  </div>
                  {solutionForm.type === 0 && (
                    <div className="admin-form-group">
                      <label className="admin-label">İçerik metni</label>
                      <textarea className="admin-input min-h-[120px]" value={solutionForm.contentText} onChange={(e) => setSolutionForm((f) => ({ ...f, contentText: e.target.value }))} />
                    </div>
                  )}
                  {(solutionForm.type === 1 || solutionForm.type === 2 || solutionForm.type === 3) && (
                    <div className="admin-form-group">
                      <label className="admin-label">URL</label>
                      <input type="url" className="admin-input" value={solutionForm.url} onChange={(e) => setSolutionForm((f) => ({ ...f, url: e.target.value }))} />
                    </div>
                  )}
                  <div className="admin-form-row admin-form-row-2">
                    <div className="admin-form-group">
                      <label className="admin-label">Sıra</label>
                      <input type="number" className="admin-input" min={0} value={solutionForm.orderIndex} onChange={(e) => setSolutionForm((f) => ({ ...f, orderIndex: e.target.value }))} />
                    </div>
                    <div className="admin-form-group flex items-end">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={solutionForm.isActive} onChange={(e) => setSolutionForm((f) => ({ ...f, isActive: e.target.checked }))} className="rounded border-slate-300 text-emerald-600" />
                        Aktif
                      </label>
                    </div>
                  </div>
                  <div className="admin-modal-footer border-t pt-4 flex gap-2">
                    <button type="button" onClick={() => { setSolutionModal("list"); setSolutionEditId(null); }} className="admin-btn admin-btn-secondary">İptal</button>
                    <button type="button" onClick={() => solutionEditId && handleSolutionDelete(solutionEditId)} disabled={solutionSubmitting} className="admin-btn admin-btn-ghost text-red-600">Sil</button>
                    <button type="submit" disabled={solutionSubmitting} className="admin-btn admin-btn-primary">{solutionSubmitting ? "Güncelleniyor…" : "Güncelle"}</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionPool;
