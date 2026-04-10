import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { API_URL } from '@/config/api'
import type { Product } from '@/types/product'

// Helper function to convert Google Drive link to direct CDN URL (no CORS issues)
const convertGoogleDriveLink = (url: string, size = 'w1000'): string => {
    if (!url) return url
    const drivePatterns = [
        /https:\/\/drive\.google\.com\/file\/d\/([^/?]+)/,
        /https:\/\/drive\.google\.com\/open\?id=([^&]+)/,
        /https:\/\/drive\.google\.com\/uc\?(?:export=view&)?id=([^&]+)/,
        /https:\/\/drive\.google\.com\/thumbnail\?(?:[^&]*&)?id=([^&]+)/,
        /https:\/\/lh3\.googleusercontent\.com\/d\/([^=?&]+)/,
    ]
    for (const pattern of drivePatterns) {
        const match = url.match(pattern)
        if (match?.[1]) {
            return `https://lh3.googleusercontent.com/d/${match[1]}=${size}`
        }
    }
    return url
}

interface ExtendedProduct extends Product {
    originalPrice?: number
}

export const ProductGrid = () => {
    const navigate = useNavigate()
    const [products, setProducts] = useState<ExtendedProduct[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${API_URL}/products`)
                const data = await response.json()
                const productList = Array.isArray(data) ? data : (data.products || [])
                const featuredProducts = productList.slice(0, 6).map((p: Product) => ({
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

    return (
        <section className="py-16 sm:py-20 lg:py-28 bg-gradient-to-b from-amber-50/30 to-white dark:from-gray-950 dark:to-gray-900 transition-colors duration-300">
            <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 sm:mb-14"
                >
                    <div>
                        <p className="text-[11px] tracking-[0.2em] uppercase text-amber-600 dark:text-amber-400 mb-3">
                            // Discover eyewear for every mood, style, and occasion.
                        </p>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-black dark:text-white tracking-tight">
                            Explore Our Collections
                        </h2>
                    </div>
                    <Link
                        to="/collections"
                        className="text-[13px] font-medium tracking-[0.04em] uppercase text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors relative group shrink-0"
                    >
                        View All
                        <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-amber-500 group-hover:w-full transition-all duration-300" />
                    </Link>
                </motion.div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    {loading
                        ? [...Array(6)].map((_, i) => (
                            <div key={i}>
                                <div className="aspect-square bg-amber-50 dark:bg-gray-800 shimmer" />
                                <div className="pt-4 space-y-2">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 shimmer w-3/4" />
                                    <div className="h-3 bg-gray-200 dark:bg-gray-800 shimmer w-1/2" />
                                </div>
                            </div>
                        ))
                        : products.map((product, index) => (
                            <motion.div
                                key={product._id || product.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.08, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                            >
                                <div
                                    className="group cursor-pointer"
                                    onClick={() => navigate(`/product/${product._id || product.id}`)}
                                >
                                    {/* Product Image */}
                                    <div className="relative aspect-square overflow-hidden bg-amber-50 dark:bg-gray-800 rounded-xl border border-amber-100 dark:border-amber-900/30 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-lg transition-all duration-300">
                                        <img
                                            src={convertGoogleDriveLink(product.image)}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=No+Image'
                                            }}
                                        />
                                        
                                        {/* Hover overlay with View Details */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500" />
                                        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-400">
                                            <span className="inline-flex items-center gap-2 bg-white dark:bg-gray-950 text-black dark:text-white text-xs font-medium tracking-wider uppercase px-4 py-2.5">
                                                View Details
                                                <ArrowRight className="h-3 w-3" />
                                            </span>
                                        </div>
                                    </div>

                                    {/* Product Info */}
                                    <div className="pt-4">
                                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">Voyar Eyewear</p>
                                        <h3 className="text-sm font-semibold text-black dark:text-white line-clamp-1 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                                            {product.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="text-sm text-black dark:text-white">
                                                ₹{product.price}
                                            </span>
                                            {product.originalPrice && (
                                                <span className="text-xs text-black/40 dark:text-white/40 line-through">
                                                    ₹{product.originalPrice}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                </div>

                {/* View All Button - Mobile */}
                <div className="sm:hidden mt-8 text-center">
                    <Link
                        to="/collections"
                        className="inline-flex items-center gap-2 bg-amber-500 text-white px-8 py-3.5 text-[13px] font-medium tracking-[0.04em] uppercase hover:bg-amber-600 transition-all duration-300 rounded-full"
                    >
                        View All Products
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    )
}
