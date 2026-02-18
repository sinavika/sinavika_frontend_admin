// Solution1 Admin QuestionsTemplate API
// Route: api/AdminQuestionsTemplate
// Raporda: min 10, max 20 soru; şablona soru ekleme / şablondan soru çıkarma.
import adminApi from "@/api/adminApi";

/**
 * Tüm şablonları listele (Items ile). GET /AdminQuestionsTemplate/all
 */
export const getAllQuestionsTemplates = async () => {
  const response = await adminApi.get("/AdminQuestionsTemplate/all");
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Şablon detayı (Items ile). GET /AdminQuestionsTemplate/{id}
 */
export const getQuestionsTemplateById = async (id) => {
  const response = await adminApi.get(`/AdminQuestionsTemplate/${id}`);
  return response.data;
};

/**
 * Alt kategoriye göre soru şablonlarını listele (sınava bölüm atarken kullanılır). GET /AdminQuestionsTemplate/by-category-sub/{categorySubId}
 * @param {string} categorySubId Alt kategori id (Guid)
 */
export const getTemplatesByCategorySubId = async (categorySubId) => {
  const response = await adminApi.get(`/AdminQuestionsTemplate/by-category-sub/${categorySubId}`);
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Şablon oluştur. POST /AdminQuestionsTemplate/create
 * totalQuestionCount ve items toplamı 10–20 arası olmalı.
 * @param {{ code: string, name: string, description?: string, categorySubId: string, totalQuestionCount: number, isActive?: boolean, orderIndex?: number, items: Array<{ lessonId?: string, lessonSubId?: string, targetQuestionCount?: number, difficultyMix?: string, orderIndex: number, questionId?: string }> }} data
 */
export const createQuestionsTemplate = async (data) => {
  const response = await adminApi.post("/AdminQuestionsTemplate/create", {
    code: data.code?.trim() ?? "",
    name: data.name?.trim() ?? "",
    description: data.description ?? null,
    categorySubId: data.categorySubId ?? null,
    totalQuestionCount: data.totalQuestionCount ?? 0,
    isActive: data.isActive !== false,
    orderIndex: data.orderIndex ?? 0,
    items: Array.isArray(data.items) ? data.items : [],
  });
  return response.data;
};

/**
 * Şablon güncelle. PUT /AdminQuestionsTemplate/{id}
 * items verilirse tüm maddeler bu liste ile değiştirilir; toplam soru 10–20 arası olmalı.
 * @param {string} id Şablon id (GUID)
 * @param {{ code?: string, name?: string, description?: string, categorySubId?: string, totalQuestionCount?: number, isActive?: boolean, orderIndex?: number, items?: Array<{ id?: string, lessonId?: string, lessonSubId?: string, targetQuestionCount?: number, difficultyMix?: string, orderIndex: number, questionId?: string }> }} data
 */
export const updateQuestionsTemplate = async (id, data) => {
  const response = await adminApi.put(`/AdminQuestionsTemplate/${id}`, data);
  return response.data;
};

/**
 * Şablon sil. DELETE /AdminQuestionsTemplate/{id}
 */
export const deleteQuestionsTemplate = async (id) => {
  const response = await adminApi.delete(`/AdminQuestionsTemplate/${id}`);
  return response.data;
};

/**
 * Şablona soru ekle. POST /AdminQuestionsTemplate/{id}/questions
 * Toplam soru sayısı en fazla 20 olabilir.
 * @param {string} templateId Şablon id (GUID)
 * @param {string} questionId Soru id (GUID)
 */
export const addQuestionToTemplate = async (templateId, questionId) => {
  const response = await adminApi.post(`/AdminQuestionsTemplate/${templateId}/questions`, { questionId });
  return response.data;
};

/**
 * Şablondan madde (soru) çıkar. DELETE /AdminQuestionsTemplate/{id}/items/{itemId}
 * En az 10 soru kalmalı.
 * @param {string} templateId Şablon id (GUID)
 * @param {string} itemId Silinecek madde id (GUID)
 */
export const removeItemFromTemplate = async (templateId, itemId) => {
  const response = await adminApi.delete(`/AdminQuestionsTemplate/${templateId}/items/${itemId}`);
  return response.data;
};
