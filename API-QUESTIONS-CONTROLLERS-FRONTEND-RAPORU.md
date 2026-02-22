# API Questions Controllers — Frontend Gidiş/Geliş Raporu

Bu rapor `API/Controllers/Questions/` altındaki tüm controller'ların endpoint'lerini, örnek istek (gidiş) ve cevap (geliş) formatlarıyla açıklar. Frontend entegrasyonu için kullanılır.

---

## Genel Bilgiler

| Bilgi | Değer |
|--------|--------|
| **Base URL** | `{API_BASE}/api` |
| **Kimlik doğrulama** | Tüm endpoint'ler `[Authorize]` — Header: `Authorization: Bearer {JWT_TOKEN}` |
| **Swagger grubu** | `admin` |
| **Content-Type** | `application/json` |

---

## 1. AdminQuestionBookletTemplateController

**Route:** `api/AdminQuestionBookletTemplate`  
**Açıklama:** Kitapçık şablonu (QuestionBookletTemplate) — sınav alt kategorisi ve bölüme göre şablon satırı oluşturulur.

---

### 1.1 Tüm şablonları listele

**Method:** `GET`  
**URL:** `GET /api/AdminQuestionBookletTemplate`

**İstek (Gidiş):**
- Header: `Authorization: Bearer {token}`
- Body: yok

**Başarılı cevap (200):**
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "code": "TPL-TRK-01",
    "name": "Türkçe Bölüm 1",
    "description": "Türkçe ilk bölüm şablonu",
    "difficultyMix": "Medium",
    "categoryId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "categorySubId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "questionsTemplateId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "categorySectionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "targetQuestionCount": 20,
    "totalQuestionCount": 0,
    "orderIndex": 1,
    "isActive": true,
    "createdAt": "2025-02-22T12:00:00Z",
    "updatedAt": null,
    "createdByAdminId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "lastUpdatedByAdminId": null
  }
]
```

**Hata (500):**
```json
{
  "error": "Şablonlar listelenirken bir hata oluştu."
}
```

---

### 1.2 Id ile şablon getir

**Method:** `GET`  
**URL:** `GET /api/AdminQuestionBookletTemplate/{id}`  
**Parametre:** `id` (Guid, path)

**İstek (Gidiş):**
- Örnek: `GET /api/AdminQuestionBookletTemplate/3fa85f64-5717-4562-b3fc-2c963f66afa6`

**Başarılı cevap (200):**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "code": "TPL-TRK-01",
  "name": "Türkçe Bölüm 1",
  "description": "Türkçe ilk bölüm",
  "difficultyMix": "Medium",
  "categoryId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "categorySubId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "questionsTemplateId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "categorySectionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "targetQuestionCount": 20,
  "totalQuestionCount": 0,
  "orderIndex": 1,
  "isActive": true,
  "createdAt": "2025-02-22T12:00:00Z",
  "updatedAt": null,
  "createdByAdminId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "lastUpdatedByAdminId": null
}
```

**Hata (404):**
```json
{
  "error": "Şablon bulunamadı."
}
```

---

### 1.3 Alt kategoriye göre şablonları listele

**Method:** `GET`  
**URL:** `GET /api/AdminQuestionBookletTemplate/by-category-sub/{categorySubId}`  
**Parametre:** `categorySubId` (Guid, path)

**İstek (Gidiş):**
- Örnek: `GET /api/AdminQuestionBookletTemplate/by-category-sub/3fa85f64-5717-4562-b3fc-2c963f66afa6`

**Başarılı cevap (200):** 1.1 ile aynı dizi yapısı.

**Hata (500):**
```json
{
  "error": "Şablonlar listelenirken bir hata oluştu."
}
```

---

### 1.4 Şablon setine göre satırları listele

**Method:** `GET`  
**URL:** `GET /api/AdminQuestionBookletTemplate/by-template-set/{questionsTemplateId}`  
**Parametre:** `questionsTemplateId` (Guid, path)

**İstek (Gidiş):**
- Örnek: `GET /api/AdminQuestionBookletTemplate/by-template-set/3fa85f64-5717-4562-b3fc-2c963f66afa6`

**Başarılı cevap (200):** 1.1 ile aynı dizi yapısı.

---

### 1.5 Yeni kitapçık şablonu oluştur

**Method:** `POST`  
**URL:** `POST /api/AdminQuestionBookletTemplate`

