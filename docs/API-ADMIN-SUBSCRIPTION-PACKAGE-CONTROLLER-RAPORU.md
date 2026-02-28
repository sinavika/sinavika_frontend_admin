# AdminSubscriptionPackageController — Detaylı API Raporu

Bu rapor, **admin abonelik paketi** yönetimi için kullanılan `AdminSubscriptionPackageController` endpoint'lerini ve **yeni kategori yapısını** (ana kategori zorunlu, alt kategori opsiyonel) açıklar.

---

## 1. Yeni yapı özeti

Abonelik paketleri artık **kategoriye göre** tanımlanır:

| Kural | Açıklama |
|-------|----------|
| **Ana kategori (Category)** | Her paket **tam olarak bir** ana kategoriye aittir. **CategoryId zorunludur.** |
| **Alt kategori (CategorySub)** | Paket isteğe bağlı olarak **bir** alt kategoriye ait olabilir. **CategorySubId opsiyoneldir.** |
| **Alt kategori uyumu** | CategorySubId gönderilirse, seçilen alt kategori **gönderilen CategoryId'ye ait** olmalıdır (servis validasyonu). |

- **Category**: Örn. YKS, KPSS, ALES.  
- **CategorySub**: Örn. YKS altında TYT, AYT, YDT.  

Paket hem listelemede hem detayda **categoryId**, **categorySubId**, **categoryName**, **categorySubName** alanlarıyla döner.

---

## 2. Genel bilgiler

| Özellik | Değer |
|--------|--------|
| **Base URL** | `api/AdminSubscriptionPackage` |
| **Yetkilendirme** | `[Authorize]` — JWT Bearer token gerekli (Admin) |
| **Swagger grubu** | `admin` |
| **Content-Type** | İstek/yanıt: `application/json` |

Tüm isteklerde geçerli admin JWT token'ı `Authorization: Bearer <token>` header'ında gönderilmelidir.

---

## 3. Endpoint listesi (özet)

| # | Method | Endpoint | Açıklama |
|---|--------|----------|----------|
| 1 | GET | `/all` | Tüm abonelik paketlerini listeler |
| 2 | GET | `/by-category?categoryId=...&categorySubId=...` | Ana kategori (ve isteğe bağlı alt kategori) ile filtreler |
| 3 | GET | `/{id}` | Id ile paket detayı getirir |
| 4 | POST | `/create` | Yeni paket oluşturur (CategoryId zorunlu) |
| 5 | PUT | `/{id}` | Paketi günceller |
| 6 | DELETE | `/{id}` | Paketi pasif yapar (soft delete) |

---

## 4. Sabitler (enum)

### PlanType (plan tipi)

| Değer | Açıklama |
|-------|----------|
| 0 | Deneme |

### BillingPeriod (ödeme periyodu)

| Değer | Açıklama |
|-------|----------|
| 0 | Sınav başı |
| 1 | Aylık |
| 2 | Yıllık |

---

## 5. Endpoint detayları

### 5.1 Tüm abonelik paketlerini listele

**GET** `api/AdminSubscriptionPackage/all`

Tüm abonelik paketlerini kategori bilgileriyle birlikte döner.

#### İstek
- **Header:** `Authorization: Bearer <admin_jwt_token>`
- **Body:** Yok

#### Örnek istek (cURL)
```bash
curl -X GET "https://api.example.com/api/AdminSubscriptionPackage/all" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### Başarılı yanıt (200 OK)
Gövde: `SubscriptionPackageDto[]`

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "categoryId": "a1b2c3d4-5717-4562-b3fc-2c963f66afa7",
    "categorySubId": null,
    "categoryName": "YKS",
    "categorySubName": null,
    "name": "YKS - Deneme (Sınav Başına)",
    "description": "Kullandığın kadar öde modeli.",
    "planType": 0,
    "billingPeriod": 0,
    "unitPricePerExam": 19.90,
    "packagePrice": null,
    "examCountLimit": null,
    "validityDays": 365,
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": null,
    "createdByAdminId": "3fa85f64-5717-4562-b3fc-2c963f66afa8",
    "lastUpdatedByAdminId": null
  }
]
```

#### Hata yanıtı (500)
```json
{ "error": "Abonelik paketleri listelenirken bir hata oluştu." }
```

---

### 5.2 Ana kategori (ve isteğe bağlı alt kategori) ile listele

**GET** `api/AdminSubscriptionPackage/by-category?categoryId={guid}&categorySubId={guid}`

Belirli bir ana kategoriye — ve istenirse alt kategoriye — göre paketleri listeler. **categoryId zorunlu**, **categorySubId opsiyonel**.

#### İstek
- **Header:** `Authorization: Bearer <admin_jwt_token>`
- **Query parametreleri:**

