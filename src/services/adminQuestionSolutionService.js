// Solution1 Admin QuestionSolution API
// Route: api/AdminQuestionSolution
// Type: 0=ExplanationText, 1=Video, 2=Pdf, 3=Link
import adminApi from "@/api/adminApi";

/**
 * Tüm soru çözümlerini listele. GET /AdminQuestionSolution/all
 */
export const getAllQuestionSolutions = async () => {
  const response = await adminApi.get("/AdminQuestionSolution/all");
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Soruya göre çözümleri listele. GET /AdminQuestionSolution/by-question/{questionId}
 */
export const getSolutionsByQuestionId = async (questionId) => {
  const response = await adminApi.get(
    `/AdminQuestionSolution/by-question/${questionId}`
  );
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Soru çözümü detayı. GET /AdminQuestionSolution/{id}
 */
export const getQuestionSolutionById = async (id) => {
  const response = await adminApi.get(`/AdminQuestionSolution/${id}`);
  return response.data;
};

/**
 * Soru çözümü oluştur. POST /AdminQuestionSolution/create
 * @param {{ questionId: string, type: number, title?: string, contentText?: string, url?: string, orderIndex?: number, isActive?: boolean }} data
 */
export const createQuestionSolution = async (data) => {
  const response = await adminApi.post("/AdminQuestionSolution/create", {
    questionId: data.questionId,
    type: data.type ?? 0,
    title: data.title ?? null,
    contentText: data.contentText ?? null,
    url: data.url ?? null,
    orderIndex: data.orderIndex ?? 0,
    isActive: data.isActive !== false,
  });
  return response.data;
};

/**
 * Soru çözümü güncelle. PUT /AdminQuestionSolution/{id}
 * @param {string} id Soru çözümü id (GUID)
 * @param {{ type?: number, title?: string, contentText?: string, url?: string, orderIndex?: number, isActive?: boolean }} data
 */
export const updateQuestionSolution = async (id, data) => {
  const response = await adminApi.put(`/AdminQuestionSolution/${id}`, data);
  return response.data;
};

/**
 * Soru çözümü sil. DELETE /AdminQuestionSolution/{id}
 */
export const deleteQuestionSolution = async (id) => {
  const response = await adminApi.delete(`/AdminQuestionSolution/${id}`);
  return response.data;
};
