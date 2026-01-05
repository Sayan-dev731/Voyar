/**
 * Input Validation & Sanitization Middleware
 * ===========================================
 * Implements comprehensive input validation following OWASP best practices.
 * 
 * Features:
 * - Schema-based validation with express-validator
 * - Type checking and length limits
 * - XSS prevention and sanitization
 * - MongoDB injection prevention
 * - Rejection of unexpected fields
 * 
 * @see https://owasp.org/www-community/attacks/xss/
 * @see https://owasp.org/www-community/attacks/SQL_Injection
 */

import { body, param, query, validationResult } from 'express-validator';
import xssFilters from 'xss-filters';
import mongoSanitize from 'mongo-sanitize';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Sanitize a string to prevent XSS attacks
 * @param {string} value - Input string to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeString = (value) => {
    if (typeof value !== 'string') return value;
    return xssFilters.inHTMLData(value.trim());
};

/**
 * Deep sanitize an object to prevent MongoDB injection
 * @param {object} obj - Object to sanitize
 * @returns {object} - Sanitized object
 */
export const sanitizeObject = (obj) => {
    return mongoSanitize(obj);
};

/**
 * Middleware to handle validation errors
 * Returns structured error response with field-specific details
 */
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(err => ({
            field: err.path || err.param,
            message: err.msg,
            value: err.value !== undefined ? '[HIDDEN]' : undefined // Don't expose sensitive values
        }));

        return res.status(400).json({
            success: false,
            message: 'Validation failed. Please check your input.',
            errors: formattedErrors
        });
    }

    next();
};

/**
 * Middleware to reject unexpected fields in request body
 * Prevents mass assignment attacks
 */
export const allowedFields = (allowedList) => {
    return (req, res, next) => {
        if (!req.body || typeof req.body !== 'object') {
            return next();
        }

        const unexpectedFields = Object.keys(req.body).filter(
            key => !allowedList.includes(key)
        );

        if (unexpectedFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Unexpected fields in request body.',
                error: {
                    code: 'UNEXPECTED_FIELDS',
                    fields: unexpectedFields
                }
            });
        }

        next();
    };
};

/**
 * Global sanitization middleware
 * Sanitizes all incoming request data
 */
export const globalSanitizer = (req, res, next) => {
    // Sanitize body
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters - req.query can be read-only in some Express versions
    if (req.query && typeof req.query === 'object') {
        const sanitizedQuery = sanitizeObject(req.query);
        try {
            req.query = sanitizedQuery;
        } catch (error) {
            // If req.query is read-only, use Object.defineProperty
            Object.defineProperty(req, 'query', {
                value: sanitizedQuery,
                writable: true,
                enumerable: true,
                configurable: true
            });
        }
    }

    // Sanitize URL parameters
    if (req.params && typeof req.params === 'object') {
        req.params = sanitizeObject(req.params);
    }

    next();
};

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * User registration validation
 */
export const validateSignup = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s'-]+$/).withMessage('Name can only contain letters, spaces, hyphens, and apostrophes')
        .customSanitizer(sanitizeString),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail()
        .isLength({ max: 254 }).withMessage('Email is too long'),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8, max: 128 }).withMessage('Password must be between 8 and 128 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'),

    handleValidationErrors
];

/**
 * User login validation
 */
export const validateLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ max: 128 }).withMessage('Password is too long'),

    handleValidationErrors
];

/**
 * Admin login validation
 */
export const validateAdminLogin = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores')
        .customSanitizer(sanitizeString),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ max: 128 }).withMessage('Password is too long'),

    handleValidationErrors
];

/**
 * Password change validation
 */
export const validatePasswordChange = [
    body('currentPassword')
        .notEmpty().withMessage('Current password is required'),

    body('newPassword')
        .notEmpty().withMessage('New password is required')
        .isLength({ min: 8, max: 128 }).withMessage('New password must be between 8 and 128 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)')
        .custom((value, { req }) => {
            if (value === req.body.currentPassword) {
                throw new Error('New password must be different from current password');
            }
            return true;
        }),

    handleValidationErrors
];

/**
 * Password reset validation
 */
export const validatePasswordReset = [
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8, max: 128 }).withMessage('Password must be between 8 and 128 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'),

    param('token')
        .trim()
        .notEmpty().withMessage('Reset token is required')
        .isLength({ min: 32, max: 128 }).withMessage('Invalid reset token format')
        .isHexadecimal().withMessage('Invalid reset token format'),

    handleValidationErrors
];

/**
 * Forgot password validation
 */
export const validateForgotPassword = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),

    handleValidationErrors
];

/**
 * Admin forgot password validation (username-based)
 */
