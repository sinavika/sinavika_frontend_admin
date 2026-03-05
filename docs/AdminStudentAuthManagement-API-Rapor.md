# Admin Öğrenci Yönetimi API — Endpoint Raporu

## Giriş

Bu rapor, **Sinavika** uygulamasının **Admin Öğrenci Yönetimi (AdminStudentAuthManagement)** API’sini dokümante eder. Modül, admin panelinden öğrenci kullanıcılarını listelemek, detayını görmek, abonelik ve ödeme bilgilerini, akademik profili, girdiği sınavları ve sınav skorlarını tek yerden yönetmek için kullanılır.

### Süreç Özeti

1. **Öğrenci listesi** — Tüm öğrenciler ad, soyad, e‑posta ve telefon ile listelenir; parametre almayan tek bir GET ile çekilir.
2. **Öğrenci detayı** — Listede bir öğrenciye tıklandığında, o öğrenciye ait genişletilmiş bilgi (aktiflik, oluşturma/güncelleme tarihleri vb.) ayrı bir endpoint ile alınır.
3. **Abonelikler** — Öğrenci ID ile o öğrencinin tüm abonelikleri getirilir; her abonelik için paket adı, durum, başlangıç/bitiş tarihleri, kupon veya referans kullanımı (kod ve indirim tutarları) ve o aboneliğe ait ödemelerin kısa özeti (tutar, durum, ödeme tarihi, harici ödeme ID) döner.
4. **Akademik profil** — Öğrenci ID ile OBP, diploma puanı, yerleştirme cezası gibi alanlar tek kayıt olarak döner (yoksa 404).
5. **Girilen sınavlar** — Öğrenci ID ile o öğrencinin girdiği sınavlar (sınav adı, başlama/teslim/iptal tarihleri) listelenir.
6. **Sınav skor detayı** — Öğrenci ID + Sınav ID ile o öğrencinin o sınavdaki sonuç özeti (net, doğru/yanlış/boş, süre, sıra), puan türü bazlı sonuçlar (SAY, EA, SÖZ vb.) ve sıralama (rank, yüzdelik) bilgisi tek yanıtta döner.

Tüm endpoint’ler **Bearer JWT** ile yetkilendirilir ve **admin** API grubuna aittir. Base path: `api/AdminStudentAuthManagement`.

---

## Base path

`/api/AdminStudentAuthManagement`

| Metot | Path | Açıklama |
|-------|------|----------|
| GET | `/students` | Tüm öğrencileri listeler (ad, soyad, mail, telefon) |
| GET | `/students/{studentId}` | Öğrenci detayını döner |
| GET | `/students/{studentId}/subscriptions` | Öğrencinin aboneliklerini listeler (kupon/referans + ödeme özeti) |
| GET | `/students/{studentId}/academic-profile` | Öğrencinin akademik profilini döner |
| GET | `/students/{studentId}/exams` | Öğrencinin girdiği sınavları listeler |
| GET | `/students/{studentId}/exams/{examId}/score` | Öğrencinin belirtilen sınavdaki skor detayını döner |

---

## 1. GET /api/AdminStudentAuthManagement/students

Tüm öğrencileri listeler. Body veya query parametresi yok; yanıt ad, soyad, e‑posta ve telefon içerir.

### İstek (Request)

```http
GET /api/AdminStudentAuthManagement/students HTTP/1.1
Host: localhost:5000
Authorization: Bearer <admin_jwt_token>
Accept: application/json
```

### Başarılı Yanıt (200 OK)

```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Ahmet",
    "surname": "Yılmaz",
    "email": "ahmet.yilmaz@example.com",
    "phone": "+905551234567"
  },
  {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "name": "Zeynep",
    "surname": "Kaya",
    "email": "zeynep.kaya@example.com",
    "phone": null
  }
]
```

### Yetkisiz (401 Unauthorized)

Geçersiz veya eksik token durumunda body olmadan `401` döner.

### Hata (500)

```json
{
  "error": "Öğrenci listesi alınırken bir hata oluştu."
}
```

---

## 2. GET /api/AdminStudentAuthManagement/students/{studentId}

Listede tıklanan öğrencinin detay bilgisini döner (detay sayfası için).

### İstek (Request)

```http
GET /api/AdminStudentAuthManagement/students/a1b2c3d4-e5f6-7890-abcd-ef1234567890 HTTP/1.1
Host: localhost:5000
Authorization: Bearer <admin_jwt_token>
Accept: application/json
```

