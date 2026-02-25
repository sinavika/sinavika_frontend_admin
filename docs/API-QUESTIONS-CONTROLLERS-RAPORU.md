# API/Controllers/Questions — Endpoint ve Örnek İstek/Cevap Raporu

**Tarih:** 2025-02-25  
**Kapsam:** `API/Controllers/Questions/` altındaki tüm controller'lar, endpoint'ler ve örnek gidiş-dönüş (request/response) formatları.

---

## Genel Bilgiler

| Özellik | Değer |
|--------|--------|
| **Yetkilendirme** | Tüm endpoint'ler `[Authorize]` — Admin JWT Bearer token gerekir |
| **Swagger grubu** | `admin` |
| **Base URL** | `{baseUrl}/api/{controller}` |

**Header (tüm isteklerde):**
```http
Authorization: Bearer {adminJwtToken}
Content-Type: application/json
```

---

## Kavramlar

- **QuestionBooklet:** Kitapçık; alt kategori (CategorySub) ve isteğe bağlı bölüm listesi (CategorySection) ile oluşturulur. Code otomatik atanır.
- **QuestionBookletSlot:** Kitapçık içinde tek bir soru slotu. Her slot bir bölüme (CategorySection) aittir; her slota en fazla bir **Question** eklenir.
- **Question:** Soru metni (Stem), şıklar ve doğru cevap. Soru ekleme/güncelleme/silme **AdminQuestionBookletController** üzerinden **slot id** ile yapılır; **AdminQuestionController** sadece okuma (get/list) sunar.

---

# 1. AdminQuestionController

**Base URL:** `GET /api/AdminQuestion`

Soru havuzundan **okuma**: Id, Code veya sayfalı liste. Soru ekleme/güncelleme/silme **AdminQuestionBookletController** ile slota soru ekleyerek yapılır.

---

## 1.1 Soru Id ile getir

**Endpoint:** `GET /api/AdminQuestion/{id}`

**Açıklama:** Soru havuzundan Id ile tek soru döner (şıklar ve doğru cevap dahil).

