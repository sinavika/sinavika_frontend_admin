# AdminExamController – Endpoint Raporu

Tüm endpoint'lerin örnek gidiş (request) ve dönüş (response) bilgileriyle açıklandığı rapor.

---

## Genel bilgiler

| Özellik | Değer |
|--------|--------|
| **Base URL** | `/api/AdminExam` |
| **Yetkilendirme** | Admin JWT gerekir (`Authorization: Bearer <token>`) |
| **Swagger grubu** | `admin` |
| **Content-Type** | `application/json` (body kullanan endpoint'lerde) |

---

## ExamStatus enum (sınav durumu)

Sınav durumu sayısal değerleri:

| Değer | Sabit | Açıklama |
|-------|--------|----------|
| 0 | Draft | Taslak |
| 1 | Scheduled | Zamanlanmış |
| 2 | Published | Yayında |
| 3 | InProgress | Devam ediyor |
| 4 | Closed | Kapalı |
| 5 | Ended | Sona erdi |
| 6 | Archived | Arşivlendi |

---

## 1. Tüm sınavları listele

### İstek (gidiş)

| Özellik | Değer |
|--------|--------|
| **Method** | `GET` |
| **URL** | `/api/AdminExam/all` |
| **Query / Body** | Yok |

**Örnek istek (cURL):**

```bash
curl -X GET "https://localhost:5001/api/AdminExam/all" \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"
```

### Yanıt (dönüş)

**200 OK** – Başarılı. Dönen tip: `List<AdminExamDto>`.

**Örnek yanıt gövdesi:**

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "questionBookletId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "bookletCode": "BK-TYT-001",
    "publisherId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "categoryId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "categorySubId": "d4e5f6a7-b8c9-0123-def0-234567890123",
    "status": 0,
    "title": "TYT Deneme 1",
    "description": "Mart denemesi",
    "instructions": "Süre 120 dakikadır.",
    "startsAt": "2025-03-01T09:00:00Z",
    "endsAt": "2025-03-01T12:00:00Z",
    "accessDurationDays": 7,
    "participationQuota": 1000,
    "isAdaptive": false,
    "isLocked": false,
    "lockedAt": null,
    "lockedByAdminId": null,
    "createdAt": "2025-02-26T10:00:00Z",
    "updatedAt": null,
    "createdByAdminId": "e5f6a7b8-c9d0-1234-ef01-345678901234",
    "lastUpdatedByAdminId": null,
    "blueprint": null,
    "sections": [],
    "assignedTemplates": [],
    "assignedQuestionCount": 0
  }
]
```

**500 Internal Server Error** – Beklenmeyen hata.

```json
{
  "error": "Sınavlar listelenirken bir hata oluştu."
}
```

---

## 2. Duruma göre sınavları listele

### İstek (gidiş)

| Özellik | Değer |
|--------|--------|
| **Method** | `GET` |
| **URL** | `/api/AdminExam/by-status/{status}` |
| **Route parametresi** | `status` (int) – 0–6 arası ExamStatus değeri |

**Örnek istek (cURL):**

```bash
curl -X GET "https://localhost:5001/api/AdminExam/by-status/0" \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"
```

*(Status 0 = Draft; sadece taslak sınavlar döner.)*

### Yanıt (dönüş)

**200 OK** – Başarılı. Dönen tip: `List<AdminExamDto>`. Gövde yapısı “Tüm sınavları listele” ile aynı; sadece ilgili status’e göre filtrelenmiş liste döner.

**500 Internal Server Error:**

```json
{
  "error": "Sınavlar listelenirken bir hata oluştu."
}
```

---

## 3. Sınav detayı (Id ile)

### İstek (gidiş)

| Özellik | Değer |
|--------|--------|
| **Method** | `GET` |
| **URL** | `/api/AdminExam?id={id}` |
| **Query parametresi** | `id` (Guid) – Sınav Id |

**Örnek istek (cURL):**

```bash
curl -X GET "https://localhost:5001/api/AdminExam?id=3fa85f64-5717-4562-b3fc-2c963f66afa6" \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"
```

### Yanıt (dönüş)

**200 OK** – Başarılı. Tek bir `AdminExamDto` döner.

**Örnek yanıt gövdesi:**

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "questionBookletId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "bookletCode": "BK-TYT-001",
  "publisherId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "categoryId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "categorySubId": "d4e5f6a7-b8c9-0123-def0-234567890123",
  "status": 0,
  "title": "TYT Deneme 1",
  "description": "Mart denemesi",
  "instructions": "Süre 120 dakikadır.",
  "startsAt": "2025-03-01T09:00:00Z",
  "endsAt": "2025-03-01T12:00:00Z",
  "accessDurationDays": 7,
  "participationQuota": 1000,
  "isAdaptive": false,
  "isLocked": false,
  "lockedAt": null,
  "lockedByAdminId": null,
  "createdAt": "2025-02-26T10:00:00Z",
  "updatedAt": null,
  "createdByAdminId": "e5f6a7b8-c9d0-1234-ef01-345678901234",
  "lastUpdatedByAdminId": null,
  "blueprint": null,
  "sections": [],
  "assignedTemplates": [],
  "assignedQuestionCount": 0
}
```

**404 Not Found** – Sınav yok.

```json
{
  "error": "Sınav bulunamadı."
}
```

**500 Internal Server Error:**

```json
{
  "error": "Sınav bilgileri alınırken bir hata oluştu."
}
```

