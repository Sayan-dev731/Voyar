import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { sendOrderReceivedEmail, sendOrderStatusEmail } from '../config/email.js';

// Load environment variables
dotenv.config();

// Initialize Razorpay instance lazily
let razorpay = null;
const getRazorpayInstance = () => {
    if (!razorpay) {
        if (!process.env.Live_Key_ID || !process.env.Live_Key_Secret) {
            throw new Error('Razorpay credentials not found in environment variables');
        }
        razorpay = new Razorpay({
            key_id: process.env.Live_Key_ID,
            key_secret: process.env.Live_Key_Secret
        });
    }
    return razorpay;
};

// Generate payment token
const generatePaymentToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Create Razorpay order
export const createRazorpayOrder = async (req, res) => {
    try {
        const { items, totalAmount, customerName, customerEmail, customerPhone, shippingAddress, userId } = req.body;

        // Validate stock availability for all items
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: `Product not found: ${item.productName}` });
            }

            if (item.selectedColor && product.colors && product.colors.length > 0) {
                const colorVariant = product.colors.find(c => c.name === item.selectedColor);
                if (colorVariant && colorVariant.quantity < item.quantity) {
                    return res.status(400).json({
                        message: `Insufficient stock for ${product.name} (${item.selectedColor}). Available: ${colorVariant.quantity}`,
                        insufficientStock: true,
                        productId: product._id,
                        availableStock: colorVariant.quantity
                    });
                }
            } else {
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

        // Create Razorpay order
        const razorpayOrderOptions = {
            amount: Math.round(totalAmount * 100), // Amount in paise
            currency: 'INR',
            receipt: `order_${Date.now()}`,
            notes: {
                customerEmail,
                customerName
            }
        };

        const razorpayInstance = getRazorpayInstance();
        const razorpayOrder = await razorpayInstance.orders.create(razorpayOrderOptions);

        // Generate payment token (valid for 30 minutes)
        const paymentToken = generatePaymentToken();
        const paymentTokenExpires = new Date(Date.now() + 30 * 60 * 1000);

        // Create order in database with pending status
        const order = new Order({
            userId,
            customerName,
            customerEmail,
            customerPhone,
            items,
            totalAmount,
            shippingAddress,
            paymentMethod: 'razorpay',
            paymentStatus: 'pending',
            status: 'pending',
            razorpayOrderId: razorpayOrder.id,
            paymentToken,
            paymentTokenExpires,
            stockReserved: false
        });

        await order.save();

        res.status(201).json({
            success: true,
            orderId: order._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.Live_Key_ID,
            paymentToken
        });

    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ message: error.message || 'Failed to create payment order' });
    }
};

// Verify Razorpay payment
export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId
        } = req.body;

        // Generate signature for verification
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.Live_Key_Secret)
            .update(body.toString())
            .digest('hex');

        const isValidSignature = expectedSignature === razorpay_signature;

        if (!isValidSignature) {
            // Payment failed - signature mismatch
            await Order.findByIdAndUpdate(orderId, {
                paymentStatus: 'failed',
                status: 'cancelled'
            });

            return res.status(400).json({
                success: false,
                message: 'Payment verification failed'
            });
        }

        // Find the order
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Update order with payment details
        order.razorpayPaymentId = razorpay_payment_id;
        order.razorpaySignature = razorpay_signature;
        order.paymentId = razorpay_payment_id;
        order.paymentStatus = 'paid';
        order.status = 'confirmed';

        // Deduct stock
        for (const item of order.items) {
            const product = await Product.findById(item.product);
            if (!product) continue;

            if (item.selectedColor && product.colors && product.colors.length > 0) {
                const colorIndex = product.colors.findIndex(c => c.name === item.selectedColor);
                if (colorIndex !== -1) {
                    product.colors[colorIndex].quantity -= item.quantity;
                }
                const totalColorStock = product.colors.reduce((sum, c) => sum + c.quantity, 0);
                product.inStock = totalColorStock > 0;
            } else {
                product.stock -= item.quantity;
                product.inStock = product.stock > 0;
            }

            await product.save();
        }

        order.stockReserved = true;
        order.stockDeductedAt = new Date();
        await order.save();

        // Send order confirmation email
        try {
            await sendOrderReceivedEmail(order.customerEmail, order.customerName, order);
            order.emailsSent.orderReceived = true;
            await order.save();
        } catch (emailError) {
            console.error('Failed to send order confirmation email:', emailError);
        }

        res.json({
            success: true,
            message: 'Payment verified successfully',
            orderId: order._id,
            order: {
                _id: order._id,
                status: order.status,
                paymentStatus: order.paymentStatus,
                totalAmount: order.totalAmount
            }
        });

    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: error.message || 'Payment verification failed' });
    }
};

