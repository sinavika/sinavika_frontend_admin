# Kitapçık Akışı — API ve Frontend Uyumu Raporu

## Soru
- Kitapçıklar **sınava mı** eklenir?
- Kitapçıklar **şablona göre mi** eklenmeli?
- API mi hatalı, frontend mi hatalı?

---

## 1. Rapor (doc) ne diyor?

**01-Questions-Controllers-Tanitim.md / 02-Questions-API-Endpoints-Detay.md** özeti:

- **QuestionBooklet** = Bir **sınavın** (Exam) içindeki **tek bir soru yuvası**. **Şablona** (QuestionBookletTemplate) ve derse (Lesson) bağlıdır.
- **Add-question (2.3):**  
  *"Bölüm şablonu (QuestionBookletTemplate.Id) ve sınav bilgisi ile yeni soru oluşturup kitapçık satırı ekler. **ExamSectionId veya QuestionsTemplateId = bölüm şablonu Id**."*
- **Akış:**  
  *"**Sınava**, **şablon bölümüne (QuestionBookletTemplate.Id) göre** kitapçık satırları eklenir."*

Yani:

- Kitapçık satırları **sınava** eklenir (**examId** zorunlu).
- Hangi **bölüme** ekleneceği **şablonla** belirlenir: **bölüm şablonu Id = QuestionBookletTemplate.Id**.
- API doğru: hem sınav hem de **şablon bölümü Id** (QuestionBookletTemplate.Id) kullanılıyor; kitapçık “şablona göre” ekleniyor.

---

## 2. API özeti (hatalı değil)

| Ne | Açıklama |
|----|----------|
| Kitapçık nereye eklenir? | **Sınava** (examId zorunlu). |
| Bölüm nasıl belirlenir? | **Şablon bölümü Id** (QuestionBookletTemplate.Id) — add-question body'de `examSectionId` veya `questionsTemplateId` olarak gönderilir; ikisi de **bölüm şablonu Id** anlamında. |
| Akış | 1) Şablonlar (QuestionBookletTemplate) oluşturulur → 2) Sınav oluşturulur → 3) Sınava şablon atanır (ExamSection assign) → 4) Kitapçık sayfasında sınav seçilir, **şablon bölümüne göre** soru eklenir. |

API tasarımı tutarlı: kitapçıklar sınava eklenir, bölüm şablona göre (QuestionBookletTemplate.Id) seçilir.

---

## 3. Frontend’de tespit edilen risk (düzeltildi)

- **Risk:** Bölüm listesi `getSectionsByExamId` (ExamSection) ile alınıyordu. Soru eklerken `section.questionsTemplateId || section.id` gönderiliyordu.  
  Eğer backend `section.questionsTemplateId` dönmüyorsa veya `section.id` (ExamSection.Id) template row id değilse, **yanlış id** gidiyordu; API ise **QuestionBookletTemplate.Id** bekliyor.
- **Doğru davranış:** Add-question’da **mutlaka bölüm şablonu Id (QuestionBookletTemplate.Id)** gönderilmeli. Bu id, sınava şablon atanırken (Exams > Yönet > Şablon ata) kullanılan **kitapçık şablonu satırı id**’si (qt.id) ile aynı olmalı; backend bunu ExamSection ile ilişkilendiriyor olabilir.
- **Yapılan düzeltme:**
  - Soru eklerken **sadece** `questionsTemplateId = section.questionsTemplateId` (bölüm şablonu Id) kullanılıyor.
  - Eğer `section.questionsTemplateId` yoksa soru eklenmiyor; kullanıcıya “Bu bölüm için kitapçık şablonu atanmamış. Sınav > Yönet’ten şablon atayın.” uyarısı gösteriliyor.
  - Gruplama ve liste hâlâ `questionsTemplateId || section.id` ile yapılıyor (mevcut backend cevabına uyum için).

---

## 4. Sonuç

- **API:** Hatalı değil. Kitapçıklar sınava eklenir, bölüm şablona göre (QuestionBookletTemplate.Id) belirlenir.
- **Frontend:** Bölüm şablonu Id’nin net kullanılması ve eksik şablon atamasında hata verilmesi için kod güncellendi; rapor bu mantığa göre yazıldı.

Bu rapor, `docs/01-Questions-Controllers-Tanitim.md` ve `docs/02-Questions-API-Endpoints-Detay.md` ile uyumludur.
