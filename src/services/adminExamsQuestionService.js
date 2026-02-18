// AdminExamsQuestionController — api/AdminExamsQuestion
// Sınav–soru ataması CRUD
import adminApi from "@/api/adminApi";

/**
 * Sınava ait tüm soru atamalarını listele. GET /AdminExamsQuestion/by-exam/{examId}
 */
export const getAssignmentsByExamId = async (examId) => {
  const response = await adminApi.get(`/AdminExamsQuestion/by-exam/${examId}`);
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Bölüme ait soru atamalarını listele. GET /AdminExamsQuestion/by-section/{sectionId}
 */
export const getAssignmentsBySectionId = async (sectionId) => {
  const response = await adminApi.get(`/AdminExamsQuestion/by-section/${sectionId}`);
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Atama detayı. GET /AdminExamsQuestion/{id}
 */
export const getAssignmentById = async (id) => {
  const response = await adminApi.get(`/AdminExamsQuestion/${id}`);
  return response.data;
};

/**
 * Sınava soru ata. POST /AdminExamsQuestion
 * Body: examId, questionId, sectionId, orderIndex
 */
export const createAssignment = async (data) => {
  const response = await adminApi.post("/AdminExamsQuestion", data);
  return response.data;
};

/**
 * Atama güncelle (bölüm/sıra). PUT /AdminExamsQuestion/{id}
 * Body: sectionId?, orderIndex?
 */
export const updateAssignment = async (id, data) => {
  const response = await adminApi.put(`/AdminExamsQuestion/${id}`, data);
  return response.data;
};

/**
 * Atama sil (soru sınavdan çıkar). DELETE /AdminExamsQuestion/{id}
 */
export const deleteAssignment = async (id) => {
  const response = await adminApi.delete(`/AdminExamsQuestion/${id}`);
  return response.data;
};
