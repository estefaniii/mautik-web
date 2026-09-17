// En Next.js 16 `params` es una Promise: hay que esperarla antes de leer el id.
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { exigirAdmin } from '@/lib/solo-admin';

/**
 * Mostrar u ocultar un producto.
 *
 * Va aparte del PUT a propósito: el PUT exige el producto completo (nombre,
 * descripción, precio…) porque es el formulario de edición. Para un
 * interruptor de "ocultar" hacer ese viaje entero es pedir problemas — basta
 * con que falte un campo para que el producto quede a medio guardar.
 *
 * Ocultar NO borra: la pieza sigue en la base con su historial de ventas y se
 * puede volver a publicar cuando se rehaga la foto o vuelva la temporada.
 */
export async function PATCH(
	request: NextRequest,
	context: { params: Promise<{ id: string }> },
) {
	const noPuede = await exigirAdmin(request);
	if (noPuede) return noPuede;

	try {
		const { id } = await context.params;
		const { visible } = await request.json();

		if (typeof visible !== 'boolean') {
			return NextResponse.json(
				{ error: 'Envía `visible` como true o false.' },
				{ status: 400 },
			);
		}

		const existe = await prisma.product.findUnique({
			where: { id },
			select: { id: true },
		});
		if (!existe) {
			return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
		}

		const product = await prisma.product.update({
			where: { id },
			data: { visible },
			select: { id: true, name: true, visible: true },
		});

		return NextResponse.json({ ok: true, product });
	} catch (error) {
		console.error('Error cambiando la visibilidad:', error);
		return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
	}
}

export async function GET(
	request: NextRequest,
	context: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await context.params;
		const product = await prisma.product.findUnique({ where: { id } });
		if (!product) {
			return NextResponse.json(
				{ error: 'Producto no encontrado' },
				{ status: 404 },
			);
		}

		/*
		  Un producto oculto no existe para el público: devuelve 404 igual que
		  uno borrado. La administración sí lo puede ver, para poder revisarlo
		  antes de volver a publicarlo.
		*/
		if (!product.visible) {
			const noEsAdmin = await exigirAdmin(request);
			if (noEsAdmin) {
				return NextResponse.json(
					{ error: 'Producto no encontrado' },
					{ status: 404 },
				);
			}
		}

		return NextResponse.json({ product });
	} catch (error: any) {
		console.error('Error obteniendo producto:', error);
		/*
		  Un fallo de la base NO es "producto no encontrado".

		  Cuando la base se cae (por ejemplo al agotarse la cuota de Neon), esto
		  devolvía un error genérico y la ficha mostraba "Producto no
		  encontrado": la clienta entendía que la pieza ya no existe o que se
		  vendió, cuando en realidad la tienda está con un problema temporal.
		  503 dice "vuelve en un rato", que es la verdad.
		*/
		const mensaje = String(error?.message || '');
		const baseCaida =
			mensaje.includes('compute time quota') ||
			mensaje.includes("Can't reach database") ||
			mensaje.includes('Connection') ||
			error?.name === 'PrismaClientInitializationError';

		return NextResponse.json(
			{
				error: baseCaida
					? 'La tienda está con un problema técnico. Vuelve a intentarlo en un momento.'
					: 'Error interno del servidor',
				baseCaida,
			},
			{ status: baseCaida ? 503 : 500 },
		);
	}
}

export async function DELETE(
	request: NextRequest,
	context: { params: Promise<{ id: string }> },
) {
	// Sin esto cualquiera podía cambiar precios o borrar el catálogo.
	const noPuede = await exigirAdmin(request);
	if (noPuede) return noPuede;

	try {
		const { id } = await context.params;
		const deleted = await prisma.product.delete({ where: { id } });
		return NextResponse.json({ success: true, deleted });
	} catch (error) {
		console.error('Error eliminando producto:', error);
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		);
	}
}

