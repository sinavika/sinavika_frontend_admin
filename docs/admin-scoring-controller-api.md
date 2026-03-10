# AdminScoringController — API Gidiş-Dönüş Raporu

Bu doküman, **AdminScoringController** (`/api/AdminScoring`) altındaki endpoint'ler için örnek **istek (request)** ve **cevap (response)** formatlarını, **kaldırılan / eklenen** endpoint'lerin özetini ve Entity/Scoring kayıt akışını içerir. Tüm endpoint'ler **Admin yetkisi** gerektirir; `Authorization: Bearer <admin_jwt>` header'ı zorunludur.

**Base URL örneği:** `https://api.example.com/api/AdminScoring`  
**Swagger grubu:** `admin`

---

## İçindekiler

1. [Endpoint Değişiklik Özeti](#1-endpoint-değişiklik-özeti)
2. [Hesaplamaya Müsait Sınavları Listele](#2-hesaplamaya-müsait-sınavları-listele)
3. [Sonuç ve Sıralama Hesapla (Tek Endpoint)](#3-sonuç-ve-sıralama-hesapla-tek-endpoint)
4. [Hata Cevapları](#4-hata-cevapları)
5. [Entity/Scoring Tabloları ve Akış](#5-entityscoring-tabloları-ve-akış)

---

## 1. Endpoint Değişiklik Özeti

### 1.1 Kaldırılan endpoint'ler

| Metot | Eski yol | Açıklama |
|-------|----------|----------|
| **POST** | `/api/AdminScoring/exam/{examId}/calculate-results` | Sadece sonuç hesaplama (net/puan yazma). Artık **tek endpoint** içinde birleştirildi. |
| **POST** | `/api/AdminScoring/exam/{examId}/calculate-ranking` | Sadece sıralama atama. Artık **tek endpoint** sonuç yazdıktan sonra otomatik sıralama da yapıyor. |

**Not:** İki ayrı çağrı yerine tek çağrı ile hem sonuç hem sıralama yapılıyor. Eski `calculate-results` yolunun **path'i aynı bırakıldı**, fakat davranışı “sonuç + sıralama” olacak şekilde genişletildi; `calculate-ranking` endpoint'i **tamamen kaldırıldı**.

### 1.2 Güncel (aktif) endpoint'ler

| Metot | Yol | Açıklama |
|-------|-----|----------|
| **GET** | `/api/AdminScoring/exams-eligible-for-scoring` | Hesaplamaya müsait (kapalı/bitmiş/arşivlenmiş) sınavları listeler. Değişiklik yok. |
| **POST** | `/api/AdminScoring/exam/{examId}/calculate-results` | **Yenilendi.** Sonuç hesaplama **ve** sıralama tek seferde yapılır; tüm Entity/Scoring tabloları doldurulur. |

### 1.3 Özet tablo

| Önceki durum | Şimdiki durum |
|--------------|----------------|
| 2 POST endpoint: `calculate-results` + `calculate-ranking` | 1 POST endpoint: `calculate-results` (içinde sonuç + sıralama) |
| Admin önce sonuç, sonra ayrıca sıralama çağırıyordu | Admin tek istekle sonuç ve sıralamayı alıyor |

---

## 2. Hesaplamaya Müsait Sınavları Listele

Sınav durumu **Closed**, **Ended** veya **Archived** olan sınavları listeler. Sonuç hesaplama ekranında dropdown/liste için kullanılır.

### 2.1 İstek

**GET** `/api/AdminScoring/exams-eligible-for-scoring`

**Headers:**
```http
Authorization: Bearer <admin_jwt>
Accept: application/json
```

**Path / query parametreleri:** Yok.

**Örnek istek:**
```http
GET /api/AdminScoring/exams-eligible-for-scoring HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
```

### 2.2 Başarı cevabı (200 OK)

```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "TYT Deneme 1 - Mart 2025",
    "status": 2
  },
  {
    "id": "b2c3d4e5-f6a7-8901-bcde-f23456789012",
    "title": "AYT Sayısal Deneme 3",
    "status": 1
  }
]
```

| Alan | Tip | Açıklama |
|------|-----|----------|
| `id` | Guid | Sınav ID. |
| `title` | string | Sınav başlığı. |
| `status` | int | 0 = Scheduled, 1 = Ended, 2 = Closed, 3 = Archived. Listede yalnızca 1, 2, 3 görünür. |

### 2.3 Hata cevapları

- **401 Unauthorized:** Geçerli admin JWT yok veya süresi dolmuş.
- **500 Internal Server Error:**
  ```json
  { "error": "Liste alınırken bir hata oluştu." }
  ```

---

## 3. Sonuç ve Sıralama Hesapla (Tek Endpoint)

Belirtilen sınav için **sonuç hesaplama** ve **sıralama atama** işlemlerini tek istekle yapar: öğrenci cevaplarından net/puan hesaplanır, Entity/Scoring tablolarına yazılır, ardından sıralama atanır. Her sınav için **yalnızca bir kez** çağrılmalıdır; tekrar çağrıda “sonuçlar zaten hesaplanmış” hatası döner.

### 3.1 İstek

**POST** `/api/AdminScoring/exam/{examId}/calculate-results`

**Headers:**
```http
Authorization: Bearer <admin_jwt>
Accept: application/json
```

**Path parametresi:**

| Parametre | Tip | Zorunlu | Açıklama |
|-----------|-----|---------|----------|
| `examId` | Guid | Evet | Sonuç ve sıralaması hesaplanacak sınavın ID'si. |

**Body:** Yok. İstek body gönderilmez.

**Örnek istek:**
```http
POST /api/AdminScoring/exam/a1b2c3d4-e5f6-7890-abcd-ef1234567890/calculate-results HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
Content-Length: 0
```

**cURL örneği:**
```bash
curl -X POST "https://api.example.com/api/AdminScoring/exam/a1b2c3d4-e5f6-7890-abcd-ef1234567890/calculate-results" \
  -H "Authorization: Bearer <admin_jwt>" \
  -H "Accept: application/json"
```

### 3.2 Başarı cevabı (200 OK)

İşlem tamamlandığında aşağıdaki gibi bir cevap döner. Progress bilgisi yalnızca sunucu loglarında (örn. `ScoringProgressReport`) takip edilir; response body'de adım adım progress yoktur.

```json
{
  "message": "Sınav sonuçları ve sıralama başarıyla hesaplandı ve kaydedildi.",
  "examId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

| Alan | Tip | Açıklama |
|------|-----|----------|
| `message` | string | Sabit başarı mesajı. |
| `examId` | Guid | İşlenen sınav ID'si (path'teki ile aynı). |

### 3.3 Hata cevapları

| HTTP kodu | Koşul | Response body örneği |
|-----------|--------|----------------------|
| **400 Bad Request** | Sınav henüz kapanmamış/bitmemiş; veya “sonuçlar zaten hesaplanmış” gibi iş kuralı ihlali. | `{ "error": "Bu sınav için sonuçlar zaten hesaplanmış. Her sınav için yalnızca bir kez hesaplama yapılır." }` |
| **401 Unauthorized** | Geçerli admin JWT yok. | — |
| **404 Not Found** | `examId` ile sınav bulunamadı. | `{ "error": "Sınav bulunamadı: a1b2c3d4-..." }` |
| **499 Client Closed Request** | İstek istemci tarafından iptal edildi (örn. timeout). | `{ "error": "İşlem iptal edildi." }` |
| **500 Internal Server Error** | Kayıt veya hesaplama sırasında beklenmeyen hata. | `{ "error": "Sonuç ve sıralama hesaplama sırasında bir hata oluştu. Detaylar loglarda." }` |

**Örnek 400 (zaten hesaplanmış):**
```json
{
  "error": "Bu sınav için sonuçlar zaten hesaplanmış. Her sınav için yalnızca bir kez hesaplama yapılır."
}
```

**Örnek 404:**
```json
{
  "error": "Sınav bulunamadı: a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

### 3.4 İşlem sırası (arka planda)

1. Sınav, kitapçık ve kategorisi yüklenir; sınav durumu kontrol edilir (Closed/Ended/Archived).
2. Teslim eden öğrenciler ve cevaplar alınır.
3. Her öğrenci için: net hesaplanır → **ScoringResultSnapshot**, **ScoringResultSourceExamUser**, **ScoringSessionSectionResult** kayıtları oluşturulur.
4. Bölüm bazlı istatistikler hesaplanır → **ScoringSessionSectionStatistic** yazılır; standart puanlar güncellenir.
5. Puan türüne göre ağırlıklı puanlar hesaplanır → **ScoringScoreResult** yazılır.
6. Tüm veriler veritabanına commit edilir.
7. Sıralama atanır: **ScoringResultSnapshot** (ExamRank, TotalParticipantCount) ve **ScoringScoreResult** (ExamRank, ExamParticipantCount) güncellenir ve tekrar kaydedilir.

Uzun süren sınavlarda timeout önlemek için Kestrel/LoadBalancer timeout değerinin yükseltilmesi (örn. 300 saniye ve üzeri) önerilir.

---

## 4. Hata Cevapları

Tüm endpoint'lerde ortak kullanılan hata formatı:

```json
{
  "error": "İnsan tarafından okunabilir hata mesajı"
}
```

- **401:** `Authorization` header eksik veya geçersiz.
- **404:** Kaynak bulunamadı (örn. sınav).
- **400:** İş kuralı (sınav durumu, “zaten hesaplanmış” vb.).
- **499:** İstemci isteği iptal etti.
- **500:** Sunucu hatası; detaylar uygulama loglarında.

---

## 5. Entity/Scoring Tabloları ve Akış

`POST .../calculate-results` çağrıldığında aşağıdaki tablolar doldurulur veya güncellenir.

| Tablo | İşlem | Açıklama |
|-------|--------|----------|
| **ScoringResultSnapshot** | Insert, sonra Update | Öğrenci bazlı sonuç özeti (TotalQuestions, NetScore, ExamRank, TotalParticipantCount vb.). |
| **ScoringResultSourceExamUser** | Insert | Snapshot ile ExamUser eşlemesi (tek sınavda SessionCode örn. "EXAM"). |
| **ScoringSessionSectionResult** | Insert | Oturum/bölüm bazlı net ve standart puan (section bazlı doğru/yanlış/boş, Net, StandardScore). |
| **ScoringSessionSectionStatistic** | Insert | Sınav bazlı bölüm istatistikleri (ortalama, standart sapma vb.). |
| **ScoringScoreResult** | Insert, sonra Update | Puan türü bazlı puanlar (RawScore, FinalScore, ExamRank, ExamParticipantCount). |

Akış özeti:

1. **Hesaplama aşaması:** Snapshot → SourceExamUser → SessionSectionResult → SessionSectionStatistic → ScoreResult (insert).
2. **Sıralama aşaması:** Snapshot ve ScoreResult üzerinde ExamRank / TotalParticipantCount (ve gerekirse ExamParticipantCount) güncellenir.

Bu yapı hem tek sınav (deneme) hem de ileride çok oturumlu (örn. TYT+AYT) senaryolara uyumludur.