---

## 4. Sınav oluştur

Sınav, **BookletCode** (QuestionBooklet.Code) ile oluşturulur; kategori ve yayınevi kitapçıktan alınır.

### İstek (gidiş)

| Özellik | Değer |
|--------|--------|
| **Method** | `POST` |
| **URL** | `/api/AdminExam/create` |
| **Body** | `AdminExamCreateDto` (JSON) |

**AdminExamCreateDto alanları:**

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|--------|----------|
| title | string | Evet | Sınav başlığı |
| description | string | Hayır | Açıklama |
| instructions | string | Hayır | Talimatlar |
| bookletCode | string | Evet | Kitapçık kodu (sınav bu kitapçığa bağlanır) |
| startsAt | datetime | Hayır | Başlangıç |
| endsAt | datetime | Hayır | Bitiş |
| accessDurationDays | int | Evet | Erişim süresi (gün) |
| participationQuota | int | Hayır | Katılım kotası |
| isAdaptive | bool | Evet | Uyarlanabilir sınav mı |

**Örnek istek (cURL):**

```bash
curl -X POST "https://localhost:5001/api/AdminExam/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>" \
  -d "{\"title\":\"TYT Deneme Sınavı 1\",\"description\":\"Mart denemesi\",\"instructions\":\"Süre 120 dakikadır.\",\"bookletCode\":\"BK-TYT-001\",\"startsAt\":\"2025-03-01T09:00:00Z\",\"endsAt\":\"2025-03-01T12:00:00Z\",\"accessDurationDays\":7,\"participationQuota\":1000,\"isAdaptive\":false}"
```

**Örnek body (JSON):**

```json
{
  "title": "TYT Deneme Sınavı 1",
  "description": "Mart denemesi",
  "instructions": "Süre 120 dakikadır.",
  "bookletCode": "BK-TYT-001",
  "startsAt": "2025-03-01T09:00:00Z",
  "endsAt": "2025-03-01T12:00:00Z",
  "accessDurationDays": 7,
  "participationQuota": 1000,
  "isAdaptive": false
}
```

### Yanıt (dönüş)

**200 OK** – Sınav oluşturuldu.

```json
{
  "message": "Sınav oluşturuldu.",
  "examId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "bookletCode": "BK-TYT-001"
}
```

**400 Bad Request** – Geçersiz istek (örn. BookletCode boş).

```json
{
  "error": "Kitapçık kodu (BookletCode) zorunludur."
}
```

**404 Not Found** – Kitapçık kodu bulunamadı.

```json
{
  "error": "Belirtilen kitapçık kodu bulunamadı: BK-YANLIS"
}
```

**500 Internal Server Error:**

```json
{
  "error": "Sınav oluşturulurken bir hata oluştu."
}
```

---

## 5. Sınav durumunu güncelle (ExamStatus enum)

Sınav durumunu **Id** ve **Status** (0–6) ile günceller.

### İstek (gidiş)

| Özellik | Değer |
|--------|--------|
| **Method** | `PUT` |
| **URL** | `/api/AdminExam/status/{id}` |
| **Route parametresi** | `id` (Guid) – Sınav Id |
| **Body** | `SetExamStatusRequest` (JSON) |

**SetExamStatusRequest:**

| Alan | Tip | Açıklama |
|------|-----|----------|
| status | int | 0=Draft, 1=Scheduled, 2=Published, 3=InProgress, 4=Closed, 5=Ended, 6=Archived |

**Örnek istek (cURL):**

```bash
curl -X PUT "https://localhost:5001/api/AdminExam/status/3fa85f64-5717-4562-b3fc-2c963f66afa6" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>" \
  -d "{\"status\":2}"
```

**Örnek body (JSON):**

```json
{
  "status": 2
}
```

*(2 = Published; sınav yayına alınır.)*

### Yanıt (dönüş)

**200 OK** – Durum güncellendi.

```json
{
  "message": "Sınav durumu güncellendi."
}
```

**400 Bad Request** – Geçersiz status değeri.

```json
{
  "error": "Geçersiz sınav durumu. Geçerli değerler: 0=Draft, 1=Scheduled, 2=Published, 3=InProgress, 4=Closed, 5=Ended, 6=Archived. Gönderilen: 9."
}
```

**404 Not Found** – Sınav bulunamadı.

```json
{
  "error": "Sınav bulunamadı."
}
```

**500 Internal Server Error:**

```json
{
  "error": "Sınav durumu güncellenirken bir hata oluştu."
}
```

---

## Özet tablo (gidiş–dönüş)

| # | Method | URL | Gidiş | Başarılı dönüş (200) | Hata dönüşleri |
|---|--------|-----|--------|----------------------|-----------------|
| 1 | GET | `/api/AdminExam/all` | — | `List<AdminExamDto>` | 500 |
| 2 | GET | `/api/AdminExam/by-status/{status}` | status: 0–6 | `List<AdminExamDto>` | 500 |
| 3 | GET | `/api/AdminExam?id={id}` | id: Guid | `AdminExamDto` | 404, 500 |
| 4 | POST | `/api/AdminExam/create` | Body: AdminExamCreateDto | `message`, `examId`, `bookletCode` | 400, 404, 500 |
| 5 | PUT | `/api/AdminExam/status/{id}` | Body: `{ "status": 0-6 }` | `message` | 400, 404, 500 |

---

*Rapor: AdminExamController – Örnek gidiş/dönüş – Şubat 2025*
