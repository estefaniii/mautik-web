"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const resend_1 = require("@/lib/resend");
async function GET(request) {
    try {
        const orders = await db_1.prisma.order.findMany({
            include: { user: true, items: true },
        });
        return server_1.NextResponse.json(orders);
    }
    catch (error) {
        console.error('Error fetching orders:', error);
        return server_1.NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
async function POST(request) {
    try {
        const data = await request.json();
        if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
            return server_1.NextResponse.json({ error: 'No hay productos en el pedido.' }, { status: 400 });
        }
        // Validar stock de cada producto
        const productUpdates = [];
        const orderItems = [];
        for (const item of data.items) {
            const product = await db_1.prisma.product.findUnique({
                where: { id: item.productId },
            });
            if (!product || product.stock < item.quantity) {
                return server_1.NextResponse.json({ error: `Stock insuficiente para ${(product === null || product === void 0 ? void 0 : product.name) || 'producto'}` }, { status: 400 });
            }
            productUpdates.push({
                id: item.productId,
                newStock: product.stock - item.quantity,
            });
            orderItems.push({
                name: product.name,
                quantity: item.quantity,
                price: item.price,
            });
        }
        // Usar transacción para actualizar stock y crear pedido
        const result = await db_1.prisma.$transaction(async (tx) => {
            for (const update of productUpdates) {
                await tx.product.update({
                    where: { id: update.id },
                    data: { stock: update.newStock },
                });
            }
            const order = await tx.order.create({
                data: {
                    userId: data.userId,
                    items: {
                        create: data.items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                        })),
                    },
                    status: data.paymentId && data.paymentMethod ? 'paid' : 'pending',
                    isPaid: !!(data.paymentId && data.paymentMethod),
                    isDelivered: false,
                    totalAmount: data.totalAmount,
                    shippingAddress: data.shippingAddress,
                    paymentMethod: data.paymentMethod || null,
                    paymentId: data.paymentId || null,
                    paidAt: data.paidAt
                        ? new Date(data.paidAt)
                        : data.paymentId && data.paymentMethod
                            ? new Date()
                            : null,
                },
                include: { items: true, user: true },
            });
            return order;
        });
        // Enviar email de confirmación
        if (result.user && data.shippingAddress) {
            try {
                await (0, resend_1.sendOrderConfirmationEmail)({
                    customerName: result.user.name || 'Cliente',
                    customerEmail: result.user.email,
                    orderItems,
                    shippingAddress: data.shippingAddress,
                    paymentMethod: data.paymentMethod
                        ? { brand: data.paymentMethod, last4: '****' }
                        : { brand: 'N/A', last4: 'N/A' },
                    totalAmount: data.totalAmount,
                    orderId: result.id,
                });
            }
            catch (emailError) {
                console.error('Error enviando email de confirmación:', emailError);
                // No fallar el pedido si falla el email
            }
        }
        return server_1.NextResponse.json({
            message: 'Pedido creado exitosamente',
            order: result,
        });
    }
    catch (error) {
        console.error('Error creando pedido:', error);
        return server_1.NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
