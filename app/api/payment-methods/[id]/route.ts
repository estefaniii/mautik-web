import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// PUT: Editar método de pago
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
	try {
		const user = await getAuthUser(request);
		if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

		const { id } = await context.params;
		const method = await prisma.paymentMethod.findUnique({ where: { id } });
		if (!method || method.userId !== user.id) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
		}
		const { type, brand, last4, expMonth, expYear, stripePaymentMethodId, isDefault } = await request.json();
		const updated = await prisma.paymentMethod.update({
			where: { id },
			data: { type, brand, last4, expMonth, expYear, stripePaymentMethodId, isDefault: !!isDefault },
		});
		if (updated.isDefault) {
			await prisma.paymentMethod.updateMany({
				where: { userId: user.id, id: { not: updated.id } },
				data: { isDefault: false },
			});
		}
		return NextResponse.json(updated);
	} catch (error) {
		return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
	}
}

// DELETE: Eliminar método de pago
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
	try {
		const user = await getAuthUser(request);
		if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

		const { id } = await context.params;
		const method = await prisma.paymentMethod.findUnique({ where: { id } });
		if (!method || method.userId !== user.id) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
		}
		await prisma.paymentMethod.delete({ where: { id } });
		if (method.isDefault) {
			const next = await prisma.paymentMethod.findFirst({
				where: { userId: user.id },
				orderBy: { createdAt: 'asc' },
			});
			if (next) {
				await prisma.paymentMethod.update({ where: { id: next.id }, data: { isDefault: true } });
			}
		}
		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
	}
}
