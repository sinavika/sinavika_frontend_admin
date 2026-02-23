// AdminQuestionController — api/AdminQuestion
// Rapor: API-QUESTIONS-CONTROLLERS-FRONTEND-RAPORU.md
import adminApi from "@/api/adminApi";

/**
 * Id ile soru getir. GET /AdminQuestion/{id}
 */
export const getQuestionById = async (id) => {
  const response = await adminApi.get(`/AdminQuestion/${id}`);
  return response.data;
};

/**
 * Code ile soru getir. GET /AdminQuestion/by-code/{code}
 */
export const getQuestionByCode = async (code) => {
  const response = await adminApi.get(
    `/AdminQuestion/by-code/${encodeURIComponent(code)}`
  );
  return response.data;
};

/**
 * Soruları sayfalı listele (filtreli). GET /AdminQuestion?skip=0&take=20&lessonSubId=&publisherId=
 * @param {{ skip?: number, take?: number, lessonSubId?: string, publisherId?: string }} params
 */
export const getQuestionsPaginated = async (params = {}) => {
  const { skip = 0, take = 20, lessonSubId, publisherId } = params;
  const response = await adminApi.get("/AdminQuestion", {
    params: { skip, take, lessonSubId: lessonSubId || "", publisherId: publisherId || "" },
  });
  return Array.isArray(response.data) ? response.data : [];
};

// add-to-booklet kaldırıldı (FRONTEND-API-DEGISIKLIK-RAPORU.md). Soru ekleme: AdminQuestionBooklet üzerinden POST /AdminQuestionBooklet/{bookletId}/question
