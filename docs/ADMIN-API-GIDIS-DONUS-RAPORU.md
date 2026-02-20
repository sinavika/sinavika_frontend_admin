# Admin API — Gidiş-Dönüş Örnek Raporu

Bu dokümanda `API/Controllers` altındaki **admin** ile ilgili tüm controller'lar için endpoint bazında **istek (request)** ve **yanıt (response)** örnekleri verilmiştir. Base URL: `http://localhost:5025` (veya `API_HostAddress`).

**Yetkilendirme:** `AdminAuth` hariç tüm admin endpoint'leri `Authorization: Bearer <token>` gerektirir; token `POST /api/AdminAuth/login` ile alınır.

---

## İçindekiler

1. [AdminAuth](#1-adminauth)
2. [AdminCategory](#2-admincategory)
3. [AdminCategorySub](#3-admincategorysub)
4. [AdminCategoryFeature](#4-admincategoryfeature)
5. [AdminCategorySection](#5-admincategorysection)
6. [AdminLesson](#6-adminlesson)
7. [AdminLessonMain](#7-adminlessonmain)
8. [AdminLessonSub](#8-adminlessonsub)
9. [AdminLessonMikro](#9-adminlessonmikro)
10. [AdminExam](#10-adminexam)
11. [AdminExamSection](#11-adminexamsection)
12. [AdminQuestion](#12-adminquestion)
13. [AdminQuestionSolution](#13-adminquestionsolution)
14. [AdminQuestionBooklet](#14-adminquestionbooklet)
15. [AdminQuestionBookletTemplate](#15-adminquestionbooklettemplate)
16. [AdminPublisher](#16-adminpublisher)
17. [AdminCoupon](#17-admincoupon)
18. [AdminSubscriptionPackage](#18-adminsubscriptionpackage)
19. [AdminReferralCampaign](#19-adminreferralcampaign)

---

## 1. AdminAuth

**Base:** `api/AdminAuth`  
**Yetki:** Login/Register yetkisiz; `GET me` için `Admin` rolü gerekir.

### 1.1 Admin girişi

**İstek**

```http
POST http://localhost:5025/api/AdminAuth/login
Content-Type: application/json

{
  "email": "admin@sinavika.com",
  "password": "Admin123!"
}
```

**Başarılı yanıt (200)**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "admin@sinavika.com",
  "role": "Admin",
  "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "expiresAtUtc": "2025-02-21T12:00:00Z"
}
```

**Hata (401)**

```json
{
  "message": "Geçersiz e-posta veya şifre."
}
```

---

### 1.2 Admin kaydı

**İstek**

```http
POST http://localhost:5025/api/AdminAuth/register
Content-Type: application/json

{
  "email": "yeniadmin@sinavika.com",
  "password": "GucluSifre123!",
  "name": "Admin",
  "surname": "Kullanıcı"
}
```

**Başarılı yanıt (200)** — AdminAuthResponseDto (login ile aynı yapı)

**Hata (400)**

```json
{
  "message": "Bu e-posta adresi zaten kullanılıyor."
}
```

---

### 1.3 Giriş yapan admin bilgisi

**İstek**

```http
GET http://localhost:5025/api/AdminAuth/me
Authorization: Bearer <token>
```

**Başarılı yanıt (200)**

```json
{
  "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "admin@sinavika.com",
  "role": "Admin"
}
```

**Hata (401)** — Token yok veya geçersiz

---

## 2. AdminCategory

**Base:** `api/AdminCategory`  
**Yetki:** Bearer token (Admin).

### 2.1 Tüm kategorileri listele

**İstek**

```http
GET http://localhost:5025/api/AdminCategory/all
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — CategoryDto[]

```json
[
  {
    "id": "guid",
    "code": "YKS",
    "name": "Yükseköğretim Kurumları Sınavı",
    "imageUrl": "https://...",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": null
  }
]
```

---

### 2.2 Kategori oluştur

**İstek**

```http
POST http://localhost:5025/api/AdminCategory/create
Authorization: Bearer <token>
Content-Type: multipart/form-data

name=YKS
code=YKS
isActive=true
file=<opsiyonel resim dosyası>
```

**Başarılı yanıt (200)**

```json
{
  "message": "Kategori başarıyla oluşturuldu."
}
```

---

### 2.3 Kategori detayı (Id ile)

**İstek**

```http
GET http://localhost:5025/api/AdminCategory?id=3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — CategoryDto

**Hata (404)**

```json
{
  "error": "Kategori bulunamadı."
}
```

---

### 2.4 Kategori adını güncelle

**İstek**

```http
PUT http://localhost:5025/api/AdminCategory/update-name?id=3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "YKS",
  "name": "YKS Güncel",
  "isActive": true
}
```

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

### 2.5 Kategori resmini güncelle

**İstek**

```http
PUT http://localhost:5025/api/AdminCategory/update-image?id=3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
Content-Type: multipart/form-data

file=<resim dosyası>
```

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

### 2.6 Kategori sil

**İstek**

```http
DELETE http://localhost:5025/api/AdminCategory/delete?id=3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

## 3. AdminCategorySub

**Base:** `api/AdminCategorySub`

### 3.1 Ana kategoriye göre alt kategorileri listele

**İstek**

```http
GET http://localhost:5025/api/AdminCategorySub/{categoryId}/subs
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — CategorySubDto[]

```json
[
  {
    "id": "guid",
    "categoryId": "guid",
    "code": "TYT",
    "name": "Temel Yeterlilik Testi",
    "isActive": true,
    "createdAt": "...",
    "updatedAt": null
  }
]
```

---

### 3.2 Alt kategori detayı

**İstek**

```http
GET http://localhost:5025/api/AdminCategorySub?id=3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — CategorySubDto

---

### 3.3 Alt kategori oluştur

**İstek**

```http
POST http://localhost:5025/api/AdminCategorySub/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "categoryId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "code": "TYT",
  "name": "Temel Yeterlilik Testi",
  "isActive": true
}
```

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

### 3.4 Alt kategori güncelle

**İstek**

```http
PUT http://localhost:5025/api/AdminCategorySub/update?id=3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "TYT",
  "name": "TYT Güncel",
  "isActive": true
}
```

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

### 3.5 Alt kategori sil

**İstek**

```http
DELETE http://localhost:5025/api/AdminCategorySub/delete?id=3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

## 4. AdminCategoryFeature

**Base:** `api/AdminCategoryFeature`  
Alt kategori sınav özellikleri (soru sayısı, süre, negatif puanlama vb.).

### 4.1 Tüm kategori özelliklerini listele

**İstek**

```http
GET http://localhost:5025/api/AdminCategoryFeature/all
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — CategoryFeatureDto[]

```json
[
  {
    "id": "guid",
    "categorySubId": "guid",
    "defaultQuestionCount": 120,
    "defaultDurationMinutes": 135,
    "defaultQuestionOptionCount": 5,
    "usesNegativeMarking": true,
    "negativeMarkingRule": "4 yanlış 1 doğru götürür",
    "version": 1,
    "createdAt": "...",
    "updatedAt": null
  }
]
```

---

### 4.2 Id ile kategori özelliği getir

**İstek**

```http
GET http://localhost:5025/api/AdminCategoryFeature/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — CategoryFeatureDto

---

### 4.3 Alt kategori (CategorySub) id ile özellik getir

**İstek**

```http
GET http://localhost:5025/api/AdminCategoryFeature/by-sub/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — CategoryFeatureDto

---

### 4.4 Kategori özelliği oluştur

**İstek**

```http
POST http://localhost:5025/api/AdminCategoryFeature/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "categorySubId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "defaultQuestionCount": 120,
  "defaultDurationMinutes": 135,
  "defaultQuestionOptionCount": 5,
  "usesNegativeMarking": true,
  "negativeMarkingRule": "4 yanlış 1 doğru götürür"
}
```

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

### 4.5 Kategori özelliği güncelle

**İstek**

```http
PUT http://localhost:5025/api/AdminCategoryFeature/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
Content-Type: application/json

{
  "defaultQuestionCount": 125,
  "defaultDurationMinutes": 140,
  "defaultQuestionOptionCount": 5,
  "usesNegativeMarking": true,
  "negativeMarkingRule": "4 yanlış 1 doğru"
}
```

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

### 4.6 Kategori özelliği sil

**İstek**

```http
DELETE http://localhost:5025/api/AdminCategoryFeature/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

## 5. AdminCategorySection

**Base:** `api/AdminCategorySection`  
Alt kategori bölüm şablonu (ders, soru sayısı, süre vb.). Sadece Lesson kullanılır.

### 5.1 Tüm bölüm şablonlarını listele

**İstek**

```http
GET http://localhost:5025/api/AdminCategorySection/all
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — CategorySectionDto[]

---

### 5.2 Id ile bölüm şablonu getir

**İstek**

```http
GET http://localhost:5025/api/AdminCategorySection/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — CategorySectionDto

---

### 5.3 Alt kategori (CategorySub) id ile bölüm şablonlarını listele

**İstek**

```http
GET http://localhost:5025/api/AdminCategorySection/by-sub/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — CategorySectionDto[]

---

### 5.4 Bölüm şablonu oluştur

**İstek**

```http
POST http://localhost:5025/api/AdminCategorySection/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "categorySubId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "lessonId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "lessonMainId": null,
  "lessonSubId": null,
  "name": "Türkçe",
  "orderIndex": 1,
  "questionCount": 40,
  "durationMinutes": 30,
  "minQuestions": 35,
  "maxQuestions": 45,
  "targetQuestions": 40,
  "difficultyMix": null
}
```

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

### 5.5 Bölüm şablonu güncelle

**İstek**

```http
PUT http://localhost:5025/api/AdminCategorySection/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
Content-Type: application/json

{
  "lessonId": "guid",
  "name": "Türkçe Güncel",
  "orderIndex": 1,
  "questionCount": 40,
  "durationMinutes": 35
}
```

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

### 5.6 Bölüm şablonu sil

**İstek**

```http
DELETE http://localhost:5025/api/AdminCategorySection/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

## 6. AdminLesson

**Base:** `api/AdminLesson`

### 6.1 Tüm dersleri listele

**İstek**

```http
GET http://localhost:5025/api/AdminLesson/all
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — LessonDto[]

---

### 6.2 Ders oluştur

**İstek**

```http
POST http://localhost:5025/api/AdminLesson/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Türkçe",
  "code": "TR",
  "categorySubId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "isActive": true
}
```

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

### 6.3 Ders detayı

**İstek**

```http
GET http://localhost:5025/api/AdminLesson?id=3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — LessonDto

---

### 6.4 Ders güncelle

**İstek**

```http
PUT http://localhost:5025/api/AdminLesson/update?id=3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Türkçe Güncel",
  "code": "TR",
  "isActive": true
}
```

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

### 6.5 Ders pasif yap (sil)

**İstek**

```http
DELETE http://localhost:5025/api/AdminLesson/delete?id=3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

### 6.6 Ders içeriğine (LessonMain) alt konu (LessonSub) ekle

**İstek**

```http
POST http://localhost:5025/api/AdminLesson/lesson-main/{lessonMainId}/lesson-sub
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Sözcükte Anlam",
  "code": "SA",
  "orderIndex": 1,
  "isActive": true
}
```

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

## 7. AdminLessonMain

**Base:** `api/AdminLessonMain`  
Ders içeriği (LessonMain) CRUD.

### 7.1 Derse (Lesson) göre ders içeriklerini listele

**İstek**

```http
GET http://localhost:5025/api/AdminLessonMain/by-lesson/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — LessonMainDto[]

---

### 7.2 Ders içeriği detayı

**İstek**

```http
GET http://localhost:5025/api/AdminLessonMain/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — LessonMainDto

---

### 7.3 Ders içeriği oluştur

**İstek**

```http
POST http://localhost:5025/api/AdminLessonMain/3fa85f64-5717-4562-b3fc-2c963f66afa6/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Sözcükte Anlam",
  "code": "SA",
  "orderIndex": 1,
  "isActive": true
}
```

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

### 7.4 Ders içeriği güncelle

**İstek**

```http
PUT http://localhost:5025/api/AdminLessonMain/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Sözcükte Anlam Güncel",
  "code": "SA",
  "orderIndex": 1,
  "isActive": true
}
```

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

### 7.5 Ders içeriği sil

**İstek**

```http
DELETE http://localhost:5025/api/AdminLessonMain/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

## 8. AdminLessonSub

**Base:** `api/AdminLessonSub`  
Alt konu (LessonSub) CRUD.

### 8.1 Ders içeriğine (LessonMain) göre alt konuları listele

**İstek**

```http
GET http://localhost:5025/api/AdminLessonSub/by-lesson-main/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — LessonSubDto[]

---

### 8.2 Alt konu detayı

**İstek**

```http
GET http://localhost:5025/api/AdminLessonSub/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — LessonSubDto

---

### 8.3 Alt konu oluştur

**İstek**

```http
POST http://localhost:5025/api/AdminLessonSub/3fa85f64-5717-4562-b3fc-2c963f66afa6/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Eş Anlamlı Sözcükler",
  "code": "EAS",
  "orderIndex": 1,
  "isActive": true
}
```

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

### 8.4 Alt konu güncelle / 8.5 Alt konu sil

**Güncelle:** `PUT api/AdminLessonSub/{id}` — body: LessonSubUpdateDto  
**Sil:** `DELETE api/AdminLessonSub/{id}`  
Yanıt: `{ "message": "..." }`

---

## 9. AdminLessonMikro

**Base:** `api/AdminLessonMikro`  
Mikro konu (LessonMikro) CRUD.

### 9.1 Alt konuya (LessonSub) göre mikro konuları listele

**İstek**

```http
GET http://localhost:5025/api/AdminLessonMikro/by-lesson-sub/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — LessonMikroDto[]

---

### 9.2 Mikro konu detayı / 9.3 Oluştur / 9.4 Güncelle / 9.5 Sil

- **GET** `api/AdminLessonMikro/{id}` — detay
- **POST** `api/AdminLessonMikro/{lessonSubId}/create` — body: LessonMikroCreateDto
- **PUT** `api/AdminLessonMikro/{id}` — body: LessonMikroUpdateDto
- **DELETE** `api/AdminLessonMikro/{id}`

Başarılı yanıtlar: 200, body'de ilgili DTO veya `{ "message": "..." }`.

---

## 10. AdminExam

**Base:** `api/AdminExam`  
Status: 0=Draft, 1=Scheduled, 2=Published, 3=InProgress, 4=Closed, 5=Ended, 6=Archived.

### 10.1 Tüm sınavları listele

**İstek**

```http
GET http://localhost:5025/api/AdminExam/all
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — AdminExamDto[]

```json
[
  {
    "id": "guid",
    "publisherId": "guid",
    "categoryId": "guid",
    "categorySubId": "guid",
    "status": 1,
    "title": "YKS TYT 1. Deneme",
    "description": "...",
    "instructions": null,
    "startsAt": "2025-03-01T09:00:00Z",
    "endsAt": "2025-03-01T12:15:00Z",
    "accessDurationDays": 7,
    "participationQuota": null,
    "isAdaptive": false,
    "isLocked": false,
    "lockedAt": null,
    "lockedByAdminId": null,
    "createdAt": "...",
    "sections": [],
    "assignedTemplates": [],
    "assignedQuestionCount": 0
  }
]
```

---

### 10.2 Duruma göre sınavları listele

**İstek**

```http
GET http://localhost:5025/api/AdminExam/by-status/1
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — AdminExamDto[] (status=1 → Scheduled)

---

### 10.3 Sınav detayı

**İstek**

```http
GET http://localhost:5025/api/AdminExam?id=3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — AdminExamDto

---

### 10.4 Sınav oluştur

**İstek**

```http
POST http://localhost:5025/api/AdminExam/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "YKS TYT 1. Deneme",
  "description": "2025 TYT deneme sınavı",
  "instructions": "Süre 135 dakikadır.",
  "publisherId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "categoryId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "categorySubId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "startsAt": "2025-03-03T09:00:00Z",
  "endsAt": "2025-03-03T12:15:00Z",
  "accessDurationDays": 7,
  "participationQuota": null,
  "isAdaptive": false
}
```

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

### 10.5 Sınav güncelle

**İstek**

```http
PUT http://localhost:5025/api/AdminExam/update?id=3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "YKS TYT 1. Deneme (Güncel)",
  "description": "Güncellenmiş açıklama",
  "startsAt": "2025-03-04T09:00:00Z",
  "endsAt": "2025-03-04T12:15:00Z"
}
```

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

### 10.6 Sınav sil

**İstek**

```http
DELETE http://localhost:5025/api/AdminExam/delete?id=3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

### 10.7 Sınav yayınla / 10.8 Yayından kaldır / 10.9 Kilitle

- **POST** `api/AdminExam/publish?id={id}`
- **POST** `api/AdminExam/unpublish?id={id}`
- **POST** `api/AdminExam/lock?id={id}`

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

### 10.10 Sınav tarihlerini güncelle (schedule)

**İstek**

```http
PUT http://localhost:5025/api/AdminExam/schedule?id=3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
Content-Type: application/json

{
  "startsAt": "2025-03-05T09:00:00Z",
  "endsAt": "2025-03-05T12:15:00Z",
  "status": 1
}
```

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

### 10.11 Sınav durumunu değiştir

**İstek**

```http
PUT http://localhost:5025/api/AdminExam/status/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": 2
}
```

**Başarılı yanıt (200)** — `{ "message": "..." }`  
(0=Draft, 1=Scheduled, 2=Published, 3=InProgress, 4=Closed, 5=Ended, 6=Archived)

---

## 11. AdminExamSection

**Base:** `api/AdminExamSection`  
Sınav bölümleri; şablon atama, listeleme, güncelleme, kaldırma.

### 11.1 Sınava ait bölümleri listele

**İstek**

```http
GET http://localhost:5025/api/AdminExamSection/by-exam/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — ExamSection DTO listesi

---

### 11.2 Bölüm detayı

**İstek**

```http
GET http://localhost:5025/api/AdminExamSection/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — Bölüm DTO

---

### 11.3 Sınava soru şablonu ata

**İstek**  
(CategoriesSectionId: bölüm şablonu, QuestionsTemplateId: soru şablonu — şablonlar ilgili endpoint’lerden alınır.)

```http
POST http://localhost:5025/api/AdminExamSection/exam/3fa85f64-5717-4562-b3fc-2c963f66afa6/assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "categoriesSectionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "questionsTemplateId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "orderIndex": 1
}
```

**Başarılı yanıt (200)** — Atama sonucu (genelde created section veya message)

---

### 11.4 Bölüm güncelle (sıra / zorluk)

**İstek**

```http
PUT http://localhost:5025/api/AdminExamSection/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderIndex": 2,
  "difficultyMix": "{\"easy\":20,\"medium\":15,\"hard\":5}"
}
```

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

### 11.5 Bölümü kaldır

**İstek**

```http
DELETE http://localhost:5025/api/AdminExamSection/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

## 12. AdminQuestion

**Base:** `api/AdminQuestion`  
Soru havuzu CRUD.

### 12.1 Tüm soruları listele

**İstek**

```http
GET http://localhost:5025/api/AdminQuestion/all
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — QuestionDto[]

---

### 12.2 Derse göre sorular

**İstek**

```http
GET http://localhost:5025/api/AdminQuestion/by-lesson/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — QuestionDto[]

---

### 12.3 Alt derse (LessonSub) göre sorular

**İstek**

```http
GET http://localhost:5025/api/AdminQuestion/by-lesson-sub/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — QuestionDto[]

---

### 12.4 Yayınevine göre sorular

**İstek**

```http
GET http://localhost:5025/api/AdminQuestion/by-publisher/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — QuestionDto[]

---

### 12.5 Soru oluştur

**İstek**

```http
POST http://localhost:5025/api/AdminQuestion/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "stem": "Aşağıdakilerden hangisi doğrudur?",
  "lessonId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "lessonSubId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "publisherId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "options": [
    { "key": "A", "text": "Birinci şık" },
    { "key": "B", "text": "İkinci şık" },
    { "key": "C", "text": "Üçüncü şık" },
    { "key": "D", "text": "Dördüncü şık" },
    { "key": "E", "text": "Beşinci şık" }
  ],
  "correctOptionKey": "C"
}
```

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

### 12.6 Soru detayı

**İstek**

```http
GET http://localhost:5025/api/AdminQuestion?id=3fa85f64-5717-4562-b3fc-2c963f66afa6&includeOptions=true
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — QuestionDto (şıklar dahil)

---

### 12.7 Soru güncelle / 12.8 Soru sil

- **PUT** `api/AdminQuestion/update?id={id}` — body: QuestionUpdateDto
- **DELETE** `api/AdminQuestion/delete?id={id}`

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

## 13. AdminQuestionSolution

**Base:** `api/AdminQuestionSolution`  
Soru çözümleri (metin, video, pdf, link). Code otomatik atanır.

### 13.1 Tüm soru çözümlerini listele

**İstek**

```http
GET http://localhost:5025/api/AdminQuestionSolution/all
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — QuestionSolutionDto[]

---

### 13.2 Soruya göre çözümleri listele

**İstek**

```http
GET http://localhost:5025/api/AdminQuestionSolution/by-question/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — QuestionSolutionDto[]

---

### 13.3 Çözüm detayı

**İstek**

```http
GET http://localhost:5025/api/AdminQuestionSolution/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — QuestionSolutionDto

---

### 13.4 Soru çözümü oluştur

**İstek**

```http
POST http://localhost:5025/api/AdminQuestionSolution/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "questionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "solutionType": "Text",
  "content": "Çözüm metni...",
  "videoUrl": null,
  "pdfUrl": null,
  "externalLink": null
}
```

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

### 13.5 Soru çözümü güncelle / 13.6 Sil

- **PUT** `api/AdminQuestionSolution/{id}` — body: QuestionSolutionUpdateDto
- **DELETE** `api/AdminQuestionSolution/{id}`

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

## 14. AdminQuestionBooklet

**Base:** `api/AdminQuestionBooklet`  
Booklet (soru kitapçığı) CRUD, havuzdan soru ekleme, toplu soru yükleme (JSON/Excel/PDF/Word).

### 14.1 Sınava ait booklet kayıtlarını listele

**İstek**

```http
GET http://localhost:5025/api/AdminQuestionBooklet/by-exam/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — QuestionBookletDto[]

---

### 14.2 Bölüme ait booklet kayıtlarını listele

**İstek**

```http
GET http://localhost:5025/api/AdminQuestionBooklet/by-section/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — QuestionBookletDto[]

---

### 14.3 Booklet kaydı detayı

**İstek**

```http
GET http://localhost:5025/api/AdminQuestionBooklet/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — QuestionBookletDto

---

### 14.4 Booklet'e soru ekle

**İstek**

```http
POST http://localhost:5025/api/AdminQuestionBooklet/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "examId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "examSectionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "lessonId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": null,
  "orderIndex": 1,
  "questionsTemplateId": null,
  "questionTemplateItemId": null,
  "questionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "questionCode": null
}
```

**Başarılı yanıt (200)** — Eklenen kayıt veya mesaj

---

### 14.5 Booklet'e Code ile soru ekle

**İstek**

```http
POST http://localhost:5025/api/AdminQuestionBooklet/add-by-code
Authorization: Bearer <token>
Content-Type: application/json

{
  "examId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "examSectionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "questionCode": "123456ABC",
  "orderIndex": 1,
  "questionsTemplateId": null,
  "questionTemplateItemId": null
}
```

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

### 14.6 Booklet sırasını güncelle

**İstek**

```http
PUT http://localhost:5025/api/AdminQuestionBooklet/3fa85f64-5717-4562-b3fc-2c963f66afa6/order
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderIndex": 5
}
```

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

### 14.7 Booklet kaydını kaldır

**İstek**

```http
DELETE http://localhost:5025/api/AdminQuestionBooklet/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

### 14.8 JSON ile toplu soru yükle

**İstek**

```http
POST http://localhost:5025/api/AdminQuestionBooklet/bulk-import/json
Authorization: Bearer <token>
Content-Type: application/json

{
  "json": "[{\"stem\":\"Soru 1?\",\"options\":[{\"key\":\"A\",\"text\":\"A\"},{\"key\":\"B\",\"text\":\"B\"}],\"correctOptionKey\":\"A\",\"lessonId\":\"3fa85f64-5717-4562-b3fc-2c963f66afa6\",\"lessonSubId\":null,\"publisherId\":null}]"
}
```

**Başarılı yanıt (200)** — BulkQuestionImportResultDto

```json
{
  "totalRows": 1,
  "createdCount": 1,
  "errorCount": 0,
  "errors": [],
  "createdQuestionIds": ["guid"]
}
```

---

### 14.9 Excel ile toplu soru yükle

**İstek**

```http
POST http://localhost:5025/api/AdminQuestionBooklet/bulk-import/excel
Authorization: Bearer <token>
Content-Type: multipart/form-data

file=<Excel dosyası>
```

**Başarılı yanıt (200)** — BulkQuestionImportResultDto

---

### 14.10 PDF ile toplu soru yükle

**İstek**

```http
POST http://localhost:5025/api/AdminQuestionBooklet/bulk-import/pdf
Authorization: Bearer <token>
Content-Type: multipart/form-data

file=<PDF dosyası>
lessonId=3fa85f64-5717-4562-b3fc-2c963f66afa6
lessonSubId=
publisherId=
```

**Başarılı yanıt (200)** — BulkQuestionImportResultDto  
**Hata (400):** `{ "error": "PDF dosyası yükleyin." }` veya `{ "error": "LessonId zorunludur." }`

---

### 14.11 Word ile toplu soru yükle

**İstek**

```http
POST http://localhost:5025/api/AdminQuestionBooklet/bulk-import/word
Authorization: Bearer <token>
Content-Type: multipart/form-data

file=<.docx dosyası>
lessonId=3fa85f64-5717-4562-b3fc-2c963f66afa6
lessonSubId=
publisherId=
```

**Başarılı yanıt (200)** — BulkQuestionImportResultDto

---

## 15. AdminQuestionBookletTemplate

**Base:** `api/AdminQuestionBookletTemplate`  
Booklet şablonları (CategorySub + CategorySection ile).

### 15.1 Tüm booklet şablonlarını listele

**İstek**

```http
GET http://localhost:5025/api/AdminQuestionBookletTemplate/all
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — QuestionBookletTemplateDto[]

---

### 15.2 Alt kategoriye göre booklet şablonlarını listele

**İstek**

```http
GET http://localhost:5025/api/AdminQuestionBookletTemplate/by-category-sub/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — QuestionBookletTemplateDto[]

---

### 15.3 Şablon detayı

**İstek**

```http
GET http://localhost:5025/api/AdminQuestionBookletTemplate/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — QuestionBookletTemplateDto

---

### 15.4 Booklet şablonu oluştur

**İstek**

```http
POST http://localhost:5025/api/AdminQuestionBookletTemplate/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "categorySubId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "categorySectionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "TYT Türkçe",
  "orderIndex": 1
}
```

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

### 15.5 Booklet şablonu güncelle / 15.6 Sil

- **PUT** `api/AdminQuestionBookletTemplate/{id}` — body: QuestionBookletTemplateUpdateDto
- **DELETE** `api/AdminQuestionBookletTemplate/{id}`

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

## 16. AdminPublisher

**Base:** `api/AdminPublisher`

### 16.1 Tüm yayınevlerini listele

**İstek**

```http
GET http://localhost:5025/api/AdminPublisher/all
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — PublisherDto[]

---

### 16.2 Yayınevi oluştur

**İstek**

```http
POST http://localhost:5025/api/AdminPublisher/create
Authorization: Bearer <token>
Content-Type: multipart/form-data

name=Örnek Yayınevi
code=OY
isActive=true
file=<opsiyonel logo>
```

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

### 16.3 Yayınevi detayı

**İstek**

```http
GET http://localhost:5025/api/AdminPublisher?id=3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — PublisherDto

---

### 16.4 Yayınevi güncelle

**İstek**

```http
PUT http://localhost:5025/api/AdminPublisher/update?id=3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Örnek Yayınevi Güncel",
  "code": "OY",
  "isActive": true
}
```

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

### 16.5 Yayınevi pasif yap / 16.6 Logo güncelle

- **DELETE** `api/AdminPublisher/delete?id={id}`
- **PUT** `api/AdminPublisher/update-logo?id={id}` — multipart: `file`

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

## 17. AdminCoupon

**Base:** `api/AdminCoupon`

### 17.1 Tüm kuponları listele

**İstek**

```http
GET http://localhost:5025/api/AdminCoupon/all
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — CouponDto[]

---

### 17.2 Kupon oluştur

**İstek**

```http
POST http://localhost:5025/api/AdminCoupon/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "HOSGELDIN20",
  "discountPercent": 20,
  "validFrom": "2025-02-01T00:00:00Z",
  "validUntil": "2025-12-31T23:59:59Z",
  "maxUseCount": 100,
  "isActive": true
}
```

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

### 17.3 Kupon detayı / 17.4 Güncelle / 17.5 Pasif yap

- **GET** `api/AdminCoupon?id={id}` — CouponDto
- **PUT** `api/AdminCoupon/update?id={id}` — body: CouponUpdateDto
- **DELETE** `api/AdminCoupon/delete?id={id}`

**Başarılı yanıt (200)** — ilgili body veya `{ "message": "..." }`

---

## 18. AdminSubscriptionPackage

**Base:** `api/AdminSubscriptionPackage`

### 18.1 Tüm abonelik paketlerini listele

**İstek**

```http
GET http://localhost:5025/api/AdminSubscriptionPackage/all
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — SubscriptionPackageDto[]

---

### 18.2 Abonelik paketi oluştur

**İstek**

```http
POST http://localhost:5025/api/AdminSubscriptionPackage/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Aylık Paket",
  "description": "1 aylık erişim",
  "durationDays": 30,
  "price": 99.99,
  "currency": "TRY",
  "isActive": true
}
```

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

### 18.3 Paket detayı / 18.4 Güncelle / 18.5 İptal (pasif)

- **GET** `api/AdminSubscriptionPackage?id={id}`
- **PUT** `api/AdminSubscriptionPackage/update?id={id}` — body: SubscriptionPackageUpdateDto
- **DELETE** `api/AdminSubscriptionPackage/delete?id={id}`

**Başarılı yanıt (200)** — ilgili body veya `{ "message": "..." }`

---

## 19. AdminReferralCampaign

**Base:** `api/AdminReferralCampaign`

### 19.1 Tüm referral kampanyalarını listele

**İstek**

```http
GET http://localhost:5025/api/AdminReferralCampaign/all
Authorization: Bearer <token>
```

**Başarılı yanıt (200)** — ReferralCampaignDto[]

---

### 19.2 Referral kampanyası oluştur

**İstek**

```http
POST http://localhost:5025/api/AdminReferralCampaign/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Arkadaşını Getir",
  "description": "Davet başına indirim",
  "rewardType": "Discount",
  "rewardValue": 10,
  "validFrom": "2025-02-01T00:00:00Z",
  "validUntil": "2025-12-31T23:59:59Z",
  "isActive": true
}
```

**Başarılı yanıt (200)** — `{ "message": "..." }`

---

### 19.3 Kampanya detayı / 19.4 Güncelle / 19.5 Pasif yap

- **GET** `api/AdminReferralCampaign?id={id}`
- **PUT** `api/AdminReferralCampaign/update?id={id}` — body: ReferralCampaignUpdateDto
- **DELETE** `api/AdminReferralCampaign/delete?id={id}`

**Başarılı yanıt (200)** — ilgili body veya `{ "message": "..." }`

---

## Ortak hata yanıtları

| HTTP | Açıklama |
|------|----------|
| **400** | Geçersiz istek (validasyon, iş kuralı). Body: `{ "error": "..." }` veya `{ "message": "..." }` |
| **401** | Yetkisiz (token yok/geçersiz veya Admin değil). Body: `{ "message": "..." }` |
| **404** | Kaynak bulunamadı. Body: `{ "error": "..." }` |
| **500** | Sunucu hatası. Body: `{ "Error": "..." }` |

Tüm admin endpoint'leri (AdminAuth login/register hariç) **Bearer token** ile çağrılmalıdır; token `POST /api/AdminAuth/login` ile alınır.

---

*Bu rapor `API/Controllers` içindeki admin controller'larına göre hazırlanmıştır. DTO alanları proje içi DTO sınıflarıyla uyumludur; alan adları değişirse doküman güncellenmelidir.*
