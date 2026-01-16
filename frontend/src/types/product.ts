export interface ColorVariant {
    name: string
    value: string
    price: number
    quantity: number
}

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
    colors?: ColorVariant[]
    stock?: number
    inStock?: boolean
}

// Lens configuration types
export type LensType = 'withPower' | 'zeroPower' | 'frameOnly'
export type PowerType = 'antiGlare' | 'blueBlock' | 'photochromic' | 'colour'
export type PowerRange = 'upto5' | 'upto10'
export type PrescriptionMethod = 'upload' | 'manual' | 'emailLater'

export interface Prescription {
    rightEye: { sph: string; cyl: string; axis: string }
    leftEye: { sph: string; cyl: string; axis: string }
}

export interface LensConfiguration {
    lensType: LensType
    powerType?: PowerType
    lensColor?: string
    powerRange?: PowerRange
    prescription?: Prescription
    prescriptionMethod?: PrescriptionMethod
    prescriptionFile?: string
    lensPrice: number
}

// Lens settings from backend
export interface LensColor {
    name: string
    colorCode: string
    price: number
}

export interface PowerTypeConfig {
    enabled: boolean
    price: number
    label: string
}

export interface PowerRangeConfig {
    price: number
    label: string
}

export interface LensSettings {
    powerTypes: {
        antiGlare: PowerTypeConfig
        blueBlock: PowerTypeConfig
        photochromic: PowerTypeConfig
        colour: PowerTypeConfig
    }
    powerRanges: {
        upto5: PowerRangeConfig
        upto10: PowerRangeConfig
    }
    lensColors: LensColor[]
}

export interface CartItem extends Product {
    quantity: number
    selectedColor?: string
    selectedColorPrice?: number
    lensConfig?: LensConfiguration
    cartItemId?: string // Unique ID for items with lens config
}
