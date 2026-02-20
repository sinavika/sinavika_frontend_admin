# Lesson Sistemi Akışı ve Admin Controller Raporu

Bu rapor, Sinavika projesindeki **Lesson** (ders) hiyerarşisinin yeni akışını ve **API/Controllers/Lessons** altındaki tüm Admin controller'ların endpoint'lerini, gidiş-dönüş örnekleriyle açıklar.

---

## 1. Lesson Sistemi Akışı (Yeni Yapı)

### 1.1 Hiyerarşi Özeti

Lesson sistemi **kategoriye bağlı** çalışır. Sadece **Lesson** entity'si Category ile ilişkilidir; LessonMain, LessonSub ve LessonMikro doğrudan Category ile ilişkili değildir.

```
Category (örn: YKS)
  └── CategorySub (örn: TYT, AYT, YDT)
        └── Lesson (ders listesi konteyneri — bu alt kategoriye ait "liste")
              └── LessonMain (ders içeriği: Code, Name — örn: Matematik, Fizik)
                    └── LessonSub (ünite / ana konu — örn: Sayılar, Kuvvet ve Hareket)
                          └── LessonMikro (alt konu — örn: Sayı kümeleri, Newton kanunları)
```

- **Lesson**: İçinde ders adı/kodu yok; yalnızca bir **CategorySub**'a bağlı "liste" konteyneridir. Sıra (OrderIndex) ve aktiflik (IsActive) taşır.
- **LessonMain**: Gerçek ders bilgisini (Code, Name, Description) taşır. Bir Lesson altında birden fazla LessonMain olabilir (Matematik, Fizik, Türkçe vb.).
- **LessonSub**: LessonMain'e bağlı ünite/ana konu (örn: Matematik → Sayılar, Geometrik Şekiller).
- **LessonMikro**: LessonSub'a bağlı alt konu (örn: Sayılar → Sayı kümeleri, Üslü ve köklü gösterim).

Soru (Question) doğrudan **LessonSub** ile ilişkilidir; sınav bölüm şablonları (CategorySection) ise Lesson + LessonMain (ve isteğe bağlı LessonSub) ile tanımlanır.

### 1.2 Entity İlişkileri

| Entity       | Bağlı olduğu   | Açıklama |
|-------------|----------------|----------|
| Lesson      | CategorySub    | Her Lesson bir alt kategoriye (TYT, AYT vb.) aittir. |
| LessonMain  | Lesson         | Ders içeriği (Code, Name) bir "ders listesi"ne aittir. |
| LessonSub   | LessonMain     | Ünite/ana konu, bir ders içeriğine aittir. |
| LessonMikro | LessonSub     | Mikro konu, bir alt konuya aittir. |

Category ve CategorySub ile **yalnızca Lesson** ilişkilidir; LessonMain, LessonSub, LessonMikro kategori ile doğrudan ilişkili değildir.

### 1.3 Tipik Kullanım Akışı

1. **Kategori tarafı**: Category (YKS) ve CategorySub (TYT, AYT) zaten tanımlıdır.
2. **Liste oluşturma**: TYT için bir **Lesson** oluşturulur (`CategorySubId` = TYT'nin Id'si).
3. **Ders ekleme**: Bu Lesson altında **LessonMain** kayıtları eklenir (Matematik, Fizik, Türkçe …).
4. **Ünite ekleme**: Her LessonMain için **LessonSub** eklenir (Sayılar, Kuvvet ve Hareket …).
5. **Alt konu ekleme**: Her LessonSub için **LessonMikro** eklenir.
6. **Soru atama**: Sorular bir **LessonSubId** ile ilişkilendirilir; böylece ders → ünite hiyerarşisi korunur.

---

## 2. Admin Controller'lar ve Endpoint'ler

Tüm endpoint'ler **admin** yetkisi gerektirir (`[Authorize]`). Base URL: `https://api.example.com/api` (veya proje base adresi).

---

### 2.1 AdminLessonController

**Route:** `api/AdminLesson`

Lesson (kategoriye bağlı ders listesi konteyneri) CRUD ve bir endpoint ile LessonMain altına LessonSub ekleme.

