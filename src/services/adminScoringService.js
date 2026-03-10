// AdminScoring — Sınav sonuç ve sıralama hesaplama (tek endpoint)
// Doc: docs/admin-scoring-controller-api.md
import adminApi from "@/api/adminApi";

/** Uzun süren sonuç hesaplama için timeout (ms). Sunucu tarafında da Kestrel timeout artırılmalı (örn. 300s+). */
const SCORING_REQUEST_TIMEOUT_MS = 300000; // 5 dakika

/**
 * Hesaplamaya müsait (Closed/Ended/Archived) sınavları listele.
 * GET /AdminScoring/exams-eligible-for-scoring
 * @returns {Promise<Array<{ id: string, title: string, status: number }>>}
 */
export const getExamsEligibleForScoring = async () => {
  const response = await adminApi.get(
    "/AdminScoring/exams-eligible-for-scoring"
  );
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Sınav sonuçlarını ve sıralamayı tek seferde hesapla.
 * Net/puan hesaplanır, Entity/Scoring tabloları doldurulur, ardından sıralama atanır.
 * Her sınav için yalnızca bir kez çalıştırılmalıdır. Uzun sürebilir.
 * POST /AdminScoring/exam/{examId}/calculate-results
 * @param {string} examId Sınav ID (GUID)
 * @returns {Promise<{ message: string, examId: string }>}
 */
export const calculateExamResults = async (examId) => {
  const response = await adminApi.post(
    `/AdminScoring/exam/${examId}/calculate-results`,
    null,
    { timeout: SCORING_REQUEST_TIMEOUT_MS }
  );
  return response.data;
};
