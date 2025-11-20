import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
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
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'paypal', 'cash'],
        default: 'card'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    notes: String
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
