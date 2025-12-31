import { useRef, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Glasses, Sparkles, ArrowRight } from 'lucide-react'
import { API_URL } from '@/config/api'
import type { Product } from '@/types/product'

// Helper function to convert Google Drive link to direct image URL
const convertGoogleDriveLink = (url: string): string => {
    if (!url) return url;

    if (url.includes('drive.google.com/thumbnail')) {
        return url;
    }

    const drivePatterns = [
        /https:\/\/drive\.google\.com\/file\/d\/([^/]+)\/view/,
        /https:\/\/drive\.google\.com\/file\/d\/([^/]+)/,
        /https:\/\/drive\.google\.com\/open\?id=([^&]+)/,
        /https:\/\/drive\.google\.com\/uc\?id=([^&]+)/,
        /https:\/\/drive\.google\.com\/uc\?export=view&id=([^&]+)/,
        /https:\/\/drive\.google\.com\/thumbnail\?id=([^&]+)/
    ];

    for (const pattern of drivePatterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
        }
    }

    return url;
};

export const ProductGrid = () => {
    const sectionRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [hoveredCard, setHoveredCard] = useState<string | null>(null)

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${API_URL}/products`)
                const data = await response.json()
                const productList = Array.isArray(data) ? data : (data.products || [])
                // Show up to 4 products on homepage for better desktop layout
                setProducts(productList.slice(0, 4))
            } catch (error) {
                console.error('Failed to fetch products:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [])

    // 3D tilt effect handler
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>, id: string) => {
        if (hoveredCard !== id) return
        const card = e.currentTarget
        const rect = card.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        const rotateX = (y - centerY) / 20
        const rotateY = (centerX - x) / 20

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`
    }, [hoveredCard])

    const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)'
        setHoveredCard(null)
    }, [])

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1,
            },
        },
    }

    const cardVariants = {
        hidden: { opacity: 0, y: 40, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.6,
                ease: "easeOut" as const,
            },
        },
    }

    return (
        <div ref={sectionRef} id="collection" className="relative py-16 sm:py-20 lg:py-28 bg-gradient-to-b from-white via-amber-50/30 to-white overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 right-10 w-72 h-72 bg-amber-100/30 rounded-full blur-3xl animate-float-slow" />
                <div className="absolute bottom-20 left-10 w-56 h-56 bg-amber-200/20 rounded-full blur-3xl animate-float-reverse" />
            </div>

            <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12 sm:mb-16 lg:mb-20"
                >
                    <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-100 to-amber-50 px-4 py-2 text-xs font-semibold text-amber-800 border border-amber-200/60 mb-6">
                        <Sparkles className="h-4 w-4 text-amber-600" />
                        Curated for You
                    </div>
                    <h2 className="text-4xl sm:text-5xl lg:text-7xl font-[600] text-black tracking-tight mb-4">
                        New <span className="text-gradient-amber">Collection</span>
                    </h2>
                    <p className="text-sm sm:text-base lg:text-lg text-black/60 max-w-2xl mx-auto">
                        Handpicked styles to match your personality
                    </p>
                </motion.div>

                {loading ? (
                    <motion.div
                        className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {[...Array(4)].map((_, i) => (
                            <motion.div key={i} variants={cardVariants}>
                                <Card className="overflow-hidden rounded-2xl lg:rounded-3xl border-0 shadow-lg">
                                    <div className="aspect-[4/3] shimmer" />
                                    <div className="p-5 sm:p-6 space-y-3">
                                        <div className="h-5 shimmer rounded-lg w-3/4" />
                                        <div className="h-4 shimmer rounded-lg w-1/2" />
                                        <div className="h-11 shimmer rounded-xl w-full mt-4" />
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : products.length === 0 ? (
                    <motion.div
                        className="text-center py-16"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-50 mb-6">
                            <Glasses className="h-10 w-10 text-amber-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-black mb-2">No products found</h3>
                        <p className="text-black/60 mb-6">Check back soon for our latest collection</p>
                        <Button
                            onClick={() => navigate('/collections')}
                            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 rounded-xl px-8"
                        >
                            Browse Collections
                        </Button>
                    </motion.div>
                ) : (
                    <>
                        <motion.div
                            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                        >
                            {products.map((product) => (
                                <motion.div
                                    key={product._id || product.id}
                                    variants={cardVariants}
                                >
                                    <Card
                                        className="group cursor-pointer overflow-hidden bg-white backdrop-blur-sm border-0 rounded-2xl lg:rounded-3xl shadow-lg transition-all duration-500"
                                        style={{ transformStyle: 'preserve-3d' }}
                                        onMouseMove={(e) => handleMouseMove(e, String(product._id || product.id || ''))}
                                        onMouseEnter={() => setHoveredCard(String(product._id || product.id || ''))}
                                        onMouseLeave={handleMouseLeave}
                                        onClick={() => navigate(`/product/${product._id || product.id}`)}
                                    >
                                        <CardContent className="p-0">
                                            <div className="relative aspect-[4/3] bg-gradient-to-br from-amber-50 to-white overflow-hidden">
                                                <img
                                                    src={convertGoogleDriveLink(product.image)}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image'
                                                    }}
                                                />
                                                {/* Overlay on hover */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                                {/* Quick view badge */}
                                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium text-black shadow-lg">
                                                        Quick View
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-5 sm:p-6 lg:p-7">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-base sm:text-lg lg:text-xl font-[600] text-black mb-1 truncate group-hover:text-amber-700 transition-colors">
                                                            {product.name}
                                                        </h3>
                                                        <p className="text-xs sm:text-sm text-black/50 mb-1">
                                                            {product.category}
                                                        </p>
                                                    </div>
                                                    <div className="text-lg sm:text-xl lg:text-2xl font-[700] text-amber-600 ml-2">
                                                        ₹{product.price}
                                                    </div>
                                                </div>
                                                <p className="text-xs sm:text-sm text-black/60 mb-5 leading-relaxed line-clamp-2">
                                                    {product.description}
                                                </p>
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        navigate(`/product/${product._id || product.id}`)
                                                    }}
                                                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 h-11 lg:h-12 text-sm lg:text-base font-medium transition-all duration-300 shadow-lg shadow-amber-200/50 rounded-xl group-hover:shadow-amber-300/60"
                                                >
                                                    View Details
                                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* View All Button */}
                        <motion.div
                            className="text-center mt-12 lg:mt-16"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                        >
                            <Button
                                onClick={() => navigate('/collections')}
                                variant="outline"
                                className="border-2 border-amber-400 text-amber-600 hover:bg-amber-50 hover:border-amber-500 hover:text-amber-700 px-10 py-6 text-base lg:text-lg font-medium rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-amber-100"
                            >
                                View All Collections
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </motion.div>
                    </>
                )}
            </div>
        </div>
    )
}
