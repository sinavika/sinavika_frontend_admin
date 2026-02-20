import { useEffect, useState } from "react";
import { FolderTree, Plus, Pencil, Trash2, Image as ImageIcon, Layers, Sliders, LayoutList } from "lucide-react";
import toast from "react-hot-toast";
import { getFullImageUrl } from "@/constants";
import {
  getAllCategories,
  createCategory,
  updateCategoryName,
  updateCategoryImage,
  deleteCategory,
} from "@/services/adminCategoryService";
import {
  getSubsByCategoryId,
  createSub,
  updateSub,
  deleteSub,
} from "@/services/adminCategorySubService";
import {
  getFeatureBySubId,
  createCategoryFeature,
  updateCategoryFeature,
  deleteCategoryFeature,
} from "@/services/adminCategoryFeatureService";
import {
  getSectionsBySubId,
  createCategorySection,
  updateCategorySection,
  deleteCategorySection,
} from "@/services/adminCategorySectionService";
import { getAllLessonMains } from "@/services/adminLessonMainService";
import { getLessonSubsByLessonMainId } from "@/services/adminLessonSubService";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";
import { formatDate } from "@/utils/format";

const Categories = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // "create" | "edit" | "editImage" | "delete" | null
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state (create / edit)
  const [form, setForm] = useState({ code: "", name: "", isActive: true, file: null });
  const [editImageFile, setEditImageFile] = useState(null);

  // Alt kategori yönetimi
  const [categoryForSubs, setCategoryForSubs] = useState(null);
  const [subList, setSubList] = useState([]);
  const [subListLoading, setSubListLoading] = useState(false);
  const [subModal, setSubModal] = useState(null); // "list" | "create" | "edit" | "delete" | null
  const [selectedSub, setSelectedSub] = useState(null);
  const [subForm, setSubForm] = useState({ code: "", name: "", isActive: true });
  const [subSubmitting, setSubSubmitting] = useState(false);

  // Alt kategori özellik (Feature) — her alt kategoride en fazla bir
  const [featureSub, setFeatureSub] = useState(null);
  const [featureData, setFeatureData] = useState(null);
  const [featureForm, setFeatureForm] = useState({
    defaultQuestionCount: 40,
    defaultDurationMinutes: 120,
    defaultQuestionOptionCount: 5,
    usesNegativeMarking: false,
    negativeMarkingRule: "",
  });
  const [featureLoading, setFeatureLoading] = useState(false);
  const [featureSubmitting, setFeatureSubmitting] = useState(false);

  // Alt kategori bölüm şablonları (Section)
  const [sectionSub, setSectionSub] = useState(null);
  const [sectionList, setSectionList] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [sectionForm, setSectionForm] = useState({
    name: "",
    lessonId: "",
    lessonSubId: "",
    orderIndex: 0,
    questionCount: 40,
    durationMinutes: 40,
    minQuestions: 35,
    maxQuestions: 45,
    targetQuestions: 40,
    difficultyMix: "",
  });
  const [sectionEditId, setSectionEditId] = useState(null);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [sectionSubmitting, setSectionSubmitting] = useState(false);
  const [sectionLessonSubs, setSectionLessonSubs] = useState([]);

  useEffect(() => {
    if (!sectionForm.lessonId) {
      setSectionLessonSubs([]);
      return;
    }
    let cancelled = false;
    getLessonSubsByLessonMainId(sectionForm.lessonId).then((data) => {
      if (!cancelled) setSectionLessonSubs(Array.isArray(data) ? data : []);
    }).catch(() => { if (!cancelled) setSectionLessonSubs([]); });
    return () => { cancelled = true; };
  }, [sectionForm.lessonId]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await getAllCategories();
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.FETCH_FAILED);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const loadLessonsOnce = async () => {
    if (lessons.length > 0) return;
    try {
      const data = await getAllLessonMains();
      setLessons(Array.isArray(data) ? data : []);
    } catch {
      setLessons([]);
    }
  };

  const loadSubs = async (categoryId) => {
    setSubListLoading(true);
    try {
      const data = await getSubsByCategoryId(categoryId);
      setSubList(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.FETCH_FAILED);
      setSubList([]);
    } finally {
      setSubListLoading(false);
    }
  };

  const openSubList = (cat) => {
    setCategoryForSubs(cat);
    setSubModal("list");
    loadSubs(cat.id);
  };

  const closeSubModal = () => {
    setSubModal(null);
    setCategoryForSubs(null);
    setSubList([]);
    setSelectedSub(null);
    setSubForm({ code: "", name: "", isActive: true });
  };

  const openSubCreate = () => {
    setSubForm({ code: "", name: "", isActive: true });
    setSubModal("create");
  };

  const openSubEdit = (sub) => {
    setSelectedSub(sub);
    setSubForm({
      code: sub.code || "",
      name: sub.name || "",
      isActive: sub.isActive !== false,
    });
    setSubModal("edit");
  };

  const openSubDelete = (sub) => {
    setSelectedSub(sub);
    setSubModal("delete");
  };

  const handleSubCreate = async (e) => {
    e.preventDefault();
    if (!categoryForSubs || !subForm.code.trim() || !subForm.name.trim()) {
      toast.error("Kod ve ad zorunludur.");
      return;
    }
    setSubSubmitting(true);
    try {
      await createSub({
        categoryId: categoryForSubs.id,
        code: subForm.code.trim(),
        name: subForm.name.trim(),
        isActive: subForm.isActive,
      });
      toast.success(SUCCESS_MESSAGES.CREATE_SUCCESS);
      setSubModal("list");
      loadSubs(categoryForSubs.id);
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.CREATE_FAILED);
    } finally {
      setSubSubmitting(false);
    }
  };

  const handleSubUpdate = async (e) => {
    e.preventDefault();
    if (!selectedSub || (!subForm.code.trim() && !subForm.name.trim())) return;
    setSubSubmitting(true);
    try {
      await updateSub(selectedSub.id, {
        code: subForm.code.trim() || undefined,
        name: subForm.name.trim() || undefined,
        isActive: subForm.isActive,
      });
      toast.success(SUCCESS_MESSAGES.UPDATE_SUCCESS);
      setSubModal("list");
      if (categoryForSubs) loadSubs(categoryForSubs.id);
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.UPDATE_FAILED);
    } finally {
      setSubSubmitting(false);
    }
  };

  const handleSubDelete = async () => {
    if (!selectedSub) return;
    setSubSubmitting(true);
    try {
      await deleteSub(selectedSub.id);
      toast.success(SUCCESS_MESSAGES.DELETE_SUCCESS);
      setSubModal("list");
      if (categoryForSubs) loadSubs(categoryForSubs.id);
      setSelectedSub(null);
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.DELETE_FAILED);
    } finally {
      setSubSubmitting(false);
    }
  };

  const openFeatureModal = async (sub) => {
    setFeatureSub(sub);
    setFeatureLoading(true);
    setFeatureData(null);
    setFeatureForm({ defaultQuestionCount: 40, defaultDurationMinutes: 120, defaultQuestionOptionCount: 5, usesNegativeMarking: false, negativeMarkingRule: "" });
    try {
      const data = await getFeatureBySubId(sub.id);
      setFeatureData(data);
      setFeatureForm({
        defaultQuestionCount: data.defaultQuestionCount ?? 40,
        defaultDurationMinutes: data.defaultDurationMinutes ?? 120,
        defaultQuestionOptionCount: data.defaultQuestionOptionCount ?? 5,
        usesNegativeMarking: data.usesNegativeMarking === true,
        negativeMarkingRule: data.negativeMarkingRule ?? "",
      });
    } catch {
      setFeatureData(null);
    } finally {
      setFeatureLoading(false);
    }
  };
  const closeFeatureModal = () => {
    setFeatureSub(null);
    setFeatureData(null);
  };
  const handleFeatureCreate = async (e) => {
    e.preventDefault();
    if (!featureSub) return;
    setFeatureSubmitting(true);
    try {
      await createCategoryFeature({
        categorySubId: featureSub.id,
        ...featureForm,
      });
      toast.success("Sınav özelliği oluşturuldu.");
      openFeatureModal(featureSub);
    } catch (err) {
      toast.error(err.message || "Oluşturulamadı.");
    } finally {
      setFeatureSubmitting(false);
    }
  };
  const handleFeatureUpdate = async (e) => {
    e.preventDefault();
    if (!featureData) return;
    setFeatureSubmitting(true);
    try {
      await updateCategoryFeature(featureData.id, featureForm);
      toast.success(SUCCESS_MESSAGES.UPDATE_SUCCESS);
      closeFeatureModal();
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.UPDATE_FAILED);
    } finally {
      setFeatureSubmitting(false);
    }
  };
  const handleFeatureDelete = async () => {
    if (!featureData) return;
    setFeatureSubmitting(true);
    try {
      await deleteCategoryFeature(featureData.id);
      toast.success("Özellik silindi.");
      closeFeatureModal();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setFeatureSubmitting(false);
    }
  };

  const defaultSectionForm = () => ({
    name: "",
    lessonId: "",
    lessonSubId: "",
    orderIndex: 0,
    questionCount: 40,
    durationMinutes: 40,
    minQuestions: 35,
    maxQuestions: 45,
    targetQuestions: 40,
    difficultyMix: "",
  });
  const openSectionModal = async (sub) => {
    setSectionSub(sub);
    setSectionEditId(null);
    setSectionForm(defaultSectionForm());
    setSectionLoading(true);
    try {
      await loadLessonsOnce();
      const [secs] = await Promise.all([getSectionsBySubId(sub.id)]);
      setSectionList(Array.isArray(secs) ? secs : []);
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.FETCH_FAILED);
      setSectionList([]);
    } finally {
      setSectionLoading(false);
    }
  };
  const closeSectionModal = () => {
    setSectionSub(null);
    setSectionList([]);
    setSectionEditId(null);
  };
  const loadSectionList = async () => {
    if (!sectionSub) return;
    try {
      const data = await getSectionsBySubId(sectionSub.id);
      setSectionList(Array.isArray(data) ? data : []);
    } catch {
      setSectionList([]);
    }
  };
  const handleSectionCreate = async (e) => {
    e.preventDefault();
    if (!sectionSub || !sectionForm.name.trim()) {
      toast.error("Bölüm adı zorunludur.");
      return;
    }
    if (!sectionForm.lessonId) {
      toast.error("Ders seçin.");
      return;
    }
    setSectionSubmitting(true);
    try {
      await createCategorySection({
        categorySubId: sectionSub.id,
        lessonId: sectionForm.lessonId,
        lessonSubId: sectionForm.lessonSubId?.trim() || undefined,
        name: sectionForm.name.trim(),
        orderIndex: Number(sectionForm.orderIndex) ?? 0,
        questionCount: Number(sectionForm.questionCount) ?? 0,
        durationMinutes: sectionForm.durationMinutes != null && sectionForm.durationMinutes !== "" ? Number(sectionForm.durationMinutes) : undefined,
        minQuestions: Number(sectionForm.minQuestions) ?? 35,
        maxQuestions: Number(sectionForm.maxQuestions) ?? 45,
        targetQuestions: sectionForm.targetQuestions != null && sectionForm.targetQuestions !== "" ? Number(sectionForm.targetQuestions) : undefined,
        difficultyMix: sectionForm.difficultyMix?.trim() || undefined,
      });
      toast.success("Bölüm şablonu eklendi.");
      setSectionForm(defaultSectionForm());
      loadSectionList();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSectionSubmitting(false);
    }
  };
  const handleSectionUpdate = async (e) => {
    e.preventDefault();
    if (!sectionEditId) return;
    setSectionSubmitting(true);
    try {
      // Rapor 5.5: update body sadece lessonId, name, orderIndex, questionCount, durationMinutes
      await updateCategorySection(sectionEditId, {
        lessonId: sectionForm.lessonId || undefined,
        name: sectionForm.name?.trim() || undefined,
        orderIndex: Number(sectionForm.orderIndex),
        questionCount: Number(sectionForm.questionCount),
        durationMinutes: sectionForm.durationMinutes != null && sectionForm.durationMinutes !== "" ? Number(sectionForm.durationMinutes) : undefined,
      });
      toast.success(SUCCESS_MESSAGES.UPDATE_SUCCESS);
      setSectionEditId(null);
      setSectionForm(defaultSectionForm());
      loadSectionList();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSectionSubmitting(false);
    }
  };
  const openSectionEdit = (sec) => {
    setSectionEditId(sec.id);
    setSectionForm({
      name: sec.name || "",
      lessonId: sec.lessonId || "",
      lessonSubId: sec.lessonSubId ?? "",
      orderIndex: sec.orderIndex ?? 0,
      questionCount: sec.questionCount ?? 40,
      durationMinutes: sec.durationMinutes ?? 40,
      minQuestions: sec.minQuestions ?? 35,
      maxQuestions: sec.maxQuestions ?? 45,
      targetQuestions: sec.targetQuestions ?? 40,
      difficultyMix: sec.difficultyMix ?? "",
    });
  };
  const handleSectionDelete = async (sectionId) => {
    setSectionSubmitting(true);
    try {
      await deleteCategorySection(sectionId);
      toast.success("Bölüm şablonu silindi.");
      loadSectionList();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSectionSubmitting(false);
    }
  };

  const openCreate = () => {
    setForm({ code: "", name: "", isActive: true, file: null });
    setModal("create");
  };

  const openEdit = (cat) => {
    setSelected(cat);
    setForm({
      code: cat.code || "",
      name: cat.name || "",
      isActive: cat.isActive !== false,
      file: null,
    });
    setModal("edit");
  };

  const openEditImage = (cat) => {
    setSelected(cat);
    setEditImageFile(null);
    setModal("editImage");
  };

  const openDelete = (cat) => {
    setSelected(cat);
    setModal("delete");
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setForm({ code: "", name: "", isActive: true, file: null });
    setEditImageFile(null);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) {
      toast.error("Kod ve ad zorunludur.");
      return;
    }
    setSubmitting(true);
    try {
      await createCategory({
        code: form.code.trim(),
        name: form.name.trim(),
        isActive: form.isActive,
        file: form.file || undefined,
      });
      toast.success(SUCCESS_MESSAGES.CREATE_SUCCESS);
      closeModal();
      loadCategories();
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
      await updateCategoryName(selected.id, {
        code: form.code.trim() || undefined,
        name: form.name.trim() || undefined,
        isActive: form.isActive,
      });
      toast.success(SUCCESS_MESSAGES.UPDATE_SUCCESS);
      closeModal();
      loadCategories();
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.UPDATE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateImage = async (e) => {
    e.preventDefault();
    if (!selected || !editImageFile) {
      toast.error("Lütfen bir resim seçin.");
      return;
    }
    setSubmitting(true);
    try {
      await updateCategoryImage(selected.id, editImageFile);
      toast.success("Kategori resmi güncellendi.");
      closeModal();
      loadCategories();
    } catch (err) {
      toast.error(err.message || "Resim güncellenemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await deleteCategory(selected.id);
      toast.success(SUCCESS_MESSAGES.DELETE_SUCCESS);
      closeModal();
      loadCategories();
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.DELETE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-page-wrapper">
      <div className="admin-page-header">
        <h1 className="admin-page-title">
          <FolderTree size={28} className="text-emerald-600" />
          Kategoriler
        </h1>
        <button type="button" onClick={openCreate} className="admin-btn admin-btn-primary">
          <Plus size={18} />
          Yeni Kategori
        </button>
      </div>

      {loading ? (
        <div className="admin-loading-center">
          <span className="admin-spinner" />
        </div>
      ) : list.length === 0 ? (
        <div className="admin-empty-state">
          Henüz kategori yok. &quot;Yeni Kategori&quot; ile ekleyebilirsiniz.
        </div>
      ) : (
        <div className="admin-card admin-card-elevated">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Görsel</th>
                  <th>Kod</th>
                  <th>Ad</th>
                  <th>Durum</th>
                  <th>Oluşturulma</th>
                  <th className="text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {list.map((cat) => (
                  <tr key={cat.id}>
                    <td>
                      {cat.imageUrl ? (
                        <img
                          src={getFullImageUrl(cat.imageUrl)}
                          alt={cat.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                          <ImageIcon size={20} className="text-slate-400" />
                        </div>
                      )}
                    </td>
                    <td className="font-medium">{cat.code}</td>
                    <td>{cat.name}</td>
                    <td>
                      <span
                        className={
                          cat.isActive
                            ? "admin-badge admin-badge-success"
                            : "admin-badge admin-badge-neutral"
                        }
                      >
                        {cat.isActive ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td className="text-slate-500">{formatDate(cat.createdAt)}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openSubList(cat)}
                          className="admin-btn admin-btn-ghost admin-btn-icon"
                          title="Alt kategoriler"
                        >
                          <Layers size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditImage(cat)}
                          className="admin-btn admin-btn-ghost admin-btn-icon"
                          title="Resmi güncelle"
                        >
                          <ImageIcon size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(cat)}
                          className="admin-btn admin-btn-ghost admin-btn-icon"
                          title="Düzenle"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDelete(cat)}
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
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">Yeni Kategori</div>
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
                  <label className="admin-label">Görsel (opsiyonel)</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="admin-input"
                    onChange={(e) => setForm((f) => ({ ...f, file: e.target.files?.[0] || null }))}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="create-active"
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                    className="rounded border-slate-300 text-emerald-600"
                  />
                  <label htmlFor="create-active" className="text-sm">Aktif</label>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" onClick={closeModal} className="admin-btn admin-btn-secondary">
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

      {/* Modal: Edit */}
      {modal === "edit" && selected && (
        <div className="admin-modal-backdrop" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">Kategori Düzenle</div>
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
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-active"
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                    className="rounded border-slate-300 text-emerald-600"
                  />
                  <label htmlFor="edit-active" className="text-sm">Aktif</label>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" onClick={closeModal} className="admin-btn admin-btn-secondary">
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

      {/* Modal: Edit Image */}
      {modal === "editImage" && selected && (
        <div className="admin-modal-backdrop" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">Kategori Resmini Güncelle</div>
            <form onSubmit={handleUpdateImage}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Yeni görsel</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="admin-input"
                    onChange={(e) => setEditImageFile(e.target.files?.[0] || null)}
                    required
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" onClick={closeModal} className="admin-btn admin-btn-secondary">
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting || !editImageFile}
                  className="admin-btn admin-btn-primary"
                >
                  {submitting ? "Yükleniyor…" : "Güncelle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete */}
      {modal === "delete" && selected && (
        <div className="admin-modal-backdrop" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">Kategoriyi Sil</div>
            <div className="admin-modal-body">
              <p className="text-slate-600">
                &quot;{selected.name}&quot; kategorisini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
              </p>
            </div>
            <div className="admin-modal-footer">
              <button type="button" onClick={closeModal} className="admin-btn admin-btn-secondary">
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

      {/* Alt kategori modalleri */}
      {subModal === "list" && categoryForSubs && (
        <div className="admin-modal-backdrop" onClick={closeSubModal}>
          <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header flex items-center justify-between">
              <span>Alt kategoriler: {categoryForSubs.name}</span>
              <button type="button" onClick={closeSubModal} className="admin-btn admin-btn-ghost admin-btn-icon">
                ×
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="flex justify-end mb-3">
                <button type="button" onClick={openSubCreate} className="admin-btn admin-btn-primary">
                  <Plus size={16} /> Yeni Alt Kategori
                </button>
              </div>
              {subListLoading ? (
                <div className="admin-loading-center py-8">
                  <span className="admin-spinner" />
                </div>
              ) : subList.length === 0 ? (
                <p className="text-slate-500 text-center py-6">Bu kategoride henüz alt kategori yok.</p>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Kod</th>
                        <th>Ad</th>
                        <th>Durum</th>
                        <th>Oluşturulma</th>
                        <th className="text-right">İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subList.map((sub) => (
                        <tr key={sub.id}>
                          <td className="font-medium">{sub.code}</td>
                          <td>{sub.name}</td>
                          <td>
                            <span className={sub.isActive ? "admin-badge admin-badge-success" : "admin-badge admin-badge-neutral"}>
                              {sub.isActive ? "Aktif" : "Pasif"}
                            </span>
                          </td>
                          <td className="text-slate-500">{formatDate(sub.createdAt)}</td>
                          <td className="text-right">
                            <div className="admin-exam-actions">
                              <button type="button" onClick={() => openFeatureModal(sub)} className="admin-btn admin-btn-ghost admin-btn-icon" title="Sınav özelliği">
                                <Sliders size={16} />
                              </button>
                              <button type="button" onClick={() => openSectionModal(sub)} className="admin-btn admin-btn-ghost admin-btn-icon" title="Bölüm şablonları">
                                <LayoutList size={16} />
                              </button>
                              <button type="button" onClick={() => openSubEdit(sub)} className="admin-btn admin-btn-ghost admin-btn-icon" title="Düzenle">
                                <Pencil size={16} />
                              </button>
                              <button type="button" onClick={() => openSubDelete(sub)} className="admin-btn admin-btn-ghost admin-btn-icon text-red-600" title="Sil">
                                <Trash2 size={16} />
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
        </div>
      )}

      {subModal === "create" && categoryForSubs && (
        <div className="admin-modal-backdrop" onClick={() => setSubModal("list")}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">Yeni Alt Kategori ({categoryForSubs.name})</div>
            <form onSubmit={handleSubCreate}>
              <div className="admin-modal-body space-y-4">
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
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sub-create-active"
                    checked={subForm.isActive}
                    onChange={(e) => setSubForm((f) => ({ ...f, isActive: e.target.checked }))}
                    className="rounded border-slate-300 text-emerald-600"
                  />
                  <label htmlFor="sub-create-active" className="text-sm">Aktif</label>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" onClick={() => setSubModal("list")} className="admin-btn admin-btn-secondary">İptal</button>
                <button type="submit" disabled={subSubmitting} className="admin-btn admin-btn-primary">
                  {subSubmitting ? "Kaydediliyor…" : "Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {subModal === "edit" && selectedSub && (
        <div className="admin-modal-backdrop" onClick={() => setSubModal("list")}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">Alt Kategori Düzenle</div>
            <form onSubmit={handleSubUpdate}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-group">
                  <label className="admin-label">Kod</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={subForm.code}
                    onChange={(e) => setSubForm((f) => ({ ...f, code: e.target.value }))}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Ad</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={subForm.name}
                    onChange={(e) => setSubForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sub-edit-active"
                    checked={subForm.isActive}
                    onChange={(e) => setSubForm((f) => ({ ...f, isActive: e.target.checked }))}
                    className="rounded border-slate-300 text-emerald-600"
                  />
                  <label htmlFor="sub-edit-active" className="text-sm">Aktif</label>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" onClick={() => setSubModal("list")} className="admin-btn admin-btn-secondary">İptal</button>
                <button type="submit" disabled={subSubmitting} className="admin-btn admin-btn-primary">
                  {subSubmitting ? "Güncelleniyor…" : "Güncelle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {subModal === "delete" && selectedSub && (
        <div className="admin-modal-backdrop" onClick={() => setSubModal("list")}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">Alt Kategoriyi Sil</div>
            <div className="admin-modal-body">
              <p className="text-slate-600">
                &quot;{selectedSub.name}&quot; alt kategorisini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
              </p>
            </div>
            <div className="admin-modal-footer">
              <button type="button" onClick={() => setSubModal("list")} className="admin-btn admin-btn-secondary">İptal</button>
              <button type="button" onClick={handleSubDelete} disabled={subSubmitting} className="admin-btn admin-btn-danger">
                {subSubmitting ? "Siliniyor…" : "Sil"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Sınav özelliği (Feature) — alt kategori başına en fazla bir */}
      {featureSub && (
        <div className="admin-modal-backdrop" onClick={closeFeatureModal}>
          <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header flex items-center justify-between">
              <span>Sınav özelliği: {featureSub.name}</span>
              <button type="button" onClick={closeFeatureModal} className="admin-btn admin-btn-ghost admin-btn-icon">×</button>
            </div>
            <div className="admin-modal-body">
              {featureLoading ? (
                <div className="admin-loading-center py-8"><span className="admin-spinner" /></div>
              ) : featureData ? (
                <form onSubmit={handleFeatureUpdate} className="space-y-4">
                  <div className="admin-form-row admin-form-row-3">
                    <div className="admin-form-group">
                      <label className="admin-label">Varsayılan soru sayısı</label>
                      <input type="number" className="admin-input" min={1} value={featureForm.defaultQuestionCount} onChange={(e) => setFeatureForm((f) => ({ ...f, defaultQuestionCount: e.target.value }))} />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Süre (dk)</label>
                      <input type="number" className="admin-input" min={1} value={featureForm.defaultDurationMinutes} onChange={(e) => setFeatureForm((f) => ({ ...f, defaultDurationMinutes: e.target.value }))} />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Şık sayısı</label>
                      <input type="number" className="admin-input" min={2} value={featureForm.defaultQuestionOptionCount} onChange={(e) => setFeatureForm((f) => ({ ...f, defaultQuestionOptionCount: e.target.value }))} />
                    </div>
                  </div>
                  <div className="admin-form-row admin-form-row-2">
                    <div className="admin-form-group">
                      <label className="admin-label">Negatif puanlama kuralı</label>
                      <input type="text" className="admin-input" placeholder="4W1R" value={featureForm.negativeMarkingRule} onChange={(e) => setFeatureForm((f) => ({ ...f, negativeMarkingRule: e.target.value }))} />
                    </div>
                    <div className="admin-form-group flex items-end">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={featureForm.usesNegativeMarking} onChange={(e) => setFeatureForm((f) => ({ ...f, usesNegativeMarking: e.target.checked }))} className="rounded border-slate-300 text-emerald-600" />
                        Negatif puanlama kullan
                      </label>
                    </div>
                  </div>
                  <div className="admin-modal-footer border-t pt-4 mt-4">
                    <button type="button" onClick={handleFeatureDelete} disabled={featureSubmitting} className="admin-btn admin-btn-ghost text-red-600">Sil</button>
                    <div className="flex gap-2 ml-auto">
                      <button type="button" onClick={closeFeatureModal} className="admin-btn admin-btn-secondary">İptal</button>
                      <button type="submit" disabled={featureSubmitting} className="admin-btn admin-btn-primary">{featureSubmitting ? "Güncelleniyor…" : "Güncelle"}</button>
                    </div>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleFeatureCreate} className="space-y-4">
                  <p className="text-slate-600 text-sm">Bu alt kategori için henüz sınav özelliği yok. Oluşturabilirsiniz (her alt kategoride en fazla bir kayıt).</p>
                  <div className="admin-form-row admin-form-row-3">
                    <div className="admin-form-group">
                      <label className="admin-label">Varsayılan soru sayısı</label>
                      <input type="number" className="admin-input" min={1} value={featureForm.defaultQuestionCount} onChange={(e) => setFeatureForm((f) => ({ ...f, defaultQuestionCount: e.target.value }))} />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Süre (dk)</label>
                      <input type="number" className="admin-input" min={1} value={featureForm.defaultDurationMinutes} onChange={(e) => setFeatureForm((f) => ({ ...f, defaultDurationMinutes: e.target.value }))} />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Şık sayısı</label>
                      <input type="number" className="admin-input" min={2} value={featureForm.defaultQuestionOptionCount} onChange={(e) => setFeatureForm((f) => ({ ...f, defaultQuestionOptionCount: e.target.value }))} />
                    </div>
                  </div>
                  <div className="admin-form-row admin-form-row-2">
                    <div className="admin-form-group">
                      <label className="admin-label">Negatif puanlama kuralı</label>
                      <input type="text" className="admin-input" placeholder="4W1R" value={featureForm.negativeMarkingRule} onChange={(e) => setFeatureForm((f) => ({ ...f, negativeMarkingRule: e.target.value }))} />
                    </div>
                    <div className="admin-form-group flex items-end">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={featureForm.usesNegativeMarking} onChange={(e) => setFeatureForm((f) => ({ ...f, usesNegativeMarking: e.target.checked }))} className="rounded border-slate-300 text-emerald-600" />
                        Negatif puanlama kullan
                      </label>
                    </div>
                  </div>
                  <div className="admin-modal-footer border-t pt-4 mt-4">
                    <button type="button" onClick={closeFeatureModal} className="admin-btn admin-btn-secondary">İptal</button>
                    <button type="submit" disabled={featureSubmitting} className="admin-btn admin-btn-primary">{featureSubmitting ? "Oluşturuluyor…" : "Oluştur"}</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Bölüm şablonları (Section) */}
      {sectionSub && (
        <div className="admin-modal-backdrop" onClick={closeSectionModal}>
          <div className="admin-modal admin-modal-xl" onClick={(e) => e.stopPropagation()} style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div className="admin-modal-header flex items-center justify-between">
              <span>Bölüm şablonları: {sectionSub.name}</span>
              <button type="button" onClick={closeSectionModal} className="admin-btn admin-btn-ghost admin-btn-icon">×</button>
            </div>
            <div className="admin-modal-body overflow-y-auto flex-1 min-h-0">
              {sectionLoading ? (
                <div className="admin-loading-center py-8"><span className="admin-spinner" /></div>
              ) : (
                <div className="space-y-6">
                  <form onSubmit={sectionEditId ? handleSectionUpdate : handleSectionCreate} className="admin-card p-4">
                    <div className="font-medium text-slate-700 mb-3">{sectionEditId ? "Bölümü düzenle" : "Yeni bölüm şablonu"}</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                      <div className="col-span-2 sm:col-span-1">
                        <label className="admin-label">Ders</label>
                        <select className="admin-input" value={sectionForm.lessonId} onChange={(e) => setSectionForm((f) => ({ ...f, lessonId: e.target.value }))} required={!sectionEditId}>
                          <option value="">Seçin</option>
                          {lessons.map((l) => (
                            <option key={l.id} value={l.id}>{l.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="admin-label">Bölüm adı</label>
                        <input type="text" className="admin-input" value={sectionForm.name} onChange={(e) => setSectionForm((f) => ({ ...f, name: e.target.value }))} placeholder="Örn. Türkçe" required />
                      </div>
                      <div>
                        <label className="admin-label">Sıra</label>
                        <input type="number" className="admin-input" min={0} value={sectionForm.orderIndex} onChange={(e) => setSectionForm((f) => ({ ...f, orderIndex: e.target.value }))} />
                      </div>
                      <div>
                        <label className="admin-label">Soru sayısı</label>
                        <input type="number" className="admin-input" min={0} value={sectionForm.questionCount} onChange={(e) => setSectionForm((f) => ({ ...f, questionCount: e.target.value }))} />
                      </div>
                      <div>
                        <label className="admin-label">Süre (dk)</label>
                        <input type="number" className="admin-input" min={0} value={sectionForm.durationMinutes} onChange={(e) => setSectionForm((f) => ({ ...f, durationMinutes: e.target.value }))} placeholder="40" />
                      </div>
                      <div>
                        <label className="admin-label">Min soru</label>
                        <input type="number" className="admin-input" min={0} value={sectionForm.minQuestions} onChange={(e) => setSectionForm((f) => ({ ...f, minQuestions: e.target.value }))} />
                      </div>
                      <div>
                        <label className="admin-label">Max soru</label>
                        <input type="number" className="admin-input" min={0} value={sectionForm.maxQuestions} onChange={(e) => setSectionForm((f) => ({ ...f, maxQuestions: e.target.value }))} />
                      </div>
                      <div>
                        <label className="admin-label">Hedef soru</label>
                        <input type="number" className="admin-input" min={0} value={sectionForm.targetQuestions} onChange={(e) => setSectionForm((f) => ({ ...f, targetQuestions: e.target.value }))} />
                      </div>
                      <div className="col-span-2">
                        <label className="admin-label">Alt konu (opsiyonel)</label>
                        {sectionForm.lessonId ? (
                          <select className="admin-input" value={sectionForm.lessonSubId} onChange={(e) => setSectionForm((f) => ({ ...f, lessonSubId: e.target.value }))}>
                            <option value="">Seçin</option>
                            {sectionLessonSubs.map((ls) => (
                              <option key={ls.id} value={ls.id}>{ls.name} ({ls.code})</option>
                            ))}
                          </select>
                        ) : (
                          <input type="text" className="admin-input font-mono text-sm" value={sectionForm.lessonSubId} onChange={(e) => setSectionForm((f) => ({ ...f, lessonSubId: e.target.value }))} placeholder="Önce ders seçin" readOnly />
                        )}
                      </div>
                      <div className="col-span-2">
                        <label className="admin-label">Zorluk dağılımı (opsiyonel, JSON)</label>
                        <input type="text" className="admin-input font-mono text-sm" value={sectionForm.difficultyMix} onChange={(e) => setSectionForm((f) => ({ ...f, difficultyMix: e.target.value }))} placeholder='{"easy":10,"medium":20,"hard":10}' />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" disabled={sectionSubmitting} className="admin-btn admin-btn-primary">{sectionEditId ? "Güncelle" : "Ekle"}</button>
                      {sectionEditId && <button type="button" onClick={() => { setSectionEditId(null); setSectionForm(defaultSectionForm()); }} className="admin-btn admin-btn-secondary">Vazgeç</button>}
                    </div>
                  </form>
                  <div>
                    <div className="font-medium text-slate-700 mb-2">Bölümler ({sectionList.length})</div>
                    {sectionList.length === 0 ? (
                      <p className="text-slate-500 text-sm">Henüz bölüm şablonu yok.</p>
                    ) : (
                      <ul className="space-y-2">
                        {sectionList.map((sec) => (
                          <li key={sec.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div>
                              <span className="font-medium">{sec.name}</span>
                              <span className="text-slate-500 text-sm ml-2">
                                {lessons.find((l) => String(l.id) === String(sec.lessonId))?.name ?? sec.lessonId} — {sec.questionCount} soru
                                {sec.durationMinutes != null ? `, ${sec.durationMinutes} dk` : ""} — sıra {sec.orderIndex}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <button type="button" onClick={() => openSectionEdit(sec)} className="admin-btn admin-btn-ghost admin-btn-icon" title="Düzenle"><Pencil size={14} /></button>
                              <button type="button" onClick={() => handleSectionDelete(sec.id)} disabled={sectionSubmitting} className="admin-btn admin-btn-ghost admin-btn-icon text-red-600" title="Sil"><Trash2 size={14} /></button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
