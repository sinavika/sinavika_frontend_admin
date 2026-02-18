# Kategoriler API Dokümantasyonu (Frontend)

Bu doküman, **Admin Kategoriler** altındaki tüm controller'ların endpoint'lerini, süreç akışını ve örnek gidiş-dönüş (request/response) formatlarını açıklar.

---

## Genel Bilgiler

| Özellik | Değer |
|--------|--------|
| **Yetkilendirme** | Tüm endpoint'ler `[Authorize]` — geçerli Bearer token gerekir |
| **Content-Type** | `application/json` (body ile isteklerde) |
| **Base path** | `/api/{ControllerAdı}` |

### Controller base path'leri

- **Ana Kategori:** `api/AdminCategory`
- **Alt Kategori (CategorySub):** `api/AdminCategorySub`
- **Kategori Özellikleri (CategoryFeature):** `api/AdminCategoryFeature`
- **Bölüm Şablonu (CategorySection):** `api/AdminCategorySection`

### Ortak hata response formatı

Tüm hatalarda body genelde şu yapıdadır:

```json
{ "Error": "Hata mesajı metni" }
```

Başarılı işlem mesajlarında:

```json
{ "Message": "İşlem sonucu mesajı" }
```

---

# 1. AdminCategory — Ana Kategori

Ana sınav kategorileri (örn: YKS, KPSS). CRUD + liste + resim güncelleme.

---

## 1.1 Tüm kategorileri listele

**Süreç:** Admin girişi doğrulanır, veritabanından tüm kategoriler `IsActive` ayrımı yapılmadan listelenir.

| Özellik | Değer |
|--------|--------|
| **Method** | `GET` |
| **URL** | `/api/AdminCategory/all` |
| **Query** | Yok |
| **Body** | Yok |

### Örnek istek (gidiş)

```http
GET /api/AdminCategory/all
Authorization: Bearer {token}
```

### Örnek başarılı dönüş (200 OK)

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "code": "YKS",
    "name": "Yükseköğretim Kurumları Sınavı",
    "imageUrl": "https://cdn.example.com/categories/yks.png",
    "isActive": true,
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-02-01T12:00:00Z"
  },
  {
    "id": "4gb96g75-6828-5673-c4gd-3d074g77bgb7",
    "code": "KPSS",
    "name": "Kamu Personel Seçme Sınavı",
    "imageUrl": null,
    "isActive": true,
    "createdAt": "2025-01-10T08:00:00Z",
    "updatedAt": null
  }
]
```

### Hata dönüşleri

- **500:** `{ "Error": "Kategorileri listelerken bir hata oluştu." }`

---

## 1.2 Kategori oluştur

**Süreç:** FormData ile `Code`, `Name`, `IsActive` ve opsiyonel `file` (kategori görseli) gönderilir. Servis kategoriyi oluşturur; dosya varsa yüklenir ve `ImageUrl` atanır.

| Özellik | Değer |
|--------|--------|
| **Method** | `POST` |
| **URL** | `/api/AdminCategory/create` |
| **Content-Type** | `multipart/form-data` |
| **Body** | FormData: `CategoryCreateDto` alanları + opsiyonel `file` |

### Örnek istek (gidiş)

**FormData alanları:**

- `Code`: string (zorunlu)
- `Name`: string (zorunlu)
- `IsActive`: boolean (varsayılan: true)
- `file`: File (opsiyonel — kategori görseli)

```http
POST /api/AdminCategory/create
Authorization: Bearer {token}
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="Code"
YKS
------WebKitFormBoundary
Content-Disposition: form-data; name="Name"
Yükseköğretim Kurumları Sınavı
------WebKitFormBoundary
Content-Disposition: form-data; name="IsActive"
true
------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="yks.png"
Content-Type: image/png
(binary)
------WebKitFormBoundary--
```

### Örnek başarılı dönüş (200 OK)

```json
{
  "message": "Kategori başarıyla oluşturuldu."
}
```

### Hata dönüşleri

- **500:** `{ "Error": "Kategori ekleme işlemi sırasında bir hata oluştu." }`

---

## 1.3 Kategori detayı (Id ile getir)

**Süreç:** Query'den `id` alınır, ilgili kategori döner. Bulunamazsa 404.

| Özellik | Değer |
|--------|--------|
| **Method** | `GET` |
| **URL** | `/api/AdminCategory` |
| **Query** | `id` (Guid) — zorunlu |

### Örnek istek (gidiş)

```http
GET /api/AdminCategory?id=3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer {token}
```

### Örnek başarılı dönüş (200 OK)

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "code": "YKS",
  "name": "Yükseköğretim Kurumları Sınavı",
  "imageUrl": "https://cdn.example.com/categories/yks.png",
  "isActive": true,
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-02-01T12:00:00Z"
}
```

