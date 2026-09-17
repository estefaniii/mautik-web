import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { calcularTotales } from '@/lib/payments/totales';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
	// Antes esto devolvía TODOS los pedidos de TODAS las clientas, con el objeto
	// `user` completo adentro, a cualquiera que pidiera /api/orders sin sesión.
	const usuario = await getAuthUser(request);
	if (!usuario) {
		return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
	}

	try {
		const esAdmin = (usuario as any).isAdmin === true || (usuario as any).role === 'admin';
		/*
		  `items` son filas de OrderItem: productId, cantidad y precio. Sin el
		  producto adentro, la clienta veía su pedido como una lista de filas
		  sin nombre y con la imagen de relleno, porque la página buscaba
		  `item.name` y `item.image` y ninguno de los dos existe acá.
		*/
		const orders = await prisma.order.findMany({
			where: esAdmin ? {} : { userId: usuario.id },
			include: {
				items: {
					include: {
						product: {
							select: { id: true, name: true, images: true, category: true },
						},
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		});
		return NextResponse.json(orders);
	} catch (error) {
		console.error('Error fetching orders:', error);
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		);
	}
}

/**
 * Crea un pedido PENDIENTE.
 *
 * Dos cosas cambiaron acá y las dos importan:
 *
 * 1. El precio y el total salen de la base, no del navegador. Antes se
 *    guardaba `data.totalAmount` y `item.price` tal cual venían en el JSON:
 *    editando la petición se podía registrar un pedido de $30 por $0.01.
 *
 * 2. El pedido nace SIN pagar y sin descontar stock. Quien marca pagado y
 *    descuenta es la ruta de captura de PayPal, después de confirmar contra
 *    PayPal cuánto se cobró de verdad. Antes bastaba con mandar un
 *    `paymentId` cualquiera para que el pedido quedara "pagado".
 */
export async function POST(request: NextRequest) {
	const usuario = await getAuthUser(request);
	if (!usuario) {
		return NextResponse.json(
			{ error: 'Tienes que iniciar sesión para hacer un pedido.' },
			{ status: 401 },
		);
	}

	try {
		const data = await request.json();

		if (!Array.isArray(data.items) || data.items.length === 0) {
			return NextResponse.json(
				{ error: 'No hay productos en el pedido.' },
				{ status: 400 },
			);
		}
		// el flujo viejo de tarjeta guardada manda la dirección como `address`
		const shippingAddress = data.shippingAddress ?? data.address;
		if (!shippingAddress) {
			return NextResponse.json(
				{ error: 'Falta la dirección de envío.' },
				{ status: 400 },
			);
		}

		// Relee precios, descuentos y stock desde la base y calcula el envío.
		// Si un producto no alcanza, tira error con el nombre del producto.
		const totales = await calcularTotales(
			data.items.map((i: any) => ({
				productId: i.productId,
				quantity: i.quantity,
			})),
			{
				direccion: shippingAddress,
				metodoEnvio: data.metodoEnvio,
				// El código, no el monto: el descuento lo calcula el servidor.
				codigoCupon: typeof data.couponCode === 'string' ? data.couponCode : null,
			},
		);

		const order = await prisma.order.create({
			data: {
				userId: usuario.id,
				items: {
					create: totales.items.map((i) => ({
						productId: i.productId,
						quantity: i.quantity,
						price: i.price,
					})),
				},
				status: 'pending',
				isPaid: false,
				isDelivered: false,
				totalAmount: totales.total,
				shippingAddress,
				paymentMethod: data.paymentMethod || null,
				// El cupón queda registrado en el pedido. El contador de usos NO
				// se toca todavía: se suma cuando el pago se confirma, en la
				// captura de PayPal. Un carrito abandonado no gasta el cupón.
				couponCode: totales.cupon?.code ?? null,
				discount: totales.descuento,
			},
			include: { items: true },
		});

		return NextResponse.json({
			message: 'Pedido creado',
			order,
			totales: {
				subtotal: totales.subtotal,
				descuento: totales.descuento,
				cupon: totales.cupon,
				envio: totales.envio,
				total: totales.total,
			},
		});
	} catch (error: any) {
		// calcularTotales tira errores pensados para mostrarle a la clienta
		// ("Solo quedan 2 unidades de ..."), así que se pasan tal cual.
		const mensaje = error?.message || 'Error interno del servidor';
		const esDeNegocio =
			/carrito|stock|unidades|cantidad|producto/i.test(mensaje);
		console.error('Error creando pedido:', error);
		return NextResponse.json(
			{ error: mensaje },
			{ status: esDeNegocio ? 400 : 500 },
		);
	}
}
