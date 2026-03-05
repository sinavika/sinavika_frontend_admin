# Kategori Puanlama (Score) API — Endpoint Raporu

## Giriş

Bu rapor, **Sinavika** uygulamasının **Kategori Puanlama (Score)** modülüne ait admin API uç noktalarını dokümante eder. Puanlama yapısı üç ana kavram üzerine kuruludur:

1. **Puanlama profili (CategoryScoringProfile)** — Bir alt kategori (CategorySub; örn. TYT, AYT, KPSS Önlisans) için puanlama kurallarının tanımı. Negatif puanlama, standartlaştırma yöntemi, geçerlilik tarihleri ve JSON tabanlı filtre/kural alanları içerir.
2. **Puan türü (CategoryScoreType)** — Profil içindeki somut puan türleri (TYT, SAY, EA, SÖZ, P93 vb.). Taban puan, OBP kullanımı ve standartlaştırma override’ları burada tanımlanır.
3. **Puan türü ağırlığı (CategoryScoreTypeWeight)** — Her puan türünün hangi sınav bölümüne (CategorySection) hangi ağırlıkla bağlandığını belirler (örn. AYT SAY: Matematik ve Fen bölümleri ağırlıklı).

Tüm endpoint’ler **Bearer JWT** ile yetkilendirilir ve **admin** grubuna aittir. İstekler `api/[ControllerAdı]/...` base path’i altında yapılır. Aşağıda her controller için **örnek gidiş (request)** ve **örnek dönüş (response)** senaryoları verilmiştir.

---

## 1. AdminCategoryScoreProfile — Puanlama Profili

**Base path:** `GET/POST/PUT/DELETE /api/AdminCategoryScoreProfile`

| Metot | Path | Açıklama |
|-------|------|----------|
| GET | `/all` | Tüm puanlama profillerini listeler |
| GET | `/{id}` | Id ile tek profil getirir |
| GET | `/by-sub/{categorySubId}` | Alt kategoriye göre profilleri listeler |
| POST | `/create` | Yeni profil oluşturur |
| PUT | `/{id}` | Profili günceller |
| DELETE | `/{id}` | Profili siler |

### 1.1 GET /api/AdminCategoryScoreProfile/all

Tüm puanlama profillerini döner.

**İstek (Request)**

```http
GET /api/AdminCategoryScoreProfile/all HTTP/1.1
Host: localhost:5000
Authorization: Bearer <admin_jwt_token>
Accept: application/json
```

**Başarılı Yanıt (200 OK)**

```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "categorySubId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "code": "TYT_2026",
    "name": "TYT 2026 Puanlama",
    "version": 1,
    "isActive": true,
    "effectiveFrom": "2026-01-01T00:00:00Z",
    "effectiveTo": null,
    "usesNegativeMarking": true,
    "negativeMarkingRule": "4Y1D",
    "defaultStandardizationMethod": 1,
    "cohortFilterJson": "{}",
    "roundingPolicyJson": "{}",
    "rulesJson": "{}",
    "createdAt": "2026-03-01T10:00:00Z",
    "updatedAt": null,
    "createdBy": "admin@example.com",
    "updatedBy": null
  }
]
```

**Hata Yanıtı (500)**

```json
{
  "error": "Puanlama profilleri listelenirken bir hata oluştu."
}
```

---

### 1.2 GET /api/AdminCategoryScoreProfile/{id}

Belirtilen GUID ile puanlama profilini getirir.

**İstek (Request)**

```http
GET /api/AdminCategoryScoreProfile/a1b2c3d4-e5f6-7890-abcd-ef1234567890 HTTP/1.1
Host: localhost:5000
Authorization: Bearer <admin_jwt_token>
Accept: application/json
```

