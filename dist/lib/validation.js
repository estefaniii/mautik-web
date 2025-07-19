"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderSchema = exports.reviewSchema = exports.productSchema = exports.userSchema = void 0;
exports.sanitizeString = sanitizeString;
exports.isValidEmail = isValidEmail;
exports.isValidUrl = isValidUrl;
exports.isValidPhone = isValidPhone;
exports.isValidPrice = isValidPrice;
exports.isValidStock = isValidStock;
exports.isValidDiscount = isValidDiscount;
exports.isValidSku = isValidSku;
exports.isValidRating = isValidRating;
exports.isValidUuid = isValidUuid;
exports.validateAndSanitize = validateAndSanitize;
exports.useValidation = useValidation;
const zod_1 = require("zod");
const react_1 = require("react");
// Esquemas de validación
exports.userSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(50, 'El nombre no puede exceder 50 caracteres')
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
    email: zod_1.z
        .string()
        .email('Email inválido')
        .min(5, 'El email debe tener al menos 5 caracteres')
        .max(100, 'El email no puede exceder 100 caracteres'),
    password: zod_1.z
        .string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .max(100, 'La contraseña no puede exceder 100 caracteres')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
    phone: zod_1.z
        .string()
        .regex(/^\+?[\d\s\-\(\)]+$/, 'Número de teléfono inválido')
        .optional(),
    address: zod_1.z
        .object({
        street: zod_1.z
            .string()
            .min(5, 'La dirección debe tener al menos 5 caracteres'),
        city: zod_1.z.string().min(2, 'La ciudad debe tener al menos 2 caracteres'),
        state: zod_1.z.string().min(2, 'El estado debe tener al menos 2 caracteres'),
        zipCode: zod_1.z.string().regex(/^\d{5}(-\d{4})?$/, 'Código postal inválido'),
        country: zod_1.z.string().min(2, 'El país debe tener al menos 2 caracteres'),
    })
        .optional(),
});
exports.productSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(3, 'El nombre del producto debe tener al menos 3 caracteres')
        .max(100, 'El nombre del producto no puede exceder 100 caracteres'),
    description: zod_1.z
        .string()
        .min(10, 'La descripción debe tener al menos 10 caracteres')
        .max(1000, 'La descripción no puede exceder 1000 caracteres'),
    price: zod_1.z
        .number()
        .positive('El precio debe ser mayor a 0')
        .max(10000, 'El precio no puede exceder $10,000'),
    originalPrice: zod_1.z
        .number()
        .positive('El precio original debe ser mayor a 0')
        .max(10000, 'El precio original no puede exceder $10,000')
        .optional(),
    stock: zod_1.z
        .number()
        .int('El stock debe ser un número entero')
        .min(0, 'El stock no puede ser negativo')
        .max(10000, 'El stock no puede exceder 10,000'),
    category: zod_1.z
        .string()
        .min(2, 'La categoría debe tener al menos 2 caracteres')
        .max(50, 'La categoría no puede exceder 50 caracteres'),
    sku: zod_1.z
        .string()
        .min(3, 'El SKU debe tener al menos 3 caracteres')
        .max(50, 'El SKU no puede exceder 50 caracteres')
        .regex(/^[A-Z0-9\-_]+$/, 'El SKU solo puede contener letras mayúsculas, números, guiones y guiones bajos'),
    images: zod_1.z
        .array(zod_1.z.string().url('URL de imagen inválida'))
        .min(1, 'Debe incluir al menos una imagen')
        .max(10, 'No puede exceder 10 imágenes'),
    featured: zod_1.z.boolean().optional(),
    isNew: zod_1.z.boolean().optional(),
    discount: zod_1.z
        .number()
        .min(0, 'El descuento no puede ser negativo')
        .max(100, 'El descuento no puede exceder 100%')
        .optional(),
});
exports.reviewSchema = zod_1.z.object({
    rating: zod_1.z
        .number()
        .min(1, 'La calificación debe ser al menos 1')
        .max(5, 'La calificación no puede exceder 5'),
    comment: zod_1.z
        .string()
        .min(10, 'El comentario debe tener al menos 10 caracteres')
        .max(500, 'El comentario no puede exceder 500 caracteres')
        .regex(/^[^<>]*$/, 'El comentario no puede contener caracteres especiales'),
});
exports.orderSchema = zod_1.z.object({
    items: zod_1.z
        .array(zod_1.z.object({
        productId: zod_1.z.string().uuid('ID de producto inválido'),
        quantity: zod_1.z
            .number()
            .int('La cantidad debe ser un número entero')
            .positive('La cantidad debe ser mayor a 0')
            .max(100, 'La cantidad no puede exceder 100'),
    }))
        .min(1, 'Debe incluir al menos un producto'),
    address: zod_1.z.object({
        street: zod_1.z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
        city: zod_1.z.string().min(2, 'La ciudad debe tener al menos 2 caracteres'),
        state: zod_1.z.string().min(2, 'El estado debe tener al menos 2 caracteres'),
        zipCode: zod_1.z.string().regex(/^\d{5}(-\d{4})?$/, 'Código postal inválido'),
        country: zod_1.z.string().min(2, 'El país debe tener al menos 2 caracteres'),
    }),
});
// Función para sanitizar strings
function sanitizeString(input) {
    return input
        .trim()
        .replace(/[<>]/g, '') // Remover < y >
        .replace(/javascript:/gi, '') // Remover javascript:
        .replace(/on\w+=/gi, '') // Remover event handlers
        .replace(/script/gi, ''); // Remover script
}
// Función para validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
// Función para validar URL
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch (_a) {
        return false;
    }
}
// Función para validar número de teléfono
function isValidPhone(phone) {
    const phoneRegex = /^\+?[\d\s\-\(\)]{7,15}$/;
    return phoneRegex.test(phone);
}
// Función para validar precio
function isValidPrice(price) {
    return price > 0 && price <= 10000 && Number.isFinite(price);
}
// Función para validar stock
function isValidStock(stock) {
    return stock >= 0 && stock <= 10000 && Number.isInteger(stock);
}
// Función para validar descuento
function isValidDiscount(discount) {
    return discount >= 0 && discount <= 100 && Number.isFinite(discount);
}
// Función para validar SKU
function isValidSku(sku) {
    const skuRegex = /^[A-Z0-9\-_]{3,50}$/;
    return skuRegex.test(sku);
}
// Función para validar rating
function isValidRating(rating) {
    return rating >= 1 && rating <= 5 && Number.isFinite(rating);
}
// Función para validar UUID
function isValidUuid(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}
// Función para validar y sanitizar datos
function validateAndSanitize(data, schema) {
    try {
        // Sanitizar strings si es posible
        const sanitizedData = sanitizeData(data);
        // Validar con Zod
        const validatedData = schema.parse(sanitizedData);
        return { success: true, data: validatedData };
    }
    catch (error) {
        const errorToUse = error instanceof Error
            ? error
            : new Error(typeof error === 'string' ? error : JSON.stringify(error));
        if (errorToUse instanceof zod_1.z.ZodError) {
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
function sanitizeData(data) {
    if (typeof data === 'string') {
        return sanitizeString(data);
    }
    if (Array.isArray(data)) {
        return data.map(sanitizeData);
    }
    if (typeof data === 'object' && data !== null) {
        const sanitized = {};
        for (const [key, value] of Object.entries(data)) {
            sanitized[key] = sanitizeData(value);
        }
        return sanitized;
    }
    return data;
}
// Hook para validación en tiempo real
function useValidation(schema, initialData) {
    const [data, setData] = (0, react_1.useState)(initialData || {});
    const [errors, setErrors] = (0, react_1.useState)({});
    const [isValid, setIsValid] = (0, react_1.useState)(false);
    const validate = (0, react_1.useCallback)((fieldData) => {
        try {
            schema.parse(fieldData);
            setErrors({});
            setIsValid(true);
            return true;
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const fieldErrors = {};
                error.errors.forEach((err) => {
                    const field = err.path.join('.');
                    fieldErrors[field] = err.message;
                });
                setErrors(fieldErrors);
                setIsValid(false);
            }
            return false;
        }
    }, [schema]);
    const updateField = (0, react_1.useCallback)((field, value) => {
        const newData = Object.assign(Object.assign({}, data), { [field]: value });
        setData(newData);
        validate(newData);
    }, [data, validate]);
    const validateField = (0, react_1.useCallback)((field) => {
        return errors[field] || null;
    }, [errors]);
    return {
        data,
        errors,
        isValid,
        updateField,
        validateField,
        validate: () => validate(data),
    };
}
