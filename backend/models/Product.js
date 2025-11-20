import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Sunglasses', 'Eyeglasses', 'Computer Glasses', 'Sports Glasses']
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    image: {
        type: String,
        required: true
    },
    images: [{
        type: String
    }],
    description: {
        type: String,
        required: true
    },
    detailedDescription: {
        type: String
    },
    features: [{
        type: String
    }],
    specifications: {
        frameWidth: String,
        lensWidth: String,
        bridgeWidth: String,
        templeLength: String,
        material: String,
        weight: String,
        lensType: String,
        uvProtection: String
    },
    colors: [{
        name: String,
        value: String
    }],
    inStock: {
        type: Boolean,
        default: true
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    reviews: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);

export default Product;
