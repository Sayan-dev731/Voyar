import express from 'express';
import {
    signup,
    login,
    verifyEmail,
    resendVerification,
    getProfile,
    updateProfile,
    forgotPassword,
    resetPassword,
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

export default router;
