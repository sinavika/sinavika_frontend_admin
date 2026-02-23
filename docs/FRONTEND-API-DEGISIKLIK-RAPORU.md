# Frontend — API Değişiklik Raporu (Kitapçık & Soru Refaktörü)

Bu dokümanda **kitapçık (QuestionBooklet)** ve **soru (Question)** ile ilgili yapılan tüm API ve veri yapısı değişiklikleri, frontend tarafında yapılması gerekenlerle birlikte listelenmiştir.

---

## 1. Özet: Ne Değişti?

| Konu | Eski | Yeni |
|------|------|------|
| Kitapçık oluşturma | Yoktu; soru eklerken booklet+question tek istekte oluşuyordu | **Önce kitapçık oluşturulur** (şablona göre), **sonra** kitapçık id ile soru eklenir |
| Soru ekleme | `POST /api/AdminQuestionBooklet/add-question` (ExamId + ExamSectionId + Stem, Options...) | `POST /api/AdminQuestionBooklet/{bookletId}/question` (sadece bookletId + soru içeriği) |
| Soru güncelleme / silme | Ayrı endpoint yoktu | `PUT /api/AdminQuestionBooklet/{bookletId}/question` ve `DELETE /api/AdminQuestionBooklet/{bookletId}/question` |
| Kitapçık–sınav ilişkisi | ExamId zorunluydu | **ExamId artık opsiyonel**; kitapçık önce oluşturulup sonra sınava atanır (id veya **Code** ile) |
| Kitapçık kodu | Yoktu | Her kitapçığa **Code** (8 karakter, otomatik) atanıyor; sınav oluştururken **Code** veya Id ile atama yapılabilir |
| AdminQuestion | add-to-booklet vardı | **add-to-booklet kaldırıldı**; tüm soru ekleme/güncelleme/silme **AdminQuestionBooklet** üzerinden |
| AdminQuestionSolutionController | CRUD endpoint'leri vardı | **Controller tamamen kaldırıldı** (soru çözümü API’si şu an yok) |

---

## 2. Yeni İş Akışı (Frontend’in Takip Etmesi Gereken)

1. **Şablon** → `AdminQuestionBookletTemplate` ile bölüm şablonları oluşturulur (mevcut API aynı).
2. **Kitapçık oluştur** → `POST /api/AdminQuestionBooklet` ile şablona göre kitapçık satırı oluşturulur. Response’ta **Id** ve **Code** gelir (Code backend’de otomatik atanır).
3. **Sınava atama**  
   - Ya kitapçık oluştururken body’de **ExamId** verilir,  
   - Ya sınav oluşturulurken **AdminExamCreateDto** içinde **BookletIds** veya **BookletCodes** verilir,  
   - Ya da sonradan `PUT /api/AdminQuestionBooklet/{bookletId}/assign-exam/{examId}` ile atanır.
4. **Soru ekle** → `POST /api/AdminQuestionBooklet/{bookletId}/question` (kitapçık boş olmalı).
5. **Soru güncelle** → `PUT /api/AdminQuestionBooklet/{bookletId}/question`.
6. **Soru kaldır** → `DELETE /api/AdminQuestionBooklet/{bookletId}/question` (kitapçık satırı kalır).
7. **Kitapçık sil** → `DELETE /api/AdminQuestionBooklet/{id}` (ilişkili soru da silinir).

---

## 3. Entity / Response Yapısı Değişiklikleri

### 3.1 QuestionBooklet (Kitapçık) — Response’ta Dönen Model

API’den dönen **kitapçık** nesnesi artık aşağıdaki alanlara sahip. Frontend’te tipler buna göre güncellenmeli.

| Alan | Tip | Açıklama |
|------|-----|----------|
| **id** | string (guid) | Kitapçık satırı id |
| **code** | string | **YENİ.** 8 karakter, benzersiz; create’te backend atar. Sınav oluştururken atamada kullanılabilir. |
| **examId** | string (guid) \| null | **DEĞİŞTİ.** Artık **nullable**. Sınava atanmamışsa `null`. |
| examSectionId | string (guid) | Bölüm şablonu id (QuestionsTemplateId) |
| questionsTemplateId | string (guid) \| null | Bölüm şablonu id |
| lessonId | string (guid) | Ders id |
| name | string \| null | Ad |
| lessonName | string \| null | Ders adı (dolu olmayabilir) |
| orderIndex | number | Sıra |
| questionId | string (guid) \| null | Bu satırdaki soru id (yoksa null) |
| questionCode | string \| null | Soru kodu |
| stem | string \| null | Soru metni |
| optionsJson | string \| null | (Eski alan; gerekirse kullanılır) |
| correctOptionKey | string \| null | Doğru şık |
| createdAt | string (ISO date) | Oluşturulma zamanı |

