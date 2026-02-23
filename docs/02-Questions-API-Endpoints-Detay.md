# Questions API — Endpoint Gidiş-Dönüş Detayları

Tüm endpoint'ler **admin** yetkisi gerektirir. İsteklerde `Authorization: Bearer <token>` header'ı kullanılır.  
Base URL örnek: `https://localhost:7xxx/api`

---

## 1. AdminQuestionBookletTemplateController

**Base path:** `/api/AdminQuestionBookletTemplate`

---

### 1.1 Yeni kitapçık şablonu oluştur

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/AdminQuestionBookletTemplate` |
| **Açıklama** | Yeni şablon satırı oluşturur. `QuestionsTemplateId` null ise yeni set; dolu ise mevcut sete bölüm eklenir. |

**Headers**

```http
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request body (gidiş)**

```json
{
  "code": "TYT-MAT-1",
  "name": "Matematik Bölüm 1",
  "description": "Temel matematik soruları",
  "difficultyMix": null,
  "categoryId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "categorySubId": "3fa85f64-5717-4562-b3fc-2c963f66afa7",
  "categorySectionId": "3fa85f64-5717-4562-b3fc-2c963f66afa8",
  "targetQuestionCount": 20,
  "isActive": true,
  "orderIndex": 1,
  "questionsTemplateId": null
}
```

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| code | string | Evet | Şablon kodu |
| name | string | Evet | Şablon adı |
| description | string | Hayır | Açıklama |
| difficultyMix | string | Hayır | Zorluk karışımı |
| categoryId | guid | Evet | Kategori Id |
| categorySubId | guid | Evet | Alt kategori Id |
| categorySectionId | guid | Evet | Bölüm Id |
| targetQuestionCount | int | Evet | Hedef soru sayısı |
| isActive | bool | Hayır | Varsayılan true |
| orderIndex | int | Evet | Sıra |
| questionsTemplateId | guid? | Hayır | Null = yeni set; dolu = mevcut sete ekleme |

**Response — 200 OK (dönüş)**

```json
{
  "id": "7a1b2c3d-4e5f-6789-abcd-ef0123456789",
  "code": "TYT-MAT-1",
  "name": "Matematik Bölüm 1",
  "description": "Temel matematik soruları",
  "difficultyMix": null,
  "categoryId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "categorySubId": "3fa85f64-5717-4562-b3fc-2c963f66afa7",
  "questionsTemplateId": "7a1b2c3d-4e5f-6789-abcd-ef0123456789",
  "categorySectionId": "3fa85f64-5717-4562-b3fc-2c963f66afa8",
  "targetQuestionCount": 20,
  "totalQuestionCount": 0,
  "orderIndex": 1,
  "isActive": true,
  "createdAt": "2025-02-23T12:00:00Z",
  "updatedAt": null,
  "createdByAdminId": "admin-guid",
  "lastUpdatedByAdminId": null
}
```

**Response — 500**

```json
{ "error": "Kitapçık şablonu oluşturulurken bir hata oluştu." }
```

---

### 1.2 Şablon satırını güncelle

| | |
|---|---|
| **Method** | `PUT` |
| **URL** | `/api/AdminQuestionBookletTemplate/{id}` |
| **Açıklama** | Id ile belirtilen şablon satırını günceller. |

**Request body (gidiş)** — tüm alanlar opsiyonel; gönderilenler güncellenir.

```json
{
  "code": "TYT-MAT-1-V2",
  "name": "Matematik Bölüm 1 (güncel)",
  "description": null,
  "difficultyMix": null,
  "categoryId": null,
  "categorySubId": null,
  "categorySectionId": null,
  "targetQuestionCount": 25,
  "totalQuestionCount": null,
  "isActive": true,
  "orderIndex": 2
}
```

**Response — 200 OK (dönüş)**  
Güncellenmiş `QuestionBookletTemplateDto` (1.1 ile aynı yapı).

**Response — 404**

```json
{ "error": "Şablon bulunamadı." }
```

**Response — 500**

```json
{ "error": "Şablon güncellenirken bir hata oluştu." }
```

---

### 1.3 Tüm kitapçık şablonlarını listele

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/AdminQuestionBookletTemplate` |

**Response — 200 OK (dönüş)**

```json
[
  {
    "id": "7a1b2c3d-4e5f-6789-abcd-ef0123456789",
    "code": "TYT-MAT-1",
    "name": "Matematik Bölüm 1",
    "description": null,
    "difficultyMix": null,
    "categoryId": "...",
    "categorySubId": "...",
    "questionsTemplateId": "...",
    "categorySectionId": "...",
    "targetQuestionCount": 20,
    "totalQuestionCount": 0,
    "orderIndex": 1,
    "isActive": true,
    "createdAt": "...",
    "updatedAt": null,
    "createdByAdminId": null,
    "lastUpdatedByAdminId": null
  }
]
```

**Response — 500**

```json
{ "error": "Şablonlar listelenirken bir hata oluştu." }
```

---

### 1.4 Id ile şablon getir

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/AdminQuestionBookletTemplate/{id}` |

