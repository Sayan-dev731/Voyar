import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

// Get all reviews for a product
export const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const { page = 1, limit = 10, sort = 'recent' } = req.query;

        // Build sort options
        let sortOption = {};
        switch (sort) {
            case 'recent':
                sortOption = { createdAt: -1 };
                break;
            case 'oldest':
                sortOption = { createdAt: 1 };
                break;
            case 'highest':
                sortOption = { rating: -1, createdAt: -1 };
                break;
            case 'lowest':
                sortOption = { rating: 1, createdAt: -1 };
                break;
            case 'helpful':
                sortOption = { helpfulVotes: -1, createdAt: -1 };
                break;
            default:
                sortOption = { createdAt: -1 };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const reviews = await Review.find({
            product: productId,
            isApproved: true
        })
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit))
            .select('-helpfulVoters');

        const totalReviews = await Review.countDocuments({
            product: productId,
            isApproved: true
        });

        // Calculate rating distribution
        const ratingDistribution = await Review.aggregate([
            { $match: { product: new mongoose.Types.ObjectId(productId), isApproved: true } },
            {
                $group: {
                    _id: '$rating',
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: -1 } }
        ]);

        // Calculate average rating
        const avgRatingResult = await Review.aggregate([
            { $match: { product: new mongoose.Types.ObjectId(productId), isApproved: true } },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        const avgRating = avgRatingResult[0]?.avgRating || 0;

        res.json({
            success: true,
            reviews,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalReviews / parseInt(limit)),
                totalReviews,
                hasMore: skip + reviews.length < totalReviews
            },
            stats: {
                averageRating: Math.round(avgRating * 10) / 10,
                totalReviews,
                ratingDistribution: ratingDistribution.reduce((acc, curr) => {
                    acc[curr._id] = curr.count;
                    return acc;
                }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
            }
        });

    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: error.message || 'Failed to fetch reviews' });
    }
};

// Create a new review
export const createReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const { rating, title, comment } = req.body;
        const userId = req.user.id;

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if user already reviewed this product
        const existingReview = await Review.findOne({
            product: productId,
            user: userId
        });

        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this product' });
        }

        // Check if user purchased this product (for verified purchase badge)
        const purchasedOrder = await Order.findOne({
            userId,
            'items.product': productId,
            status: { $in: ['delivered', 'shipped', 'confirmed', 'processing'] },
            paymentStatus: 'paid'
        });

        const review = new Review({
            product: productId,
            user: userId,
            userName: req.user.name,
            userEmail: req.user.email,
            rating,
            title,
            comment,
            verifiedPurchase: !!purchasedOrder,
            orderId: purchasedOrder?._id
        });

        await review.save();

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            review
        });

    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ message: error.message || 'Failed to submit review' });
    }
};

// Update a review
export const updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, title, comment } = req.body;
        const userId = req.user.id;

        const review = await Review.findOne({
            _id: reviewId,
            user: userId
        });

        if (!review) {
            return res.status(404).json({ message: 'Review not found or not authorized' });
        }

        review.rating = rating || review.rating;
        review.title = title || review.title;
        review.comment = comment || review.comment;

        await review.save();

        res.json({
            success: true,
            message: 'Review updated successfully',
            review
        });

    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ message: error.message || 'Failed to update review' });
    }
};

// Delete a review
export const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user.id;

        const review = await Review.findOne({
            _id: reviewId,
            user: userId
        });

        if (!review) {
            return res.status(404).json({ message: 'Review not found or not authorized' });
        }

        const productId = review.product;
        await Review.deleteOne({ _id: reviewId });

        // Recalculate product rating
        await Review.calculateAverageRating(productId);

        res.json({
            success: true,
            message: 'Review deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ message: error.message || 'Failed to delete review' });
    }
};

// Mark review as helpful
export const markHelpful = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user.id;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if user already voted
        const alreadyVoted = review.helpfulVoters.includes(userId);

        if (alreadyVoted) {
            // Remove vote
            review.helpfulVoters = review.helpfulVoters.filter(
                id => id.toString() !== userId.toString()
            );
            review.helpfulVotes = Math.max(0, review.helpfulVotes - 1);
        } else {
            // Add vote
            review.helpfulVoters.push(userId);
            review.helpfulVotes += 1;
        }

        await review.save();

        res.json({
            success: true,
            message: alreadyVoted ? 'Vote removed' : 'Marked as helpful',
            helpfulVotes: review.helpfulVotes,
            isHelpful: !alreadyVoted
        });

    } catch (error) {
        console.error('Error marking review helpful:', error);
        res.status(500).json({ message: error.message || 'Failed to update vote' });
    }
};

// Check if user can review a product
export const canReviewProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;

        // Check existing review
        const existingReview = await Review.findOne({
            product: productId,
            user: userId
        });

        if (existingReview) {
            return res.json({
                canReview: false,
                reason: 'already_reviewed',
                existingReview
            });
        }

        // Check if user purchased the product
        const purchasedOrder = await Order.findOne({
            userId,
            'items.product': productId,
            status: { $in: ['delivered', 'shipped', 'confirmed', 'processing'] },
            paymentStatus: 'paid'
        });

        res.json({
            canReview: true,
            verifiedPurchase: !!purchasedOrder
        });

    } catch (error) {
        console.error('Error checking review eligibility:', error);
        res.status(500).json({ message: error.message || 'Failed to check eligibility' });
    }
};

// Admin: Get all reviews
export const getAllReviews = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = {};
        if (status === 'pending') {
            filter.isApproved = false;
        } else if (status === 'approved') {
            filter.isApproved = true;
        }

        const reviews = await Review.find(filter)
            .populate('product', 'name image')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Review.countDocuments(filter);

        res.json({
            success: true,
            reviews,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                total
            }
        });

    } catch (error) {
        console.error('Error fetching all reviews:', error);
        res.status(500).json({ message: error.message || 'Failed to fetch reviews' });
    }
};

// Admin: Approve/reject review
export const moderateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { isApproved, adminResponse } = req.body;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        review.isApproved = isApproved;
        if (adminResponse) {
            review.adminResponse = {
                text: adminResponse,
                respondedAt: new Date()
            };
        }

        await review.save();

        res.json({
            success: true,
            message: `Review ${isApproved ? 'approved' : 'rejected'} successfully`,
            review
        });

    } catch (error) {
        console.error('Error moderating review:', error);
        res.status(500).json({ message: error.message || 'Failed to moderate review' });
    }
};

// Admin: Delete review
export const adminDeleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        const productId = review.product;
        await Review.deleteOne({ _id: reviewId });

        // Recalculate product rating
        await Review.calculateAverageRating(productId);

        res.json({
            success: true,
            message: 'Review deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ message: error.message || 'Failed to delete review' });
    }
};
