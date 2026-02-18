/**
 * Merkezi Cache Yönetim Sistemi
 * 
 * Bu sistem, API çağrılarını cache'leyerek gereksiz istekleri önler
 * ve bellek kullanımını optimize eder.
 */

class CacheManager {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 dakika (varsayılan)
  }

  /**
   * Cache'e veri ekler
   * @param {string} key - Cache anahtarı
   * @param {any} data - Cache'lenecek veri
   * @param {number} ttl - Time to live (milisaniye). Varsayılan: 5 dakika
   */
  set(key, data, ttl = this.defaultTTL) {
    this.cache.set(key, data);
    this.timestamps.set(key, Date.now() + ttl);
  }

  /**
   * Cache'den veri getirir
   * @param {string} key - Cache anahtarı
   * @returns {any|null} - Cache'lenmiş veri veya null
   */
  get(key) {
    const timestamp = this.timestamps.get(key);
    
    // Cache yoksa
    if (!timestamp) {
      return null;
    }

    // Cache süresi dolmuşsa
    if (Date.now() > timestamp) {
      this.delete(key);
      return null;
    }

    return this.cache.get(key);
  }

  /**
   * Cache'den veri siler
   * @param {string} key - Cache anahtarı
   */
  delete(key) {
    this.cache.delete(key);
    this.timestamps.delete(key);
  }

  /**
   * Belirli bir pattern'e uyan tüm cache'leri temizler
   * @param {string|RegExp} pattern - Temizlenecek cache pattern'i
   */
  clear(pattern = null) {
    if (!pattern) {
      // Tüm cache'i temizle
      this.cache.clear();
      this.timestamps.clear();
      return;
    }

    // Pattern'e göre temizle
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    const keysToDelete = [];

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.delete(key));
  }

  /**
   * Süresi dolmuş cache'leri temizler
   */
  clearExpired() {
    const now = Date.now();
    const keysToDelete = [];

    for (const [key, timestamp] of this.timestamps.entries()) {
      if (now > timestamp) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.delete(key));
  }

  /**
   * Cache'lenmiş bir fonksiyon çağrısı yapar
   * Eğer cache'de varsa cache'den döner, yoksa fonksiyonu çalıştırıp cache'ler
   * 
   * @param {string} key - Cache anahtarı
   * @param {Function} fn - Çalıştırılacak async fonksiyon
   * @param {number} ttl - Time to live (milisaniye)
   * @returns {Promise<any>} - Cache'lenmiş veya yeni veri
   */
  async getOrSet(key, fn, ttl = this.defaultTTL) {
    // Önce cache'i kontrol et
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    // Cache yoksa fonksiyonu çalıştır ve cache'le
    try {
      const data = await fn();
      this.set(key, data, ttl);
      return data;
    } catch (error) {
      // Hata durumunda cache'e kaydetme
      throw error;
    }
  }

  /**
   * Cache istatistiklerini döner
   * @returns {Object} - Cache istatistikleri
   */
  getStats() {
    const now = Date.now();
    let expiredCount = 0;
    let activeCount = 0;

    for (const timestamp of this.timestamps.values()) {
      if (now > timestamp) {
        expiredCount++;
      } else {
        activeCount++;
      }
    }

    return {
      total: this.cache.size,
      active: activeCount,
      expired: expiredCount,
    };
  }
}

// Singleton instance
const cacheManager = new CacheManager();

// Süresi dolmuş cache'leri periyodik olarak temizle (her 1 dakikada bir)
if (typeof window !== 'undefined') {
  setInterval(() => {
    cacheManager.clearExpired();
  }, 60 * 1000);
}

export default cacheManager;
