# Categories API — Endpoint Gidiş-Dönüş Detayları

Admin endpoint'lerde **Authorization: Bearer &lt;token&gt;** gerekir. Partner endpoint'te (`CategoriesController`) yetki yoktur.  
Base URL örnek: `https://localhost:7xxx/api`

---

## 1. AdminCategoryController

**Base path:** `/api/AdminCategory`

---

### 1.1 Tüm kategorileri listele

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/AdminCategory/all` |

**Headers**

```http
Authorization: Bearer <admin_jwt_token>
```

**Response — 200 OK (dönüş)**

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "code": "YKS",
    "name": "Yükseköğretim Kurumları Sınavı",
    "imageUrl": "https://...",
    "isActive": true,
    "createdAt": "2025-02-23T12:00:00Z",
    "updatedAt": null
  }
]
```

**Response — 500**

```json
{ "error": "Kategorileri listelerken bir hata oluştu." }
```

---

### 1.2 Id ile kategori getir

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/AdminCategory?id={id}` |

**Query parametreleri**

| Parametre | Tip | Açıklama |
|-----------|-----|----------|
| id | guid | Kategori Id |

**Response — 200 OK (dönüş)**  
Tek `CategoryDto`: id, code, name, imageUrl, isActive, createdAt, updatedAt.

**Response — 404**

```json
{ "error": "Kategori bulunamadı." }
```

**Response — 500**

```json
{ "error": "Kategori bilgileri alınırken bir hata oluştu." }
```

---

### 1.3 Yeni kategori oluştur

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/AdminCategory/create` |
| **Content-Type** | `multipart/form-data` (form + opsiyonel dosya) |

**Request (gidiş) — form alanları**

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| Code | string | Evet | Kategori kodu |
| Name | string | Evet | Kategori adı |
| IsActive | bool | Hayır | Varsayılan true |
| file | IFormFile | Hayır | Kategori resmi |

**Örnek (form-data)**

```
Code: YKS
Name: Yükseköğretim Kurumları Sınavı
IsActive: true
file: [dosya seçimi]
```

**Response — 200 OK (dönüş)**

```json
{ "message": "Kategori başarıyla oluşturuldu." }
```

*(Mesaj metni servis tarafından dönen string ile değişebilir.)*

**Response — 500**

```json
{ "error": "Kategori ekleme işlemi sırasında bir hata oluştu." }
```

---

### 1.4 Kategori adını / bilgisini güncelle

| | |
|---|---|
| **Method** | `PUT` |
| **URL** | `/api/AdminCategory/update-name?id={id}` |

**Query:** `id` (guid).

**Request body (gidiş)** — tüm alanlar opsiyonel.

```json
{
  "code": "YKS",
  "name": "Yükseköğretim Kurumları Sınavı (Güncel)",
  "isActive": true
}
```

**Response — 200 OK (dönüş)**

```json
{ "message": "Kategori güncellendi." }
```

**Response — 404**

```json
{ "error": "Kategori bulunamadı." }
```

**Response — 500**

```json
{ "error": "Kategori güncelleme sırasında bir hata oluştu." }
```

---

### 1.5 Kategori resmini güncelle

| | |
|---|---|
| **Method** | `PUT` |
| **URL** | `/api/AdminCategory/update-image?id={id}` |
| **Content-Type** | `multipart/form-data` (file zorunlu) |

**Query:** `id` (guid).  
**Form:** `file` (IFormFile) — zorunlu; boş dosya 400 döner.

**Response — 200 OK (dönüş)**

```json
{ "message": "Kategori resmi güncellendi." }
```

**Response — 400**  
Dosya yok veya boş: `"Dosya yüklenemedi."` (string body).

**Response — 404**

```json
{ "error": "Kategori bulunamadı." }
```

**Response — 500**

```json
{ "error": "Kategori resmi güncellenirken bir hata oluştu." }
```

---

### 1.6 Kategori sil

| | |
|---|---|
| **Method** | `DELETE` |
| **URL** | `/api/AdminCategory/delete?id={id}` |

**Query:** `id` (guid).

**Response — 200 OK (dönüş)**

```json
{ "message": "Kategori silindi." }
```

**Response — 404**

