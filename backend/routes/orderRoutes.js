import express from 'express';
import {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder,
    getOrderStats
} from '../controllers/orderController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/', createOrder);
router.get('/:id', getOrderById);

// Admin routes
router.get('/', authMiddleware, getAllOrders);
router.put('/:id/status', authMiddleware, updateOrderStatus);
router.delete('/:id', authMiddleware, deleteOrder);
router.get('/stats/summary', authMiddleware, getOrderStats);

export default router;
