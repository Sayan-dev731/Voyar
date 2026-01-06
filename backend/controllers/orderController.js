import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { sendBillEmail, sendOrderReceivedEmail, sendOrderStatusEmail } from '../config/email.js';
import { initiateRefund } from './paymentController.js';

// Create new order (legacy - use payment controller for Razorpay)
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

        const order = new Order({
            ...req.body,
            stockReserved: true,
            stockDeductedAt: new Date()
        });
        const savedOrder = await order.save();

        // Send order confirmation email
        try {
            await sendOrderReceivedEmail(savedOrder.customerEmail, savedOrder.customerName, savedOrder);
            savedOrder.emailsSent = savedOrder.emailsSent || {};
            savedOrder.emailsSent.orderReceived = true;
            await savedOrder.save();
        } catch (emailError) {
            console.error('Failed to send order confirmation email:', emailError);
        }

        res.status(201).json(savedOrder);
    } catch (error) {
        console.error('Create order error:', error);
        res.status(400).json({ message: error.message });
    }
};

// Get user's orders
export const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            userId: req.user.id,
            hiddenFromUser: { $ne: true }  // Exclude soft-deleted orders
        })
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
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const previousStatus = order.status;
        order.status = status;

        let refundResult = null;

        // Handle stock restoration for cancelled orders
        if (status === 'cancelled' && previousStatus !== 'cancelled' && order.stockReserved) {
            // Restore stock
            for (const item of order.items) {
                const product = await Product.findById(item.product);
                if (!product) continue;

                if (item.selectedColor && product.colors && product.colors.length > 0) {
                    const colorIndex = product.colors.findIndex(c => c.name === item.selectedColor);
                    if (colorIndex !== -1) {
                        product.colors[colorIndex].quantity += item.quantity;
                    }
                    const totalColorStock = product.colors.reduce((sum, c) => sum + c.quantity, 0);
                    product.inStock = totalColorStock > 0;
                } else {
                    product.stock += item.quantity;
                    product.inStock = true;
                }
                await product.save();
            }
            order.stockReserved = false;

            // Initiate refund for Razorpay payments
            if (order.paymentMethod === 'razorpay' && order.paymentStatus === 'paid') {
                refundResult = await initiateRefund(order);
            }
        }

        await order.save();

        // Send status update email
        try {
            await sendOrderStatusEmail(order.customerEmail, order.customerName, order, status);

            // Track email sent
            if (!order.emailsSent) order.emailsSent = {};
            const emailKey = `order${status.charAt(0).toUpperCase() + status.slice(1)}`;
            order.emailsSent[emailKey] = true;
            await order.save();
        } catch (emailError) {
            console.error('Failed to send order status email:', emailError);
        }

        // If status is confirmed and bill not sent, auto-generate bill
        if (status === 'confirmed' && !order.emailsSent?.billGenerated) {
            try {
                await sendBillEmail(order.customerEmail, order.customerName, order);
                order.emailsSent.billGenerated = true;
                await order.save();
            } catch (emailError) {
                console.error('Failed to send bill email:', emailError);
            }
        }

        // Include refund information in response
        const response = {
            ...order.toObject(),
            refundInfo: refundResult
        };

        res.json(response);
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

// Cancel order (User only - before shipped)
export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Verify user owns this order
        if (order.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to cancel this order' });
        }

        // Can only cancel if status is pending or processing or confirmed
        if (!['pending', 'processing', 'confirmed'].includes(order.status)) {
            return res.status(400).json({
                message: 'Order cannot be cancelled. Only pending, processing, or confirmed orders can be cancelled.'
            });
        }

        const previousStatus = order.status;
        order.status = 'cancelled';

        let refundResult = null;

        // Restore stock if it was reserved
        if (order.stockReserved) {
            for (const item of order.items) {
                const product = await Product.findById(item.product);
                if (!product) continue;

                if (item.selectedColor && product.colors && product.colors.length > 0) {
                    const colorIndex = product.colors.findIndex(c => c.name === item.selectedColor);
                    if (colorIndex !== -1) {
                        product.colors[colorIndex].quantity += item.quantity;
                    }
                    const totalColorStock = product.colors.reduce((sum, c) => sum + c.quantity, 0);
                    product.inStock = totalColorStock > 0;
                } else {
                    product.stock += item.quantity;
                    product.inStock = true;
                }
                await product.save();
            }
            order.stockReserved = false;
        }

        // Initiate refund for Razorpay payments
        if (order.paymentMethod === 'razorpay' && order.paymentStatus === 'paid') {
            refundResult = await initiateRefund(order);
        }

        await order.save();

        // Send cancellation email
        try {
            await sendOrderStatusEmail(order.customerEmail, order.customerName, order, 'cancelled');
        } catch (emailError) {
            console.error('Failed to send cancellation email:', emailError);
        }

        // Build response message
        let responseMessage = 'Order cancelled successfully';
        if (refundResult && refundResult.success) {
            responseMessage += '. Refund initiated and will be processed in 5-7 working days.';
        }

        res.json({
            message: responseMessage,
            order,
            refundInfo: refundResult
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// User delete order (soft delete - hides from user but keeps in admin)
export const userDeleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Verify user owns this order
        if (order.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this order' });
        }

        // Can only delete after delivery
        if (order.status !== 'delivered' && order.status !== 'cancelled') {
            return res.status(400).json({
                message: 'Order can only be removed from your history after delivery or if cancelled.'
            });
        }

        // Soft delete - mark as hidden from user but keep in system
        order.hiddenFromUser = true;
        await order.save();

        res.json({ message: 'Order removed from your order history' });
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