**İstek (Gidiş):**
```json
{
  "code": "TPL-MAT-01",
  "name": "Matematik Bölüm 1",
  "description": "Matematik ilk bölüm",
  "difficultyMix": "Medium",
  "categoryId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "categorySubId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "categorySectionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "targetQuestionCount": 15,
  "isActive": true,
  "orderIndex": 1,
  "questionsTemplateId": null
}
```
- `questionsTemplateId`: `null` ise yeni şablon seti oluşturulur; dolu ise mevcut sete bölüm eklenir.

**Başarılı cevap (200):**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "code": "TPL-MAT-01",
  "name": "Matematik Bölüm 1",
  "description": "Matematik ilk bölüm",
  "difficultyMix": "Medium",
  "categoryId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "categorySubId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "questionsTemplateId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "categorySectionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "targetQuestionCount": 15,
  "totalQuestionCount": 0,
  "orderIndex": 1,
  "isActive": true,
  "createdAt": "2025-02-22T12:00:00Z",
  "updatedAt": null,
  "createdByAdminId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "lastUpdatedByAdminId": null
}
```

**Hata (500):**
```json
{
  "error": "Kitapçık şablonu oluşturulurken bir hata oluştu."
}
```

---

### 1.6 Şablon güncelle

**Method:** `PUT`  
**URL:** `PUT /api/AdminQuestionBookletTemplate/{id}`  
**Parametre:** `id` (Guid, path)

**İstek (Gidiş):**
```json
{
  "code": "TPL-MAT-01-V2",
  "name": "Matematik Bölüm 1 (güncel)",
  "description": null,
  "difficultyMix": "Hard",
  "categoryId": null,
  "categorySubId": null,
  "categorySectionId": null,
  "targetQuestionCount": 20,
  "totalQuestionCount": null,
  "isActive": false,
  "orderIndex": 2
}
```
- Tüm alanlar opsiyonel; gönderilen alanlar güncellenir.

**Başarılı cevap (200):** Güncellenmiş tek şablon objesi (1.2 ile aynı yapı).

**Hata (404):**
```json
{
  "error": "Şablon bulunamadı."
}
```

---

### 1.7 Şablon sil

**Method:** `DELETE`  
**URL:** `DELETE /api/AdminQuestionBookletTemplate/{id}`  
**Parametre:** `id` (Guid, path)

**İstek (Gidiş):**
- Örnek: `DELETE /api/AdminQuestionBookletTemplate/3fa85f64-5717-4562-b3fc-2c963f66afa6`

**Başarılı cevap (204):** Body yok.

**Hata (404):**
```json
{
  "error": "Şablon bulunamadı."
}
```

---

## 2. AdminQuestionBookletController

**Route:** `api/AdminQuestionBooklet`  
**Açıklama:** Kitapçık (QuestionBooklet) — sınav için şablondan oluşturulur, bölümlere soru eklenir.

---

### 2.1 Sınava ait kitapçık satırlarını listele

**Method:** `GET`  
**URL:** `GET /api/AdminQuestionBooklet/by-exam/{examId}`  
**Parametre:** `examId` (Guid, path)

**İstek (Gidiş):**
- Örnek: `GET /api/AdminQuestionBooklet/by-exam/3fa85f64-5717-4562-b3fc-2c963f66afa6`

**Başarılı cevap (200):**
```json
[
  {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "examId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "examSectionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "questionsTemplateId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "lessonId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Türkçe",
    "lessonName": null,
    "orderIndex": 1,
    "questionId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "questionCode": "TRK123456",
    "stem": "Aşağıdaki cümlelerin hangisinde yazım yanlışı vardır?",
    "optionsJson": null,
    "correctOptionKey": "B",
    "createdAt": "2025-02-22T12:00:00Z"
  }
]
```

**Hata (500):**
```json
{
  "error": "Kitapçık listelenirken bir hata oluştu."
}
```

---

### 2.2 Kitapçık satırı detayı

**Method:** `GET`  
**URL:** `GET /api/AdminQuestionBooklet/{id}`  
**Parametre:** `id` (Guid, path)

**İstek (Gidiş):**
- Örnek: `GET /api/AdminQuestionBooklet/b2c3d4e5-f6a7-8901-bcde-f12345678901`

**Başarılı cevap (200):** Tek eleman, 2.1'deki obje yapısıyla aynı.

**Hata (404):**
```json
{
  "error": "Kitapçık satırı bulunamadı."
}
```

---

### 2.3 Kitapçık bölümüne yeni soru ekle

**Method:** `POST`  
**URL:** `POST /api/AdminQuestionBooklet/add-question`

**İstek (Gidiş):**
```json
{
  "examId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "examSectionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "lessonId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "Türkçe",
  "orderIndex": 1,
  "questionsTemplateId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "questionTemplateItemId": null,
  "stem": "Aşağıdaki cümlelerin hangisinde yazım yanlışı vardır?",
  "options": [
    { "optionKey": "A", "text": "Günlerdir yağmur yağıyor.", "orderIndex": 1 },
    { "optionKey": "B", "text": "Bu işi yarın yapabiliriz.", "orderIndex": 2 },
    { "optionKey": "C", "text": "Herkez toplantıda olacak.", "orderIndex": 3 },
    { "optionKey": "D", "text": "Kitabı okudum.", "orderIndex": 4 }
  ],
  "correctOptionKey": "C",
  "lessonSubId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "publisherId": null
}
```
- `examSectionId` = `QuestionBookletTemplate.Id` (bölüm şablonu). Boşsa `questionsTemplateId` kullanılır.
- `stem`, `options`, `correctOptionKey` zorunludur.

**Başarılı cevap (200):**
```json
{
  "id": "d4e5f6a7-b8c9-0123-def0-234567890123",
  "examId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "examSectionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "questionsTemplateId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "lessonId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "Türkçe",
  "lessonName": null,
  "orderIndex": 1,
  "questionId": "e5f6a7b8-c9d0-1234-ef01-345678901234",
  "questionCode": "TRK234567",
  "stem": "Aşağıdaki cümlelerin hangisinde yazım yanlışı vardır?",
  "optionsJson": null,
  "correctOptionKey": "C",
  "createdAt": "2025-02-22T12:05:00Z"
}
```

**Hata (400):**
```json
{
  "error": "Soru eklenemedi. Stem, Options ve CorrectOptionKey gerekli; ExamSectionId/QuestionsTemplateId (bölüm şablonu) belirtilmeli."
}
```

**Hata (500):**
```json
{
  "error": "Soru eklenirken bir hata oluştu."
}
```

---

### 2.4 Kitapçıktan soru satırını kaldır

**Method:** `DELETE`  
**URL:** `DELETE /api/AdminQuestionBooklet/{id}`  
**Parametre:** `id` (Guid, path) — kitapçık satırı Id'si

**İstek (Gidiş):**
- Örnek: `DELETE /api/AdminQuestionBooklet/d4e5f6a7-b8c9-0123-def0-234567890123`

**Başarılı cevap (204):** Body yok.

**Hata (404):**
```json
{
  "error": "Kitapçık satırı bulunamadı."
}
```

---

## 3. AdminQuestionController

**Route:** `api/AdminQuestion`  
**Açıklama:** Soru (Question) — kitapçıklardaki soruları getirme ve kitapçık bölümüne soru ekleme.

---

### 3.1 Id ile soru getir

**Method:** `GET`  
**URL:** `GET /api/AdminQuestion/{id}`  
**Parametre:** `id` (Guid, path)

**İstek (Gidiş):**
- Örnek: `GET /api/AdminQuestion/3fa85f64-5717-4562-b3fc-2c963f66afa6`

**Başarılı cevap (200):**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "code": "TRK123456",
  "stem": "Aşağıdaki cümlelerin hangisinde yazım yanlışı vardır?",
  "publisherId": null,
  "lessonSubId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "createdAt": "2025-02-22T12:00:00Z",
  "updatedAt": null,
  "options": [
    { "id": "3fa85f64-5717-4562-b3fc-2c963f66afa7", "optionKey": "A", "orderIndex": 1 },
    { "id": "3fa85f64-5717-4562-b3fc-2c963f66afa8", "optionKey": "B", "orderIndex": 2 },
    { "id": "3fa85f64-5717-4562-b3fc-2c963f66afa9", "optionKey": "C", "orderIndex": 3 },
    { "id": "3fa85f64-5717-4562-b3fc-2c963f66afaa", "optionKey": "D", "orderIndex": 4 }
  ],
  "correctOptionKey": "C"
}
```

