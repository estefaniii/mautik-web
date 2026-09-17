import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

async function getAuthUser(request: NextRequest) {
	// 1. NextAuth session
	const session = await getServerSession(authOptions);
	if (session?.user?.email) {
		const user = await prisma.user.findUnique({ where: { email: session.user.email } });
		if (user) return user;
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

// GET - Obtener carrito
export async function GET(request: NextRequest) {
	try {
		const user = await getAuthUser(request);
		if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

		const cartItems = await prisma.cartItem.findMany({
			where: { userId: user.id },
			include: { product: true },
			orderBy: { createdAt: 'asc' },
		});
		return NextResponse.json(cartItems);
	} catch (error) {
		return NextResponse.json({ error: 'Error al obtener carrito' }, { status: 500 });
	}
}

// POST - Agregar producto al carrito
export async function POST(request: NextRequest) {
	try {
		const user = await getAuthUser(request);
		if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

		const { productId, quantity } = await request.json();
		if (!productId || typeof quantity !== 'number') {
			return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
		}

		const existing = await prisma.cartItem.findFirst({
			where: { userId: user.id, productId },
		});

		let cartItem;
		if (existing) {
			cartItem = await prisma.cartItem.update({
				where: { id: existing.id },
				data: { quantity: existing.quantity + quantity },
			});
		} else {
			cartItem = await prisma.cartItem.create({
				data: { userId: user.id, productId, quantity },
			});
		}
		return NextResponse.json(cartItem);
	} catch (error) {
		return NextResponse.json({ error: 'Error al agregar al carrito' }, { status: 500 });
	}
}

// PUT - Actualizar cantidad
export async function PUT(request: NextRequest) {
	try {
		const user = await getAuthUser(request);
		if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

		const { productId, quantity } = await request.json();
		if (!productId || typeof quantity !== 'number') {
			return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
		}

		const cartItem = await prisma.cartItem.updateMany({
			where: { userId: user.id, productId },
			data: { quantity },
		});
		return NextResponse.json(cartItem);
	} catch (error) {
		return NextResponse.json({ error: 'Error al actualizar cantidad' }, { status: 500 });
	}
}

// DELETE - Eliminar producto o limpiar carrito
export async function DELETE(request: NextRequest) {
	try {
		const user = await getAuthUser(request);
		if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

		const { productId } = await request.json();

		if (productId) {
			await prisma.cartItem.deleteMany({
				where: { userId: user.id, productId },
			});
		} else {
			await prisma.cartItem.deleteMany({ where: { userId: user.id } });
		}
		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json({ error: 'Error al eliminar del carrito' }, { status: 500 });
	}
}
