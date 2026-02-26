import { useEffect, useState, useCallback } from "react";
import {
  FileText,
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  Filter,
  RefreshCw,
  X,
  BookOpen,
  ListOrdered,
  Layers,
} from "lucide-react";
import toast from "react-hot-toast";
import { getAllCategories } from "@/services/adminCategoryService";
import { getSubsByCategoryId } from "@/services/adminCategorySubService";
import { getSectionsBySubId } from "@/services/adminCategorySectionService";
import { getFeatureBySubId } from "@/services/adminCategoryFeatureService";
import {
  createBooklet,
  getBookletsByCategorySubId,
  getBookletById,
  createSlotsForSection,
  createSlotsForFeature,
  addQuestionToSlot,
  updateQuestionInSlot,
  removeQuestionFromSlot,
  deleteBooklet,
} from "@/services/adminQuestionBookletService";
import { getAllLessons } from "@/services/adminLessonService";
import { getLessonMainsByLessonId } from "@/services/adminLessonMainService";
import { getLessonSubsByLessonMainId } from "@/services/adminLessonSubService";
import { getAllPublishers } from "@/services/adminPublisherService";
import { getQuestionById } from "@/services/adminQuestionService";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";

const getApiError = (err) =>
  err.response?.data?.Error ||
  err.response?.data?.error ||
  err.message ||
  ERROR_MESSAGES.FETCH_FAILED;

const OPTION_KEYS = ["A", "B", "C", "D", "E"];

const BOOKLET_STATUS_LABELS = {
  0: "Taslak",
  1: "Hazırlanıyor",
  2: "Hazırlandı",
  3: "Tamamlandı",
  4: "SınavAşamasında",
};

const defaultQuestionForm = () => ({
  stem: "",
  options: OPTION_KEYS.slice(0, 4).map((key, i) => ({
    optionKey: key,
    text: "",
    orderIndex: i + 1,
  })),
  correctOptionKey: "A",
  lessonSubId: "",
});

