// AdminCategoryScoreTypeWeight — Puan türü–bölüm ağırlığı
// Doc: docs/API-Score-Endpoints-Rapor.md
// InputType: 0 = Net, 1 = StandardNet
import adminApi from "@/api/adminApi";

/**
 * Tüm puan türü ağırlıklarını listele. GET /AdminCategoryScoreTypeWeight/all
 */
export const getAllScoreTypeWeights = async () => {
  const response = await adminApi.get("/AdminCategoryScoreTypeWeight/all");
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Id ile tek ağırlık getir. GET /AdminCategoryScoreTypeWeight/{id}
 * @param {string} id Ağırlık id (GUID)
 */
export const getScoreTypeWeightById = async (id) => {
  const response = await adminApi.get(`/AdminCategoryScoreTypeWeight/${id}`);
  return response.data;
};

/**
 * Puan türüne göre ağırlıkları listele. GET /AdminCategoryScoreTypeWeight/by-score-type/{categoryScoreTypeId}
 * @param {string} categoryScoreTypeId Puan türü id (GUID)
 */
export const getScoreTypeWeightsByScoreTypeId = async (
  categoryScoreTypeId
) => {
  const response = await adminApi.get(
    `/AdminCategoryScoreTypeWeight/by-score-type/${categoryScoreTypeId}`
  );
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Yeni ağırlık oluştur. POST /AdminCategoryScoreTypeWeight/create
 * @param {object} data categoryScoreTypeId, categorySectionId, weight, inputType (0=Net, 1=StandardNet)
 */
export const createScoreTypeWeight = async (data) => {
  const response = await adminApi.post(
    "/AdminCategoryScoreTypeWeight/create",
    {
      categoryScoreTypeId: data.categoryScoreTypeId,
      categorySectionId: data.categorySectionId,
      weight: parseFloat(data.weight) ?? 0,
      inputType:
        data.inputType != null ? Number(data.inputType) : 1,
    }
  );
  return response.data;
};

/**
 * Ağırlık güncelle. PUT /AdminCategoryScoreTypeWeight/{id}
 * @param {string} id Ağırlık id (GUID)
 * @param {object} data weight?, inputType?
 */
export const updateScoreTypeWeight = async (id, data) => {
  const payload = {};
  if (data.weight != null) payload.weight = parseFloat(data.weight);
  if (data.inputType != null) payload.inputType = Number(data.inputType);
  const response = await adminApi.put(
    `/AdminCategoryScoreTypeWeight/${id}`,
    payload
  );
  return response.data;
};

/**
 * Ağırlık sil. DELETE /AdminCategoryScoreTypeWeight/{id}
 * @param {string} id Ağırlık id (GUID)
 */
export const deleteScoreTypeWeight = async (id) => {
  const response = await adminApi.delete(
    `/AdminCategoryScoreTypeWeight/${id}`
  );
  return response.data;
};
