import express from 'express';
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts
} from '../controllers/productController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/search', searchProducts);
router.get('/:id', getProductById);

// Admin routes
router.post('/', authMiddleware, createProduct);
router.put('/:id', authMiddleware, updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);

export default router;
