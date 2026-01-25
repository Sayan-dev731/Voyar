import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { Product } from '@/types/product'
import { API_URL } from '@/config/api'
import { safeLocalStorage } from '@/lib/storage'

interface WishlistContextType {
    items: Product[]
    addToWishlist: (product: Product) => Promise<{ success: boolean; message?: string }>
    removeFromWishlist: (productId: number | string) => Promise<{ success: boolean; message?: string }>
    isInWishlist: (productId: number | string) => boolean
    clearWishlist: () => void
    syncWishlistWithServer: () => Promise<void>
    loading: boolean
    totalItems: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export const useWishlist = () => {
    const context = useContext(WishlistContext)
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider')
    }
    return context
}

interface WishlistProviderProps {
    children: ReactNode
}

export const WishlistProvider = ({ children }: WishlistProviderProps) => {
    const [items, setItems] = useState<Product[]>(() => {
        const saved = safeLocalStorage.getItem('wishlist')
        return saved ? JSON.parse(saved) : []
    })
    const [loading, setLoading] = useState(false)

    // Save to localStorage whenever items change
    useEffect(() => {
        safeLocalStorage.setItem('wishlist', JSON.stringify(items))
    }, [items])

    // Get token from localStorage
    const getToken = () => safeLocalStorage.getItem('userToken')

    // Sync wishlist with server (called on login)
    const syncWishlistWithServer = useCallback(async () => {
        const token = getToken()
        if (!token) return

        setLoading(true)
        try {
            // Get local wishlist items
            const localWishlist = JSON.parse(safeLocalStorage.getItem('wishlist') || '[]')

            if (localWishlist.length > 0) {
                // Sync local wishlist to server
                const productIds = localWishlist.map((item: Product) => item._id || item.id)

                await fetch(`${API_URL}/users/wishlist/sync`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ productIds }),
                })
            }

            // Fetch updated wishlist from server
            const response = await fetch(`${API_URL}/users/wishlist`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                setItems(data.wishlist || [])
                safeLocalStorage.setItem('wishlist', JSON.stringify(data.wishlist || []))
            }
        } catch (error) {
            console.error('Failed to sync wishlist with server:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    const addToWishlist = async (product: Product): Promise<{ success: boolean; message?: string }> => {
        const token = getToken()
        const productId = product._id || product.id

        // Check if already in wishlist
        if (isInWishlist(productId!)) {
            return { success: false, message: 'Product already in wishlist' }
        }

        // Update local state first for instant feedback
        setItems(currentItems => [...currentItems, product])

        // Sync with server if logged in
        if (token) {
            try {
                const response = await fetch(`${API_URL}/users/wishlist/add`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ productId }),
                })

                if (!response.ok) {
                    // Rollback on failure
                    setItems(currentItems => currentItems.filter(item =>
                        (item._id || item.id) !== productId
                    ))
                    const error = await response.json()
                    return { success: false, message: error.message || 'Failed to add to wishlist' }
                }
            } catch (error) {
                console.error('Failed to add to wishlist on server:', error)
                // Keep local state since server might be unavailable
            }
        }

        return { success: true, message: 'Added to wishlist' }
    }

    const removeFromWishlist = async (productId: number | string): Promise<{ success: boolean; message?: string }> => {
        const token = getToken()

        // Find item to potentially restore
        const removedItem = items.find(item => (item._id || item.id) === productId)

        // Update local state first
        setItems(currentItems => currentItems.filter(item =>
            (item._id || item.id) !== productId
        ))

        // Sync with server if logged in
        if (token) {
            try {
                const response = await fetch(`${API_URL}/users/wishlist/remove`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ productId }),
                })

                if (!response.ok) {
                    // Rollback on failure
                    if (removedItem) {
                        setItems(currentItems => [...currentItems, removedItem])
                    }
                    const error = await response.json()
                    return { success: false, message: error.message || 'Failed to remove from wishlist' }
                }
            } catch (error) {
                console.error('Failed to remove from wishlist on server:', error)
            }
        }

        return { success: true, message: 'Removed from wishlist' }
    }

    const isInWishlist = (productId: number | string): boolean => {
        return items.some(item => (item._id || item.id) === productId)
    }

    const clearWishlist = () => {
        setItems([])
        safeLocalStorage.removeItem('wishlist')
    }

    const totalItems = items.length

    return (
        <WishlistContext.Provider
            value={{
                items,
                addToWishlist,
                removeFromWishlist,
                isInWishlist,
                clearWishlist,
                syncWishlistWithServer,
                loading,
                totalItems
            }}
        >
            {children}
        </WishlistContext.Provider>
    )
}
