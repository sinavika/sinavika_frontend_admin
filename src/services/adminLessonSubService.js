// AdminLessonSubController — api/AdminLessonSub
// Ders alt konuları (LessonSub): LessonMain'e bağlı ünite/ana konular
import adminApi from "@/api/adminApi";

/**
 * Bir LessonMain'e ait tüm LessonSub listesi. GET /AdminLessonSub/by-lesson-main/{lessonMainId}
 * @param {string} lessonMainId LessonMain id (Guid)
 */
export const getLessonSubsByLessonMainId = async (lessonMainId) => {
  const response = await adminApi.get(
    `/AdminLessonSub/by-lesson-main/${lessonMainId}`
  );
  return Array.isArray(response.data) ? response.data : [];
};

/** @deprecated Yeni yapıda LessonMain üzerinden kullanın. Eski isim: getLessonSubsByLessonId */
export const getLessonSubsByLessonId = async (lessonMainId) => {
  return getLessonSubsByLessonMainId(lessonMainId);
};

/**
 * LessonSub detayı. GET /AdminLessonSub/{id}
 */
export const getLessonSubById = async (id) => {
  const response = await adminApi.get(`/AdminLessonSub/${id}`);
  return response.data;
};

/**
 * Belirtilen LessonMain'e yeni LessonSub ekler. POST /AdminLessonSub/{lessonMainId}/create
 * @param {string} lessonMainId LessonMain id (Guid)
 * @param {{ code: string, name: string, description?: string, orderIndex?: number, isActive?: boolean }} data
 */
export const createLessonSub = async (lessonMainId, data) => {
  const response = await adminApi.post(
    `/AdminLessonSub/${lessonMainId}/create`,
    {
      code: data.code?.trim() ?? "",
      name: data.name?.trim() ?? "",
      description: data.description?.trim() || undefined,
      orderIndex: Number(data.orderIndex) ?? 0,
      isActive: data.isActive !== false,
    }
  );
  return response.data;
};

/**
 * LessonSub günceller. PUT /AdminLessonSub/{id}
 */
export const updateLessonSub = async (id, data) => {
  const response = await adminApi.put(`/AdminLessonSub/${id}`, data);
  return response.data;
};

/**
 * LessonSub siler. DELETE /AdminLessonSub/{id}
 */
export const deleteLessonSub = async (id) => {
  const response = await adminApi.delete(`/AdminLessonSub/${id}`);
  return response.data;
};
