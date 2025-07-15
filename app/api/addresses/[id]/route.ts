import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// Uso de 'params' actualizado para Next.js 13+ API routes

function getTokenFromRequest(request: NextRequest): string | null {
	const authHeader = request.headers.get('authorization');
	if (authHeader && authHeader.startsWith('Bearer ')) {
		return authHeader.replace('Bearer ', '');
	}
	const cookies = request.cookies;
	const tokenCookie = cookies.get('auth-token');
	return tokenCookie?.value || null;
}

// PUT: Editar dirección
export async function PUT(
	request: NextRequest,
	context: { params: { id: string } },
) {
	const { params } = context;
	const { id } = params;
	const token = getTokenFromRequest(request);
	if (!token)
		return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
	const decoded = verifyToken(token);
	if (!decoded)
		return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
	const userId = decoded.id;
	const body = await request.json();
	const address = await prisma.address.findUnique({ where: { id } });
	if (!address || address.userId !== userId) {
		return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
	}
	const updated = await prisma.address.update({
		where: { id },
		data: { ...body },
	});
	// Si se marca como default, quitar default de las demás
	if (updated.isDefault) {
		await prisma.address.updateMany({
			where: { userId, id: { not: updated.id } },
			data: { isDefault: false },
		});
	}
	return NextResponse.json(updated);
}

// DELETE: Eliminar dirección
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	const token = getTokenFromRequest(request);
	if (!token)
		return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
	const decoded = verifyToken(token);
	if (!decoded)
		return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
	const userId = decoded.id;
	const { id } = params;
	const address = await prisma.address.findUnique({ where: { id } });
	if (!address || address.userId !== userId) {
		return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
	}
	await prisma.address.delete({ where: { id } });
	return NextResponse.json({ success: true });
}

// PATCH: Marcar como predeterminada
export async function PATCH(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	const token = getTokenFromRequest(request);
	if (!token)
		return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
	const decoded = verifyToken(token);
	if (!decoded)
		return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
	const userId = decoded.id;
	const { id } = params;
	const address = await prisma.address.findUnique({ where: { id } });
	if (!address || address.userId !== userId) {
		return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
	}
	// Marcar esta como default y las demás como no default
	await prisma.address.updateMany({
		where: { userId },
		data: { isDefault: false },
	});
	const updated = await prisma.address.update({
		where: { id },
		data: { isDefault: true },
	});
	return NextResponse.json(updated);
}
