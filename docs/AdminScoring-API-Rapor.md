# Admin Scoring API — Endpoint Raporu

## Giriş

Bu rapor, **Sinavika** uygulamasının **Sınav Sonuç Hesaplama ve Sıralama (Admin Scoring)** API’sini dokümante eder. Modül, **kapanmış veya bitmiş** sınavlar için tek seferlik sonuç hesaplama ve sıralama oluşturma işlemlerini yönetir.

### Süreç Özeti

1. **Hesaplamaya uygun sınavlar**  
   Sınav durumu `Closed` (4), `Ended` (5) veya `Archived` (6) olan sınavlar sonuç hesaplamaya uygundur. `GET /exams-eligible-for-scoring` ile bu sınavlar listelenir.

2. **Sonuç hesaplama**  
   Seçilen sınav için `POST /exam/{examId}/calculate-results` çağrılır. Servis:
   - Sınavı ve kitapçığı yükler,
   - Sınava giren öğrencilerin cevaplarını doğru cevaplarla karşılaştırır,
   - Kategori puanlama kurallarına (CategoryScoringProfile, CategoryScoreType, CategoryScoreTypeWeight) göre net, standart net ve puan hesaplar,
   - **ScoringExamUserResultSnapshot**, **ScoringSectionResult**, **ScoringSectionStatistic**, **ScoringScoreResult** tablolarını doldurur.  
   Bu adım **her sınav için yalnızca bir kez** çalıştırılmalıdır. Uzun süren sınavlarda Kestrel/Load Balancer timeout’u artırılmalı (örn. 300s+).

3. **Sıralama oluşturma**  
   Sonuç hesaplama bittikten sonra `POST /exam/{examId}/calculate-ranking` çağrılır. Servis:
   - Hesaplanan sonuçlara göre **ScoringExamUserResultSnapshot** içinde Rank ve TotalParticipantCount günceller,
   - Her puan türü (CategoryScoreType) için **ScoringRankResult** kayıtlarını (sıra, yüzdelik) yazar.  
   Bu adım da **her sınav için yalnızca bir kez** uygulanır.

Tüm endpoint’ler **Bearer JWT** ile yetkilendirilir ve **admin** API grubuna aittir. İstekler `api/AdminScoring/...` base path’i altında yapılır.

---

## Base path

`/api/AdminScoring`

| Metot | Path | Açıklama |
|-------|------|----------|
| GET | `/exams-eligible-for-scoring` | Hesaplamaya müsait (kapalı/bitmiş/arşivlenmiş) sınavları listeler |
| POST | `/exam/{examId}/calculate-results` | Sınav sonuçlarını hesaplar ve Entity/Scoring tablolarına yazar |
| POST | `/exam/{examId}/calculate-ranking` | Sınav için genel sıralama oluşturur (Rank, ScoringRankResult) |

---

## 1. GET /api/AdminScoring/exams-eligible-for-scoring

Hesaplamaya müsait sınavları listeler. Parametre almaz. Sadece durumu **Closed (4)**, **Ended (5)** veya **Archived (6)** olan sınavlar döner.

### İstek (Request)

```http
GET /api/AdminScoring/exams-eligible-for-scoring HTTP/1.1
Host: localhost:5000
Authorization: Bearer <admin_jwt_token>
Accept: application/json
```

### Başarılı Yanıt (200 OK)

```json
[
  {
    "id": "e1f2a3b4-c5d6-7890-abcd-ef1234567890",
    "title": "2026 TYT Deneme 1",
    "status": 4
  },
  {
    "id": "f2a3b4c5-d6e7-8901-bcde-f12345678901",
    "title": "2026 AYT Deneme 1",
    "status": 5
  }
]
```

**Alanlar:**

| Alan   | Tip   | Açıklama |
|--------|--------|----------|
| `id`   | Guid   | Sınav ID |
| `title`| string | Sınav başlığı |
| `status` | int | Sınav durumu: 4=Closed, 5=Ended, 6=Archived |

### Yetkisiz (401 Unauthorized)

Yetkisiz veya geçersiz token durumunda body olmadan `401` döner.

### Hata (500)

```json
{
  "error": "Liste alınırken bir hata oluştu."
}
```

---

## 2. POST /api/AdminScoring/exam/{examId}/calculate-results

Sınav ID’ye göre **tüm sınava giren öğrencilerin** sınav sonucunu hesaplar. Sınav kategorisinin Entity/Categories/Score kurallarına göre Entity/Scoring tabloları doldurulur (ScoringExamUserResultSnapshot, ScoringSectionResult, ScoringSectionStatistic, ScoringScoreResult). Her sınav için yalnızca bir kez çalıştırılmalıdır; sınav kapalı/bitmiş olmalıdır.

### İstek (Request)

```http
POST /api/AdminScoring/exam/e1f2a3b4-c5d6-7890-abcd-ef1234567890/calculate-results HTTP/1.1
Host: localhost:5000
Authorization: Bearer <admin_jwt_token>
Accept: application/json
Content-Length: 0
```

