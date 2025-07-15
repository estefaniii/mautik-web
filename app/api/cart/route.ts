import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Obtener carrito del usuario autenticado
export async function GET(request: NextRequest) {
	try {
		const token = request.cookies.get('auth-token')?.value;
		if (!token)
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
		const user = verifyToken(token);
		if (!user)
			return NextResponse.json({ error: 'Token inválido' }, { status: 401 });

		const cartItems = await prisma.cartItem.findMany({
			where: { userId: user.id },
			include: { product: true },
			orderBy: { createdAt: 'asc' },
		});
		return NextResponse.json(cartItems);
	} catch (error) {
		return NextResponse.json(
			{ error: 'Error al obtener carrito' },
			{ status: 500 },
		);
	}
}

// Agregar producto al carrito
export async function POST(request: NextRequest) {
	try {
		const token = request.cookies.get('auth-token')?.value;
		if (!token)
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
		const user = verifyToken(token);
		if (!user)
			return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
		const { productId, quantity } = await request.json();
		if (!productId || typeof quantity !== 'number') {
			return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
		}
		// Si ya existe, suma la cantidad
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
		return NextResponse.json(
			{ error: 'Error al agregar al carrito' },
			{ status: 500 },
		);
	}
}

// Actualizar cantidad de un producto
export async function PUT(request: NextRequest) {
	try {
		const token = request.cookies.get('auth-token')?.value;
		if (!token)
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
		const user = verifyToken(token);
		if (!user)
			return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
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
		return NextResponse.json(
			{ error: 'Error al actualizar cantidad' },
			{ status: 500 },
		);
	}
}

// Eliminar producto del carrito o limpiar carrito
export async function DELETE(request: NextRequest) {
	try {
		const token = request.cookies.get('auth-token')?.value;
		if (!token)
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
		const user = verifyToken(token);
		if (!user)
			return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
		const { productId } = await request.json();
		if (productId) {
			// Eliminar solo ese producto
			await prisma.cartItem.deleteMany({
				where: { userId: user.id, productId },
			});
		} else {
			// Limpiar todo el carrito
			await prisma.cartItem.deleteMany({ where: { userId: user.id } });
		}
		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ error: 'Error al eliminar del carrito' },
			{ status: 500 },
		);
	}
}
