"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CACHE_KEYS = exports.persistentCache = exports.memoryCache = void 0;
exports.generateCacheKey = generateCacheKey;
class Cache {
    constructor() {
        this.memoryCache = new Map();
        this.DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
    }
    // Obtener item del caché
    get(key) {
        const item = this.memoryCache.get(key);
        if (!item) {
            return null;
        }
        // Verificar si ha expirado
        if (Date.now() - item.timestamp > item.ttl) {
            this.memoryCache.delete(key);
            return null;
        }
        return item.data;
    }
    // Guardar item en caché
    set(key, data, ttl = this.DEFAULT_TTL) {
        this.memoryCache.set(key, {
            data,
            timestamp: Date.now(),
            ttl,
        });
    }
    // Eliminar item del caché
    delete(key) {
        this.memoryCache.delete(key);
    }
    // Limpiar caché expirado
    cleanup() {
        const now = Date.now();
        for (const [key, item] of this.memoryCache.entries()) {
            if (now - item.timestamp > item.ttl) {
                this.memoryCache.delete(key);
            }
        }
    }
    // Limpiar todo el caché
    clear() {
        this.memoryCache.clear();
    }
    // Obtener tamaño del caché
    size() {
        return this.memoryCache.size;
    }
}
// Caché persistente usando localStorage
class PersistentCache {
    constructor() {
        this.PREFIX = 'mautik_cache_';
        this.DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes
    }
    // Obtener item del caché persistente
    get(key) {
        try {
            const item = localStorage.getItem(this.PREFIX + key);
            if (!item)
                return null;
            const cacheItem = JSON.parse(item);
            // Verificar si ha expirado
            if (Date.now() - cacheItem.timestamp > cacheItem.ttl) {
                this.delete(key);
                return null;
            }
            return cacheItem.data;
        }
        catch (error) {
            const errorToUse = error instanceof Error
                ? error
                : new Error(typeof error === 'string' ? error : JSON.stringify(error));
            console.error('Error reading from persistent cache:', errorToUse);
            return null;
        }
    }
    // Guardar item en caché persistente
    set(key, data, ttl = this.DEFAULT_TTL) {
        try {
            const cacheItem = {
                data,
                timestamp: Date.now(),
                ttl,
            };
            localStorage.setItem(this.PREFIX + key, JSON.stringify(cacheItem));
        }
        catch (error) {
            const errorToUse = error instanceof Error
                ? error
                : new Error(typeof error === 'string' ? error : JSON.stringify(error));
            console.error('Error writing to persistent cache:', errorToUse);
        }
    }
    // Eliminar item del caché persistente
    delete(key) {
        try {
            localStorage.removeItem(this.PREFIX + key);
        }
        catch (error) {
            const errorToUse = error instanceof Error
                ? error
                : new Error(typeof error === 'string' ? error : JSON.stringify(error));
            console.error('Error deleting from persistent cache:', errorToUse);
        }
    }
    // Limpiar caché persistente expirado
    cleanup() {
        try {
            const now = Date.now();
            const keys = Object.keys(localStorage);
            for (const key of keys) {
                if (key.startsWith(this.PREFIX)) {
                    const item = localStorage.getItem(key);
                    if (item) {
                        const cacheItem = JSON.parse(item);
                        if (now - cacheItem.timestamp > cacheItem.ttl) {
                            localStorage.removeItem(key);
                        }
                    }
                }
            }
        }
        catch (error) {
            const errorToUse = error instanceof Error
                ? error
                : new Error(typeof error === 'string' ? error : JSON.stringify(error));
            console.error('Error cleaning persistent cache:', errorToUse);
        }
    }
    // Limpiar todo el caché persistente
    clear() {
        try {
            const keys = Object.keys(localStorage);
            for (const key of keys) {
                if (key.startsWith(this.PREFIX)) {
                    localStorage.removeItem(key);
                }
            }
        }
        catch (error) {
            const errorToUse = error instanceof Error
                ? error
                : new Error(typeof error === 'string' ? error : JSON.stringify(error));
            console.error('Error clearing persistent cache:', errorToUse);
        }
    }
}
// Instancias globales
exports.memoryCache = new Cache();
exports.persistentCache = new PersistentCache();
// Limpiar caché expirado cada 5 minutos
if (typeof window !== 'undefined') {
    setInterval(() => {
        exports.memoryCache.cleanup();
        exports.persistentCache.cleanup();
    }, 5 * 60 * 1000);
}
// Claves de caché comunes
exports.CACHE_KEYS = {
    PRODUCTS: 'products',
    PRODUCT_DETAIL: 'product_detail',
    CATEGORIES: 'categories',
    USER_PROFILE: 'user_profile',
    CART: 'cart',
    FAVORITES: 'favorites',
    SEARCH_RESULTS: 'search_results',
};
// Función helper para generar claves de caché
function generateCacheKey(base, params) {
    if (!params)
        return base;
    const sortedParams = Object.keys(params)
        .sort()
        .map((key) => `${key}:${params[key]}`)
        .join('|');
    return `${base}_${sortedParams}`;
}
