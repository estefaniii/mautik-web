import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

// Función para verificar el token JWT desde las cookies
const verifyTokenFromCookies = (request: NextRequest) => {
	try {
		const authToken = request.cookies.get('auth-token')?.value;

		if (!authToken) {
			return null;
		}

		const decoded = jwt.verify(authToken, JWT_SECRET) as any;
		return decoded;
	} catch (error) {
		console.error('Token verification error:', error);
		return null;
	}
};

// GET - Obtener wishlist del usuario
export async function GET(request: NextRequest) {
	try {
		const user = verifyTokenFromCookies(request);

		if (!user) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
		}
		// Verificar que el usuario existe en la base de datos
		const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
		if (!dbUser) {
			return NextResponse.json(
				{ error: 'Usuario no existe en la base de datos' },
				{ status: 401 },
			);
		}

		const wishlist = await prisma.wishlistItem.findMany({
			where: { userId: user.id },
			include: {
				product: true,
			},
			orderBy: { addedAt: 'desc' },
		});

		// Mapear a formato WishlistItem
		const mappedWishlist = wishlist.map((item) => ({
			id: item.product.id,
			name: item.product.name,
			price: item.product.price,
			originalPrice: item.product.originalPrice,
			description: item.product.description,
			images: item.product.images,
			category: item.product.category,
			stock: item.product.stock,
			rating: 4.5, // TODO: Calcular rating real
			reviewCount: 0, // TODO: Obtener conteo real de reseñas
			featured: item.product.featured,
			isNew: item.product.isNew,
			discount: item.product.discount,
			addedAt: item.addedAt,
		}));

		return NextResponse.json(mappedWishlist);
	} catch (error) {
		console.error('Error fetching wishlist:', error);
		return NextResponse.json(
			{ error: 'Error al obtener lista de deseos' },
			{ status: 500 },
		);
	}
}

// POST - Agregar productos a wishlist
export async function POST(request: NextRequest) {
	try {
		const user = verifyTokenFromCookies(request);

		if (!user) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
		}
		// Verificar que el usuario existe en la base de datos
		const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
		if (!dbUser) {
			return NextResponse.json(
				{ error: 'Usuario no existe en la base de datos' },
				{ status: 401 },
			);
		}

		const wishlistItems = await request.json();

		// Agregar productos a la wishlist
		const addedItems = [];
		for (const item of wishlistItems) {
			// Verificar si ya existe
			const existing = await prisma.wishlistItem.findFirst({
				where: {
					userId: user.id,
					productId: item.id,
				},
			});

			if (!existing) {
				const wishlistItem = await prisma.wishlistItem.create({
					data: {
						userId: user.id,
						productId: item.id,
						addedAt: new Date(item.addedAt || Date.now()),
					},
					include: {
						product: true,
					},
				});
				addedItems.push(wishlistItem);
			}
		}

		return NextResponse.json({
			success: true,
			added: addedItems.length,
		});
	} catch (error) {
		console.error('Error adding to wishlist:', error);
		return NextResponse.json(
			{ error: 'Error al agregar a lista de deseos' },
			{ status: 500 },
		);
	}
}

// DELETE - Limpiar wishlist
export async function DELETE(request: NextRequest) {
	try {
		const user = verifyTokenFromCookies(request);

		if (!user) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
		}
		// Verificar que el usuario existe en la base de datos
		const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
		if (!dbUser) {
			return NextResponse.json(
				{ error: 'Usuario no existe en la base de datos' },
				{ status: 401 },
			);
		}

		await prisma.wishlistItem.deleteMany({
			where: { userId: user.id },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error clearing wishlist:', error);
		return NextResponse.json(
			{ error: 'Error al limpiar lista de deseos' },
			{ status: 500 },
		);
	}
}

// PATCH - Eliminar producto específico de wishlist
export async function PATCH(request: NextRequest) {
	try {
		const user = verifyTokenFromCookies(request);

		if (!user) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
		}
		// Verificar que el usuario existe en la base de datos
		const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
		if (!dbUser) {
			return NextResponse.json(
				{ error: 'Usuario no existe en la base de datos' },
				{ status: 401 },
			);
		}

		const { productId } = await request.json();

		if (!productId) {
			return NextResponse.json(
				{ error: 'ID de producto requerido' },
				{ status: 400 },
			);
		}

		await prisma.wishlistItem.deleteMany({
			where: {
				userId: user.id,
				productId: productId,
			},
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error removing from wishlist:', error);
		return NextResponse.json(
			{ error: 'Error al eliminar de lista de deseos' },
			{ status: 500 },
		);
	}
}
