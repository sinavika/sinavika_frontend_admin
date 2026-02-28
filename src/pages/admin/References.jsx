import { useEffect, useState } from "react";
import {
  UserCheck,
  Megaphone,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Eye,
  XCircle,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getApplications,
  approveApplication,
  getAllCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from "@/services/adminReferenceService";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";
import { formatDate, formatDateShort, formatCurrency } from "@/utils/format";

const APPLICATION_STATUS = {
  0: { label: "Beklemede", slug: "pending", icon: Clock, className: "admin-badge-warning" },
  1: { label: "Onaylandı", slug: "approved", icon: CheckCircle2, className: "admin-badge-success" },
  2: { label: "Reddedildi", slug: "rejected", icon: XCircle, className: "admin-badge-danger" },
};

const DISCOUNT_TYPES = [
  { value: 0, label: "Yüzde (%)" },
  { value: 1, label: "Sabit Tutar" },
];

const REWARD_TYPES = [
  { value: 0, label: "Yüzde (%)" },
  { value: 1, label: "Sabit Tutar" },
  { value: 2, label: "Diğer" },
];

const toISO = (d) => {
  if (!d) return "";
  const date = new Date(d);
  return date.toISOString().slice(0, 16);
};

const defaultCampaignForm = () => ({
  name: "",
  isActive: true,
  startsAt: "",
  endsAt: "",
  refereeDiscountType: 0,
  refereeDiscountValue: "",
  referrerRewardType: 0,
  referrerRewardValue: "",
  maxRedemptionsTotal: "",
  maxRedemptionsPerCode: "",
  maxRedemptionsPerUser: "",
});

const References = () => {
  const [activeTab, setActiveTab] = useState("applications"); // "applications" | "campaigns"

  // Applications
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [detailApplication, setDetailApplication] = useState(null);

  // Campaigns
  const [campaigns, setCampaigns] = useState([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [campaignModal, setCampaignModal] = useState(null); // "create" | "edit" | "delete" | null
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignForm, setCampaignForm] = useState(defaultCampaignForm());
  const [campaignSubmitting, setCampaignSubmitting] = useState(false);

  const loadApplications = async () => {
    setApplicationsLoading(true);
    try {
      const data = await getApplications();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.FETCH_FAILED);
      setApplications([]);
    } finally {
      setApplicationsLoading(false);
    }
  };

  const loadCampaigns = async () => {
    setCampaignsLoading(true);
    try {
      const data = await getAllCampaigns();
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.FETCH_FAILED);
      setCampaigns([]);
    } finally {
      setCampaignsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "applications") loadApplications();
    else loadCampaigns();
  }, [activeTab]);

  const handleApprove = async (app) => {
    if (!app?.id) return;
    setApprovingId(app.id);
    try {
      await approveApplication(app.id);
      toast.success("Başvuru onaylandı. Referans kodu atandı ve e-posta gönderildi.");
      loadApplications();
    } catch (err) {
      toast.error(err.message || "Onaylama başarısız.");
    } finally {
      setApprovingId(null);
    }
  };

  const openCampaignCreate = () => {
    setSelectedCampaign(null);
    setCampaignForm(defaultCampaignForm());
    setCampaignModal("create");
  };

  const openCampaignEdit = (campaign) => {
    setSelectedCampaign(campaign);
    setCampaignForm({
      name: campaign.name || "",
      isActive: campaign.isActive !== false,
      startsAt: toISO(campaign.startsAt),
      endsAt: toISO(campaign.endsAt),
      refereeDiscountType: campaign.refereeDiscountType ?? 0,
      refereeDiscountValue: campaign.refereeDiscountValue ?? "",
      referrerRewardType: campaign.referrerRewardType ?? 0,
      referrerRewardValue: campaign.referrerRewardValue ?? "",
      maxRedemptionsTotal: campaign.maxRedemptionsTotal ?? "",
      maxRedemptionsPerCode: campaign.maxRedemptionsPerCode ?? "",
      maxRedemptionsPerUser: campaign.maxRedemptionsPerUser ?? "",
    });
    setCampaignModal("edit");
  };

  const openCampaignDelete = (campaign) => {
    setSelectedCampaign(campaign);
    setCampaignModal("delete");
  };

  const closeCampaignModal = () => {
    setCampaignModal(null);
    setSelectedCampaign(null);
    setCampaignForm(defaultCampaignForm());
  };

  const buildCampaignCreatePayload = () => ({
    name: campaignForm.name.trim(),
    isActive: campaignForm.isActive,
    startsAt: campaignForm.startsAt ? new Date(campaignForm.startsAt).toISOString() : undefined,
    endsAt: campaignForm.endsAt ? new Date(campaignForm.endsAt).toISOString() : undefined,
    refereeDiscountType: Number(campaignForm.refereeDiscountType) ?? 0,
    refereeDiscountValue: parseFloat(campaignForm.refereeDiscountValue) ?? 0,
    referrerRewardType: Number(campaignForm.referrerRewardType) ?? 0,
    referrerRewardValue: campaignForm.referrerRewardValue !== "" ? parseFloat(campaignForm.referrerRewardValue) : undefined,
    maxRedemptionsTotal: campaignForm.maxRedemptionsTotal ? parseInt(campaignForm.maxRedemptionsTotal, 10) : undefined,
    maxRedemptionsPerCode: campaignForm.maxRedemptionsPerCode ? parseInt(campaignForm.maxRedemptionsPerCode, 10) : undefined,
    maxRedemptionsPerUser: campaignForm.maxRedemptionsPerUser ? parseInt(campaignForm.maxRedemptionsPerUser, 10) : undefined,
  });

  const buildCampaignUpdatePayload = () => ({
    name: campaignForm.name?.trim() || undefined,
    isActive: campaignForm.isActive,
    startsAt: campaignForm.startsAt ? new Date(campaignForm.startsAt).toISOString() : undefined,
    endsAt: campaignForm.endsAt ? new Date(campaignForm.endsAt).toISOString() : undefined,
    refereeDiscountType: Number(campaignForm.refereeDiscountType),
    refereeDiscountValue: parseFloat(campaignForm.refereeDiscountValue),
    referrerRewardType: Number(campaignForm.referrerRewardType),
    referrerRewardValue: campaignForm.referrerRewardValue !== "" ? parseFloat(campaignForm.referrerRewardValue) : undefined,
    maxRedemptionsTotal: campaignForm.maxRedemptionsTotal ? parseInt(campaignForm.maxRedemptionsTotal, 10) : undefined,
    maxRedemptionsPerCode: campaignForm.maxRedemptionsPerCode ? parseInt(campaignForm.maxRedemptionsPerCode, 10) : undefined,
    maxRedemptionsPerUser: campaignForm.maxRedemptionsPerUser ? parseInt(campaignForm.maxRedemptionsPerUser, 10) : undefined,
  });

  const handleCampaignCreate = async (e) => {
    e.preventDefault();
    if (!campaignForm.name?.trim()) {
      toast.error("Kampanya adı zorunludur.");
      return;
    }
    if (campaignForm.refereeDiscountValue === "" || campaignForm.refereeDiscountValue == null) {
      toast.error("Davetli indirim değeri zorunludur.");
      return;
    }
    setCampaignSubmitting(true);
    try {
      await createCampaign(buildCampaignCreatePayload());
      toast.success(SUCCESS_MESSAGES.CREATE_SUCCESS);
      closeCampaignModal();
      loadCampaigns();
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.CREATE_FAILED);
    } finally {
      setCampaignSubmitting(false);
    }
  };

  const handleCampaignUpdate = async (e) => {
    e.preventDefault();
    if (!selectedCampaign?.id) return;
    setCampaignSubmitting(true);
    try {
      await updateCampaign(selectedCampaign.id, buildCampaignUpdatePayload());
      toast.success(SUCCESS_MESSAGES.UPDATE_SUCCESS);
      closeCampaignModal();
      loadCampaigns();
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.UPDATE_FAILED);
    } finally {
      setCampaignSubmitting(false);
    }
  };

  const handleCampaignDelete = async () => {
    if (!selectedCampaign?.id) return;
    setCampaignSubmitting(true);
    try {
      await deleteCampaign(selectedCampaign.id);
      toast.success("Kampanya pasif hale getirildi.");
      closeCampaignModal();
      loadCampaigns();
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.DELETE_FAILED);
    } finally {
      setCampaignSubmitting(false);
    }
  };

  const getStatusInfo = (status) => APPLICATION_STATUS[status] ?? APPLICATION_STATUS[0];

  const socialLinks = (app) => {
    const parts = [];
    if (app.instagram) parts.push(`Instagram: ${app.instagram}`);
    if (app.tiktok) parts.push(`TikTok: ${app.tiktok}`);
    if (app.youtube) parts.push(`YouTube: ${app.youtube}`);
    if (app.x) parts.push(`X: ${app.x}`);
    return parts.length ? parts.join(" · ") : "—";
  };

  return (
    <div className="admin-page-wrapper">
      <div className="admin-page-header admin-page-header-gradient flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <h1 className="admin-page-title flex items-center gap-2">
            <UserCheck size={28} className="text-emerald-600 shrink-0" />
            Referans Sistemi
          </h1>
          <p className="text-sm text-slate-500">
            Başvuruları onaylayın ve referans kampanyalarını yönetin.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("applications")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === "applications"
              ? "border-emerald-500 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          <span className="flex items-center gap-2">
            <UserCheck size={18} />
            Başvurular
            {applications.filter((a) => a.status === 0).length > 0 && (
              <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                {applications.filter((a) => a.status === 0).length}
              </span>
            )}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("campaigns")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === "campaigns"
              ? "border-emerald-500 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          <span className="flex items-center gap-2">
            <Megaphone size={18} />
            Kampanyalar
          </span>
        </button>
      </div>

      {/* Applications Tab */}
      {activeTab === "applications" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-600">
              Referans başvurularını listeleyin; bekleyenleri onaylayarak referans kodu atayın ve e-posta gönderin.
            </p>
            <button
              type="button"
              onClick={loadApplications}
              className="admin-btn admin-btn-secondary text-sm"
            >
              Listeyi yenile
            </button>
          </div>
          {applicationsLoading ? (
            <div className="admin-loading-center py-12">
              <span className="admin-spinner" />
            </div>
          ) : applications.length === 0 ? (
            <div className="admin-empty-state rounded-xl py-12">
              <UserCheck size={48} className="mx-auto mb-3 text-slate-300" />
              <p className="font-medium text-slate-600">Henüz başvuru yok.</p>
              <p className="text-sm mt-1 text-slate-500">Başvurular burada listelenecek.</p>
            </div>
          ) : (
            <div className="admin-card admin-card-elevated overflow-hidden">
              <div className="admin-table-wrapper overflow-x-auto">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Ad Soyad</th>
                      <th>İletişim</th>
                      <th>E-posta</th>
                      <th>Sosyal</th>
                      <th>Durum</th>
                      <th>Kod</th>
                      <th>Tarih</th>
                      <th className="text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => {
                      const statusInfo = getStatusInfo(app.status);
                      const StatusIcon = statusInfo.icon;
                      return (
                        <tr key={app.id}>
                          <td className="font-medium">
                            {app.name} {app.surname}
                          </td>
                          <td className="text-slate-600">{app.contactPhone || "—"}</td>
                          <td className="text-slate-600">{app.email || "—"}</td>
                          <td className="text-slate-500 text-sm max-w-[140px] truncate" title={socialLinks(app)}>
                            {socialLinks(app)}
                          </td>
                          <td>
                            <span className={`admin-badge ${statusInfo.className}`}>
                              <StatusIcon size={14} className="inline mr-1" />
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="font-mono text-sm">{app.generatedCode || "—"}</td>
                          <td className="text-slate-500 text-sm">{formatDate(app.createdAt)}</td>
                          <td className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => setDetailApplication(app)}
                                className="admin-btn admin-btn-ghost admin-btn-icon"
                                title="Detay"
                              >
                                <Eye size={18} />
                              </button>
                              {app.status === 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleApprove(app)}
                                  disabled={approvingId === app.id}
                                  className="admin-btn admin-btn-primary admin-btn-icon"
                                  title="Onayla"
                                >
                                  {approvingId === app.id ? (
                                    <span className="admin-spinner w-4 h-4 border-2" />
                                  ) : (
                                    <CheckCircle2 size={18} />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === "campaigns" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <p className="text-sm text-slate-600">
              Referans kampanyalarını oluşturun; davetli indirimi ve referans ödülünü tanımlayın.
            </p>
            <button
              type="button"
              onClick={openCampaignCreate}
              className="admin-btn admin-btn-primary shrink-0"
            >
              <Plus size={18} />
              Yeni Kampanya
            </button>
          </div>
          {campaignsLoading ? (
            <div className="admin-loading-center py-12">
              <span className="admin-spinner" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="admin-empty-state rounded-xl py-12">
              <Megaphone size={48} className="mx-auto mb-3 text-slate-300" />
              <p className="font-medium text-slate-600">Henüz kampanya yok.</p>
              <p className="text-sm mt-1 text-slate-500">&quot;Yeni Kampanya&quot; ile ekleyebilirsiniz.</p>
            </div>
          ) : (
            <div className="admin-card admin-card-elevated overflow-hidden">
              <div className="admin-table-wrapper overflow-x-auto">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Kampanya Adı</th>
                      <th>Davetli İndirimi</th>
                      <th>Referans Ödülü</th>
                      <th>Geçerlilik</th>
                      <th>Kullanım Limitleri</th>
                      <th>Durum</th>
                      <th className="text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((c) => (
                      <tr key={c.id}>
                        <td className="font-medium">{c.name}</td>
                        <td className="text-slate-600">
                          {c.refereeDiscountType === 0
                            ? `%${c.refereeDiscountValue}`
                            : formatCurrency(c.refereeDiscountValue)}
                        </td>
                        <td className="text-slate-600">
                          {c.referrerRewardType === 0
                            ? `%${c.referrerRewardValue ?? "—"}`
                            : c.referrerRewardType === 1
                              ? formatCurrency(c.referrerRewardValue)
                              : c.referrerRewardValue ?? "—"}
                        </td>
                        <td className="text-slate-500 text-sm whitespace-nowrap">
                          {formatDateShort(c.startsAt)} – {formatDateShort(c.endsAt)}
                        </td>
                        <td className="text-slate-500 text-sm">
                          Toplam: {c.maxRedemptionsTotal ?? "∞"} · Kod: {c.maxRedemptionsPerCode ?? "∞"} · Kullanıcı: {c.maxRedemptionsPerUser ?? "∞"}
                        </td>
                        <td>
                          <span
                            className={
                              c.isActive ? "admin-badge admin-badge-success" : "admin-badge admin-badge-neutral"
                            }
                          >
                            {c.isActive ? "Aktif" : "Pasif"}
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => openCampaignEdit(c)}
                              className="admin-btn admin-btn-ghost admin-btn-icon"
                              title="Düzenle"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => openCampaignDelete(c)}
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
        </div>
      )}

      {/* Application detail modal */}
      {detailApplication && (
        <div className="admin-modal-backdrop" onClick={() => setDetailApplication(null)}>
          <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header flex items-center justify-between">
              <span>Başvuru detayı</span>
              <button
                type="button"
                onClick={() => setDetailApplication(null)}
                className="admin-btn admin-btn-ghost admin-btn-icon"
              >
                ×
              </button>
            </div>
            <div className="admin-modal-body space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Ad Soyad</p>
                  <p className="font-medium">{detailApplication.name} {detailApplication.surname}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">E-posta</p>
                  <p className="text-slate-700">{detailApplication.email || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Telefon</p>
                  <p className="text-slate-700">{detailApplication.contactPhone || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Durum</p>
                  <span className={`admin-badge ${getStatusInfo(detailApplication.status).className}`}>
                    {getStatusInfo(detailApplication.status).label}
                  </span>
                </div>
                {detailApplication.generatedCode && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Referans kodu</p>
                    <p className="font-mono font-medium text-emerald-600">{detailApplication.generatedCode}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Sosyal medya</p>
                <ul className="text-sm text-slate-700 space-y-1">
                  {detailApplication.instagram && <li>Instagram: {detailApplication.instagram}</li>}
                  {detailApplication.tiktok && <li>TikTok: {detailApplication.tiktok}</li>}
                  {detailApplication.youtube && <li>YouTube: {detailApplication.youtube}</li>}
                  {detailApplication.x && <li>X: {detailApplication.x}</li>}
                  {!detailApplication.instagram && !detailApplication.tiktok && !detailApplication.youtube && !detailApplication.x && (
                    <li className="text-slate-400">—</li>
                  )}
                </ul>
              </div>
              {detailApplication.paymentIban && (
                <div className="border-t pt-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Ödeme IBAN</p>
                  <div className="bg-slate-50 rounded-lg p-3 text-sm">
                    <p><span className="text-slate-500">IBAN:</span> {detailApplication.paymentIban.iban}</p>
                    <p><span className="text-slate-500">Hesap sahibi:</span> {detailApplication.paymentIban.accountHolderName}</p>
                    <p><span className="text-slate-500">Banka:</span> {detailApplication.paymentIban.bankName}</p>
                  </div>
                </div>
              )}
              <div className="text-slate-500 text-sm">
                Oluşturulma: {formatDate(detailApplication.createdAt)}
                {detailApplication.processedAt && ` · İşlenme: ${formatDate(detailApplication.processedAt)}`}
              </div>
            </div>
            <div className="admin-modal-footer">
              {detailApplication.status === 0 && (
                <button
                  type="button"
                  onClick={() => {
                    handleApprove(detailApplication);
                    setDetailApplication(null);
                  }}
                  disabled={approvingId === detailApplication.id}
                  className="admin-btn admin-btn-primary"
                >
                  {approvingId === detailApplication.id ? "Onaylanıyor…" : "Onayla"}
                </button>
              )}
              <button type="button" onClick={() => setDetailApplication(null)} className="admin-btn admin-btn-secondary ml-auto">
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campaign create modal */}
      {campaignModal === "create" && (
        <div className="admin-modal-backdrop" onClick={closeCampaignModal}>
          <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">Yeni Referans Kampanyası</div>
            <form onSubmit={handleCampaignCreate}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Kampanya adı</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={campaignForm.name}
                    onChange={(e) => setCampaignForm((f) => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="camp-create-active"
                    checked={campaignForm.isActive}
                    onChange={(e) => setCampaignForm((f) => ({ ...f, isActive: e.target.checked }))}
                    className="rounded border-slate-300 text-emerald-600"
                  />
                  <label htmlFor="camp-create-active" className="text-sm">Aktif</label>
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Başlangıç</label>
                    <input
                      type="datetime-local"
                      className="admin-input"
                      value={campaignForm.startsAt}
                      onChange={(e) => setCampaignForm((f) => ({ ...f, startsAt: e.target.value }))}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Bitiş</label>
                    <input
                      type="datetime-local"
                      className="admin-input"
                      value={campaignForm.endsAt}
                      onChange={(e) => setCampaignForm((f) => ({ ...f, endsAt: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Davetli indirimi</p>
                  <div className="admin-form-row admin-form-row-2">
                    <div className="admin-form-group">
                      <label className="admin-label admin-label-required">Tip</label>
                      <select
                        className="admin-input"
                        value={campaignForm.refereeDiscountType}
                        onChange={(e) => setCampaignForm((f) => ({ ...f, refereeDiscountType: parseInt(e.target.value, 10) }))}
                      >
                        {DISCOUNT_TYPES.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label admin-label-required">Değer</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="admin-input"
                        value={campaignForm.refereeDiscountValue}
                        onChange={(e) => setCampaignForm((f) => ({ ...f, refereeDiscountValue: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Referans ödülü</p>
                  <div className="admin-form-row admin-form-row-2">
                    <div className="admin-form-group">
                      <label className="admin-label">Tip</label>
                      <select
                        className="admin-input"
                        value={campaignForm.referrerRewardType}
                        onChange={(e) => setCampaignForm((f) => ({ ...f, referrerRewardType: parseInt(e.target.value, 10) }))}
                      >
                        {REWARD_TYPES.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Değer</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="admin-input"
                        value={campaignForm.referrerRewardValue}
                        onChange={(e) => setCampaignForm((f) => ({ ...f, referrerRewardValue: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Kullanım limitleri (opsiyonel)</p>
                  <div className="admin-form-row admin-form-row-3">
                    <div className="admin-form-group">
                      <label className="admin-label">Toplam</label>
                      <input
                        type="number"
                        min="0"
                        className="admin-input"
                        value={campaignForm.maxRedemptionsTotal}
                        onChange={(e) => setCampaignForm((f) => ({ ...f, maxRedemptionsTotal: e.target.value }))}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Kod başına</label>
                      <input
                        type="number"
                        min="0"
                        className="admin-input"
                        value={campaignForm.maxRedemptionsPerCode}
                        onChange={(e) => setCampaignForm((f) => ({ ...f, maxRedemptionsPerCode: e.target.value }))}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Kullanıcı başına</label>
                      <input
                        type="number"
                        min="0"
                        className="admin-input"
                        value={campaignForm.maxRedemptionsPerUser}
                        onChange={(e) => setCampaignForm((f) => ({ ...f, maxRedemptionsPerUser: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" onClick={closeCampaignModal} className="admin-btn admin-btn-secondary">
                  İptal
                </button>
                <button type="submit" disabled={campaignSubmitting} className="admin-btn admin-btn-primary">
                  {campaignSubmitting ? "Oluşturuluyor…" : "Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Campaign edit modal */}
      {campaignModal === "edit" && selectedCampaign && (
        <div className="admin-modal-backdrop" onClick={closeCampaignModal}>
          <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">Kampanya düzenle</div>
            <form onSubmit={handleCampaignUpdate}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Kampanya adı</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={campaignForm.name}
                    onChange={(e) => setCampaignForm((f) => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="camp-edit-active"
                    checked={campaignForm.isActive}
                    onChange={(e) => setCampaignForm((f) => ({ ...f, isActive: e.target.checked }))}
                    className="rounded border-slate-300 text-emerald-600"
                  />
                  <label htmlFor="camp-edit-active" className="text-sm">Aktif</label>
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Başlangıç</label>
                    <input
                      type="datetime-local"
                      className="admin-input"
                      value={campaignForm.startsAt}
                      onChange={(e) => setCampaignForm((f) => ({ ...f, startsAt: e.target.value }))}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Bitiş</label>
                    <input
                      type="datetime-local"
                      className="admin-input"
                      value={campaignForm.endsAt}
                      onChange={(e) => setCampaignForm((f) => ({ ...f, endsAt: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Davetli indirimi</p>
                  <div className="admin-form-row admin-form-row-2">
                    <div className="admin-form-group">
                      <label className="admin-label">Tip</label>
                      <select
                        className="admin-input"
                        value={campaignForm.refereeDiscountType}
                        onChange={(e) => setCampaignForm((f) => ({ ...f, refereeDiscountType: parseInt(e.target.value, 10) }))}
                      >
                        {DISCOUNT_TYPES.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Değer</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="admin-input"
                        value={campaignForm.refereeDiscountValue}
                        onChange={(e) => setCampaignForm((f) => ({ ...f, refereeDiscountValue: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Referans ödülü</p>
                  <div className="admin-form-row admin-form-row-2">
                    <div className="admin-form-group">
                      <label className="admin-label">Tip</label>
                      <select
                        className="admin-input"
                        value={campaignForm.referrerRewardType}
                        onChange={(e) => setCampaignForm((f) => ({ ...f, referrerRewardType: parseInt(e.target.value, 10) }))}
                      >
                        {REWARD_TYPES.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Değer</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="admin-input"
                        value={campaignForm.referrerRewardValue}
                        onChange={(e) => setCampaignForm((f) => ({ ...f, referrerRewardValue: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Kullanım limitleri</p>
                  <div className="admin-form-row admin-form-row-3">
                    <div className="admin-form-group">
                      <label className="admin-label">Toplam</label>
                      <input
                        type="number"
                        min="0"
                        className="admin-input"
                        value={campaignForm.maxRedemptionsTotal}
                        onChange={(e) => setCampaignForm((f) => ({ ...f, maxRedemptionsTotal: e.target.value }))}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Kod başına</label>
                      <input
                        type="number"
                        min="0"
                        className="admin-input"
                        value={campaignForm.maxRedemptionsPerCode}
                        onChange={(e) => setCampaignForm((f) => ({ ...f, maxRedemptionsPerCode: e.target.value }))}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Kullanıcı başına</label>
                      <input
                        type="number"
                        min="0"
                        className="admin-input"
                        value={campaignForm.maxRedemptionsPerUser}
                        onChange={(e) => setCampaignForm((f) => ({ ...f, maxRedemptionsPerUser: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" onClick={closeCampaignModal} className="admin-btn admin-btn-secondary">
                  İptal
                </button>
                <button type="submit" disabled={campaignSubmitting} className="admin-btn admin-btn-primary">
                  {campaignSubmitting ? "Güncelleniyor…" : "Güncelle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Campaign delete (soft) modal */}
      {campaignModal === "delete" && selectedCampaign && (
        <div className="admin-modal-backdrop" onClick={closeCampaignModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">Kampanyayı pasif yap</div>
            <div className="admin-modal-body">
              <p className="text-slate-600">
                &quot;{selectedCampaign.name}&quot; kampanyasını pasif hale getirmek istediğinize emin misiniz? (Soft delete – kayıt silinmez.)
              </p>
            </div>
            <div className="admin-modal-footer">
              <button type="button" onClick={closeCampaignModal} className="admin-btn admin-btn-secondary">
                İptal
              </button>
              <button
                type="button"
                onClick={handleCampaignDelete}
                disabled={campaignSubmitting}
                className="admin-btn admin-btn-danger"
              >
                {campaignSubmitting ? "İşleniyor…" : "Pasif yap"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default References;
