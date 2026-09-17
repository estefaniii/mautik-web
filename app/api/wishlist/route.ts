import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

async function getAuthUser(request: NextRequest) {
	// 1. Intentar con NextAuth session
	const session = await getServerSession(authOptions);
	if (session?.user) {
		const email = session.user.email;
		if (email) {
			const user = await prisma.user.findUnique({ where: { email } });
			if (user) return user;
		}
	}
	// 2. Fallback: cookie auth-token (JWT custom)
	try {
		const token = request.cookies.get('auth-token')?.value;
		if (token) {
			const jwt = await import('jsonwebtoken');
			const decoded = jwt.default.verify(token, process.env.JWT_SECRET!) as any;
			if (decoded?.id) {
				return await prisma.user.findUnique({ where: { id: decoded.id } });
			}
		}
	} catch {}
	return null;
}

// GET - Obtener wishlist del usuario
export async function GET(request: NextRequest) {
	try {
		const user = await getAuthUser(request);
		if (!user) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
		}

		const wishlist = await prisma.wishlistItem.findMany({
			where: { userId: user.id },
			include: { product: true },
			orderBy: { addedAt: 'desc' },
		});

		const mappedWishlist = wishlist.map((item) => ({
			id: item.product.id,
			name: item.product.name,
			price: item.product.price,
			originalPrice: item.product.originalPrice,
			description: item.product.description,
			images: item.product.images,
			category: item.product.category,
			stock: item.product.stock,
			rating: 4.5,
			reviewCount: 0,
			featured: item.product.featured,
			isNew: item.product.isNew,
			discount: item.product.discount,
			addedAt: item.addedAt,
		}));

		return NextResponse.json(mappedWishlist);
	} catch (error) {
		console.error('Error fetching wishlist:', error);
		return NextResponse.json({ error: 'Error al obtener lista de deseos' }, { status: 500 });
	}
}

// POST - Agregar productos a wishlist
export async function POST(request: NextRequest) {
	try {
		const user = await getAuthUser(request);
		if (!user) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
		}

		const wishlistItems = await request.json();
		const addedItems = [];

		for (const item of wishlistItems) {
			const existing = await prisma.wishlistItem.findFirst({
				where: { userId: user.id, productId: item.id },
			});
			if (!existing) {
				const wishlistItem = await prisma.wishlistItem.create({
					data: {
						userId: user.id,
						productId: item.id,
						addedAt: new Date(item.addedAt || Date.now()),
					},
					include: { product: true },
				});
				addedItems.push(wishlistItem);
			}
		}

		return NextResponse.json({ success: true, added: addedItems.length });
	} catch (error) {
		console.error('Error adding to wishlist:', error);
		return NextResponse.json({ error: 'Error al agregar a lista de deseos' }, { status: 500 });
	}
}

// DELETE - Limpiar wishlist
export async function DELETE(request: NextRequest) {
	try {
		const user = await getAuthUser(request);
		if (!user) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
		}

		await prisma.wishlistItem.deleteMany({ where: { userId: user.id } });
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error clearing wishlist:', error);
		return NextResponse.json({ error: 'Error al limpiar lista de deseos' }, { status: 500 });
	}
}

// PATCH - Eliminar producto específico de wishlist
export async function PATCH(request: NextRequest) {
	try {
		const user = await getAuthUser(request);
		if (!user) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
		}

		const { productId } = await request.json();
		if (!productId) {
			return NextResponse.json({ error: 'ID de producto requerido' }, { status: 400 });
		}

		await prisma.wishlistItem.deleteMany({
			where: { userId: user.id, productId },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error removing from wishlist:', error);
		return NextResponse.json({ error: 'Error al eliminar de lista de deseos' }, { status: 500 });
	}
}
