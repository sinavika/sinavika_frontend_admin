# Sınav Bölümü, Alt Konu ve Soru Şablonu API — Frontend Raporu

Bu doküman, son değişikliklerle güncellenen **AdminLessonSubController**, **AdminExamSectionController** ve **AdminQuestionsTemplateController** endpoint'lerini, süreç açıklamaları ve örnek gidiş-dönüş (request/response) ile anlatır.

---

## Genel Bilgiler

| Özellik | Değer |
|--------|--------|
| **Yetkilendirme** | Tüm endpoint'ler `[Authorize]` — geçerli Bearer token gerekir |
| **Content-Type** | `application/json` (body ile isteklerde) |
| **Swagger grubu** | `admin` |

### Base path'ler

- **Alt konu (LessonSub):** `api/AdminLessonSub`
- **Sınav bölümü (ExamSection):** `api/AdminExamSection`
- **Soru şablonu (QuestionsTemplate):** `api/AdminQuestionsTemplate`

### Ortak response formatları

- **Başarı mesajı:** `{ "message": "..." }`
- **Hata:** `{ "Error": "Hata metni" }`

---

# 1. AdminLessonSubController — Ders Alt Konuları (LessonSub)

Ana derse (Lesson) bağlı alt konuların listelenmesi ve tam CRUD işlemleri.

---

## 1.1 Ana derse göre alt konuları listele

**Süreç:** Route'ta verilen `lessonId` ile ders varlığı kontrol edilir; bu derse ait tüm alt konular (LessonSub) `OrderIndex`'e göre sıralı döner.

| Özellik | Değer |
|--------|--------|
| **Method** | `GET` |
| **URL** | `/api/AdminLessonSub/by-lesson/{lessonId}` |
| **Route param** | `lessonId` (Guid) |

### Örnek istek (gidiş)

```http
GET /api/AdminLessonSub/by-lesson/a1b2c3d4-e5f6-7890-abcd-ef1234567890
Authorization: Bearer {token}
```

### Örnek başarılı dönüş (200 OK)

```json
[
  {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "lessonId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "code": "TRIG",
    "name": "Trigonometri",
    "description": "Açı ve oranlar",
    "orderIndex": 0,
    "isActive": true,
    "createdAt": "2025-02-01T10:00:00Z",
    "updatedAt": null
  },
  {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "lessonId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "code": "LIMIT",
    "name": "Limit",
    "description": null,
    "orderIndex": 1,
    "isActive": true,
    "createdAt": "2025-02-01T10:05:00Z",
    "updatedAt": "2025-02-10T14:00:00Z"
  }
]
```

### Hata dönüşleri

- **404:** `{ "Error": "Ders bulunamadı. Id: ..." }`
- **500:** `{ "Error": "Alt konular listelenirken bir hata oluştu." }`

---

## 1.2 Alt konu detayı (Id ile getir)

**Süreç:** Route'taki `id` ile tek bir LessonSub kaydı döner.

| Özellik | Değer |
|--------|--------|
| **Method** | `GET` |
| **URL** | `/api/AdminLessonSub/{id}` |
| **Route param** | `id` (Guid) |

### Örnek istek (gidiş)

```http
GET /api/AdminLessonSub/b2c3d4e5-f6a7-8901-bcde-f12345678901
Authorization: Bearer {token}
```

### Örnek başarılı dönüş (200 OK)

```json
{
  "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "lessonId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "code": "TRIG",
  "name": "Trigonometri",
  "description": "Açı ve oranlar",
  "orderIndex": 0,
  "isActive": true,
  "createdAt": "2025-02-01T10:00:00Z",
  "updatedAt": null
}
```

### Hata dönüşleri

- **404:** `{ "Error": "Alt konu bulunamadı." }`
- **500:** `{ "Error": "Alt konu bilgisi alınırken bir hata oluştu." }`

---

## 1.3 Alt konu oluştur

**Süreç:** Route'ta `lessonId`, body'de alt konu bilgileri (Code, Name zorunlu) gönderilir. Ders yoksa 404; Code/Name boşsa 400.

