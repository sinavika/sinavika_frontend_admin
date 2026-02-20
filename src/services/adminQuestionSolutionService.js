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
 * Rapor 13.4: questionId, solutionType ("Text"|"Video"|"Pdf"|"Link"), content, videoUrl?, pdfUrl?, externalLink?
 * Eski alanlar (type 0=Text,1=Video,2=Pdf,3=Link; contentText; url) rapor alanlarına eşlenir.
 */
export const createQuestionSolution = async (data) => {
  const typeToSolutionType = ["Text", "Video", "Pdf", "Link"];
  const t = data.type ?? 0;
  const solutionType = data.solutionType ?? typeToSolutionType[t] ?? "Text";
  const content = data.content ?? data.contentText ?? null;
  const videoUrl = data.videoUrl ?? (t === 1 ? data.url : null) ?? null;
  const pdfUrl = data.pdfUrl ?? (t === 2 ? data.url : null) ?? null;
  const externalLink = data.externalLink ?? (t === 3 ? data.url : null) ?? null;

  const response = await adminApi.post("/AdminQuestionSolution/create", {
    questionId: data.questionId,
    solutionType,
    content: content ?? null,
    videoUrl: videoUrl ?? null,
    pdfUrl: pdfUrl ?? null,
    externalLink: externalLink ?? null,
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
