import express from 'express';
import {
    createShipment,
    getAvailableCouriers,
    assignCourierToOrder,
    scheduleOrderPickup,
    getTrackingDetails,
    generateShippingLabel,
    generateOrderInvoice,
    cancelOrderShipment,
    getPickupAddresses,
    handleWebhook,
    quickShip,
    bulkTrackingUpdate
} from '../controllers/shiprocketController.js';
import { authMiddleware, protect } from '../middleware/auth.js';

const router = express.Router();

// Public webhook endpoint (secured by token in handler)
router.post('/webhook', handleWebhook);

// User routes - tracking (requires user authentication)
router.get('/track/:orderId', protect, getTrackingDetails);

// Admin routes - shipment management
router.post('/orders/:orderId/create-shipment', authMiddleware, createShipment);
router.get('/orders/:orderId/couriers', authMiddleware, getAvailableCouriers);
router.post('/orders/:orderId/assign-courier', authMiddleware, assignCourierToOrder);
router.post('/orders/:orderId/schedule-pickup', authMiddleware, scheduleOrderPickup);
router.post('/orders/:orderId/generate-label', authMiddleware, generateShippingLabel);
router.post('/orders/:orderId/generate-invoice', authMiddleware, generateOrderInvoice);
router.post('/orders/:orderId/cancel-shipment', authMiddleware, cancelOrderShipment);
router.post('/orders/:orderId/quick-ship', authMiddleware, quickShip);

// Admin routes - tracking (for admin view)
router.get('/admin/track/:orderId', authMiddleware, getTrackingDetails);

// Admin utility routes
router.get('/pickup-locations', authMiddleware, getPickupAddresses);
router.post('/bulk-update-tracking', authMiddleware, bulkTrackingUpdate);

export default router;
