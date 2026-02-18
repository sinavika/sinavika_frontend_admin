/**
 * Solution1 API base URL – tüm API ve base işlemleri bu dosyadan yönetilir.
 * URL değiştiğinde sadece bu dosyayı güncellemeniz yeterli.
 *
 * Backend route: [Route("api/[controller]")] → api/AdminAuth/login, api/AdminAuth/register, api/AdminAuth/me
 */
const API_ORIGIN =
  "https://solution-a9gthddfa2b4e7hx.canadacentral-01.azurewebsites.net";

export const BASE_API_URL =
  typeof import.meta !== "undefined" && import.meta.env?.DEV
    ? "/api" // Geliştirmede Vite proxy ile aynı origin (CORS yok)
    : `${API_ORIGIN}/api`;

/**
 * Göreceli görsel URL'lerini tam URL'ye çevirir.
 * Zaten http(s) ile başlıyorsa olduğu gibi döner.
 */
export const getFullImageUrl = (url) => {
  if (!url || typeof url !== "string") return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base =
    BASE_API_URL.startsWith("http") ? BASE_API_URL.replace(/\/api$/, "") : API_ORIGIN;
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
};
