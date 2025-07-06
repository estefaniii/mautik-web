import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: '2025-06-30.basil',
});

export async function POST() {
	return NextResponse.json(
		{
			error:
				'Stripe no está configurado en este entorno. El endpoint está deshabilitado temporalmente para despliegue.',
		},
		{ status: 503 },
	);
}
