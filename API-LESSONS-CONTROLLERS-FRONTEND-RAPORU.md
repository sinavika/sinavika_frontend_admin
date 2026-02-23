# API Lessons Controllers — Frontend Gidiş/Geliş Raporu

Bu rapor `API/Controllers/Lessons/` altındaki tüm controller'ların endpoint'lerini, örnek istek (gidiş) ve cevap (geliş) formatlarıyla açıklar.

---

## Genel Bilgiler

| Bilgi | Değer |
|--------|--------|
| **Base URL** | `{API_BASE}/api` |
| **Kimlik doğrulama** | Tüm endpoint'ler `[Authorize]` — Header: `Authorization: Bearer {JWT_TOKEN}` |
| **Swagger grubu** | `admin` |
| **Content-Type** | `application/json` |

**Hiyerarşi:**  
`CategorySub` (alt kategori) → **Lesson** → **LessonMain** (konu) → **LessonSub** (alt konu) → **LessonMikro** (mikro konu, zorunlu değil).

---

## 1. AdminLessonController

**Route:** `api/AdminLesson`  
**Açıklama:** Ders listesi (Lesson) — alt kategoriye (CategorySub) göre oluşturulur; altında LessonMain → LessonSub → LessonMikro eklenir.

---

### 1.1 Tüm ders listelerini getir

**Method:** `GET`  
**URL:** `GET /api/AdminLesson/all`

**İstek (Gidiş):**
- Header: `Authorization: Bearer {token}`

**Başarılı cevap (200):**
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "categorySubId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "TYT Ders Listesi",
    "orderIndex": 1,
    "isActive": true,
    "createdAt": "2025-02-22T12:00:00Z",
    "updatedAt": null,
    "categorySubName": "TYT",
    "lessonMains": null
  }
]
```

**Hata (500):**
```json
{
  "error": "Dersleri listelerken bir hata oluştu."
}
```

---

### 1.2 Alt kategoriye göre ders listelerini getir

**Method:** `GET`  
**URL:** `GET /api/AdminLesson/by-category-sub/{categorySubId}`  
**Parametre:** `categorySubId` (Guid, path)

**İstek (Gidiş):**
- Örnek: `GET /api/AdminLesson/by-category-sub/3fa85f64-5717-4562-b3fc-2c963f66afa6`

**Başarılı cevap (200):** 1.1 ile aynı dizi yapısı.

---

### 1.3 Id ile ders listesi detayı

**Method:** `GET`  
**URL:** `GET /api/AdminLesson?id={id}`  
**Parametre:** `id` (Guid, query)

**İstek (Gidiş):**
- Örnek: `GET /api/AdminLesson?id=3fa85f64-5717-4562-b3fc-2c963f66afa6`

**Başarılı cevap (200):**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "categorySubId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "TYT Ders Listesi",
  "orderIndex": 1,
  "isActive": true,
  "createdAt": "2025-02-22T12:00:00Z",
  "updatedAt": null,
  "categorySubName": "TYT",
  "lessonMains": null
}
```

**Hata (404):**
```json
{
  "error": "Ders bulunamadı."
}
```

---

### 1.4 Ders listesi oluştur

**Method:** `POST`  
**URL:** `POST /api/AdminLesson/create`

**İstek (Gidiş):**
```json
{
  "categorySubId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "TYT Ders Listesi",
  "orderIndex": 1,
  "isActive": true
}
```

**Başarılı cevap (200):**
```json
{
  "message": "Ders listesi başarıyla oluşturuldu."
}
```

**Hata (500):**
```json
{
  "error": "Ders ekleme işlemi sırasında bir hata oluştu."
}
```

---

### 1.5 Ders listesini güncelle

**Method:** `PUT`  
**URL:** `PUT /api/AdminLesson/update?id={id}`  
**Parametre:** `id` (Guid, query)

**İstek (Gidiş):**
```json
{
  "name": "TYT Ders Listesi (güncel)",
  "orderIndex": 2,
  "isActive": true
}
```
- Tüm alanlar opsiyonel.

**Başarılı cevap (200):**
```json
{
  "message": "Ders listesi başarıyla güncellendi."
}
```

**Hata (404):**
```json
{
  "error": "Ders bulunamadı."
}
```

---

### 1.6 Ders listesini pasif yap (soft delete)