**İstek (Request):**
```http
GET /api/AdminQuestion/00000000-0000-0000-0000-000000000001 HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Başarılı cevap (200 OK):**
```json
{
  "id": "00000000-0000-0000-0000-000000000001",
  "code": "MAT123456",
  "stem": "Bir sayının 3 katının 5 fazlası 23 ise bu sayı kaçtır?",
  "publisherId": null,
  "lessonSubId": "00000000-0000-0000-0000-000000003001",
  "createdAt": "2025-02-01T10:00:00Z",
  "updatedAt": null,
  "options": [
    { "id": "00000000-0000-0000-0000-000000000011", "optionKey": "A", "orderIndex": 1 },
    { "id": "00000000-0000-0000-0000-000000000012", "optionKey": "B", "orderIndex": 2 },
    { "id": "00000000-0000-0000-0000-000000000013", "optionKey": "C", "orderIndex": 3 },
    { "id": "00000000-0000-0000-0000-000000000014", "optionKey": "D", "orderIndex": 4 }
  ],
  "correctOptionKey": "C"
}
```

**Cevap (404):**
```json
{ "Error": "Soru bulunamadı." }
```

**Cevap (500):**
```json
{ "Error": "Soru alınırken bir hata oluştu." }
```

---

## 1.2 Soru Code ile getir

**Endpoint:** `GET /api/AdminQuestion/by-code/{code}`

**İstek:**
```http
GET /api/AdminQuestion/by-code/MAT123456 HTTP/1.1
Authorization: Bearer ...
```

**Cevap (200):** Yukarıdakiyle aynı `QuestionDto` yapısı.

**Cevap (404):** `{ "Error": "Soru bulunamadı." }`

---

## 1.3 Soru havuzunu sayfalı listele

**Endpoint:** `GET /api/AdminQuestion?skip=0&take=20&lessonSubId=&publisherId=`

**Query parametreleri:**

| Parametre | Tip | Varsayılan | Açıklama |
|-----------|-----|------------|----------|
| skip | int | 0 | Atlanacak kayıt sayısı |
| take | int | 20 | Alınacak kayıt sayısı (max 100) |
| lessonSubId | Guid? | null | Filtre: alt konu |
| publisherId | Guid? | null | Filtre: yayınevi |

**İstek:**
```http
GET /api/AdminQuestion?skip=0&take=10&lessonSubId=00000000-0000-0000-0000-000000003001 HTTP/1.1
Authorization: Bearer ...
```

**Cevap (200):**
```json
[
  {
    "id": "00000000-0000-0000-0000-000000000001",
    "code": "MAT123456",
    "stem": "Bir sayının 3 katının 5 fazlası 23 ise bu sayı kaçtır?",
    "publisherId": null,
    "lessonSubId": "00000000-0000-0000-0000-000000003001",
    "createdAt": "2025-02-01T10:00:00Z",
    "updatedAt": null,
    "options": [ ... ],
    "correctOptionKey": "C"
  }
]
```

**Cevap (500):** `{ "Error": "Soru listesi alınırken bir hata oluştu." }`

---

# 2. AdminQuestionBookletController

**Base URL:** `GET/POST/PUT/DELETE /api/AdminQuestionBooklet`

Kitapçık (QuestionBooklet) ve slot (QuestionBookletSlot) yönetimi; slota soru ekleme/güncelleme/kaldırma.

---

## 2.1 Kitapçık oluştur

**Endpoint:** `POST /api/AdminQuestionBooklet`

**Açıklama:** Yeni kitapçık oluşturur. CategorySectionIds verilirse bu bölümler için slotlar da oluşturulur (her bölüm için QuestionCount adet). Code otomatik atanır.

**Body (QuestionBookletCreateDto):**
```json
{
  "categorySubId": "00000000-0000-0000-0000-000000000101",
  "name": "TYT Deneme Kitapçık 1",
  "categorySectionIds": [
    "00000000-0000-0000-0000-000000001001",
    "00000000-0000-0000-0000-000000001002"
  ]
}
```

**categorySectionIds** boş veya null ise sadece kitapçık oluşturulur; slot eklenmez.

**Cevap (200):**
```json
{
  "id": "00000000-0000-0000-0000-000000002001",
  "code": "QB8XK2M4",
  "categorySubId": "00000000-0000-0000-0000-000000000101",
  "categorySubName": "Temel Yeterlilik Testi",
  "name": "TYT Deneme Kitapçık 1",
  "createdAt": "2025-02-01T12:00:00Z",
  "slots": [
    {
      "id": "00000000-0000-0000-0000-000000003001",
      "questionBookletId": "00000000-0000-0000-0000-000000002001",
      "categorySectionId": "00000000-0000-0000-0000-000000001001",
      "categorySectionName": "Türkçe",
      "sectionOrderIndex": 1,
      "lessonId": "00000000-0000-0000-0000-000000001001",
      "lessonName": null,
      "orderIndex": 1,
      "questionId": null,
      "questionCode": null,
      "stem": null,
      "createdAt": "0001-01-01T00:00:00Z"
    }
  ]
}
```

**Cevap (400):**
```json
{ "Error": "Kitapçık oluşturulamadı. CategorySubId geçerli olmalıdır." }
```

**Cevap (500):** `{ "Error": "Kitapçık oluşturulurken bir hata oluştu." }`

---

## 2.2 Kitapçığa tek bölüm için slot oluştur

**Endpoint:** `POST /api/AdminQuestionBooklet/slots-for-section`

**Açıklama:** Belirtilen kitapçığa, tek bir bölüm (CategorySection) için eksik slotları ekler; bölümün QuestionCount kuralına uyulur.

**Body (CreateSlotsForSectionRequestDto):**
```json
{
  "questionBookletId": "00000000-0000-0000-0000-000000002001",
  "categorySectionId": "00000000-0000-0000-0000-000000001001"
}
```

**Cevap (200):**
```json
{
  "createdCount": 40,
  "slots": [
    {
      "id": "00000000-0000-0000-0000-000000003041",
      "questionBookletId": "00000000-0000-0000-0000-000000002001",
      "categorySectionId": "00000000-0000-0000-0000-000000001001",
      "categorySectionName": "Türkçe",
      "sectionOrderIndex": 1,
      "lessonId": "00000000-0000-0000-0000-000000001001",
      "lessonName": null,
      "orderIndex": 40,
      "questionId": null,
      "questionCode": null,
      "stem": null,
      "createdAt": "0001-01-01T00:00:00Z"
    }
  ],
  "message": "40 slot oluşturuldu."
}
```

**Cevap (500):** `{ "Error": "Slotlar oluşturulurken bir hata oluştu." }`

---

## 2.3 Kitapçığa tüm bölümler için slot oluştur

**Endpoint:** `POST /api/AdminQuestionBooklet/slots-for-feature`

**Açıklama:** Belirtilen kitapçığa, sınav özelliğine (CategoryFeature) ait tüm bölümler için eksik slotları ekler.

**Body (CreateSlotsForFeatureRequestDto):**
```json
{
  "questionBookletId": "00000000-0000-0000-0000-000000002001",
  "categoryFeatureId": "00000000-0000-0000-0000-000000000101"
}
```

**Cevap (200):** `CreateSlotsResultDto` (createdCount, slots, message) — yapı 2.2 ile aynı.

---

## 2.4 Bölüme göre slotları listele

**Endpoint:** `GET /api/AdminQuestionBooklet/slots/by-section/{categorySectionId}`

**Açıklama:** Belirtilen bölüme (CategorySection) ait tüm slotları döner.

**İstek:**
```http
GET /api/AdminQuestionBooklet/slots/by-section/00000000-0000-0000-0000-000000001001 HTTP/1.1
Authorization: Bearer ...
```

**Cevap (200):** `QuestionBookletSlotDto[]`
```json
[
  {
    "id": "00000000-0000-0000-0000-000000003001",
    "questionBookletId": "00000000-0000-0000-0000-000000002001",
    "categorySectionId": "00000000-0000-0000-0000-000000001001",
    "categorySectionName": "Türkçe",
    "sectionOrderIndex": 1,
    "lessonId": "00000000-0000-0000-0000-000000001001",
    "lessonName": null,
    "orderIndex": 1,
    "questionId": "00000000-0000-0000-0000-000000000001",
    "questionCode": "MAT123456",
    "stem": "Bir sayının 3 katının 5 fazlası 23 ise bu sayı kaçtır?",
    "createdAt": "2025-02-01T12:30:00Z"
  }
]
```

---

## 2.5 Alt kategoriye göre kitapçıkları listele

**Endpoint:** `GET /api/AdminQuestionBooklet/by-category-sub/{categorySubId}`

**İstek:**
```http
GET /api/AdminQuestionBooklet/by-category-sub/00000000-0000-0000-0000-000000000101 HTTP/1.1
Authorization: Bearer ...
```

**Cevap (200):** `QuestionBookletDto[]` (id, code, categorySubId, categorySubName, name, createdAt, slots).

---

## 2.6 Kitapçığı Id ile getir (slotlar dahil)

**Endpoint:** `GET /api/AdminQuestionBooklet/booklet/{bookletId}`

**İstek:**
```http
GET /api/AdminQuestionBooklet/booklet/00000000-0000-0000-0000-000000002001 HTTP/1.1
Authorization: Bearer ...
```

**Cevap (200):** Tek `QuestionBookletDto` (slots dolu).

**Cevap (404):** `{ "Error": "Kitapçık bulunamadı." }`

---

## 2.7 Kitapçık slotunu Id ile getir

**Endpoint:** `GET /api/AdminQuestionBooklet/slot/{slotId}`

**İstek:**
```http
GET /api/AdminQuestionBooklet/slot/00000000-0000-0000-0000-000000003001 HTTP/1.1
Authorization: Bearer ...
```

**Cevap (200):** Tek `QuestionBookletSlotDto`.

**Cevap (404):** `{ "Error": "Kitapçık slotu bulunamadı." }`

---

## 2.8 Kitapçığı Code ile getir

**Endpoint:** `GET /api/AdminQuestionBooklet/by-code/{code}`

**İstek:**
```http
GET /api/AdminQuestionBooklet/by-code/QB8XK2M4 HTTP/1.1
Authorization: Bearer ...
```

**Cevap (200):** Tek `QuestionBookletDto` (slotlar dahil).

**Cevap (404):** `{ "Error": "Kitapçık bulunamadı." }`

---

## 2.9 Slota soru ekle

**Endpoint:** `POST /api/AdminQuestionBooklet/slot/{slotId}/question`

**Açıklama:** Belirtilen slota soru ekler. Slot boş olmalıdır. Stem, Options ve CorrectOptionKey zorunludur.

**Body (AddQuestionToBookletDto):**
```json
{
  "stem": "Bir sayının 3 katının 5 fazlası 23 ise bu sayı kaçtır?",
  "options": [
    { "optionKey": "A", "text": "4", "orderIndex": 1 },
    { "optionKey": "B", "text": "5", "orderIndex": 2 },
    { "optionKey": "C", "text": "6", "orderIndex": 3 },
    { "optionKey": "D", "text": "7", "orderIndex": 4 }
  ],
  "correctOptionKey": "C",
  "lessonSubId": "00000000-0000-0000-0000-000000003001",
  "publisherId": null
}
```

**Cevap (200):** Güncel `QuestionBookletSlotDto` (questionId, questionCode, stem dolu).

**Cevap (400):**
```json
{ "Error": "Soru eklenemedi. Stem, Options ve CorrectOptionKey gerekli; slot mevcut ve boş olmalı." }
```

**Cevap (500):** `{ "Error": "Soru eklenirken bir hata oluştu." }`

---

## 2.10 Slottaki soruyu güncelle

**Endpoint:** `PUT /api/AdminQuestionBooklet/slot/{slotId}/question`

**Body (UpdateQuestionInBookletDto — tüm alanlar opsiyonel):**
```json
{
  "stem": "Bir sayının 3 katının 5 fazlası 23 ise bu sayı kaçtır? (güncel)",
  "options": [
    { "optionKey": "A", "text": "4", "orderIndex": 1 },
    { "optionKey": "B", "text": "5", "orderIndex": 2 },
    { "optionKey": "C", "text": "6", "orderIndex": 3 },
    { "optionKey": "D", "text": "7", "orderIndex": 4 }
  ],
  "correctOptionKey": "C",
  "lessonSubId": "00000000-0000-0000-0000-000000003001",
  "publisherId": null
}
```

**Cevap (200):** Güncel `QuestionBookletSlotDto`.

**Cevap (404):** `{ "Error": "Slot veya soru bulunamadı." }`

**Cevap (500):** `{ "Error": "Soru güncellenirken bir hata oluştu." }`

---

## 2.11 Slottan soruyu kaldır

**Endpoint:** `DELETE /api/AdminQuestionBooklet/slot/{slotId}/question`

**Açıklama:** Slottaki soruyu siler; slot kalır (boş slot).

**İstek:** Body yok.

**Cevap (204 No Content):** Body yok.

**Cevap (500):** `{ "Error": "Soru kaldırılırken bir hata oluştu." }`

---

## 2.12 Kitapçığı sil

**Endpoint:** `DELETE /api/AdminQuestionBooklet/booklet/{bookletId}`

**Açıklama:** Kitapçığı siler; slotlar ve ilişkili sorular cascade silinir.

**İstek:**
```http
DELETE /api/AdminQuestionBooklet/booklet/00000000-0000-0000-0000-000000002001 HTTP/1.1
Authorization: Bearer ...
```

**Cevap (204 No Content):** Body yok.

**Cevap (404):** `{ "Error": "Kitapçık bulunamadı." }`

**Cevap (500):** `{ "Error": "Kitapçık silinirken bir hata oluştu." }`

---

# Özet Tablo

| Controller | Method | Endpoint | Açıklama |
|------------|--------|----------|----------|
| AdminQuestion | GET | /api/AdminQuestion/{id} | Soru Id ile getir |
| AdminQuestion | GET | /api/AdminQuestion/by-code/{code} | Soru Code ile getir |
| AdminQuestion | GET | /api/AdminQuestion?skip=&take=&lessonSubId=&publisherId= | Soru havuzu sayfalı liste |
| AdminQuestionBooklet | POST | /api/AdminQuestionBooklet | Kitapçık oluştur |
| AdminQuestionBooklet | POST | /api/AdminQuestionBooklet/slots-for-section | Tek bölüm için slot oluştur |
| AdminQuestionBooklet | POST | /api/AdminQuestionBooklet/slots-for-feature | Tüm bölümler için slot oluştur |
| AdminQuestionBooklet | GET | /api/AdminQuestionBooklet/slots/by-section/{categorySectionId} | Bölüme göre slot listesi |
| AdminQuestionBooklet | GET | /api/AdminQuestionBooklet/by-category-sub/{categorySubId} | Alt kategoriye göre kitapçıklar |
| AdminQuestionBooklet | GET | /api/AdminQuestionBooklet/booklet/{bookletId} | Kitapçık detay (slotlar dahil) |
| AdminQuestionBooklet | GET | /api/AdminQuestionBooklet/slot/{slotId} | Slot detay |
| AdminQuestionBooklet | GET | /api/AdminQuestionBooklet/by-code/{code} | Kitapçık Code ile getir |
| AdminQuestionBooklet | POST | /api/AdminQuestionBooklet/slot/{slotId}/question | Slota soru ekle |
| AdminQuestionBooklet | PUT | /api/AdminQuestionBooklet/slot/{slotId}/question | Slottaki soruyu güncelle |
| AdminQuestionBooklet | DELETE | /api/AdminQuestionBooklet/slot/{slotId}/question | Slottan soruyu kaldır |
| AdminQuestionBooklet | DELETE | /api/AdminQuestionBooklet/booklet/{bookletId} | Kitapçığı sil |

---

# DTO Özeti

| DTO | Kullanıldığı yer |
|-----|-------------------|
| QuestionDto | AdminQuestion GET cevapları |
| QuestionBookletDto | Kitapçık cevapları (Create, GetBookletById, GetByCode, GetByCategorySubId) |
| QuestionBookletSlotDto | Slot cevapları; CreateSlots sonucunda Slots dizisi |
| QuestionBookletCreateDto | POST kitapçık oluşturma body |
| CreateSlotsForSectionRequestDto | POST slots-for-section body |
| CreateSlotsForFeatureRequestDto | POST slots-for-feature body |
| AddQuestionToBookletDto | POST slot/{slotId}/question body |
| UpdateQuestionInBookletDto | PUT slot/{slotId}/question body |
| QuestionOptionInputDto | Options listesi (optionKey, text, orderIndex) |

---

**Not:** Tüm örnek GUID'ler placeholder'dır. Soru şıklarının metni (text) sunucuda şifreli saklanır; listeleme cevaplarında Options içinde sadece optionKey ve orderIndex dönülebilir (uygulama implementasyonuna göre değişir).
