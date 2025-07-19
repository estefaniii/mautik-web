"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.getUserFromRequest = getUserFromRequest;
exports.verifyAuth = verifyAuth;
exports.authenticateUser = authenticateUser;
exports.createAdminUser = createAdminUser;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
function generateToken(user) {
    return jsonwebtoken_1.default.sign(user, JWT_SECRET, { expiresIn: '7d' });
}
function verifyToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        return null;
    }
}
function getUserFromRequest(request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.substring(7);
    return verifyToken(token);
}
async function verifyAuth(request) {
    return getUserFromRequest(request);
}
async function authenticateUser(email, password) {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                name: true,
                isAdmin: true,
                password: true,
            },
        });
        if (!user) {
            return { success: false, error: 'Usuario no encontrado' };
        }
        // Usar bcrypt.compare en lugar de user.comparePassword
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password || '');
        if (!isPasswordValid) {
            return { success: false, error: 'Contraseña incorrecta' };
        }
        const userPayload = {
            id: user.id,
            email: user.email,
            name: user.name,
            isAdmin: user.isAdmin,
        };
        const token = generateToken(userPayload);
        return { success: true, user: userPayload, token };
    }
    catch (error) {
        const errorToUse = error instanceof Error
            ? error
            : new Error(typeof error === 'string' ? error : JSON.stringify(error));
        console.error('Authentication error:', errorToUse);
        return { success: false, error: 'Error de autenticación' };
    }
}
async function createAdminUser() {
    try {
        // Verificar si ya existe un admin
        const existingAdmin = await prisma.user.findFirst({
            where: { isAdmin: true },
        });
        if (existingAdmin) {
            console.log('Admin user already exists');
            return { success: false, error: 'Admin user already exists' };
        }
        // Hashear la contraseña antes de crear el usuario
        const hashedPassword = await bcryptjs_1.default.hash('admin123', 12);
        // Crear usuario admin
        const adminUser = await prisma.user.create({
            data: {
                name: 'Admin Mautik',
                email: 'admin@mautik.com',
                password: hashedPassword,
                isAdmin: true,
            },
        });
        console.log('Admin user created successfully');
        return { success: true, user: adminUser };
    }
    catch (error) {
        const errorToUse = error instanceof Error
            ? error
            : new Error(typeof error === 'string' ? error : JSON.stringify(error));
        console.error('Error creating admin user:', errorToUse);
        return { success: false, error: 'Error creating admin user' };
    }
}
