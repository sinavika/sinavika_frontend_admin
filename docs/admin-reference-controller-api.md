# AdminReferenceController — API Gidiş-Dönüş Raporu

Bu doküman, **AdminReferenceController** (`/api/AdminReference`) altındaki tüm endpoint'ler için örnek **istek (request)** ve **cevap (response)** formatlarını içerir. Tüm endpoint'ler **Admin yetkisi** gerektirir; `Authorization: Bearer <admin_jwt>` header'ı zorunludur.

**Base URL örneği:** `https://api.example.com/api/AdminReference`

---

## İçindekiler

1. [Başvurular (Applications)](#1-başvurular-applications)
2. [Referans Kullanıcıları (Reference Users)](#2-referans-kullanıcıları-reference-users)
3. [Kampanyalar (Campaigns)](#3-kampanyalar-campaigns)
4. [Komisyonlar (Commissions)](#4-komisyonlar-commissions)
5. [Hakedişler (Payouts)](#5-hakedişler-payouts)
6. [Finans Hareketleri / Ekstre (Ledger)](#6-finans-hareketleri--ekstre-ledger)
7. [Ortak Enum Değerleri](#7-ortak-enum-değerleri)
8. [Hata Cevapları](#8-hata-cevapları)

---

## 1. Başvurular (Applications)

### 1.1 Tüm başvuruları listele

**GET** `/api/AdminReference/applications`

**Headers:**
```http
Authorization: Bearer <admin_jwt>
Accept: application/json
```

**Query parametreleri:** Yok.

**Örnek istek:**
```http
GET /api/AdminReference/applications HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
```

**Örnek başarı cevabı (200 OK):**
```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Ayşe",
    "surname": "Yılmaz",
    "contactPhone": "+905551234567",
    "email": "ayse.yilmaz@example.com",
    "instagram": "@ayseyilmaz",
    "tiktok": null,
    "youtube": null,
    "x": null,
    "status": 0,
    "generatedCode": null,
    "commissionRatePercent": null,
    "referralBaseUrl": null,
    "createdAt": "2025-03-01T10:00:00Z",
    "processedAt": null,
    "processedByAdminId": null,
    "paymentIban": {
      "id": "b2c3d4e5-f6a7-8901-bcde-f23456789012",
      "iban": "TR330006100519786457841326",
      "accountHolderName": "Ayşe Yılmaz",
      "bankName": "Ziraat Bankası"
    }
  },
  {
    "id": "c3d4e5f6-a7b8-9012-cdef-345678901234",
    "name": "Mehmet",
    "surname": "Kaya",
    "contactPhone": "+905559876543",
    "email": "mehmet.kaya@example.com",
    "instagram": "@mehmetkaya",
    "tiktok": null,
    "youtube": null,
    "x": null,
    "status": 1,
    "generatedCode": "ABC12XYZ",
    "commissionRatePercent": 10,
    "referralBaseUrl": "https://app.example.com",
    "createdAt": "2025-02-28T14:30:00Z",
    "processedAt": "2025-03-02T09:15:00Z",
    "processedByAdminId": "d4e5f6a7-b8c9-0123-def0-456789012345",
    "paymentIban": null
  }
]
```

| Alan | Açıklama |
|------|----------|
| `status` | 0: Pending, 1: Approved, 2: Rejected |
| `generatedCode`, `commissionRatePercent`, `referralBaseUrl`, `processedAt`, `processedByAdminId` | Onay sonrası ReferenceUser üzerinden doldurulur; onaylı başvurularda dolu |

**Hata cevabı (500):**
```json
{
  "error": "Başvurular listelenirken bir hata oluştu."
}
```

---

### 1.2 Başvuruyu onayla

**POST** `/api/AdminReference/applications/{id}/approve`

**Headers:**
```http
Authorization: Bearer <admin_jwt>
Content-Type: application/json
Accept: application/json
```

**Path parametresi:** `id` (Guid) — Onaylanacak başvurunun Id’si.

**Body (opsiyonel):** Onay parametreleri. Gönderilmezse komisyon oranı 0, base URL appsettings’ten okunur.

**Örnek istek:**
```http
POST /api/AdminReference/applications/a1b2c3d4-e5f6-7890-abcd-ef1234567890/approve HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "commissionRatePercent": 10,
  "referralBaseUrl": "https://app.example.com"
}
```

**Body alanları:**

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|--------|----------|
| `commissionRatePercent` | decimal | Hayır | Komisyon oranı (örn. 10 = %10). 0 veya boşsa 0 kabul edilir. |
| `referralBaseUrl` | string | Hayır | Referral link base URL. Boşsa appsettings’teki değer kullanılır. |

**Örnek başarı cevabı (200 OK):**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Ayşe",
  "surname": "Yılmaz",
  "contactPhone": "+905551234567",
  "email": "ayse.yilmaz@example.com",
  "instagram": "@ayseyilmaz",
  "tiktok": null,
  "youtube": null,
  "x": null,
  "status": 1,
  "generatedCode": "XY7K9M2P",
  "commissionRatePercent": 10,
  "referralBaseUrl": "https://app.example.com",
  "createdAt": "2025-03-01T10:00:00Z",
  "processedAt": "2025-03-09T12:00:00Z",
  "processedByAdminId": "d4e5f6a7-b8c9-0123-def0-456789012345",
  "paymentIban": {
    "id": "b2c3d4e5-f6a7-8901-bcde-f23456789012",
    "iban": "TR330006100519786457841326",
    "accountHolderName": "Ayşe Yılmaz",
    "bankName": "Ziraat Bankası"
  }
}
```

Onay sonrası başvuru sahibine benzersiz kod ve referral URL e-posta ile gönderilir.

**Başvuru bulunamadı (404):**
```json
{
  "error": "Başvuru bulunamadı."
}
```

**Sunucu hatası (500):**
```json
{
  "error": "Başvuru onaylanırken bir hata oluştu."
}
```

---

## 2. Referans Kullanıcıları (Reference Users)

### 2.1 Tüm referans kullanıcılarını listele

Onaylanmış başvurulardan türetilen **ReferenceUser** kayıtlarını döner (kod, komisyon oranı, onay bilgileri burada).

**GET** `/api/AdminReference/reference-users`

**Headers:**
```http
Authorization: Bearer <admin_jwt>
Accept: application/json
```

**Örnek istek:**
```http
GET /api/AdminReference/reference-users HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
```

**Örnek başarı cevabı (200 OK):**
```json
[
  {
    "id": "e5f6a7b8-c9d0-1234-ef01-567890123456",
    "referenceApplicationId": "c3d4e5f6-a7b8-9012-cdef-345678901234",
    "name": "Mehmet",
    "surname": "Kaya",
    "email": "mehmet.kaya@example.com",
    "contactPhone": "+905559876543",
    "generatedCode": "ABC12XYZ",
    "commissionRatePercent": 10,
    "referralBaseUrl": "https://app.example.com",
    "processedAt": "2025-03-02T09:15:00Z",
    "processedByAdminId": "d4e5f6a7-b8c9-0123-def0-456789012345",
    "instagram": "@mehmetkaya",
    "tiktok": null,
    "youtube": null,
    "x": null,
    "createdAt": "2025-03-02T09:15:00Z"
  }
]
```

**Hata (500):**
```json
{
  "error": "Referans kullanıcıları listelenirken bir hata oluştu."
}
```

---

## 3. Kampanyalar (Campaigns)

### 3.1 Tüm kampanyaları listele

**GET** `/api/AdminReference/campaigns/all`

**Örnek istek:**
```http
GET /api/AdminReference/campaigns/all HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
```

**Örnek cevap (200 OK):**
```json
[
  {
    "id": "f6a7b8c9-d0e1-2345-f012-678901234567",
    "name": "2025 Referans Kampanyası",
    "isActive": true,
    "startsAt": "2025-01-01T00:00:00Z",
    "endsAt": "2025-12-31T23:59:59Z",
    "refereeDiscountType": 0,
    "refereeDiscountValue": 50.0000,
    "referrerRewardType": 1,
    "referrerRewardValue": 25.0000,
    "maxRedemptionsTotal": 1000,
    "maxRedemptionsPerCode": 50,
    "maxRedemptionsPerUser": 1,
    "createdByAdminId": "d4e5f6a7-b8c9-0123-def0-456789012345",
    "createdAt": "2024-12-15T08:00:00Z"
  }
]
```

---

### 3.2 Kampanya detayı (Id ile)

**GET** `/api/AdminReference/campaigns?id={id}`

**Query parametresi:** `id` (Guid) — Kampanya Id.

**Örnek istek:**
```http
GET /api/AdminReference/campaigns?id=f6a7b8c9-d0e1-2345-f012-678901234567 HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Örnek cevap (200 OK):** Tek bir kampanya objesi (yukarıdaki dizideki eleman gibi).

**404:**
```json
{
  "error": "Kampanya bulunamadı."
}
```

---

### 3.3 Kampanya oluştur

**POST** `/api/AdminReference/campaigns/create`

**Body:**
```json
{
  "name": "Yeni Referans Kampanyası",
  "isActive": true,
  "startsAt": "2025-04-01T00:00:00Z",
  "endsAt": "2025-06-30T23:59:59Z",
  "refereeDiscountType": 0,
  "refereeDiscountValue": 30.5000,
  "referrerRewardType": 1,
  "referrerRewardValue": 15.0000,
  "maxRedemptionsTotal": 500,
  "maxRedemptionsPerCode": 25,
  "maxRedemptionsPerUser": 1
}
```

**Örnek istek:**
```http
POST /api/AdminReference/campaigns/create HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Yeni Referans Kampanyası",
  "isActive": true,
  "startsAt": "2025-04-01T00:00:00Z",
  "endsAt": "2025-06-30T23:59:59Z",
  "refereeDiscountType": 0,
  "refereeDiscountValue": 30.5000,
  "referrerRewardType": 1,
  "referrerRewardValue": 15.0000,
  "maxRedemptionsTotal": 500,
  "maxRedemptionsPerCode": 25,
  "maxRedemptionsPerUser": 1
}
```

**Örnek cevap (200 OK):**
```json
{
  "message": "Kampanya oluşturuldu."
}
```

---

### 3.4 Kampanya güncelle

**PUT** `/api/AdminReference/campaigns/update?id={id}`

**Query parametresi:** `id` (Guid) — Güncellenecek kampanya Id.

**Body:** Güncellenecek alanlar (hepsi opsiyonel).
```json
{
  "name": "Güncel Kampanya Adı",
  "isActive": false,
  "endsAt": "2025-05-31T23:59:59Z",
  "referrerRewardValue": 20.0000
}
```

**Örnek istek:**
```http
PUT /api/AdminReference/campaigns/update?id=f6a7b8c9-d0e1-2345-f012-678901234567 HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Güncel Kampanya Adı",
  "isActive": false
}
```

**Örnek cevap (200 OK):**
```json
{
  "message": "Kampanya güncellendi."
}
```

**404:** `"error": "Kampanya bulunamadı."`

---

### 3.5 Kampanya sil

**DELETE** `/api/AdminReference/campaigns/delete?id={id}`

**Query parametresi:** `id` (Guid).

**Örnek istek:**
```http
DELETE /api/AdminReference/campaigns/delete?id=f6a7b8c9-d0e1-2345-f012-678901234567 HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Örnek cevap (200 OK):**
```json
{
  "message": "Kampanya silindi."
}
```

**404:** `"error": "Kampanya bulunamadı."`

---

## 4. Komisyonlar (Commissions)

### 4.1 Komisyon listesi

**GET** `/api/AdminReference/commissions`

**Query parametreleri:**

| Parametre | Tip | Zorunlu | Açıklama |
|-----------|-----|--------|----------|
| `applicationId` | Guid | Hayır | Sadece bu başvuruya ait ReferenceUser’ın komisyonları (başvuru Id’si). |
| `fromUtc` | DateTime | Hayır | Oluşturulma tarihi bu tarihten sonra. |
| `toUtc` | DateTime | Hayır | Oluşturulma tarihi bu tarihten önce. |
| `status` | int | Hayır | Komisyon durumu: 0 Pending, 1 Approved, 2 Paid, 3 Cancelled. |

**Örnek istek (tüm komisyonlar):**
```http
GET /api/AdminReference/commissions HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
```

**Örnek istek (filtreli):**
```http
GET /api/AdminReference/commissions?applicationId=c3d4e5f6-a7b8-9012-cdef-345678901234&fromUtc=2025-03-01T00:00:00Z&toUtc=2025-03-31T23:59:59Z&status=0 HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
```

**Örnek cevap (200 OK):**
```json
[
  {
    "id": "a7b8c9d0-e1f2-3456-0123-789012345678",
    "referenceUserId": "e5f6a7b8-c9d0-1234-ef01-567890123456",
    "referenceCodeId": "b8c9d0e1-f2a3-4567-1234-890123456789",
    "code": "ABC12XYZ",
    "sourceType": 0,
    "sourceId": "c9d0e1f2-a3b4-5678-2345-901234567890",
    "refereeStudentUserId": "d0e1f2a3-b4c5-6789-3456-012345678901",
    "refereeName": "Zeynep Demir",
    "commissionRatePercent": 10,
    "transactionAmount": 299.9900,
    "commissionAmount": 30.00,
    "currency": "TRY",
    "status": 0,
    "createdAt": "2025-03-05T11:20:00Z",
    "paidAt": null
  }
]
```

| Alan | Açıklama |
|------|----------|
| `sourceType` | 0: SubscriptionPurchase, 1: SubscriptionRenewal, 2: Order |
| `status` | 0: Pending, 1: Approved, 2: Paid, 3: Cancelled |

**Hata (500):**
```json
{
  "error": "Komisyonlar listelenirken bir hata oluştu."
}
```

---

## 5. Hakedişler (Payouts)

### 5.1 Hakediş listesi

**GET** `/api/AdminReference/payouts`

**Query parametreleri:**

| Parametre | Tip | Zorunlu | Açıklama |
|-----------|-----|--------|----------|
| `applicationId` | Guid | Hayır | Sadece bu başvuruya ait ReferenceUser’ın hakedişleri. |
| `status` | int | Hayır | 0 Pending, 1 Completed, 2 Failed, 3 Cancelled. |

**Örnek istek:**
```http
GET /api/AdminReference/payouts HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
```

**Örnek istek (filtreli):**
```http
GET /api/AdminReference/payouts?applicationId=c3d4e5f6-a7b8-9012-cdef-345678901234&status=1 HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
```

**Örnek cevap (200 OK):**
```json
[
  {
    "id": "e1f2a3b4-c5d6-7890-4567-123456789012",
    "referenceUserId": "e5f6a7b8-c9d0-1234-ef01-567890123456",
    "amount": 150.5000,
    "currency": "TRY",
    "status": 1,
    "paymentMethod": "Banka Havalesi",
    "ibanSnapshot": "TR33***1326",
    "paidAt": "2025-03-10T14:00:00Z",
    "externalPaymentRef": "PAY-2025-001234",
    "createdAt": "2025-03-08T10:00:00Z"
  }
]
```

**Hata (500):**
```json
{
  "error": "Hakedişler listelenirken bir hata oluştu."
}
```

---

## 6. Finans Hareketleri / Ekstre (Ledger)

### 6.1 Başvuruya göre finans hareketleri (ekstre)

Belirtilen **başvuru Id’si**ne ait ReferenceUser’ın ekstre kayıtları döner.

**GET** `/api/AdminReference/applications/{id}/ledger`

**Path parametresi:** `id` (Guid) — ReferenceApplication Id (onaylı başvuru; ilişkili ReferenceUser üzerinden ledger çekilir).

**Query parametreleri:**

| Parametre | Tip | Zorunlu | Açıklama |
|-----------|-----|--------|----------|
| `fromUtc` | DateTime | Hayır | Hareket tarihi bu tarihten sonra. |
| `toUtc` | DateTime | Hayır | Hareket tarihi bu tarihten önce. |

**Örnek istek:**
```http
GET /api/AdminReference/applications/c3d4e5f6-a7b8-9012-cdef-345678901234/ledger?fromUtc=2025-03-01T00:00:00Z&toUtc=2025-03-31T23:59:59Z HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
```

**Örnek cevap (200 OK):**
```json
[
  {
    "id": "f2a3b4c5-d6e7-8901-5678-234567890123",
    "referenceUserId": "e5f6a7b8-c9d0-1234-ef01-567890123456",
    "entryType": 0,
    "amount": 30.0000,
    "currency": "TRY",
    "balanceAfter": null,
    "relatedCommissionId": "a7b8c9d0-e1f2-3456-0123-789012345678",
    "relatedPayoutId": null,
    "description": "Komisyon: SubscriptionPurchase, Payment c9d0e1f2-...",
    "createdAt": "2025-03-05T11:20:00Z"
  },
  {
    "id": "a3b4c5d6-e7f8-9012-6789-345678901234",
    "referenceUserId": "e5f6a7b8-c9d0-1234-ef01-567890123456",
    "entryType": 1,
    "amount": -150.5000,
    "currency": "TRY",
    "balanceAfter": 0,
    "relatedCommissionId": null,
    "relatedPayoutId": "e1f2a3b4-c5d6-7890-4567-123456789012",
    "description": null,
    "createdAt": "2025-03-10T14:00:00Z"
  }
]
```

| `entryType` | Anlamı |
|-------------|--------|
| 0 | CommissionEarned |
| 1 | Payout |
| 2 | PayoutReversal |
| 3 | Adjustment |
| 4 | Refund |

**Hata (500):**
```json
{
  "error": "Finans hareketleri listelenirken bir hata oluştu."
}
```

---

## 7. Ortak Enum Değerleri

### ReferenceApplicationStatus (Başvuru durumu)
| Değer | Ad |
|-------|-----|
| 0 | Pending |
| 1 | Approved |
| 2 | Rejected |

### ReferralCommissionStatusEnum (Komisyon durumu)
| Değer | Ad |
|-------|-----|
| 0 | Pending |
| 1 | Approved |
| 2 | Paid |
| 3 | Cancelled |

### ReferralPayoutStatusEnum (Hakediş durumu)
| Değer | Ad |
|-------|-----|
| 0 | Pending |
| 1 | Completed |
| 2 | Failed |
| 3 | Cancelled |

### ReferralCommissionSourceTypeEnum (Komisyon kaynağı)
| Değer | Ad |
|-------|-----|
| 0 | SubscriptionPurchase |
| 1 | SubscriptionRenewal |
| 2 | Order |

### ReferralLedgerEntryTypeEnum (Ekstre hareket tipi)
| Değer | Ad |
|-------|-----|
| 0 | CommissionEarned |
| 1 | Payout |
| 2 | PayoutReversal |
| 3 | Adjustment |
| 4 | Refund |

---

## 8. Hata Cevapları

- **401 Unauthorized:** Geçerli/geçerli admin JWT yok. Header: `Authorization: Bearer <token>`.
- **404 Not Found:** İlgili kaynak (başvuru, kampanya vb.) bulunamadı; body’de `error` mesajı.
- **500 Internal Server Error:** Sunucu hatası; body’de genel `error` mesajı.

Tüm hata body’leri örnek formatı:
```json
{
  "error": "İlgili Türkçe hata mesajı."
}
```

---

## Özet Tablo

| Metot | Endpoint | Açıklama |
|-------|----------|----------|
| GET | `/api/AdminReference/applications` | Tüm başvuruları listele |
| POST | `/api/AdminReference/applications/{id}/approve` | Başvuruyu onayla |
| GET | `/api/AdminReference/reference-users` | Tüm referans kullanıcılarını listele |
| GET | `/api/AdminReference/campaigns/all` | Tüm kampanyaları listele |
| GET | `/api/AdminReference/campaigns?id={id}` | Kampanya detayı |
| POST | `/api/AdminReference/campaigns/create` | Kampanya oluştur |
| PUT | `/api/AdminReference/campaigns/update?id={id}` | Kampanya güncelle |
| DELETE | `/api/AdminReference/campaigns/delete?id={id}` | Kampanya sil |
| GET | `/api/AdminReference/commissions` | Komisyon listesi (filtreli) |
| GET | `/api/AdminReference/payouts` | Hakediş listesi (filtreli) |
| GET | `/api/AdminReference/applications/{id}/ledger` | Başvuruya göre ekstre |

Tüm isteklerde **Authorization: Bearer &lt;admin_jwt&gt;** header’ı kullanılmalıdır.
