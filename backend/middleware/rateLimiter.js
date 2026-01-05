/**
 * Rate Limiting Middleware
 * =========================
 * Implements IP-based and user-based rate limiting following OWASP best practices.
 * 
 * Features:
 * - Separate rate limiters for different endpoint types
 * - IP-based tracking for public endpoints
 * - User-based tracking for authenticated endpoints
 * - Graceful 429 responses with retry information
 * - Configurable limits via environment variables
 * 
 * @see https://owasp.org/www-community/attacks/Denial_of_Service
 */

import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

/**
 * Custom key generator that combines IP and user ID for authenticated requests
 * Falls back to IP-only for unauthenticated requests
 * Uses ipKeyGenerator helper to properly handle IPv6 addresses
 */
const keyGenerator = (req) => {
    const ip = ipKeyGenerator(req);

    // For authenticated requests, combine IP + user ID to prevent per-user abuse
    if (req.admin?.id) {
        return `admin:${req.admin.id}:${ip}`;
    }
    if (req.user?.id) {
        return `user:${req.user.id}:${ip}`;
    }
    // For unauthenticated requests, use IP only
    return ip;
};

/**
 * Custom error handler for rate limit exceeded
 * Provides meaningful error messages without exposing internal details
 */
const rateLimitHandler = (req, res, next, options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000);

    res.status(429).json({
        success: false,
        message: 'Too many requests. Please slow down and try again later.',
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: retryAfter,
            limit: options.max,
            windowMs: options.windowMs
        },
        // OWASP: Include Retry-After header for clients
        hint: `Please wait ${retryAfter} seconds before making another request.`
    });
};

/**
 * Standard rate limiter for general API endpoints
 * Default: 100 requests per 15 minutes per IP
 */
export const standardLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    keyGenerator,
    handler: rateLimitHandler,
    skip: (req) => {
        // Skip rate limiting for health checks
        return req.path === '/api/health';
    },
    message: 'Too many requests from this IP, please try again later.'
});

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute force attacks on login/signup
 * Default: 5 attempts per 15 minutes per IP
 */
export const authLimiter = rateLimit({
    windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_ATTEMPTS) || 5,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => ipKeyGenerator(req), // IP-only for auth endpoints with IPv6 support
    handler: (req, res, next, options) => {
        const retryAfter = Math.ceil(options.windowMs / 1000);
        res.status(429).json({
            success: false,
            message: 'Too many authentication attempts. Your IP has been temporarily blocked.',
            error: {
                code: 'AUTH_RATE_LIMIT_EXCEEDED',
                retryAfter: retryAfter
            },
            hint: `For security, please wait ${Math.ceil(retryAfter / 60)} minutes before trying again.`
        });
    },
    skipSuccessfulRequests: false // Count all requests, not just failed ones
});

/**
 * Strict rate limiter for password reset endpoints
 * Prevents email enumeration and abuse
 * Default: 3 attempts per hour per IP
 */
export const passwordResetLimiter = rateLimit({
    windowMs: parseInt(process.env.PASSWORD_RESET_RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000, // 1 hour
    max: parseInt(process.env.PASSWORD_RESET_RATE_LIMIT_MAX_ATTEMPTS) || 3,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => ipKeyGenerator(req),
    handler: (req, res, next, options) => {
        const retryAfter = Math.ceil(options.windowMs / 1000);
        res.status(429).json({
            success: false,
            message: 'Too many password reset requests. Please try again later.',
            error: {
                code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
                retryAfter: retryAfter
            },
            hint: `For security, please wait ${Math.ceil(retryAfter / 60)} minutes before requesting another password reset.`
        });
    }
});

/**
 * Rate limiter for sensitive operations (delete, bulk updates)
 * Default: 10 requests per 5 minutes per user+IP
 */
export const sensitiveLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    handler: (req, res, next, options) => {
        res.status(429).json({
            success: false,
            message: 'Too many sensitive operations. Please wait before performing more actions.',
            error: {
                code: 'SENSITIVE_OPERATION_RATE_LIMIT_EXCEEDED',
                retryAfter: Math.ceil(options.windowMs / 1000)
            }
        });
    }
});

/**
 * Rate limiter for payment endpoints
 * Very strict to prevent payment fraud
 * Default: 10 requests per 10 minutes per IP+user
 */
export const paymentLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    handler: (req, res, next, options) => {
        res.status(429).json({
            success: false,
            message: 'Too many payment requests. Please wait before making another payment.',
            error: {
                code: 'PAYMENT_RATE_LIMIT_EXCEEDED',
                retryAfter: Math.ceil(options.windowMs / 1000)
            }
        });
    }
});

/**
 * Rate limiter for email sending (verification, notifications)
 * Prevents email spam
 * Default: 5 emails per 15 minutes per IP
 */
export const emailLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => ipKeyGenerator(req),
    handler: (req, res, next, options) => {
        res.status(429).json({
            success: false,
            message: 'Too many email requests. Please check your inbox before requesting again.',
            error: {
                code: 'EMAIL_RATE_LIMIT_EXCEEDED',
                retryAfter: Math.ceil(options.windowMs / 1000)
            }
        });
    }
});

/**
 * Rate limiter for public product listing
 * More lenient for browsing
 * Default: 200 requests per 15 minutes per IP
 */
export const publicLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => ipKeyGenerator(req),
    handler: rateLimitHandler
});

export default {
    standardLimiter,
    authLimiter,
    passwordResetLimiter,
    sensitiveLimiter,
    paymentLimiter,
    emailLimiter,
    publicLimiter
};
