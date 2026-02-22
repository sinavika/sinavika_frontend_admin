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

/**
 * Kitapçık bölümüne soru ekle. POST /AdminQuestion/add-to-booklet
 * Body: QuestionBookletCreateDto (2.3 ile aynı)
 * @param {{
 *   examId: string,
 *   examSectionId?: string,
 *   lessonId: string,
 *   name: string,
 *   orderIndex?: number,
 *   questionsTemplateId?: string,
 *   questionTemplateItemId?: string,
 *   stem: string,
 *   options: Array<{ optionKey: string, text: string, orderIndex: number }>,
 *   correctOptionKey: string,
 *   lessonSubId?: string,
 *   publisherId?: string
 * }} data
 */
export const addQuestionToBooklet = async (data) => {
  const response = await adminApi.post("/AdminQuestion/add-to-booklet", data);
  return response.data;
};
