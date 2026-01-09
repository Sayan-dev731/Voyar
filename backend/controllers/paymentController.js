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
// IMPORTANT: This handler expects raw body for signature verification
// Make sure to use express.raw() middleware before this route
export const razorpayWebhook = async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        // Log webhook receipt (sanitized for security)
        console.log(`[Webhook] Received at ${new Date().toISOString()}`);

        // Get the raw body for signature verification
        // If body is a Buffer (from express.raw), convert to string
        let rawBody;
        if (Buffer.isBuffer(req.body)) {
            rawBody = req.body.toString('utf8');
        } else if (typeof req.body === 'string') {
            rawBody = req.body;
        } else {
            rawBody = JSON.stringify(req.body);
        }

        // Parse the body if it's a string
        let event;
        try {
            event = typeof rawBody === 'string' ? JSON.parse(rawBody) : req.body;
        } catch (parseError) {
            console.error('[Webhook] Failed to parse body:', parseError.message);
            return res.status(400).json({ message: 'Invalid JSON body' });
        }

        // Verify webhook signature (REQUIRED in production)
        if (webhookSecret) {
            const signature = req.headers['x-razorpay-signature'];

            if (!signature) {
                console.error('[Webhook] Missing signature header');
                return res.status(400).json({ message: 'Missing webhook signature' });
            }

            // Generate expected signature using HMAC SHA256
            const expectedSignature = crypto
                .createHmac('sha256', webhookSecret)
                .update(rawBody)
                .digest('hex');

            // Use timing-safe comparison to prevent timing attacks
            const isValidSignature = crypto.timingSafeEqual(
                Buffer.from(signature),
                Buffer.from(expectedSignature)
            );

            if (!isValidSignature) {
                console.error('[Webhook] Invalid signature');
                return res.status(400).json({ message: 'Invalid webhook signature' });
            }

            console.log('[Webhook] Signature verified successfully');
        } else {
            console.warn('[Webhook] WARNING: Webhook secret not configured - skipping signature verification');
        }

        const { payload } = event;
        const eventType = event.event;

        console.log(`[Webhook] Processing event: ${eventType}`);

        switch (eventType) {
            // =====================================================
            // PAYMENT EVENTS
            // =====================================================

            case 'payment.authorized': {
                // Payment authorized but not yet captured
                // Useful for manual capture flows
                const payment = payload.payment.entity;
                console.log(`[Webhook] Payment authorized: ${payment.id}`);

                const order = await Order.findOne({ razorpayOrderId: payment.order_id });
                if (order) {
                    order.razorpayPaymentId = payment.id;
                    order.webhookEvents = order.webhookEvents || [];
                    order.webhookEvents.push({
                        event: 'payment.authorized',
                        timestamp: new Date(),
                        paymentId: payment.id
                    });
                    await order.save();
                    console.log(`[Webhook] Order ${order._id} - Payment authorized`);
                }
                break;
            }

            case 'payment.captured': {
                // Payment successfully captured - money received
                const payment = payload.payment.entity;
                console.log(`[Webhook] Payment captured: ${payment.id}`);

                const order = await Order.findOne({ razorpayOrderId: payment.order_id });

                if (order && order.paymentStatus !== 'paid') {
                    order.paymentStatus = 'paid';
                    order.razorpayPaymentId = payment.id;
                    order.status = 'confirmed';
                    order.webhookEvents = order.webhookEvents || [];
                    order.webhookEvents.push({
                        event: 'payment.captured',
                        timestamp: new Date(),
                        paymentId: payment.id,
                        amount: payment.amount / 100
                    });
                    await order.save();

                    console.log(`[Webhook] Order ${order._id} - Payment captured, Amount: ₹${payment.amount / 100}`);

                    // Deduct stock if not already done
                    if (!order.stockReserved) {
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
                        console.log(`[Webhook] Stock deducted for order ${order._id}`);
                    }

                    // Send confirmation email if not already sent
                    if (!order.emailsSent?.orderReceived) {
                        try {
                            await sendOrderReceivedEmail(order.customerEmail, order.customerName, order);
                            order.emailsSent = order.emailsSent || {};
                            order.emailsSent.orderReceived = true;
                            await order.save();
                        } catch (emailError) {
                            console.error('[Webhook] Failed to send confirmation email:', emailError.message);
                        }
                    }
                }
                break;
            }

            case 'payment.failed': {
                // Payment failed
                const payment = payload.payment.entity;
                console.log(`[Webhook] Payment failed: ${payment.id}`);

                const order = await Order.findOne({ razorpayOrderId: payment.order_id });

                if (order) {
                    order.paymentStatus = 'failed';
                    order.status = 'cancelled';
                    order.webhookEvents = order.webhookEvents || [];
                    order.webhookEvents.push({
                        event: 'payment.failed',
                        timestamp: new Date(),
                        paymentId: payment.id,
                        errorCode: payment.error_code,
                        errorDescription: payment.error_description
                    });
                    order.notes = `Payment failed: ${payment.error_description || payment.error_code || 'Unknown error'}`;
                    await order.save();

                    console.log(`[Webhook] Order ${order._id} - Payment failed: ${payment.error_description}`);
                }
                break;
            }

            // =====================================================
            // REFUND EVENTS
            // =====================================================

            case 'refund.created': {
                // Refund initiated
                const refund = payload.refund.entity;
                console.log(`[Webhook] Refund created: ${refund.id}`);

                const order = await Order.findOne({ razorpayPaymentId: refund.payment_id });

                if (order) {
                    order.refundStatus = 'processing';
                    order.refundId = refund.id;
                    order.refundAmount = refund.amount / 100; // Convert paise to rupees
                    order.refundInitiatedAt = new Date();
                    order.refundNotes = `Refund created. Razorpay Refund ID: ${refund.id}`;
                    order.webhookEvents = order.webhookEvents || [];
                    order.webhookEvents.push({
                        event: 'refund.created',
                        timestamp: new Date(),
                        refundId: refund.id,
                        amount: refund.amount / 100
                    });
                    await order.save();

                    console.log(`[Webhook] Order ${order._id} - Refund created: ₹${refund.amount / 100}`);
                }
                break;
            }

            case 'refund.processed': {
                // Refund successfully processed - money returned to customer
                const refund = payload.refund.entity;
                console.log(`[Webhook] Refund processed: ${refund.id}`);

                // Try finding by refundId first, then by paymentId
                let order = await Order.findOne({ refundId: refund.id });
                if (!order) {
                    order = await Order.findOne({ razorpayPaymentId: refund.payment_id });
                }

                if (order) {
                    order.refundStatus = 'completed';
                    order.refundCompletedAt = new Date();
                    order.paymentStatus = 'refunded';
                    order.refundId = refund.id;
                    order.refundNotes = `Refund completed. Amount: ₹${refund.amount / 100}. The amount will be credited to your bank account within 5-7 working days.`;
                    order.webhookEvents = order.webhookEvents || [];
                    order.webhookEvents.push({
                        event: 'refund.processed',
                        timestamp: new Date(),
                        refundId: refund.id,
                        amount: refund.amount / 100
                    });
                    await order.save();
                }
                break;
            }

            case 'refund.failed': {
                // Refund failed
                const refund = payload.refund.entity;
                console.log(`[Webhook] Refund failed: ${refund.id}`);

                let order = await Order.findOne({ refundId: refund.id });
                if (!order) {
                    order = await Order.findOne({ razorpayPaymentId: refund.payment_id });
                }

                if (order) {
                    order.refundStatus = 'failed';
                    order.refundNotes = `Refund failed. Reason: ${refund.notes?.failure_reason || 'Unknown'}`;
                    order.webhookEvents = order.webhookEvents || [];
                    order.webhookEvents.push({
                        event: 'refund.failed',
                        timestamp: new Date(),
                        refundId: refund.id,
                        reason: refund.notes?.failure_reason
                    });
                    await order.save();

                    console.log(`[Webhook] Order ${order._id} - Refund failed: ${refund.notes?.failure_reason}`);
                }
                break;
            }

            case 'refund.speed_changed': {
                // Refund speed changed (normal to instant or vice versa)
                const refund = payload.refund.entity;
                console.log(`[Webhook] Refund speed changed: ${refund.id}`);

                const order = await Order.findOne({ refundId: refund.id });
                if (order) {
                    order.webhookEvents = order.webhookEvents || [];
                    order.webhookEvents.push({
                        event: 'refund.speed_changed',
                        timestamp: new Date(),
                        refundId: refund.id,
                        speed: refund.speed_processed
                    });
                    order.refundNotes = `Refund speed: ${refund.speed_processed}`;
                    await order.save();
                }
                break;
            }

            // =====================================================
            // ORDER EVENTS (Razorpay Orders, not your orders)
            // =====================================================

            case 'order.paid': {
                // Razorpay order fully paid
                const razorpayOrder = payload.order.entity;
                console.log(`[Webhook] Razorpay order paid: ${razorpayOrder.id}`);

                const order = await Order.findOne({ razorpayOrderId: razorpayOrder.id });
                if (order && order.paymentStatus !== 'paid') {
                    order.paymentStatus = 'paid';
                    order.status = 'confirmed';
                    await order.save();
                    console.log(`[Webhook] Order ${order._id} marked as paid via order.paid event`);
                }
                break;
            }

            default:
                console.log(`[Webhook] Unhandled event type: ${eventType}`);
        }

        // Always respond with 200 OK to acknowledge receipt
        // Razorpay will retry if it doesn't receive 2xx response
        res.status(200).json({ status: 'ok', event: eventType });

    } catch (error) {
        console.error('[Webhook] Error processing webhook:', error);
        // Still return 200 to prevent Razorpay from retrying indefinitely
        // Log the error for investigation
        res.status(200).json({ status: 'error', message: 'Internal processing error' });
    }
};

