interface CacheItem<T> {
	data: T;
	timestamp: number;
	ttl: number; // Time to live in milliseconds
}

class Cache {
	private memoryCache = new Map<string, CacheItem<any>>();
	private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

	// Obtener item del caché
	get<T>(key: string): T | null {
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
	set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
		this.memoryCache.set(key, {
			data,
			timestamp: Date.now(),
			ttl,
		});
	}

	// Eliminar item del caché
	delete(key: string): void {
		this.memoryCache.delete(key);
	}

	// Limpiar caché expirado
	cleanup(): void {
		const now = Date.now();
		for (const [key, item] of this.memoryCache.entries()) {
			if (now - item.timestamp > item.ttl) {
				this.memoryCache.delete(key);
			}
		}
	}

	// Limpiar todo el caché
	clear(): void {
		this.memoryCache.clear();
	}

	// Obtener tamaño del caché
	size(): number {
		return this.memoryCache.size;
	}
}

// Caché persistente usando localStorage
class PersistentCache {
	private readonly PREFIX = 'mautik_cache_';
	private readonly DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes

	// Obtener item del caché persistente
	get<T>(key: string): T | null {
		try {
			const item = localStorage.getItem(this.PREFIX + key);
			if (!item) return null;

			const cacheItem: CacheItem<T> = JSON.parse(item);

			// Verificar si ha expirado
			if (Date.now() - cacheItem.timestamp > cacheItem.ttl) {
				this.delete(key);
				return null;
			}

			return cacheItem.data;
		} catch (error) {
			const errorToUse =
				error instanceof Error
					? error
					: new Error(
							typeof error === 'string' ? error : JSON.stringify(error),
					  );
			console.error('Error reading from persistent cache:', errorToUse);
			return null;
		}
	}

	// Guardar item en caché persistente
	set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
		try {
			const cacheItem: CacheItem<T> = {
				data,
				timestamp: Date.now(),
				ttl,
			};
			localStorage.setItem(this.PREFIX + key, JSON.stringify(cacheItem));
		} catch (error) {
			const errorToUse =
				error instanceof Error
					? error
					: new Error(
							typeof error === 'string' ? error : JSON.stringify(error),
					  );
			console.error('Error writing to persistent cache:', errorToUse);
		}
	}

	// Eliminar item del caché persistente
	delete(key: string): void {
		try {
			localStorage.removeItem(this.PREFIX + key);
		} catch (error) {
			const errorToUse =
				error instanceof Error
					? error
					: new Error(
							typeof error === 'string' ? error : JSON.stringify(error),
					  );
			console.error('Error deleting from persistent cache:', errorToUse);
		}
	}

	// Limpiar caché persistente expirado
	cleanup(): void {
		try {
			const now = Date.now();
			const keys = Object.keys(localStorage);

			for (const key of keys) {
				if (key.startsWith(this.PREFIX)) {
					const item = localStorage.getItem(key);
					if (item) {
						const cacheItem: CacheItem<any> = JSON.parse(item);
						if (now - cacheItem.timestamp > cacheItem.ttl) {
							localStorage.removeItem(key);
						}
					}
				}
			}
		} catch (error) {
			const errorToUse =
				error instanceof Error
					? error
					: new Error(
							typeof error === 'string' ? error : JSON.stringify(error),
					  );
			console.error('Error cleaning persistent cache:', errorToUse);
		}
	}

	// Limpiar todo el caché persistente
	clear(): void {
		try {
			const keys = Object.keys(localStorage);
			for (const key of keys) {
				if (key.startsWith(this.PREFIX)) {
					localStorage.removeItem(key);
				}
			}
		} catch (error) {
			const errorToUse =
				error instanceof Error
					? error
					: new Error(
							typeof error === 'string' ? error : JSON.stringify(error),
					  );
			console.error('Error clearing persistent cache:', errorToUse);
		}
	}
}

// Instancias globales
export const memoryCache = new Cache();
export const persistentCache = new PersistentCache();

// Limpiar caché expirado cada 5 minutos
if (typeof window !== 'undefined') {
	setInterval(() => {
		memoryCache.cleanup();
		persistentCache.cleanup();
	}, 5 * 60 * 1000);
}

// Claves de caché comunes
export const CACHE_KEYS = {
	PRODUCTS: 'products',
	PRODUCT_DETAIL: 'product_detail',
	CATEGORIES: 'categories',
	USER_PROFILE: 'user_profile',
	CART: 'cart',
	FAVORITES: 'favorites',
	SEARCH_RESULTS: 'search_results',
} as const;

// Función helper para generar claves de caché
export function generateCacheKey(
	base: string,
	params?: Record<string, any>,
): string {
	if (!params) return base;

	const sortedParams = Object.keys(params)
		.sort()
		.map((key) => `${key}:${params[key]}`)
		.join('|');

	return `${base}_${sortedParams}`;
}
