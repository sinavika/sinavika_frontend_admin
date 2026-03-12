// AdminCategoryScoringTypeRequirement — Puan türü minimum koşulları
// Doc: docs/api-categories-score-controllers-report.md
import adminApi from "@/api/adminApi";

const BASE = "/AdminCategoryScoringTypeRequirement";

/**
 * Tüm koşulları listele. GET /AdminCategoryScoringTypeRequirement/all
 */
export const getAllTypeRequirements = async () => {
  const response = await adminApi.get(`${BASE}/all`);
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Id ile tek koşul getir. GET /AdminCategoryScoringTypeRequirement/{id}
 */
export const getTypeRequirementById = async (id) => {
  const response = await adminApi.get(`${BASE}/${id}`);
  return response.data;
};

/**
 * Puan türüne göre koşulları listele. GET /AdminCategoryScoringTypeRequirement/by-score-type/{categoryScoreTypeId}
 */
export const getTypeRequirementsByScoreTypeId = async (categoryScoreTypeId) => {
  const response = await adminApi.get(
    `${BASE}/by-score-type/${categoryScoreTypeId}`
  );
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Yeni koşul oluştur. POST /AdminCategoryScoringTypeRequirement/create
 * Body: categoryScoreTypeId, requirementGroupCode, matchType (0=All, 1=Any), sourceCode, sourceName, minimumValue, orderIndex
 */
export const createTypeRequirement = async (data) => {
  const response = await adminApi.post(`${BASE}/create`, {
    categoryScoreTypeId: data.categoryScoreTypeId,
    requirementGroupCode: data.requirementGroupCode?.trim() ?? "",
    matchType: data.matchType != null ? Number(data.matchType) : 0,
    sourceCode: data.sourceCode?.trim() ?? "",
    sourceName: data.sourceName?.trim() ?? "",
    minimumValue: data.minimumValue != null ? Number(data.minimumValue) : 0,
    orderIndex: data.orderIndex != null ? Number(data.orderIndex) : 0,
  });
  return response.data;
};

/**
 * Koşul güncelle. PUT /AdminCategoryScoringTypeRequirement/{id}
 */
export const updateTypeRequirement = async (id, data) => {
  const payload = {};
  if (data.requirementGroupCode != null)
    payload.requirementGroupCode = data.requirementGroupCode;
  if (data.matchType != null) payload.matchType = Number(data.matchType);
  if (data.sourceCode != null) payload.sourceCode = data.sourceCode;
  if (data.sourceName != null) payload.sourceName = data.sourceName;
  if (data.minimumValue != null) payload.minimumValue = Number(data.minimumValue);
  if (data.orderIndex != null) payload.orderIndex = Number(data.orderIndex);
  const response = await adminApi.put(`${BASE}/${id}`, payload);
  return response.data;
};

/**
 * Koşul sil. DELETE /AdminCategoryScoringTypeRequirement/{id}
 */
export const deleteTypeRequirement = async (id) => {
  const response = await adminApi.delete(`${BASE}/${id}`);
  return response.data;
};
