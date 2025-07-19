"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = sitemap;
const db_1 = require("@/lib/db");
async function sitemap() {
    const baseUrl = 'https://mautik.com';
    // Static pages
    const staticPages = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/shop`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/lookbook`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/privacy-policy`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms-of-service`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ];
    // Category pages
    const categories = [
        'crochet',
        'llaveros',
        'pulseras',
        'collares',
        'anillos',
        'aretes',
        'otros',
    ];
    const categoryPages = categories.map((category) => ({
        url: `${baseUrl}/shop/${category}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));
    // Product pages
    let productPages = [];
    try {
        const products = await db_1.prisma.product.findMany({
            select: {
                id: true,
                updatedAt: true,
            },
        });
        productPages = products.map((product) => ({
            url: `${baseUrl}/product/${product.id}`,
            lastModified: product.updatedAt,
            changeFrequency: 'weekly',
            priority: 0.6,
        }));
    }
    catch (error) {
        console.error('Error fetching products for sitemap:', error);
    }
    return [...staticPages, ...categoryPages, ...productPages];
}
