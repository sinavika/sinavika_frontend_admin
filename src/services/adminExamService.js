import adminApi from "@/api/adminApi";

/**
 * AdminExamController — Raporda: api/AdminExam
 * Status: 0=Draft, 1=Scheduled, 2=Published, 3=InProgress, 4=Closed, 5=Ended, 6=Archived
 */

/**
 * Tüm sınavları listele. GET /AdminExam/all
 */
export const getAllExams = async () => {
  const response = await adminApi.get("/AdminExam/all");
  return response.data;
};

/**
 * Duruma göre sınavlar. GET /AdminExam/by-status/{status}
 */
export const getExamsByStatus = async (status) => {
  const response = await adminApi.get(`/AdminExam/by-status/${status}`);
  return response.data;
};

/**
 * Sınav detayı. GET /AdminExam?id={id}
 */
export const getExamById = async (id) => {
  const response = await adminApi.get("/AdminExam", { params: { id } });
  return response.data;
};

/**
 * Sınav oluştur. POST /AdminExam/create
 * Body: title, description, instructions, durationMinutes, graceSeconds, publisherId, categoryId, categorySubId, startsAt, endsAt, accessDurationDays, participationQuota, isAdaptive, blueprint { totalQuestionCount, negativeMarkingRule }, sections [ { name, orderIndex, durationMinutes, questionCountTarget, quotas } ]
 */
export const createExam = async (data) => {
  const response = await adminApi.post("/AdminExam/create", data);
  return response.data;
};

/**
 * Sınav güncelle. PUT /AdminExam/update?id={id}
 * Body (opsiyonel): title, description, status, blueprint, sections
 */
export const updateExam = async (id, data) => {
  const response = await adminApi.put("/AdminExam/update", data, {
    params: { id },
  });
  return response.data;
};

/**
 * Sınav sil. DELETE /AdminExam/delete?id={id}
 */
export const deleteExam = async (id) => {
  const response = await adminApi.delete("/AdminExam/delete", {
    params: { id },
  });
  return response.data;
};

/**
 * Sınavı yayınla. POST /AdminExam/publish?id={id}
 */
export const publishExam = async (id) => {
  const response = await adminApi.post("/AdminExam/publish", null, {
    params: { id },
  });
  return response.data;
};

/**
 * Sınavı yayından kaldır. POST /AdminExam/unpublish?id={id}
 */
export const unpublishExam = async (id) => {
  const response = await adminApi.post("/AdminExam/unpublish", null, {
    params: { id },
  });
  return response.data;
};

/**
 * Sınavı kilitle. POST /AdminExam/lock?id={id}
 */
export const lockExam = async (id) => {
  const response = await adminApi.post("/AdminExam/lock", null, {
    params: { id },
  });
  return response.data;
};

/**
 * Sınav tarihlerini güncelle. PUT /AdminExam/schedule?id={id}
 * Body: startsAt, endsAt, status
 */
export const scheduleExam = async (id, data) => {
  const response = await adminApi.put("/AdminExam/schedule", data, {
    params: { id },
  });
  return response.data;
};

/**
 * Sınav durumunu değiştir. PUT /AdminExam/status/{id}
 * Body: { status: number } — 0=Draft, 1=Scheduled, 2=Published, 3=InProgress, 4=Closed, 5=Ended, 6=Archived
 */
export const setExamStatus = async (id, status) => {
  const response = await adminApi.put(`/AdminExam/status/${id}`, { status });
  return response.data;
};
