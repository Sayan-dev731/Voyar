import express from 'express';
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    getProductStats
} from '../controllers/productController.js';
import { authMiddleware } from '../middleware/auth.js';

// Security imports
import { sensitiveLimiter, publicLimiter } from '../middleware/rateLimiter.js';
import {
    validateProduct,
    validateMongoId,
    validateSearch,
    validatePagination,
    allowedFields
} from '../middleware/validation.js';

const router = express.Router();

// =============================================================================
// PUBLIC ROUTES
// =============================================================================

/**
 * @route   GET /api/products
 * @desc    Get all products with pagination
 * @access  Public
 * @security Rate limited (public), Query validated
 */
router.get('/',
    publicLimiter,
    validatePagination,
    getAllProducts
);

/**
 * @route   GET /api/products/search
 * @desc    Search products
 * @access  Public
 * @security Rate limited (public), Query validated
 */
router.get('/search',
    publicLimiter,
    validateSearch,
    searchProducts
);

/**
 * @route   GET /api/products/stats/summary
 * @desc    Get product statistics (admin)
 * @access  Private
 */
router.get('/stats/summary', authMiddleware, getProductStats);

/**
 * @route   GET /api/products/:id
 * @desc    Get product by ID
 * @access  Public
 * @security Rate limited (public), ID validated
 */
router.get('/:id',
    publicLimiter,
    validateMongoId,
    getProductById
);

// =============================================================================
// ADMIN ROUTES (PROTECTED)
// =============================================================================

/**
 * @route   POST /api/products
 * @desc    Create new product
 * @access  Private (Admin)
 * @security Rate limited (sensitive), Input validated
 */
router.post('/',
    authMiddleware,
    sensitiveLimiter,
    allowedFields([
        'name', 'category', 'price', 'image', 'images', 'description',
        'detailedDescription', 'features', 'specifications', 'colors',
        'stock', 'inStock', 'brand'
    ]),
    validateProduct,
    createProduct
);

/**
 * @route   PUT /api/products/:id
 * @desc    Update product
 * @access  Private (Admin)
 * @security Rate limited (sensitive), Input validated
 */
router.put('/:id',
    authMiddleware,
    sensitiveLimiter,
    validateMongoId,
    allowedFields([
        'name', 'category', 'price', 'image', 'images', 'description',
        'detailedDescription', 'features', 'specifications', 'colors',
        'stock', 'inStock', 'brand'
    ]),
    updateProduct
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product
 * @access  Private (Admin)
 * @security Rate limited (sensitive), ID validated
 */
router.delete('/:id',
    authMiddleware,
    sensitiveLimiter,
    validateMongoId,
    deleteProduct
);

export default router;
