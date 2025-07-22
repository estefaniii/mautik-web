import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
	try {
		const { email } = await request.json();

		const { data, error } = await resend.emails.send({
			from: 'no-reply@tudominio.com',
			to: email,
			subject: 'Restablece tu contraseña',
			html: `<p>Haz clic <a href="${process.env.NEXTAUTH_URL}/reset-password?token=TOKEN_AQUI">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
</a> para restablecer tu contraseña</p>`,
		});

		if (error) {
			return NextResponse.json({ error }, { status: 400 });
		}

		return NextResponse.json({ message: 'Email enviado' });
	} catch (error) {
		return NextResponse.json(
			{ error: 'Error al procesar la solicitud' },
			{ status: 500 },
		);
	}
}
