// AdminLessonSubController — api/AdminLessonSub
// Ders alt konuları: lessonId ile listele, CRUD (rapor: EXAM-LESSONSUB-QUESTIONS-TEMPLATE-API-FRONTEND.md)
import adminApi from "@/api/adminApi";

/**
 * Ana derse göre alt konuları listele. GET /AdminLessonSub/by-lesson/{lessonId}
 * @param {string} lessonId Ders id (Guid)
 */
export const getLessonSubsByLessonId = async (lessonId) => {
  const response = await adminApi.get(`/AdminLessonSub/by-lesson/${lessonId}`);
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Alt konu detayı. GET /AdminLessonSub/{id}
 * @param {string} id Alt konu id (Guid)
 */
export const getLessonSubById = async (id) => {
  const response = await adminApi.get(`/AdminLessonSub/${id}`);
  return response.data;
};

/**
 * Alt konu oluştur. POST /AdminLessonSub/{lessonId}/create
 * @param {string} lessonId Ders id (Guid)
 * @param {{ code: string, name: string, description?: string, orderIndex?: number, isActive?: boolean }} data
 */
export const createLessonSub = async (lessonId, data) => {
  const response = await adminApi.post(`/AdminLessonSub/${lessonId}/create`, {
    code: data.code?.trim() ?? "",
    name: data.name?.trim() ?? "",
    description: data.description ?? null,
    orderIndex: Number(data.orderIndex) ?? 0,
    isActive: data.isActive !== false,
  });
  return response.data;
};

/**
 * Alt konu güncelle. PUT /AdminLessonSub/{id}
 * @param {string} id Alt konu id (Guid)
 * @param {{ code?: string, name?: string, description?: string, orderIndex?: number, isActive?: boolean }} data
 */
export const updateLessonSub = async (id, data) => {
  const response = await adminApi.put(`/AdminLessonSub/${id}`, data);
  return response.data;
};

/**
 * Alt konu sil. DELETE /AdminLessonSub/{id}
 * @param {string} id Alt konu id (Guid)
 */
export const deleteLessonSub = async (id) => {
  const response = await adminApi.delete(`/AdminLessonSub/${id}`);
  return response.data;
};
