// AdminLessonController — Tek controller, hiyerarşik route'lar
// Doc: docs/admin-lessons-api-refactor-report.md
// Base: api/AdminLesson — Lesson → LessonMain → LessonSub → LessonMikro
import adminApi from "@/api/adminApi";

const BASE = "/AdminLesson";

// ——— 1) Lesson ———
/** Tüm ders listesi (parametre yok). GET /AdminLesson */
export const getAllLessons = async () => {
  const response = await adminApi.get(BASE);
  return Array.isArray(response.data) ? response.data : [];
};

/** Yeni ders. POST /AdminLesson — body: categorySubId, name, orderIndex, isActive */
export const createLesson = async (data) => {
  const response = await adminApi.post(BASE, {
    categorySubId: data.categorySubId,
    name: data.name?.trim() ?? "",
    orderIndex: Number(data.orderIndex) ?? 0,
    isActive: data.isActive !== false,
  });
  return response.data;
};

/** Ders güncelle. PUT /AdminLesson/{lessonId} */
export const updateLesson = async (id, data) => {
  const response = await adminApi.put(`${BASE}/${id}`, data);
  return response.data;
};

/** Ders pasif yap (soft delete). DELETE /AdminLesson/{lessonId} */
export const deleteLesson = async (id) => {
  const response = await adminApi.delete(`${BASE}/${id}`);
  return response.data;
};

/** Tek ders detayı. GET /AdminLesson/{lessonId} */
export const getLessonById = async (lessonId) => {
  const response = await adminApi.get(`${BASE}/${lessonId}`);
  return response.data;
};

// ——— 2) LessonMain ———
/** Derse ait ders içerikleri. GET /AdminLesson/{lessonId}/mains */
export const getLessonMainsByLessonId = async (lessonId) => {
  const response = await adminApi.get(`${BASE}/${lessonId}/mains`);
  return Array.isArray(response.data) ? response.data : [];
};

/** Yeni ders içeriği. POST /AdminLesson/{lessonId}/mains */
export const createLessonMain = async (lessonId, data) => {
  const response = await adminApi.post(`${BASE}/${lessonId}/mains`, {
    code: data.code?.trim() ?? "",
    name: data.name?.trim() ?? "",
    description: data.description?.trim() || null,
    orderIndex: Number(data.orderIndex) ?? 0,
    isActive: data.isActive !== false,
  });
  return response.data;
};

/** Ders içeriği güncelle. PUT /AdminLesson/{lessonId}/mains/{mainId} */
export const updateLessonMain = async (lessonId, mainId, data) => {
  const response = await adminApi.put(`${BASE}/${lessonId}/mains/${mainId}`, data);
  return response.data;
};

/** Ders içeriği sil. DELETE /AdminLesson/{lessonId}/mains/{mainId} */
export const deleteLessonMain = async (lessonId, mainId) => {
  const response = await adminApi.delete(`${BASE}/${lessonId}/mains/${mainId}`);
  return response.data;
};

/** Tüm ders içeriklerini döner (dropdown vb.). İstemci: tüm lesson’lar üzerinden mains çekip flatten. */
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

// ——— 3) LessonSub ———
/** Ders içeriğine ait alt konular. GET /AdminLesson/{lessonId}/mains/{mainId}/subs */
export const getLessonSubsByLessonMainId = async (lessonId, mainId) => {
  const response = await adminApi.get(`${BASE}/${lessonId}/mains/${mainId}/subs`);
  return Array.isArray(response.data) ? response.data : [];
};

/** Yeni alt konu. POST /AdminLesson/{lessonId}/mains/{mainId}/subs */
export const createLessonSub = async (lessonId, mainId, data) => {
  const response = await adminApi.post(`${BASE}/${lessonId}/mains/${mainId}/subs`, {
    code: data.code?.trim() ?? "",
    name: data.name?.trim() ?? "",
    description: data.description?.trim() || null,
    orderIndex: Number(data.orderIndex) ?? 0,
    isActive: data.isActive !== false,
  });
  return response.data;
};

/** Alt konu güncelle. PUT /AdminLesson/.../subs/{subId} */
export const updateLessonSub = async (lessonId, mainId, subId, data) => {
  const response = await adminApi.put(
    `${BASE}/${lessonId}/mains/${mainId}/subs/${subId}`,
    data
  );
  return response.data;
};

/** Alt konu sil. DELETE /AdminLesson/.../subs/{subId} */
export const deleteLessonSub = async (lessonId, mainId, subId) => {
  const response = await adminApi.delete(
    `${BASE}/${lessonId}/mains/${mainId}/subs/${subId}`
  );
  return response.data;
};

// ——— 4) LessonMikro ———
/** Alt konuya ait mikro konular. GET /AdminLesson/.../subs/{subId}/mikros */
export const getMikrosByLessonSubId = async (lessonId, mainId, subId) => {
  const response = await adminApi.get(
    `${BASE}/${lessonId}/mains/${mainId}/subs/${subId}/mikros`
  );
  return Array.isArray(response.data) ? response.data : [];
};

/** Yeni mikro konu. POST /AdminLesson/.../subs/{subId}/mikros */
export const createLessonMikro = async (lessonId, mainId, subId, data) => {
  const response = await adminApi.post(
    `${BASE}/${lessonId}/mains/${mainId}/subs/${subId}/mikros`,
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

/** Mikro konu güncelle. PUT /AdminLesson/.../mikros/{mikroId} */
export const updateLessonMikro = async (lessonId, mainId, subId, mikroId, data) => {
  const response = await adminApi.put(
    `${BASE}/${lessonId}/mains/${mainId}/subs/${subId}/mikros/${mikroId}`,
    data
  );
  return response.data;
};

/** Mikro konu sil. DELETE /AdminLesson/.../mikros/{mikroId} */
export const deleteLessonMikro = async (lessonId, mainId, subId, mikroId) => {
  const response = await adminApi.delete(
    `${BASE}/${lessonId}/mains/${mainId}/subs/${subId}/mikros/${mikroId}`
  );
  return response.data;
};