### Hata dönüşleri

- **404:** `{ "Error": "Kategori bulunamadı." }`
- **500:** `{ "Error": "Kategori bilgileri alınırken bir hata oluştu." }`

---

## 1.4 Kategori sil

**Süreç:** Query'den `id` alınır, kategori silinir. Id yoksa 404.

| Özellik | Değer |
|--------|--------|
| **Method** | `DELETE` |
| **URL** | `/api/AdminCategory/delete` |
| **Query** | `id` (Guid) — zorunlu |

### Örnek istek (gidiş)

```http
DELETE /api/AdminCategory/delete?id=3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer {token}
```

### Örnek başarılı dönüş (200 OK)

```json
{
  "message": "Kategori başarıyla silindi."
}
```

### Hata dönüşleri

- **404:** `{ "Error": "Kategori bulunamadı." }`
- **500:** `{ "Error": "Kategori silme işlemi sırasında bir hata oluştu." }`

---

## 1.5 Kategori güncelle (ad / kod / aktiflik)

**Süreç:** Query'de `id`, body'de güncellenecek alanlar (hepsi opsiyonel) gönderilir.

| Özellik | Değer |
|--------|--------|
| **Method** | `PUT` |
| **URL** | `/api/AdminCategory/update-name` |
| **Query** | `id` (Guid) — zorunlu |
| **Body** | `CategoryUpdateDto` (JSON) |

### Request body (CategoryUpdateDto)

```ts
{
  code?: string;   // opsiyonel
  name?: string;   // opsiyonel
  isActive?: boolean; // opsiyonel
}
```

### Örnek istek (gidiş)

```http
PUT /api/AdminCategory/update-name?id=3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "YKS (Güncel Ad)",
  "isActive": true
}
```

### Örnek başarılı dönüş (200 OK)

```json
{
  "message": "Kategori başarıyla güncellendi."
}
```

### Hata dönüşleri

- **404:** `{ "Error": "Kategori bulunamadı." }`
- **500:** `{ "Error": "Kategori güncelleme sırasında bir hata oluştu." }`

---

## 1.6 Kategori resmini güncelle

**Süreç:** Query'de kategori `id`, body/form'da yeni görsel dosyası gönderilir. Dosya yoksa veya boşsa 400.

| Özellik | Değer |
|--------|--------|
| **Method** | `PUT` |
| **URL** | `/api/AdminCategory/update-image` |
| **Query** | `id` (Guid) — zorunlu |
| **Body** | `multipart/form-data` — `file` (zorunlu) |

### Örnek istek (gidiş)

```http
PUT /api/AdminCategory/update-image?id=3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer {token}
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="yks-new.png"
Content-Type: image/png
(binary)
------WebKitFormBoundary--
```

### Örnek başarılı dönüş (200 OK)

```json
{
  "message": "Kategori resmi başarıyla güncellendi."
}
```

### Hata dönüşleri

- **400:** `"Dosya yüklenemedi."` (body string)
- **404:** `{ "Error": "Kategori bulunamadı." }`
- **500:** `{ "Error": "Kategori resmi güncellenirken bir hata oluştu." }`

---

# 2. AdminCategorySub — Alt Kategori

Ana kategoriye bağlı alt kategoriler (örn: YKS > TYT, AYT; KPSS > Lisans, Önlisans). CRUD.

---

## 2.1 Ana kategoriye göre alt kategorileri listele

**Süreç:** `categoryId` ile ana kategori kontrol edilir, o ana kategoriye ait tüm alt kategoriler döner.

| Özellik | Değer |
|--------|--------|
| **Method** | `GET` |
| **URL** | `/api/AdminCategorySub/{categoryId}/subs` |
| **Route param** | `categoryId` (Guid) |

### Örnek istek (gidiş)

```http
GET /api/AdminCategorySub/3fa85f64-5717-4562-b3fc-2c963f66afa6/subs
Authorization: Bearer {token}
```

### Örnek başarılı dönüş (200 OK)

