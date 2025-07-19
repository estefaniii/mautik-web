interface RateLimitConfig {
	windowMs: number; // Ventana de tiempo en milisegundos
	maxRequests: number; // Máximo número de requests por ventana
	keyGenerator?: (req: any) => string; // Función para generar clave única
	skipSuccessfulRequests?: boolean; // Saltar requests exitosos
	skipFailedRequests?: boolean; // Saltar requests fallidos
}

interface RateLimitStore {
	[key: string]: {
		count: number;
		resetTime: number;
	};
}

class RateLimiter {
	private store: RateLimitStore = {};
	private config: RateLimitConfig;

	constructor(config: RateLimitConfig) {
		this.config = {
			...config,
			windowMs: 15 * 60 * 1000, // 15 minutos por defecto
			maxRequests: 100, // 100 requests por ventana por defecto
			keyGenerator: (req) => req.ip || 'unknown',
			skipSuccessfulRequests: false,
			skipFailedRequests: false,
		};
	}

	// Limpiar entradas expiradas
	private cleanup() {
		const now = Date.now();
		Object.keys(this.store).forEach((key) => {
			if (this.store[key].resetTime <= now) {
				delete this.store[key];
			}
		});
	}

	// Verificar rate limit
	checkLimit(req: any): {
		allowed: boolean;
		remaining: number;
		resetTime: number;
	} {
		this.cleanup();

		const key = this.config.keyGenerator!(req);
		const now = Date.now();
		const windowStart = now - (now % this.config.windowMs);
		const resetTime = windowStart + this.config.windowMs;

		if (!this.store[key] || this.store[key].resetTime <= now) {
			this.store[key] = {
				count: 0,
				resetTime,
			};
		}

		const current = this.store[key];
		const remaining = Math.max(0, this.config.maxRequests - current.count);
		const allowed = current.count < this.config.maxRequests;

		if (allowed) {
			current.count++;
		}

		return {
			allowed,
			remaining,
			resetTime: current.resetTime,
		};
	}

	// Middleware para Express/Next.js
	middleware() {
		return (req: any, res: any, next: any) => {
			const result = this.checkLimit(req);

			if (!result.allowed) {
				return res.status(429).json({
					error: 'Too Many Requests',
					message:
						'Has excedido el límite de requests. Intenta de nuevo más tarde.',
					retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
				});
			}

			// Agregar headers de rate limit
			res.setHeader('X-RateLimit-Limit', this.config.maxRequests);
			res.setHeader('X-RateLimit-Remaining', result.remaining);
			res.setHeader(
				'X-RateLimit-Reset',
				new Date(result.resetTime).toISOString(),
			);

			next();
		};
	}
}

// Instancias predefinidas
export const rateLimiters = {
	// Rate limit general para APIs
	api: new RateLimiter({
		windowMs: 15 * 60 * 1000, // 15 minutos
		maxRequests: 1000, // 1000 requests por 15 minutos
		keyGenerator: (req) => req.ip || 'unknown',
	}),

	// Rate limit para autenticación
	auth: new RateLimiter({
		windowMs: 15 * 60 * 1000, // 15 minutos
		maxRequests: 5, // 5 intentos de login por 15 minutos
		keyGenerator: (req) => `auth:${req.ip || 'unknown'}`,
	}),

	// Rate limit para búsquedas
	search: new RateLimiter({
		windowMs: 1 * 60 * 1000, // 1 minuto
		maxRequests: 30, // 30 búsquedas por minuto
		keyGenerator: (req) => `search:${req.ip || 'unknown'}`,
	}),

	// Rate limit para uploads
	upload: new RateLimiter({
		windowMs: 60 * 60 * 1000, // 1 hora
		maxRequests: 10, // 10 uploads por hora
		keyGenerator: (req) => `upload:${req.ip || 'unknown'}`,
	}),

	// Rate limit para comentarios/reseñas
	comments: new RateLimiter({
		windowMs: 5 * 60 * 1000, // 5 minutos
		maxRequests: 3, // 3 comentarios por 5 minutos
		keyGenerator: (req) => `comments:${req.ip || 'unknown'}`,
	}),
};

// Función helper para verificar rate limit en Next.js API routes
export function checkRateLimit(
	req: any,
	limiter: RateLimiter = rateLimiters.api,
): { allowed: boolean; remaining: number; resetTime: number } {
	return limiter.checkLimit(req);
}

// Middleware para Next.js
export function withRateLimit(
	handler: Function,
	limiter: RateLimiter = rateLimiters.api,
) {
	return async (req: any, res: any) => {
		const result = limiter.checkLimit(req);

		if (!result.allowed) {
			return res.status(429).json({
				error: 'Too Many Requests',
				message:
					'Has excedido el límite de requests. Intenta de nuevo más tarde.',
				retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
			});
		}

		// Agregar headers de rate limit
		res.setHeader('X-RateLimit-Limit', limiter['config'].maxRequests);
		res.setHeader('X-RateLimit-Remaining', result.remaining);
		res.setHeader(
			'X-RateLimit-Reset',
			new Date(result.resetTime).toISOString(),
		);

		return handler(req, res);
	};
}

// Simple in-memory rate limiter (per IP or key)
// Para producción, migrar a Redis o similar

const WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const MAX_REQUESTS = 8; // Máximo de intentos por ventana

// Estructura: { [key: string]: { count: number, expires: number } }
const store: Record<string, { count: number; expires: number }> = {};

export function rateLimit(key: string): {
	allowed: boolean;
	retryAfter: number;
} {
	const now = Date.now();
	if (!store[key] || store[key].expires < now) {
		store[key] = { count: 1, expires: now + WINDOW_MS };
		return { allowed: true, retryAfter: 0 };
	}
	if (store[key].count < MAX_REQUESTS) {
		store[key].count++;
		return { allowed: true, retryAfter: 0 };
	}
	// Demasiados intentos
	return {
		allowed: false,
		retryAfter: Math.ceil((store[key].expires - now) / 1000),
	};
}
