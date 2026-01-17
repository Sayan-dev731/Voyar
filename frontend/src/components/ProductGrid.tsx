import { useRef, useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { API_URL } from '@/config/api'
import type { Product } from '@/types/product'

// Helper function to convert Google Drive link to direct image URL
const convertGoogleDriveLink = (url: string): string => {
    if (!url) return url
    if (url.includes('drive.google.com/thumbnail')) return url
    const drivePatterns = [
        /https:\/\/drive\.google\.com\/file\/d\/([^/]+)\/view/,
        /https:\/\/drive\.google\.com\/file\/d\/([^/]+)/,
    ]
    for (const pattern of drivePatterns) {
        const match = url.match(pattern)
        if (match?.[1]) {
            return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`
        }
    }
    return url
}

interface ExtendedProduct extends Product {
    originalPrice?: number
}

export const ProductGrid = () => {
    const scrollRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()
    const [products, setProducts] = useState<ExtendedProduct[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${API_URL}/products`)
                const data = await response.json()
                const productList = Array.isArray(data) ? data : (data.products || [])
                // Add mock original prices and take featured products
                const featuredProducts = productList.slice(0, 8).map((p: Product) => ({
                    ...p,
                    originalPrice: Math.round(p.price * 2.5),
                }))
                setProducts(featuredProducts)
            } catch (error) {
                console.error('Failed to fetch products:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchProducts()
    }, [])

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 320
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            })
        }
    }

    return (
        <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-950 transition-colors duration-300">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center justify-between mb-8"
                >
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black dark:text-white">
                            Featured Products
                        </h2>
                        <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-xs font-medium">
                            <Sparkles className="h-3 w-3" />
                            New
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => scroll('left')}
                            className="p-2 rounded-full bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:border-amber-300 transition-colors"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="p-2 rounded-full bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:border-amber-300 transition-colors"
                            aria-label="Scroll right"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                        <Link
                            to="/collections"
                            className="hidden sm:flex items-center gap-1 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors ml-2"
                        >
                            View All
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </motion.div>

                <p className="text-black/60 dark:text-white/60 mb-8 -mt-4">
                    Discover our products through video
                </p>

                {/* Horizontal Scrolling Product Grid */}
                <div
                    ref={scrollRef}
                    className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {loading
                        ? [...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="flex-shrink-0 w-[200px] sm:w-[240px] lg:w-[280px]"
                            >
                                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-amber-100 dark:border-amber-900/30 overflow-hidden">
                                    <div className="aspect-square shimmer" />
                                    <div className="p-4 space-y-3">
                                        <div className="h-4 shimmer rounded w-3/4" />
                                        <div className="h-4 shimmer rounded w-full" />
                                        <div className="h-3 shimmer rounded w-1/2" />
                                    </div>
                                </div>
                            </div>
                        ))
                        : products.map((product, index) => (
                            <motion.div
                                key={product._id || product.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05, duration: 0.4 }}
                                className="flex-shrink-0 w-[200px] sm:w-[240px] lg:w-[280px]"
                            >
                                <div
                                    className="group bg-white dark:bg-gray-900 rounded-2xl border border-amber-100 dark:border-amber-900/30 overflow-hidden hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-xl transition-all duration-300 cursor-pointer h-full"
                                    onClick={() => navigate(`/product/${product._id || product.id}`)}
                                >
                                    {/* Product Image */}
                                    <div className="relative aspect-square bg-amber-50 dark:bg-gray-800 overflow-hidden">
                                        {/* Bestseller Badge */}
                                        <span className="absolute top-3 left-3 z-10 px-2.5 py-1 text-xs font-semibold bg-amber-500 text-white rounded-md shadow-sm">
                                            Bestseller
                                        </span>

                                        {/* Quick View on Hover */}
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm font-medium text-black shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                <Eye className="h-4 w-4" />
                                                Quick View
                                            </span>
                                        </div>

                                        <img
                                            src={convertGoogleDriveLink(product.image)}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=No+Image'
                                            }}
                                        />
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-4">
                                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">
                                            Voyar Eyewear
                                        </p>
                                        <h3 className="text-sm sm:text-base font-semibold text-black dark:text-white line-clamp-2 mb-2 min-h-[2.5rem] group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                                            {product.name}
                                        </h3>

                                        {/* Price */}
                                        <div className="flex items-baseline gap-2 mb-1">
                                            <span className="text-lg font-bold text-black dark:text-white">
                                                ₹{product.price}
                                            </span>
                                            {product.originalPrice && (
                                                <span className="text-sm text-black/40 dark:text-white/40 line-through">
                                                    ₹{product.originalPrice}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-black/50 dark:text-white/50">
                                            Inclusive of all taxes
                                        </p>

                                        {/* Category Tag */}
                                        <div className="mt-3 pt-3 border-t border-amber-50 dark:border-amber-900/30">
                                            <span className="inline-block px-2.5 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium rounded-full">
                                                {product.category}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                </div>

                {/* View All Button - Mobile */}
                <div className="sm:hidden mt-6 text-center">
                    <Link
                        to="/collections"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-full font-medium hover:bg-amber-600 transition-colors"
                    >
                        View All Products
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    )
}
