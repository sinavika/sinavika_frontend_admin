# API Categories/Score Controllers — Detaylı Rapor

Bu doküman, `API/Controllers/Categories/Score/` altındaki admin puanlama (scoring) controller'larını, endpoint'leri ve ilgili DTO'ları örnek gidiş-dönüş body'leriyle açıklar.

**Genel bilgiler**
- **Yetkilendirme:** Tüm endpoint'ler `[Authorize]` ile korunur; geçerli JWT/Bearer token gerekir.
- **Swagger grubu:** `admin`
- **Base URL:** Örneklerde `https://api.example.com` kullanılmıştır; proje base URL'inizle değiştirin.

---

## İçindekiler

1. [AdminCategoryScoreProfileController](#1-admincategoryscoreprofilecontroller)
2. [AdminCategoryScoreTypeController](#2-admincategoryscoretypecontroller)
3. [AdminCategoryScoreTypeWeightController](#3-admincategoryscoretypeweightcontroller)
4. [AdminCategoryScoringFormulaComponentController](#4-admincategoryscoringformulacomponentcontroller)
5. [AdminCategoryScoringTypeRequirementController](#5-admincategoryscoringtyperequirementcontroller)
6. [Ortak hata yanıtları](#6-ortak-hata-yanıtları)

---

## 1. AdminCategoryScoreProfileController

**Amaç:** Alt kategori (CategorySub) puanlama profili (CategoryScoringProfile) CRUD. Profil, TYT/AYT/KPSS Önlisans gibi alt kategoriler için puanlama kurallarını (negatif puan, standartlaştırma, geçerlilik tarihleri) tanımlar.

**Base route:** `GET/POST/PUT/DELETE /api/AdminCategoryScoreProfile`

| Metot | Endpoint | Açıklama |
|-------|----------|----------|
| GET | `/api/AdminCategoryScoreProfile/all` | Tüm profilleri listele |
| GET | `/api/AdminCategoryScoreProfile/{id}` | Id ile tek profil getir |
| GET | `/api/AdminCategoryScoreProfile/by-sub/{categorySubId}` | Alt kategoriye göre profilleri getir |
| POST | `/api/AdminCategoryScoreProfile/create` | Yeni profil oluştur |
| PUT | `/api/AdminCategoryScoreProfile/{id}` | Profil güncelle |
| DELETE | `/api/AdminCategoryScoreProfile/{id}` | Profil sil |

### 1.1 GET /api/AdminCategoryScoreProfile/all

**Response (200):** `CategoryScoringProfileDto[]`

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "categorySubId": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
    "code": "TYT-2024",
    "name": "TYT Puanlama Profili 2024",
    "version": 1,
    "isActive": true,
    "effectiveFrom": "2024-01-01T00:00:00Z",
    "effectiveTo": null,
    "usesNegativeMarking": true,
    "negativeMarkingRule": "4Yanlis1Dogru",
    "defaultStandardizationMethod": 1,
    "cohortFilterJson": "{}",
    "roundingPolicyJson": "{}",
    "rulesJson": "{}",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": null,
    "createdBy": null,
    "updatedBy": null
  }
]
```

**Not:** `defaultStandardizationMethod`: 0=None, 1=ZScore, 2=TScore.

---

### 1.2 GET /api/AdminCategoryScoreProfile/{id}

**Parametre:** `id` (Guid, route)

**Response (200):** Tek `CategoryScoringProfileDto` (yukarıdaki nesnenin tek elemanı).

**Response (404):**

```json
{ "error": "Puanlama profili bulunamadı." }
```

---

### 1.3 GET /api/AdminCategoryScoreProfile/by-sub/{categorySubId}

**Parametre:** `categorySubId` (Guid, route)

**Response (200):** `CategoryScoringProfileDto[]` (ilgili alt kategorinin tüm profilleri; örnek yapı 1.1 ile aynı).

---

### 1.4 POST /api/AdminCategoryScoreProfile/create

**Request body:** `CategoryScoringProfileCreateDto`

```json
{
  "categorySubId": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
  "code": "TYT-2024",
  "name": "TYT Puanlama Profili 2024",
  "isActive": true,
  "usesNegativeMarking": true,
  "negativeMarkingRule": "4Yanlis1Dogru",
  "defaultStandardizationMethod": 1,
  "cohortFilterJson": "{}",
  "roundingPolicyJson": "{}",
  "rulesJson": "{}"
}
```

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| categorySubId | Guid | Evet | Alt kategori Id |
| code | string | Evet | Profil kodu |
| name | string | Evet | Profil adı |
| isActive | bool | Hayır | Varsayılan true |
| usesNegativeMarking | bool | Evet | Negatif puan kullanılsın mı |
| negativeMarkingRule | string | Evet | Kural metni |
| defaultStandardizationMethod | int | Evet | 0/1/2 |
| cohortFilterJson | string | Hayır | JSON |
| roundingPolicyJson | string | Hayır | JSON |
| rulesJson | string | Hayır | JSON |

**Response (200):**

```json
{ "message": "Puanlama profili başarıyla oluşturuldu." }
```

**Response (404):** Alt kategori yoksa `{ "error": "Alt kategori bulunamadı. Id: ..." }`  
**Response (400):** Geçersiz işlem/argüman için `{ "error": "..." }`

---

### 1.5 PUT /api/AdminCategoryScoreProfile/{id}

**Parametre:** `id` (Guid, route)

**Request body:** `CategoryScoringProfileUpdateDto` (tüm alanlar opsiyonel; gönderilen alanlar güncellenir)

```json
{
  "code": "TYT-2024-v2",
  "name": "TYT Puanlama Profili 2024 Güncel",
  "isActive": true,
  "effectiveFrom": "2024-06-01T00:00:00Z",
  "effectiveTo": "2025-05-31T23:59:59Z",
  "usesNegativeMarking": true,
  "negativeMarkingRule": "4Yanlis1Dogru",
  "defaultStandardizationMethod": 2,
  "cohortFilterJson": "{}",
  "roundingPolicyJson": "{}",
  "rulesJson": "{}"
}
```

**Response (200):**

```json
{ "message": "Puanlama profili başarıyla güncellendi." }
```

**Response (404):** `{ "error": "Puanlama profili bulunamadı." }`

---

### 1.6 DELETE /api/AdminCategoryScoreProfile/{id}

**Parametre:** `id` (Guid, route)

**Response (200):**

```json
{ "message": "Puanlama profili başarıyla silindi." }
```

**Response (404):** `{ "error": "Puanlama profili bulunamadı." }`

---

## 2. AdminCategoryScoreTypeController

**Amaç:** Puan türü (CategoryScoringType) CRUD — TYT, SAY, EA, P93 vb. Bir profile bağlı puan türlerini yönetir.

**Base route:** `/api/AdminCategoryScoreType`

| Metot | Endpoint | Açıklama |
|-------|----------|----------|
| GET | `/api/AdminCategoryScoreType/all` | Tüm puan türlerini listele |
| GET | `/api/AdminCategoryScoreType/{id}` | Id ile tek puan türü getir |
| GET | `/api/AdminCategoryScoreType/by-profile/{categoryScoringProfileId}` | Profile göre puan türlerini getir |
| POST | `/api/AdminCategoryScoreType/create` | Yeni puan türü oluştur |
| PUT | `/api/AdminCategoryScoreType/{id}` | Puan türü güncelle |
| DELETE | `/api/AdminCategoryScoreType/{id}` | Puan türü sil |

### 2.1 GET /api/AdminCategoryScoreType/all

**Response (200):** `CategoryScoreTypeDto[]`

```json
[
  {
    "id": "5fa85f64-5717-4562-b3fc-2c963f66afa8",
    "categoryScoringProfileId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "code": "SAY",
    "name": "Sayısal",
    "baseScore": 100,
    "standardizationOverride": 1,
    "usesOBP": true,
    "obpWeight": 0.12,
    "rulesJson": "{}"
  }
]
```

**Not:** `standardizationOverride`: null=profil default, 0=None, 1=ZScore, 2=TScore.

---

### 2.2 GET /api/AdminCategoryScoreType/{id}

**Response (200):** Tek `CategoryScoreTypeDto`.  
**Response (404):** `{ "error": "Puan türü bulunamadı." }`

---

### 2.3 GET /api/AdminCategoryScoreType/by-profile/{categoryScoringProfileId}

**Parametre:** `categoryScoringProfileId` (Guid, route)

**Response (200):** `CategoryScoreTypeDto[]` (yapı 2.1 ile aynı).

---

### 2.4 POST /api/AdminCategoryScoreType/create

**Request body:** `CategoryScoreTypeCreateDto`

```json
{
  "categoryScoringProfileId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "code": "EA",
  "name": "Eşit Ağırlık",
  "baseScore": 100,
  "standardizationOverride": 1,
  "usesOBP": true,
  "obpWeight": 0.12,
  "rulesJson": "{}"
}
```

**Response (200):** `{ "message": "Puan türü başarıyla oluşturuldu." }`  
**Response (404):** Profil yoksa `{ "error": "Puanlama profili bulunamadı. Id: ..." }`

---

### 2.5 PUT /api/AdminCategoryScoreType/{id}

**Request body:** `CategoryScoreTypeUpdateDto` (tüm alanlar opsiyonel)

```json
{
  "code": "EA-V2",
  "name": "Eşit Ağırlık (güncel)",
  "baseScore": 100,
  "standardizationOverride": 2,
  "usesOBP": true,
  "obpWeight": 0.15,
  "rulesJson": "{}"
}
```

**Response (200):** `{ "message": "Puan türü başarıyla güncellendi." }`  
**Response (404):** `{ "error": "Puan türü bulunamadı." }`

---

### 2.6 DELETE /api/AdminCategoryScoreType/{id}

**Response (200):** `{ "message": "Puan türü başarıyla silindi." }`  
**Response (404):** `{ "error": "Puan türü bulunamadı." }`

---

## 3. AdminCategoryScoreTypeWeightController

**Amaç:** Puan türü ağırlığı (CategoryScoringTypeWeight) CRUD — bir puan türünün bölümlere (CategorySection) göre ağırlıklarını tanımlar.

**Base route:** `/api/AdminCategoryScoreTypeWeight`

| Metot | Endpoint | Açıklama |
|-------|----------|----------|
| GET | `/api/AdminCategoryScoreTypeWeight/all` | Tüm ağırlıkları listele |
| GET | `/api/AdminCategoryScoreTypeWeight/{id}` | Id ile tek ağırlık getir |
| GET | `/api/AdminCategoryScoreTypeWeight/by-score-type/{categoryScoreTypeId}` | Puan türüne göre ağırlıkları getir |
| POST | `/api/AdminCategoryScoreTypeWeight/create` | Yeni ağırlık oluştur |
| PUT | `/api/AdminCategoryScoreTypeWeight/{id}` | Ağırlık güncelle |
| DELETE | `/api/AdminCategoryScoreTypeWeight/{id}` | Ağırlık sil |

### 3.1 GET /api/AdminCategoryScoreTypeWeight/all

**Response (200):** `CategoryScoreTypeWeightDto[]`

```json
[
  {
    "id": "6fa85f64-5717-4562-b3fc-2c963f66afa9",
    "categoryScoreTypeId": "5fa85f64-5717-4562-b3fc-2c963f66afa8",
    "categorySectionId": "7fa85f64-5717-4562-b3fc-2c963f66afb0",
    "weight": 3.0,
    "inputType": 1
  }
]
```

**Not:** `inputType`: 0=Net, 1=StandardNet.

---

### 3.2 GET /api/AdminCategoryScoreTypeWeight/{id}

**Response (200):** Tek `CategoryScoreTypeWeightDto`.  
**Response (404):** `{ "error": "Puan türü ağırlığı bulunamadı." }`

---

### 3.3 GET /api/AdminCategoryScoreTypeWeight/by-score-type/{categoryScoreTypeId}

**Parametre:** `categoryScoreTypeId` (Guid, route)

**Response (200):** `CategoryScoreTypeWeightDto[]` (yapı 3.1 ile aynı).

---

### 3.4 POST /api/AdminCategoryScoreTypeWeight/create

**Request body:** `CategoryScoreTypeWeightCreateDto`

```json
{
  "categoryScoreTypeId": "5fa85f64-5717-4562-b3fc-2c963f66afa8",
  "categorySectionId": "7fa85f64-5717-4562-b3fc-2c963f66afb0",
  "weight": 3.0,
  "inputType": 1
}
```

**Response (200):** `{ "message": "Puan türü ağırlığı başarıyla oluşturuldu." }`  
**Response (404):** Puan türü veya bölüm yoksa `{ "error": "Puan türü bulunamadı. Id: ..." }` veya `{ "error": "Bölüm bulunamadı. Id: ..." }`

---

### 3.5 PUT /api/AdminCategoryScoreTypeWeight/{id}

**Request body:** `CategoryScoreTypeWeightUpdateDto` (opsiyonel)

```json
{
  "weight": 3.5,
  "inputType": 0
}
```

**Response (200):** `{ "message": "Puan türü ağırlığı başarıyla güncellendi." }`  
**Response (404):** `{ "error": "Puan türü ağırlığı bulunamadı." }`

---

### 3.6 DELETE /api/AdminCategoryScoreTypeWeight/{id}

**Response (200):** `{ "message": "Puan türü ağırlığı başarıyla silindi." }`  
**Response (404):** `{ "error": "Puan türü ağırlığı bulunamadı." }`

---

## 4. AdminCategoryScoringFormulaComponentController

**Amaç:** Puan türü formül bileşeni (CategoryScoringFormulaComponent) CRUD — puan türünün hesaplama formülündeki kaynak ve ağırlıkları yönetir.

**Base route:** `/api/AdminCategoryScoringFormulaComponent`

| Metot | Endpoint | Açıklama |
|-------|----------|----------|
| GET | `/api/AdminCategoryScoringFormulaComponent/all` | Tüm formül bileşenlerini listele |
| GET | `/api/AdminCategoryScoringFormulaComponent/{id}` | Id ile tek bileşen getir |
| GET | `/api/AdminCategoryScoringFormulaComponent/by-score-type/{categoryScoreTypeId}` | Puan türüne göre bileşenleri getir |
| POST | `/api/AdminCategoryScoringFormulaComponent/create` | Yeni bileşen oluştur |
| PUT | `/api/AdminCategoryScoringFormulaComponent/{id}` | Bileşen güncelle |
| DELETE | `/api/AdminCategoryScoringFormulaComponent/{id}` | Bileşen sil |

### 4.1 GET /api/AdminCategoryScoringFormulaComponent/all

**Response (200):** `CategoryScoringFormulaComponentDto[]`

```json
[
  {
    "id": "8fa85f64-5717-4562-b3fc-2c963f66afb1",
    "categoryScoreTypeId": "5fa85f64-5717-4562-b3fc-2c963f66afa8",
    "sourceCode": "MAT",
    "sourceName": "Matematik Net",
    "weight": 3.0,
    "orderIndex": 1,
    "createdAt": "2024-01-20T12:00:00Z",
    "updatedAt": null
  }
]
```

---

### 4.2 GET /api/AdminCategoryScoringFormulaComponent/{id}

**Response (200):** Tek `CategoryScoringFormulaComponentDto`.  
**Response (404):** `{ "error": "Formül bileşeni bulunamadı." }`

---

### 4.3 GET /api/AdminCategoryScoringFormulaComponent/by-score-type/{categoryScoreTypeId}

**Parametre:** `categoryScoreTypeId` (Guid, route)

**Response (200):** `CategoryScoringFormulaComponentDto[]` (yapı 4.1 ile aynı).

---

### 4.4 POST /api/AdminCategoryScoringFormulaComponent/create

**Request body:** `CategoryScoringFormulaComponentCreateDto`

```json
{
  "categoryScoreTypeId": "5fa85f64-5717-4562-b3fc-2c963f66afa8",
  "sourceCode": "FEN",
  "sourceName": "Fen Net",
  "weight": 3.0,
  "orderIndex": 2
}
```

**Response (200):** `{ "message": "Formül bileşeni başarıyla oluşturuldu." }`  
**Response (404):** Puan türü yoksa `{ "error": "Puan türü bulunamadı. Id: ..." }`

---

### 4.5 PUT /api/AdminCategoryScoringFormulaComponent/{id}

**Request body:** `CategoryScoringFormulaComponentUpdateDto` (opsiyonel)

```json
{
  "sourceCode": "FEN-B",
  "sourceName": "Fen Bilimleri Net",
  "weight": 3.2,
  "orderIndex": 3
}
```

**Response (200):** `{ "message": "Formül bileşeni başarıyla güncellendi." }`  
**Response (404):** `{ "error": "Formül bileşeni bulunamadı." }`

---

### 4.6 DELETE /api/AdminCategoryScoringFormulaComponent/{id}

**Response (200):** `{ "message": "Formül bileşeni başarıyla silindi." }`  
**Response (404):** `{ "error": "Formül bileşeni bulunamadı." }`

---

## 5. AdminCategoryScoringTypeRequirementController

**Amaç:** Puan türü minimum koşul (CategoryScoringTypeRequirement) CRUD — bir puan türünün hesaplanabilmesi için sağlanması gereken minimum ham puan/net koşullarını tanımlar.

**Base route:** `/api/AdminCategoryScoringTypeRequirement`

| Metot | Endpoint | Açıklama |
|-------|----------|----------|
| GET | `/api/AdminCategoryScoringTypeRequirement/all` | Tüm koşulları listele |
| GET | `/api/AdminCategoryScoringTypeRequirement/{id}` | Id ile tek koşul getir |
| GET | `/api/AdminCategoryScoringTypeRequirement/by-score-type/{categoryScoreTypeId}` | Puan türüne göre koşulları getir |
| POST | `/api/AdminCategoryScoringTypeRequirement/create` | Yeni koşul oluştur |
| PUT | `/api/AdminCategoryScoringTypeRequirement/{id}` | Koşul güncelle |
| DELETE | `/api/AdminCategoryScoringTypeRequirement/{id}` | Koşul sil |

### 5.1 GET /api/AdminCategoryScoringTypeRequirement/all

**Response (200):** `CategoryScoringTypeRequirementDto[]`

```json
[
  {
    "id": "9fa85f64-5717-4562-b3fc-2c963f66afb2",
    "categoryScoreTypeId": "5fa85f64-5717-4562-b3fc-2c963f66afa8",
    "requirementGroupCode": "MIN_TYT",
    "matchType": 0,
    "sourceCode": "TYT_TR",
    "sourceName": "TYT Türkçe",
    "minimumValue": 0.5,
    "orderIndex": 1,
    "createdAt": "2024-01-22T14:00:00Z",
    "updatedAt": null
  }
]
```

**Not:** `matchType`: 0=All (gruptaki tüm koşullar sağlanmalı), 1=Any (en az biri sağlanmalı).

---

### 5.2 GET /api/AdminCategoryScoringTypeRequirement/{id}

**Response (200):** Tek `CategoryScoringTypeRequirementDto`.  
**Response (404):** `{ "error": "Puan türü koşulu bulunamadı." }`

---

### 5.3 GET /api/AdminCategoryScoringTypeRequirement/by-score-type/{categoryScoreTypeId}

**Parametre:** `categoryScoreTypeId` (Guid, route)

**Response (200):** `CategoryScoringTypeRequirementDto[]` (yapı 5.1 ile aynı).

---

### 5.4 POST /api/AdminCategoryScoringTypeRequirement/create

**Request body:** `CategoryScoringTypeRequirementCreateDto`

```json
{
  "categoryScoreTypeId": "5fa85f64-5717-4562-b3fc-2c963f66afa8",
  "requirementGroupCode": "MIN_TYT",
  "matchType": 0,
  "sourceCode": "TYT_MAT",
  "sourceName": "TYT Matematik",
  "minimumValue": 0.5,
  "orderIndex": 2
}
```

**Response (200):** `{ "message": "Puan türü koşulu başarıyla oluşturuldu." }`  
**Response (404):** Puan türü yoksa `{ "error": "Puan türü bulunamadı. Id: ..." }`

---

### 5.5 PUT /api/AdminCategoryScoringTypeRequirement/{id}

**Request body:** `CategoryScoringTypeRequirementUpdateDto` (opsiyonel)

```json
{
  "requirementGroupCode": "MIN_TYT_V2",
  "matchType": 1,
  "sourceCode": "TYT_MAT",
  "sourceName": "TYT Matematik Net",
  "minimumValue": 1.0,
  "orderIndex": 1
}
```

**Response (200):** `{ "message": "Puan türü koşulu başarıyla güncellendi." }`  
**Response (404):** `{ "error": "Puan türü koşulu bulunamadı." }`

---

### 5.6 DELETE /api/AdminCategoryScoringTypeRequirement/{id}

**Response (200):** `{ "message": "Puan türü koşulu başarıyla silindi." }`  
**Response (404):** `{ "error": "Puan türü koşulu bulunamadı." }`

---

## 6. Ortak hata yanıtları

Tüm controller’larda aşağıdaki durumlar kullanılır:

| HTTP | Durum | Body örneği |
|------|--------|-------------|
| 401 | Yetkisiz (token yok/geçersiz) | — |
| 404 | Kayıt bulunamadı / İlişkili kayıt yok | `{ "error": "..." }` |
| 400 | Bad request (validasyon / iş kuralı) | `{ "error": "..." }` |
| 500 | Sunucu hatası | `{ "error": "İlgili Türkçe hata mesajı." }` |

Başarılı create/update/delete cevaplarında mesaj her zaman `message` alanında döner:

```json
{ "message": "İşlem açıklaması başarıyla yapıldı." }
```

---

## Özet tablo: Controller → Base route

| Controller | Base route |
|------------|------------|
| AdminCategoryScoreProfileController | `/api/AdminCategoryScoreProfile` |
| AdminCategoryScoreTypeController | `/api/AdminCategoryScoreType` |
| AdminCategoryScoreTypeWeightController | `/api/AdminCategoryScoreTypeWeight` |
| AdminCategoryScoringFormulaComponentController | `/api/AdminCategoryScoringFormulaComponent` |
| AdminCategoryScoringTypeRequirementController | `/api/AdminCategoryScoringTypeRequirement` |

---

## DTO referansı (namespace: Data.Dtos.Categories)

| DTO | Kullanım |
|-----|----------|
| CategoryScoringProfileDto | Profil listeleme / detay response |
| CategoryScoringProfileCreateDto | Profil oluşturma request |
| CategoryScoringProfileUpdateDto | Profil güncelleme request |
| CategoryScoreTypeDto | Puan türü listeleme / detay response |
| CategoryScoreTypeCreateDto | Puan türü oluşturma request |
| CategoryScoreTypeUpdateDto | Puan türü güncelleme request |
| CategoryScoreTypeWeightDto | Ağırlık listeleme / detay response |
| CategoryScoreTypeWeightCreateDto | Ağırlık oluşturma request |
| CategoryScoreTypeWeightUpdateDto | Ağırlık güncelleme request |
| CategoryScoringFormulaComponentDto | Formül bileşeni listeleme / detay response |
| CategoryScoringFormulaComponentCreateDto | Formül bileşeni oluşturma request |
| CategoryScoringFormulaComponentUpdateDto | Formül bileşeni güncelleme request |
| CategoryScoringTypeRequirementDto | Koşul listeleme / detay response |
| CategoryScoringTypeRequirementCreateDto | Koşul oluşturma request |
| CategoryScoringTypeRequirementUpdateDto | Koşul güncelleme request |

---

*Rapor oluşturulma tarihi: API/Controllers/Categories/Score controller ve Data.Dtos.Categories DTO’larına göre hazırlanmıştır.*
