"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const cloudinary_1 = require("cloudinary");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("@/lib/db");
// Configurar Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;
if (cloudName && apiKey && apiSecret) {
    cloudinary_1.v2.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
    });
}
// Función para verificar el token JWT desde las cookies
const verifyTokenFromCookies = (request) => {
    var _a;
    try {
        const authToken = (_a = request.cookies.get('auth-token')) === null || _a === void 0 ? void 0 : _a.value;
        if (!authToken) {
            return null;
        }
        const decoded = jsonwebtoken_1.default.verify(authToken, JWT_SECRET);
        return decoded;
    }
    catch (error) {
        console.error('Token verification error:', error);
        return null;
    }
};
async function POST(request) {
    try {
        // Verificar autenticación usando JWT desde cookies
        const user = verifyTokenFromCookies(request);
        if (!user) {
            return server_1.NextResponse.json({ error: 'No autorizado. Debes iniciar sesión para subir archivos.' }, { status: 401 });
        }
        const formData = await request.formData();
        const file = formData.get('file');
        if (!file) {
            return server_1.NextResponse.json({ error: 'No se proporcionó ningún archivo' }, { status: 400 });
        }
        // Verificar si las credenciales de Cloudinary están configuradas
        if (!cloudName || !apiKey || !apiSecret) {
            console.error('Cloudinary credentials missing:', {
                cloudName: !!cloudName,
                apiKey: !!apiKey,
                apiSecret: !!apiSecret,
            });
            return server_1.NextResponse.json({
                error: 'Configuración de Cloudinary incompleta',
                message: 'Por favor, configura las siguientes variables en .env.local:\n- CLOUDINARY_CLOUD_NAME\n- CLOUDINARY_API_KEY\n- CLOUDINARY_API_SECRET',
            }, { status: 500 });
        }
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            return server_1.NextResponse.json({ error: 'Solo se permiten archivos de imagen' }, { status: 400 });
        }
        // Validar tamaño (máximo 10MB)
        if (file.size > 10 * 1024 * 1024) {
            return server_1.NextResponse.json({ error: 'El archivo es demasiado grande. Máximo 10MB' }, { status: 400 });
        }
        // Convertir el archivo a buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        // Crear un stream de lectura
        const stream = require('stream');
        const readableStream = new stream.Readable();
        readableStream.push(buffer);
        readableStream.push(null);
        // Subir a Cloudinary
        const uploadPromise = new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                folder: 'mautik-ecommerce/profiles',
                resource_type: 'auto',
                transformation: [
                    { width: 400, height: 400, crop: 'fill', gravity: 'face' },
                    { quality: 'auto', fetch_format: 'auto' },
                ],
            }, (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    reject(error);
                }
                else {
                    resolve(result);
                }
            });
            readableStream.pipe(uploadStream);
        });
        const result = await uploadPromise;
        const imageUrl = result.secure_url;
        // Actualizar el avatar del usuario en la base de datos
        const updatedUser = await db_1.prisma.user.update({
            where: { id: user.id },
            data: { avatar: imageUrl },
            select: {
                id: true,
                name: true,
                email: true,
                isAdmin: true,
                avatar: true,
                address: true,
                phone: true,
            },
        });
        return server_1.NextResponse.json({
            url: imageUrl,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            user: updatedUser,
        });
    }
    catch (error) {
        console.error('Upload error:', error);
        return server_1.NextResponse.json({
            error: 'Error al subir la imagen',
            details: error instanceof Error ? error.message : 'Error desconocido',
        }, { status: 500 });
    }
}
