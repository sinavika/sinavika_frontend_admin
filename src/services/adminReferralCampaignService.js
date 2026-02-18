import adminApi from "@/api/adminApi";

/**
 * Tüm referral kampanyalarını listele. GET /AdminReferralCampaign/all
 */
export const getAllReferralCampaigns = async () => {
  const response = await adminApi.get("/AdminReferralCampaign/all");
  return response.data;
};

/**
 * Kampanya detayı. GET /AdminReferralCampaign?id={id}
 */
export const getReferralCampaignById = async (id) => {
  const response = await adminApi.get("/AdminReferralCampaign", {
    params: { id },
  });
  return response.data;
};

/**
 * Kampanya oluştur. POST /AdminReferralCampaign/create
 */
export const createReferralCampaign = async (data) => {
  const response = await adminApi.post(
    "/AdminReferralCampaign/create",
    data
  );
  return response.data;
};

/**
 * Kampanya güncelle. PUT /AdminReferralCampaign/update?id={id}
 */
export const updateReferralCampaign = async (id, data) => {
  const response = await adminApi.put(
    "/AdminReferralCampaign/update",
    data,
    { params: { id } }
  );
  return response.data;
};

/**
 * Kampanya sil (pasif yapma). DELETE /AdminReferralCampaign/delete?id={id}
 */
export const deleteReferralCampaign = async (id) => {
  const response = await adminApi.delete(
    "/AdminReferralCampaign/delete",
    { params: { id } }
  );
  return response.data;
};
