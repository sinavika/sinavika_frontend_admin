// AdminExamSectionLessonQuotaController — api/AdminExamSectionLessonQuota
// Bölüm/ders kotaları CRUD
import adminApi from "@/api/adminApi";

/**
 * Sınava ait tüm kotaları listele. GET /AdminExamSectionLessonQuota/by-exam/{examId}
 */
export const getQuotasByExamId = async (examId) => {
  const response = await adminApi.get(`/AdminExamSectionLessonQuota/by-exam/${examId}`);
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Bölüme ait kotaları listele. GET /AdminExamSectionLessonQuota/by-section/{sectionId}
 */
export const getQuotasBySectionId = async (sectionId) => {
  const response = await adminApi.get(`/AdminExamSectionLessonQuota/by-section/${sectionId}`);
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Kota detayı. GET /AdminExamSectionLessonQuota/{id}
 */
export const getQuotaById = async (id) => {
  const response = await adminApi.get(`/AdminExamSectionLessonQuota/${id}`);
  return response.data;
};

/**
 * Kota oluştur. POST /AdminExamSectionLessonQuota/exam/{examId}?sectionId={sectionId}
 */
export const createQuota = async (examId, data, sectionId = null) => {
  const config = sectionId ? { params: { sectionId } } : {};
  const response = await adminApi.post(`/AdminExamSectionLessonQuota/exam/${examId}`, data, config);
  return response.data;
};

/**
 * Kota güncelle. PUT /AdminExamSectionLessonQuota/{id}
 */
export const updateQuota = async (id, data) => {
  const response = await adminApi.put(`/AdminExamSectionLessonQuota/${id}`, data);
  return response.data;
};

/**
 * Kota sil. DELETE /AdminExamSectionLessonQuota/{id}
 */
export const deleteQuota = async (id) => {
  const response = await adminApi.delete(`/AdminExamSectionLessonQuota/${id}`);
  return response.data;
};
