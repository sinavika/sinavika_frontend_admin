// AdminQuestionController — api/AdminQuestion
// Soru havuzu CRUD (Rapor 12)
import adminApi from "@/api/adminApi";

/**
 * Tüm soruları listele. GET /AdminQuestion/all
 */
export const getAllQuestions = async () => {
  const response = await adminApi.get("/AdminQuestion/all");
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Derse (Lesson) göre sorular. GET /AdminQuestion/by-lesson/{lessonId}
 * @param {string} lessonId Lesson id (Guid) — raporda ders = Lesson
 */
export const getQuestionsByLessonId = async (lessonId) => {
  const response = await adminApi.get(
    `/AdminQuestion/by-lesson/${lessonId}`
  );
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Alt derse (LessonSub) göre sorular. GET /AdminQuestion/by-lesson-sub/{lessonSubId}
 */
export const getQuestionsByLessonSubId = async (lessonSubId) => {
  const response = await adminApi.get(
    `/AdminQuestion/by-lesson-sub/${lessonSubId}`
  );
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Yayınevine göre sorular. GET /AdminQuestion/by-publisher/{publisherId}
 */
export const getQuestionsByPublisherId = async (publisherId) => {
  const response = await adminApi.get(
    `/AdminQuestion/by-publisher/${publisherId}`
  );
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Soru oluştur. POST /AdminQuestion/create
 * Rapor 12.5: stem, lessonId, lessonSubId?, publisherId?, options[], correctOptionKey
 * @param {{ stem: string, lessonId: string, lessonSubId?: string, publisherId?: string, options: Array<{ key: string, text: string }>, correctOptionKey: string }} data
 */
export const createQuestion = async (data) => {
  const response = await adminApi.post("/AdminQuestion/create", {
    stem: data.stem?.trim() ?? "",
    lessonId: data.lessonId ?? null,
    lessonSubId: data.lessonSubId ?? null,
    publisherId: data.publisherId ?? null,
    options: Array.isArray(data.options) ? data.options : [],
    correctOptionKey: data.correctOptionKey?.trim() ?? "",
  });
  return response.data;
};

/**
 * Soru detayı (şıklar dahil). GET /AdminQuestion?id={id}&includeOptions=true
 */
export const getQuestionById = async (id, includeOptions = true) => {
  const response = await adminApi.get("/AdminQuestion", {
    params: { id, includeOptions: includeOptions ? "true" : undefined },
  });
  return response.data;
};

/**
 * Soru güncelle. PUT /AdminQuestion/update?id={id}
 * Body: QuestionUpdateDto (stem, lessonId, lessonSubId?, publisherId?, options?, correctOptionKey?)
 */
export const updateQuestion = async (id, data) => {
  const response = await adminApi.put("/AdminQuestion/update", data, {
    params: { id },
  });
  return response.data;
};

/**
 * Soru sil. DELETE /AdminQuestion/delete?id={id}
 */
export const deleteQuestion = async (id) => {
  const response = await adminApi.delete("/AdminQuestion/delete", {
    params: { id },
  });
  return response.data;
};
