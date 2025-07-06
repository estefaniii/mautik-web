import mongoose, { type Document, Schema } from 'mongoose';

export interface IProduct extends Document {
	name: string;
	description: string;
	price: number;
	originalPrice?: number;
	category: string;
	subcategory?: string;
	images: string[];
	stock: number;
	sku: string;
	brand?: string;
	tags: string[];
	specifications?: Record<string, any>;
	reviews: {
		user: mongoose.Types.ObjectId;
		rating: number;
		comment: string;
		createdAt: Date;
	}[];
	averageRating: number;
	totalReviews: number;
	isActive: boolean;
	isFeatured: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
	{
		name: {
			type: String,
			required: [true, 'Product name is required'],
			trim: true,
			maxlength: [100, 'Product name cannot be more than 100 characters'],
		},
		description: {
			type: String,
			required: [true, 'Product description is required'],
			maxlength: [2000, 'Description cannot be more than 2000 characters'],
		},
		price: {
			type: Number,
			required: [true, 'Price is required'],
			min: [0, 'Price cannot be negative'],
		},
		originalPrice: {
			type: Number,
			min: [0, 'Original price cannot be negative'],
		},
		category: {
			type: String,
			required: [true, 'Category is required'],
			enum: [
				'Anillos',
				'Collares',
				'Aretes',
				'Pulseras',
				'Crochet',
				'Llaveros',
				'Peluches',
			],
		},
		subcategory: {
			type: String,
			trim: true,
		},
		images: [
			{
				type: String,
				required: true,
			},
		],
		stock: {
			type: Number,
			required: [true, 'Stock is required'],
			min: [0, 'Stock cannot be negative'],
			default: 0,
		},
		sku: {
			type: String,
			required: [true, 'SKU is required'],
			unique: true,
			trim: true,
		},
		brand: {
			type: String,
			trim: true,
		},
		tags: [
			{
				type: String,
				trim: true,
			},
		],
		specifications: {
			type: Schema.Types.Mixed,
			default: {},
		},
		reviews: [
			{
				user: {
					type: Schema.Types.ObjectId,
					ref: 'User',
					required: true,
				},
				rating: {
					type: Number,
					required: true,
					min: 1,
					max: 5,
				},
				comment: {
					type: String,
					maxlength: [500, 'Review comment cannot be more than 500 characters'],
				},
				createdAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
		averageRating: {
			type: Number,
			default: 0,
			min: 0,
			max: 5,
		},
		totalReviews: {
			type: Number,
			default: 0,
			min: 0,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		isFeatured: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	},
);

// Middleware para calcular rating promedio
ProductSchema.pre('save', function (next) {
	if (this.reviews && this.reviews.length > 0) {
		const totalRating = this.reviews.reduce(
			(sum, review) => sum + review.rating,
			0,
		);
		this.averageRating = totalRating / this.reviews.length;
		this.totalReviews = this.reviews.length;
	} else {
		this.averageRating = 0;
		this.totalReviews = 0;
	}
	next();
});

export default mongoose.models.Product ||
	mongoose.model<IProduct>('Product', ProductSchema);
