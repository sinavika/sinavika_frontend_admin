import { useEffect, useState } from "react";
import { Building2, Plus, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import { getFullImageUrl } from "@/constants";
import {
  getAllPublishers,
  createPublisher,
  updatePublisher,
  updatePublisherLogo,
  deletePublisher,
} from "@/services/adminPublisherService";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";
import { formatDate } from "@/utils/format";

const Publishers = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    code: "",
    legalName: "",
    taxNumber: "",
    taxOffice: "",
    websiteUrl: "",
    supportEmail: "",
    phone: "",
    brandColorHex: "",
    isActive: true,
    file: null,
  });

  const loadPublishers = async () => {
    setLoading(true);
    try {
      const data = await getAllPublishers();
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.FETCH_FAILED);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPublishers();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      code: "",
      legalName: "",
      taxNumber: "",
      taxOffice: "",
      websiteUrl: "",
      supportEmail: "",
      phone: "",
      brandColorHex: "",
      isActive: true,
      file: null,
    });
    setLogoFile(null);
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
      code: item.code || "",
      legalName: item.legalName || "",
      taxNumber: item.taxNumber || "",
      taxOffice: item.taxOffice || "",
      websiteUrl: item.websiteUrl || "",
      supportEmail: item.supportEmail || "",
      phone: item.phone || "",
      brandColorHex: item.brandColorHex || "",
      isActive: item.isActive !== false,
      file: null,
    });
    setLogoFile(null);
    setModal("edit");
  };

  const openEditLogo = (item) => {
    setSelected(item);
    setLogoFile(null);
    setModal("editLogo");
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
    if (!form.name.trim()) {
      toast.error("Yayınevi adı zorunludur.");
      return;
    }
    setSubmitting(true);
    try {
      // Rapor 16.2: name, code, isActive, file (opsiyonel)
      await createPublisher({
        name: form.name.trim(),
        code: form.code?.trim() || undefined,
        isActive: form.isActive,
        file: form.file || undefined,
      });
      toast.success(SUCCESS_MESSAGES.CREATE_SUCCESS);
      closeModal();
      loadPublishers();
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
      // Rapor 16.4: name, code, isActive
      await updatePublisher(selected.id, {
        name: form.name.trim() || undefined,
        code: form.code?.trim() || undefined,
        isActive: form.isActive,
      });
      toast.success(SUCCESS_MESSAGES.UPDATE_SUCCESS);
      closeModal();
      loadPublishers();
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.UPDATE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateLogo = async (e) => {
    e.preventDefault();
    if (!selected || !logoFile) {
      toast.error("Lütfen bir logo seçin.");
      return;
    }
    setSubmitting(true);
    try {
      await updatePublisherLogo(selected.id, logoFile);
      toast.success("Logo güncellendi.");
      closeModal();
      loadPublishers();
    } catch (err) {
      toast.error(err.message || "Logo güncellenemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await deletePublisher(selected.id);
      toast.success(SUCCESS_MESSAGES.DELETE_SUCCESS);
      closeModal();
      loadPublishers();
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
          <Building2 size={28} className="text-emerald-600" />
          Yayınevleri
        </h1>
        <button type="button" onClick={openCreate} className="admin-btn admin-btn-primary">
          <Plus size={18} />
          Yeni Yayınevi
        </button>
      </div>

      {loading ? (
        <div className="admin-loading-center">
          <span className="admin-spinner" />
        </div>
      ) : list.length === 0 ? (
        <div className="admin-empty-state">
          Henüz yayınevi yok. &quot;Yeni Yayınevi&quot; ile ekleyebilirsiniz.
        </div>
      ) : (
        <div className="admin-card admin-card-elevated">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Logo</th>
                  <th>Ad</th>
                  <th>Unvan</th>
                  <th>İletişim</th>
                  <th>Durum</th>
                  <th>Oluşturulma</th>
                  <th className="text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.logoUrl ? (
                        <img
                          src={getFullImageUrl(item.logoUrl)}
                          alt={item.name}
                          className="w-12 h-12 object-contain rounded-lg bg-slate-50"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                          <ImageIcon size={20} className="text-slate-400" />
                        </div>
                      )}
                    </td>
                    <td className="font-medium">{item.name}</td>
                    <td className="text-slate-600">{item.legalName || "—"}</td>
                    <td className="text-sm text-slate-600">
                      {item.supportEmail || item.phone || "—"}
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
                    <td className="text-slate-500 text-sm">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditLogo(item)}
                          className="admin-btn admin-btn-ghost admin-btn-icon"
                          title="Logoyu güncelle"
                        >
                          <ImageIcon size={18} />
                        </button>
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
            <div className="admin-modal-header">Yeni Yayınevi</div>
            <form onSubmit={handleCreate}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-row admin-form-row-2">
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
                    <label className="admin-label">Kod</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={form.code}
                      onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                      placeholder="OY"
                    />
                  </div>
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Unvan</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={form.legalName}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, legalName: e.target.value }))
                      }
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Vergi No</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={form.taxNumber}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, taxNumber: e.target.value }))
                      }
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Vergi Dairesi</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={form.taxOffice}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, taxOffice: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Web Sitesi</label>
                  <input
                    type="url"
                    className="admin-input"
                    value={form.websiteUrl}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, websiteUrl: e.target.value }))
                    }
                    placeholder="https://..."
                  />
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Destek E-posta</label>
                    <input
                      type="email"
                      className="admin-input"
                      value={form.supportEmail}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, supportEmail: e.target.value }))
                      }
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Telefon</label>
                    <input
                      type="tel"
                      className="admin-input"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, phone: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Marka Rengi (HEX)</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      className="h-10 w-14 rounded border border-slate-200 cursor-pointer p-0"
                      value={form.brandColorHex || "#10b981"}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          brandColorHex: e.target.value,
                        }))
                      }
                    />
                    <input
                      type="text"
                      className="admin-input flex-1"
                      value={form.brandColorHex}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, brandColorHex: e.target.value }))
                      }
                      placeholder="#10b981"
                    />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Logo (opsiyonel)</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="admin-input"
                    onChange={(e) =>
                      setForm((f) => ({ ...f, file: e.target.files?.[0] || null }))
                    }
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
            className="admin-modal admin-modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">Yayınevi Düzenle</div>
            <form onSubmit={handleUpdate}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-row admin-form-row-2">
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
                    <label className="admin-label">Kod</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={form.code}
                      onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                      placeholder="OY"
                    />
                  </div>
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Unvan</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={form.legalName}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, legalName: e.target.value }))
                      }
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Vergi No</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={form.taxNumber}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, taxNumber: e.target.value }))
                      }
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Vergi Dairesi</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={form.taxOffice}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, taxOffice: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Web Sitesi</label>
                  <input
                    type="url"
                    className="admin-input"
                    value={form.websiteUrl}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, websiteUrl: e.target.value }))
                    }
                  />
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Destek E-posta</label>
                    <input
                      type="email"
                      className="admin-input"
                      value={form.supportEmail}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, supportEmail: e.target.value }))
                      }
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Telefon</label>
                    <input
                      type="tel"
                      className="admin-input"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, phone: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Marka Rengi (HEX)</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      className="h-10 w-14 rounded border border-slate-200 cursor-pointer p-0"
                      value={form.brandColorHex || "#10b981"}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          brandColorHex: e.target.value,
                        }))
                      }
                    />
                    <input
                      type="text"
                      className="admin-input flex-1"
                      value={form.brandColorHex}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, brandColorHex: e.target.value }))
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

      {/* Modal: Edit Logo */}
      {modal === "editLogo" && selected && (
        <div className="admin-modal-backdrop" onClick={closeModal}>
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">Logo Güncelle</div>
            <form onSubmit={handleUpdateLogo}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Yeni Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="admin-input"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    required
                  />
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
                  disabled={submitting || !logoFile}
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
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">Yayınevini Pasif Yap</div>
            <div className="admin-modal-body">
              <p className="text-slate-600">
                &quot;{selected.name}&quot; yayınevini pasif hale getirmek istediğinize emin
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

export default Publishers;