```json
{ "error": "Kategori bulunamadı." }
```

**Response — 500**

```json
{ "error": "Kategori silme işlemi sırasında bir hata oluştu." }
```

---

## 2. AdminCategorySubController

**Base path:** `/api/AdminCategorySub`

---

### 2.1 Ana kategori Id ile alt kategorileri listele

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/AdminCategorySub/{categoryId}/subs` |

**Response — 200 OK (dönüş)**

```json
[
  {
    "id": "sub-guid",
    "categoryId": "category-guid",
    "code": "TYT",
    "name": "Temel Yeterlilik Testi",
    "isActive": true,
    "createdAt": "2025-02-23T12:00:00Z",
    "updatedAt": null,
    "createdBy": null,
    "updatedBy": null
  }
]
```

**Response — 404**

```json
{ "error": "<KeyNotFoundException mesajı>" }
```

**Response — 500**

```json
{ "error": "Alt kategoriler listelenirken bir hata oluştu." }
```

---

### 2.2 Id ile alt kategori getir

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/AdminCategorySub?id={id}` |

**Query:** `id` (guid).

**Response — 200 OK (dönüş)**  
Tek `CategorySubDto` (2.1 ile aynı yapı).

**Response — 404**

```json
{ "error": "Alt kategori bulunamadı." }
```

**Response — 500**

```json
{ "error": "Alt kategori bilgisi alınırken bir hata oluştu." }
```

---

### 2.3 Yeni alt kategori oluştur

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/AdminCategorySub/create` |

**Request body (gidiş)**

```json
{
  "categoryId": "category-guid",
  "code": "TYT",
  "name": "Temel Yeterlilik Testi",
  "isActive": true
}
```

**Response — 200 OK (dönüş)**

```json
{ "message": "Alt kategori oluşturuldu." }
```

**Response — 404 / 400**  
`{ "error": "<ex.Message>" }` (KeyNotFoundException, ArgumentException, InvalidOperationException).

**Response — 500**

```json
{ "error": "Alt kategori oluşturulurken bir hata oluştu." }
```

---

### 2.4 Alt kategori güncelle

| | |
|---|---|
| **Method** | `PUT` |
| **URL** | `/api/AdminCategorySub/update?id={id}` |

**Query:** `id` (guid).

**Request body (gidiş)** — tüm alanlar opsiyonel.

```json
{
  "code": "TYT",
  "name": "Temel Yeterlilik Testi (Güncel)",
  "isActive": true
}
```

**Response — 200 OK (dönüş)**

```json
{ "message": "Alt kategori güncellendi." }
```

**Response — 404 / 400**  
`{ "error": "..." }`

**Response — 500**

```json
{ "error": "Alt kategori güncellenirken bir hata oluştu." }
```

---

### 2.5 Alt kategori sil

| | |
|---|---|
| **Method** | `DELETE` |
| **URL** | `/api/AdminCategorySub/delete?id={id}` |

**Query:** `id` (guid).

**Response — 200 OK (dönüş)**

```json
{ "message": "Alt kategori silindi." }
```

**Response — 404**

```json
{ "error": "..." }
```

**Response — 500**

```json
{ "error": "Alt kategori silinirken bir hata oluştu." }
```

---

## 3. AdminCategorySectionController

**Base path:** `/api/AdminCategorySection`

---

### 3.1 Tüm bölüm şablonlarını listele

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/AdminCategorySection/all` |

**Response — 200 OK (dönüş)**

```json
[
  {
    "id": "section-guid",
    "categorySubId": "sub-guid",
    "lessonId": "lesson-guid",
    "lessonMainId": null,
    "lessonSubId": null,
    "name": "Matematik",
    "orderIndex": 1,
    "questionCount": 40,
    "durationMinutes": 60,
    "minQuestions": 35,
    "maxQuestions": 45,
    "targetQuestions": null,
    "difficultyMix": null,
    "createdAt": "...",
    "updatedAt": null,
    "createdBy": null,
    "updatedBy": null
  }
]
```

**Response — 500**

```json
{ "error": "Bölüm şablonları listelenirken bir hata oluştu." }
```

---

