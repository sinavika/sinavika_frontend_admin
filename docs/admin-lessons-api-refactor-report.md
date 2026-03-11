# Admin Lessons API – Refactör Raporu (Frontend)

Bu rapor, **api/Controllers/Lessons** altındaki admin ders endpoint’lerinin tek controller’da toplanması ve hiyerarşik yapıya geçirilmesiyle ilgili değişiklikleri özetler. Servis ve repository katmanları aynı kaldı; sadece controller ve route yapısı değişti.

---

## 1. Özet

| Önceki yapı | Yeni yapı |
|-------------|-----------|
| 4 ayrı controller: `AdminLessonController`, `AdminLessonMainController`, `AdminLessonSubController`, `AdminLessonMikroController` | **Tek controller:** `AdminLessonController` |
| Farklı base route’lar: `api/AdminLesson`, `api/AdminLessonMain`, `api/AdminLessonSub`, `api/AdminLessonMikro` | **Tek base route:** `api/AdminLesson` |
| Bazı endpoint’ler parametreli (örn. `by-category-sub/{id}`) | 1. seviye liste **parametre almadan** (GET `api/AdminLesson`). Alt seviyeler parent id ile hiyerarşik. |

---

## 2. Silinen Endpoint’ler (Artık Kullanılmıyor)

Aşağıdaki route’lar **kaldırıldı**. Yerine `api/AdminLesson` altındaki hiyerarşik endpoint’leri kullanın.

### AdminLessonMainController (silindi)

| Metot | Eski route | Not |
|-------|------------|-----|
| GET | `api/AdminLessonMain/by-lesson/{lessonId}` | → `GET api/AdminLesson/{lessonId}/mains` |
| GET | `api/AdminLessonMain/{id}` | → `GET api/AdminLesson/{lessonId}/mains/{mainId}` |
| POST | `api/AdminLessonMain/{lessonId}/create` | → `POST api/AdminLesson/{lessonId}/mains` |
| PUT | `api/AdminLessonMain/{id}` | → `PUT api/AdminLesson/{lessonId}/mains/{mainId}` |
| DELETE | `api/AdminLessonMain/{id}` | → `DELETE api/AdminLesson/{lessonId}/mains/{mainId}` |

### AdminLessonSubController (silindi)

| Metot | Eski route | Not |
|-------|------------|-----|
| GET | `api/AdminLessonSub/by-lesson-main/{lessonMainId}` | → `GET api/AdminLesson/{lessonId}/mains/{mainId}/subs` |
| GET | `api/AdminLessonSub/{id}` | → `GET api/AdminLesson/{lessonId}/mains/{mainId}/subs/{subId}` |
| POST | `api/AdminLessonSub/{lessonMainId}/create` | → `POST api/AdminLesson/{lessonId}/mains/{mainId}/subs` |
| PUT | `api/AdminLessonSub/{id}` | → `PUT api/AdminLesson/.../subs/{subId}` |
| DELETE | `api/AdminLessonSub/{id}` | → `DELETE api/AdminLesson/.../subs/{subId}` |

### AdminLessonMikroController (silindi)

| Metot | Eski route | Not |
|-------|------------|-----|
| GET | `api/AdminLessonMikro/by-lesson-sub/{lessonSubId}` | → `GET api/AdminLesson/{lessonId}/mains/{mainId}/subs/{subId}/mikros` |
| GET | `api/AdminLessonMikro/{id}` | → `GET api/AdminLesson/.../mikros/{mikroId}` |
| POST | `api/AdminLessonMikro/{lessonSubId}/create` | → `POST api/AdminLesson/.../subs/{subId}/mikros` |
| PUT | `api/AdminLessonMikro/{id}` | → `PUT api/AdminLesson/.../mikros/{mikroId}` |
| DELETE | `api/AdminLessonMikro/{id}` | → `DELETE api/AdminLesson/.../mikros/{mikroId}` |

### AdminLessonController – kaldırılan route

| Metot | Eski route | Not |
|-------|------------|-----|
| GET | `api/AdminLesson/all` | → `GET api/AdminLesson` (liste artık parametresiz tek endpoint) |
| GET | `api/AdminLesson/by-category-sub/{categorySubId}` | Bu refaktörde **kaldırıldı**. İhtiyaç varsa istemci tarafında `GET api/AdminLesson` sonucunu `categorySubId` ile filtreleyebilir. |

---

## 3. Yeni Hiyerarşik Endpoint Yapısı

Tüm endpoint’ler **`api/AdminLesson`** altında. Akış: **Lesson → LessonMain → LessonSub → LessonMikro**.

