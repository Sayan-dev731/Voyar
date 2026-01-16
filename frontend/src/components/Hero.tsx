import { useEffect, useMemo, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { API_URL } from '@/config/api'

interface Product {
    _id?: string
    id?: string
    name: string
    price: number
    originalPrice?: number
    image: string
    category: string
}

// Helper function to convert Google Drive link to direct image URL
const convertGoogleDriveLink = (url: string): string => {
    if (!url) return url
    if (url.includes('drive.google.com/thumbnail')) return url
    const drivePatterns = [
        /https:\/\/drive\.google\.com\/file\/d\/([^/]+)\/view/,
        /https:\/\/drive\.google\.com\/file\/d\/([^/]+)/,
        /https:\/\/drive\.google\.com\/open\?id=([^&]+)/,
    ]
    for (const pattern of drivePatterns) {
        const match = url.match(pattern)
        if (match?.[1]) {
            return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`
        }
    }
    return url
}

type CategoryTab = 'men' | 'women' | 'sale' | 'sports'

interface TabData {
    label: string
    value: CategoryTab
    badge?: string
}

const categoryTabs: TabData[] = [
    { label: 'Men', value: 'men' },
    { label: 'Women', value: 'women' },
    { label: '@999', value: 'sale', badge: 'Sale' },
    { label: 'Sports', value: 'sports' },
]

export const Hero = () => {
    const [bestsellers, setBestsellers] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [eyeglassTab, setEyeglassTab] = useState<CategoryTab>('men')
    const [sunglassTab, setSunglassTab] = useState<CategoryTab>('men')
    const scrollRef = useRef<HTMLDivElement>(null)

    const promoImages = useMemo(
        () => [
            { src: '/images/Special%20Offer%20Black%20Friday%20Instagram%20Post.svg', alt: 'Black Friday Sale' },
            { src: '/images/DSC00834.JPG', alt: 'New Collection' },
        ],
        []
    )

    const categoryImages = useMemo(
        () => ({
            eyeglasses: {
                men: '/images/20251013_035040.jpg',
                women: '/images/woman.png',
                sale: '/images/Special%20Offer%20Black%20Friday%20Instagram%20Post.svg',
                sports: '/images/20251013_024018.jpg',
            },
            sunglasses: {
                men: '/images/20251013_040836.jpg',
                women: '/images/20251013_040226.jpg',
                sale: '/images/Special%20Offer%20Black%20Friday%20Instagram%20Post.svg',
                sports: '/images/20251017_021422.jpg',
            },
        }),
        []
    )

    useEffect(() => {
        const fetchBestsellers = async () => {
            try {
                const response = await fetch(`${API_URL}/products`)
                const data = await response.json()
                const productList = Array.isArray(data) ? data : (data.products || [])
                // Add mock original prices for demo
                const productsWithPrices = productList.slice(0, 12).map((p: Product) => ({
                    ...p,
                    originalPrice: p.originalPrice || Math.round(p.price * 2.5),
                }))
                setBestsellers(productsWithPrices)
            } catch (error) {
                console.error('Failed to fetch bestsellers:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchBestsellers()
    }, [])

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 300
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            })
        }
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.1 },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
        },
    }

    return (
        <section className="relative bg-white pt-4 sm:pt-6 overflow-hidden">
            <motion.div
                className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Promotional Banners */}
                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
                    {promoImages.map((img, idx) => (
                        <Link
                            key={idx}
                            to="/collections"
                            className="group relative overflow-hidden rounded-2xl bg-amber-50 border border-amber-100 shadow-sm hover:shadow-lg transition-all duration-300"
                        >
                            <img
                                src={img.src}
                                alt={img.alt}
                                className="h-[140px] sm:h-[200px] lg:h-[280px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                loading="eager"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </Link>
                    ))}
                </motion.div>

                {/* Bestsellers Section */}
                <motion.div variants={itemVariants} className="mb-10">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black">
                                Our Bestsellers
                            </h2>
                            <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                                <Sparkles className="h-3 w-3" />
                                Popular
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => scroll('left')}
                                className="p-2 rounded-full bg-white border border-amber-200 text-amber-600 hover:bg-amber-50 hover:border-amber-300 transition-colors"
                                aria-label="Scroll left"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => scroll('right')}
                                className="p-2 rounded-full bg-white border border-amber-200 text-amber-600 hover:bg-amber-50 hover:border-amber-300 transition-colors"
                                aria-label="Scroll right"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                            <Link
                                to="/collections"
                                className="hidden sm:flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors ml-2"
                            >
                                View All
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Horizontal Scrolling Product Carousel */}
                    <div
                        ref={scrollRef}
                        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {loading
                            ? [...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className="flex-shrink-0 w-[180px] sm:w-[220px] lg:w-[260px]"
                                >
                                    <div className="bg-amber-50 rounded-xl border border-amber-100 overflow-hidden">
                                        <div className="aspect-square shimmer" />
                                        <div className="p-3 space-y-2">
                                            <div className="h-4 shimmer rounded w-3/4" />
                                            <div className="h-3 shimmer rounded w-1/2" />
                                        </div>
                                    </div>
                                </div>
                            ))
                            : bestsellers.map((product) => (
                                <Link
                                    key={product._id || product.id}
                                    to={`/product/${product._id || product.id}`}
                                    className="flex-shrink-0 w-[180px] sm:w-[220px] lg:w-[260px] group"
                                >
                                    <div className="bg-white rounded-xl border border-amber-100 overflow-hidden hover:border-amber-300 hover:shadow-lg transition-all duration-300">
                                        <div className="relative aspect-square bg-amber-50 overflow-hidden">
                                            <span className="absolute top-2 left-2 z-10 px-2 py-1 text-xs font-semibold bg-amber-500 text-white rounded-md">
                                                Bestseller
                                            </span>
                                            <img
                                                src={convertGoogleDriveLink(product.image)}
                                                alt={product.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=No+Image'
                                                }}
                                            />
                                        </div>
                                        <div className="p-3 sm:p-4">
                                            <p className="text-xs text-amber-600 font-medium mb-1">Voyar Eyewear</p>
                                            <h3 className="text-sm font-semibold text-black line-clamp-2 mb-2 group-hover:text-amber-700 transition-colors">
                                                {product.name}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-base sm:text-lg font-bold text-black">
                                                    ₹{product.price}
                                                </span>
                                                {product.originalPrice && (
                                                    <span className="text-sm text-black/40 line-through">
                                                        ₹{product.originalPrice}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-black/50 mt-1">Inclusive of all taxes</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                    </div>
                </motion.div>

                {/* Eyeglasses Section with Tabs */}
                <motion.div variants={itemVariants} className="mb-10">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black">
                            Eyeglasses
                        </h2>
                        <Link
                            to="/collections?category=eyeglasses"
                            className="flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
                        >
                            View All
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                        {categoryTabs.map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setEyeglassTab(tab.value)}
                                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${eyeglassTab === tab.value
                                        ? 'bg-amber-500 text-white shadow-md'
                                        : 'bg-amber-50 text-black/70 hover:bg-amber-100 border border-amber-200'
                                    }`}
                            >
                                {tab.label}
                                {tab.badge && (
                                    <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-white/20 rounded">
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Category Content */}
                    <Link
                        to={`/collections?category=eyeglasses&filter=${eyeglassTab}`}
                        className="group block relative overflow-hidden rounded-2xl bg-amber-50 border border-amber-100 hover:border-amber-300 transition-all duration-300"
                    >
                        <div className="flex flex-col sm:flex-row">
                            <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center">
                                <p className="text-sm text-amber-600 font-semibold mb-2">Voyar Eyewear</p>
                                <h3 className="text-2xl sm:text-3xl font-bold text-black mb-3">
                                    {eyeglassTab === 'men' && 'Eyeglasses for Men'}
                                    {eyeglassTab === 'women' && 'Eyeglasses for Women'}
                                    {eyeglassTab === 'sale' && 'Eyeglasses @999'}
                                    {eyeglassTab === 'sports' && 'Sports Eyeglasses'}
                                </h3>
                                <p className="text-black/60 mb-4">
                                    {eyeglassTab === 'sale' ? 'Limited Period Offer' : 'Starts at ₹799 • Get Extra ₹100 Off'}
                                </p>
                                <span className="inline-flex items-center gap-2 text-amber-600 font-medium group-hover:gap-3 transition-all">
                                    Shop Now
                                    <ArrowRight className="h-5 w-5" />
                                </span>
                            </div>
                            <div className="w-full sm:w-1/2 lg:w-2/5 aspect-[4/3] sm:aspect-square overflow-hidden">
                                <img
                                    src={categoryImages.eyeglasses[eyeglassTab]}
                                    alt={`${eyeglassTab} eyeglasses`}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>
                        </div>
                    </Link>
                </motion.div>

                {/* Sunglasses Section with Tabs */}
                <motion.div variants={itemVariants} className="mb-8">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black">
                            Sunglasses
                        </h2>
                        <Link
                            to="/collections?category=sunglasses"
                            className="flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
                        >
                            View All
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                        {categoryTabs.map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setSunglassTab(tab.value)}
                                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${sunglassTab === tab.value
                                        ? 'bg-amber-500 text-white shadow-md'
                                        : 'bg-amber-50 text-black/70 hover:bg-amber-100 border border-amber-200'
                                    }`}
                            >
                                {tab.label}
                                {tab.badge && (
                                    <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-white/20 rounded">
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Category Content */}
                    <Link
                        to={`/collections?category=sunglasses&filter=${sunglassTab}`}
                        className="group block relative overflow-hidden rounded-2xl bg-amber-50 border border-amber-100 hover:border-amber-300 transition-all duration-300"
                    >
                        <div className="flex flex-col sm:flex-row">
                            <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center">
                                <p className="text-sm text-amber-600 font-semibold mb-2">Voyar Eyewear</p>
                                <h3 className="text-2xl sm:text-3xl font-bold text-black mb-3">
                                    {sunglassTab === 'men' && 'Sunglasses for Men'}
                                    {sunglassTab === 'women' && 'Sunglasses for Women'}
                                    {sunglassTab === 'sale' && 'Sunglasses @999'}
                                    {sunglassTab === 'sports' && 'Sports Sunglasses'}
                                </h3>
                                <p className="text-black/60 mb-4">
                                    {sunglassTab === 'sale' ? 'Limited Period Offer' : 'Starts at ₹799 • Get Extra ₹100 Off'}
                                </p>
                                <span className="inline-flex items-center gap-2 text-amber-600 font-medium group-hover:gap-3 transition-all">
                                    Shop Now
                                    <ArrowRight className="h-5 w-5" />
                                </span>
                            </div>
                            <div className="w-full sm:w-1/2 lg:w-2/5 aspect-[4/3] sm:aspect-square overflow-hidden">
                                <img
                                    src={categoryImages.sunglasses[sunglassTab]}
                                    alt={`${sunglassTab} sunglasses`}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>
                        </div>
                    </Link>
                </motion.div>
            </motion.div>
        </section>
    )
}
