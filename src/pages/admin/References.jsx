import { useEffect, useState, useCallback } from "react";
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
  Users,
  Wallet,
  Banknote,
  BookOpen,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getApplications,
  approveApplication,
  getApplicationLedger,
  getReferenceUsers,
  getAllCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getCommissions,
  getPayouts,
} from "@/services/adminReferenceService";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";
import { formatDate, formatDateShort, formatCurrency } from "@/utils/format";

const getApiError = (err) =>
  err.response?.data?.error ||
  err.response?.data?.Error ||
  err.message ||
  ERROR_MESSAGES.FETCH_FAILED;

const APPLICATION_STATUS = {
  0: { label: "Beklemede", slug: "pending", icon: Clock, className: "ref-badge ref-badge-pending" },
  1: { label: "Onaylandı", slug: "approved", icon: CheckCircle2, className: "ref-badge ref-badge-success" },
  2: { label: "Reddedildi", slug: "rejected", icon: XCircle, className: "ref-badge ref-badge-danger" },
};

const COMMISSION_STATUS = {
  0: { label: "Beklemede", className: "ref-badge ref-badge-pending" },
  1: { label: "Onaylandı", className: "ref-badge ref-badge-success" },
  2: { label: "Ödendi", className: "ref-badge ref-badge-paid" },
  3: { label: "İptal", className: "ref-badge ref-badge-neutral" },
};

const COMMISSION_SOURCE = {
  0: "Abonelik Satış",
  1: "Abonelik Yenileme",
  2: "Sipariş",
};

const PAYOUT_STATUS = {
  0: { label: "Beklemede", className: "ref-badge ref-badge-pending" },
  1: { label: "Tamamlandı", className: "ref-badge ref-badge-success" },
  2: { label: "Başarısız", className: "ref-badge ref-badge-danger" },
  3: { label: "İptal", className: "ref-badge ref-badge-neutral" },
};