**Method:** `DELETE`  
**URL:** `DELETE /api/AdminLesson/delete?id={id}`  
**Parametre:** `id` (Guid, query)

**İstek (Gidiş):**
- Örnek: `DELETE /api/AdminLesson/delete?id=3fa85f64-5717-4562-b3fc-2c963f66afa6`

**Başarılı cevap (200):**
```json
{
  "message": "Ders listesi pasif hale getirildi (soft delete)."
}
```

**Hata (404):**
```json
{
  "error": "Ders bulunamadı."
}
```

---

### 1.7 Ders içeriğine (LessonMain) alt konu (LessonSub) ekle

**Method:** `POST`  
**URL:** `POST /api/AdminLesson/lesson-main/{lessonMainId}/lesson-sub`  
**Parametre:** `lessonMainId` (Guid, path)

**İstek (Gidiş):**
```json
{
  "code": "TRG",
  "name": "Trigonometri",
  "description": "Açı ve oranlar",
  "orderIndex": 1,
  "isActive": true
}
```

**Başarılı cevap (200):**
```json
{
  "message": "Alt konu başarıyla oluşturuldu."
}
```

**Hata (404):**
```json
{
  "error": "Ders içeriği bulunamadı."
}
```

---

## 2. AdminLessonMainController

**Route:** `api/AdminLessonMain`  
**Açıklama:** Ders içeriği (LessonMain) — Lesson altında konu; Code, Name taşır. Altında LessonSub eklenir.

---

### 2.1 Ders listesine göre ders içeriklerini listele

**Method:** `GET`  
**URL:** `GET /api/AdminLessonMain/by-lesson/{lessonId}`  
**Parametre:** `lessonId` (Guid, path)

**İstek (Gidiş):**
- Örnek: `GET /api/AdminLessonMain/by-lesson/3fa85f64-5717-4562-b3fc-2c963f66afa6`

**Başarılı cevap (200):**
```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "lessonId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "code": "MAT",
    "name": "Matematik",
    "description": "Temel matematik",
    "orderIndex": 1,
    "isActive": true,
    "createdAt": "2025-02-22T12:00:00Z",
    "updatedAt": null
  }
]
```

**Hata (404):**
```json
{
  "error": "Ders listesi (Lesson) bulunamadı. Id: ..."
}
```

---

### 2.2 Ders içeriği detayı

**Method:** `GET`  
**URL:** `GET /api/AdminLessonMain/{id}`  
**Parametre:** `id` (Guid, path)

**Başarılı cevap (200):** Tek eleman, 2.1'deki obje yapısıyla aynı.

**Hata (404):**
```json
{
  "error": "Ders içeriği bulunamadı."
}
```

---

### 2.3 Ders listesine yeni ders içeriği (LessonMain) ekle

**Method:** `POST`  
**URL:** `POST /api/AdminLessonMain/{lessonId}/create`  
**Parametre:** `lessonId` (Guid, path)

**İstek (Gidiş):**
```json
{
  "code": "MAT",
  "name": "Matematik",
  "description": "Temel matematik konuları",
  "orderIndex": 1,
  "isActive": true
}
```

**Başarılı cevap (200):**
```json
{
  "message": "Ders içeriği (LessonMain) başarıyla oluşturuldu."
}
```

**Hata (404):**
```json
{
  "error": "Ders listesi (Lesson) bulunamadı. Id: ..."
}
```

---

### 2.4 Ders içeriğini güncelle

**Method:** `PUT`  
**URL:** `PUT /api/AdminLessonMain/{id}`  
**Parametre:** `id` (Guid, path)

**İstek (Gidiş):**
```json
{
  "code": "MAT-V2",
  "name": "Matematik (güncel)",
  "description": null,
  "orderIndex": 2,
  "isActive": false
}
```
- Tüm alanlar opsiyonel.

**Başarılı cevap (200):**
```json
{
  "message": "Ders içeriği başarıyla güncellendi."
}
```

---

### 2.5 Ders içeriğini sil

**Method:** `DELETE`  
**URL:** `DELETE /api/AdminLessonMain/{id}`  
**Parametre:** `id` (Guid, path)

**Başarılı cevap (200):**
```json
{
  "message": "Ders içeriği silindi."
}
```

**Hata (404):**
```json
{
  "error": "Ders içeriği (LessonMain) bulunamadı. Id: ..."
}
```

---

