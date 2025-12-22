// import type { Product } from '@/types/product'

// export const products: Product[] = [
//     {
//         id: 1,
//         name: 'Classic Aviator',
//         category: 'Sunglasses',
//         price: 149,
//         image: '/images/20251013_022418.jpg',
//         images: [
//             '/images/20251013_022418.jpg',
//             '/images/20251013_022418.jpg',
//             '/images/20251013_022418.jpg'
//         ],
//         description: 'Timeless design meets modern comfort',
//         detailedDescription: 'The Classic Aviator brings together iconic design with contemporary materials. These sunglasses feature polarized lenses that reduce glare and provide 100% UV protection. Perfect for driving, outdoor activities, or making a style statement.',
//         features: [
//             'Polarized lenses for superior glare reduction',
//             '100% UV400 protection',
//             'Lightweight metal frame',
//             'Adjustable nose pads for custom fit',
//             'Scratch-resistant coating',
//             'Includes premium case and cleaning cloth'
//         ],
//         specifications: {
//             frameWidth: '145mm',
//             lensWidth: '58mm',
//             bridgeWidth: '14mm',
//             templeLength: '140mm',
//             material: 'Stainless Steel',
//             weight: '28g',
//             lensType: 'Polarized',
//             uvProtection: 'UV400'
//         },
//         colors: [
//             { name: 'Gold', value: '#FFD700' },
//             { name: 'Silver', value: '#C0C0C0' },
//             { name: 'Black', value: '#000000' }
//         ],
//         inStock: true,
//         rating: 4.8,
//         reviews: 234
//     },
//     {
//         id: 2,
//         name: 'Executive Frame',
//         category: 'Eyeglasses',
//         price: 99,
//         image: '/images/20251013_023354.jpg',
//         images: [
//             '/images/20251013_023354.jpg',
//             '/images/20251013_023354.jpg',
//             '/images/20251013_023354.jpg'
//         ],
//         description: 'Professional style for everyday wear',
//         detailedDescription: 'The Executive Frame combines sophistication with functionality. These premium eyeglasses feature a classic rectangular design that suits all face shapes. Made with high-quality acetate for durability and comfort throughout the day.',
//         features: [
//             'Premium acetate construction',
//             'Spring-loaded hinges',
//             'Anti-reflective coating',
//             'Blue light filtering option',
//             'Lightweight and durable',
//             'Prescription-ready lenses'
//         ],
//         specifications: {
//             frameWidth: '140mm',
//             lensWidth: '52mm',
//             bridgeWidth: '18mm',
//             templeLength: '145mm',
//             material: 'Acetate',
//             weight: '22g',
//             lensType: 'Clear/Prescription',
//             uvProtection: 'Standard'
//         },
//         colors: [
//             { name: 'Tortoise', value: '#8B4513' },
//             { name: 'Black', value: '#000000' },
//             { name: 'Navy', value: '#000080' }
//         ],
//         inStock: true,
//         rating: 4.6,
//         reviews: 189
//     },
//     {
//         id: 3,
//         name: 'Sport Vision',
//         category: 'Sports Glasses',
//         price: 129,
//         image: '/images/20251013_024018.jpg',
//         images: [
//             '/images/20251013_024018.jpg',
//             '/images/20251013_024018.jpg',
//             '/images/20251013_024018.jpg'
//         ],
//         description: 'Performance eyewear for active lifestyles',
//         detailedDescription: 'Engineered for athletes and outdoor enthusiasts, Sport Vision glasses provide exceptional clarity and protection during physical activities. Features wraparound design for maximum coverage and ventilated frame to prevent fogging.',
//         features: [
//             'Wraparound design for full protection',
//             'Ventilated frame prevents fogging',
//             'Impact-resistant polycarbonate lenses',
//             'Non-slip rubber grips',
//             'Interchangeable lens system',
//             'Water and sweat resistant'
//         ],
//         specifications: {
//             frameWidth: '148mm',
//             lensWidth: '65mm',
//             bridgeWidth: '12mm',
//             templeLength: '135mm',
//             material: 'TR90 Polymer',
//             weight: '26g',
//             lensType: 'Polycarbonate',
//             uvProtection: 'UV400'
//         },
//         colors: [
//             { name: 'Red', value: '#FF0000' },
//             { name: 'Blue', value: '#0000FF' },
//             { name: 'Black', value: '#000000' }
//         ],
//         inStock: true,
//         rating: 4.7,
//         reviews: 156
//     },
//     {
//         id: 4,
//         name: 'Blue Light Block',
//         category: 'Computer Glasses',
//         price: 79,
//         image: '/images/20251013_024158.jpg',
//         images: [
//             '/images/20251013_024158.jpg',
//             '/images/20251013_024158.jpg',
//             '/images/20251013_024158.jpg'
//         ],
//         description: 'Protect your eyes from digital strain',
//         detailedDescription: 'Specially designed for digital device users, these computer glasses filter harmful blue light emitted by screens. Reduce eye strain, improve sleep quality, and maintain eye health during long hours in front of computers, phones, and tablets.',
//         features: [
//             'Advanced blue light filtering technology',
//             'Reduces eye strain and fatigue',
//             'Anti-glare coating',
//             'Clear lenses with subtle tint',
//             'Suitable for all-day wear',
//             'Improves sleep patterns'
//         ],
//         specifications: {
//             frameWidth: '138mm',
//             lensWidth: '50mm',
//             bridgeWidth: '17mm',
//             templeLength: '142mm',
//             material: 'Acetate',
//             weight: '20g',
//             lensType: 'Blue Light Filter',
//             uvProtection: 'UV400'
//         },
//         colors: [
//             { name: 'Clear', value: '#F5F5F5' },
//             { name: 'Black', value: '#000000' },
//             { name: 'Tortoise', value: '#8B4513' }
//         ],
//         inStock: true,
//         rating: 4.5,
//         reviews: 312
//     },
//     {
//         id: 5,
//         name: 'Retro Round',
//         category: 'Eyeglasses',
//         price: 89,
//         image: '/images/20251013_024419.jpg',
//         images: [
//             '/images/20251013_024419.jpg',
//             '/images/20251013_024419.jpg',
//             '/images/20251013_024419.jpg'
//         ],
//         description: 'Vintage-inspired circular frames',
//         detailedDescription: 'Channel timeless elegance with our Retro Round frames. Inspired by vintage designs but crafted with modern materials, these glasses make a bold fashion statement while providing excellent optical clarity.',
//         features: [
//             'Vintage-inspired round design',
//             'Premium metal construction',
//             'Adjustable nose pads',
//             'Unisex styling',
//             'Prescription-ready',
//             'Comes with retro-style case'
//         ],
//         specifications: {
//             frameWidth: '132mm',
//             lensWidth: '48mm',
//             bridgeWidth: '20mm',
//             templeLength: '145mm',
//             material: 'Stainless Steel',
//             weight: '18g',
//             lensType: 'Clear/Prescription',
//             uvProtection: 'Standard'
//         },
//         colors: [
//             { name: 'Gold', value: '#FFD700' },
//             { name: 'Silver', value: '#C0C0C0' },
//             { name: 'Rose Gold', value: '#B76E79' }
//         ],
//         inStock: true,
//         rating: 4.9,
//         reviews: 278
//     },
//     {
//         id: 6,
//         name: 'Polarized Pro',
//         category: 'Sunglasses',
//         price: 169,
//         image: '/images/20251013_024532.jpg',
//         images: [
//             '/images/20251013_024532.jpg',
//             '/images/20251013_024532.jpg',
//             '/images/20251013_024532.jpg'
//         ],
//         description: 'Ultimate sun protection technology',
//         detailedDescription: 'Our most advanced sunglasses featuring cutting-edge polarization technology. These premium shades eliminate glare, enhance color contrast, and provide maximum eye protection for all outdoor activities.',
//         features: [
//             'Advanced polarization technology',
//             'Enhanced color and contrast',
//             'Hydrophobic coating repels water',
//             'Oleophobic coating resists smudges',
//             'Impact-resistant lenses',
//             'Lifetime warranty included'
//         ],
//         specifications: {
//             frameWidth: '142mm',
//             lensWidth: '56mm',
//             bridgeWidth: '16mm',
//             templeLength: '143mm',
//             material: 'Titanium Alloy',
//             weight: '24g',
//             lensType: 'Polarized HD',
//             uvProtection: 'UV400+'
//         },
//         colors: [
//             { name: 'Matte Black', value: '#1C1C1C' },
//             { name: 'Gunmetal', value: '#5F6A6A' },
//             { name: 'Brown', value: '#654321' }
//         ],
//         inStock: true,
//         rating: 4.9,
//         reviews: 412
//     }
// ]
