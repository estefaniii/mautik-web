"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
exports.GET = GET;
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_1 = require("@/lib/auth");
async function POST(req) {
    const { name, email, password, avatar, address, phone } = await req.json();
    if (!name || !email || !password) {
        return server_1.NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }
    const existing = await db_1.prisma.user.findUnique({ where: { email } });
    if (existing) {
        return server_1.NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 });
    }
    const hashed = await bcryptjs_1.default.hash(password, 10);
    const user = await db_1.prisma.user.create({
        data: {
            name,
            email,
            password: hashed,
            avatar,
            address,
            phone,
        },
    });
    return server_1.NextResponse.json({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
    });
}
async function GET(request) {
    var _a;
    // Only allow admin users to fetch all users
    const token = (_a = request.cookies.get('auth-token')) === null || _a === void 0 ? void 0 : _a.value;
    if (!token) {
        return server_1.NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }
    const userPayload = (0, auth_1.verifyToken)(token);
    if (!userPayload || !userPayload.isAdmin) {
        return server_1.NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    const users = await db_1.prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            isAdmin: true,
            avatar: true,
            address: true,
            phone: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return server_1.NextResponse.json(users);
}
