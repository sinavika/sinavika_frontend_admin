/**
 * AdminProductDraftController API sabitleri
 * @see AdminProductDraftController API Raporu
 */

/** ProductDraftStatus enum değerleri */
export const ProductDraftStatus = {
  Pending: 0,
  Approved: 1,
  Rejected: 2,
  Processing: 3,
  DuplicateEanSkipped: 4,
};

/** StoreProductUnitTypes enum değerleri */
export const StoreProductUnitTypes = {
  1: "Adet",
  2: "Ambalaj",
  3: "Bidon",
  4: "Çuval",
  5: "Düzine",
  6: "Galon",
  7: "Gram",
  8: "Gramaj",
  9: "Karat",
  10: "Kasa",
  11: "kg",
  12: "Koli",
  13: "Litre",
  14: "Metre",
  15: "Metrekare",
  16: "Metreküp",
  17: "Mililitre",
  18: "Paket",
  19: "Palet",
  20: "Rulo",
  21: "Sandık",
  22: "Santimetre",
  23: "Şişe",
  24: "Tane",
  25: "Takım",
  26: "Ton",
};

/** Status etiketleri */
const STATUS_LABELS = {
  [ProductDraftStatus.Pending]: "Beklemede",
  [ProductDraftStatus.Approved]: "Onaylandı",
  [ProductDraftStatus.Rejected]: "Reddedildi",
  [ProductDraftStatus.Processing]: "İşleniyor",
  [ProductDraftStatus.DuplicateEanSkipped]: "Tekrarlayan EAN atlandı",
};

/** API string enum için etiket eşlemesi */
const STATUS_LABEL_STRING_MAP = {
  Pending: "Beklemede",
  Approved: "Onaylandı",
  Rejected: "Reddedildi",
  Processing: "İşleniyor",
  DuplicateEanSkipped: "Tekrarlayan EAN atlandı",
};

/**
 * Status değerinden etiket döner (numara veya string destekler)
 * @param {number|string} status
 * @returns {string}
 */
export const getStatusLabel = (status) => {
  if (status == null) return "-";
  const num = typeof status === "string" ? parseInt(status, 10) : status;
  if (!Number.isNaN(num)) return STATUS_LABELS[num] ?? "-";
  return STATUS_LABEL_STRING_MAP[status] ?? status ?? "-";
};

/** Status → Tailwind sınıfları (arka plan + metin)
 * Beklemede: turuncu | Onaylandı: yeşil | Reddedildi: kırmızı | İşleniyor: mavi | EAN atlandı: gri */
const STATUS_STYLES = {
  [ProductDraftStatus.Pending]: "bg-orange-100 text-orange-800 border border-orange-200",
  [ProductDraftStatus.Approved]: "bg-green-100 text-green-800 border border-green-200",
  [ProductDraftStatus.Rejected]: "bg-red-100 text-red-800 border border-red-200",
  [ProductDraftStatus.Processing]: "bg-blue-100 text-blue-800 border border-blue-200",
  [ProductDraftStatus.DuplicateEanSkipped]: "bg-slate-100 text-slate-700 border border-slate-200",
};

/** API string enum dönüşü için eşleme (örn: "Approved", "Pending") */
const STATUS_STRING_MAP = {
  Pending: STATUS_STYLES[ProductDraftStatus.Pending],
  Approved: STATUS_STYLES[ProductDraftStatus.Approved],
  Rejected: STATUS_STYLES[ProductDraftStatus.Rejected],
  Processing: STATUS_STYLES[ProductDraftStatus.Processing],
  DuplicateEanSkipped: STATUS_STYLES[ProductDraftStatus.DuplicateEanSkipped],
};

/**
 * Status değerinden anlamlı renk sınıfları döner
 * Hem sayı (0-4) hem string ("Approved", "Pending" vb.) destekler
 * @param {number|string} status
 * @returns {string} Tailwind sınıfları
 */
export const getStatusStyle = (status) => {
  if (status == null) return "bg-gray-100 text-gray-700 border border-gray-200";
  const num = typeof status === "string" ? parseInt(status, 10) : status;
  if (!Number.isNaN(num)) return STATUS_STYLES[num] ?? "bg-gray-100 text-gray-700 border border-gray-200";
  return STATUS_STRING_MAP[status] ?? "bg-gray-100 text-gray-700 border border-gray-200";
};

/**
 * Status Pending mi? (numara veya "Pending" string destekler)
 * @param {number|string} status
 * @returns {boolean}
 */
export const isPendingStatus = (status) =>
  status === ProductDraftStatus.Pending || status === "Pending";

/**
 * unitType numarasından birim adı döner
 * @param {number} unitType
 * @returns {string}
 */
export const getUnitTypeLabel = (unitType) => {
  return StoreProductUnitTypes[unitType] ?? String(unitType ?? "-");
};

// ============================================
// Process Bar Hesaplaması (AdminProductDraftController API §5)
// ============================================

/**
 * Tek ürün onay progress değeri
 * @param {'sending'|'processing'|'done'|'error'} phase
 * @returns {number} 0-100
 */
export const getSingleApprovalProgress = (phase) => {
  switch (phase) {
    case "sending":
      return 10;
    case "processing":
      return 50;
    case "done":
      return 100;
    case "error":
      return 0;
    default:
      return 0;
  }
};

/**
 * Toplu onay (approve-selected / approve-all) progress değeri
 * @param {'sending'|'processing'|'done'|'error'} phase
 * @param {number} estimatedTotal - Tahmini toplam taslak sayısı
 * @param {number} processedCount - İşlenen sayı (tahmini)
 * @returns {number} 0-100
 */
export const getBulkApprovalProgress = (phase, estimatedTotal = 1, processedCount = 0) => {
  switch (phase) {
    case "sending":
      return 5;
    case "processing":
      return Math.min(95, 5 + (processedCount / Math.max(1, estimatedTotal)) * 90);
    case "done":
      return 100;
    case "error":
      return 0;
    default:
      return 0;
  }
};
