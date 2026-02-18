import { ERROR_MESSAGES } from "@/constants";

/**
 * API hatalarını işleyen utility fonksiyonu
 * @param {Error} error - Yakalanan hata
 * @param {string} defaultMessage - Varsayılan hata mesajı
 * @returns {string} Kullanıcı dostu hata mesajı
 */
export const handleApiError = (error, defaultMessage = ERROR_MESSAGES.GENERAL_ERROR) => {
  // API interceptor'dan gelen hata mesajını kullan
  if (error.message && error.message !== defaultMessage) {
    return error.message;
  }
  
  // HTTP status code'a göre özel mesajlar
  if (error.response) {
    const status = error.response.status;
    
    switch (status) {
      case 400:
        return "Geçersiz istek. Lütfen girdiğiniz bilgileri kontrol edin.";
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 403:
        return ERROR_MESSAGES.FORBIDDEN;
      case 404:
        return ERROR_MESSAGES.NOT_FOUND;
      case 422:
        return "Gönderilen veriler geçersiz. Lütfen kontrol edin.";
      case 500:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return defaultMessage;
    }
  }
  
  // Network hatası
  if (!error.response) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  
  return defaultMessage;
};

/**
 * Form validation hatalarını işleyen utility fonksiyonu
 * @param {Object} errors - Validation hataları
 * @returns {string} Birleştirilmiş hata mesajı
 */
export const handleValidationErrors = (errors) => {
  if (!errors || Object.keys(errors).length === 0) {
    return ERROR_MESSAGES.VALIDATION_ERROR;
  }
  
  const errorMessages = Object.values(errors).filter(Boolean);
  return errorMessages.join(", ");
};

/**
 * File upload hatalarını işleyen utility fonksiyonu
 * @param {File} file - Yüklenen dosya
 * @param {Object} constraints - Dosya kısıtlamaları
 * @returns {string|null} Hata mesajı veya null
 */
export const validateFileUpload = (file, constraints = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxFiles = 1
  } = constraints;
  
  if (!file) return null;
  
  // Dosya boyutu kontrolü
  if (file.size > maxSize) {
    return `Dosya boyutu ${Math.round(maxSize / 1024 / 1024)}MB'dan büyük olamaz.`;
  }
  
  // Dosya tipi kontrolü
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return `Sadece ${allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} dosyaları kabul edilir.`;
  }
  
  return null;
};

/**
 * Local storage işlemleri için utility fonksiyonları
 */
export const storageUtils = {
  get: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('LocalStorage get error:', error);
      return null;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('LocalStorage set error:', error);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('LocalStorage remove error:', error);
      return false;
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('LocalStorage clear error:', error);
      return false;
    }
  }
}; 