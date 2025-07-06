import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import connectDB from '@/lib/db';
import Order from '@/models/Order';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: '2025-06-30.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
	try {
		const body = await req.text();
		const signature = req.headers.get('stripe-signature')!;

		const event = stripe.webhooks.constructEvent(
			body,
			signature,
			webhookSecret,
		);

		if (event.type === 'payment_intent.succeeded') {
			const paymentIntent = event.data.object as Stripe.PaymentIntent;

			await connectDB();

			// Actualizar el estado del pedido
			if (paymentIntent.metadata.orderId) {
				await Order.findByIdAndUpdate(paymentIntent.metadata.orderId, {
					status: 'pagado',
					paymentIntentId: paymentIntent.id,
				});
			}
		}

		return NextResponse.json({ received: true });
	} catch (error) {
		console.error('Webhook error:', error);
		return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
	}
}
