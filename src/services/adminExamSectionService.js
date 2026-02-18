// AdminExamSectionController — api/AdminExamSection
// Sınav bölümleri: şablon atama (assign), güncelle (sıra/zorluk), kaldır (rapor: EXAM-LESSONSUB-QUESTIONS-TEMPLATE-API-FRONTEND.md)
import adminApi from "@/api/adminApi";

/**
 * Sınava ait tüm bölümleri listele. GET /AdminExamSection/by-exam/{examId}
 */
export const getSectionsByExamId = async (examId) => {
  const response = await adminApi.get(`/AdminExamSection/by-exam/${examId}`);
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Bölüm detayı. GET /AdminExamSection/{id}
 */
export const getSectionById = async (id) => {
  const response = await adminApi.get(`/AdminExamSection/${id}`);
  return response.data;
};

/**
 * Sınava soru şablonu ata (bölüm ekle). POST /AdminExamSection/exam/{examId}/assign
 * Body: categoriesSectionId, questionsTemplateId, orderIndex
 * @param {string} examId Sınav id (Guid)
 * @param {{ categoriesSectionId: string, questionsTemplateId: string, orderIndex: number }} data
 */
export const assignTemplateToExam = async (examId, data) => {
  const response = await adminApi.post(`/AdminExamSection/exam/${examId}/assign`, data);
  return response.data;
};

/**
 * Bölüm güncelle (sadece sıra ve zorluk dağılımı). PUT /AdminExamSection/{id}
 * Body: orderIndex?, difficultyMix?
 */
export const updateSection = async (id, data) => {
  const response = await adminApi.put(`/AdminExamSection/${id}`, data);
  return response.data;
};

/**
 * Bölümü kaldır. DELETE /AdminExamSection/{id}
 */
export const deleteSection = async (id) => {
  const response = await adminApi.delete(`/AdminExamSection/${id}`);
  return response.data;
};
