import { useEffect, useState } from "react";
import { BookOpen, Plus, Pencil, Trash2, BookMarked, ListTree } from "lucide-react";
import toast from "react-hot-toast";
import {
  getAllLessons,
  createLesson,
  updateLesson,
  deleteLesson,
} from "@/services/adminLessonService";
import {
  getLessonSubsByLessonId,
  createLessonSub,
} from "@/services/adminLessonSubService";
import {
  getMikrosByLessonSubId,
  createLessonMikro,
  updateLessonMikro,
  deleteLessonMikro,
} from "@/services/adminLessonMikroService";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";
import { formatDate } from "@/utils/format";

const Lessons = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    orderIndex: 0,
    isActive: true,
  });
  const [lessonSubForm, setLessonSubForm] = useState({
    code: "",
    name: "",
    description: "",
    orderIndex: 0,
    isActive: true,
  });
  // Alt konular (edit modal'da listelenir)
  const [lessonSubsList, setLessonSubsList] = useState([]);
  const [lessonSubsLoading, setLessonSubsLoading] = useState(false);
  // Mikro konu: hangi alt konu seçili, liste ve form
  const [mikroSub, setMikroSub] = useState(null);
  const [mikroList, setMikroList] = useState([]);
  const [mikroLoading, setMikroLoading] = useState(false);
  const [mikroModal, setMikroModal] = useState(null); // "list" | "add" | "edit"
  const [mikroEditId, setMikroEditId] = useState(null);
  const [mikroForm, setMikroForm] = useState({
    code: "",
    name: "",
    description: "",
    orderIndex: 0,
    isActive: true,
  });
  const [mikroSubmitting, setMikroSubmitting] = useState(false);

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

  useEffect(() => {
    loadLessons();
  }, []);

  // Edit açıldığında alt konuları yükle
  useEffect(() => {
    if (modal === "edit" && selected?.id) {
      setLessonSubsLoading(true);
      getLessonSubsByLessonId(selected.id)
        .then((data) => setLessonSubsList(Array.isArray(data) ? data : []))
        .catch(() => setLessonSubsList([]))
        .finally(() => setLessonSubsLoading(false));
    } else {
      setLessonSubsList([]);
    }
  }, [modal, selected?.id]);

  const resetForm = () => {
    setForm({
      code: "",
      name: "",
      description: "",
      orderIndex: 0,
      isActive: true,
    });
    setSelected(null);
  };

  const openCreate = () => {
    resetForm();
    setModal("create");
  };

  const openEdit = (item) => {
    setSelected(item);
    setForm({
      code: item.code || "",
      name: item.name || "",
      description: item.description || "",
      orderIndex: item.orderIndex ?? 0,
      isActive: item.isActive !== false,
    });
    setModal("edit");
  };

  const openDelete = (item) => {
    setSelected(item);
    setModal("delete");
  };

  const closeModal = () => {
    setModal(null);
    resetForm();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) {
      toast.error("Kod ve ad zorunludur.");
      return;
    }
    setSubmitting(true);
    try {
      await createLesson({
        code: form.code.trim(),
        name: form.name.trim(),
        description: form.description?.trim() || undefined,
        orderIndex: Number(form.orderIndex) || 0,
        isActive: form.isActive,
      });
      toast.success(SUCCESS_MESSAGES.CREATE_SUCCESS);
      closeModal();
      loadLessons();
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.CREATE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selected || (!form.code.trim() && !form.name.trim())) return;
    setSubmitting(true);
    try {
      await updateLesson(selected.id, {
        code: form.code.trim() || undefined,
        name: form.name.trim() || undefined,
        description: form.description?.trim() || undefined,
        orderIndex: Number(form.orderIndex) ?? undefined,
        isActive: form.isActive,
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

  const handleDelete = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await deleteLesson(selected.id);
      toast.success(SUCCESS_MESSAGES.DELETE_SUCCESS);
      closeModal();
      loadLessons();
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.DELETE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  const openAddLessonSub = () => {
    setLessonSubForm({
      code: "",
      name: "",
      description: "",
      orderIndex: 0,
      isActive: true,
    });
    setModal("addLessonSub");
  };

  const handleAddLessonSub = async (e) => {
    e.preventDefault();
    if (!selected || !lessonSubForm.code.trim() || !lessonSubForm.name.trim()) {
      toast.error("Kod ve ad zorunludur.");
      return;
    }
    setSubmitting(true);
    try {
      await createLessonSub(selected.id, {
        code: lessonSubForm.code.trim(),
        name: lessonSubForm.name.trim(),
        description: lessonSubForm.description?.trim() || undefined,
        orderIndex: Number(lessonSubForm.orderIndex) || 0,
        isActive: lessonSubForm.isActive,
      });
      toast.success("Alt konu başarıyla oluşturuldu.");
      setModal("edit");
      setLessonSubForm({ code: "", name: "", description: "", orderIndex: 0, isActive: true });
      getLessonSubsByLessonId(selected.id).then((data) => setLessonSubsList(Array.isArray(data) ? data : []));
    } catch (err) {
      toast.error(err.message || "Alt konu eklenemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  const loadMikros = async (lessonSubId) => {
    setMikroLoading(true);
    try {
      const data = await getMikrosByLessonSubId(lessonSubId);
      setMikroList(Array.isArray(data) ? data : []);
    } catch {
      setMikroList([]);
    } finally {
      setMikroLoading(false);
    }
  };

  const openMikroList = (sub) => {
    setMikroSub(sub);
    setMikroModal("list");
    loadMikros(sub.id);
  };

  const closeMikroModal = () => {
    setMikroSub(null);
    setMikroModal(null);
    setMikroList([]);
    setMikroEditId(null);
    setMikroForm({ code: "", name: "", description: "", orderIndex: 0, isActive: true });
  };

  const openAddMikro = () => {
    setMikroForm({ code: "", name: "", description: "", orderIndex: 0, isActive: true });
    setMikroEditId(null);
    setMikroModal("add");
  };

  const openEditMikro = (item) => {
    setMikroForm({
      code: item.code || "",
      name: item.name || "",
      description: item.description || "",
      orderIndex: item.orderIndex ?? 0,
      isActive: item.isActive !== false,
    });
    setMikroEditId(item.id);
    setMikroModal("edit");
  };

  const handleAddMikro = async (e) => {
    e.preventDefault();
    if (!mikroSub || !mikroForm.code.trim() || !mikroForm.name.trim()) {
      toast.error("Kod ve ad zorunludur.");
      return;
    }
    setMikroSubmitting(true);
    try {
      await createLessonMikro(mikroSub.id, mikroForm);
      toast.success("Mikro konu oluşturuldu.");
      setMikroModal("list");
      loadMikros(mikroSub.id);
      setMikroForm({ code: "", name: "", description: "", orderIndex: 0, isActive: true });
    } catch (err) {
      toast.error(err.message || "Mikro konu eklenemedi.");
    } finally {
      setMikroSubmitting(false);
    }
  };

  const handleUpdateMikro = async (e) => {
    e.preventDefault();
    if (!mikroEditId || !mikroForm.code.trim() || !mikroForm.name.trim()) return;
    setMikroSubmitting(true);
    try {
      await updateLessonMikro(mikroEditId, mikroForm);
      toast.success("Mikro konu güncellendi.");
      setMikroModal("list");
      if (mikroSub) loadMikros(mikroSub.id);
      setMikroEditId(null);
      setMikroForm({ code: "", name: "", description: "", orderIndex: 0, isActive: true });
    } catch (err) {
      toast.error(err.message || "Güncellenemedi.");
    } finally {
      setMikroSubmitting(false);
    }
  };

  const handleDeleteMikro = async (item) => {
    if (!window.confirm(`"${item.name}" mikro konusunu silmek istediğinize emin misiniz?`)) return;
    setMikroSubmitting(true);
    try {
      await deleteLessonMikro(item.id);
      toast.success("Mikro konu silindi.");
      if (mikroSub) loadMikros(mikroSub.id);
    } catch (err) {
      toast.error(err.message || "Silinemedi.");
    } finally {
      setMikroSubmitting(false);
    }
  };

  return (
    <div className="admin-page-wrapper">
      <div className="admin-page-header">
        <h1 className="admin-page-title">
          <BookOpen size={28} className="text-emerald-600" />
          Dersler
        </h1>
        <button type="button" onClick={openCreate} className="admin-btn admin-btn-primary">
          <Plus size={18} />
          Yeni Ders
        </button>
      </div>

      {loading ? (
        <div className="admin-loading-center">
          <span className="admin-spinner" />
        </div>
      ) : list.length === 0 ? (
        <div className="admin-empty-state">
          Henüz ders yok. &quot;Yeni Ders&quot; ile ekleyebilirsiniz.
        </div>
      ) : (
        <div className="admin-card admin-card-elevated">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Kod</th>
                  <th>Ad</th>
                  <th>Sıra</th>
                  <th>Durum</th>
                  <th>Oluşturulma</th>
                  <th className="text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item) => (
                  <tr key={item.id}>
                    <td className="font-medium">{item.code}</td>
                    <td>{item.name}</td>
                    <td>{item.orderIndex ?? "—"}</td>
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
                    <td className="text-slate-500">{formatDate(item.createdAt)}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
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

      {/* Modal: Create */}
      {modal === "create" && (
        <div className="admin-modal-backdrop" onClick={closeModal}>
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">Yeni Ders</div>
            <form onSubmit={handleCreate}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Kod</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Ad</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Açıklama</label>
                  <textarea
                    className="admin-input min-h-[80px]"
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    rows={3}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Sıra</label>
                  <input
                    type="number"
                    className="admin-input"
                    value={form.orderIndex}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        orderIndex: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    min={0}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="create-active"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, isActive: e.target.checked }))
                    }
                    className="rounded border-slate-300 text-emerald-600"
                  />
                  <label htmlFor="create-active" className="text-sm">
                    Aktif
                  </label>
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
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header flex items-center justify-between">
              <span>Ders Düzenle</span>
              <button
                type="button"
                onClick={openAddLessonSub}
                className="admin-btn admin-btn-secondary admin-btn-icon text-sm"
                title="Alt konu ekle"
              >
                <BookMarked size={16} />
                <span className="hidden sm:inline">Alt Konu Ekle</span>
              </button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-group">
                  <label className="admin-label">Kod</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Ad</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Açıklama</label>
                  <textarea
                    className="admin-input min-h-[80px]"
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    rows={3}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Sıra</label>
                  <input
                    type="number"
                    className="admin-input"
                    value={form.orderIndex}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        orderIndex: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    min={0}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-active"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, isActive: e.target.checked }))
                    }
                    className="rounded border-slate-300 text-emerald-600"
                  />
                  <label htmlFor="edit-active" className="text-sm">
                    Aktif
                  </label>
                </div>

                {/* Alt konular listesi + Mikro konular girişi */}
                <div className="admin-form-group border-t border-slate-200 pt-4 mt-4">
                  <label className="admin-label mb-2 block">Alt konular</label>
                  {lessonSubsLoading ? (
                    <div className="flex items-center gap-2 py-4 text-slate-500">
                      <span className="admin-spinner h-4 w-4" />
                      Yükleniyor…
                    </div>
                  ) : lessonSubsList.length === 0 ? (
                    <p className="text-sm text-slate-500 py-2">
                      Henüz alt konu yok. &quot;Alt Konu Ekle&quot; ile ekleyebilirsiniz.
                    </p>
                  ) : (
                    <ul className="space-y-2 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/50 p-2">
                      {lessonSubsList.map((sub) => (
                        <li
                          key={sub.id}
                          className="flex items-center justify-between gap-2 rounded-md bg-white border border-slate-100 px-3 py-2 shadow-sm"
                        >
                          <span className="text-sm font-medium text-slate-800">
                            <span className="text-slate-500 font-normal mr-2">[{sub.code}]</span>
                            {sub.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => openMikroList(sub)}
                            className="admin-btn admin-btn-ghost admin-btn-icon text-emerald-600 hover:bg-emerald-50 text-sm"
                            title="Mikro konular"
                          >
                            <ListTree size={16} />
                            <span className="hidden sm:inline">Mikro konular</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
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

      {/* Modal: Add Lesson Sub */}
      {modal === "addLessonSub" && selected && (
        <div className="admin-modal-backdrop" onClick={() => setModal("edit")}>
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              Alt Konu Ekle — {selected.name}
            </div>
            <form onSubmit={handleAddLessonSub}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Kod</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={lessonSubForm.code}
                    onChange={(e) =>
                      setLessonSubForm((f) => ({ ...f, code: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Ad</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={lessonSubForm.name}
                    onChange={(e) =>
                      setLessonSubForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Açıklama</label>
                  <textarea
                    className="admin-input min-h-[60px]"
                    value={lessonSubForm.description}
                    onChange={(e) =>
                      setLessonSubForm((f) => ({
                        ...f,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Sıra</label>
                  <input
                    type="number"
                    className="admin-input"
                    value={lessonSubForm.orderIndex}
                    onChange={(e) =>
                      setLessonSubForm((f) => ({
                        ...f,
                        orderIndex: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    min={0}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sub-active"
                    checked={lessonSubForm.isActive}
                    onChange={(e) =>
                      setLessonSubForm((f) => ({
                        ...f,
                        isActive: e.target.checked,
                      }))
                    }
                    className="rounded border-slate-300 text-emerald-600"
                  />
                  <label htmlFor="sub-active" className="text-sm">
                    Aktif
                  </label>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setModal("edit")}
                  className="admin-btn admin-btn-secondary"
                >
                  Geri
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

      {/* Modal: Delete */}
      {modal === "delete" && selected && (
        <div className="admin-modal-backdrop" onClick={closeModal}>
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">Dersi Pasif Yap</div>
            <div className="admin-modal-body">
              <p className="text-slate-600">
                &quot;{selected.name}&quot; dersini pasif hale getirmek istediğinize emin
                misiniz?
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
                {submitting ? "İşleniyor…" : "Pasif Yap"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Mikro konular (liste / ekle / düzenle) */}
      {mikroModal && mikroSub && (
        <div className="admin-modal-backdrop" onClick={closeMikroModal}>
          <div
            className="admin-modal admin-modal-lg max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header flex items-center justify-between gap-2">
              <span className="truncate">
                Mikro konular — {mikroSub.name}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                {mikroModal === "list" && (
                  <button
                    type="button"
                    onClick={openAddMikro}
                    className="admin-btn admin-btn-primary admin-btn-icon text-sm"
                  >
                    <Plus size={16} />
                    Mikro ekle
                  </button>
                )}
                <button
                  type="button"
                  onClick={closeMikroModal}
                  className="admin-btn admin-btn-ghost admin-btn-icon"
                  title="Kapat"
                >
                  ✕
                </button>
              </div>
            </div>

            {mikroModal === "list" && (
              <>
                <div className="admin-modal-body p-0">
                  {mikroLoading ? (
                    <div className="flex items-center justify-center gap-2 py-12 text-slate-500">
                      <span className="admin-spinner" />
                      Yükleniyor…
                    </div>
                  ) : mikroList.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 text-sm">
                      Bu alt konu için henüz mikro konu yok. &quot;Mikro ekle&quot; ile ekleyebilirsiniz.
                    </div>
                  ) : (
                    <div className="admin-table-wrapper overflow-x-auto">
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
                          {mikroList.map((m) => (
                            <tr key={m.id}>
                              <td className="font-mono text-sm">{m.code}</td>
                              <td>{m.name}</td>
                              <td>{m.orderIndex ?? 0}</td>
                              <td>
                                <span
                                  className={
                                    m.isActive !== false
                                      ? "text-emerald-600"
                                      : "text-slate-400"
                                  }
                                >
                                  {m.isActive !== false ? "Aktif" : "Pasif"}
                                </span>
                              </td>
                              <td className="text-right">
                                <button
                                  type="button"
                                  onClick={() => openEditMikro(m)}
                                  className="admin-btn admin-btn-ghost admin-btn-icon text-slate-600"
                                  title="Düzenle"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMikro(m)}
                                  disabled={mikroSubmitting}
                                  className="admin-btn admin-btn-ghost admin-btn-icon text-red-600 hover:bg-red-50"
                                  title="Sil"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <div className="admin-modal-footer">
                  <button
                    type="button"
                    onClick={closeMikroModal}
                    className="admin-btn admin-btn-secondary"
                  >
                    Kapat
                  </button>
                </div>
              </>
            )}

            {mikroModal === "add" && (
              <form onSubmit={handleAddMikro}>
                <div className="admin-modal-body space-y-4">
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Kod</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={mikroForm.code}
                      onChange={(e) =>
                        setMikroForm((f) => ({ ...f, code: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Ad</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={mikroForm.name}
                      onChange={(e) =>
                        setMikroForm((f) => ({ ...f, name: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Açıklama</label>
                    <textarea
                      className="admin-input min-h-[60px]"
                      value={mikroForm.description}
                      onChange={(e) =>
                        setMikroForm((f) => ({ ...f, description: e.target.value }))
                      }
                      rows={2}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Sıra</label>
                    <input
                      type="number"
                      className="admin-input"
                      value={mikroForm.orderIndex}
                      onChange={(e) =>
                        setMikroForm((f) => ({
                          ...f,
                          orderIndex: parseInt(e.target.value, 10) || 0,
                        }))
                      }
                      min={0}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="mikro-active"
                      checked={mikroForm.isActive}
                      onChange={(e) =>
                        setMikroForm((f) => ({ ...f, isActive: e.target.checked }))
                      }
                      className="rounded border-slate-300 text-emerald-600"
                    />
                    <label htmlFor="mikro-active" className="text-sm">Aktif</label>
                  </div>
                </div>
                <div className="admin-modal-footer">
                  <button
                    type="button"
                    onClick={() => setMikroModal("list")}
                    className="admin-btn admin-btn-secondary"
                  >
                    Geri
                  </button>
                  <button
                    type="submit"
                    disabled={mikroSubmitting}
                    className="admin-btn admin-btn-primary"
                  >
                    {mikroSubmitting ? "Kaydediliyor…" : "Oluştur"}
                  </button>
                </div>
              </form>
            )}

            {mikroModal === "edit" && (
              <form onSubmit={handleUpdateMikro}>
                <div className="admin-modal-body space-y-4">
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Kod</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={mikroForm.code}
                      onChange={(e) =>
                        setMikroForm((f) => ({ ...f, code: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Ad</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={mikroForm.name}
                      onChange={(e) =>
                        setMikroForm((f) => ({ ...f, name: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Açıklama</label>
                    <textarea
                      className="admin-input min-h-[60px]"
                      value={mikroForm.description}
                      onChange={(e) =>
                        setMikroForm((f) => ({ ...f, description: e.target.value }))
                      }
                      rows={2}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Sıra</label>
                    <input
                      type="number"
                      className="admin-input"
                      value={mikroForm.orderIndex}
                      onChange={(e) =>
                        setMikroForm((f) => ({
                          ...f,
                          orderIndex: parseInt(e.target.value, 10) || 0,
                        }))
                      }
                      min={0}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="mikro-edit-active"
                      checked={mikroForm.isActive}
                      onChange={(e) =>
                        setMikroForm((f) => ({ ...f, isActive: e.target.checked }))
                      }
                      className="rounded border-slate-300 text-emerald-600"
                    />
                    <label htmlFor="mikro-edit-active" className="text-sm">Aktif</label>
                  </div>
                </div>
                <div className="admin-modal-footer">
                  <button
                    type="button"
                    onClick={() => setMikroModal("list")}
                    className="admin-btn admin-btn-secondary"
                  >
                    Geri
                  </button>
                  <button
                    type="submit"
                    disabled={mikroSubmitting}
                    className="admin-btn admin-btn-primary"
                  >
                    {mikroSubmitting ? "Güncelleniyor…" : "Güncelle"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Lessons;