```json
[
  {
    "id": "5hc07h86-7939-6784-d5he-4e185h88chc8",
    "categoryId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "code": "TYT",
    "name": "Temel Yeterlilik Testi",
    "isActive": true,
    "createdAt": "2025-01-20T09:00:00Z",
    "updatedAt": null,
    "createdBy": null,
    "updatedBy": null
  },
  {
    "id": "6id18i97-8040-7895-e6if-5f296i99did9",
    "categoryId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "code": "AYT",
    "name": "Alan Yeterlilik Testi",
    "isActive": true,
    "createdAt": "2025-01-20T09:05:00Z",
    "updatedAt": "2025-02-10T14:00:00Z",
    "createdBy": null,
    "updatedBy": null
  }
]
```

### Hata dönüşleri

- **404:** `{ "Error": "Ana kategori bulunamadı. Id: ..." }`
- **500:** `{ "Error": "Alt kategoriler listelenirken bir hata oluştu." }`

---

## 2.2 Alt kategori detayı (Id ile getir)

**Süreç:** `id` (query) ile tek bir alt kategori döner.

| Özellik | Değer |
|--------|--------|
| **Method** | `GET` |
| **URL** | `/api/AdminCategorySub` |
| **Query** | `id` (Guid) — zorunlu |

### Örnek istek (gidiş)

```http
GET /api/AdminCategorySub?id=5hc07h86-7939-6784-d5he-4e185h88chc8
Authorization: Bearer {token}
```

### Örnek başarılı dönüş (200 OK)

```json
{
  "id": "5hc07h86-7939-6784-d5he-4e185h88chc8",
  "categoryId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "code": "TYT",
  "name": "Temel Yeterlilik Testi",
  "isActive": true,
  "createdAt": "2025-01-20T09:00:00Z",
  "updatedAt": null,
  "createdBy": null,
  "updatedBy": null
}
```

### Hata dönüşleri

- **404:** `{ "Error": "Alt kategori bulunamadı." }`
- **500:** `{ "Error": "Alt kategori bilgisi alınırken bir hata oluştu." }`

---

## 2.3 Alt kategori oluştur

**Süreç:** Body'de `CategoryId`, `Code`, `Name`, `IsActive` gönderilir. Aynı ana kategoride aynı `Code` varsa 400.

| Özellik | Değer |
|--------|--------|
| **Method** | `POST` |
| **URL** | `/api/AdminCategorySub/create` |
| **Body** | `CategorySubCreateDto` (JSON) |

### Request body (CategorySubCreateDto)

```ts
{
  categoryId: string;  // Guid — zorunlu
  code: string;        // zorunlu, boş olamaz
  name: string;        // zorunlu, boş olamaz
  isActive?: boolean;  // varsayılan true
}
```

### Örnek istek (gidiş)

```http
POST /api/AdminCategorySub/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "categoryId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "code": "TYT",
  "name": "Temel Yeterlilik Testi",
  "isActive": true
}
```

### Örnek başarılı dönüş (200 OK)

```json
{
  "message": "Alt kategori başarıyla oluşturuldu."
}
```

### Hata dönüşleri

- **404:** `{ "Error": "Ana kategori bulunamadı. Id: ..." }`
- **400:** `{ "Error": "Alt kategori kodu (Code) zorunludur." }` / `"Alt kategori adı (Name) zorunludur."`
- **400:** `{ "Error": "Bu ana kategoride 'TYT' kodlu alt kategori zaten mevcut." }`
- **500:** `{ "Error": "Alt kategori oluşturulurken bir hata oluştu." }`

---

## 2.4 Alt kategori güncelle

**Süreç:** Query'de `id`, body'de güncellenecek alanlar (opsiyonel). Code değiştirilirken aynı ana kategoride çakışma varsa 400.

| Özellik | Değer |
|--------|--------|
| **Method** | `PUT` |
| **URL** | `/api/AdminCategorySub/update` |
| **Query** | `id` (Guid) — zorunlu |
| **Body** | `CategorySubUpdateDto` (JSON) |

### Request body (CategorySubUpdateDto)

```ts
{
  code?: string;    // opsiyonel, boş string verilirse hata
  name?: string;    // opsiyonel, boş string verilirse hata
  isActive?: boolean; // opsiyonel
}
```

### Örnek istek (gidiş)

```http
PUT /api/AdminCategorySub/update?id=5hc07h86-7939-6784-d5he-4e185h88chc8
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Temel Yeterlilik Testi (TYT)",
  "isActive": true
}
```

### Örnek başarılı dönüş (200 OK)

```json
{
  "message": "Alt kategori başarıyla güncellendi."
}
```

### Hata dönüşleri

- **404:** `{ "Error": "Alt kategori bulunamadı. Id: ..." }`
- **400:** `{ "Error": "Alt kategori kodu (Code) boş olamaz." }` / benzeri validasyon
- **400:** `{ "Error": "Bu ana kategoride '...' kodlu başka bir alt kategori zaten mevcut." }`
- **500:** `{ "Error": "Alt kategori güncellenirken bir hata oluştu." }`

