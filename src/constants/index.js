// Pagination constants
export const PAGINATION = {
  ITEMS_PER_PAGE: 10,
  MAX_PAGE_BUTTONS: 5,
  DEFAULT_PAGE: 1
};

// API Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Bağlantı hatası. İnternet bağlantınızı kontrol edin.",
  UNAUTHORIZED: "Oturum süresi doldu. Lütfen tekrar giriş yapın.",
  FORBIDDEN: "Bu işlem için yetkiniz bulunmamaktadır.",
  NOT_FOUND: "İstenilen kaynak bulunamadı.",
  SERVER_ERROR: "Sunucu hatası. Lütfen daha sonra tekrar deneyin.",
  GENERAL_ERROR: "Bir hata oluştu. Lütfen tekrar deneyin.",
  LOGIN_FAILED: "Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.",
  RATE_LIMIT: "Çok fazla deneme. Lütfen bir süre sonra tekrar deneyin.",
  RATE_LIMIT_LOCKOUT: "Çok fazla başarısız deneme. Lütfen 15 dakika sonra tekrar deneyin.",
  FETCH_FAILED: "Veriler yüklenemedi.",
  CREATE_FAILED: "Kayıt oluşturulamadı.",
  UPDATE_FAILED: "Güncelleme başarısız.",
  DELETE_FAILED: "Silme işlemi başarısız.",
  VALIDATION_ERROR: "Lütfen tüm zorunlu alanları doldurun."
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Giriş başarılı!",
  CREATE_SUCCESS: "Kayıt başarıyla oluşturuldu.",
  UPDATE_SUCCESS: "Kayıt başarıyla güncellendi.",
  DELETE_SUCCESS: "Kayıt başarıyla silindi.",
  SAVE_SUCCESS: "Kayıt başarıyla kaydedildi."
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500
};

// Login rate limit (client-side, aşırı deneme önlemi)
export const LOGIN_RATE_LIMIT = {
  MAX_ATTEMPTS: 5,
  LOCKOUT_MINUTES: 15,
  STORAGE_KEY: "loginAttempts"
};

// Oturum yenileme aralığı (6 saat)
export const SESSION_REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000;

// File Upload Constants
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  MAX_FILES: 1
};

// Form Validation Rules
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[0-9]{10,11}$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50
};

// Local Storage Keys
export const STORAGE_KEYS = {
  ADMIN_TOKEN: "adminToken",
  ADMIN_ROLE: "adminRole",
  ADMIN_EMAIL: "adminEmail",
  ADMIN_SUBSCRIPTION: "adminSubscription"
};

// API base – tek kaynak: @/baseApiUrl.js
export { BASE_API_URL as API_BASE, getFullImageUrl } from "@/baseApiUrl";

// Route Paths
export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  PRODUCTS: "/admin/products",
  CATEGORIES: "/admin/categories",
  STORES: "/admin/stores",
  COMPANIES: "/admin/companies",
  PAYMENTS: "/admin/payments",
  SUBSCRIPTIONS: "/admin/subscriptions",
  UNAUTHORIZED: "/unauthorized"
}; 