**TypeScript örnek tip:**

```ts
interface QuestionBookletDto {
  id: string;
  code: string;
  examId: string | null;
  examSectionId: string;
  questionsTemplateId: string | null;
  lessonId: string;
  name: string | null;
  lessonName: string | null;
  orderIndex: number;
  questionId: string | null;
  questionCode: string | null;
  stem: string | null;
  optionsJson: string | null;
  correctOptionKey: string | null;
  createdAt: string;
}
```

---

## 4. AdminQuestionBookletController — Tüm Endpoint’ler

Base URL: **`/api/AdminQuestionBooklet`**  
Tüm isteklerde **Authorization: Bearer &lt;token&gt;** gerekir.

### 4.1 Kitapçık oluştur — YENİ

- **Method:** `POST`
- **URL:** `/api/AdminQuestionBooklet`
- **Body (JSON):**

```json
{
  "questionsTemplateId": "guid-bolum-sablonu-id",
  "lessonId": "guid-ders-id",
  "name": "Opsiyonel ad",
  "orderIndex": 1,
  "examId": null
}
```

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| questionsTemplateId | string (guid) | Evet | Bölüm şablonu (QuestionBookletTemplate.Id) |
| lessonId | string (guid) | Evet | Ders id |
| name | string | Hayır | Kitapçık satırı adı |
| orderIndex | number | Evet | Sıra |
| examId | string (guid) \| null | Hayır | İsterseniz oluştururken sınava atayabilirsiniz |

- **Response 200:** Yukarıdaki `QuestionBookletDto` (id, **code**, examId, …) döner. **Code** artık her zaman dolu gelir.
- **Response 400:** `{ "error": "Kitapçık oluşturulamadı. QuestionsTemplateId ve LessonId geçerli olmalıdır." }`
- **Response 500:** `{ "error": "..." }`

---

### 4.2 Sınava ait kitapçıkları listele

- **Method:** `GET`
- **URL:** `/api/AdminQuestionBooklet/by-exam/{examId}`
- **Response 200:** `QuestionBookletDto[]` — Liste. Her öğede **code** ve **examId** (nullable) vardır.

---

### 4.3 Id ile kitapçık getir

- **Method:** `GET`
- **URL:** `/api/AdminQuestionBooklet/{id}`
- **Response 200:** Tek `QuestionBookletDto` (içinde **code** ve **examId**)

---

### 4.4 Code ile kitapçık getir — YENİ

- **Method:** `GET`
- **URL:** `/api/AdminQuestionBooklet/by-code/{code}`
- **Response 200:** Tek `QuestionBookletDto`
- **Response 404:** `{ "error": "Kitapçık satırı bulunamadı." }`

---

### 4.5 Kitapçığa soru ekle — DEĞİŞTİ (URL ve body)

- **Eski (kaldırıldı):** `POST /api/AdminQuestionBooklet/add-question`  
  Body: ExamId, ExamSectionId, LessonId, Name, OrderIndex, Stem, Options, CorrectOptionKey, …
- **Yeni:**  
  - **Method:** `POST`  
  - **URL:** `/api/AdminQuestionBooklet/{bookletId}/question`  
  - **Body (JSON):**

```json
{
  "stem": "Soru metni",
  "options": [
    { "optionKey": "A", "text": "Şık A", "orderIndex": 1 },
    { "optionKey": "B", "text": "Şık B", "orderIndex": 2 }
  ],
  "correctOptionKey": "B",
  "lessonSubId": null,
  "publisherId": null
}
```

| Alan | Tip | Zorunlu |
|------|-----|---------|
| stem | string | Evet |
| options | array | Evet (en az bir şık) |
| correctOptionKey | string | Evet (options içindeki bir optionKey) |
| lessonSubId | string (guid) \| null | Hayır |
| publisherId | string (guid) \| null | Hayır |

**options** elemanı: `{ optionKey: string, text: string, orderIndex: number }`

- **Response 200:** Güncel `QuestionBookletDto` (soru bilgileriyle birlikte).
- **Response 400:** `{ "error": "Soru eklenemedi. Stem, Options ve CorrectOptionKey gerekli; kitapçık mevcut ve boş olmalı." }`  
  (Kitapçıkta zaten soru varsa da 400 dönebilir; güncelleme için PUT kullanılmalı.)

---

### 4.6 Kitapçıktaki soruyu güncelle — YENİ

- **Method:** `PUT`
- **URL:** `/api/AdminQuestionBooklet/{bookletId}/question`
- **Body (JSON):** Tüm alanlar opsiyonel; gönderilenler güncellenir.

