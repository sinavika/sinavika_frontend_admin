/**
 * API base URL – .env dosyasındaki VITE_API_BASE_URL kullanılır.
 * Örnek: .env içinde VITE_API_BASE_URL=https://api.example.com (sonunda /api yok)
 *
 * Backend route: [Route("api/[controller]")] → api/AdminAuth/login, api/AdminCategory/all ...
 */
const DEFAULT_ORIGIN =
  "https://solution-a9gthddfa2b4e7hx.canadacentral-01.azurewebsites.net";

const API_ORIGIN =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
  DEFAULT_ORIGIN;

/** Production/build'ta tam API URL; dev'de Vite proxy nedeniyle /api */
export const BASE_API_URL =
  typeof import.meta !== "undefined" && import.meta.env?.DEV
    ? "/api" // Geliştirmede Vite proxy ile aynı origin (CORS yok)
    : `${API_ORIGIN.replace(/\/api\/?$/, "")}/api`;

/**
 * Göreceli görsel URL'lerini tam URL'ye çevirir.
 * Zaten http(s) ile başlıyorsa olduğu gibi döner.
 */
export const getFullImageUrl = (url) => {
  if (!url || typeof url !== "string") return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = BASE_API_URL.startsWith("http")
    ? BASE_API_URL.replace(/\/api\/?$/, "")
    : API_ORIGIN.replace(/\/api\/?$/, "");
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
};