| Metot | Route | Açıklama |
|-------|--------|----------|
| GET | `/api/AdminLesson/all` | Tüm Lesson listesini döner. |
| GET | `/api/AdminLesson?id={id}` | Id ile tek Lesson detayı. |
| POST | `/api/AdminLesson/create` | Yeni Lesson oluşturur. |
| PUT | `/api/AdminLesson/update?id={id}` | Lesson günceller. |
| DELETE | `/api/AdminLesson/delete?id={id}` | Lesson'ı pasif yapar (soft delete). |
| POST | `/api/AdminLesson/lesson-main/{lessonMainId}/lesson-sub` | Belirtilen LessonMain'e yeni LessonSub ekler. |

#### GET /api/AdminLesson/all

**Gidiş (Request):**  
- Header: `Authorization: Bearer {admin_token}`  
- Body: yok  

**Dönüş (Response) – 200 OK örnek:**

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "categorySubId": "3fa85f64-5717-4562-b3fc-2c963f66afa7",
    "orderIndex": 1,
    "isActive": true,
    "createdAt": "2025-02-19T12:00:00Z",
    "updatedAt": null,
    "createdByAdminId": "3fa85f64-5717-4562-b3fc-2c963f66afa8",
    "lastUpdatedByAdminId": null,
    "categorySubName": "Temel Yeterlilik Testi",
    "lessonMains": null
  }
]
```

#### POST /api/AdminLesson/create

**Gidiş (Request):**

- Header: `Authorization: Bearer {admin_token}`  
- Body (JSON):

```json
{
  "categorySubId": "3fa85f64-5717-4562-b3fc-2c963f66afa7",
  "orderIndex": 1,
  "isActive": true
}
```

**Dönüş (Response) – 200 OK:**

```json
{
  "message": "Ders listesi başarıyla oluşturuldu."
}
```

#### GET /api/AdminLesson?id={id}

**Gidiş:**  
- Query: `id` = Lesson Guid.

**Dönüş – 200 OK örnek:**

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "categorySubId": "3fa85f64-5717-4562-b3fc-2c963f66afa7",
  "orderIndex": 1,
  "isActive": true,
  "createdAt": "2025-02-19T12:00:00Z",
  "updatedAt": null,
  "createdByAdminId": "3fa85f64-5717-4562-b3fc-2c963f66afa8",
  "lastUpdatedByAdminId": null,
  "categorySubName": "Temel Yeterlilik Testi",
  "lessonMains": null
}
```

#### PUT /api/AdminLesson/update?id={id}

**Gidiş – Body (tüm alanlar opsiyonel):**

```json
{
  "orderIndex": 2,
  "isActive": false
}
```

**Dönüş – 200 OK:**

```json
{
  "message": "Ders listesi başarıyla güncellendi."
}
```

#### DELETE /api/AdminLesson/delete?id={id}

**Dönüş – 200 OK:**

```json
{
  "message": "Ders listesi pasif hale getirildi (soft delete)."
}
```

#### POST /api/AdminLesson/lesson-main/{lessonMainId}/lesson-sub

**Gidiş:**  
- Route: `lessonMainId` = LessonMain Guid.  
- Body:

```json
{
  "code": "MAT_SAYI",
  "name": "Sayılar",
  "description": "Sayı kümeleri ve işlemler",
  "orderIndex": 1,
  "isActive": true
}
```

**Dönüş – 200 OK:**

```json
{
  "message": "Alt konu başarıyla oluşturuldu."
}
```

---

### 2.2 AdminLessonMainController

**Route:** `api/AdminLessonMain`

Ders içeriği (LessonMain) CRUD — bir Lesson altındaki dersler (Matematik, Fizik vb.).

| Metot | Route | Açıklama |
|-------|--------|----------|
| GET | `/api/AdminLessonMain/by-lesson/{lessonId}` | Bir Lesson'a ait tüm LessonMain listesi. |
| GET | `/api/AdminLessonMain/{id}` | Id ile tek LessonMain detayı. |
| POST | `/api/AdminLessonMain/{lessonId}/create` | Belirtilen Lesson altında yeni LessonMain oluşturur. |
| PUT | `/api/AdminLessonMain/{id}` | LessonMain günceller. |
| DELETE | `/api/AdminLessonMain/{id}` | LessonMain siler. |

#### GET /api/AdminLessonMain/by-lesson/{lessonId}

**Gidiş:**  
- Route: `lessonId` = Lesson Guid.

