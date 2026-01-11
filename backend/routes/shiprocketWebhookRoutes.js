import express from 'express';
import { handleShipmentWebhook, getWebhookConfig } from '../controllers/shiprocketWebhookController.js';

const router = express.Router();

// Webhook endpoint - receives POST requests from Shiprocket
// No auth middleware needed as this is called by Shiprocket
// Security is handled via x-api-key header verification in controller
router.post('/webhook', handleShipmentWebhook);

// Get webhook configuration details (for admin setup)
router.get('/webhook-config', getWebhookConfig);

export default router;
