import { useEffect, useState } from "react";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  ArrowLeft,
  ListTree,
  BookMarked,
  Layers,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getAllLessons,
  createLesson,
  updateLesson,
  deleteLesson,
} from "@/services/adminLessonService";
import {
  getLessonMainsByLessonId,
  createLessonMain,
  updateLessonMain,
  deleteLessonMain,
} from "@/services/adminLessonMainService";
import {
  getLessonSubsByLessonMainId,
  createLessonSub,
  updateLessonSub,
  deleteLessonSub,
} from "@/services/adminLessonSubService";
import {
  getMikrosByLessonSubId,
  createLessonMikro,
  updateLessonMikro,
  deleteLessonMikro,
} from "@/services/adminLessonMikroService";
import { getAllCategories } from "@/services/adminCategoryService";
import { getSubsByCategoryId } from "@/services/adminCategorySubService";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";
import { formatDate } from "@/utils/format";

const defaultMainForm = () => ({
  code: "",
  name: "",
  description: "",
  orderIndex: 0,
  isActive: true,
});
const defaultSubForm = () => ({
  code: "",
  name: "",
  description: "",
  orderIndex: 0,
  isActive: true,
});
const defaultMikroForm = () => ({
  code: "",
  name: "",
  description: "",
  orderIndex: 0,
  isActive: true,
});