**Response — 200 OK (dönüş)**  
Tek `QuestionBookletTemplateDto` (1.1 ile aynı yapı).

**Response — 404**

```json
{ "error": "Şablon bulunamadı." }
```

**Response — 500**

```json
{ "error": "Şablon alınırken bir hata oluştu." }
```

---

### 1.5 Alt kategoriye göre şablonları listele

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/AdminQuestionBookletTemplate/by-category-sub/{categorySubId}` |

**Response — 200 OK (dönüş)**  
`QuestionBookletTemplateDto[]` (1.3 ile aynı yapı).

**Response — 500**

```json
{ "error": "Şablonlar listelenirken bir hata oluştu." }
```

---

### 1.6 Şablon setine göre satırları listele

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/AdminQuestionBookletTemplate/by-template-set/{questionsTemplateId}` |
| **Açıklama** | Aynı şablon setine (QuestionsTemplateId) ait tüm şablon satırlarını döner. |

**Response — 200 OK (dönüş)**  
`QuestionBookletTemplateDto[]` (1.3 ile aynı yapı).

**Response — 500**

```json
{ "error": "Şablon seti listelenirken bir hata oluştu." }
```

---

### 1.7 Şablon satırını sil

| | |
|---|---|
| **Method** | `DELETE` |
| **URL** | `/api/AdminQuestionBookletTemplate/{id}` |

**Response — 204 No Content**  
Body yok.

**Response — 404**

```json
{ "error": "Şablon bulunamadı." }
```

**Response — 500**

```json
{ "error": "Şablon silinirken bir hata oluştu." }
```

---

## 2. AdminQuestionBookletController

**Base path:** `/api/AdminQuestionBooklet`

---

### 2.1 Sınava ait kitapçık satırlarını listele

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/AdminQuestionBooklet/by-exam/{examId}` |
| **Açıklama** | Belirtilen sınava ait tüm kitapçık satırlarını (bölüm bazlı sorular) döner. |

**Response — 200 OK (dönüş)**

```json
[
  {
    "id": "booklet-row-guid",
    "examId": "exam-guid",
    "examSectionId": "template-row-guid",
    "questionsTemplateId": "template-row-guid",
    "lessonId": "lesson-guid",
    "name": "Matematik - Soru 1",
    "lessonName": "Matematik",
    "orderIndex": 1,
    "questionId": "question-guid",
    "questionCode": "ABC12XYZ",
    "stem": "Soru metni...",
    "optionsJson": null,
    "correctOptionKey": "C",
    "createdAt": "2025-02-23T12:00:00Z"
  }
]
```

**Response — 500**

```json
{ "error": "Kitapçık listelenirken bir hata oluştu." }
```

---

### 2.2 Kitapçık satırı detayı (Id ile)

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/AdminQuestionBooklet/{id}` |

**Response — 200 OK (dönüş)**  
Tek `QuestionBookletDto` (2.1 ile aynı yapı).

**Response — 404**

```json
{ "error": "Kitapçık satırı bulunamadı." }
```

**Response — 500**

```json
{ "error": "Kitapçık satırı alınırken bir hata oluştu." }
```

---

