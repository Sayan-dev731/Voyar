import express from 'express';
import {
    createOrder,
    getAllOrders,
    getUserOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder,
    getOrderStats,
    generateBill,
    cancelOrder,
    userDeleteOrder
} from '../controllers/orderController.js';
import { authMiddleware, protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/', createOrder);

// User routes - must be before :id route
router.get('/my-orders', protect, getUserOrders);
router.put('/:id/cancel', protect, cancelOrder);  // User cancel order (before shipped)
router.delete('/:id/user-delete', protect, userDeleteOrder);  // User soft-delete order (after delivered)

// Public route to get single order
router.get('/:id', getOrderById);

// Admin routes
router.get('/', authMiddleware, getAllOrders);
router.put('/:id/status', authMiddleware, updateOrderStatus);
router.delete('/:id', authMiddleware, deleteOrder);
router.get('/stats/summary', authMiddleware, getOrderStats);
router.post('/:id/generate-bill', authMiddleware, generateBill);

export default router;
