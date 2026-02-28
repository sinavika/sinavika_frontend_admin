# API/Controllers/Lessons — Endpoint ve Örnek İstek/Cevap Raporu

**Tarih:** 2025-02-25  
**Kapsam:** `API/Controllers/Lessons/` altındaki tüm controller'lar, endpoint'ler ve örnek gidiş-dönüş (request/response) formatları.

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

## Hiyerarşi

```
CategorySub → Lesson → LessonMain → LessonSub → LessonMikro
```

- **Lesson:** Alt kategoriye (CategorySub) bağlı ders listesi konteyneri.
- **LessonMain:** Ders içeriği (Code, Name); Lesson altında.
- **LessonSub:** Alt konu; LessonMain altında.
- **LessonMikro:** Mikro konu; LessonSub altında.

---

# 1. AdminLessonController

**Base URL:** `GET/POST/PUT/DELETE /api/AdminLesson`

---

## 1.1 Tüm ders listelerini getir

**Endpoint:** `GET /api/AdminLesson/all`

**Açıklama:** Tüm Lesson kayıtlarını döner.

**İstek (Request):**
```http
GET /api/AdminLesson/all HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Başarılı cevap (200 OK):**
```json
[
  {
    "id": "00000000-0000-0000-0000-000000001001",
    "categorySubId": "00000000-0000-0000-0000-000000000101",
    "name": "Türkçe",
    "orderIndex": 1,
    "isActive": true,
    "createdAt": "2025-02-01T10:00:00Z",
    "updatedAt": null,
    "categorySubName": "Temel Yeterlilik Testi",
    "lessonMains": null
  }
]
```

**Hata (500):**
```json
{ "Error": "Dersleri listelerken bir hata oluştu." }
```

---

## 1.2 Alt kategoriye göre ders listesi

**Endpoint:** `GET /api/AdminLesson/by-category-sub/{categorySubId}`

**Açıklama:** Belirtilen CategorySub (örn. TYT, AYT) için Lesson listesi.

**İstek:**
```http
GET /api/AdminLesson/by-category-sub/00000000-0000-0000-0000-000000000101 HTTP/1.1
Authorization: Bearer ...
```

**Cevap (200):** Yukarıdakiyle aynı dizi yapısı.

---

## 1.3 Lesson oluştur

**Endpoint:** `POST /api/AdminLesson/create`

**Body (LessonCreateDto):**
```json
{
  "categorySubId": "00000000-0000-0000-0000-000000000101",
  "name": "Türkçe",
  "orderIndex": 1,
  "isActive": true
}
```

**Cevap (200):**
```json
{ "Message": "Ders listesi başarıyla oluşturuldu." }
```

**Hata (500):**
```json
{ "Error": "Ders ekleme işlemi sırasında bir hata oluştu." }
```

---

## 1.4 Lesson Id ile getir

**Endpoint:** `GET /api/AdminLesson/{id}`

**İstek:**
```http
GET /api/AdminLesson/00000000-0000-0000-0000-000000001001 HTTP/1.1
Authorization: Bearer ...
```

**Cevap (200):**
```json
{
  "id": "00000000-0000-0000-0000-000000001001",
  "categorySubId": "00000000-0000-0000-0000-000000000101",
  "name": "Türkçe",
  "orderIndex": 1,
  "isActive": true,
  "createdAt": "2025-02-01T10:00:00Z",
  "updatedAt": null,
  "categorySubName": "Temel Yeterlilik Testi",
  "lessonMains": null
}
```

**Cevap (404):**
```json
{ "Error": "Ders bulunamadı." }
```

---

## 1.5 Lesson güncelle

**Endpoint:** `PUT /api/AdminLesson/{id}`

**Body (LessonUpdateDto — tüm alanlar opsiyonel):**
```json
{
  "name": "Türkçe (güncel)",
  "orderIndex": 2,
  "isActive": true
}
```

**Cevap (200):**
```json
{ "Message": "Ders listesi başarıyla güncellendi." }
```

**Cevap (404):** `{ "Error": "Ders bulunamadı." }`

---

## 1.6 Lesson pasif yap (soft delete)

**Endpoint:** `DELETE /api/AdminLesson/{id}`

**İstek:** Body yok.

**Cevap (200):**
```json
{ "Message": "Ders listesi pasif hale getirildi (soft delete)." }
```

**Cevap (404):** `{ "Error": "Ders bulunamadı." }`

---

## 1.7 Lesson'a ait LessonMain listesi

**Endpoint:** `GET /api/AdminLesson/lesson/{lessonId}/lesson-mains`

**İstek:**
```http
GET /api/AdminLesson/lesson/00000000-0000-0000-0000-000000001001/lesson-mains HTTP/1.1
Authorization: Bearer ...
```

**Cevap (200):**
```json
[
  {
    "id": "00000000-0000-0000-0000-000000002001",
    "lessonId": "00000000-0000-0000-0000-000000001001",
    "code": "TR",
    "name": "Türkçe",
    "description": null,
    "orderIndex": 1,
    "isActive": true,
    "createdAt": "2025-02-01T10:00:00Z",
    "updatedAt": null
  }
]
```

---

## 1.8 LessonMain Id ile getir

**Endpoint:** `GET /api/AdminLesson/lesson-main/{id}`

**Cevap (200):** Tek `LessonMainDto` nesnesi (yukarıdaki dizideki eleman gibi).

**Cevap (404):** `{ "Error": "Ders içeriği bulunamadı." }`

---

## 1.9 Lesson'a LessonMain ekle

**Endpoint:** `POST /api/AdminLesson/lesson/{lessonId}/lesson-main`

**Body (LessonMainCreateDto):**
```json
{
  "code": "TR",
  "name": "Türkçe",
  "description": "Türkçe ders içeriği",
  "orderIndex": 1,
  "isActive": true
}
```

**Cevap (200):**
```json
{ "Message": "Ders içeriği (LessonMain) başarıyla oluşturuldu." }
```

**Cevap (404):** `{ "Error": "Ders listesi (Lesson) bulunamadı." }`

---

## 1.10 LessonMain güncelle

**Endpoint:** `PUT /api/AdminLesson/lesson-main/{id}`

**Body (LessonMainUpdateDto):**
```json
{
  "code": "TR2",
  "name": "Türkçe Güncel",
  "description": "Açıklama",
  "orderIndex": 2,
  "isActive": false
}
```

**Cevap (200):** `{ "Message": "..." }`  
**Cevap (404):** `{ "Error": "Ders içeriği bulunamadı." }`

---

## 1.11 LessonMain'e ait LessonSub listesi

**Endpoint:** `GET /api/AdminLesson/lesson-main/{lessonMainId}/lesson-subs`

**İstek:**
```http
GET /api/AdminLesson/lesson-main/00000000-0000-0000-0000-000000002001/lesson-subs HTTP/1.1
Authorization: Bearer ...
```

**Cevap (200):**
```json
[
  {
    "id": "00000000-0000-0000-0000-000000003001",
    "lessonMainId": "00000000-0000-0000-0000-000000002001",
    "code": "TR_OKUMA",
    "name": "Okuma",
    "description": null,
    "orderIndex": 1,
    "isActive": true,
    "createdAt": "2025-02-01T10:00:00Z",
    "updatedAt": null
  }
]
```

---

## 1.12 LessonMain'e LessonSub ekle

**Endpoint:** `POST /api/AdminLesson/lesson-main/{lessonMainId}/lesson-sub`

**Body (LessonSubCreateDto):**
```json
{
  "code": "TR_OKUMA",
  "name": "Okuma",
  "description": null,
  "orderIndex": 1,
  "isActive": true
}
```

**Cevap (200):**
```json
{ "Message": "Alt konu başarıyla oluşturuldu." }
```

**Cevap (404):** `{ "Error": "Ders içeriği bulunamadı." }`

---

## 1.13 LessonSub güncelle

**Endpoint:** `PUT /api/AdminLesson/lesson-sub/{id}`

**Body (LessonSubUpdateDto):**
```json
{
  "code": "TR_OKUMA_V2",
  "name": "Okuma ve Anlama",
  "description": "Açıklama",
  "orderIndex": 2,
  "isActive": true
}
```

**Cevap (200):** `{ "Message": "..." }`  
**Cevap (404):** `{ "Error": "Alt konu bulunamadı." }`

---

# 2. AdminLessonMainController

**Base URL:** `GET/POST/PUT/DELETE /api/AdminLessonMain`

LessonMain CRUD; Lesson listesine bağlı ders içerikleri.

---

## 2.1 Lesson'a göre LessonMain listesi

**Endpoint:** `GET /api/AdminLessonMain/by-lesson/{lessonId}`

**İstek:**
```http
GET /api/AdminLessonMain/by-lesson/00000000-0000-0000-0000-000000001001 HTTP/1.1
Authorization: Bearer ...
```

**Cevap (200):** `LessonMainDto[]` (AdminLesson 1.7 ile aynı yapı).

**Cevap (404):** `{ "Error": "..." }` (KeyNotFoundException mesajı).

---

## 2.2 LessonMain Id ile getir

**Endpoint:** `GET /api/AdminLessonMain/{id}`

**Cevap (200):** Tek `LessonMainDto`.  
**Cevap (404):** `{ "Error": "Ders içeriği bulunamadı." }`

---

## 2.3 LessonMain oluştur

**Endpoint:** `POST /api/AdminLessonMain/{lessonId}/create`

**Body:** `LessonMainCreateDto` (AdminLesson 1.9 ile aynı).

**Cevap (200):**
```json
{ "Message": "Ders içeriği (LessonMain) başarıyla oluşturuldu." }
```

**Cevap (404):** `{ "Error": "..." }`

---

## 2.4 LessonMain güncelle

**Endpoint:** `PUT /api/AdminLessonMain/{id}`

**Body:** `LessonMainUpdateDto` (AdminLesson 1.10 ile aynı).

**Cevap (200):** `{ "Message": "..." }`  
**Cevap (404):** `{ "Error": "Ders içeriği bulunamadı." }`

---

## 2.5 LessonMain sil (hard delete)

**Endpoint:** `DELETE /api/AdminLessonMain/{id}`

**İstek:** Body yok.

**Cevap (200):**
```json
{ "Message": "Ders içeriği başarıyla silindi." }
```

**Cevap (404):** `{ "Error": "..." }`

---

# 3. AdminLessonSubController

**Base URL:** `GET/POST/PUT/DELETE /api/AdminLessonSub`

LessonSub CRUD; LessonMain'e bağlı alt konular.

---

## 3.1 LessonMain'e göre LessonSub listesi

**Endpoint:** `GET /api/AdminLessonSub/by-lesson-main/{lessonMainId}`

**İstek:**
```http
GET /api/AdminLessonSub/by-lesson-main/00000000-0000-0000-0000-000000002001 HTTP/1.1
Authorization: Bearer ...
```

**Cevap (200):** `LessonSubDto[]` (AdminLesson 1.11 ile aynı yapı).

**Cevap (404):** `{ "Error": "..." }`

---

## 3.2 LessonSub Id ile getir

**Endpoint:** `GET /api/AdminLessonSub/{id}`

**Cevap (200):** Tek `LessonSubDto`.  
**Cevap (404):** `{ "Error": "Alt konu bulunamadı." }`

---

## 3.3 LessonSub oluştur

**Endpoint:** `POST /api/AdminLessonSub/{lessonMainId}/create`

**Body (LessonSubCreateDto):**
```json
{
  "code": "TR_YAZMA",
  "name": "Yazma ve Dil Bilgisi",
  "description": null,
  "orderIndex": 2,
  "isActive": true
}
```

**Cevap (200):**
```json
{ "Message": "Alt konu başarıyla oluşturuldu." }
```

**Cevap (404):** `{ "Error": "..." }`  
**Cevap (400):** `{ "Error": "..." }` (ArgumentException).

---

## 3.4 LessonSub güncelle

**Endpoint:** `PUT /api/AdminLessonSub/{id}`

**Body (LessonSubUpdateDto):** Tüm alanlar opsiyonel (code, name, description, orderIndex, isActive).

**Cevap (200):** `{ "Message": "..." }`  
**Cevap (404):** `{ "Error": "Alt konu bulunamadı." }`

---

## 3.5 LessonSub sil (hard delete)

**Endpoint:** `DELETE /api/AdminLessonSub/{id}`

**Cevap (200):** `{ "Message": "Alt konu başarıyla silindi." }`  
**Cevap (404):** `{ "Error": "..." }`

---

# 4. AdminLessonMikroController

**Base URL:** `GET/POST/PUT/DELETE /api/AdminLessonMikro`

LessonMikro CRUD; LessonSub'a bağlı mikro konular.

---

## 4.1 LessonSub'a göre LessonMikro listesi

**Endpoint:** `GET /api/AdminLessonMikro/by-lesson-sub/{lessonSubId}`

**İstek:**
```http
GET /api/AdminLessonMikro/by-lesson-sub/00000000-0000-0000-0000-000000003001 HTTP/1.1
Authorization: Bearer ...
```

**Cevap (200):**
```json
[
  {
    "id": "00000000-0000-0000-0000-000000100001",
    "lessonSubId": "00000000-0000-0000-0000-000000003001",
    "code": "TR_OKUMA_ANLAMA",
    "name": "Okuma ve anlama",
    "description": null,
    "orderIndex": 1,
    "isActive": true,
    "createdAt": "2025-02-01T10:00:00Z",
    "updatedAt": null
  }
]
```

**Cevap (404):** `{ "Error": "..." }`

---

## 4.2 LessonMikro Id ile getir

**Endpoint:** `GET /api/AdminLessonMikro/{id}`

**Cevap (200):** Tek `LessonMikroDto`.  
**Cevap (404):** `{ "Error": "Mikro konu bulunamadı." }`

---

## 4.3 LessonMikro oluştur

**Endpoint:** `POST /api/AdminLessonMikro/{lessonSubId}/create`

**Body (LessonMikroCreateDto):**
```json
{
  "code": "TR_OKUMA_ANLAMA",
  "name": "Okuma ve anlama",
  "description": null,
  "orderIndex": 1,
  "isActive": true
}
```

**Cevap (200):**
```json
{ "Message": "Mikro konu başarıyla oluşturuldu." }
```

**Cevap (404):** `{ "Error": "..." }`  
**Cevap (400):** `{ "Error": "..." }`

---

## 4.4 LessonMikro güncelle

**Endpoint:** `PUT /api/AdminLessonMikro/{id}`

**Body (LessonMikroUpdateDto):** code, name, description, orderIndex, isActive (hepsi opsiyonel).

**Cevap (200):** `{ "Message": "..." }`  
**Cevap (404):** `{ "Error": "Mikro konu bulunamadı." }`

---

## 4.5 LessonMikro sil (hard delete)

**Endpoint:** `DELETE /api/AdminLessonMikro/{id}`

**Cevap (200):** `{ "Message": "Mikro konu başarıyla silindi." }`  
**Cevap (404):** `{ "Error": "..." }`

---

# Özet Tablo

| Controller | Method | Endpoint | Açıklama |
|------------|--------|----------|----------|
| AdminLesson | GET | /api/AdminLesson/all | Tüm Lesson listesi |
| AdminLesson | GET | /api/AdminLesson/by-category-sub/{categorySubId} | CategorySub'a göre Lesson listesi |
| AdminLesson | POST | /api/AdminLesson/create | Lesson oluştur |
| AdminLesson | GET | /api/AdminLesson/{id} | Lesson detay |
| AdminLesson | PUT | /api/AdminLesson/{id} | Lesson güncelle |
| AdminLesson | DELETE | /api/AdminLesson/{id} | Lesson pasif yap (soft) |
| AdminLesson | GET | /api/AdminLesson/lesson/{lessonId}/lesson-mains | LessonMain listesi |
| AdminLesson | GET | /api/AdminLesson/lesson-main/{id} | LessonMain detay |
| AdminLesson | POST | /api/AdminLesson/lesson/{lessonId}/lesson-main | LessonMain oluştur |
| AdminLesson | PUT | /api/AdminLesson/lesson-main/{id} | LessonMain güncelle |
| AdminLesson | GET | /api/AdminLesson/lesson-main/{lessonMainId}/lesson-subs | LessonSub listesi |
| AdminLesson | POST | /api/AdminLesson/lesson-main/{lessonMainId}/lesson-sub | LessonSub oluştur |
| AdminLesson | PUT | /api/AdminLesson/lesson-sub/{id} | LessonSub güncelle |
| AdminLessonMain | GET | /api/AdminLessonMain/by-lesson/{lessonId} | LessonMain listesi |
| AdminLessonMain | GET | /api/AdminLessonMain/{id} | LessonMain detay |
| AdminLessonMain | POST | /api/AdminLessonMain/{lessonId}/create | LessonMain oluştur |
| AdminLessonMain | PUT | /api/AdminLessonMain/{id} | LessonMain güncelle |
| AdminLessonMain | DELETE | /api/AdminLessonMain/{id} | LessonMain sil |
| AdminLessonSub | GET | /api/AdminLessonSub/by-lesson-main/{lessonMainId} | LessonSub listesi |
| AdminLessonSub | GET | /api/AdminLessonSub/{id} | LessonSub detay |
| AdminLessonSub | POST | /api/AdminLessonSub/{lessonMainId}/create | LessonSub oluştur |
| AdminLessonSub | PUT | /api/AdminLessonSub/{id} | LessonSub güncelle |
| AdminLessonSub | DELETE | /api/AdminLessonSub/{id} | LessonSub sil |
| AdminLessonMikro | GET | /api/AdminLessonMikro/by-lesson-sub/{lessonSubId} | LessonMikro listesi |
| AdminLessonMikro | GET | /api/AdminLessonMikro/{id} | LessonMikro detay |
| AdminLessonMikro | POST | /api/AdminLessonMikro/{lessonSubId}/create | LessonMikro oluştur |
| AdminLessonMikro | PUT | /api/AdminLessonMikro/{id} | LessonMikro güncelle |
| AdminLessonMikro | DELETE | /api/AdminLessonMikro/{id} | LessonMikro sil |

---

**Not:** Tüm örnek GUID'ler placeholder'dır. 500 hatalarında response body'de `Error` mesajı döner; 404'te genelde `{ "Error": "..." }` kullanılır.