**Hata (404):**
```json
{
  "error": "Soru bulunamadı."
}
```

---

### 3.2 Code ile soru getir

**Method:** `GET`  
**URL:** `GET /api/AdminQuestion/by-code/{code}`  
**Parametre:** `code` (string, path) — örn. `TRK123456`

**İstek (Gidiş):**
- Örnek: `GET /api/AdminQuestion/by-code/TRK123456`

**Başarılı cevap (200):** 3.1 ile aynı soru objesi.

**Hata (404):**
```json
{
  "error": "Soru bulunamadı."
}
```

---

### 3.3 Soruları sayfalı listele (filtreli)

**Method:** `GET`  
**URL:** `GET /api/AdminQuestion?skip=0&take=20&lessonSubId=&publisherId=`  
**Query parametreleri:**

| Parametre     | Tip   | Varsayılan | Açıklama                          |
|---------------|-------|------------|-----------------------------------|
| `skip`        | int   | 0          | Atlanacak kayıt sayısı            |
| `take`        | int   | 20         | Alınacak kayıt sayısı (max 100)  |
| `lessonSubId` | Guid? | null       | Alt ders/konu filtresi            |
| `publisherId` | Guid? | null       | Yayınevi filtresi                 |

**İstek (Gidiş):**
- Örnek: `GET /api/AdminQuestion?skip=0&take=10&lessonSubId=3fa85f64-5717-4562-b3fc-2c963f66afa6`

