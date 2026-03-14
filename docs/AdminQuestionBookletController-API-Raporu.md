# AdminQuestionBookletController – API Raporu

Bu rapor, **Kitapçık (QuestionBooklet)** yönetimi için kullanılan admin API’nin yapısını, süreci ve her endpoint’in örnek gidiş-dönüşlerini açıklar.

---

## 1. Yapı ve Süreç Özeti

### 1.1 Kavramlar

| Kavram | Açıklama |
|--------|----------|
| **Kitapçık (QuestionBooklet)** | Bir sınav tipine (alt kategori, CategorySub) ve isteğe bağlı yayınevine bağlı soru seti. Sınav oluşturulurken “hangi kitapçık kullanılacak” seçilir; kategori ve yayınevi kitapçıktan alınır. |
| **Slot (QuestionBookletSlot)** | Kitapçık içinde tek bir “soru yuvası”. Her slot bir **bölüme (CategorySection)** aittir ve bölümün **soru sayısı (QuestionCount)** kadar slot tanımlanır. Her slota **en fazla bir soru (Question)** atanır. |
| **Bölüm (CategorySection)** | Sınavın bir alt alanı (örn. Türkçe, Matematik). Her bölümün adı, sırası (OrderIndex) ve **soru sayısı (QuestionCount)** vardır. |
| **Özellik (CategoryFeature)** | Birden fazla bölümü gruplayan yapı. “Slots-for-feature” ile bir özelliğe ait tüm bölümler için slotlar tek seferde oluşturulur. |

### 1.2 Genel Akış

```
1. Kitapçık oluştur (CategorySubId + Name [+ isteğe bağlı bölüm ID’leri])
   → Code otomatik atanır.

2. Gerekirse slotları artır:
   - Tek bölüm için: slots-for-section (QuestionBookletId + CategorySectionId)
   - Tüm bölümler için: slots-for-feature (QuestionBookletId + CategoryFeatureId)

3. Slotlara soru ekle/güncelle/sil:
   - Slot boş olmalı (soru yok).
   - Soru eklerken LessonMikroId zorunlu; kitapçığın CategorySub’ı ile hiyerarşik uyum kontrol edilir.
   - Görsel varsa: question/with-images endpoint’leri (multipart/form-data).

4. Kitapçık durumunu güncelle (Taslak → Hazırlandı → Tamamlandı → SınavAşamasında).
   → Tamamlandı veya SınavAşamasında iken slot/soru ekleme ve içerik değişikliği yapılamaz.

5. Sınav oluştururken kitapçık Code’u kullanılır (GetAllBooklets veya GetByCode ile alınır).
```

### 1.3 Kitapçık Durumları (Status)

| Değer | Ad | Açıklama |
|-------|-----|----------|
| 0 | Taslak | Düzenlenebilir. |
| 1 | Hazırlanıyor | Düzenlenebilir. |
| 2 | Hazırlandı | Düzenlenebilir. |
| 3 | Tamamlandı | Slot/soru ekleme ve içerik değişikliği **kilitli**. |
| 4 | SınavAşamasında | Slot/soru ekleme ve içerik değişikliği **kilitli**. |

---

## 2. API Bilgileri

- **Base URL:** `https://{host}/api/AdminQuestionBooklet`
- **Yetkilendirme:** Tüm endpoint’ler `[Authorize]`; admin JWT gerekir.
- **Swagger grubu:** `admin`

---

## 3. Endpoint Listesi (Özet)

| # | Metot | URL | Açıklama |
|---|--------|-----|----------|
| 1 | GET | `/list` | Tüm kitapçıkları listele. |
| 2 | POST | `/` | Yeni kitapçık oluştur. |
| 3 | POST | `/slots-for-section` | Tek bölüm için eksik slotları oluştur. |
| 4 | POST | `/slots-for-feature` | Bir özelliğe ait tüm bölümler için eksik slotları oluştur. |
| 5 | GET | `/slots/by-section/{categorySectionId}` | Bölüme göre slotları listele. |
| 6 | GET | `/by-category-sub/{categorySubId}` | Alt kategoriye göre kitapçıkları listele. |
| 7 | GET | `/booklet/{bookletId}` | Kitapçığı Id ile getir (slotlar dahil). |
| 8 | GET | `/slot/{slotId}` | Slotu Id ile getir. |
| 9 | GET | `/by-code/{code}` | Kitapçığı Code ile getir. |
| 10 | POST | `/slot/{slotId}/question` | Slota soru ekle (JSON). |
| 11 | POST | `/slot/{slotId}/question/with-images` | Slota soru + görsel ekle (multipart). |
| 12 | PUT | `/slot/{slotId}/question` | Slottaki soruyu güncelle (JSON). |
| 13 | PUT | `/slot/{slotId}/question/with-images` | Slottaki soruyu + görselleri güncelle (multipart). |
| 14 | DELETE | `/slot/{slotId}/question` | Slottan soruyu kaldır. |
| 15 | PUT | `/booklet/{bookletId}/status` | Kitapçık durumunu güncelle. |
| 16 | DELETE | `/booklet/{bookletId}` | Kitapçığı sil. |