**Başarılı Yanıt (200 OK)**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "categorySubId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "code": "TYT_2026",
  "name": "TYT 2026 Puanlama",
  "version": 1,
  "isActive": true,
  "effectiveFrom": "2026-01-01T00:00:00Z",
  "effectiveTo": null,
  "usesNegativeMarking": true,
  "negativeMarkingRule": "4Y1D",
  "defaultStandardizationMethod": 1,
  "cohortFilterJson": "{}",
  "roundingPolicyJson": "{}",
  "rulesJson": "{}",
  "createdAt": "2026-03-01T10:00:00Z",
  "updatedAt": null,
  "createdBy": "admin@example.com",
  "updatedBy": null
}
```

**Bulunamadı (404)**

```json
{
  "error": "Puanlama profili bulunamadı."
}
```

**Hata (500)**

```json
{
  "error": "Puanlama profili alınırken bir hata oluştu."
}
```

---

### 1.3 GET /api/AdminCategoryScoreProfile/by-sub/{categorySubId}

Belirli bir alt kategoriye (CategorySub) ait puanlama profillerini listeler.

**İstek (Request)**

```http
GET /api/AdminCategoryScoreProfile/by-sub/b2c3d4e5-f6a7-8901-bcde-f12345678901 HTTP/1.1
Host: localhost:5000
Authorization: Bearer <admin_jwt_token>
Accept: application/json
```

**Başarılı Yanıt (200 OK)**

```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "categorySubId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "code": "TYT_2026",
    "name": "TYT 2026 Puanlama",
    "version": 1,
    "isActive": true,
    "effectiveFrom": "2026-01-01T00:00:00Z",
    "effectiveTo": null,
    "usesNegativeMarking": true,
    "negativeMarkingRule": "4Y1D",
    "defaultStandardizationMethod": 1,
    "cohortFilterJson": "{}",
    "roundingPolicyJson": "{}",
    "rulesJson": "{}",
    "createdAt": "2026-03-01T10:00:00Z",
    "updatedAt": null,
    "createdBy": "admin@example.com",
    "updatedBy": null
  }
]
```

**Hata (500)**

```json
{
  "error": "Puanlama profilleri listelenirken bir hata oluştu."
}
```

---

### 1.4 POST /api/AdminCategoryScoreProfile/create

Yeni puanlama profili oluşturur.

**İstek (Request)**

```http
POST /api/AdminCategoryScoreProfile/create HTTP/1.1
Host: localhost:5000
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
Accept: application/json

{
  "categorySubId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "code": "AYT_2026",
  "name": "AYT 2026 Puanlama",
  "isActive": true,
  "usesNegativeMarking": true,
  "negativeMarkingRule": "4Y1D",
  "defaultStandardizationMethod": 1,
  "cohortFilterJson": "{\"validOnly\": true}",
  "roundingPolicyJson": "{\"finalDigits\": 2}",
  "rulesJson": "{\"requireSubmitted\": true}"
}
```

**Başarılı Yanıt (200 OK)**

```json
{
  "message": "Puanlama profili başarıyla oluşturuldu."
}
```

**Bad Request (400)** — Geçersiz argüman

```json
{
  "error": "CategorySub bulunamadı."
}
```

**Not Found (404)** — categorySubId geçersiz

```json
{
  "error": "İlgili CategorySub bulunamadı."
}
```

**Hata (500)**

```json
{
  "error": "Puanlama profili oluşturulurken bir hata oluştu."
}
```

---

### 1.5 PUT /api/AdminCategoryScoreProfile/{id}

Mevcut puanlama profilini günceller. DTO alanları isteğe bağlı (null = değişmez).

**İstek (Request)**

```http
PUT /api/AdminCategoryScoreProfile/a1b2c3d4-e5f6-7890-abcd-ef1234567890 HTTP/1.1
Host: localhost:5000
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
Accept: application/json