**Not:** Body yok. Sadece route’taki `examId` (GUID) kullanılır. Uzun süren sınavlar için sunucu timeout’u (örn. Kestrel 300s+) artırılmalı; istemci tarafında `CancellationToken` ile iptal desteklenir.

### Başarılı Yanıt (200 OK)

```json
{
  "message": "Sınav sonuçları başarıyla hesaplandı ve kaydedildi.",
  "examId": "e1f2a3b4-c5d6-7890-abcd-ef1234567890"
}
```

### Bulunamadı (404 Not Found)

Sınav yoksa veya ID geçersizse:

```json
{
  "error": "Sınav bulunamadı."
}
```

### Bad Request (400) — İşlem kuralı ihlali

Sınav henüz kapanmamış/bitmemişse (örn. status = Draft, Published, InProgress):

```json
{
  "error": "Sonuç hesaplama yalnızca kapanan veya biten sınavlar için yapılabilir."
}
```

Servisin fırlattığı diğer `InvalidOperationException` mesajları da aynı formatta `error` ile döner.

### İptal (499 Client Closed Request)

İstemci isteği iptal ederse (ör. timeout):

```json
{
  "error": "İşlem iptal edildi."
}
```

### Hata (500)

```json
{
  "error": "Sonuç hesaplama sırasında bir hata oluştu. Detaylar loglarda."
}
```

---

## 3. POST /api/AdminScoring/exam/{examId}/calculate-ranking

Sınav ID’ye göre **genel sıralama** oluşturur. **ScoringExamUserResultSnapshot** içinde Rank ve TotalParticipantCount güncellenir; her CategoryScoreType için **ScoringRankResult** (sıra, yüzdelik) yazılır. Sonuç hesaplama tamamlandıktan sonra çağrılmalıdır; her sınav için yalnızca bir kez.

### İstek (Request)

```http
POST /api/AdminScoring/exam/e1f2a3b4-c5d6-7890-abcd-ef1234567890/calculate-ranking HTTP/1.1
Host: localhost:5000
Authorization: Bearer <admin_jwt_token>
Accept: application/json
Content-Length: 0
```

**Not:** Body yok. Sadece route’taki `examId` (GUID) kullanılır.

### Başarılı Yanıt (200 OK)

```json
{
  "message": "Sıralama başarıyla oluşturuldu.",
  "examId": "e1f2a3b4-c5d6-7890-abcd-ef1234567890"
}
```

### Bulunamadı (404 Not Found)

Sınav veya gerekli sonuç verisi yoksa:

```json
{
  "error": "Sınav bulunamadı."
}
```

Veya servisin döndürdüğü başka bir `KeyNotFoundException` mesajı (ör. sonuç hesaplanmamışsa).

### Bad Request (400)

İşlem kuralı ihlali (ör. önce sonuç hesaplama gerekir):

```json
{
  "error": "<Servis tarafındaki InvalidOperationException mesajı>"
}
```

### İptal (499)

```json
{
  "error": "İşlem iptal edildi."
}
```

### Hata (500)

```json
{
  "error": "Sıralama sırasında bir hata oluştu. Detaylar loglarda."
}
```

---

## Örnek akış (gidiş–dönüş)

1. **Hesaplamaya uygun sınavları al**
   - **İstek:** `GET /api/AdminScoring/exams-eligible-for-scoring` + `Authorization: Bearer <token>`
   - **Yanıt:** `200` + `[{ "id": "...", "title": "2026 TYT Deneme 1", "status": 4 }, ...]`

2. **Sonuç hesapla**
   - **İstek:** `POST /api/AdminScoring/exam/{id}/calculate-results` + `Authorization: Bearer <token>`
   - **Yanıt:** `200` + `{ "message": "Sınav sonuçları başarıyla hesaplandı ve kaydedildi.", "examId": "..." }`

3. **Sıralama oluştur**
   - **İstek:** `POST /api/AdminScoring/exam/{id}/calculate-ranking` + `Authorization: Bearer <token>`
   - **Yanıt:** `200` + `{ "message": "Sıralama başarıyla oluşturuldu.", "examId": "..." }`

---

## Ortak kurallar

- Tüm isteklerde **Authorization: Bearer &lt;token&gt;** gerekir (admin JWT).
- Başarılı işlemlerde Create/Update benzeri endpoint’ler `message` ve `examId` içeren JSON döner; liste endpoint’i `ExamEligibleForScoringItem[]` döner.
- Hata yanıtları `{ "error": "..." }` formatındadır; 400, 404, 499, 500 kullanılır.
- Progress bilgisi HTTP yanıtında yer almaz; sunucu loglarında `ScoringProgressReport` (Phase, Message, CurrentStep, TotalSteps) ile izlenebilir.

Bu rapor, Swagger/OpenAPI ile birlikte entegrasyon ve test süreçlerinde referans olarak kullanılabilir.