---

## 4. Endpoint Detayları ve Örnek Gidiş-Dönüşler

### 4.1 GET `/list` – Tüm kitapçıkları listele

Sınav oluştururken kullanılacak kitapçık listesi ve **Code** değerleri buradan alınır.

**İstek**

```http
GET /api/AdminQuestionBooklet/list
Authorization: Bearer {adminJwt}
```

**Başarılı cevap (200)**

```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "code": "K7XM2PQR",
    "categorySubId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "categorySubName": "TYT",
    "name": "TYT Deneme Kitapçığı 1",
    "publisherId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "status": 0,
    "createdAt": "2025-01-15T10:00:00Z",
    "slots": []
  }
]
```

*(Liste cevaplarında slotlar genelde boş veya özet; tam slot detayı için `GET booklet/{id}` kullanılır.)*

---

### 4.2 POST `/` – Kitapçık oluştur

**Body:** `QuestionBookletCreateDto`

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| categorySubId | Guid | Evet | Alt kategori (sınav tipi) ID. |
| name | string | Evet | Kitapçık adı. |
| publisherId | Guid? | Hayır | Yayınevi ID. |
| categorySectionIds | Guid[]? | Hayır | Verilirse bu bölümler için slotlar da oluşturulur (her bölüm için QuestionCount adet). |

**İstek örneği**

```http
POST /api/AdminQuestionBooklet
Authorization: Bearer {adminJwt}
Content-Type: application/json

{
  "categorySubId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "name": "TYT Deneme Kitapçığı 1",
  "publisherId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "categorySectionIds": [
    "d4e5f6a7-b8c9-0123-def0-234567890123",
    "e5f6a7b8-c9d0-1234-ef01-345678901234"
  ]
}
```

