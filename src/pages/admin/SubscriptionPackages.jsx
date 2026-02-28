import { useEffect, useState, useCallback } from "react";
import { CreditCard, Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  getAllSubscriptionPackages,
  getPackagesByCategory,
  createSubscriptionPackage,
  updateSubscriptionPackage,
  deleteSubscriptionPackage,
} from "@/services/adminSubscriptionPackageService";
import { getAllCategories } from "@/services/adminCategoryService";
import { getSubsByCategoryId } from "@/services/adminCategorySubService";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";
import { formatCurrency } from "@/utils/format";

const getApiError = (err) =>
  err.response?.data?.error ||
  err.response?.data?.Error ||
  err.message ||
  ERROR_MESSAGES.FETCH_FAILED;

const PLAN_TYPES = [{ value: 0, label: "Deneme" }];
const BILLING_PERIODS = [
  { value: 0, label: "Sınav Başı" },
  { value: 1, label: "Aylık" },
  { value: 2, label: "Yıllık" },
];

const SubscriptionPackages = () => {
  const [categories, setCategories] = useState([]);
  const [categorySubs, setCategorySubs] = useState([]);
  const [createModalSubs, setCreateModalSubs] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedCategorySubId, setSelectedCategorySubId] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    categoryId: "",
    categorySubId: "",
    name: "",
    description: "",
    planType: 0,
    billingPeriod: 1,
    unitPricePerExam: "",
    packagePrice: "",
    examCountLimit: "",
    validityDays: "",
    isActive: true,
  });

  const loadCategories = useCallback(async () => {
    try {
      const data = await getAllCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    }
  }, []);

  const loadPackages = useCallback(async () => {
    setLoading(true);
    try {
      if (selectedCategoryId) {
        const data = await getPackagesByCategory(
          selectedCategoryId,
          selectedCategorySubId || undefined
        );
        setList(Array.isArray(data) ? data : []);
      } else {
        const data = await getAllSubscriptionPackages();
        setList(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      toast.error(getApiError(err));
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategoryId, selectedCategorySubId]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  useEffect(() => {
    if (!selectedCategoryId) {
      setCategorySubs([]);
      setSelectedCategorySubId("");
      return;
    }
    getSubsByCategoryId(selectedCategoryId).then((data) => {
      setCategorySubs(Array.isArray(data) ? data : []);
      setSelectedCategorySubId((prev) => (prev ? prev : ""));
    });
  }, [selectedCategoryId]);

  const resetForm = () => {
    setForm({
      categoryId: "",
      categorySubId: "",
      name: "",
      description: "",
      planType: 0,
      billingPeriod: 1,
      unitPricePerExam: "",
      packagePrice: "",
      examCountLimit: "",
      validityDays: "",
      isActive: true,
    });
    setSelected(null);
    setCreateModalSubs([]);
  };

  const openCreate = () => {
    resetForm();
    setModal("create");
  };

  const openEdit = (item) => {
    setSelected(item);
    setForm({
      categoryId: item.categoryId ?? "",
      categorySubId: item.categorySubId ?? "",
      name: item.name || "",
      description: item.description || "",
      planType: item.planType ?? 0,
      billingPeriod: item.billingPeriod ?? 1,
      unitPricePerExam: item.unitPricePerExam ?? "",
      packagePrice: item.packagePrice ?? "",
      examCountLimit: item.examCountLimit ?? "",
      validityDays: item.validityDays ?? "",
      isActive: item.isActive !== false,
    });
    if (item.categoryId) {
      getSubsByCategoryId(item.categoryId).then((data) =>
        setCreateModalSubs(Array.isArray(data) ? data : [])
      );
    } else {
      setCreateModalSubs([]);
    }
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

  // SubscriptionPackageCreateDto: categoryId zorunlu, categorySubId opsiyonel
  const buildCreatePayload = () => ({
    categoryId: form.categoryId || undefined,
    categorySubId: form.categorySubId || undefined,
    name: form.name.trim(),
    description: form.description?.trim() || undefined,
    planType: Number(form.planType) ?? 0,
    billingPeriod: Number(form.billingPeriod) ?? 1,
    unitPricePerExam: form.unitPricePerExam
      ? parseFloat(form.unitPricePerExam)
      : undefined,
    packagePrice: form.packagePrice ? parseFloat(form.packagePrice) : undefined,
    examCountLimit: form.examCountLimit
      ? parseInt(form.examCountLimit, 10)
      : undefined,
    validityDays: form.validityDays
      ? parseInt(form.validityDays, 10)
      : undefined,
    isActive: form.isActive,
  });

  // SubscriptionPackageUpdateDto: tüm alanlar opsiyonel
  const buildUpdatePayload = () => {
    const payload = {};
    if (form.categoryId) payload.categoryId = form.categoryId;
    if (form.categorySubId !== undefined && form.categorySubId !== "")
      payload.categorySubId = form.categorySubId || null;
    if (form.name != null) payload.name = form.name.trim();
    if (form.description != null) payload.description = form.description.trim() || undefined;
    if (form.planType != null) payload.planType = Number(form.planType) ?? 0;
    if (form.billingPeriod != null) payload.billingPeriod = Number(form.billingPeriod) ?? 1;
    if (form.unitPricePerExam !== "" && form.unitPricePerExam != null)
      payload.unitPricePerExam = parseFloat(form.unitPricePerExam);
    if (form.packagePrice !== "" && form.packagePrice != null)
      payload.packagePrice = parseFloat(form.packagePrice);
    if (form.examCountLimit !== "" && form.examCountLimit != null)
      payload.examCountLimit = parseInt(form.examCountLimit, 10);
    if (form.validityDays !== "" && form.validityDays != null)
      payload.validityDays = parseInt(form.validityDays, 10);
    if (form.isActive !== undefined) payload.isActive = form.isActive;
    return payload;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.categoryId) {
      toast.error("Ana kategori (categoryId) zorunludur.");
      return;
    }
    if (!form.name.trim()) {
      toast.error("Paket adı zorunludur.");
      return;
    }
    const unitPrice = form.unitPricePerExam !== "" && form.unitPricePerExam != null ? parseFloat(form.unitPricePerExam) : NaN;
    if (isNaN(unitPrice) || unitPrice < 0) {
      toast.error("Sınav başına birim fiyat zorunludur ve geçerli bir sayı olmalıdır.");
      return;
    }
    const validity = form.validityDays !== "" && form.validityDays != null ? parseInt(form.validityDays, 10) : NaN;
    if (isNaN(validity) || validity < 1) {
      toast.error("Geçerlilik süresi (gün) zorunludur ve 1 veya üzeri olmalıdır.");
      return;
    }
    setSubmitting(true);
    try {
      await createSubscriptionPackage(buildCreatePayload());
      toast.success(SUCCESS_MESSAGES.CREATE_SUCCESS);
      closeModal();
      loadPackages();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    try {
      await updateSubscriptionPackage(selected.id, buildUpdatePayload());
      toast.success(SUCCESS_MESSAGES.UPDATE_SUCCESS);
      closeModal();
      loadPackages();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await deleteSubscriptionPackage(selected.id);
      toast.success("Paket pasif hale getirildi.");
      closeModal();
      loadPackages();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const billingLabel = (val) =>
    BILLING_PERIODS.find((b) => b.value === val)?.label ?? val;

  return (
    <div className="admin-page-wrapper">
      <div className="admin-page-header flex flex-wrap items-center justify-between gap-4">
        <h1 className="admin-page-title">
          <CreditCard size={28} className="text-emerald-600" />
          Abonelik Paketleri
        </h1>
        <button type="button" onClick={openCreate} className="admin-btn admin-btn-primary">
          <Plus size={18} />
          Yeni Paket
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="admin-form-group mb-0">
          <label className="admin-label">Ana Kategori</label>
          <select
            className="admin-input w-48"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
          >
            <option value="">Tümü</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        {selectedCategoryId && (
          <div className="admin-form-group mb-0">
            <label className="admin-label">Alt Kategori</label>
            <select
              className="admin-input w-48"
              value={selectedCategorySubId}
              onChange={(e) => setSelectedCategorySubId(e.target.value)}
            >
              <option value="">Tümü</option>
              {categorySubs.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="admin-loading-center">
          <span className="admin-spinner" />
        </div>
      ) : list.length === 0 ? (
        <div className="admin-empty-state">
          {selectedCategoryId
            ? "Bu kriterlere uygun paket yok."
            : "Henüz abonelik paketi yok. \"Yeni Paket\" ile ekleyebilirsiniz."}
        </div>
      ) : (
        <div className="admin-card admin-card-elevated">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Kategori</th>
                  <th>Alt Kategori</th>
                  <th>Ad</th>
                  <th>Plan</th>
                  <th>Fiyat</th>
                  <th>Sınav Limiti</th>
                  <th>Geçerlilik (Gün)</th>
                  <th>Durum</th>
                  <th className="text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item) => (
                  <tr key={item.id}>
                    <td className="text-slate-600">{item.categoryName ?? "—"}</td>
                    <td className="text-slate-600">{item.categorySubName ?? "—"}</td>
                    <td className="font-medium">{item.name}</td>
                    <td>{billingLabel(item.billingPeriod)}</td>
                    <td>{formatCurrency(item.packagePrice)}</td>
                    <td>{item.examCountLimit ?? "—"}</td>
                    <td>{item.validityDays ?? "—"}</td>
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
            className="admin-modal admin-modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">Yeni Abonelik Paketi</div>
            <form onSubmit={handleCreate}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Ana Kategori</label>
                  <select
                    className="admin-input"
                    value={form.categoryId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setForm((f) => ({ ...f, categoryId: id, categorySubId: "" }));
                      if (id) getSubsByCategoryId(id).then((data) => setCreateModalSubs(Array.isArray(data) ? data : []));
                      else setCreateModalSubs([]);
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
                  <label className="admin-label">Alt Kategori</label>
                  <select
                    className="admin-input"
                    value={form.categorySubId}
                    onChange={(e) => setForm((f) => ({ ...f, categorySubId: e.target.value }))}
                  >
                    <option value="">—</option>
                    {createModalSubs.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Paket Adı</label>
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
                    className="admin-input min-h-[60px]"
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                  />
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Plan Tipi</label>
                    <select
                      className="admin-input"
                      value={form.planType}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          planType: parseInt(e.target.value, 10),
                        }))
                      }
                    >
                      {PLAN_TYPES.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Ödeme Periyodu</label>
                    <select
                      className="admin-input"
                      value={form.billingPeriod}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          billingPeriod: parseInt(e.target.value, 10),
                        }))
                      }
                    >
                      {BILLING_PERIODS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Sınav Başı Fiyat</label>
                    <input
                      type="number"
                      step="0.01"
                      className="admin-input"
                      value={form.unitPricePerExam}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          unitPricePerExam: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Paket Fiyatı</label>
                    <input
                      type="number"
                      step="0.01"
                      className="admin-input"
                      value={form.packagePrice}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, packagePrice: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Sınav Limiti</label>
                    <input
                      type="number"
                      className="admin-input"
                      value={form.examCountLimit}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          examCountLimit: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Geçerlilik (Gün)</label>
                    <input
                      type="number"
                      className="admin-input"
                      value={form.validityDays}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          validityDays: e.target.value,
                        }))
                      }
                    />
                  </div>
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
            className="admin-modal admin-modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">Paket Düzenle</div>
            <form onSubmit={handleUpdate}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-group">
                  <label className="admin-label">Ana Kategori</label>
                  <select
                    className="admin-input"
                    value={form.categoryId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setForm((f) => ({ ...f, categoryId: id, categorySubId: "" }));
                      if (id) getSubsByCategoryId(id).then((data) => setCreateModalSubs(Array.isArray(data) ? data : []));
                      else setCreateModalSubs([]);
                    }}
                  >
                    <option value="">Seçin</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Alt Kategori</label>
                  <select
                    className="admin-input"
                    value={form.categorySubId}
                    onChange={(e) => setForm((f) => ({ ...f, categorySubId: e.target.value }))}
                  >
                    <option value="">—</option>
                    {createModalSubs.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Paket Adı</label>
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
                    className="admin-input min-h-[60px]"
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                  />
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Plan Tipi</label>
                    <select
                      className="admin-input"
                      value={form.planType}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          planType: parseInt(e.target.value, 10),
                        }))
                      }
                    >
                      {PLAN_TYPES.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Ödeme Periyodu</label>
                    <select
                      className="admin-input"
                      value={form.billingPeriod}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          billingPeriod: parseInt(e.target.value, 10),
                        }))
                      }
                    >
                      {BILLING_PERIODS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Sınav Başı Fiyat</label>
                    <input
                      type="number"
                      step="0.01"
                      className="admin-input"
                      value={form.unitPricePerExam}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          unitPricePerExam: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Paket Fiyatı</label>
                    <input
                      type="number"
                      step="0.01"
                      className="admin-input"
                      value={form.packagePrice}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, packagePrice: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Sınav Limiti</label>
                    <input
                      type="number"
                      className="admin-input"
                      value={form.examCountLimit}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          examCountLimit: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Geçerlilik (Gün)</label>
                    <input
                      type="number"
                      className="admin-input"
                      value={form.validityDays}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          validityDays: e.target.value,
                        }))
                      }
                    />
                  </div>
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

      {/* Modal: Delete */}
      {modal === "delete" && selected && (
        <div className="admin-modal-backdrop" onClick={closeModal}>
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">Paketi Pasif Yap</div>
            <div className="admin-modal-body">
              <p className="text-slate-600">
                &quot;{selected.name}&quot; paketini pasif hale getirmek istediğinize emin
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
    </div>
  );
};

export default SubscriptionPackages;
