// AdminQuestionBookletTemplateController — api/AdminQuestionBookletTemplate
// Booklet şablonları CRUD (CategorySub, CategorySection ile)
import adminApi from "@/api/adminApi";

/**
 * Tüm booklet şablonlarını listele. GET /AdminQuestionBookletTemplate/all
 */
export const getAllBookletTemplates = async () => {
  const response = await adminApi.get("/AdminQuestionBookletTemplate/all");
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Alt kategoriye göre şablonları listele. GET /AdminQuestionBookletTemplate/by-category-sub/{categorySubId}
 */
export const getBookletTemplatesByCategorySubId = async (categorySubId) => {
  const response = await adminApi.get(
    `/AdminQuestionBookletTemplate/by-category-sub/${categorySubId}`
  );
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Id ile şablon detayı. GET /AdminQuestionBookletTemplate/{id}
 */
export const getBookletTemplateById = async (id) => {
  const response = await adminApi.get(`/AdminQuestionBookletTemplate/${id}`);
  return response.data;
};

/**
 * Yeni booklet şablonu oluştur. POST /AdminQuestionBookletTemplate/create
 * @param {{ code: string, name: string, description?: string, difficultyMix?: string, categoryId: string, categorySubId: string, categorySectionId: string, targetQuestionCount: number, isActive?: boolean, orderIndex?: number }} data
 */
export const createBookletTemplate = async (data) => {
  const response = await adminApi.post(
    "/AdminQuestionBookletTemplate/create",
    {
      code: data.code?.trim() ?? "",
      name: data.name?.trim() ?? "",
      description: data.description?.trim() || undefined,
      difficultyMix: data.difficultyMix?.trim() || undefined,
      categoryId: data.categoryId,
      categorySubId: data.categorySubId,
      categorySectionId: data.categorySectionId,
      targetQuestionCount: Number(data.targetQuestionCount) ?? 0,
      isActive: data.isActive !== false,
      orderIndex: Number(data.orderIndex) ?? 0,
    }
  );
  return response.data;
};

/**
 * Şablon güncelle. PUT /AdminQuestionBookletTemplate/{id}
 * @param {string} id
 * @param {{ code?: string, name?: string, description?: string, difficultyMix?: string, categoryId?: string, categorySubId?: string, categorySectionId?: string, targetQuestionCount?: number, totalQuestionCount?: number, isActive?: boolean, orderIndex?: number }} data
 */
export const updateBookletTemplate = async (id, data) => {
  const response = await adminApi.put(
    `/AdminQuestionBookletTemplate/${id}`,
    data
  );
  return response.data;
};

/**
 * Şablon sil. DELETE /AdminQuestionBookletTemplate/{id}
 */
export const deleteBookletTemplate = async (id) => {
  const response = await adminApi.delete(
    `/AdminQuestionBookletTemplate/${id}`
  );
  return response.data;
};
