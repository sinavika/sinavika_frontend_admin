import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Users,
  ArrowLeft,
  CreditCard,
  GraduationCap,
  FileCheck,
  BarChart3,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getStudentById,
  getStudentSubscriptions,
  getStudentAcademicProfile,
  getStudentExams,
  getStudentExamScore,
} from "@/services/adminStudentAuthManagementService";
import { ERROR_MESSAGES } from "@/constants";
import { formatDate, formatCurrency } from "@/utils/format";

const getApiError = (err) =>
  err.response?.data?.error ||
  err.response?.data?.Error ||
  err.message ||
  ERROR_MESSAGES.FETCH_FAILED;

const SUBSCRIPTION_STATUS = {
  0: "Beklemede",
  1: "Aktif",
  2: "Süresi Dolmuş",
  3: "İptal",
};

const PAYMENT_STATUS = {
  0: "Beklemede",
  1: "Tamamlandı",
  2: "Başarısız",
  3: "İade",
  4: "İptal",
};

const StudentDetail = () => {
  const { studentId } = useParams();
  const [detailLoading, setDetailLoading] = useState(true);
  const [studentDetail, setStudentDetail] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [academicProfile, setAcademicProfile] = useState(null);
  const [exams, setExams] = useState([]);
  const [scoreExamId, setScoreExamId] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  const [scoreLoading, setScoreLoading] = useState(false);

  const loadDetail = useCallback(async (id) => {
    if (!id) return;
    setDetailLoading(true);
    setStudentDetail(null);
    setSubscriptions([]);
    setAcademicProfile(null);
    setExams([]);
    setScoreExamId(null);
    setScoreData(null);
    try {
      const [detailRes, subsRes, profileRes, examsRes] = await Promise.allSettled([
        getStudentById(id),
        getStudentSubscriptions(id),
        getStudentAcademicProfile(id).catch(() => null),
        getStudentExams(id),
      ]);
      setStudentDetail(
        detailRes.status === "fulfilled" ? detailRes.value : null
      );
      setSubscriptions(
        subsRes.status === "fulfilled" && Array.isArray(subsRes.value)
          ? subsRes.value
          : []
      );
      setAcademicProfile(
        profileRes.status === "fulfilled" && profileRes.value != null
          ? profileRes.value
          : null
      );
      setExams(
        examsRes.status === "fulfilled" && Array.isArray(examsRes.value)
          ? examsRes.value
          : []
      );
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (studentId) loadDetail(studentId);
  }, [studentId, loadDetail]);

  const openScore = async (examId) => {
    if (!studentId) return;
    setScoreExamId(examId);
    setScoreLoading(true);
    setScoreData(null);
    try {
      const data = await getStudentExamScore(studentId, examId);
      setScoreData(data);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setScoreLoading(false);
    }
  };

  return (
    <div className="admin-page-wrapper student-detail-page">
      <div className="student-detail-header">
        <Link
          to="/admin/students"
          className="student-detail-back"
        >
          <ArrowLeft size={20} />
          Öğrenci listesine dön
        </Link>
        <h1 className="student-detail-title">
          {detailLoading
            ? "Yükleniyor…"
            : studentDetail
              ? `${studentDetail.name} ${studentDetail.surname}`
              : "Öğrenci detayı"}
        </h1>
      </div>

      {detailLoading ? (
        <div className="student-detail-loading">
          <Loader2 size={36} className="student-detail-spinner" />
          <span>Bilgiler yükleniyor…</span>
        </div>
      ) : (
        <div className="student-detail-body">
          {/* Bölüm: Öğrenci bilgisi */}
          <section className="students-section student-detail-section">
            <h2 className="students-section-title">
              <Users size={18} />
              Öğrenci Bilgisi
            </h2>
            <div className="students-section-content">
              {studentDetail ? (
                <dl className="students-dl">
                  <div className="students-dl-row">
                    <dt>Ad Soyad</dt>
                    <dd>
                      {studentDetail.name} {studentDetail.surname}
                    </dd>
                  </div>
                  <div className="students-dl-row">
                    <dt>E-posta</dt>
                    <dd>{studentDetail.email ?? "—"}</dd>
                  </div>
                  <div className="students-dl-row">
                    <dt>Telefon</dt>
                    <dd>{studentDetail.phone ?? "—"}</dd>
                  </div>
                  <div className="students-dl-row">
                    <dt>Durum</dt>
                    <dd>
                      <span
                        className={
                          studentDetail.isActive
                            ? "admin-badge admin-badge-success"
                            : "admin-badge admin-badge-neutral"
                        }
                      >
                        {studentDetail.isActive ? "Aktif" : "Pasif"}
                      </span>
                    </dd>
                  </div>
                  <div className="students-dl-row">
                    <dt>Kayıt tarihi</dt>
                    <dd>
                      {studentDetail.createdAt
                        ? formatDate(studentDetail.createdAt)
                        : "—"}
                    </dd>
                  </div>
                  <div className="students-dl-row">
                    <dt>Son güncelleme</dt>
                    <dd>
                      {studentDetail.updatedAt
                        ? formatDate(studentDetail.updatedAt)
                        : "—"}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="students-section-empty">Detay yüklenemedi.</p>
              )}
            </div>
          </section>

          {/* Bölüm: Abonelikler */}
          <section className="students-section student-detail-section">
            <h2 className="students-section-title">
              <CreditCard size={18} />
              Abonelikler
            </h2>
            <div className="students-section-content">
              {subscriptions.length === 0 ? (
                <p className="students-section-empty">Abonelik kaydı yok.</p>
              ) : (
                <div className="students-subscription-list">
                  {subscriptions.map((sub) => (
                    <div
                      key={sub.id}
                      className="students-subscription-card"
                    >
                      <div className="students-subscription-header">
                        <span className="students-subscription-name">
                          {sub.packageName}
                        </span>
                        <span
                          className={`admin-badge students-subscription-status students-subscription-status--${
                            sub.status === 1
                              ? "active"
                              : sub.status === 2
                                ? "expired"
                                : sub.status === 3
                                  ? "cancelled"
                                  : "pending"
                          }`}
                        >
                          {SUBSCRIPTION_STATUS[sub.status] ?? sub.status}
                        </span>
                      </div>
                      <dl className="students-dl students-dl-sm">
                        <div className="students-dl-row">
                          <dt>Başlangıç</dt>
                          <dd>
                            {sub.startedAt
                              ? formatDate(sub.startedAt)
                              : "—"}
                          </dd>
                        </div>
                        <div className="students-dl-row">
                          <dt>Bitiş</dt>
                          <dd>
                            {sub.expiresAt
                              ? formatDate(sub.expiresAt)
                              : "—"}
                          </dd>
                        </div>
                        <div className="students-dl-row">
                          <dt>Fiyat / İndirimli</dt>
                          <dd>
                            {formatCurrency(sub.packagePriceSnapshot)} /{" "}
                            {formatCurrency(sub.finalPriceSnapshot)}
                          </dd>
                        </div>
                        {sub.usedCoupon && (
                          <div className="students-dl-row">
                            <dt>Kupon</dt>
                            <dd>
                              {sub.couponCodeSnapshot} (
                              {formatCurrency(sub.discountAmountSnapshot)})
                            </dd>
                          </div>
                        )}
                        {sub.usedReference && (
                          <div className="students-dl-row">
                            <dt>Referans</dt>
                            <dd>
                              {sub.referenceCodeSnapshot} (
                              {formatCurrency(
                                sub.referenceDiscountAmountSnapshot
                              )}
                              )
                            </dd>
                          </div>
                        )}
                      </dl>
                      {sub.payments && sub.payments.length > 0 && (
                        <div className="students-payments">
                          <strong>Ödemeler</strong>
                          <ul className="students-payment-list">
                            {sub.payments.map((pay) => (
                              <li key={pay.id}>
                                {formatCurrency(pay.amount)} —{" "}
                                {PAYMENT_STATUS[pay.status] ?? pay.status}
                                {pay.paidAt &&
                                  ` (${formatDate(pay.paidAt)})`}
                                {pay.externalPaymentId &&
                                  ` — ${pay.externalPaymentId}`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Bölüm: Akademik profil / Mezuniyet bilgisi */}
          <section className="students-section student-detail-section">
            <h2 className="students-section-title">
              <GraduationCap size={18} />
              Mezuniyet / Akademik Profil
            </h2>
            <div className="students-section-content">
              {academicProfile ? (
                <dl className="students-dl">
                  <div className="students-dl-row">
                    <dt>Diploma puanı</dt>
                    <dd>
                      {academicProfile.diplomaScore != null
                        ? academicProfile.diplomaScore
                        : "—"}
                    </dd>
                  </div>
                  <div className="students-dl-row">
                    <dt>OBP</dt>
                    <dd>
                      {academicProfile.obp != null
                        ? academicProfile.obp
                        : "—"}
                    </dd>
                  </div>
                  <div className="students-dl-row">
                    <dt>Yerleştirme cezası</dt>
                    <dd>
                      {academicProfile.hasPlacementPenalty ? "Var" : "Yok"}
                      {academicProfile.placementPenaltyFactor != null &&
                        ` (${academicProfile.placementPenaltyFactor})`}
                    </dd>
                  </div>
                  <div className="students-dl-row">
                    <dt>Son güncelleme</dt>
                    <dd>
                      {academicProfile.updatedAt
                        ? formatDate(academicProfile.updatedAt)
                        : "—"}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="students-section-empty">
                  Akademik profil kaydı yok.
                </p>
              )}
            </div>
          </section>

          {/* Bölüm: Girilen sınavlar */}
          <section className="students-section student-detail-section">
            <h2 className="students-section-title">
              <FileCheck size={18} />
              Girilen Sınavlar
            </h2>
            <div className="students-section-content">
              {exams.length === 0 ? (
                <p className="students-section-empty">
                  Henüz girilen sınav yok.
                </p>
              ) : (
                <div className="students-exams-list">
                  {exams.map((exam) => (
                    <div
                      key={exam.examUserId || exam.examId}
                      className="students-exam-card"
                    >
                      <div className="students-exam-header">
                        <span className="students-exam-title">
                          {exam.examTitle}
                        </span>
                        <button
                          type="button"
                          onClick={() => openScore(exam.examId)}
                          disabled={
                            scoreLoading && scoreExamId === exam.examId
                          }
                          className="admin-btn admin-btn-ghost students-exam-score-btn"
                          title="Skor detayı"
                        >
                          {scoreLoading &&
                          scoreExamId === exam.examId ? (
                            <Loader2
                              size={16}
                              className="students-score-btn-spinner"
                            />
                          ) : (
                            <BarChart3 size={16} />
                          )}
                          <span>Skor</span>
                        </button>
                      </div>
                      <dl className="students-dl students-dl-sm">
                        <div className="students-dl-row">
                          <dt>Başlama</dt>
                          <dd>
                            {exam.startedAt
                              ? formatDate(exam.startedAt)
                              : "—"}
                          </dd>
                        </div>
                        <div className="students-dl-row">
                          <dt>Teslim</dt>
                          <dd>
                            {exam.submittedAt
                              ? formatDate(exam.submittedAt)
                              : "—"}
                          </dd>
                        </div>
                        <div className="students-dl-row">
                          <dt>İptal</dt>
                          <dd>
                            {exam.cancelledAt
                              ? formatDate(exam.cancelledAt)
                              : "—"}
                          </dd>
                        </div>
                      </dl>
                      {scoreData && scoreExamId === exam.examId && (
                        <div className="students-score-detail">
                          <h3 className="students-score-detail-title">
                            Skor detayı
                          </h3>
                          {scoreData.snapshot && (
                            <dl className="students-dl students-dl-sm">
                              <div className="students-dl-row">
                                <dt>Doğru / Yanlış / Boş</dt>
                                <dd>
                                  {scoreData.snapshot.correctCount} /{" "}
                                  {scoreData.snapshot.wrongCount} /{" "}
                                  {scoreData.snapshot.emptyCount}
                                </dd>
                              </div>
                              <div className="students-dl-row">
                                <dt>Net</dt>
                                <dd>
                                  {scoreData.snapshot.netScore ?? "—"}
                                </dd>
                              </div>
                              <div className="students-dl-row">
                                <dt>Süre (sn)</dt>
                                <dd>
                                  {scoreData.snapshot.durationSeconds ?? "—"}
                                </dd>
                              </div>
                              <div className="students-dl-row">
                                <dt>Sıra / Toplam</dt>
                                <dd>
                                  {scoreData.snapshot.rank ?? "—"} /{" "}
                                  {scoreData.snapshot.totalParticipantCount ??
                                    "—"}
                                </dd>
                              </div>
                            </dl>
                          )}
                          {scoreData.scoreResults &&
                            scoreData.scoreResults.length > 0 && (
                              <div className="students-score-results">
                                <strong>Puan türleri</strong>
                                <ul className="students-score-results-list">
                                  {scoreData.scoreResults.map((sr) => (
                                    <li key={sr.id}>
                                      {sr.scoreTypeCode}: Ham{" "}
                                      {sr.rawScore ?? "—"}, Standart{" "}
                                      {sr.standardScore ?? "—"}, Final{" "}
                                      {sr.finalScore ?? "—"}
                                      {sr.obpContribution != null &&
                                        ` (OBP katkı: ${sr.obpContribution})`}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          {scoreData.rankResults &&
                            scoreData.rankResults.length > 0 && (
                              <div className="students-rank-results">
                                <strong>Sıralama</strong>
                                <ul className="students-score-results-list">
                                  {scoreData.rankResults.map((rr) => (
                                    <li key={rr.id}>
                                      {rr.scoreTypeCode}: Sıra{" "}
                                      {rr.rank ?? "—"}, Yüzdelik{" "}
                                      {rr.percentile ?? "—"}%
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          {!scoreData.snapshot &&
                            (!scoreData.scoreResults ||
                              scoreData.scoreResults.length === 0) && (
                              <p className="students-section-empty">
                                Henüz hesaplanmamış.
                              </p>
                            )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default StudentDetail;