| Özellik | Değer |
|--------|--------|
| **Method** | `POST` |
| **URL** | `/api/AdminLessonSub/{lessonId}/create` |
| **Route param** | `lessonId` (Guid) |
| **Body** | `LessonSubCreateDto` (JSON) |

### Request body (LessonSubCreateDto)

```ts
{
  code: string;        // zorunlu
  name: string;        // zorunlu
  description?: string | null;
  orderIndex: number;  // varsayılan 0
  isActive?: boolean;  // varsayılan true
}
```

### Örnek istek (gidiş)

```http
POST /api/AdminLessonSub/a1b2c3d4-e5f6-7890-abcd-ef1234567890/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "code": "TRIG",
  "name": "Trigonometri",
  "description": "Açı ve oranlar",
  "orderIndex": 0,
  "isActive": true
}
```

### Örnek başarılı dönüş (200 OK)

```json
{
  "message": "Alt konu başarıyla oluşturuldu."
}
```

### Hata dönüşleri

- **404:** `{ "Error": "Ders bulunamadı. Id: ..." }`
- **400:** `{ "Error": "Alt konu kodu (Code) zorunludur." }` / `"Alt konu adı (Name) zorunludur."`
- **500:** `{ "Error": "Alt konu oluşturulurken bir hata oluştu." }`

---

## 1.4 Alt konu güncelle

**Süreç:** Route'ta `id`, body'de güncellenecek alanlar (hepsi opsiyonel) gönderilir. Code/Name verilirse boş string kabul edilmez.

| Özellik | Değer |
|--------|--------|
| **Method** | `PUT` |
| **URL** | `/api/AdminLessonSub/{id}` |
| **Route param** | `id` (Guid) |
| **Body** | `LessonSubUpdateDto` (JSON) |

### Request body (LessonSubUpdateDto)

```ts
{
  code?: string | null;
  name?: string | null;
  description?: string | null;
  orderIndex?: number | null;
  isActive?: boolean | null;
}
```

### Örnek istek (gidiş)

```http
PUT /api/AdminLessonSub/b2c3d4e5-f6a7-8901-bcde-f12345678901
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Trigonometri (Güncel)",
  "orderIndex": 1
}
```

### Örnek başarılı dönüş (200 OK)

```json
{
  "message": "Alt konu başarıyla güncellendi."
}
```

### Hata dönüşleri

- **404:** `{ "Error": "Alt konu bulunamadı. Id: ..." }`
- **400:** Validasyon (Code/Name boş olamaz)
- **500:** `{ "Error": "Alt konu güncellenirken bir hata oluştu." }`

---

## 1.5 Alt konu sil

**Süreç:** Route'taki `id` ile LessonSub kalıcı silinir.

| Özellik | Değer |
|--------|--------|
| **Method** | `DELETE` |
| **URL** | `/api/AdminLessonSub/{id}` |
| **Route param** | `id` (Guid) |

### Örnek istek (gidiş)

```http
DELETE /api/AdminLessonSub/b2c3d4e5-f6a7-8901-bcde-f12345678901
Authorization: Bearer {token}
```

### Örnek başarılı dönüş (200 OK)

```json
{
  "message": "Alt konu başarıyla silindi."
}
```

### Hata dönüşleri

- **404:** `{ "Error": "Alt konu bulunamadı. Id: ..." }`
- **500:** `{ "Error": "Alt konu silinirken bir hata oluştu." }`

---

# 2. AdminExamSectionController — Sınav Bölümleri (Şablon Atama)

Sınav bölümleri artık **sınava soru şablonu (QuestionsTemplate) atanarak** yönetilir. Bölüm “oluşturma” yok; şablon listelenir, seçilir ve sınava atanır.

---

## 2.1 Sınavın bölümlerini listele

**Süreç:** Belirtilen sınava ait tüm bölümler (ExamSection) atanmış şablon bilgileriyle birlikte `OrderIndex`'e göre döner.

| Özellik | Değer |
|--------|--------|
| **Method** | `GET` |
| **URL** | `/api/AdminExamSection/by-exam/{examId}` |
| **Route param** | `examId` (Guid) |