**Başarılı cevap (200):**
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "code": "TRK123456",
    "stem": "Aşağıdaki cümlelerin hangisinde yazım yanlışı vardır?",
    "publisherId": null,
    "lessonSubId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "createdAt": "2025-02-22T12:00:00Z",
    "updatedAt": null,
    "options": [
      { "id": "3fa85f64-5717-4562-b3fc-2c963f66afa7", "optionKey": "A", "orderIndex": 1 },
      { "id": "3fa85f64-5717-4562-b3fc-2c963f66afa8", "optionKey": "B", "orderIndex": 2 }
    ],
    "correctOptionKey": "C"
  }
]
```

**Hata (500):**
```json
{
  "error": "Soru listesi alınırken bir hata oluştu."
}
```

---

### 3.4 Kitapçık bölümüne soru ekle (add-to-booklet)

**Method:** `POST`  
**URL:** `POST /api/AdminQuestion/add-to-booklet`

**İstek (Gidiş):** AdminQuestionBookletController 2.3 ile aynı body (`QuestionBookletCreateDto`).

```json
{
  "examId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "examSectionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "lessonId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "Türkçe",
  "orderIndex": 1,
  "questionsTemplateId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "stem": "Soru metni buraya yazılır.",
  "options": [
    { "optionKey": "A", "text": "Şık A metni", "orderIndex": 1 },
    { "optionKey": "B", "text": "Şık B metni", "orderIndex": 2 },
    { "optionKey": "C", "text": "Şık C metni", "orderIndex": 3 },
    { "optionKey": "D", "text": "Şık D metni", "orderIndex": 4 }
  ],
  "correctOptionKey": "B",
  "lessonSubId": null,
  "publisherId": null
}
```

**Başarılı cevap (200):** 2.3 ile aynı — oluşturulan kitapçık satırı (QuestionBookletDto).

**Hata (400):**
```json
{
  "error": "Soru eklenemedi. Stem, Options ve CorrectOptionKey gerekli; bölüm şablonu (ExamSectionId/QuestionsTemplateId) belirtilmeli."
}
```

---

## 4. AdminQuestionSolutionController

**Route:** `api/AdminQuestionSolution`  
**Açıklama:** Soru çözümü (QuestionSolution) yönetimi.  
**Durum:** Şu an tanımlı endpoint yok; controller boş. İleride çözüm ekleme/listeleme endpoint'leri eklenebilir.

---

## Özet Tablo

| Controller                         | GET | POST | PUT | DELETE |
|-----------------------------------|-----|------|-----|--------|
| AdminQuestionBookletTemplate      | 4   | 1    | 1   | 1      |
| AdminQuestionBooklet              | 2   | 1    | 0   | 1      |
| AdminQuestion                     | 3   | 1    | 0   | 0      |
| AdminQuestionSolution             | 0   | 0    | 0   | 0      |

---

## Frontend Notları

1. **Auth:** Her istekte `Authorization: Bearer {JWT}` header'ı gönderin.
2. **Guid:** Tüm id'ler UUID (örn. `3fa85f64-5717-4562-b3fc-2c963f66afa6`).
3. **Tarih:** ISO 8601 (örn. `2025-02-22T12:00:00Z`).
4. **Bölüm şablonu:** Kitapçığa soru eklerken `examSectionId` veya `questionsTemplateId` mutlaka dolu olmalı; ikisi de `QuestionBookletTemplate.Id` anlamına gelir.
5. **Soru ekleme:** Artık havuz yok; soru her zaman kitapçık bölümüne **içerikle** (stem, options, correctOptionKey) eklenir. Hem `POST /api/AdminQuestionBooklet/add-question` hem `POST /api/AdminQuestion/add-to-booklet` aynı body ile kullanılabilir.
