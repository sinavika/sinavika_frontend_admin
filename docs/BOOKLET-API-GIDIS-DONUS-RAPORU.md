# Booklet API — Gidiş-Dönüş DTO Raporu

Bu rapor **AdminQuestionBookletTemplateController** ve **AdminQuestionBookletController** endpoint'lerinin istek/cevap örneklerini ve DTO yapılarını içerir.

**Temel bilgiler:**
- **Base URL:** `https://{host}/api/AdminQuestionBookletTemplate` | `https://{host}/api/AdminQuestionBooklet`
- **Yetkilendirme:** Tüm endpoint'ler `[Authorize]` — Bearer token zorunlu.
- **Content-Type:** `application/json` (body içeren isteklerde).

---

## 1. AdminQuestionBookletTemplateController

Booklet şablonları CRUD. CategorySub ve CategorySection ile oluşturulur.

---

### 1.1 GET — Tüm şablonları listele

**İstek (Gidiş)**

```http
GET /api/AdminQuestionBookletTemplate/all
Authorization: Bearer {token}
```

**Cevap (Dönüş) — 200 OK**

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "code": "TYT-MAT-01",
    "name": "TYT Matematik Bölüm Şablonu",
    "description": "40 soruluk matematik bölümü",
    "difficultyMix": "{\"easy\":10,\"medium\":20,\"hard\":10}",
    "categoryId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "categorySubId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "questionsTemplateId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "categorySectionId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "targetQuestionCount": 40,
    "totalQuestionCount": 40,
    "orderIndex": 1,
    "isActive": true,
    "createdAt": "2025-02-19T10:00:00Z",
    "updatedAt": null,
    "createdByAdminId": "d4e5f6a7-b8c9-0123-def0-234567890123",
    "lastUpdatedByAdminId": null
  }
]
```

**DTO:** `QuestionBookletTemplateDto[]`

---

### 1.2 GET — Alt kategoriye göre şablonları listele

**İstek (Gidiş)**

```http
GET /api/AdminQuestionBookletTemplate/by-category-sub/{categorySubId}
Authorization: Bearer {token}
```

**Örnek:** `GET /api/AdminQuestionBookletTemplate/by-category-sub/b2c3d4e5-f6a7-8901-bcde-f12345678901`

**Cevap (Dönüş) — 200 OK**

Aynı yapıda `QuestionBookletTemplateDto[]` döner (yukarıdaki liste gibi).

---

### 1.3 GET — Id ile şablon detayı

**İstek (Gidiş)**

```http
GET /api/AdminQuestionBookletTemplate/{id}
Authorization: Bearer {token}
```

**Örnek:** `GET /api/AdminQuestionBookletTemplate/3fa85f64-5717-4562-b3fc-2c963f66afa6`

**Cevap (Dönüş) — 200 OK**

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "code": "TYT-MAT-01",
  "name": "TYT Matematik Bölüm Şablonu",
  "description": "40 soruluk matematik bölümü",
  "difficultyMix": "{\"easy\":10,\"medium\":20,\"hard\":10}",
  "categoryId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "categorySubId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "questionsTemplateId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "categorySectionId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "targetQuestionCount": 40,
  "totalQuestionCount": 40,
  "orderIndex": 1,
  "isActive": true,
  "createdAt": "2025-02-19T10:00:00Z",
  "updatedAt": null,
  "createdByAdminId": "d4e5f6a7-b8c9-0123-def0-234567890123",
  "lastUpdatedByAdminId": null
}
```

**Cevap — 404 Not Found**

```json
{
  "error": "Booklet şablonu bulunamadı."
}
```

---

### 1.4 POST — Yeni booklet şablonu oluştur

**İstek (Gidiş)**

```http
POST /api/AdminQuestionBookletTemplate/create
Authorization: Bearer {token}
Content-Type: application/json
```

**Body — QuestionBookletTemplateCreateDto**

```json
{
  "code": "TYT-MAT-01",
  "name": "TYT Matematik Bölüm Şablonu",
  "description": "40 soruluk matematik bölümü",
  "difficultyMix": "{\"easy\":10,\"medium\":20,\"hard\":10}",
  "categoryId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "categorySubId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "categorySectionId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "targetQuestionCount": 40,
  "isActive": true,
  "orderIndex": 1
}
```

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| code | string | Evet | Şablon kodu |
| name | string | Evet | Şablon adı |
| description | string | Hayır | Açıklama |
| difficultyMix | string | Hayır | Zorluk dağılımı (JSON) |
| categoryId | guid | Evet | Kategori Id |
| categorySubId | guid | Evet | Alt kategori Id |
| categorySectionId | guid | Evet | Bölüm şablonu (CategorySection) Id |
| targetQuestionCount | int | Evet | Hedef soru sayısı (≥ 0) |
| isActive | bool | Hayır | Varsayılan: true |
| orderIndex | int | Hayır | Sıra |

