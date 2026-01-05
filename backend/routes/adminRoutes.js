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
    updateSiteSettings,
    getPublicSiteSettings
} from '../controllers/adminController.js';
import { authMiddleware } from '../middleware/auth.js';

// Security imports
import {
    authLimiter,
    passwordResetLimiter,
    sensitiveLimiter
} from '../middleware/rateLimiter.js';
import {
    validateAdminLogin,
    validatePasswordChange,
    validatePasswordReset,
    validateAdminForgotPassword,
    validateSiteSettings,
    allowedFields
} from '../middleware/validation.js';

const router = express.Router();

// =============================================================================
// PUBLIC ROUTES
// =============================================================================

/**
 * @route   POST /api/admin/login
 * @desc    Admin login
 * @access  Public
 * @security Rate limited (auth), Input validated
 */
router.post('/login',
    authLimiter,
    allowedFields(['username', 'password']),
    validateAdminLogin,
    adminLogin
);

/**
 * @route   POST /api/admin/forgot-password
 * @desc    Admin forgot password
 * @access  Public
 * @security Rate limited (password reset), Input validated
 */
router.post('/forgot-password',
    passwordResetLimiter,
    allowedFields(['username']),
    validateAdminForgotPassword,
    adminForgotPassword
);

/**
 * @route   POST /api/admin/reset-password/:token
 * @desc    Admin reset password
 * @access  Public
 * @security Rate limited (password reset), Input validated
 */
router.post('/reset-password/:token',
    passwordResetLimiter,
    allowedFields(['password']),
    validatePasswordReset,
    adminResetPassword
);

/**
 * @route   GET /api/admin/settings/public
 * @desc    Get public site settings (charges)
 * @access  Public
 */
router.get('/settings/public', getPublicSiteSettings);

// =============================================================================
// PROTECTED ROUTES - ALL ADMINS
// =============================================================================

/**
 * @route   GET /api/admin/verify
 * @desc    Verify admin token
 * @access  Private
 */
router.get('/verify', authMiddleware, verifyToken);

/**
 * @route   POST /api/admin/change-password
 * @desc    Change admin password
 * @access  Private
 * @security Rate limited (sensitive), Input validated
 */
router.post('/change-password',
    authMiddleware,
    sensitiveLimiter,
    allowedFields(['currentPassword', 'newPassword']),
    validatePasswordChange,
    changePassword
);

/**
 * @route   PUT /api/admin/profile
 * @desc    Update admin profile
 * @access  Private
 */
router.put('/profile',
    authMiddleware,
    allowedFields(['email', 'profileImage']),
    updateProfile
);

/**
 * @route   GET /api/admin/analytics
 * @desc    Get dashboard analytics
 * @access  Private
 */
router.get('/analytics', authMiddleware, getDashboardAnalytics);

/**
 * @route   GET /api/admin/login-history
 * @desc    Get login history
 * @access  Private
 */
router.get('/login-history', authMiddleware, getLoginHistory);

// =============================================================================
// PROTECTED ROUTES - SETTINGS (SUPER ADMIN)
// =============================================================================

/**
 * @route   GET /api/admin/settings
 * @desc    Get site settings
 * @access  Private (Super Admin)
 */
router.get('/settings', authMiddleware, getSiteSettings);

/**
 * @route   PUT /api/admin/settings
 * @desc    Update site settings
 * @access  Private (Super Admin)
 * @security Rate limited (sensitive), Input validated
 */
router.put('/settings',
    authMiddleware,
    sensitiveLimiter,
    allowedFields(['recoveryEmail', 'siteName', 'supportEmail', 'platformCharges', 'deliveryCharges', 'codEnabled']),
    validateSiteSettings,
    updateSiteSettings
);

// =============================================================================
// PROTECTED ROUTES - USER MANAGEMENT
// =============================================================================

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private
 */
router.get('/users', authMiddleware, getAllUsers);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get('/users/:id', authMiddleware, getUserById);

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user
 * @access  Private
 */
router.put('/users/:id', authMiddleware, updateUser);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user
 * @access  Private
 * @security Rate limited (sensitive)
 */
router.delete('/users/:id',
    authMiddleware,
    sensitiveLimiter,
    deleteUser
);

// =============================================================================
// PROTECTED ROUTES - ADMIN MANAGEMENT (SUPER ADMIN)
// =============================================================================

/**
 * @route   GET /api/admin/admins
 * @desc    Get all admins
 * @access  Private (Super Admin)
 */
router.get('/admins', authMiddleware, getAllAdmins);

/**
 * @route   POST /api/admin/admins
 * @desc    Create new admin
 * @access  Private (Super Admin)
 * @security Rate limited (sensitive)
 */
router.post('/admins',
    authMiddleware,
    sensitiveLimiter,
    createAdmin
);

/**
 * @route   PUT /api/admin/admins/:id
 * @desc    Update admin
 * @access  Private (Super Admin)
 */
router.put('/admins/:id', authMiddleware, updateAdmin);

/**
 * @route   DELETE /api/admin/admins/:id
 * @desc    Delete admin
 * @access  Private (Super Admin)
 * @security Rate limited (sensitive)
 */
router.delete('/admins/:id',
    authMiddleware,
    sensitiveLimiter,
    deleteAdmin
);

// =============================================================================
// DATA EXPORT
// =============================================================================

/**
 * @route   GET /api/admin/export/:type
 * @desc    Export data (products, orders, users)
 * @access  Private
 * @security Rate limited (sensitive)
 */
router.get('/export/:type',
    authMiddleware,
    sensitiveLimiter,
    exportData
);

export default router;
