import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/db';

// Configurar Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const JWT_SECRET = process.env.JWT_SECRET!;

if (cloudName && apiKey && apiSecret) {
	cloudinary.config({
		cloud_name: cloudName,
		api_key: apiKey,
		api_secret: apiSecret,
	});
}

// Función para verificar el token JWT desde las cookies
const verifyTokenFromCookies = (request: NextRequest) => {
	try {
		const authToken = request.cookies.get('auth-token')?.value;

		if (!authToken) {
			return null;
		}

		const decoded = jwt.verify(authToken, JWT_SECRET) as any;
		return decoded;
	} catch (error) {
		console.error('Token verification error:', error);
		return null;
	}
};

export async function POST(request: NextRequest) {
	try {
		// Verificar autenticación usando JWT desde cookies
		const user = verifyTokenFromCookies(request);

		if (!user) {
			return NextResponse.json(
				{ error: 'No autorizado. Debes iniciar sesión para subir archivos.' },
				{ status: 401 },
			);
		}

		const formData = await request.formData();
		const file = formData.get('file') as File;

		if (!file) {
			return NextResponse.json(
				{ error: 'No se proporcionó ningún archivo' },
				{ status: 400 },
			);
		}

		// Verificar si las credenciales de Cloudinary están configuradas
		if (!cloudName || !apiKey || !apiSecret) {
			console.error('Cloudinary credentials missing:', {
				cloudName: !!cloudName,
				apiKey: !!apiKey,
				apiSecret: !!apiSecret,
			});

			return NextResponse.json(
				{
					error: 'Configuración de Cloudinary incompleta',
					message:
						'Por favor, configura las siguientes variables en .env.local:\n- CLOUDINARY_CLOUD_NAME\n- CLOUDINARY_API_KEY\n- CLOUDINARY_API_SECRET',
				},
				{ status: 500 },
			);
		}

		// Validar tipo de archivo
		if (!file.type.startsWith('image/')) {
			return NextResponse.json(
				{ error: 'Solo se permiten archivos de imagen' },
				{ status: 400 },
			);
		}

		// Validar tamaño (máximo 10MB)
		if (file.size > 10 * 1024 * 1024) {
			return NextResponse.json(
				{ error: 'El archivo es demasiado grande. Máximo 10MB' },
				{ status: 400 },
			);
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
			const uploadStream = cloudinary.uploader.upload_stream(
				{
					folder: 'mautik-ecommerce/profiles',
					resource_type: 'auto',
					transformation: [
						{ width: 400, height: 400, crop: 'fill', gravity: 'face' },
						{ quality: 'auto', fetch_format: 'auto' },
					],
				},
				(error, result) => {
					if (error) {
						console.error('Cloudinary upload error:', error);
						reject(error);
					} else {
						resolve(result);
					}
				},
			);

			readableStream.pipe(uploadStream);
		});

		const result = await uploadPromise;
		const imageUrl = (result as any).secure_url;

		// Actualizar el avatar del usuario en la base de datos
		const updatedUser = await prisma.user.update({
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

		return NextResponse.json({
			url: imageUrl,
			public_id: (result as any).public_id,
			width: (result as any).width,
			height: (result as any).height,
			user: updatedUser,
		});
	} catch (error) {
		console.error('Upload error:', error);
		return NextResponse.json(
			{
				error: 'Error al subir la imagen',
				details: error instanceof Error ? error.message : 'Error desconocido',
			},
			{ status: 500 },
		);
	}
}