{
  "code": "TYT_2026_v2",
  "name": "TYT 2026 Puanlama (Güncel)",
  "isActive": true,
  "effectiveFrom": "2026-01-01T00:00:00Z",
  "effectiveTo": "2026-12-31T23:59:59Z",
  "usesNegativeMarking": true,
  "negativeMarkingRule": "4Y1D",
  "defaultStandardizationMethod": 2,
  "cohortFilterJson": "{}",
  "roundingPolicyJson": "{}",
  "rulesJson": "{}"
}
```

**Başarılı Yanıt (200 OK)**

```json
{
  "message": "Puanlama profili başarıyla güncellendi."
}
```

**Bulunamadı (404)**

```json
{
  "error": "Puanlama profili bulunamadı."
}
```

**Hata (500)**

```json
{
  "error": "Puanlama profili güncellenirken bir hata oluştu."
}
```

---

### 1.6 DELETE /api/AdminCategoryScoreProfile/{id}

Puanlama profilini siler.

**İstek (Request)**

```http
DELETE /api/AdminCategoryScoreProfile/a1b2c3d4-e5f6-7890-abcd-ef1234567890 HTTP/1.1
Host: localhost:5000
Authorization: Bearer <admin_jwt_token>
Accept: application/json
```

**Başarılı Yanıt (200 OK)**

```json
{
  "message": "Puanlama profili başarıyla silindi."
}
```

**Bulunamadı (404)**

```json
{
  "error": "Puanlama profili bulunamadı."
}
```

**Hata (500)**

```json
{
  "error": "Puanlama profili silinirken bir hata oluştu."
}
```

---

## 2. AdminCategoryScoreType — Puan Türü

**Base path:** `GET/POST/PUT/DELETE /api/AdminCategoryScoreType`

Puan türleri (TYT, SAY, EA, SÖZ, P93 vb.) bir puanlama profiline bağlıdır.

| Metot | Path | Açıklama |
|-------|------|----------|
| GET | `/all` | Tüm puan türlerini listeler |
| GET | `/{id}` | Id ile tek puan türü getirir |
| GET | `/by-profile/{categoryScoringProfileId}` | Profile göre puan türlerini listeler |
| POST | `/create` | Yeni puan türü oluşturur |
| PUT | `/{id}` | Puan türünü günceller |
| DELETE | `/{id}` | Puan türünü siler |

### 2.1 GET /api/AdminCategoryScoreType/all

**İstek (Request)**

```http
GET /api/AdminCategoryScoreType/all HTTP/1.1
Host: localhost:5000
Authorization: Bearer <admin_jwt_token>
Accept: application/json
```

**Başarılı Yanıt (200 OK)**

```json
[
  {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "categoryScoringProfileId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "code": "SAY",
    "name": "Sayısal",
    "baseScore": 100,
    "standardizationOverride": 1,
    "usesOBP": true,
    "obpWeight": 0.12,
    "rulesJson": "{}"
  },
  {
    "id": "d4e5f6a7-b8c9-0123-def0-234567890123",
    "categoryScoringProfileId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "code": "EA",
    "name": "Eşit Ağırlık",
    "baseScore": 100,
    "standardizationOverride": null,
    "usesOBP": true,
    "obpWeight": 0.12,
    "rulesJson": "{}"
  }
]
```

**Hata (500)**

```json
{
  "error": "Puan türleri listelenirken bir hata oluştu."
}
```

---

### 2.2 GET /api/AdminCategoryScoreType/{id}

**İstek (Request)**

```http
GET /api/AdminCategoryScoreType/c3d4e5f6-a7b8-9012-cdef-123456789012 HTTP/1.1
Host: localhost:5000
Authorization: Bearer <admin_jwt_token>
Accept: application/json
```

**Başarılı Yanıt (200 OK)**

```json
{
  "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "categoryScoringProfileId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "code": "SAY",
  "name": "Sayısal",
  "baseScore": 100,
  "standardizationOverride": 1,
  "usesOBP": true,
  "obpWeight": 0.12,
  "rulesJson": "{}"
}
```

**Bulunamadı (404)**

```json
{
  "error": "Puan türü bulunamadı."
}
```

---

### 2.3 GET /api/AdminCategoryScoreType/by-profile/{categoryScoringProfileId}

**İstek (Request)**

```http
GET /api/AdminCategoryScoreType/by-profile/a1b2c3d4-e5f6-7890-abcd-ef1234567890 HTTP/1.1
Host: localhost:5000
Authorization: Bearer <admin_jwt_token>
Accept: application/json
```

**Başarılı Yanıt (200 OK)** — Yukarıdaki gibi puan türü nesnelerinin dizisi.

**Hata (500)**

```json
{
  "error": "Puan türleri listelenirken bir hata oluştu."
}
```

---

### 2.4 POST /api/AdminCategoryScoreType/create

**İstek (Request)**

```http
POST /api/AdminCategoryScoreType/create HTTP/1.1
Host: localhost:5000
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
Accept: application/json

