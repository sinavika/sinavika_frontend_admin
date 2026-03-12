// AdminCategoryScoringFormulaComponent — Puan türü formül bileşenleri
// Doc: docs/api-categories-score-controllers-report.md
import adminApi from "@/api/adminApi";

const BASE = "/AdminCategoryScoringFormulaComponent";

/**
 * Tüm formül bileşenlerini listele. GET /AdminCategoryScoringFormulaComponent/all
 */
export const getAllFormulaComponents = async () => {
  const response = await adminApi.get(`${BASE}/all`);
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Id ile tek bileşen getir. GET /AdminCategoryScoringFormulaComponent/{id}
 */
export const getFormulaComponentById = async (id) => {
  const response = await adminApi.get(`${BASE}/${id}`);
  return response.data;
};

/**
 * Puan türüne göre bileşenleri listele. GET /AdminCategoryScoringFormulaComponent/by-score-type/{categoryScoreTypeId}
 */
export const getFormulaComponentsByScoreTypeId = async (categoryScoreTypeId) => {
  const response = await adminApi.get(
    `${BASE}/by-score-type/${categoryScoreTypeId}`
  );
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Yeni formül bileşeni oluştur. POST /AdminCategoryScoringFormulaComponent/create
 * Body: categoryScoreTypeId, sourceCode, sourceName, weight, orderIndex
 */
export const createFormulaComponent = async (data) => {
  const response = await adminApi.post(`${BASE}/create`, {
    categoryScoreTypeId: data.categoryScoreTypeId,
    sourceCode: data.sourceCode?.trim() ?? "",
    sourceName: data.sourceName?.trim() ?? "",
    weight: data.weight != null ? Number(data.weight) : 0,
    orderIndex: data.orderIndex != null ? Number(data.orderIndex) : 0,
  });
  return response.data;
};

/**
 * Formül bileşeni güncelle. PUT /AdminCategoryScoringFormulaComponent/{id}
 */
export const updateFormulaComponent = async (id, data) => {
  const payload = {};
  if (data.sourceCode != null) payload.sourceCode = data.sourceCode;
  if (data.sourceName != null) payload.sourceName = data.sourceName;
  if (data.weight != null) payload.weight = Number(data.weight);
  if (data.orderIndex != null) payload.orderIndex = Number(data.orderIndex);
  const response = await adminApi.put(`${BASE}/${id}`, payload);
  return response.data;
};

/**
 * Formül bileşeni sil. DELETE /AdminCategoryScoringFormulaComponent/{id}
 */
export const deleteFormulaComponent = async (id) => {
  const response = await adminApi.delete(`${BASE}/${id}`);
  return response.data;
};