---

## 2.5 Alt kategori sil

**Süreç:** Query'de `id` ile alt kategori kalıcı silinir.

| Özellik | Değer |
|--------|--------|
| **Method** | `DELETE` |
| **URL** | `/api/AdminCategorySub/delete` |
| **Query** | `id` (Guid) — zorunlu |

### Örnek istek (gidiş)

```http
DELETE /api/AdminCategorySub/delete?id=5hc07h86-7939-6784-d5he-4e185h88chc8
Authorization: Bearer {token}
```

### Örnek başarılı dönüş (200 OK)

```json
{
  "message": "Alt kategori başarıyla silindi."
}
```

### Hata dönüşleri

- **404:** `{ "Error": "Alt kategori bulunamadı. Id: ..." }`
- **500:** `{ "Error": "Alt kategori silinirken bir hata oluştu." }`

---

# 3. AdminCategoryFeature — Kategori Özellikleri

Alt kategori (CategorySub) başına sınav varsayılanları: soru sayısı, süre, şık sayısı, negatif puanlama. CRUD.

---

## 3.1 Tüm kategori özelliklerini listele

**Süreç:** Tüm CategoryFeature kayıtları döner.

| Özellik | Değer |
|--------|--------|
| **Method** | `GET` |
| **URL** | `/api/AdminCategoryFeature/all` |

### Örnek istek (gidiş)

```http
GET /api/AdminCategoryFeature/all
Authorization: Bearer {token}
```

### Örnek başarılı dönüş (200 OK)

```json
[
  {
    "id": "7je29j08-9151-8906-f7jg-6g307j00eje0",
    "categorySubId": "5hc07h86-7939-6784-d5he-4e185h88chc8",
    "defaultQuestionCount": 120,
    "defaultDurationMinutes": 135,
    "defaultQuestionOptionCount": 5,
    "usesNegativeMarking": true,
    "negativeMarkingRule": "4 yanlış 1 doğruyu götürür",
    "version": 1,
    "createdAt": "2025-01-25T10:00:00Z",
    "updatedAt": null
  }
]
```

### Hata dönüşleri

- **500:** `{ "Error": "Kategori özellikleri listelenirken bir hata oluştu." }`

---

## 3.2 Kategori özelliği detayı (Id ile getir)

**Süreç:** Route'taki `id` ile tek bir CategoryFeature döner.

| Özellik | Değer |
|--------|--------|
| **Method** | `GET` |
| **URL** | `/api/AdminCategoryFeature/{id}` |
| **Route param** | `id` (Guid) |

### Örnek istek (gidiş)

```http
GET /api/AdminCategoryFeature/7je29j08-9151-8906-f7jg-6g307j00eje0
Authorization: Bearer {token}
```

### Örnek başarılı dönüş (200 OK)

```json
{
  "id": "7je29j08-9151-8906-f7jg-6g307j00eje0",
  "categorySubId": "5hc07h86-7939-6784-d5he-4e185h88chc8",
  "defaultQuestionCount": 120,
  "defaultDurationMinutes": 135,
  "defaultQuestionOptionCount": 5,
  "usesNegativeMarking": true,
  "negativeMarkingRule": "4 yanlış 1 doğruyu götürür",
  "version": 1,
  "createdAt": "2025-01-25T10:00:00Z",
  "updatedAt": null
}
```

### Hata dönüşleri

- **404:** `{ "Error": "Kategori özelliği bulunamadı." }`
- **500:** `{ "Error": "Kategori özelliği alınırken bir hata oluştu." }`

---

## 3.3 Alt kategoriye göre özellik getir

**Süreç:** Bir alt kategori (CategorySub) için tanımlı tek bir CategoryFeature kaydı varsa döner; yoksa 404.

| Özellik | Değer |
|--------|--------|
| **Method** | `GET` |
| **URL** | `/api/AdminCategoryFeature/by-sub/{categorySubId}` |
| **Route param** | `categorySubId` (Guid) |

### Örnek istek (gidiş)

```http
GET /api/AdminCategoryFeature/by-sub/5hc07h86-7939-6784-d5he-4e185h88chc8
Authorization: Bearer {token}
```

### Örnek başarılı dönüş (200 OK)