**Cevap (Dönüş) — 200 OK**

```json
{
  "message": "Booklet şablonu oluşturuldu."
}
```

**Cevap — 400 Bad Request**

```json
{
  "error": "Alt kategori bulunamadı. CategorySubId: ..."
}
```

```json
{
  "error": "CategorySection bu alt kategoriye ait değil."
}
```

---

### 1.5 PUT — Şablon güncelle

**İstek (Gidiş)**

```http
PUT /api/AdminQuestionBookletTemplate/{id}
Authorization: Bearer {token}
Content-Type: application/json
```

**Body — QuestionBookletTemplateUpdateDto** (tüm alanlar opsiyonel; gönderilenler güncellenir)

```json
{
  "code": "TYT-MAT-01-V2",
  "name": "TYT Matematik Bölüm Şablonu (Güncel)",
  "description": "Güncellenmiş açıklama",
  "difficultyMix": null,
  "categoryId": null,
  "categorySubId": null,
  "categorySectionId": null,
  "targetQuestionCount": 45,
  "totalQuestionCount": 45,
  "isActive": true,
  "orderIndex": 2
}
```

**Cevap (Dönüş) — 200 OK**

```json
{
  "message": "Booklet şablonu güncellendi."
}
```

**Cevap — 404 Not Found**

```json
{
  "error": "Booklet şablonu bulunamadı."
}
```

---

### 1.6 DELETE — Şablon sil

**İstek (Gidiş)**

```http
DELETE /api/AdminQuestionBookletTemplate/{id}
Authorization: Bearer {token}
```

**Cevap (Dönüş) — 200 OK**

```json
{
  "message": "Booklet şablonu silindi."
}
```

**Cevap — 404 Not Found**

```json
{
  "error": "Booklet şablonu bulunamadı."
}
```

---

## 2. AdminQuestionBookletController

Booklet (soru kitapçığı) CRUD, havuzdan soru ekleme (Id/Code), toplu soru yükleme (JSON/Excel).

---

### 2.1 GET — Sınava ait booklet kayıtlarını listele

**İstek (Gidiş)**

```http
GET /api/AdminQuestionBooklet/by-exam/{examId}
Authorization: Bearer {token}
```

**Örnek:** `GET /api/AdminQuestionBooklet/by-exam/e5f6a7b8-c9d0-1234-ef01-345678901234`

**Cevap (Dönüş) — 200 OK**

```json
[
  {
    "id": "f6a7b8c9-d0e1-2345-f012-456789012345",
    "examId": "e5f6a7b8-c9d0-1234-ef01-345678901234",
    "examSectionId": "a7b8c9d0-e1f2-3456-0123-567890123456",
    "questionsTemplateId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "questionTemplateItemId": null,
    "lessonId": "b8c9d0e1-f2a3-4567-1234-678901234567",
    "name": "",
    "lessonName": "Matematik",
    "orderIndex": 1,
    "questionId": "c9d0e1f2-a3b4-5678-2345-789012345678",
    "questionCode": "MAT123456",
    "stem": "Bir sayının 3 katının 5 fazlası 23 ise sayı kaçtır?",
    "optionsJson": "{\"A\":\"4\",\"B\":\"5\",\"C\":\"6\",\"D\":\"7\"}",
    "correctOptionKey": "C",
    "createdAt": "2025-02-19T11:00:00Z"
  }
]
```

**DTO:** `QuestionBookletDto[]`

---

### 2.2 GET — Bölüme ait booklet kayıtlarını listele

**İstek (Gidiş)**

```http
GET /api/AdminQuestionBooklet/by-section/{examSectionId}
Authorization: Bearer {token}
```

**Cevap (Dönüş) — 200 OK**

Aynı yapıda `QuestionBookletDto[]` (yukarıdaki gibi).

---

### 2.3 GET — Booklet kaydı detayı

**İstek (Gidiş)**

```http
GET /api/AdminQuestionBooklet/{id}
Authorization: Bearer {token}
```

**Cevap (Dönüş) — 200 OK**

