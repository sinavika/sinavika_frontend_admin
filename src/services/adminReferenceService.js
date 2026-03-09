// AdminReferenceController — api/AdminReference
// Doc: docs/admin-reference-controller-api.md
import adminApi from "@/api/adminApi";

const BASE = "/AdminReference";

// ——— Başvurular (Applications) ———

/**
 * Tüm referans başvurularını listele. GET /AdminReference/applications
 */
export const getApplications = async () => {
  const response = await adminApi.get(`${BASE}/applications`);
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Başvuruyu onayla. POST /AdminReference/applications/{id}/approve
 * @param {string} id Başvuru id (Guid)
 * @param {Object} [body] Opsiyonel: { commissionRatePercent?: number, referralBaseUrl?: string }
 */
export const approveApplication = async (id, body = null) => {
  const response = await adminApi.post(
    `${BASE}/applications/${id}/approve`,
    body && (body.commissionRatePercent != null || body.referralBaseUrl != null)
      ? {
          commissionRatePercent: body.commissionRatePercent,
          referralBaseUrl: body.referralBaseUrl || undefined,
        }
      : undefined
  );
  return response.data;
};

/**
 * Başvuruya göre ekstre (ledger). GET /AdminReference/applications/{id}/ledger
 * @param {string} applicationId ReferenceApplication Id (Guid)
 * @param {Object} [params] { fromUtc?: string (ISO), toUtc?: string (ISO) }
 */
export const getApplicationLedger = async (applicationId, params = {}) => {
  const response = await adminApi.get(
    `${BASE}/applications/${applicationId}/ledger`,
    { params: { fromUtc: params.fromUtc, toUtc: params.toUtc } }
  );
  return Array.isArray(response.data) ? response.data : [];
};

// ——— Referans Kullanıcıları (Reference Users) ———

/**
 * Tüm referans kullanıcılarını listele. GET /AdminReference/reference-users
 */
export const getReferenceUsers = async () => {
  const response = await adminApi.get(`${BASE}/reference-users`);
  return Array.isArray(response.data) ? response.data : [];
};

// ——— Kampanyalar (Campaigns) ———

/**
 * Tüm kampanyaları listele. GET /AdminReference/campaigns/all
 */
export const getAllCampaigns = async () => {
  const response = await adminApi.get(`${BASE}/campaigns/all`);
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Kampanya detayı. GET /AdminReference/campaigns?id={id}
 */
export const getCampaignById = async (id) => {
  const response = await adminApi.get(`${BASE}/campaigns`, { params: { id } });
  return response.data;
};

/**
 * Kampanya oluştur. POST /AdminReference/campaigns/create
 */
export const createCampaign = async (data) => {
  const response = await adminApi.post(`${BASE}/campaigns/create`, data);
  return response.data;
};

/**
 * Kampanya güncelle. PUT /AdminReference/campaigns/update?id={id}
 */
export const updateCampaign = async (id, data) => {
  const response = await adminApi.put(`${BASE}/campaigns/update`, data, {
    params: { id },
  });
  return response.data;
};

/**
 * Kampanya sil. DELETE /AdminReference/campaigns/delete?id={id}
 */
export const deleteCampaign = async (id) => {
  const response = await adminApi.delete(`${BASE}/campaigns/delete`, {
    params: { id },
  });
  return response.data;
};

// ——— Komisyonlar (Commissions) ———

/**
 * Komisyon listesi. GET /AdminReference/commissions
 * @param {Object} [params] { applicationId?: Guid, fromUtc?: string, toUtc?: string, status?: number }
 */
export const getCommissions = async (params = {}) => {
  const response = await adminApi.get(`${BASE}/commissions`, {
    params: {
      applicationId: params.applicationId,
      fromUtc: params.fromUtc,
      toUtc: params.toUtc,
      status: params.status,
    },
  });
  return Array.isArray(response.data) ? response.data : [];
};

// ——— Hakedişler (Payouts) ———

/**
 * Hakediş listesi. GET /AdminReference/payouts
 * @param {Object} [params] { applicationId?: Guid, status?: number }
 */
export const getPayouts = async (params = {}) => {
  const response = await adminApi.get(`${BASE}/payouts`, {
    params: {
      applicationId: params.applicationId,
      status: params.status,
    },
  });
  return Array.isArray(response.data) ? response.data : [];
};
