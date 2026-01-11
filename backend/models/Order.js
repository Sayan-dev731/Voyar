import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    customerName: {
        type: String,
        required: true
    },
    customerEmail: {
        type: String,
        required: true
    },
    customerPhone: {
        type: String
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        productName: String,
        productImage: String,
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        },
        selectedColor: String
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    shippingAddress: {
        name: String,
        phone: String,
        street: String,
        landmark: String, // Optional landmark for better delivery
        city: String,
        state: String,
        zipCode: String, // Shiprocket uses pincode
        pincode: String, // Alias for zipCode - Shiprocket compatible
        country: {
            type: String,
            default: 'India'
        }
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'paypal', 'cash', 'demo', 'razorpay', 'cod'],
        default: 'razorpay'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentId: {
        type: String
    },
    // Razorpay specific fields
    razorpayOrderId: {
        type: String
    },
    razorpayPaymentId: {
        type: String
    },
    razorpaySignature: {
        type: String
    },
    // Refund tracking fields
    refundStatus: {
        type: String,
        enum: ['not_applicable', 'pending', 'processing', 'completed', 'failed'],
        default: 'not_applicable'
    },
    refundId: {
        type: String
    },
    refundAmount: {
        type: Number
    },
    refundInitiatedAt: {
        type: Date
    },
    refundCompletedAt: {
        type: Date
    },
    refundNotes: {
        type: String
    },
    // Payment token for accessing order via link (valid for limited time)
    paymentToken: {
        type: String
    },
    paymentTokenExpires: {
        type: Date
    },
    // Stock reservation flag
    stockReserved: {
        type: Boolean,
        default: false
    },
    // Track when stock was deducted
    stockDeductedAt: {
        type: Date
    },
    notes: String,
    // Admin notes
    adminNotes: String,
    // Email notification tracking
    emailsSent: {
        orderReceived: { type: Boolean, default: false },
        orderConfirmed: { type: Boolean, default: false },
        orderProcessing: { type: Boolean, default: false },
        orderShipped: { type: Boolean, default: false },
        orderDelivered: { type: Boolean, default: false },
        orderCancelled: { type: Boolean, default: false },
        billGenerated: { type: Boolean, default: false }
    },
    // Soft delete for user - order hidden from user but visible to admin
    hiddenFromUser: {
        type: Boolean,
        default: false
    },
    // Razorpay webhook events tracking
    webhookEvents: [{
        event: String,
        timestamp: Date,
        paymentId: String,
        refundId: String,
        amount: Number,
        errorCode: String,
        errorDescription: String,
        reason: String,
        speed: String
    }],
    // Shiprocket shipment tracking fields
    shiprocket: {
        orderId: {
            type: Number
        },
        shipmentId: {
            type: Number
        },
        awbCode: {
            type: String
        },
        courierCompanyId: {
            type: Number
        },
        courierName: {
            type: String
        },
        pickupScheduledDate: {
            type: Date
        },
        pickupTokenNumber: {
            type: String
        },
        labelUrl: {
            type: String
        },
        manifestUrl: {
            type: String
        },
        invoiceUrl: {
            type: String
        },
        // Current shipment status
        shipmentStatus: {
            type: String,
            enum: [
                'not_created',
                'new',           // Shiprocket status: NEW
                'created',       // When order is first created in Shiprocket
                'awb_assigned',
                'label_generated',
                'pickup_scheduled',
                'pickup_queued',
                'pickup_generated',
                'manifest_generated',
                'picked_up',
                'shipped',
                'in_transit',
                'out_for_delivery',
                'delivered',
                'rto_initiated',
                'rto_in_transit',
                'rto_delivered',
                'cancelled',
                'undelivered',
                'lost',
                'damaged',
                'pending',
                'processing'
            ],
            default: 'not_created'
        },
        shipmentStatusId: {
            type: Number
        },
        estimatedDeliveryDate: {
            type: Date
        },
        // Tracking history
        trackingHistory: [{
            date: Date,
            status: String,
            statusCode: String,
            activity: String,
            location: String,
            srStatus: String,
            srStatusLabel: String
        }],
        // Last tracking update
        lastTrackedAt: {
            type: Date
        },
        // Webhook data
        lastWebhookUpdate: {
            type: Date
        }
    }
}, {
    timestamps: true
});

// Index for payment token lookups
orderSchema.index({ paymentToken: 1 });
orderSchema.index({ razorpayOrderId: 1 });
// Index for Shiprocket lookups
orderSchema.index({ 'shiprocket.orderId': 1 });
orderSchema.index({ 'shiprocket.awbCode': 1 });
orderSchema.index({ 'shiprocket.shipmentId': 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