```
api/AdminLesson
├── 1. Lesson (kategoriye bağlı ders listesi)
│   ├── GET     ""                    → Liste (parametre yok)
│   ├── GET     "{lessonId}"         → Detay
│   ├── POST    ""                   → Oluştur
│   ├── PUT     "{lessonId}"         → Güncelle
│   └── DELETE  "{lessonId}"          → Sil (soft)
│
├── 2. LessonMain (lesson id’ye tıklanınca)
│   ├── GET     "{lessonId}/mains"                    → Liste
│   ├── GET     "{lessonId}/mains/{mainId}"          → Detay
│   ├── POST    "{lessonId}/mains"                    → Oluştur
│   ├── PUT     "{lessonId}/mains/{mainId}"          → Güncelle
│   └── DELETE  "{lessonId}/mains/{mainId}"          → Sil
│
├── 3. LessonSub (main id’ye tıklanınca)
│   ├── GET     "{lessonId}/mains/{mainId}/subs"                    → Liste
│   ├── GET     "{lessonId}/mains/{mainId}/subs/{subId}"            → Detay
│   ├── POST    "{lessonId}/mains/{mainId}/subs"                    → Oluştur
│   ├── PUT     "{lessonId}/mains/{mainId}/subs/{subId}"            → Güncelle
│   └── DELETE  "{lessonId}/mains/{mainId}/subs/{subId}"            → Sil
│
└── 4. LessonMikro (sub id’ye tıklanınca)
    ├── GET     "{lessonId}/mains/{mainId}/subs/{subId}/mikros"                    → Liste
    ├── GET     ".../mikros/{mikroId}"                                             → Detay
    ├── POST    "{lessonId}/mains/{mainId}/subs/{subId}/mikros"                   → Oluştur
    ├── PUT     ".../mikros/{mikroId}"                                             → Güncelle
    └── DELETE  ".../mikros/{mikroId}"                                             → Sil
```

---

## 4. Endpoint Listesi (Yeni)

Base URL: **`/api/AdminLesson`**. Authorization: Bearer token (admin).

### 1) Lesson

| Metot | Route | Açıklama |
|-------|--------|----------|
| GET | `` | Kategoriye bağlı tüm ders listesi (parametre yok) |
| GET | `{lessonId}` | Ders detayı |
| POST | `` | Yeni ders oluştur |
| PUT | `{lessonId}` | Ders güncelle |
| DELETE | `{lessonId}` | Ders pasif yap (soft delete) |

### 2) LessonMain

| Metot | Route | Açıklama |
|-------|--------|----------|
| GET | `{lessonId}/mains` | Bu derse ait ders içerikleri listesi |
| GET | `{lessonId}/mains/{mainId}` | Ders içeriği detayı |
| POST | `{lessonId}/mains` | Yeni ders içeriği ekle |
| PUT | `{lessonId}/mains/{mainId}` | Ders içeriği güncelle |
| DELETE | `{lessonId}/mains/{mainId}` | Ders içeriği sil |

### 3) LessonSub

| Metot | Route | Açıklama |
|-------|--------|----------|
| GET | `{lessonId}/mains/{mainId}/subs` | Bu ders içeriğine ait alt konular |
| GET | `{lessonId}/mains/{mainId}/subs/{subId}` | Alt konu detayı |
| POST | `{lessonId}/mains/{mainId}/subs` | Yeni alt konu ekle |
| PUT | `{lessonId}/mains/{mainId}/subs/{subId}` | Alt konu güncelle |
| DELETE | `{lessonId}/mains/{mainId}/subs/{subId}` | Alt konu sil |

### 4) LessonMikro

| Metot | Route | Açıklama |
|-------|--------|----------|
| GET | `{lessonId}/mains/{mainId}/subs/{subId}/mikros` | Bu alt konuya ait mikro konular |
| GET | `{lessonId}/mains/{mainId}/subs/{subId}/mikros/{mikroId}` | Mikro konu detayı |
| POST | `{lessonId}/mains/{mainId}/subs/{subId}/mikros` | Yeni mikro konu ekle |
| PUT | `{lessonId}/mains/{mainId}/subs/{subId}/mikros/{mikroId}` | Mikro konu güncelle |
| DELETE | `{lessonId}/mains/{mainId}/subs/{subId}/mikros/{mikroId}` | Mikro konu sil |

---

## 5. Örnek Gidiş–Dönüş

### 5.1 Ders listesi (parametre yok)

**İstek**

```http
GET /api/AdminLesson
Authorization: Bearer <admin_token>
```

**Örnek yanıt (200)**

```json
[
  {
    "id": "a1b2c3d4-0000-0000-0000-000000000001",
    "categorySubId": "b2c3d4e5-0000-0000-0000-000000000002",
    "name": "Matematik",
    "orderIndex": 0,
    "isActive": true,
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": null,
    "categorySubName": "Sayısal"
  }
]
```

---

### 5.2 Ders detayı

**İstek**

```http
GET /api/AdminLesson/a1b2c3d4-0000-0000-0000-000000000001
Authorization: Bearer <admin_token>
```

**Örnek yanıt (200)**

```json
{
  "id": "a1b2c3d4-0000-0000-0000-000000000001",
  "categorySubId": "b2c3d4e5-0000-0000-0000-000000000002",
  "name": "Matematik",
  "orderIndex": 0,
  "isActive": true,
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": null,
  "categorySubName": "Sayısal"
}
```

