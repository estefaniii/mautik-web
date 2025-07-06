import mongoose, { type Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
	name: string;
	email: string;
	password: string;
	isAdmin: boolean;
	avatar?: string;
	address?: {
		street: string;
		city: string;
		state: string;
		zipCode: string;
		country: string;
	};
	phone?: string;
	createdAt: Date;
	updatedAt: Date;
	comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
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
			select: false, // No incluir en consultas por defecto
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

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function (
	candidatePassword: string,
): Promise<boolean> {
	return bcrypt.compare(candidatePassword, this.password);
};

// Middleware para hashear contraseña antes de guardar
UserSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();

	try {
		const salt = await bcrypt.genSalt(12);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		next(error as Error);
	}
});

export default mongoose.models.User ||
	mongoose.model<IUser>('User', UserSchema);