const Lessons = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [subs, setSubs] = useState([]);
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [filterSubId, setFilterSubId] = useState("");
  const [filterSubs, setFilterSubs] = useState([]);

  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [lessonForm, setLessonForm] = useState({
    name: "",
    categoryId: "",
    categorySubId: "",
    orderIndex: 0,
    isActive: true,
  });

  const [manageLesson, setManageLesson] = useState(null);
  const [manageMains, setManageMains] = useState([]);
  const [manageSubs, setManageSubs] = useState([]);
  const [manageMikros, setManageMikros] = useState([]);
  const [manageLessonMain, setManageLessonMain] = useState(null);
  const [manageLessonSub, setManageLessonSub] = useState(null);
  const [manageLoading, setManageLoading] = useState(false);
  const [mainForm, setMainForm] = useState(defaultMainForm());
  const [subForm, setSubForm] = useState(defaultSubForm());
  const [mikroForm, setMikroForm] = useState(defaultMikroForm());
  const [mainModal, setMainModal] = useState(null);
  const [subModal, setSubModal] = useState(null);
  const [mikroModal, setMikroModal] = useState(null);
  const [editMainId, setEditMainId] = useState(null);
  const [editSubId, setEditSubId] = useState(null);
  const [editMikroId, setEditMikroId] = useState(null);
  const [deleteTargetMain, setDeleteTargetMain] = useState(null);
  const [deleteTargetSub, setDeleteTargetSub] = useState(null);
  const [deleteTargetMikro, setDeleteTargetMikro] = useState(null);

  const loadLessons = async () => {
    setLoading(true);
    try {
      const data = await getAllLessons();
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.FETCH_FAILED);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    }
  };

  useEffect(() => {
    loadLessons();
    loadCategories();
  }, []);

  useEffect(() => {
    if (!filterCategoryId) {
      setFilterSubs([]);
      return;
    }
    getSubsByCategoryId(String(filterCategoryId))
      .then((data) => setFilterSubs(Array.isArray(data) ? data : []))
      .catch(() => setFilterSubs([]));
  }, [filterCategoryId]);

  useEffect(() => {
    if (!lessonForm.categoryId) {
      setSubs([]);
      return;
    }
    getSubsByCategoryId(String(lessonForm.categoryId))
      .then((data) => setSubs(Array.isArray(data) ? data : []))
      .catch(() => setSubs([]));
  }, [lessonForm.categoryId]);

  const filteredList = list.filter((item) => {
    if (filterCategoryId && !filterSubs.some((s) => String(s.id) === String(item.categorySubId))) return false;
    if (filterSubId && String(item.categorySubId) !== String(filterSubId)) return false;
    return true;
  });

  const openCreateLesson = () => {
    setSelected(null);
    setLessonForm({ name: "", categoryId: "", categorySubId: "", orderIndex: 0, isActive: true });
    setModal("createLesson");
  };

  const openEditLesson = (item) => {
    setSelected(item);
    setLessonForm({
      name: item.name ?? "",
      categorySubId: item.categorySubId ?? "",
      orderIndex: item.orderIndex ?? 0,
      isActive: item.isActive !== false,
    });
    setModal("editLesson");
  };

  const openDeleteLesson = (item) => {
    setSelected(item);
    setModal("deleteLesson");
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    if (!lessonForm.name?.trim()) {
      toast.error("Ad zorunludur.");
      return;
    }
    if (!lessonForm.categorySubId?.trim()) {
      toast.error("Alt kategori seçin.");
      return;
    }
    setSubmitting(true);
    try {
      await createLesson({
        name: lessonForm.name.trim(),
        categorySubId: lessonForm.categorySubId,
        orderIndex: Number(lessonForm.orderIndex) ?? 0,
        isActive: lessonForm.isActive,
      });
      toast.success("Ders listesi oluşturuldu.");
      closeModal();
      loadLessons();
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.CREATE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateLesson = async (e) => {
    e.preventDefault();
    if (!selected?.id) return;
    if (!lessonForm.name?.trim()) {
      toast.error("Ad zorunludur.");
      return;
    }
    setSubmitting(true);
    try {
      await updateLesson(selected.id, {
        name: lessonForm.name.trim(),
        orderIndex: Number(lessonForm.orderIndex) ?? 0,
        isActive: lessonForm.isActive,
      });
      toast.success(SUCCESS_MESSAGES.UPDATE_SUCCESS);
      closeModal();
      loadLessons();
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.UPDATE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLesson = async () => {
    if (!selected?.id) return;
    setSubmitting(true);
    try {
      await deleteLesson(selected.id);
      toast.success(SUCCESS_MESSAGES.DELETE_SUCCESS);
      closeModal();
      setManageLesson(null);
      loadLessons();
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.DELETE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  const openManage = async (lesson) => {
    setManageLesson(lesson);
    setManageLessonMain(null);
    setManageLessonSub(null);
    setManageMains([]);
    setManageSubs([]);
    setManageMikros([]);
    setManageLoading(true);
    try {
      const mains = await getLessonMainsByLessonId(lesson.id);
      setManageMains(Array.isArray(mains) ? mains : []);
    } catch {
      setManageMains([]);
    } finally {
      setManageLoading(false);
    }
  };

  const backToMains = () => {
    setManageLessonMain(null);
    setManageLessonSub(null);
    setManageSubs([]);
    setManageMikros([]);
    if (manageLesson?.id) {
      setManageLoading(true);
      getLessonMainsByLessonId(manageLesson.id)
        .then((mains) => setManageMains(Array.isArray(mains) ? mains : []))
        .catch(() => setManageMains([]))
        .finally(() => setManageLoading(false));
    }
  };

  const openMainsSubs = async (main) => {
    setManageLessonMain(main);
    setManageSubs([]);
    setManageMikros([]);
    setManageLoading(true);
    try {
      const subs = await getLessonSubsByLessonMainId(main.id);
      setManageSubs(Array.isArray(subs) ? subs : []);
    } catch {
      setManageSubs([]);
    } finally {
      setManageLoading(false);
    }
  };

  const backToSubs = () => {
    setManageLessonSub(null);
    setManageMikros([]);
    if (manageLessonMain?.id) {
      setManageLoading(true);
      getLessonSubsByLessonMainId(manageLessonMain.id)
        .then((subs) => setManageSubs(Array.isArray(subs) ? subs : []))
        .catch(() => setManageSubs([]))
        .finally(() => setManageLoading(false));
    }
  };

  const openSubsMikros = async (sub) => {
    setManageLessonSub(sub);
    setManageLoading(true);
    try {
      const mikros = await getMikrosByLessonSubId(sub.id);
      setManageMikros(Array.isArray(mikros) ? mikros : []);
    } catch {
      setManageMikros([]);
    } finally {
      setManageLoading(false);
    }
  };

  const openAddMain = () => {
    setMainForm(defaultMainForm());
    setEditMainId(null);
    setMainModal("add");
  };

  const openEditMain = (item) => {
    setMainForm({
      code: item.code ?? "",
      name: item.name ?? "",
      description: item.description ?? "",
      orderIndex: item.orderIndex ?? 0,
      isActive: item.isActive !== false,
    });
    setEditMainId(item.id);
    setMainModal("edit");
  };

  const handleSaveMain = async (e) => {
    e.preventDefault();
    if (!mainForm.code?.trim() || !mainForm.name?.trim()) {
      toast.error("Kod ve ad zorunludur.");
      return;
    }
    if (!manageLesson?.id) return;
    setSubmitting(true);
    try {
      if (editMainId) {
        await updateLessonMain(editMainId, mainForm);
        toast.success(SUCCESS_MESSAGES.UPDATE_SUCCESS);
      } else {
        await createLessonMain(manageLesson.id, mainForm);
        toast.success("Ders içeriği oluşturuldu.");
      }
      setMainModal(null);
      const mains = await getLessonMainsByLessonId(manageLesson.id);
      setManageMains(Array.isArray(mains) ? mains : []);
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.CREATE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMain = async () => {
    const item = deleteTargetMain;
    if (!item?.id) return;
    setSubmitting(true);
    try {
      await deleteLessonMain(item.id);
      toast.success("Ders içeriği silindi.");
      setDeleteTargetMain(null);
      if (manageLesson?.id) {
        const mains = await getLessonMainsByLessonId(manageLesson.id);
        setManageMains(Array.isArray(mains) ? mains : []);
      }
      setManageLessonMain(null);
      setManageSubs([]);
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.DELETE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  const openAddSub = () => {
    setSubForm(defaultSubForm());
    setEditSubId(null);
    setSubModal("add");
  };

  const openEditSub = (item) => {
    setSubForm({
      code: item.code ?? "",
      name: item.name ?? "",
      description: item.description ?? "",
      orderIndex: item.orderIndex ?? 0,
      isActive: item.isActive !== false,
    });
    setEditSubId(item.id);
    setSubModal("edit");
  };

  const handleSaveSub = async (e) => {
    e.preventDefault();
    if (!subForm.code?.trim() || !subForm.name?.trim()) {
      toast.error("Kod ve ad zorunludur.");
      return;
    }
    if (!manageLessonMain?.id) return;
    setSubmitting(true);
    try {
      if (editSubId) {
        await updateLessonSub(editSubId, subForm);
        toast.success(SUCCESS_MESSAGES.UPDATE_SUCCESS);
      } else {
        await createLessonSub(manageLessonMain.id, subForm);
        toast.success("Alt konu oluşturuldu.");
      }
      setSubModal(null);
      const subs = await getLessonSubsByLessonMainId(manageLessonMain.id);
      setManageSubs(Array.isArray(subs) ? subs : []);
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.CREATE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSub = async () => {
    const item = deleteTargetSub;
    if (!item?.id) return;
    setSubmitting(true);
    try {
      await deleteLessonSub(item.id);
      toast.success("Alt konu silindi.");
      setDeleteTargetSub(null);
      if (manageLessonMain?.id) {
        const subs = await getLessonSubsByLessonMainId(manageLessonMain.id);
        setManageSubs(Array.isArray(subs) ? subs : []);
      }
      setManageLessonSub(null);
      setManageMikros([]);
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.DELETE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  const openAddMikro = () => {
    setMikroForm(defaultMikroForm());
    setEditMikroId(null);
    setMikroModal("add");
  };

  const openEditMikro = (item) => {
    setMikroForm({
      code: item.code ?? "",
      name: item.name ?? "",
      description: item.description ?? "",
      orderIndex: item.orderIndex ?? 0,
      isActive: item.isActive !== false,
    });
    setEditMikroId(item.id);
    setMikroModal("edit");
  };

  const handleSaveMikro = async (e) => {
    e.preventDefault();
    if (!mikroForm.code?.trim() || !mikroForm.name?.trim()) {
      toast.error("Kod ve ad zorunludur.");
      return;
    }
    if (!manageLessonSub?.id) return;
    setSubmitting(true);
    try {
      if (editMikroId) {
        await updateLessonMikro(editMikroId, mikroForm);
        toast.success(SUCCESS_MESSAGES.UPDATE_SUCCESS);
      } else {
        await createLessonMikro(manageLessonSub.id, mikroForm);
        toast.success("Mikro konu oluşturuldu.");
      }
      setMikroModal(null);
      const mikros = await getMikrosByLessonSubId(manageLessonSub.id);
      setManageMikros(Array.isArray(mikros) ? mikros : []);
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.CREATE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMikro = async () => {
    const item = deleteTargetMikro;
    if (!item?.id) return;
    setSubmitting(true);
    try {
      await deleteLessonMikro(item.id);
      toast.success("Mikro konu silindi.");
      setDeleteTargetMikro(null);
      if (manageLessonSub?.id) {
        const mikros = await getMikrosByLessonSubId(manageLessonSub.id);
        setManageMikros(Array.isArray(mikros) ? mikros : []);
      }
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.DELETE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  const closeManage = () => {
    setManageLesson(null);
    setManageLessonMain(null);
    setManageLessonSub(null);
    setManageMains([]);
    setManageSubs([]);
    setManageMikros([]);
  };

  if (manageLesson) {
    return (
      <div className="admin-page-wrapper">
        <div className="admin-page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-col gap-2">
            {/* Breadcrumb: Alt kategori → Lesson → LessonMain → LessonSub → Mikro */}
            <nav className="flex items-center gap-1.5 text-sm text-slate-600 flex-wrap">
              <button
                type="button"
                onClick={closeManage}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors"
                title="Ders listesine dön"
              >
                <ArrowLeft size={16} />
                <span>Dersler</span>
              </button>
              <ChevronRight size={14} className="text-slate-400 shrink-0" />
              <span className="font-medium text-slate-800 truncate max-w-[180px] sm:max-w-none" title={manageLesson.name || manageLesson.categorySubName}>
                {manageLesson.name || manageLesson.categorySubName || "Ders listesi"}
              </span>
              {manageLessonMain && (
                <>
                  <ChevronRight size={14} className="text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-800 truncate max-w-[140px] sm:max-w-none" title={manageLessonMain.name}>
                    {manageLessonMain.name}
                  </span>
                </>
              )}
              {manageLessonSub && (
                <>
                  <ChevronRight size={14} className="text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-800 truncate max-w-[140px] sm:max-w-none" title={manageLessonSub.name}>
                    {manageLessonSub.name}
                  </span>
                </>
              )}
            </nav>
            <h1 className="admin-page-title text-xl sm:text-2xl flex items-center gap-2">
              <BookOpen size={24} className="text-emerald-600 shrink-0" />
              {manageLessonMain
                ? manageLessonSub
                  ? "Mikro konular"
                  : "Alt konular (LessonSub)"
                : "Ders içerikleri (LessonMain)"}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {!manageLessonMain && (
              <button
                type="button"
                onClick={openAddMain}
                className="admin-btn admin-btn-primary"
              >
                <Plus size={18} />
                Ders içeriği ekle (LessonMain)
              </button>
            )}
            {manageLessonMain && !manageLessonSub && (
              <button
                type="button"
                onClick={openAddSub}
                className="admin-btn admin-btn-primary"
              >
                <Plus size={18} />
                Alt konu ekle (LessonSub)
              </button>
            )}
            {manageLessonSub && (
              <button
                type="button"
                onClick={openAddMikro}
                className="admin-btn admin-btn-primary"
              >
                <Plus size={18} />
                Mikro konu ekle (LessonMikro)
              </button>
            )}
          </div>
        </div>

        {manageLoading ? (
          <div className="admin-loading-center">
            <span className="admin-spinner" />
          </div>
        ) : !manageLessonMain ? (
          <div className="admin-card admin-card-elevated overflow-hidden">
            {manageMains.length === 0 ? (
              <div className="admin-empty-state rounded-none py-12">
                <Layers size={48} className="mx-auto mb-3 text-slate-300" />
                <p className="font-medium text-slate-600">Henüz ders içeriği (LessonMain) yok.</p>
                <p className="text-sm mt-1 text-slate-500">Yukarıdaki &quot;Ders içeriği ekle&quot; ile Matematik, Fizik vb. ekleyin.</p>
              </div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Kod</th>
                      <th>Ad</th>
                      <th>Sıra</th>
                      <th>Durum</th>
                      <th className="text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {manageMains.map((m) => (
                      <tr key={m.id}>
                        <td className="font-mono text-sm">{m.code}</td>
                        <td className="font-medium">{m.name}</td>
                        <td>{m.orderIndex ?? "—"}</td>
                        <td>
                          <span
                            className={
                              m.isActive
                                ? "admin-badge admin-badge-success"
                                : "admin-badge admin-badge-neutral"
                            }
                          >
                            {m.isActive ? "Aktif" : "Pasif"}
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => openMainsSubs(m)}
                              className="admin-btn admin-btn-ghost admin-btn-icon text-emerald-600 hover:bg-emerald-50"
                              title="Üniteler"
                            >
                              <ListTree size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditMain(m)}
                              className="admin-btn admin-btn-ghost admin-btn-icon"
                              title="Düzenle"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTargetMain(m)}
                              disabled={submitting}
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
            )}
          </div>
        ) : !manageLessonSub ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <button
                type="button"
                onClick={backToMains}
                className="admin-btn admin-btn-ghost text-sm"
              >
                <ArrowLeft size={16} className="mr-1" />
                Ders listesine dön
              </button>
              <span className="font-medium text-slate-800">— {manageLessonMain.name}</span>
            </div>
            <div className="admin-card admin-card-elevated overflow-hidden">
              {manageSubs.length === 0 ? (
                <div className="admin-empty-state rounded-none py-12">
                  <BookMarked size={48} className="mx-auto mb-3 text-slate-300" />
                  <p className="font-medium text-slate-600">Bu ders için henüz alt konu (LessonSub) yok.</p>
                  <p className="text-sm mt-1 text-slate-500">&quot;Alt konu ekle&quot; ile ekleyin.</p>
                </div>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Kod</th>
                        <th>Ad</th>
                        <th>Sıra</th>
                        <th>Durum</th>
                        <th className="text-right">İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {manageSubs.map((s) => (
                        <tr key={s.id}>
                          <td className="font-mono text-sm">{s.code}</td>
                          <td className="font-medium">{s.name}</td>
                          <td>{s.orderIndex ?? "—"}</td>
                          <td>
                            <span
                              className={
                                s.isActive
                                  ? "admin-badge admin-badge-success"
                                  : "admin-badge admin-badge-neutral"
                              }
                            >
                              {s.isActive ? "Aktif" : "Pasif"}
                            </span>
                          </td>
                          <td className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => openSubsMikros(s)}
                                className="admin-btn admin-btn-ghost admin-btn-icon text-emerald-600 hover:bg-emerald-50"
                                title="Mikro konular"
                              >
                                <ListTree size={18} />
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditSub(s)}
                                className="admin-btn admin-btn-ghost admin-btn-icon"
                                title="Düzenle"
                              >
                                <Pencil size={18} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTargetSub(s)}
                                disabled={submitting}
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
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-slate-600 flex-wrap">
              <button
                type="button"
                onClick={backToSubs}
                className="admin-btn admin-btn-ghost text-sm"
              >
                <ArrowLeft size={16} className="mr-1" />
                Ünite listesine dön
              </button>
              <span className="font-medium text-slate-800">— {manageLessonSub.name}</span>
            </div>
            <div className="admin-card admin-card-elevated overflow-hidden">
              {manageMikros.length === 0 ? (
                <div className="admin-empty-state rounded-none py-12">
                  <ListTree size={48} className="mx-auto mb-3 text-slate-300" />
                  <p className="font-medium text-slate-600">Bu alt konu için henüz mikro konu (LessonMikro) yok.</p>
                  <p className="text-sm mt-1 text-slate-500">Mikro konu zorunlu değildir; isterseniz &quot;Mikro konu ekle&quot; ile ekleyin.</p>
                </div>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Kod</th>
                        <th>Ad</th>
                        <th>Sıra</th>
                        <th>Durum</th>
                        <th className="text-right">İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {manageMikros.map((m) => (
                        <tr key={m.id}>
                          <td className="font-mono text-sm">{m.code}</td>
                          <td className="font-medium">{m.name}</td>
                          <td>{m.orderIndex ?? "—"}</td>
                          <td>
                            <span
                              className={
                                m.isActive
                                  ? "admin-badge admin-badge-success"
                                  : "admin-badge admin-badge-neutral"
                              }
                            >
                              {m.isActive ? "Aktif" : "Pasif"}
                            </span>
                          </td>
                          <td className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => openEditMikro(m)}
                                className="admin-btn admin-btn-ghost admin-btn-icon"
                                title="Düzenle"
                              >
                                <Pencil size={18} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTargetMikro(m)}
                                disabled={submitting}
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
              )}
            </div>
          </div>
        )}

        {/* Modals: Main */}
        {mainModal && (
          <div className="admin-modal-backdrop" onClick={() => setMainModal(null)}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal-header">
                {editMainId ? "Ders içeriğini düzenle" : "Ders içeriği ekle (LessonMain)"}
              </div>
              <form onSubmit={handleSaveMain}>
                <div className="admin-modal-body space-y-4">
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Kod</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={mainForm.code}
                      onChange={(e) => setMainForm((f) => ({ ...f, code: e.target.value }))}
                      placeholder="MAT, FIZ"
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
                      placeholder="Matematik, Fizik"
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Açıklama</label>
                    <textarea
                      className="admin-input min-h-[80px]"
                      value={mainForm.description}
                      onChange={(e) => setMainForm((f) => ({ ...f, description: e.target.value }))}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Sıra</label>
                    <input
                      type="number"
                      className="admin-input"
                      min={0}
                      value={mainForm.orderIndex}
                      onChange={(e) => setMainForm((f) => ({ ...f, orderIndex: Number(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="main-active"
                      checked={mainForm.isActive}
                      onChange={(e) => setMainForm((f) => ({ ...f, isActive: e.target.checked }))}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="main-active" className="text-sm">Aktif</label>
                  </div>
                </div>
                <div className="admin-modal-footer">
                  <button type="button" onClick={() => setMainModal(null)} className="admin-btn admin-btn-secondary">İptal</button>
                  <button type="submit" disabled={submitting} className="admin-btn admin-btn-primary">
                    {submitting ? "Kaydediliyor…" : "Kaydet"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modals: Sub */}
        {subModal && (
          <div className="admin-modal-backdrop" onClick={() => setSubModal(null)}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal-header">
                {editSubId ? "Alt konuyu düzenle" : "Alt konu ekle (LessonSub)"}
              </div>
              <form onSubmit={handleSaveSub}>
                <div className="admin-modal-body space-y-4">
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Kod</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={subForm.code}
                      onChange={(e) => setSubForm((f) => ({ ...f, code: e.target.value }))}
                      placeholder="MAT_SAYI"
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
                      placeholder="Sayılar"
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Açıklama</label>
                    <textarea
                      className="admin-input min-h-[80px]"
                      value={subForm.description}
                      onChange={(e) => setSubForm((f) => ({ ...f, description: e.target.value }))}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Sıra</label>
                    <input
                      type="number"
                      className="admin-input"
                      min={0}
                      value={subForm.orderIndex}
                      onChange={(e) => setSubForm((f) => ({ ...f, orderIndex: Number(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="sub-active"
                      checked={subForm.isActive}
                      onChange={(e) => setSubForm((f) => ({ ...f, isActive: e.target.checked }))}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="sub-active" className="text-sm">Aktif</label>
                  </div>
                </div>
                <div className="admin-modal-footer">
                  <button type="button" onClick={() => setSubModal(null)} className="admin-btn admin-btn-secondary">İptal</button>
                  <button type="submit" disabled={submitting} className="admin-btn admin-btn-primary">
                    {submitting ? "Kaydediliyor…" : "Kaydet"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modals: Mikro */}
        {mikroModal && (
          <div className="admin-modal-backdrop" onClick={() => setMikroModal(null)}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal-header">
                {editMikroId ? "Mikro konuyu düzenle" : "Mikro konu ekle (LessonMikro)"}
              </div>
              <form onSubmit={handleSaveMikro}>
                <div className="admin-modal-body space-y-4">
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Kod</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={mikroForm.code}
                      onChange={(e) => setMikroForm((f) => ({ ...f, code: e.target.value }))}
                      placeholder="MAT_SAYI_KUME"
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
                      placeholder="Sayı kümeleri"
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Açıklama</label>
                    <textarea
                      className="admin-input min-h-[80px]"
                      value={mikroForm.description}
                      onChange={(e) => setMikroForm((f) => ({ ...f, description: e.target.value }))}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Sıra</label>
                    <input
                      type="number"
                      className="admin-input"
                      min={0}
                      value={mikroForm.orderIndex}
                      onChange={(e) => setMikroForm((f) => ({ ...f, orderIndex: Number(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="mikro-active"
                      checked={mikroForm.isActive}
                      onChange={(e) => setMikroForm((f) => ({ ...f, isActive: e.target.checked }))}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="mikro-active" className="text-sm">Aktif</label>
                  </div>
                </div>
                <div className="admin-modal-footer">
                  <button type="button" onClick={() => setMikroModal(null)} className="admin-btn admin-btn-secondary">İptal</button>
                  <button type="submit" disabled={submitting} className="admin-btn admin-btn-primary">
                    {submitting ? "Kaydediliyor…" : "Kaydet"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Silme onay: Ders içeriği (LessonMain) */}
        {deleteTargetMain && (
          <div className="admin-modal-backdrop" onClick={() => setDeleteTargetMain(null)}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">Ders içeriğini sil</div>
              <div className="admin-modal-body">
                <p className="text-slate-600">
                  <strong>{deleteTargetMain.name}</strong> ders içeriğini silmek istediğinize emin misiniz? Alt konular da etkilenebilir.
                </p>
              </div>
              <div className="admin-modal-footer">
                <button type="button" onClick={() => setDeleteTargetMain(null)} className="admin-btn admin-btn-secondary">İptal</button>
                <button type="button" onClick={handleDeleteMain} disabled={submitting} className="admin-btn admin-btn-danger">
                  {submitting ? "Siliniyor…" : "Sil"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Silme onay: Alt konu (LessonSub) */}
        {deleteTargetSub && (
          <div className="admin-modal-backdrop" onClick={() => setDeleteTargetSub(null)}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">Alt konuyu sil</div>
              <div className="admin-modal-body">
                <p className="text-slate-600">
                  <strong>{deleteTargetSub.name}</strong> alt konusunu silmek istediğinize emin misiniz? Mikro konular da silinebilir.
                </p>
              </div>
              <div className="admin-modal-footer">
                <button type="button" onClick={() => setDeleteTargetSub(null)} className="admin-btn admin-btn-secondary">İptal</button>
                <button type="button" onClick={handleDeleteSub} disabled={submitting} className="admin-btn admin-btn-danger">
                  {submitting ? "Siliniyor…" : "Sil"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Silme onay: Mikro konu */}
        {deleteTargetMikro && (
          <div className="admin-modal-backdrop" onClick={() => setDeleteTargetMikro(null)}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">Mikro konuyu sil</div>
              <div className="admin-modal-body">
                <p className="text-slate-600">
                  <strong>{deleteTargetMikro.name}</strong> mikro konusunu silmek istediğinize emin misiniz?
                </p>
              </div>
              <div className="admin-modal-footer">
                <button type="button" onClick={() => setDeleteTargetMikro(null)} className="admin-btn admin-btn-secondary">İptal</button>
                <button type="button" onClick={handleDeleteMikro} disabled={submitting} className="admin-btn admin-btn-danger">
                  {submitting ? "Siliniyor…" : "Sil"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="admin-page-wrapper">
      <div className="admin-page-header">
        <div className="flex flex-col gap-1">
          <h1 className="admin-page-title">
            <BookOpen size={28} className="text-emerald-600 shrink-0" />
            Dersler
          </h1>
          <p className="text-slate-500 text-sm">
            Kategori alt kategorisine bağlı ders listeleri (Lesson). İçerik yönetimi için bir satıra tıklayın.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateLesson}
          className="admin-btn admin-btn-primary shrink-0"
        >
          <Plus size={18} />
          Yeni ders listesi
        </button>
      </div>

      <div className="admin-card p-4 mb-4 flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-slate-600">Filtre:</span>
        <select
          className="admin-input w-auto min-w-[160px]"
          value={filterCategoryId}
          onChange={(e) => {
            setFilterCategoryId(e.target.value);
            setFilterSubId("");
          }}
        >
          <option value="">Tüm kategoriler</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          className="admin-input w-auto min-w-[160px]"
          value={filterSubId}
          onChange={(e) => setFilterSubId(e.target.value)}
          disabled={!filterCategoryId}
        >
          <option value="">Tüm alt kategoriler</option>
          {filterSubs.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        {(filterCategoryId || filterSubId) && (
          <button
            type="button"
            onClick={() => { setFilterCategoryId(""); setFilterSubId(""); }}
            className="admin-btn admin-btn-ghost text-sm"
          >
            Filtreyi temizle
          </button>
        )}
      </div>

      {loading ? (
        <div className="admin-loading-center">
          <span className="admin-spinner" />
        </div>
      ) : filteredList.length === 0 ? (
        <div className="admin-empty-state rounded-xl">
          <BookOpen size={48} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium text-slate-600">
            {list.length === 0
              ? "Henüz ders listesi yok."
              : "Filtreye uygun kayıt yok."}
          </p>
          <p className="text-sm mt-1">
            {list.length === 0 && '"Yeni ders listesi" ile alt kategoriye bağlı bir liste oluşturun.'}
          </p>
        </div>
      ) : (
        <div className="admin-card admin-card-elevated overflow-hidden">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="w-14">Sıra</th>
                  <th>Ad</th>
                  <th>Alt kategori</th>
                  <th>Durum</th>
                  <th>Oluşturulma</th>
                  <th className="text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((item) => (
                  <tr
                    key={item.id}
                    className="cursor-pointer hover:bg-emerald-50/50 transition-colors"
                    onClick={() => openManage(item)}
                  >
                    <td className="text-slate-600 tabular-nums">{item.orderIndex ?? "—"}</td>
                    <td className="font-medium">{item.name ?? "—"}</td>
                    <td className="text-slate-600">{item.categorySubName ?? "—"}</td>
                    <td>
                      <span
                        className={
                          item.isActive
                            ? "admin-badge admin-badge-success"
                            : "admin-badge admin-badge-neutral"
                        }
                      >
                        {item.isActive ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td className="text-slate-500 text-sm">{formatDate(item.createdAt)}</td>
                    <td className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); openManage(item); }}
                          className="admin-btn admin-btn-ghost admin-btn-icon text-emerald-600 hover:bg-emerald-50"
                          title="İçeriği yönet"
                        >
                          <ListTree size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); openEditLesson(item); }}
                          className="admin-btn admin-btn-ghost admin-btn-icon"
                          title="Düzenle"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); openDeleteLesson(item); }}
                          className="admin-btn admin-btn-ghost admin-btn-icon text-red-600 hover:bg-red-50"
                          title="Pasif yap"
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

      {/* Modal: Create Lesson — Rapor: categorySubId, name, orderIndex, isActive */}
      {modal === "createLesson" && (
        <div className="admin-modal-backdrop" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">Yeni ders listesi</div>
            <p className="px-4 pt-1 text-sm text-slate-500">Alt kategoriye bağlı ders listesi (Lesson). Hiyerarşi: CategorySub → Lesson → LessonMain → LessonSub → LessonMikro.</p>
            <form onSubmit={handleCreateLesson}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Ad</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={lessonForm.name}
                    onChange={(e) => setLessonForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Örn. TYT Ders Listesi"
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Kategori</label>
                  <select
                    className="admin-input"
                    value={lessonForm.categoryId}
                    onChange={(e) => setLessonForm((f) => ({ ...f, categoryId: e.target.value, categorySubId: "" }))}
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
                    value={lessonForm.categorySubId}
                    onChange={(e) => setLessonForm((f) => ({ ...f, categorySubId: e.target.value }))}
                    required
                    disabled={!lessonForm.categoryId}
                  >
                    <option value="">Seçin</option>
                    {subs.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="admin-form-group mb-0">
                    <label className="admin-label">Sıra</label>
                    <input
                      type="number"
                      className="admin-input w-24"
                      min={0}
                      value={lessonForm.orderIndex}
                      onChange={(e) => setLessonForm((f) => ({ ...f, orderIndex: parseInt(e.target.value, 10) || 0 }))}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="lesson-active"
                      checked={lessonForm.isActive}
                      onChange={(e) => setLessonForm((f) => ({ ...f, isActive: e.target.checked }))}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="lesson-active" className="text-sm font-medium text-slate-700">Aktif</label>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" onClick={closeModal} className="admin-btn admin-btn-secondary">İptal</button>
                <button type="submit" disabled={submitting} className="admin-btn admin-btn-primary">
                  {submitting ? "Oluşturuluyor…" : "Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Lesson — Rapor: name, orderIndex, isActive */}
      {modal === "editLesson" && selected && (
        <div className="admin-modal-backdrop" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">Ders listesini düzenle</div>
            <form onSubmit={handleUpdateLesson}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Ad</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={lessonForm.name}
                    onChange={(e) => setLessonForm((f) => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Sıra</label>
                  <input
                    type="number"
                    className="admin-input w-24"
                    min={0}
                    value={lessonForm.orderIndex}
                    onChange={(e) => setLessonForm((f) => ({ ...f, orderIndex: parseInt(e.target.value, 10) || 0 }))}
                  />
                </div>
                <p className="text-sm text-slate-500">Alt kategori: <strong>{selected.categorySubName ?? selected.categorySubId}</strong></p>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-lesson-active"
                    checked={lessonForm.isActive}
                    onChange={(e) => setLessonForm((f) => ({ ...f, isActive: e.target.checked }))}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="edit-lesson-active" className="text-sm font-medium text-slate-700">Aktif</label>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" onClick={closeModal} className="admin-btn admin-btn-secondary">İptal</button>
                <button type="submit" disabled={submitting} className="admin-btn admin-btn-primary">
                  {submitting ? "Kaydediliyor…" : "Güncelle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Lesson */}
      {modal === "deleteLesson" && selected && (
        <div className="admin-modal-backdrop" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">Ders listesini pasif yap</div>
            <div className="admin-modal-body">
              <p className="text-slate-600">
                <strong>{selected.name ?? selected.categorySubName ?? selected.categorySubId}</strong> ders listesini pasif yapmak istediğinize emin misiniz?
              </p>
            </div>
            <div className="admin-modal-footer">
              <button type="button" onClick={closeModal} className="admin-btn admin-btn-secondary">İptal</button>
              <button type="button" onClick={handleDeleteLesson} disabled={submitting} className="admin-btn admin-btn-danger">
                {submitting ? "İşleniyor…" : "Pasif yap"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lessons;
