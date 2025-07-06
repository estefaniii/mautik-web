import { NextResponse } from 'next/server';

export async function POST() {
	return NextResponse.json(
		{
			error:
				'Stripe no está configurado en este entorno. El endpoint está deshabilitado temporalmente para despliegue.',
		},
		{ status: 503 },
	);
}