```json
{
  "id": "7je29j08-9151-8906-f7jg-6g307j00eje0",
  "categorySubId": "5hc07h86-7939-6784-d5he-4e185h88chc8",
  "defaultQuestionCount": 120,
  "defaultDurationMinutes": 135,
  "defaultQuestionOptionCount": 5,
  "usesNegativeMarking": true,
  "negativeMarkingRule": "4 yanlış 1 doğruyu götürür",
  "version": 1,
  "createdAt": "2025-01-25T10:00:00Z",
  "updatedAt": null
}
```

### Hata dönüşleri

- **404:** `{ "Error": "Bu alt kategori için özellik kaydı bulunamadı." }`
- **500:** `{ "Error": "Kategori özelliği alınırken bir hata oluştu." }`

---

## 3.4 Kategori özelliği oluştur

**Süreç:** Body'de `CategorySubId` ve opsiyonel sınav varsayılanları gönderilir. CategorySub yoksa 404; aynı CategorySub için zaten kayıt varsa 400.

| Özellik | Değer |
|--------|--------|
| **Method** | `POST` |
| **URL** | `/api/AdminCategoryFeature/create` |
| **Body** | `CategoryFeatureCreateDto` (JSON) |

### Request body (CategoryFeatureCreateDto)

```ts
{
  categorySubId: string;           // Guid — zorunlu
  defaultQuestionCount?: number;   // opsiyonel
  defaultDurationMinutes?: number; // opsiyonel
  defaultQuestionOptionCount?: number; // opsiyonel
  usesNegativeMarking?: boolean;  // varsayılan false
  negativeMarkingRule?: string | null;
}
```

### Örnek istek (gidiş)

```http
POST /api/AdminCategoryFeature/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "categorySubId": "5hc07h86-7939-6784-d5he-4e185h88chc8",
  "defaultQuestionCount": 120,
  "defaultDurationMinutes": 135,
  "defaultQuestionOptionCount": 5,
  "usesNegativeMarking": true,
  "negativeMarkingRule": "4 yanlış 1 doğruyu götürür"
}
```

### Örnek başarılı dönüş (200 OK)

```json
{
  "message": "Kategori özelliği başarıyla oluşturuldu."
}
```

### Hata dönüşleri

- **404:** `{ "Error": "Alt kategori bulunamadı. Id: ..." }`
- **400:** Validasyon / iş kuralı hataları
- **500:** `{ "Error": "Kategori özelliği oluşturulurken bir hata oluştu." }`

---

## 3.5 Kategori özelliği güncelle

**Süreç:** Route'ta `id`, body'de güncellenecek alanlar (hepsi opsiyonel).

| Özellik | Değer |
|--------|--------|
| **Method** | `PUT` |
| **URL** | `/api/AdminCategoryFeature/{id}` |
| **Route param** | `id` (Guid) |
| **Body** | `CategoryFeatureUpdateDto` (JSON) |

### Request body (CategoryFeatureUpdateDto)

```ts
{
  defaultQuestionCount?: number | null;
  defaultDurationMinutes?: number | null;
  defaultQuestionOptionCount?: number | null;
  usesNegativeMarking?: boolean | null;
  negativeMarkingRule?: string | null;
}
```

### Örnek istek (gidiş)

```http
PUT /api/AdminCategoryFeature/7je29j08-9151-8906-f7jg-6g307j00eje0
Authorization: Bearer {token}
Content-Type: application/json

{
  "defaultDurationMinutes": 150,
  "negativeMarkingRule": "3 yanlış 1 doğruyu götürür"
}
```

### Örnek başarılı dönüş (200 OK)

```json
{
  "message": "Kategori özelliği başarıyla güncellendi."
}
```

### Hata dönüşleri

- **404:** `{ "Error": "Kategori özelliği bulunamadı." }`
- **500:** `{ "Error": "Kategori özelliği güncellenirken bir hata oluştu." }`

---

## 3.6 Kategori özelliği sil

**Süreç:** Route'taki `id` ile CategoryFeature kaydı silinir.

| Özellik | Değer |
|--------|--------|
| **Method** | `DELETE` |
| **URL** | `/api/AdminCategoryFeature/{id}` |
| **Route param** | `id` (Guid) |

### Örnek istek (gidiş)

```http
DELETE /api/AdminCategoryFeature/7je29j08-9151-8906-f7jg-6g307j00eje0
Authorization: Bearer {token}
```

### Örnek başarılı dönüş (200 OK)

```json
{
  "message": "Kategori özelliği başarıyla silindi."
}
```

### Hata dönüşleri

- **404:** `{ "Error": "Kategori özelliği bulunamadı." }`
- **500:** `{ "Error": "Kategori özelliği silinirken bir hata oluştu." }`