Tekil `QuestionBookletDto` (yukarıdaki eleman yapısında).

**Cevap — 404 Not Found**

```json
{
  "error": "Booklet kaydı bulunamadı."
}
```

---

### 2.4 POST — Booklet'e soru ekle (QuestionId / QuestionCode)

**İstek (Gidiş)**

```http
POST /api/AdminQuestionBooklet/add
Authorization: Bearer {token}
Content-Type: application/json
```

**Body — QuestionBookletCreateDto**

```json
{
  "examId": "e5f6a7b8-c9d0-1234-ef01-345678901234",
  "examSectionId": "a7b8c9d0-e1f2-3456-0123-567890123456",
  "lessonId": "b8c9d0e1-f2a3-4567-1234-678901234567",
  "name": "",
  "orderIndex": 1,
  "questionsTemplateId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "questionTemplateItemId": null,
  "questionId": null,
  "questionCode": "MAT123456"
}
```

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| examId | guid | Evet | Sınav Id |
| examSectionId | guid | Evet | Sınav bölümü Id |
| lessonId | guid | Evet | Ders Id (soru LessonSub üzerinden geliyorsa otomatik de doldurulabilir) |
| name | string | Hayır | Booklet satır adı |
| orderIndex | int | Hayır | Sıra (verilmezse sona eklenir) |
| questionsTemplateId | guid | Hayır | Şablon Id |
| questionTemplateItemId | guid | Hayır | Şablon satır Id |
| questionId | guid | Hayır* | Havuzdaki soru Id (* QuestionId veya QuestionCode biri zorunlu) |
| questionCode | string | Hayır* | Havuzdaki soru kodu (örn. MAT123456) |

**Cevap (Dönüş) — 200 OK**

Oluşturulan kaydın tam `QuestionBookletDto` nesnesi döner (2.1’deki eleman yapısında).

**Cevap — 400 Bad Request**

```json
{
  "error": "Soru bulunamadı. QuestionCode: MAT999999"
}
```

```json
{
  "error": "Bu bölüm sadece belirli ders (LessonId: ...) sorularını kabul eder. Eklenen sorunun dersi uyumsuz."
}
```

```json
{
  "error": "Bu bölüm için soru kotası dolu (maksimum 40). Daha fazla soru eklenemez."
}
```

---

### 2.5 POST — Code ile booklet'e soru ekle

**İstek (Gidiş)**

```http
POST /api/AdminQuestionBooklet/add-by-code
Authorization: Bearer {token}
Content-Type: application/json
```

**Body — AddByCodeRequestDto**

```json
{
  "examId": "e5f6a7b8-c9d0-1234-ef01-345678901234",
  "examSectionId": "a7b8c9d0-e1f2-3456-0123-567890123456",
  "questionCode": "MAT123456",
  "orderIndex": 2,
  "questionsTemplateId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "questionTemplateItemId": null
}
```

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| examId | guid | Evet | Sınav Id |
| examSectionId | guid | Evet | Bölüm Id |
| questionCode | string | Evet | Soru havuzundaki soru kodu |
| orderIndex | int? | Hayır | Sıra (verilmezse sona eklenir) |
| questionsTemplateId | guid? | Hayır | Şablon Id |
| questionTemplateItemId | guid? | Hayır | Şablon satır Id |

**Cevap (Dönüş) — 200 OK**

```json
{
  "message": "Soru booklet'e eklendi."
}
```

**Cevap — 400 Bad Request**

`/add` ile aynı lesson/kota hata mesajları (yukarıdaki örnekler gibi).

---

### 2.6 PUT — Booklet kaydının sırasını güncelle

**İstek (Gidiş)**

```http
PUT /api/AdminQuestionBooklet/{id}/order
Authorization: Bearer {token}
Content-Type: application/json
```

**Body — QuestionBookletUpdateOrderDto**

```json
{
  "orderIndex": 5
}
```

**Cevap (Dönüş) — 200 OK**

```json
{
  "message": "Sıra güncellendi."
}
```

**Cevap — 404 Not Found**

```json
{
  "error": "Booklet kaydı bulunamadı."
}
```

---

### 2.7 DELETE — Booklet kaydını kaldır

**İstek (Gidiş)**

```http
DELETE /api/AdminQuestionBooklet/{id}
Authorization: Bearer {token}
```

**Cevap (Dönüş) — 200 OK**

```json
{
  "message": "Booklet kaydı kaldırıldı."
}
```

**Cevap — 404 Not Found**

