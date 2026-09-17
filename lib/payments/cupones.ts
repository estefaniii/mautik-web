/**
 * Cupones: una sola validación, del lado del servidor.
 *
 * ⚠️ Antes los cupones eran decorado. El panel dejaba crearlos y existía
 * `POST /api/coupons/validate`, pero:
 *  · el carrito NUNCA llamaba a esa ruta: tocar "Aplicar" siempre respondía
 *    "Cupón inválido", pasara lo que pasara;
 *  · y el checkout no sabía de descuentos, así que aunque el carrito hubiera
 *    mostrado uno, al pagar se cobraba el precio entero.
 *
 * Ahora el descuento se calcula ACÁ y solo acá. El navegador manda el código,
 * nunca el monto: si alguien edita la petición y pone "descuento: 50", el
 * servidor lo ignora y vuelve a calcular. Es la misma regla que ya rige los
 * precios en `calcularTotales`.
 */

import { prisma } from '@/lib/db';

const dos = (n: number) => Math.round(n * 100) / 100;

export interface CuponValido {
	code: string;
	type: string;
	value: number;
	descuento: number;
	descripcion: string | null;
}

export type ResultadoCupon =
	| { ok: true; cupon: CuponValido }
	| { ok: false; error: string };

export interface ItemParaCupon {
	productId: string;
	category?: string;
	subtotal: number;
}

/**
 * Comprueba el código y devuelve cuánto descuenta sobre este carrito.
 *
 * `subtotal` e `items` tienen que venir ya calculados por el servidor, no del
 * navegador.
 */
export async function validarCupon(
	codigo: unknown,
	subtotal: number,
	items: ItemParaCupon[] = [],
): Promise<ResultadoCupon> {
	if (typeof codigo !== 'string' || !codigo.trim()) {
		return { ok: false, error: 'Escribe un código.' };
	}

	const cupon = await prisma.coupon.findUnique({
		where: { code: codigo.trim().toUpperCase() },
	});

	if (!cupon) return { ok: false, error: 'Ese código no existe.' };
	if (!cupon.isActive) return { ok: false, error: 'Ese cupón está desactivado.' };
	if (cupon.usedCount >= cupon.usageLimit) {
		return { ok: false, error: 'Ese cupón ya se usó todas las veces que podía usarse.' };
	}

	const ahora = new Date();
	if (ahora < cupon.validFrom) {
		return { ok: false, error: 'Ese cupón todavía no empieza.' };
	}
	if (cupon.validUntil && ahora > cupon.validUntil) {
		return { ok: false, error: 'Ese cupón ya venció.' };
	}
	if (cupon.minPurchase && subtotal < cupon.minPurchase) {
		return {
			ok: false,
			error: `Este cupón pide una compra mínima de $${cupon.minPurchase.toFixed(2)}.`,
		};
	}

	/*
	  Cupones limitados a ciertas categorías o productos: el descuento se
	  calcula SOLO sobre lo que califica, no sobre el carrito entero. Antes la
	  ruta vieja comprobaba que hubiera al menos un producto aplicable y
	  después descontaba sobre el total: un cupón de "20% en pulseras"
	  rebajaba también los peluches.
	*/
	const limitaCategorias = cupon.applicableCategories.length > 0;
	const limitaProductos = cupon.applicableProducts.length > 0;

	let baseDescuento = subtotal;
	if ((limitaCategorias || limitaProductos) && items.length > 0) {
		const califican = items.filter(
			(i) =>
				(limitaCategorias &&
					i.category &&
					cupon.applicableCategories.includes(i.category)) ||
				(limitaProductos && cupon.applicableProducts.includes(i.productId)),
		);
		if (califican.length === 0) {
			return { ok: false, error: 'Este cupón no aplica a lo que tienes en el carrito.' };
		}
		baseDescuento = dos(califican.reduce((s, i) => s + i.subtotal, 0));
	}

	let descuento: number;
	if (cupon.type === 'percentage') {
		descuento = (baseDescuento * cupon.value) / 100;
		if (cupon.maxDiscount && descuento > cupon.maxDiscount) {
			descuento = cupon.maxDiscount;
		}
	} else {
		descuento = Math.min(cupon.value, baseDescuento);
	}

	descuento = dos(Math.max(0, descuento));
	if (descuento <= 0) {
		return { ok: false, error: 'Ese cupón no descuenta nada en este carrito.' };
	}

	return {
		ok: true,
		cupon: {
			code: cupon.code,
			type: cupon.type,
			value: cupon.value,
			descuento,
			descripcion: cupon.description,
		},
	};
}

/**
 * Suma uno al contador de usos. Se llama SOLO cuando el pago se confirma,
 * nunca al crear el pedido: si no, un carrito abandonado gastaría el cupón.
 */
export function marcarCuponUsado(tx: any, code: string) {
	return tx.coupon.updateMany({
		where: { code },
		data: { usedCount: { increment: 1 } },
	});
}
