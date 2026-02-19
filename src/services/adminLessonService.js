// AdminLessonController — api/AdminLesson
// Lesson = kategoriye bağlı ders listesi konteyneri (code/name yok; categorySubId, orderIndex, isActive)
import adminApi from "@/api/adminApi";

/**
 * Tüm Lesson listesini döner. GET /AdminLesson/all
 */
export const getAllLessons = async () => {
  const response = await adminApi.get("/AdminLesson/all");
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Id ile tek Lesson detayı. GET /AdminLesson?id={id}
 */
export const getLessonById = async (id) => {
  const response = await adminApi.get("/AdminLesson", { params: { id } });
  return response.data;
};

/**
 * Yeni Lesson oluşturur (alt kategoriye bağlı liste konteyneri). POST /AdminLesson/create
 * @param {{ categorySubId: string, orderIndex?: number, isActive?: boolean }} data
 */
export const createLesson = async (data) => {
  const response = await adminApi.post("/AdminLesson/create", {
    categorySubId: data.categorySubId,
    orderIndex: Number(data.orderIndex) ?? 0,
    isActive: data.isActive !== false,
  });
  return response.data;
};

/**
 * Lesson günceller. PUT /AdminLesson/update?id={id}
 * @param {{ orderIndex?: number, isActive?: boolean }} data
 */
export const updateLesson = async (id, data) => {
  const response = await adminApi.put("/AdminLesson/update", data, {
    params: { id },
  });
  return response.data;
};

/**
 * Lesson'ı pasif yapar (soft delete). DELETE /AdminLesson/delete?id={id}
 */
export const deleteLesson = async (id) => {
  const response = await adminApi.delete("/AdminLesson/delete", {
    params: { id },
  });
  return response.data;
};
