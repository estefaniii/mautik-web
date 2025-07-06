import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
	cloudinary.config({
		cloud_name: cloudName,
		api_key: apiKey,
		api_secret: apiSecret,
	});
}

export async function POST(request: NextRequest) {
	try {
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

		return NextResponse.json({
			url: (result as any).secure_url,
			public_id: (result as any).public_id,
			width: (result as any).width,
			height: (result as any).height,
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
