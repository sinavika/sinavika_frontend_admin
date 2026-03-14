// AdminKnowledgeController — api/AdminKnowledge
// Yapay zeka ile kitapçık slotlarına soru üretme ve değiştirme
import adminApi from "@/api/adminApi";

const BASE = "/AdminKnowledge";

/**
 * Kitapçıktaki tüm boş slotlara AI ile soru üretir.
 * POST /api/AdminKnowledge/generate-questions
 * Body: { questionBookletId: Guid }
 * @returns { totalEmptySlots, filledCount, errorCount, errors }
 */
export const generateQuestions = async (questionBookletId) => {
  const response = await adminApi.post(`${BASE}/generate-questions`, {
    questionBookletId,
  });
  return response.data;
};

/**
 * Seçili slotlardaki soruları kaldırıp yerine AI ile yeni soru üretir.
 * POST /api/AdminKnowledge/replace-questions
 * Body: { questionBookletId: Guid, slotIds: Guid[] }
 * @returns { replacedCount, errorCount, errors }
 */
export const replaceQuestions = async (questionBookletId, slotIds) => {
  const response = await adminApi.post(`${BASE}/replace-questions`, {
    questionBookletId,
    slotIds,
  });
  return response.data;
};