const Booklets = () => {
  const [categories, setCategories] = useState([]);
  const [categorySubs, setCategorySubs] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedCategorySubId, setSelectedCategorySubId] = useState("");
  const [booklets, setBooklets] = useState([]);
  const [bookletsLoading, setBookletsLoading] = useState(false);
  const [selectedBooklet, setSelectedBooklet] = useState(null);
  const [sections, setSections] = useState([]);
  const [feature, setFeature] = useState(null);

  const [modal, setModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({});
  const [flatLessonSubs, setFlatLessonSubs] = useState([]);
  const [publishers, setPublishers] = useState([]);

  const loadCategories = useCallback(async () => {
    try {
      const data = await getAllCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(getApiError(err));
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    getAllPublishers()
      .then((d) => setPublishers(Array.isArray(d) ? d : []))
      .catch(() => setPublishers([]));
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) {
      setCategorySubs([]);
      setSelectedCategorySubId("");
      return;
    }
    let cancelled = false;
    getSubsByCategoryId(selectedCategoryId)
      .then((data) => {
        if (!cancelled) setCategorySubs(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(getApiError(err));
          setCategorySubs([]);
        }
      });
    return () => { cancelled = true; };
  }, [selectedCategoryId]);

  const loadBooklets = useCallback(async () => {
    if (!selectedCategorySubId) {
      setBooklets([]);
      return;
    }
    setBookletsLoading(true);
    try {
      const data = await getBookletsByCategorySubId(selectedCategorySubId);
      setBooklets(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(getApiError(err));
      setBooklets([]);
    } finally {
      setBookletsLoading(false);
    }
  }, [selectedCategorySubId]);

  useEffect(() => {
    loadBooklets();
  }, [loadBooklets]);

  useEffect(() => {
    if (!selectedCategorySubId) {
      setSections([]);
      setFeature(null);
      return;
    }
    let cancelled = false;
    Promise.all([
      getSectionsBySubId(selectedCategorySubId),
      getFeatureBySubId(selectedCategorySubId).catch(() => null),
    ]).then(([secs, feat]) => {
      if (!cancelled) {
        setSections(Array.isArray(secs) ? secs : []);
        setFeature(feat || null);
      }
    });
    return () => { cancelled = true; };
  }, [selectedCategorySubId]);

  const loadBookletDetail = useCallback(async (bookletId) => {
    try {
      const data = await getBookletById(bookletId);
      setSelectedBooklet(data);
      return data;
    } catch (err) {
      toast.error(getApiError(err));
      setSelectedBooklet(null);
    }
  }, []);

  const openCreateBooklet = () => {
    setForm({
      name: "",
      publisherId: "",
      categorySectionIds: [],
    });
    setModal("create-booklet");
  };

  const handleCreateBooklet = async (e) => {
    e.preventDefault();
    if (!selectedCategorySubId || !form.name?.trim()) {
      toast.error("Alt kategori seçin ve kitapçık adı girin.");
      return;
    }
    setSubmitting(true);
    try {
      const created = await createBooklet({
        categorySubId: selectedCategorySubId,
        name: form.name.trim(),
        publisherId: form.publisherId || undefined,
        categorySectionIds:
          Array.isArray(form.categorySectionIds) && form.categorySectionIds.length > 0
            ? form.categorySectionIds
            : undefined,
      });
      toast.success("Kitapçık oluşturuldu.");
      setModal(null);
      loadBooklets();
      if (created?.id) setSelectedBooklet(created);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteBooklet = (booklet) => {
    setForm({ id: booklet.id, name: booklet.name });
    setModal("delete-booklet");
  };

  const handleDeleteBooklet = async () => {
    if (!form.id) return;
    setSubmitting(true);
    try {
      await deleteBooklet(form.id);
      toast.success("Kitapçık silindi.");
      setModal(null);
      loadBooklets();
      if (selectedBooklet?.id === form.id) setSelectedBooklet(null);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const openAddSlotsSection = () => {
    setForm({
      questionBookletId: selectedBooklet?.id,
      categorySectionId: "",
    });
    setModal("add-slots-section");
  };

  const handleAddSlotsSection = async (e) => {
    e.preventDefault();
    if (!form.questionBookletId || !form.categorySectionId) {
      toast.error("Bölüm seçin.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await createSlotsForSection(form.questionBookletId, form.categorySectionId);
      toast.success(result?.message || `${result?.createdCount ?? 0} slot oluşturuldu.`);
      setModal(null);
      loadBookletDetail(selectedBooklet?.id);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const openAddSlotsFeature = () => {
    setForm({ questionBookletId: selectedBooklet?.id });
    setModal("add-slots-feature");
  };

  const handleAddSlotsFeature = async (e) => {
    e.preventDefault();
    if (!feature?.id || !selectedBooklet?.id) {
      toast.error("Sınav özelliği bulunamadı.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await createSlotsForFeature(selectedBooklet.id, feature.id);
      toast.success(result?.message || `${result?.createdCount ?? 0} slot oluşturuldu.`);
      setModal(null);
      loadBookletDetail(selectedBooklet.id);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const loadLessonSubsAndPublishers = useCallback(async () => {
    try {
      const [lessons, pubList] = await Promise.all([
        getAllLessons(),
        getAllPublishers().then((d) => (Array.isArray(d) ? d : [])),
      ]);
      setPublishers(pubList);
      const mains = await Promise.all(
        (Array.isArray(lessons) ? lessons : []).map((l) => getLessonMainsByLessonId(l.id))
      );
      const flatMains = mains.flat();
      const subArrays = await Promise.all(
        flatMains.map((m) => getLessonSubsByLessonMainId(m.id))
      );
      setFlatLessonSubs(subArrays.flat());
    } catch {
      setFlatLessonSubs([]);
      setPublishers([]);
    }
  }, []);

  const openAddQuestion = (slot) => {
    setForm({
      slotId: slot.id,
      slotOrderIndex: slot.orderIndex,
      ...defaultQuestionForm(),
    });
    setModal("add-question");
    loadLessonSubsAndPublishers();
  };

  const openEditQuestion = async (slot) => {
    loadLessonSubsAndPublishers();
    let stem = slot.stem ?? "";
    let options = (slot.options || []).map((o, i) => ({
      optionKey: o.optionKey ?? OPTION_KEYS[i] ?? "A",
      text: o.text ?? "",
      orderIndex: o.orderIndex ?? i + 1,
    }));
    let correctOptionKey = slot.correctOptionKey ?? "A";
    let lessonSubId = slot.lessonSubId ?? "";
    if (slot.questionId) {
      try {
        const q = await getQuestionById(slot.questionId);
        stem = q.stem ?? stem;
        correctOptionKey = q.correctOptionKey ?? correctOptionKey;
        if (q.lessonSubId) lessonSubId = q.lessonSubId;
        if (Array.isArray(q.options) && q.options.length > 0) {
          options = q.options.map((o, i) => ({
            optionKey: o.optionKey ?? OPTION_KEYS[i] ?? "A",
            text: o.text ?? "",
            orderIndex: o.orderIndex ?? i + 1,
          }));
        }
      } catch {
        // keep slot values
      }
    }
    if (options.length === 0) {
      OPTION_KEYS.slice(0, 4).forEach((key, i) => {
        options.push({ optionKey: key, text: "", orderIndex: i + 1 });
      });
    }
    setForm({
      slotId: slot.id,
      slotOrderIndex: slot.orderIndex,
      stem,
      options,
      correctOptionKey,
      lessonSubId,
    });
    setModal("edit-question");
  };

  const openRemoveQuestion = (slot) => {
    setForm({
      slotId: slot.id,
      stem: slot.stem || `Soru #${slot.orderIndex}`,
    });
    setModal("remove-question");
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!form.slotId || !form.stem?.trim()) {
      toast.error("Soru metni zorunludur.");
      return;
    }
    const options = (form.options || []).filter((o) => (o.text ?? "").toString().trim() !== "");
    if (options.length < 2) {
      toast.error("En az 2 şık girin.");
      return;
    }
    if (!form.correctOptionKey || !options.some((o) => o.optionKey === form.correctOptionKey)) {
      toast.error("Doğru cevap seçin.");
      return;
    }
    setSubmitting(true);
    try {
      await addQuestionToSlot(form.slotId, {
        stem: form.stem.trim(),
        options,
        correctOptionKey: form.correctOptionKey,
        lessonSubId: form.lessonSubId || undefined,
      });
      toast.success("Soru eklendi.");
      setModal(null);
      loadBookletDetail(selectedBooklet?.id);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    if (!form.slotId) return;
    const options = (form.options || []).filter((o) => (o.text ?? "").toString().trim() !== "");
    if (options.length < 2) {
      toast.error("En az 2 şık girin.");
      return;
    }
    setSubmitting(true);
    try {
      await updateQuestionInSlot(form.slotId, {
        stem: form.stem?.trim(),
        options,
        correctOptionKey: form.correctOptionKey,
        lessonSubId: form.lessonSubId || undefined,
      });
      toast.success(SUCCESS_MESSAGES.UPDATE_SUCCESS);
      setModal(null);
      loadBookletDetail(selectedBooklet?.id);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveQuestion = async () => {
    if (!form.slotId) return;
    setSubmitting(true);
    try {
      await removeQuestionFromSlot(form.slotId);
      toast.success("Soru slottan kaldırıldı.");
      setModal(null);
      loadBookletDetail(selectedBooklet?.id);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const slotsBySection = (selectedBooklet?.slots || []).reduce((acc, slot) => {
    const key = slot.categorySectionId || "unknown";
    if (!acc[key]) acc[key] = { sectionName: slot.categorySectionName, slots: [] };
    acc[key].slots.push(slot);
    return acc;
  }, {});
  const sectionGroups = Object.entries(slotsBySection).map(([id, g]) => ({
    categorySectionId: id,
    sectionName: g.sectionName,
    slots: g.slots.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)),
  }));

  const renderModal = () => {
    if (!modal) return null;

    if (modal === "create-booklet") {
      return (
        <div className="admin-modal-backdrop" onClick={() => !submitting && setModal(null)}>
          <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header flex items-center justify-between">
              <span>Yeni kitapçık</span>
              <button type="button" className="admin-btn admin-btn-icon admin-btn-ghost" onClick={() => !submitting && setModal(null)} aria-label="Kapat">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateBooklet}>
              <div className="admin-modal-body space-y-4">
                {selectedCategorySubId && (
                  <p className="text-sm text-slate-600">
                    Alt kategori: <strong>{categorySubs.find((s) => s.id === selectedCategorySubId)?.name ?? selectedCategorySubId}</strong>
                  </p>
                )}
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Kitapçık adı</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={form.name ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Örn. TYT Deneme Kitapçık 1"
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Yayınevi (opsiyonel)</label>
                  <select
                    className="admin-input"
                    value={form.publisherId ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, publisherId: e.target.value }))}
                  >
                    <option value="">—</option>
                    {publishers.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Bölümler (opsiyonel — seçilen bölümler için slot oluşturulur)</label>
                  <div className="border border-slate-200 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                    {sections.map((sec) => (
                      <label key={sec.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(form.categorySectionIds || []).includes(sec.id)}
                          onChange={(e) => {
                            const ids = form.categorySectionIds || [];
                            setForm((f) => ({
                              ...f,
                              categorySectionIds: e.target.checked
                                ? [...ids, sec.id]
                                : ids.filter((i) => i !== sec.id),
                            }));
                          }}
                          className="rounded border-slate-300 text-emerald-600"
                        />
                        <span className="text-sm">{sec.name} (soru: {sec.questionCount ?? 0})</span>
                      </label>
                    ))}
                    {sections.length === 0 && (
                      <p className="text-sm text-slate-500">Bu alt kategoriye ait bölüm yok.</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setModal(null)} disabled={submitting}>İptal</button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={submitting}>
                  {submitting ? <span className="admin-spinner w-5 h-5 border-2" /> : "Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    if (modal === "delete-booklet") {
      return (
        <div className="admin-modal-backdrop" onClick={() => !submitting && setModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">Kitapçığı sil</div>
            <div className="admin-modal-body">
              <p className="text-slate-600">
                <strong>{form.name}</strong> kitapçığı ve tüm slotları kalıcı olarak silinecek. Onaylıyor musunuz?
              </p>
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setModal(null)} disabled={submitting}>İptal</button>
              <button type="button" className="admin-btn admin-btn-danger" onClick={handleDeleteBooklet} disabled={submitting}>
                {submitting ? <span className="admin-spinner w-5 h-5 border-2" /> : "Sil"}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (modal === "add-slots-section") {
      return (
        <div className="admin-modal-backdrop" onClick={() => !submitting && setModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header flex items-center justify-between">
              <span>Tek bölüm için slot oluştur</span>
              <button type="button" className="admin-btn admin-btn-icon admin-btn-ghost" onClick={() => !submitting && setModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddSlotsSection}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Bölüm</label>
                  <select
                    className="admin-input"
                    value={form.categorySectionId ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, categorySectionId: e.target.value }))}
                    required
                  >
                    <option value="">Seçin</option>
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.questionCount ?? 0} soru)</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setModal(null)} disabled={submitting}>İptal</button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={submitting}>{submitting ? <span className="admin-spinner w-5 h-5 border-2" /> : "Slot oluştur"}</button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    if (modal === "add-slots-feature") {
      return (
        <div className="admin-modal-backdrop" onClick={() => !submitting && setModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header flex items-center justify-between">
              <span>Tüm bölümler için slot oluştur</span>
              <button type="button" className="admin-btn admin-btn-icon admin-btn-ghost" onClick={() => !submitting && setModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddSlotsFeature}>
              <div className="admin-modal-body">
                <p className="text-slate-600 text-sm">
                  Bu alt kategoriye ait sınav özelliğindeki tüm bölümler için eksik slotlar oluşturulacak.
                </p>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setModal(null)} disabled={submitting}>İptal</button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={submitting}>{submitting ? <span className="admin-spinner w-5 h-5 border-2" /> : "Oluştur"}</button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    if (modal === "add-question" || modal === "edit-question") {
      const isEdit = modal === "edit-question";
      return (
        <div className="admin-modal-backdrop" onClick={() => !submitting && setModal(null)}>
          <div className="admin-modal admin-modal-xl" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header flex items-center justify-between">
              <span>{isEdit ? "Soruyu düzenle" : "Slota soru ekle"}</span>
              <button type="button" className="admin-btn admin-btn-icon admin-btn-ghost" onClick={() => !submitting && setModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={isEdit ? handleUpdateQuestion : handleAddQuestion}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Soru metni (Stem)</label>
                  <textarea
                    className="admin-input min-h-[100px]"
                    value={form.stem ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, stem: e.target.value }))}
                    placeholder="Soru metnini girin..."
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Şıklar</label>
                  <div className="space-y-2">
                    {(form.options || []).map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-6 font-mono text-slate-500">{opt.optionKey}</span>
                        <input
                          type="text"
                          className="admin-input flex-1"
                          value={opt.text ?? ""}
                          onChange={(e) => {
                            const opts = [...(form.options || [])];
                            opts[idx] = { ...opts[idx], text: e.target.value };
                            setForm((f) => ({ ...f, options: opts }));
                          }}
                          placeholder={`Şık ${opt.optionKey}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Doğru cevap</label>
                  <select
                    className="admin-input"
                    value={form.correctOptionKey ?? "A"}
                    onChange={(e) => setForm((f) => ({ ...f, correctOptionKey: e.target.value }))}
                  >
                    {(form.options || []).map((o) => (
                      <option key={o.optionKey} value={o.optionKey}>{o.optionKey}</option>
                    ))}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Alt konu (LessonSub)</label>
                  <select
                    className="admin-input"
                    value={form.lessonSubId ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, lessonSubId: e.target.value }))}
                  >
                    <option value="">—</option>
                    {flatLessonSubs.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setModal(null)} disabled={submitting}>İptal</button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={submitting}>{submitting ? <span className="admin-spinner w-5 h-5 border-2" /> : isEdit ? "Kaydet" : "Ekle"}</button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    if (modal === "remove-question") {
      return (
        <div className="admin-modal-backdrop" onClick={() => !submitting && setModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">Soruyu slottan kaldır</div>
            <div className="admin-modal-body">
              <p className="text-slate-600">
                Slottaki soru kaldırılacak (slot boş kalır). Onaylıyor musunuz?
              </p>
              {form.stem && (
                <p className="mt-2 text-sm text-slate-500 truncate max-w-md">{form.stem}</p>
              )}
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setModal(null)} disabled={submitting}>İptal</button>
              <button type="button" className="admin-btn admin-btn-danger" onClick={handleRemoveQuestion} disabled={submitting}>{submitting ? <span className="admin-spinner w-5 h-5 border-2" /> : "Kaldır"}</button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="booklets-page p-4 sm:p-6 md:p-8">
      <div className="admin-page-header admin-page-header-gradient mb-6 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="admin-page-title text-slate-800">
            <FileText size={28} className="text-emerald-600" aria-hidden />
            Kitapçıklar
          </h1>
        </div>
        <p className="text-sm text-slate-600 mt-1">
          QuestionBooklet ve slot yönetimi; slota soru ekleme, güncelleme ve kaldırma.
        </p>
      </div>

      <div className="booklets-layout grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="booklets-sidebar lg:col-span-4 xl:col-span-3">
          <div className="admin-card overflow-hidden rounded-xl border border-slate-200 shadow-sm">
            <div className="booklets-filter-header px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
              <Filter size={18} className="text-slate-500" />
              <span className="font-semibold text-slate-700">Filtre</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="admin-label text-xs text-slate-500 uppercase tracking-wide">Kategori</label>
                <select
                  className="admin-input mt-1"
                  value={selectedCategoryId}
                  onChange={(e) => {
                    setSelectedCategoryId(e.target.value);
                    setSelectedCategorySubId("");
                  }}
                >
                  <option value="">Seçin</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="admin-label text-xs text-slate-500 uppercase tracking-wide">Alt kategori</label>
                <select
                  className="admin-input mt-1"
                  value={selectedCategorySubId}
                  onChange={(e) => setSelectedCategorySubId(e.target.value)}
                  disabled={!selectedCategoryId}
                >
                  <option value="">Seçin</option>
                  {categorySubs.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="admin-btn admin-btn-secondary w-full flex items-center justify-center gap-2"
                onClick={loadBooklets}
                disabled={bookletsLoading || !selectedCategorySubId}
              >
                <RefreshCw size={16} className={bookletsLoading ? "animate-spin" : ""} />
                Yenile
              </button>
            </div>
            <div className="booklets-list-header px-4 py-3 border-t border-slate-200 flex items-center justify-between bg-white">
              <span className="font-semibold text-slate-700">Kitapçıklar</span>
              <button
                type="button"
                className="admin-btn admin-btn-primary admin-btn-icon"
                onClick={openCreateBooklet}
                disabled={!selectedCategorySubId}
                title="Yeni kitapçık"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="booklets-list-body max-h-[420px] overflow-y-auto">
              {!selectedCategorySubId ? (
                <div className="admin-empty-state py-8 px-4 text-sm">Önce alt kategori seçin.</div>
              ) : bookletsLoading ? (
                <div className="admin-loading-center py-12"><span className="admin-spinner" /></div>
              ) : booklets.length === 0 ? (
                <div className="admin-empty-state py-8 px-4 text-sm">Kitapçık yok. Yeni kitapçık ekleyin.</div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {booklets.map((b) => (
                    <li key={b.id}>
                      <button
                        type="button"
                        className={`booklets-list-item w-full px-4 py-3 flex items-center justify-between gap-2 text-left transition-colors ${
                          selectedBooklet?.id === b.id ? "bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800" : "hover:bg-slate-50 text-slate-700"
                        }`}
                        onClick={() => loadBookletDetail(b.id)}
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-medium truncate block">{b.name}</span>
                          <span className="text-xs text-slate-400">{b.code} · {BOOKLET_STATUS_LABELS[b.status] ?? b.status}</span>
                        </div>
                        <ChevronRight size={18} className="text-slate-400 flex-shrink-0" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </aside>

        <main className="booklets-detail lg:col-span-8 xl:col-span-9 space-y-6">
          {!selectedBooklet ? (
            <div className="admin-card admin-empty-state rounded-xl py-16 px-6">
              <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">Kitapçık seçin</p>
              <p className="text-sm text-slate-400 mt-1">Soldan bir kitapçık seçerek slotları ve soruları yönetin.</p>
            </div>
          ) : (
            <>
              <div className="booklets-detail-card admin-card rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="booklets-detail-header px-5 py-4 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-emerald-50 to-white border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <FileText size={24} className="text-emerald-600" />
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">{selectedBooklet.name}</h2>
                      <p className="text-xs text-slate-500">
                      {selectedBooklet.categorySubName ?? "—"} · Kod: {selectedBooklet.code ?? "—"}
                      {selectedBooklet.status != null && (
                        <span className="ml-2">
                          · <span className="admin-badge admin-badge-neutral">{BOOKLET_STATUS_LABELS[selectedBooklet.status] ?? selectedBooklet.status}</span>
                        </span>
                      )}
                    </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" className="admin-btn admin-btn-secondary flex items-center gap-2" onClick={openAddSlotsSection} disabled={sections.length === 0}>
                      <Layers size={16} /> Bölüm için slot
                    </button>
                    {feature?.id && (
                      <button type="button" className="admin-btn admin-btn-secondary flex items-center gap-2" onClick={openAddSlotsFeature}>
                        <ListOrdered size={16} /> Tüm bölümler için slot
                      </button>
                    )}
                    <button type="button" className="admin-btn admin-btn-icon admin-btn-ghost text-red-600 hover:bg-red-50" onClick={() => openDeleteBooklet(selectedBooklet)} title="Kitapçığı sil">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {sectionGroups.length === 0 ? (
                <div className="admin-card admin-empty-state rounded-xl py-10 px-6">
                  <p className="text-slate-500">Henüz slot yok. &quot;Bölüm için slot&quot; veya &quot;Tüm bölümler için slot&quot; ile ekleyin.</p>
                </div>
              ) : (
                sectionGroups.map((group) => (
                  <section key={group.categorySectionId} className="booklets-section admin-card rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="booklets-section-header px-5 py-3 flex items-center justify-between bg-slate-50 border-b border-slate-200">
                      <h3 className="font-semibold text-slate-800">{group.sectionName}</h3>
                      <span className="text-sm text-slate-500">{group.slots.length} slot</span>
                    </div>
                    <div className="booklets-section-body overflow-x-auto">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th className="w-16">Sıra</th>
                            <th>Soru / Stem</th>
                            <th>Kod</th>
                            <th className="w-40">İşlem</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.slots.map((slot) => (
                            <tr key={slot.id}>
                              <td className="font-mono text-slate-600">{slot.orderIndex ?? 0}</td>
                              <td className="max-w-md">
                                {slot.questionId ? (
                                  <span className="text-slate-800 truncate block" title={slot.stem}>{slot.stem || slot.questionCode || "—"}</span>
                                ) : (
                                  <span className="text-slate-400 italic">Boş slot</span>
                                )}
                              </td>
                              <td><code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">{slot.questionCode ?? "—"}</code></td>
                              <td>
                                <div className="flex items-center gap-1 flex-wrap">
                                  {slot.questionId ? (
                                    <>
                                      <button type="button" className="admin-btn admin-btn-ghost admin-btn-icon" onClick={() => openEditQuestion(slot)} title="Düzenle"><Pencil size={14} /></button>
                                      <button type="button" className="admin-btn admin-btn-ghost admin-btn-icon text-red-600 hover:bg-red-50" onClick={() => openRemoveQuestion(slot)} title="Soruyu kaldır"><Trash2 size={14} /></button>
                                    </>
                                  ) : (
                                    <button type="button" className="admin-btn admin-btn-primary flex items-center gap-1" onClick={() => openAddQuestion(slot)}>
                                      <Plus size={14} /> Soru ekle
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                ))
              )}
            </>
          )}
        </main>
      </div>

      {renderModal()}
    </div>
  );
};

export default Booklets;
