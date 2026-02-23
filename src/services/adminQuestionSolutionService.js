// AdminQuestionSolutionController — api/AdminQuestionSolution
// Doc: docs/02-Questions-API-Endpoints-Detay.md — Type: 0=ExplanationText, 1=Video, 2=Pdf, 3=Link
import adminApi from "@/api/adminApi";

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
 * Yeni soru çözümü oluştur. POST /AdminQuestionSolution
 * Body: questionId, type (0-3), title, contentText, url, orderIndex, isActive
 */
export const createQuestionSolution = async (data) => {
  const response = await adminApi.post("/AdminQuestionSolution", {
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
 */
export const updateQuestionSolution = async (id, data) => {
  const response = await adminApi.put(`/AdminQuestionSolution/${id}`, data);
  return response.data;
};

/**
 * Soru çözümü sil. DELETE /AdminQuestionSolution/{id}
 */
export const deleteQuestionSolution = async (id) => {
  await adminApi.delete(`/AdminQuestionSolution/${id}`);
};
