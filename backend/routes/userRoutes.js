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
    verify2FAOTP,
    resend2FAOTP,
    update2FASettings,
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    syncWishlist,
    clearWishlist,
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

// Security imports
import {
    authLimiter,
    passwordResetLimiter,
    emailLimiter,
    sensitiveLimiter
} from '../middleware/rateLimiter.js';
import {
    validateSignup,
    validateLogin,
    validatePasswordChange,
    validatePasswordReset,
    validateForgotPassword,
    validateProfileUpdate,
    validateAddress,
    validateCartItem,
    allowedFields
} from '../middleware/validation.js';

const router = express.Router();

// =============================================================================
// PUBLIC ROUTES (with rate limiting)
// =============================================================================

/**
 * @route   POST /api/users/signup
 * @desc    Register a new user
 * @access  Public
 * @security Rate limited (auth), Input validated
 */
router.post('/signup',
    authLimiter,
    allowedFields(['name', 'email', 'password']),
    validateSignup,
    signup
);

/**
 * @route   POST /api/users/login
 * @desc    Authenticate user & get token
 * @access  Public
 * @security Rate limited (auth), Input validated
 */
router.post('/login',
    authLimiter,
    allowedFields(['email', 'password']),
    validateLogin,
    login
);

/**
 * @route   GET /api/users/verify-email/:token
 * @desc    Verify user email address
 * @access  Public
 * @security Rate limited (email)
 */
router.get('/verify-email/:token', verifyEmail);

/**
 * @route   POST /api/users/resend-verification
 * @desc    Resend email verification link
 * @access  Public
 * @security Rate limited (email)
 */
router.post('/resend-verification',
    emailLimiter,
    allowedFields(['email']),
    resendVerification
);

/**
 * @route   POST /api/users/forgot-password
 * @desc    Request password reset email
 * @access  Public
 * @security Rate limited (password reset), Input validated
 */
router.post('/forgot-password',
    passwordResetLimiter,
    allowedFields(['email']),
    validateForgotPassword,
    forgotPassword
);

/**
 * @route   POST /api/users/reset-password/:token
 * @desc    Reset password with token
 * @access  Public
 * @security Rate limited (password reset), Input validated
 */
router.post('/reset-password/:token',
    passwordResetLimiter,
    allowedFields(['password']),
    validatePasswordReset,
    resetPassword
);

/**
 * @route   POST /api/users/verify-2fa
 * @desc    Verify 2FA OTP code
 * @access  Public
 * @security Rate limited (auth)
 */
router.post('/verify-2fa',
    authLimiter,
    allowedFields(['userId', 'otp']),
    verify2FAOTP
);

/**
 * @route   POST /api/users/resend-2fa-otp
 * @desc    Resend 2FA OTP code
 * @access  Public
 * @security Rate limited (email)
 */
router.post('/resend-2fa-otp',
    emailLimiter,
    allowedFields(['userId']),
    resend2FAOTP
);

// =============================================================================
// PROTECTED ROUTES - PROFILE
// =============================================================================

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', protect, getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 * @security Input validated
 */
router.put('/profile',
    protect,
    allowedFields(['name', 'phone', 'gender', 'dateOfBirth', 'profileImage']),
    validateProfileUpdate,
    updateProfile
);

/**
 * @route   PUT /api/users/2fa-settings
 * @desc    Enable/Disable 2FA
 * @access  Private
 * @security Rate limited (sensitive)
 */
router.put('/2fa-settings',
    protect,
    sensitiveLimiter,
    allowedFields(['enabled']),
    update2FASettings
);

/**
 * @route   PUT /api/users/change-password
 * @desc    Change user password
 * @access  Private
 * @security Rate limited (sensitive), Input validated
 */
router.put('/change-password',
    protect,
    sensitiveLimiter,
    allowedFields(['currentPassword', 'newPassword']),
    validatePasswordChange,
    changePassword
);

// =============================================================================
// PROTECTED ROUTES - ADDRESSES
// =============================================================================

/**
 * @route   POST /api/users/addresses
 * @desc    Add new address
 * @access  Private
 * @security Input validated
 */
router.post('/addresses',
    protect,
    allowedFields(['name', 'phone', 'street', 'landmark', 'city', 'state', 'zipCode', 'pincode', 'country', 'type', 'isDefault']),
    validateAddress,
    addAddress
);

/**
 * @route   PUT /api/users/addresses/:addressId
 * @desc    Update address
 * @access  Private
 * @security Input validated
 */
router.put('/addresses/:addressId',
    protect,
    allowedFields(['name', 'phone', 'street', 'landmark', 'city', 'state', 'zipCode', 'pincode', 'country', 'type', 'isDefault']),
    updateAddress
);

/**
 * @route   DELETE /api/users/addresses/:addressId
 * @desc    Delete address
 * @access  Private
 */
router.delete('/addresses/:addressId', protect, deleteAddress);

// =============================================================================
// PROTECTED ROUTES - CART
// =============================================================================

/**
 * @route   GET /api/users/cart
 * @desc    Get user cart
 * @access  Private
 */
router.get('/cart', protect, getCart);

/**
 * @route   POST /api/users/cart
 * @desc    Add item to cart
 * @access  Private
 * @security Input validated
 */
router.post('/cart',
    protect,
    allowedFields(['productId', 'quantity', 'selectedColor']),
    validateCartItem,
    addToCart
);

/**
 * @route   POST /api/users/cart/sync
 * @desc    Sync local cart with server
 * @access  Private
 */
router.post('/cart/sync', protect, syncCart);

/**
 * @route   PUT /api/users/cart/:productId
 * @desc    Update cart item quantity
 * @access  Private
 */
router.put('/cart/:productId', protect, updateCartItem);

/**
 * @route   DELETE /api/users/cart/:productId
 * @desc    Remove item from cart
 * @access  Private
 */
router.delete('/cart/:productId', protect, removeFromCart);

/**
 * @route   DELETE /api/users/cart
 * @desc    Clear entire cart
 * @access  Private
 */
router.delete('/cart', protect, clearCart);

// =============================================================================
// PROTECTED ROUTES - WISHLIST
// =============================================================================

/**
 * @route   GET /api/users/wishlist
 * @desc    Get user wishlist
 * @access  Private
 */
router.get('/wishlist', protect, getWishlist);

/**
 * @route   POST /api/users/wishlist/add
 * @desc    Add item to wishlist
 * @access  Private
 */
router.post('/wishlist/add',
    protect,
    allowedFields(['productId']),
    addToWishlist
);

/**
 * @route   POST /api/users/wishlist/sync
 * @desc    Sync local wishlist with server
 * @access  Private
 */
router.post('/wishlist/sync', protect, syncWishlist);

/**
 * @route   DELETE /api/users/wishlist/remove
 * @desc    Remove item from wishlist
 * @access  Private
 */
router.delete('/wishlist/remove', protect, removeFromWishlist);

/**
 * @route   DELETE /api/users/wishlist
 * @desc    Clear entire wishlist
 * @access  Private
 */
router.delete('/wishlist', protect, clearWishlist);

export default router;
