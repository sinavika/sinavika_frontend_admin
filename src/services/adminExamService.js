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
 * AdminExamCreateDto: title, description?, instructions?, bookletCode (zorunlu), startsAt?, endsAt?, accessDurationDays?, participationQuota?, isAdaptive?
 * Kategori ve yayınevi kitapçıktan alınır. Yanıt: { message, examId, bookletCode }
 */
export const createExam = async (data) => {
  const body = {
    title: data.title?.trim() ?? "",
    bookletCode: data.bookletCode?.trim() ?? "",
  };
  if (data.description != null) body.description = data.description;
  if (data.instructions != null) body.instructions = data.instructions;
  if (data.startsAt != null) body.startsAt = data.startsAt;
  if (data.endsAt != null) body.endsAt = data.endsAt;
  if (data.accessDurationDays != null) body.accessDurationDays = Number(data.accessDurationDays);
  if (data.participationQuota != null) body.participationQuota = Number(data.participationQuota);
  if (data.isAdaptive != null) body.isAdaptive = Boolean(data.isAdaptive);
  const response = await adminApi.post("/AdminExam/create", body);
  return response.data;
};

/**
 * Sınav güncelle. PUT /AdminExam/update?id={id}
 * AdminExamUpdateDto: publisherId, categoryId, categorySubId kaldırıldı (kitapçıktan gelir). title, description?, instructions?, startsAt?, endsAt?, status? vb.
 */
export const updateExam = async (id, data) => {
  const body = {};
  if (data.title != null) body.title = data.title;
  if (data.description != null) body.description = data.description;
  if (data.instructions != null) body.instructions = data.instructions;
  if (data.startsAt != null) body.startsAt = data.startsAt;
  if (data.endsAt != null) body.endsAt = data.endsAt;
  if (data.status != null) body.status = data.status;
  if (data.accessDurationDays != null) body.accessDurationDays = data.accessDurationDays;
  if (data.participationQuota != null) body.participationQuota = data.participationQuota;
  if (data.isAdaptive != null) body.isAdaptive = data.isAdaptive;
  const response = await adminApi.put("/AdminExam/update", body, {
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
