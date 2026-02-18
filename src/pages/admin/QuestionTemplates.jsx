import { useEffect, useState } from "react";
import { LayoutTemplate, Plus, Pencil, Trash2, Eye, ListPlus } from "lucide-react";
import toast from "react-hot-toast";
import {
  getAllQuestionsTemplates,
  getQuestionsTemplateById,
  createQuestionsTemplate,
  updateQuestionsTemplate,
  deleteQuestionsTemplate,
  addQuestionToTemplate,
  removeItemFromTemplate,
} from "@/services/adminQuestionsTemplateService";
import { getAllCategories } from "@/services/adminCategoryService";
import { getSubsByCategoryId, getSubById } from "@/services/adminCategorySubService";
import { getAllLessons } from "@/services/adminLessonService";
import { getLessonSubsByLessonId } from "@/services/adminLessonSubService";
import { getAllQuestions } from "@/services/adminQuestionService";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";
import { formatDate } from "@/utils/format";

const MIN_QUESTIONS = 10;
const MAX_QUESTIONS = 20;

const defaultItem = () => ({
  lessonId: "",
  lessonSubId: "",
  targetQuestionCount: 5,
  difficultyMix: "",
  orderIndex: 0,
  questionId: "",
});

const QuestionTemplates = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // "create" | "edit" | "view" | "delete"
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    categoryId: "",
    categorySubId: "",
    totalQuestionCount: 15,
    orderIndex: 0,
    isActive: true,
    items: [defaultItem()],
  });
  const [addQuestionModal, setAddQuestionModal] = useState(null);
  const [questionPoolForAdd, setQuestionPoolForAdd] = useState([]);
  const [questionPoolLoading, setQuestionPoolLoading] = useState(false);
  const [selectedQuestionIdForAdd, setSelectedQuestionIdForAdd] = useState("");
  const [addQuestionSubmitting, setAddQuestionSubmitting] = useState(false);
  const [removeItemSubmitting, setRemoveItemSubmitting] = useState(null);
  const [lessonSubsByLessonId, setLessonSubsByLessonId] = useState({});

  useEffect(() => {
    const lessonIds = [...new Set(form.items.map((i) => i.lessonId).filter(Boolean))];
    lessonIds.forEach((lid) => {
      if (lessonSubsByLessonId[lid]) return;
      getLessonSubsByLessonId(lid).then((data) => {
        setLessonSubsByLessonId((prev) => ({ ...prev, [lid]: Array.isArray(data) ? data : [] }));
      }).catch(() => setLessonSubsByLessonId((prev) => ({ ...prev, [lid]: [] })));
    });
  }, [form.items, lessonSubsByLessonId]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await getAllQuestionsTemplates();
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.FETCH_FAILED);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRefs = async () => {
    try {
      const [catData, lessData] = await Promise.all([
        getAllCategories(),
        getAllLessons(),
      ]);
      setCategories(Array.isArray(catData) ? catData : []);
      setLessons(Array.isArray(lessData) ? lessData : []);
    } catch {
      setCategories([]);
      setLessons([]);
    }
  };

  useEffect(() => {
    loadRefs();
  }, []);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (!form.categoryId) {
      setSubCategories([]);
      return;
    }
    let cancelled = false;
    const catId = form.categoryId;
    getSubsByCategoryId(catId)
      .then((data) => {
        if (!cancelled) setSubCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setSubCategories([]);
      });
    return () => {
      cancelled = true;
    };
  }, [form.categoryId]);

  const resetForm = () => {
    setForm({
      code: "",
      name: "",
      description: "",
      categoryId: "",
      categorySubId: "",
      totalQuestionCount: 15,
      orderIndex: 0,
      isActive: true,
      items: [defaultItem()],
    });
    setSelected(null);
  };

  const openCreate = () => {
    resetForm();
    setModal("create");
  };

  const openEdit = async (item) => {
    try {
      const detail = await getQuestionsTemplateById(item.id);
      setSelected(detail);
      const items = (detail.items || []).length
        ? detail.items.map((i, idx) => ({
            lessonId: i.lessonId || "",
            lessonSubId: i.lessonSubId || "",
            targetQuestionCount: i.targetQuestionCount ?? 5,
            difficultyMix: i.difficultyMix || "",
            orderIndex: i.orderIndex ?? idx,
            questionId: i.questionId || "",
          }))
        : [defaultItem()];
      let categoryId = "";
      if (detail.categorySubId != null && detail.categorySubId !== "") {
        try {
          const subDetail = await getSubById(detail.categorySubId);
          if (subDetail?.categoryId != null) categoryId = String(subDetail.categoryId);
        } catch {
          // ignore
        }
      }
      setForm({
        code: detail.code || "",
        name: detail.name || "",
        description: detail.description || "",
        categoryId,
        categorySubId: detail.categorySubId != null ? String(detail.categorySubId) : "",
        totalQuestionCount: Math.min(MAX_QUESTIONS, Math.max(MIN_QUESTIONS, detail.totalQuestionCount ?? 15)),
        orderIndex: detail.orderIndex ?? 0,
        isActive: detail.isActive !== false,
        items: items.length ? items : [defaultItem()],
      });
      setModal("edit");
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.FETCH_FAILED);
    }
  };

  const openView = async (item) => {
    try {
      const detail = await getQuestionsTemplateById(item.id);
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

  const addItem = () => {
    setForm((f) => ({
      ...f,
      items: [...f.items, { ...defaultItem(), orderIndex: f.items.length }],
    }));
  };

  const removeItem = (idx) => {
    if (form.items.length <= 1) return;
    setForm((f) => ({
      ...f,
      items: f.items.filter((_, i) => i !== idx),
    }));
  };

  const updateItem = (idx, field, value) => {
    setForm((f) => {
      const next = [...f.items];
      next[idx] = { ...next[idx], [field]: value };
      return { ...f, items: next };
    });
  };

  const buildPayload = (includeItems = true) => {
    const categorySubId = form.categorySubId?.trim() || null;
    if (!categorySubId && modal === "create") {
      toast.error("Alt kategori seçin.");
      return null;
    }
    const total = Math.min(MAX_QUESTIONS, Math.max(MIN_QUESTIONS, Number(form.totalQuestionCount) || 15));
    const payload = {
      code: form.code.trim(),
      name: form.name.trim(),
      description: form.description?.trim() || undefined,
      categorySubId,
      totalQuestionCount: total,
      orderIndex: Number(form.orderIndex) || 0,
      isActive: form.isActive,
    };
    if (includeItems) {
      payload.items = form.items
        .filter((i) => i.lessonId || i.questionId)
        .map((i, j) => {
          const base = { orderIndex: j };
          if (i.questionId?.trim()) {
            return { ...base, questionId: i.questionId.trim(), lessonId: i.lessonId || undefined, lessonSubId: i.lessonSubId?.trim() || undefined, targetQuestionCount: 0 };
          }
          return {
            ...base,
            lessonId: i.lessonId,
            lessonSubId: i.lessonSubId?.trim() || undefined,
            targetQuestionCount: Number(i.targetQuestionCount) ?? 5,
            difficultyMix: i.difficultyMix?.trim() || undefined,
          };
        });
    }
    return payload;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) {
      toast.error("Kod ve ad zorunludur.");
      return;
    }
    const total = Number(form.totalQuestionCount) || 0;
    if (total < MIN_QUESTIONS || total > MAX_QUESTIONS) {
      toast.error(`Toplam soru sayısı ${MIN_QUESTIONS} ile ${MAX_QUESTIONS} arasında olmalıdır.`);
      return;
    }
    const payload = buildPayload(true);
    if (!payload) return;
    setSubmitting(true);
    try {
      await createQuestionsTemplate(payload);
      toast.success(SUCCESS_MESSAGES.CREATE_SUCCESS);
      closeModal();
      loadTemplates();
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.CREATE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selected) return;
    const total = Number(form.totalQuestionCount) || 0;
    if (total < MIN_QUESTIONS || total > MAX_QUESTIONS) {
      toast.error(`Toplam soru sayısı ${MIN_QUESTIONS} ile ${MAX_QUESTIONS} arasında olmalıdır.`);
      return;
    }
    const payload = buildPayload(true);
    if (!payload) return;
    setSubmitting(true);
    try {
      await updateQuestionsTemplate(selected.id, payload);
      toast.success(SUCCESS_MESSAGES.UPDATE_SUCCESS);
      closeModal();
      loadTemplates();
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.UPDATE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  const openAddQuestionModal = async (template) => {
    setAddQuestionModal(template);
    setSelectedQuestionIdForAdd("");
    setQuestionPoolLoading(true);
    try {
      const data = await getAllQuestions();
      setQuestionPoolForAdd(Array.isArray(data) ? data : []);
    } catch {
      setQuestionPoolForAdd([]);
      toast.error("Soru listesi yüklenemedi.");
    } finally {
      setQuestionPoolLoading(false);
    }
  };

  const closeAddQuestionModal = () => {
    setAddQuestionModal(null);
    setSelectedQuestionIdForAdd("");
  };

  const handleAddQuestionToTemplate = async (e) => {
    e.preventDefault();
    if (!addQuestionModal || !selectedQuestionIdForAdd) {
      toast.error("Soru seçin.");
      return;
    }
    const currentCount = addQuestionModal.totalQuestionCount ?? (addQuestionModal.items?.length ?? 0);
    if (currentCount >= MAX_QUESTIONS) {
      toast.error(`Şablonda en fazla ${MAX_QUESTIONS} soru olabilir.`);
      return;
    }
    setAddQuestionSubmitting(true);
    try {
      await addQuestionToTemplate(addQuestionModal.id, selectedQuestionIdForAdd);
      toast.success("Soru şablona eklendi.");
      closeAddQuestionModal();
      loadTemplates();
      if (selected?.id === addQuestionModal.id) {
        const updated = await getQuestionsTemplateById(addQuestionModal.id);
        setSelected(updated);
      }
    } catch (err) {
      toast.error(err.response?.data?.Error || err.response?.data?.error || err.message || "Soru eklenemedi.");
    } finally {
      setAddQuestionSubmitting(false);
    }
  };

  const handleRemoveItemFromTemplate = async (templateId, itemId) => {
    const template = list.find((t) => t.id === templateId) || selected;
    const count = (template?.items?.length ?? 0);
    if (count <= MIN_QUESTIONS) {
      toast.error(`Şablonda en az ${MIN_QUESTIONS} soru olmalıdır. Soru çıkarılamaz.`);
      return;
    }
    setRemoveItemSubmitting(itemId);
    try {
      await removeItemFromTemplate(templateId, itemId);
      toast.success("Madde şablondan çıkarıldı.");
      loadTemplates();
      if (selected?.id === templateId) {
        const updated = await getQuestionsTemplateById(templateId);
        setSelected(updated);
      }
    } catch (err) {
      toast.error(err.response?.data?.Error || err.response?.data?.error || err.message || "Soru çıkarılamadı.");
    } finally {
      setRemoveItemSubmitting(null);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await deleteQuestionsTemplate(selected.id);
      toast.success(SUCCESS_MESSAGES.DELETE_SUCCESS);
      closeModal();
      loadTemplates();
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
          <LayoutTemplate size={28} className="text-emerald-600" />
          Soru Şablonları
        </h1>
        <button type="button" onClick={openCreate} className="admin-btn admin-btn-primary">
          <Plus size={18} />
          Yeni Şablon
        </button>
      </div>

      {loading ? (
        <div className="admin-loading-center">
          <span className="admin-spinner" />
        </div>
      ) : list.length === 0 ? (
        <div className="admin-empty-state">
          Henüz soru şablonu yok. &quot;Yeni Şablon&quot; ile ekleyebilirsiniz.
        </div>
      ) : (
        <div className="admin-card admin-card-elevated">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Kod</th>
                  <th>Ad</th>
                  <th>Alt Kategori</th>
                  <th>Soru</th>
                  <th>Sıra</th>
                  <th>Durum</th>
                  <th className="text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item) => (
                  <tr key={item.id}>
                    <td className="font-medium">{item.code}</td>
                    <td>{item.name}</td>
                    <td className="text-slate-600 text-sm">{item.categorySubName ?? item.categorySubId ?? "—"}</td>
                    <td>
                      <span className="inline-flex items-center gap-1">
                        <span className="font-medium">{item.totalQuestionCount ?? 0}</span>
                        <span className="text-slate-400 text-xs">/ {MAX_QUESTIONS}</span>
                      </span>
                    </td>
                    <td>{item.orderIndex ?? "—"}</td>
                    <td>
                      <span className={item.isActive ? "admin-badge admin-badge-success" : "admin-badge admin-badge-neutral"}>
                        {item.isActive ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="admin-exam-actions flex items-center justify-end gap-1 flex-wrap">
                        <button type="button" onClick={() => openAddQuestionModal(item)} disabled={(item.totalQuestionCount ?? 0) >= MAX_QUESTIONS} className="admin-btn admin-btn-ghost admin-btn-icon" title="Şablona soru ekle">
                          <ListPlus size={18} />
                        </button>
                        <button type="button" onClick={() => openView(item)} className="admin-btn admin-btn-ghost admin-btn-icon" title="Görüntüle">
                          <Eye size={18} />
                        </button>
                        <button type="button" onClick={() => openEdit(item)} className="admin-btn admin-btn-ghost admin-btn-icon" title="Düzenle">
                          <Pencil size={18} />
                        </button>
                        <button type="button" onClick={() => openDelete(item)} className="admin-btn admin-btn-ghost admin-btn-icon text-red-600 hover:bg-red-50" title="Sil">
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
          <div className="admin-modal admin-modal-xl" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">Yeni Soru Şablonu</div>
            <form onSubmit={handleCreate}>
              <div className="admin-modal-body space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Kod</label>
                    <input type="text" className="admin-input" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} required />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Ad</label>
                    <input type="text" className="admin-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Açıklama</label>
                  <textarea className="admin-input min-h-[60px]" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="admin-form-row admin-form-row-3">
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Ana Kategori</label>
                    <select
                      className="admin-input"
                      value={form.categoryId}
                      onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value, categorySubId: "" }))}
                    >
                      <option value="">Seçin</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Alt Kategori</label>
                    <select
                      className="admin-input"
                      value={form.categorySubId}
                      onChange={(e) => setForm((f) => ({ ...f, categorySubId: e.target.value }))}
                      disabled={!form.categoryId}
                    >
                      <option value="">{form.categoryId ? "Seçin" : "Önce kategori seçin"}</option>
                      {subCategories.filter((s) => s.isActive !== false).map((s) => (
                        <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Toplam soru sayısı (10–20)</label>
                    <input
                      type="number"
                      className="admin-input"
                      value={form.totalQuestionCount}
                      onChange={(e) => setForm((f) => ({ ...f, totalQuestionCount: e.target.value }))}
                      min={MIN_QUESTIONS}
                      max={MAX_QUESTIONS}
                    />
                  </div>
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Sıra</label>
                    <input type="number" className="admin-input" value={form.orderIndex} onChange={(e) => setForm((f) => ({ ...f, orderIndex: e.target.value }))} min={0} />
                  </div>
                  <div className="admin-form-group flex items-end">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="rounded border-slate-300 text-emerald-600" />
                      Aktif
                    </label>
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-700">Şablon maddeleri (ders / hedef soru veya sabit soru)</span>
                    <button type="button" onClick={addItem} className="admin-btn admin-btn-ghost admin-btn-icon text-sm">
                      <Plus size={16} /> Ekle
                    </button>
                  </div>
                  {form.items.map((item, idx) => (
                    <div key={idx} className="flex flex-wrap items-center gap-2 mb-2 p-2 bg-slate-50 rounded border">
                      <select
                        className="admin-input flex-1 min-w-[140px]"
                        value={item.lessonId}
                        onChange={(e) => updateItem(idx, "lessonId", e.target.value)}
                      >
                        <option value="">Ders seçin</option>
                        {lessons.map((l) => (
                          <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                      </select>
                      <select
                        className="admin-input flex-1 min-w-[120px]"
                        value={item.lessonSubId}
                        onChange={(e) => updateItem(idx, "lessonSubId", e.target.value)}
                        disabled={!item.lessonId}
                      >
                        <option value="">{item.lessonId ? "Alt konu" : "Önce ders"}</option>
                        {(lessonSubsByLessonId[item.lessonId] || []).map((ls) => (
                          <option key={ls.id} value={ls.id}>{ls.name}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        className="admin-input w-20"
                        placeholder="Hedef"
                        value={item.targetQuestionCount}
                        onChange={(e) => updateItem(idx, "targetQuestionCount", e.target.value)}
                        min={1}
                      />
                      <button type="button" onClick={() => removeItem(idx)} disabled={form.items.length <= 1} className="admin-btn admin-btn-ghost admin-btn-icon text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" onClick={closeModal} className="admin-btn admin-btn-secondary">İptal</button>
                <button type="submit" disabled={submitting} className="admin-btn admin-btn-primary">{submitting ? "Kaydediliyor…" : "Oluştur"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit */}
      {modal === "edit" && selected && (
        <div className="admin-modal-backdrop" onClick={closeModal}>
          <div className="admin-modal admin-modal-xl" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">Şablon Düzenle</div>
            <form onSubmit={handleUpdate}>
              <div className="admin-modal-body space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Kod</label>
                    <input type="text" className="admin-input" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} required />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Ad</label>
                    <input type="text" className="admin-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Açıklama</label>
                  <textarea className="admin-input min-h-[60px]" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="admin-form-row admin-form-row-3">
                  <div className="admin-form-group">
                    <label className="admin-label">Ana Kategori</label>
                    <select className="admin-input" value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value, categorySubId: "" }))}>
                      <option value="">Seçin</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Alt Kategori</label>
                    <select
                      className="admin-input"
                      value={form.categorySubId}
                      onChange={(e) => setForm((f) => ({ ...f, categorySubId: e.target.value }))}
                      disabled={!form.categoryId}
                    >
                      <option value="">{form.categoryId ? "Seçin" : "Önce kategori seçin"}</option>
                      {subCategories.filter((s) => s.isActive !== false).map((s) => (
                        <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Toplam soru sayısı (10–20)</label>
                    <input type="number" className="admin-input" value={form.totalQuestionCount} onChange={(e) => setForm((f) => ({ ...f, totalQuestionCount: e.target.value }))} min={MIN_QUESTIONS} max={MAX_QUESTIONS} />
                  </div>
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Sıra</label>
                    <input type="number" className="admin-input" value={form.orderIndex} onChange={(e) => setForm((f) => ({ ...f, orderIndex: e.target.value }))} min={0} />
                  </div>
                  <div className="admin-form-group flex items-end">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="rounded border-slate-300 text-emerald-600" />
                      Aktif
                    </label>
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-700">Şablon maddeleri</span>
                    <button type="button" onClick={addItem} className="admin-btn admin-btn-ghost admin-btn-icon text-sm"><Plus size={16} /> Ekle</button>
                  </div>
                  {form.items.map((item, idx) => (
                    <div key={idx} className="flex flex-wrap items-center gap-2 mb-2 p-2 bg-slate-50 rounded border">
                      <select className="admin-input flex-1 min-w-[140px]" value={item.lessonId} onChange={(e) => updateItem(idx, "lessonId", e.target.value)}>
                        <option value="">Ders seçin</option>
                        {lessons.map((l) => (
                          <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                      </select>
                      <select className="admin-input flex-1 min-w-[120px]" value={item.lessonSubId} onChange={(e) => updateItem(idx, "lessonSubId", e.target.value)} disabled={!item.lessonId}>
                        <option value="">{item.lessonId ? "Alt konu" : "Önce ders"}</option>
                        {(lessonSubsByLessonId[item.lessonId] || []).map((ls) => (
                          <option key={ls.id} value={ls.id}>{ls.name}</option>
                        ))}
                      </select>
                      <input type="number" className="admin-input w-20" placeholder="Hedef" value={item.targetQuestionCount} onChange={(e) => updateItem(idx, "targetQuestionCount", e.target.value)} min={1} />
                      <button type="button" onClick={() => removeItem(idx)} disabled={form.items.length <= 1} className="admin-btn admin-btn-ghost admin-btn-icon text-red-600"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" onClick={closeModal} className="admin-btn admin-btn-secondary">İptal</button>
                <button type="submit" disabled={submitting} className="admin-btn admin-btn-primary">{submitting ? "Güncelleniyor…" : "Güncelle"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View */}
      {modal === "view" && selected && (
        <div className="admin-modal-backdrop" onClick={closeModal}>
          <div className="admin-modal admin-modal-xl" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header flex items-center justify-between">
              <span>Şablon: {selected.name}</span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => openAddQuestionModal(selected)} disabled={(selected.totalQuestionCount ?? 0) >= MAX_QUESTIONS} className="admin-btn admin-btn-ghost admin-btn-sm">
                  <ListPlus size={16} /> Soru Ekle
                </button>
                <button type="button" onClick={closeModal} className="admin-btn admin-btn-ghost admin-btn-icon">×</button>
              </div>
            </div>
            <div className="admin-modal-body space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <p className="text-sm text-slate-600 mt-1">{selected.description || "—"}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div><span className="text-slate-500">Kod:</span> {selected.code}</div>
                <div><span className="text-slate-500">Toplam soru:</span> <span className="font-medium">{selected.totalQuestionCount ?? 0}</span> / {MAX_QUESTIONS}</div>
                <div><span className="text-slate-500">Sıra:</span> {selected.orderIndex ?? "—"}</div>
                <div><span className="text-slate-500">Durum:</span> {selected.isActive ? "Aktif" : "Pasif"}</div>
              </div>
              {selected.items?.length > 0 && (
                <div className="border-t border-slate-200 pt-4">
                  <div className="font-medium text-slate-700 mb-2">Maddeler ({selected.items.length})</div>
                  <ul className="space-y-2">
                    {selected.items.map((i) => (
                      <li key={i.id} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-sm text-slate-700">
                          {i.questionId ? (
                            <>Soru: <span className="font-mono">{i.question?.code ?? i.questionId}</span> ({i.question?.optionCount ?? "—"} şık)</>
                          ) : (
                            <>Ders: {i.lessonId} — Hedef: {i.targetQuestionCount} soru</>
                          )}
                        </span>
                        {i.questionId && (
                          <button type="button" onClick={() => handleRemoveItemFromTemplate(selected.id, i.id)} disabled={removeItemSubmitting === i.id || (selected.items?.length ?? 0) <= MIN_QUESTIONS} className="admin-btn admin-btn-ghost admin-btn-icon text-red-600" title="Şablondan çıkar">
                            {removeItemSubmitting === i.id ? <span className="admin-spinner w-4 h-4" /> : <Trash2 size={14} />}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="admin-modal-footer">
              <button type="button" onClick={closeModal} className="admin-btn admin-btn-secondary">Kapat</button>
              <button type="button" onClick={() => openEdit(selected)} className="admin-btn admin-btn-primary">Düzenle</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete */}
      {modal === "delete" && selected && (
        <div className="admin-modal-backdrop" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">Şablonu Sil</div>
            <div className="admin-modal-body">
              <p className="text-slate-600">&quot;{selected.name}&quot; şablonunu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</p>
            </div>
            <div className="admin-modal-footer">
              <button type="button" onClick={closeModal} className="admin-btn admin-btn-secondary">İptal</button>
              <button type="button" onClick={handleDelete} disabled={submitting} className="admin-btn admin-btn-danger">{submitting ? "Siliniyor…" : "Sil"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Şablona soru ekle */}
      {addQuestionModal && (
        <div className="admin-modal-backdrop" onClick={closeAddQuestionModal}>
          <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header flex items-center justify-between">
              <span>Şablona soru ekle: {addQuestionModal.name}</span>
              <button type="button" onClick={closeAddQuestionModal} className="admin-btn admin-btn-ghost admin-btn-icon">×</button>
            </div>
            <form onSubmit={handleAddQuestionToTemplate}>
              <div className="admin-modal-body">
                <p className="text-slate-600 text-sm mb-3">Havuzdan bir soru seçin. Şablonda en fazla {MAX_QUESTIONS} soru olabilir (mevcut: {addQuestionModal.totalQuestionCount ?? 0}).</p>
                {questionPoolLoading ? (
                  <div className="admin-loading-center py-6"><span className="admin-spinner" /></div>
                ) : (
                  <div className="max-h-[50vh] overflow-y-auto border border-slate-200 rounded-lg">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th className="w-10">Seç</th>
                          <th>Kod</th>
                          <th>Soru metni</th>
                        </tr>
                      </thead>
                      <tbody>
                        {questionPoolForAdd.length === 0 ? (
                          <tr><td colSpan={3} className="text-center text-slate-500 py-4">Soru bulunamadı.</td></tr>
                        ) : (
                          questionPoolForAdd.map((q) => (
                            <tr key={q.id} className={selectedQuestionIdForAdd === q.id ? "bg-emerald-50" : ""}>
                              <td>
                                <input type="radio" name="questionForTemplate" checked={selectedQuestionIdForAdd === q.id} onChange={() => setSelectedQuestionIdForAdd(q.id)} />
                              </td>
                              <td className="font-mono text-sm">{q.code ?? "—"}</td>
                              <td className="max-w-[280px] truncate text-sm" title={q.stem}>{q.stem ?? "—"}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="admin-modal-footer">
                <button type="button" onClick={closeAddQuestionModal} className="admin-btn admin-btn-secondary">İptal</button>
                <button type="submit" disabled={addQuestionSubmitting || !selectedQuestionIdForAdd || questionPoolLoading} className="admin-btn admin-btn-primary">
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

export default QuestionTemplates;
