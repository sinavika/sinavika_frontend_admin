import { useEffect, useState } from "react";
import { CreditCard, Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  getAllSubscriptionPackages,
  createSubscriptionPackage,
  updateSubscriptionPackage,
  deleteSubscriptionPackage,
} from "@/services/adminSubscriptionPackageService";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";
import { formatDate, formatCurrency } from "@/utils/format";

const PLAN_TYPES = [{ value: 0, label: "Deneme" }];
const BILLING_PERIODS = [
  { value: 0, label: "Sınav Başı" },
  { value: 1, label: "Aylık" },
  { value: 2, label: "Yıllık" },
];

const SubscriptionPackages = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
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

  const loadPackages = async () => {
    setLoading(true);
    try {
      const data = await getAllSubscriptionPackages();
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.FETCH_FAILED);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const resetForm = () => {
    setForm({
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
  };

  const openCreate = () => {
    resetForm();
    setModal("create");
  };

  const openEdit = (item) => {
    setSelected(item);
    setForm({
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

  const buildPayload = () => ({
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

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Paket adı zorunludur.");
      return;
    }
    setSubmitting(true);
    try {
      await createSubscriptionPackage(buildPayload());
      toast.success(SUCCESS_MESSAGES.CREATE_SUCCESS);
      closeModal();
      loadPackages();
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.CREATE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    try {
      await updateSubscriptionPackage(selected.id, buildPayload());
      toast.success(SUCCESS_MESSAGES.UPDATE_SUCCESS);
      closeModal();
      loadPackages();
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
      await deleteSubscriptionPackage(selected.id);
      toast.success(SUCCESS_MESSAGES.DELETE_SUCCESS);
      closeModal();
      loadPackages();
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.DELETE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  const billingLabel = (val) =>
    BILLING_PERIODS.find((b) => b.value === val)?.label ?? val;

  return (
    <div className="admin-page-wrapper">
      <div className="admin-page-header">
        <h1 className="admin-page-title">
          <CreditCard size={28} className="text-emerald-600" />
          Abonelik Paketleri
        </h1>
        <button type="button" onClick={openCreate} className="admin-btn admin-btn-primary">
          <Plus size={18} />
          Yeni Paket
        </button>
      </div>

      {loading ? (
        <div className="admin-loading-center">
          <span className="admin-spinner" />
        </div>
      ) : list.length === 0 ? (
        <div className="admin-empty-state">
          Henüz abonelik paketi yok. &quot;Yeni Paket&quot; ile ekleyebilirsiniz.
        </div>
      ) : (
        <div className="admin-card admin-card-elevated">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
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
