import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { sendBillEmail } from '../config/email.js';

// Create new order
export const createOrder = async (req, res) => {
    try {
        const { items } = req.body;

        // Validate stock availability for all items
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: `Product not found: ${item.productName}` });
            }

            // Check if product has color variants
            if (item.selectedColor && product.colors && product.colors.length > 0) {
                const colorVariant = product.colors.find(c => c.name === item.selectedColor);
                if (colorVariant) {
                    if (colorVariant.quantity < item.quantity) {
                        return res.status(400).json({
                            message: `Insufficient stock for ${product.name} (${item.selectedColor}). Available: ${colorVariant.quantity}`,
                            insufficientStock: true,
                            productId: product._id,
                            availableStock: colorVariant.quantity
                        });
                    }
                }
            } else {
                // Check main product stock
                if (product.stock < item.quantity) {
                    return res.status(400).json({
                        message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
                        insufficientStock: true,
                        productId: product._id,
                        availableStock: product.stock
                    });
                }
            }
        }

        // Reduce stock for all items
        for (const item of items) {
            const product = await Product.findById(item.product);

            if (item.selectedColor && product.colors && product.colors.length > 0) {
                // Reduce color variant quantity
                const colorIndex = product.colors.findIndex(c => c.name === item.selectedColor);
                if (colorIndex !== -1) {
                    product.colors[colorIndex].quantity -= item.quantity;
                }
                // Update inStock based on all color variants
                const totalColorStock = product.colors.reduce((sum, c) => sum + c.quantity, 0);
                product.inStock = totalColorStock > 0;
            } else {
                // Reduce main stock
                product.stock -= item.quantity;
                product.inStock = product.stock > 0;
            }

            await product.save();
        }

        const order = new Order(req.body);
        const savedOrder = await order.save();
        res.status(201).json(savedOrder);
    } catch (error) {
        console.error('Create order error:', error);
        res.status(400).json({ message: error.message });
    }
};

// Get user's orders
export const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id })
            .populate('items.product')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all orders (Admin only)
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('items.product')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single order
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('items.product');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update order status (Admin only)
export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete order (Admin only)
export const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get order statistics (Admin only)
export const getOrderStats = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        const completedOrders = await Order.countDocuments({ status: 'delivered' });

        const revenueResult = await Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueResult[0]?.total || 0;

        res.json({
            totalOrders,
            pendingOrders,
            completedOrders,
            totalRevenue
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Generate and send bill (Admin only)
export const generateBill = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('items.product');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Send bill email to customer
        await sendBillEmail(order.customerEmail, order.customerName, order);

        res.json({
            message: 'Bill generated and sent successfully',
            orderId: order._id
        });
    } catch (error) {
        console.error('Error generating bill:', error);
        res.status(500).json({ message: error.message || 'Failed to generate bill' });
    }
};
