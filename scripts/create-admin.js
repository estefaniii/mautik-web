// Script para crear usuario admin
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI =
	process.env.MONGODB_URI ||
	'mongodb+srv://mautik:uonhhughvghg@cluster0.bqqhjfc.mongodb.net/mautik_ecommerce?retryWrites=true&w=majority&appName=Cluster0';

// Schema de Usuario
const UserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Name is required'],
			trim: true,
			maxlength: [50, 'Name cannot be more than 50 characters'],
		},
		email: {
			type: String,
			required: [true, 'Email is required'],
			unique: true,
			lowercase: true,
			match: [
				/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
				'Please enter a valid email',
			],
		},
		password: {
			type: String,
			required: [true, 'Password is required'],
			minlength: [6, 'Password must be at least 6 characters'],
		},
		isAdmin: {
			type: Boolean,
			default: false,
		},
		avatar: {
			type: String,
			default: '',
		},
		address: {
			street: String,
			city: String,
			state: String,
			zipCode: String,
			country: String,
		},
		phone: {
			type: String,
			trim: true,
		},
	},
	{
		timestamps: true,
	},
);

// Middleware para hashear contraseña
UserSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();

	try {
		const salt = await bcrypt.genSalt(12);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		next(error);
	}
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const createAdmin = async () => {
	try {
		console.log('🔧 Conectando a la base de datos...');
		await mongoose.connect(MONGODB_URI);

		// Verificar si ya existe un admin
		const existingAdmin = await User.findOne({ isAdmin: true });
		if (existingAdmin) {
			console.log('ℹ️  Usuario admin ya existe');
			console.log('📧 Email: admin@mautik.com');
			console.log('🔑 Contraseña: admin123');
			return;
		}

		console.log('👤 Creando usuario admin...');

		// Crear usuario admin
		const adminUser = new User({
			name: 'Admin Mautik',
			email: 'admin@mautik.com',
			password: 'admin123',
			isAdmin: true,
		});

		await adminUser.save();

		console.log('✅ Usuario admin creado exitosamente!');
		console.log('📧 Email: admin@mautik.com');
		console.log('🔑 Contraseña: admin123');
		console.log(
			'⚠️  IMPORTANTE: Cambia la contraseña después del primer login',
		);
	} catch (error) {
		console.error('❌ Error:', error.message);
	} finally {
		await mongoose.disconnect();
		process.exit(0);
	}
};

createAdmin();
