# Ders (Lessons) API Sistemi – Detaylı Rapor

Bu rapor, `API/Controllers/Lessons/` altındaki tüm controller'ları, entity ilişkilerini, endpoint'leri ve DTO'ları tek bir dokümanda toplar.

---

## 1. Sistem Özeti

Lessons API, **üç seviyeli ders hiyerarşisini** yönetir:

```
Lesson (Ana ders)
  └── LessonSub (Alt konu)
        └── LessonMikro (Mikro konu)
```

| Seviye | Entity       | Açıklama                          | Örnek                    |
|--------|--------------|-----------------------------------|---------------------------|
| 1      | **Lesson**   | Ana ders (Matematik, Fizik, vb.)  | Matematik, Türkçe        |
| 2      | **LessonSub**| Alt konu (dersin üniteleri)       | Trigonometri, Limit       |
| 3      | **LessonMikro** | Mikro konu (alt konunun alt başlıkları) | Sinüs teoremi, Türev |

**Controller'lar:**

| Controller                 | Route base                    | Sorumlu olduğu entity |
|---------------------------|-------------------------------|------------------------|
| AdminLessonController     | `api/AdminLesson`             | Lesson                 |
| AdminLessonSubController  | `api/AdminLessonSub`          | LessonSub              |
| AdminLessonMikroController| `api/AdminLessonMikro`        | LessonMikro            |

**Ortak kurallar:**

- Tüm endpoint'ler **JWT ile yetkilendirme** gerektirir: `Authorization: Bearer {admin_jwt}`.
- Swagger grubu: **admin** (Admin API dokümanında listelenir).
- Base URL: `{API_BASE}/api`.

---

## 2. Entity İlişkileri

### 2.1 Şema (metin)

```
┌─────────────────┐
│     Lesson      │
│  Id, Code, Name │
│  OrderIndex     │
│  IsActive, ...  │
└────────┬────────┘
         │ 1
         │
         │ N
┌────────▼────────┐      ┌──────────────────┐
│   LessonSub    │  1 N │   LessonMikro     │
│ Id, LessonId   │──────▶ Id, LessonSubId  │
│ Code, Name     │      │ Code, Name       │
│ OrderIndex     │      │ OrderIndex       │
└────────┬────────┘      └──────────────────┘
         │
         │ (diğer modüllerde kullanım)
         ├── Question.LessonSubId (soru hangi alt konuya ait)
         ├── QuestionsTemplateItem.LessonSubId (şablon konu kuralı)
         └── CategorySection.LessonSubId (bölüm konu kotası)
```

### 2.2 İlişki özeti

| Kaynak       | Hedef        | İlişki | Açıklama |
|-------------|--------------|--------|----------|
| Lesson      | LessonSub    | 1 – N  | Bir dersin birden fazla alt konusu olabilir. |
| LessonSub   | LessonMikro  | 1 – N  | Bir alt konunun birden fazla mikro konusu olabilir. |
| LessonSub   | Question     | 1 – N  | Sorular bir alt konuya (opsiyonel) bağlanabilir. |
| Lesson      | AdminUser    | N – 1  | CreatedByAdmin, LastUpdatedByAdmin. |
| LessonSub   | AdminUser    | N – 1  | Aynı şekilde. |
| LessonMikro | AdminUser    | N – 1  | Aynı şekilde. |

### 2.3 Tablolar

| Tablo        | Açıklama |
|-------------|----------|
| Lessons     | Ana dersler. |
| LessonSubs  | Alt konular; FK: LessonId. |
| LessonMikros| Mikro konular; FK: LessonSubId. |

---

## 3. DTO Referansı

Tüm DTO'lar `Data.Dtos.Lessons` namespace'inde, `LessonDto.cs` içinde tanımlıdır.

### 3.1 Lesson

| DTO               | Kullanım   | Alanlar |
|-------------------|------------|---------|
| **LessonDto**     | Listeleme, detay | Id, Code, Name, Description, OrderIndex, IsActive, CreatedAt, UpdatedAt, CreatedByAdminId, LastUpdatedByAdminId |
| **LessonCreateDto** | Ekleme   | Code, Name, Description, OrderIndex, IsActive |
| **LessonUpdateDto** | Güncelleme | Code?, Name?, Description?, OrderIndex?, IsActive? (hepsi opsiyonel) |

