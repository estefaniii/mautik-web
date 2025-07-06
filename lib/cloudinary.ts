import { v2 as cloudinary } from 'cloudinary';

// Configuración con valores por defecto para evitar errores
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'db6rrzdmy',
	api_key: process.env.CLOUDINARY_API_KEY || '123456789',
	api_secret: process.env.CLOUDINARY_API_SECRET || 'your_secret_here',
});

export default cloudinary;
