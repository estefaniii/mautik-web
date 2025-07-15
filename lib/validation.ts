import { z } from 'zod';
import { useState, useCallback } from 'react';

// Esquemas de validación
export const userSchema = z.object({
	name: z
		.string()
		.min(2, 'El nombre debe tener al menos 2 caracteres')
		.max(50, 'El nombre no puede exceder 50 caracteres')
		.regex(
			/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
			'El nombre solo puede contener letras y espacios',
		),

	email: z
		.string()
		.email('Email inválido')
		.min(5, 'El email debe tener al menos 5 caracteres')
		.max(100, 'El email no puede exceder 100 caracteres'),

	password: z
		.string()
		.min(8, 'La contraseña debe tener al menos 8 caracteres')
		.max(100, 'La contraseña no puede exceder 100 caracteres')
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
			'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
		),

	phone: z
		.string()
		.regex(/^\+?[\d\s\-\(\)]+$/, 'Número de teléfono inválido')
		.optional(),

	address: z
		.object({
			street: z
				.string()
				.min(5, 'La dirección debe tener al menos 5 caracteres'),
			city: z.string().min(2, 'La ciudad debe tener al menos 2 caracteres'),
			state: z.string().min(2, 'El estado debe tener al menos 2 caracteres'),
			zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Código postal inválido'),
			country: z.string().min(2, 'El país debe tener al menos 2 caracteres'),
		})
		.optional(),
});

export const productSchema = z.object({
	name: z
		.string()
		.min(3, 'El nombre del producto debe tener al menos 3 caracteres')
		.max(100, 'El nombre del producto no puede exceder 100 caracteres'),

	description: z
		.string()
		.min(10, 'La descripción debe tener al menos 10 caracteres')
		.max(1000, 'La descripción no puede exceder 1000 caracteres'),

	price: z
		.number()
		.positive('El precio debe ser mayor a 0')
		.max(10000, 'El precio no puede exceder $10,000'),

	originalPrice: z
		.number()
		.positive('El precio original debe ser mayor a 0')
		.max(10000, 'El precio original no puede exceder $10,000')
		.optional(),

	stock: z
		.number()
		.int('El stock debe ser un número entero')
		.min(0, 'El stock no puede ser negativo')
		.max(10000, 'El stock no puede exceder 10,000'),

	category: z
		.string()
		.min(2, 'La categoría debe tener al menos 2 caracteres')
		.max(50, 'La categoría no puede exceder 50 caracteres'),

	sku: z
		.string()
		.min(3, 'El SKU debe tener al menos 3 caracteres')
		.max(50, 'El SKU no puede exceder 50 caracteres')
		.regex(
			/^[A-Z0-9\-_]+$/,
			'El SKU solo puede contener letras mayúsculas, números, guiones y guiones bajos',
		),

	images: z
		.array(z.string().url('URL de imagen inválida'))
		.min(1, 'Debe incluir al menos una imagen')
		.max(10, 'No puede exceder 10 imágenes'),

	featured: z.boolean().optional(),
	isNew: z.boolean().optional(),
	discount: z
		.number()
		.min(0, 'El descuento no puede ser negativo')
		.max(100, 'El descuento no puede exceder 100%')
		.optional(),
});

export const reviewSchema = z.object({
	rating: z
		.number()
		.min(1, 'La calificación debe ser al menos 1')
		.max(5, 'La calificación no puede exceder 5'),

	comment: z
		.string()
		.min(10, 'El comentario debe tener al menos 10 caracteres')
		.max(500, 'El comentario no puede exceder 500 caracteres')
		.regex(/^[^<>]*$/, 'El comentario no puede contener caracteres especiales'),
});

export const orderSchema = z.object({
	items: z
		.array(
			z.object({
				productId: z.string().uuid('ID de producto inválido'),
				quantity: z
					.number()
					.int('La cantidad debe ser un número entero')
					.positive('La cantidad debe ser mayor a 0')
					.max(100, 'La cantidad no puede exceder 100'),
			}),
		)
		.min(1, 'Debe incluir al menos un producto'),

	address: z.object({
		street: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
		city: z.string().min(2, 'La ciudad debe tener al menos 2 caracteres'),
		state: z.string().min(2, 'El estado debe tener al menos 2 caracteres'),
		zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Código postal inválido'),
		country: z.string().min(2, 'El país debe tener al menos 2 caracteres'),
	}),
});