---

# 4. AdminCategorySection — Bölüm Şablonu

Alt kategorideki sınav bölümleri (Türkçe, Matematik vb.): ders, soru sayısı, süre, konu kotası, zorluk dağılımı. CRUD.

---

## 4.1 Tüm bölüm şablonlarını listele

**Süreç:** Tüm CategorySection kayıtları OrderIndex'e göre sıralı döner.

| Özellik | Değer |
|--------|--------|
| **Method** | `GET` |
| **URL** | `/api/AdminCategorySection/all` |

### Örnek istek (gidiş)

```http
GET /api/AdminCategorySection/all
Authorization: Bearer {token}
```

### Örnek başarılı dönüş (200 OK)

```json
[
  {
    "id": "8kf30k19-a262-9017-g8kh-7h418k11fkf1",
    "categorySubId": "5hc07h86-7939-6784-d5he-4e185h88chc8",
    "lessonId": "9lg41l2a-b373-a128-h9li-8i529l22glg2",
    "lessonSubId": "0mh52m3b-c484-b239-i0mj-9j63am33hmh3",
    "name": "Türkçe",
    "orderIndex": 0,
    "questionCount": 40,
    "durationMinutes": 40,
    "minQuestions": 35,
    "maxQuestions": 45,
    "targetQuestions": 40,
    "difficultyMix": "{\"easy\":10,\"medium\":20,\"hard\":10}",
    "createdAt": "2025-02-01T10:00:00Z",
    "updatedAt": null,
    "createdBy": null,
    "updatedBy": null
  }
]
```

### Hata dönüşleri

- **500:** `{ "Error": "Bölüm şablonları listelenirken bir hata oluştu." }`

---

## 4.2 Bölüm şablonu detayı (Id ile getir)

**Süreç:** Route'taki `id` ile tek bir CategorySection döner.

| Özellik | Değer |
|--------|--------|
| **Method** | `GET` |
| **URL** | `/api/AdminCategorySection/{id}` |
| **Route param** | `id` (Guid) |

### Örnek istek (gidiş)

```http
GET /api/AdminCategorySection/8kf30k19-a262-9017-g8kh-7h418k11fkf1
Authorization: Bearer {token}
```

### Örnek başarılı dönüş (200 OK)

```json
{
  "id": "8kf30k19-a262-9017-g8kh-7h418k11fkf1",
  "categorySubId": "5hc07h86-7939-6784-d5he-4e185h88chc8",
  "lessonId": "9lg41l2a-b373-a128-h9li-8i529l22glg2",
  "lessonSubId": "0mh52m3b-c484-b239-i0mj-9j63am33hmh3",
  "name": "Türkçe",
  "orderIndex": 0,
  "questionCount": 40,
  "durationMinutes": 40,
  "minQuestions": 35,
  "maxQuestions": 45,
  "targetQuestions": 40,
  "difficultyMix": "{\"easy\":10,\"medium\":20,\"hard\":10}",
  "createdAt": "2025-02-01T10:00:00Z",
  "updatedAt": null,
  "createdBy": null,
  "updatedBy": null
}
```

### Hata dönüşleri

- **404:** `{ "Error": "Bölüm şablonu bulunamadı." }`
- **500:** `{ "Error": "Bölüm şablonu alınırken bir hata oluştu." }`

---

## 4.3 Alt kategoriye göre bölüm şablonlarını listele

**Süreç:** Belirtilen alt kategori (CategorySub) id'sine ait tüm bölüm şablonları OrderIndex'e göre döner. Alt kategori yoksa 404.

| Özellik | Değer |
|--------|--------|
| **Method** | `GET` |
| **URL** | `/api/AdminCategorySection/by-sub/{categorySubId}` |
| **Route param** | `categorySubId` (Guid) |

### Örnek istek (gidiş)

```http
GET /api/AdminCategorySection/by-sub/5hc07h86-7939-6784-d5he-4e185h88chc8
Authorization: Bearer {token}
```

### Örnek başarılı dönüş (200 OK)

