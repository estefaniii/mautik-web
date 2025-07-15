// Script para crear usuario admin
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
	try {
		console.log('🔍 Verificando si ya existe un usuario admin...');

		// Verificar si ya existe un admin
		const existingAdmin = await prisma.user.findFirst({
			where: { isAdmin: true },
		});

		if (existingAdmin) {
			console.log('✅ Usuario admin ya existe:', existingAdmin.email);
			return;
		}

		console.log('🔐 Creando usuario admin...');

		// Hashear la contraseña
		const hashedPassword = await bcrypt.hash('admin123', 12);

		// Crear usuario admin
		const adminUser = await prisma.user.create({
			data: {
				name: 'Admin Mautik',
				email: 'admin@mautik.com',
				password: hashedPassword,
				isAdmin: true,
			},
		});

		console.log('✅ Usuario admin creado exitosamente!');
		console.log('📧 Email:', adminUser.email);
		console.log('🔑 Contraseña: admin123');
		console.log('🆔 ID:', adminUser.id);
	} catch (error) {
		console.error('❌ Error creando usuario admin:', error);
	} finally {
		await prisma.$disconnect();
	}
}

createAdminUser();