| Parametre | Tip | Zorunlu | Açıklama |
|-----------|-----|---------|----------|
| categoryId | Guid | **Evet** | Ana kategori Id (Categories tablosu) |
| categorySubId | Guid? | Hayır | Alt kategori Id (CategorySubs tablosu); belirtilirse bu alt kategoriye ait paketler döner |

#### Örnek istekler (cURL)
```bash
# Sadece ana kategori (YKS)
curl -X GET "https://api.example.com/api/AdminSubscriptionPackage/by-category?categoryId=a1b2c3d4-5717-4562-b3fc-2c963f66afa7" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Ana kategori + alt kategori (örn. YKS > TYT)
curl -X GET "https://api.example.com/api/AdminSubscriptionPackage/by-category?categoryId=a1b2c3d4-5717-4562-b3fc-2c963f66afa7&categorySubId=b2c3d4e5-5717-4562-b3fc-2c963f66afa8" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### Başarılı yanıt (200 OK)
`SubscriptionPackageDto[]` — yapı 5.1 ile aynı.

#### Hata yanıtları
- **400 Bad Request** — categoryId boş veya geçersiz:
  ```json
  { "error": "Ana kategori (categoryId) zorunludur." }
  ```
- **500**
  ```json
  { "error": "Abonelik paketleri listelenirken bir hata oluştu." }
  ```

---

### 5.3 Abonelik paketi detayı (Id ile)

**GET** `api/AdminSubscriptionPackage/{id}`

Tek bir paketin detayını (kategori adları dahil) döner.

#### İstek
- **Header:** `Authorization: Bearer <admin_jwt_token>`
- **URL parametresi:** `id` (Guid)

#### Örnek istek (cURL)
```bash
curl -X GET "https://api.example.com/api/AdminSubscriptionPackage/3fa85f64-5717-4562-b3fc-2c963f66afa6" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### Başarılı yanıt (200 OK)
Gövde: tek `SubscriptionPackageDto` (5.1’deki yapı ile aynı).

#### Hata yanıtı (404)
```json
{ "error": "Abonelik paketi bulunamadı." }
```

---

### 5.4 Yeni abonelik paketi oluştur

**POST** `api/AdminSubscriptionPackage/create`

Yeni paket oluşturur. **CategoryId zorunlu**, **CategorySubId opsiyonel**. CategorySubId gönderilirse, servis seçilen alt kategorinin ilgili CategoryId’ye ait olduğunu doğrular.

#### İstek
- **Header:** `Authorization: Bearer <admin_jwt_token>`
- **Content-Type:** `application/json`
- **Body:** `SubscriptionPackageCreateDto`

```json
{
  "categoryId": "a1b2c3d4-5717-4562-b3fc-2c963f66afa7",
  "categorySubId": null,
  "name": "YKS TYT - Aylık Paket",
  "description": "TYT için aylık paket.",
  "planType": 0,
  "billingPeriod": 1,
  "unitPricePerExam": 14.90,
  "packagePrice": 299.00,
  "examCountLimit": 20,
  "validityDays": 30,
  "isActive": true
}
```

#### SubscriptionPackageCreateDto alanları

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| categoryId | Guid | **Evet** | Ana kategori Id |
| categorySubId | Guid? | Hayır | Alt kategori Id (gönderilirse bu kategoriye ait olmalı) |
| name | string | Evet | Paket adı |
| description | string? | Hayır | Açıklama |
| planType | int | Evet | 0 = Deneme |
| billingPeriod | int | Evet | 0 = Sınav başı, 1 = Aylık, 2 = Yıllık |
| unitPricePerExam | decimal | Evet | Sınav başına birim fiyat |
| packagePrice | decimal? | Hayır | Paket toplam fiyatı |
| examCountLimit | int? | Hayır | Kapsanan sınav adedi |
| validityDays | int | Evet | Geçerlilik süresi (gün) |
| isActive | bool | Evet | Varsayılan: true |

#### Başarılı yanıt (200 OK)
```json
{ "message": "Abonelik paketi başarıyla oluşturuldu." }
```

#### Hata yanıtları
- **400 Bad Request** — categoryId boş:
  ```json
  { "error": "Ana kategori (categoryId) zorunludur." }
  ```
- **400 Bad Request** — CategorySubId, CategoryId’ye ait değil (servis ArgumentException):
  ```json
  { "error": "CategorySubId, seçilen CategoryId'ye ait olmalıdır." }
  ```
- **500**
  ```json
  { "error": "Abonelik paketi oluşturulurken bir hata oluştu." }
  ```

---

### 5.5 Abonelik paketini güncelle

**PUT** `api/AdminSubscriptionPackage/{id}`

Mevcut paketi günceller. Gönderilen alanlar güncellenir; **CategoryId** ve **CategorySubId** opsiyonel. CategorySubId gönderilirse, paketin mevcut CategoryId’sine ait olmalıdır.

