// AdminLessonMainController — api/AdminLessonMain
// Ders içeriği (LessonMain): bir Lesson altındaki dersler (Matematik, Fizik vb.)
import adminApi from "@/api/adminApi";
import { getAllLessons } from "@/services/adminLessonService";

/**
 * Bir Lesson'a ait tüm LessonMain listesi. GET /AdminLessonMain/by-lesson/{lessonId}
 */
export const getLessonMainsByLessonId = async (lessonId) => {
  const response = await adminApi.get(
    `/AdminLessonMain/by-lesson/${lessonId}`
  );
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Id ile tek LessonMain detayı. GET /AdminLessonMain/{id}
 */
export const getLessonMainById = async (id) => {
  const response = await adminApi.get(`/AdminLessonMain/${id}`);
  return response.data;
};

/**
 * Ders listesine yeni ders içeriği (LessonMain) ekle. POST /AdminLessonMain/{lessonId}/create
 * Body: code, name, description, orderIndex, isActive
 */
export const createLessonMain = async (lessonId, data) => {
  const response = await adminApi.post(
    `/AdminLessonMain/${lessonId}/create`,
    {
      code: data.code?.trim() ?? "",
      name: data.name?.trim() ?? "",
      description: data.description?.trim() || null,
      orderIndex: Number(data.orderIndex) ?? 0,
      isActive: data.isActive !== false,
    }
  );
  return response.data;
};

/**
 * LessonMain günceller. PUT /AdminLessonMain/{id}
 */
export const updateLessonMain = async (id, data) => {
  const response = await adminApi.put(`/AdminLessonMain/${id}`, data);
  return response.data;
};

/**
 * LessonMain siler. DELETE /AdminLessonMain/{id}
 */
export const deleteLessonMain = async (id) => {
  const response = await adminApi.delete(`/AdminLessonMain/${id}`);
  return response.data;
};

/**
 * Tüm LessonMain'leri döner (tüm Lesson'lar üzerinden). Dropdown vb. için kullanılır.
 */
export const getAllLessonMains = async () => {
  try {
    const lessons = await getAllLessons();
    const mains = await Promise.all(
      lessons.map((l) => getLessonMainsByLessonId(l.id))
    );
    return mains.flat();
  } catch {
    return [];
  }
};
