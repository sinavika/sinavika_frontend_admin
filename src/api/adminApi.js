import axios from "axios";
import { BASE_API_URL } from "@/baseApiUrl";
import { ERROR_MESSAGES, STORAGE_KEYS, HTTP_STATUS } from "@/constants";

const adminApi = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Her istekten önce token ekle
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // FormData gönderiliyorsa Content-Type header'ını kaldır
  // Axios otomatik olarak multipart/form-data ile boundary ekleyecek
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  
  return config;
});

// Response interceptor - Error handling
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 Unauthorized - Token expired veya geçersiz (2FA verify hariç: redirect yok)
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
      const skipRedirect = error.config?.skip401Redirect === true;
      const backendMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.Error;
      if (!skipRedirect) {
        localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.ADMIN_ROLE);
        localStorage.removeItem(STORAGE_KEYS.ADMIN_EMAIL);
        window.location.href = "/login";
      }
      return Promise.reject(
        new Error(backendMsg || ERROR_MESSAGES.UNAUTHORIZED)
      );
    }
    
    // 403 Forbidden - Yetkisiz erişim
    if (error.response?.status === HTTP_STATUS.FORBIDDEN) {
      return Promise.reject(new Error(ERROR_MESSAGES.FORBIDDEN));
    }
    
    // 404 Not Found
    if (error.response?.status === HTTP_STATUS.NOT_FOUND) {
      return Promise.reject(new Error(ERROR_MESSAGES.NOT_FOUND));
    }

    // 429 Rate Limit - Aşırı istek / saldırı önlemi
    if (error.response?.status === HTTP_STATUS.TOO_MANY_REQUESTS) {
      const retryAfter = error.response?.headers?.["retry-after"];
      const msg = retryAfter
        ? `Çok fazla istek. ${retryAfter} saniye sonra tekrar deneyin.`
        : ERROR_MESSAGES.RATE_LIMIT;
      return Promise.reject(new Error(msg));
    }
    
    // 500 Server Error
    if (error.response?.status >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
      return Promise.reject(new Error(ERROR_MESSAGES.SERVER_ERROR));
    }
    
    // Network error (CORS, sunucu ulaşılamıyor, timeout)
    if (!error.response) {
      const url = error.config?.baseURL + error.config?.url;
      const code = error.code || "";
      const msg = error.message || "";
      const hint =
        code === "ERR_NETWORK"
          ? "Sunucuya ulaşılamadı (CORS veya adres kontrol edin)."
          : code === "ECONNABORTED"
            ? "İstek zaman aşımına uğradı."
            : ERROR_MESSAGES.NETWORK_ERROR;
      return Promise.reject(
        new Error(`${hint} [${url}] ${code ? code + " " : ""}${msg}`.trim())
      );
    }
    
    // Backend'den gelen hata mesajı varsa onu kullan (Error/error/message)
    const data = error.response?.data;
    const backendMessage =
      (typeof data === "string" ? data : null) ||
      data?.Error ||
      data?.error ||
      data?.message;
    if (backendMessage) {
      return Promise.reject(new Error(backendMessage));
    }
    
    if (error.response?.status === 400) {
      const validationErrors = error.response?.data?.errors;
      if (validationErrors) {
        const errorMessages = Object.values(validationErrors).flat();
        return Promise.reject(new Error(`Validation Error: ${errorMessages.join(', ')}`));
      }
      return Promise.reject(new Error("Bad Request - Geçersiz veri gönderildi"));
    }
    
    // Genel hata mesajı
    return Promise.reject(new Error(ERROR_MESSAGES.GENERAL_ERROR));
  }
);

export default adminApi;
