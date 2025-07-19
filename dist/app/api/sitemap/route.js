"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const BASE_URL = 'https://mautik.com';
async function GET() {
    // Obtener productos desde Prisma
    const products = await db_1.prisma.product.findMany({ select: { id: true } });
    const urls = [
        BASE_URL,
        ...products.map((p) => `${BASE_URL}/product/${p.id}`),
    ];
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `<url><loc>${url}</loc></url>`).join('')}
</urlset>`;
    return new server_1.NextResponse(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}