### 3.2 Id ile bölüm şablonu getir

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/AdminCategorySection/{id}` |

**Response — 200 OK (dönüş)**  
Tek `CategorySectionDto` (3.1 ile aynı yapı).

**Response — 404**

```json
{ "error": "Bölüm şablonu bulunamadı." }
```

**Response — 500**

```json
{ "error": "Bölüm şablonu alınırken bir hata oluştu." }
```

---

### 3.3 Alt kategori Id ile bölüm şablonlarını listele

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/AdminCategorySection/by-sub/{categorySubId}` |

**Response — 200 OK (dönüş)**  
`CategorySectionDto[]` (3.1 ile aynı yapı).

**Response — 404**

```json
{ "error": "<KeyNotFoundException mesajı>" }
```

**Response — 500**

```json
{ "error": "Bölüm şablonları listelenirken bir hata oluştu." }
```

---

### 3.4 Yeni bölüm şablonu oluştur

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/AdminCategorySection/create` |

**Request body (gidiş)**

```json
{
  "categorySubId": "sub-guid",
  "lessonId": "lesson-guid",
  "lessonMainId": null,
  "lessonSubId": null,
  "name": "Matematik",
  "orderIndex": 1,
  "questionCount": 40,
  "durationMinutes": 60,
  "minQuestions": 35,
  "maxQuestions": 45,
  "targetQuestions": null,
  "difficultyMix": null
}
```

**Response — 200 OK (dönüş)**

```json
{ "message": "Bölüm şablonu oluşturuldu." }
```

**Response — 404 / 400**  
`{ "error": "..." }`

**Response — 500**

```json
{ "error": "Bölüm şablonu oluşturulurken bir hata oluştu." }
```

---

### 3.5 Bölüm şablonunu güncelle

| | |
|---|---|
| **Method** | `PUT` |
| **URL** | `/api/AdminCategorySection/{id}` |

**Request body (gidiş)** — tüm alanlar opsiyonel.

```json
{
  "lessonId": null,
  "lessonMainId": null,
  "lessonSubId": null,
  "name": "Matematik (Güncel)",
  "orderIndex": 2,
  "questionCount": 45,
  "durationMinutes": 65,
  "minQuestions": 40,
  "maxQuestions": 50,
  "targetQuestions": null,
  "difficultyMix": null
}
```

**Response — 200 OK (dönüş)**

```json
{ "message": "Bölüm şablonu güncellendi." }
```

**Response — 404 / 400**  
`{ "error": "..." }`

**Response — 500**

```json
{ "error": "Bölüm şablonu güncellenirken bir hata oluştu." }
```

---

### 3.6 Bölüm şablonunu sil

| | |
|---|---|
| **Method** | `DELETE` |
| **URL** | `/api/AdminCategorySection/{id}` |

**Response — 200 OK (dönüş)**

```json
{ "message": "Bölüm şablonu silindi." }
```

**Response — 404**

```json
{ "error": "Bölüm şablonu bulunamadı." }
```

**Response — 500**

```json
{ "error": "Bölüm şablonu silinirken bir hata oluştu." }
```

---

## 4. AdminCategoryFeatureController

**Base path:** `/api/AdminCategoryFeature`

---

### 4.1 Tüm kategori özelliklerini listele

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/AdminCategoryFeature/all` |

**Response — 200 OK (dönüş)**

```json
[
  {
    "id": "feature-guid",
    "categorySubId": "sub-guid",
    "defaultQuestionCount": 40,
    "defaultDurationMinutes": 120,
    "defaultQuestionOptionCount": 5,
    "usesNegativeMarking": true,
    "negativeMarkingRule": "4W1R",
    "version": 1,
    "createdAt": "...",
    "updatedAt": null
  }
]
```

**Response — 500**

```json
{ "error": "Kategori özellikleri listelenirken bir hata oluştu." }
```

---

### 4.2 Id ile kategori özelliği getir

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/AdminCategoryFeature/{id}` |

**Response — 200 OK (dönüş)**  
Tek `CategoryFeatureDto` (4.1 ile aynı yapı).

**Response — 404**

```json
{ "error": "Kategori özelliği bulunamadı." }
```

**Response — 500**

```json
{ "error": "Kategori özelliği alınırken bir hata oluştu." }
```

---

### 4.3 Alt kategori Id ile özellik getir

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/AdminCategoryFeature/by-sub/{categorySubId}` |

