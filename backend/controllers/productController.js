import Product from '../models/Product.js';

// Get all products
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get single product
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: error.message });
    }
};

// Create product (Admin only)
export const createProduct = async (req, res) => {
    try {
        const {
            name,
            category,
            price,
            image,
            images,
            description,
            detailedDescription,
            features,
            specifications,
            colors,
            stock,
            inStock,
            rating,
            reviews
        } = req.body;

        // Validation
        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Product name is required' });
        }
        if (!category) {
            return res.status(400).json({ message: 'Category is required' });
        }
        if (!price || isNaN(price) || price <= 0) {
            return res.status(400).json({ message: 'Valid price is required' });
        }
        if (!image || !image.trim()) {
            return res.status(400).json({ message: 'Main product image is required' });
        }
        if (!description || !description.trim()) {
            return res.status(400).json({ message: 'Description is required' });
        }

        // Calculate stock - either from main stock field or sum of color variant quantities
        let productStock = Number(stock) || 0;
        let productInStock = inStock !== false;

        if (colors && colors.length > 0) {
            // If product has color variants, calculate total stock from them
            const totalColorStock = colors.reduce((sum, c) => sum + (Number(c.quantity) || 0), 0);
            productStock = totalColorStock;
            productInStock = totalColorStock > 0;
        }

        const product = new Product({
            name: name.trim(),
            category,
            price: Number(price),
            image: image.trim(),
            images: images || [],
            description: description.trim(),
            detailedDescription: detailedDescription?.trim() || '',
            features: features || [],
            specifications: specifications || {},
            colors: colors || [],
            stock: productStock,
            inStock: productInStock,
            rating: Number(rating) || 0,
            reviews: Number(reviews) || 0
        });

        const savedProduct = await product.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(400).json({ message: error.message });
    }
};

// Update product (Admin only)
export const updateProduct = async (req, res) => {
    try {
        const {
            name,
            category,
            price,
            image,
            images,
            description,
            detailedDescription,
            features,
            specifications,
            colors,
            stock,
            inStock,
            rating,
            reviews
        } = req.body;

        // Validation
        if (name !== undefined && !name.trim()) {
            return res.status(400).json({ message: 'Product name cannot be empty' });
        }
        if (price !== undefined && (isNaN(price) || price <= 0)) {
            return res.status(400).json({ message: 'Valid price is required' });
        }
        if (image !== undefined && !image.trim()) {
            return res.status(400).json({ message: 'Main product image cannot be empty' });
        }
        if (description !== undefined && !description.trim()) {
            return res.status(400).json({ message: 'Description cannot be empty' });
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name.trim();
        if (category !== undefined) updateData.category = category;
        if (price !== undefined) updateData.price = Number(price);
        if (image !== undefined) updateData.image = image.trim();
        if (images !== undefined) updateData.images = images;
        if (description !== undefined) updateData.description = description.trim();
        if (detailedDescription !== undefined) updateData.detailedDescription = detailedDescription?.trim() || '';
        if (features !== undefined) updateData.features = features;
        if (specifications !== undefined) updateData.specifications = specifications;
        if (colors !== undefined) {
            updateData.colors = colors;
            // Calculate stock from color variants
            const totalColorStock = colors.reduce((sum, c) => sum + (Number(c.quantity) || 0), 0);
            updateData.stock = totalColorStock;
            updateData.inStock = totalColorStock > 0;
        } else if (stock !== undefined) {
            updateData.stock = Number(stock) || 0;
            updateData.inStock = Number(stock) > 0;
        } else if (inStock !== undefined) {
            updateData.inStock = inStock;
        }
        if (rating !== undefined) updateData.rating = Number(rating) || 0;
        if (reviews !== undefined) updateData.reviews = Number(reviews) || 0;

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(400).json({ message: error.message });
    }
};

// Delete product (Admin only)
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully', deletedProduct: product });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: error.message });
    }
};

// Search products
export const searchProducts = async (req, res) => {
    try {
        const { q, category, minPrice, maxPrice, sort } = req.query;
        let query = {};

        if (q) {
            query.$or = [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { detailedDescription: { $regex: q, $options: 'i' } }
            ];
        }

        if (category && category !== 'All') {
            query.category = category;
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'price-low') sortOption = { price: 1 };
        if (sort === 'price-high') sortOption = { price: -1 };
        if (sort === 'rating') sortOption = { rating: -1 };

        const products = await Product.find(query).sort(sortOption);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get product statistics (Admin only)
export const getProductStats = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const inStockProducts = await Product.countDocuments({ inStock: true });
        const outOfStockProducts = await Product.countDocuments({ inStock: false });

        // Get category breakdown
        const categoryStats = await Product.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    avgPrice: { $avg: '$price' },
                    totalValue: { $sum: '$price' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Get price range
        const priceStats = await Product.aggregate([
            {
                $group: {
                    _id: null,
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                    avgPrice: { $avg: '$price' }
                }
            }
        ]);

        // Get recent products
        const recentProducts = await Product.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name category price image createdAt');

        res.json({
            totalProducts,
            inStockProducts,
            outOfStockProducts,
            categoryStats,
            priceStats: priceStats[0] || { minPrice: 0, maxPrice: 0, avgPrice: 0 },
            recentProducts
        });
    } catch (error) {
        console.error('Error fetching product stats:', error);
        res.status(500).json({ message: error.message });
    }
};
