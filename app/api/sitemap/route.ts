import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

const BASE_URL = 'https://mautik.com';

export async function GET() {
	await connectDB();
	const products = await Product.find({}).select('_id').lean();
	const urls = [
		'',
		'/shop',
		'/login',
		'/profile',
		'/cart',
		'/checkout',
		'/about',
		'/contact',
		'/privacy-policy',
		'/terms-of-service',
		...products.map((p: any) => `/product/${p._id}`),
	];
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${BASE_URL}${url}</loc></url>`).join('\n')}
</urlset>`;
	return new NextResponse(xml, {
		status: 200,
		headers: {
			'Content-Type': 'application/xml',
		},
	});
}