**Response — 200 OK (dönüş)**  
Tek `CategoryFeatureDto` (4.1 ile aynı yapı).

**Response — 404**

```json
{ "error": "Bu alt kategori için özellik kaydı bulunamadı." }
```

**Response — 500**

```json
{ "error": "Kategori özelliği alınırken bir hata oluştu." }
```

---

### 4.4 Yeni kategori özelliği oluştur

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/AdminCategoryFeature/create` |

**Request body (gidiş)**

```json
{
  "categorySubId": "sub-guid",
  "defaultQuestionCount": 40,
  "defaultDurationMinutes": 120,
  "defaultQuestionOptionCount": 5,
  "usesNegativeMarking": true,
  "negativeMarkingRule": "4 yanlış 1 doğru götürür"
}
```

**Response — 200 OK (dönüş)**

```json
{ "message": "Kategori özelliği oluşturuldu." }
```

**Response — 404 / 400**  
`{ "error": "..." }`

**Response — 500**

```json
{ "error": "Kategori özelliği oluşturulurken bir hata oluştu." }
```

---

### 4.5 Kategori özelliğini güncelle

| | |
|---|---|
| **Method** | `PUT` |
| **URL** | `/api/AdminCategoryFeature/{id}` |

**Request body (gidiş)** — tüm alanlar opsiyonel.

```json
{
  "defaultQuestionCount": 45,
  "defaultDurationMinutes": 135,
  "defaultQuestionOptionCount": 5,
  "usesNegativeMarking": true,
  "negativeMarkingRule": "4W1R"
}
```

**Response — 200 OK (dönüş)**

```json
{ "message": "Kategori özelliği güncellendi." }
```

**Response — 404**

```json
{ "error": "Kategori özelliği bulunamadı." }
```

**Response — 500**

```json
{ "error": "Kategori özelliği güncellenirken bir hata oluştu." }
```

---

### 4.6 Kategori özelliğini sil

| | |
|---|---|
| **Method** | `DELETE` |
| **URL** | `/api/AdminCategoryFeature/{id}` |

**Response — 200 OK (dönüş)**

```json
{ "message": "Kategori özelliği silindi." }
```

**Response — 404**

```json
{ "error": "Kategori özelliği bulunamadı." }
```

**Response — 500**

```json
{ "error": "Kategori özelliği silinirken bir hata oluştu." }
```

---

## 5. CategoriesController (Partner API)

**Base path:** `/api/Categories`  
**Yetki:** Gerekmez (Authorize yok).

---

### 5.1 Tüm kategorileri alt kategorileri ile listele

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/Categories/all-with-subs` |

**Headers**  
Authorization gerekmez.

**Response — 200 OK (dönüş)**

```json
[
  {
    "id": "category-guid",
    "code": "YKS",
    "name": "Yükseköğretim Kurumları Sınavı",
    "imageUrl": "https://...",
    "isActive": true,
    "createdAt": "...",
    "updatedAt": null,
    "categorySubs": [
      {
        "id": "sub-guid",
        "categoryId": "category-guid",
        "code": "TYT",
        "name": "Temel Yeterlilik Testi",
        "isActive": true,
        "createdAt": "...",
        "updatedAt": null,
        "createdBy": null,
        "updatedBy": null
      }
    ]
  }
]
```

**Response — 500**

```json
{ "error": "Kategoriler listelenirken bir hata oluştu." }
```

---

## Özet tablo

| Controller | POST | GET | PUT | DELETE |
|------------|------|-----|-----|--------|
| AdminCategory | create (form+file) | all, ?id= | update-name?id=, update-image?id= | delete?id= |
| AdminCategorySub | create | ?id=, {categoryId}/subs | update?id= | delete?id= |
| AdminCategorySection | create | all, {id}, by-sub/{id} | {id} | {id} |
| AdminCategoryFeature | create | all, {id}, by-sub/{id} | {id} | {id} |
| Categories (partner) | — | all-with-subs | — | — |

Başarılı işlemlerde birçok endpoint `{ "message": "..." }` döner; hata yanıtları `{ "error": "..." }` formatındadır (404/500 ve bazı 400’ler).
