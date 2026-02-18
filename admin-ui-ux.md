# Admin UI/UX notlari

## Audit: Alıcı tablosu referansına göre farklar

- **Tablo kapsayıcısı**: `AdminBuyerTable` `rounded-lg + shadow-sm + border` kullanıyor; diğerleri `rounded-2xl`, farklı gölge/border yoğunluğu ve farklı padding (`p-4`, `p-6`) ile geliyor.
- **Header dili**: Alıcı tablosunda `bg-gradient-to-r` header ve uppercase/track birimleri var; diğer tablolarda düz `bg-emerald-50` veya farklı tracking/uppercase kullanımı var.
- **Empty state**: Alıcı tablosu kart içi boş durum gösteriyor; bazı tablolarda tek satırlı `<tr>` ile italic metin var, bazı sayfalarda ise sayfa seviyesinde gradient kutu var.
- **Row hover**: Alıcı tablosu `hover:bg-emerald-50/50` kullanırken, bazı tablolarda zebra + `hover:bg-emerald-50`, bazıları yalnızca zebra.
- **Aksiyon hizası**: Alıcı tablosunda sağa hizalı bir aksiyon butonu var; diğerlerinde solda küçük linkler veya karışık `flex` blokları var.
- **Durum gösterimi**: Alıcı tablosunda toggle butonu var; diğerlerinde pill/badge ve renkleri farklı (`emerald`, `red`, `yellow`) ve ikonlar her yerde tutarlı degil.
- **Pagination**: Alıcı sayfası `Pagination` bileşenini kullanıyor; kargo tablosu kendi sayfalama butonlarını üretiyor, bazı listelerde hiç pagination yok.
- **Sayfa üst alanı**: Alıcı sayfası gradient `PageHeader` ve ayrı filter bar kullanıyor; diğer sayfalarda sadece `h1` ve duzensiz spacing var.
- **Tipografi**: Alıcı tablosunda text boyutlari daha dengeli; diğerlerinde `text-xs`/`text-sm` farkı fazla ve button boyutlari degisken.

## Standart admin sayfa/table kurallari

### Sayfa basligi
- Ikon + baslik + aciklama + sag aksiyon tek satirda.
- Gradient arkaplan, `rounded-xl`, `shadow-lg`, ic bosluk `p-6`.

### Filter/arama bari
- Tek satir, `FilterBar` ile `rounded-xl` + `border` + `shadow-sm`.
- Sol: arama/alici filtreleri; sag: sayfa basina, sonuc sayisi ve hizli aksiyonlar.

### Tablo gorunumu
- `AdminTable` kapsayicisi ile `rounded-lg + shadow-sm + border`.
- Header: `bg-gradient-to-r` ve `text-xs font-semibold uppercase tracking-wider`.
- Body: `divide-y`, zebra opsiyonel, `hover:bg-emerald-50`.
- Aksiyonlar sagda hizali ve `ActionButton` ile standardize.

### Durum etiketleri
- `StatusPill` ile yesil/kirmizi kullanimi.
- Metinler: "Aktif", "Pasif" (varsa ek durumlar icin ayrik renkler).

### Bos/Yukleniyor
- `EmptyState` karti ve `LoadingState` spinner ile tutarli gorunum.
- Bos durumlar sayfa veya tablo seviyesinde tek tip metin dili.

### Pagination
- `Pagination` bileşeni ile sayfa sonuna hizli gezinme.
- Sayfa basina secici ve sonuc sayisi `FilterBar` icinde.

## Ortak UI bilesenleri

- `PageHeader`, `FilterBar`, `AdminTable`, `StatusPill`, `EmptyState`, `LoadingState`, `ActionButton`
- Referans stil: `AdminBuyerTable` ve alici sayfa basligi.
