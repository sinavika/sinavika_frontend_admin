import { useEffect, useState, useCallback } from "react";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  Layers,
  FolderTree,
  FileText,
  Sparkles,
  Filter,
  RefreshCw,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { getAllCategories } from "@/services/adminCategoryService";
import { getSubsByCategoryId } from "@/services/adminCategorySubService";
import {
  getAllLessons,
  getLessonsByCategorySubId,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
} from "@/services/adminLessonService";
import {
  getLessonMainsByLessonId,
  getLessonMainById,
  createLessonMain,
  updateLessonMain,
  deleteLessonMain,
} from "@/services/adminLessonMainService";
import {
  getLessonSubsByLessonMainId,
  getLessonSubById,
  createLessonSub,
  updateLessonSub,
  deleteLessonSub,
} from "@/services/adminLessonSubService";
import {
  getMikrosByLessonSubId,
  getLessonMikroById,
  createLessonMikro,
  updateLessonMikro,
  deleteLessonMikro,
} from "@/services/adminLessonMikroService";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";

const getApiError = (err) =>
  err.response?.data?.Error || err.response?.data?.error || err.message || ERROR_MESSAGES.FETCH_FAILED;

const Lessons = () => {
  const [categories, setCategories] = useState([]);
  const [categorySubs, setCategorySubs] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedCategorySubId, setSelectedCategorySubId] = useState("");
  const [lessons, setLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lessonMains, setLessonMains] = useState([]);
  const [lessonMainsLoading, setLessonMainsLoading] = useState(false);
  const [selectedLessonMain, setSelectedLessonMain] = useState(null);
  const [lessonSubs, setLessonSubs] = useState([]);
  const [lessonSubsLoading, setLessonSubsLoading] = useState(false);
  const [selectedLessonSub, setSelectedLessonSub] = useState(null);
  const [lessonMikros, setLessonMikros] = useState([]);
  const [lessonMikrosLoading, setLessonMikrosLoading] = useState(false);

  const [modal, setModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({});
  const [createModalSubs, setCreateModalSubs] = useState([]);

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
    if (!selectedCategoryId) {
      setCategorySubs([]);
      setSelectedCategorySubId("");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await getSubsByCategoryId(selectedCategoryId);
        if (!cancelled) setCategorySubs(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) {
          toast.error(getApiError(err));
          setCategorySubs([]);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [selectedCategoryId]);

  const loadLessons = useCallback(async () => {
    setLessonsLoading(true);
    try {
      const data = selectedCategorySubId
        ? await getLessonsByCategorySubId(selectedCategorySubId)
        : await getAllLessons();
      setLessons(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(getApiError(err));
      setLessons([]);
    } finally {
      setLessonsLoading(false);
    }
  }, [selectedCategorySubId]);

  useEffect(() => {
    loadLessons();
  }, [loadLessons]);

  useEffect(() => {
    if (!selectedLesson?.id) {
      setLessonMains([]);
      setSelectedLessonMain(null);
      return;
    }
    setLessonMainsLoading(true);
    getLessonMainsByLessonId(selectedLesson.id)
      .then((data) => setLessonMains(Array.isArray(data) ? data : []))
      .catch((err) => {
        toast.error(getApiError(err));
        setLessonMains([]);
      })
      .finally(() => setLessonMainsLoading(false));
    setSelectedLessonMain(null);
  }, [selectedLesson?.id]);

  useEffect(() => {
    if (!selectedLessonMain?.id) {
      setLessonSubs([]);
      setSelectedLessonSub(null);
      return;
    }
    setLessonSubsLoading(true);
    getLessonSubsByLessonMainId(selectedLessonMain.id)
      .then((data) => setLessonSubs(Array.isArray(data) ? data : []))
      .catch((err) => {
        toast.error(getApiError(err));
        setLessonSubs([]);
      })
      .finally(() => setLessonSubsLoading(false));
    setSelectedLessonSub(null);
  }, [selectedLessonMain?.id]);

  useEffect(() => {
    if (!selectedLessonSub?.id) {
      setLessonMikros([]);
      return;
    }
    setLessonMikrosLoading(true);
    getMikrosByLessonSubId(selectedLessonSub.id)
      .then((data) => setLessonMikros(Array.isArray(data) ? data : []))
      .catch((err) => {
        toast.error(getApiError(err));
        setLessonMikros([]);
      })
      .finally(() => setLessonMikrosLoading(false));
  }, [selectedLessonSub?.id]);

  const openLessonCreate = () => {
    const catId = selectedCategoryId || (categories[0]?.id ?? "");
    setForm({
      categoryId: catId,
      categorySubId: selectedCategorySubId || "",
      name: "",
      orderIndex: lessons.length,
      isActive: true,
    });
    setCreateModalSubs(catId ? categorySubs : []);
    if (catId && !categorySubs.length) {
      getSubsByCategoryId(catId).then((data) => setCreateModalSubs(Array.isArray(data) ? data : []));
    }
    setModal("lesson-create");
  };

  const openLessonEdit = (lesson) => {
    setForm({
      name: lesson.name ?? "",
      orderIndex: lesson.orderIndex ?? 0,
      isActive: lesson.isActive !== false,
    });
    setModal("lesson-edit");
  };

  const openLessonDelete = (lesson) => {
    setForm({ id: lesson.id, name: lesson.name });
    setModal("lesson-delete");
  };

  const handleLessonCreate = async (e) => {
    e.preventDefault();
    if (!form.categorySubId || !form.name?.trim()) {
      toast.error("Alt kategori ve ders adı zorunludur.");
      return;
    }
    setSubmitting(true);
    try {
      await createLesson({
        categorySubId: form.categorySubId,
        name: form.name.trim(),
        orderIndex: Number(form.orderIndex) ?? 0,
        isActive: form.isActive !== false,
      });
      toast.success("Ders listesi oluşturuldu.");
      setModal(null);
      loadLessons();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleLessonUpdate = async (e) => {
    e.preventDefault();
    if (!selectedLesson?.id) return;
    setSubmitting(true);
    try {
      await updateLesson(selectedLesson.id, {
        name: form.name?.trim(),
        orderIndex: Number(form.orderIndex),
        isActive: form.isActive,
      });
      toast.success(SUCCESS_MESSAGES.UPDATE_SUCCESS);
      setModal(null);
      loadLessons();
      setSelectedLesson((prev) =>
        prev?.id === selectedLesson.id
          ? { ...prev, ...form, orderIndex: Number(form.orderIndex) }
          : prev
      );
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleLessonDelete = async () => {
    if (!form.id) return;
    setSubmitting(true);
    try {
      await deleteLesson(form.id);
      toast.success("Ders listesi pasif hale getirildi.");
      setModal(null);
      loadLessons();
      if (selectedLesson?.id === form.id) setSelectedLesson(null);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const openLessonMainCreate = () => {
    setForm({
      code: "",
      name: "",
      description: "",
      orderIndex: lessonMains.length,
      isActive: true,
    });
    setModal("lesson-main-create");
  };

  const openLessonMainEdit = (main) => {
    setForm({
      id: main.id,
      code: main.code ?? "",
      name: main.name ?? "",
      description: main.description ?? "",
      orderIndex: main.orderIndex ?? 0,
      isActive: main.isActive !== false,
    });
    setModal("lesson-main-edit");
  };

  const openLessonMainDelete = (main) => {
    setForm({ id: main.id, name: main.name });
    setModal("lesson-main-delete");
  };

  const handleLessonMainCreate = async (e) => {
    e.preventDefault();
    if (!selectedLesson?.id || !form.code?.trim() || !form.name?.trim()) {
      toast.error("Kod ve ad zorunludur.");
      return;
    }
    setSubmitting(true);
    try {
      await createLessonMain(selectedLesson.id, {
        code: form.code.trim(),
        name: form.name.trim(),
        description: form.description?.trim() || null,
        orderIndex: Number(form.orderIndex) ?? 0,
        isActive: form.isActive !== false,
      });
      toast.success("Ders içeriği oluşturuldu.");
      setModal(null);
      const data = await getLessonMainsByLessonId(selectedLesson.id);
      setLessonMains(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleLessonMainUpdate = async (e) => {
    e.preventDefault();
    if (!form.id) return;
    setSubmitting(true);
    try {
      await updateLessonMain(form.id, {
        code: form.code?.trim(),
        name: form.name?.trim(),
        description: form.description?.trim() || null,
        orderIndex: Number(form.orderIndex),
        isActive: form.isActive,
      });
      toast.success(SUCCESS_MESSAGES.UPDATE_SUCCESS);
      setModal(null);
      if (selectedLesson?.id) {
        const data = await getLessonMainsByLessonId(selectedLesson.id);
        setLessonMains(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleLessonMainDelete = async () => {
    if (!form.id) return;
    setSubmitting(true);
    try {
      await deleteLessonMain(form.id);
      toast.success("Ders içeriği silindi.");
      setModal(null);
      if (selectedLesson?.id) {
        const data = await getLessonMainsByLessonId(selectedLesson.id);
        setLessonMains(Array.isArray(data) ? data : []);
      }
      if (selectedLessonMain?.id === form.id) setSelectedLessonMain(null);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const openLessonSubCreate = () => {
    setForm({
      code: "",
      name: "",
      description: "",
      orderIndex: lessonSubs.length,
      isActive: true,
    });
    setModal("lesson-sub-create");
  };

  const openLessonSubEdit = (sub) => {
    setForm({
      id: sub.id,
      code: sub.code ?? "",
      name: sub.name ?? "",
      description: sub.description ?? "",
      orderIndex: sub.orderIndex ?? 0,
      isActive: sub.isActive !== false,
    });
    setModal("lesson-sub-edit");
  };

  const openLessonSubDelete = (sub) => {
    setForm({ id: sub.id, name: sub.name });
    setModal("lesson-sub-delete");
  };

  const handleLessonSubCreate = async (e) => {
    e.preventDefault();
    if (!selectedLessonMain?.id || !form.code?.trim() || !form.name?.trim()) {
      toast.error("Kod ve ad zorunludur.");
      return;
    }
    setSubmitting(true);
    try {
      await createLessonSub(selectedLessonMain.id, {
        code: form.code.trim(),
        name: form.name.trim(),
        description: form.description?.trim() || null,
        orderIndex: Number(form.orderIndex) ?? 0,
        isActive: form.isActive !== false,
      });
      toast.success("Alt konu oluşturuldu.");
      setModal(null);
      const data = await getLessonSubsByLessonMainId(selectedLessonMain.id);
      setLessonSubs(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleLessonSubUpdate = async (e) => {
    e.preventDefault();
    if (!form.id) return;
    setSubmitting(true);
    try {
      await updateLessonSub(form.id, {
        code: form.code?.trim(),
        name: form.name?.trim(),
        description: form.description?.trim() || null,
        orderIndex: Number(form.orderIndex),
        isActive: form.isActive,
      });
      toast.success(SUCCESS_MESSAGES.UPDATE_SUCCESS);
      setModal(null);
      if (selectedLessonMain?.id) {
        const data = await getLessonSubsByLessonMainId(selectedLessonMain.id);
        setLessonSubs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleLessonSubDelete = async () => {
    if (!form.id) return;
    setSubmitting(true);
    try {
      await deleteLessonSub(form.id);
      toast.success("Alt konu silindi.");
      setModal(null);
      if (selectedLessonMain?.id) {
        const data = await getLessonSubsByLessonMainId(selectedLessonMain.id);
        setLessonSubs(Array.isArray(data) ? data : []);
      }
      if (selectedLessonSub?.id === form.id) setSelectedLessonSub(null);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const openLessonMikroCreate = () => {
    setForm({
      code: "",
      name: "",
      description: "",
      orderIndex: lessonMikros.length,
      isActive: true,
    });
    setModal("lesson-mikro-create");
  };

  const openLessonMikroEdit = (mikro) => {
    setForm({
      id: mikro.id,
      code: mikro.code ?? "",
      name: mikro.name ?? "",
      description: mikro.description ?? "",
      orderIndex: mikro.orderIndex ?? 0,
      isActive: mikro.isActive !== false,
    });
    setModal("lesson-mikro-edit");
  };

  const openLessonMikroDelete = (mikro) => {
    setForm({ id: mikro.id, name: mikro.name });
    setModal("lesson-mikro-delete");
  };

  const handleLessonMikroCreate = async (e) => {
    e.preventDefault();
    if (!selectedLessonSub?.id || !form.code?.trim() || !form.name?.trim()) {
      toast.error("Kod ve ad zorunludur.");
      return;
    }
    setSubmitting(true);
    try {
      await createLessonMikro(selectedLessonSub.id, {
        code: form.code.trim(),
        name: form.name.trim(),
        description: form.description?.trim() || null,
        orderIndex: Number(form.orderIndex) ?? 0,
        isActive: form.isActive !== false,
      });
      toast.success("Mikro konu oluşturuldu.");
      setModal(null);
      const data = await getMikrosByLessonSubId(selectedLessonSub.id);
      setLessonMikros(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleLessonMikroUpdate = async (e) => {
    e.preventDefault();
    if (!form.id) return;
    setSubmitting(true);
    try {
      await updateLessonMikro(form.id, {
        code: form.code?.trim(),
        name: form.name?.trim(),
        description: form.description?.trim() || null,
        orderIndex: Number(form.orderIndex),
        isActive: form.isActive,
      });
      toast.success(SUCCESS_MESSAGES.UPDATE_SUCCESS);
      setModal(null);
      if (selectedLessonSub?.id) {
        const data = await getMikrosByLessonSubId(selectedLessonSub.id);
        setLessonMikros(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleLessonMikroDelete = async () => {
    if (!form.id) return;
    setSubmitting(true);
    try {
      await deleteLessonMikro(form.id);
      toast.success("Mikro konu silindi.");
      setModal(null);
      if (selectedLessonSub?.id) {
        const data = await getMikrosByLessonSubId(selectedLessonSub.id);
        setLessonMikros(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const renderModal = () => {
    if (!modal) return null;

    if (modal === "lesson-create") {
      return (
        <div className="admin-modal-backdrop" onClick={() => !submitting && setModal(null)}>
          <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header flex items-center justify-between">
              <span>Yeni ders listesi</span>
              <button type="button" className="admin-btn admin-btn-icon admin-btn-ghost" onClick={() => !submitting && setModal(null)} aria-label="Kapat">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleLessonCreate}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Kategori</label>
                  <select
                    className="admin-input"
                    value={form.categoryId ?? ""}
                    onChange={(e) => {
                      const id = e.target.value;
                      setForm((f) => ({ ...f, categoryId: id, categorySubId: "" }));
                      getSubsByCategoryId(id).then((data) => setCreateModalSubs(Array.isArray(data) ? data : []));
                    }}
                    required
                  >
                    <option value="">Seçin</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Alt kategori</label>
                  <select
                    className="admin-input"
                    value={form.categorySubId}
                    onChange={(e) => setForm((f) => ({ ...f, categorySubId: e.target.value }))}
                    required
                  >
                    <option value="">Seçin</option>
                    {createModalSubs.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Ad</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={form.name ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Örn. Türkçe"
                    required
                  />
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Sıra</label>
                    <input
                      type="number"
                      min={0}
                      className="admin-input"
                      value={form.orderIndex ?? 0}
                      onChange={(e) => setForm((f) => ({ ...f, orderIndex: e.target.value }))}
                    />
                  </div>
                  <div className="admin-form-group flex items-center gap-2 pt-8">
                    <input
                      type="checkbox"
                      id="lesson-active"
                      checked={form.isActive !== false}
                      onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="lesson-active" className="admin-label mb-0">Aktif</label>
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

    if (modal === "lesson-edit") {
      const currentLesson = selectedLesson;
      if (!currentLesson) return null;
      return (
        <div className="admin-modal-backdrop" onClick={() => !submitting && setModal(null)}>
          <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header flex items-center justify-between">
              <span>Ders listesini düzenle</span>
              <button type="button" className="admin-btn admin-btn-icon admin-btn-ghost" onClick={() => !submitting && setModal(null)} aria-label="Kapat">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleLessonUpdate}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Ad</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={form.name ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Sıra</label>
                    <input
                      type="number"
                      min={0}
                      className="admin-input"
                      value={form.orderIndex ?? 0}
                      onChange={(e) => setForm((f) => ({ ...f, orderIndex: e.target.value }))}
                    />
                  </div>
                  <div className="admin-form-group flex items-center gap-2 pt-8">
                    <input
                      type="checkbox"
                      id="lesson-edit-active"
                      checked={form.isActive !== false}
                      onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="lesson-edit-active" className="admin-label mb-0">Aktif</label>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setModal(null)} disabled={submitting}>İptal</button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={submitting}>
                  {submitting ? <span className="admin-spinner w-5 h-5 border-2" /> : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    if (modal === "lesson-delete") {
      return (
        <div className="admin-modal-backdrop" onClick={() => !submitting && setModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">Dersi pasif yap</div>
            <div className="admin-modal-body">
              <p className="text-slate-600">
                <strong>{form.name}</strong> ders listesini pasif yapmak istediğinize emin misiniz? (Soft delete)
              </p>
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setModal(null)} disabled={submitting}>İptal</button>
              <button type="button" className="admin-btn admin-btn-danger" onClick={handleLessonDelete} disabled={submitting}>
                {submitting ? <span className="admin-spinner w-5 h-5 border-2" /> : "Pasif yap"}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (modal === "lesson-main-create") {
      return (
        <div className="admin-modal-backdrop" onClick={() => !submitting && setModal(null)}>
          <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header flex items-center justify-between">
              <span>Yeni ders içeriği (LessonMain)</span>
              <button type="button" className="admin-btn admin-btn-icon admin-btn-ghost" onClick={() => !submitting && setModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleLessonMainCreate}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Kod</label>
                    <input type="text" className="admin-input" value={form.code ?? ""} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} placeholder="TR" required />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Ad</label>
                    <input type="text" className="admin-input" value={form.name ?? ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Türkçe" required />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Açıklama</label>
                  <textarea className="admin-input min-h-[80px]" value={form.description ?? ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Sıra</label>
                    <input type="number" min={0} className="admin-input" value={form.orderIndex ?? 0} onChange={(e) => setForm((f) => ({ ...f, orderIndex: e.target.value }))} />
                  </div>
                  <div className="admin-form-group flex items-center gap-2 pt-8">
                    <input type="checkbox" checked={form.isActive !== false} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="rounded border-slate-300 text-emerald-600" />
                    <label className="admin-label mb-0">Aktif</label>
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
      );
    }

    if (modal === "lesson-main-edit") {
      return (
        <div className="admin-modal-backdrop" onClick={() => !submitting && setModal(null)}>
          <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header flex items-center justify-between">
              <span>Ders içeriğini düzenle</span>
              <button type="button" className="admin-btn admin-btn-icon admin-btn-ghost" onClick={() => !submitting && setModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleLessonMainUpdate}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Kod</label>
                    <input type="text" className="admin-input" value={form.code ?? ""} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} required />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Ad</label>
                    <input type="text" className="admin-input" value={form.name ?? ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Açıklama</label>
                  <textarea className="admin-input min-h-[80px]" value={form.description ?? ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Sıra</label>
                    <input type="number" min={0} className="admin-input" value={form.orderIndex ?? 0} onChange={(e) => setForm((f) => ({ ...f, orderIndex: e.target.value }))} />
                  </div>
                  <div className="admin-form-group flex items-center gap-2 pt-8">
                    <input type="checkbox" checked={form.isActive !== false} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="rounded border-slate-300 text-emerald-600" />
                    <label className="admin-label mb-0">Aktif</label>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setModal(null)} disabled={submitting}>İptal</button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={submitting}>{submitting ? <span className="admin-spinner w-5 h-5 border-2" /> : "Kaydet"}</button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    if (modal === "lesson-main-delete") {
      const main = lessonMains.find((m) => m.id === form.id) || { id: form.id, name: form.name };
      return (
        <div className="admin-modal-backdrop" onClick={() => !submitting && setModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">Ders içeriğini sil</div>
            <div className="admin-modal-body">
              <p className="text-slate-600"><strong>{main.name}</strong> kalıcı olarak silinecek. Onaylıyor musunuz?</p>
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setModal(null)} disabled={submitting}>İptal</button>
              <button type="button" className="admin-btn admin-btn-danger" onClick={handleLessonMainDelete} disabled={submitting}>{submitting ? <span className="admin-spinner w-5 h-5 border-2" /> : "Sil"}</button>
            </div>
          </div>
        </div>
      );
    }

    if (modal === "lesson-sub-create") {
      return (
        <div className="admin-modal-backdrop" onClick={() => !submitting && setModal(null)}>
          <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header flex items-center justify-between">
              <span>Yeni alt konu (LessonSub)</span>
              <button type="button" className="admin-btn admin-btn-icon admin-btn-ghost" onClick={() => !submitting && setModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleLessonSubCreate}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Kod</label>
                    <input type="text" className="admin-input" value={form.code ?? ""} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} placeholder="TR_OKUMA" required />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Ad</label>
                    <input type="text" className="admin-input" value={form.name ?? ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Okuma" required />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Açıklama</label>
                  <textarea className="admin-input min-h-[80px]" value={form.description ?? ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Sıra</label>
                    <input type="number" min={0} className="admin-input" value={form.orderIndex ?? 0} onChange={(e) => setForm((f) => ({ ...f, orderIndex: e.target.value }))} />
                  </div>
                  <div className="admin-form-group flex items-center gap-2 pt-8">
                    <input type="checkbox" checked={form.isActive !== false} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="rounded border-slate-300 text-emerald-600" />
                    <label className="admin-label mb-0">Aktif</label>
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
      );
    }

    if (modal === "lesson-sub-edit") {
      return (
        <div className="admin-modal-backdrop" onClick={() => !submitting && setModal(null)}>
          <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header flex items-center justify-between">
              <span>Alt konuyu düzenle</span>
              <button type="button" className="admin-btn admin-btn-icon admin-btn-ghost" onClick={() => !submitting && setModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleLessonSubUpdate}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Kod</label>
                    <input type="text" className="admin-input" value={form.code ?? ""} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} required />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Ad</label>
                    <input type="text" className="admin-input" value={form.name ?? ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Açıklama</label>
                  <textarea className="admin-input min-h-[80px]" value={form.description ?? ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Sıra</label>
                    <input type="number" min={0} className="admin-input" value={form.orderIndex ?? 0} onChange={(e) => setForm((f) => ({ ...f, orderIndex: e.target.value }))} />
                  </div>
                  <div className="admin-form-group flex items-center gap-2 pt-8">
                    <input type="checkbox" checked={form.isActive !== false} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="rounded border-slate-300 text-emerald-600" />
                    <label className="admin-label mb-0">Aktif</label>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setModal(null)} disabled={submitting}>İptal</button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={submitting}>{submitting ? <span className="admin-spinner w-5 h-5 border-2" /> : "Kaydet"}</button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    if (modal === "lesson-sub-delete") {
      return (
        <div className="admin-modal-backdrop" onClick={() => !submitting && setModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">Alt konuyu sil</div>
            <div className="admin-modal-body">
              <p className="text-slate-600"><strong>{form.name}</strong> kalıcı olarak silinecek. Onaylıyor musunuz?</p>
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setModal(null)} disabled={submitting}>İptal</button>
              <button type="button" className="admin-btn admin-btn-danger" onClick={handleLessonSubDelete} disabled={submitting}>{submitting ? <span className="admin-spinner w-5 h-5 border-2" /> : "Sil"}</button>
            </div>
          </div>
        </div>
      );
    }

    if (modal === "lesson-mikro-create") {
      return (
        <div className="admin-modal-backdrop" onClick={() => !submitting && setModal(null)}>
          <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header flex items-center justify-between">
              <span>Yeni mikro konu</span>
              <button type="button" className="admin-btn admin-btn-icon admin-btn-ghost" onClick={() => !submitting && setModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleLessonMikroCreate}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Kod</label>
                    <input type="text" className="admin-input" value={form.code ?? ""} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} placeholder="TR_OKUMA_ANLAMA" required />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Ad</label>
                    <input type="text" className="admin-input" value={form.name ?? ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Okuma ve anlama" required />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Açıklama</label>
                  <textarea className="admin-input min-h-[80px]" value={form.description ?? ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Sıra</label>
                    <input type="number" min={0} className="admin-input" value={form.orderIndex ?? 0} onChange={(e) => setForm((f) => ({ ...f, orderIndex: e.target.value }))} />
                  </div>
                  <div className="admin-form-group flex items-center gap-2 pt-8">
                    <input type="checkbox" checked={form.isActive !== false} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="rounded border-slate-300 text-emerald-600" />
                    <label className="admin-label mb-0">Aktif</label>
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
      );
    }

    if (modal === "lesson-mikro-edit") {
      return (
        <div className="admin-modal-backdrop" onClick={() => !submitting && setModal(null)}>
          <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header flex items-center justify-between">
              <span>Mikro konuyu düzenle</span>
              <button type="button" className="admin-btn admin-btn-icon admin-btn-ghost" onClick={() => !submitting && setModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleLessonMikroUpdate}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Kod</label>
                    <input type="text" className="admin-input" value={form.code ?? ""} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} required />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Ad</label>
                    <input type="text" className="admin-input" value={form.name ?? ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Açıklama</label>
                  <textarea className="admin-input min-h-[80px]" value={form.description ?? ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Sıra</label>
                    <input type="number" min={0} className="admin-input" value={form.orderIndex ?? 0} onChange={(e) => setForm((f) => ({ ...f, orderIndex: e.target.value }))} />
                  </div>
                  <div className="admin-form-group flex items-center gap-2 pt-8">
                    <input type="checkbox" checked={form.isActive !== false} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="rounded border-slate-300 text-emerald-600" />
                    <label className="admin-label mb-0">Aktif</label>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setModal(null)} disabled={submitting}>İptal</button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={submitting}>{submitting ? <span className="admin-spinner w-5 h-5 border-2" /> : "Kaydet"}</button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    if (modal === "lesson-mikro-delete") {
      return (
        <div className="admin-modal-backdrop" onClick={() => !submitting && setModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">Mikro konuyu sil</div>
            <div className="admin-modal-body">
              <p className="text-slate-600"><strong>{form.name}</strong> kalıcı olarak silinecek. Onaylıyor musunuz?</p>
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setModal(null)} disabled={submitting}>İptal</button>
              <button type="button" className="admin-btn admin-btn-danger" onClick={handleLessonMikroDelete} disabled={submitting}>{submitting ? <span className="admin-spinner w-5 h-5 border-2" /> : "Sil"}</button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="lessons-page p-4 sm:p-6 md:p-8">
      <div className="admin-page-header admin-page-header-gradient mb-6 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="admin-page-title text-slate-800">
            <BookOpen size={28} className="text-emerald-600" aria-hidden />
            Dersler
          </h1>
        </div>
        <p className="text-sm text-slate-600 mt-1">
          CategorySub → Lesson → LessonMain → LessonSub → LessonMikro hiyerarşisini yönetin.
        </p>
      </div>

      <div className="lessons-layout grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lessons-sidebar lg:col-span-4 xl:col-span-3">
          <div className="admin-card overflow-hidden rounded-xl border border-slate-200 shadow-sm">
            <div className="lessons-filter-header px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
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
                  <option value="">Tümü</option>
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
                  <option value="">Tüm dersler</option>
                  {categorySubs.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="admin-btn admin-btn-secondary w-full flex items-center justify-center gap-2"
                onClick={loadLessons}
                disabled={lessonsLoading}
              >
                <RefreshCw size={16} className={lessonsLoading ? "animate-spin" : ""} />
                Yenile
              </button>
            </div>
            <div className="lessons-list-header px-4 py-3 border-t border-slate-200 flex items-center justify-between bg-white">
              <span className="font-semibold text-slate-700">Ders listesi</span>
              <button
                type="button"
                className="admin-btn admin-btn-primary admin-btn-icon"
                onClick={openLessonCreate}
                title="Yeni ders"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="lessons-list-body max-h-[420px] overflow-y-auto">
              {lessonsLoading ? (
                <div className="admin-loading-center py-12">
                  <span className="admin-spinner" />
                </div>
              ) : lessons.length === 0 ? (
                <div className="admin-empty-state py-8 px-4 text-sm">
                  Ders yok. Alt kategori seçip filtreleyebilir veya yeni ders ekleyebilirsiniz.
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {lessons.map((lesson) => (
                    <li key={lesson.id}>
                      <button
                        type="button"
                        className={`lessons-list-item w-full px-4 py-3 flex items-center justify-between gap-2 text-left transition-colors ${
                          selectedLesson?.id === lesson.id
                            ? "bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                        onClick={() => setSelectedLesson(lesson)}
                      >
                        <span className="font-medium truncate">{lesson.name}</span>
                        <ChevronRight size={18} className="text-slate-400 flex-shrink-0" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </aside>

        <main className="lessons-detail lg:col-span-8 xl:col-span-9 space-y-6">
          {!selectedLesson ? (
            <div className="admin-card admin-empty-state rounded-xl py-16 px-6">
              <Layers size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">Ders seçin</p>
              <p className="text-sm text-slate-400 mt-1">Soldan bir ders seçerek içeriklerini yönetin.</p>
            </div>
          ) : (
            <>
              <div className="lessons-detail-card admin-card rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="lessons-detail-header px-5 py-4 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-emerald-50 to-white border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <BookOpen size={24} className="text-emerald-600" />
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">{selectedLesson.name}</h2>
                      <p className="text-xs text-slate-500">{selectedLesson.categorySubName ?? "—"} · Sıra: {selectedLesson.orderIndex ?? 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={selectedLesson.isActive !== false ? "admin-badge admin-badge-success" : "admin-badge admin-badge-danger"}>
                      {selectedLesson.isActive !== false ? "Aktif" : "Pasif"}
                    </span>
                    <button type="button" className="admin-btn admin-btn-icon admin-btn-ghost" onClick={() => openLessonEdit(selectedLesson)} title="Düzenle">
                      <Pencil size={18} />
                    </button>
                    <button type="button" className="admin-btn admin-btn-icon admin-btn-ghost text-red-600 hover:bg-red-50" onClick={() => openLessonDelete(selectedLesson)} title="Pasif yap">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <section className="lessons-section admin-card rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="lessons-section-header px-5 py-3 flex items-center justify-between bg-slate-50 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <FileText size={20} className="text-slate-600" />
                    <h3 className="font-semibold text-slate-800">Ders içerikleri (LessonMain)</h3>
                  </div>
                  <button type="button" className="admin-btn admin-btn-primary flex items-center gap-2" onClick={openLessonMainCreate} disabled={!selectedLesson?.id}>
                    <Plus size={16} /> Ekle
                  </button>
                </div>
                <div className="lessons-section-body overflow-x-auto">
                  {lessonMainsLoading ? (
                    <div className="admin-loading-center py-12"><span className="admin-spinner" /></div>
                  ) : lessonMains.length === 0 ? (
                    <div className="admin-empty-state py-10 px-4 text-sm">Henüz ders içeriği yok. Ekle ile ekleyin.</div>
                  ) : (
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Kod</th>
                          <th>Ad</th>
                          <th>Sıra</th>
                          <th>Durum</th>
                          <th className="w-24">İşlem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lessonMains.map((m) => (
                          <tr
                            key={m.id}
                            className={selectedLessonMain?.id === m.id ? "bg-emerald-50/60" : ""}
                          >
                            <td><code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">{m.code}</code></td>
                            <td>
                              <button type="button" className="font-medium text-slate-800 hover:text-emerald-600 text-left" onClick={() => setSelectedLessonMain(m)}>
                                {m.name}
                              </button>
                            </td>
                            <td>{m.orderIndex ?? 0}</td>
                            <td>{m.isActive !== false ? <span className="admin-badge admin-badge-success">Aktif</span> : <span className="admin-badge admin-badge-danger">Pasif</span>}</td>
                            <td>
                              <div className="flex items-center gap-1">
                                <button type="button" className="admin-btn admin-btn-icon admin-btn-ghost" onClick={() => openLessonMainEdit(m)} title="Düzenle"><Pencil size={14} /></button>
                                <button type="button" className="admin-btn admin-btn-icon admin-btn-ghost text-red-600 hover:bg-red-50" onClick={() => openLessonMainDelete(m)} title="Sil"><Trash2 size={14} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </section>

              {selectedLessonMain && (
                <section className="lessons-section admin-card rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="lessons-section-header px-5 py-3 flex items-center justify-between bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <FolderTree size={20} className="text-slate-600" />
                      <h3 className="font-semibold text-slate-800">Alt konular (LessonSub)</h3>
                      <span className="text-slate-500 text-sm">— {selectedLessonMain.name}</span>
                    </div>
                    <button type="button" className="admin-btn admin-btn-primary flex items-center gap-2" onClick={openLessonSubCreate}>
                      <Plus size={16} /> Ekle
                    </button>
                  </div>
                  <div className="lessons-section-body overflow-x-auto">
                    {lessonSubsLoading ? (
                      <div className="admin-loading-center py-12"><span className="admin-spinner" /></div>
                    ) : lessonSubs.length === 0 ? (
                      <div className="admin-empty-state py-10 px-4 text-sm">Henüz alt konu yok.</div>
                    ) : (
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Kod</th>
                            <th>Ad</th>
                            <th>Sıra</th>
                            <th>Durum</th>
                            <th className="w-24">İşlem</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lessonSubs.map((s) => (
                            <tr key={s.id} className={selectedLessonSub?.id === s.id ? "bg-emerald-50/60" : ""}>
                              <td><code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">{s.code}</code></td>
                              <td>
                                <button type="button" className="font-medium text-slate-800 hover:text-emerald-600 text-left" onClick={() => setSelectedLessonSub(s)}>{s.name}</button>
                              </td>
                              <td>{s.orderIndex ?? 0}</td>
                              <td>{s.isActive !== false ? <span className="admin-badge admin-badge-success">Aktif</span> : <span className="admin-badge admin-badge-danger">Pasif</span>}</td>
                              <td>
                                <div className="flex items-center gap-1">
                                  <button type="button" className="admin-btn admin-btn-icon admin-btn-ghost" onClick={() => openLessonSubEdit(s)} title="Düzenle"><Pencil size={14} /></button>
                                  <button type="button" className="admin-btn admin-btn-icon admin-btn-ghost text-red-600 hover:bg-red-50" onClick={() => openLessonSubDelete(s)} title="Sil"><Trash2 size={14} /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </section>
              )}

              {selectedLessonSub && (
                <section className="lessons-section admin-card rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="lessons-section-header px-5 py-3 flex items-center justify-between bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Sparkles size={20} className="text-slate-600" />
                      <h3 className="font-semibold text-slate-800">Mikro konular (LessonMikro)</h3>
                      <span className="text-slate-500 text-sm">— {selectedLessonSub.name}</span>
                    </div>
                    <button type="button" className="admin-btn admin-btn-primary flex items-center gap-2" onClick={openLessonMikroCreate}>
                      <Plus size={16} /> Ekle
                    </button>
                  </div>
                  <div className="lessons-section-body overflow-x-auto">
                    {lessonMikrosLoading ? (
                      <div className="admin-loading-center py-12"><span className="admin-spinner" /></div>
                    ) : lessonMikros.length === 0 ? (
                      <div className="admin-empty-state py-10 px-4 text-sm">Henüz mikro konu yok.</div>
                    ) : (
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Kod</th>
                            <th>Ad</th>
                            <th>Sıra</th>
                            <th>Durum</th>
                            <th className="w-24">İşlem</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lessonMikros.map((mikro) => (
                            <tr key={mikro.id}>
                              <td><code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">{mikro.code}</code></td>
                              <td className="font-medium">{mikro.name}</td>
                              <td>{mikro.orderIndex ?? 0}</td>
                              <td>{mikro.isActive !== false ? <span className="admin-badge admin-badge-success">Aktif</span> : <span className="admin-badge admin-badge-danger">Pasif</span>}</td>
                              <td>
                                <div className="flex items-center gap-1">
                                  <button type="button" className="admin-btn admin-btn-icon admin-btn-ghost" onClick={() => openLessonMikroEdit(mikro)} title="Düzenle"><Pencil size={14} /></button>
                                  <button type="button" className="admin-btn admin-btn-icon admin-btn-ghost text-red-600 hover:bg-red-50" onClick={() => openLessonMikroDelete(mikro)} title="Sil"><Trash2 size={14} /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>

      {renderModal()}
    </div>
  );
};

export default Lessons;
