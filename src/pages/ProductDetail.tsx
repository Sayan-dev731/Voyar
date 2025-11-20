import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ArrowLeft, Star, Check, Minus, Plus, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCart } from '@/context/CartContext'
import { API_URL } from '@/config/api'
import type { Product } from '@/types/product'

export const ProductDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { addToCart } = useCart()

    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedImage, setSelectedImage] = useState(0)
    const [selectedColor, setSelectedColor] = useState<{ name: string; value: string } | undefined>()
    const [quantity, setQuantity] = useState(1)
    const [addedToCart, setAddedToCart] = useState(false)

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

    const handleAddToCart = () => {
        addToCart(product, quantity, selectedColor?.name)
        setAddedToCart(true)
        setTimeout(() => setAddedToCart(false), 2000)
    }

    const images = product.images || [product.image]

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
                            <div className="grid grid-cols-3 gap-4">
                                {images.map((img, idx) => (
                                    <Card
                                        key={idx}
                                        className={`cursor-pointer overflow-hidden transition-all ${selectedImage === idx
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
                            <h1 className="text-4xl sm:text-5xl font-[600] text-black mb-4">{product.name}</h1>

                            {/* Rating */}
                            {product.rating && (
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-4 w-4 ${i < Math.floor(product.rating!)
                                                    ? 'fill-amber-500 text-amber-500'
                                                    : 'text-amber-200'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm text-black/60">
                                        {product.rating} ({product.reviews} reviews)
                                    </span>
                                </div>
                            )}

                            <p className="text-4xl font-[600] text-amber-600 mb-6">${product.price}</p>
                            <p className="text-base text-black/70 leading-relaxed">{product.detailedDescription}</p>
                        </div>

                        {/* Color Selection */}
                        {product.colors && product.colors.length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-black mb-3">
                                    Color: <span className="text-amber-600">{selectedColor?.name}</span>
                                </p>
                                <div className="flex gap-3">
                                    {product.colors.map((color) => (
                                        <button
                                            key={color.name}
                                            onClick={() => setSelectedColor(color)}
                                            className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor?.name === color.name
                                                ? 'border-amber-600 ring-2 ring-amber-300'
                                                : 'border-amber-200 hover:border-amber-400'
                                                }`}
                                            style={{ backgroundColor: color.value }}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div>
                            <p className="text-sm font-medium text-black mb-3">Quantity</p>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="h-10 w-10 border-amber-200 hover:border-amber-400 hover:bg-amber-50"
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="text-xl font-medium text-black w-12 text-center">{quantity}</span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="h-10 w-10 border-amber-200 hover:border-amber-400 hover:bg-amber-50"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <div className="flex gap-3">
                            <Button
                                onClick={handleAddToCart}
                                className="flex-1 h-12 bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 text-base font-medium shadow-lg shadow-amber-200"
                            >
                                {addedToCart ? (
                                    <>
                                        <Check className="mr-2 h-5 w-5" />
                                        Added to Cart
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="mr-2 h-5 w-5" />
                                        Add to Cart
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Stock Status */}
                        {product.inStock && (
                            <p className="text-sm text-green-600 flex items-center gap-2">
                                <Check className="h-4 w-4" />
                                In Stock - Ships within 2-3 business days
                            </p>
                        )}

                        {/* Features */}
                        {product.features && product.features.length > 0 && (
                            <Card className="border-amber-200/60 rounded-xl">
                                <CardContent className="p-6">
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
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-[600] text-black mb-4">Specifications</h3>
                                    <div className="grid grid-cols-2 gap-4">
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
