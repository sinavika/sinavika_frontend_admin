# API Admin Lesson Controller — Detaylı Rapor

Bu doküman, `API/Controllers/Lessons/AdminLessonController` üzerinden sunulan **admin ders hiyerarşisi** endpoint'lerini, hiyerarşik yapıyı, süreci ve örnek gidiş-dönüş (request/response) body'lerini açıklar.

**Genel bilgiler**
- **Yetkilendirme:** Tüm endpoint'ler `[Authorize]` ile korunur; geçerli JWT/Bearer token gerekir.
- **Swagger grubu:** `admin`
- **Base URL:** `/api/AdminLesson`

---

## İçindekiler

1. [Hiyerarşik yapı ve süreç](#1-hiyerarşik-yapı-ve-süreç)
2. [Endpoint özet tablosu](#2-endpoint-özet-tablosu)
3. [1. Seviye: Lesson (Ders listesi)](#3-1-seviye-lesson-ders-listesi)
4. [2. Seviye: LessonMain (Ders içeriği)](#4-2-seviye-lessonmain-ders-içeriği)
5. [3. Seviye: LessonSub (Alt konu)](#5-3-seviye-lessonsub-alt-konu)
6. [4. Seviye: LessonMikro (Mikro konu)](#6-4-seviye-lessonmikro-mikro-konu)
7. [Ortak hata yanıtları](#7-ortak-hata-yanıtları)
8. [DTO referansı](#8-dto-referansı)

---

## 1. Hiyerarşik yapı ve süreç

### 1.1 Varlık hiyerarşisi

```
CategorySub (TYT, AYT, KPSS Lisans vb.)
    └── Lesson (kategoriye bağlı ders listesi konteyneri; örn. "Türkçe", "Matematik")
            └── LessonMain (ders içeriği; örn. "Sözcükte Anlam", "Trigonometri")
                    └── LessonSub (alt konu; örn. "Gerçek ve mecaz anlam", "Limit")
                            └── LessonMikro (mikro konu; en alt başlık)
```

- **Lesson:** Bir alt kategori (CategorySub) içinde gösterilecek “ders” başlığıdır; doğrudan Code/Name detayı LessonMain’de tutulur.
- **LessonMain:** Dersin ana konu başlıkları (Code, Name, Description, OrderIndex).
- **LessonSub:** LessonMain altında alt konular.
- **LessonMikro:** LessonSub altında en ince detay (opsiyonel).

### 1.2 Route hiyerarşisi

Tüm route'lar tek controller altında hiyerarşik tasarlanmıştır:

| Seviye   | Route parçası | Açıklama |
|----------|----------------|----------|
| Lesson   | `/api/AdminLesson` | Ders listesi (CategorySub’a göre) |
| Lesson   | `/{lessonId}` | Tek ders |
| Main     | `/{lessonId}/mains` | Bu derse ait ana konular |
| Main     | `/{lessonId}/mains/{mainId}` | Tek ana konu |
| Sub      | `/{lessonId}/mains/{mainId}/subs` | Bu ana konuya ait alt konular |
| Sub      | `/{lessonId}/mains/{mainId}/subs/{subId}` | Tek alt konu |
| Mikro    | `/{lessonId}/mains/{mainId}/subs/{subId}/mikros` | Bu alt konuya ait mikro konular |
| Mikro    | `.../mikros/{mikroId}` | Tek mikro konu |

Route’daki `lessonId`, `mainId`, `subId`, `mikroId` tutarlılık ve breadcrumb için kullanılır; bazı işlemlerde sadece en alt id (örn. `mainId`, `subId`, `mikroId`) servise gider.

### 1.3 Tipik kullanım süreci

1. **Ders listesini al:** `GET /api/AdminLesson` → Tüm Lesson’lar (CategorySub’a göre).
2. **Bir dersi seç:** `GET /api/AdminLesson/{lessonId}` → Ders detayı.
3. **Ana konuları listele:** `GET /api/AdminLesson/{lessonId}/mains` → Bu derse ait LessonMain listesi.
4. **Ana konu detayı:** `GET /api/AdminLesson/{lessonId}/mains/{mainId}`.
5. **Alt konuları listele:** `GET /api/AdminLesson/{lessonId}/mains/{mainId}/subs`.
6. **Alt konu detayı:** `GET /api/AdminLesson/{lessonId}/mains/{mainId}/subs/{subId}`.
7. **Mikro konuları listele:** `GET /api/AdminLesson/{lessonId}/mains/{mainId}/subs/{subId}/mikros`.
8. **Mikro detay:** `GET .../mikros/{mikroId}`.

Oluşturma/güncelleme/silme işlemleri aynı hiyerarşiye uygun route’larla yapılır (aşağıda tek tek verilmiştir).

---

## 2. Endpoint özet tablosu

| Metot | Endpoint | Açıklama |
|-------|----------|----------|
| GET   | `/api/AdminLesson` | Tüm dersleri listele |
| GET   | `/api/AdminLesson/{lessonId}` | Ders detayı |
| POST  | `/api/AdminLesson` | Yeni ders oluştur |
| PUT   | `/api/AdminLesson/{lessonId}` | Ders güncelle |
| DELETE| `/api/AdminLesson/{lessonId}` | Dersi pasif yap (soft delete) |
| GET   | `/api/AdminLesson/{lessonId}/mains` | Derse ait ana konuları listele |
| GET   | `/api/AdminLesson/{lessonId}/mains/{mainId}` | Ana konu detayı |
| POST  | `/api/AdminLesson/{lessonId}/mains` | Yeni ana konu ekle |
| PUT   | `/api/AdminLesson/{lessonId}/mains/{mainId}` | Ana konu güncelle |
| DELETE| `/api/AdminLesson/{lessonId}/mains/{mainId}` | Ana konu sil |
| GET   | `/api/AdminLesson/{lessonId}/mains/{mainId}/subs` | Alt konuları listele |
| GET   | `/api/AdminLesson/{lessonId}/mains/{mainId}/subs/{subId}` | Alt konu detayı |
| POST  | `/api/AdminLesson/{lessonId}/mains/{mainId}/subs` | Yeni alt konu ekle |
| PUT   | `/api/AdminLesson/{lessonId}/mains/{mainId}/subs/{subId}` | Alt konu güncelle |
| DELETE| `/api/AdminLesson/{lessonId}/mains/{mainId}/subs/{subId}` | Alt konu sil |
| GET   | `/api/AdminLesson/{lessonId}/mains/{mainId}/subs/{subId}/mikros` | Mikro konuları listele |
| GET   | `.../mikros/{mikroId}` | Mikro konu detayı |
| POST  | `.../subs/{subId}/mikros` | Yeni mikro konu ekle |
| PUT   | `.../mikros/{mikroId}` | Mikro konu güncelle |
| DELETE| `.../mikros/{mikroId}` | Mikro konu sil |

---

## 3. 1. Seviye: Lesson (Ders listesi)

Lesson, bir **CategorySub** (örn. TYT, AYT) içinde listelenen ders konteyneridir. İsim ve sıra burada; konu detayları LessonMain/LessonSub/LessonMikro’dadır.

### 3.1 GET /api/AdminLesson

Tüm dersleri (Lesson) listeler. Parametre yok.

**Response (200):** `LessonDto[]`

```json
[
  {
    "id": "050fc998-924d-094a-990d-abbff3ea00b4",
    "categorySubId": "a3be34a7-e0ab-3ef3-b7fb-3b59c3f961e5",
    "name": "Türkçe",
    "orderIndex": 1,
    "isActive": true,
    "createdAt": "2026-03-11T00:00:00Z",
    "updatedAt": null,
    "categorySubName": "TYT",
    "lessonMains": null
  },
  {
    "id": "89039f37-4449-ca4b-e12e-1019a99cf671",
    "categorySubId": "a3be34a7-e0ab-3ef3-b7fb-3b59c3f961e5",
    "name": "Sosyal Bilimler",
    "orderIndex": 2,
    "isActive": true,
    "createdAt": "2026-03-11T00:00:00Z",
    "updatedAt": null,
    "categorySubName": "TYT",
    "lessonMains": null
  }
]
```

---

### 3.2 GET /api/AdminLesson/{lessonId}

Belirtilen dersin detayını döner.

**Parametre:** `lessonId` (Guid, route)

**Response (200):** `LessonDto` (tek nesne, yukarıdaki elemanlardan biri gibi).

**Response (404):**

```json
{ "error": "Ders bulunamadı." }
```

---

### 3.3 POST /api/AdminLesson

Yeni ders (Lesson) oluşturur.

**Request body:** `LessonCreateDto`

```json
{
  "categorySubId": "a3be34a7-e0ab-3ef3-b7fb-3b59c3f961e5",
  "name": "Türkçe",
  "orderIndex": 1,
  "isActive": true
}
```

| Alan           | Tip    | Zorunlu | Açıklama |
|----------------|--------|---------|----------|
| categorySubId  | Guid   | Evet    | Alt kategori (CategorySub) Id |
| name           | string | Evet    | Ders adı |
| orderIndex     | int    | Evet    | Sıra |
| isActive       | bool   | Hayır   | Varsayılan true |

**Response (200):**

```json
{ "message": "Ders başarıyla oluşturuldu." }
```

**Response (500):** `{ "error": "Ders eklenirken bir hata oluştu." }`

---

### 3.4 PUT /api/AdminLesson/{lessonId}

Ders bilgisini günceller.

**Parametre:** `lessonId` (Guid, route)

**Request body:** `LessonUpdateDto` (tüm alanlar opsiyonel)

```json
{
  "name": "Türkçe (güncel)",
  "orderIndex": 2,
  "isActive": true
}
```

**Response (200):** `{ "message": "..." }`  
**Response (404):** `{ "error": "Ders bulunamadı." }`

---

### 3.5 DELETE /api/AdminLesson/{lessonId}

Dersi pasif yapar (soft delete; IsActive = false vb.).

**Parametre:** `lessonId` (Guid, route)

**Response (200):** `{ "message": "..." }`  
**Response (404):** `{ "error": "Ders bulunamadı." }`

---

## 4. 2. Seviye: LessonMain (Ders içeriği)

LessonMain, bir **Lesson** altındaki ana konu başlıklarıdır (Code, Name, Description, OrderIndex).

### 4.1 GET /api/AdminLesson/{lessonId}/mains

Belirtilen derse ait ana konuları (LessonMain) listeler.

**Parametreler:** `lessonId` (Guid, route)

**Response (200):** `LessonMainDto[]`

```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "lessonId": "050fc998-924d-094a-990d-abbff3ea00b4",
    "code": "SOZCUKTE_ANLAM",
    "name": "Sözcükte Anlam",
    "description": null,
    "orderIndex": 1,
    "isActive": true,
    "createdAt": "2026-03-11T00:00:00Z",
    "updatedAt": null
  },
  {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "lessonId": "050fc998-924d-094a-990d-abbff3ea00b4",
    "code": "CUMLEDE_ANLAM",
    "name": "Cümlede Anlam",
    "description": null,
    "orderIndex": 2,
    "isActive": true,
    "createdAt": "2026-03-11T00:00:00Z",
    "updatedAt": null
  }
]
```

---

### 4.2 GET /api/AdminLesson/{lessonId}/mains/{mainId}

Belirtilen ana konunun detayını döner. `mainId` farklı bir `lessonId`’ye aitse 404 döner.

**Parametreler:** `lessonId`, `mainId` (Guid, route)

**Response (200):** Tek `LessonMainDto`.  
**Response (404):** `{ "error": "Ders içeriği bulunamadı." }`

---

### 4.3 POST /api/AdminLesson/{lessonId}/mains

Bu derse yeni ana konu (LessonMain) ekler.

**Parametre:** `lessonId` (Guid, route)

**Request body:** `LessonMainCreateDto`

```json
{
  "code": "PARAGRAF",
  "name": "Paragrafta Anlam",
  "description": "Paragraf türleri ve ana düşünce.",
  "orderIndex": 3,
  "isActive": true
}
```

| Alan        | Tip    | Zorunlu | Açıklama |
|-------------|--------|---------|----------|
| code        | string | Evet    | Ana konu kodu |
| name        | string | Evet    | Ana konu adı |
| description | string | Hayır   | Açıklama |
| orderIndex  | int    | Evet    | Sıra |
| isActive    | bool   | Hayır   | Varsayılan true |

**Response (200):** `{ "message": "..." }`  
**Response (404):** `{ "error": "Ders (Lesson) bulunamadı." }`

---

### 4.4 PUT /api/AdminLesson/{lessonId}/mains/{mainId}

Ana konuyu günceller.

**Request body:** `LessonMainUpdateDto` (opsiyonel alanlar)

```json
{
  "code": "PARAGRAF_V2",
  "name": "Paragrafta Anlam (güncel)",
  "description": "Güncel açıklama",
  "orderIndex": 4,
  "isActive": true
}
```

**Response (200):** `{ "message": "..." }`  
**Response (404):** `{ "error": "Ders içeriği bulunamadı." }`

---

### 4.5 DELETE /api/AdminLesson/{lessonId}/mains/{mainId}

Ana konuyu siler.

**Response (200):** `{ "message": "..." }`  
**Response (404):** `{ "error": "Ders içeriği bulunamadı." }`

---

## 5. 3. Seviye: LessonSub (Alt konu)

LessonSub, bir **LessonMain** altındaki alt konulardır (örn. “Sözcükte Anlam” → “Gerçek ve mecaz anlam”).

### 5.1 GET /api/AdminLesson/{lessonId}/mains/{mainId}/subs

Belirtilen ana konuya ait alt konuları listeler.

**Parametreler:** `lessonId`, `mainId` (Guid, route)

**Response (200):** `LessonSubDto[]`

```json
[
  {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "lessonMainId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "code": "GERCEK_MECAZ",
    "name": "Gerçek, mecaz ve terim anlam",
    "description": null,
    "orderIndex": 1,
    "isActive": true,
    "createdAt": "2026-03-11T00:00:00Z",
    "updatedAt": null
  }
]
```

---

### 5.2 GET /api/AdminLesson/{lessonId}/mains/{mainId}/subs/{subId}

Alt konu detayı. `subId` farklı bir `mainId`’ye aitse 404 döner.

**Response (200):** Tek `LessonSubDto`.  
**Response (404):** `{ "error": "Alt konu bulunamadı." }`

---

### 5.3 POST /api/AdminLesson/{lessonId}/mains/{mainId}/subs

Bu ana konuya yeni alt konu (LessonSub) ekler.

**Parametreler:** `lessonId`, `mainId` (Guid, route)

**Request body:** `LessonSubCreateDto`

```json
{
  "code": "YAKIN_KARSIT_ANLAM",
  "name": "Yakın anlam, karşıt anlam ve eş anlamlılık",
  "description": null,
  "orderIndex": 2,
  "isActive": true
}
```

**Response (200):** `{ "message": "..." }`  
**Response (404):** `{ "error": "Ders içeriği (LessonMain) bulunamadı." }`  
**Response (400):** `{ "error": "..." }` (validasyon / ArgumentException)

---

### 5.4 PUT /api/AdminLesson/{lessonId}/mains/{mainId}/subs/{subId}

Alt konuyu günceller.

**Request body:** `LessonSubUpdateDto` (opsiyonel alanlar)

```json
{
  "code": "YAKIN_KARSIT_V2",
  "name": "Yakın anlam, karşıt anlam (güncel)",
  "description": null,
  "orderIndex": 1,
  "isActive": true
}
```

**Response (200):** `{ "message": "..." }`  
**Response (404):** `{ "error": "Alt konu bulunamadı." }`  
**Response (400):** `{ "error": "..." }`

---

### 5.5 DELETE /api/AdminLesson/{lessonId}/mains/{mainId}/subs/{subId}

Alt konuyu siler.

**Response (200):** `{ "message": "..." }`  
**Response (404):** `{ "error": "Alt konu bulunamadı." }`

---

## 6. 4. Seviye: LessonMikro (Mikro konu)

LessonMikro, bir **LessonSub** altındaki en ince başlıklardır (opsiyonel seviye).

### 6.1 GET /api/AdminLesson/{lessonId}/mains/{mainId}/subs/{subId}/mikros

Belirtilen alt konuya ait mikro konuları listeler.

**Parametreler:** `lessonId`, `mainId`, `subId` (Guid, route)

**Response (200):** `LessonMikroDto[]`

```json
[
  {
    "id": "d4e5f6a7-b8c9-0123-def0-234567890123",
    "lessonSubId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "code": "GERCEK_ANLAM",
    "name": "Gerçek anlam",
    "description": null,
    "orderIndex": 1,
    "isActive": true,
    "createdAt": "2026-03-11T00:00:00Z",
    "updatedAt": null
  }
]
```

---

### 6.2 GET /api/AdminLesson/{lessonId}/mains/{mainId}/subs/{subId}/mikros/{mikroId}

Mikro konu detayı. `mikroId` farklı bir `subId`’ye aitse 404 döner.

**Response (200):** Tek `LessonMikroDto`.  
**Response (404):** `{ "error": "Mikro konu bulunamadı." }`

---

### 6.3 POST /api/AdminLesson/{lessonId}/mains/{mainId}/subs/{subId}/mikros

Bu alt konuya yeni mikro konu (LessonMikro) ekler.

**Parametreler:** `lessonId`, `mainId`, `subId` (Guid, route)

**Request body:** `LessonMikroCreateDto`

```json
{
  "code": "MECAZ_ANLAM",
  "name": "Mecaz anlam",
  "description": null,
  "orderIndex": 2,
  "isActive": true
}
```

**Response (200):** `{ "message": "..." }`  
**Response (404):** `{ "error": "Alt konu (LessonSub) bulunamadı." }`  
**Response (400):** `{ "error": "..." }`

---

### 6.4 PUT /api/AdminLesson/{lessonId}/mains/{mainId}/subs/{subId}/mikros/{mikroId}

Mikro konuyu günceller.

**Request body:** `LessonMikroUpdateDto` (opsiyonel alanlar)

```json
{
  "code": "MECAZ_ANLAM_V2",
  "name": "Mecaz anlam (güncel)",
  "description": null,
  "orderIndex": 1,
  "isActive": true
}
```

**Response (200):** `{ "message": "..." }`  
**Response (404):** `{ "error": "Mikro konu bulunamadı." }`  
**Response (400):** `{ "error": "..." }`

---

### 6.5 DELETE /api/AdminLesson/{lessonId}/mains/{mainId}/subs/{subId}/mikros/{mikroId}

Mikro konuyu siler.

**Response (200):** `{ "message": "..." }`  
**Response (404):** `{ "error": "Mikro konu bulunamadı." }`

---

## 7. Ortak hata yanıtları

| HTTP | Durum | Body örneği |
|------|--------|-------------|
| 401 | Yetkisiz (token yok/geçersiz) | — |
| 404 | Kayıt bulunamadı / üst kayıt uyumsuz | `{ "error": "..." }` |
| 400 | Bad request (validasyon / ArgumentException) | `{ "error": "..." }` |
| 500 | Sunucu hatası | `{ "error": "Türkçe hata mesajı." }` |

Başarılı create/update/delete cevaplarında mesaj her zaman `message` alanında döner.

---

## 8. DTO referansı

**Namespace:** `Data.Dtos.Lessons`

| DTO | Kullanım |
|-----|----------|
| LessonDto | Lesson listeleme / detay response |
| LessonCreateDto | Lesson oluşturma request |
| LessonUpdateDto | Lesson güncelleme request |
| LessonMainDto | LessonMain listeleme / detay response |
| LessonMainCreateDto | LessonMain oluşturma request |
| LessonMainUpdateDto | LessonMain güncelleme request |
| LessonSubDto | LessonSub listeleme / detay response |
| LessonSubCreateDto | LessonSub oluşturma request |
| LessonSubUpdateDto | LessonSub güncelleme request |
| LessonMikroDto | LessonMikro listeleme / detay response |
| LessonMikroCreateDto | LessonMikro oluşturma request |
| LessonMikroUpdateDto | LessonMikro güncelleme request |

---

## Hiyerarşi diyagramı (özet)

```
GET  /api/AdminLesson                                    → Tüm Lesson
GET  /api/AdminLesson/{lessonId}                         → Tek Lesson
POST /api/AdminLesson                                    → Lesson oluştur
PUT  /api/AdminLesson/{lessonId}                         → Lesson güncelle
DEL  /api/AdminLesson/{lessonId}                         → Lesson sil

     GET  .../{lessonId}/mains                            → LessonMain listesi
     GET  .../{lessonId}/mains/{mainId}                   → Tek LessonMain
     POST .../{lessonId}/mains                            → LessonMain oluştur
     PUT  .../{lessonId}/mains/{mainId}                   → LessonMain güncelle
     DEL  .../{lessonId}/mains/{mainId}                   → LessonMain sil

          GET  .../mains/{mainId}/subs                    → LessonSub listesi
          GET  .../mains/{mainId}/subs/{subId}            → Tek LessonSub
          POST .../mains/{mainId}/subs                   → LessonSub oluştur
          PUT  .../mains/{mainId}/subs/{subId}            → LessonSub güncelle
          DEL  .../mains/{mainId}/subs/{subId}            → LessonSub sil

               GET  .../subs/{subId}/mikros               → LessonMikro listesi
               GET  .../subs/{subId}/mikros/{mikroId}     → Tek LessonMikro
               POST .../subs/{subId}/mikros               → LessonMikro oluştur
               PUT  .../subs/{subId}/mikros/{mikroId}     → LessonMikro güncelle
               DEL  .../subs/{subId}/mikros/{mikroId}     → LessonMikro sil
```

---

*Rapor, API/Controllers/Lessons/AdminLessonController ve Data.Dtos.Lessons DTO'larına göre hazırlanmıştır.*
