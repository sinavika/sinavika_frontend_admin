// AdminCategoryScoreType — Puan Türü (TYT, SAY, EA, SÖZ, P93 vb.)
// Doc: docs/API-Score-Endpoints-Rapor.md
import adminApi from "@/api/adminApi";

/**
 * Tüm puan türlerini listele. GET /AdminCategoryScoreType/all
 */
export const getAllScoreTypes = async () => {
  const response = await adminApi.get("/AdminCategoryScoreType/all");
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Id ile tek puan türü getir. GET /AdminCategoryScoreType/{id}
 * @param {string} id Puan türü id (GUID)
 */
export const getScoreTypeById = async (id) => {
  const response = await adminApi.get(`/AdminCategoryScoreType/${id}`);
  return response.data;
};

/**
 * Profile göre puan türlerini listele. GET /AdminCategoryScoreType/by-profile/{categoryScoringProfileId}
 * @param {string} categoryScoringProfileId Puanlama profili id (GUID)
 */
export const getScoreTypesByProfileId = async (categoryScoringProfileId) => {
  const response = await adminApi.get(
    `/AdminCategoryScoreType/by-profile/${categoryScoringProfileId}`
  );
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Yeni puan türü oluştur. POST /AdminCategoryScoreType/create
 * @param {object} data categoryScoringProfileId, code, name, baseScore, standardizationOverride?, usesOBP?, obpWeight?, rulesJson?
 */
export const createScoreType = async (data) => {
  const response = await adminApi.post("/AdminCategoryScoreType/create", {
    categoryScoringProfileId: data.categoryScoringProfileId,
    code: data.code?.trim() ?? "",
    name: data.name?.trim() ?? "",
    baseScore:
      data.baseScore != null ? Number(data.baseScore) : 100,
    standardizationOverride:
      data.standardizationOverride != null &&
      data.standardizationOverride !== ""
        ? Number(data.standardizationOverride)
        : null,
    usesOBP: data.usesOBP ?? true,
    obpWeight:
      data.obpWeight != null && data.obpWeight !== ""
        ? parseFloat(data.obpWeight)
        : 0.12,
    rulesJson: data.rulesJson?.trim() ?? "{}",
  });
  return response.data;
};

/**
 * Puan türü güncelle. PUT /AdminCategoryScoreType/{id}
 * @param {string} id Puan türü id (GUID)
 * @param {object} data code?, name?, baseScore?, standardizationOverride?, usesOBP?, obpWeight?, rulesJson?
 */
export const updateScoreType = async (id, data) => {
  const payload = {};
  if (data.code != null) payload.code = data.code;
  if (data.name != null) payload.name = data.name;
  if (data.baseScore != null) payload.baseScore = Number(data.baseScore);
  if (data.standardizationOverride !== undefined)
    payload.standardizationOverride =
      data.standardizationOverride === "" ||
      data.standardizationOverride == null
        ? null
        : Number(data.standardizationOverride);
  if (data.usesOBP !== undefined) payload.usesOBP = data.usesOBP;
  if (data.obpWeight != null && data.obpWeight !== "")
    payload.obpWeight = parseFloat(data.obpWeight);
  if (data.rulesJson != null) payload.rulesJson = data.rulesJson;
  const response = await adminApi.put(
    `/AdminCategoryScoreType/${id}`,
    payload
  );
  return response.data;
};

/**
 * Puan türü sil. DELETE /AdminCategoryScoreType/{id}
 * @param {string} id Puan türü id (GUID)
 */
export const deleteScoreType = async (id) => {
  const response = await adminApi.delete(`/AdminCategoryScoreType/${id}`);
  return response.data;
};
