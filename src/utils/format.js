/**
 * Tarih ve sayı formatlama yardımcıları
 */

export const formatDate = (str) => {
  if (!str) return "—";
  try {
    return new Date(str).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return str;
  }
};

export const formatDateShort = (str) => {
  if (!str) return "—";
  try {
    return new Date(str).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return str;
  }
};

export const formatCurrency = (value, currencyCode = "TRY") => {
  if (value == null) return "—";
  try {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: currencyCode,
    }).format(value);
  } catch {
    return String(value);
  }
};

export const formatNumber = (value) => {
  if (value == null) return "—";
  return new Intl.NumberFormat("tr-TR").format(value);
};
