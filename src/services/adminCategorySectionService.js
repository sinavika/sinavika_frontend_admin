// AdminCategorySectionController — api/AdminCategorySection
// Doc: docs/Categories/01-Categories-Controllers-Tanitim.md, 02-Categories-API-Endpoints-Detay.md
import adminApi from "@/api/adminApi";

/**
 * Tüm bölüm şablonlarını listele. GET /AdminCategorySection/all
 */
export const getAllCategorySections = async () => {
  const response = await adminApi.get("/AdminCategorySection/all");
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Bölüm şablonu detayı. GET /AdminCategorySection/{id}
 */
export const getCategorySectionById = async (id) => {
  const response = await adminApi.get(`/AdminCategorySection/${id}`);
  return response.data;
};

/**
 * Alt kategoriye göre bölümleri listele. GET /AdminCategorySection/by-sub/{categorySubId}
 */
export const getSectionsBySubId = async (categorySubId) => {
  const response = await adminApi.get(`/AdminCategorySection/by-sub/${categorySubId}`);
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Bölüm şablonu oluştur. POST /AdminCategorySection/create
 * Body (doc 3.4): categorySubId, lessonId, lessonMainId?, lessonSubId?, name, orderIndex, questionCount, durationMinutes?, minQuestions, maxQuestions, targetQuestions?, difficultyMix?
 */
export const createCategorySection = async (data) => {
  const payload = {
    categorySubId: data.categorySubId,
    lessonId: data.lessonId,
    lessonMainId: data.lessonMainId ?? null,
    lessonSubId: data.lessonSubId ?? null,
    name: data.name?.trim() ?? "",
    orderIndex: Number(data.orderIndex) ?? 0,
    questionCount: Number(data.questionCount) ?? 0,
    durationMinutes: data.durationMinutes != null && data.durationMinutes !== "" ? Number(data.durationMinutes) : null,
    minQuestions: Number(data.minQuestions) ?? 0,
    maxQuestions: Number(data.maxQuestions) ?? 0,
    targetQuestions: data.targetQuestions != null && data.targetQuestions !== "" ? Number(data.targetQuestions) : null,
    difficultyMix: data.difficultyMix?.trim() || null,
  };
  const response = await adminApi.post("/AdminCategorySection/create", payload);
  return response.data;
};

/**
 * Bölüm şablonu güncelle. PUT /AdminCategorySection/{id}
 * Body (doc 3.5): tüm alanlar opsiyonel — lessonId, lessonMainId, lessonSubId, name, orderIndex, questionCount, durationMinutes, minQuestions, maxQuestions, targetQuestions, difficultyMix
 */
export const updateCategorySection = async (id, data) => {
  const payload = {};
  if (data.lessonId != null) payload.lessonId = data.lessonId;
  if (data.lessonMainId != null) payload.lessonMainId = data.lessonMainId;
  if (data.lessonSubId != null) payload.lessonSubId = data.lessonSubId;
  if (data.name != null) payload.name = data.name;
  if (data.orderIndex != null) payload.orderIndex = Number(data.orderIndex);
  if (data.questionCount != null) payload.questionCount = Number(data.questionCount);
  if (data.durationMinutes != null) payload.durationMinutes = Number(data.durationMinutes);
  if (data.minQuestions != null) payload.minQuestions = Number(data.minQuestions);
  if (data.maxQuestions != null) payload.maxQuestions = Number(data.maxQuestions);
  if (data.targetQuestions != null) payload.targetQuestions = Number(data.targetQuestions);
  if (data.difficultyMix != null) payload.difficultyMix = data.difficultyMix;
  const response = await adminApi.put(`/AdminCategorySection/${id}`, payload);
  return response.data;
};

/**
 * Bölüm şablonu sil. DELETE /AdminCategorySection/{id}
 */
export const deleteCategorySection = async (id) => {
  const response = await adminApi.delete(`/AdminCategorySection/${id}`);
  return response.data;
};
