// AdminQuestionBookletController — api/AdminQuestionBooklet
// Doc: docs/FRONTEND-API-DEGISIKLIK-RAPORU.md — kitapçık oluştur, soru ekle/güncelle/kaldır, sınava ata
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
 * Body: questionsTemplateId, lessonId, name?, orderIndex, examId?
 * Response: QuestionBookletDto (id, code, examId, ...)
 */
export const createBooklet = async (data) => {
  const response = await adminApi.post("/AdminQuestionBooklet", {
    questionsTemplateId: data.questionsTemplateId,
    lessonId: data.lessonId,
    name: data.name ?? null,
    orderIndex: Number(data.orderIndex) ?? 0,
    examId: data.examId ?? null,
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

/**
 * Kitapçığı sınava ata. PUT /AdminQuestionBooklet/{bookletId}/assign-exam/{examId}
 */
export const assignBookletToExam = async (bookletId, examId) => {
  const response = await adminApi.put(
    `/AdminQuestionBooklet/${bookletId}/assign-exam/${examId}`
  );
  return response.data;
};
