// AdminCategoryScoreProfile — Puanlama Profili
// Doc: docs/API-Score-Endpoints-Rapor.md
import adminApi from "@/api/adminApi";

/**
 * Tüm puanlama profillerini listele. GET /AdminCategoryScoreProfile/all
 */
export const getAllScoreProfiles = async () => {
  const response = await adminApi.get("/AdminCategoryScoreProfile/all");
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Id ile tek profil getir. GET /AdminCategoryScoreProfile/{id}
 * @param {string} id Profil id (GUID)
 */
export const getScoreProfileById = async (id) => {
  const response = await adminApi.get(`/AdminCategoryScoreProfile/${id}`);
  return response.data;
};

/**
 * Alt kategoriye göre profilleri listele. GET /AdminCategoryScoreProfile/by-sub/{categorySubId}
 * @param {string} categorySubId Alt kategori id (GUID)
 */
export const getScoreProfilesBySubId = async (categorySubId) => {
  const response = await adminApi.get(
    `/AdminCategoryScoreProfile/by-sub/${categorySubId}`
  );
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Yeni puanlama profili oluştur. POST /AdminCategoryScoreProfile/create
 * @param {object} data categorySubId, code, name, isActive?, usesNegativeMarking?, negativeMarkingRule?, defaultStandardizationMethod?, cohortFilterJson?, roundingPolicyJson?, rulesJson?
 */
export const createScoreProfile = async (data) => {
  const response = await adminApi.post(
    "/AdminCategoryScoreProfile/create",
    {
      categorySubId: data.categorySubId,
      code: data.code?.trim() ?? "",
      name: data.name?.trim() ?? "",
      isActive: data.isActive !== false,
      usesNegativeMarking: data.usesNegativeMarking ?? true,
      negativeMarkingRule: data.negativeMarkingRule?.trim() ?? "4Y1D",
      defaultStandardizationMethod:
        data.defaultStandardizationMethod != null
          ? Number(data.defaultStandardizationMethod)
          : 1,
      cohortFilterJson: data.cohortFilterJson?.trim() ?? "{}",
      roundingPolicyJson: data.roundingPolicyJson?.trim() ?? "{}",
      rulesJson: data.rulesJson?.trim() ?? "{}",
    }
  );
  return response.data;
};

/**
 * Profil güncelle. PUT /AdminCategoryScoreProfile/{id}
 * @param {string} id Profil id (GUID)
 * @param {object} data Tüm alanlar opsiyonel (null = değişmez)
 */
export const updateScoreProfile = async (id, data) => {
  const payload = {};
  if (data.code != null) payload.code = data.code;
  if (data.name != null) payload.name = data.name;
  if (data.isActive !== undefined) payload.isActive = data.isActive;
  if (data.effectiveFrom !== undefined) payload.effectiveFrom = data.effectiveFrom;
  if (data.effectiveTo !== undefined) payload.effectiveTo = data.effectiveTo;
  if (data.usesNegativeMarking !== undefined)
    payload.usesNegativeMarking = data.usesNegativeMarking;
  if (data.negativeMarkingRule != null)
    payload.negativeMarkingRule = data.negativeMarkingRule;
  if (data.defaultStandardizationMethod != null)
    payload.defaultStandardizationMethod = Number(
      data.defaultStandardizationMethod
    );
  if (data.cohortFilterJson != null)
    payload.cohortFilterJson = data.cohortFilterJson;
  if (data.roundingPolicyJson != null)
    payload.roundingPolicyJson = data.roundingPolicyJson;
  if (data.rulesJson != null) payload.rulesJson = data.rulesJson;
  const response = await adminApi.put(
    `/AdminCategoryScoreProfile/${id}`,
    payload
  );
  return response.data;
};

/**
 * Profil sil. DELETE /AdminCategoryScoreProfile/{id}
 * @param {string} id Profil id (GUID)
 */
export const deleteScoreProfile = async (id) => {
  const response = await adminApi.delete(`/AdminCategoryScoreProfile/${id}`);
  return response.data;
};
