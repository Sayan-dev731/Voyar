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
    addAddress,
    updateAddress,
    deleteAddress,
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    syncCart,
    changePassword,
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

// Protected routes - Profile
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// Protected routes - Addresses
router.post('/addresses', protect, addAddress);
router.put('/addresses/:addressId', protect, updateAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);

// Protected routes - Cart
router.get('/cart', protect, getCart);
router.post('/cart', protect, addToCart);
router.post('/cart/sync', protect, syncCart);
router.put('/cart/:productId', protect, updateCartItem);
router.delete('/cart/:productId', protect, removeFromCart);
router.delete('/cart', protect, clearCart);

export default router;
