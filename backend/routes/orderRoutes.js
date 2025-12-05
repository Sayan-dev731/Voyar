import express from 'express';
import {
    createOrder,
    getAllOrders,
    getUserOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder,
    getOrderStats
} from '../controllers/orderController.js';
import { authMiddleware, protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/', createOrder);

// User routes - must be before :id route
router.get('/my-orders', protect, getUserOrders);

// Public route to get single order
router.get('/:id', getOrderById);

// Admin routes
router.get('/', authMiddleware, getAllOrders);
router.put('/:id/status', authMiddleware, updateOrderStatus);
router.delete('/:id', authMiddleware, deleteOrder);
router.get('/stats/summary', authMiddleware, getOrderStats);

export default router;
