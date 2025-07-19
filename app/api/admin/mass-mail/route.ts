import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Resend } from 'resend';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
	try {
		console.log('--- Mass mail endpoint called ---');
		// Verificar sesión y admin
		const session = await getServerSession(authOptions);
		if (!session?.user || !(session.user as any).isAdmin) {
			console.log('No autorizado');
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
		}

		// Parse and type the request body
		const body = (await req.json()) as { subject: string; message: string };
		const { subject, message } = body;
		if (!subject || !message) {
			console.log('Faltan asunto o mensaje');
			return NextResponse.json(
				{ error: 'Asunto y mensaje requeridos' },
				{ status: 400 },
			);
		}

		// Obtener todos los usuarios con email no vacío
		const usersRaw = await prisma.user.findMany({
			where: {
				email: { not: '' },
			},
			select: { email: true, name: true },
		});
		// Filtrar los que tengan email null (por si acaso)
		const users = usersRaw.filter((u) => u.email !== null);
		console.log(
			'Usuarios a los que se intentará enviar:',
			users.map((u) => u.email),
		);
		if (users.length === 0) {
			console.log('No hay usuarios con email');
			return NextResponse.json(
				{ error: 'No hay usuarios con email.' },
				{ status: 400 },
			);
		}

		// Enviar el correo a cada usuario
		let successCount = 0;
		let errorCount = 0;
		for (const user of users) {
			try {
				console.log('Enviando a:', user.email);
				const result = await resend.emails.send({
					from: 'Mautik <mautik.official@gmail.com>',
					to: user.email,
					subject,
					html: message,
				});
				console.log('Resultado Resend:', result);
				successCount++;
			} catch (err) {
				errorCount++;
				console.error('Error enviando a', user.email, err);
			}
		}

		console.log(`Correos enviados: ${successCount}, errores: ${errorCount}`);
		return NextResponse.json({
			message: `Correos enviados: ${successCount}, errores: ${errorCount}`,
		});
	} catch (error) {
		console.error('Error general en mass-mail:', error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : String(error) },
			{ status: 500 },
		);
	}
}
