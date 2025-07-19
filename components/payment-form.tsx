"use client"

import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from './ui/button';
import { FaCcVisa, FaCcMastercard, FaLock } from 'react-icons/fa';

interface PaymentFormProps {
  amount: number;
  onSuccess: (paymentIntentId: string, cardEmail?: string) => void;
  onError?: (error: any) => void;
  noFormWrapper?: boolean;
}

export default function PaymentForm({ amount, onSuccess, onError, noFormWrapper = false }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error creando PaymentIntent');
      const clientSecret = data.clientSecret;
      const result = await stripe?.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements?.getElement(CardElement)!,
        },
      });
      if (result?.error) {
        setError(result.error.message || 'Error al procesar el pago');
        onError?.(result.error);
        setLoading(false);
        return;
      }
      if (result?.paymentIntent?.status === 'succeeded') {
        onSuccess(result.paymentIntent.id, (result.paymentIntent as any)?.charges?.data?.[0]?.billing_details?.email);
      } else {
        setError('El pago no fue exitoso.');
        onError?.('El pago no fue exitoso.');
      }
    } catch (err: any) {
      let errorToUse = err instanceof Error ? err : new Error(typeof err === 'string' ? err : JSON.stringify(err));
      setError(errorToUse.message || 'Error inesperado');
      onError?.(errorToUse);
    } finally {
      setLoading(false);
    }
  };

  const formFields = (
    <>
      <div className="flex items-center gap-2 mb-2">
        <FaCcVisa className="text-blue-600 h-7 w-7" />
        <FaCcMastercard className="text-red-600 h-7 w-7" />
        <span className="ml-2 text-gray-700 text-sm">Aceptamos Visa y Mastercard</span>
      </div>
      <div className="mb-2 text-gray-800 font-semibold text-lg flex items-center gap-2">
        <FaLock className="text-green-600 h-4 w-4" /> Pago seguro con Stripe
      </div>
      <div className="mb-2 text-indigo-700 font-bold text-xl">Total: ${amount.toFixed(2)}</div>
      <div className="rounded border border-gray-300 p-3 bg-white">
        <CardElement options={{ hidePostalCode: true, style: { base: { fontSize: '16px', color: '#1a202c', '::placeholder': { color: '#a0aec0' } }, invalid: { color: '#e53e3e' } } }} />
      </div>
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 mt-2" disabled={loading || !stripe || !elements}>
        {loading ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></span> : null}
        {loading ? 'Procesando...' : `Pagar $${amount.toFixed(2)}`}
      </Button>
    </>
  );

  if (noFormWrapper) {
    return <div className="space-y-4">{formFields}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formFields}
    </form>
  );
}
