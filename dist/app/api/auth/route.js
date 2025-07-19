"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
async function POST(req) {
    const { email, password } = await req.json();
    if (!email || !password) {
        return server_1.NextResponse.json({ error: 'Faltan campos' }, { status: 400 });
    }
    const user = await db_1.prisma.user.findUnique({ where: { email } });
    if (!user) {
        return server_1.NextResponse.json({ error: 'Usuario no encontrado' }, { status: 400 });
    }
    const valid = await bcryptjs_1.default.compare(password, user.password || '');
    if (!valid) {
        return server_1.NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 400 });
    }
    // Generar JWT
    const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    return server_1.NextResponse.json({
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
        },
    });
}
