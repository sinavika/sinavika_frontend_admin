// AdminReferenceController — api/AdminReference
// Başvurular (applications) ve Kampanyalar (campaigns) endpoint'leri
import adminApi from "@/api/adminApi";

// ——— Başvurular (Applications) ———

/**
 * Tüm referans başvurularını listele. GET /AdminReference/applications
 * @returns {Promise<Array>} ReferenceApplicationDto[]
 */
export const getApplications = async () => {
  const response = await adminApi.get("/AdminReference/applications");
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Başvuruyu onayla; kod atanır, e-posta gider. POST /AdminReference/applications/{id}/approve
 * @param {string} id Başvuru id (Guid)
 * @returns {Promise<Object>} Onaylanmış ReferenceApplicationDto
 */
export const approveApplication = async (id) => {
  const response = await adminApi.post(`/AdminReference/applications/${id}/approve`);
  return response.data;
};

// ——— Kampanyalar (Campaigns) ———

/**
 * Tüm reference kampanyalarını listele. GET /AdminReference/campaigns/all
 * @returns {Promise<Array>} ReferenceCampaignDto[]
 */
export const getAllCampaigns = async () => {
  const response = await adminApi.get("/AdminReference/campaigns/all");
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Kampanya detayı. GET /AdminReference/campaigns?id={id}
 * @param {string} id Kampanya id (Guid)
 * @returns {Promise<Object>} ReferenceCampaignDto
 */
export const getCampaignById = async (id) => {
  const response = await adminApi.get("/AdminReference/campaigns", { params: { id } });
  return response.data;
};

/**
 * Yeni kampanya oluştur. POST /AdminReference/campaigns/create
 * @param {Object} data ReferenceCampaignCreateDto
 * @returns {Promise<{ message: string }>}
 */
export const createCampaign = async (data) => {
  const response = await adminApi.post("/AdminReference/campaigns/create", data);
  return response.data;
};

/**
 * Kampanya güncelle. PUT /AdminReference/campaigns/update?id={id}
 * @param {string} id Kampanya id (Guid)
 * @param {Object} data Güncellenecek alanlar (opsiyonel)
 * @returns {Promise<{ message: string }>}
 */
export const updateCampaign = async (id, data) => {
  const response = await adminApi.put("/AdminReference/campaigns/update", data, {
    params: { id },
  });
  return response.data;
};

/**
 * Kampanyayı pasif yap (soft delete). DELETE /AdminReference/campaigns/delete?id={id}
 * @param {string} id Kampanya id (Guid)
 * @returns {Promise<{ message: string }>}
 */
export const deleteCampaign = async (id) => {
  const response = await adminApi.delete("/AdminReference/campaigns/delete", {
    params: { id },
  });
  return response.data;
};