const LEDGER_ENTRY_TYPE = {
  0: "Komisyon",
  1: "Hakediş",
  2: "Hakediş iadesi",
  3: "Düzeltme",
  4: "İade",
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

const toISODate = (d) => {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
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

const TABS = [
  { id: "applications", label: "Başvurular", icon: UserCheck },
  { id: "reference-users", label: "Referans Kullanıcıları", icon: Users },
  { id: "campaigns", label: "Kampanyalar", icon: Megaphone },
  { id: "commissions", label: "Komisyonlar", icon: Wallet },
  { id: "payouts", label: "Hakedişler", icon: Banknote },
];

const References = () => {
  const [activeTab, setActiveTab] = useState("applications");

  // Applications
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const [detailApplication, setDetailApplication] = useState(null);
  const [approveModalApp, setApproveModalApp] = useState(null);
  const [approveForm, setApproveForm] = useState({ commissionRatePercent: "10", referralBaseUrl: "" });
  const [approveSubmitting, setApproveSubmitting] = useState(false);
  const [ledgerAppId, setLedgerAppId] = useState(null);
  const [ledgerList, setLedgerList] = useState([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [ledgerFrom, setLedgerFrom] = useState("");
  const [ledgerTo, setLedgerTo] = useState("");

  // Reference users
  const [referenceUsers, setReferenceUsers] = useState([]);
  const [refUsersLoading, setRefUsersLoading] = useState(false);

  // Campaigns
  const [campaigns, setCampaigns] = useState([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [campaignModal, setCampaignModal] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignForm, setCampaignForm] = useState(defaultCampaignForm());
  const [campaignSubmitting, setCampaignSubmitting] = useState(false);

  // Commissions
  const [commissions, setCommissions] = useState([]);
  const [commissionsLoading, setCommissionsLoading] = useState(false);
  const [commissionsFilter, setCommissionsFilter] = useState({
    applicationId: "",
    fromUtc: "",
    toUtc: "",
    status: "",
  });

  // Payouts
  const [payouts, setPayouts] = useState([]);
  const [payoutsLoading, setPayoutsLoading] = useState(false);
  const [payoutsFilter, setPayoutsFilter] = useState({ applicationId: "", status: "" });

  const loadApplications = useCallback(async () => {
    setApplicationsLoading(true);
    try {
      const data = await getApplications();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(getApiError(err));
      setApplications([]);
    } finally {
      setApplicationsLoading(false);
    }
  }, []);

  const loadReferenceUsers = useCallback(async () => {
    setRefUsersLoading(true);
    try {
      const data = await getReferenceUsers();
      setReferenceUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(getApiError(err));
      setReferenceUsers([]);
    } finally {
      setRefUsersLoading(false);
    }
  }, []);

  const loadCampaigns = useCallback(async () => {
    setCampaignsLoading(true);
    try {
      const data = await getAllCampaigns();
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(getApiError(err));
      setCampaigns([]);
    } finally {
      setCampaignsLoading(false);
    }
  }, []);

  const loadCommissions = useCallback(async () => {
    setCommissionsLoading(true);
    try {
      const params = {};
      if (commissionsFilter.applicationId) params.applicationId = commissionsFilter.applicationId;
      if (commissionsFilter.fromUtc) params.fromUtc = new Date(commissionsFilter.fromUtc).toISOString();
      if (commissionsFilter.toUtc) params.toUtc = new Date(commissionsFilter.toUtc + "T23:59:59.999Z").toISOString();
      if (commissionsFilter.status !== "") params.status = Number(commissionsFilter.status);
      const data = await getCommissions(params);
      setCommissions(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(getApiError(err));
      setCommissions([]);
    } finally {
      setCommissionsLoading(false);
    }
  }, [commissionsFilter.applicationId, commissionsFilter.fromUtc, commissionsFilter.toUtc, commissionsFilter.status]);

  const loadPayouts = useCallback(async () => {
    setPayoutsLoading(true);
    try {
      const params = {};
      if (payoutsFilter.applicationId) params.applicationId = payoutsFilter.applicationId;
      if (payoutsFilter.status !== "") params.status = Number(payoutsFilter.status);
      const data = await getPayouts(params);
      setPayouts(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(getApiError(err));
      setPayouts([]);
    } finally {
      setPayoutsLoading(false);
    }
  }, [payoutsFilter.applicationId, payoutsFilter.status]);

  useEffect(() => {
    if (activeTab === "applications") loadApplications();
    else if (activeTab === "reference-users") loadReferenceUsers();
    else if (activeTab === "campaigns") loadCampaigns();
    else if (activeTab === "commissions") loadCommissions();
    else if (activeTab === "payouts") loadPayouts();
  }, [activeTab, loadApplications, loadReferenceUsers, loadCampaigns, loadCommissions, loadPayouts]);

  // Komisyon/Hakediş filtrelerinde başvuru listesi için applications yükle
  useEffect(() => {
    if (activeTab === "commissions" || activeTab === "payouts") loadApplications();
  }, [activeTab, loadApplications]);

  const openApproveModal = (app) => {
    setApproveModalApp(app);
    setApproveForm({ commissionRatePercent: "10", referralBaseUrl: "" });
  };

  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    if (!approveModalApp?.id) return;
    setApproveSubmitting(true);
    try {
      await approveApplication(approveModalApp.id, {
        commissionRatePercent: approveForm.commissionRatePercent !== "" ? parseFloat(approveForm.commissionRatePercent) : 0,
        referralBaseUrl: approveForm.referralBaseUrl?.trim() || undefined,
      });
      toast.success("Başvuru onaylandı. Referans kodu atandı ve e-posta gönderildi.");
      setApproveModalApp(null);
      loadApplications();
      if (detailApplication?.id === approveModalApp.id) setDetailApplication(null);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setApproveSubmitting(false);
    }
  };

  const loadLedger = async () => {
    if (!ledgerAppId) return;
    setLedgerLoading(true);
    setLedgerList([]);
    try {
      const params = {};
      if (ledgerFrom) params.fromUtc = new Date(ledgerFrom).toISOString();
      if (ledgerTo) params.toUtc = new Date(ledgerTo + "T23:59:59.999Z").toISOString();
      const data = await getApplicationLedger(ledgerAppId, params);
      setLedgerList(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setLedgerLoading(false);
    }
  };

  const openLedger = (appId) => {
    setLedgerAppId(appId);
    setLedgerFrom("");
    setLedgerTo("");
    setLedgerList([]);
  };

  useEffect(() => {
    if (ledgerAppId) loadLedger();
  }, [ledgerAppId]);

  const handleApproveInline = async (app) => {
    if (!app?.id) return;
    setApprovingId(app.id);
    try {
      await approveApplication(app.id);
      toast.success("Başvuru onaylandı.");
      loadApplications();
      if (detailApplication?.id === app.id) setDetailApplication(null);
    } catch (err) {
      toast.error(getApiError(err));
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

  const buildCampaignUpdatePayload = () => {
    const p = {};
    if (campaignForm.name != null) p.name = campaignForm.name.trim();
    if (campaignForm.isActive !== undefined) p.isActive = campaignForm.isActive;
    if (campaignForm.startsAt) p.startsAt = new Date(campaignForm.startsAt).toISOString();
    if (campaignForm.endsAt) p.endsAt = new Date(campaignForm.endsAt).toISOString();
    if (campaignForm.refereeDiscountType != null) p.refereeDiscountType = Number(campaignForm.refereeDiscountType);
    if (campaignForm.refereeDiscountValue !== "") p.refereeDiscountValue = parseFloat(campaignForm.refereeDiscountValue);
    if (campaignForm.referrerRewardType != null) p.referrerRewardType = Number(campaignForm.referrerRewardType);
    if (campaignForm.referrerRewardValue !== "") p.referrerRewardValue = parseFloat(campaignForm.referrerRewardValue);
    if (campaignForm.maxRedemptionsTotal !== "") p.maxRedemptionsTotal = parseInt(campaignForm.maxRedemptionsTotal, 10);
    if (campaignForm.maxRedemptionsPerCode !== "") p.maxRedemptionsPerCode = parseInt(campaignForm.maxRedemptionsPerCode, 10);
    if (campaignForm.maxRedemptionsPerUser !== "") p.maxRedemptionsPerUser = parseInt(campaignForm.maxRedemptionsPerUser, 10);
    return p;
  };

  const handleCampaignCreate = async (e) => {
    e.preventDefault();
    if (!campaignForm.name?.trim()) {
      toast.error("Kampanya adı zorunludur.");
      return;
    }
    setCampaignSubmitting(true);
    try {
      await createCampaign(buildCampaignCreatePayload());
      toast.success(SUCCESS_MESSAGES.CREATE_SUCCESS);
      closeCampaignModal();
      loadCampaigns();
    } catch (err) {
      toast.error(getApiError(err));
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
      toast.error(getApiError(err));
    } finally {
      setCampaignSubmitting(false);
    }
  };

  const handleCampaignDelete = async () => {
    if (!selectedCampaign?.id) return;
    setCampaignSubmitting(true);
    try {
      await deleteCampaign(selectedCampaign.id);
      toast.success("Kampanya silindi.");
      closeCampaignModal();
      loadCampaigns();
    } catch (err) {
      toast.error(getApiError(err));
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

  const approvedApplications = applications.filter((a) => a.status === 1);

  return (
    <div className="admin-page-wrapper ref-page">
      <div className="ref-page-header">
        <h1 className="ref-page-title">
          <UserCheck size={28} className="ref-page-title-icon" />
          Referans Sistemi
        </h1>
        <p className="ref-page-desc">
          Başvuruları onaylayın, referans kullanıcılarını, kampanyaları, komisyon ve hakedişleri yönetin.
        </p>
      </div>

      <div className="ref-tabs">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`ref-tab ${activeTab === id ? "ref-tab-active" : ""}`}
          >
            <Icon size={18} className="ref-tab-icon" />
            <span>{label}</span>
            {id === "applications" && applications.filter((a) => a.status === 0).length > 0 && (
              <span className="ref-tab-badge">{applications.filter((a) => a.status === 0).length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ——— Başvurular ——— */}
      {activeTab === "applications" && (
        <div className="ref-section">
          <div className="ref-section-toolbar">
            <p className="ref-section-hint">
              Bekleyen başvuruları onaylayarak referans kodu atayın; komisyon oranı ve base URL opsiyonel.
            </p>
            <button type="button" onClick={loadApplications} className="admin-btn admin-btn-secondary ref-btn-refresh">
              Listeyi yenile
            </button>
          </div>
          {applicationsLoading ? (
            <div className="admin-loading-center ref-loading">
              <Loader2 size={28} className="ref-spinner" />
            </div>
          ) : applications.length === 0 ? (
            <div className="ref-empty">
              <UserCheck size={48} className="ref-empty-icon" />
              <p className="ref-empty-title">Henüz başvuru yok.</p>
              <p className="ref-empty-desc">Başvurular burada listelenecek.</p>
            </div>
          ) : (
            <div className="admin-card admin-card-elevated ref-card">
              <div className="admin-table-wrapper">
                <table className="admin-table ref-table">
                  <thead>
                    <tr>
                      <th>Ad Soyad</th>
                      <th>İletişim</th>
                      <th>E-posta</th>
                      <th>Sosyal</th>
                      <th>Durum</th>
                      <th>Kod / Komisyon</th>
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
                          <td className="font-medium">{app.name} {app.surname}</td>
                          <td className="text-slate-600">{app.contactPhone || "—"}</td>
                          <td className="text-slate-600">{app.email || "—"}</td>
                          <td className="ref-cell-social" title={socialLinks(app)}>{socialLinks(app)}</td>
                          <td>
                            <span className={statusInfo.className}>
                              <StatusIcon size={14} className="ref-badge-icon" />
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="ref-cell-code">
                            {app.generatedCode || "—"}
                            {app.commissionRatePercent != null && ` · %${app.commissionRatePercent}`}
                          </td>
                          <td className="text-slate-500 text-sm">{formatDate(app.createdAt)}</td>
                          <td className="text-right">
                            <div className="ref-row-actions">
                              <button
                                type="button"
                                onClick={() => setDetailApplication(app)}
                                className="admin-btn admin-btn-ghost admin-btn-icon"
                                title="Detay"
                              >
                                <Eye size={18} />
                              </button>
                              {app.status === 0 && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => openApproveModal(app)}
                                    disabled={approvingId === app.id}
                                    className="admin-btn admin-btn-primary ref-btn-approve"
                                    title="Onayla (komisyon/URL ile)"
                                  >
                                    {approvingId === app.id ? (
                                      <Loader2 size={18} className="ref-spinner" />
                                    ) : (
                                      <CheckCircle2 size={18} />
                                    )}
                                    Onayla
                                  </button>
                                </>
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

      {/* ——— Referans Kullanıcıları ——— */}
      {activeTab === "reference-users" && (
        <div className="ref-section">
          {refUsersLoading ? (
            <div className="admin-loading-center ref-loading">
              <Loader2 size={28} className="ref-spinner" />
            </div>
          ) : referenceUsers.length === 0 ? (
            <div className="ref-empty">
              <Users size={48} className="ref-empty-icon" />
              <p className="ref-empty-title">Referans kullanıcısı yok.</p>
              <p className="ref-empty-desc">Onaylanan başvurulardan türetilir.</p>
            </div>
          ) : (
            <div className="admin-card admin-card-elevated ref-card">
              <div className="admin-table-wrapper">
                <table className="admin-table ref-table">
                  <thead>
                    <tr>
                      <th>Ad Soyad</th>
                      <th>E-posta / Telefon</th>
                      <th>Kod</th>
                      <th>Komisyon %</th>
                      <th>Onay tarihi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referenceUsers.map((u) => (
                      <tr key={u.id}>
                        <td className="font-medium">{u.name} {u.surname}</td>
                        <td className="text-slate-600">{u.email || "—"} / {u.contactPhone || "—"}</td>
                        <td className="font-mono text-emerald-600">{u.generatedCode || "—"}</td>
                        <td>{u.commissionRatePercent != null ? `%${u.commissionRatePercent}` : "—"}</td>
                        <td className="text-slate-500 text-sm">{formatDate(u.processedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ——— Kampanyalar ——— */}
      {activeTab === "campaigns" && (
        <div className="ref-section">
          <div className="ref-section-toolbar">
            <p className="ref-section-hint">Davetli indirimi ve referans ödülünü tanımlayın.</p>
            <button type="button" onClick={openCampaignCreate} className="admin-btn admin-btn-primary">
              <Plus size={18} />
              Yeni Kampanya
            </button>
          </div>
          {campaignsLoading ? (
            <div className="admin-loading-center ref-loading">
              <Loader2 size={28} className="ref-spinner" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="ref-empty">
              <Megaphone size={48} className="ref-empty-icon" />
              <p className="ref-empty-title">Henüz kampanya yok.</p>
              <p className="ref-empty-desc">&quot;Yeni Kampanya&quot; ile ekleyebilirsiniz.</p>
            </div>
          ) : (
            <div className="admin-card admin-card-elevated ref-card">
              <div className="admin-table-wrapper">
                <table className="admin-table ref-table">
                  <thead>
                    <tr>
                      <th>Kampanya Adı</th>
                      <th>Davetli İndirimi</th>
                      <th>Referans Ödülü</th>
                      <th>Geçerlilik</th>
                      <th>Limitler</th>
                      <th>Durum</th>
                      <th className="text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((c) => (
                      <tr key={c.id}>
                        <td className="font-medium">{c.name}</td>
                        <td className="text-slate-600">
                          {c.refereeDiscountType === 0 ? `%${c.refereeDiscountValue}` : formatCurrency(c.refereeDiscountValue)}
                        </td>
                        <td className="text-slate-600">
                          {c.referrerRewardType === 0 ? `%${c.referrerRewardValue ?? "—"}` : c.referrerRewardType === 1 ? formatCurrency(c.referrerRewardValue) : c.referrerRewardValue ?? "—"}
                        </td>
                        <td className="text-slate-500 text-sm whitespace-nowrap">
                          {formatDateShort(c.startsAt)} – {formatDateShort(c.endsAt)}
                        </td>
                        <td className="text-slate-500 text-sm">
                          Toplam: {c.maxRedemptionsTotal ?? "∞"} · Kod: {c.maxRedemptionsPerCode ?? "∞"} · Kullanıcı: {c.maxRedemptionsPerUser ?? "∞"}
                        </td>
                        <td>
                          <span className={c.isActive ? "ref-badge ref-badge-success" : "ref-badge ref-badge-neutral"}>
                            {c.isActive ? "Aktif" : "Pasif"}
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="ref-row-actions">
                            <button type="button" onClick={() => openCampaignEdit(c)} className="admin-btn admin-btn-ghost admin-btn-icon" title="Düzenle">
                              <Pencil size={18} />
                            </button>
                            <button type="button" onClick={() => openCampaignDelete(c)} className="admin-btn admin-btn-ghost admin-btn-icon text-red-600 hover:bg-red-50" title="Sil">
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

      {/* ——— Komisyonlar ——— */}
      {activeTab === "commissions" && (
        <div className="ref-section">
          <div className="ref-filters">
            <div className="ref-filter-group">
              <label className="admin-label">Başvuru</label>
              <select
                className="admin-input ref-filter-select"
                value={commissionsFilter.applicationId}
                onChange={(e) => setCommissionsFilter((f) => ({ ...f, applicationId: e.target.value }))}
              >
                <option value="">Tümü</option>
                {approvedApplications.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} {a.surname} ({a.generatedCode})</option>
                ))}
              </select>
            </div>
            <div className="ref-filter-group">
              <label className="admin-label">Başlangıç</label>
              <input
                type="date"
                className="admin-input ref-filter-input"
                value={commissionsFilter.fromUtc}
                onChange={(e) => setCommissionsFilter((f) => ({ ...f, fromUtc: e.target.value }))}
              />
            </div>
            <div className="ref-filter-group">
              <label className="admin-label">Bitiş</label>
              <input
                type="date"
                className="admin-input ref-filter-input"
                value={commissionsFilter.toUtc}
                onChange={(e) => setCommissionsFilter((f) => ({ ...f, toUtc: e.target.value }))}
              />
            </div>
            <div className="ref-filter-group">
              <label className="admin-label">Durum</label>
              <select
                className="admin-input ref-filter-select"
                value={commissionsFilter.status}
                onChange={(e) => setCommissionsFilter((f) => ({ ...f, status: e.target.value }))}
              >
                <option value="">Tümü</option>
                <option value="0">Beklemede</option>
                <option value="1">Onaylandı</option>
                <option value="2">Ödendi</option>
                <option value="3">İptal</option>
              </select>
            </div>
            <button type="button" onClick={loadCommissions} className="admin-btn admin-btn-primary ref-btn-filter">
              Filtrele
            </button>
          </div>
          {commissionsLoading ? (
            <div className="admin-loading-center ref-loading">
              <Loader2 size={28} className="ref-spinner" />
            </div>
          ) : commissions.length === 0 ? (
            <div className="ref-empty">
              <Wallet size={48} className="ref-empty-icon" />
              <p className="ref-empty-title">Komisyon kaydı yok.</p>
            </div>
          ) : (
            <div className="admin-card admin-card-elevated ref-card">
              <div className="admin-table-wrapper">
                <table className="admin-table ref-table">
                  <thead>
                    <tr>
                      <th>Kod</th>
                      <th>Kaynak</th>
                      <th>Davetli</th>
                      <th>İşlem tutarı</th>
                      <th>Komisyon</th>
                      <th>Durum</th>
                      <th>Tarih</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissions.map((c) => (
                      <tr key={c.id}>
                        <td className="font-mono text-emerald-600">{c.code}</td>
                        <td className="text-slate-600">{COMMISSION_SOURCE[c.sourceType] ?? c.sourceType}</td>
                        <td>{c.refereeName || "—"}</td>
                        <td>{formatCurrency(c.transactionAmount)}</td>
                        <td className="font-medium">{formatCurrency(c.commissionAmount)} (%{c.commissionRatePercent})</td>
                        <td>
                          <span className={(COMMISSION_STATUS[c.status] || {}).className ?? "ref-badge ref-badge-neutral"}>
                            {(COMMISSION_STATUS[c.status] || {}).label ?? c.status}
                          </span>
                        </td>
                        <td className="text-slate-500 text-sm">{formatDate(c.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ——— Hakedişler ——— */}
      {activeTab === "payouts" && (
        <div className="ref-section">
          <div className="ref-filters">
            <div className="ref-filter-group">
              <label className="admin-label">Başvuru</label>
              <select
                className="admin-input ref-filter-select"
                value={payoutsFilter.applicationId}
                onChange={(e) => setPayoutsFilter((f) => ({ ...f, applicationId: e.target.value }))}
              >
                <option value="">Tümü</option>
                {approvedApplications.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} {a.surname}</option>
                ))}
              </select>
            </div>
            <div className="ref-filter-group">
              <label className="admin-label">Durum</label>
              <select
                className="admin-input ref-filter-select"
                value={payoutsFilter.status}
                onChange={(e) => setPayoutsFilter((f) => ({ ...f, status: e.target.value }))}
              >
                <option value="">Tümü</option>
                <option value="0">Beklemede</option>
                <option value="1">Tamamlandı</option>
                <option value="2">Başarısız</option>
                <option value="3">İptal</option>
              </select>
            </div>
            <button type="button" onClick={loadPayouts} className="admin-btn admin-btn-primary ref-btn-filter">
              Filtrele
            </button>
          </div>
          {payoutsLoading ? (
            <div className="admin-loading-center ref-loading">
              <Loader2 size={28} className="ref-spinner" />
            </div>
          ) : payouts.length === 0 ? (
            <div className="ref-empty">
              <Banknote size={48} className="ref-empty-icon" />
              <p className="ref-empty-title">Hakediş kaydı yok.</p>
            </div>
          ) : (
            <div className="admin-card admin-card-elevated ref-card">
              <div className="admin-table-wrapper">
                <table className="admin-table ref-table">
                  <thead>
                    <tr>
                      <th>Tutar</th>
                      <th>Yöntem</th>
                      <th>IBAN</th>
                      <th>Durum</th>
                      <th>Ödeme tarihi</th>
                      <th>Harici ref</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((p) => (
                      <tr key={p.id}>
                        <td className="font-medium">{formatCurrency(p.amount)} {p.currency}</td>
                        <td className="text-slate-600">{p.paymentMethod || "—"}</td>
                        <td className="font-mono text-sm">{p.ibanSnapshot || "—"}</td>
                        <td>
                          <span className={(PAYOUT_STATUS[p.status] || {}).className ?? "ref-badge ref-badge-neutral"}>
                            {(PAYOUT_STATUS[p.status] || {}).label ?? p.status}
                          </span>
                        </td>
                        <td className="text-slate-500 text-sm">{p.paidAt ? formatDate(p.paidAt) : "—"}</td>
                        <td className="text-slate-500 text-sm">{p.externalPaymentRef || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ——— Başvuru detay modal ——— */}
      {detailApplication && (
        <div className="admin-modal-backdrop" onClick={() => setDetailApplication(null)}>
          <div className="admin-modal admin-modal-lg ref-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header ref-modal-header">
              <span>Başvuru detayı</span>
              <button type="button" onClick={() => setDetailApplication(null)} className="admin-btn admin-btn-ghost admin-btn-icon">×</button>
            </div>
            <div className="admin-modal-body ref-modal-body">
              <div className="ref-detail-grid">
                <div><p className="ref-detail-label">Ad Soyad</p><p className="font-medium">{detailApplication.name} {detailApplication.surname}</p></div>
                <div><p className="ref-detail-label">E-posta</p><p className="text-slate-700">{detailApplication.email || "—"}</p></div>
                <div><p className="ref-detail-label">Telefon</p><p className="text-slate-700">{detailApplication.contactPhone || "—"}</p></div>
                <div><p className="ref-detail-label">Durum</p><span className={getStatusInfo(detailApplication.status).className}>{getStatusInfo(detailApplication.status).label}</span></div>
                {detailApplication.generatedCode && (
                  <div><p className="ref-detail-label">Referans kodu</p><p className="font-mono font-medium text-emerald-600">{detailApplication.generatedCode}</p></div>
                )}
              </div>
              <div className="ref-detail-block">
                <p className="ref-detail-label">Sosyal medya</p>
                <ul className="ref-detail-list">
                  {detailApplication.instagram && <li>Instagram: {detailApplication.instagram}</li>}
                  {detailApplication.tiktok && <li>TikTok: {detailApplication.tiktok}</li>}
                  {detailApplication.youtube && <li>YouTube: {detailApplication.youtube}</li>}
                  {detailApplication.x && <li>X: {detailApplication.x}</li>}
                  {!detailApplication.instagram && !detailApplication.tiktok && !detailApplication.youtube && !detailApplication.x && <li className="text-slate-400">—</li>}
                </ul>
              </div>
              {detailApplication.paymentIban && (
                <div className="ref-detail-block ref-detail-iban">
                  <p className="ref-detail-label">Ödeme IBAN</p>
                  <div className="ref-iban-box">
                    <p>IBAN: {detailApplication.paymentIban.iban}</p>
                    <p>Hesap: {detailApplication.paymentIban.accountHolderName}</p>
                    <p>Banka: {detailApplication.paymentIban.bankName}</p>
                  </div>
                </div>
              )}
              <div className="ref-detail-footer">
                Oluşturulma: {formatDate(detailApplication.createdAt)}
                {detailApplication.processedAt && ` · İşlenme: ${formatDate(detailApplication.processedAt)}`}
              </div>
              {detailApplication.status === 1 && (
                <div className="ref-ledger-block">
                  <button type="button" onClick={() => openLedger(detailApplication.id)} className="admin-btn admin-btn-secondary ref-btn-ledger">
                    <BookOpen size={16} />
                    Ekstre görüntüle
                  </button>
                </div>
              )}
            </div>
            <div className="admin-modal-footer">
              {detailApplication.status === 0 && (
                <button type="button" onClick={() => openApproveModal(detailApplication)} disabled={approvingId === detailApplication.id} className="admin-btn admin-btn-primary">
                  Onayla (parametrelerle)
                </button>
              )}
              <button type="button" onClick={() => setDetailApplication(null)} className="admin-btn admin-btn-secondary ml-auto">Kapat</button>
            </div>
          </div>
        </div>
      )}

      {/* ——— Onay modal (komisyon / base URL) ——— */}
      {approveModalApp && (
        <div className="admin-modal-backdrop" onClick={() => setApproveModalApp(null)}>
          <div className="admin-modal ref-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header ref-modal-header">Başvuruyu onayla</div>
            <form onSubmit={handleApproveSubmit}>
              <div className="admin-modal-body">
                <p className="ref-approve-intro">
                  <strong>{approveModalApp.name} {approveModalApp.surname}</strong> için komisyon oranı ve referral base URL (opsiyonel) girin. Boş bırakılırsa varsayılan kullanılır.
                </p>
                <div className="admin-form-group">
                  <label className="admin-label">Komisyon oranı (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    className="admin-input"
                    value={approveForm.commissionRatePercent}
                    onChange={(e) => setApproveForm((f) => ({ ...f, commissionRatePercent: e.target.value }))}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Referral base URL</label>
                  <input
                    type="url"
                    className="admin-input"
                    placeholder="https://app.example.com"
                    value={approveForm.referralBaseUrl}
                    onChange={(e) => setApproveForm((f) => ({ ...f, referralBaseUrl: e.target.value }))}
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" onClick={() => setApproveModalApp(null)} className="admin-btn admin-btn-secondary">İptal</button>
                <button type="submit" disabled={approveSubmitting} className="admin-btn admin-btn-primary">
                  {approveSubmitting ? "Onaylanıyor…" : "Onayla"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ——— Ekstre modal ——— */}
      {ledgerAppId && (
        <div className="admin-modal-backdrop" onClick={() => setLedgerAppId(null)}>
          <div className="admin-modal admin-modal-lg ref-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header ref-modal-header flex items-center justify-between">
              <span>Finans hareketleri (Ekstre)</span>
              <button type="button" onClick={() => setLedgerAppId(null)} className="admin-btn admin-btn-ghost admin-btn-icon">×</button>
            </div>
            <div className="admin-modal-body">
              <div className="ref-ledger-filters">
                <input type="date" className="admin-input ref-filter-input" value={ledgerFrom} onChange={(e) => setLedgerFrom(e.target.value)} placeholder="Başlangıç" />
                <input type="date" className="admin-input ref-filter-input" value={ledgerTo} onChange={(e) => setLedgerTo(e.target.value)} placeholder="Bitiş" />
                <button type="button" onClick={loadLedger} className="admin-btn admin-btn-primary">Yenile</button>
              </div>
              {ledgerLoading ? (
                <div className="admin-loading-center py-6"><Loader2 size={24} className="ref-spinner" /></div>
              ) : ledgerList.length === 0 ? (
                <p className="text-slate-500 text-sm py-4">Hareket yok.</p>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table ref-table">
                    <thead>
                      <tr>
                        <th>Tip</th>
                        <th>Tutar</th>
                        <th>Açıklama</th>
                        <th>Tarih</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledgerList.map((e) => (
                        <tr key={e.id}>
                          <td>{LEDGER_ENTRY_TYPE[e.entryType] ?? e.entryType}</td>
                          <td className={e.amount >= 0 ? "text-emerald-600 font-medium" : "text-red-600"}>
                            {e.amount >= 0 ? "+" : ""}{formatCurrency(e.amount)} {e.currency}
                          </td>
                          <td className="text-slate-600 text-sm">{e.description || "—"}</td>
                          <td className="text-slate-500 text-sm">{formatDate(e.createdAt)}</td>
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

      {/* ——— Kampanya create / edit / delete modals (mevcut yapı korunuyor, kısaltıldı) ——— */}
      {campaignModal === "create" && (
        <div className="admin-modal-backdrop" onClick={closeCampaignModal}>
          <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">Yeni Referans Kampanyası</div>
            <form onSubmit={handleCampaignCreate}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Kampanya adı</label>
                  <input type="text" className="admin-input" value={campaignForm.name} onChange={(e) => setCampaignForm((f) => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="camp-create-active" checked={campaignForm.isActive} onChange={(e) => setCampaignForm((f) => ({ ...f, isActive: e.target.checked }))} className="rounded border-slate-300 text-emerald-600" />
                  <label htmlFor="camp-create-active" className="text-sm">Aktif</label>
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group"><label className="admin-label">Başlangıç</label><input type="datetime-local" className="admin-input" value={campaignForm.startsAt} onChange={(e) => setCampaignForm((f) => ({ ...f, startsAt: e.target.value }))} /></div>
                  <div className="admin-form-group"><label className="admin-label">Bitiş</label><input type="datetime-local" className="admin-input" value={campaignForm.endsAt} onChange={(e) => setCampaignForm((f) => ({ ...f, endsAt: e.target.value }))} /></div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Davetli indirimi</p>
                  <div className="admin-form-row admin-form-row-2">
                    <div className="admin-form-group"><label className="admin-label admin-label-required">Tip</label><select className="admin-input" value={campaignForm.refereeDiscountType} onChange={(e) => setCampaignForm((f) => ({ ...f, refereeDiscountType: parseInt(e.target.value, 10) }))}>{DISCOUNT_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                    <div className="admin-form-group"><label className="admin-label admin-label-required">Değer</label><input type="number" step="0.01" min="0" className="admin-input" value={campaignForm.refereeDiscountValue} onChange={(e) => setCampaignForm((f) => ({ ...f, refereeDiscountValue: e.target.value }))} required /></div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Referans ödülü</p>
                  <div className="admin-form-row admin-form-row-2">
                    <div className="admin-form-group"><label className="admin-label">Tip</label><select className="admin-input" value={campaignForm.referrerRewardType} onChange={(e) => setCampaignForm((f) => ({ ...f, referrerRewardType: parseInt(e.target.value, 10) }))}>{REWARD_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                    <div className="admin-form-group"><label className="admin-label">Değer</label><input type="number" step="0.01" min="0" className="admin-input" value={campaignForm.referrerRewardValue} onChange={(e) => setCampaignForm((f) => ({ ...f, referrerRewardValue: e.target.value }))} /></div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Kullanım limitleri</p>
                  <div className="admin-form-row admin-form-row-3">
                    <div className="admin-form-group"><label className="admin-label">Toplam</label><input type="number" min="0" className="admin-input" value={campaignForm.maxRedemptionsTotal} onChange={(e) => setCampaignForm((f) => ({ ...f, maxRedemptionsTotal: e.target.value }))} /></div>
                    <div className="admin-form-group"><label className="admin-label">Kod başına</label><input type="number" min="0" className="admin-input" value={campaignForm.maxRedemptionsPerCode} onChange={(e) => setCampaignForm((f) => ({ ...f, maxRedemptionsPerCode: e.target.value }))} /></div>
                    <div className="admin-form-group"><label className="admin-label">Kullanıcı başına</label><input type="number" min="0" className="admin-input" value={campaignForm.maxRedemptionsPerUser} onChange={(e) => setCampaignForm((f) => ({ ...f, maxRedemptionsPerUser: e.target.value }))} /></div>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" onClick={closeCampaignModal} className="admin-btn admin-btn-secondary">İptal</button>
                <button type="submit" disabled={campaignSubmitting} className="admin-btn admin-btn-primary">{campaignSubmitting ? "Oluşturuluyor…" : "Oluştur"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {campaignModal === "edit" && selectedCampaign && (
        <div className="admin-modal-backdrop" onClick={closeCampaignModal}>
          <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">Kampanya düzenle</div>
            <form onSubmit={handleCampaignUpdate}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Kampanya adı</label>
                  <input type="text" className="admin-input" value={campaignForm.name} onChange={(e) => setCampaignForm((f) => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="camp-edit-active" checked={campaignForm.isActive} onChange={(e) => setCampaignForm((f) => ({ ...f, isActive: e.target.checked }))} className="rounded border-slate-300 text-emerald-600" />
                  <label htmlFor="camp-edit-active" className="text-sm">Aktif</label>
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group"><label className="admin-label">Başlangıç</label><input type="datetime-local" className="admin-input" value={campaignForm.startsAt} onChange={(e) => setCampaignForm((f) => ({ ...f, startsAt: e.target.value }))} /></div>
                  <div className="admin-form-group"><label className="admin-label">Bitiş</label><input type="datetime-local" className="admin-input" value={campaignForm.endsAt} onChange={(e) => setCampaignForm((f) => ({ ...f, endsAt: e.target.value }))} /></div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Davetli indirimi</p>
                  <div className="admin-form-row admin-form-row-2">
                    <div className="admin-form-group"><label className="admin-label">Tip</label><select className="admin-input" value={campaignForm.refereeDiscountType} onChange={(e) => setCampaignForm((f) => ({ ...f, refereeDiscountType: parseInt(e.target.value, 10) }))}>{DISCOUNT_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                    <div className="admin-form-group"><label className="admin-label">Değer</label><input type="number" step="0.01" min="0" className="admin-input" value={campaignForm.refereeDiscountValue} onChange={(e) => setCampaignForm((f) => ({ ...f, refereeDiscountValue: e.target.value }))} /></div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Referans ödülü</p>
                  <div className="admin-form-row admin-form-row-2">
                    <div className="admin-form-group"><label className="admin-label">Tip</label><select className="admin-input" value={campaignForm.referrerRewardType} onChange={(e) => setCampaignForm((f) => ({ ...f, referrerRewardType: parseInt(e.target.value, 10) }))}>{REWARD_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                    <div className="admin-form-group"><label className="admin-label">Değer</label><input type="number" step="0.01" min="0" className="admin-input" value={campaignForm.referrerRewardValue} onChange={(e) => setCampaignForm((f) => ({ ...f, referrerRewardValue: e.target.value }))} /></div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Kullanım limitleri</p>
                  <div className="admin-form-row admin-form-row-3">
                    <div className="admin-form-group"><label className="admin-label">Toplam</label><input type="number" min="0" className="admin-input" value={campaignForm.maxRedemptionsTotal} onChange={(e) => setCampaignForm((f) => ({ ...f, maxRedemptionsTotal: e.target.value }))} /></div>
                    <div className="admin-form-group"><label className="admin-label">Kod başına</label><input type="number" min="0" className="admin-input" value={campaignForm.maxRedemptionsPerCode} onChange={(e) => setCampaignForm((f) => ({ ...f, maxRedemptionsPerCode: e.target.value }))} /></div>
                    <div className="admin-form-group"><label className="admin-label">Kullanıcı başına</label><input type="number" min="0" className="admin-input" value={campaignForm.maxRedemptionsPerUser} onChange={(e) => setCampaignForm((f) => ({ ...f, maxRedemptionsPerUser: e.target.value }))} /></div>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" onClick={closeCampaignModal} className="admin-btn admin-btn-secondary">İptal</button>
                <button type="submit" disabled={campaignSubmitting} className="admin-btn admin-btn-primary">{campaignSubmitting ? "Güncelleniyor…" : "Güncelle"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {campaignModal === "delete" && selectedCampaign && (
        <div className="admin-modal-backdrop" onClick={closeCampaignModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">Kampanyayı sil</div>
            <div className="admin-modal-body">
              <p className="text-slate-600">&quot;{selectedCampaign.name}&quot; kampanyasını silmek istediğinize emin misiniz?</p>
            </div>
            <div className="admin-modal-footer">
              <button type="button" onClick={closeCampaignModal} className="admin-btn admin-btn-secondary">İptal</button>
              <button type="button" onClick={handleCampaignDelete} disabled={campaignSubmitting} className="admin-btn admin-btn-danger">{campaignSubmitting ? "İşleniyor…" : "Sil"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default References;