### 3.2 LessonSub

| DTO                 | Kullanım   | Alanlar |
|---------------------|------------|---------|
| **LessonSubDto**    | Listeleme, detay | Id, LessonId, Code, Name, Description, OrderIndex, IsActive, CreatedAt, UpdatedAt |
| **LessonSubCreateDto** | Ekleme | Code, Name, Description, OrderIndex, IsActive |
| **LessonSubUpdateDto** | Güncelleme | Code?, Name?, Description?, OrderIndex?, IsActive? |

### 3.3 LessonMikro

| DTO                    | Kullanım   | Alanlar |
|------------------------|------------|---------|
| **LessonMikroDto**     | Listeleme, detay | Id, LessonSubId, Code, Name, Description, OrderIndex, IsActive, CreatedAt, UpdatedAt |
| **LessonMikroCreateDto** | Ekleme  | Code, Name, Description, OrderIndex, IsActive |
| **LessonMikroUpdateDto** | Güncelleme | Code?, Name?, Description?, OrderIndex?, IsActive? |

---

## 4. AdminLessonController

**Route:** `api/AdminLesson`  
**Amaç:** Ana ders (Lesson) CRUD ve ilgili derse alt konu ekleme.

### 4.1 Tüm dersleri listele

| Özellik | Değer |
|--------|--------|
| **HTTP** | `GET` |
| **URL** | `/api/AdminLesson/all` |
| **Parametre** | Yok |

**Örnek istek:**
```http
GET /api/AdminLesson/all
Authorization: Bearer {token}
```

**Başarılı cevap (200):** `LessonDto[]`

```json
[
  {
    "id": "guid",
    "code": "MAT",
    "name": "Matematik",
    "description": null,
    "orderIndex": 1,
    "isActive": true,
    "createdAt": "2026-02-17T10:00:00Z",
    "updatedAt": null,
    "createdByAdminId": "guid",
    "lastUpdatedByAdminId": null
  }
]
```

**Hata:** `500` — body: `{ "error": "Dersleri listelerken bir hata oluştu." }`

---

### 4.2 Ders detayı getir

| Özellik | Değer |
|--------|--------|
| **HTTP** | `GET` |
| **URL** | `/api/AdminLesson?id={id}` |
| **Query** | `id` (Guid) |

**Örnek istek:**
```http
GET /api/AdminLesson?id=11111111-1111-1111-1111-111111111111
Authorization: Bearer {token}
```

**Başarılı cevap (200):** Tek `LessonDto` objesi.

**Hata:** `404` — `{ "error": "Ders bulunamadı." }`

---

### 4.3 Ders oluştur

| Özellik | Değer |
|--------|--------|
| **HTTP** | `POST` |
| **URL** | `/api/AdminLesson/create` |
| **Body** | `LessonCreateDto` (JSON) |

**Request body örneği:**
```json
{
  "code": "FIZ",
  "name": "Fizik",
  "description": "Mekanik, elektrik, manyetizma",
  "orderIndex": 5,
  "isActive": true
}
```

**Başarılı cevap (200):**
```json
{
  "message": "Ders başarıyla oluşturuldu."
}
```

**Hata:** `500` — `{ "error": "Ders ekleme işlemi sırasında bir hata oluştu." }`

---

### 4.4 Ders güncelle

| Özellik | Değer |
|--------|--------|
| **HTTP** | `PUT` |
| **URL** | `/api/AdminLesson/update?id={id}` |
| **Query** | `id` (Guid) |
| **Body** | `LessonUpdateDto` (JSON, tüm alanlar opsiyonel) |

**Request body örneği:**
```json
{
  "name": "Fizik (Güncel)",
  "orderIndex": 6,
  "isActive": true
}
```

**Başarılı cevap (200):** `{ "message": "..." }`  
**Hata:** `404` — Ders bulunamadı.

---

### 4.5 Ders sil (pasif yap)

| Özellik | Değer |
|--------|--------|
| **HTTP** | `DELETE` |
| **URL** | `/api/AdminLesson/delete?id={id}` |

