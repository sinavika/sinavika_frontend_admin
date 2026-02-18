import adminApi from "@/api/adminApi";

/**
 * AdminQuestionController — Raporda: api/AdminQuestion
 * Zorluk: 0=Easy, 1=Medium, 2=Hard
 */

/**
 * Tüm soruları listele. GET /AdminQuestion/all
 */
export const getAllQuestions = async () => {
  const response = await adminApi.get("/AdminQuestion/all");
  return response.data;
};

/**
 * Derse göre sorular. GET /AdminQuestion/by-lesson/{lessonId}
 */
export const getQuestionsByLesson = async (lessonId) => {
  const response = await adminApi.get(`/AdminQuestion/by-lesson/${lessonId}`);
  return response.data;
};

/**
 * Alt derse göre sorular. GET /AdminQuestion/by-lesson-sub/{lessonSubId}
 */
export const getQuestionsByLessonSub = async (lessonSubId) => {
  const response = await adminApi.get(
    `/AdminQuestion/by-lesson-sub/${lessonSubId}`
  );
  return response.data;
};

/**
 * Yayınevine göre sorular. GET /AdminQuestion/by-publisher/{publisherId}
 */
export const getQuestionsByPublisher = async (publisherId) => {
  const response = await adminApi.get(
    `/AdminQuestion/by-publisher/${publisherId}`
  );
  return response.data;
};

/**
 * Soru detayı. GET /AdminQuestion?id={id}&includeOptions={bool}
 */
export const getQuestionById = async (id, includeOptions = true) => {
  const response = await adminApi.get("/AdminQuestion", {
    params: { id, includeOptions },
  });
  return response.data;
};

/**
 * Soru oluştur. POST /AdminQuestion/create
 * Body: stem, difficultyLevel, publisherId, lessonSubId, options [ { optionKey, text } ], correctOptionKey
 */
export const createQuestion = async (data) => {
  const response = await adminApi.post("/AdminQuestion/create", data);
  return response.data;
};

/**
 * Soru güncelle. PUT /AdminQuestion/update?id={id}
 * Body (opsiyonel): stem, difficultyLevel, options, correctOptionKey
 */
export const updateQuestion = async (id, data) => {
  const response = await adminApi.put("/AdminQuestion/update", data, {
    params: { id },
  });
  return response.data;
};

/**
 * Soru sil (kalıcı). DELETE /AdminQuestion/delete?id={id}
 */
export const deleteQuestion = async (id) => {
  const response = await adminApi.delete("/AdminQuestion/delete", {
    params: { id },
  });
  return response.data;
};
