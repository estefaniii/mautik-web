import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
	product: mongoose.Types.ObjectId;
	user: mongoose.Types.ObjectId;
	rating: number;
	title: string;
	comment: string;
	helpful: number;
	verified: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
	{
		product: {
			type: Schema.Types.ObjectId,
			ref: 'Product',
			required: [true, 'Product is required'],
		},
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: [true, 'User is required'],
		},
		rating: {
			type: Number,
			required: [true, 'Rating is required'],
			min: [1, 'Rating must be at least 1'],
			max: [5, 'Rating cannot exceed 5'],
		},
		title: {
			type: String,
			required: [true, 'Review title is required'],
			trim: true,
			maxlength: [100, 'Review title cannot be more than 100 characters'],
		},
		comment: {
			type: String,
			required: [true, 'Review comment is required'],
			trim: true,
			maxlength: [500, 'Review comment cannot be more than 500 characters'],
		},
		helpful: {
			type: Number,
			default: 0,
			min: 0,
		},
		verified: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	},
);

// Índices para mejorar el rendimiento
ReviewSchema.index({ product: 1, createdAt: -1 });
ReviewSchema.index({ user: 1, product: 1 }, { unique: true }); // Un usuario solo puede reseñar un producto una vez

// Middleware para actualizar el rating promedio del producto
ReviewSchema.post('save', async function () {
	const Product = mongoose.model('Product');
	const Review = mongoose.model('Review');

	try {
		const reviews = await Review.find({ product: this.product });
		const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
		const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

		await Product.findByIdAndUpdate(this.product, {
			averageRating,
			totalReviews: reviews.length,
		});
	} catch (error) {
		console.error('Error updating product rating:', error);
	}
});

ReviewSchema.post('findOneAndDelete', async function (doc) {
	if (!doc) return;
	const Product = mongoose.model('Product');
	const Review = mongoose.model('Review');

	try {
		const reviews = await Review.find({ product: doc.product });
		const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
		const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

		await Product.findByIdAndUpdate(doc.product, {
			averageRating,
			totalReviews: reviews.length,
		});
	} catch (error) {
		console.error('Error updating product rating after review removal:', error);
	}
});

export default mongoose.models.Review ||
	mongoose.model<IReview>('Review', ReviewSchema);
