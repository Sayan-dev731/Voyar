import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Star, Glasses } from 'lucide-react'
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
    const titleRef = useRef<HTMLHeadingElement>(null)
    const cardsRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${API_URL}/products`)
                const data = await response.json()
                const productList = Array.isArray(data) ? data : (data.products || [])
                // Show only first 6 products on homepage
                setProducts(productList.slice(0, 6))
            } catch (error) {
                console.error('Failed to fetch products:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [])

    return (
        <div ref={sectionRef} id="collection" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white via-amber-50/30 to-white">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div ref={titleRef} className="text-center mb-16 sm:mb-20 lg:mb-24">
                    <h2 className="text-4xl sm:text-5xl lg:text-7xl font-[600] text-black tracking-tight mb-4">
                        Our Collection
                    </h2>
                    <p className="text-sm sm:text-base text-black/60 max-w-2xl mx-auto">
                        Handpicked styles to match your personality
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {[...Array(6)].map((_, i) => (
                            <Card key={i} className="animate-pulse rounded-2xl">
                                <div className="aspect-[4/3] bg-gray-200 rounded-t-2xl" />
                                <div className="p-6 space-y-3">
                                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                                    <div className="h-10 bg-gray-200 rounded w-full mt-4" />
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-16">
                        <Glasses className="h-16 w-16 text-black/20 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-black mb-2">No products found</h3>
                        <p className="text-black/60 mb-6">Check back soon for our latest collection</p>
                        <Button
                            onClick={() => navigate('/collections')}
                            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
                        >
                            Browse Collections
                        </Button>
                    </div>
                ) : (
                    <>
                        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {products.map((product) => (
                                <Card
                                    key={product._id || product.id}
                                    className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-amber-100/50 bg-white backdrop-blur-sm border-amber-200/60 hover:border-amber-400 rounded-2xl"
                                    onClick={() => navigate(`/product/${product._id || product.id}`)}
                                >
                                    <CardContent className="p-0">
                                        <div className="aspect-[4/3] bg-gradient-to-br from-amber-50 to-white overflow-hidden">
                                            <img
                                                src={convertGoogleDriveLink(product.image)}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image'
                                                }}
                                            />
                                        </div>
                                        <div className="p-6 sm:p-7">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1">
                                                    <h3 className="text-lg sm:text-xl font-[600] text-black mb-1">
                                                        {product.name}
                                                    </h3>
                                                    <p className="text-xs sm:text-sm text-black/50 mb-2">
                                                        {product.category}
                                                    </p>
                                                    {/* Rating */}
                                                    {product.rating && (
                                                        <div className="flex items-center gap-1 mb-2">
                                                            <div className="flex">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        className={`h-3 w-3 ${i < Math.floor(product.rating!)
                                                                            ? 'fill-amber-500 text-amber-500'
                                                                            : 'text-amber-200'
                                                                            }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                            {product.reviews && (
                                                                <span className="text-xs text-black/50">
                                                                    ({product.reviews})
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-lg sm:text-xl font-[600] text-amber-600">
                                                    ${product.price}
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
                                                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 h-11 text-sm font-medium transition-all duration-200 shadow-md shadow-amber-200"
                                            >
                                                View Details
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* View All Button */}
                        <div className="text-center mt-12">
                            <Button
                                onClick={() => navigate('/collections')}
                                variant="outline"
                                className="border-amber-400 text-amber-600 hover:bg-amber-50 hover:border-amber-500 px-8 py-6 text-base font-medium"
                            >
                                View All Collections
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