```json
[
  {
    "id": "8kf30k19-a262-9017-g8kh-7h418k11fkf1",
    "categorySubId": "5hc07h86-7939-6784-d5he-4e185h88chc8",
    "lessonId": "9lg41l2a-b373-a128-h9li-8i529l22glg2",
    "lessonSubId": null,
    "name": "Türkçe",
    "orderIndex": 0,
    "questionCount": 40,
    "durationMinutes": 40,
    "minQuestions": 35,
    "maxQuestions": 45,
    "targetQuestions": 40,
    "difficultyMix": null,
    "createdAt": "2025-02-01T10:00:00Z",
    "updatedAt": null,
    "createdBy": null,
    "updatedBy": null
  },
  {
    "id": "1ng63n4c-d595-c34a-j1nk-0k74bn44ini4",
    "categorySubId": "5hc07h86-7939-6784-d5he-4e185h88chc8",
    "lessonId": "2oh74o5d-e6a6-d45b-k2ol-1l85co55joj5",
    "lessonSubId": null,
    "name": "Matematik",
    "orderIndex": 1,
    "questionCount": 40,
    "durationMinutes": 50,
    "minQuestions": 38,
    "maxQuestions": 42,
    "targetQuestions": 40,
    "difficultyMix": null,
    "createdAt": "2025-02-01T10:05:00Z",
    "updatedAt": null,
    "createdBy": null,
    "updatedBy": null
  }
]
```

### Hata dönüşleri

- **404:** `{ "Error": "Alt kategori bulunamadı. Id: ..." }`
- **500:** `{ "Error": "Bölüm şablonları listelenirken bir hata oluştu." }`

---

## 4.4 Bölüm şablonu oluştur

**Süreç:** Body'de alt kategori, ders, bölüm adı, sıra, soru sayısı ve opsiyonel süre/konu kotası/zorluk gönderilir. CategorySub ve Lesson varlığı kontrol edilir; LessonSubId varsa ilgili derse ait olması gerekir. Min/Max/Target kota kuralları (ValidateQuota) uygulanır.

| Özellik | Değer |
|--------|--------|
| **Method** | `POST` |
| **URL** | `/api/AdminCategorySection/create` |
| **Body** | `CategorySectionCreateDto` (JSON) |

### Request body (CategorySectionCreateDto)

```ts
{
  categorySubId: string;      // Guid — zorunlu
  lessonId: string;            // Guid — zorunlu
  lessonSubId?: string | null; // Guid — opsiyonel, dersin alt konusu
  name: string;                // zorunlu
  orderIndex: number;         // zorunlu
  questionCount: number;      // zorunlu, >= 0
  durationMinutes?: number | null;
  minQuestions: number;        // zorunlu
  maxQuestions: number;       // zorunlu
  targetQuestions?: number | null;  // Min <= Target <= Max
  difficultyMix?: string | null;   // örn. JSON: kolay/orta/zor dağılımı
}
```

### Örnek istek (gidiş)

```http
POST /api/AdminCategorySection/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "categorySubId": "5hc07h86-7939-6784-d5he-4e185h88chc8",
  "lessonId": "9lg41l2a-b373-a128-h9li-8i529l22glg2",
  "lessonSubId": null,
  "name": "Türkçe",
  "orderIndex": 0,
  "questionCount": 40,
  "durationMinutes": 40,
  "minQuestions": 35,
  "maxQuestions": 45,
  "targetQuestions": 40,
  "difficultyMix": "{\"easy\":10,\"medium\":20,\"hard\":10}"
}
```

### Örnek başarılı dönüş (200 OK)

```json
{
  "message": "Bölüm şablonu başarıyla oluşturuldu."
}
```

### Hata dönüşleri

- **404:** `{ "Error": "Alt kategori bulunamadı. Id: ..." }` veya `"Ders bulunamadı. Id: ..."`
- **400:** `{ "Error": "Bölüm adı (Name) zorunludur." }` / `"Soru sayısı (QuestionCount) 0'dan küçük olamaz."`
- **400:** `{ "Error": "LessonSubId belirtilen derse (LessonId) ait olmalıdır." }`
- **400:** Kota validasyonu (Min/Max/Target) — backend InvalidOperationException mesajı
- **500:** `{ "Error": "Bölüm şablonu oluşturulurken bir hata oluştu." }`

---

## 4.5 Bölüm şablonu güncelle

**Süreç:** Route'ta `id`, body'de güncellenecek alanlar (hepsi opsiyonel). LessonSubId verilirse yine aynı derse ait olma kontrolü ve ValidateQuota uygulanır.

| Özellik | Değer |
|--------|--------|
| **Method** | `PUT` |
| **URL** | `/api/AdminCategorySection/{id}` |
| **Route param** | `id` (Guid) |
| **Body** | `CategorySectionUpdateDto` (JSON) |

### Request body (CategorySectionUpdateDto)

```ts
{
  lessonId?: string | null;
  lessonSubId?: string | null;
  name?: string | null;
  orderIndex?: number | null;
  questionCount?: number | null;  // >= 0
  durationMinutes?: number | null;
  minQuestions?: number | null;
  maxQuestions?: number | null;
  targetQuestions?: number | null;
  difficultyMix?: string | null;
}
```

