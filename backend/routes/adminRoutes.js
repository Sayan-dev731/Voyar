import express from 'express';
import {
    adminLogin,
    verifyToken,
    changePassword,
    updateProfile,
    getDashboardAnalytics,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getAllAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    getLoginHistory,
    exportData,
    adminForgotPassword,
    adminResetPassword,
    getSiteSettings,
    updateSiteSettings
} from '../controllers/adminController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', adminLogin);
router.post('/forgot-password', adminForgotPassword);
router.post('/reset-password/:token', adminResetPassword);

// Protected routes - All admins
router.get('/verify', authMiddleware, verifyToken);
router.post('/change-password', authMiddleware, changePassword);
router.put('/profile', authMiddleware, updateProfile);
router.get('/analytics', authMiddleware, getDashboardAnalytics);
router.get('/login-history', authMiddleware, getLoginHistory);

// Protected routes - Settings (super admin only)
router.get('/settings', authMiddleware, getSiteSettings);
router.put('/settings', authMiddleware, updateSiteSettings);

// Protected routes - User management
router.get('/users', authMiddleware, getAllUsers);
router.get('/users/:id', authMiddleware, getUserById);
router.put('/users/:id', authMiddleware, updateUser);
router.delete('/users/:id', authMiddleware, deleteUser);

// Protected routes - Admin management (super admin only)
router.get('/admins', authMiddleware, getAllAdmins);
router.post('/admins', authMiddleware, createAdmin);
router.put('/admins/:id', authMiddleware, updateAdmin);
router.delete('/admins/:id', authMiddleware, deleteAdmin);

// Export data
router.get('/export/:type', authMiddleware, exportData);

export default router;
