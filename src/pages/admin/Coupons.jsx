import { useEffect, useState } from "react";
import { Tag, Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "@/services/adminCouponService";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";
import { formatDate, formatDateShort, formatCurrency } from "@/utils/format";

const DISCOUNT_TYPES = [
  { value: 0, label: "Yüzde (%)" },
  { value: 1, label: "Sabit Tutar" },
];

const toISO = (d) => {
  if (!d) return "";
  const date = new Date(d);
  return date.toISOString().slice(0, 16);
};

const Coupons = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    discountType: 0,
    discountValue: "",
    currencyCode: "TRY",
    minimumPrice: "",
    startsAt: "",
    endsAt: "",
    isActive: true,
    maxRedemptionsTotal: "",
    maxRedemptionsPerUser: "",
  });

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const data = await getAllCoupons();
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.FETCH_FAILED);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const resetForm = () => {
    setForm({
      code: "",
      name: "",
      description: "",
      discountType: 0,
      discountValue: "",
      currencyCode: "TRY",
      minimumPrice: "",
      startsAt: "",
      endsAt: "",
      isActive: true,
      maxRedemptionsTotal: "",
      maxRedemptionsPerUser: "",
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
      discountType: item.discountType ?? 0,
      discountValue: item.discountValue ?? "",
      currencyCode: item.currencyCode || "TRY",
      minimumPrice: item.minimumPrice ?? "",
      startsAt: toISO(item.startsAt),
      endsAt: toISO(item.endsAt),
      isActive: item.isActive !== false,
      maxRedemptionsTotal: item.maxRedemptionsTotal ?? "",
      maxRedemptionsPerUser: item.maxRedemptionsPerUser ?? "",
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
    code: form.code.trim(),
    name: form.name.trim(),
    description: form.description?.trim() || undefined,
    discountType: Number(form.discountType) ?? 0,
    discountValue: parseFloat(form.discountValue) ?? 0,
    currencyCode: form.currencyCode?.trim() || undefined,
    minimumPrice: form.minimumPrice ? parseFloat(form.minimumPrice) : undefined,
    startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : undefined,
    endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
    isActive: form.isActive,
    maxRedemptionsTotal: form.maxRedemptionsTotal
      ? parseInt(form.maxRedemptionsTotal, 10)
      : undefined,
    maxRedemptionsPerUser: form.maxRedemptionsPerUser
      ? parseInt(form.maxRedemptionsPerUser, 10)
      : undefined,
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) {
      toast.error("Kod ve ad zorunludur.");
      return;
    }
    setSubmitting(true);
    try {
      await createCoupon(buildPayload());
      toast.success(SUCCESS_MESSAGES.CREATE_SUCCESS);
      closeModal();
      loadCoupons();
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
      await updateCoupon(selected.id, buildPayload());
      toast.success(SUCCESS_MESSAGES.UPDATE_SUCCESS);
      closeModal();
      loadCoupons();
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
      await deleteCoupon(selected.id);
      toast.success(SUCCESS_MESSAGES.DELETE_SUCCESS);
      closeModal();
      loadCoupons();
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.DELETE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  const discountLabel = (item) =>
    item.discountType === 0
      ? `%${item.discountValue}`
      : formatCurrency(item.discountValue, item.currencyCode);

  return (
    <div className="admin-page-wrapper">
      <div className="admin-page-header">
        <h1 className="admin-page-title">
          <Tag size={28} className="text-emerald-600" />
          Kuponlar
        </h1>
        <button type="button" onClick={openCreate} className="admin-btn admin-btn-primary">
          <Plus size={18} />
          Yeni Kupon
        </button>
      </div>

      {loading ? (
        <div className="admin-loading-center">
          <span className="admin-spinner" />
        </div>
      ) : list.length === 0 ? (
        <div className="admin-empty-state">
          Henüz kupon yok. &quot;Yeni Kupon&quot; ile ekleyebilirsiniz.
        </div>
      ) : (
        <div className="admin-card admin-card-elevated">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Kod</th>
                  <th>Ad</th>
                  <th>İndirim</th>
                  <th>Geçerlilik</th>
                  <th>Durum</th>
                  <th className="text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item) => (
                  <tr key={item.id}>
                    <td className="font-medium">{item.code}</td>
                    <td>{item.name}</td>
                    <td>{discountLabel(item)}</td>
                    <td className="text-slate-500 text-sm">
                      {formatDateShort(item.startsAt)} - {formatDateShort(item.endsAt)}
                    </td>
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
            <div className="admin-modal-header">Yeni Kupon</div>
            <form onSubmit={handleCreate}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-row admin-form-row-2">
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
                    <label className="admin-label admin-label-required">İndirim Tipi</label>
                    <select
                      className="admin-input"
                      value={form.discountType}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          discountType: parseInt(e.target.value, 10),
                        }))
                      }
                    >
                      {DISCOUNT_TYPES.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">İndirim Değeri</label>
                    <input
                      type="number"
                      step="0.01"
                      className="admin-input"
                      value={form.discountValue}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, discountValue: e.target.value }))
                      }
                      required
                    />
                  </div>
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Para Birimi</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={form.currencyCode}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, currencyCode: e.target.value }))
                      }
                      placeholder="TRY"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Min. Sepet Tutarı</label>
                    <input
                      type="number"
                      step="0.01"
                      className="admin-input"
                      value={form.minimumPrice}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, minimumPrice: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Başlangıç</label>
                    <input
                      type="datetime-local"
                      className="admin-input"
                      value={form.startsAt}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, startsAt: e.target.value }))
                      }
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Bitiş</label>
                    <input
                      type="datetime-local"
                      className="admin-input"
                      value={form.endsAt}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, endsAt: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Toplam Kullanım Limiti</label>
                    <input
                      type="number"
                      className="admin-input"
                      value={form.maxRedemptionsTotal}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          maxRedemptionsTotal: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Kullanıcı Başına Limit</label>
                    <input
                      type="number"
                      className="admin-input"
                      value={form.maxRedemptionsPerUser}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          maxRedemptionsPerUser: e.target.value,
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
            <div className="admin-modal-header">Kupon Düzenle</div>
            <form onSubmit={handleUpdate}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-row admin-form-row-2">
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
                    <label className="admin-label">İndirim Tipi</label>
                    <select
                      className="admin-input"
                      value={form.discountType}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          discountType: parseInt(e.target.value, 10),
                        }))
                      }
                    >
                      {DISCOUNT_TYPES.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">İndirim Değeri</label>
                    <input
                      type="number"
                      step="0.01"
                      className="admin-input"
                      value={form.discountValue}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, discountValue: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Para Birimi</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={form.currencyCode}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, currencyCode: e.target.value }))
                      }
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Min. Sepet Tutarı</label>
                    <input
                      type="number"
                      step="0.01"
                      className="admin-input"
                      value={form.minimumPrice}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, minimumPrice: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Başlangıç</label>
                    <input
                      type="datetime-local"
                      className="admin-input"
                      value={form.startsAt}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, startsAt: e.target.value }))
                      }
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Bitiş</label>
                    <input
                      type="datetime-local"
                      className="admin-input"
                      value={form.endsAt}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, endsAt: e.target.value }))
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
            <div className="admin-modal-header">Kuponu Pasif Yap</div>
            <div className="admin-modal-body">
              <p className="text-slate-600">
                &quot;{selected.name}&quot; kuponunu pasif hale getirmek istediğinize emin
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

export default Coupons;
