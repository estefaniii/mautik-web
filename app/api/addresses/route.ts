import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// GET: Listar direcciones del usuario autenticado
export async function GET(request: NextRequest) {
	try {
		const user = await getAuthUser(request);
		if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

		const addresses = await prisma.address.findMany({ where: { userId: user.id } });
		return NextResponse.json(addresses);
	} catch (error) {
		return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
	}
}

// POST: Crear nueva dirección
export async function POST(request: NextRequest) {
	try {
		const user = await getAuthUser(request);
		if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

		const data = await request.json();
		const address = await prisma.address.create({ data: { ...data, userId: user.id } });
		return NextResponse.json(address);
	} catch (error) {
		return NextResponse.json({ error: 'Error al crear dirección' }, { status: 500 });
	}
}
