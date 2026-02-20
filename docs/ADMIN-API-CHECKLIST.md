# Admin API — Rapor Uyumluluk Checklist

Bu dokümanda **ADMIN-API-GIDIS-DONUS-RAPORU.md** ile proje frontend/servis karşılaştırması ve create/update işlemlerinde **alınmaması gereken / eksik** alanlar özetlenmiştir.

---

## 1. AdminLesson (Ders listesi)

| Konu | Rapor (create) | Frontend/Servis | Durum |
|------|-----------------|-----------------|--------|
| **Create body** | `name`, `code`, `categorySubId`, `isActive` | Servis: `name`, `code`, `categorySubId`, `isActive` | ✅ Düzeltildi. |
| **Update body** | `name`, `code`, `isActive` | Servis: `name`, `code`, `isActive` | ✅ Düzeltildi. |
| **UI** | Ders = ad/kod taşıyor | Liste: Kod, Ad, Alt kategori; Create/Edit: Kod, Ad, Kategori, Alt kategori, Aktif | ✅ Düzeltildi. |

---

## 2. AdminLessonMain (Ders içeriği)

| Konu | Rapor (create) | Frontend/Servis | Durum |
|------|-----------------|-----------------|--------|
| **Create body** | `name`, `code`, `orderIndex`, `isActive` | Servis: code, name, description?, orderIndex, isActive | ⚠️ Fazla: `description` (raporda yok; opsiyonel kalabilir). |
| **UI** | - | Formda code, name, description, orderIndex, isActive | ⚠️ Description opsiyonel; API kabul etmiyorsa gönderilmemeli. |

---

## 3. AdminLessonSub (Alt konu)

| Konu | Rapor (create) | Frontend/Servis | Durum |
|------|-----------------|-----------------|--------|
| **Create body** | `name`, `code`, `orderIndex`, `isActive` | Servis: code, name, description?, orderIndex, isActive | ⚠️ Fazla: `description` (raporda yok). |
| **UI** | - | Formda description var | ⚠️ Aynı şekilde opsiyonel. |

---

## 4. AdminLessonMikro

| Konu | Rapor (create) | Frontend/Servis | Durum |
|------|-----------------|-----------------|--------|
| **Create body** | LessonMikroCreateDto (name, code, orderIndex, isActive) | Servis: name, code, orderIndex, isActive | ✅ Düzeltildi (description gönderilmiyor). |

---

## 5. AdminCategory

| Konu | Rapor (create) | Frontend/Servis | Durum |
|------|-----------------|-----------------|--------|
| **Create** | multipart: name, code, isActive, file (opsiyonel) | FormData: Code, Name, IsActive, file | ✅ Uyumlu. |
| **UI** | - | code, name, isActive, file | ✅ Uyumlu. |

---

## 6. AdminCategorySub

| Konu | Rapor (create) | Frontend/Servis | Durum |
|------|----------------|-----------------|--------|
| **Create body** | `categoryId`, `code`, `name`, `isActive` | Servis: aynı | ✅ Uyumlu. |

---

## 7. AdminCategoryFeature

| Konu | Rapor (create) | Frontend/Servis | Durum |
|------|----------------|-----------------|--------|
| **Create body** | categorySubId, defaultQuestionCount, defaultDurationMinutes, defaultQuestionOptionCount, usesNegativeMarking, negativeMarkingRule | Servis: aynı alanlar | ✅ Uyumlu. |
| **Update body** | defaultQuestionCount, defaultDurationMinutes, defaultQuestionOptionCount, usesNegativeMarking, negativeMarkingRule | Servis: data olarak gönderiliyor | ✅ Uyumlu. |

---

## 8. AdminCategorySection

| Konu | Rapor (create/update) | Frontend/Servis | Durum |
|------|----------------|-----------------|--------|
| **Create body** | categorySubId, lessonId, lessonMainId?, lessonSubId?, name, orderIndex, questionCount, durationMinutes?, minQuestions, maxQuestions, targetQuestions?, difficultyMix? | Servis: categorySubId, lessonId, lessonSubId?, name, orderIndex, questionCount, durationMinutes?, minQuestions, maxQuestions, targetQuestions?, difficultyMix? | ✅ Uyumlu. |
| **Update body** | lessonId, name, orderIndex, questionCount, durationMinutes (5.5) | Servis ve sayfa: sadece bu 5 alan gönderiliyor | ✅ Düzeltildi. |
| **UI** | - | Categories sayfasında section formu | ✅ lessonId/lessonSubId dropdown (LessonMain / LessonSub). |

