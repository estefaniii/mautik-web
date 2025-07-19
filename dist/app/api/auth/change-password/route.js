"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_1 = require("@/lib/auth");
async function POST(request) {
    var _a;
    try {
        const token = (_a = request.headers.get('authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token) {
            return server_1.NextResponse.json({ error: 'Token de autenticación requerido' }, { status: 401 });
        }
        const decoded = (0, auth_1.verifyToken)(token);
        if (!decoded) {
            return server_1.NextResponse.json({ error: 'Token inválido' }, { status: 401 });
        }
        const { currentPassword, newPassword } = await request.json();
        if (!currentPassword || !newPassword) {
            return server_1.NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
        }
        if (newPassword.length < 6) {
            return server_1.NextResponse.json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' }, { status: 400 });
        }
        const user = await db_1.prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) {
            return server_1.NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }
        const isValid = await bcryptjs_1.default.compare(currentPassword, user.password || '');
        if (!isValid) {
            return server_1.NextResponse.json({ error: 'Contraseña actual incorrecta' }, { status: 400 });
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 12);
        await db_1.prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });
        return server_1.NextResponse.json({
            message: 'Contraseña actualizada exitosamente',
        });
    }
    catch (error) {
        console.error('Error cambiando contraseña:', error);
        return server_1.NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
