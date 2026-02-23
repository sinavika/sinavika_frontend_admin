# Entity/Questions ve İlgili Controller'lar — Amaç ve İşlev Tanıtımı

Bu dokümanda **Entity/Questions** altındaki entity'ler ile **API/Controllers/Questions** altındaki admin controller'ların amacı ve işlevleri özetlenir.

---

## 1. Entity Yapısı (Entity/Questions)

### 1.1 Question (Soru)

- **Amaç:** Sınavda kullanılan tek bir soru kaydı. Bağımsız “soru havuzu” yok; her soru **yalnızca bir kitapçık satırı (QuestionBooklet)** ile ilişkilidir.
- **Ana alanlar:** Id, Code (benzersiz), Stem (soru metni), QuestionBookletId (FK), PublisherId, LessonSubId, CreatedAt, UpdatedAt.
- **İlişkiler:** QuestionBooklet (1:1), QuestionOptions (şıklar), QuestionOptionCorrectAnswer (doğru cevap), QuestionSolutions (çözümler).

### 1.2 QuestionOption

- **Amaç:** Sorunun şıkları (A, B, C, D, E vb.). Metin hash/encrypted saklanır.
- **Ana alanlar:** Id, OptionKey, TextHash, TextEncrypted, OrderIndex, QuestionId.

### 1.3 QuestionOptionCorrectAnswer

- **Amaç:** Sorunun doğru şık bilgisi (hangi OptionKey doğru).
- **İlişki:** Question ile 1:1.

### 1.4 QuestionBooklet (Kitapçık satırı)

- **Amaç:** Bir sınavın (Exam) içindeki **tek bir soru yuvası**. Şablona (QuestionBookletTemplate) ve derse (Lesson) bağlıdır; her satırda en fazla bir soru (Question) bulunur.
- **Ana alanlar:** Id, ExamId, QuestionsTemplateId (FK → QuestionBookletTemplate, bölüm şablonu), LessonId, Name, OrderIndex, CreatedByAdminId, CreatedAt.
- **İlişkiler:** Exam, QuestionBookletTemplate, Lesson, Question (1:1), CreatedByAdmin.

### 1.5 QuestionBookletTemplate (Kitapçık şablonu)

- **Amaç:** Sınav **şablon setinin bir bölüm satırı**. Kategori, alt kategori ve bölüm (CategorySection) bazında “bu bölümde kaç soru olacak” gibi kurallar tanımlanır. Aynı sette birden fazla bölüm satırı **QuestionsTemplateId** ile gruplanır.
- **Ana alanlar:** Id, Code, Name, Description, DifficultyMix, CategoryId, CategorySubId, **QuestionsTemplateId** (şablon seti id’si), CategorySectionId, TargetQuestionCount, TotalQuestionCount, OrderIndex, IsActive, CreatedAt, UpdatedAt.
- **İlişkiler:** Category, CategorySub, CategorySection, CreatedByAdmin, LastUpdatedByAdmin.

### 1.6 QuestionSolution (Entity.Solution)

- **Amaç:** Bir soruya bağlı çözüm içeriği (metin, video, pdf, link). Bir soruda birden fazla çözüm olabilir; **OrderIndex** ile sıralanır.
- **Ana alanlar:** Id, Code (8 karakter, otomatik), QuestionId, Type (ExplanationText=0, Video=1, Pdf=2, Link=3), Title, ContentText, Url, OrderIndex, IsActive, CreatedByAdminId, CreatedAt, UpdatedAt.

---

## 2. Controller'ların Amaç ve İşlevleri

### 2.1 AdminQuestionBookletTemplateController

- **Base route:** `api/AdminQuestionBookletTemplate`
- **Amaç:** Kitapçık **şablon** yönetimi. Sınav türüne göre “hangi bölümler, kaç soru” tanımlanır.
- **İşlevler:**
  - Yeni şablon satırı oluşturma (veya mevcut şablon setine bölüm ekleme).
  - Şablon satırını güncelleme / silme.
  - Tüm şablonları listeleme, Id ile getirme.
  - Alt kategori (CategorySubId) veya şablon seti (QuestionsTemplateId) ile filtreli listeleme.

### 2.2 AdminQuestionBookletController

- **Base route:** `api/AdminQuestionBooklet`
- **Amaç:** Belirli bir **sınava (Exam)** ait kitapçık satırlarını ve bu satırlara soru ekleme/çıkarma işlemlerini yönetmek.
- **İşlevler:**
  - Sınava göre kitapçık satırlarını listeleme (bölüm bazlı sorular).
  - Kitapçık satırı detayını Id ile getirme.
  - Kitapçık bölümüne **yeni soru ekleme** (Stem, Options, CorrectOptionKey ile; bölüm = QuestionBookletTemplate.Id).
  - Kitapçıktan bir soru satırını kaldırma (silme).

### 2.3 AdminQuestionController

- **Base route:** `api/AdminQuestion`
- **Amaç:** Soru **kayıtlarına erişim** (Id/Code ile getirme, sayfalı listeleme) ve kitapçık bölümüne soru ekleme (alternatif endpoint).
- **İşlevler:**
  - Soru getirme: Id veya Code ile.
  - Soru listesini sayfalı getirme (skip, take; isteğe bağlı lessonSubId, publisherId filtreleri).
  - Kitapçık bölümüne soru ekleme (AddToBooklet — AdminQuestionBooklet’teki AddQuestion ile aynı iş mantığı).

### 2.4 AdminQuestionSolutionController

- **Base route:** `api/AdminQuestionSolution`
- **Amaç:** Soru **çözümü** CRUD (metin, video, pdf, link). Bir soruya birden fazla çözüm eklenebilir.
- **İşlevler:**
  - Çözüm oluşturma, güncelleme, silme.
  - Id ile çözüm getirme.
  - Belirli bir soruya (QuestionId) ait tüm çözümleri OrderIndex’e göre listeleme.

---

## 3. Akış Özeti

1. **Şablon:** `AdminQuestionBookletTemplate` ile önce şablon seti ve bölüm satırları (QuestionBookletTemplate) oluşturulur.
2. **Sınav:** Exam oluşturulur (başka API ile).
3. **Kitapçık / Soru:** `AdminQuestionBooklet` veya `AdminQuestion` ile sınava, şablon bölümüne (QuestionBookletTemplate.Id) göre kitapçık satırları eklenir ve her satıra bir soru (Stem, Options, CorrectOptionKey) bağlanır.
4. **Çözüm:** `AdminQuestionSolution` ile soruya çözümler (metin/video/pdf/link) eklenir.

Tüm controller’lar **admin yetkisi** gerektirir (`[Authorize]`, `AdminContextHelper.GetAdminId`).
