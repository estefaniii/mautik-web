import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { exigirAdmin } from '@/lib/solo-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Gestión de una clienta desde el panel.
 *
 * ⚠️ Estas rutas NO EXISTÍAN. El panel llamaba a
 * `PUT /api/admin/users/[id]/role` y `DELETE /api/admin/users/[id]`, y las dos
 * devolvían 404: se tocaba "Hacer Admin" o "Eliminar" y no pasaba nada, con un
 * mensaje de error genérico.
 *
 * PATCH cambia el rol y/o la contraseña. DELETE borra la cuenta.
 */

export async function PATCH(
	request: NextRequest,
	context: { params: Promise<{ id: string }> },
) {
	const noPuede = await exigirAdmin(request);
	if (noPuede) return noPuede;

	const { id } = await context.params;
	const yo = await getAuthUser(request);
	const { isAdmin, password } = await request.json();

	const persona = await prisma.user.findUnique({
		where: { id },
		select: { id: true, name: true, email: true, isAdmin: true },
	});
	if (!persona) {
		return NextResponse.json({ error: 'No encontré esa cuenta.' }, { status: 404 });
	}

	const datos: Record<string, unknown> = {};

	if (typeof isAdmin === 'boolean') {
		/*
		  Quitarse los permisos a una misma deja la tienda sin nadie que pueda
		  entrar al panel, y no hay forma de recuperarlos desde la web.
		*/
		if (yo?.id === id && isAdmin === false) {
			return NextResponse.json(
				{ error: 'No puedes quitarte a ti misma los permisos de administradora.' },
				{ status: 400 },
			);
		}
		/*
		  Y tampoco se puede dejar la tienda sin NINGUNA administradora.
		  Sin esto, quitarle el permiso a la última cuenta con acceso deja el
		  panel cerrado para siempre: no hay forma de recuperarlo desde la web,
		  habría que tocar la base a mano. (Me pasó al probar esta ruta: quité
		  un admin creyendo que era otra cuenta.)
		*/
		if (isAdmin === false && persona.isAdmin) {
			const cuantas = await prisma.user.count({ where: { isAdmin: true } });
			if (cuantas <= 1) {
				return NextResponse.json(
					{ error: 'Es la única administradora que queda. Nombra a otra antes de quitarle el permiso.' },
					{ status: 400 },
				);
			}
		}
		datos.isAdmin = isAdmin;
	}

	if (password !== undefined) {
		if (typeof password !== 'string' || password.trim().length < 6) {
			return NextResponse.json(
				{ error: 'La contraseña tiene que tener al menos 6 caracteres.' },
				{ status: 400 },
			);
		}
		// Se guarda cifrada, igual que en el registro. Ni acá ni en la base
		// queda nunca la contraseña en claro.
		datos.password = await bcrypt.hash(password.trim(), 10);
	}

	if (Object.keys(datos).length === 0) {
		return NextResponse.json({ error: 'No enviaste nada que cambiar.' }, { status: 400 });
	}

	const actualizada = await prisma.user.update({
		where: { id },
		data: datos,
		select: { id: true, name: true, email: true, isAdmin: true },
	});

	return NextResponse.json({
		ok: true,
		user: actualizada,
		cambios: {
			rol: 'isAdmin' in datos,
			contrasena: 'password' in datos,
		},
	});
}

export async function DELETE(
	request: NextRequest,
	context: { params: Promise<{ id: string }> },
) {
	const noPuede = await exigirAdmin(request);
	if (noPuede) return noPuede;

	const { id } = await context.params;
	const yo = await getAuthUser(request);

	if (yo?.id === id) {
		return NextResponse.json(
			{ error: 'No puedes borrar tu propia cuenta desde acá.' },
			{ status: 400 },
		);
	}

	const persona = await prisma.user.findUnique({
		where: { id },
		select: { id: true, name: true, _count: { select: { orders: true } } },
	});
	if (!persona) {
		return NextResponse.json({ error: 'No encontré esa cuenta.' }, { status: 404 });
	}

	/*
	  Una clienta con pedidos no se puede borrar sin llevarse por delante el
	  historial de ventas: los pedidos apuntan a su id. Mejor decirlo que
	  romper la contabilidad.
	*/
	if (persona._count.orders > 0) {
		return NextResponse.json(
			{
				error: `${persona.name} tiene ${persona._count.orders} pedido(s). Si borro la cuenta se pierde el historial de esas ventas.`,
			},
			{ status: 409 },
		);
	}

	// Lo que cuelga de la cuenta y no es historial de ventas sí se limpia.
	await prisma.$transaction([
		prisma.cartItem.deleteMany({ where: { userId: id } }),
		prisma.wishlistItem.deleteMany({ where: { userId: id } }),
		prisma.address.deleteMany({ where: { userId: id } }),
		prisma.notification.deleteMany({ where: { userId: id } }),
		prisma.paymentMethod.deleteMany({ where: { userId: id } }),
		prisma.user.delete({ where: { id } }),
	]);

	return NextResponse.json({ ok: true });
}
