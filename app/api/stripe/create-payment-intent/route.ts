import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: '2025-06-30.basil',
});

export async function POST(request: NextRequest) {
	try {
		const { amount, currency = 'usd' } = await request.json();
		if (!amount || typeof amount !== 'number') {
			return NextResponse.json({ error: 'Monto inválido' }, { status: 400 });
		}
		const paymentIntent = await stripe.paymentIntents.create({
			amount: Math.round(amount * 100), // Stripe usa centavos
			currency,
			payment_method_types: ['card'],
		});
		return NextResponse.json({ clientSecret: paymentIntent.client_secret });
	} catch (error) {
		console.error('Error creando PaymentIntent:', error);
		return NextResponse.json(
			{ error: 'Error interno de Stripe', details: error?.toString() },
			{ status: 500 },
		);
	}
}
