# Frontend: Ders Hiyerarşisi (CategorySub) ve Soru Ekleme Akışı

Bu rapor, **soru ekleme/güncelleme** ekranında kullanılacak **Lesson Main → Sub → Mikro** listeleme endpoint’leri ile **LessonMikroId zorunluluğu** kurallarını örnek istek/cevaplarla açıklar.

---

## 1. Genel Mantık

- Her **soru** mutlaka bir **mikro konu (LessonMikro)** ile ilişkilendirilir. **LessonMikroId** soru eklerken **zorunludur**.
- Mikro konu, **CategorySub** (kitapçık kategorisi) ile **hiyerarşik** olarak bağlı olmalıdır:  
  `LessonMikro → LessonSub → LessonMain → Lesson → CategorySub`.
- Kitapçığın **CategorySubId** bilgisi ile sadece **o kategoriye ait** ders hiyerarşisi (Main → Sub → Mikro) listelenir; böylece soru eklerken yanlış kategoriden mikro seçimi yapılamaz.

**Akış özeti:**

1. Kitapçık (booklet) seçilir veya açılır → **CategorySubId** alınır (kitapçık detayında mevcut).
2. Bu **CategorySubId** ile **ana dersler (LessonMain)** listelenir.
3. Kullanıcı bir **Main** seçer → o main’e ait **alt konular (LessonSub)** listelenir.
4. Kullanıcı bir **Sub** seçer → o sub’a ait **mikro konular (LessonMikro)** listelenir.
5. Kullanıcı bir **Mikro** seçer → soru ekleme/güncelleme isteğinde **LessonMikroId** bu mikro’nun **Id**’si olarak gönderilir.

---

## 2. Temel Bilgiler

| Bilgi | Değer |
|-------|--------|
| **Base URL** | `https://<api-host>/api` |
| **Admin Lesson controller** | `AdminLesson` |
| **Admin Question Booklet controller** | `AdminQuestionBooklet` |
| **Kimlik doğrulama** | Bearer token (Admin). Tüm isteklerde `Authorization: Bearer <token>` gerekir. |

**CategorySubId nereden gelir?**  
Kitapçık detayından: `GET /api/AdminQuestionBooklet/booklet/{bookletId}` cevabındaki **categorySubId** alanı.

---

## 3. Endpoint’ler ve Örnek Gidiş–Dönüşler

### 3.1. Ana ders listesi (LessonMain) — CategorySub’a göre

Soru ekleme ekranında “Ana ders” dropdown/lista için kullanılır. Sadece ilgili kitapçık kategorisine (CategorySub) bağlı ana dersler döner.

**İstek**

```http
GET /api/AdminLesson/by-category-sub/{categorySubId}/mains
Authorization: Bearer <token>
```

**Örnek URL**

```
GET /api/AdminLesson/by-category-sub/a1b2c3d4-e5f6-7890-abcd-ef1234567890/mains
```

**Örnek cevap (200 OK)**

```json
[
  {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "lessonId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "code": "MAT",
    "name": "Matematik",
    "description": null,
    "orderIndex": 1,
    "isActive": true,
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": null,
    "categorySubId": null
  },
  {
    "id": "d4e5f6a7-b8c9-0123-def0-234567890123",
    "lessonId": "e5f6a7b8-c9d0-1234-ef01-345678901234",
    "code": "FIZ",
    "name": "Fizik",
    "description": null,
    "orderIndex": 2,
    "isActive": true,
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": null,
    "categorySubId": null
  }
]
```

**Kullanım:** İlk adımda `categorySubId` (kitapçıktan) ile çağrılır; dönen listeden kullanıcı bir **main** seçer. Bir sonraki adımda seçilen **main.id** kullanılır.

---

### 3.2. Alt konu listesi (LessonSub) — CategorySub + Main’e göre

Seçilen ana derse ait alt konuları listeler. Main’in bu CategorySub’a ait olduğu API tarafından doğrulanır.

**İstek**

```http
GET /api/AdminLesson/by-category-sub/{categorySubId}/mains/{mainId}/subs
Authorization: Bearer <token>
```

**Örnek URL**

```
GET /api/AdminLesson/by-category-sub/a1b2c3d4-e5f6-7890-abcd-ef1234567890/mains/b2c3d4e5-f6a7-8901-bcde-f12345678901/subs
```

**Örnek cevap (200 OK)**

