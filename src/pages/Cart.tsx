import { useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCart } from '@/context/CartContext'

export const Cart = () => {
    const navigate = useNavigate()
    const { items, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart()

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
                            <Card key={item._id || item.id} className="overflow-hidden border-amber-200/60 rounded-2xl">
                                <CardContent className="p-4 sm:p-6">
                                    <div className="flex gap-4">
                                        {/* Image */}
                                        <div
                                            className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-amber-50 to-white cursor-pointer"
                                            onClick={() => navigate(`/product/${item._id || item.id}`)}
                                        >
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover mix-blend-multiply hover:scale-105 transition-transform duration-300"
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
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeFromCart(item._id || item.id!)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <div className="flex items-center justify-between mt-4">
                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => updateQuantity(item._id || item.id!, item.quantity - 1)}
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
                                                        onClick={() => updateQuantity(item._id || item.id!, item.quantity + 1)}
                                                        className="h-8 w-8 border-amber-200 hover:border-amber-400 hover:bg-amber-50"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>

                                                {/* Price */}
                                                <div className="text-right">
                                                    <p className="text-lg font-[600] text-amber-600">
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </p>
                                                    {item.quantity > 1 && (
                                                        <p className="text-xs text-black/50">${item.price} each</p>
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
                        <Card className="border-amber-200/60 rounded-2xl sticky top-24">
                            <CardContent className="p-6">
                                <h2 className="text-2xl font-[600] text-black mb-6">Order Summary</h2>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-black/70">
                                        <span>Subtotal</span>
                                        <span className="font-medium">${totalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-black/70">
                                        <span>Shipping</span>
                                        <span className="font-medium text-green-600">Free</span>
                                    </div>
                                    <div className="flex justify-between text-black/70">
                                        <span>Tax (estimated)</span>
                                        <span className="font-medium">${(totalPrice * 0.1).toFixed(2)}</span>
                                    </div>

                                    <div className="border-t border-amber-200 pt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-[600] text-black">Total</span>
                                            <span className="text-2xl font-[600] text-amber-600">
                                                ${(totalPrice * 1.1).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Button className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 text-base font-medium shadow-lg shadow-amber-200 mb-3">
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