// Handle payment failure
export const handlePaymentFailure = async (req, res) => {
    try {
        const { orderId, razorpay_order_id, reason } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Update order status to failed
        order.paymentStatus = 'failed';
        order.status = 'cancelled';
        order.notes = reason || 'Payment failed';
        await order.save();

        // No stock was deducted for failed payments, so no restoration needed

        res.json({
            success: true,
            message: 'Payment failure recorded',
            orderId: order._id
        });

    } catch (error) {
        console.error('Error handling payment failure:', error);
        res.status(500).json({ message: error.message || 'Failed to handle payment failure' });
    }
};

// Get order by payment token (for order status page)
export const getOrderByToken = async (req, res) => {
    try {
        const { token } = req.params;

        const order = await Order.findOne({
            paymentToken: token,
            paymentTokenExpires: { $gt: new Date() }
        }).populate('items.product');

        if (!order) {
            return res.status(404).json({ message: 'Order not found or token expired' });
        }

        res.json({
            success: true,
            order: {
                _id: order._id,
                status: order.status,
                paymentStatus: order.paymentStatus,
                totalAmount: order.totalAmount,
                items: order.items,
                createdAt: order.createdAt
            }
        });

    } catch (error) {
        console.error('Error fetching order by token:', error);
        res.status(500).json({ message: error.message || 'Failed to fetch order' });
    }
};

// Razorpay webhook handler
export const razorpayWebhook = async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        // Verify webhook signature if secret is configured
        if (webhookSecret) {
            const signature = req.headers['x-razorpay-signature'];
            const body = JSON.stringify(req.body);

            const expectedSignature = crypto
                .createHmac('sha256', webhookSecret)
                .update(body)
                .digest('hex');

            if (signature !== expectedSignature) {
                return res.status(400).json({ message: 'Invalid webhook signature' });
            }
        }

        const event = req.body;
        const { payload } = event;

        switch (event.event) {
            case 'payment.captured': {
                const payment = payload.payment.entity;
                const order = await Order.findOne({ razorpayOrderId: payment.order_id });

                if (order && order.paymentStatus !== 'paid') {
                    order.paymentStatus = 'paid';
                    order.razorpayPaymentId = payment.id;
                    order.status = 'confirmed';
                    await order.save();
                }
                break;
            }

            case 'payment.failed': {
                const payment = payload.payment.entity;
                const order = await Order.findOne({ razorpayOrderId: payment.order_id });

                if (order) {
                    order.paymentStatus = 'failed';
                    order.status = 'cancelled';
                    await order.save();
                }
                break;
            }

            case 'refund.created': {
                const refund = payload.refund.entity;
                const order = await Order.findOne({ razorpayPaymentId: refund.payment_id });

                if (order) {
                    order.paymentStatus = 'refunded';
                    await order.save();
                }
                break;
            }
        }

        res.json({ status: 'ok' });

    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Demo payment handler (for testing without Razorpay)
export const createDemoOrder = async (req, res) => {
    try {
        const { items, totalAmount, customerName, customerEmail, customerPhone, shippingAddress, userId } = req.body;

        // Validate stock availability
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: `Product not found: ${item.productName}` });
            }

            if (item.selectedColor && product.colors && product.colors.length > 0) {
                const colorVariant = product.colors.find(c => c.name === item.selectedColor);
                if (colorVariant && colorVariant.quantity < item.quantity) {
                    return res.status(400).json({
                        message: `Insufficient stock for ${product.name} (${item.selectedColor}). Available: ${colorVariant.quantity}`,
                        insufficientStock: true
                    });
                }
            } else if (product.stock < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
                    insufficientStock: true
                });
            }
        }

        // Deduct stock
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) continue;

            if (item.selectedColor && product.colors && product.colors.length > 0) {
                const colorIndex = product.colors.findIndex(c => c.name === item.selectedColor);
                if (colorIndex !== -1) {
                    product.colors[colorIndex].quantity -= item.quantity;
                }
                const totalColorStock = product.colors.reduce((sum, c) => sum + c.quantity, 0);
                product.inStock = totalColorStock > 0;
            } else {
                product.stock -= item.quantity;
                product.inStock = product.stock > 0;
            }
            await product.save();
        }

        // Create order
        const order = new Order({
            userId,
            customerName,
            customerEmail,
            customerPhone,
            items,
            totalAmount,
            shippingAddress,
            paymentMethod: 'demo',
            paymentStatus: 'paid',
            status: 'confirmed',
            paymentId: 'DEMO_' + Date.now(),
            stockReserved: true,
            stockDeductedAt: new Date()
        });

        await order.save();

        // Send order confirmation email
        try {
            await sendOrderReceivedEmail(customerEmail, customerName, order);
            order.emailsSent.orderReceived = true;
            await order.save();
        } catch (emailError) {
            console.error('Failed to send order confirmation email:', emailError);
        }

        res.status(201).json({
            success: true,
            orderId: order._id,
            order
        });

    } catch (error) {
        console.error('Error creating demo order:', error);
        res.status(500).json({ message: error.message || 'Failed to create order' });
    }
};
