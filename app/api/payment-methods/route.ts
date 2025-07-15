import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

// Helper para obtener el token del request
function getTokenFromRequest(request: NextRequest): string | null {
	const authHeader = request.headers.get('authorization');
	if (authHeader && authHeader.startsWith('Bearer ')) {
		return authHeader.replace('Bearer ', '');
	}
	const cookies = request.cookies;
	const tokenCookie = cookies.get('auth-token');
	return tokenCookie?.value || null;
}

// GET: Listar métodos de pago del usuario autenticado
export async function GET(request: NextRequest) {
	try {
		const token = getTokenFromRequest(request);
		if (!token) {
			return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
		}
		const decoded = verifyToken(token);
		if (!decoded) {
			return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
		}
		const userId = decoded.id;
		const methods = await prisma.paymentMethod.findMany({
			where: { userId },
			orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
		});
		return NextResponse.json(methods);
	} catch (error) {
		console.error('Error GET payment methods:', error);
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		);
	}
}

// POST: Agregar un método de pago
export async function POST(request: NextRequest) {
	try {
		const token = getTokenFromRequest(request);
		if (!token) {
			return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
		}
		const decoded = verifyToken(token);
		if (!decoded) {
			return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
		}
		const userId = decoded.id;
		const body = await request.json();
		const {
			type,
			brand,
			last4,
			expMonth,
			expYear,
			stripePaymentMethodId,
			isDefault,
		} = body;
		// Si es el primer método, ponerlo como default
		const count = await prisma.paymentMethod.count({ where: { userId } });
		const paymentMethod = await prisma.paymentMethod.create({
			data: {
				userId,
				type,
				brand,
				last4,
				expMonth,
				expYear,
				stripePaymentMethodId,
				isDefault: count === 0 ? true : !!isDefault,
			},
		});
		// Si se marca como default, quitar default de los demás
		if (paymentMethod.isDefault) {
			await prisma.paymentMethod.updateMany({
				where: { userId, id: { not: paymentMethod.id } },
				data: { isDefault: false },
			});
		}
		return NextResponse.json(paymentMethod, { status: 201 });
	} catch (error) {
		console.error('Error POST payment method:', error);
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		);
	}
}