#### İstek
- **Header:** `Authorization: Bearer <admin_jwt_token>`
- **Content-Type:** `application/json`
- **URL parametresi:** `id` (Guid)
- **Body:** `SubscriptionPackageUpdateDto` (tüm alanlar opsiyonel)

```json
{
  "categoryId": "a1b2c3d4-5717-4562-b3fc-2c963f66afa7",
  "categorySubId": "b2c3d4e5-5717-4562-b3fc-2c963f66afa8",
  "name": "YKS TYT - Aylık Paket (Güncel)",
  "description": "Güncellenmiş açıklama.",
  "planType": 0,
  "billingPeriod": 1,
  "unitPricePerExam": 14.90,
  "packagePrice": 349.00,
  "examCountLimit": 25,
  "validityDays": 30,
  "isActive": true
}
```

#### SubscriptionPackageUpdateDto alanları
Tüm alanlar opsiyonel; gönderilenler güncellenir.

| Alan | Tip | Açıklama |
|------|-----|----------|
| categoryId | Guid? | Ana kategori Id |
| categorySubId | Guid? | Alt kategori Id (paketin categoryId’sine ait olmalı) |
| name | string? | Paket adı |
| description | string? | Açıklama |
| planType | int? | 0 = Deneme |
| billingPeriod | int? | 0/1/2 |
| unitPricePerExam | decimal? | Sınav başına birim fiyat |
| packagePrice | decimal? | Paket fiyatı |
| examCountLimit | int? | Sınav limiti |
| validityDays | int? | Geçerlilik (gün) |
| isActive | bool? | Aktif/pasif |

#### Başarılı yanıt (200 OK)
```json
{ "message": "Abonelik paketi başarıyla güncellendi." }
```

#### Hata yanıtları
- **404 Not Found**
  ```json
  { "error": "Abonelik paketi bulunamadı." }
  ```
- **400 Bad Request** — CategorySubId validasyonu (ArgumentException):
  ```json
  { "error": "CategorySubId, paketin CategoryId'sine ait olmalıdır." }
  ```
- **500**
  ```json
  { "error": "Abonelik paketi güncellenirken bir hata oluştu." }
  ```

---

### 5.6 Abonelik paketini pasif yap (soft delete)

**DELETE** `api/AdminSubscriptionPackage/{id}`

Paketi silmez; **IsActive = false** yapar. Mevcut öğrenci abonelikleri etkilenmez.

#### İstek
- **Header:** `Authorization: Bearer <admin_jwt_token>`
- **URL parametresi:** `id` (Guid)

#### Örnek istek (cURL)
```bash
curl -X DELETE "https://api.example.com/api/AdminSubscriptionPackage/3fa85f64-5717-4562-b3fc-2c963f66afa6" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### Başarılı yanıt (200 OK)
```json
{ "message": "Abonelik paketi pasif hale getirildi (iptal / soft delete)." }
```

#### Hata yanıtı (404)
```json
{ "error": "Abonelik paketi bulunamadı." }
```

---

## 6. SubscriptionPackageDto (yanıt alanları)

Listeleme ve detay yanıtlarında kullanılan tam alan listesi:

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | Guid | Paket Id |
| categoryId | Guid | Ana kategori Id |
| categorySubId | Guid? | Alt kategori Id (yoksa null) |
| categoryName | string? | Ana kategori adı (örn. YKS) |
| categorySubName | string? | Alt kategori adı (örn. TYT) |
| name | string | Paket adı |
| description | string? | Açıklama |
| planType | int | 0 = Deneme |
| billingPeriod | int | 0 = Sınav başı, 1 = Aylık, 2 = Yıllık |
| unitPricePerExam | decimal | Sınav başına birim fiyat |
| packagePrice | decimal? | Paket toplam fiyatı |
| examCountLimit | int? | Sınav adedi limiti |
| validityDays | int | Geçerlilik süresi (gün) |
| isActive | bool | Aktif mi |
| createdAt | DateTime | Oluşturulma (ISO 8601) |
| updatedAt | DateTime? | Son güncelleme |
| createdByAdminId | Guid | Oluşturan admin Id |
| lastUpdatedByAdminId | Guid? | Son güncelleyen admin Id |

---

## 7. Özet tablo

| İşlem | Method | URL | categoryId | categorySubId |
|-------|--------|-----|------------|---------------|
| Tümünü listele | GET | `/all` | — | — |
| Kategoriye göre listele | GET | `/by-category?categoryId=...&categorySubId=...` | **Zorunlu** | Opsiyonel |
| Detay getir | GET | `/{id}` | — | — |
| Oluştur | POST | `/create` | **Body’de zorunlu** | Body’de opsiyonel |
| Güncelle | PUT | `/{id}` | Body’de opsiyonel | Body’de opsiyonel |
| Pasif yap | DELETE | `/{id}` | — | — |

Bu rapor, AdminSubscriptionPackageController’ın yeni kategori yapısına göre güncel kullanımını özetler.
