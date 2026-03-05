// AdminStudentAuthManagement — Öğrenci yönetimi
// Doc: docs/AdminStudentAuthManagement-API-Rapor.md
import adminApi from "@/api/adminApi";

const BASE = "/AdminStudentAuthManagement";

/**
 * Tüm öğrencileri listele. GET /AdminStudentAuthManagement/students
 * @returns {Promise<Array<{ id: string, name: string, surname: string, email: string, phone: string|null }>>}
 */
export const getStudents = async () => {
  const response = await adminApi.get(`${BASE}/students`);
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Öğrenci detayı. GET /AdminStudentAuthManagement/students/{studentId}
 * @param {string} studentId Öğrenci ID (GUID)
 */
export const getStudentById = async (studentId) => {
  const response = await adminApi.get(`${BASE}/students/${studentId}`);
  return response.data;
};

/**
 * Öğrencinin aboneliklerini listele. GET /AdminStudentAuthManagement/students/{studentId}/subscriptions
 * @param {string} studentId Öğrenci ID (GUID)
 */
export const getStudentSubscriptions = async (studentId) => {
  const response = await adminApi.get(`${BASE}/students/${studentId}/subscriptions`);
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Öğrencinin akademik profilini getir. GET /AdminStudentAuthManagement/students/{studentId}/academic-profile
 * @param {string} studentId Öğrenci ID (GUID)
 */
export const getStudentAcademicProfile = async (studentId) => {
  const response = await adminApi.get(`${BASE}/students/${studentId}/academic-profile`);
  return response.data;
};

/**
 * Öğrencinin girdiği sınavları listele. GET /AdminStudentAuthManagement/students/{studentId}/exams
 * @param {string} studentId Öğrenci ID (GUID)
 */
export const getStudentExams = async (studentId) => {
  const response = await adminApi.get(`${BASE}/students/${studentId}/exams`);
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Öğrencinin belirtilen sınavdaki skor detayı. GET /AdminStudentAuthManagement/students/{studentId}/exams/{examId}/score
 * @param {string} studentId Öğrenci ID (GUID)
 * @param {string} examId Sınav ID (GUID)
 */
export const getStudentExamScore = async (studentId, examId) => {
  const response = await adminApi.get(
    `${BASE}/students/${studentId}/exams/${examId}/score`
  );
  return response.data;
};
