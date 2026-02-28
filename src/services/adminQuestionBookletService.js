// AdminQuestionBookletController — api/AdminQuestionBooklet
// Rapor: docs/API-EXAM-VE-BOOKLET-ENDPOINT-RAPORU.md, API-QUESTIONS-CONTROLLERS-RAPORU.md
// QuestionBookletDto: publisherId, status eklendi. AddQuestion/UpdateQuestion: PublisherId kaldırıldı.
import adminApi from "@/api/adminApi";

/**
 * Tüm kitapçıkları listele. GET /api/AdminQuestionBooklet/list
 * Sınav oluştururken BookletCode seçimi için kullanılır.
 */
export const getBookletList = async () => {
  const response = await adminApi.get("/AdminQuestionBooklet/list");
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Kitapçık oluştur. POST /api/AdminQuestionBooklet
 * QuestionBookletCreateDto: categorySubId, name, publisherId? (opsiyonel), categorySectionIds? (opsiyonel)
 */
export const createBooklet = async (data) => {
  const body = {
    categorySubId: data.categorySubId,
    name: data.name?.trim() ?? "",
  };
  if (data.publisherId != null && data.publisherId !== "") body.publisherId = data.publisherId;
  if (data.categorySectionIds != null && data.categorySectionIds.length > 0) {
    body.categorySectionIds = data.categorySectionIds;
  }
  const response = await adminApi.post("/AdminQuestionBooklet", body);
  return response.data;
};

/**
 * Kitapçığa tek bölüm için slot oluştur. POST /api/AdminQuestionBooklet/slots-for-section
 * Body: questionBookletId, categorySectionId
 */
export const createSlotsForSection = async (questionBookletId, categorySectionId) => {
  const response = await adminApi.post("/AdminQuestionBooklet/slots-for-section", {
    questionBookletId,
    categorySectionId,
  });
  return response.data;
};

/**
 * Kitapçığa tüm bölümler (feature) için slot oluştur. POST /api/AdminQuestionBooklet/slots-for-feature
 * Body: questionBookletId, categoryFeatureId
 */
export const createSlotsForFeature = async (questionBookletId, categoryFeatureId) => {
  const response = await adminApi.post("/AdminQuestionBooklet/slots-for-feature", {
    questionBookletId,
    categoryFeatureId,
  });
  return response.data;
};

/**
 * Bölüme göre slotları listele. GET /api/AdminQuestionBooklet/slots/by-section/{categorySectionId}
 */
export const getSlotsBySectionId = async (categorySectionId) => {
  const response = await adminApi.get(
    `/AdminQuestionBooklet/slots/by-section/${categorySectionId}`
  );
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Alt kategoriye göre kitapçıkları listele. GET /api/AdminQuestionBooklet/by-category-sub/{categorySubId}
 */
export const getBookletsByCategorySubId = async (categorySubId) => {
  const response = await adminApi.get(
    `/AdminQuestionBooklet/by-category-sub/${categorySubId}`
  );
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Kitapçığı Id ile getir (slotlar dahil). GET /api/AdminQuestionBooklet/booklet/{bookletId}
 */
export const getBookletById = async (bookletId) => {
  const response = await adminApi.get(`/AdminQuestionBooklet/booklet/${bookletId}`);
  return response.data;
};

/**
 * Kitapçık slotunu Id ile getir. GET /api/AdminQuestionBooklet/slot/{slotId}
 */
export const getSlotById = async (slotId) => {
  const response = await adminApi.get(`/AdminQuestionBooklet/slot/${slotId}`);
  return response.data;
};

/**
 * Kitapçığı Code ile getir. GET /api/AdminQuestionBooklet/by-code/{code}
 */
export const getBookletByCode = async (code) => {
  const response = await adminApi.get(
    `/AdminQuestionBooklet/by-code/${encodeURIComponent(code)}`
  );
  return response.data;
};

/**
 * Slota soru ekle (JSON). POST /api/AdminQuestionBooklet/slot/{slotId}/question
 * AddQuestionToBookletDto: stem, stemImageUrl?, options (optionKey, text, imageUrl?, orderIndex), correctOptionKey, lessonSubId?
 */
export const addQuestionToSlot = async (slotId, data) => {
  const body = {
    stem: data.stem?.trim() ?? "",
    options: (data.options || []).map((o) => ({
      optionKey: o.optionKey ?? "A",
      text: (o.text ?? "").toString().trim(),
      imageUrl: o.imageUrl || null,
      orderIndex: Number(o.orderIndex) ?? 0,
    })),
    correctOptionKey: data.correctOptionKey ?? "A",
  };
  if (data.stemImageUrl) body.stemImageUrl = data.stemImageUrl;
  if (data.lessonSubId != null && data.lessonSubId !== "") body.lessonSubId = data.lessonSubId;
  const response = await adminApi.post(`/AdminQuestionBooklet/slot/${slotId}/question`, body);
  return response.data;
};

/**
 * Slota soru + görsel ekle (multipart). POST /api/AdminQuestionBooklet/slot/{slotId}/question/with-images
 * FormData: data (JSON string), stemImage (file), optionImageA..optionImageE (file). JPEG, PNG, GIF, WebP.
 */
export const addQuestionToSlotWithImages = async (slotId, formData) => {
  const response = await adminApi.post(
    `/AdminQuestionBooklet/slot/${slotId}/question/with-images`,
    formData
  );
  return response.data;
};

/**
 * Slottaki soruyu güncelle (JSON). PUT /api/AdminQuestionBooklet/slot/{slotId}/question
 * UpdateQuestionInBookletDto: stem?, stemImageUrl?, options?, correctOptionKey?, lessonSubId? (hepsi opsiyonel)
 */
export const updateQuestionInSlot = async (slotId, data) => {
  const body = {};
  if (data.stem != null) body.stem = data.stem.trim();
  if (data.stemImageUrl != null) body.stemImageUrl = data.stemImageUrl || null;
  if (data.options != null) body.options = data.options.map((o) => ({
    optionKey: o.optionKey ?? "A",
    text: (o.text ?? "").toString().trim(),
    imageUrl: o.imageUrl || null,
    orderIndex: Number(o.orderIndex) ?? 0,
  }));
  if (data.correctOptionKey != null) body.correctOptionKey = data.correctOptionKey;
  if (data.lessonSubId != null) body.lessonSubId = data.lessonSubId === "" ? null : data.lessonSubId;
  const response = await adminApi.put(`/AdminQuestionBooklet/slot/${slotId}/question`, body);
  return response.data;
};

/**
 * Slottaki soruyu + görsel güncelle (multipart). PUT /api/AdminQuestionBooklet/slot/{slotId}/question/with-images
 * FormData: data (JSON string), stemImage (file), optionImageA..optionImageE (file).
 */
export const updateQuestionInSlotWithImages = async (slotId, formData) => {
  const response = await adminApi.put(
    `/AdminQuestionBooklet/slot/${slotId}/question/with-images`,
    formData
  );
  return response.data;
};

/**
 * Slottan soruyu kaldır. DELETE /api/AdminQuestionBooklet/slot/{slotId}/question
 * Cevap 204 No Content.
 */
export const removeQuestionFromSlot = async (slotId) => {
  await adminApi.delete(`/AdminQuestionBooklet/slot/${slotId}/question`);
};

/**
 * Kitapçık durumunu güncelle. PUT /api/AdminQuestionBooklet/booklet/{bookletId}/status
 * Body: { status: number } — 0=Taslak, 1=Hazırlanıyor, 2=Hazırlandı, 3=Tamamlandı, 4=SınavAşamasında
 * Yanıt 200: { message: "Kitapçık durumu güncellendi." }
 */
export const setBookletStatus = async (bookletId, status) => {
  const response = await adminApi.put(
    `/AdminQuestionBooklet/booklet/${bookletId}/status`,
    { status: Number(status) }
  );
  return response.data;
};

/**
 * Kitapçığı sil. DELETE /api/AdminQuestionBooklet/booklet/{bookletId}
 * Cevap 204 No Content.
 */
export const deleteBooklet = async (bookletId) => {
  await adminApi.delete(`/AdminQuestionBooklet/booklet/${bookletId}`);
};