{
  "categoryScoringProfileId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "code": "SOZ",
  "name": "Sözel",
  "baseScore": 100,
  "standardizationOverride": null,
  "usesOBP": true,
  "obpWeight": 0.12,
  "rulesJson": "{\"minTotalNet\": 10}"
}
```

**Başarılı Yanıt (200 OK)**

```json
{
  "message": "Puan türü başarıyla oluşturuldu."
}
```

**Not Found (404)** — Geçersiz categoryScoringProfileId

```json
{
  "error": "Puanlama profili bulunamadı."
}
```

**Hata (500)**

```json
{
  "error": "Puan türü oluşturulurken bir hata oluştu."
}
```

---

### 2.5 PUT /api/AdminCategoryScoreType/{id}

**İstek (Request)**

```http
PUT /api/AdminCategoryScoreType/c3d4e5f6-a7b8-9012-cdef-123456789012 HTTP/1.1
Host: localhost:5000
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
Accept: application/json

{
  "code": "SAY",
  "name": "Sayısal (Güncel)",
  "baseScore": 120,
  "standardizationOverride": 2,
  "usesOBP": true,
  "obpWeight": 0.15,
  "rulesJson": "{}"
}
```

**Başarılı Yanıt (200 OK)**

```json
{
  "message": "Puan türü başarıyla güncellendi."
}
```

**Bulunamadı (404)**

```json
{
  "error": "Puan türü bulunamadı."
}
```

---

### 2.6 DELETE /api/AdminCategoryScoreType/{id}

**İstek (Request)**

```http
DELETE /api/AdminCategoryScoreType/c3d4e5f6-a7b8-9012-cdef-123456789012 HTTP/1.1
Host: localhost:5000
Authorization: Bearer <admin_jwt_token>
Accept: application/json
```

**Başarılı Yanıt (200 OK)**

```json
{
  "message": "Puan türü başarıyla silindi."
}
```

**Bulunamadı (404)** / **Hata (500)** — Diğer endpoint’lerdeki formatta.

---

## 3. AdminCategoryScoreTypeWeight — Puan Türü Ağırlığı

**Base path:** `GET/POST/PUT/DELETE /api/AdminCategoryScoreTypeWeight`

Puan türünün hangi sınav bölümüne (CategorySection) hangi ağırlıkla bağlanacağını yönetir. `InputType`: 0 = Net, 1 = StandardNet.

| Metot | Path | Açıklama |
|-------|------|----------|
| GET | `/all` | Tüm ağırlıkları listeler |
| GET | `/{id}` | Id ile tek ağırlık getirir |
| GET | `/by-score-type/{categoryScoreTypeId}` | Puan türüne göre ağırlıkları listeler |
| POST | `/create` | Yeni ağırlık oluşturur |
| PUT | `/{id}` | Ağırlığı günceller |
| DELETE | `/{id}` | Ağırlığı siler |

### 3.1 GET /api/AdminCategoryScoreTypeWeight/all

**İstek (Request)**

```http
GET /api/AdminCategoryScoreTypeWeight/all HTTP/1.1
Host: localhost:5000
Authorization: Bearer <admin_jwt_token>
Accept: application/json
```

**Başarılı Yanıt (200 OK)**

```json
[
  {
    "id": "e5f6a7b8-c9d0-1234-ef01-345678901234",
    "categoryScoreTypeId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "categorySectionId": "f6a7b8c9-d0e1-2345-f012-456789012345",
    "weight": 0.4,
    "inputType": 1
  },
  {
    "id": "a7b8c9d0-e1f2-3456-0123-567890123456",
    "categoryScoreTypeId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "categorySectionId": "b8c9d0e1-f2a3-4567-1234-678901234567",
    "weight": 0.6,
    "inputType": 1
  }
]
```

**Hata (500)**

```json
{
  "error": "Puan türü ağırlıkları listelenirken bir hata oluştu."
}
```

---

### 3.2 GET /api/AdminCategoryScoreTypeWeight/{id}

**İstek (Request)**

```http
GET /api/AdminCategoryScoreTypeWeight/e5f6a7b8-c9d0-1234-ef01-345678901234 HTTP/1.1
Host: localhost:5000
Authorization: Bearer <admin_jwt_token>
Accept: application/json
```

**Başarılı Yanıt (200 OK)**

```json
{
  "id": "e5f6a7b8-c9d0-1234-ef01-345678901234",
  "categoryScoreTypeId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "categorySectionId": "f6a7b8c9-d0e1-2345-f012-456789012345",
  "weight": 0.4,
  "inputType": 1
}
```

**Bulunamadı (404)**

```json
{
  "error": "Puan türü ağırlığı bulunamadı."
}
```

---

### 3.3 GET /api/AdminCategoryScoreTypeWeight/by-score-type/{categoryScoreTypeId}

**İstek (Request)**

```http
GET /api/AdminCategoryScoreTypeWeight/by-score-type/c3d4e5f6-a7b8-9012-cdef-123456789012 HTTP/1.1
Host: localhost:5000
Authorization: Bearer <admin_jwt_token>
Accept: application/json
```

**Başarılı Yanıt (200 OK)** — İlgili ağırlık kayıtlarının dizisi (yukarıdaki formatta).

**Hata (500)**

```json
{
  "error": "Puan türü ağırlıkları listelenirken bir hata oluştu."
}
```

---

### 3.4 POST /api/AdminCategoryScoreTypeWeight/create

**İstek (Request)**

```http
POST /api/AdminCategoryScoreTypeWeight/create HTTP/1.1
Host: localhost:5000
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
Accept: application/json