// Cash on Delivery (COD) order handler
export const createCODOrder = async (req, res) => {
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

        // Create order with COD payment method
        const order = new Order({
            userId,
            customerName,
            customerEmail,
            customerPhone,
            items,
            totalAmount,
            shippingAddress,
            paymentMethod: 'cod',
            paymentStatus: 'pending',
            status: 'confirmed',
            paymentId: 'COD_' + Date.now(),
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
        console.error('Error creating COD order:', error);
        res.status(500).json({ message: error.message || 'Failed to create order' });
    }
};

// Initiate Razorpay refund
export const initiateRefund = async (order) => {
    try {
        // Only process refund for razorpay payments that were paid
        if (order.paymentMethod !== 'razorpay' || order.paymentStatus !== 'paid') {
            return {
                success: false,
                message: 'Refund not applicable for this payment method or payment status'
            };
        }

        // Check if refund already initiated
        if (order.refundStatus === 'processing' || order.refundStatus === 'completed') {
            return {
                success: false,
                message: 'Refund already initiated or completed'
            };
        }

        if (!order.razorpayPaymentId) {
            return {
                success: false,
                message: 'Payment ID not found for refund'
            };
        }

        const razorpayInstance = getRazorpayInstance();

        // Create refund with full amount (in paise)
        const refundOptions = {
            speed: 'normal', // normal speed refund (5-7 working days)
            notes: {
                orderId: order._id.toString(),
                reason: 'Order cancelled',
                customerEmail: order.customerEmail
            }
        };

        const refund = await razorpayInstance.payments.refund(
            order.razorpayPaymentId,
            {
                amount: Math.round(order.totalAmount * 100), // Amount in paise
                ...refundOptions
            }
        );

        // Update order with refund details
        order.refundStatus = 'processing';
        order.refundId = refund.id;
        order.refundAmount = order.totalAmount;
        order.refundInitiatedAt = new Date();
        order.refundNotes = `Refund initiated. Expected to complete in 5-7 working days. Refund ID: ${refund.id}`;
        await order.save();

        return {
            success: true,
            refundId: refund.id,
            message: 'Refund initiated successfully. It will be processed in 5-7 working days.'
        };

    } catch (error) {
        console.error('Error initiating refund:', error);

        // Update order with failure details
        order.refundStatus = 'failed';
        order.refundNotes = `Refund failed: ${error.message || 'Unknown error'}`;
        await order.save();

        return {
            success: false,
            message: error.message || 'Failed to initiate refund'
        };
    }
};

// Get refund status - READ ONLY, does not update database
// Database updates should happen ONLY via webhooks
export const getRefundStatus = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (!order.refundId) {
            return res.json({
                success: true,
                refundStatus: order.refundStatus || 'not_applicable',
                message: 'No refund initiated for this order'
            });
        }

        // Fetch latest refund status from Razorpay
        const razorpayInstance = getRazorpayInstance();
        const refund = await razorpayInstance.refunds.fetch(order.refundId);

        // Map Razorpay status to our display status
        // Razorpay statuses: 'pending', 'processed', 'failed'
        // Our statuses: 'pending', 'processing', 'completed', 'failed'
        let displayStatus = order.refundStatus;
        let statusMessage = order.refundNotes;

        // Use Razorpay's actual status for accurate display
        if (refund.status === 'processed') {
            displayStatus = 'completed';
            statusMessage = `Refund completed. Amount: ₹${refund.amount / 100}. The amount will be credited to your bank account within 5-7 working days.`;
        } else if (refund.status === 'pending') {
            displayStatus = 'processing';
            statusMessage = 'Refund is being processed by Razorpay. This usually takes 5-7 working days.';
        } else if (refund.status === 'failed') {
            displayStatus = 'failed';
            statusMessage = `Refund failed: ${refund.notes?.failure_reason || 'Please check Razorpay dashboard'}`;
        }

        // Log if there's a mismatch between DB and Razorpay (webhook might have failed)
        if (refund.status === 'processed' && order.refundStatus !== 'completed') {
            console.log(`[Warning] Razorpay shows refund ${refund.id} as processed but DB shows ${order.refundStatus}. Webhook may have failed.`);
        }

        res.json({
            success: true,
            refundStatus: displayStatus,           // Display status based on Razorpay's actual status
            razorpayStatus: refund.status,         // Live from Razorpay
            databaseStatus: order.refundStatus,    // From our database (for debugging)
            refundId: order.refundId,
            refundAmount: refund.amount / 100,     // Use Razorpay's amount for accuracy
            refundInitiatedAt: order.refundInitiatedAt,
            refundCompletedAt: refund.status === 'processed' ? (order.refundCompletedAt || new Date()) : null,
            message: statusMessage,
            // Include webhook info for debugging
            webhookReceived: order.webhookEvents?.some(e => e.event === 'refund.processed') || false
        });

    } catch (error) {
        console.error('Error fetching refund status:', error);
        res.status(500).json({ message: error.message || 'Failed to fetch refund status' });
    }
};
