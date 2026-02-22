// AdminQuestionBookletController — api/AdminQuestionBooklet
// Rapor: API-QUESTIONS-CONTROLLERS-FRONTEND-RAPORU.md — kitapçık satırları, soru ekleme (içerikle)
import adminApi from "@/api/adminApi";

/**
 * Sınava ait kitapçık satırlarını listele. GET /AdminQuestionBooklet/by-exam/{examId}
 */
export const getBookletsByExamId = async (examId) => {
  const response = await adminApi.get(
    `/AdminQuestionBooklet/by-exam/${examId}`
  );
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Kitapçık satırı detayı. GET /AdminQuestionBooklet/{id}
 */
export const getBookletById = async (id) => {
  const response = await adminApi.get(`/AdminQuestionBooklet/${id}`);
  return response.data;
};

/**
 * Kitapçık bölümüne yeni soru ekle (içerikle). POST /AdminQuestionBooklet/add-question
 * stem, options, correctOptionKey zorunlu; examSectionId veya questionsTemplateId belirtilmeli.
 * @param {{
 *   examId: string,
 *   examSectionId?: string,
 *   lessonId: string,
 *   name: string,
 *   orderIndex?: number,
 *   questionsTemplateId?: string,
 *   questionTemplateItemId?: string,
 *   stem: string,
 *   options: Array<{ optionKey: string, text: string, orderIndex: number }>,
 *   correctOptionKey: string,
 *   lessonSubId?: string,
 *   publisherId?: string
 * }} data
 */
export const addQuestionToBooklet = async (data) => {
  const response = await adminApi.post(
    "/AdminQuestionBooklet/add-question",
    data
  );
  return response.data;
};

/**
 * Kitapçıktan soru satırını kaldır. DELETE /AdminQuestionBooklet/{id}
 */
export const deleteBookletItem = async (id) => {
  await adminApi.delete(`/AdminQuestionBooklet/${id}`);
};
