import adminApi from "@/api/adminApi";

/**
 * AdminExamController — Rapor: docs/API-ADMIN-EXAM-CONTROLLER-RAPORU.md
 * Sadece raporda tanımlı endpoint'ler. ExamStatus: 0=Draft, 1=Scheduled, 2=Published, 3=InProgress, 4=Closed, 5=Ended, 6=Archived
 */

/**
 * Tüm sınavları listele. GET /AdminExam/all
 */
export const getAllExams = async () => {
  const response = await adminApi.get("/AdminExam/all");
  return response.data;
};

/**
 * Duruma göre sınavları listele. GET /AdminExam/by-status/{status}
 * @param {number} status — 0–6 arası ExamStatus
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
 * AdminExamCreateDto: title (zorunlu), description?, instructions?, bookletCode (zorunlu), startsAt?, endsAt?, accessDurationDays (zorunlu), participationQuota?, isAdaptive (zorunlu)
 * Yanıt: { message, examId, bookletCode }
 */
export const createExam = async (data) => {
  const body = {
    title: data.title?.trim() ?? "",
    bookletCode: data.bookletCode?.trim() ?? "",
    accessDurationDays: Number(data.accessDurationDays) ?? 0,
    isAdaptive: Boolean(data.isAdaptive),
  };
  if (data.description != null) body.description = data.description;
  if (data.instructions != null) body.instructions = data.instructions;
  if (data.startsAt != null) body.startsAt = data.startsAt;
  if (data.endsAt != null) body.endsAt = data.endsAt;
  if (data.participationQuota != null) body.participationQuota = Number(data.participationQuota);
  const response = await adminApi.post("/AdminExam/create", body);
  return response.data;
};

/**
 * Sınav durumunu güncelle. PUT /AdminExam/status/{id}
 * Body: SetExamStatusRequest { status: number } — 0–6
 */
export const setExamStatus = async (id, status) => {
  const response = await adminApi.put(`/AdminExam/status/${id}`, { status: Number(status) });
  return response.data;
};
