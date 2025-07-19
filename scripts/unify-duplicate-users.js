// Script para unificar usuarios duplicados por email en la base de datos
// Conserva el usuario con más datos (campos no nulos) y actualiza referencias
// Ejecuta: node scripts/unify-duplicate-users.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
	// 1. Buscar emails duplicados
	const duplicates = await prisma.user.groupBy({
		by: ['email'],
		_count: { email: true },
		having: { email: { _count: { gt: 1 } } },
	});

	if (duplicates.length === 0) {
		console.log('No hay usuarios duplicados por email.');
		return;
	}

	for (const dup of duplicates) {
		const email = dup.email;
		const users = await prisma.user.findMany({ where: { email } });
		// Elegir el usuario con más datos (campos no nulos)
		let mainUser = users[0];
		let maxFilled = Object.values(mainUser).filter(
			(v) => v !== null && v !== '',
		).length;
		for (const u of users) {
			const filled = Object.values(u).filter(
				(v) => v !== null && v !== '',
			).length;
			if (filled > maxFilled) {
				mainUser = u;
				maxFilled = filled;
			}
		}
		const mainId = mainUser.id;
		const toDelete = users.filter((u) => u.id !== mainId);
		if (toDelete.length === 0) continue;
		console.log(
			`Unificando ${users.length} usuarios con email ${email}. Conservando: ${mainId}`,
		);
		// Actualizar referencias en tablas relacionadas
		const tables = [
			{ name: 'CartItem', field: 'userId' },
			{ name: 'Order', field: 'userId' },
			{ name: 'Review', field: 'userId' },
			{ name: 'Notification', field: 'userId' },
			{ name: 'PaymentMethod', field: 'userId' },
			{ name: 'Session', field: 'userId' },
			{ name: 'UserAnalytics', field: 'userId' },
			{ name: 'WishlistItem', field: 'userId' },
			{ name: 'Address', field: 'userId' },
			{ name: 'Account', field: 'userId' },
		];
		for (const { name, field } of tables) {
			for (const u of toDelete) {
				await prisma[name].updateMany({
					where: { [field]: u.id },
					data: { [field]: mainId },
				});
			}
		}
		// Eliminar usuarios duplicados
		for (const u of toDelete) {
			await prisma.user.delete({ where: { id: u.id } });
			console.log(`Eliminado usuario duplicado: ${u.id}`);
		}
	}
	console.log('Unificación de usuarios duplicados completada.');
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
