"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const auth_1 = require("@/lib/auth");
// Helper para obtener el token
function getTokenFromRequest(request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.replace('Bearer ', '');
    }
    const cookies = request.cookies;
    const tokenCookie = cookies.get('auth-token');
    return (tokenCookie === null || tokenCookie === void 0 ? void 0 : tokenCookie.value) || null;
}
// GET: Listar direcciones del usuario autenticado
async function GET(request) {
    try {
        const token = getTokenFromRequest(request);
        console.log('[API][GET /api/addresses] token:', token);
        if (!token) {
            console.log('[API][GET /api/addresses] No token');
            return server_1.NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        const user = await (0, auth_1.verifyToken)(token);
        console.log('[API][GET /api/addresses] user:', user);
        if (!user) {
            return server_1.NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        const addresses = await db_1.prisma.address.findMany({
            where: { userId: user.id },
        });
        console.log('[API][GET /api/addresses] addresses:', addresses);
        return server_1.NextResponse.json(addresses);
    }
    catch (error) {
        console.error('Error en GET /api/addresses:', error);
        return server_1.NextResponse.json({ error: 'Error interno del servidor', details: error === null || error === void 0 ? void 0 : error.toString() }, { status: 500 });
    }
}
// POST: Crear nueva dirección
async function POST(request) {
    try {
        const token = getTokenFromRequest(request);
        console.log('[API][POST /api/addresses] token:', token);
        if (!token) {
            return server_1.NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        const user = await (0, auth_1.verifyToken)(token);
        console.log('[API][POST /api/addresses] user:', user);
        if (!user) {
            return server_1.NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        const data = await request.json();
        try {
            const address = await db_1.prisma.address.create({
                data: Object.assign(Object.assign({}, data), { userId: user.id }),
            });
            console.log('[API][POST /api/addresses] address creada:', address);
            return server_1.NextResponse.json(address);
        }
        catch (error) {
            console.error('[API][POST /api/addresses] error:', error);
            return server_1.NextResponse.json({ error: 'Error al crear dirección' }, { status: 500 });
        }
    }
    catch (error) {
        console.error('Error en POST /api/addresses:', error);
        return server_1.NextResponse.json({ error: 'Error interno del servidor', details: error === null || error === void 0 ? void 0 : error.toString() }, { status: 500 });
    }
}