```json
{
  "stem": "Güncel soru metni",
  "options": [
    { "optionKey": "A", "text": "Yeni A", "orderIndex": 1 },
    { "optionKey": "B", "text": "Yeni B", "orderIndex": 2 }
  ],
  "correctOptionKey": "A",
  "lessonSubId": null,
  "publisherId": null
}
```

- **Response 200:** Güncel `QuestionBookletDto`.
- **Response 404:** `{ "error": "Kitapçık veya soru bulunamadı." }`

---

### 4.7 Kitapçıktan soruyu kaldır — YENİ

- **Method:** `DELETE`
- **URL:** `/api/AdminQuestionBooklet/{bookletId}/question`
- **Response 204:** No Content. Kitapçık satırı kalır, sadece soru silinir.
- **Response 500:** `{ "error": "..." }`

---

### 4.8 Kitapçık satırını sil

- **Method:** `DELETE`
- **URL:** `/api/AdminQuestionBooklet/{id}`
- **Not:** Path’teki **id** kitapçık satırı id’si. İlişkili soru da silinir.
- **Response 204:** No Content.
- **Response 404:** `{ "error": "Kitapçık satırı bulunamadı." }`

---

### 4.9 Kitapçığı sınava ata — YENİ

- **Method:** `PUT`
- **URL:** `/api/AdminQuestionBooklet/{bookletId}/assign-exam/{examId}`
- **Body:** Yok.
- **Response 200:** `{ "message": "Kitapçık sınava atandı." }`
- **Response 404:** `{ "error": "Kitapçık bulunamadı." }`

---

## 5. AdminQuestionController — Değişiklikler

- **Kaldırılan endpoint:**  
  `POST /api/AdminQuestion/add-to-booklet`  
  Artık **soru ekleme** sadece **AdminQuestionBooklet** üzerinden:  
  `POST /api/AdminQuestionBooklet/{bookletId}/question`

- **Aynen kalan endpoint’ler:**
  - `GET /api/AdminQuestion/{id}` — Id ile soru getir
  - `GET /api/AdminQuestion/by-code/{code}` — Code ile soru getir
  - `GET /api/AdminQuestion?skip=0&take=20&lessonSubId=...&publisherId=...` — Sayfalı liste

Frontend’te “kitapçığa soru ekle” akışı **AdminQuestion** yerine **AdminQuestionBooklet** base URL’ine ve yeni path/body’ye taşınmalı.

---

## 6. AdminQuestionSolutionController — Kaldırıldı

- **Tüm endpoint’ler kaldırıldı:**  
  `POST/GET/PUT/DELETE /api/AdminQuestionSolution` ve alt path’ler (create, get by id, get by question, update, delete).
- Soru çözümü (açıklama, video, pdf, link) ile ilgili admin API’si şu an **yok**.  
  Bu özelliği kullanıyorsanız geçici olarak devre dışı bırakılması veya backend’de yeni bir controller tanımlanması gerekir.

---

## 7. Sınav oluşturma (AdminExamCreateDto) — Yeni alanlar

Sınav oluştururken hazır kitapçıkları sınava atamak için body’ye şu alanlar eklendi:

- **Method:** `POST /api/AdminExam/create` (mevcut)
- **Body’ye eklenecek (opsiyonel):**

| Alan | Tip | Açıklama |
|------|-----|----------|
| **bookletIds** | string[] (guid) \| null | Atanacak kitapçık id’leri. Backend bu kitapçıkların ExamId’sini yeni sınav id ile günceller (ExamService.CreateExamAsync implemente edildiğinde). |
| **bookletCodes** | string[] \| null | Atanacak kitapçık kodları (Code). Id yerine code ile atama. |

Örnek:

```json
{
  "title": "Sınav Adı",
  "categoryId": "...",
  "bookletIds": ["kitapcik-guid-1", "kitapcik-guid-2"],
  "bookletCodes": ["ABC12XYZ", "DEF34UVW"]
}
```

**Not:** Backend’de `ExamService.CreateExamAsync` hâlâ `NotImplementedException` ise bu atama henüz çalışmaz; sınav oluşturulduktan sonra frontend `PUT /api/AdminQuestionBooklet/{bookletId}/assign-exam/{examId}` ile tek tek atama yapabilir.

---

## 8. Kaldırılan / Değişen Endpoint Özet Tablosu

