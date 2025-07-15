// Uso de 'params' actualizado para Next.js 13+ API routes
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

function getTokenFromRequest(request: NextRequest): string | null {
	const authHeader = request.headers.get('authorization');
	if (authHeader && authHeader.startsWith('Bearer ')) {
		return authHeader.replace('Bearer ', '');
	}
	const cookies = request.cookies;
	const tokenCookie = cookies.get('auth-token');
	return tokenCookie?.value || null;
}

// PUT: Editar método de pago
export async function PUT(
	request: NextRequest,
	context: { params: { id: string } },
) {
	try {
		const token = getTokenFromRequest(request);
		if (!token)
			return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
		const decoded = verifyToken(token);
		if (!decoded)
			return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
		const userId = decoded.id;
		const { params } = context;
		const { id } = params;
		const body = await request.json();
		// Verificar que el método pertenece al usuario
		const method = await prisma.paymentMethod.findUnique({ where: { id } });
		if (!method || method.userId !== userId) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
		}
		const {
			type,
			brand,
			last4,
			expMonth,
			expYear,
			stripePaymentMethodId,
			isDefault,
		} = body;
		const updated = await prisma.paymentMethod.update({
			where: { id },
			data: {
				type,
				brand,
				last4,
				expMonth,
				expYear,
				stripePaymentMethodId,
				isDefault: !!isDefault,
			},
		});
		// Si se marca como default, quitar default de los demás
		if (updated.isDefault) {
			await prisma.paymentMethod.updateMany({
				where: { userId, id: { not: updated.id } },
				data: { isDefault: false },
			});
		}
		return NextResponse.json(updated);
	} catch (error) {
		console.error('Error PUT payment method:', error);
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		);
	}
}

// DELETE: Eliminar método de pago
export async function DELETE(
	request: NextRequest,
	context: { params: { id: string } },
) {
	try {
		const token = getTokenFromRequest(request);
		if (!token)
			return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
		const decoded = verifyToken(token);
		if (!decoded)
			return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
		const userId = decoded.id;
		const { params } = context;
		const { id } = params;
		// Verificar que el método pertenece al usuario
		const method = await prisma.paymentMethod.findUnique({ where: { id } });
		if (!method || method.userId !== userId) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
		}
		await prisma.paymentMethod.delete({ where: { id } });
		// Si era default y quedan otros, poner el primero como default
		if (method.isDefault) {
			const next = await prisma.paymentMethod.findFirst({
				where: { userId },
				orderBy: { createdAt: 'asc' },
			});
			if (next) {
				await prisma.paymentMethod.update({
					where: { id: next.id },
					data: { isDefault: true },
				});
			}
		}
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error DELETE payment method:', error);
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		);
	}
}
