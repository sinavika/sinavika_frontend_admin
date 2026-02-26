# API Exam ve QuestionBooklet Endpoint Raporu

Bu rapor **AdminExamController** ve **AdminQuestionBookletController** içindeki tüm endpoint'leri, DTO değişikliklerini, yeni/ güncellenen endpoint'leri ve örnek istek/yanıtları içerir.

**Temel URL:** `api/[controller]`  
**Yetkilendirme:** Tüm endpoint'ler `[Authorize]` ile korunur; Admin JWT gerekir.  
**Swagger grubu:** `admin`

---

## İçindekiler

1. [DTO Özeti ve Değişiklikler](#1-dto-özeti-ve-değişiklikler)
2. [AdminExamController](#2-adminexamcontroller)
3. [AdminQuestionBookletController](#3-adminquestionbookletcontroller)

---

## 1. DTO Özeti ve Değişiklikler

### 1.1 Exam DTO'ları (Data.Dtos.Exams)

| DTO | Açıklama | Değişiklik / Not |
|-----|----------|-------------------|
| **AdminExamDto** | Sınav listeleme/detay | **Güncellendi:** `QuestionBookletId`, `BookletCode` eklendi. `PublisherId`, `CategoryId`, `CategorySubId` artık kitapçıktan türetilir (okuma amaçlı). |
| **AdminExamCreateDto** | Sınav oluşturma | **Güncellendi:** `BookletCode` (zorunlu) eklendi. `PublisherId`, `CategoryId`, `CategorySubId`, `BookletIds`, `BookletCodes` kaldırıldı. Sınav tek kitapçık kodu ile oluşturulur. |
| **AdminExamUpdateDto** | Sınav güncelleme | **Güncellendi:** `PublisherId`, `CategoryId`, `CategorySubId` kaldırıldı (kategori ve yayınevi kitapçıktan gelir, güncellenemez). |

**AdminExamDto alanları (güncel):**

```json
{
  "id": "guid",
  "questionBookletId": "guid",
  "bookletCode": "string",
  "publisherId": "guid?",
  "categoryId": "guid",
  "categorySubId": "guid",
  "status": 0,
  "title": "string",
  "description": "string?",
  "instructions": "string?",
  "startsAt": "datetime?",
  "endsAt": "datetime?",
  "accessDurationDays": 0,
  "participationQuota": 0,
  "isAdaptive": false,
  "isLocked": false,
  "lockedAt": "datetime?",
  "lockedByAdminId": "guid?",
  "createdAt": "datetime",
  "updatedAt": "datetime?",
  "createdByAdminId": "guid?",
  "lastUpdatedByAdminId": "guid?",
  "blueprint": { ... },
  "sections": [ ... ],
  "assignedTemplates": [ ... ],
  "assignedQuestionCount": 0
}
```

**AdminExamCreateDto (güncel):**

```json
{
  "title": "string",
  "description": "string?",
  "instructions": "string?",
  "bookletCode": "string",
  "startsAt": "datetime?",
  "endsAt": "datetime?",
  "accessDurationDays": 0,
  "participationQuota": 0,
  "isAdaptive": false
}
```

---

### 1.2 QuestionBooklet DTO'ları (Data.Dtos.Questions.Booklet)

| DTO | Açıklama | Değişiklik / Not |
|-----|----------|-------------------|
| **QuestionBookletDto** | Kitapçık listeleme/detay | **Güncellendi:** `PublisherId`, `Status` (0=Taslak, 1=Hazırlanıyor, 2=Hazırlandı, 3=Tamamlandı, 4=SınavAşamasında) eklendi. |
| **QuestionBookletCreateDto** | Kitapçık oluşturma | **Güncellendi:** `PublisherId` (opsiyonel) eklendi. |
| **AddQuestionToBookletDto** | Slota soru ekleme | **Güncellendi:** `PublisherId` kaldırıldı (yayınevi kitapçıkta tanımlı). |
| **UpdateQuestionInBookletDto** | Slottaki soruyu güncelleme | **Güncellendi:** `PublisherId` kaldırıldı. |
| **BulkQuestionRowDto** | Toplu soru şablonu | **Güncellendi:** `PublisherId` kaldırıldı. |

**QuestionBookletDto alanları (güncel):**

```json
{
  "id": "guid",
  "code": "string",
  "categorySubId": "guid",
  "categorySubName": "string?",
  "name": "string",
  "publisherId": "guid?",
  "status": 0,
  "createdAt": "datetime",
  "slots": [ ... ]
}
```

**BookletStatus enum (Status alanı):**  
`0` = Taslak, `1` = Hazırlanıyor, `2` = Hazırlandı, `3` = Tamamlandı, `4` = SınavAşamasında

---

## 2. AdminExamController

**Base route:** `api/AdminExam`

### 2.1 GET – Tüm sınavları listele

| Özellik | Değer |
|--------|--------|
| **Method / URL** | `GET /api/AdminExam/all` |
| **Açıklama** | Tüm sınavları listeler. |
| **Query/Route** | Yok |
| **Response** | `200` → `List<AdminExamDto>` |

**Örnek yanıt (200):**

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "questionBookletId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "bookletCode": "BK-TYT-001",
    "publisherId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "categoryId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "categorySubId": "d4e5f6a7-b8c9-0123-def0-234567890123",
    "status": 0,
    "title": "TYT Deneme 1",
    "description": null,
    "instructions": null,
    "startsAt": null,
    "endsAt": null,
    "accessDurationDays": 7,
    "participationQuota": null,
    "isAdaptive": false,
    "isLocked": false,
    "lockedAt": null,
    "lockedByAdminId": null,
    "createdAt": "2025-02-26T10:00:00Z",
    "updatedAt": null,
    "createdByAdminId": "e5f6a7b8-c9d0-1234-ef01-345678901234",
    "lastUpdatedByAdminId": null,
    "blueprint": null,
    "sections": [],
    "assignedTemplates": [],
    "assignedQuestionCount": 0
  }
]
```

---

### 2.2 GET – Duruma göre sınavları listele

| Özellik | Değer |
|--------|--------|
| **Method / URL** | `GET /api/AdminExam/by-status/{status}` |
| **Açıklama** | Belirtilen status değerine göre sınavları listeler. |
| **Route** | `status` (int): 0=Draft, 1=Scheduled, 2=Published, 3=InProgress, 4=Closed, 5=Ended, 6=Archived |
| **Response** | `200` → `List<AdminExamDto>` |

**Örnek istek:** `GET /api/AdminExam/by-status/0`  
**Örnek yanıt:** Yukarıdaki liste yapısı ile aynı (ilgili status’e göre filtrelenmiş).

---

### 2.3 GET – Sınav detayı (Id ile)

| Özellik | Değer |
|--------|--------|
| **Method / URL** | `GET /api/AdminExam?id={id}` |
| **Açıklama** | Tek bir sınavın detayını döner. |
| **Query** | `id` (Guid) |
| **Response** | `200` → `AdminExamDto` \| `404` → Sınav bulunamadı |

**Örnek istek:** `GET /api/AdminExam?id=3fa85f64-5717-4562-b3fc-2c963f66afa6`  
**Örnek yanıt (200):** Tek bir `AdminExamDto` objesi (yukarıdaki yapıda).

---

### 2.4 POST – Sınav oluştur (Güncellendi)

| Özellik | Değer |
|--------|--------|
| **Method / URL** | `POST /api/AdminExam/create` |
| **Açıklama** | **BookletCode** (QuestionBooklet.Code) ile sınav oluşturur. Sınav bu kitapçığa bağlanır; kategori ve yayınevi kitapçıktan alınır. |
| **Body** | `AdminExamCreateDto` |
| **Response** | `200` → `{ Message, ExamId, BookletCode }` \| `400` \| `404` (kitapçık bulunamadı) |

**Örnek istek (Body):**

```json
{
  "title": "TYT Deneme Sınavı 1",
  "description": "Mart denemesi",
  "instructions": "Süre 120 dakikadır.",
  "bookletCode": "BK-TYT-001",
  "startsAt": "2025-03-01T09:00:00Z",
  "endsAt": "2025-03-01T12:00:00Z",
  "accessDurationDays": 7,
  "participationQuota": 1000,
  "isAdaptive": false
}
```

**Örnek yanıt (200):**

```json
{
  "message": "Sınav oluşturuldu.",
  "examId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "bookletCode": "BK-TYT-001"
}
```

**Örnek hata (404 – kitapçık bulunamadı):**

```json
{
  "error": "Belirtilen kitapçık kodu bulunamadı: BK-YANLIS"
}
```

**Örnek hata (400 – BookletCode boş):**

```json
{
  "error": "Kitapçık kodu (BookletCode) zorunludur."
}
```

---

### 2.5 PUT – Sınav güncelle

| Özellik | Değer |
|--------|--------|
| **Method / URL** | `PUT /api/AdminExam/update?id={id}` |
| **Body** | `AdminExamUpdateDto` (kategori/yayınevi alanları yok) |
| **Response** | `200` \| `404` \| `400` |

**Örnek istek (Body):**

```json
{
  "title": "TYT Deneme Sınavı 1 (Güncel)",
  "description": "Nisan denemesi",
  "startsAt": "2025-04-01T09:00:00Z",
  "endsAt": "2025-04-01T12:00:00Z",
  "status": 1
}
```

---

### 2.6 DELETE – Sınav sil

| Özellik | Değer |
|--------|--------|
| **Method / URL** | `DELETE /api/AdminExam/delete?id={id}` |
| **Response** | `200` → `{ Message }` \| `404` |

---

### 2.7 POST – Sınav yayınla

| Özellik | Değer |
|--------|--------|
| **Method / URL** | `POST /api/AdminExam/publish?id={id}` |
| **Response** | `200` → `{ Message }` \| `404` |

---

### 2.8 POST – Sınav yayından kaldır

| Özellik | Değer |
|--------|--------|
| **Method / URL** | `POST /api/AdminExam/unpublish?id={id}` |
| **Response** | `200` → `{ Message }` \| `404` |

---

### 2.9 POST – Sınav kilitle

| Özellik | Değer |
|--------|--------|
| **Method / URL** | `POST /api/AdminExam/lock?id={id}` |
| **Response** | `200` → `{ Message }` \| `404` \| `400` (zaten kilitli vb.) |

---

### 2.10 PUT – Sınav tarihlerini güncelle (Schedule)

| Özellik | Değer |
|--------|--------|
| **Method / URL** | `PUT /api/AdminExam/schedule?id={id}` |
| **Body** | `ScheduleExamRequest` |
| **Response** | `200` → `{ Message }` \| `404` |

**ScheduleExamRequest:**

```json
{
  "startsAt": "2025-03-15T09:00:00Z",
  "endsAt": "2025-03-15T12:00:00Z",
  "status": 1
}
```

---

### 2.11 PUT – Sınav durumunu değiştir

| Özellik | Değer |
|--------|--------|
| **Method / URL** | `PUT /api/AdminExam/status/{id}` |
| **Body** | `SetExamStatusRequest` → `{ "status": 0 }` (0–6) |
| **Response** | `200` → `{ Message }` \| `404` \| `400` |

**Status değerleri:** 0=Draft, 1=Scheduled, 2=Published, 3=InProgress, 4=Closed, 5=Ended, 6=Archived

---

## 3. AdminQuestionBookletController

**Base route:** `api/AdminQuestionBooklet`

### 3.1 GET – Tüm kitapçıkları listele (Yeni endpoint)

| Özellik | Değer |
|--------|--------|
| **Method / URL** | `GET /api/AdminQuestionBooklet/list` |
| **Açıklama** | Id gerekmez; tüm kitapçıkları listeler. Sınav oluştururken kullanılacak **BookletCode** değerleri bu listede yer alır. |
| **Query/Route** | Yok |
| **Response** | `200` → `List<QuestionBookletDto>` |

**Örnek yanıt (200):**

```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "code": "BK-TYT-001",
    "categorySubId": "d4e5f6a7-b8c9-0123-def0-234567890123",
    "categorySubName": "TYT",
    "name": "TYT Matematik Kitapçığı",
    "publisherId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "status": 0,
    "createdAt": "2025-02-25T14:00:00Z",
    "slots": [
      {
        "id": "f1a2b3c4-d5e6-7890-abcd-ef1234567890",
        "questionBookletId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "categorySectionId": "e5f6a7b8-c9d0-1234-ef01-345678901234",
        "categorySectionName": "Matematik",
        "sectionOrderIndex": 1,
        "lessonId": null,
        "lessonName": null,
        "orderIndex": 1,
        "questionId": null,
        "questionCode": null,
        "stem": null,
        "optionsJson": null,
        "correctOptionKey": null,
        "createdAt": "2025-02-25T14:00:00Z"
      }
    ]
  }
]
```

---

### 3.2 POST – Kitapçık oluştur

| Özellik | Değer |
|--------|--------|
| **Method / URL** | `POST /api/AdminQuestionBooklet` |
| **Body** | `QuestionBookletCreateDto` |
| **Response** | `200` → `QuestionBookletDto` \| `400` |

**QuestionBookletCreateDto:** `categorySubId`, `name`, `publisherId` (opsiyonel), `categorySectionIds` (opsiyonel).

**Örnek istek (Body):**

```json
{
  "categorySubId": "d4e5f6a7-b8c9-0123-def0-234567890123",
  "name": "TYT Matematik Kitapçığı",
  "publisherId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "categorySectionIds": [
    "e5f6a7b8-c9d0-1234-ef01-345678901234"
  ]
}
```

**Örnek yanıt (200):** Oluşan kitapçığın `QuestionBookletDto` objesi (Code otomatik atanır).

---

### 3.3 POST – Tek bölüm için slot oluştur

| Özellik | Değer |
|--------|--------|
| **Method / URL** | `POST /api/AdminQuestionBooklet/slots-for-section` |
| **Body** | `CreateSlotsForSectionRequestDto` |
| **Response** | `200` → `CreateSlotsResultDto` |

**Body örneği:**

```json
{
  "questionBookletId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "categorySectionId": "e5f6a7b8-c9d0-1234-ef01-345678901234"
}
```

**Yanıt örneği:**

```json
{
  "createdCount": 10,
  "slots": [ ... ],
  "message": "10 slot oluşturuldu."
}
```

---

### 3.4 POST – Tüm bölümler için slot oluştur (Feature)

| Özellik | Değer |
|--------|--------|
| **Method / URL** | `POST /api/AdminQuestionBooklet/slots-for-feature` |
| **Body** | `CreateSlotsForFeatureRequestDto` (questionBookletId, categoryFeatureId) |
| **Response** | `200` → `CreateSlotsResultDto` |

---

### 3.5 GET – Bölüme göre slotları listele

| Özellik | Değer |
|--------|--------|
| **Method / URL** | `GET /api/AdminQuestionBooklet/slots/by-section/{categorySectionId}` |
| **Response** | `200` → `List<QuestionBookletSlotDto>` |

---

### 3.6 GET – Alt kategoriye göre kitapçıkları listele

| Özellik | Değer |
|--------|--------|
| **Method / URL** | `GET /api/AdminQuestionBooklet/by-category-sub/{categorySubId}` |
| **Response** | `200` → `List<QuestionBookletDto>` |

---

### 3.7 GET – Kitapçık detayı (Id ile)

| Özellik | Değer |
|--------|--------|
| **Method / URL** | `GET /api/AdminQuestionBooklet/booklet/{bookletId}` |
| **Response** | `200` → `QuestionBookletDto` \| `404` |

---

### 3.8 GET – Slot detayı (Id ile)

| Özellik | Değer |
|--------|--------|
| **Method / URL** | `GET /api/AdminQuestionBooklet/slot/{slotId}` |
| **Response** | `200` → `QuestionBookletSlotDto` \| `404` |

---

### 3.9 GET – Kitapçık detayı (Code ile)

| Özellik | Değer |
|--------|--------|
| **Method / URL** | `GET /api/AdminQuestionBooklet/by-code/{code}` |
| **Response** | `200` → `QuestionBookletDto` \| `404` |

**Örnek:** `GET /api/AdminQuestionBooklet/by-code/BK-TYT-001`

---

### 3.10 POST – Slota soru ekle (Güncellenen DTO)

| Özellik | Değer |
|--------|--------|
| **Method / URL** | `POST /api/AdminQuestionBooklet/slot/{slotId}/question` |
| **Body** | `AddQuestionToBookletDto` (**PublisherId yok**; yayınevi kitapçıkta tanımlı) |
| **Response** | `200` → `QuestionBookletSlotDto` \| `400` |

**Body örneği:**

```json
{
  "stem": "2 + 2 kaçtır?",
  "options": [
    { "optionKey": "A", "text": "3", "orderIndex": 1 },
    { "optionKey": "B", "text": "4", "orderIndex": 2 },
    { "optionKey": "C", "text": "5", "orderIndex": 3 }
  ],
  "correctOptionKey": "B",
  "lessonSubId": "f6a7b8c9-d0e1-2345-f012-456789012345"
}
```

---

### 3.11 PUT – Slottaki soruyu güncelle (Güncellenen DTO)

| Özellik | Değer |
|--------|--------|
| **Method / URL** | `PUT /api/AdminQuestionBooklet/slot/{slotId}/question` |
| **Body** | `UpdateQuestionInBookletDto` (**PublisherId yok**) |
| **Response** | `200` → `QuestionBookletSlotDto` \| `404` |

**Body örneği:**

```json
{
  "stem": "2 + 2 kaç eder?",
  "correctOptionKey": "B",
  "lessonSubId": "f6a7b8c9-d0e1-2345-f012-456789012345"
}
```

---

### 3.12 DELETE – Slottan soruyu kaldır

| Özellik | Değer |
|--------|--------|
| **Method / URL** | `DELETE /api/AdminQuestionBooklet/slot/{slotId}/question` |
| **Response** | `204 No Content` \| `500` |

---

### 3.13 DELETE – Kitapçık sil

| Özellik | Değer |
|--------|--------|
| **Method / URL** | `DELETE /api/AdminQuestionBooklet/booklet/{bookletId}` |
| **Response** | `204 No Content` \| `404` |

---

## Özet Tablo

### Yeni Endpoint

| Controller | Method | URL | Açıklama |
|------------|--------|-----|----------|
| AdminQuestionBooklet | GET | `/api/AdminQuestionBooklet/list` | Tüm kitapçıkları listeler (id gerekmez); sınav oluşturmada kullanılacak BookletCode değerleri burada. |

### Güncellenen Endpoint / Davranış

| Controller | Method | URL | Değişiklik |
|------------|--------|-----|------------|
| AdminExam | POST | `/api/AdminExam/create` | Body'de **BookletCode** zorunlu; yanıtta `ExamId` ve `BookletCode` dönüyor. Kategori/yayınevi artık kitapçıktan alınıyor. |

### DTO Değişiklik Özeti

- **AdminExamDto:** `QuestionBookletId`, `BookletCode` eklendi; `PublisherId`, `CategoryId`, `CategorySubId` kitapçıktan türetiliyor.
- **AdminExamCreateDto:** Sadece `BookletCode` ile oluşturma; `PublisherId`, `CategoryId`, `CategorySubId`, `BookletIds`, `BookletCodes` kaldırıldı.
- **AdminExamUpdateDto:** `PublisherId`, `CategoryId`, `CategorySubId` kaldırıldı.
- **QuestionBookletDto:** `PublisherId`, `Status` eklendi.
- **QuestionBookletCreateDto:** `PublisherId` (opsiyonel) eklendi.
- **AddQuestionToBookletDto / UpdateQuestionInBookletDto / BulkQuestionRowDto:** `PublisherId` kaldırıldı.

---

*Rapor tarihi: Şubat 2025*
