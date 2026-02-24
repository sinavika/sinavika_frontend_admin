// AdminQuestionBookletController — api/AdminQuestionBooklet
// Doc: docs/FRONTEND-API-DEGISIKLIK-RAPORU.md — CategorySection tabanlı; examId kaldırıldı
import adminApi from "@/api/adminApi";

/**
 * Kitapçık satırı detayı. GET /AdminQuestionBooklet/{id}
 */
export const getBookletById = async (id) => {
  const response = await adminApi.get(`/AdminQuestionBooklet/${id}`);
  return response.data;
};

/**
 * Code ile kitapçık getir. GET /AdminQuestionBooklet/by-code/{code}
 */
export const getBookletByCode = async (code) => {
  const response = await adminApi.get(
    `/AdminQuestionBooklet/by-code/${encodeURIComponent(code)}`
  );
  return response.data;
};

/**
 * Kitapçık oluştur. POST /AdminQuestionBooklet
 * Body: categorySectionId (zorunlu), name? (opsiyonel), orderIndex (zorunlu).
 * Backend LessonId'yi CategorySection'dan alır. examId kaldırıldı.
 * Response: QuestionBookletDto (id, code, categorySectionId, categorySectionName, ...)
 */
export const createBooklet = async (data) => {
  const response = await adminApi.post("/AdminQuestionBooklet", {
    categorySectionId: data.categorySectionId,
    name: data.name?.trim() || null,
    orderIndex: Number(data.orderIndex) ?? 0,
  });
  return response.data;
};

/**
 * Kitapçığa soru ekle. POST /AdminQuestionBooklet/{bookletId}/question
 * Body: stem, options, correctOptionKey, lessonSubId?, publisherId?
 */
export const addQuestionToBooklet = async (bookletId, data) => {
  const response = await adminApi.post(
    `/AdminQuestionBooklet/${bookletId}/question`,
    {
      stem: data.stem,
      options: data.options,
      correctOptionKey: data.correctOptionKey,
      lessonSubId: data.lessonSubId ?? null,
      publisherId: data.publisherId ?? null,
    }
  );
  return response.data;
};

/**
 * Kitapçıktaki soruyu güncelle. PUT /AdminQuestionBooklet/{bookletId}/question
 */
export const updateQuestionInBooklet = async (bookletId, data) => {
  const response = await adminApi.put(
    `/AdminQuestionBooklet/${bookletId}/question`,
    {
      stem: data.stem,
      options: data.options,
      correctOptionKey: data.correctOptionKey,
      lessonSubId: data.lessonSubId ?? null,
      publisherId: data.publisherId ?? null,
    }
  );
  return response.data;
};

/**
 * Kitapçıktan sadece soruyu kaldır (kitapçık satırı kalır). DELETE /AdminQuestionBooklet/{bookletId}/question
 */
export const removeQuestionFromBooklet = async (bookletId) => {
  await adminApi.delete(`/AdminQuestionBooklet/${bookletId}/question`);
};

/**
 * Kitapçık satırını sil (ilişkili soru da silinir). DELETE /AdminQuestionBooklet/{id}
 */
export const deleteBookletItem = async (id) => {
  await adminApi.delete(`/AdminQuestionBooklet/${id}`);
};