### Örnek istek (gidiş)

```http
PUT /api/AdminCategorySection/8kf30k19-a262-9017-g8kh-7h418k11fkf1
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Türkçe (Sözel)",
  "durationMinutes": 45,
  "targetQuestions": 38
}
```

### Örnek başarılı dönüş (200 OK)

```json
{
  "message": "Bölüm şablonu başarıyla güncellendi."
}
```

### Hata dönüşleri

- **404:** `{ "Error": "Bölüm şablonu bulunamadı." }`
- **400:** Ders/LessonSub validasyonu veya kota (ValidateQuota) hataları
- **500:** `{ "Error": "Bölüm şablonu güncellenirken bir hata oluştu." }`

---

## 4.6 Bölüm şablonu sil

**Süreç:** Route'taki `id` ile CategorySection kaydı silinir.

| Özellik | Değer |
|--------|--------|
| **Method** | `DELETE` |
| **URL** | `/api/AdminCategorySection/{id}` |
| **Route param** | `id` (Guid) |

### Örnek istek (gidiş)

```http
DELETE /api/AdminCategorySection/8kf30k19-a262-9017-g8kh-7h418k11fkf1
Authorization: Bearer {token}
```

### Örnek başarılı dönüş (200 OK)

```json
{
  "message": "Bölüm şablonu başarıyla silindi."
}
```

### Hata dönüşleri

- **404:** `{ "Error": "Bölüm şablonu bulunamadı." }`
- **500:** `{ "Error": "Bölüm şablonu silinirken bir hata oluştu." }`

---

# Özet tablo — Tüm endpoint'ler

| Controller | Method | URL | Açıklama |
|------------|--------|-----|----------|
| AdminCategory | GET | `/api/AdminCategory/all` | Tüm kategoriler |
| AdminCategory | POST | `/api/AdminCategory/create` | Kategori oluştur (FormData + file) |
| AdminCategory | GET | `/api/AdminCategory?id=` | Kategori detay |
| AdminCategory | DELETE | `/api/AdminCategory/delete?id=` | Kategori sil |
| AdminCategory | PUT | `/api/AdminCategory/update-name?id=` | Kategori güncelle (body: JSON) |
| AdminCategory | PUT | `/api/AdminCategory/update-image?id=` | Kategori resmi güncelle (form: file) |
| AdminCategorySub | GET | `/api/AdminCategorySub/{categoryId}/subs` | Alt kategorileri listele |
| AdminCategorySub | GET | `/api/AdminCategorySub?id=` | Alt kategori detay |
| AdminCategorySub | POST | `/api/AdminCategorySub/create` | Alt kategori oluştur |
| AdminCategorySub | PUT | `/api/AdminCategorySub/update?id=` | Alt kategori güncelle |
| AdminCategorySub | DELETE | `/api/AdminCategorySub/delete?id=` | Alt kategori sil |
| AdminCategoryFeature | GET | `/api/AdminCategoryFeature/all` | Tüm özellikler |
| AdminCategoryFeature | GET | `/api/AdminCategoryFeature/{id}` | Özellik detay |
| AdminCategoryFeature | GET | `/api/AdminCategoryFeature/by-sub/{categorySubId}` | Alt kategoriye göre özellik |
| AdminCategoryFeature | POST | `/api/AdminCategoryFeature/create` | Özellik oluştur |
| AdminCategoryFeature | PUT | `/api/AdminCategoryFeature/{id}` | Özellik güncelle |
| AdminCategoryFeature | DELETE | `/api/AdminCategoryFeature/{id}` | Özellik sil |
| AdminCategorySection | GET | `/api/AdminCategorySection/all` | Tüm bölüm şablonları |
| AdminCategorySection | GET | `/api/AdminCategorySection/{id}` | Bölüm şablonu detay |
| AdminCategorySection | GET | `/api/AdminCategorySection/by-sub/{categorySubId}` | Alt kategoriye göre bölümler |
| AdminCategorySection | POST | `/api/AdminCategorySection/create` | Bölüm şablonu oluştur |
| AdminCategorySection | PUT | `/api/AdminCategorySection/{id}` | Bölüm şablonu güncelle |
| AdminCategorySection | DELETE | `/api/AdminCategorySection/{id}` | Bölüm şablonu sil |

---

*Bu doküman frontend geliştirme için hazırlanmıştır; backend controller değişikliklerinde güncellenmesi gerekebilir.*
