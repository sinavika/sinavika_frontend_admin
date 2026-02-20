import { useEffect, useState } from "react";
import { LayoutTemplate, Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  getAllBookletTemplates,
  getBookletTemplateById,
  createBookletTemplate,
  updateBookletTemplate,
  deleteBookletTemplate,
} from "@/services/adminBookletTemplateService";
import { getAllCategories } from "@/services/adminCategoryService";
import { getSubsByCategoryId } from "@/services/adminCategorySubService";
import { getSectionsBySubId } from "@/services/adminCategorySectionService";
import { ERROR_MESSAGES } from "@/constants";
import { formatDate } from "@/utils/format";

const defaultForm = () => ({
  code: "",
  name: "",
  description: "",
  difficultyMix: "",
  categoryId: "",
  categorySubId: "",
  categorySectionId: "",
  targetQuestionCount: 40,
  isActive: true,
  orderIndex: 0,
});

const BookletTemplates = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // "create" | "edit" | "delete" | null
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(defaultForm());

  const [categories, setCategories] = useState([]);
  const [subs, setSubs] = useState([]);
  const [sections, setSections] = useState([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [filterSubId, setFilterSubId] = useState("");
  const [filterSubs, setFilterSubs] = useState([]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await getAllBookletTemplates();
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
    loadTemplates();
    loadCategories();
  }, []);

  useEffect(() => {
    if (!form.categoryId) {
      setSubs([]);
      setForm((f) => ({ ...f, categorySubId: "", categorySectionId: "" }));
      return;
    }
    setSubsLoading(true);
    getSubsByCategoryId(String(form.categoryId))
      .then((data) => setSubs(Array.isArray(data) ? data : []))
      .catch(() => setSubs([]))
      .finally(() => setSubsLoading(false));
    setForm((f) => ({ ...f, categorySubId: "", categorySectionId: "" }));
  }, [form.categoryId]);

  useEffect(() => {
    if (!form.categorySubId) {
      setSections([]);
      setForm((f) => ({ ...f, categorySectionId: "" }));
      return;
    }
    setSectionsLoading(true);
    getSectionsBySubId(form.categorySubId)
      .then((data) => setSections(Array.isArray(data) ? data : []))
      .catch(() => setSections([]))
      .finally(() => setSectionsLoading(false));
    setForm((f) => ({ ...f, categorySectionId: "" }));
  }, [form.categorySubId]);

  useEffect(() => {
    if (!filterCategoryId) {
      setFilterSubs([]);
      return;
    }
    getSubsByCategoryId(String(filterCategoryId))
      .then((data) => setFilterSubs(Array.isArray(data) ? data : []))
      .catch(() => setFilterSubs([]));
  }, [filterCategoryId]);

  const openCreate = () => {
    setSelected(null);
    setForm(defaultForm());
    setModal("create");
  };

  const openEdit = async (item) => {
    setSelected(item);
    try {
      const detail = await getBookletTemplateById(item.id);
      setForm({
        code: detail.code ?? "",
        name: detail.name ?? "",
        description: detail.description ?? "",
        difficultyMix:
          typeof detail.difficultyMix === "string"
            ? detail.difficultyMix
            : JSON.stringify(detail.difficultyMix || {}, null, 2),
        categoryId: detail.categoryId ?? "",
        categorySubId: detail.categorySubId ?? "",
        categorySectionId: detail.categorySectionId ?? "",
        targetQuestionCount: detail.targetQuestionCount ?? 40,
        isActive: detail.isActive !== false,
        orderIndex: detail.orderIndex ?? 0,
      });
      setSubs([]);
      setSections([]);
      if (detail.categoryId) {
        const subData = await getSubsByCategoryId(String(detail.categoryId));
        setSubs(Array.isArray(subData) ? subData : []);
      }
      if (detail.categorySubId) {
        const secData = await getSectionsBySubId(detail.categorySubId);
        setSections(Array.isArray(secData) ? secData : []);
      }
      setModal("edit");
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
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.code?.trim() || !form.name?.trim()) {
      toast.error("Kod ve ad zorunludur.");
      return;
    }
    if (!form.categoryId || !form.categorySubId || !form.categorySectionId) {
      toast.error("Kategori, alt kategori ve bölüm şablonu seçin.");
      return;
    }
    const target = Number(form.targetQuestionCount);
    if (isNaN(target) || target < 0) {
      toast.error("Hedef soru sayısı 0 veya pozitif olmalıdır.");
      return;
    }
    setSubmitting(true);
    try {
      await createBookletTemplate(form);
      toast.success("Booklet şablonu oluşturuldu.");
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
    if (!selected?.id) return;
    if (!form.code?.trim() || !form.name?.trim()) {
      toast.error("Kod ve ad zorunludur.");
      return;
    }
    setSubmitting(true);
    try {
      await updateBookletTemplate(selected.id, {
        code: form.code.trim(),
        name: form.name.trim(),
        description: form.description?.trim() || null,
        difficultyMix: form.difficultyMix?.trim() || null,
        targetQuestionCount: Number(form.targetQuestionCount) ?? 0,
        totalQuestionCount: Number(form.targetQuestionCount) ?? 0,
        isActive: form.isActive,
        orderIndex: Number(form.orderIndex) ?? 0,
      });
      toast.success("Booklet şablonu güncellendi.");
      closeModal();
      loadTemplates();
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.UPDATE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selected?.id) return;
    setSubmitting(true);
    try {
      await deleteBookletTemplate(selected.id);
      toast.success("Booklet şablonu silindi.");
      closeModal();
      loadTemplates();
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.DELETE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredList = list.filter((item) => {
    if (filterCategoryId && item.categoryId !== filterCategoryId) return false;
    if (filterSubId && item.categorySubId !== filterSubId) return false;
    return true;
  });

  const getCategoryName = (id) =>
    categories.find((c) => String(c.id) === String(id))?.name ?? "—";

  return (
    <div className="admin-page-wrapper">
      <div className="admin-page-header">
        <div className="flex flex-col gap-1">
          <h1 className="admin-page-title">
            <LayoutTemplate size={28} className="text-emerald-600 shrink-0" />
            Kitapçık şablonları
          </h1>
          <p className="text-slate-500 text-sm">
            Kategori ve bölüm şablonuna göre kitapçık şablonlarını yönetin.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="admin-btn admin-btn-primary shrink-0"
        >
          <Plus size={18} />
          Yeni şablon
        </button>
      </div>

      {/* Filtre */}
      <div className="admin-card p-4 mb-4 flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-slate-600">Filtre:</span>
        <select
          className="admin-input w-auto min-w-[180px]"
          value={filterCategoryId}
          onChange={(e) => {
            setFilterCategoryId(e.target.value);
            setFilterSubId("");
          }}
        >
          <option value="">Tüm kategoriler</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          className="admin-input w-auto min-w-[180px]"
          value={filterSubId}
          onChange={(e) => setFilterSubId(e.target.value)}
          disabled={!filterCategoryId}
        >
          <option value="">Tüm alt kategoriler</option>
          {filterSubs.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        {(filterCategoryId || filterSubId) && (
          <button
            type="button"
            onClick={() => {
              setFilterCategoryId("");
              setFilterSubId("");
            }}
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
          <LayoutTemplate size={48} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium text-slate-600">
            {list.length === 0
              ? "Henüz kitapçık şablonu yok."
              : "Filtreye uygun şablon bulunamadı."}
          </p>
          <p className="text-sm mt-1">
            {list.length === 0 && '"Yeni şablon" ile ekleyebilirsiniz.'}
          </p>
        </div>
      ) : (
        <div className="admin-card admin-card-elevated overflow-hidden">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Kod</th>
                  <th>Ad</th>
                  <th>Kategori</th>
                  <th>Hedef soru</th>
                  <th>Sıra</th>
                  <th>Durum</th>
                  <th>Oluşturulma</th>
                  <th className="text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((item) => (
                  <tr key={item.id}>
                    <td className="font-mono text-sm">{item.code}</td>
                    <td className="font-medium">{item.name}</td>
                    <td className="text-slate-600 text-sm">
                      {getCategoryName(item.categoryId)}
                    </td>
                    <td>{item.targetQuestionCount ?? "—"}</td>
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
                    <td className="text-slate-500 text-sm">
                      {formatDate(item.createdAt)}
                    </td>
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
            className="admin-modal admin-modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">Yeni kitapçık şablonu</div>
            <form onSubmit={handleCreate}>
              <div className="admin-modal-body space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Kod</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={form.code}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, code: e.target.value }))
                      }
                      placeholder="Örn. TYT-MAT-01"
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Ad</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      placeholder="Örn. TYT Matematik Bölüm Şablonu"
                      required
                    />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Açıklama</label>
                  <textarea
                    className="admin-input min-h-[80px]"
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    placeholder="Opsiyonel"
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Zorluk dağılımı (JSON)</label>
                  <textarea
                    className="admin-input min-h-[60px] font-mono text-sm"
                    value={form.difficultyMix}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, difficultyMix: e.target.value }))
                    }
                    placeholder='{"easy":10,"medium":20,"hard":10}'
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">
                      Kategori
                    </label>
                    <select
                      className="admin-input"
                      value={form.categoryId}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, categoryId: e.target.value }))
                      }
                      required
                    >
                      <option value="">Seçin</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">
                      Alt kategori
                    </label>
                    <select
                      className="admin-input"
                      value={form.categorySubId}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          categorySubId: e.target.value,
                        }))
                      }
                      required
                      disabled={subsLoading}
                    >
                      <option value="">Seçin</option>
                      {subs.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">
                      Bölüm şablonu
                    </label>
                    <select
                      className="admin-input"
                      value={form.categorySectionId}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          categorySectionId: e.target.value,
                        }))
                      }
                      required
                      disabled={sectionsLoading}
                    >
                      <option value="">Seçin</option>
                      {sections.map((sec) => (
                        <option key={sec.id} value={sec.id}>
                          {sec.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">
                      Hedef soru sayısı
                    </label>
                    <input
                      type="number"
                      className="admin-input"
                      min={0}
                      value={form.targetQuestionCount}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          targetQuestionCount: e.target.value,
                        }))
                      }
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
                          orderIndex: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="admin-form-group flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="create-active"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, isActive: e.target.checked }))
                    }
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="create-active" className="admin-label mb-0">
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
            className="admin-modal admin-modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">Şablonu düzenle</div>
            <form onSubmit={handleUpdate}>
              <div className="admin-modal-body space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">
                      Kod
                    </label>
                    <input
                      type="text"
                      className="admin-input"
                      value={form.code}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, code: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Ad</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      required
                    />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Açıklama</label>
                  <textarea
                    className="admin-input min-h-[60px]"
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Zorluk dağılımı (JSON)</label>
                  <textarea
                    className="admin-input min-h-[60px] font-mono text-sm"
                    value={form.difficultyMix}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, difficultyMix: e.target.value }))
                    }
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="admin-form-group">
                    <label className="admin-label">Hedef soru sayısı</label>
                    <input
                      type="number"
                      className="admin-input"
                      min={0}
                      value={form.targetQuestionCount}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          targetQuestionCount: e.target.value,
                        }))
                      }
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
                          orderIndex: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="admin-form-group flex items-center gap-2 pt-8">
                    <input
                      type="checkbox"
                      id="edit-active"
                      checked={form.isActive}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, isActive: e.target.checked }))
                      }
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="edit-active" className="admin-label mb-0">
                      Aktif
                    </label>
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
                  {submitting ? "Kaydediliyor…" : "Güncelle"}
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
            <div className="admin-modal-header">Şablonu sil</div>
            <div className="admin-modal-body">
              <p className="text-slate-600">
                <strong>{selected.name}</strong> şablonunu silmek istediğinize
                emin misiniz? Bu işlem geri alınamaz.
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
    </div>
  );
};

export default BookletTemplates;
