import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// PUT: Editar dirección
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
	const user = await getAuthUser(request);
	if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

	const { id } = await context.params;
	const body = await request.json();
	const address = await prisma.address.findUnique({ where: { id } });
	if (!address || address.userId !== user.id) {
		return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
	}
	const updated = await prisma.address.update({ where: { id }, data: { ...body } });
	if (updated.isDefault) {
		await prisma.address.updateMany({
			where: { userId: user.id, id: { not: updated.id } },
			data: { isDefault: false },
		});
	}
	return NextResponse.json(updated);
}

// DELETE: Eliminar dirección
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const user = await getAuthUser(request);
	if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

	const address = await prisma.address.findUnique({ where: { id } });
	if (!address || address.userId !== user.id) {
		return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
	}
	await prisma.address.delete({ where: { id } });
	return NextResponse.json({ success: true });
}

// PATCH: Marcar como predeterminada
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const user = await getAuthUser(request);
	if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

	const address = await prisma.address.findUnique({ where: { id } });
	if (!address || address.userId !== user.id) {
		return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
	}
	await prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
	const updated = await prisma.address.update({ where: { id }, data: { isDefault: true } });
	return NextResponse.json(updated);
}