export const validateAdminForgotPassword = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3, max: 30 }).withMessage('Invalid username')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Invalid username format')
        .customSanitizer(sanitizeString),

    handleValidationErrors
];

/**
 * Profile update validation
 */
export const validateProfileUpdate = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s'-]+$/).withMessage('Name can only contain letters, spaces, hyphens, and apostrophes')
        .customSanitizer(sanitizeString),

    body('phone')
        .optional()
        .trim()
        .matches(/^[+]?[\d\s-]{10,15}$/).withMessage('Please provide a valid phone number'),

    body('gender')
        .optional()
        .isIn(['male', 'female', 'other', '']).withMessage('Invalid gender value'),

    body('dateOfBirth')
        .optional()
        .isISO8601().withMessage('Invalid date format'),

    body('profileImage')
        .optional()
        .trim()
        .isURL().withMessage('Profile image must be a valid URL'),

    handleValidationErrors
];

/**
 * Address validation
 */
export const validateAddress = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
        .customSanitizer(sanitizeString),

    body('phone')
        .trim()
        .notEmpty().withMessage('Phone is required')
        .matches(/^[+]?[\d\s-]{10,15}$/).withMessage('Please provide a valid phone number'),

    body('street')
        .trim()
        .notEmpty().withMessage('Street address is required')
        .isLength({ min: 5, max: 200 }).withMessage('Street must be between 5 and 200 characters')
        .customSanitizer(sanitizeString),

    body('city')
        .trim()
        .notEmpty().withMessage('City is required')
        .isLength({ min: 2, max: 50 }).withMessage('City must be between 2 and 50 characters')
        .customSanitizer(sanitizeString),

    body('state')
        .trim()
        .notEmpty().withMessage('State is required')
        .isLength({ min: 2, max: 50 }).withMessage('State must be between 2 and 50 characters')
        .customSanitizer(sanitizeString),

    body('zipCode')
        .trim()
        .notEmpty().withMessage('ZIP code is required')
        .matches(/^[\d-]{5,10}$/).withMessage('Please provide a valid ZIP code'),

    body('country')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('Country must be between 2 and 50 characters')
        .customSanitizer(sanitizeString),

    body('type')
        .optional()
        .isIn(['home', 'work', 'other']).withMessage('Invalid address type'),

    body('isDefault')
        .optional()
        .isBoolean().withMessage('isDefault must be a boolean'),

    handleValidationErrors
];

/**
 * Product validation
 */
export const validateProduct = [
    body('name')
        .trim()
        .notEmpty().withMessage('Product name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Product name must be between 2 and 100 characters')
        .customSanitizer(sanitizeString),

    body('category')
        .trim()
        .notEmpty().withMessage('Category is required')
        .isIn(['Sunglasses', 'Eyeglasses', 'Reading Glasses', 'Sports', 'Accessories'])
        .withMessage('Invalid category'),

    body('price')
        .notEmpty().withMessage('Price is required')
        .isFloat({ min: 0, max: 1000000 }).withMessage('Price must be a positive number'),

    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters')
        .customSanitizer(sanitizeString),

    body('image')
        .trim()
        .notEmpty().withMessage('Main image is required')
        .isURL().withMessage('Image must be a valid URL'),

    body('images')
        .optional()
        .isArray({ max: 10 }).withMessage('Maximum 10 images allowed'),

    body('images.*')
        .optional()
        .isURL().withMessage('Each image must be a valid URL'),

    body('stock')
        .optional()
        .isInt({ min: 0, max: 100000 }).withMessage('Stock must be a positive integer'),

    body('inStock')
        .optional()
        .isBoolean().withMessage('inStock must be a boolean'),

    body('features')
        .optional()
        .isArray({ max: 20 }).withMessage('Maximum 20 features allowed'),

    body('features.*')
        .optional()
        .isLength({ max: 200 }).withMessage('Each feature must be under 200 characters')
        .customSanitizer(sanitizeString),

    body('colors')
        .optional()
        .isArray({ max: 20 }).withMessage('Maximum 20 color variants allowed'),

    body('colors.*.name')
        .optional()
        .isLength({ min: 1, max: 30 }).withMessage('Color name must be between 1 and 30 characters'),

    body('colors.*.value')
        .optional()
        .matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color value must be a valid hex color'),

    body('colors.*.price')
        .optional()
        .isFloat({ min: 0 }).withMessage('Color price must be a positive number'),

    body('colors.*.quantity')
        .optional()
        .isInt({ min: 0 }).withMessage('Color quantity must be a positive integer'),

    handleValidationErrors
];

/**
 * Order validation
 */
