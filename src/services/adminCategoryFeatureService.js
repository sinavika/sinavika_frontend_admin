// AdminCategoryFeatureController — api/AdminCategoryFeature
// Doc: docs/Categories/01-Categories-Controllers-Tanitim.md, 02-Categories-API-Endpoints-Detay.md
import adminApi from "@/api/adminApi";

/**
 * Tüm kategori özelliklerini listele. GET /AdminCategoryFeature/all
 */
export const getAllCategoryFeatures = async () => {
  const response = await adminApi.get("/AdminCategoryFeature/all");
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Özellik detayı. GET /AdminCategoryFeature/{id}
 */
export const getCategoryFeatureById = async (id) => {
  const response = await adminApi.get(`/AdminCategoryFeature/${id}`);
  return response.data;
};

/**
 * Alt kategoriye göre özellik getir. GET /AdminCategoryFeature/by-sub/{categorySubId}
 */
export const getFeatureBySubId = async (categorySubId) => {
  const response = await adminApi.get(`/AdminCategoryFeature/by-sub/${categorySubId}`);
  return response.data;
};

/**
 * Kategori özelliği oluştur. POST /AdminCategoryFeature/create
 * Body: categorySubId (Guid), defaultQuestionCount?, defaultDurationMinutes?, defaultQuestionOptionCount?, usesNegativeMarking? (varsayılan false), negativeMarkingRule?
 */
export const createCategoryFeature = async (data) => {
  const response = await adminApi.post("/AdminCategoryFeature/create", {
    categorySubId: data.categorySubId,
    defaultQuestionCount: data.defaultQuestionCount ?? 40,
    defaultDurationMinutes: data.defaultDurationMinutes ?? 120,
    defaultQuestionOptionCount: data.defaultQuestionOptionCount ?? 5,
    usesNegativeMarking: data.usesNegativeMarking === true,
    negativeMarkingRule: data.negativeMarkingRule ?? null,
  });
  return response.data;
};

/**
 * Kategori özelliği güncelle. PUT /AdminCategoryFeature/{id}
 */
export const updateCategoryFeature = async (id, data) => {
  const response = await adminApi.put(`/AdminCategoryFeature/${id}`, data);
  return response.data;
};

/**
 * Kategori özelliği sil. DELETE /AdminCategoryFeature/{id}
 */
export const deleteCategoryFeature = async (id) => {
  const response = await adminApi.delete(`/AdminCategoryFeature/${id}`);
  return response.data;
};
