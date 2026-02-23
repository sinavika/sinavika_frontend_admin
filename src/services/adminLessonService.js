// AdminLessonController — api/AdminLesson
// Rapor: API-LESSONS-CONTROLLERS-FRONTEND-RAPORU.md
// Ders listesi (Lesson): categorySubId, name, orderIndex, isActive — code yok
import adminApi from "@/api/adminApi";

/**
 * Tüm ders listelerini getir. GET /AdminLesson/all
 */
export const getAllLessons = async () => {
  const response = await adminApi.get("/AdminLesson/all");
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Alt kategoriye göre ders listelerini getir. GET /AdminLesson/by-category-sub/{categorySubId}
 */
export const getLessonsByCategorySubId = async (categorySubId) => {
  const response = await adminApi.get(
    `/AdminLesson/by-category-sub/${categorySubId}`
  );
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Id ile ders listesi detayı. GET /AdminLesson?id={id}
 */
export const getLessonById = async (id) => {
  const response = await adminApi.get("/AdminLesson", { params: { id } });
  return response.data;
};

/**
 * Ders listesi oluştur. POST /AdminLesson/create
 * Body: categorySubId, name, orderIndex, isActive
 */
export const createLesson = async (data) => {
  const response = await adminApi.post("/AdminLesson/create", {
    categorySubId: data.categorySubId,
    name: data.name?.trim() ?? "",
    orderIndex: Number(data.orderIndex) ?? 0,
    isActive: data.isActive !== false,
  });
  return response.data;
};

/**
 * Ders listesini güncelle. PUT /AdminLesson/update?id={id}
 * Body: name, orderIndex, isActive (opsiyonel)
 */
export const updateLesson = async (id, data) => {
  const response = await adminApi.put("/AdminLesson/update", data, {
    params: { id },
  });
  return response.data;
};

/**
 * Ders listesini pasif yap (soft delete). DELETE /AdminLesson/delete?id={id}
 */
export const deleteLesson = async (id) => {
  const response = await adminApi.delete("/AdminLesson/delete", {
    params: { id },
  });
  return response.data;
};