```json
{
  "error": "Booklet kaydı bulunamadı."
}
```

---

### 2.8 POST — JSON ile toplu soru yükleme (havuza)

Sorular **soru havuzuna (Question)** eklenir; booklet'e değil. Lesson ve option bilgileriyle kaydedilir.

**İstek (Gidiş)**

```http
POST /api/AdminQuestionBooklet/bulk-import/json
Authorization: Bearer {token}
Content-Type: application/json
```

**Body — BulkImportJsonRequestDto**

```json
{
  "json": "[{\"stem\":\"2+2 kaçtır?\",\"options\":[{\"optionKey\":\"A\",\"text\":\"3\"},{\"optionKey\":\"B\",\"text\":\"4\"},{\"optionKey\":\"C\",\"text\":\"5\"}],\"correctOptionKey\":\"B\",\"lessonId\":\"b8c9d0e1-f2a3-4567-1234-678901234567\",\"lessonSubId\":\"d0e1f2a3-b4c5-6789-3456-890123456789\",\"publisherId\":null}]"
}
```

**JSON dizisindeki her eleman — BulkQuestionRowDto:**

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| stem | string | Evet | Soru metni |
| options | array | Evet | Şıklar: `{ "optionKey": "A"|"B"|"C"|"D"|"E", "text": "..." }` |
| correctOptionKey | string | Evet | Doğru şık (A–E) |
| lessonId | guid | Evet | Ders Id |
| lessonSubId | guid? | Hayır | Alt konu Id |
| publisherId | guid? | Hayır | Yayınevi Id |

**Cevap (Dönüş) — 200 OK — BulkQuestionImportResultDto**

```json
{
  "totalRows": 1,
  "createdCount": 1,
  "errorCount": 0,
  "errors": [],
  "createdQuestionIds": ["c9d0e1f2-a3b4-5678-2345-789012345678"]
}
```

Hata olan satırlar için `errors` dolu, `createdQuestionIds` sadece başarıyla oluşturulan Question Id’lerini içerir.

---

### 2.9 POST — Excel ile toplu soru yükleme (havuza)

**İstek (Gidiş)**

```http
POST /api/AdminQuestionBooklet/bulk-import/excel
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Body (form-data)**

| Key | Tip | Açıklama |
|-----|-----|----------|
| file | file | .xlsx Excel dosyası |

**Excel şablonu (ilk satır başlık):**

| Stem | OptionA | OptionB | OptionC | OptionD | OptionE | CorrectOptionKey | LessonId | LessonSubId | PublisherId |
|------|---------|---------|---------|---------|---------|------------------|----------|-------------|-------------|
| 2+2 kaçtır? | 3 | 4 | 5 | 6 | 7 | B | b8c9d0e1-... | d0e1f2a3-... | |

**Cevap (Dönüş) — 200 OK**

`BulkQuestionImportResultDto` (2.8 ile aynı yapı).

**Cevap — 400 Bad Request**

```json
{
  "error": "Excel dosyası yükleyin."
}
```

---

## 3. DTO Özet Tablosu

| DTO | Kullanıldığı yer |
|-----|-------------------|
| **QuestionBookletTemplateDto** | Template listeleme, detay |
| **QuestionBookletTemplateCreateDto** | Template oluşturma (POST create) |
| **QuestionBookletTemplateUpdateDto** | Template güncelleme (PUT) |
| **QuestionBookletDto** | Booklet listeleme, detay, add cevabı |
| **QuestionBookletCreateDto** | Booklet'e soru ekleme (POST add) |
| **QuestionBookletUpdateOrderDto** | Booklet sıra güncelleme (PUT order) |
| **AddByCodeRequestDto** | Code ile soru ekleme (POST add-by-code) |
| **BulkImportJsonRequestDto** | JSON toplu yükleme (POST bulk-import/json) |
| **BulkQuestionImportResultDto** | JSON/Excel toplu yükleme cevabı |
| **BulkQuestionRowDto** | JSON içindeki tek satır yapısı (şema) |

---

## 4. Hata Cevap Formatları

Tüm endpoint’lerde:

- **400 Bad Request:** `{ "error": "..." }`
- **404 Not Found:** `{ "error": "..." }`
- **500 Internal Server Error:** `{ "error": "..." }`

Ortak mesajlar: "… listelenirken bir hata oluştu.", "… bulunamadı.", "… eklenirken bir hata oluştu." vb.

---

*Rapor oluşturulma tarihi: Şubat 2025 — Sinavika Booklet API.*
