// AdminCategorySectionController — api/AdminCategorySection
// Alt kategori bölüm şablonları (ders bazlı soru sayısı)
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
 * Body: categorySubId, lessonId, lessonSubId?, name, orderIndex, questionCount, durationMinutes?, minQuestions, maxQuestions, targetQuestions?, difficultyMix?
 */
export const createCategorySection = async (data) => {
  const payload = {
    categorySubId: data.categorySubId,
    lessonId: data.lessonId,
    name: data.name?.trim() ?? "",
    orderIndex: Number(data.orderIndex) ?? 0,
    questionCount: Number(data.questionCount) ?? 0,
    minQuestions: Number(data.minQuestions) ?? 0,
    maxQuestions: Number(data.maxQuestions) ?? 0,
  };
  if (data.lessonSubId != null && data.lessonSubId !== "") payload.lessonSubId = data.lessonSubId;
  if (data.durationMinutes != null && data.durationMinutes !== "") payload.durationMinutes = Number(data.durationMinutes);
  if (data.targetQuestions != null && data.targetQuestions !== "") payload.targetQuestions = Number(data.targetQuestions);
  if (data.difficultyMix != null && data.difficultyMix !== "") payload.difficultyMix = data.difficultyMix;
  const response = await adminApi.post("/AdminCategorySection/create", payload);
  return response.data;
};

/**
 * Bölüm şablonu güncelle. PUT /AdminCategorySection/{id}
 * Rapor 5.5: body lessonId, name, orderIndex, questionCount, durationMinutes.
 */
export const updateCategorySection = async (id, data) => {
  const payload = {
    lessonId: data.lessonId,
    name: data.name,
    orderIndex: data.orderIndex,
    questionCount: data.questionCount,
    durationMinutes: data.durationMinutes,
  };
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