## 3. AdminLessonSubController

**Route:** `api/AdminLessonSub`  
**Açıklama:** Ders alt konuları (LessonSub) — LessonMain altında; LessonMikro isteğe bağlı olarak bunun altında eklenir.

---

### 3.1 Ders içeriğine göre alt konuları listele

**Method:** `GET`  
**URL:** `GET /api/AdminLessonSub/by-lesson-main/{lessonMainId}`  
**Parametre:** `lessonMainId` (Guid, path)

**İstek (Gidiş):**
- Örnek: `GET /api/AdminLessonSub/by-lesson-main/a1b2c3d4-e5f6-7890-abcd-ef1234567890`

**Başarılı cevap (200):**
```json
[
  {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "lessonMainId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "code": "TRG",
    "name": "Trigonometri",
    "description": "Açı ve oranlar",
    "orderIndex": 1,
    "isActive": true,
    "createdAt": "2025-02-22T12:00:00Z",
    "updatedAt": null
  }
]
```

**Hata (404):**
```json
{
  "error": "Ders içeriği (LessonMain) bulunamadı. Id: ..."
}
```

---

### 3.2 Alt konu detayı

**Method:** `GET`  
**URL:** `GET /api/AdminLessonSub/{id}`  
**Parametre:** `id` (Guid, path)

**Başarılı cevap (200):** Tek eleman, 3.1 yapısıyla aynı.

**Hata (404):**
```json
{
  "error": "Alt konu bulunamadı."
}
```

---

### 3.3 Ders içeriğine yeni alt konu ekle

**Method:** `POST`  
**URL:** `POST /api/AdminLessonSub/{lessonMainId}/create`  
**Parametre:** `lessonMainId` (Guid, path)

**İstek (Gidiş):**
```json
{
  "code": "TRG",
  "name": "Trigonometri",
  "description": "Açı ve oranlar",
  "orderIndex": 1,
  "isActive": true
}
```
- `code` ve `name` zorunludur.

**Başarılı cevap (200):**
```json
{
  "message": "Alt konu başarıyla oluşturuldu."
}
```

**Hata (400):**
```json
{
  "error": "Alt konu kodu (Code) zorunludur."
}
```
veya
```json
{
  "error": "Alt konu adı (Name) zorunludur."
}
```

**Hata (404):**
```json
{
  "error": "Ders içeriği (LessonMain) bulunamadı. Id: ..."
}
```

---

### 3.4 Alt konuyu güncelle

**Method:** `PUT`  
**URL:** `PUT /api/AdminLessonSub/{id}`  
**Parametre:** `id` (Guid, path)

**İstek (Gidiş):**
```json
{
  "code": "TRG-V2",
  "name": "Trigonometri (güncel)",
  "description": null,
  "orderIndex": 2,
  "isActive": false
}
```
- Tüm alanlar opsiyonel; Code/Name boş string olamaz.

**Başarılı cevap (200):**
```json
{
  "message": "Alt konu başarıyla güncellendi."
}
```

**Hata (400):** Code veya Name boş gönderilirse.

---

### 3.5 Alt konuyu sil

**Method:** `DELETE`  
**URL:** `DELETE /api/AdminLessonSub/{id}`  
**Parametre:** `id` (Guid, path)

**Başarılı cevap (200):**
```json
{
  "message": "Alt konu başarıyla silindi."
}
```

**Hata (404):**
```json
{
  "error": "Alt konu bulunamadı. Id: ..."
}
```

---

## 4. AdminLessonMikroController

**Route:** `api/AdminLessonMikro`  
**Açıklama:** Mikro konular (LessonMikro) — LessonSub altında; zorunlu değildir (0..n).

---

### 4.1 Alt konuya göre mikro konuları listele

**Method:** `GET`  
**URL:** `GET /api/AdminLessonMikro/by-lesson-sub/{lessonSubId}`  
**Parametre:** `lessonSubId` (Guid, path)

**İstek (Gidiş):**
- Örnek: `GET /api/AdminLessonMikro/by-lesson-sub/b2c3d4e5-f6a7-8901-bcde-f12345678901`

**Başarılı cevap (200):**
```json
[
  {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "lessonSubId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "code": "TRG-01",
    "name": "Birim çember",
    "description": null,
    "orderIndex": 1,
    "isActive": true,
    "createdAt": "2025-02-22T12:00:00Z",
    "updatedAt": null
  }
]
```