### Başarılı Yanıt (200 OK)

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Ahmet",
  "surname": "Yılmaz",
  "email": "ahmet.yilmaz@example.com",
  "phone": "+905551234567",
  "isActive": true,
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-02-20T14:00:00Z"
}
```

### Bulunamadı (404 Not Found)

```json
{
  "error": "Öğrenci bulunamadı."
}
```

### Yetkisiz (401) / Hata (500)

Diğer endpoint’lerdeki gibi; 500’de:

```json
{
  "error": "Öğrenci detayı alınırken bir hata oluştu."
}
```

---

## 3. GET /api/AdminStudentAuthManagement/students/{studentId}/subscriptions

Öğrencinin tüm aboneliklerini listeler. Her abonelik için paket adı, durum, tarihler, kupon/referans kullanımı ve o aboneliğe ait ödemelerin kısa özeti döner.

### İstek (Request)

```http
GET /api/AdminStudentAuthManagement/students/a1b2c3d4-e5f6-7890-abcd-ef1234567890/subscriptions HTTP/1.1
Host: localhost:5000
Authorization: Bearer <admin_jwt_token>
Accept: application/json
```

### Başarılı Yanıt (200 OK)

```json
[
  {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "subscriptionPackageId": "d4e5f6a7-b8c9-0123-def0-234567890123",
    "packageName": "TYT-AYT Deneme Paketi",
    "status": 1,
    "startedAt": "2026-01-01T00:00:00Z",
    "expiresAt": "2026-12-31T23:59:59Z",
    "packagePriceSnapshot": 299.00,
    "finalPriceSnapshot": 249.00,
    "usedCoupon": true,
    "couponCodeSnapshot": "INDIRIM20",
    "discountAmountSnapshot": 50.00,
    "usedReference": false,
    "referenceCodeSnapshot": null,
    "referenceDiscountAmountSnapshot": null,
    "payments": [
      {
        "id": "e5f6a7b8-c9d0-1234-ef01-345678901234",
        "amount": 249.00,
        "currency": "TRY",
        "status": 1,
        "createdAt": "2026-01-01T09:00:00Z",
        "paidAt": "2026-01-01T09:05:00Z",
        "externalPaymentId": "PAY-12345"
      }
    ]
  }
]
```

**Abonelik durumu (status):** 0=Pending, 1=Active, 2=Expired, 3=Cancelled.  
**Ödeme durumu (payments[].status):** 0=Pending, 1=Completed, 2=Failed, 3=Refunded, 4=Cancelled.

### Boş liste (200 OK)

Öğrencinin aboneliği yoksa `[]` döner.

### Yetkisiz (401) / Hata (500)

500’de:

```json
{
  "error": "Abonelik listesi alınırken bir hata oluştu."
}
```

---

## 4. GET /api/AdminStudentAuthManagement/students/{studentId}/academic-profile

Öğrencinin akademik profilini (OBP, diploma puanı vb.) döner.

### İstek (Request)

```http
GET /api/AdminStudentAuthManagement/students/a1b2c3d4-e5f6-7890-abcd-ef1234567890/academic-profile HTTP/1.1
Host: localhost:5000
Authorization: Bearer <admin_jwt_token>
Accept: application/json
```

### Başarılı Yanıt (200 OK)

```json
{
  "id": "f6a7b8c9-d0e1-2345-f012-456789012345",
  "studentUserId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "diplomaScore": 85.5,
  "obp": 425.25,
  "hasPlacementPenalty": false,
  "placementPenaltyFactor": null,
  "updatedAt": "2026-02-01T12:00:00Z"
}
```

### Bulunamadı (404 Not Found)

Profil kaydı yoksa:

```json
{
  "error": "Akademik profil bulunamadı."
}
```

### Yetkisiz (401) / Hata (500)

500’de:

```json
{
  "error": "Akademik profil alınırken bir hata oluştu."
}
```

---

## 5. GET /api/AdminStudentAuthManagement/students/{studentId}/exams

Öğrencinin girdiği sınavları listeler (sınav adı, başlama/teslim/iptal tarihleri).

### İstek (Request)

```http
GET /api/AdminStudentAuthManagement/students/a1b2c3d4-e5f6-7890-abcd-ef1234567890/exams HTTP/1.1
Host: localhost:5000
Authorization: Bearer <admin_jwt_token>
Accept: application/json
```

### Başarılı Yanıt (200 OK)

```json
[
  {
    "examUserId": "a7b8c9d0-e1f2-3456-0123-567890123456",
    "examId": "b8c9d0e1-f2a3-4567-1234-678901234567",
    "examTitle": "2026 TYT Deneme 1",
    "startedAt": "2026-03-01T10:00:00Z",
    "submittedAt": "2026-03-01T12:30:00Z",
    "cancelledAt": null
  },
  {
    "examUserId": "c9d0e1f2-a3b4-5678-2345-678901234567",
    "examId": "d0e1f2a3-b4c5-6789-3456-789012345678",
    "examTitle": "2026 AYT Sayısal Deneme 1",
    "startedAt": "2026-03-05T09:00:00Z",
    "submittedAt": null,
    "cancelledAt": null
  }
]
```

### Boş liste (200 OK)

Öğrenci hiç sınava girmemişse `[]` döner.

### Yetkisiz (401) / Hata (500)

500’de:

```json
{
  "error": "Sınav listesi alınırken bir hata oluştu."
}
```

---

## 6. GET /api/AdminStudentAuthManagement/students/{studentId}/exams/{examId}/score

Öğrencinin belirtilen sınavdaki skor detayını döner: sonuç özeti (snapshot), puan türü bazlı sonuçlar (SAY, EA, SÖZ vb.) ve sıralama bilgisi.

### İstek (Request)

```http
GET /api/AdminStudentAuthManagement/students/a1b2c3d4-e5f6-7890-abcd-ef1234567890/exams/b8c9d0e1-f2a3-4567-1234-678901234567/score HTTP/1.1
Host: localhost:5000
Authorization: Bearer <admin_jwt_token>
Accept: application/json
```

### Başarılı Yanıt (200 OK)

```json
{
  "examUserId": "a7b8c9d0-e1f2-3456-0123-567890123456",
  "examId": "b8c9d0e1-f2a3-4567-1234-678901234567",
  "snapshot": {
    "id": "e1f2a3b4-c5d6-7890-abcd-ef1234567890",
    "totalQuestions": 120,
    "correctCount": 95,
    "wrongCount": 18,
    "emptyCount": 7,
    "netScore": 90.5,
    "durationSeconds": 7200,
    "rank": 42,
    "totalParticipantCount": 1500,
    "calculatedAt": "2026-03-01T13:00:00Z"
  },
  "scoreResults": [
    {
      "id": "f2a3b4c5-d6e7-8901-bcde-f12345678901",
      "categoryScoreTypeId": "a3b4c5d6-e7f8-9012-cdef-123456789012",
      "scoreTypeCode": "TYT",
      "rawScore": 88.2,
      "standardScore": 0.85,
      "finalScore": 388.25,
      "obpUsed": 425.25,
      "obpContribution": 51.03,
      "calculatedAt": "2026-03-01T13:00:00Z"
    }
  ],
  "rankResults": [
    {
      "id": "a3b4c5d6-e7f8-9012-cdef-123456789012",
      "categoryScoreTypeId": "a3b4c5d6-e7f8-9012-cdef-123456789012",
      "scoreTypeCode": "TYT",
      "rank": 42,
      "totalCount": 1500,
      "percentile": 97.2,
      "calculatedAt": "2026-03-01T13:00:00Z"
    }
  ]
}
```

- **snapshot:** Net, doğru/yanlış/boş sayıları, süre, sıra ve toplam katılımcı sayısı.
- **scoreResults:** Puan türüne göre ham/standart/final puan ve OBP katkısı.
- **rankResults:** Puan türüne göre sıra, toplam katılımcı ve yüzdelik dilim.

Sonuç hesaplanmamışsa `snapshot` null olabilir; `scoreResults` ve `rankResults` boş liste olabilir.

### Bulunamadı (404 Not Found)

Bu öğrenci bu sınava girmemişse veya skor kaydı yoksa:

```json
{
  "error": "Bu öğrenci için bu sınavda skor kaydı bulunamadı."
}
```

### Yetkisiz (401) / Hata (500)

500’de:

```json
{
  "error": "Skor detayı alınırken bir hata oluştu."
}
```

---

## Örnek Akış (Gidiş–Dönüş)

1. **Öğrenci listesini al**
   - **İstek:** `GET /api/AdminStudentAuthManagement/students` + `Authorization: Bearer <token>`
   - **Yanıt:** `200` + `[{ "id": "...", "name", "surname", "email", "phone" }, ...]`

2. **Detay sayfası için öğrenci detayı**
   - **İstek:** `GET /api/AdminStudentAuthManagement/students/{studentId}` + Bearer token
   - **Yanıt:** `200` + `StudentDetailDto` veya `404` + `{ "error": "Öğrenci bulunamadı." }`

3. **Aynı öğrencinin abonelikleri**
   - **İstek:** `GET /api/AdminStudentAuthManagement/students/{studentId}/subscriptions` + Bearer token
   - **Yanıt:** `200` + `StudentSubscriptionManagementDto[]` (kupon/referans ve ödeme özeti dahil)

4. **Akademik profil**
   - **İstek:** `GET /api/AdminStudentAuthManagement/students/{studentId}/academic-profile` + Bearer token
   - **Yanıt:** `200` + `StudentAcademicProfileDto` veya `404`

5. **Girilen sınavlar**
   - **İstek:** `GET /api/AdminStudentAuthManagement/students/{studentId}/exams` + Bearer token
   - **Yanıt:** `200` + `StudentExamItemDto[]`

6. **Belirli bir sınavın skor detayı**
   - **İstek:** `GET /api/AdminStudentAuthManagement/students/{studentId}/exams/{examId}/score` + Bearer token
   - **Yanıt:** `200` + `StudentExamScoreDetailDto` veya `404`

---

## Ortak Kurallar

- Tüm isteklerde **Authorization: Bearer &lt;token&gt;** (admin JWT) gerekir.
- Path parametreleri: `studentId` ve `examId` geçerli GUID olmalıdır.
- Başarılı yanıtlar ilgili DTO veya DTO dizisi ile döner; hata yanıtları `{ "error": "..." }` formatındadır.
- 401 yetkisiz, 404 kayıt bulunamadı, 500 sunucu hatası için kullanılır.

Bu rapor, Swagger/OpenAPI ile birlikte entegrasyon ve test süreçlerinde referans olarak kullanılabilir.
