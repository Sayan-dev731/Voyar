import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ArrowLeft, Check, Minus, Plus, ShoppingCart, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCart } from '@/context/CartContext'
import { API_URL } from '@/config/api'
import type { Product } from '@/types/product'

type ColorOption = { name: string; value: string; price?: number; quantity?: number }

// Helper function to convert Google Drive link to direct image URL
const convertGoogleDriveLink = (url: string): string => {
    if (!url) return url;

    // Check if it's already in thumbnail format
    if (url.includes('drive.google.com/thumbnail')) {
        return url;
    }

    // Patterns to extract Google Drive file ID
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
            // Use thumbnail format which works better for rendering
            return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
        }
    }

    // Return original URL if not a Google Drive link
    return url;
};

// Get all product images including main image
const getProductImages = (mainImage: string, additionalImages?: string[]): string[] => {
    const images: string[] = [];

    // Add main image first
    if (mainImage) {
        images.push(convertGoogleDriveLink(mainImage));
    }

    // Add additional images (avoiding duplicates)
    if (additionalImages && additionalImages.length > 0) {
        additionalImages.forEach(img => {
            const convertedImg = convertGoogleDriveLink(img);
            if (convertedImg && !images.includes(convertedImg)) {
                images.push(convertedImg);
            }
        });
    }

    return images;
};

