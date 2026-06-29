import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
	const { email, name } = await request.json();
	if (!email)
		return NextResponse.json({ error: 'Email requerido' }, { status: 400 });

	// Verificar si ya se envió el correo de bienvenida
	const user = await prisma.user.findUnique({ where: { email } });
	if (!user)
		return NextResponse.json(
			{ error: 'Usuario no encontrado' },
			{ status: 404 },
		);
	if ((user as any).welcomeSent) {
		return NextResponse.json({
			success: true,
			message: 'Ya se envió el correo de bienvenida.',
		});
	}

	// Mensaje de bienvenida personalizado
	const html = `
    <div style="font-family:sans-serif;max-width:500px;margin:auto;background:#f8f5ff;padding:32px 24px;border-radius:16px;box-shadow:0 4px 24px 0 rgba(124,58,237,0.08);">
      <h1 style="color:#7c3aed;font-size:2.2rem;margin-bottom:12px;">¡Bienvenido${name ? `, ${name}` : ''} a Mautik!</h1>
      <p style="font-size:1.1rem;color:#444;">Nos alegra tenerte en nuestra comunidad de amantes de la artesanía panameña. Aquí encontrarás productos únicos, hechos con pasión y dedicación.</p>
      <div style="margin:32px 0;text-align:center;">
        <img src="https://mautik-web.vercel.app/maar.png" alt="Bienvenida" style="width:80%;max-width:320px;border-radius:12px;box-shadow:0 2px 8px 0 rgba(124,58,237,0.10);" />
      </div>
      <a href="https://mautik-web.vercel.app/" style="display:inline-block;margin-top:24px;padding:14px 36px;background:linear-gradient(90deg,#7c3aed,#a78bfa);color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;font-size:1.1rem;box-shadow:0 2px 8px 0 rgba(124,58,237,0.10);">Explora la tienda</a>
      <p style="margin-top:32px;font-size:13px;color:#888;">¿Tienes dudas o sugerencias? Responde a este correo, ¡estamos para ayudarte!<br/>Gracias por confiar en Mautik.</p>
    </div>
  `;

	const resend = new Resend(process.env.RESEND_API_KEY);
	await resend.emails.send({
		from: 'Mautik <notificaciones@tudominio.com>', // Cambia por tu dominio verificado
		to: email,
		subject: '¡Bienvenido a Mautik! 🎉',
		html,
	});

	// Marcar que ya se envió el correo de bienvenida
	await prisma.user.update({ where: { email }, data: { welcomeSent: true } });

	return NextResponse.json({ success: true });
}
