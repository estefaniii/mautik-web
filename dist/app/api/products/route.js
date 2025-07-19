"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
// GET - Obtener productos
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const inStock = searchParams.get('inStock') === 'true';
        const featured = searchParams.get('featured') === 'true';
        const isNew = searchParams.get('isNew') === 'true';
        // Construir filtros
        const where = {};
        if (category) {
            where.category = {
                equals: category,
                mode: 'insensitive',
            };
        }
        if (search) {
            where.OR = [
                {
                    name: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    description: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
            ];
        }
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice)
                where.price.gte = parseFloat(minPrice);
            if (maxPrice)
                where.price.lte = parseFloat(maxPrice);
        }
        if (inStock) {
            where.stock = {
                gt: 0,
            };
        }
        if (featured) {
            where.featured = true;
        }
        if (isNew) {
            where.isNew = true;
        }
        // Construir ordenamiento
        const orderBy = {};
        orderBy[sortBy] = sortOrder;
        // Obtener productos con reseñas
        const products = await db_1.prisma.product.findMany({
            where,
            orderBy,
            take: limit,
            skip: offset,
            include: {
                reviews: {
                    select: {
                        rating: true,
                    },
                },
            },
        });
        // Calcular ratings y conteos
        const productsWithRatings = products.map((product) => {
            const totalReviews = product.reviews.length;
            const averageRating = totalReviews > 0
                ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
                    totalReviews
                : 0;
            return {
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                originalPrice: product.originalPrice,
                stock: product.stock,
                images: product.images,
                category: product.category,
                sku: product.sku,
                featured: product.featured,
                isNew: product.isNew,
                discount: product.discount,
                averageRating: Math.round(averageRating * 10) / 10,
                totalReviews,
                createdAt: product.createdAt,
                updatedAt: product.updatedAt,
            };
        });
        return server_1.NextResponse.json(productsWithRatings);
    }
    catch (error) {
        console.error('Error fetching products:', error);
        return server_1.NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 });
    }
}
// POST - Crear nuevo producto
async function POST(request) {
    try {
        const body = await request.json();
        const { name, description, price, originalPrice, stock, images, category, sku, featured = false, isNew = false, discount = 0, } = body;
        // Validaciones
        if (!name || !description || !price || !stock || !category || !sku) {
            return server_1.NextResponse.json({ error: 'Todos los campos obligatorios deben estar presentes' }, { status: 400 });
        }
        if (price <= 0) {
            return server_1.NextResponse.json({ error: 'El precio debe ser mayor a 0' }, { status: 400 });
        }
        if (stock < 0) {
            return server_1.NextResponse.json({ error: 'El stock no puede ser negativo' }, { status: 400 });
        }
        if (discount < 0 || discount > 100) {
            return server_1.NextResponse.json({ error: 'El descuento debe estar entre 0 y 100' }, { status: 400 });
        }
        // Verificar si el SKU ya existe
        const existingProduct = await db_1.prisma.product.findUnique({
            where: { sku },
        });
        if (existingProduct) {
            return server_1.NextResponse.json({ error: 'El SKU ya existe' }, { status: 400 });
        }
        // Crear producto
        const product = await db_1.prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                originalPrice: originalPrice ? parseFloat(originalPrice) : null,
                stock: parseInt(stock),
                images: Array.isArray(images) ? images : [],
                category,
                sku,
                featured,
                isNew,
                discount: parseInt(discount),
            },
        });
        return server_1.NextResponse.json(product, { status: 201 });
    }
    catch (error) {
        console.error('Error creating product:', error);
        return server_1.NextResponse.json({ error: 'Error al crear producto' }, { status: 500 });
    }
}