| Eski | Yeni / Durum |
|------|------------------|
| `POST /api/AdminQuestionBooklet/add-question` | **Kaldırıldı.** Yerine: `POST /api/AdminQuestionBooklet/{bookletId}/question` |
| `POST /api/AdminQuestion/add-to-booklet` | **Kaldırıldı.** Soru ekleme: `POST /api/AdminQuestionBooklet/{bookletId}/question` |
| `DELETE /api/AdminQuestionBooklet/{id}` (soru satırı siliniyordu) | Aynı URL kaldı; anlamı: **kitapçık satırını sil** (soru da gider). Sadece soruyu kaldırmak için: `DELETE /api/AdminQuestionBooklet/{bookletId}/question` |
| Tüm `/api/AdminQuestionSolution` | **Kaldırıldı.** Soru çözümü API’si yok. |

---

## 9. Frontend Yapılacaklar Listesi

1. **Kitapçık modeli (TypeScript/interface)**  
   - `code: string` ekleyin.  
   - `examId` tipini `string | null` yapın.

2. **Kitapçık oluşturma ekranı**  
   - Yeni akış: Önce şablon seçip `POST /api/AdminQuestionBooklet` ile kitapçık oluşturun.  
   - Response’taki **id** ve **code**’u saklayın; sınav atama veya soru ekleme için kullanın.

3. **Soru ekleme**  
   - Eski: `POST /api/AdminQuestionBooklet/add-question` veya `POST /api/AdminQuestion/add-to-booklet` (ExamId, ExamSectionId, …).  
   - Yeni: Önce kitapçık listesinden veya oluşturduğunuz kayıttan **bookletId** alın;  
     `POST /api/AdminQuestionBooklet/{bookletId}/question`  
     Body: `AddQuestionToBookletDto` (stem, options, correctOptionKey, lessonSubId?, publisherId?).

4. **Soru düzenleme**  
   - `PUT /api/AdminQuestionBooklet/{bookletId}/question`  
     Body: `UpdateQuestionInBookletDto` (stem?, options?, correctOptionKey?, lessonSubId?, publisherId?).

5. **Soru silme (kitapçıktan)**  
   - `DELETE /api/AdminQuestionBooklet/{bookletId}/question`  
   - Kitapçık satırını tamamen silmek için: `DELETE /api/AdminQuestionBooklet/{id}` (id = kitapçık id).

6. **Sınava kitapçık atama**  
   - Ya sınav oluştururken `AdminExamCreateDto.bookletIds` / `bookletCodes` kullanın (backend implemente edildiyse),  
   - Ya da `PUT /api/AdminQuestionBooklet/{bookletId}/assign-exam/{examId}` ile tek tek atayın.

7. **Sınava ait kitapçık listesi**  
   - `GET /api/AdminQuestionBooklet/by-exam/{examId}`  
   - Dönen listede her öğede **code** ve **examId** (null olabilir) kullanılabilir.

8. **Soru çözümü (AdminQuestionSolution)**  
   - Eski Solution endpoint’lerini kullanan sayfalar varsa geçici olarak kapatın veya “yakında” mesajı verin; API kaldırıldı.

9. **Hata mesajları**  
   - 400/404/500’de body’de `{ "error": "..." }` döndüğünü varsayın; aynı yapı korunuyor.

---

## 10. Örnek Akış (Frontend)

**Senaryo:** Sınav oluşturup içine iki bölüm (kitapçık) ve her birine birer soru eklemek.

1. Şablonları al: `GET /api/AdminQuestionBookletTemplate/by-template-set/{questionsTemplateId}` (veya by-category-sub).
2. İlk bölüm için kitapçık oluştur:  
   `POST /api/AdminQuestionBooklet`  
   Body: `{ questionsTemplateId: "...", lessonId: "...", name: "Matematik 1", orderIndex: 1, examId: null }`  
   → Response: `{ id: "booklet-1-guid", code: "ABC12XYZ", ... }`.
3. İkinci bölüm için tekrarla → `booklet-2-guid`, `code: "DEF34UVW"`.
4. Sınav oluştur:  
   `POST /api/AdminExam/create`  
   Body: `{ title: "...", categoryId: "...", bookletIds: ["booklet-1-guid", "booklet-2-guid"] }`  
   (veya create sonrası `PUT .../assign-exam/{examId}` x2).
5. İlk kitapçığa soru ekle:  
   `POST /api/AdminQuestionBooklet/booklet-1-guid/question`  
   Body: `{ stem: "...", options: [...], correctOptionKey: "B" }`.
6. İkinci kitapçığa soru ekle:  
   `POST /api/AdminQuestionBooklet/booklet-2-guid/question`  
   Body: `{ stem: "...", options: [...], correctOptionKey: "A" }`.
7. Sınava ait tüm kitapçıkları göstermek için:  
   `GET /api/AdminQuestionBooklet/by-exam/{examId}`.

Bu rapor, backend’deki tüm ilgili değişiklikleri tek yerde toplar; frontend ekibi yukarıdaki endpoint’ler, body’ler ve tiplere göre entegrasyonu güncelleyebilir.
