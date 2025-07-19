"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderConfirmationEmail = void 0;
const createOrderConfirmationEmail = (orderData) => {
    const { customerName, customerEmail, orderItems, shippingAddress, paymentMethod, totalAmount, orderId, } = orderData;
    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = 10; // Fixed shipping cost
    return {
        to: customerEmail,
        from: 'noreply@tu-tienda.com', // Cambiar por tu email verificado en SendGrid
        subject: '¡Gracias por tu compra! - Confirmación de pedido',
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmación de pedido</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #fff; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .order-summary { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .total { font-weight: bold; font-size: 18px; margin-top: 15px; padding-top: 15px; border-top: 2px solid #667eea; }
          .address-box { background: #e3f2fd; border-radius: 8px; padding: 15px; margin: 15px 0; }
          .payment-box { background: #f3e5f5; border-radius: 8px; padding: 15px; margin: 15px 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Gracias por tu compra!</h1>
            <p>Tu pedido ha sido confirmado exitosamente</p>
          </div>
          
          <div class="content">
            <h2>Hola ${customerName},</h2>
            <p>Gracias por confiar en nosotros. Tu pedido ha sido procesado y pronto comenzaremos a prepararlo.</p>
            
            <div class="order-summary">
              <h3>Resumen del pedido</h3>
              ${orderItems
            .map((item) => `
                <div class="item">
                  <span>${item.name} x${item.quantity}</span>
                  <span>$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              `)
            .join('')}
              
              <div class="item">
                <span>Subtotal</span>
                <span>$${subtotal.toFixed(2)}</span>
              </div>
              <div class="item">
                <span>Envío</span>
                <span>$${shipping.toFixed(2)}</span>
              </div>
              <div class="total">
                <span>Total</span>
                <span>$${totalAmount.toFixed(2)}</span>
              </div>
            </div>
            
            <div class="address-box">
              <h4>Dirección de envío</h4>
              <p>${shippingAddress.street}<br>
              ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}<br>
              ${shippingAddress.country}<br>
              Tel: ${shippingAddress.phone}</p>
            </div>
            
            <div class="payment-box">
              <h4>Método de pago</h4>
              <p>${paymentMethod.brand} •••• ${paymentMethod.last4}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="/orders" class="button">Ver mis pedidos</a>
              <a href="/shop" class="button" style="background: #28a745;">Seguir comprando</a>
            </div>
            
            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
            <p>¡Gracias por elegirnos!</p>
          </div>
          
          <div class="footer">
            <p>© 2024 Tu Tienda. Todos los derechos reservados.</p>
            <p>Este email fue enviado a ${customerEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    };
};
exports.createOrderConfirmationEmail = createOrderConfirmationEmail;
