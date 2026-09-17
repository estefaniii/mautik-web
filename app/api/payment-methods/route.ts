import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// GET: Listar métodos de pago
export async function GET(request: NextRequest) {
	try {
		const user = await getAuthUser(request);
		if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

		const methods = await prisma.paymentMethod.findMany({
			where: { userId: user.id },
			orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
		});
		return NextResponse.json(methods);
	} catch (error) {
		return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
	}
}

// POST: Agregar un método de pago
export async function POST(request: NextRequest) {
	try {
		const user = await getAuthUser(request);
		if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

		const { type, brand, last4, expMonth, expYear, stripePaymentMethodId, isDefault } = await request.json();
		const count = await prisma.paymentMethod.count({ where: { userId: user.id } });
		const paymentMethod = await prisma.paymentMethod.create({
			data: {
				userId: user.id,
				type,
				brand,
				last4,
				expMonth,
				expYear,
				stripePaymentMethodId,
				isDefault: count === 0 ? true : !!isDefault,
			},
		});
		if (paymentMethod.isDefault) {
			await prisma.paymentMethod.updateMany({
				where: { userId: user.id, id: { not: paymentMethod.id } },
				data: { isDefault: false },
			});
		}
		return NextResponse.json(paymentMethod, { status: 201 });
	} catch (error) {
		return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
	}
}