**Not:** Servis tarafında ders “pasif” yapılıyor (soft delete / IsActive false olabilir); dokümana göre “Ders pasif yapılıyor” log’u kullanılıyor.

**Başarılı cevap (200):** `{ "message": "..." }`  
**Hata:** `404` — Ders bulunamadı.

---

### 4.6 Derse alt konu ekle (LessonSub)

| Özellik | Değer |
|--------|--------|
| **HTTP** | `POST` |
| **URL** | `/api/AdminLesson/{lessonId}/lesson-sub` |
| **Route** | `lessonId` (Guid) |
| **Body** | `LessonSubCreateDto` (JSON) |

**Request body örneği:**
```json
{
  "code": "TRIG",
  "name": "Trigonometri",
  "description": null,
  "orderIndex": 1,
  "isActive": true
}
```

**Başarılı cevap (200):** `{ "message": "Alt konu başarıyla oluşturuldu." }` (veya servisin döndüğü metin)

**Hata:** `404` — Ders bulunamadı.

---

## 5. AdminLessonSubController

**Route:** `api/AdminLessonSub`  
**Amaç:** Alt konu (LessonSub) CRUD; ana derse (Lesson) bağlı listeleme ve yönetim.

### 5.1 Ana derse göre alt konuları listele

| Özellik | Değer |
|--------|--------|
| **HTTP** | `GET` |
| **URL** | `/api/AdminLessonSub/by-lesson/{lessonId}` |
| **Route** | `lessonId` (Guid) |

**Örnek istek:**
```http
GET /api/AdminLessonSub/by-lesson/11111111-1111-1111-1111-111111111111
Authorization: Bearer {token}
```

**Başarılı cevap (200):** `LessonSubDto[]`

```json
[
  {
    "id": "guid",
    "lessonId": "11111111-1111-1111-1111-111111111111",
    "code": "TRIG",
    "name": "Trigonometri",
    "description": null,
    "orderIndex": 1,
    "isActive": true,
    "createdAt": "2026-02-17T10:00:00Z",
    "updatedAt": null
  }
]
```

**Hata:** `404` — Ders bulunamadı (KeyNotFoundException mesajı). `500` — Sunucu hatası.

---

### 5.2 Alt konu detayı

| Özellik | Değer |
|--------|--------|
| **HTTP** | `GET` |
| **URL** | `/api/AdminLessonSub/{id}` |
| **Route** | `id` (Guid) |

**Başarılı cevap (200):** Tek `LessonSubDto`.  
**Hata:** `404` — Alt konu bulunamadı.

---

### 5.3 Alt konu oluştur

| Özellik | Değer |
|--------|--------|
| **HTTP** | `POST` |
| **URL** | `/api/AdminLessonSub/{lessonId}/create` |
| **Route** | `lessonId` (Guid) |
| **Body** | `LessonSubCreateDto` (JSON) |

**Request body örneği:**
```json
{
  "code": "LIMIT",
  "name": "Limit",
  "description": null,
  "orderIndex": 2,
  "isActive": true
}
```

**Başarılı cevap (200):** `{ "message": "Alt konu başarıyla oluşturuldu." }`

**Hatalar:**  
- `404` — Ders bulunamadı.  
- `400` — Code veya Name boş/geçersiz (ArgumentException).

---

### 5.4 Alt konu güncelle

| Özellik | Değer |
|--------|--------|
| **HTTP** | `PUT` |
| **URL** | `/api/AdminLessonSub/{id}` |
| **Route** | `id` (Guid) |
| **Body** | `LessonSubUpdateDto` (JSON) |

**Request body örneği:**
```json
{
  "name": "Limit ve Süreklilik",
  "orderIndex": 3
}
```

**Başarılı cevap (200):** `{ "message": "Alt konu başarıyla güncellendi." }`  
**Hata:** `404` / `400` (geçersiz Code/Name vb.).

---

### 5.5 Alt konu sil

| Özellik | Değer |
|--------|--------|
| **HTTP** | `DELETE` |
| **URL** | `/api/AdminLessonSub/{id}` |
| **Route** | `id` (Guid) |