export const ProductDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { addToCart, items } = useCart()

    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedImage, setSelectedImage] = useState(0)
    const [selectedColor, setSelectedColor] = useState<ColorOption | undefined>()
    const [quantity, setQuantity] = useState(1)
    const [addedToCart, setAddedToCart] = useState(false)
    const [stockError, setStockError] = useState<string | null>(null)

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true)
                const response = await fetch(`${API_URL}/products/${id}`)
                if (response.ok) {
                    const data = await response.json()
                    setProduct(data)
                    setSelectedColor(data.colors?.[0])
                } else {
                    setProduct(null)
                }
            } catch (error) {
                console.error('Failed to fetch product:', error)
                setProduct(null)
            } finally {
                setLoading(false)
            }
        }

        fetchProduct()
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-white via-amber-50/30 to-white">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto"></div>
                        <p className="mt-4 text-black/60">Loading product...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-white via-amber-50/30 to-white">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-20">
                        <h2 className="text-3xl font-[600] text-black mb-4">Product Not Found</h2>
                        <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    const handleAddToCart = async () => {
        if (!product) return

        setStockError(null)
        const colorPrice = selectedColor?.price || product.price
        const result = await addToCart(product, quantity, selectedColor?.name, colorPrice)

        if (result.success) {
            setAddedToCart(true)
            setTimeout(() => setAddedToCart(false), 2000)
        } else {
            setStockError(result.message || 'Unable to add to cart')
            setTimeout(() => setStockError(null), 3000)
        }
    }

    // Calculate available stock based on selected color
    const getStock = (): number => {
        if (!product) return 0
        if (selectedColor && product.colors && product.colors.length > 0) {
            const colorVariant = product.colors.find(c => c.name === selectedColor.name)
            return colorVariant?.quantity || 0
        }
        return product.stock || 0
    }

    // Get current cart quantity for this product
    const getCurrentCartQty = (): number => {
        if (!product) return 0
        const cartItem = items.find(item =>
            (item._id && item._id === product._id) || (item.id && item.id === product.id)
        )
        return cartItem?.quantity || 0
    }

    const availableStock = getStock()
    const currentCartQty = getCurrentCartQty()
    const remainingStock = availableStock - currentCartQty
    const isOutOfStock = availableStock === 0
    const maxQuantity = Math.max(0, remainingStock)

    // Get all images including main image, with Google Drive links converted
    const images = getProductImages(product.image, product.images)

    return (
        <div className="min-h-screen pt-20 sm:pt-24 pb-16 bg-gradient-to-b from-white via-amber-50/30 to-white">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="mb-6 text-black/60 hover:text-amber-600 hover:bg-amber-50"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>

                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <Card className="overflow-hidden border-amber-200/60 rounded-2xl">
                            <CardContent className="p-0">
                                <div className="aspect-square bg-gradient-to-br from-amber-50 to-white">
                                    <img
                                        src={images[selectedImage]}
                                        alt={product.name}
                                        className="w-full h-full object-cover mix-blend-multiply"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {images.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:pb-0">
                                {images.map((img, idx) => (
                                    <Card
                                        key={idx}
                                        className={`cursor-pointer overflow-hidden transition-all flex-shrink-0 w-20 sm:w-auto ${selectedImage === idx
                                            ? 'ring-2 ring-amber-500 border-amber-400'
                                            : 'border-amber-200/60 hover:border-amber-400'
                                            } rounded-xl`}
                                        onClick={() => setSelectedImage(idx)}
                                    >
                                        <CardContent className="p-0">
                                            <div className="aspect-square bg-gradient-to-br from-amber-50 to-white">
                                                <img
                                                    src={img}
                                                    alt={`${product.name} ${idx + 1}`}
                                                    className="w-full h-full object-cover mix-blend-multiply"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div>
                            <p className="text-sm font-medium text-amber-600 mb-2">{product.category}</p>
                            <h1 className="text-3xl sm:text-5xl font-[600] text-black mb-4">{product.name}</h1>

                            <p className="text-3xl sm:text-4xl font-[600] text-amber-600 mb-6">₹{selectedColor?.price || product.price}</p>
                            <p className="text-base text-black/70 leading-relaxed">{product.detailedDescription}</p>
                        </div>

                        {/* Color Selection */}
                        {product.colors && product.colors.length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-black mb-3">
                                    Color: <span className="text-amber-600">{selectedColor?.name}</span>
                                    {selectedColor?.quantity !== undefined && (
                                        <span className={`text-xs ml-2 ${selectedColor.quantity === 0 ? 'text-red-500' : 'text-black/50'}`}>
                                            ({selectedColor.quantity === 0 ? 'Out of stock' : `${selectedColor.quantity} in stock`})
                                        </span>
                                    )}
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    {product.colors.map((color) => (
                                        <button
                                            key={color.name}
                                            onClick={() => {
                                                setSelectedColor(color)
                                                setQuantity(1) // Reset quantity when color changes
                                                setStockError(null)
                                            }}
                                            disabled={color.quantity === 0}
                                            className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor?.name === color.name
                                                ? 'border-amber-600 ring-2 ring-amber-300'
                                                : 'border-amber-200 hover:border-amber-400'
                                                } ${color.quantity === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            style={{ backgroundColor: color.value }}
                                            title={`${color.name} - ₹${color.price}${color.quantity === 0 ? ' (Out of stock)' : ` (${color.quantity} available)`}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div>
                            <p className="text-sm font-medium text-black mb-3">
                                Quantity
                                {availableStock > 0 && (
                                    <span className="text-xs text-black/50 ml-2">
                                        ({remainingStock > 0 ? `${remainingStock} available` : 'Max in cart'})
                                    </span>
                                )}
                            </p>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={isOutOfStock || quantity <= 1}
                                    className="h-10 w-10 border-amber-200 hover:border-amber-400 hover:bg-amber-50 disabled:opacity-50"
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="text-xl font-medium text-black w-12 text-center">{quantity}</span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                                    disabled={isOutOfStock || quantity >= maxQuantity}
                                    className="h-10 w-10 border-amber-200 hover:border-amber-400 hover:bg-amber-50 disabled:opacity-50"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Stock Error Message */}
                        {stockError && (
                            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                                <AlertCircle className="h-4 w-4" />
                                {stockError}
                            </div>
                        )}

                        {/* Add to Cart Button */}
                        <div className="flex gap-3">
                            <Button
                                onClick={handleAddToCart}
                                disabled={isOutOfStock || maxQuantity === 0}
                                className={`flex-1 h-12 text-base font-medium shadow-lg ${isOutOfStock || maxQuantity === 0
                                        ? 'bg-gray-400 text-white cursor-not-allowed'
                                        : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-amber-200'
                                    }`}
                            >
                                {addedToCart ? (
                                    <>
                                        <Check className="mr-2 h-5 w-5" />
                                        Added to Cart
                                    </>
                                ) : isOutOfStock ? (
                                    'Out of Stock'
                                ) : maxQuantity === 0 ? (
                                    'Max Quantity in Cart'
                                ) : (
                                    <>
                                        <ShoppingCart className="mr-2 h-5 w-5" />
                                        Add to Cart
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Stock Status */}
                        {!isOutOfStock && product.inStock && (
                            <p className="text-sm text-green-600 flex items-center gap-2">
                                <Check className="h-4 w-4" />
                                In Stock - Ships within 2-3 business days
                            </p>
                        )}

                        {/* Features */}
                        {product.features && product.features.length > 0 && (
                            <Card className="border-amber-200/60 rounded-xl">
                                <CardContent className="p-4 sm:p-6">
                                    <h3 className="text-lg font-[600] text-black mb-4">Key Features</h3>
                                    <ul className="space-y-2">
                                        {product.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-black/70">
                                                <Check className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}

                        {/* Specifications */}
                        {product.specifications && (
                            <Card className="border-amber-200/60 rounded-xl">
                                <CardContent className="p-4 sm:p-6">
                                    <h3 className="text-lg font-[600] text-black mb-4">Specifications</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {Object.entries(product.specifications).map(([key, value]) => (
                                            value && (
                                                <div key={key}>
                                                    <p className="text-xs text-black/50 mb-1">
                                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                                    </p>
                                                    <p className="text-sm font-medium text-black">{value}</p>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