export const validateOrder = [
    body('items')
        .isArray({ min: 1 }).withMessage('At least one item is required'),

    body('items.*.product')
        .notEmpty().withMessage('Product ID is required')
        .isMongoId().withMessage('Invalid product ID'),

    body('items.*.quantity')
        .isInt({ min: 1, max: 100 }).withMessage('Quantity must be between 1 and 100'),

    body('items.*.price')
        .isFloat({ min: 0 }).withMessage('Price must be a positive number'),

    body('customerName')
        .trim()
        .notEmpty().withMessage('Customer name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Customer name must be between 2 and 50 characters')
        .customSanitizer(sanitizeString),

    body('customerEmail')
        .trim()
        .notEmpty().withMessage('Customer email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('customerPhone')
        .optional()
        .matches(/^[+]?[\d\s-]{10,15}$/).withMessage('Please provide a valid phone number'),

    body('shippingAddress')
        .notEmpty().withMessage('Shipping address is required'),

    body('shippingAddress.street')
        .trim()
        .notEmpty().withMessage('Street is required')
        .customSanitizer(sanitizeString),

    body('shippingAddress.city')
        .trim()
        .notEmpty().withMessage('City is required')
        .customSanitizer(sanitizeString),

    body('shippingAddress.state')
        .trim()
        .notEmpty().withMessage('State is required')
        .customSanitizer(sanitizeString),

    body('shippingAddress.zipCode')
        .trim()
        .notEmpty().withMessage('ZIP code is required'),

    body('totalAmount')
        .isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),

    handleValidationErrors
];

/**
 * Review validation
 */
export const validateReview = [
    body('product')
        .optional()
        .isMongoId().withMessage('Invalid product ID'),

    body('productId')
        .optional()
        .isMongoId().withMessage('Invalid product ID'),

    body('rating')
        .notEmpty().withMessage('Rating is required')
        .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),

    body('comment')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Comment must be under 1000 characters')
        .customSanitizer(sanitizeString),

    body('title')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Title must be under 100 characters')
        .customSanitizer(sanitizeString),

    handleValidationErrors
];

/**
 * MongoDB ID parameter validation
 */
export const validateMongoId = [
    param('id')
        .isMongoId().withMessage('Invalid ID format'),

    handleValidationErrors
];

/**
 * Pagination query validation
 */
export const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1, max: 1000 }).withMessage('Page must be a positive integer'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

    query('sort')
        .optional()
        .matches(/^[a-zA-Z_]+$/).withMessage('Invalid sort field'),

    query('order')
        .optional()
        .isIn(['asc', 'desc', '1', '-1']).withMessage('Order must be asc or desc'),

    handleValidationErrors
];

/**
 * Search query validation
 */
export const validateSearch = [
    query('q')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 }).withMessage('Search query must be between 1 and 100 characters')
        .customSanitizer(sanitizeString),

    query('category')
        .optional()
        .trim()
        .customSanitizer(sanitizeString),

    query('minPrice')
        .optional()
        .isFloat({ min: 0 }).withMessage('Minimum price must be a positive number'),

    query('maxPrice')
        .optional()
        .isFloat({ min: 0 }).withMessage('Maximum price must be a positive number'),

    handleValidationErrors
];

/**
 * Cart operations validation
 */
export const validateCartItem = [
    body('productId')
        .notEmpty().withMessage('Product ID is required')
        .isMongoId().withMessage('Invalid product ID'),

    body('quantity')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Quantity must be between 1 and 100'),

    body('selectedColor')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Color name is too long')
        .customSanitizer(sanitizeString),

    handleValidationErrors
];

/**
 * Site settings validation
 */
export const validateSiteSettings = [
    body('recoveryEmail')
        .optional()
        .isEmail().withMessage('Invalid recovery email'),

    body('siteName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 }).withMessage('Site name must be between 1 and 100 characters')
        .customSanitizer(sanitizeString),

    body('supportEmail')
        .optional()
        .isEmail().withMessage('Invalid support email'),

    body('platformCharges')
        .optional()
        .isFloat({ min: 0, max: 100000 }).withMessage('Platform charges must be a positive number'),

    body('deliveryCharges')
        .optional()
        .isFloat({ min: 0, max: 100000 }).withMessage('Delivery charges must be a positive number'),

    handleValidationErrors
];

export default {
    handleValidationErrors,
    allowedFields,
    globalSanitizer,
    sanitizeString,
    sanitizeObject,
    validateSignup,
    validateLogin,
    validateAdminLogin,
    validatePasswordChange,
    validatePasswordReset,
    validateForgotPassword,
    validateAdminForgotPassword,
    validateProfileUpdate,
    validateAddress,
    validateProduct,
    validateOrder,
    validateReview,
    validateMongoId,
    validatePagination,
    validateSearch,
    validateCartItem,
    validateSiteSettings
};