{
  "categoryScoreTypeId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "categorySectionId": "f6a7b8c9-d0e1-2345-f012-456789012345",
  "weight": 0.5,
  "inputType": 1
}
```

**Başarılı Yanıt (200 OK)**

```json
{
  "message": "Puan türü ağırlığı başarıyla oluşturuldu."
}
```

**Not Found (404)** — Geçersiz categoryScoreTypeId veya categorySectionId

```json
{
  "error": "İlgili puan türü veya bölüm bulunamadı."
}
```

**Hata (500)**

```json
{
  "error": "Puan türü ağırlığı oluşturulurken bir hata oluştu."
}
```

---

### 3.5 PUT /api/AdminCategoryScoreTypeWeight/{id}

**İstek (Request)**

```http
PUT /api/AdminCategoryScoreTypeWeight/e5f6a7b8-c9d0-1234-ef01-345678901234 HTTP/1.1
Host: localhost:5000
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
Accept: application/json

{
  "weight": 0.45,
  "inputType": 0
}
```

**Başarılı Yanıt (200 OK)**

```json
{
  "message": "Puan türü ağırlığı başarıyla güncellendi."
}
```

**Bulunamadı (404)**

```json
{
  "error": "Puan türü ağırlığı bulunamadı."
}
```

---

### 3.6 DELETE /api/AdminCategoryScoreTypeWeight/{id}

**İstek (Request)**

```http
DELETE /api/AdminCategoryScoreTypeWeight/e5f6a7b8-c9d0-1234-ef01-345678901234 HTTP/1.1
Host: localhost:5000
Authorization: Bearer <admin_jwt_token>
Accept: application/json
```

**Başarılı Yanıt (200 OK)**

```json
{
  "message": "Puan türü ağırlığı başarıyla silindi."
}
```

**Bulunamadı (404)** / **Hata (500)** — Diğer endpoint’lerdeki formatta.

---

## Özet Tablo

| Controller | Endpoint sayısı | Amaç |
|------------|-----------------|------|
| AdminCategoryScoreProfile | 6 | Puanlama profili CRUD + listeleme |
| AdminCategoryScoreType | 6 | Puan türü CRUD + listeleme |
| AdminCategoryScoreTypeWeight | 6 | Puan türü – bölüm ağırlığı CRUD + listeleme |

**Ortak kurallar**

- Tüm isteklerde `Authorization: Bearer <token>` gerekir.
- Content-Type: `application/json` (body kullanan isteklerde).
- Başarılı işlemlerde Create/Update/Delete için `{ "message": "..." }`, liste/detay için ilgili DTO veya DTO dizisi döner.
- Hata yanıtları `{ "error": "..." }` formatındadır; 400/404/500 durum kodları kullanılır.

Bu rapor, Swagger/OpenAPI ile birlikte kullanılarak entegrasyon ve test süreçlerinde referans olarak kullanılabilir.
