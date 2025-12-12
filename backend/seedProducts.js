import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import connectDB from './config/db.js';

dotenv.config();

const seedProducts = [
    {
        name: 'Classic Aviator',
        category: 'Sunglasses',
        price: 149,
        image: '/images/20251013_022418.jpg',
        images: [
            '/images/20251013_022418.jpg',
            '/images/20251013_022418.jpg',
            '/images/20251013_022418.jpg'
        ],
        description: 'Timeless design meets modern comfort',
        detailedDescription: 'The Classic Aviator brings together iconic design with contemporary materials. These sunglasses feature polarized lenses that reduce glare and provide 100% UV protection. Perfect for driving, outdoor activities, or making a style statement.',
        features: [
            'Polarized lenses for superior glare reduction',
            '100% UV400 protection',
            'Lightweight metal frame',
            'Adjustable nose pads for custom fit',
            'Scratch-resistant coating',
            'Includes premium case and cleaning cloth'
        ],
        specifications: {
            frameWidth: '145mm',
            lensWidth: '58mm',
            bridgeWidth: '14mm',
            templeLength: '140mm',
            material: 'Stainless Steel',
            weight: '28g',
            lensType: 'Polarized',
            uvProtection: 'UV400'
        },
        colors: [
            { name: 'Gold', value: '#FFD700' },
            { name: 'Silver', value: '#C0C0C0' },
            { name: 'Black', value: '#000000' }
        ],
        inStock: true,
        rating: 4.8,
        reviews: 234
    },
    {
        name: 'Executive Frame',
        category: 'Eyeglasses',
        price: 99,
        image: '/images/20251013_023354.jpg',
        images: [
            '/images/20251013_023354.jpg',
            '/images/20251013_023354.jpg',
            '/images/20251013_023354.jpg'
        ],
        description: 'Professional style for everyday wear',
        detailedDescription: 'The Executive Frame combines sophistication with functionality. These premium eyeglasses feature a classic rectangular design that suits all face shapes. Made with high-quality acetate for durability and comfort throughout the day.',
        features: [
            'Premium acetate construction',
            'Spring-loaded hinges',
            'Anti-reflective coating',
            'Blue light filtering option',
            'Lightweight and durable',
            'Prescription-ready lenses'
        ],
        specifications: {
            frameWidth: '140mm',
            lensWidth: '52mm',
            bridgeWidth: '18mm',
            templeLength: '145mm',
            material: 'Acetate',
            weight: '22g',
            lensType: 'Clear/Prescription',
            uvProtection: 'Standard'
        },
        colors: [
            { name: 'Tortoise', value: '#8B4513' },
            { name: 'Black', value: '#000000' },
            { name: 'Navy', value: '#000080' }
        ],
        inStock: true,
        rating: 4.6,
        reviews: 189
    },
    {
        name: 'Sport Vision',
        category: 'Sports Glasses',
        price: 129,
        image: '/images/20251013_024018.jpg',
        images: [
            '/images/20251013_024018.jpg',
            '/images/20251013_024018.jpg',
            '/images/20251013_024018.jpg'
        ],
        description: 'Performance eyewear for active lifestyles',
        detailedDescription: 'Engineered for athletes and outdoor enthusiasts, Sport Vision glasses provide exceptional clarity and protection during physical activities. Features wraparound design for maximum coverage and ventilated frame to prevent fogging.',
        features: [
            'Wraparound design for full protection',
            'Ventilated frame prevents fogging',
            'Impact-resistant polycarbonate lenses',
            'Non-slip rubber grips',
            'Interchangeable lens system',
            'Water and sweat resistant'
        ],
        specifications: {
            frameWidth: '148mm',
            lensWidth: '65mm',
            bridgeWidth: '12mm',
            templeLength: '135mm',
            material: 'TR90 Polymer',
            weight: '26g',
            lensType: 'Polycarbonate',
            uvProtection: 'UV400'
        },
        colors: [
            { name: 'Red', value: '#FF0000' },
            { name: 'Blue', value: '#0000FF' },
            { name: 'Black', value: '#000000' }
        ],
        inStock: true,
        rating: 4.7,
        reviews: 156
    },
    {
        name: 'Blue Light Block',
        category: 'Computer Glasses',
        price: 79,
        image: '/images/20251013_024158.jpg',
        images: [
            '/images/20251013_024158.jpg',
            '/images/20251013_024158.jpg',
            '/images/20251013_024158.jpg'
        ],
        description: 'Protect your eyes from digital strain',
        detailedDescription: 'Specially designed for digital device users, these computer glasses filter harmful blue light emitted by screens. Reduce eye strain, improve sleep quality, and maintain eye health during long hours in front of computers, phones, and tablets.',
        features: [
            'Advanced blue light filtering technology',
            'Reduces eye strain and fatigue',
            'Anti-glare coating',
            'Clear lenses with subtle tint',
            'Suitable for all-day wear',
            'Improves sleep patterns'
        ],
        specifications: {
            frameWidth: '138mm',
            lensWidth: '50mm',
            bridgeWidth: '17mm',
            templeLength: '142mm',
            material: 'Acetate',
            weight: '20g',
            lensType: 'Blue Light Filter',
            uvProtection: 'UV400'
        },
        colors: [
            { name: 'Clear', value: '#F5F5F5' },
            { name: 'Black', value: '#000000' },
            { name: 'Tortoise', value: '#8B4513' }
        ],
        inStock: true,
        rating: 4.5,
        reviews: 312
    },
    {
        name: 'Retro Round',
        category: 'Eyeglasses',
        price: 89,
        image: '/images/20251013_024419.jpg',
        images: [
            '/images/20251013_024419.jpg',
            '/images/20251013_024419.jpg',
            '/images/20251013_024419.jpg'
        ],
        description: 'Vintage-inspired circular frames',
        detailedDescription: 'Channel timeless elegance with our Retro Round frames. Inspired by vintage designs but crafted with modern materials, these glasses make a bold fashion statement while providing excellent optical clarity.',
        features: [
            'Vintage-inspired round design',
            'Premium metal construction',
            'Adjustable nose pads',
            'Unisex styling',
            'Prescription-ready',
            'Comes with retro-style case'
        ],
        specifications: {
            frameWidth: '132mm',
            lensWidth: '48mm',
            bridgeWidth: '20mm',
            templeLength: '145mm',
            material: 'Stainless Steel',
            weight: '18g',
            lensType: 'Clear/Prescription',
            uvProtection: 'Standard'
        },
        colors: [
            { name: 'Gold', value: '#FFD700' },
            { name: 'Silver', value: '#C0C0C0' },
            { name: 'Rose Gold', value: '#B76E79' }
        ],
        inStock: true,
        rating: 4.9,
        reviews: 278
    },
    {
        name: 'Polarized Pro',
        category: 'Sunglasses',
        price: 169,
        image: '/images/20251013_024532.jpg',
        images: [
            '/images/20251013_024532.jpg',
            '/images/20251013_024532.jpg',
            '/images/20251013_024532.jpg'
        ],
        description: 'Ultimate sun protection technology',
        detailedDescription: 'Our most advanced sunglasses featuring cutting-edge polarization technology. These premium shades eliminate glare, enhance color contrast, and provide maximum eye protection for all outdoor activities.',
        features: [
            'Advanced polarization technology',
            'Enhanced color and contrast',
            'Hydrophobic coating repels water',
            'Oleophobic coating resists smudges',
            'Impact-resistant lenses',
            'Lifetime warranty included'
        ],
        specifications: {
            frameWidth: '142mm',
            lensWidth: '56mm',
            bridgeWidth: '16mm',
            templeLength: '143mm',
            material: 'Titanium Alloy',
            weight: '24g',
            lensType: 'Polarized HD',
            uvProtection: 'UV400+'
        },
        colors: [
            { name: 'Matte Black', value: '#1C1C1C' },
            { name: 'Gunmetal', value: '#5F6A6A' },
            { name: 'Brown', value: '#654321' }
        ],
        inStock: true,
        rating: 4.9,
        reviews: 412
    },
    {
        name: 'Minimal Square Frame',
        category: 'Eyeglasses',
        price: 109,
        image: '/images/20251013_024701.jpg',
        images: [
            '/images/20251013_024701.jpg',
            '/images/20251013_024701.jpg',
            '/images/20251013_024701.jpg'
        ],
        description: 'Clean lines, lightweight comfort',
        detailedDescription: 'A modern square silhouette designed for all-day wear. Balanced proportions, lightweight materials, and a fit that feels effortless—ideal for work, study, and everyday style.',
        features: [
            'Lightweight daily-wear frame',
            'Spring hinge comfort fit',
            'Prescription-ready lenses',
            'Soft-touch nose support',
            'Unisex design'
        ],
        specifications: {
            frameWidth: '142mm',
            lensWidth: '52mm',
            bridgeWidth: '18mm',
            templeLength: '145mm',
            material: 'Acetate',
            weight: '21g',
            lensType: 'Clear/Prescription',
            uvProtection: 'Standard'
        },
        colors: [
            { name: 'Black', value: '#000000' },
            { name: 'Smoke', value: '#4B5563' },
            { name: 'Crystal', value: '#E5E7EB' }
        ],
        inStock: true,
        rating: 4.7,
        reviews: 141
    },
    {
        name: 'Urban Shade',
        category: 'Sunglasses',
        price: 159,
        image: '/images/20251013_034812.jpg',
        images: [
            '/images/20251013_034812.jpg',
            '/images/20251013_034812.jpg',
            '/images/20251013_034812.jpg'
        ],
        description: 'Everyday sunglasses with premium clarity',
        detailedDescription: 'Built for bright days and city life. Polarized lenses reduce glare and boost contrast, while a durable frame keeps things comfortable on long commutes.',
        features: [
            'Polarized glare reduction',
            'UV400 protection',
            'Scratch-resistant lens coating',
            'Balanced fit for most face shapes'
        ],
        specifications: {
            frameWidth: '144mm',
            lensWidth: '55mm',
            bridgeWidth: '17mm',
            templeLength: '143mm',
            material: 'TR90 Polymer',
            weight: '25g',
            lensType: 'Polarized',
            uvProtection: 'UV400'
        },
        colors: [
            { name: 'Matte Black', value: '#111827' },
            { name: 'Olive', value: '#3F6212' },
            { name: 'Sand', value: '#D6D3D1' }
        ],
        inStock: true,
        rating: 4.6,
        reviews: 98
    },
    {
        name: 'Aero Sport Shield',
        category: 'Sports Glasses',
        price: 139,
        image: '/images/20251013_035040.jpg',
        images: [
            '/images/20251013_035040.jpg',
            '/images/20251013_035040.jpg',
            '/images/20251013_035040.jpg'
        ],
        description: 'Wraparound performance for outdoor training',
        detailedDescription: 'Designed for movement. A wraparound profile improves coverage and stability, while impact-resistant lenses protect your eyes during intense workouts and outdoor rides.',
        features: [
            'Wraparound high-coverage design',
            'Impact-resistant lenses',
            'Non-slip temple grips',
            'Vent channels to reduce fogging'
        ],
        specifications: {
            frameWidth: '150mm',
            lensWidth: '68mm',
            bridgeWidth: '12mm',
            templeLength: '135mm',
            material: 'TR90 Polymer',
            weight: '27g',
            lensType: 'Polycarbonate',
            uvProtection: 'UV400'
        },
        colors: [
            { name: 'Graphite', value: '#374151' },
            { name: 'Blue', value: '#1D4ED8' },
            { name: 'Neon', value: '#F59E0B' }
        ],
        inStock: true,
        rating: 4.8,
        reviews: 77
    },
    {
        name: 'Workday BlueGuard',
        category: 'Computer Glasses',
        price: 85,
        image: '/images/20251013_035100.jpg',
        images: [
            '/images/20251013_035100.jpg',
            '/images/20251013_035100.jpg',
            '/images/20251013_035100.jpg'
        ],
        description: 'Reduce screen strain with a modern look',
        detailedDescription: 'Built for long screen sessions. Blue light filtering and anti-glare coating help reduce fatigue, while the frame stays comfortable across meetings, gaming, and late-night browsing.',
        features: [
            'Blue light filtering',
            'Anti-glare coating',
            'Lightweight frame for long wear',
            'Clear lens for natural color'
        ],
        specifications: {
            frameWidth: '140mm',
            lensWidth: '51mm',
            bridgeWidth: '18mm',
            templeLength: '143mm',
            material: 'Acetate',
            weight: '20g',
            lensType: 'Blue Light Filter',
            uvProtection: 'UV400'
        },
        colors: [
            { name: 'Black', value: '#000000' },
            { name: 'Clear', value: '#F3F4F6' },
            { name: 'Tortoise', value: '#8B4513' }
        ],
        inStock: true,
        rating: 4.5,
        reviews: 205
    },
    {
        name: 'Sunset Oval',
        category: 'Sunglasses',
        price: 179,
        image: '/images/20251013_035609.jpg',
        images: [
            '/images/20251013_035609.jpg',
            '/images/20251013_035609.jpg',
            '/images/20251013_035609.jpg'
        ],
        description: 'Soft oval profile with premium lens tint',
        detailedDescription: 'A refined oval shape with a modern fit. Premium lenses enhance contrast and deliver dependable UV protection—perfect for travel and weekend plans.',
        features: [
            'UV400 protection',
            'Comfort-fit temples',
            'Premium lens tint',
            'Scratch-resistant coating'
        ],
        specifications: {
            frameWidth: '143mm',
            lensWidth: '54mm',
            bridgeWidth: '18mm',
            templeLength: '142mm',
            material: 'Stainless Steel',
            weight: '23g',
            lensType: 'Polarized',
            uvProtection: 'UV400'
        },
        colors: [
            { name: 'Gold', value: '#D4AF37' },
            { name: 'Gunmetal', value: '#4B5563' },
            { name: 'Brown', value: '#7C3E1D' }
        ],
        inStock: true,
        rating: 4.7,
        reviews: 164
    },
    {
        name: 'Edge Rectangle',
        category: 'Eyeglasses',
        price: 95,
        image: '/images/20251013_035631.jpg',
        images: [
            '/images/20251013_035631.jpg',
            '/images/20251013_035631.jpg',
            '/images/20251013_035631.jpg'
        ],
        description: 'Sharp rectangle frames for a modern profile',
        detailedDescription: 'A crisp rectangle frame that adds structure and style. Designed to sit comfortably and pair well with both casual and formal outfits.',
        features: [
            'Lightweight construction',
            'Prescription-ready',
            'Comfort nose pads',
            'Durable hinges'
        ],
        specifications: {
            frameWidth: '141mm',
            lensWidth: '53mm',
            bridgeWidth: '17mm',
            templeLength: '145mm',
            material: 'Acetate',
            weight: '22g',
            lensType: 'Clear/Prescription',
            uvProtection: 'Standard'
        },
        colors: [
            { name: 'Black', value: '#000000' },
            { name: 'Charcoal', value: '#111827' },
            { name: 'Navy', value: '#1E3A8A' }
        ],
        inStock: true,
        rating: 4.6,
        reviews: 123
    },
    {
        name: 'Trail Runner',
        category: 'Sports Glasses',
        price: 149,
        image: '/images/20251013_035812.jpg',
        images: [
            '/images/20251013_035812.jpg',
            '/images/20251013_035812.jpg',
            '/images/20251013_035812.jpg'
        ],
        description: 'Stable, breathable fit for outdoor sessions',
        detailedDescription: 'A secure fit for trail runs and long rides. Built-in venting helps reduce fog, and the lens material is impact-resistant for confidence in every condition.',
        features: [
            'Fog-reducing vent design',
            'Impact-resistant lenses',
            'Non-slip grip points',
            'High coverage wrap fit'
        ],
        specifications: {
            frameWidth: '149mm',
            lensWidth: '66mm',
            bridgeWidth: '12mm',
            templeLength: '136mm',
            material: 'TR90 Polymer',
            weight: '26g',
            lensType: 'Polycarbonate',
            uvProtection: 'UV400'
        },
        colors: [
            { name: 'Black', value: '#000000' },
            { name: 'Orange', value: '#F97316' },
            { name: 'White', value: '#F9FAFB' }
        ],
        inStock: true,
        rating: 4.7,
        reviews: 64
    },
    {
        name: 'Office Clear',
        category: 'Computer Glasses',
        price: 75,
        image: '/images/20251013_040008.jpg',
        images: [
            '/images/20251013_040008.jpg',
            '/images/20251013_040008.jpg',
            '/images/20251013_040008.jpg'
        ],
        description: 'Neutral styling for screens and study',
        detailedDescription: 'A minimal frame paired with blue-light filtering lenses. Built to be subtle on camera and comfortable in long work sessions.',
        features: [
            'Blue light filtering',
            'Anti-reflective coating',
            'Lightweight, camera-friendly look'
        ],
        specifications: {
            frameWidth: '139mm',
            lensWidth: '50mm',
            bridgeWidth: '18mm',
            templeLength: '142mm',
            material: 'Acetate',
            weight: '19g',
            lensType: 'Blue Light Filter',
            uvProtection: 'UV400'
        },
        colors: [
            { name: 'Clear', value: '#E5E7EB' },
            { name: 'Smoke', value: '#6B7280' },
            { name: 'Black', value: '#000000' }
        ],
        inStock: true,
        rating: 4.4,
        reviews: 173
    },
    {
        name: 'Sunflash Pilot',
        category: 'Sunglasses',
        price: 189,
        image: '/images/20251013_040226.jpg',
        images: [
            '/images/20251013_040226.jpg',
            '/images/20251013_040226.jpg',
            '/images/20251013_040226.jpg'
        ],
        description: 'A bold pilot shape with premium polarization',
        detailedDescription: 'A modern take on the pilot frame with strong lines and premium polarized lenses. Built for bright afternoons and road trips.',
        features: [
            'Polarized lenses',
            'UV400 protection',
            'Comfort hinges',
            'Scratch-resistant coating'
        ],
        specifications: {
            frameWidth: '146mm',
            lensWidth: '58mm',
            bridgeWidth: '15mm',
            templeLength: '142mm',
            material: 'Titanium Alloy',
            weight: '24g',
            lensType: 'Polarized',
            uvProtection: 'UV400'
        },
        colors: [
            { name: 'Gold', value: '#D4AF37' },
            { name: 'Matte Black', value: '#111827' },
            { name: 'Silver', value: '#9CA3AF' }
        ],
        inStock: true,
        rating: 4.8,
        reviews: 221
    },
    {
        name: 'Everyday Round',
        category: 'Eyeglasses',
        price: 92,
        image: '/images/20251013_040836.jpg',
        images: [
            '/images/20251013_040836.jpg',
            '/images/20251013_040836.jpg',
            '/images/20251013_040836.jpg'
        ],
        description: 'A friendly round frame with a lightweight feel',
        detailedDescription: 'A versatile round frame that pairs well with almost any look. Comfortable for daily wear and ready for prescription lenses.',
        features: [
            'Lightweight daily wear',
            'Prescription-ready',
            'Comfort-fit temples'
        ],
        specifications: {
            frameWidth: '134mm',
            lensWidth: '49mm',
            bridgeWidth: '20mm',
            templeLength: '145mm',
            material: 'Stainless Steel',
            weight: '18g',
            lensType: 'Clear/Prescription',
            uvProtection: 'Standard'
        },
        colors: [
            { name: 'Silver', value: '#C0C0C0' },
            { name: 'Rose Gold', value: '#B76E79' },
            { name: 'Black', value: '#000000' }
        ],
        inStock: true,
        rating: 4.7,
        reviews: 147
    },
    {
        name: 'Cyclone Shield',
        category: 'Sports Glasses',
        price: 155,
        image: '/images/20251017_021422.jpg',
        images: [
            '/images/20251017_021422.jpg',
            '/images/20251017_021422.jpg',
            '/images/20251017_021422.jpg'
        ],
        description: 'High coverage sports eyewear for speed',
        detailedDescription: 'Aerodynamic, stable, and built to stay put. This high coverage design helps protect against dust and wind, with impact-resistant lenses for outdoor performance.',
        features: [
            'High coverage wrap lens',
            'Impact-resistant lenses',
            'Non-slip grips',
            'UV400 protection'
        ],
        specifications: {
            frameWidth: '151mm',
            lensWidth: '70mm',
            bridgeWidth: '11mm',
            templeLength: '135mm',
            material: 'TR90 Polymer',
            weight: '27g',
            lensType: 'Polycarbonate',
            uvProtection: 'UV400'
        },
        colors: [
            { name: 'Black', value: '#000000' },
            { name: 'Red', value: '#DC2626' },
            { name: 'Teal', value: '#0F766E' }
        ],
        inStock: true,
        rating: 4.8,
        reviews: 52
    },
    {
        name: 'Night Shift BlueGuard',
        category: 'Computer Glasses',
        price: 88,
        image: '/images/20251017_021641.jpg',
        images: [
            '/images/20251017_021641.jpg',
            '/images/20251017_021641.jpg',
            '/images/20251017_021641.jpg'
        ],
        description: 'Extra comfort for long late-night screen time',
        detailedDescription: 'A comfortable, modern frame paired with blue light filtering lenses—ideal for creators, coders, and late-night binge sessions.',
        features: [
            'Blue light filtering',
            'Anti-glare coating',
            'Lightweight comfort fit',
            'Prescription-ready option'
        ],
        specifications: {
            frameWidth: '141mm',
            lensWidth: '51mm',
            bridgeWidth: '18mm',
            templeLength: '144mm',
            material: 'Acetate',
            weight: '20g',
            lensType: 'Blue Light Filter',
            uvProtection: 'UV400'
        },
        colors: [
            { name: 'Black', value: '#000000' },
            { name: 'Navy', value: '#1E3A8A' },
            { name: 'Clear', value: '#E5E7EB' }
        ],
        inStock: true,
        rating: 4.6,
        reviews: 91
    }
];

const seedDatabase = async () => {
    try {
        await connectDB();

        // Clear existing products
        await Product.deleteMany({});
        console.log('Cleared existing products');

        // Insert seed data
        await Product.insertMany(seedProducts);
        console.log('Successfully seeded products!');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
