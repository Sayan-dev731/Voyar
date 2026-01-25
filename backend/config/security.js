/**
 * Security Configuration & Utilities
 * ====================================
 * Centralized security configuration following OWASP best practices.
 * 
 * Features:
 * - Environment variable validation
 * - Secure defaults
 * - API key validation helpers
 * - Security-related utility functions
 * 
 * @see https://owasp.org/www-project-web-security-testing-guide/
 */

import crypto from 'crypto';

// ============================================================================
// ENVIRONMENT VARIABLE VALIDATION
// ============================================================================

/**
 * List of required environment variables
 * Server will log warnings for missing non-critical variables
 */
const REQUIRED_ENV_VARS = [
    'JWT_SECRET',
    'MONGODB_URI'
];

const RECOMMENDED_ENV_VARS = [
    'ADMIN_PASSWORD',
    'EMAIL_ID',
    'EMAIL_PASSWORD',
    'FRONTEND_URL'
];

const PAYMENT_ENV_VARS = [
    'Live_Key_ID',
    'Live_Key_Secret'
];

/**
 * Validate that required environment variables are set
 * @returns {boolean} - True if all required vars are set
 */
export const validateEnvironment = () => {
    let isValid = true;
    const missing = [];
    const warnings = [];

    // Check required variables
    REQUIRED_ENV_VARS.forEach(varName => {
        if (!process.env[varName]) {
            missing.push(varName);
            isValid = false;
        }
    });

    // Check recommended variables
    RECOMMENDED_ENV_VARS.forEach(varName => {
        if (!process.env[varName]) {
            warnings.push(varName);
        }
    });

    // Log results
    if (missing.length > 0) {
        console.error('❌ SECURITY ERROR: Missing required environment variables:');
        missing.forEach(v => console.error(`   - ${v}`));
    }

    if (warnings.length > 0 && process.env.NODE_ENV !== 'test') {
        console.warn('⚠️  Security Warning: Recommended environment variables not set:');
        warnings.forEach(v => console.warn(`   - ${v}`));
    }

    // Validate JWT_SECRET strength
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
        console.warn('⚠️  Security Warning: JWT_SECRET should be at least 32 characters for production');
    }

    return isValid;
};

/**
 * Check if payment credentials are configured
 * @returns {boolean}
 */
export const isPaymentConfigured = () => {
    return PAYMENT_ENV_VARS.every(v => process.env[v]);
};

// ============================================================================
// PASSWORD SECURITY UTILITIES
// ============================================================================

/**
 * Password complexity requirements
 */
export const PASSWORD_REQUIREMENTS = {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    specialChars: '@$!%*?&',
    historyCount: 5 // Number of previous passwords to remember
};

/**
 * Validate password meets security requirements
 * @param {string} password - Password to validate
 * @returns {object} - Validation result with details
 */
export const validatePasswordStrength = (password) => {
    const errors = [];

    if (!password) {
        return { isValid: false, errors: ['Password is required'] };
    }

    if (password.length < PASSWORD_REQUIREMENTS.minLength) {
        errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`);
    }

    if (password.length > PASSWORD_REQUIREMENTS.maxLength) {
        errors.push(`Password must be under ${PASSWORD_REQUIREMENTS.maxLength} characters`);
    }

    if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (PASSWORD_REQUIREMENTS.requireSpecialChars) {
        const specialRegex = new RegExp(`[${PASSWORD_REQUIREMENTS.specialChars}]`);
        if (!specialRegex.test(password)) {
            errors.push(`Password must contain at least one special character (${PASSWORD_REQUIREMENTS.specialChars})`);
        }
    }

    // Check for common weak patterns
    const commonPatterns = ['password', '123456', 'qwerty', 'admin', 'letmein', 'welcome'];
    if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
        errors.push('Password contains a commonly used pattern');
    }

    return {
        isValid: errors.length === 0,
        errors,
        strength: calculatePasswordStrength(password)
    };
};

/**
 * Calculate password strength score (0-100)
 * @param {string} password 
 * @returns {number}
 */
const calculatePasswordStrength = (password) => {
    let score = 0;

    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[a-z]/.test(password)) score += 15;
    if (/\d/.test(password)) score += 15;
    if (/[@$!%*?&]/.test(password)) score += 15;
    if (/[^A-Za-z0-9@$!%*?&]/.test(password)) score += 10;

    // Deduct for patterns
    if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
    if (/^[a-zA-Z]+$/.test(password)) score -= 10; // Only letters
    if (/^[0-9]+$/.test(password)) score -= 20; // Only numbers

    return Math.max(0, Math.min(100, score));
};

// ============================================================================
// TOKEN UTILITIES
// ============================================================================

/**
 * Generate a cryptographically secure random token
 * @param {number} bytes - Number of bytes (default 32)
 * @returns {string} - Hex-encoded token
 */
export const generateSecureToken = (bytes = 32) => {
    return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Generate a time-limited token with embedded expiry
 * @param {number} expiryMinutes - Token validity in minutes
 * @returns {object} - Token and expiry timestamp
 */
export const generateExpiringToken = (expiryMinutes = 60) => {
    return {
        token: generateSecureToken(),
        expires: new Date(Date.now() + expiryMinutes * 60 * 1000)
    };
};

// ============================================================================
// REQUEST SECURITY UTILITIES
// ============================================================================

/**
 * Extract client IP address from request
 * Handles proxies and load balancers
 * @param {object} req - Express request object
 * @returns {string} - Client IP address
 */
export const getClientIp = (req) => {
    // Check for various proxy headers
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
        // X-Forwarded-For may contain multiple IPs, take the first one
        return forwardedFor.split(',')[0].trim();
    }

    const realIp = req.headers['x-real-ip'];
    if (realIp) {
        return realIp;
    }

    // Fall back to connection remote address
    return req.connection?.remoteAddress || req.ip || 'unknown';
};

/**
 * Sanitize user agent string for logging
 * @param {object} req - Express request object
 * @returns {string} - Sanitized user agent
 */
export const getSafeUserAgent = (req) => {
    const userAgent = req.headers['user-agent'] || 'unknown';
    // Limit length and remove potentially dangerous characters
    return userAgent.substring(0, 256).replace(/[<>]/g, '');
};

// ============================================================================
// SECURITY HEADERS CONFIGURATION
// ============================================================================

/**
 * Security headers configuration for Helmet
 */
export const helmetConfig = {
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", 'https://api.razorpay.com'],
            fontSrc: ["'self'", 'https:', 'data:'],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'self'", 'https://api.razorpay.com']
        }
    },
    crossOriginEmbedderPolicy: false, // May need to be disabled for certain CDNs
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
    }
};

// ============================================================================
// RATE LIMIT CONFIGURATION
// ============================================================================

/**
 * Default rate limit settings
 * Can be overridden via environment variables
 */
export const rateLimitDefaults = {
    standard: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100
    },
    auth: {
        windowMs: 15 * 60 * 1000,
        max: 5
    },
    passwordReset: {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 3
    },
    payment: {
        windowMs: 10 * 60 * 1000,
        max: 10
    }
};

export default {
    validateEnvironment,
    isPaymentConfigured,
    PASSWORD_REQUIREMENTS,
    validatePasswordStrength,
    generateSecureToken,
    generateExpiringToken,
    getClientIp,
    getSafeUserAgent,
    helmetConfig,
    rateLimitDefaults
};
