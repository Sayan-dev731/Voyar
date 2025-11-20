import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { Product, CartItem } from '@/types/product'

interface CartContextType {
    items: CartItem[]
    addToCart: (product: Product, quantity?: number, selectedColor?: string) => void
    removeFromCart: (productId: number | string) => void
    updateQuantity: (productId: number | string, quantity: number) => void
    clearCart: () => void
    totalItems: number
    totalPrice: number
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
        const saved = localStorage.getItem('cart')
        return saved ? JSON.parse(saved) : []
    })

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items))
    }, [items])

    const addToCart = (product: Product, quantity = 1, selectedColor?: string) => {
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
    }

    const removeFromCart = (productId: number | string) => {
        setItems(currentItems => currentItems.filter(item =>
            (typeof productId === 'string' ? item._id !== productId : item.id !== productId)
        ))
    }

    const updateQuantity = (productId: number | string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId)
            return
        }

        setItems(currentItems =>
            currentItems.map(item =>
                (typeof productId === 'string' ? item._id === productId : item.id === productId)
                    ? { ...item, quantity }
                    : item
            )
        )
    }

    const clearCart = () => {
        setItems([])
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
                totalPrice
            }}
        >
            {children}
        </CartContext.Provider>
    )
}
