import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { Product, CartItem, LensConfiguration } from '@/types/product'
import { API_URL } from '@/config/api'
import { safeLocalStorage } from '@/lib/storage'

interface CartContextType {
    items: CartItem[]
    addToCart: (product: Product, quantity?: number, selectedColor?: string, selectedColorPrice?: number, lensConfig?: LensConfiguration) => Promise<{ success: boolean; message?: string; availableStock?: number }>
    removeFromCart: (productId: number | string, cartItemId?: string) => void
    updateQuantity: (productId: number | string, quantity: number, cartItemId?: string) => Promise<{ success: boolean; message?: string; availableStock?: number }>
    clearCart: () => void
    totalItems: number
    totalPrice: number
    syncCartWithServer: () => Promise<void>
    loading: boolean
    getAvailableStock: (product: Product, selectedColor?: string) => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCart = () => {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}

interface CartProviderProps {
    children: ReactNode
}

export const CartProvider = ({ children }: CartProviderProps) => {
    const [items, setItems] = useState<CartItem[]>(() => {
        const saved = safeLocalStorage.getItem('cart')
        return saved ? JSON.parse(saved) : []
    })
    const [loading, setLoading] = useState(false)

    // Save to localStorage whenever items change
    useEffect(() => {
        safeLocalStorage.setItem('cart', JSON.stringify(items))
    }, [items])

    // Get token from localStorage
    const getToken = () => safeLocalStorage.getItem('userToken')

    // Sync cart with server (called on login)
    const syncCartWithServer = useCallback(async () => {
        const token = getToken()
        if (!token) return

        setLoading(true)
        try {
            // Get local cart items
            const localCart = JSON.parse(safeLocalStorage.getItem('cart') || '[]')

            if (localCart.length > 0) {
                // Sync local cart to server
                const syncItems = localCart.map((item: CartItem) => ({
                    productId: item._id || item.id,
                    quantity: item.quantity,
                    selectedColor: item.selectedColor,
                }))

                await fetch(`${API_URL}/users/cart/sync`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ items: syncItems }),
                })
            }

            // Fetch updated cart from server
            const response = await fetch(`${API_URL}/users/cart`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                // Transform server cart to local format
                const serverCart: CartItem[] = data.cart.map((item: { product: Product; quantity: number; selectedColor?: string }) => ({
                    ...item.product,
                    quantity: item.quantity,
                    selectedColor: item.selectedColor,
                }))
                setItems(serverCart)
                localStorage.setItem('cart', JSON.stringify(serverCart))
            }
        } catch (error) {
            console.error('Failed to sync cart with server:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    const addToCart = async (product: Product, quantity = 1, selectedColor?: string, selectedColorPrice?: number, lensConfig?: LensConfiguration): Promise<{ success: boolean; message?: string; availableStock?: number }> => {
        const token = getToken()

        // Calculate available stock
        let availableStock = 0
        if (selectedColor && product.colors && product.colors.length > 0) {
            const colorVariant = product.colors.find(c => c.name === selectedColor)
            availableStock = colorVariant?.quantity || 0
        } else {
            availableStock = product.stock || 0
        }

        // Get current cart quantity for this product
        const existingItem = items.find(item =>
            (item._id && item._id === product._id) || (item.id && item.id === product.id)
        )
        const currentCartQty = existingItem?.quantity || 0

        // Check if we can add the requested quantity
        if (currentCartQty + quantity > availableStock) {
            const canAdd = availableStock - currentCartQty
            if (canAdd <= 0) {
                return {
                    success: false,
                    message: `Maximum quantity already in cart. Only ${availableStock} available.`,
                    availableStock
                }
            }
            return {
                success: false,
                message: `Cannot add ${quantity} item(s). Only ${canAdd} more available.`,
                availableStock
            }
        }

        // Update local state first for instant feedback
        setItems(currentItems => {
            // For items with lens config, each lens configuration should be unique
            if (lensConfig) {
                // Check if exact same item with same lens config exists
                const existingWithSameLens = currentItems.find(item => {
                    const sameProduct = (item._id && item._id === product._id) || (item.id && item.id === product.id)
                    const sameColor = item.selectedColor === selectedColor
                    const sameLensConfig = item.lensConfig &&
                        item.lensConfig.lensType === lensConfig.lensType &&
                        item.lensConfig.powerType === lensConfig.powerType &&
                        item.lensConfig.lensColor === lensConfig.lensColor &&
                        item.lensConfig.powerRange === lensConfig.powerRange
                    return sameProduct && sameColor && sameLensConfig
                })

                if (existingWithSameLens) {
                    // Update quantity of existing item with same lens config
                    return currentItems.map(item => {
                        const sameProduct = (item._id && item._id === product._id) || (item.id && item.id === product.id)
                        const sameColor = item.selectedColor === selectedColor
                        const sameLensConfig = item.lensConfig &&
                            item.lensConfig.lensType === lensConfig.lensType &&
                            item.lensConfig.powerType === lensConfig.powerType &&
                            item.lensConfig.lensColor === lensConfig.lensColor &&
                            item.lensConfig.powerRange === lensConfig.powerRange
                        if (sameProduct && sameColor && sameLensConfig) {
                            return { ...item, quantity: item.quantity + quantity }
                        }
                        return item
                    })
                }

                // Add as new item with unique lens config
                // Generate a unique cart item ID for lens config items
                const uniqueCartId = `${product._id || product.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                return [...currentItems, { ...product, quantity, selectedColor, selectedColorPrice, lensConfig, cartItemId: uniqueCartId }]
            }

            // For items without lens config, merge by product ID
            const existingItem = currentItems.find(item =>
                ((item._id && item._id === product._id) || (item.id && item.id === product.id)) && !item.lensConfig
            )

            if (existingItem) {
                return currentItems.map(item =>
                    (((item._id && item._id === product._id) || (item.id && item.id === product.id)) && !item.lensConfig)
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                )
            }

            // Add as new item without lens config
            return [...currentItems, { ...product, quantity, selectedColor, selectedColorPrice, lensConfig }]
        })

        // Sync with server if logged in
        if (token) {
            try {
                const response = await fetch(`${API_URL}/users/cart`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        productId: product._id || product.id,
                        quantity,
                        selectedColor,
                    }),
                })

                if (!response.ok) {
                    const data = await response.json()
                    if (data.insufficientStock) {
                        // Revert local state change
                        setItems(currentItems => {
                            if (existingItem) {
                                return currentItems.map(item =>
                                    ((item._id && item._id === product._id) || (item.id && item.id === product.id))
                                        ? { ...item, quantity: item.quantity - quantity }
                                        : item
                                )
                            }
                            return currentItems.filter(item =>
                                !((item._id && item._id === product._id) || (item.id && item.id === product.id))
                            )
                        })
                        return { success: false, message: data.message, availableStock: data.availableStock }
                    }
                }
            } catch (error) {
                console.error('Failed to add to cart on server:', error)
            }
        }

        return { success: true }
    }

    const removeFromCart = async (productId: number | string, cartItemId?: string) => {
        const token = getToken()

        // Update local state - use cartItemId if provided (for lens config items)
        setItems(currentItems => currentItems.filter(item => {
            if (cartItemId && item.cartItemId) {
                return item.cartItemId !== cartItemId
            }
            return (typeof productId === 'string' ? item._id !== productId : item.id !== productId) || !!item.cartItemId
        }))

        // Sync with server if logged in (only for non-lens-config items)
        if (token && !cartItemId) {
            try {
                await fetch(`${API_URL}/users/cart/${productId}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
            } catch (error) {
                console.error('Failed to remove from cart on server:', error)
            }
        }
    }

    const updateQuantity = async (productId: number | string, quantity: number, cartItemId?: string): Promise<{ success: boolean; message?: string; availableStock?: number }> => {
        const token = getToken()

        if (quantity <= 0) {
            removeFromCart(productId, cartItemId)
            return { success: true }
        }

        // Find the item to get product details for stock check
        const item = items.find(item => {
            if (cartItemId && item.cartItemId) {
                return item.cartItemId === cartItemId
            }
            return (typeof productId === 'string' ? item._id === productId : item.id === productId) && !item.cartItemId
        })

        if (item) {
            // Calculate available stock
            let availableStock = 0
            if (item.selectedColor && item.colors && item.colors.length > 0) {
                const colorVariant = item.colors.find(c => c.name === item.selectedColor)
                availableStock = colorVariant?.quantity || 0
            } else {
                availableStock = item.stock || 0
            }

            // Check if requested quantity exceeds stock
            if (quantity > availableStock) {
                return {
                    success: false,
                    message: `Only ${availableStock} available in stock.`,
                    availableStock
                }
            }
        }

        // Update local state - use cartItemId if provided
        setItems(currentItems =>
            currentItems.map(item => {
                if (cartItemId && item.cartItemId) {
                    return item.cartItemId === cartItemId ? { ...item, quantity } : item
                }
                return ((typeof productId === 'string' ? item._id === productId : item.id === productId) && !item.cartItemId)
                    ? { ...item, quantity }
                    : item
            })
        )

        // Sync with server if logged in (only for non-lens-config items)
        if (token && !cartItemId) {
            try {
                const response = await fetch(`${API_URL}/users/cart/${productId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ quantity }),
                })

                if (!response.ok) {
                    const data = await response.json()
                    if (data.insufficientStock) {
                        // Revert to previous quantity
                        setItems(currentItems =>
                            currentItems.map(item =>
                                (typeof productId === 'string' ? item._id === productId : item.id === productId)
                                    ? { ...item, quantity: item.quantity }
                                    : item
                            )
                        )
                        return { success: false, message: data.message, availableStock: data.availableStock }
                    }
                }
            } catch (error) {
                console.error('Failed to update cart on server:', error)
            }
        }

        return { success: true }
    }

    const clearCart = async () => {
        const token = getToken()

        setItems([])

        // Sync with server if logged in
        if (token) {
            try {
                await fetch(`${API_URL}/users/cart`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
            } catch (error) {
                console.error('Failed to clear cart on server:', error)
            }
        }
    }

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = items.reduce((sum, item) => {
        const itemPrice = item.selectedColorPrice || item.price
        const lensPrice = item.lensConfig?.lensPrice || 0
        return sum + (itemPrice + lensPrice) * item.quantity
    }, 0)

    // Helper function to get available stock for a product
    const getAvailableStock = (product: Product, selectedColor?: string): number => {
        if (selectedColor && product.colors && product.colors.length > 0) {
            const colorVariant = product.colors.find(c => c.name === selectedColor)
            return colorVariant?.quantity || 0
        }
        return product.stock || 0
    }

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalItems,
                totalPrice,
                syncCartWithServer,
                loading,
                getAvailableStock
            }}
        >
            {children}
        </CartContext.Provider>
    )
}
