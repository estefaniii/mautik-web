import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOrderConfirmationEmail = async (orderData: {
	customerName: string;
	customerEmail: string;
	orderItems: Array<{ name: string; quantity: number; price: number }>;
	shippingAddress: any;
	paymentMethod: any;
	totalAmount: number;
	orderId?: string;
}) => {
	try {
		const {
			customerName,
			customerEmail,
			orderItems,
			shippingAddress,
			paymentMethod,
			totalAmount,
		} = orderData;

		const subtotal = orderItems.reduce(
			(sum, item) => sum + item.price * item.quantity,
			0,
		);
		const shipping = 10;
		const result = await resend.emails.send({
			from: 'Tu Tienda <noreply@tu-dominio.com>', // Cambiar por tu dominio verificado
			to: [customerEmail],
			subject: '¡Gracias por tu compra! - Confirmación de pedido',
			html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset=utf-8>        <meta name=viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmación de pedido</title>
          <style>
            body { font-family: Arial, sans-serif; line-height:1.6olor: #333; margin:0: 0        .container [object Object] max-width: 600px; margin: 0 auto; background: #fff; }
            .header { background: linear-gradient(135deg, #667ea 06400or: white; padding:30text-align: center; }
            .content { padding: 30x; }
            .order-summary [object Object] background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0
            .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1eee; }
            .total { font-weight: bold; font-size: 18px; margin-top: 15x; padding-top: 15x; border-top: 2 solid #667eea; }
            .address-box [object Object] background: #e3f2fd; border-radius: 8px; padding: 15px; margin: 15px 0          .payment-box [object Object] background: #f3e5f5; border-radius: 8px; padding: 15px; margin: 15px 0           .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5x; }
            .footer [object Object] background: #f89fa; padding:20text-align: center; color: #666; font-size:14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header>
              <h1>¡Gracias por tu compra!</h1>
              <p>Tu pedido ha sido confirmado exitosamente</p>
            </div>
            
            <div class="content>
              <h2>Hola $[object Object]customerName},</h2>
              <p>Gracias por confiar en nosotros. Tu pedido ha sido procesado y pronto comenzaremos a prepararlo.</p>
              
              <div class="order-summary>
                <h3>Resumen del pedido</h3                ${orderItems
									.map(
										(item) => `
                  <div class="item">
                    <span>${item.name} x${item.quantity}</span>
                    <span>$${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                `,
									)
									.join('')}
                
                <div class="item">
                  <span>Subtotal</span>
                  <span>$$[object Object]subtotal.toFixed(2)}</span>
                </div>
                <div class="item">
                  <span>Envío</span>
                  <span>$$[object Object]shipping.toFixed(2)}</span>
                </div>
                <div class="total">
                  <span>Total</span>
                  <span>$${totalAmount.toFixed(2)}</span>
                </div>
              </div>
              
              <div class="address-box>
                <h4>Dirección de envío</h4
                <p>${shippingAddress.street}<br>
                ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}<br>
                ${shippingAddress.country}<br>
                Tel: ${shippingAddress.phone}</p>
              </div>
              
              <div class="payment-box>
                <h4>Método de pago</h4
                <p>${paymentMethod.brand} •••• ${paymentMethod.last4}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;>
                <a href="/orders" class="button">Ver mis pedidos</a>
                <a href="/shop" class="button" style="background: #28a745;>Seguir comprando</a>
              </div>
              
              <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
              <p>¡Gracias por elegirnos!</p>
            </div>
            
            <div class="footer>
              <p>© 2024 Tienda. Todos los derechos reservados.</p>
              <p>Este email fue enviado a ${customerEmail}</p>
            </div>
          </div>
        </body>
        </html>
      `,
		});

		console.log('Email de confirmación enviado exitosamente:', result);
		return true;
	} catch (error) {
		console.error('Error enviando email de confirmación:', error);
		return false;
	}
};
