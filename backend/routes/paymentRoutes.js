import express from 'express';
import {
    createRazorpayOrder,
    verifyPayment,
    handlePaymentFailure,
    getOrderByToken,
    razorpayWebhook,
    createCODOrder,
    getRefundStatus
} from '../controllers/paymentController.js';
import { protect, authMiddleware } from '../middleware/auth.js';

// Security imports
import { paymentLimiter } from '../middleware/rateLimiter.js';
import { validateOrder, allowedFields } from '../middleware/validation.js';

const router = express.Router();

// =============================================================================
// PAYMENT ROUTES (All rate limited)
// =============================================================================

/**
 * @route   POST /api/payment/create-order
 * @desc    Create Razorpay order
 * @access  Private
 * @security Rate limited (payment), Input validated
 */
router.post('/create-order',
    protect,
    paymentLimiter,
    allowedFields([
        'items', 'totalAmount', 'customerName', 'customerEmail',
        'customerPhone', 'shippingAddress', 'userId'
    ]),
    createRazorpayOrder
);

/**
 * @route   POST /api/payment/verify
 * @desc    Verify payment after Razorpay checkout
 * @access  Private
 * @security Rate limited (payment)
 */
router.post('/verify',
    protect,
    paymentLimiter,
    allowedFields([
        'razorpay_payment_id', 'razorpay_order_id', 'razorpay_signature',
        'orderId', 'paymentToken'
    ]),
    verifyPayment
);

/**
 * @route   POST /api/payment/failure
 * @desc    Handle payment failure
 * @access  Private
 * @security Rate limited (payment)
 */
router.post('/failure',
    protect,
    paymentLimiter,
    allowedFields(['orderId', 'paymentToken', 'error']),
    handlePaymentFailure
);

/**
 * @route   GET /api/payment/order/:token
 * @desc    Get order by payment token
 * @access  Public
 */
router.get('/order/:token', getOrderByToken);

/**
 * @route   POST /api/payment/webhook
 * @desc    Razorpay webhook endpoint
 * @access  Public (authenticated via Razorpay signature)
 * @note    Raw body parser needed for signature verification
 */
router.post('/webhook', express.raw({ type: 'application/json' }), razorpayWebhook);

/**
 * @route   POST /api/payment/cod
 * @desc    Create Cash on Delivery order
 * @access  Private
 * @security Rate limited (payment)
 */
router.post('/cod',
    protect,
    paymentLimiter,
    createCODOrder
);

/**
 * @route   GET /api/payment/refund-status/:orderId
 * @desc    Get refund status for an order
 * @access  Private (Admin)
 */
router.get('/refund-status/:orderId', authMiddleware, getRefundStatus);

export default router;