**Dönüş – 200 OK örnek:**

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa9",
    "lessonId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "code": "MAT",
    "name": "Matematik",
    "description": null,
    "orderIndex": 3,
    "isActive": true,
    "createdAt": "2025-02-19T12:00:00Z",
    "updatedAt": null
  },
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afaa",
    "lessonId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "code": "FIZ",
    "name": "Fizik",
    "description": null,
    "orderIndex": 7,
    "isActive": true,
    "createdAt": "2025-02-19T12:00:00Z",
    "updatedAt": null
  }
]
```

#### POST /api/AdminLessonMain/{lessonId}/create

**Gidiş – Body:**

```json
{
  "code": "MAT",
  "name": "Matematik",
  "description": "Ortaöğretim matematik",
  "orderIndex": 1,
  "isActive": true
}
```

**Dönüş – 200 OK:**

```json
{
  "message": "Ders içeriği (LessonMain) başarıyla oluşturuldu."
}
```

#### GET /api/AdminLessonMain/{id}

**Dönüş – 200 OK örnek:** (Yukarıdaki listedeki tek eleman yapısı gibi tek bir LessonMain nesnesi.)

#### PUT /api/AdminLessonMain/{id}

**Gidiş – Body (tüm alanlar opsiyonel):**

```json
{
  "code": "MAT",
  "name": "Matematik (Güncel)",
  "description": "Güncel açıklama",
  "orderIndex": 2,
  "isActive": false
}
```

**Dönüş – 200 OK:**

```json
{
  "message": "Ders içeriği başarıyla güncellendi."
}
```

#### DELETE /api/AdminLessonMain/{id}

**Dönüş – 200 OK:**

```json
{
  "message": "Ders içeriği silindi."
}
```

---

### 2.3 AdminLessonSubController

**Route:** `api/AdminLessonSub`

Ders alt konuları (LessonSub) CRUD — LessonMain'e bağlı ünite/ana konular.

| Metot | Route | Açıklama |
|-------|--------|----------|
| GET | `/api/AdminLessonSub/by-lesson-main/{lessonMainId}` | Bir LessonMain'e ait tüm LessonSub listesi. |
| GET | `/api/AdminLessonSub/{id}` | Id ile tek LessonSub detayı. |
| POST | `/api/AdminLessonSub/{lessonMainId}/create` | Belirtilen LessonMain'e yeni LessonSub ekler. |
| PUT | `/api/AdminLessonSub/{id}` | LessonSub günceller. |
| DELETE | `/api/AdminLessonSub/{id}` | LessonSub siler. |

#### GET /api/AdminLessonSub/by-lesson-main/{lessonMainId}

**Gidiş:**  
- Route: `lessonMainId` = LessonMain Guid.

**Dönüş – 200 OK örnek:**

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afab",
    "lessonMainId": "3fa85f64-5717-4562-b3fc-2c963f66afa9",
    "code": "MAT_SAYI",
    "name": "Sayılar",
    "description": null,
    "orderIndex": 1,
    "isActive": true,
    "createdAt": "2025-02-19T12:00:00Z",
    "updatedAt": null
  },
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afac",
    "lessonMainId": "3fa85f64-5717-4562-b3fc-2c963f66afa9",
    "code": "MAT_GEOM",
    "name": "Geometrik Şekiller",
    "description": null,
    "orderIndex": 4,
    "isActive": true,
    "createdAt": "2025-02-19T12:00:00Z",
    "updatedAt": null
  }
]
```

#### POST /api/AdminLessonSub/{lessonMainId}/create

**Gidiş – Body:**

```json
{
  "code": "MAT_SAYI",
  "name": "Sayılar",
  "description": "Sayı kümeleri ve işlem özellikleri",
  "orderIndex": 1,
  "isActive": true
}
```

**Dönüş – 200 OK:**

```json
{
  "message": "Alt konu başarıyla oluşturuldu."
}
```

#### PUT /api/AdminLessonSub/{id}

**Gidiş – Body (opsiyonel alanlar):**

```json
{
  "code": "MAT_SAYI_V2",
  "name": "Sayılar ve Kümeler",
  "description": "Güncel açıklama",
  "orderIndex": 1,
  "isActive": true
}
```

**Dönüş – 200 OK:**

```json
{
  "message": "Alt konu başarıyla güncellendi."
}
```

#### DELETE /api/AdminLessonSub/{id}

**Dönüş – 200 OK:**

```json
{
  "message": "Alt konu başarıyla silindi."
}
```

---

### 2.4 AdminLessonMikroController

