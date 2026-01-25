import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import shiprocketRoutes from './routes/shiprocketRoutes.js';
import shiprocketWebhookRoutes from './routes/shiprocketWebhookRoutes.js';

// Security imports
import { validateEnvironment } from './config/security.js';
import { standardLimiter, publicLimiter } from './middleware/rateLimiter.js';
import { globalSanitizer } from './middleware/validation.js';

// Load environment variables
dotenv.config();

// Validate required environment variables on startup
validateEnvironment();

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// =============================================================================
// SECURITY MIDDLEWARE (Applied before routes)
// =============================================================================

/**
 * Helmet - Sets various HTTP headers for security
 * - X-Content-Type-Options: nosniff
 * - X-Frame-Options: DENY
 * - X-XSS-Protection: 1; mode=block
 * - Strict-Transport-Security
 * - Content-Security-Policy (if enabled)
 */
app.use(helmet({
    contentSecurityPolicy: false, // Disabled for API - enable for serving HTML
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' } // Allow cross-origin for images
}));

/**
 * Trust proxy - Required for rate limiting behind reverse proxies
 * Set to true if behind Vercel, Nginx, etc.
 */
app.set('trust proxy', 1);

// =============================================================================
// CORS CONFIGURATION
// =============================================================================

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://voyar.vercel.app',
    'https://www.voyareyewear.com',
    'https://voyareyewear.com',
    'https://nonfeudally-unstandardised-loyce.ngrok-free.dev'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// =============================================================================
// BODY PARSING & SANITIZATION
// =============================================================================

/**
 * Body parser with size limits to prevent DoS attacks
 */
app.use(express.json({ limit: '10kb' })); // Limit JSON body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/**
 * Global input sanitization - prevents NoSQL injection and XSS
 */
app.use(globalSanitizer);

// =============================================================================
// RATE LIMITING
// =============================================================================

/**
 * Apply standard rate limiting to all routes
 * More specific limiters are applied at the route level
 */
app.use('/api', standardLimiter);

/**
 * Apply more lenient rate limiting to public product routes
 */
app.use('/api/products', publicLimiter);

// =============================================================================
// REQUEST LOGGING
// =============================================================================

// Request logging middleware (sanitized)
app.use((req, res, next) => {
    // Sanitize path for logging (prevent log injection)
    const safePath = req.path.replace(/[<>]/g, '').substring(0, 200);
    console.log(`${new Date().toISOString()} - ${req.method} ${safePath}`);
    next();
});

// =============================================================================
// API ROUTES
// =============================================================================

// Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/shiprocket', shiprocketRoutes);
app.use('/api/shipping-webhook', shiprocketWebhookRoutes);

// Health check route (no rate limiting)
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Voyar API is running',
        timestamp: new Date().toISOString()
    });
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

// Error handling middleware
app.use((err, req, res, next) => {
    // Log error securely (don't expose stack in production)
    console.error(`Error: ${err.message}`);
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }

    // Don't expose internal error details in production
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        success: false,
        message: statusCode === 500 ? 'Internal server error' : err.message,
        error: process.env.NODE_ENV === 'development' ? {
            message: err.message,
            stack: err.stack
        } : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
