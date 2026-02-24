// AdminQuestionBookletController — api/AdminQuestionBooklet
// Doc: docs/FRONTEND-API-DEGISIKLIK-RAPORU.md — CategorySection tabanlı; Şubat 2025: slots-for-section, slots-for-feature, by-section
import adminApi from "@/api/adminApi";

/**
 * Bölüme göre slot listesi. GET /AdminQuestionBooklet/by-section/{categorySectionId}
 * Response: QuestionBookletDto[]
 */
export const getBookletsBySectionId = async (categorySectionId) => {
  const response = await adminApi.get(
    `/AdminQuestionBooklet/by-section/${categorySectionId}`
  );
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Kitapçık satırı detayı. GET /AdminQuestionBooklet/{id}
 */
export const getBookletById = async (id) => {
  const response = await adminApi.get(`/AdminQuestionBooklet/${id}`);
  return response.data;
};

/**
 * Code ile kitapçık getir. GET /AdminQuestionBooklet/by-code/{code}
 */
export const getBookletByCode = async (code) => {
  const response = await adminApi.get(
    `/AdminQuestionBooklet/by-code/${encodeURIComponent(code)}`
  );
  return response.data;
};

/**
 * Kitapçık oluştur (tek slot). POST /AdminQuestionBooklet
 * Body: categorySectionId (zorunlu), name? (opsiyonel), orderIndex (zorunlu).
 * 400: CategorySectionId geçersiz veya bölümdeki slot kotası (QuestionCount) dolu.
 */
export const createBooklet = async (data) => {
  const response = await adminApi.post("/AdminQuestionBooklet", {
    categorySectionId: data.categorySectionId,
    name: data.name?.trim() || null,
    orderIndex: Number(data.orderIndex) ?? 0,
  });
  return response.data;
};

/**
 * Tek bölüm için eksik slotları toplu oluştur. POST /AdminQuestionBooklet/slots-for-section
 * Body: { categorySectionId }. Response: CreateSlotsResultDto (createdCount, slots, message)
 */
export const createSlotsForSection = async (categorySectionId) => {
  const response = await adminApi.post("/AdminQuestionBooklet/slots-for-section", {
    categorySectionId,
  });
  return response.data;
};

/**
 * Bir özelliğin (feature) tüm bölümleri için eksik slotları toplu oluştur. POST /AdminQuestionBooklet/slots-for-feature
 * Body: { categoryFeatureId }. Response: CreateSlotsResultDto
 */
export const createSlotsForFeature = async (categoryFeatureId) => {
  const response = await adminApi.post("/AdminQuestionBooklet/slots-for-feature", {
    categoryFeatureId,
  });
  return response.data;
};

/**
 * Kitapçığa soru ekle. POST /AdminQuestionBooklet/{bookletId}/question
 * Body: stem, options, correctOptionKey, lessonSubId?, publisherId?
 */
export const addQuestionToBooklet = async (bookletId, data) => {
  const response = await adminApi.post(
    `/AdminQuestionBooklet/${bookletId}/question`,
    {
      stem: data.stem,
      options: data.options,
      correctOptionKey: data.correctOptionKey,
      lessonSubId: data.lessonSubId ?? null,
      publisherId: data.publisherId ?? null,
    }
  );
  return response.data;
};

/**
 * Kitapçıktaki soruyu güncelle. PUT /AdminQuestionBooklet/{bookletId}/question
 */
export const updateQuestionInBooklet = async (bookletId, data) => {
  const response = await adminApi.put(
    `/AdminQuestionBooklet/${bookletId}/question`,
    {
      stem: data.stem,
      options: data.options,
      correctOptionKey: data.correctOptionKey,
      lessonSubId: data.lessonSubId ?? null,
      publisherId: data.publisherId ?? null,
    }
  );
  return response.data;
};

/**
 * Kitapçıktan sadece soruyu kaldır (kitapçık satırı kalır). DELETE /AdminQuestionBooklet/{bookletId}/question
 */
export const removeQuestionFromBooklet = async (bookletId) => {
  await adminApi.delete(`/AdminQuestionBooklet/${bookletId}/question`);
};

/**
 * Kitapçık satırını sil (ilişkili soru da silinir). DELETE /AdminQuestionBooklet/{id}
 */
export const deleteBookletItem = async (id) => {
  await adminApi.delete(`/AdminQuestionBooklet/${id}`);
};
