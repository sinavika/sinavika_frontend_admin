import { useEffect, useState } from "react";
import { Users, Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  getAllReferralCampaigns,
  createReferralCampaign,
  updateReferralCampaign,
  deleteReferralCampaign,
} from "@/services/adminReferralCampaignService";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";
import { formatDate } from "@/utils/format";

const REFEREE_DISCOUNT_TYPES = [
  { value: 0, label: "Yüzde (%)" },
  { value: 1, label: "Sabit Tutar" },
];
const REFERRER_REWARD_TYPES = [
  { value: 0, label: "Yok" },
  { value: 1, label: "Yüzde" },
  { value: 2, label: "Sabit Tutar" },
  { value: 3, label: "Kredi" },
];

const toISO = (d) => {
  if (!d) return "";
  const date = new Date(d);
  return date.toISOString().slice(0, 16);
};

const ReferralCampaigns = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    isActive: true,
    startsAt: "",
    endsAt: "",
    refereeDiscountType: 0,
    refereeDiscountValue: "",
    referrerRewardType: 2,
    referrerRewardValue: "",
    maxRedemptionsTotal: "",
    maxRedemptionsPerCode: "",
    maxRedemptionsPerUser: "",
  });

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const data = await getAllReferralCampaigns();
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.FETCH_FAILED);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      isActive: true,
      startsAt: "",
      endsAt: "",
      refereeDiscountType: 0,
      refereeDiscountValue: "",
      referrerRewardType: 2,
      referrerRewardValue: "",
      maxRedemptionsTotal: "",
      maxRedemptionsPerCode: "",
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
      name: item.name || "",
      description: item.description || "",
      isActive: item.isActive !== false,
      startsAt: toISO(item.startsAt),
      endsAt: toISO(item.endsAt),
      refereeDiscountType: item.refereeDiscountType ?? 0,
      refereeDiscountValue: item.refereeDiscountValue ?? "",
      referrerRewardType: item.referrerRewardType ?? 2,
      referrerRewardValue: item.referrerRewardValue ?? "",
      maxRedemptionsTotal: item.maxRedemptionsTotal ?? "",
      maxRedemptionsPerCode: item.maxRedemptionsPerCode ?? "",
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

  // Rapor 19.2: create body name, description, rewardType, rewardValue, validFrom, validUntil, isActive
  const buildCreatePayload = () => ({
    name: form.name.trim(),
    description: form.description?.trim() || undefined,
    rewardType: form.referrerRewardType ?? 2,
    rewardValue: form.referrerRewardValue
      ? parseFloat(form.referrerRewardValue)
      : undefined,
    validFrom: form.startsAt ? new Date(form.startsAt).toISOString() : undefined,
    validUntil: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
    isActive: form.isActive,
  });

  const buildUpdatePayload = () => ({
    name: form.name.trim(),
    description: form.description?.trim() || undefined,
    isActive: form.isActive,
    startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : undefined,
    endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
    refereeDiscountType: Number(form.refereeDiscountType) ?? 0,
    refereeDiscountValue: form.refereeDiscountValue
      ? parseFloat(form.refereeDiscountValue)
      : undefined,
    referrerRewardType: Number(form.referrerRewardType) ?? 2,
    referrerRewardValue: form.referrerRewardValue
      ? parseFloat(form.referrerRewardValue)
      : undefined,
    maxRedemptionsTotal: form.maxRedemptionsTotal
      ? parseInt(form.maxRedemptionsTotal, 10)
      : undefined,
    maxRedemptionsPerCode: form.maxRedemptionsPerCode
      ? parseInt(form.maxRedemptionsPerCode, 10)
      : undefined,
    maxRedemptionsPerUser: form.maxRedemptionsPerUser
      ? parseInt(form.maxRedemptionsPerUser, 10)
      : undefined,
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Kampanya adı zorunludur.");
      return;
    }
    setSubmitting(true);
    try {
      await createReferralCampaign(buildCreatePayload());
      toast.success(SUCCESS_MESSAGES.CREATE_SUCCESS);
      closeModal();
      loadCampaigns();
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
      await updateReferralCampaign(selected.id, buildUpdatePayload());
      toast.success(SUCCESS_MESSAGES.UPDATE_SUCCESS);
      closeModal();
      loadCampaigns();
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
      await deleteReferralCampaign(selected.id);
      toast.success(SUCCESS_MESSAGES.DELETE_SUCCESS);
      closeModal();
      loadCampaigns();
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
          <Users size={28} className="text-emerald-600" />
          Referral Kampanyaları
        </h1>
        <button type="button" onClick={openCreate} className="admin-btn admin-btn-primary">
          <Plus size={18} />
          Yeni Kampanya
        </button>
      </div>

      {loading ? (
        <div className="admin-loading-center">
          <span className="admin-spinner" />
        </div>
      ) : list.length === 0 ? (
        <div className="admin-empty-state">
          Henüz referral kampanyası yok. &quot;Yeni Kampanya&quot; ile ekleyebilirsiniz.
        </div>
      ) : (
        <div className="admin-card admin-card-elevated">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ad</th>
                  <th>Davetli İndirimi</th>
                  <th>Davet Eden Ödülü</th>
                  <th>Geçerlilik</th>
                  <th>Durum</th>
                  <th className="text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item) => (
                  <tr key={item.id}>
                    <td className="font-medium">{item.name}</td>
                    <td>
                      {item.refereeDiscountType === 0
                        ? `%${item.refereeDiscountValue}`
                        : `${item.refereeDiscountValue} ₺`}
                    </td>
                    <td>
                      {item.referrerRewardType === 0
                        ? "—"
                        : item.referrerRewardType === 1
                          ? `%${item.referrerRewardValue}`
                          : `${item.referrerRewardValue} ₺`}
                    </td>
                    <td className="text-slate-500 text-sm">
                      {formatDate(item.startsAt)} - {formatDate(item.endsAt)}
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
            <div className="admin-modal-header">Yeni Referral Kampanyası</div>
            <form onSubmit={handleCreate}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Kampanya Adı</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    required
                  />
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
                    <label className="admin-label">Davetli İndirim Tipi</label>
                    <select
                      className="admin-input"
                      value={form.refereeDiscountType}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          refereeDiscountType: parseInt(e.target.value, 10),
                        }))
                      }
                    >
                      {REFEREE_DISCOUNT_TYPES.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Davetli İndirim Değeri</label>
                    <input
                      type="number"
                      step="0.01"
                      className="admin-input"
                      value={form.refereeDiscountValue}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          refereeDiscountValue: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Davet Eden Ödül Tipi</label>
                    <select
                      className="admin-input"
                      value={form.referrerRewardType}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          referrerRewardType: parseInt(e.target.value, 10),
                        }))
                      }
                    >
                      {REFERRER_REWARD_TYPES.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Davet Eden Ödül Değeri</label>
                    <input
                      type="number"
                      step="0.01"
                      className="admin-input"
                      value={form.referrerRewardValue}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          referrerRewardValue: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="admin-form-row admin-form-row-3">
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
                    <label className="admin-label">Kod Başına Limit</label>
                    <input
                      type="number"
                      className="admin-input"
                      value={form.maxRedemptionsPerCode}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          maxRedemptionsPerCode: e.target.value,
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
            <div className="admin-modal-header">Kampanya Düzenle</div>
            <form onSubmit={handleUpdate}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-group">
                  <label className="admin-label">Kampanya Adı</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
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
                    <label className="admin-label">Davetli İndirim Tipi</label>
                    <select
                      className="admin-input"
                      value={form.refereeDiscountType}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          refereeDiscountType: parseInt(e.target.value, 10),
                        }))
                      }
                    >
                      {REFEREE_DISCOUNT_TYPES.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Davetli İndirim Değeri</label>
                    <input
                      type="number"
                      step="0.01"
                      className="admin-input"
                      value={form.refereeDiscountValue}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          refereeDiscountValue: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Davet Eden Ödül Tipi</label>
                    <select
                      className="admin-input"
                      value={form.referrerRewardType}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          referrerRewardType: parseInt(e.target.value, 10),
                        }))
                      }
                    >
                      {REFERRER_REWARD_TYPES.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Davet Eden Ödül Değeri</label>
                    <input
                      type="number"
                      step="0.01"
                      className="admin-input"
                      value={form.referrerRewardValue}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          referrerRewardValue: e.target.value,
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
            <div className="admin-modal-header">Kampanyayı Pasif Yap</div>
            <div className="admin-modal-body">
              <p className="text-slate-600">
                &quot;{selected.name}&quot; kampanyasını pasif hale getirmek istediğinize emin
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

export default ReferralCampaigns;