```json
[
  {
    "id": "f6a7b8c9-d0e1-2345-f012-456789012345",
    "lessonMainId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "code": "TRG",
    "name": "Trigonometri",
    "description": null,
    "orderIndex": 1,
    "isActive": true,
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": null,
    "categorySubId": null
  },
  {
    "id": "a7b8c9d0-e1f2-3456-0123-567890123456",
    "lessonMainId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "code": "LMT",
    "name": "Limit",
    "description": null,
    "orderIndex": 2,
    "isActive": true,
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": null,
    "categorySubId": null
  }
]
```

**Kullanım:** Kullanıcı bir **sub** seçer; bir sonraki adımda **sub.id** kullanılır.

**Hata (404):** Main bulunamazsa veya bu CategorySub’a ait değilse:

```json
{
  "error": "Ders içeriği (LessonMain) bulunamadı veya bu kategori (CategorySub) ile eşleşmiyor."
}
```

---

### 3.3. Mikro konu listesi (LessonMikro) — CategorySub + Main + Sub’a göre

Seçilen alt konuya ait mikro konuları listeler. Sub’un bu main ve CategorySub ile uyumlu olduğu API tarafından doğrulanır. Soru eklerken gönderilecek **LessonMikroId** bu listedeki bir öğenin **id** alanıdır.

**İstek**

```http
GET /api/AdminLesson/by-category-sub/{categorySubId}/mains/{mainId}/subs/{subId}/mikros
Authorization: Bearer <token>
```

**Örnek URL**

```
GET /api/AdminLesson/by-category-sub/a1b2c3d4-e5f6-7890-abcd-ef1234567890/mains/b2c3d4e5-f6a7-8901-bcde-f12345678901/subs/f6a7b8c9-d0e1-2345-f012-456789012345/mikros
```

**Örnek cevap (200 OK)**

```json
[
  {
    "id": "b8c9d0e1-f2a3-4567-1234-678901234567",
    "lessonSubId": "f6a7b8c9-d0e1-2345-f012-456789012345",
    "code": "TRG-01",
    "name": "Birim çember ve açılar",
    "description": null,
    "orderIndex": 1,
    "isActive": true,
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": null
  },
  {
    "id": "c9d0e1f2-a3b4-5678-2345-789012345678",
    "lessonSubId": "f6a7b8c9-d0e1-2345-f012-456789012345",
    "code": "TRG-02",
    "name": "Trigonometrik fonksiyonlar",
    "description": null,
    "orderIndex": 2,
    "isActive": true,
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": null
  }
]
```

**Kullanım:** Kullanıcı bir **mikro** seçer. Soru ekleme/güncelleme isteğinde **lessonMikroId** olarak bu mikro’nun **id** değeri gönderilir (örn. `b8c9d0e1-f2a3-4567-1234-678901234567`).

**Hata (404):** Sub bulunamazsa veya main/categorySub ile eşleşmiyorsa:

```json
{
  "error": "Alt konu (LessonSub) bulunamadı veya bu main/kategori ile eşleşmiyor."
}
```

---

## 4. Soru Ekleme (LessonMikroId zorunlu)

Slota soru eklerken body’de **lessonMikroId** zorunludur; yukarıdaki akışla seçilen mikro’nun **id**’si verilir.

**İstek**

```http
POST /api/AdminQuestionBooklet/slot/{slotId}/question
Authorization: Bearer <token>
Content-Type: application/json
```

**Örnek URL**

```
POST /api/AdminQuestionBooklet/slot/11111111-2222-3333-4444-555555555555/question
```

**Örnek body (AddQuestionToBookletDto)**

```json
{
  "stem": "Birim çemberde 90° lik açının radyan cinsinden değeri aşağıdakilerden hangisidir?",
  "stemImageUrl": null,
  "options": [
    { "optionKey": "A", "text": "π/6",   "imageUrl": null, "orderIndex": 1 },
    { "optionKey": "B", "text": "π/4",   "imageUrl": null, "orderIndex": 2 },
    { "optionKey": "C", "text": "π/3",   "imageUrl": null, "orderIndex": 3 },
    { "optionKey": "D", "text": "π/2",   "imageUrl": null, "orderIndex": 4 }
  ],
  "correctOptionKey": "D",
  "lessonMikroId": "b8c9d0e1-f2a3-4567-1234-678901234567"
}
```