### Örnek istek (gidiş)

```http
GET /api/AdminExamSection/by-exam/d4e5f6a7-b8c9-0123-def0-234567890123
Authorization: Bearer {token}
```

### Örnek başarılı dönüş (200 OK)

```json
[
  {
    "id": "e5f6a7b8-c9d0-1234-ef01-345678901234",
    "examId": "d4e5f6a7-b8c9-0123-def0-234567890123",
    "categorySubId": "f6a7b8c9-d0e1-2345-f012-456789012345",
    "categoriesSectionId": "a7b8c9d0-e1f2-3456-0123-567890123456",
    "categoryFeatureId": "b8c9d0e1-f2a3-4567-1234-678901234567",
    "questionsTemplateId": "c9d0e1f2-a3b4-5678-2345-789012345678",
    "name": "Türkçe",
    "orderIndex": 0,
    "durationMinutes": 40,
    "questionCountTarget": 40,
    "questionsTemplate": {
      "id": "c9d0e1f2-a3b4-5678-2345-789012345678",
      "code": "TYT-TRK-40",
      "name": "TYT Türkçe 40 Soru",
      "totalQuestionCount": 40
    },
    "quotas": []
  }
]
```

### Hata dönüşleri

- **500:** `{ "Error": "Bölümler listelenirken bir hata oluştu." }`

---

## 2.2 Bölüm detayı (Id ile getir)

**Süreç:** Route'taki `id` ile tek bir sınav bölümü (atanan şablon özeti dahil) döner.

| Özellik | Değer |
|--------|--------|
| **Method** | `GET` |
| **URL** | `/api/AdminExamSection/{id}` |
| **Route param** | `id` (Guid) |

### Örnek istek (gidiş)

```http
GET /api/AdminExamSection/e5f6a7b8-c9d0-1234-ef01-345678901234
Authorization: Bearer {token}
```

### Örnek başarılı dönüş (200 OK)

```json
{
  "id": "e5f6a7b8-c9d0-1234-ef01-345678901234",
  "examId": "d4e5f6a7-b8c9-0123-def0-234567890123",
  "categorySubId": "f6a7b8c9-d0e1-2345-f012-456789012345",
  "categoriesSectionId": "a7b8c9d0-e1f2-3456-0123-567890123456",
  "categoryFeatureId": "b8c9d0e1-f2a3-4567-1234-678901234567",
  "questionsTemplateId": "c9d0e1f2-a3b4-5678-2345-789012345678",
  "name": "Türkçe",
  "orderIndex": 0,
  "durationMinutes": 40,
  "questionCountTarget": 40,
  "questionsTemplate": {
    "id": "c9d0e1f2-a3b4-5678-2345-789012345678",
    "code": "TYT-TRK-40",
    "name": "TYT Türkçe 40 Soru",
    "totalQuestionCount": 40
  },
  "quotas": []
}
```

### Hata dönüşleri

- **404:** `{ "Error": "Bölüm bulunamadı." }`
- **500:** `{ "Error": "Bölüm bilgisi alınırken bir hata oluştu." }`

---

## 2.3 Sınava soru şablonu ata (bölüm ekle)

**Süreç:** Sınava yeni bir bölüm eklemek için **bölüm şablonu** (CategoriesSectionId) ve **soru şablonu** (QuestionsTemplateId) seçilir. Sınavın CategorySubId'si olmalıdır; bölüm şablonu bu alt kategoriye ait olmalıdır. Başarıda oluşan ExamSection nesnesi döner.