// Función para sanitizar strings
export function sanitizeString(input: string): string {
	return input
		.trim()
		.replace(/[<>]/g, '') // Remover < y >
		.replace(/javascript:/gi, '') // Remover javascript:
		.replace(/on\w+=/gi, '') // Remover event handlers
		.replace(/script/gi, ''); // Remover script
}

// Función para validar email
export function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

// Función para validar URL
export function isValidUrl(url: string): boolean {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}

// Función para validar número de teléfono
export function isValidPhone(phone: string): boolean {
	const phoneRegex = /^\+?[\d\s\-\(\)]{7,15}$/;
	return phoneRegex.test(phone);
}

// Función para validar precio
export function isValidPrice(price: number): boolean {
	return price > 0 && price <= 10000 && Number.isFinite(price);
}

// Función para validar stock
export function isValidStock(stock: number): boolean {
	return stock >= 0 && stock <= 10000 && Number.isInteger(stock);
}

// Función para validar descuento
export function isValidDiscount(discount: number): boolean {
	return discount >= 0 && discount <= 100 && Number.isFinite(discount);
}

// Función para validar SKU
export function isValidSku(sku: string): boolean {
	const skuRegex = /^[A-Z0-9\-_]{3,50}$/;
	return skuRegex.test(sku);
}

// Función para validar rating
export function isValidRating(rating: number): boolean {
	return rating >= 1 && rating <= 5 && Number.isFinite(rating);
}

// Función para validar UUID
export function isValidUuid(uuid: string): boolean {
	const uuidRegex =
		/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return uuidRegex.test(uuid);
}

// Función para validar y sanitizar datos
export function validateAndSanitize<T>(
	data: any,
	schema: z.ZodSchema<T>,
): { success: true; data: T } | { success: false; errors: string[] } {
	try {
		// Sanitizar strings si es posible
		const sanitizedData = sanitizeData(data);

		// Validar con Zod
		const validatedData = schema.parse(sanitizedData);

		return { success: true, data: validatedData };
	} catch (error) {
		const errorToUse =
			error instanceof Error
				? error
				: new Error(typeof error === 'string' ? error : JSON.stringify(error));
		if (errorToUse instanceof z.ZodError) {
			return {
				success: false,
				errors: errorToUse.errors.map((err) => err.message),
			};
		}
		return {
			success: false,
			errors: ['Error de validación desconocido'],
		};
	}
}

// Función para sanitizar datos recursivamente
function sanitizeData(data: any): any {
	if (typeof data === 'string') {
		return sanitizeString(data);
	}

	if (Array.isArray(data)) {
		return data.map(sanitizeData);
	}

	if (typeof data === 'object' && data !== null) {
		const sanitized: any = {};
		for (const [key, value] of Object.entries(data)) {
			sanitized[key] = sanitizeData(value);
		}
		return sanitized;
	}

	return data;
}

// Hook para validación en tiempo real
export function useValidation<T>(
	schema: z.ZodSchema<T>,
	initialData?: Partial<T>,
) {
	const [data, setData] = useState<Partial<T>>(initialData || {});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isValid, setIsValid] = useState(false);

	const validate = useCallback(
		(fieldData: Partial<T>) => {
			try {
				schema.parse(fieldData);
				setErrors({});
				setIsValid(true);
				return true;
			} catch (error) {
				if (error instanceof z.ZodError) {
					const fieldErrors: Record<string, string> = {};
					error.errors.forEach((err) => {
						const field = err.path.join('.');
						fieldErrors[field] = err.message;
					});
					setErrors(fieldErrors);
					setIsValid(false);
				}
				return false;
			}
		},
		[schema],
	);

	const updateField = useCallback(
		(field: keyof T, value: any) => {
			const newData = { ...data, [field]: value };
			setData(newData);
			validate(newData);
		},
		[data, validate],
	);

	const validateField = useCallback(
		(field: keyof T) => {
			return errors[field as string] || null;
		},
		[errors],
	);

	return {
		data,
		errors,
		isValid,
		updateField,
		validateField,
		validate: () => validate(data),
	};
}
