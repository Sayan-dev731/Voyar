import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { Product, CartItem } from '@/types/product'
import { API_URL } from '@/config/api'
import { safeLocalStorage } from '@/lib/storage'

interface CartContextType {
    items: CartItem[]
    addToCart: (product: Product, quantity?: number, selectedColor?: string) => void
    removeFromCart: (productId: number | string) => void
    updateQuantity: (productId: number | string, quantity: number) => void
    clearCart: () => void
    totalItems: number
    totalPrice: number
    syncCartWithServer: () => Promise<void>
    loading: boolean
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

    const addToCart = async (product: Product, quantity = 1, selectedColor?: string) => {
        const token = getToken()

        // Update local state first for instant feedback
        setItems(currentItems => {
            const existingItem = currentItems.find(item =>
                (item._id && item._id === product._id) || (item.id && item.id === product.id)
            )

            if (existingItem) {
                return currentItems.map(item =>
                    ((item._id && item._id === product._id) || (item.id && item.id === product.id))
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                )
            }

            return [...currentItems, { ...product, quantity, selectedColor }]
        })

        // Sync with server if logged in
        if (token) {
            try {
                await fetch(`${API_URL}/users/cart`, {
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
            } catch (error) {
                console.error('Failed to add to cart on server:', error)
            }
        }
    }

    const removeFromCart = async (productId: number | string) => {
        const token = getToken()

        // Update local state
        setItems(currentItems => currentItems.filter(item =>
            (typeof productId === 'string' ? item._id !== productId : item.id !== productId)
        ))

        // Sync with server if logged in
        if (token) {
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

    const updateQuantity = async (productId: number | string, quantity: number) => {
        const token = getToken()

        if (quantity <= 0) {
            removeFromCart(productId)
            return
        }

        // Update local state
        setItems(currentItems =>
            currentItems.map(item =>
                (typeof productId === 'string' ? item._id === productId : item.id === productId)
                    ? { ...item, quantity }
                    : item
            )
        )

        // Sync with server if logged in
        if (token) {
            try {
                await fetch(`${API_URL}/users/cart/${productId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ quantity }),
                })
            } catch (error) {
                console.error('Failed to update cart on server:', error)
            }
        }
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
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

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
                loading
            }}
        >
            {children}
        </CartContext.Provider>
    )
}
