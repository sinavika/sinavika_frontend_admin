// AdminQuestionBookletController — api/AdminQuestionBooklet
// Booklet (soru kitapçığı) CRUD, havuzdan soru ekleme, toplu yükleme
import adminApi from "@/api/adminApi";

/**
 * Sınava ait booklet kayıtlarını listele. GET /AdminQuestionBooklet/by-exam/{examId}
 */
export const getBookletsByExamId = async (examId) => {
  const response = await adminApi.get(
    `/AdminQuestionBooklet/by-exam/${examId}`
  );
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Bölüme ait booklet kayıtlarını listele. GET /AdminQuestionBooklet/by-section/{examSectionId}
 */
export const getBookletsBySectionId = async (examSectionId) => {
  const response = await adminApi.get(
    `/AdminQuestionBooklet/by-section/${examSectionId}`
  );
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Booklet kaydı detayı. GET /AdminQuestionBooklet/{id}
 */
export const getBookletById = async (id) => {
  const response = await adminApi.get(`/AdminQuestionBooklet/${id}`);
  return response.data;
};

/**
 * Booklet'e soru ekle (questionId veya questionCode). POST /AdminQuestionBooklet/add
 * @param {{ examId: string, examSectionId: string, lessonId: string, name?: string, orderIndex?: number, questionsTemplateId?: string, questionTemplateItemId?: string, questionId?: string, questionCode?: string }} data
 */
export const addQuestionToBooklet = async (data) => {
  const response = await adminApi.post("/AdminQuestionBooklet/add", data);
  return response.data;
};

/**
 * Code ile booklet'e soru ekle. POST /AdminQuestionBooklet/add-by-code
 * @param {{ examId: string, examSectionId: string, questionCode: string, orderIndex?: number, questionsTemplateId?: string, questionTemplateItemId?: string }} data
 */
export const addQuestionToBookletByCode = async (data) => {
  const response = await adminApi.post(
    "/AdminQuestionBooklet/add-by-code",
    data
  );
  return response.data;
};

/**
 * Booklet kaydının sırasını güncelle. PUT /AdminQuestionBooklet/{id}/order
 * @param {string} id
 * @param {{ orderIndex: number }} data
 */
export const updateBookletOrder = async (id, data) => {
  const response = await adminApi.put(
    `/AdminQuestionBooklet/${id}/order`,
    data
  );
  return response.data;
};

/**
 * Booklet kaydını kaldır. DELETE /AdminQuestionBooklet/{id}
 */
export const deleteBookletItem = async (id) => {
  const response = await adminApi.delete(`/AdminQuestionBooklet/${id}`);
  return response.data;
};

/**
 * JSON ile toplu soru yükleme (havuza). POST /AdminQuestionBooklet/bulk-import/json
 * Body: { json: string } — JSON dizisi string olarak
 * @param {{ json: string }} data
 */
export const bulkImportJson = async (data) => {
  const response = await adminApi.post(
    "/AdminQuestionBooklet/bulk-import/json",
    data
  );
  return response.data;
};

/**
 * Excel ile toplu soru yükleme (havuza). POST /AdminQuestionBooklet/bulk-import/excel
 * Content-Type: multipart/form-data, key: file
 * @param {File} file .xlsx dosyası
 */
export const bulkImportExcel = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await adminApi.post(
    "/AdminQuestionBooklet/bulk-import/excel",
    formData
  );
  return response.data;
};
