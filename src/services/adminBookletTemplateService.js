// AdminQuestionBookletTemplateController — api/AdminQuestionBookletTemplate
// Rapor: API-QUESTIONS-CONTROLLERS-FRONTEND-RAPORU.md
import adminApi from "@/api/adminApi";

/**
 * Tüm şablonları listele. GET /AdminQuestionBookletTemplate
 */
export const getAllBookletTemplates = async () => {
  const response = await adminApi.get("/AdminQuestionBookletTemplate");
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Id ile şablon getir. GET /AdminQuestionBookletTemplate/{id}
 */
export const getBookletTemplateById = async (id) => {
  const response = await adminApi.get(`/AdminQuestionBookletTemplate/${id}`);
  return response.data;
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
 * Şablon setine göre satırları listele. GET /AdminQuestionBookletTemplate/by-template-set/{questionsTemplateId}
 */
export const getBookletTemplatesByTemplateSetId = async (questionsTemplateId) => {
  const response = await adminApi.get(
    `/AdminQuestionBookletTemplate/by-template-set/${questionsTemplateId}`
  );
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Yeni kitapçık şablonu oluştur. POST /AdminQuestionBookletTemplate
 * questionsTemplateId: null ise yeni set; dolu ise mevcut sete bölüm eklenir.
 * @param {{
 *   code: string,
 *   name: string,
 *   description?: string,
 *   difficultyMix?: string,
 *   categoryId: string,
 *   categorySubId: string,
 *   categorySectionId: string,
 *   targetQuestionCount: number,
 *   isActive?: boolean,
 *   orderIndex?: number,
 *   questionsTemplateId?: string | null
 * }} data
 */
export const createBookletTemplate = async (data) => {
  const response = await adminApi.post("/AdminQuestionBookletTemplate", {
    code: data.code?.trim() ?? "",
    name: data.name?.trim() ?? "",
    description: data.description?.trim() || null,
    difficultyMix: data.difficultyMix?.trim() || null,
    categoryId: data.categoryId || null,
    categorySubId: data.categorySubId || null,
    categorySectionId: data.categorySectionId || null,
    targetQuestionCount: Number(data.targetQuestionCount) ?? 0,
    isActive: data.isActive !== false,
    orderIndex: Number(data.orderIndex) ?? 0,
    questionsTemplateId: data.questionsTemplateId || null,
  });
  return response.data;
};

/**
 * Şablon güncelle. PUT /AdminQuestionBookletTemplate/{id}
 * Tüm alanlar opsiyonel.
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
  await adminApi.delete(`/AdminQuestionBookletTemplate/${id}`);
};
