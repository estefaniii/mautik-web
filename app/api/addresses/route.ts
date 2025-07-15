import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

// Helper para obtener el token
function getTokenFromRequest(request: NextRequest): string | null {
	const authHeader = request.headers.get('authorization');
	if (authHeader && authHeader.startsWith('Bearer ')) {
		return authHeader.replace('Bearer ', '');
	}
	const cookies = request.cookies;
	const tokenCookie = cookies.get('auth-token');
	return tokenCookie?.value || null;
}

// GET: Listar direcciones del usuario autenticado
export async function GET(request: NextRequest) {
	try {
		const token = getTokenFromRequest(request);
		console.log('[API][GET /api/addresses] token:', token);
		if (!token) {
			console.log('[API][GET /api/addresses] No token');
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
		}
		const user = await verifyToken(token);
		console.log('[API][GET /api/addresses] user:', user);
		if (!user) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
		}
		const addresses = await prisma.address.findMany({
			where: { userId: user.id },
		});
		console.log('[API][GET /api/addresses] addresses:', addresses);
		return NextResponse.json(addresses);
	} catch (error) {
		console.error('Error en GET /api/addresses:', error);
		return NextResponse.json(
			{ error: 'Error interno del servidor', details: error?.toString() },
			{ status: 500 },
		);
	}
}

// POST: Crear nueva dirección
export async function POST(request: NextRequest) {
	try {
		const token = getTokenFromRequest(request);
		console.log('[API][POST /api/addresses] token:', token);
		if (!token) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
		}
		const user = await verifyToken(token);
		console.log('[API][POST /api/addresses] user:', user);
		if (!user) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
		}
		const data = await request.json();
		try {
			const address = await prisma.address.create({
				data: {
					...data,
					userId: user.id,
				},
			});
			console.log('[API][POST /api/addresses] address creada:', address);
			return NextResponse.json(address);
		} catch (error) {
			console.error('[API][POST /api/addresses] error:', error);
			return NextResponse.json(
				{ error: 'Error al crear dirección' },
				{ status: 500 },
			);
		}
	} catch (error) {
		console.error('Error en POST /api/addresses:', error);
		return NextResponse.json(
			{ error: 'Error interno del servidor', details: error?.toString() },
			{ status: 500 },
		);
	}
}
