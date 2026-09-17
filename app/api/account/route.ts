import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Baja de la propia cuenta desde el perfil.
 *
 * ⚠️ Esta ruta NO EXISTÍA y el botón "Eliminar cuenta" MENTÍA: el perfil
 * esperaba dos segundos con un `setTimeout`, decía "Tu cuenta ha sido
 * eliminada permanentemente" y cerraba la sesión. La cuenta seguía intacta en
 * la base, con su correo, su dirección y su teléfono. Quien pedía que borraran
 * sus datos se iba creyendo que se habían borrado.
 *
 * Ahora se borra de verdad, con los mismos cuidados que tiene el panel:
 *  · Una cuenta con pedidos no se borra: los pedidos apuntan a ella y se
 *    llevaría por delante el historial de ventas de Mautik.
 *  · La última administradora no se puede borrar a sí misma: dejaría la
 *    tienda sin nadie que pueda entrar al panel, y eso no se arregla desde
 *    la web.
 */
export async function DELETE(request: NextRequest) {
	const usuario = await getAuthUser(request);
	if (!usuario) {
		return NextResponse.json({ error: 'Tienes que iniciar sesión.' }, { status: 401 });
	}

	const cuenta = await prisma.user.findUnique({
		where: { id: usuario.id },
		select: { id: true, isAdmin: true, _count: { select: { orders: true } } },
	});
	if (!cuenta) {
		return NextResponse.json({ error: 'No encontré tu cuenta.' }, { status: 404 });
	}

	if (cuenta._count.orders > 0) {
		return NextResponse.json(
			{
				error: `Tu cuenta tiene ${cuenta._count.orders} pedido(s) y el historial de esas compras no se puede borrar. Escríbenos y lo vemos contigo.`,
			},
			{ status: 409 },
		);
	}

	if (cuenta.isAdmin) {
		const cuantas = await prisma.user.count({ where: { isAdmin: true } });
		if (cuantas <= 1) {
			return NextResponse.json(
				{ error: 'Eres la única administradora: si borras tu cuenta nadie puede entrar al panel.' },
				{ status: 400 },
			);
		}
	}

	await prisma.$transaction([
		prisma.cartItem.deleteMany({ where: { userId: cuenta.id } }),
		prisma.wishlistItem.deleteMany({ where: { userId: cuenta.id } }),
		prisma.address.deleteMany({ where: { userId: cuenta.id } }),
		prisma.notification.deleteMany({ where: { userId: cuenta.id } }),
		prisma.paymentMethod.deleteMany({ where: { userId: cuenta.id } }),
		prisma.user.delete({ where: { id: cuenta.id } }),
	]);

	return NextResponse.json({ ok: true });
}
