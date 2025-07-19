"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-06-30.basil',
});
async function POST(request) {
    try {
        const { amount, currency = 'usd' } = await request.json();
        if (!amount || typeof amount !== 'number') {
            return server_1.NextResponse.json({ error: 'Monto inválido' }, { status: 400 });
        }
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe usa centavos
            currency,
            payment_method_types: ['card'],
        });
        return server_1.NextResponse.json({ clientSecret: paymentIntent.client_secret });
    }
    catch (error) {
        console.error('Error creando PaymentIntent:', error);
        return server_1.NextResponse.json({ error: 'Error interno de Stripe', details: error === null || error === void 0 ? void 0 : error.toString() }, { status: 500 });
    }
}