---

## 9. AdminExam

| Konu | Rapor (create/update) | Frontend/Servis | Durum |
|------|----------------|-----------------|--------|
| **Create body** | title, description, instructions, publisherId, categoryId, categorySubId, startsAt, endsAt, accessDurationDays, participationQuota, isAdaptive | Frontend: buildCreatePayload ile sadece bu alanlar | ✅ Düzeltildi (blueprint, sections, durationMinutes, graceSeconds create’te gönderilmiyor). |
| **Update body** | title, description, startsAt, endsAt (10.5) | Frontend: buildUpdatePayload ile sadece bu 4 alan | ✅ Düzeltildi. |
| **UI** | Bölümler Yönet > assign ile atanır | Create modda şablon/bölümler gizli; bilgi metni gösteriliyor | ✅ Düzeltildi. |

---

## 10. AdminQuestionBookletTemplate

| Konu | Rapor (create) | Frontend/Servis | Durum |
|------|----------------|-----------------|--------|
| **Create body** | `categorySubId`, `categorySectionId`, `name`, `orderIndex` | Servis: sadece categorySubId, categorySectionId, name, orderIndex | ✅ Düzeltildi. |
| **UI** | Sadece rapor alanları | Create formu: Ad, Kategori (alt liste için), Alt kategori, Bölüm şablonu, Sıra | ✅ Düzeltildi. |

---

## 11. AdminPublisher

| Konu | Rapor (create/update) | Frontend/Servis | Durum |
|------|----------------|-----------------|--------|
| **Create** | multipart: name, code, isActive, file (opsiyonel) | Servis ve sayfa: sadece name, code, isActive, file | ✅ Düzeltildi. |
| **Update body** | name, code, isActive (16.4) | Servis ve sayfa: sadece name, code, isActive | ✅ Düzeltildi. |
| **UI** | - | Forma Kod alanı eklendi | ✅ Düzeltildi. |

---

## 12. AdminCoupon

| Konu | Rapor (create) | Frontend/Servis | Durum |
|------|----------------|-----------------|--------|
| **Create body** | code, discountPercent, validFrom, validUntil, maxUseCount, isActive | buildCreatePayload: bu alan adlarıyla (form → rapor eşlemesi) | ✅ Düzeltildi. |

---

## 13. AdminSubscriptionPackage

| Konu | Rapor (create) | Frontend/Servis | Durum |
|------|----------------|-----------------|--------|
| **Create body** | name, description, durationDays, price, currency, isActive | buildCreatePayload: durationDays (validityDays), price (packagePrice), currency: TRY | ✅ Düzeltildi. |

---

## 14. AdminReferralCampaign

| Konu | Rapor (create) | Frontend/Servis | Durum |
|------|----------------|-----------------|--------|
| **Create body** | name, description, rewardType, rewardValue, validFrom, validUntil, isActive | buildCreatePayload: bu alan adlarıyla; formda description eklendi | ✅ Düzeltildi. |

---

## 15. AdminQuestion (Soru havuzu — Rapor 12)

| Konu | Rapor | Frontend/Servis | Durum |
|------|-------|-----------------|--------|
| **GET all / by-lesson / by-lesson-sub / by-publisher** | 12.1–12.4 | adminQuestionService.js: getAllQuestions, getQuestionsByLessonId, getQuestionsByLessonSubId, getQuestionsByPublisherId | ✅ Eklendi. |
| **POST create** | stem, lessonId, lessonSubId?, publisherId?, options[], correctOptionKey | createQuestion | ✅ Eklendi. |
| **GET by id** | ?id=&includeOptions=true | getQuestionById | ✅ Eklendi. |
| **PUT update / DELETE delete** | 12.7, 12.8 | updateQuestion, deleteQuestion | ✅ Eklendi. |
| **UI** | Soru havuzu sayfası | QuestionPool.jsx şu an placeholder | ⚠️ İçerik sonra bağlanabilir. |

---

## 16. AdminQuestionBooklet (add, add-by-code, bulk-import)

