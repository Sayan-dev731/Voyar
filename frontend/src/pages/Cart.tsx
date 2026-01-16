import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCart } from '@/context/CartContext'
import { API_URL } from '@/config/api'

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

export const Cart = () => {
    const navigate = useNavigate()
    const { items, updateQuantity, removeFromCart, totalPrice, clearCart, getAvailableStock } = useCart()

    // Site settings for charges
    const [siteSettings, setSiteSettings] = useState({
        platformCharges: 0,
        deliveryCharges: 0
    })

    // Stock error messages
    const [stockErrors, setStockErrors] = useState<{ [key: string]: string }>({})

    // Get unique item key for cart items (use cartItemId for lens items)
    const getItemKey = (item: typeof items[0]) => item.cartItemId || item._id || item.id

    // Handle quantity update with stock validation
    const handleUpdateQuantity = async (item: typeof items[0], newQuantity: number) => {
        const itemId = item._id || item.id!
        const result = await updateQuantity(itemId, newQuantity, item.cartItemId)
        const errorKey = getItemKey(item)
        if (!result.success && result.message) {
            setStockErrors(prev => ({ ...prev, [String(errorKey)]: result.message! }))
            setTimeout(() => {
                setStockErrors(prev => {
                    const newErrors = { ...prev }
                    delete newErrors[String(errorKey)]
                    return newErrors
                })
            }, 3000)
        }
    }

    // Handle remove from cart
    const handleRemoveFromCart = (item: typeof items[0]) => {
        removeFromCart(item._id || item.id!, item.cartItemId)
    }

    // Fetch site settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch(`${API_URL}/admin/settings/public`);
                if (response.ok) {
                    const data = await response.json();
                    setSiteSettings({
                        platformCharges: data.platformCharges || 0,
                        deliveryCharges: data.deliveryCharges || 0
                    });
                }
            } catch (error) {
                console.error('Failed to fetch site settings:', error);
            }
        };
        fetchSettings();
    }, []);

    const grandTotal = totalPrice + siteSettings.platformCharges + siteSettings.deliveryCharges;

    if (items.length === 0) {
        return (
            <div className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-white via-amber-50/30 to-white">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-20">
                        <ShoppingBag className="h-24 w-24 text-amber-200 mx-auto mb-6" />
                        <h2 className="text-3xl font-[600] text-black mb-4">Your Cart is Empty</h2>
                        <p className="text-black/60 mb-8">Looks like you haven't added anything to your cart yet.</p>
                        <Button
                            onClick={() => navigate('/')}
                            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
                        >
                            Start Shopping
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-20 sm:pt-24 pb-16 bg-gradient-to-b from-white via-amber-50/30 to-white">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className="mb-4 text-black/60 hover:text-amber-600 hover:bg-amber-50"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Continue Shopping
                    </Button>
                    <div className="flex items-center justify-between">
                        <h1 className="text-4xl sm:text-5xl font-[600] text-black">Shopping Cart</h1>
                        <Button
                            variant="ghost"
                            onClick={clearCart}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            Clear Cart
                        </Button>
                    </div>
                    <p className="text-black/60 mt-2">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => (
                            <Card key={getItemKey(item)} className="overflow-hidden border-amber-200/60 rounded-2xl">
                                <CardContent className="p-4 sm:p-6">
                                    <div className="flex gap-4">
                                        {/* Image */}
                                        <div
                                            className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-amber-50 to-white cursor-pointer"
                                            onClick={() => navigate(`/product/${item._id || item.id}`)}
                                        >
                                            <img
                                                src={convertGoogleDriveLink(item.image)}
                                                alt={item.name}
                                                className="w-full h-full object-cover mix-blend-multiply hover:scale-105 transition-transform duration-300"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128?text=No+Image'
                                                }}
                                            />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div className="flex-1 min-w-0">
                                                    <h3
                                                        className="text-lg font-[600] text-black mb-1 cursor-pointer hover:text-amber-600 transition-colors truncate"
                                                        onClick={() => navigate(`/product/${item._id || item.id}`)}
                                                    >
                                                        {item.name}
                                                    </h3>
                                                    <p className="text-sm text-black/50">{item.category}</p>
                                                    {item.selectedColor && (
                                                        <p className="text-sm text-black/50">Color: {item.selectedColor}</p>
                                                    )}
                                                    {/* Lens Configuration Display */}
                                                    {item.lensConfig && (
                                                        <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-100">
                                                            <p className="text-xs font-medium text-amber-700 mb-1">Lens Configuration:</p>
                                                            <div className="text-xs text-black/60 space-y-0.5">
                                                                <p>• Type: {item.lensConfig.lensType === 'withPower' ? 'With Power' : item.lensConfig.lensType === 'zeroPower' ? 'Zero Power' : 'Frame Only'}</p>
                                                                {item.lensConfig.powerType && (
                                                                    <p>• Lens: {item.lensConfig.powerType === 'antiGlare' ? 'Anti Glare' : item.lensConfig.powerType === 'blueBlock' ? 'Blue Block' : item.lensConfig.powerType === 'photochromic' ? 'Photochromic' : 'Colour'}</p>
                                                                )}
                                                                {item.lensConfig.lensColor && (
                                                                    <p>• Color: {item.lensConfig.lensColor}</p>
                                                                )}
                                                                {item.lensConfig.powerRange && (
                                                                    <p>• Power: {item.lensConfig.powerRange === 'upto5' ? 'Upto +/- 5' : 'Upto +/- 10'}</p>
                                                                )}
                                                                {item.lensConfig.lensPrice > 0 && (
                                                                    <p className="text-amber-600 font-medium">Lens: +₹{item.lensConfig.lensPrice}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemoveFromCart(item)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <div className="flex items-center justify-between mt-4">
                                                {/* Quantity Controls */}
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                                                            className="h-8 w-8 border-amber-200 hover:border-amber-400 hover:bg-amber-50"
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </Button>
                                                        <span className="text-base font-medium text-black w-8 text-center">
                                                            {item.quantity}
                                                        </span>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                                                            disabled={item.quantity >= getAvailableStock(item, item.selectedColor)}
                                                            className="h-8 w-8 border-amber-200 hover:border-amber-400 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                    {/* Stock info */}
                                                    <span className="text-xs text-black/40">
                                                        {getAvailableStock(item, item.selectedColor)} in stock
                                                    </span>
                                                    {/* Stock error message */}
                                                    {stockErrors[String(getItemKey(item))] && (
                                                        <span className="text-xs text-red-500 flex items-center gap-1">
                                                            <AlertCircle className="h-3 w-3" />
                                                            {stockErrors[String(getItemKey(item))]}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Price */}
                                                <div className="text-right">
                                                    <p className="text-lg font-[600] text-amber-600">
                                                        ₹{(((item.selectedColorPrice || item.price) + (item.lensConfig?.lensPrice || 0)) * item.quantity).toFixed(2)}
                                                    </p>
                                                    {item.quantity > 1 && (
                                                        <p className="text-xs text-black/50">₹{(item.selectedColorPrice || item.price) + (item.lensConfig?.lensPrice || 0)} each</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <Card className="border-amber-200/60 rounded-2xl lg:sticky lg:top-24">
                            <CardContent className="p-6">
                                <h2 className="text-2xl font-[600] text-black mb-6">Order Summary</h2>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-black/70">
                                        <span>Subtotal</span>
                                        <span className="font-medium">₹{totalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-black/70">
                                        <span>Platform Charges</span>
                                        <span className="font-medium">₹{siteSettings.platformCharges.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-black/70">
                                        <span>Delivery Charges</span>
                                        <span className="font-medium">{siteSettings.deliveryCharges > 0 ? `₹${siteSettings.deliveryCharges.toFixed(2)}` : <span className="text-green-600">Free</span>}</span>
                                    </div>

                                    <div className="border-t border-amber-200 pt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-[600] text-black">Total</span>
                                            <span className="text-2xl font-[600] text-amber-600">
                                                ₹{grandTotal.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => navigate('/checkout')}
                                    className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 text-base font-medium shadow-lg shadow-amber-200 mb-3"
                                >
                                    Proceed to Checkout
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={() => navigate('/')}
                                    className="w-full border-amber-200 hover:border-amber-400 hover:bg-amber-50"
                                >
                                    Continue Shopping
                                </Button>

                                {/* Promo Code */}
                                <div className="mt-6 pt-6 border-t border-amber-200">
                                    <p className="text-sm font-medium text-black mb-2">Promo Code</p>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Enter code"
                                            className="flex-1 px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400 text-sm"
                                        />
                                        <Button
                                            variant="outline"
                                            className="border-amber-200 hover:border-amber-400 hover:bg-amber-50"
                                        >
                                            Apply
                                        </Button>
                                    </div>
                                </div>

                                {/* Benefits */}
                                <div className="mt-6 pt-6 border-t border-amber-200 space-y-2">
                                    <p className="text-xs text-black/50 flex items-center gap-2">
                                        <span className="w-1 h-1 bg-amber-500 rounded-full"></span>
                                        Free shipping on all orders
                                    </p>
                                    <p className="text-xs text-black/50 flex items-center gap-2">
                                        <span className="w-1 h-1 bg-amber-500 rounded-full"></span>
                                        30-day return policy
                                    </p>
                                    <p className="text-xs text-black/50 flex items-center gap-2">
                                        <span className="w-1 h-1 bg-amber-500 rounded-full"></span>
                                        1-year warranty included
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