export async function PUT(
	request: NextRequest,
	context: { params: Promise<{ id: string }> },
) {
	// Sin esto cualquiera podía cambiar precios o borrar el catálogo.
	const noPuede = await exigirAdmin(request);
	if (noPuede) return noPuede;

	try {
		const { id } = await context.params;
		const data = await request.json();

		// Eliminar cualquier campo id del payload para evitar cambios de ID
		delete data.id;

		// Validaciones básicas
		if (
			!data.name ||
			typeof data.name !== 'string' ||
			data.name.trim().length < 3
		) {
			return NextResponse.json(
				{
					error:
						'El nombre del producto es obligatorio y debe tener al menos 3 caracteres.',
				},
				{ status: 400 },
			);
		}
		if (
			!data.description ||
			typeof data.description !== 'string' ||
			data.description.trim().length < 10
		) {
			return NextResponse.json(
				{
					error:
						'La descripción es obligatoria y debe tener al menos 10 caracteres.',
				},
				{ status: 400 },
			);
		}
		if (typeof data.price !== 'number' || data.price < 0) {
			return NextResponse.json(
				{
					error:
						'El precio es obligatorio y debe ser un número mayor o igual a 0.',
				},
				{ status: 400 },
			);
		}
		if (!data.category || typeof data.category !== 'string') {
			return NextResponse.json(
				{ error: 'La categoría es obligatoria.' },
				{ status: 400 },
			);
		}
		if (!Array.isArray(data.images) || data.images.length === 0) {
			return NextResponse.json(
				{ error: 'Debes subir al menos una imagen.' },
				{ status: 400 },
			);
		}
		if (typeof data.stock !== 'number' || data.stock < 0) {
			return NextResponse.json(
				{
					error:
						'El stock es obligatorio y debe ser un número mayor o igual a 0.',
				},
				{ status: 400 },
			);
		}
		/*
		  El SKU no se edita desde el panel, así que el formulario no lo manda.
		  Esta validación lo exigía igual y hacía que **guardar cualquier
		  producto desde /admin/products/[id]/edit fallara siempre** con "El SKU
		  es obligatorio" — verificado en producción. Si no viene, se conserva el
		  que ya tiene el producto; solo se valida cuando de verdad lo mandan.
		*/
		const actual = await prisma.product.findUnique({
			where: { id },
			select: { sku: true },
		});
		if (!actual) {
			return NextResponse.json({ error: 'Producto no encontrado.' }, { status: 404 });
		}
		if (data.sku === undefined || data.sku === null || data.sku === '') {
			data.sku = actual.sku;
		}
		if (typeof data.sku !== 'string' || data.sku.trim().length < 3) {
			return NextResponse.json(
				{ error: 'El SKU debe tener al menos 3 caracteres.' },
				{ status: 400 },
			);
		}
		// Validar unicidad de SKU (excepto para el mismo producto)
		const existingSku = await prisma.product.findFirst({
			where: { sku: data.sku, NOT: { id } },
		});
		if (existingSku) {
			return NextResponse.json(
				{ error: 'El SKU ya existe. Debe ser único.' },
				{ status: 400 },
			);
		}
		const updated = await prisma.product.update({
			where: { id },
			data: {
				name: data.name,
				description: data.description,
				price: data.price,
				stock: data.stock,
				images: data.images,
				category: data.category,
				sku: data.sku,
				originalPrice: data.originalPrice,
				featured: !!data.featured,
				isNew: !!data.isNew,
				discount: data.discount,
			},
		});
		return NextResponse.json({
			message: 'Producto actualizado exitosamente',
			product: updated,
		});
	} catch (error: any) {
		console.error('Error actualizando producto:', error);
		if (error.code === 'P2002' && error.meta?.target?.includes('sku')) {
			return NextResponse.json(
				{ error: 'El SKU ya existe. Debe ser único.' },
				{ status: 400 },
			);
		}
		return NextResponse.json(
			{ error: error.message || 'Error interno del servidor' },
			{ status: 500 },
		);
	}
}
