import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
	globalForPrisma.prisma ||
	new PrismaClient({
		/*
		  En producción solo se registran los errores.

		  Estaba en `['query', 'info', 'warn', 'error']`, o sea que escribía en
		  el log CADA consulta a la base, con su SQL completo. Eso llena los
		  registros de Vercel de ruido y hace más difícil encontrar un problema
		  real cuando hay que buscarlo.
		*/
		log:
			process.env.NODE_ENV === 'production'
				? ['error']
				: ['query', 'info', 'warn', 'error'],
	});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
