import express from 'express';
import {
    getProductReviews,
    createReview,
    updateReview,
    deleteReview,
    markHelpful,
    canReviewProduct,
    getAllReviews,
    moderateReview,
    adminDeleteReview
} from '../controllers/reviewController.js';
import { protect, authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/product/:productId', getProductReviews);

// Protected user routes
router.post('/product/:productId', protect, createReview);
router.put('/:reviewId', protect, updateReview);
router.delete('/:reviewId', protect, deleteReview);
router.post('/:reviewId/helpful', protect, markHelpful);
router.get('/can-review/:productId', protect, canReviewProduct);

// Admin routes
router.get('/admin/all', authMiddleware, getAllReviews);
router.put('/admin/:reviewId/moderate', authMiddleware, moderateReview);
router.delete('/admin/:reviewId', authMiddleware, adminDeleteReview);

export default router;