**Route:** `api/AdminLessonMikro`

Mikro konular (LessonMikro) CRUD — LessonSub'a bağlı alt konular.

| Metot | Route | Açıklama |
|-------|--------|----------|
| GET | `/api/AdminLessonMikro/by-lesson-sub/{lessonSubId}` | Bir LessonSub'a ait tüm LessonMikro listesi. |
| GET | `/api/AdminLessonMikro/{id}` | Id ile tek LessonMikro detayı. |
| POST | `/api/AdminLessonMikro/{lessonSubId}/create` | Belirtilen LessonSub'a yeni LessonMikro ekler. |
| PUT | `/api/AdminLessonMikro/{id}` | LessonMikro günceller. |
| DELETE | `/api/AdminLessonMikro/{id}` | LessonMikro siler. |

#### GET /api/AdminLessonMikro/by-lesson-sub/{lessonSubId}

**Gidiş:**  
- Route: `lessonSubId` = LessonSub Guid.

**Dönüş – 200 OK örnek:**

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afad",
    "lessonSubId": "3fa85f64-5717-4562-b3fc-2c963f66afab",
    "code": "MAT_SAYI_KUME",
    "name": "Sayı kümeleri ve işlem özellikleri",
    "description": null,
    "orderIndex": 1,
    "isActive": true,
    "createdAt": "2025-02-19T12:00:00Z",
    "updatedAt": null
  },
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afae",
    "lessonSubId": "3fa85f64-5717-4562-b3fc-2c963f66afab",
    "code": "MAT_USLU_KOK",
    "name": "Üslü ve köklü gösterim",
    "description": null,
    "orderIndex": 3,
    "isActive": true,
    "createdAt": "2025-02-19T12:00:00Z",
    "updatedAt": null
  }
]
```

#### POST /api/AdminLessonMikro/{lessonSubId}/create

**Gidiş – Body:**

```json
{
  "code": "MAT_SAYI_KUME",
  "name": "Sayı kümeleri ve işlem özellikleri",
  "description": null,
  "orderIndex": 1,
  "isActive": true
}
```

**Dönüş – 200 OK:**

```json
{
  "message": "Mikro konu başarıyla oluşturuldu."
}
```

#### PUT /api/AdminLessonMikro/{id}

**Gidiş – Body (opsiyonel):**

```json
{
  "code": "MAT_SAYI_KUME_V2",
  "name": "Sayı kümeleri",
  "description": "Güncel açıklama",
  "orderIndex": 1,
  "isActive": true
}
```

**Dönüş – 200 OK:**

```json
{
  "message": "Mikro konu başarıyla güncellendi."
}
```

#### DELETE /api/AdminLessonMikro/{id}

**Dönüş – 200 OK:**

```json
{
  "message": "Mikro konu başarıyla silindi."
}
```

---

## 3. Hata Yanıtları (Ortak)

- **401 Unauthorized:** Geçerli admin token yok.
- **404 NotFound:** İlgili Id ile kayıt bulunamadı (örn. `{ "error": "Ders bulunamadı." }`).
- **400 BadRequest:** Validasyon hatası (örn. Code/Name zorunlu alan).
- **500 Internal Server Error:** Sunucu hatası (örn. `{ "error": "Dersleri listelerken bir hata oluştu." }`).

---

## 4. Örnek Senaryo: TYT İçin Matematik → Sayılar → Mikro Konu

1. **Lesson listesi al:** `GET /api/AdminLesson/all` → TYT'ye ait Lesson'ın `id` değerini bul.
2. **Ders içeriklerini al:** `GET /api/AdminLessonMain/by-lesson/{lessonId}` → Matematik LessonMain'in `id` değerini bul.
3. **Alt konu ekle:** `POST /api/AdminLessonSub/{lessonMainId}/create` → Body: `{ "code": "MAT_SAYI", "name": "Sayılar", "orderIndex": 1, "isActive": true }`.
4. **Oluşan LessonSub id ile mikro ekle:** `POST /api/AdminLessonMikro/{lessonSubId}/create` → Body: `{ "code": "MAT_SAYI_KUME", "name": "Sayı kümeleri ve işlem özellikleri", "orderIndex": 1, "isActive": true }`.

Bu akış, raporun 1. bölümündeki **Category → CategorySub → Lesson → LessonMain → LessonSub → LessonMikro** hiyerarşisiyle bire bir uyumludur.
