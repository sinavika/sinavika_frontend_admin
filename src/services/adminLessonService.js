import adminApi from "@/api/adminApi";

/**
 * Tüm dersleri listele. GET /AdminLesson/all
 */
export const getAllLessons = async () => {
  const response = await adminApi.get("/AdminLesson/all");
  return response.data;
};

/**
 * Ders detayı. GET /AdminLesson?id={id}
 */
export const getLessonById = async (id) => {
  const response = await adminApi.get("/AdminLesson", { params: { id } });
  return response.data;
};

/**
 * Ders oluştur. POST /AdminLesson/create
 */
export const createLesson = async (data) => {
  const response = await adminApi.post("/AdminLesson/create", data);
  return response.data;
};

/**
 * Ders güncelle. PUT /AdminLesson/update?id={id}
 */
export const updateLesson = async (id, data) => {
  const response = await adminApi.put("/AdminLesson/update", data, {
    params: { id },
  });
  return response.data;
};

/**
 * Ders sil (pasif yapma). DELETE /AdminLesson/delete?id={id}
 */
export const deleteLesson = async (id) => {
  const response = await adminApi.delete("/AdminLesson/delete", {
    params: { id },
  });
  return response.data;
};