---

### 5.3 Ders içerikleri (LessonMain) listesi

**İstek**

```http
GET /api/AdminLesson/a1b2c3d4-0000-0000-0000-000000000001/mains
Authorization: Bearer <admin_token>
```

**Örnek yanıt (200)**

```json
[
  {
    "id": "c3d4e5f6-0000-0000-0000-000000000003",
    "lessonId": "a1b2c3d4-0000-0000-0000-000000000001",
    "code": "MAT-01",
    "name": "Trigonometri",
    "description": "Temel trigonometri",
    "orderIndex": 0,
    "isActive": true,
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": null
  }
]
```

---

### 5.4 Alt konular (LessonSub) listesi

**İstek**

```http
GET /api/AdminLesson/{lessonId}/mains/{mainId}/subs
Authorization: Bearer <admin_token>
```

**Örnek yanıt (200)**

```json
[
  {
    "id": "d4e5f6a7-0000-0000-0000-000000000004",
    "lessonMainId": "c3d4e5f6-0000-0000-0000-000000000003",
    "code": "TRG-01",
    "name": "Birim çember",
    "description": null,
    "orderIndex": 0,
    "isActive": true,
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": null
  }
]
```

---

### 5.5 Mikro konular (LessonMikro) listesi

**İstek**

```http
GET /api/AdminLesson/{lessonId}/mains/{mainId}/subs/{subId}/mikros
Authorization: Bearer <admin_token>
```

**Örnek yanıt (200)**

```json
[
  {
    "id": "e5f6a7b8-0000-0000-0000-000000000005",
    "lessonSubId": "d4e5f6a7-0000-0000-0000-000000000004",
    "code": "BC-01",
    "name": "Açı ve yay",
    "description": null,
    "orderIndex": 0,
    "isActive": true,
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": null
  }
]
```

---

### 5.6 Oluşturma örnekleri

**Yeni Lesson**

```http
POST /api/AdminLesson
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "categorySubId": "b2c3d4e5-0000-0000-0000-000000000002",
  "name": "Fizik",
  "orderIndex": 1,
  "isActive": true
}
```

**Yeni LessonMain**

```http
POST /api/AdminLesson/a1b2c3d4-0000-0000-0000-000000000001/mains
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "code": "FIZ-01",
  "name": "Hareket",
  "description": "Tek boyutlu hareket",
  "orderIndex": 0,
  "isActive": true
}
```

**Yeni LessonSub**

```http
POST /api/AdminLesson/{lessonId}/mains/{mainId}/subs
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "code": "HRK-01",
  "name": "Konum ve hız",
  "description": null,
  "orderIndex": 0,
  "isActive": true
}
```

**Yeni LessonMikro**

```http
POST /api/AdminLesson/{lessonId}/mains/{mainId}/subs/{subId}/mikros
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "code": "KV-01",
  "name": "Ortalama hız",
  "description": null,
  "orderIndex": 0,
  "isActive": true
}
```

---

## 6. Hata yanıtları

- **401 Unauthorized:** Geçersiz veya eksik token.
- **404 Not Found:** İlgili Lesson / Main / Sub / Mikro bulunamadı veya path’teki id’ler birbiriyle uyumsuz.
- **500:** Sunucu hatası; yanıt gövdesinde `{ "error": "..." }` döner.

---

## 7. Frontend için yapılacaklar

1. **Base URL:** Tüm ders/admin istekleri için base’i `api/AdminLesson` yapın; `AdminLessonMain`, `AdminLessonSub`, `AdminLessonMikro` artık yok.
2. **Liste (ilk ekran):** Ders listesi için `GET /api/AdminLesson` kullanın (parametre yok). Eski `GET /api/AdminLesson/all` veya `by-category-sub/{id}` çağrılarını kaldırın.
3. **Hiyerarşi:**  
   - Lesson’a tıklanınca → `GET /api/AdminLesson/{lessonId}/mains`  
   - Main’e tıklanınca → `GET /api/AdminLesson/{lessonId}/mains/{mainId}/subs`  
   - Sub’a tıklanınca → `GET /api/AdminLesson/{lessonId}/mains/{mainId}/subs/{subId}/mikros`  
   Breadcrumb veya state’te `lessonId`, `mainId`, `subId` tutarak ilgili path’i oluşturun.
4. **CRUD:** Create/Update/Delete için yukarıdaki tablolara ve örnek isteklere göre route ve body kullanın. Put/Delete için URL’de ilgili id’nin doğru seviyede (lessonId, mainId, subId, mikroId) kullanıldığından emin olun.
5. **Alt kategori filtresi:** `by-category-sub` kaldırıldığı için, ihtiyaç varsa `GET /api/AdminLesson` cevabını istemcide `categorySubId` ile filtreleyin.

Servis ve repository aynı kaldığı için davranış ve DTO’lar öncekiyle uyumludur; sadece endpoint adresleri ve hiyerarşi değişti.
