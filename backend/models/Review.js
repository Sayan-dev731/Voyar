import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    title: {
        type: String,
        required: true,
        maxlength: 100
    },
    comment: {
        type: String,
        required: true,
        maxlength: 1000
    },
    // Whether the user purchased this product
    verifiedPurchase: {
        type: Boolean,
        default: false
    },
    // Order ID if verified purchase
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    // Helpful votes
    helpfulVotes: {
        type: Number,
        default: 0
    },
    // Users who voted helpful
    helpfulVoters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // Review approval status
    isApproved: {
        type: Boolean,
        default: true // Auto-approve, can be changed if moderation needed
    },
    // Admin response
    adminResponse: {
        text: String,
        respondedAt: Date
    }
}, {
    timestamps: true
});

// Ensure one review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Index for product lookups
reviewSchema.index({ product: 1, isApproved: 1, createdAt: -1 });

// Static method to calculate product rating
reviewSchema.statics.calculateAverageRating = async function (productId) {
    const stats = await this.aggregate([
        { $match: { product: productId, isApproved: true } },
        {
            $group: {
                _id: '$product',
                avgRating: { $avg: '$rating' },
                numReviews: { $sum: 1 }
            }
        }
    ]);

    if (stats.length > 0) {
        const Product = mongoose.model('Product');
        await Product.findByIdAndUpdate(productId, {
            rating: Math.round(stats[0].avgRating * 10) / 10,
            reviews: stats[0].numReviews
        });
    } else {
        const Product = mongoose.model('Product');
        await Product.findByIdAndUpdate(productId, {
            rating: 0,
            reviews: 0
        });
    }
};

// Update product rating after save
reviewSchema.post('save', async function () {
    await this.constructor.calculateAverageRating(this.product);
});

// Update product rating after remove
reviewSchema.post('remove', async function () {
    await this.constructor.calculateAverageRating(this.product);
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
