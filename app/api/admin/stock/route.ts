import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { exigirAdmin } from '@/lib/solo-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Cambiar el stock de un producto sin abrir el formulario completo.
 *
 * `PUT /api/products/[id]` sirve para editar todo, pero exige nombre,
 * descripción de 10 caracteres, precio... Para corregir "me quedan 2 y no 5"
 * eso es un trámite. Acá solo va el número.
 */
export async function PATCH(request: NextRequest) {
	const noPuede = await exigirAdmin(request);
	if (noPuede) return noPuede;

	try {
		const { id, stock } = await request.json();

		if (!id || typeof id !== 'string') {
			return NextResponse.json({ error: 'Falta el id del producto.' }, { status: 400 });
		}
		const n = Number(stock);
		if (!Number.isInteger(n) || n < 0 || n > 9999) {
			return NextResponse.json(
				{ error: 'El stock tiene que ser un número entero entre 0 y 9999.' },
				{ status: 400 },
			);
		}

		const producto = await prisma.product.update({
			where: { id },
			data: { stock: n },
			select: { id: true, name: true, stock: true },
		});

		return NextResponse.json({ ok: true, producto });
	} catch (error: any) {
		if (error?.code === 'P2025') {
			return NextResponse.json({ error: 'Producto no encontrado.' }, { status: 404 });
		}
		console.error('[admin/stock]', error);
		return NextResponse.json({ error: 'No pude actualizar el stock.' }, { status: 500 });
	}
}
