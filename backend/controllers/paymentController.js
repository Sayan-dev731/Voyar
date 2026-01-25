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

// Helper function to add timeline event
const addTimelineEvent = (order, eventType, title, description, details = {}, completed = true) => {
    order.paymentTimeline = order.paymentTimeline || [];

    // Check if event already exists (avoid duplicates)
    const existingEvent = order.paymentTimeline.find(e =>
        e.event === eventType &&
        e.details?.paymentId === details.paymentId &&
        e.details?.refundId === details.refundId
    );

    if (!existingEvent) {
        order.paymentTimeline.push({
            event: eventType,
            title,
            description,
            timestamp: new Date(),
            completed,
            details
        });
    }
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
                    product.colors[colorIndex].quantity = Math.max(0, product.colors[colorIndex].quantity - item.quantity);
                    product.colors[colorIndex].inStock = product.colors[colorIndex].quantity > 0;
                }
                const totalColorStock = product.colors.reduce((sum, c) => sum + c.quantity, 0);
                product.stock = totalColorStock;
                product.inStock = totalColorStock > 0;
            } else {
                product.stock = Math.max(0, product.stock - item.quantity);
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

        // Helper function to find order
        const findOrderByPayment = async (payment) => {
            let order = await Order.findOne({ razorpayOrderId: payment.order_id });
            if (!order && payment.id) {
                order = await Order.findOne({ razorpayPaymentId: payment.id });
            }
            return order;
        };

        const findOrderByRefund = async (refund) => {
            let order = await Order.findOne({ refundId: refund.id });
            if (!order) {
                order = await Order.findOne({ razorpayPaymentId: refund.payment_id });
            }
            return order;
        };

        switch (eventType) {
            // =====================================================
            // PAYMENT EVENTS
            // =====================================================

            case 'payment.authorized': {
                // Payment authorized but not yet captured
                const payment = payload.payment.entity;
                console.log(`[Webhook] Payment authorized: ${payment.id}`);

                const order = await findOrderByPayment(payment);
                if (order) {
                    order.razorpayPaymentId = payment.id;
                    order.webhookEvents = order.webhookEvents || [];
                    order.webhookEvents.push({
                        event: 'payment.authorized',
                        timestamp: new Date(),
                        paymentId: payment.id,
                        amount: payment.amount / 100
                    });

                    // Add to payment timeline - Payment Created
                    addTimelineEvent(order, 'payment_created', 'Payment created', null, {
                        paymentId: payment.id,
                        amount: payment.amount / 100,
                        method: payment.method,
                        bank: payment.bank,
                        vpa: payment.vpa,
                        wallet: payment.wallet,
                        cardLast4: payment.card?.last4
                    });

                    // Add to payment timeline - Payment Authorized
                    addTimelineEvent(order, 'payment_authorized', 'Payment authorized', null, {
                        paymentId: payment.id,
                        amount: payment.amount / 100
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

                const order = await findOrderByPayment(payment);

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

                    // Add timeline events if not already present (in case authorized was missed)
                    addTimelineEvent(order, 'payment_created', 'Payment created', null, {
                        paymentId: payment.id,
                        amount: payment.amount / 100,
                        method: payment.method,
                        bank: payment.bank,
                        vpa: payment.vpa,
                        wallet: payment.wallet,
                        cardLast4: payment.card?.last4
                    });

                    addTimelineEvent(order, 'payment_authorized', 'Payment authorized', null, {
                        paymentId: payment.id,
                        amount: payment.amount / 100
                    });

                    // Add payment captured event
                    addTimelineEvent(order, 'payment_captured', 'Payment captured', null, {
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
                                    product.colors[colorIndex].quantity = Math.max(0, product.colors[colorIndex].quantity - item.quantity);
                                    product.colors[colorIndex].inStock = product.colors[colorIndex].quantity > 0;
                                }
                                const totalColorStock = product.colors.reduce((sum, c) => sum + c.quantity, 0);
                                product.stock = totalColorStock;
                                product.inStock = totalColorStock > 0;
                            } else {
                                product.stock = Math.max(0, product.stock - item.quantity);
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

                const order = await findOrderByPayment(payment);

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

                    // Add failed event to timeline
                    addTimelineEvent(order, 'payment_failed', 'Payment failed',
                        payment.error_description || payment.error_code || 'Payment could not be processed', {
                        paymentId: payment.id,
                        errorCode: payment.error_code,
                        errorDescription: payment.error_description
                    });

                    await order.save();

                    console.log(`[Webhook] Order ${order._id} - Payment failed: ${payment.error_description}`);
                }
                break;
            }

            // =====================================================
            // PAYMENT DISPUTE EVENTS
            // =====================================================

            case 'payment.dispute.created': {
                const dispute = payload.dispute?.entity || payload.payment?.entity;
                const paymentId = dispute.payment_id || dispute.id;
                console.log(`[Webhook] Payment dispute created: ${paymentId}`);

                const order = await Order.findOne({ razorpayPaymentId: paymentId });
                if (order) {
                    order.webhookEvents = order.webhookEvents || [];
                    order.webhookEvents.push({
                        event: 'payment.dispute.created',
                        timestamp: new Date(),
                        paymentId: paymentId,
                        reason: dispute.reason || 'Dispute raised'
                    });
                    order.adminNotes = (order.adminNotes || '') + `\n⚠️ DISPUTE CREATED on ${new Date().toISOString()}: ${dispute.reason || 'Customer dispute'}`;
                    await order.save();
                    console.log(`[Webhook] Order ${order._id} - Dispute created`);
                }
                break;
            }

            case 'payment.dispute.won': {
                const dispute = payload.dispute?.entity || payload.payment?.entity;
                const paymentId = dispute.payment_id || dispute.id;
                console.log(`[Webhook] Payment dispute won: ${paymentId}`);

                const order = await Order.findOne({ razorpayPaymentId: paymentId });
                if (order) {
                    order.webhookEvents = order.webhookEvents || [];
                    order.webhookEvents.push({
                        event: 'payment.dispute.won',
                        timestamp: new Date(),
                        paymentId: paymentId
                    });
                    order.adminNotes = (order.adminNotes || '') + `\n✅ DISPUTE WON on ${new Date().toISOString()}`;
                    await order.save();
                    console.log(`[Webhook] Order ${order._id} - Dispute won`);
                }
                break;
            }

            case 'payment.dispute.lost': {
                const dispute = payload.dispute?.entity || payload.payment?.entity;
                const paymentId = dispute.payment_id || dispute.id;
                console.log(`[Webhook] Payment dispute lost: ${paymentId}`);

                const order = await Order.findOne({ razorpayPaymentId: paymentId });
                if (order) {
                    order.paymentStatus = 'refunded';
                    order.refundStatus = 'completed';
                    order.refundNotes = 'Refund due to dispute lost';
                    order.webhookEvents = order.webhookEvents || [];
                    order.webhookEvents.push({
                        event: 'payment.dispute.lost',
                        timestamp: new Date(),
                        paymentId: paymentId
                    });
                    order.adminNotes = (order.adminNotes || '') + `\n❌ DISPUTE LOST on ${new Date().toISOString()} - Payment refunded to customer`;
                    await order.save();
                    console.log(`[Webhook] Order ${order._id} - Dispute lost, payment refunded`);
                }
                break;
            }

            case 'payment.dispute.closed': {
                const dispute = payload.dispute?.entity || payload.payment?.entity;
                const paymentId = dispute.payment_id || dispute.id;
                console.log(`[Webhook] Payment dispute closed: ${paymentId}`);

                const order = await Order.findOne({ razorpayPaymentId: paymentId });
                if (order) {
                    order.webhookEvents = order.webhookEvents || [];
                    order.webhookEvents.push({
                        event: 'payment.dispute.closed',
                        timestamp: new Date(),
                        paymentId: paymentId
                    });
                    order.adminNotes = (order.adminNotes || '') + `\nDispute closed on ${new Date().toISOString()}`;
                    await order.save();
                }
                break;
            }

            case 'payment.dispute.under_review': {
                const dispute = payload.dispute?.entity || payload.payment?.entity;
                const paymentId = dispute.payment_id || dispute.id;
                console.log(`[Webhook] Payment dispute under review: ${paymentId}`);

                const order = await Order.findOne({ razorpayPaymentId: paymentId });
                if (order) {
                    order.webhookEvents = order.webhookEvents || [];
                    order.webhookEvents.push({
                        event: 'payment.dispute.under_review',
                        timestamp: new Date(),
                        paymentId: paymentId
                    });
                    order.adminNotes = (order.adminNotes || '') + `\n🔍 Dispute under review on ${new Date().toISOString()}`;
                    await order.save();
                }
                break;
            }

            case 'payment.dispute.action_required': {
                const dispute = payload.dispute?.entity || payload.payment?.entity;
                const paymentId = dispute.payment_id || dispute.id;
                console.log(`[Webhook] Payment dispute action required: ${paymentId}`);

                const order = await Order.findOne({ razorpayPaymentId: paymentId });
                if (order) {
                    order.webhookEvents = order.webhookEvents || [];
                    order.webhookEvents.push({
                        event: 'payment.dispute.action_required',
                        timestamp: new Date(),
                        paymentId: paymentId
                    });
                    order.adminNotes = (order.adminNotes || '') + `\n🚨 DISPUTE ACTION REQUIRED on ${new Date().toISOString()} - Check Razorpay dashboard`;
                    await order.save();
                    console.log(`[Webhook] Order ${order._id} - Dispute action required`);
                }
                break;
            }

            // =====================================================
            // PAYMENT DOWNTIME EVENTS
            // =====================================================

            case 'payment.downtime.started':
            case 'payment.downtime.updated':
            case 'payment.downtime.resolved': {
                // These are system-level events, just log them
                console.log(`[Webhook] Payment downtime event: ${eventType}`);
                break;
            }

            // =====================================================
            // REFUND EVENTS
            // =====================================================

            case 'refund.created': {
                const refund = payload.refund.entity;
                console.log(`[Webhook] Refund created: ${refund.id}`);

                const order = await findOrderByRefund(refund);

                if (order) {
                    order.refundStatus = 'processing';
                    order.refundId = refund.id;
                    order.refundAmount = refund.amount / 100;
                    order.refundInitiatedAt = new Date();
                    order.refundNotes = `Refund created. Razorpay Refund ID: ${refund.id}. Speed: ${refund.speed_requested || 'normal'}`;
                    order.webhookEvents = order.webhookEvents || [];
                    order.webhookEvents.push({
                        event: 'refund.created',
                        timestamp: new Date(),
                        refundId: refund.id,
                        amount: refund.amount / 100,
                        speed: refund.speed_requested
                    });

                    // Add to payment timeline
                    addTimelineEvent(order, 'refund_created', 'Refund initiated',
                        `Refund of ₹${refund.amount / 100} has been initiated`, {
                        refundId: refund.id,
                        amount: refund.amount / 100
                    }, false); // Not completed yet

                    await order.save();

                    console.log(`[Webhook] Order ${order._id} - Refund created: ₹${refund.amount / 100}`);
                }
                break;
            }

            case 'refund.processed': {
                const refund = payload.refund.entity;
                console.log(`[Webhook] Refund processed: ${refund.id}`);

                const order = await findOrderByRefund(refund);

                if (order) {
                    order.refundStatus = 'completed';
                    order.refundCompletedAt = new Date();
                    order.paymentStatus = 'refunded';
                    order.refundId = refund.id;
                    order.refundAmount = refund.amount / 100;
                    order.refundNotes = `✅ Refund completed. Amount: ₹${refund.amount / 100}. The amount has been credited to customer's account.`;
                    order.webhookEvents = order.webhookEvents || [];
                    order.webhookEvents.push({
                        event: 'refund.processed',
                        timestamp: new Date(),
                        refundId: refund.id,
                        amount: refund.amount / 100,
                        speed: refund.speed_processed
                    });

                    // Add to payment timeline - Refund Processed
                    addTimelineEvent(order, 'refund_processed', 'Refund',
                        `Amount: ₹${refund.amount / 100}`, {
                        refundId: refund.id,
                        amount: refund.amount / 100,
                        arn: refund.acquirer_data?.arn
                    });

                    // Mark refund_created as completed if it exists
                    const createdEvent = order.paymentTimeline?.find(e => e.event === 'refund_created');
                    if (createdEvent) {
                        createdEvent.completed = true;
                    }

                    await order.save();
                    console.log(`[Webhook] Order ${order._id} - Refund processed successfully: ₹${refund.amount / 100}`);
                }
                break;
            }

            case 'refund.failed': {
                const refund = payload.refund.entity;
                console.log(`[Webhook] Refund failed: ${refund.id}`);

                const order = await findOrderByRefund(refund);

                if (order) {
                    order.refundStatus = 'failed';
                    const failureReason = refund.notes?.failure_reason || refund.failure_reason || 'Unknown reason';
                    order.refundNotes = `❌ Refund failed. Reason: ${failureReason}. Please contact support.`;
                    order.webhookEvents = order.webhookEvents || [];
                    order.webhookEvents.push({
                        event: 'refund.failed',
                        timestamp: new Date(),
                        refundId: refund.id,
                        reason: failureReason
                    });
                    order.adminNotes = (order.adminNotes || '') + `\n❌ Refund ${refund.id} failed on ${new Date().toISOString()}: ${failureReason}`;

                    // Add to payment timeline
                    addTimelineEvent(order, 'refund_failed', 'Refund failed', failureReason, {
                        refundId: refund.id,
                        errorDescription: failureReason
                    });

                    await order.save();

                    console.log(`[Webhook] Order ${order._id} - Refund failed: ${failureReason}`);
                }
                break;
            }

            case 'refund.speed_changed': {
                const refund = payload.refund.entity;
                console.log(`[Webhook] Refund speed changed: ${refund.id}`);

                const order = await findOrderByRefund(refund);
                if (order) {
                    order.webhookEvents = order.webhookEvents || [];
                    order.webhookEvents.push({
                        event: 'refund.speed_changed',
                        timestamp: new Date(),
                        refundId: refund.id,
                        speed: refund.speed_processed
                    });
                    order.refundNotes = `Refund speed changed to: ${refund.speed_processed}`;
                    await order.save();
                }
                break;
            }

            // =====================================================
            // ORDER EVENTS (Razorpay Orders)
            // =====================================================

            case 'order.paid': {
                const razorpayOrder = payload.order.entity;
                console.log(`[Webhook] Razorpay order paid: ${razorpayOrder.id}`);

                const order = await Order.findOne({ razorpayOrderId: razorpayOrder.id });
                if (order && order.paymentStatus !== 'paid') {
                    order.paymentStatus = 'paid';
                    order.status = 'confirmed';
                    order.webhookEvents = order.webhookEvents || [];
                    order.webhookEvents.push({
                        event: 'order.paid',
                        timestamp: new Date(),
                        amount: razorpayOrder.amount / 100
                    });
                    await order.save();
                    console.log(`[Webhook] Order ${order._id} marked as paid via order.paid event`);
                }
                break;
            }

            case 'order.notification.delivered':
            case 'order.notification.failed': {
                // Notification events - just log
                console.log(`[Webhook] Order notification event: ${eventType}`);
                break;
            }

            // =====================================================
            // INVOICE EVENTS
            // =====================================================

            case 'invoice.paid': {
                console.log(`[Webhook] Invoice paid: ${payload.invoice?.entity?.id}`);
                break;
            }

            case 'invoice.partially_paid': {
                console.log(`[Webhook] Invoice partially paid: ${payload.invoice?.entity?.id}`);
                break;
            }

            case 'invoice.expired': {
                console.log(`[Webhook] Invoice expired: ${payload.invoice?.entity?.id}`);
                break;
            }

            // =====================================================
            // PAYMENT LINK EVENTS
            // =====================================================

            case 'payment_link.paid': {
                const paymentLink = payload.payment_link?.entity;
                console.log(`[Webhook] Payment link paid: ${paymentLink?.id}`);
                break;
            }

            case 'payment_link.partially_paid': {
                const paymentLink = payload.payment_link?.entity;
                console.log(`[Webhook] Payment link partially paid: ${paymentLink?.id}`);
                break;
            }

            case 'payment_link.expired': {
                const paymentLink = payload.payment_link?.entity;
                console.log(`[Webhook] Payment link expired: ${paymentLink?.id}`);
                break;
            }

            case 'payment_link.cancelled': {
                const paymentLink = payload.payment_link?.entity;
                console.log(`[Webhook] Payment link cancelled: ${paymentLink?.id}`);
                break;
            }

            // =====================================================
            // SETTLEMENT EVENTS
            // =====================================================

            case 'settlement.processed': {
                const settlement = payload.settlement?.entity;
                console.log(`[Webhook] Settlement processed: ${settlement?.id}`);

                // Settlement events are for bank transfers - we don't link them to orders
                // as they're merchant-level, but we log for reference
                // In a more complex system, you could track this per-payment
                break;
            }

            // =====================================================
            // SUBSCRIPTION EVENTS (if you use Razorpay subscriptions)
            // =====================================================

            case 'subscription.authenticated':
            case 'subscription.activated':
            case 'subscription.charged':
            case 'subscription.pending':
            case 'subscription.halted':
            case 'subscription.cancelled':
            case 'subscription.completed':
            case 'subscription.paused':
            case 'subscription.resumed':
            case 'subscription.updated': {
                console.log(`[Webhook] Subscription event: ${eventType}`);
                // Handle subscription events if you implement subscriptions
                break;
            }

            // =====================================================
            // FUND ACCOUNT EVENTS (for payouts)
            // =====================================================

            case 'fund_account.validation.completed':
            case 'fund_account.validation.failed': {
                console.log(`[Webhook] Fund account event: ${eventType}`);
                break;
            }

            // =====================================================
            // ACCOUNT EVENTS (for marketplace/route)
            // =====================================================

            case 'account.instantly_activated':
            case 'account.activated_kyc_pending': {
                console.log(`[Webhook] Account event: ${eventType}`);
                break;
            }

            default:
                console.log(`[Webhook] Unhandled event type: ${eventType}`);
        }

        // Always respond with 200 OK to acknowledge receipt
        res.status(200).json({ status: 'ok', event: eventType });

    } catch (error) {
        console.error('[Webhook] Error processing webhook:', error);
        // Still return 200 to prevent Razorpay from retrying indefinitely
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
                    product.colors[colorIndex].quantity = Math.max(0, product.colors[colorIndex].quantity - item.quantity);
                    product.colors[colorIndex].inStock = product.colors[colorIndex].quantity > 0;
                }
                const totalColorStock = product.colors.reduce((sum, c) => sum + c.quantity, 0);
                product.stock = totalColorStock;
                product.inStock = totalColorStock > 0;
            } else {
                product.stock = Math.max(0, product.stock - item.quantity);
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

// Get refund status - returns stored data from webhooks
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

        // Return stored refund data from webhooks
        let statusMessage = order.refundNotes;
        if (!statusMessage) {
            if (order.refundStatus === 'completed') {
                statusMessage = `Refund completed. Amount: ₹${order.refundAmount}. The amount will be credited to your bank account within 5-7 working days.`;
            } else if (order.refundStatus === 'processing') {
                statusMessage = 'Refund is being processed. This usually takes 5-7 working days.';
            } else if (order.refundStatus === 'failed') {
                statusMessage = 'Refund failed. Please contact support.';
            }
        }

        res.json({
            success: true,
            refundStatus: order.refundStatus,
            refundId: order.refundId,
            refundAmount: order.refundAmount,
            refundInitiatedAt: order.refundInitiatedAt,
            refundCompletedAt: order.refundCompletedAt,
            message: statusMessage,
            paymentStatus: order.paymentStatus
        });

    } catch (error) {
        console.error('Error fetching refund status:', error);
        res.status(500).json({ message: error.message || 'Failed to fetch refund status' });
    }
};
// Get detailed payment timeline for an order - returns stored data from webhooks
export const getPaymentTimeline = async (req, res) => {
    try {
        const { orderId } = req.params;

        let order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Auto-sync with Razorpay API if refund is processing (to catch missed webhooks)
        let syncedFromApi = false;
        if (order.refundStatus === 'processing' && order.refundId) {
            try {
                const razorpayInstance = getRazorpayInstance();
                const refund = await razorpayInstance.refunds.fetch(order.refundId);

                if (refund && refund.status === 'processed') {
                    // Webhook was missed - update order from API data
                    order.refundStatus = 'completed';
                    order.paymentStatus = 'refunded';
                    order.refundCompletedAt = new Date(refund.created_at * 1000);
                    order.refundNotes = `✅ Refund completed. Amount: ₹${refund.amount / 100}. The amount has been credited to customer's account.`;

                    // Check if refund_processed event exists, if not add it
                    const hasProcessedEvent = order.paymentTimeline?.some(e => e.event === 'refund_processed');
                    if (!hasProcessedEvent) {
                        order.paymentTimeline = order.paymentTimeline || [];
                        order.paymentTimeline.push({
                            event: 'refund_processed',
                            title: 'Refund',
                            description: `Amount: ₹${refund.amount / 100}`,
                            timestamp: new Date(refund.created_at * 1000),
                            completed: true,
                            details: {
                                refundId: refund.id,
                                amount: refund.amount / 100,
                                status: 'Processed',
                                arn: refund.acquirer_data?.arn
                            }
                        });
                    }

                    // Mark refund_created as completed
                    const createdEvent = order.paymentTimeline?.find(e => e.event === 'refund_created');
                    if (createdEvent) {
                        createdEvent.completed = true;
                    }

                    await order.save();
                    syncedFromApi = true;
                    console.log(`[Timeline Sync] Order ${order._id} - Refund status synced from Razorpay API: processed`);
                } else if (refund && refund.status === 'failed') {
                    // Refund failed - update
                    order.refundStatus = 'failed';
                    order.refundNotes = `❌ Refund failed. Please contact support.`;

                    const hasFailedEvent = order.paymentTimeline?.some(e => e.event === 'refund_failed');
                    if (!hasFailedEvent) {
                        order.paymentTimeline = order.paymentTimeline || [];
                        order.paymentTimeline.push({
                            event: 'refund_failed',
                            title: 'Refund failed',
                            description: 'Refund could not be processed',
                            timestamp: new Date(),
                            completed: true,
                            details: {
                                refundId: refund.id,
                                status: 'Failed'
                            }
                        });
                    }

                    await order.save();
                    syncedFromApi = true;
                }
            } catch (syncError) {
                console.error('[Timeline Sync] Error syncing refund status:', syncError.message);
                // Continue with existing data if API sync fails
            }
        }

        // Build timeline from stored events
        let timeline = [];

        if (order.paymentTimeline && order.paymentTimeline.length > 0) {
            timeline = order.paymentTimeline.map(event => ({
                event: event.event,
                title: event.title,
                description: event.description,
                timestamp: event.timestamp,
                completed: event.completed !== false,
                details: {
                    ...event.details,
                    // Ensure status is properly set for refund events
                    status: event.event === 'refund_processed' ? 'Processed' :
                        event.event === 'refund_created' && event.completed ? 'Processed' :
                            event.event === 'refund_created' && !event.completed ? 'Processing' :
                                event.event === 'refund_failed' ? 'Failed' :
                                    event.details?.status
                }
            }));
        }

        // Sort timeline by timestamp
        timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        // Format timestamps for display
        const formattedTimeline = timeline.map(event => ({
            ...event,
            formattedTime: new Date(event.timestamp).toLocaleString('en-IN', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            })
        }));

        res.json({
            success: true,
            orderId: order._id,
            paymentId: order.razorpayPaymentId,
            razorpayOrderId: order.razorpayOrderId,
            amount: order.totalAmount,
            paymentStatus: order.paymentStatus,
            refundStatus: order.refundStatus,
            refundAmount: order.refundAmount,
            refundId: order.refundId,
            refundInitiatedAt: order.refundInitiatedAt,
            refundCompletedAt: order.refundCompletedAt,
            refundNotes: order.refundNotes,
            timeline: formattedTimeline,
            createdAt: order.createdAt,
            syncedFromApi
        });

    } catch (error) {
        console.error('Error fetching payment timeline:', error);
        res.status(500).json({ message: error.message || 'Failed to fetch payment timeline' });
    }
};