**Başarılı cevap (200):** `{ "message": "Alt konu başarıyla silindi." }`  
**Hata:** `404` — Alt konu bulunamadı.

---

## 6. AdminLessonMikroController

**Route:** `api/AdminLessonMikro`  
**Amaç:** Mikro konu (LessonMikro) CRUD; alt konuya (LessonSub) bağlı listeleme ve yönetim.

### 6.1 Alt konuya göre mikro konuları listele

| Özellik | Değer |
|--------|--------|
| **HTTP** | `GET` |
| **URL** | `/api/AdminLessonMikro/by-lesson-sub/{lessonSubId}` |
| **Route** | `lessonSubId` (Guid) |

**Örnek istek:**
```http
GET /api/AdminLessonMikro/by-lesson-sub/22222222-2222-2222-2222-222222222222
Authorization: Bearer {token}
```

**Başarılı cevap (200):** `LessonMikroDto[]`

```json
[
  {
    "id": "guid",
    "lessonSubId": "22222222-2222-2222-2222-222222222222",
    "code": "SIN-TEOR",
    "name": "Sinüs teoremi",
    "description": null,
    "orderIndex": 1,
    "isActive": true,
    "createdAt": "2026-02-17T10:00:00Z",
    "updatedAt": null
  }
]
```

**Hata:** `404` — Alt konu bulunamadı.

---

### 6.2 Mikro konu detayı

| Özellik | Değer |
|--------|--------|
| **HTTP** | `GET` |
| **URL** | `/api/AdminLessonMikro/{id}` |
| **Route** | `id` (Guid) |

**Başarılı cevap (200):** Tek `LessonMikroDto`.  
**Hata:** `404` — Mikro konu bulunamadı.

---

### 6.3 Mikro konu oluştur

| Özellik | Değer |
|--------|--------|
| **HTTP** | `POST` |
| **URL** | `/api/AdminLessonMikro/{lessonSubId}/create` |
| **Route** | `lessonSubId` (Guid) |
| **Body** | `LessonMikroCreateDto` (JSON) |

**Request body örneği:**
```json
{
  "code": "TUREV",
  "name": "Türev tanımı",
  "description": null,
  "orderIndex": 1,
  "isActive": true
}
```

**Başarılı cevap (200):** `{ "message": "Mikro konu başarıyla oluşturuldu." }`

**Hatalar:** `404` — Alt konu yok. `400` — Code/Name boş veya geçersiz.

---

### 6.4 Mikro konu güncelle

| Özellik | Değer |
|--------|--------|
| **HTTP** | `PUT` |
| **URL** | `/api/AdminLessonMikro/{id}` |
| **Route** | `id` (Guid) |
| **Body** | `LessonMikroUpdateDto` (JSON) |

**Request body örneği:**
```json
{
  "name": "Türev ve uygulamaları",
  "orderIndex": 2
}
```

**Başarılı cevap (200):** `{ "message": "Mikro konu başarıyla güncellendi." }`  
**Hata:** `404` / `400`.

---

### 6.5 Mikro konu sil

| Özellik | Değer |
|--------|--------|
| **HTTP** | `DELETE` |
| **URL** | `/api/AdminLessonMikro/{id}` |
| **Route** | `id` (Guid) |

**Başarılı cevap (200):** `{ "message": "Mikro konu başarıyla silindi." }`  
**Hata:** `404` — Mikro konu bulunamadı.

---

## 7. Endpoint Özet Tablosu

