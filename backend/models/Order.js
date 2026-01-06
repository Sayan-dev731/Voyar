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
        city: String,
        state: String,
        zipCode: String,
        country: String
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
    }
}, {
    timestamps: true
});

// Index for payment token lookups
orderSchema.index({ paymentToken: 1 });
orderSchema.index({ razorpayOrderId: 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
