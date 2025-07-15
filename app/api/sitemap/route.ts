import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const BASE_URL = 'https://mautik.com';

export async function GET() {
	// Obtener productos desde Prisma
	const products = await prisma.product.findMany({ select: { id: true } });
	const urls = [
		BASE_URL,
		...products.map((p: { id: string }) => `${BASE_URL}/product/${p.id}`),
	];
	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `<url><loc>${url}</loc></url>`).join('')}
</urlset>`;
	return new NextResponse(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
		},
	});
}