**Önce:** Sınava atanacak şablonları listelemek için `GET api/AdminQuestionsTemplate/by-category-sub/{categorySubId}` kullanılır (sınavın CategorySubId'si ile). Bölüm şablonları için `GET api/AdminCategorySection/by-sub/{categorySubId}` kullanılır.

| Özellik | Değer |
|--------|--------|
| **Method** | `POST` |
| **URL** | `/api/AdminExamSection/exam/{examId}/assign` |
| **Route param** | `examId` (Guid) |
| **Body** | `AssignTemplateToExamRequest` (JSON) |

### Request body (AssignTemplateToExamRequest)

```ts
{
  categoriesSectionId: string;  // Guid — bölüm şablonu (örn: Türkçe bölümü)
  questionsTemplateId: string; // Guid — atanacak soru şablonu
  orderIndex: number;          // bölümün sınavdaki sırası
}
```

### Örnek istek (gidiş)

```http
POST /api/AdminExamSection/exam/d4e5f6a7-b8c9-0123-def0-234567890123/assign
Authorization: Bearer {token}
Content-Type: application/json

{
  "categoriesSectionId": "a7b8c9d0-e1f2-3456-0123-567890123456",
  "questionsTemplateId": "c9d0e1f2-a3b4-5678-2345-789012345678",
  "orderIndex": 0
}
```

### Örnek başarılı dönüş (200 OK)

Oluşan bölüm (AdminExamSectionDto) döner:

```json
{
  "id": "e5f6a7b8-c9d0-1234-ef01-345678901234",
  "examId": "d4e5f6a7-b8c9-0123-def0-234567890123",
  "categorySubId": "f6a7b8c9-d0e1-2345-f012-456789012345",
  "categoriesSectionId": "a7b8c9d0-e1f2-3456-0123-567890123456",
  "categoryFeatureId": "b8c9d0e1-f2a3-4567-1234-678901234567",
  "questionsTemplateId": "c9d0e1f2-a3b4-5678-2345-789012345678",
  "name": "Türkçe",
  "orderIndex": 0,
  "durationMinutes": 40,
  "questionCountTarget": 40,
  "questionsTemplate": {
    "id": "c9d0e1f2-a3b4-5678-2345-789012345678",
    "code": "TYT-TRK-40",
    "name": "TYT Türkçe 40 Soru",
    "totalQuestionCount": 40
  },
  "quotas": []
}
```

### Hata dönüşleri

- **404:** `{ "Error": "Sınav bulunamadı. Id: ..." }` / `"Bölüm şablonu bulunamadı. Id: ..."` / `"Soru şablonu bulunamadı. Id: ..."`
- **400:** `{ "Error": "Sınavın alt kategori (CategorySubId) belirlenmiş olmalıdır." }` / `"Bölüm şablonu bu sınavın alt kategorisine ait olmalıdır."`
- **500:** `{ "Error": "Şablon atanırken bir hata oluştu." }`

---

## 2.4 Bölüm güncelle (sıra / zorluk dağılımı)

**Süreç:** Route'ta bölüm `id`, body'de sadece sıra (OrderIndex) ve/veya zorluk dağılımı (DifficultyMix, örn. JSON string) güncellenir.

| Özellik | Değer |
|--------|--------|
| **Method** | `PUT` |
| **URL** | `/api/AdminExamSection/{id}` |
| **Route param** | `id` (Guid) |
| **Body** | `AdminExamSectionUpdateDto` (JSON) |

### Request body (AdminExamSectionUpdateDto)

```ts
{
  orderIndex?: number | null;
  difficultyMix?: string | null;  // örn. JSON: kolay/orta/zor dağılımı
}
```

### Örnek istek (gidiş)

```http
PUT /api/AdminExamSection/e5f6a7b8-c9d0-1234-ef01-345678901234
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderIndex": 1,
  "difficultyMix": "{\"easy\":10,\"medium\":20,\"hard\":10}"
}
```

### Örnek başarılı dönüş (200 OK)

```json
{
  "message": "Bölüm başarıyla güncellendi."
}
```

### Hata dönüşleri

- **404:** `{ "Error": "Bölüm bulunamadı. Id: ..." }`
- **500:** `{ "Error": "Bölüm güncellenirken bir hata oluştu." }`

---

## 2.5 Bölümü kaldır (şablon atamasını sil)

**Süreç:** Route'taki `id` ile ilgili ExamSection kaydı silinir; sınavdan o bölüm kaldırılmış olur.

| Özellik | Değer |
|--------|--------|
| **Method** | `DELETE` |
| **URL** | `/api/AdminExamSection/{id}` |
| **Route param** | `id` (Guid) |

### Örnek istek (gidiş)

```http
DELETE /api/AdminExamSection/e5f6a7b8-c9d0-1234-ef01-345678901234
Authorization: Bearer {token}
```

### Örnek başarılı dönüş (200 OK)

```json
{
  "message": "Bölüm başarıyla kaldırıldı."
}
```

### Hata dönüşleri

- **404:** `{ "Error": "Bölüm bulunamadı. Id: ..." }`
- **500:** `{ "Error": "Bölüm kaldırılırken bir hata oluştu." }`

---

# 3. AdminQuestionsTemplateController — Soru Şablonları (QuestionsTemplate)

Soru şablonları ve şablon maddeleri (Items) ile CRUD; sınava bölüm atarken kullanılmak üzere **alt kategoriye göre listeleme** bu controller'da.

---

## 3.1 Tüm soru şablonlarını listele

**Süreç:** Tüm QuestionsTemplate kayıtları Items ile birlikte OrderIndex ve CreatedAt'e göre sıralı döner.

| Özellik | Değer |
|--------|--------|
| **Method** | `GET` |
| **URL** | `/api/AdminQuestionsTemplate/all` |

### Örnek istek (gidiş)

```http
GET /api/AdminQuestionsTemplate/all
Authorization: Bearer {token}
```

### Örnek başarılı dönüş (200 OK)

```json
[
  {
    "id": "c9d0e1f2-a3b4-5678-2345-789012345678",
    "code": "TYT-TRK-40",
    "name": "TYT Türkçe 40 Soru",
    "description": null,
    "categorySubId": "f6a7b8c9-d0e1-2345-f012-456789012345",
    "totalQuestionCount": 40,
    "isActive": true,
    "orderIndex": 0,
    "createdAt": "2025-02-01T09:00:00Z",
    "updatedAt": null,
    "createdByAdminId": null,
    "lastUpdatedByAdminId": null,
    "items": [
      {
        "id": "d0e1f2a3-b4c5-6789-3456-890123456789",
        "questionsTemplateId": "c9d0e1f2-a3b4-5678-2345-789012345678",
        "lessonId": "e1f2a3b4-c5d6-7890-4567-901234567890",
        "lessonSubId": "f2a3b4c5-d6e7-8901-5678-012345678901",
        "targetQuestionCount": 20,
        "difficultyMix": null,
        "orderIndex": 0,
        "questionId": null,
        "question": null
      }
    ]
  }
]
```

### Hata dönüşleri

- **500:** `{ "Error": "Soru şablonları listelenirken bir hata oluştu." }`

---

## 3.2 Alt kategoriye (CategorySub) göre soru şablonlarını listele *(sınava bölüm atarken kullanılır)*

**Süreç:** Sınava bölüm atarken kullanılır. Sınavın `CategorySubId`'si ile çağrılır; o alt kategoriye ait (CategorySubId eşleşen) şablonlar Items ile birlikte döner. Frontend bu listeyi dropdown/select ile gösterip kullanıcının seçtiği şablonu Assign isteğinde `questionsTemplateId` olarak gönderir.

| Özellik | Değer |
|--------|--------|
| **Method** | `GET` |
| **URL** | `/api/AdminQuestionsTemplate/by-category-sub/{categorySubId}` |
| **Route param** | `categorySubId` (Guid) |

### Örnek istek (gidiş)

```http
GET /api/AdminQuestionsTemplate/by-category-sub/f6a7b8c9-d0e1-2345-f012-456789012345
Authorization: Bearer {token}
```

### Örnek başarılı dönüş (200 OK)

```json
[
  {
    "id": "c9d0e1f2-a3b4-5678-2345-789012345678",
    "code": "TYT-TRK-40",
    "name": "TYT Türkçe 40 Soru",
    "description": null,
    "categorySubId": "f6a7b8c9-d0e1-2345-f012-456789012345",
    "totalQuestionCount": 40,
    "isActive": true,
    "orderIndex": 0,
    "createdAt": "2025-02-01T09:00:00Z",
    "updatedAt": null,
    "createdByAdminId": null,
    "lastUpdatedByAdminId": null,
    "items": []
  }
]
```

### Hata dönüşleri

- **500:** `{ "Error": "Soru şablonları listelenirken bir hata oluştu." }`

---

## 3.3 Şablon detayı (Id ile getir)

**Süreç:** Route'taki `id` ile tek bir QuestionsTemplate, Items (ve sabit soru özetleri) ile birlikte döner.

| Özellik | Değer |
|--------|--------|
| **Method** | `GET` |
| **URL** | `/api/AdminQuestionsTemplate/{id}` |
| **Route param** | `id` (Guid) |

### Örnek istek (gidiş)

```http
GET /api/AdminQuestionsTemplate/c9d0e1f2-a3b4-5678-2345-789012345678
Authorization: Bearer {token}
```

### Örnek başarılı dönüş (200 OK)

```json
{
  "id": "c9d0e1f2-a3b4-5678-2345-789012345678",
  "code": "TYT-TRK-40",
  "name": "TYT Türkçe 40 Soru",
  "description": null,
  "categorySubId": "f6a7b8c9-d0e1-2345-f012-456789012345",
  "totalQuestionCount": 40,
  "isActive": true,
  "orderIndex": 0,
  "createdAt": "2025-02-01T09:00:00Z",
  "updatedAt": null,
  "createdByAdminId": null,
  "lastUpdatedByAdminId": null,
  "items": [
    {
      "id": "d0e1f2a3-b4c5-6789-3456-890123456789",
      "questionsTemplateId": "c9d0e1f2-a3b4-5678-2345-789012345678",
      "lessonId": "e1f2a3b4-c5d6-7890-4567-901234567890",
      "lessonSubId": "f2a3b4c5-d6e7-8901-5678-012345678901",
      "targetQuestionCount": 20,
      "difficultyMix": null,
      "orderIndex": 0,
      "questionId": null,
      "question": null
    }
  ]
}
```

### Hata dönüşleri

- **404:** `{ "Error": "Soru şablonu bulunamadı." }`
- **500:** `{ "Error": "Soru şablonu alınırken bir hata oluştu." }`

---

## 3.4 Soru şablonu oluştur

**Süreç:** Yeni şablon ve maddeleri (Items) gönderilir. Toplam soru sayısı 10–20 arasında olmalı; TotalQuestionCount ile Items toplamı uyumlu olmalı. CategorySubId verilirse varlığı kontrol edilir.

| Özellik | Değer |
|--------|--------|
| **Method** | `POST` |
| **URL** | `/api/AdminQuestionsTemplate/create` |
| **Body** | `QuestionsTemplateCreateDto` (JSON) |

### Request body (QuestionsTemplateCreateDto)

```ts
{
  code: string;
  name: string;
  description?: string | null;
  categorySubId?: string | null;
  totalQuestionCount: number;  // 10–20, Items toplamı ile aynı
  isActive?: boolean;         // varsayılan true
  orderIndex?: number;
  items: Array<{
    lessonId: string;
    lessonSubId?: string | null;
    targetQuestionCount: number;
    difficultyMix?: string | null;
    orderIndex: number;
    questionId?: string | null;
  }>;
}
```

### Örnek istek (gidiş)

```http
POST /api/AdminQuestionsTemplate/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "code": "TYT-TRK-40",
  "name": "TYT Türkçe 40 Soru",
  "categorySubId": "f6a7b8c9-d0e1-2345-f012-456789012345",
  "totalQuestionCount": 40,
  "isActive": true,
  "orderIndex": 0,
  "items": [
    {
      "lessonId": "e1f2a3b4-c5d6-7890-4567-901234567890",
      "lessonSubId": null,
      "targetQuestionCount": 40,
      "orderIndex": 0
    }
  ]
}
```

### Örnek başarılı dönüş (200 OK)

```json
{
  "message": "Soru şablonu başarıyla oluşturuldu."
}
```

### Hata dönüşleri

- **400:** Toplam soru sayısı / TotalQuestionCount / CategorySub validasyonu
- **500:** `{ "Error": "Soru şablonu eklenirken bir hata oluştu." }`

---

## 3.5 Soru şablonu güncelle

**Süreç:** Şablon alanları ve isteğe bağlı Items güncellenir. Items verilirse tüm maddeler bu liste ile değiştirilir.

| Özellik | Değer |
|--------|--------|
| **Method** | `PUT` |
| **URL** | `/api/AdminQuestionsTemplate/{id}` |
| **Route param** | `id` (Guid) |
| **Body** | `QuestionsTemplateUpdateDto` (JSON) |

### Request body (QuestionsTemplateUpdateDto)

```ts
{
  code?: string | null;
  name?: string | null;
  description?: string | null;
  categorySubId?: string | null;
  totalQuestionCount?: number | null;
  isActive?: boolean | null;
  orderIndex?: number | null;
  items?: Array<QuestionsTemplateItemCreateDto> | null;  // verilirse tüm maddeler değişir
}
```

### Örnek istek (gidiş)

```http
PUT /api/AdminQuestionsTemplate/c9d0e1f2-a3b4-5678-2345-789012345678
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "TYT Türkçe 40 Soru (Güncel)",
  "totalQuestionCount": 40
}
```

### Örnek başarılı dönüş (200 OK)

```json
{
  "message": "Soru şablonu başarıyla güncellendi."
}
```

### Hata dönüşleri

- **404:** `{ "Error": "Soru şablonu bulunamadı." }`
- **400:** Validasyon
- **500:** `{ "Error": "Soru şablonu güncellenirken bir hata oluştu." }`

---

## 3.6 Soru şablonu sil

**Süreç:** Şablon ve tüm Items kalıcı silinir.

| Özellik | Değer |
|--------|--------|
| **Method** | `DELETE` |
| **URL** | `/api/AdminQuestionsTemplate/{id}` |
| **Route param** | `id` (Guid) |

### Örnek istek (gidiş)

```http
DELETE /api/AdminQuestionsTemplate/c9d0e1f2-a3b4-5678-2345-789012345678
Authorization: Bearer {token}
```

### Örnek başarılı dönüş (200 OK)

```json
{
  "message": "Soru şablonu başarıyla silindi."
}
```

### Hata dönüşleri

- **404:** `{ "Error": "Soru şablonu bulunamadı." }`
- **500:** `{ "Error": "Soru şablonu silinirken bir hata oluştu." }`

---

## 3.7 Şablona soru ekle

**Süreç:** Veritabanından seçilen bir soru (QuestionId) şablona madde olarak eklenir. Toplam soru sayısı 20'yi geçemez.

| Özellik | Değer |
|--------|--------|
| **Method** | `POST` |
| **URL** | `/api/AdminQuestionsTemplate/{id}/questions` |
| **Route param** | `id` (Guid) — şablon id |
| **Body** | `QuestionsTemplateAddQuestionRequestDto` (JSON) |

### Request body

```ts
{ "questionId": "guid" }
```

### Örnek istek (gidiş)

```http
POST /api/AdminQuestionsTemplate/c9d0e1f2-a3b4-5678-2345-789012345678/questions
Authorization: Bearer {token}
Content-Type: application/json

{
  "questionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

### Örnek başarılı dönüş (200 OK)

```json
{
  "message": "Soru şablona eklendi."
}
```

### Hata dönüşleri

- **404:** `{ "Error": "Soru şablonu bulunamadı." }`
- **400:** Soru bulunamadı / toplam 20'yi aşar
- **500:** `{ "Error": "Şablona soru eklenirken bir hata oluştu." }`

---

## 3.8 Şablondan soru (madde) çıkar

**Süreç:** Şablondan belirtilen madde (itemId) silinir. Toplam soru sayısı 10'un altına düşemez.

| Özellik | Değer |
|--------|--------|
| **Method** | `DELETE` |
| **URL** | `/api/AdminQuestionsTemplate/{id}/items/{itemId}` |
| **Route param** | `id` (Guid) — şablon id, `itemId` (Guid) — madde id |

### Örnek istek (gidiş)

```http
DELETE /api/AdminQuestionsTemplate/c9d0e1f2-a3b4-5678-2345-789012345678/items/d0e1f2a3-b4c5-6789-3456-890123456789
Authorization: Bearer {token}
```

### Örnek başarılı dönüş (200 OK)

```json
{
  "message": "Madde şablondan çıkarıldı."
}
```

### Hata dönüşleri

- **404:** `{ "Error": "Soru şablonu veya madde bulunamadı." }`
- **400:** Toplam 10'un altına düşer
- **500:** `{ "Error": "Şablondan soru çıkarılırken bir hata oluştu." }`

---

# Özet tablo — Tüm endpoint'ler

| Controller | Method | URL | Açıklama |
|------------|--------|-----|----------|
| **AdminLessonSub** | GET | `/api/AdminLessonSub/by-lesson/{lessonId}` | Derse göre alt konular |
| **AdminLessonSub** | GET | `/api/AdminLessonSub/{id}` | Alt konu detayı |
| **AdminLessonSub** | POST | `/api/AdminLessonSub/{lessonId}/create` | Alt konu oluştur |
| **AdminLessonSub** | PUT | `/api/AdminLessonSub/{id}` | Alt konu güncelle |
| **AdminLessonSub** | DELETE | `/api/AdminLessonSub/{id}` | Alt konu sil |
| **AdminExamSection** | GET | `/api/AdminExamSection/by-exam/{examId}` | Sınavın bölümleri |
| **AdminExamSection** | GET | `/api/AdminExamSection/{id}` | Bölüm detayı |
| **AdminExamSection** | POST | `/api/AdminExamSection/exam/{examId}/assign` | Sınava şablon ata |
| **AdminExamSection** | PUT | `/api/AdminExamSection/{id}` | Bölüm güncelle (sıra/zorluk) |
| **AdminExamSection** | DELETE | `/api/AdminExamSection/{id}` | Bölümü kaldır |
| **AdminQuestionsTemplate** | GET | `/api/AdminQuestionsTemplate/all` | Tüm şablonlar |
| **AdminQuestionsTemplate** | GET | `/api/AdminQuestionsTemplate/by-category-sub/{categorySubId}` | Alt kategoriye göre şablonlar (sınava atarken) |
| **AdminQuestionsTemplate** | GET | `/api/AdminQuestionsTemplate/{id}` | Şablon detayı |
| **AdminQuestionsTemplate** | POST | `/api/AdminQuestionsTemplate/create` | Şablon oluştur |
| **AdminQuestionsTemplate** | PUT | `/api/AdminQuestionsTemplate/{id}` | Şablon güncelle |
| **AdminQuestionsTemplate** | DELETE | `/api/AdminQuestionsTemplate/{id}` | Şablon sil |
| **AdminQuestionsTemplate** | POST | `/api/AdminQuestionsTemplate/{id}/questions` | Şablona soru ekle |
| **AdminQuestionsTemplate** | DELETE | `/api/AdminQuestionsTemplate/{id}/items/{itemId}` | Şablondan madde çıkar |

---

# Sınava bölüm atama akışı (frontend)

1. Sınav detayını al: `GET api/AdminExam/{examId}` → `categorySubId` al.
2. Bu alt kategoriye ait **bölüm şablonlarını** al: `GET api/AdminCategorySection/by-sub/{categorySubId}` → dropdown için bölüm listesi (CategoriesSectionId).
3. Bu alt kategoriye ait **soru şablonlarını** al: `GET api/AdminQuestionsTemplate/by-category-sub/{categorySubId}` → dropdown için şablon listesi (QuestionsTemplateId).
4. Kullanıcı bir bölüm şablonu + bir soru şablonu + sıra seçer → `POST api/AdminExamSection/exam/{examId}/assign` body: `{ categoriesSectionId, questionsTemplateId, orderIndex }`.
5. Sınavın güncel bölüm listesi: `GET api/AdminExamSection/by-exam/{examId}`.

---

*Bu doküman frontend geliştirme için hazırlanmıştır; backend değişikliklerinde güncellenmesi gerekebilir.*
