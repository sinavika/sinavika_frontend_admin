# Entity/Categories ve İlgili Controller'lar — Amaç ve İşlev Tanıtımı

Bu dokümanda **Entity/Categories** altındaki entity'ler ile **API/Controllers/Categories** altındaki controller'ların amacı ve işlevleri özetlenir.

---

## 1. Entity Yapısı (Entity/Categories)

### 1.1 Category (Ana kategori)

- **Amaç:** Sınav ana kategorisi (örn: YKS, KPSS, ALES, DGS). Sınav türünün en üst seviyesidir.
- **Ana alanlar:** Id, Code, Name, ImageUrl, IsActive, CreatedAt, UpdatedAt, CreatedBy, UpdatedBy.
- **İlişkiler:** Exams (bu kategoriye ait sınavlar), SubTypes (CategorySub — alt kategoriler).

### 1.2 CategorySub (Alt kategori)

- **Amaç:** Sınav alt kategorisi (örn: YKS > TYT/AYT, KPSS > Lisans/Önlisans). Ana kategoriye bağlıdır; ders listesi, bölüm şablonları ve sınav özellikleri bu seviyede tanımlanır.
- **Ana alanlar:** Id, CategoryId, Code, Name, IsActive, CreatedAt, UpdatedAt, CreatedBy, UpdatedBy.
- **İlişkiler:** Category, Exams, Lessons (bu alt kategoriye bağlı dersler), Feature (CategoryFeature — tek kayıt), Sections (CategorySection — bölüm şablonları).

### 1.3 CategorySection (Bölüm şablonu)

- **Amaç:** Alt kategorideki bir sınav bölümünün şablonu. Bölüm adı, soru sayısı, süre (dakika), ders (Lesson) ve sıra bilgisi burada tanımlanır. Konu bazlı dağılım CategorySectionLessonQuota ile ilişkilidir.
- **Ana alanlar:** Id, CategorySubId, LessonId, LessonMainId, Name, OrderIndex, QuestionCount, DurationMinutes, MinQuestions, MaxQuestions, CreatedAt, UpdatedAt.
- **İlişkiler:** CategorySub, Lesson.

### 1.4 CategoryFeature (Sınav özellikleri)

- **Amaç:** Alt kategoriye (CategorySub) ait sınav özellikleri: hedef soru sayısı, süre, şık sayısı, net/negatif puanlama kuralı. Sınav hazırlanırken ana/alt kategori seçildiğinde bu bilgiler kullanılır; Exam ile doğrudan FK yoktur.
- **Ana alanlar:** Id, CategorySubId, DefaultQuestionCount, DefaultDurationMinutes, DefaultQuestionOptionCount, UsesNegativeMarking, NegativeMarkingRule, Version, CreatedAt, UpdatedAt.
- **İlişki:** CategorySub (1:1).

---

## 2. Controller'ların Amaç ve İşlevleri

### 2.1 AdminCategoryController

- **Base route:** `api/AdminCategory`
- **Amaç:** Ana kategori (Category) CRUD ve resim yönetimi.
- **İşlevler:**
  - Tüm kategorileri listeleme.
  - Id ile kategori getirme.
  - Yeni kategori oluşturma (form + opsiyonel resim dosyası).
  - Kategori adı/bilgi güncelleme (JSON body).
  - Kategori resmi güncelleme (query id + form file).
  - Kategori silme.
- **Yetki:** Admin (`[Authorize]`, `AdminContextHelper`).

### 2.2 AdminCategorySubController

- **Base route:** `api/AdminCategorySub`
- **Amaç:** Alt kategori (CategorySub) CRUD. Ana kategoriye bağlı alt kategorileri yönetir.
- **İşlevler:**
  - Ana kategori Id ile alt kategorileri listeleme (`/{categoryId}/subs`).
  - Id ile alt kategori getirme.
  - Yeni alt kategori oluşturma (CategoryId, Code, Name, IsActive).
  - Alt kategori güncelleme / silme.
- **Yetki:** Admin.

### 2.3 AdminCategorySectionController

- **Base route:** `api/AdminCategorySection`
- **Amaç:** Bölüm şablonu (CategorySection) CRUD. Alt kategorideki bölümleri (ders, soru sayısı, süre) tanımlar.
- **İşlevler:**
  - Tüm bölüm şablonlarını listeleme.
  - Id ile bölüm şablonu getirme.
  - Alt kategori Id ile bölüm şablonlarını listeleme (`by-sub/{categorySubId}`).
  - Yeni bölüm şablonu oluşturma, güncelleme, silme.
- **Yetki:** Admin.

### 2.4 AdminCategoryFeatureController

- **Base route:** `api/AdminCategoryFeature`
- **Amaç:** Alt kategori sınav özellikleri (CategoryFeature) CRUD. Soru sayısı, süre, şık sayısı, negatif puanlama kuralları.
- **İşlevler:**
  - Tüm kategori özelliklerini listeleme.
  - Id ile özellik getirme.
  - Alt kategori Id ile ilgili özellik kaydını getirme (`by-sub/{categorySubId}`).
  - Yeni özellik oluşturma, güncelleme, silme.
- **Yetki:** Admin.

### 2.5 CategoriesController (Partner API)

- **Base route:** `api/Categories`
- **Amaç:** Partner tarafı için salt okunur liste. Tüm kategorileri alt kategorileri (CategorySub) ile birlikte döner.
- **İşlevler:**
  - `all-with-subs`: Kategoriler + her birinin CategorySub listesi (Id, Code, Name, ImageUrl, IsActive, CreatedAt, UpdatedAt, CategorySubs).
- **Yetki:** **Authorize gerekmez** (Swagger grubu: partner).

---

## 3. Akış Özeti

1. **Ana kategori:** AdminCategory ile Category oluşturulur (kod, ad, isteğe bağlı resim).
2. **Alt kategori:** AdminCategorySub ile CategorySub oluşturulur (CategoryId ile bağlı).
3. **Bölüm şablonu:** AdminCategorySection ile CategorySection eklenir (CategorySubId, LessonId, Name, OrderIndex, QuestionCount, DurationMinutes vb.).
4. **Sınav özellikleri:** AdminCategoryFeature ile CategoryFeature eklenir (CategorySubId, DefaultQuestionCount, DefaultDurationMinutes, UsesNegativeMarking vb.).
5. **Partner:** CategoriesController `all-with-subs` ile kategoriler ve alt kategoriler tek istekte alınır.

Hiyerarşi: **Category** → **CategorySub** → **CategorySection** (bölümler) ve **CategoryFeature** (alt kategori başına tek özellik kaydı).
