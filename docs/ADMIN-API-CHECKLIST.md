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
| **Create body** | LessonMikroCreateDto (name, code, orderIndex, isActive muhtemelen) | Servis: code, name, description?, orderIndex, isActive | ⚠️ Description raporda belirtilmemiş. |

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
| **Create body** | categorySubId, defaultQuestionCount, defaultDurationMinutes, defaultQuestionOptionCount, usesNegativeMarking, negativeMarkingRule | Mevcut servis ile karşılaştırılmalı | - |

---

## 8. AdminCategorySection

| Konu | Rapor (create) | Frontend/Servis | Durum |
|------|----------------|-----------------|--------|
| **Create body** | categorySubId, lessonId, lessonMainId?, lessonSubId?, name, orderIndex, questionCount, durationMinutes?, minQuestions, maxQuestions, targetQuestions?, difficultyMix? | Servis: categorySubId, lessonId, lessonSubId?, name, orderIndex, questionCount, durationMinutes?, minQuestions, maxQuestions, targetQuestions?, difficultyMix? | ✅ lessonId = LessonMain id kullanılıyor; raporla uyumlu. |
| **UI** | - | Categories sayfasında section formu | ✅ lessonId/lessonSubId dropdown (LessonMain / LessonSub). |

---

## 9. AdminExam

| Konu | Rapor (create) | Frontend/Servis | Durum |
|------|----------------|-----------------|--------|
| **Create body** | title, description, instructions, publisherId, categoryId, categorySubId, startsAt, endsAt, accessDurationDays, participationQuota, isAdaptive | Frontend: aynılar + durationMinutes, graceSeconds, blueprint, sections | ⚠️ Rapor örneğinde durationMinutes, graceSeconds, blueprint, sections yok. Backend bunları create’te bekliyorsa sorun yok; sadece rapor minimal örnek olabilir. |
| **UI** | - | Formda tüm alanlar | İş akışı gereği gerekli olanlar toplanıyor. |

---

## 10. AdminQuestionBookletTemplate

| Konu | Rapor (create) | Frontend/Servis | Durum |
|------|----------------|-----------------|--------|
| **Create body** | `categorySubId`, `categorySectionId`, `name`, `orderIndex` | Servis: sadece categorySubId, categorySectionId, name, orderIndex | ✅ Düzeltildi. |
| **UI** | Sadece rapor alanları | Create formu: Ad, Kategori (alt liste için), Alt kategori, Bölüm şablonu, Sıra | ✅ Düzeltildi. |

---

## 11. AdminQuestionBooklet (add / add-by-code)

| Konu | Rapor | Frontend/Servis | Durum |
|------|-------|-----------------|--------|
| **add** | examId, examSectionId, lessonId, name?, orderIndex?, questionsTemplateId?, questionTemplateItemId?, questionId?, questionCode? | Servis uyumlu | - |
| **add-by-code** | examId, examSectionId, questionCode, orderIndex?, questionsTemplateId?, questionTemplateItemId? | Servis uyumlu | - |

---

## 12. Genel UI/UX ve CSS

| Konu | Beklenti | Durum |
|------|----------|--------|
| Ortak sınıflar | admin-card, admin-table, admin-btn, admin-input, admin-modal | ✅ index.css’te tanımlı. |
| Sayfa yapısı | admin-page-wrapper, admin-page-header, admin-page-title | ✅ Kullanılıyor. |
| Boş / yükleme | admin-empty-state, admin-loading-center, admin-spinner | ✅ Kullanılıyor. |
| Süreç karmaşıklığı | Create adımları gereksiz uzun veya çok alan toplanmamalı | ⚠️ BookletTemplate create formu rapora göre sadeleştirilebilir. Lesson create’te rapora göre name/code eklenmeli. |

---

## Yapılan Düzeltmeler (Özet)

1. **AdminLesson:** Create/update rapora göre güncellendi. Servis: `name`, `code`, `categorySubId`, `isActive` (create); `name`, `code`, `isActive` (update). UI: Liste kolonları Kod, Ad, Alt kategori, Durum; create/edit formda Kod, Ad, Kategori, Alt kategori, Aktif.
2. **AdminQuestionBookletTemplate create:** Servis sadece `categorySubId`, `categorySectionId`, `name`, `orderIndex` gönderiyor. Create formu sadeleştirildi: Ad, Kategori (alt kategori listesi için), Alt kategori, Bölüm şablonu, Sıra. Kod, açıklama, zorluk dağılımı, hedef soru, aktif create’te toplanmıyor/gönderilmiyor.
3. **AdminExam create:** Rapor minimal örnek; backend ek alan (blueprint, sections vb.) bekliyorsa mevcut gönderim korundu. Değişiklik yapılmadı.
4. **LessonMain / LessonSub / Mikro:** `description` raporda örnekte yok; opsiyonel bırakıldı, backend kabul ediyorsa gönderilmeye devam ediyor.

Bu checklist, **ADMIN-API-GIDIS-DONUS-RAPORU.md** ile tek tek karşılaştırılarak güncellenebilir.
