"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');
        if (!productId) {
            return server_1.NextResponse.json({ error: 'productId es requerido' }, { status: 400 });
        }
        // Get reviews for the specific product
        const reviews = await db_1.prisma.review.findMany({
            where: { productId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        // Calculate stats
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
            : 0;
        // Calculate rating distribution
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach((review) => {
            if (review.rating >= 1 && review.rating <= 5) {
                distribution[review.rating]++;
            }
        });
        return server_1.NextResponse.json({
            reviews,
            stats: {
                averageRating,
                totalReviews,
                distribution,
            },
        });
    }
    catch (error) {
        console.error('Error fetching reviews:', error);
        return server_1.NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
async function POST(request) {
    try {
        const data = await request.json();
        if (!data.productId ||
            !data.userId ||
            typeof data.rating !== 'number' ||
            !data.comment) {
            return server_1.NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
        }
        // Check if the user already has a review for this product
        const existingReview = await db_1.prisma.review.findFirst({
            where: {
                productId: data.productId,
                userId: data.userId,
            },
        });
        if (existingReview) {
            return server_1.NextResponse.json({ error: 'Ya has dejado una reseña para este producto.' }, { status: 400 });
        }
        const review = await db_1.prisma.review.create({
            data: {
                productId: data.productId,
                userId: data.userId,
                rating: data.rating,
                comment: data.comment,
            },
            include: { user: true, product: true },
        });
        return server_1.NextResponse.json({ message: 'Review creada exitosamente', review });
    }
    catch (error) {
        console.error('Error creando review:', error);
        return server_1.NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
