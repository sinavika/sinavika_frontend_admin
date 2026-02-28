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
 * Body (Şubat 2025): categoryFeatureId, lessonId, lessonMainId?, name, orderIndex, questionCount (lessonSubId, durationMinutes, min/max/targetQuestions, difficultyMix kaldırıldı)
 */
export const createCategorySection = async (data) => {
  const payload = {
    categoryFeatureId: data.categoryFeatureId ?? data.categorySubId,
    lessonId: data.lessonId,
    lessonMainId: data.lessonMainId ?? null,
    name: data.name?.trim() ?? "",
    orderIndex: Number(data.orderIndex) ?? 0,
    questionCount: Number(data.questionCount) ?? 0,
  };
  const response = await adminApi.post("/AdminCategorySection/create", payload);
  return response.data;
};

/**
 * Bölüm şablonu güncelle. PUT /AdminCategorySection/{id}
 * Body (Şubat 2025): lessonId?, lessonMainId?, name?, orderIndex?, questionCount? (kaldırılan alanlar gönderilmemeli)
 */
export const updateCategorySection = async (id, data) => {
  const payload = {};
  if (data.lessonId != null) payload.lessonId = data.lessonId;
  if (data.lessonMainId != null) payload.lessonMainId = data.lessonMainId;
  if (data.name != null) payload.name = data.name;
  if (data.orderIndex != null) payload.orderIndex = Number(data.orderIndex);
  if (data.questionCount != null) payload.questionCount = Number(data.questionCount);
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