**Hata (404):**
```json
{
  "error": "Alt konu bulunamadı. Id: ..."
}
```

---

### 4.2 Mikro konu detayı

**Method:** `GET`  
**URL:** `GET /api/AdminLessonMikro/{id}`  
**Parametre:** `id` (Guid, path)

**Başarılı cevap (200):** Tek eleman, 4.1 yapısıyla aynı.

**Hata (404):**
```json
{
  "error": "Mikro konu bulunamadı."
}
```

---

### 4.3 Alt konuya yeni mikro konu ekle

**Method:** `POST`  
**URL:** `POST /api/AdminLessonMikro/{lessonSubId}/create`  
**Parametre:** `lessonSubId` (Guid, path)

**İstek (Gidiş):**
```json
{
  "code": "TRG-01",
  "name": "Birim çember",
  "description": null,
  "orderIndex": 1,
  "isActive": true
}
```
- `code` ve `name` zorunludur.

**Başarılı cevap (200):**
```json
{
  "message": "Mikro konu başarıyla oluşturuldu."
}
```

**Hata (400):**
```json
{
  "error": "Mikro konu kodu (Code) zorunludur."
}
```
veya
```json
{
  "error": "Mikro konu adı (Name) zorunludur."
}
```

**Hata (404):**
```json
{
  "error": "Alt konu bulunamadı. Id: ..."
}
```

---

### 4.4 Mikro konuyu güncelle

**Method:** `PUT`  
**URL:** `PUT /api/AdminLessonMikro/{id}`  
**Parametre:** `id` (Guid, path)

**İstek (Gidiş):**
```json
{
  "code": "TRG-01-V2",
  "name": "Birim çember (güncel)",
  "description": null,
  "orderIndex": 2,
  "isActive": false
}
```
- Tüm alanlar opsiyonel.

**Başarılı cevap (200):**
```json
{
  "message": "Mikro konu başarıyla güncellendi."
}
```

---

### 4.5 Mikro konuyu sil

**Method:** `DELETE`  
**URL:** `DELETE /api/AdminLessonMikro/{id}`  
**Parametre:** `id` (Guid, path)

**Başarılı cevap (200):**
```json
{
  "message": "Mikro konu başarıyla silindi."
}
```

**Hata (404):**
```json
{
  "error": "Mikro konu bulunamadı. Id: ..."
}
```

---

## Özet Tablo

| Controller           | GET | POST | PUT | DELETE |
|---------------------|-----|------|-----|--------|
| AdminLesson         | 3   | 2    | 1   | 1      |
| AdminLessonMain     | 2   | 1    | 1   | 1      |
| AdminLessonSub      | 2   | 1    | 1   | 1      |
| AdminLessonMikro    | 2   | 1    | 1   | 1      |

---

## Akış Özeti (Frontend)

1. **Lesson:** Alt kategori seçilir → `POST /api/AdminLesson/create` (body: `categorySubId`, `name`, `orderIndex`, `isActive`). Liste: `GET /api/AdminLesson/all` veya `GET /api/AdminLesson/by-category-sub/{categorySubId}`.
2. **LessonMain:** Bir Lesson seçilir → `POST /api/AdminLessonMain/{lessonId}/create` (body: `code`, `name`, `description`, `orderIndex`, `isActive`). Liste: `GET /api/AdminLessonMain/by-lesson/{lessonId}`.
3. **LessonSub:** Bir LessonMain seçilir → `POST /api/AdminLessonSub/{lessonMainId}/create` (body: `code`, `name`, `description`, `orderIndex`, `isActive`). Liste: `GET /api/AdminLessonSub/by-lesson-main/{lessonMainId}`. Alternatif: `POST /api/AdminLesson/lesson-main/{lessonMainId}/lesson-sub` (aynı body).
4. **LessonMikro (opsiyonel):** Bir LessonSub seçilir → `POST /api/AdminLessonMikro/{lessonSubId}/create` (body: `code`, `name`, `description`, `orderIndex`, `isActive`). Liste: `GET /api/AdminLessonMikro/by-lesson-sub/{lessonSubId}`. Mikro konu eklenmeyebilir.

**Not:** AdminLesson'da `GetLessonById` ve `UpdateLesson` / `DeleteLesson` için `id` query string ile gönderilir: `?id={guid}`.
