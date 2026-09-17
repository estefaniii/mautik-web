import { NextRequest, NextResponse } from 'next/server'
import { validarCupon } from '@/lib/payments/cupones'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Comprueba un cupón desde el carrito, ANTES de pagar, para poder decir en el
 * momento si sirve y cuánto descuenta.
 *
 * Toda la lógica vive en `lib/payments/cupones.ts`, la misma que usa el
 * servidor al crear el pedido. Antes estaba escrita dos veces —acá y en
 * ningún otro lado, porque el pedido sencillamente ignoraba los cupones—, y
 * dos copias de una regla de dinero es como se termina cobrando distinto de
 * lo que se prometió.
 *
 * ⚠️ Lo que se devuelve acá es informativo. El monto que se cobra lo vuelve a
 * calcular el servidor al crear el pedido.
 */
export async function POST(req: NextRequest) {
  const { code, subtotal, items } = await req.json()

  if (typeof subtotal !== 'number' || subtotal < 0) {
    return NextResponse.json({ error: 'Falta el subtotal.' }, { status: 400 })
  }

  const r = await validarCupon(code, subtotal, Array.isArray(items) ? items : [])
  if (!r.ok) {
    return NextResponse.json({ error: r.error }, { status: 400 })
  }

  return NextResponse.json({
    coupon: { code: r.cupon.code, type: r.cupon.type, value: r.cupon.value },
    descripcion: r.cupon.descripcion,
    discount: r.cupon.descuento,
  })
}
