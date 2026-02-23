# Docs — Genel Kontrol Özeti

Bu dosya `docs/` altındaki dokümanlarla frontend servislerinin uyumunu özetler.

---

## 1. Docs klasör yapısı

| Dosya | Kapsam |
|-------|--------|
| `01-Questions-Controllers-Tanitim.md` | Questions controller tanıtımı |
| `02-Questions-API-Endpoints-Detay.md` | Questions endpoint detayları |
| `Categories/01-Categories-Controllers-Tanitim.md` | Categories controller tanıtımı |
| `Categories/02-Categories-API-Endpoints-Detay.md` | Categories endpoint detayları |

**Not:** `docs/` dışında kalan API’ler (Lesson, Exam, Auth, Coupon, Publisher vb.) bu dokümanlarda yer almaz; backend’in diğer raporlarına aittir.

---

## 2. Questions API — Frontend uyumu

| Controller | Doc endpoint'ler | Frontend servis | Durum |
|------------|------------------|-----------------|--------|
| AdminQuestionBookletTemplate | GET `/`, `/{id}`, `by-category-sub/{id}`, `by-template-set/{id}`, POST `/`, PUT `/{id}`, DELETE `/{id}` | `adminBookletTemplateService.js` | Uyumlu |
| AdminQuestionBooklet | GET `by-exam/{examId}`, `/{id}`, POST `add-question`, DELETE `/{id}` | `adminBookletService.js` | Uyumlu |
| AdminQuestion | GET `/{id}`, `by-code/{code}`, `?skip&take&lessonSubId&publisherId`, POST `add-to-booklet` | `adminQuestionService.js` | Uyumlu |
| AdminQuestionSolution | GET `/{id}`, `by-question/{questionId}`, POST `/`, PUT `/{id}`, DELETE `/{id}` | `adminQuestionSolutionService.js` | Uyumlu |

- Rapor dışı `AdminQuestionsTemplate` servisi kaldırıldı; sadece doc’taki endpoint’ler kullanılıyor.

---

## 3. Categories API — Frontend uyumu

| Controller | Doc endpoint'ler | Frontend servis | Durum |
|------------|------------------|-----------------|--------|
| AdminCategory | GET `all`, `?id=`, POST `create` (form+file), PUT `update-name?id=`, `update-image?id=`, DELETE `delete?id=` | `adminCategoryService.js` | Uyumlu |
| AdminCategorySub | GET `/{categoryId}/subs`, `?id=`, POST `create`, PUT `update?id=`, DELETE `delete?id=` | `adminCategorySubService.js` | Uyumlu |
| AdminCategorySection | GET `all`, `/{id}`, `by-sub/{categorySubId}`, POST `create`, PUT `/{id}`, DELETE `/{id}` | `adminCategorySectionService.js` | Uyumlu |
| AdminCategoryFeature | GET `all`, `/{id}`, `by-sub/{categorySubId}`, POST `create`, PUT `/{id}`, DELETE `/{id}` | `adminCategoryFeatureService.js` | Uyumlu |

- Category create/update/delete: doc’taki path ve parametreler kullanılıyor.
- CategorySection create/update body’leri doc (3.4, 3.5) ile eşlendi (lessonMainId, minQuestions, maxQuestions, targetQuestions, difficultyMix dahil).
- CategoriesController (Partner) `all-with-subs`: doc’ta tanımlı; admin paneli `AdminCategory` kullandığı için frontend’de ayrı servis yok (ihtiyaç olursa eklenebilir).

---

## 4. Doc’ta olmayan servisler

Aşağıdaki servisler `docs/` içindeki Questions ve Categories dokümanlarında **yer almaz**; farklı backend/raporlara aittir, kaldırılmamalıdır:

- `adminAuthService.js` — AdminAuth
- `adminExamService.js` — AdminExam
- `adminExamSectionService.js` — AdminExamSection
- `adminExamsQuestionService.js` — AdminExamsQuestion
- `adminExamSectionLessonQuotaService.js` — AdminExamSectionLessonQuota
- `adminLessonService.js` — AdminLesson
- `adminLessonMainService.js` — AdminLessonMain
- `adminLessonSubService.js` — AdminLessonSub
- `adminLessonMikroService.js` — AdminLessonMikro
- `adminCouponService.js` — AdminCoupon
- `adminPublisherService.js` — AdminPublisher
- `adminReferralCampaignService.js` — AdminReferralCampaign
- `adminSubscriptionPackageService.js` — AdminSubscriptionPackage

---

## 5. Sayfa–servis eşleşmeleri (doc kapsamındakiler)

| Sayfa | Kullandığı doc servisleri |
|-------|----------------------------|
| Categories.jsx | adminCategoryService, adminCategorySubService, adminCategoryFeatureService, adminCategorySectionService |
| BookletTemplates.jsx | adminBookletTemplateService, adminCategoryService, adminCategorySubService, adminCategorySectionService |
| Booklets.jsx | adminBookletService, adminBookletTemplateService, adminExamService, adminExamSectionService, adminLessonService |
| Exams.jsx | adminBookletTemplateService (şablon listesi), adminCategoryService, adminCategorySubService, adminCategorySectionService + Exam/ExamSection/ExamsQuestion/Quota servisleri |

---

**Son kontrol tarihi:** Bu özet, `docs/` altındaki Questions ve Categories dokümanlarına göre frontend ile genel uyum kontrolü sonucunu yansıtır.
