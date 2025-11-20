export interface Product {
    id?: number
    _id?: string  // MongoDB ID
    name: string
    category: 'Sunglasses' | 'Eyeglasses' | 'Computer Glasses' | 'Sports Glasses'
    price: number
    image: string
    images?: string[]
    description: string
    detailedDescription?: string
    features?: string[]
    specifications?: {
        frameWidth?: string
        lensWidth?: string
        bridgeWidth?: string
        templeLength?: string
        material?: string
        weight?: string
        lensType?: string
        uvProtection?: string
    }
    colors?: { name: string; value: string }[]
    inStock?: boolean
    rating?: number
    reviews?: number
}

export interface CartItem extends Product {
    quantity: number
    selectedColor?: string
}
