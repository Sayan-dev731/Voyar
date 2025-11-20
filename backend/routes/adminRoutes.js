import express from 'express';
import {
    adminLogin,
    verifyToken,
    changePassword
} from '../controllers/adminController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', adminLogin);

// Protected routes
router.get('/verify', authMiddleware, verifyToken);
router.post('/change-password', authMiddleware, changePassword);

export default router;