### 2.3 Kitapçık bölümüne soru ekle

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/AdminQuestionBooklet/add-question` |
| **Açıklama** | Bölüm şablonu (QuestionBookletTemplate.Id) ve sınav bilgisi ile yeni soru oluşturup kitapçık satırı ekler. ExamSectionId veya QuestionsTemplateId = bölüm şablonu Id. |

**Request body (gidiş)**

```json
{
  "examId": "exam-guid",
  "examSectionId": "00000000-0000-0000-0000-000000000000",
  "lessonId": "lesson-guid",
  "name": "Matematik - Soru 1",
  "orderIndex": 1,
  "questionsTemplateId": "question-booklet-template-id-bolum-sablonu",
  "questionTemplateItemId": null,
  "stem": "2 + 2 kaç eder?",
  "options": [
    { "optionKey": "A", "text": "3", "orderIndex": 1 },
    { "optionKey": "B", "text": "4", "orderIndex": 2 },
    { "optionKey": "C", "text": "5", "orderIndex": 3 }
  ],
  "correctOptionKey": "B",
  "lessonSubId": null,
  "publisherId": null
}
```

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| examId | guid | Evet | Sınav Id |
| examSectionId | guid | Bölüm şablonu Id (QuestionBookletTemplate.Id); boşsa questionsTemplateId kullanılır |
| lessonId | guid | Evet | Ders Id |
| name | string | Hayır | Satır adı |
| orderIndex | int | Evet | Sıra |
| questionsTemplateId | guid? | Bölüm şablonu Id (examSectionId alternatifi) |
| stem | string | Evet | Soru gövdesi |
| options | array | Evet | En az bir şık; optionKey, text, orderIndex |
| correctOptionKey | string | Evet | Doğru şık (options içindeki optionKey) |

**Response — 200 OK (dönüş)**  
Oluşturulan kitapçık satırı: `QuestionBookletDto` (2.1 ile aynı yapı).

**Response — 400**

```json
{
  "error": "Soru eklenemedi. Stem, Options ve CorrectOptionKey gerekli; ExamSectionId/QuestionsTemplateId (bölüm şablonu) belirtilmeli."
}
```

**Response — 500**

```json
{ "error": "Soru eklenirken bir hata oluştu." }
```

---

### 2.4 Kitapçıktan soru satırını kaldır

| | |
|---|---|
| **Method** | `DELETE` |
| **URL** | `/api/AdminQuestionBooklet/{id}` |
| **Açıklama** | `id` = kitapçık satırı (QuestionBooklet) Id. İlgili soru da kaldırılır. |

**Response — 204 No Content**  
Body yok.

**Response — 404**

```json
{ "error": "Kitapçık satırı bulunamadı." }
```

**Response — 500**

```json
{ "error": "Soru kaldırılırken bir hata oluştu." }
```

---

## 3. AdminQuestionController

**Base path:** `/api/AdminQuestion`

---

### 3.1 Id ile soru getir

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/AdminQuestion/{id}` |

**Response — 200 OK (dönüş)**

```json
{
  "id": "question-guid",
  "code": "ABC12XYZ",
  "stem": "Soru metni...",
  "publisherId": null,
  "lessonSubId": null,
  "createdAt": "2025-02-23T12:00:00Z",
  "updatedAt": null,
  "options": [
    { "id": "option-guid", "optionKey": "A", "orderIndex": 1 },
    { "id": "option-guid", "optionKey": "B", "orderIndex": 2 }
  ],
  "correctOptionKey": "B"
}
```

**Response — 404**

```json
{ "error": "Soru bulunamadı." }
```

**Response — 500**

```json
{ "error": "Soru alınırken bir hata oluştu." }
```

---

### 3.2 Code ile soru getir

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/AdminQuestion/by-code/{code}` |

**Response — 200 OK (dönüş)**  
3.1 ile aynı `QuestionDto` yapısı.

**Response — 404**

```json
{ "error": "Soru bulunamadı." }
```

**Response — 500**

```json
{ "error": "Soru alınırken bir hata oluştu." }
```

---

### 3.3 Soruları sayfalı listele

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/AdminQuestion?skip=0&take=20&lessonSubId=&publisherId=` |

**Query parametreleri**

| Parametre | Tip | Varsayılan | Açıklama |
|-----------|-----|------------|----------|
| skip | int | 0 | Atlanacak kayıt |
| take | int | 20 | Alınacak kayıt sayısı |
| lessonSubId | guid? | null | Filtre: ders alt kategorisi |
| publisherId | guid? | null | Filtre: yayıncı |

**Response — 200 OK (dönüş)**  
`QuestionDto[]` (3.1 ile aynı öğe yapısı).

**Response — 500**

```json
{ "error": "Soru listesi alınırken bir hata oluştu." }
```

---

### 3.4 Kitapçık bölümüne soru ekle (add-to-booklet)

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/AdminQuestion/add-to-booklet` |
| **Açıklama** | AdminQuestionBooklet/add-question ile aynı iş mantığı; aynı DTO kullanılır. |

**Request body (gidiş)**  
2.3 ile aynı: `QuestionBookletCreateDto` (examId, examSectionId/questionsTemplateId, lessonId, name, orderIndex, stem, options, correctOptionKey, lessonSubId, publisherId).

**Response — 200 OK (dönüş)**  
Oluşturulan kitapçık satırı: `QuestionBookletDto`.

**Response — 400**

```json
{
  "error": "Soru eklenemedi. Stem, Options ve CorrectOptionKey gerekli; bölüm şablonu (ExamSectionId/QuestionsTemplateId) belirtilmeli."
}
```

**Response — 500**

```json
{ "error": "Soru eklenirken bir hata oluştu." }
```

---

## 4. AdminQuestionSolutionController

**Base path:** `/api/AdminQuestionSolution`

---

### 4.1 Yeni soru çözümü oluştur

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/AdminQuestionSolution` |