**Başarılı cevap (200 OK)**  
Slota ait güncel slot/soru bilgisini dönen bir obje (ör. `QuestionBookletSlotDto`) gelir; detaylar API dokümantasyonundaki modele göre işlenebilir.

**Hata cevapları (400 Bad Request)**

| Durum | Mesaj |
|--------|--------|
| LessonMikroId boş/eksik | `"Soru eklerken LessonMikroId zorunludur; mikro konu seçiniz."` |
| Mikro bulunamadı | `"Belirtilen mikro konu (LessonMikro) bulunamadı."` |
| Mikro, kitapçık kategorisi ile uyumsuz | `"Seçilen mikro konu, kitapçığın kategorisi (CategorySub) ile hiyerarşik olarak bağlı değildir. Bu kitapçığa yalnızca ilgili kategorideki ders hiyerarşisine ait mikro konular eklenebilir."` |

Örnek hata body:

```json
{
  "error": "Soru eklerken LessonMikroId zorunludur; mikro konu seçiniz."
}
```

---

## 5. Soru Güncelleme (LessonMikroId opsiyonel)

Mikro konuyu değiştirmek için **lessonMikroId** gönderilir; verilirse yine aynı CategorySub uyumu kontrol edilir.

**İstek**

```http
PUT /api/AdminQuestionBooklet/slot/{slotId}/question
Authorization: Bearer <token>
Content-Type: application/json
```

**Örnek body (UpdateQuestionInBookletDto) — sadece mikro değişiyorsa**

```json
{
  "stem": null,
  "stemImageUrl": null,
  "options": null,
  "correctOptionKey": null,
  "lessonMikroId": "c9d0e1f2-a3b4-5678-2345-789012345678"
}
```

**Not:** Diğer alanlar (stem, options, correctOptionKey) null bırakılırsa mevcut değerler korunur. **lessonMikroId** verilirse kitapçık CategorySub’ı ile hiyerarşik uyum kontrolü yapılır; uygunsa hem LessonMikroId hem LessonSubId güncellenir.

**Hata (400):** Mikro bulunamazsa veya kategori uyumsuzsa yine yukarıdaki “mikro bulunamadı” / “hiyerarşik olarak bağlı değildir” mesajları döner.

---

## 6. Frontend Akış Özeti

1. **Kitapçık aç**  
   `GET /api/AdminQuestionBooklet/booklet/{bookletId}` → **categorySubId** al.

2. **Ana ders listesini al**  
   `GET /api/AdminLesson/by-category-sub/{categorySubId}/mains`  
   → Kullanıcı bir **Main** seçer (main.id saklanır).

3. **Alt konu listesini al**  
   `GET /api/AdminLesson/by-category-sub/{categorySubId}/mains/{mainId}/subs`  
   → Kullanıcı bir **Sub** seçer (sub.id saklanır).

4. **Mikro konu listesini al**  
   `GET /api/AdminLesson/by-category-sub/{categorySubId}/mains/{mainId}/subs/{subId}/mikros`  
   → Kullanıcı bir **Mikro** seçer (mikro.id = **lessonMikroId** olarak kullanılacak).

5. **Slota soru ekle**  
   `POST /api/AdminQuestionBooklet/slot/{slotId}/question`  
   Body: stem, options, correctOptionKey, **lessonMikroId** (zorunlu).

6. **Soru güncelle (isteğe bağlı)**  
   `PUT /api/AdminQuestionBooklet/slot/{slotId}/question`  
   Body: İstenen alanlar + isteğe bağlı **lessonMikroId** (verilirse aynı kategori kuralları uygulanır).

---

## 7. Özet Tablo

| Amaç | Metot | URL | Zorunlu parametre |
|------|--------|-----|--------------------|
| Ana ders listesi | GET | `/api/AdminLesson/by-category-sub/{categorySubId}/mains` | categorySubId |
| Alt konu listesi | GET | `.../mains/{mainId}/subs` | categorySubId, mainId |
| Mikro konu listesi | GET | `.../subs/{subId}/mikros` | categorySubId, mainId, subId |
| Slota soru ekle | POST | `/api/AdminQuestionBooklet/slot/{slotId}/question` | slotId, body içinde **lessonMikroId** |
| Slottaki soruyu güncelle | PUT | `/api/AdminQuestionBooklet/slot/{slotId}/question` | slotId, body’de isteğe bağlı lessonMikroId |

Tüm isteklerde **Authorization: Bearer &lt;admin-token&gt;** header’ı gönderilmelidir.
