import { useEffect, useState, useCallback } from "react";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  Layers,
  FileText,
  FolderTree,
  Sparkles,
  Sliders,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getAllLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonMainsByLessonId,
  createLessonMain,
  updateLessonMain,
  deleteLessonMain,
  getLessonSubsByLessonMainId,
  createLessonSub,
  updateLessonSub,
  deleteLessonSub,
  getMikrosByLessonSubId,
  createLessonMikro,
  updateLessonMikro,
  deleteLessonMikro,
} from "@/services/adminLessonService";
import { getAllCategories } from "@/services/adminCategoryService";
import { getSubsByCategoryId } from "@/services/adminCategorySubService";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";
const Lessons = () => {
  const [lessons, setLessons] = useState([]);
  const [categorySubs, setCategorySubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategorySubId, setFilterCategorySubId] = useState("");

  const [selectedLesson, setSelectedLesson] = useState(null);
  const [mains, setMains] = useState([]);
  const [mainsLoading, setMainsLoading] = useState(false);
  const [selectedMain, setSelectedMain] = useState(null);
  const [subs, setSubs] = useState([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  const [mikros, setMikros] = useState([]);
  const [mikrosLoading, setMikrosLoading] = useState(false);

  const [lessonModal, setLessonModal] = useState(null); // "create" | "edit" | "delete"
  const [mainModal, setMainModal] = useState(null);
  const [subModal, setSubModal] = useState(null);
  const [mikroModal, setMikroModal] = useState(null);

  const [selectedForEdit, setSelectedForEdit] = useState(null);
  const [selectedForDelete, setSelectedForDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [lessonForm, setLessonForm] = useState({
    categorySubId: "",
    name: "",
    orderIndex: 0,
    isActive: true,
  });
  const [mainForm, setMainForm] = useState({
    code: "",
    name: "",
    description: "",
    orderIndex: 0,
    isActive: true,
  });
  const [subForm, setSubForm] = useState({
    code: "",
    name: "",
    description: "",
    orderIndex: 0,
    isActive: true,
  });
  const [mikroForm, setMikroForm] = useState({
    code: "",
    name: "",
    description: "",
    orderIndex: 0,
    isActive: true,
  });

  const loadCategorySubs = useCallback(async () => {
    try {
      const categories = await getAllCategories();
      const subsByCat = await Promise.all(
        (categories || []).map((c) => getSubsByCategoryId(c.id))
      );
      const flat = (categories || []).flatMap((c, i) =>
        (subsByCat[i] || []).map((s) => ({
          ...s,
          categoryName: c.name,
          label: `${c.name} — ${s.name}`,
        }))
      );
      setCategorySubs(flat);
    } catch {
      setCategorySubs([]);
    }
  }, []);

  const loadLessons = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllLessons();
      setLessons(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.FETCH_FAILED);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLessons();
    loadCategorySubs();
  }, [loadLessons, loadCategorySubs]);

  const loadMains = useCallback(
    async (lessonId) => {
      if (!lessonId) return;
      setMainsLoading(true);
      try {
        const data = await getLessonMainsByLessonId(lessonId);
        setMains(Array.isArray(data) ? data : []);
        setSelectedMain(null);
        setSubs([]);
        setSelectedSub(null);
        setMikros([]);
      } catch (err) {
        toast.error(err.message || ERROR_MESSAGES.FETCH_FAILED);
        setMains([]);
      } finally {
        setMainsLoading(false);
      }
    },
    []
  );

  const loadSubs = useCallback(async (lessonId, mainId) => {
    if (!lessonId || !mainId) return;
    setSubsLoading(true);
    try {
      const data = await getLessonSubsByLessonMainId(lessonId, mainId);
      setSubs(Array.isArray(data) ? data : []);
      setSelectedSub(null);
      setMikros([]);
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.FETCH_FAILED);
      setSubs([]);
    } finally {
      setSubsLoading(false);
    }
  }, []);

  const loadMikros = useCallback(async (lessonId, mainId, subId) => {
    if (!lessonId || !mainId || !subId) return;
    setMikrosLoading(true);
    try {
      const data = await getMikrosByLessonSubId(lessonId, mainId, subId);
      setMikros(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.FETCH_FAILED);
      setMikros([]);
    } finally {
      setMikrosLoading(false);
    }
  }, []);

  const openLessonDetail = (lesson) => {
    setSelectedLesson(lesson);
    setSelectedMain(null);
    setSelectedSub(null);
    setSubs([]);
    setMikros([]);
    loadMains(lesson.id);
  };

  const openMainDetail = (main) => {
    setSelectedMain(main);
    setSelectedSub(null);
    setMikros([]);
    if (selectedLesson) loadSubs(selectedLesson.id, main.id);
  };

  const openSubDetail = (sub) => {
    setSelectedSub(sub);
    if (selectedLesson && selectedMain)
      loadMikros(selectedLesson.id, selectedMain.id, sub.id);
  };

  const filteredLessons =
    filterCategorySubId === ""
      ? lessons
      : lessons.filter((l) => String(l.categorySubId) === filterCategorySubId);

  // ——— Lesson CRUD ———
  const openLessonCreate = () => {
    setLessonForm({
      categorySubId: categorySubs[0]?.id ?? "",
      name: "",
      orderIndex: filteredLessons.length,
      isActive: true,
    });
    setLessonModal("create");
  };

  const openLessonEdit = (lesson) => {
    setSelectedForEdit(lesson);
    setLessonForm({
      categorySubId: lesson.categorySubId,
      name: lesson.name ?? "",
      orderIndex: lesson.orderIndex ?? 0,
      isActive: lesson.isActive !== false,
    });
    setLessonModal("edit");
  };

  const openLessonDelete = (lesson) => {
    setSelectedForDelete(lesson);
    setLessonModal("delete");
  };

  const handleLessonCreate = async (e) => {
    e.preventDefault();
    if (!lessonForm.categorySubId || !lessonForm.name?.trim()) {
      toast.error("Alt kategori ve ders adı zorunludur.");
      return;
    }
    setSubmitting(true);
    try {
      await createLesson({
        categorySubId: lessonForm.categorySubId,
        name: lessonForm.name.trim(),
        orderIndex: Number(lessonForm.orderIndex) ?? 0,
        isActive: lessonForm.isActive,
      });
      toast.success(SUCCESS_MESSAGES.CREATE_SUCCESS);
      setLessonModal(null);
      loadLessons();
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || ERROR_MESSAGES.CREATE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLessonUpdate = async (e) => {
    e.preventDefault();
    if (!selectedForEdit) return;
    setSubmitting(true);
    try {
      await updateLesson(selectedForEdit.id, {
        name: lessonForm.name?.trim() || undefined,
        orderIndex: Number(lessonForm.orderIndex),
        isActive: lessonForm.isActive,
      });
      toast.success(SUCCESS_MESSAGES.UPDATE_SUCCESS);
      setLessonModal(null);
      setSelectedForEdit(null);
      loadLessons();
      if (selectedLesson?.id === selectedForEdit.id) {
        const updated = await getLessonById(selectedForEdit.id).catch(() => null);
        if (updated) setSelectedLesson(updated);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || ERROR_MESSAGES.UPDATE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLessonDelete = async () => {
    if (!selectedForDelete) return;
    setSubmitting(true);
    try {
      await deleteLesson(selectedForDelete.id);
      toast.success(SUCCESS_MESSAGES.DELETE_SUCCESS);
      setLessonModal(null);
      setSelectedForDelete(null);
      if (selectedLesson?.id === selectedForDelete.id) {
        setSelectedLesson(null);
        setMains([]);
        setSelectedMain(null);
        setSubs([]);
        setSelectedSub(null);
        setMikros([]);
      }
      loadLessons();
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || ERROR_MESSAGES.DELETE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  // ——— Main CRUD ———
  const openMainCreate = () => {
    setMainForm({
      code: "",
      name: "",
      description: "",
      orderIndex: mains.length,
      isActive: true,
    });
    setMainModal("create");
  };

  const openMainEdit = (main) => {
    setSelectedForEdit(main);
    setMainForm({
      code: main.code ?? "",
      name: main.name ?? "",
      description: main.description ?? "",
      orderIndex: main.orderIndex ?? 0,
      isActive: main.isActive !== false,
    });
    setMainModal("edit");
  };

  const openMainDelete = (main) => {
    setSelectedForDelete(main);
    setMainModal("delete");
  };

  const handleMainCreate = async (e) => {
    e.preventDefault();
    if (!selectedLesson || !mainForm.code?.trim() || !mainForm.name?.trim()) {
      toast.error("Kod ve ana konu adı zorunludur.");
      return;
    }
    setSubmitting(true);
    try {
      await createLessonMain(selectedLesson.id, {
        code: mainForm.code.trim(),
        name: mainForm.name.trim(),
        description: mainForm.description?.trim() || null,
        orderIndex: Number(mainForm.orderIndex) ?? 0,
        isActive: mainForm.isActive,
      });
      toast.success(SUCCESS_MESSAGES.CREATE_SUCCESS);
      setMainModal(null);
      loadMains(selectedLesson.id);
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || ERROR_MESSAGES.CREATE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMainUpdate = async (e) => {
    e.preventDefault();
    if (!selectedLesson || !selectedForEdit) return;
    setSubmitting(true);
    try {
      await updateLessonMain(selectedLesson.id, selectedForEdit.id, {
        code: mainForm.code?.trim() || undefined,
        name: mainForm.name?.trim() || undefined,
        description: mainForm.description?.trim() || null,
        orderIndex: Number(mainForm.orderIndex),
        isActive: mainForm.isActive,
      });
      toast.success(SUCCESS_MESSAGES.UPDATE_SUCCESS);
      setMainModal(null);
      setSelectedForEdit(null);
      loadMains(selectedLesson.id);
      if (selectedMain?.id === selectedForEdit.id) {
        setSelectedMain((m) => (m?.id === selectedForEdit.id ? { ...m, ...mainForm } : m));
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || ERROR_MESSAGES.UPDATE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMainDelete = async () => {
    if (!selectedLesson || !selectedForDelete) return;
    setSubmitting(true);
    try {
      await deleteLessonMain(selectedLesson.id, selectedForDelete.id);
      toast.success(SUCCESS_MESSAGES.DELETE_SUCCESS);
      setMainModal(null);
      setSelectedForDelete(null);
      if (selectedMain?.id === selectedForDelete.id) {
        setSelectedMain(null);
        setSubs([]);
        setSelectedSub(null);
        setMikros([]);
      }
      loadMains(selectedLesson.id);
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || ERROR_MESSAGES.DELETE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  // ——— Sub CRUD ———
  const openSubCreate = () => {
    setSubForm({
      code: "",
      name: "",
      description: "",
      orderIndex: subs.length,
      isActive: true,
    });
    setSubModal("create");
  };

  const openSubEdit = (sub) => {
    setSelectedForEdit(sub);
    setSubForm({
      code: sub.code ?? "",
      name: sub.name ?? "",
      description: sub.description ?? "",
      orderIndex: sub.orderIndex ?? 0,
      isActive: sub.isActive !== false,
    });
    setSubModal("edit");
  };

  const openSubDelete = (sub) => {
    setSelectedForDelete(sub);
    setSubModal("delete");
  };

  const handleSubCreate = async (e) => {
    e.preventDefault();
    if (!selectedLesson || !selectedMain || !subForm.code?.trim() || !subForm.name?.trim()) {
      toast.error("Kod ve alt konu adı zorunludur.");
      return;
    }
    setSubmitting(true);
    try {
      await createLessonSub(selectedLesson.id, selectedMain.id, {
        code: subForm.code.trim(),
        name: subForm.name.trim(),
        description: subForm.description?.trim() || null,
        orderIndex: Number(subForm.orderIndex) ?? 0,
        isActive: subForm.isActive,
      });
      toast.success(SUCCESS_MESSAGES.CREATE_SUCCESS);
      setSubModal(null);
      loadSubs(selectedLesson.id, selectedMain.id);
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || ERROR_MESSAGES.CREATE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubUpdate = async (e) => {
    e.preventDefault();
    if (!selectedLesson || !selectedMain || !selectedForEdit) return;
    setSubmitting(true);
    try {
      await updateLessonSub(selectedLesson.id, selectedMain.id, selectedForEdit.id, {
        code: subForm.code?.trim() || undefined,
        name: subForm.name?.trim() || undefined,
        description: subForm.description?.trim() || null,
        orderIndex: Number(subForm.orderIndex),
        isActive: subForm.isActive,
      });
      toast.success(SUCCESS_MESSAGES.UPDATE_SUCCESS);
      setSubModal(null);
      setSelectedForEdit(null);
      loadSubs(selectedLesson.id, selectedMain.id);
      if (selectedSub?.id === selectedForEdit.id) {
        setSelectedSub((s) => (s?.id === selectedForEdit.id ? { ...s, ...subForm } : s));
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || ERROR_MESSAGES.UPDATE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubDelete = async () => {
    if (!selectedLesson || !selectedMain || !selectedForDelete) return;
    setSubmitting(true);
    try {
      await deleteLessonSub(selectedLesson.id, selectedMain.id, selectedForDelete.id);
      toast.success(SUCCESS_MESSAGES.DELETE_SUCCESS);
      setSubModal(null);
      setSelectedForDelete(null);
      if (selectedSub?.id === selectedForDelete.id) {
        setSelectedSub(null);
        setMikros([]);
      }
      loadSubs(selectedLesson.id, selectedMain.id);
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || ERROR_MESSAGES.DELETE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  // ——— Mikro CRUD ———
  const openMikroCreate = () => {
    setMikroForm({
      code: "",
      name: "",
      description: "",
      orderIndex: mikros.length,
      isActive: true,
    });
    setMikroModal("create");
  };

  const openMikroEdit = (mikro) => {
    setSelectedForEdit(mikro);
    setMikroForm({
      code: mikro.code ?? "",
      name: mikro.name ?? "",
      description: mikro.description ?? "",
      orderIndex: mikro.orderIndex ?? 0,
      isActive: mikro.isActive !== false,
    });
    setMikroModal("edit");
  };

  const openMikroDelete = (mikro) => {
    setSelectedForDelete(mikro);
    setMikroModal("delete");
  };

  const handleMikroCreate = async (e) => {
    e.preventDefault();
    if (!selectedLesson || !selectedMain || !selectedSub || !mikroForm.code?.trim() || !mikroForm.name?.trim()) {
      toast.error("Kod ve mikro konu adı zorunludur.");
      return;
    }
    setSubmitting(true);
    try {
      await createLessonMikro(selectedLesson.id, selectedMain.id, selectedSub.id, {
        code: mikroForm.code.trim(),
        name: mikroForm.name.trim(),
        description: mikroForm.description?.trim() || null,
        orderIndex: Number(mikroForm.orderIndex) ?? 0,
        isActive: mikroForm.isActive,
      });
      toast.success(SUCCESS_MESSAGES.CREATE_SUCCESS);
      setMikroModal(null);
      loadMikros(selectedLesson.id, selectedMain.id, selectedSub.id);
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || ERROR_MESSAGES.CREATE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMikroUpdate = async (e) => {
    e.preventDefault();
    if (!selectedLesson || !selectedMain || !selectedSub || !selectedForEdit) return;
    setSubmitting(true);
    try {
      await updateLessonMikro(
        selectedLesson.id,
        selectedMain.id,
        selectedSub.id,
        selectedForEdit.id,
        {
          code: mikroForm.code?.trim() || undefined,
          name: mikroForm.name?.trim() || undefined,
          description: mikroForm.description?.trim() || null,
          orderIndex: Number(mikroForm.orderIndex),
          isActive: mikroForm.isActive,
        }
      );
      toast.success(SUCCESS_MESSAGES.UPDATE_SUCCESS);
      setMikroModal(null);
      setSelectedForEdit(null);
      loadMikros(selectedLesson.id, selectedMain.id, selectedSub.id);
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || ERROR_MESSAGES.UPDATE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMikroDelete = async () => {
    if (!selectedLesson || !selectedMain || !selectedSub || !selectedForDelete) return;
    setSubmitting(true);
    try {
      await deleteLessonMikro(
        selectedLesson.id,
        selectedMain.id,
        selectedSub.id,
        selectedForDelete.id
      );
      toast.success(SUCCESS_MESSAGES.DELETE_SUCCESS);
      setMikroModal(null);
      setSelectedForDelete(null);
      loadMikros(selectedLesson.id, selectedMain.id, selectedSub.id);
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || ERROR_MESSAGES.DELETE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  const closeDetail = () => {
    setSelectedLesson(null);
    setSelectedMain(null);
    setSelectedSub(null);
    setMains([]);
    setSubs([]);
    setMikros([]);
  };

  return (
    <div className="lessons-page admin-page-wrapper">
      <header className="lessons-page-header admin-page-header admin-page-header-gradient">
        <div className="lessons-page-header-inner">
          <h1 className="lessons-page-title admin-page-title">
            <BookOpen size={28} className="lessons-page-title-icon" aria-hidden />
            Dersler
          </h1>
          <p className="lessons-page-desc">
            Ders hiyerarşisini yönetin: Ders → Ana konu → Alt konu → Mikro konu.
          </p>
        </div>
        <button
          type="button"
          onClick={openLessonCreate}
          className="admin-btn admin-btn-primary lessons-btn-create"
        >
          <Plus size={18} aria-hidden />
          Yeni Ders
        </button>
      </header>

      <div className="lessons-filters">
        <label className="admin-label" htmlFor="lessons-filter-sub">
          Alt kategori
        </label>
        <select
          id="lessons-filter-sub"
          className="admin-input lessons-filter-select"
          value={filterCategorySubId}
          onChange={(e) => setFilterCategorySubId(e.target.value)}
        >
          <option value="">Tümü</option>
          {categorySubs.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="lessons-layout">
        <section className="lessons-list-section admin-card lessons-card">
          <div className="lessons-list-header">
            <h2 className="lessons-list-title">Ders listesi</h2>
            {filteredLessons.length > 0 && (
              <span className="lessons-list-badge">{filteredLessons.length} ders</span>
            )}
          </div>
          {loading ? (
            <div className="admin-loading-center lessons-loading">
              <span className="admin-spinner" aria-hidden />
            </div>
          ) : filteredLessons.length === 0 ? (
            <div className="lessons-empty">
              <BookOpen size={40} className="lessons-empty-icon" aria-hidden />
              <p className="lessons-empty-text">
                {filterCategorySubId ? "Bu alt kategoride ders yok." : "Henüz ders eklenmemiş."}
              </p>
              {!filterCategorySubId && (
                <button
                  type="button"
                  onClick={openLessonCreate}
                  className="admin-btn admin-btn-primary lessons-empty-btn"
                >
                  <Plus size={16} /> İlk dersi ekle
                </button>
              )}
            </div>
          ) : (
            <ul className="lessons-list" role="list">
              {filteredLessons.map((lesson) => (
                <li
                  key={lesson.id}
                  className={`lessons-list-item ${selectedLesson?.id === lesson.id ? "lessons-list-item-active" : ""}`}
                >
                  <button
                    type="button"
                    className="lessons-list-item-btn"
                    onClick={() => openLessonDetail(lesson)}
                    aria-pressed={selectedLesson?.id === lesson.id}
                  >
                    <span className="lessons-list-item-name">{lesson.name}</span>
                    <span className="lessons-list-item-meta">
                      {lesson.categorySubName ?? ""} · Sıra {lesson.orderIndex}
                    </span>
                    <ChevronRight size={18} className="lessons-list-item-chevron" aria-hidden />
                  </button>
                  <div className="lessons-list-item-actions">
                    <button
                      type="button"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        openLessonEdit(lesson);
                      }}
                      className="admin-btn admin-btn-ghost admin-btn-icon lessons-action-btn"
                      title="Düzenle"
                    >
                      <Pencil size={14} aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        openLessonDelete(lesson);
                      }}
                      className="admin-btn admin-btn-ghost admin-btn-icon lessons-action-btn lessons-action-btn-danger"
                      title="Sil"
                    >
                      <Trash2 size={14} aria-hidden />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="lessons-detail-section">
          {!selectedLesson ? (
            <div className="lessons-detail-placeholder">
              <Layers size={48} className="lessons-detail-placeholder-icon" aria-hidden />
              <p className="lessons-detail-placeholder-text">
                Hiyerarşiyi görmek için soldan bir ders seçin.
              </p>
            </div>
          ) : (
            <div className="lessons-detail admin-card lessons-card">
              <div className="lessons-detail-header">
                <div className="lessons-detail-breadcrumb">
                  <button
                    type="button"
                    onClick={closeDetail}
                    className="lessons-detail-back"
                  >
                    <X size={18} aria-hidden /> Kapat
                  </button>
                  <span className="lessons-detail-title">{selectedLesson.name}</span>
                  {selectedLesson.categorySubName && (
                    <span className="lessons-detail-badge">{selectedLesson.categorySubName}</span>
                  )}
                </div>
              </div>

              <div className="lessons-hierarchy">
                <div className="lessons-hierarchy-block">
                  <div className="lessons-hierarchy-block-header">
                    <h3 className="lessons-hierarchy-block-title">
                      <FileText size={18} className="lessons-hierarchy-block-icon" aria-hidden />
                      Ana konular (LessonMain)
                    </h3>
                    <button
                      type="button"
                      onClick={openMainCreate}
                      className="admin-btn admin-btn-primary admin-btn-icon lessons-hierarchy-add"
                      title="Yeni ana konu"
                    >
                      <Plus size={18} aria-hidden />
                    </button>
                  </div>
                  {mainsLoading ? (
                    <div className="lessons-hierarchy-loading">
                      <span className="admin-spinner" aria-hidden />
                    </div>
                  ) : mains.length === 0 ? (
                    <p className="lessons-hierarchy-empty">Henüz ana konu yok.</p>
                  ) : (
                    <ul className="lessons-hierarchy-list" role="list">
                      {mains.map((main) => (
                        <li
                          key={main.id}
                          className={`lessons-hierarchy-item lessons-hierarchy-item-main ${selectedMain?.id === main.id ? "lessons-hierarchy-item-active" : ""}`}
                        >
                          <button
                            type="button"
                            className="lessons-hierarchy-item-btn"
                            onClick={() => openMainDetail(main)}
                            aria-pressed={selectedMain?.id === main.id}
                          >
                            <span className="lessons-hierarchy-item-label">{main.name}</span>
                            <span className="lessons-hierarchy-item-code">{main.code}</span>
                            <ChevronRight size={16} aria-hidden />
                          </button>
                          <div className="lessons-hierarchy-item-actions">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openMainEdit(main);
                              }}
                              className="admin-btn admin-btn-ghost admin-btn-icon"
                              title="Düzenle"
                            >
                              <Pencil size={12} aria-hidden />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openMainDelete(main);
                              }}
                              className="admin-btn admin-btn-ghost admin-btn-icon text-red-600"
                              title="Sil"
                            >
                              <Trash2 size={12} aria-hidden />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {selectedMain && (
                  <div className="lessons-hierarchy-block lessons-hierarchy-block-indent">
                    <div className="lessons-hierarchy-block-header">
                      <h3 className="lessons-hierarchy-block-title">
                        <FolderTree size={18} className="lessons-hierarchy-block-icon" aria-hidden />
                        Alt konular (LessonSub)
                      </h3>
                      <button
                        type="button"
                        onClick={openSubCreate}
                        className="admin-btn admin-btn-primary admin-btn-icon lessons-hierarchy-add"
                        title="Yeni alt konu"
                      >
                        <Plus size={18} aria-hidden />
                      </button>
                    </div>
                    {subsLoading ? (
                      <div className="lessons-hierarchy-loading">
                        <span className="admin-spinner" aria-hidden />
                      </div>
                    ) : subs.length === 0 ? (
                      <p className="lessons-hierarchy-empty">Henüz alt konu yok.</p>
                    ) : (
                      <ul className="lessons-hierarchy-list" role="list">
                        {subs.map((sub) => (
                          <li
                            key={sub.id}
                            className={`lessons-hierarchy-item lessons-hierarchy-item-sub ${selectedSub?.id === sub.id ? "lessons-hierarchy-item-active" : ""}`}
                          >
                            <button
                              type="button"
                              className="lessons-hierarchy-item-btn"
                              onClick={() => openSubDetail(sub)}
                              aria-pressed={selectedSub?.id === sub.id}
                            >
                              <span className="lessons-hierarchy-item-label">{sub.name}</span>
                              <span className="lessons-hierarchy-item-code">{sub.code}</span>
                              <ChevronRight size={16} aria-hidden />
                            </button>
                            <div className="lessons-hierarchy-item-actions">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openSubEdit(sub);
                                }}
                                className="admin-btn admin-btn-ghost admin-btn-icon"
                                title="Düzenle"
                              >
                                <Pencil size={12} aria-hidden />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openSubDelete(sub);
                                }}
                                className="admin-btn admin-btn-ghost admin-btn-icon text-red-600"
                                title="Sil"
                              >
                                <Trash2 size={12} aria-hidden />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {selectedSub && (
                  <div className="lessons-hierarchy-block lessons-hierarchy-block-indent lessons-hierarchy-block-mikro">
                    <div className="lessons-hierarchy-block-header">
                      <h3 className="lessons-hierarchy-block-title">
                        <Sparkles size={18} className="lessons-hierarchy-block-icon" aria-hidden />
                        Mikro konular (LessonMikro)
                      </h3>
                      <button
                        type="button"
                        onClick={openMikroCreate}
                        className="admin-btn admin-btn-primary admin-btn-icon lessons-hierarchy-add"
                        title="Yeni mikro konu"
                      >
                        <Plus size={18} aria-hidden />
                      </button>
                    </div>
                    {mikrosLoading ? (
                      <div className="lessons-hierarchy-loading">
                        <span className="admin-spinner" aria-hidden />
                      </div>
                    ) : mikros.length === 0 ? (
                      <p className="lessons-hierarchy-empty">Henüz mikro konu yok.</p>
                    ) : (
                      <ul className="lessons-hierarchy-list" role="list">
                        {mikros.map((mikro) => (
                          <li key={mikro.id} className="lessons-hierarchy-item lessons-hierarchy-item-mikro">
                            <span className="lessons-hierarchy-item-label">{mikro.name}</span>
                            <span className="lessons-hierarchy-item-code">{mikro.code}</span>
                            <div className="lessons-hierarchy-item-actions">
                              <button
                                type="button"
                                onClick={() => openMikroEdit(mikro)}
                                className="admin-btn admin-btn-ghost admin-btn-icon"
                                title="Düzenle"
                              >
                                <Pencil size={12} aria-hidden />
                              </button>
                              <button
                                type="button"
                                onClick={() => openMikroDelete(mikro)}
                                className="admin-btn admin-btn-ghost admin-btn-icon text-red-600"
                                title="Sil"
                              >
                                <Trash2 size={12} aria-hidden />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Modal: Ders oluştur */}
      {lessonModal === "create" && (
        <div className="admin-modal-backdrop" onClick={() => setLessonModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">Yeni ders</div>
            <form onSubmit={handleLessonCreate}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Alt kategori (CategorySub)</label>
                  <select
                    className="admin-input"
                    value={lessonForm.categorySubId}
                    onChange={(e) => setLessonForm((f) => ({ ...f, categorySubId: e.target.value }))}
                    required
                  >
                    <option value="">Seçin</option>
                    {categorySubs.map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Ders adı</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={lessonForm.name}
                    onChange={(e) => setLessonForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Örn. Türkçe"
                    required
                  />
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Sıra</label>
                    <input
                      type="number"
                      className="admin-input"
                      min={0}
                      value={lessonForm.orderIndex}
                      onChange={(e) => setLessonForm((f) => ({ ...f, orderIndex: e.target.value }))}
                    />
                  </div>
                  <div className="admin-form-group flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="lesson-create-active"
                      checked={lessonForm.isActive}
                      onChange={(e) => setLessonForm((f) => ({ ...f, isActive: e.target.checked }))}
                      className="rounded border-slate-300 text-emerald-600"
                    />
                    <label htmlFor="lesson-create-active" className="text-sm">Aktif</label>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" onClick={() => setLessonModal(null)} className="admin-btn admin-btn-secondary">
                  İptal
                </button>
                <button type="submit" disabled={submitting} className="admin-btn admin-btn-primary">
                  {submitting ? "Kaydediliyor…" : "Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ders düzenle */}
      {lessonModal === "edit" && selectedForEdit && (
        <div className="admin-modal-backdrop" onClick={() => setLessonModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">Ders düzenle</div>
            <form onSubmit={handleLessonUpdate}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Ders adı</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={lessonForm.name}
                    onChange={(e) => setLessonForm((f) => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Sıra</label>
                    <input
                      type="number"
                      className="admin-input"
                      min={0}
                      value={lessonForm.orderIndex}
                      onChange={(e) => setLessonForm((f) => ({ ...f, orderIndex: e.target.value }))}
                    />
                  </div>
                  <div className="admin-form-group flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="lesson-edit-active"
                      checked={lessonForm.isActive}
                      onChange={(e) => setLessonForm((f) => ({ ...f, isActive: e.target.checked }))}
                      className="rounded border-slate-300 text-emerald-600"
                    />
                    <label htmlFor="lesson-edit-active" className="text-sm">Aktif</label>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" onClick={() => setLessonModal(null)} className="admin-btn admin-btn-secondary">
                  İptal
                </button>
                <button type="submit" disabled={submitting} className="admin-btn admin-btn-primary">
                  {submitting ? "Güncelleniyor…" : "Güncelle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ders sil */}
      {lessonModal === "delete" && selectedForDelete && (
        <div className="admin-modal-backdrop" onClick={() => setLessonModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">Dersi sil</div>
            <div className="admin-modal-body">
              <p className="text-slate-600">
                &quot;{selectedForDelete.name}&quot; dersini pasif yapmak (silme) istediğinize emin misiniz?
              </p>
            </div>
            <div className="admin-modal-footer">
              <button type="button" onClick={() => setLessonModal(null)} className="admin-btn admin-btn-secondary">
                İptal
              </button>
              <button
                type="button"
                onClick={handleLessonDelete}
                disabled={submitting}
                className="admin-btn admin-btn-danger"
              >
                {submitting ? "Siliniyor…" : "Sil"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Ana konu oluştur / düzenle */}
      {(mainModal === "create" || mainModal === "edit") && selectedLesson && (
        <div className="admin-modal-backdrop" onClick={() => setMainModal(null)}>
          <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              {mainModal === "create" ? "Yeni ana konu" : "Ana konu düzenle"}
            </div>
            <form onSubmit={mainModal === "create" ? handleMainCreate : handleMainUpdate}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Kod</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={mainForm.code}
                      onChange={(e) => setMainForm((f) => ({ ...f, code: e.target.value }))}
                      placeholder="SOZCUKTE_ANLAM"
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Ad</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={mainForm.name}
                      onChange={(e) => setMainForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Sözcükte Anlam"
                      required
                    />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Açıklama</label>
                  <textarea
                    className="admin-input min-h-[80px]"
                    value={mainForm.description}
                    onChange={(e) => setMainForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="İsteğe bağlı"
                  />
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Sıra</label>
                    <input
                      type="number"
                      className="admin-input"
                      min={0}
                      value={mainForm.orderIndex}
                      onChange={(e) => setMainForm((f) => ({ ...f, orderIndex: e.target.value }))}
                    />
                  </div>
                  <div className="admin-form-group flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="main-active"
                      checked={mainForm.isActive}
                      onChange={(e) => setMainForm((f) => ({ ...f, isActive: e.target.checked }))}
                      className="rounded border-slate-300 text-emerald-600"
                    />
                    <label htmlFor="main-active" className="text-sm">Aktif</label>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" onClick={() => setMainModal(null)} className="admin-btn admin-btn-secondary">
                  İptal
                </button>
                <button type="submit" disabled={submitting} className="admin-btn admin-btn-primary">
                  {submitting ? "Kaydediliyor…" : mainModal === "create" ? "Oluştur" : "Güncelle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ana konu sil */}
      {mainModal === "delete" && selectedForDelete && (
        <div className="admin-modal-backdrop" onClick={() => setMainModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">Ana konuyu sil</div>
            <div className="admin-modal-body">
              <p className="text-slate-600">
                &quot;{selectedForDelete.name}&quot; ana konusunu silmek istediğinize emin misiniz?
              </p>
            </div>
            <div className="admin-modal-footer">
              <button type="button" onClick={() => setMainModal(null)} className="admin-btn admin-btn-secondary">
                İptal
              </button>
              <button
                type="button"
                onClick={handleMainDelete}
                disabled={submitting}
                className="admin-btn admin-btn-danger"
              >
                {submitting ? "Siliniyor…" : "Sil"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub create/edit modal - same structure as main */}
      {(subModal === "create" || subModal === "edit") && selectedLesson && selectedMain && (
        <div className="admin-modal-backdrop" onClick={() => setSubModal(null)}>
          <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              {subModal === "create" ? "Yeni alt konu" : "Alt konu düzenle"}
            </div>
            <form onSubmit={subModal === "create" ? handleSubCreate : handleSubUpdate}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Kod</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={subForm.code}
                      onChange={(e) => setSubForm((f) => ({ ...f, code: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Ad</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={subForm.name}
                      onChange={(e) => setSubForm((f) => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Açıklama</label>
                  <textarea
                    className="admin-input min-h-[80px]"
                    value={subForm.description}
                    onChange={(e) => setSubForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Sıra</label>
                    <input
                      type="number"
                      className="admin-input"
                      min={0}
                      value={subForm.orderIndex}
                      onChange={(e) => setSubForm((f) => ({ ...f, orderIndex: e.target.value }))}
                    />
                  </div>
                  <div className="admin-form-group flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="sub-active"
                      checked={subForm.isActive}
                      onChange={(e) => setSubForm((f) => ({ ...f, isActive: e.target.checked }))}
                      className="rounded border-slate-300 text-emerald-600"
                    />
                    <label htmlFor="sub-active" className="text-sm">Aktif</label>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" onClick={() => setSubModal(null)} className="admin-btn admin-btn-secondary">
                  İptal
                </button>
                <button type="submit" disabled={submitting} className="admin-btn admin-btn-primary">
                  {submitting ? "Kaydediliyor…" : subModal === "create" ? "Oluştur" : "Güncelle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {subModal === "delete" && selectedForDelete && (
        <div className="admin-modal-backdrop" onClick={() => setSubModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">Alt konuyu sil</div>
            <div className="admin-modal-body">
              <p className="text-slate-600">
                &quot;{selectedForDelete.name}&quot; alt konusunu silmek istediğinize emin misiniz?
              </p>
            </div>
            <div className="admin-modal-footer">
              <button type="button" onClick={() => setSubModal(null)} className="admin-btn admin-btn-secondary">
                İptal
              </button>
              <button
                type="button"
                onClick={handleSubDelete}
                disabled={submitting}
                className="admin-btn admin-btn-danger"
              >
                {submitting ? "Siliniyor…" : "Sil"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mikro create/edit */}
      {(mikroModal === "create" || mikroModal === "edit") && selectedLesson && selectedMain && selectedSub && (
        <div className="admin-modal-backdrop" onClick={() => setMikroModal(null)}>
          <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              {mikroModal === "create" ? "Yeni mikro konu" : "Mikro konu düzenle"}
            </div>
            <form onSubmit={mikroModal === "create" ? handleMikroCreate : handleMikroUpdate}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Kod</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={mikroForm.code}
                      onChange={(e) => setMikroForm((f) => ({ ...f, code: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Ad</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={mikroForm.name}
                      onChange={(e) => setMikroForm((f) => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Açıklama</label>
                  <textarea
                    className="admin-input min-h-[80px]"
                    value={mikroForm.description}
                    onChange={(e) => setMikroForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Sıra</label>
                    <input
                      type="number"
                      className="admin-input"
                      min={0}
                      value={mikroForm.orderIndex}
                      onChange={(e) => setMikroForm((f) => ({ ...f, orderIndex: e.target.value }))}
                    />
                  </div>
                  <div className="admin-form-group flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="mikro-active"
                      checked={mikroForm.isActive}
                      onChange={(e) => setMikroForm((f) => ({ ...f, isActive: e.target.checked }))}
                      className="rounded border-slate-300 text-emerald-600"
                    />
                    <label htmlFor="mikro-active" className="text-sm">Aktif</label>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" onClick={() => setMikroModal(null)} className="admin-btn admin-btn-secondary">
                  İptal
                </button>
                <button type="submit" disabled={submitting} className="admin-btn admin-btn-primary">
                  {submitting ? "Kaydediliyor…" : mikroModal === "create" ? "Oluştur" : "Güncelle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mikroModal === "delete" && selectedForDelete && (
        <div className="admin-modal-backdrop" onClick={() => setMikroModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">Mikro konuyu sil</div>
            <div className="admin-modal-body">
              <p className="text-slate-600">
                &quot;{selectedForDelete.name}&quot; mikro konusunu silmek istediğinize emin misiniz?
              </p>
            </div>
            <div className="admin-modal-footer">
              <button type="button" onClick={() => setMikroModal(null)} className="admin-btn admin-btn-secondary">
                İptal
              </button>
              <button
                type="button"
                onClick={handleMikroDelete}
                disabled={submitting}
                className="admin-btn admin-btn-danger"
              >
                {submitting ? "Siliniyor…" : "Sil"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lessons;
