// AdminLessonController — api/AdminLesson
// Rapor (ADMIN-API-GIDIS-DONUS): create/update'te name, code, categorySubId, isActive
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
 * Yeni Lesson oluşturur. POST /AdminLesson/create
 * Rapor: name, code, categorySubId, isActive
 * @param {{ name: string, code: string, categorySubId: string, isActive?: boolean }} data
 */
export const createLesson = async (data) => {
  const response = await adminApi.post("/AdminLesson/create", {
    name: data.name?.trim() ?? "",
    code: data.code?.trim() ?? "",
    categorySubId: data.categorySubId,
    isActive: data.isActive !== false,
  });
  return response.data;
  
};

/**
 * Lesson günceller. PUT /AdminLesson/update?id={id}
 * Rapor: name, code, isActive
 * @param {{ name?: string, code?: string, isActive?: boolean }} data
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