| Controller              | Method | URL | Açıklama |
|-------------------------|--------|-----|----------|
| AdminLesson             | GET    | `/api/AdminLesson/all` | Tüm dersler |
| AdminLesson             | GET    | `/api/AdminLesson?id={id}` | Ders detayı |
| AdminLesson             | POST   | `/api/AdminLesson/create` | Ders oluştur |
| AdminLesson             | PUT    | `/api/AdminLesson/update?id={id}` | Ders güncelle |
| AdminLesson             | DELETE | `/api/AdminLesson/delete?id={id}` | Ders pasif yap |
| AdminLesson             | POST   | `/api/AdminLesson/{lessonId}/lesson-sub` | Derse alt konu ekle |
| AdminLessonSub          | GET    | `/api/AdminLessonSub/by-lesson/{lessonId}` | Derse göre alt konular |
| AdminLessonSub          | GET    | `/api/AdminLessonSub/{id}` | Alt konu detayı |
| AdminLessonSub          | POST   | `/api/AdminLessonSub/{lessonId}/create` | Alt konu oluştur |
| AdminLessonSub          | PUT    | `/api/AdminLessonSub/{id}` | Alt konu güncelle |
| AdminLessonSub          | DELETE | `/api/AdminLessonSub/{id}` | Alt konu sil |
| AdminLessonMikro        | GET    | `/api/AdminLessonMikro/by-lesson-sub/{lessonSubId}` | Alt konuya göre mikro konular |
| AdminLessonMikro        | GET    | `/api/AdminLessonMikro/{id}` | Mikro konu detayı |
| AdminLessonMikro        | POST   | `/api/AdminLessonMikro/{lessonSubId}/create` | Mikro konu oluştur |
| AdminLessonMikro        | PUT    | `/api/AdminLessonMikro/{id}` | Mikro konu güncelle |
| AdminLessonMikro        | DELETE | `/api/AdminLessonMikro/{id}` | Mikro konu sil |

---

## 8. Tipik Kullanım Akışları

### 8.1 Hiyerarşiyi oluşturma (Lesson → LessonSub → LessonMikro)

1. **Ders oluştur:**  
   `POST /api/AdminLesson/create` — Body: LessonCreateDto (code, name, orderIndex vb.).
2. **Alt konu ekle (isteğe bağlı – AdminLesson üzerinden):**  
   `POST /api/AdminLesson/{lessonId}/lesson-sub` — Body: LessonSubCreateDto.  
   **Veya** AdminLessonSub üzerinden:  
   `POST /api/AdminLessonSub/{lessonId}/create` — Body: LessonSubCreateDto.
3. **Mikro konu ekle:**  
   Önce `GET /api/AdminLessonSub/by-lesson/{lessonId}` ile alt konuları al; bir `lessonSubId` seç.  
   Sonra: `POST /api/AdminLessonMikro/{lessonSubId}/create` — Body: LessonMikroCreateDto.

### 8.2 Ağaç görünümü (frontend)

1. `GET /api/AdminLesson/all` — Tüm dersler.
2. Her ders için (veya seçilen ders için):  
   `GET /api/AdminLessonSub/by-lesson/{lessonId}` — Alt konular.
3. Her alt konu için (veya açılan satır için):  
   `GET /api/AdminLessonMikro/by-lesson-sub/{lessonSubId}` — Mikro konular.

Böylece Lesson → LessonSub → LessonMikro ağacı tek tek isteklerle doldurulabilir (veya istenirse tek endpoint’lerde toplanacak şekilde backend genişletilebilir).

### 8.3 Düzenleme ve silme

- **Ders:** Güncelle `PUT /api/AdminLesson/update?id={id}`; pasif yap `DELETE /api/AdminLesson/delete?id={id}`.
- **Alt konu:** Güncelle `PUT /api/AdminLessonSub/{id}`; sil `DELETE /api/AdminLessonSub/{id}`.
- **Mikro konu:** Güncelle `PUT /api/AdminLessonMikro/{id}`; sil `DELETE /api/AdminLessonMikro/{id}`.

---

## 9. Hata ve Durum Kodları

| HTTP   | Anlamı | Body örneği |
|--------|--------|-------------|
| 200    | Başarılı | İstek tipine göre dizi, tek obje veya `{ "message": "..." }` |
| 400    | Geçersiz istek (validasyon, iş kuralı) | `{ "error": "..." }` |
| 401    | Yetkisiz (token yok/geçersiz) | — |
| 404    | Kaynak bulunamadı | `{ "error": "Ders bulunamadı." }` vb. |
| 500    | Sunucu hatası | `{ "error": "..." }` |

Tüm endpoint’lerde hata durumunda `error` mesajı kullanıcıya gösterilebilir.

---

Bu rapor, `API/Controllers/Lessons/` sisteminin entity ilişkileri, controller içerikleri ve tüm endpoint’lerin detaylı açıklamasını içerir.
