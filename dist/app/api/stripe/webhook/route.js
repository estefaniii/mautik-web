"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
async function POST() {
    return server_1.NextResponse.json({
        error: 'Stripe webhook no está configurado en este entorno. El endpoint está deshabilitado temporalmente para despliegue.',
    }, { status: 503 });
}