**Başarılı cevap (200)** – Oluşan kitapçık (slotlar dahil)

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "code": "K7XM2PQR",
  "categorySubId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "categorySubName": "TYT",
  "name": "TYT Deneme Kitapçığı 1",
  "publisherId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "status": 0,
  "createdAt": "2025-01-15T10:00:00Z",
  "slots": [
    {
      "id": "f6a7b8c9-d0e1-2345-f012-456789012345",
      "questionBookletId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "categorySectionId": "d4e5f6a7-b8c9-0123-def0-234567890123",
      "categorySectionName": "Türkçe",
      "sectionOrderIndex": 1,
      "lessonId": "a7b8c9d0-e1f2-3456-0123-567890123456",
      "lessonName": null,
      "orderIndex": 1,
      "questionId": null,
      "questionCode": null,
      "stem": null,
      "stemImageUrl": null,
      "optionsJson": null,
      "correctOptionKey": null,
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

**Hata (400)** – Geçersiz CategorySubId

```json
{
  "error": "Kitapçık oluşturulamadı. CategorySubId geçerli olmalıdır."
}
```

---

### 4.3 POST `/slots-for-section` – Tek bölüm için slot oluştur

Bölümün **QuestionCount**’una göre eksik kadar slot eklenir. Kitapçık **Tamamlandı** veya **SınavAşamasında** ise 400 döner.

**Body:** `CreateSlotsForSectionRequestDto`

| Alan | Tip | Açıklama |
|------|-----|----------|
| questionBookletId | Guid | Kitapçık ID. |
| categorySectionId | Guid | Bölüm ID. |

**İstek örneği**

```http
POST /api/AdminQuestionBooklet/slots-for-section
Authorization: Bearer {adminJwt}
Content-Type: application/json

{
  "questionBookletId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "categorySectionId": "d4e5f6a7-b8c9-0123-def0-234567890123"
}
```

**Başarılı cevap (200)**

```json
{
  "createdCount": 5,
  "slots": [
    {
      "id": "f6a7b8c9-d0e1-2345-f012-456789012345",
      "questionBookletId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "categorySectionId": "d4e5f6a7-b8c9-0123-def0-234567890123",
      "categorySectionName": "Türkçe",
      "sectionOrderIndex": 1,
      "orderIndex": 1,
      "questionId": null,
      "stem": null,
      "optionsJson": null,
      "correctOptionKey": null,
      "createdAt": "2025-01-15T10:05:00Z"
    }
  ],
  "message": "5 slot oluşturuldu."
}
```

**Hata (400)** – Kitapçık kilitli

```json
{
  "error": "Kitapçık sınav aşamasında veya tamamlandı; yeni slot eklenemez ve slot/soru üzerinde değişiklik yapılamaz."
}
```

---

### 4.4 POST `/slots-for-feature` – Özelliğe ait tüm bölümler için slot oluştur

**Body:** `CreateSlotsForFeatureRequestDto`

| Alan | Tip | Açıklama |
|------|-----|----------|
| questionBookletId | Guid | Kitapçık ID. |
| categoryFeatureId | Guid | Özellik ID (ilişkili tüm bölümler için slot açılır). |

**İstek örneği**

```http
POST /api/AdminQuestionBooklet/slots-for-feature
Authorization: Bearer {adminJwt}
Content-Type: application/json

{
  "questionBookletId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "categoryFeatureId": "01234567-89ab-cdef-0123-456789abcdef"
}
```

**Başarılı cevap (200)** – `CreateSlotsResultDto` (createdCount, slots, message)

```json
{
  "createdCount": 20,
  "slots": [ ],
  "message": "Toplam 20 slot oluşturuldu."
}
```

---

### 4.5 GET `/slots/by-section/{categorySectionId}` – Bölüme göre slotları listele

**İstek**

```http
GET /api/AdminQuestionBooklet/slots/by-section/d4e5f6a7-b8c9-0123-def0-234567890123
Authorization: Bearer {adminJwt}
```

**Başarılı cevap (200)** – `QuestionBookletSlotDto[]`

```json
[
  {
    "id": "f6a7b8c9-d0e1-2345-f012-456789012345",
    "questionBookletId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "categorySectionId": "d4e5f6a7-b8c9-0123-def0-234567890123",
    "categorySectionName": "Türkçe",
    "sectionOrderIndex": 1,
    "lessonId": "a7b8c9d0-e1f2-3456-0123-567890123456",
    "lessonName": null,
    "orderIndex": 1,
    "questionId": "11111111-2222-3333-4444-555555555555",
    "questionCode": "Q-001",
    "stem": "Aşağıdakilerden hangisi doğrudur?",
    "stemImageUrl": null,
    "optionsJson": "[{\"optionKey\":\"A\",\"text\":\"Birinci şık\",\"imageUrl\":null,\"orderIndex\":1},{\"optionKey\":\"B\",\"text\":\"İkinci şık\",\"imageUrl\":null,\"orderIndex\":2}]",
    "correctOptionKey": "B",
    "createdAt": "2025-01-15T10:10:00Z"
  }
]
```

---

### 4.6 GET `/by-category-sub/{categorySubId}` – Alt kategoriye göre kitapçıklar

**İstek**

```http
GET /api/AdminQuestionBooklet/by-category-sub/b2c3d4e5-f6a7-8901-bcde-f12345678901
Authorization: Bearer {adminJwt}
```

**Başarılı cevap (200)** – `QuestionBookletDto[]`

```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "code": "K7XM2PQR",
    "categorySubId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "categorySubName": "TYT",
    "name": "TYT Deneme Kitapçığı 1",
    "publisherId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "status": 0,
    "createdAt": "2025-01-15T10:00:00Z",
    "slots": []
  }
]
```

---

### 4.7 GET `/booklet/{bookletId}` – Kitapçığı Id ile getir

Slotlar ve atanmış sorular (varsa OptionsJson, CorrectOptionKey) dahil.

**İstek**

```http
GET /api/AdminQuestionBooklet/booklet/a1b2c3d4-e5f6-7890-abcd-ef1234567890
Authorization: Bearer {adminJwt}
```

**Başarılı cevap (200)** – `QuestionBookletDto`

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "code": "K7XM2PQR",
  "categorySubId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "categorySubName": "TYT",
  "name": "TYT Deneme Kitapçığı 1",
  "publisherId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "status": 0,
  "createdAt": "2025-01-15T10:00:00Z",
  "slots": [
    {
      "id": "f6a7b8c9-d0e1-2345-f012-456789012345",
      "questionBookletId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "categorySectionId": "d4e5f6a7-b8c9-0123-def0-234567890123",
      "categorySectionName": "Türkçe",
      "sectionOrderIndex": 1,
      "orderIndex": 1,
      "questionId": "11111111-2222-3333-4444-555555555555",
      "questionCode": "Q-001",
      "stem": "Aşağıdakilerden hangisi doğrudur?",
      "stemImageUrl": null,
      "optionsJson": "[{\"optionKey\":\"A\",\"text\":\"Birinci şık\",\"imageUrl\":null,\"orderIndex\":1},{\"optionKey\":\"B\",\"text\":\"İkinci şık\",\"imageUrl\":null,\"orderIndex\":2}]",
      "correctOptionKey": "B",
      "createdAt": "2025-01-15T10:10:00Z"
    }
  ]
}
```

**Hata (404)**

```json
{
  "error": "Kitapçık bulunamadı."
}
```

---

### 4.8 GET `/slot/{slotId}` – Slotu Id ile getir

**İstek**

```http
GET /api/AdminQuestionBooklet/slot/f6a7b8c9-d0e1-2345-f012-456789012345
Authorization: Bearer {adminJwt}
```

**Başarılı cevap (200)** – `QuestionBookletSlotDto` (tek nesne; yapı yukarıdaki slot örneği gibi).

**Hata (404)**

```json
{
  "error": "Kitapçık slotu bulunamadı."
}
```

---

### 4.9 GET `/by-code/{code}` – Kitapçığı Code ile getir

Sınav oluştururken kitapçık seçimi için kullanılabilir.

**İstek**

```http
GET /api/AdminQuestionBooklet/by-code/K7XM2PQR
Authorization: Bearer {adminJwt}
```

**Başarılı cevap (200)** – `QuestionBookletDto` (kitapçık + slotlar, yapı 4.7 ile aynı).

**Hata (404)**

```json
{
  "error": "Kitapçık bulunamadı."
}
```

---

### 4.10 POST `/slot/{slotId}/question` – Slota soru ekle (JSON)

Slot **boş** olmalı. **LessonMikroId** zorunlu; kitapçığın CategorySub’ı ile hiyerarşik uyum kontrol edilir.

**Body:** `AddQuestionToBookletDto`

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| stem | string | Evet | Soru metni. |
| stemImageUrl | string? | Hayır | Soru görseli URL (yoksa with-images ile yüklenebilir). |
| options | QuestionOptionInputDto[] | Evet | Şıklar (optionKey, text, imageUrl, orderIndex). |
| correctOptionKey | string | Evet | Doğru şık anahtarı (örn. "A", "B"). |
| lessonMikroId | Guid | Evet | Mikro konu ID; kitapçık kategorisi ile uyumlu olmalı. |

**İstek örneği**

```http
POST /api/AdminQuestionBooklet/slot/f6a7b8c9-d0e1-2345-f012-456789012345/question
Authorization: Bearer {adminJwt}
Content-Type: application/json

{
  "stem": "Aşağıdakilerden hangisi doğrudur?",
  "stemImageUrl": null,
  "options": [
    { "optionKey": "A", "text": "Birinci şık", "imageUrl": null, "orderIndex": 1 },
    { "optionKey": "B", "text": "İkinci şık", "imageUrl": null, "orderIndex": 2 },
    { "optionKey": "C", "text": "Üçüncü şık", "imageUrl": null, "orderIndex": 3 },
    { "optionKey": "D", "text": "Dördüncü şık", "imageUrl": null, "orderIndex": 4 }
  ],
  "correctOptionKey": "B",
  "lessonMikroId": "m1k2r0o3-i4d5-6789-abcd-ef0123456789"
}
```

**Başarılı cevap (200)** – Güncel slot DTO (soru atanmış; OptionsJson, CorrectOptionKey dolu).

**Hata (400)** – Örn. slot dolu, LessonMikro uyumsuz

```json
{
  "error": "Soru eklenemedi. Stem, Options ve CorrectOptionKey gerekli; slot mevcut ve boş olmalı."
}
```

```json
{
  "error": "Seçilen mikro konu, kitapçığın kategorisi (CategorySub) ile hiyerarşik olarak bağlı değildir."
}
```

---

### 4.11 POST `/slot/{slotId}/question/with-images` – Slota soru + görsel ekle

**Content-Type:** `multipart/form-data`

| Form alanı | Tip | Açıklama |
|------------|-----|----------|
| data | string | AddQuestionToBookletDto’nun JSON metni. |
| stemImage | file? | Soru gövdesi görseli (JPEG, PNG, GIF, WebP). |
| optionImageA … optionImageE | file? | Şık görselleri (A–E). |

**Örnek (curl)**

```bash
curl -X POST "https://{host}/api/AdminQuestionBooklet/slot/f6a7b8c9-d0e1-2345-f012-456789012345/question/with-images" \
  -H "Authorization: Bearer {adminJwt}" \
  -F "data={\"stem\":\"Soru metni\",\"options\":[{\"optionKey\":\"A\",\"text\":\"Şık A\",\"imageUrl\":null,\"orderIndex\":1},{\"optionKey\":\"B\",\"text\":\"Şık B\",\"imageUrl\":null,\"orderIndex\":2}],\"correctOptionKey\":\"A\",\"lessonMikroId\":\"m1k2r0o3-i4d5-6789-abcd-ef0123456789\"};type=application/json" \
  -F "stemImage=@soru.png" \
  -F "optionImageA=@sik_a.png"
```

**Başarılı cevap (200)** – Güncel slot DTO (yüklenen görsellerin URL’leri data’ya işlenmiş olarak).

**Hata (400)** – Örn. geçersiz JSON, görsel formatı

```json
{
  "error": "Form alanı 'data' (soru JSON) gerekli."
}
```

---

### 4.12 PUT `/slot/{slotId}/question` – Slottaki soruyu güncelle (JSON)

Tüm alanlar opsiyonel; gönderilenler güncellenir.

**Body:** `UpdateQuestionInBookletDto`

| Alan | Tip | Açıklama |
|------|-----|----------|
| stem | string? | Soru metni. |
| stemImageUrl | string? | Soru görseli URL. |
| options | QuestionOptionInputDto[]? | Şıklar. |
| correctOptionKey | string? | Doğru şık. |
| lessonMikroId | Guid? | Mikro konu; verilirse CategorySub uyumu kontrol edilir. |

**İstek örneği**

```http
PUT /api/AdminQuestionBooklet/slot/f6a7b8c9-d0e1-2345-f012-456789012345/question
Authorization: Bearer {adminJwt}
Content-Type: application/json

{
  "stem": "Güncellenmiş soru metni.",
  "correctOptionKey": "C"
}
```

**Başarılı cevap (200)** – Güncel slot DTO.

**Hata (404)** – Slot veya soru yok

```json
{
  "error": "Slot veya soru bulunamadı."
}
```

---

### 4.13 PUT `/slot/{slotId}/question/with-images` – Slottaki soruyu + görselleri güncelle

**Content-Type:** `multipart/form-data`  
Form alanları: `data` (UpdateQuestionInBookletDto JSON), `stemImage`, `optionImageA` … `optionImageE` (isteğe bağlı dosyalar).

**Başarılı cevap (200)** – Güncel slot DTO.

**Hata (404)** – “bulunamadı” içeren mesajda NotFound dönülür.

---

### 4.14 DELETE `/slot/{slotId}/question` – Slottan soruyu kaldır

Slot kalır, sadece atanmış soru silinir. Kitapçık Tamamlandı/SınavAşamasında ise 400.

**İstek**

```http
DELETE /api/AdminQuestionBooklet/slot/f6a7b8c9-d0e1-2345-f012-456789012345/question
Authorization: Bearer {adminJwt}
```

**Başarılı cevap (204)** – Body yok.

**Hata (400)** – Kitapçık kilitli

```json
{
  "error": "Kitapçık sınav aşamasında veya tamamlandı; yeni slot eklenemez ve slot/soru üzerinde değişiklik yapılamaz."
}
```

---

### 4.15 PUT `/booklet/{bookletId}/status` – Kitapçık durumunu güncelle

**Body:** `SetBookletStatusRequest`

| Alan | Tip | Açıklama |
|------|-----|----------|
| status | int | 0=Taslak, 1=Hazırlanıyor, 2=Hazırlandı, 3=Tamamlandı, 4=SınavAşamasında. |

**İstek örneği**

```http
PUT /api/AdminQuestionBooklet/booklet/a1b2c3d4-e5f6-7890-abcd-ef1234567890/status
Authorization: Bearer {adminJwt}
Content-Type: application/json

{
  "status": 3
}
```

**Başarılı cevap (200)**

```json
{
  "message": "Kitapçık durumu güncellendi."
}
```

**Hata (400)** – Geçersiz status

```json
{
  "error": "Geçersiz kitapçık durumu. Geçerli değerler: 0=Taslak, 1=Hazırlanıyor, 2=Hazırlandı, 3=Tamamlandı, 4=SınavAşamasında. Gönderilen: 9."
}
```

**Hata (404)**

```json
{
  "error": "Kitapçık bulunamadı."
}
```

---

### 4.16 DELETE `/booklet/{bookletId}` – Kitapçığı sil

Slotlar ve ilişkili sorular cascade silinir.

**İstek**

```http
DELETE /api/AdminQuestionBooklet/booklet/a1b2c3d4-e5f6-7890-abcd-ef1234567890
Authorization: Bearer {adminJwt}
```

**Başarılı cevap (204)** – Body yok.

**Hata (404)**

```json
{
  "error": "Kitapçık bulunamadı."
}
```

---

## 5. DTO Şemaları (Kısa Özet)

- **QuestionBookletDto:** id, code, categorySubId, categorySubName, name, publisherId, status, createdAt, slots[].
- **QuestionBookletSlotDto:** id, questionBookletId, categorySectionId, categorySectionName, sectionOrderIndex, lessonId, lessonName, orderIndex, questionId, questionCode, stem, stemImageUrl, **optionsJson**, **correctOptionKey**, createdAt.
- **QuestionBookletCreateDto:** categorySubId, name, publisherId?, categorySectionIds?.
- **AddQuestionToBookletDto:** stem, stemImageUrl?, options[], correctOptionKey, **lessonMikroId**.
- **UpdateQuestionInBookletDto:** stem?, stemImageUrl?, options?, correctOptionKey?, lessonMikroId?.
- **CreateSlotsForSectionRequestDto:** questionBookletId, categorySectionId.
- **CreateSlotsForFeatureRequestDto:** questionBookletId, categoryFeatureId.
- **CreateSlotsResultDto:** createdCount, slots[], message.
- **QuestionOptionInputDto:** optionKey, text, imageUrl?, orderIndex.
- **SetBookletStatusRequest:** status (int).

---

## 6. Örnek İş Akışı (Sıralı Senaryo)

1. **Kitapçık oluştur**  
   `POST /` → categorySubId, name, (isteğe bağlı categorySectionIds).  
   Cevapta `id` ve `code` alınır.

2. **Eksik slotları aç**  
   `POST /slots-for-section` veya `POST /slots-for-feature` ile bölüm/özelliğe göre slot sayısını tamamla.

3. **Slotları listele**  
   `GET /slots/by-section/{categorySectionId}` veya `GET /booklet/{bookletId}` ile boş slotları gör.

4. **Slota soru ekle**  
   Boş bir slot için `POST /slot/{slotId}/question` (JSON) veya `POST /slot/{slotId}/question/with-images` (multipart).  
   LessonMikroId’yi ilgili kategori (AdminLesson by-category-sub) ile uyumlu seç.

5. **Soru güncelle / kaldır**  
   `PUT /slot/{slotId}/question` veya `PUT .../question/with-images`; gerekiyorsa `DELETE /slot/{slotId}/question`.

6. **Kitapçık durumunu ilerlet**  
   `PUT /booklet/{bookletId}/status` ile status = 2 (Hazırlandı) veya 3 (Tamamlandı).  
   Status 3 veya 4 iken slot/soru ekleme ve içerik değişikliği kilitlenir.

7. **Sınav oluştururken**  
   `GET /list` veya `GET /by-code/{code}` ile kitapçık listesi/Code alınır; sınav oluşturma isteğinde bu Code kullanılır.

Bu rapor, AdminQuestionBookletController’ın yapısını, sürecini ve tüm endpoint’lerin örnek gidiş-dönüşlerini tek yerde toplar.