**Request body (gidiş)**

```json
{
  "questionId": "question-guid",
  "type": 0,
  "title": "Açıklama metni",
  "contentText": "Adım adım çözüm...",
  "url": null,
  "orderIndex": 1,
  "isActive": true
}
```

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| questionId | guid | Evet | Soru Id |
| type | int | Evet | 0=ExplanationText, 1=Video, 2=Pdf, 3=Link |
| title | string | Hayır | Başlık |
| contentText | string | Hayır | Metin içerik (type=0 için uygun) |
| url | string | Hayır | Video/Pdf/Link URL (type=1,2,3 için) |
| orderIndex | int | Evet | Sıra |
| isActive | bool | Hayır | Varsayılan true |

**Response — 200 OK (dönüş)**

```json
{
  "id": "solution-guid",
  "code": "X7K9M2AB",
  "questionId": "question-guid",
  "type": 0,
  "title": "Açıklama metni",
  "contentText": "Adım adım çözüm...",
  "url": null,
  "orderIndex": 1,
  "isActive": true,
  "createdByAdminId": "admin-guid",
  "createdAt": "2025-02-23T12:00:00Z",
  "updatedAt": null
}
```

**Response — 400**

```json
{ "error": "Çözüm oluşturulamadı. QuestionId geçerli olmalıdır." }
```

**Response — 500**

```json
{ "error": "Çözüm oluşturulurken bir hata oluştu." }
```

---

### 4.2 Id ile çözüm getir

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/AdminQuestionSolution/{id}` |

**Response — 200 OK (dönüş)**  
Tek `QuestionSolutionDto` (4.1 response ile aynı yapı).

**Response — 404**

```json
{ "error": "Çözüm bulunamadı." }
```

**Response — 500**

```json
{ "error": "Çözüm alınırken bir hata oluştu." }
```

---

### 4.3 Soruya ait çözümleri listele

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/AdminQuestionSolution/by-question/{questionId}` |
| **Açıklama** | Belirtilen soruya ait tüm çözümler OrderIndex'e göre döner. |

**Response — 200 OK (dönüş)**  
`QuestionSolutionDto[]` (4.1 response ile aynı öğe yapısı).

**Response — 500**

```json
{ "error": "Çözümler listelenirken bir hata oluştu." }
```

---

### 4.4 Çözüm güncelle

| | |
|---|---|
| **Method** | `PUT` |
| **URL** | `/api/AdminQuestionSolution/{id}` |

**Request body (gidiş)** — tüm alanlar opsiyonel.

```json
{
  "type": 1,
  "title": "Video çözüm",
  "contentText": null,
  "url": "https://example.com/video.mp4",
  "orderIndex": 2,
  "isActive": true
}
```

**Response — 200 OK (dönüş)**  
Güncellenmiş `QuestionSolutionDto`.

**Response — 404**

```json
{ "error": "Çözüm bulunamadı." }
```

**Response — 500**

```json
{ "error": "Çözüm güncellenirken bir hata oluştu." }
```

---

### 4.5 Çözüm sil

| | |
|---|---|
| **Method** | `DELETE` |
| **URL** | `/api/AdminQuestionSolution/{id}` |

**Response — 204 No Content**  
Body yok.

**Response — 404**

```json
{ "error": "Çözüm bulunamadı." }
```

**Response — 500**

```json
{ "error": "Çözüm silinirken bir hata oluştu." }
```

---

## Özet tablo

| Controller | POST | GET | PUT | DELETE |
|------------|------|-----|-----|--------|
| AdminQuestionBookletTemplate | Create (/) | GetAll (/), GetById /{id}, GetByCategorySubId /by-category-sub/{id}, GetByQuestionsTemplateId /by-template-set/{id} | Update /{id} | Delete /{id} |
| AdminQuestionBooklet | AddQuestion /add-question | GetByExamId /by-exam/{examId}, GetById /{id} | — | RemoveQuestion /{id} |
| AdminQuestion | AddToBooklet /add-to-booklet | GetById /{id}, GetByCode /by-code/{code}, GetPaged /?skip&take&lessonSubId&publisherId | — | — |
| AdminQuestionSolution | Create (/) | GetById /{id}, GetByQuestionId /by-question/{questionId} | Update /{id} | Delete /{id} |

Tüm hata yanıtlarında body `{ "error": "..." }` formatındadır (JSON). 401/403 durumları yetki katmanından dönebilir; bu dokümanda yalnızca controller’ın döndürdüğü 400/404/500 örnekleri verilmiştir.