| Konu | Rapor | Frontend/Servis | Durum |
|------|-------|-----------------|--------|
| **add / add-by-code** | 14.4, 14.5 | addQuestionToBooklet, addQuestionToBookletByCode | ✅ Uyumlu. |
| **bulk-import/json** | 14.8 | bulkImportJson | ✅ Uyumlu. |
| **bulk-import/excel** | 14.9 | bulkImportExcel | ✅ Uyumlu. |
| **bulk-import/pdf** | 14.10 (file, lessonId, lessonSubId?, publisherId?) | bulkImportPdf | ✅ Eklendi. |
| **bulk-import/word** | 14.11 (file, lessonId, lessonSubId?, publisherId?) | bulkImportWord | ✅ Eklendi. |
| **UI** | JSON, Excel, PDF, Word ile havuza toplu yükleme | Booklets.jsx: dört sekme (JSON, Excel, PDF, Word) | ✅ Eklendi. |

---

## 17. AdminQuestionSolution (Rapor 13)

| Konu | Rapor (create 13.4) | Frontend/Servis | Durum |
|------|---------------------|-----------------|--------|
| **Create body** | questionId, solutionType, content, videoUrl?, pdfUrl?, externalLink? | createQuestionSolution: rapor alanlarına eşlendi (type/contentText/url → solutionType/content/videoUrl/pdfUrl/externalLink) | ✅ Düzeltildi. |

---

## 18. Genel UI/UX ve CSS

| Konu | Beklenti | Durum |
|------|----------|--------|
| Ortak sınıflar | admin-card, admin-table, admin-btn, admin-input, admin-modal | ✅ index.css’te tanımlı. |
| Sayfa yapısı | admin-page-wrapper, admin-page-header, admin-page-title | ✅ Kullanılıyor. |
| Boş / yükleme | admin-empty-state, admin-loading-center, admin-spinner | ✅ Kullanılıyor. |
| Süreç karmaşıklığı | Create adımları gereksiz uzun veya çok alan toplanmamalı | ✅ BookletTemplate ve Lesson create rapora göre sadeleştirildi. |

---

## Yapılan Düzeltmeler (Özet)

1. **AdminLesson:** Create/update rapora göre. Servis: `name`, `code`, `categorySubId`, `isActive` (create); `name`, `code`, `isActive` (update).
2. **AdminLessonMain / AdminLessonSub / AdminLessonMikro:** Create body’den `description` kaldırıldı; sadece name, code, orderIndex, isActive gönderiliyor (Rapor 7.3, 8.3).
3. **AdminCategorySection:** Update body rapor 5.5’e göre sadece lessonId, name, orderIndex, questionCount, durationMinutes. Servis ve Categories sayfası güncellendi.
4. **AdminExam:** Create sadece rapor 10.4 alanları (buildCreatePayload); update sadece title, description, startsAt, endsAt (buildUpdatePayload). Create modda şablon/bölümler UI’da gizlendi; bilgi metni eklendi.
5. **AdminQuestionBookletTemplate create:** Servis sadece categorySubId, categorySectionId, name, orderIndex. Create formu sadeleştirildi.
6. **AdminPublisher:** Create multipart sadece name, code, isActive, file; update sadece name, code, isActive. Forma Kod alanı eklendi.
7. **AdminCoupon create:** buildCreatePayload rapor 17.2 alan adları: code, discountPercent, validFrom, validUntil, maxUseCount, isActive.
8. **AdminSubscriptionPackage create:** buildCreatePayload rapor 18.2: name, description, durationDays, price, currency, isActive (validityDays→durationDays, packagePrice→price).
9. **AdminReferralCampaign create:** buildCreatePayload rapor 19.2: name, description, rewardType, rewardValue, validFrom, validUntil, isActive; formda description eklendi.
10. **AdminQuestion (soru havuzu):** adminQuestionService.js eklendi; Rapor 12 uyarınca all, by-lesson, by-lesson-sub, by-publisher, create, getById, update, delete.
11. **AdminQuestionBooklet toplu yükleme:** bulkImportPdf ve bulkImportWord servise eklendi (rapor 14.10, 14.11). Booklets.jsx’te JSON, Excel, PDF, Word dört sekmesi ile soru havuzuna toplu yükleme tamamlandı.
12. **AdminQuestionSolution create:** Rapor 13.4’e göre create body solutionType, content, videoUrl, pdfUrl, externalLink olacak şekilde eşlendi.

Bu checklist, **ADMIN-API-GIDIS-DONUS-RAPORU.md** ile tek tek karşılaştırılarak güncellenebilir.
