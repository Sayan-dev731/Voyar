import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
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

const heroSlides = [
    {
        image: '/images/DSC00834.JPG',
        subtitle: 'New Collection 2025',
        title: 'Cool glasses that blend style and comfort.',
    },
    {
        image: '/images/20251013_035040.jpg',
        subtitle: 'Precision Crafted',
        title: 'See the world through a lens of elegance.',
    },
    {
        image: '/images/woman.png',
        subtitle: 'For Her',
        title: 'Frames designed to complement every face.',
    },
]

export const Hero = () => {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [bestsellers, setBestsellers] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchBestsellers = async () => {
            try {
                const response = await fetch(`${API_URL}/products`)
                const data = await response.json()
                const productList = Array.isArray(data) ? data : (data.products || [])
                const productsWithPrices = productList.slice(0, 4).map((p: Product) => ({
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

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    return (
        <section className="relative bg-white dark:bg-gray-950 overflow-hidden transition-colors duration-300">
            {/* HERO — Full Width Visual */}
            <div className="relative h-[85vh] min-h-[600px] max-h-[900px] overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
                        className="absolute inset-0"
                    >
                        <img
                            src={heroSlides[currentSlide].image}
                            alt={heroSlides[currentSlide].title}
                            className="w-full h-full object-cover"
                            loading="eager"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    </motion.div>
                </AnimatePresence>

                {/* Hero Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-20 sm:pb-28 px-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="text-center max-w-3xl"
                        >
                            <p className="text-white/70 text-xs sm:text-sm font-medium tracking-[0.2em] uppercase mb-4">
                                {heroSlides[currentSlide].subtitle}
                            </p>
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white leading-[1.1] mb-8 tracking-tight">
                                {heroSlides[currentSlide].title}
                            </h1>
                        </motion.div>
                    </AnimatePresence>

                    {/* Scroll indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 1 }}
                        className="flex flex-col items-center gap-3"
                    >
                        <span className="text-white/50 text-[11px] tracking-[0.3em] uppercase">Scroll</span>
                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <ArrowDown className="h-4 w-4 text-white/50" />
                        </motion.div>
                    </motion.div>
                </div>

                {/* Slide indicators */}
                <div className="absolute bottom-8 right-8 flex items-center gap-2">
                    {heroSlides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`transition-all duration-500 rounded-full ${
                                index === currentSlide
                                    ? 'w-8 h-1.5 bg-amber-400'
                                    : 'w-1.5 h-1.5 bg-white/40 hover:bg-amber-300/60'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            {/* Bestseller Strip */}
            <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-10 py-10 sm:py-14">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-[11px] tracking-[0.2em] uppercase text-amber-600 dark:text-amber-400 mb-1">Featured</p>
                        <h2 className="text-2xl sm:text-3xl font-light text-black dark:text-white tracking-tight">
                            Our Bestsellers
                        </h2>
                    </div>
                    <Link
                        to="/collections"
                        className="text-[13px] font-medium tracking-[0.04em] uppercase text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors relative group"
                    >
                        View All
                        <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-amber-500 group-hover:w-full transition-all duration-300" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {loading
                        ? [...Array(4)].map((_, i) => (
                            <div key={i} className="group">
                                <div className="aspect-square bg-amber-50 dark:bg-gray-900 shimmer" />
                                <div className="pt-4 space-y-2">
                                    <div className="h-4 bg-gray-100 dark:bg-gray-900 shimmer w-3/4" />
                                    <div className="h-3 bg-gray-100 dark:bg-gray-900 shimmer w-1/2" />
                                </div>
                            </div>
                        ))
                        : bestsellers.map((product, index) => (
                            <motion.div
                                key={product._id || product.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                            >
                                <Link
                                    to={`/product/${product._id || product.id}`}
                                    className="group block"
                                >
                                    <div className="relative aspect-square overflow-hidden bg-amber-50 dark:bg-gray-900 rounded-xl border border-amber-100 dark:border-amber-900/30 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-lg transition-all duration-300">
                                        <img
                                            src={convertGoogleDriveLink(product.image)}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=No+Image'
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                                        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-400">
                                            <span className="inline-block bg-white dark:bg-gray-950 text-black dark:text-white text-xs font-medium tracking-wider uppercase px-4 py-2.5">
                                                View Details
                                            </span>
                                        </div>
                                    </div>
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
                                </Link>
                            </motion.div>
                        ))}
                </div>
            </div>
        </section>
    )
}
