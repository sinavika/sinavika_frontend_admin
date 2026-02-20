// AdminLessonMikroController — api/AdminLessonMikro
// Alt konunun alt başlıkları (Mikro konu): lessonSubId ile listele, CRUD (rapor: LESSONS-API-RAPORU.md)
import adminApi from "@/api/adminApi";

/**
 * Alt konuya göre mikro konuları listele. GET /AdminLessonMikro/by-lesson-sub/{lessonSubId}
 * @param {string} lessonSubId Alt konu id (Guid)
 */
export const getMikrosByLessonSubId = async (lessonSubId) => {
  const response = await adminApi.get(`/AdminLessonMikro/by-lesson-sub/${lessonSubId}`);
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Mikro konu detayı. GET /AdminLessonMikro/{id}
 * @param {string} id Mikro konu id (Guid)
 */
export const getLessonMikroById = async (id) => {
  const response = await adminApi.get(`/AdminLessonMikro/${id}`);
  return response.data;
};

/**
 * Mikro konu oluştur. POST /AdminLessonMikro/{lessonSubId}/create
 * Rapor: LessonMikroCreateDto (name, code, orderIndex, isActive).
 * @param {string} lessonSubId Alt konu id (Guid)
 * @param {{ code: string, name: string, orderIndex?: number, isActive?: boolean }} data
 */
export const createLessonMikro = async (lessonSubId, data) => {
  const response = await adminApi.post(`/AdminLessonMikro/${lessonSubId}/create`, {
    name: data.name?.trim() ?? "",
    code: data.code?.trim() ?? "",
    orderIndex: Number(data.orderIndex) ?? 0,
    isActive: data.isActive !== false,
  });
  return response.data;
};

/**
 * Mikro konu güncelle. PUT /AdminLessonMikro/{id}
 * @param {string} id Mikro konu id (Guid)
 * @param {{ code?: string, name?: string, description?: string, orderIndex?: number, isActive?: boolean }} data
 */
export const updateLessonMikro = async (id, data) => {
  const response = await adminApi.put(`/AdminLessonMikro/${id}`, data);
  return response.data;
};

/**
 * Mikro konu sil. DELETE /AdminLessonMikro/{id}
 * @param {string} id Mikro konu id (Guid)
 */
export const deleteLessonMikro = async (id) => {
  const response = await adminApi.delete(`/AdminLessonMikro/${id}`);
  return response.data;
};
