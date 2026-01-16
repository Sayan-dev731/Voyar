import { useState, useEffect } from 'react'
import { X, ArrowLeft, Check, Upload, Edit3, Mail, Eye, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type {
    LensType,
    PowerType,
    PowerRange,
    LensConfiguration,
    LensSettings,
    Prescription,
    PrescriptionMethod
} from '@/types/product'
import { API_URL } from '@/config/api'

interface LensSelectorProps {
    isOpen: boolean
    onClose: () => void
    onComplete: (lensConfig: LensConfiguration) => void
    productName: string
    productImage: string
}

// SPH values from -20 to +20 in 0.25 increments
const SPH_VALUES = Array.from({ length: 161 }, (_, i) => {
    const val = -20 + i * 0.25
    return val === 0 ? '0.00' : (val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2))
})

// CYL values from -6 to 0 in 0.25 increments
const CYL_VALUES = Array.from({ length: 25 }, (_, i) => {
    const val = -6 + i * 0.25
    return val === 0 ? '0.00' : val.toFixed(2)
})

// AXIS values from 1 to 180
const AXIS_VALUES = Array.from({ length: 180 }, (_, i) => String(i + 1))

const defaultLensSettings: LensSettings = {
    powerTypes: {
        antiGlare: { enabled: true, price: 499, label: 'Anti Glare Lenses' },
        blueBlock: { enabled: true, price: 699, label: 'Blue Block Lenses' },
        photochromic: { enabled: true, price: 1299, label: 'Photochromic Lens' },
        colour: { enabled: true, price: 899, label: 'Colour Lenses' }
    },
    powerRanges: {
        upto5: { price: 0, label: 'UPTO +/- 5' },
        upto10: { price: 899, label: 'UPTO +/- 10' }
    },
    lensColors: [
        { name: 'Dark Black', colorCode: '#1a1a2e', price: 0 },
        { name: 'Light Black', colorCode: '#4a4a5a', price: 0 },
        { name: 'Light Yellow', colorCode: '#c4b454', price: 0 },
        { name: 'Light Blue', colorCode: '#7eb8da', price: 0 },
        { name: 'Dark Blue', colorCode: '#2e4a6e', price: 0 },
        { name: 'Light Grey', colorCode: '#9e9e9e', price: 0 },
        { name: 'Dark Brown', colorCode: '#5c4033', price: 0 }
    ]
}

export const LensSelector = ({
    isOpen,
    onClose,
    onComplete,
    productName,
    productImage
}: LensSelectorProps) => {
    const [step, setStep] = useState(1)
    const [lensSettings, setLensSettings] = useState<LensSettings>(defaultLensSettings)
    const [loading, setLoading] = useState(true)
    const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left')
    const [isAnimating, setIsAnimating] = useState(false)

    // Lens configuration state
    const [lensType, setLensType] = useState<LensType | null>(null)
    const [powerType, setPowerType] = useState<PowerType | null>(null)
    const [lensColor, setLensColor] = useState<string | null>(null)
    const [powerRange, setPowerRange] = useState<PowerRange | null>(null)
    const [prescriptionMethod, setPrescriptionMethod] = useState<PrescriptionMethod | null>(null)
    const [prescription, setPrescription] = useState<Prescription>({
        rightEye: { sph: '', cyl: '', axis: '' },
        leftEye: { sph: '', cyl: '', axis: '' }
    })
    const [showPrescriptionForm, setShowPrescriptionForm] = useState(false)

    // Modal visibility animation
    const [isVisible, setIsVisible] = useState(false)

    // Fetch lens settings from backend
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch(`${API_URL}/admin/settings/public`)
                if (response.ok) {
                    const data = await response.json()
                    if (data.lensSettings) {
                        setLensSettings(data.lensSettings)
                    }
                }
            } catch (error) {
                console.error('Failed to fetch lens settings:', error)
            } finally {
                setLoading(false)
            }
        }
        if (isOpen) {
            fetchSettings()
            // Delay visibility for entrance animation
            setTimeout(() => setIsVisible(true), 10)
        }
    }, [isOpen])

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setStep(1)
            setLensType(null)
            setPowerType(null)
            setLensColor(null)
            setPowerRange(null)
            setPrescriptionMethod(null)
            setPrescription({
                rightEye: { sph: '', cyl: '', axis: '' },
                leftEye: { sph: '', cyl: '', axis: '' }
            })
            setShowPrescriptionForm(false)
            setSlideDirection('left')
        } else {
            setIsVisible(false)
        }
    }, [isOpen])

    // Handle close with animation
    const handleClose = () => {
        setIsVisible(false)
        setTimeout(() => onClose(), 300)
    }

    // Calculate total lens price
    const calculateLensPrice = (): number => {
        if (lensType === 'frameOnly') return 0

        let price = 0

        // Add power type price
        if (powerType && lensSettings.powerTypes[powerType]) {
            price += lensSettings.powerTypes[powerType].price
        }

        // Add power range price (only for withPower)
        if (lensType === 'withPower' && powerRange && lensSettings.powerRanges[powerRange]) {
            price += lensSettings.powerRanges[powerRange].price
        }

        // Add lens color price (for colour lenses)
        if (powerType === 'colour' && lensColor) {
            const colorConfig = lensSettings.lensColors.find(c => c.name === lensColor)
            if (colorConfig) {
                price += colorConfig.price
            }
        }

        return price
    }

    // Animate step transition
    const animateToStep = (newStep: number, direction: 'left' | 'right') => {
        if (isAnimating) return
        setIsAnimating(true)
        setSlideDirection(direction)

        setTimeout(() => {
            setStep(newStep)
            setIsAnimating(false)
        }, 200)
    }

    // Handle step navigation
    const handleNext = () => {
        if (step === 1 && lensType === 'frameOnly') {
            // Skip all lens steps and complete
            onComplete({
                lensType: 'frameOnly',
                lensPrice: 0
            })
            handleClose()
            return
        }

        if (step === 2 && powerType !== 'colour') {
            // Skip lens color step for non-colour lenses
            if (lensType === 'zeroPower') {
                // Complete for zero power
                onComplete({
                    lensType: 'zeroPower',
                    powerType: powerType!,
                    lensPrice: calculateLensPrice()
                })
                handleClose()
                return
            }
            animateToStep(4, 'left') // Go to power range step
        } else if (step === 3) {
            if (lensType === 'zeroPower') {
                // Complete for zero power colour lens
                onComplete({
                    lensType: 'zeroPower',
                    powerType: 'colour',
                    lensColor: lensColor!,
                    lensPrice: calculateLensPrice()
                })
                handleClose()
                return
            }
            animateToStep(4, 'left')
        } else {
            animateToStep(step + 1, 'left')
        }
    }

    const handleBack = () => {
        if (showPrescriptionForm) {
            setShowPrescriptionForm(false)
            return
        }
        if (step === 4 && powerType !== 'colour') {
            animateToStep(2, 'right') // Skip color step going back
        } else {
            animateToStep(Math.max(1, step - 1), 'right')
        }
    }

    const handleComplete = () => {
        const config: LensConfiguration = {
            lensType: lensType!,
            powerType: powerType || undefined,
            lensColor: lensColor || undefined,
            powerRange: powerRange || undefined,
            prescription: prescriptionMethod === 'manual' ? prescription : undefined,
            prescriptionMethod: prescriptionMethod || undefined,
            lensPrice: calculateLensPrice()
        }
        onComplete(config)
        handleClose()
    }

    const isNextDisabled = () => {
        switch (step) {
            case 1: return !lensType
            case 2: return !powerType
            case 3: return !lensColor
            case 4: return !powerRange || !prescriptionMethod
            default: return false
        }
    }

    if (!isOpen) return null

    const steps = [
        { num: 1, label: 'Lens Type' },
        { num: 2, label: 'Power Type' },
        { num: 3, label: 'Lenses' },
        { num: 4, label: 'Add Power' }
    ]

    // Get animation classes
    const getContentAnimation = () => {
        if (isAnimating) {
            return slideDirection === 'left'
                ? 'translate-x-[-20px] opacity-0'
                : 'translate-x-[20px] opacity-0'
        }
        return 'translate-x-0 opacity-100'
    }

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${isVisible ? 'bg-black/50 backdrop-blur-sm' : 'bg-transparent'
                }`}
            onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
            <div
                className={`bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden flex flex-col transition-all duration-300 ease-out ${isVisible
                        ? 'scale-100 opacity-100 translate-y-0'
                        : 'scale-95 opacity-0 translate-y-4'
                    }`}
            >
                {/* Header with product info */}
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                                src={productImage}
                                alt={productName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=👓'
                                }}
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">{productName}</h4>
                            <p className="text-xs text-gray-500">Select your lens preferences</p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Step indicators */}
                    <div className="flex items-center justify-between px-2">
                        {steps.map((s, idx) => (
                            <div key={s.num} className="flex items-center">
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-all duration-300 ${step > s.num
                                                ? 'bg-teal-600 border-teal-600 text-white scale-100'
                                                : step === s.num
                                                    ? 'border-teal-600 text-teal-600 bg-teal-50 scale-110'
                                                    : 'border-gray-300 text-gray-400 bg-white'
                                            }`}
                                    >
                                        {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                                    </div>
                                    <span className={`text-[10px] mt-1 font-medium transition-colors duration-300 ${step >= s.num ? 'text-teal-700' : 'text-gray-400'
                                        }`}>
                                        {s.label}
                                    </span>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div className="flex-1 mx-1 mt-[-16px]">
                                        <div className={`h-0.5 w-full transition-all duration-500 ${step > s.num ? 'bg-teal-600' : 'bg-gray-200'
                                            }`} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content with transition */}
                <div className={`flex-1 overflow-y-auto p-6 transition-all duration-200 ease-out ${getContentAnimation()}`}>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm text-gray-500">Loading lens options...</p>
                        </div>
                    ) : showPrescriptionForm ? (
                        /* Prescription Entry Form */
                        <div className="space-y-5 animate-fadeIn">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowPrescriptionForm(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                                </button>
                                <h3 className="text-lg font-semibold text-gray-900">Enter Prescription</h3>
                            </div>

                            {/* Right Eye */}
                            <div className="bg-teal-50/50 rounded-xl p-4 border border-teal-100">
                                <h4 className="text-sm font-medium text-teal-800 mb-3 flex items-center gap-2">
                                    <Eye className="w-4 h-4" /> Right Eye (OD)
                                </h4>
                                <div className="grid grid-cols-3 gap-3">
                                    {['SPH', 'CYL', 'AXIS'].map((label, i) => (
                                        <div key={label}>
                                            <label className="block text-xs text-gray-500 mb-1.5">{label}</label>
                                            <select
                                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all bg-white"
                                                value={prescription.rightEye[label.toLowerCase() as keyof typeof prescription.rightEye]}
                                                onChange={(e) => setPrescription(prev => ({
                                                    ...prev,
                                                    rightEye: { ...prev.rightEye, [label.toLowerCase()]: e.target.value }
                                                }))}
                                            >
                                                <option value="">Select</option>
                                                {(label === 'SPH' ? SPH_VALUES : label === 'CYL' ? CYL_VALUES : AXIS_VALUES).map(v => (
                                                    <option key={v} value={v}>{v}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Left Eye */}
                            <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                                <h4 className="text-sm font-medium text-blue-800 mb-3 flex items-center gap-2">
                                    <Eye className="w-4 h-4" /> Left Eye (OS)
                                </h4>
                                <div className="grid grid-cols-3 gap-3">
                                    {['SPH', 'CYL', 'AXIS'].map((label) => (
                                        <div key={label}>
                                            <label className="block text-xs text-gray-500 mb-1.5">{label}</label>
                                            <select
                                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all bg-white"
                                                value={prescription.leftEye[label.toLowerCase() as keyof typeof prescription.leftEye]}
                                                onChange={(e) => setPrescription(prev => ({
                                                    ...prev,
                                                    leftEye: { ...prev.leftEye, [label.toLowerCase()]: e.target.value }
                                                }))}
                                            >
                                                <option value="">Select</option>
                                                {(label === 'SPH' ? SPH_VALUES : label === 'CYL' ? CYL_VALUES : AXIS_VALUES).map(v => (
                                                    <option key={v} value={v}>{v}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Button
                                onClick={() => {
                                    setPrescriptionMethod('manual')
                                    setShowPrescriptionForm(false)
                                }}
                                className="w-full h-12 bg-gradient-to-r from-teal-600 to-teal-700 text-white hover:from-teal-700 hover:to-teal-800 shadow-lg shadow-teal-200 transition-all"
                            >
                                <Check className="w-4 h-4 mr-2" />
                                Save Prescription
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Step 1: Lens Type */}
                            {step === 1 && (
                                <div className="space-y-4 animate-fadeIn">
                                    <h3 className="text-lg font-semibold text-gray-900">Choose your Lens Type</h3>

                                    {/* Info banner */}
                                    <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 border-l-4 border-blue-500 p-3 rounded-r-xl">
                                        <div className="flex items-start gap-2">
                                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <span className="text-white text-xs font-bold">i</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-blue-800">Prepaid Payment Required</p>
                                                <p className="text-xs text-blue-600">Lenses require prepaid payment • Frames available with COD</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {/* With Power */}
                                        <button
                                            onClick={() => setLensType('withPower')}
                                            className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left flex items-center justify-between group hover:shadow-md ${lensType === 'withPower'
                                                    ? 'border-teal-500 bg-teal-50 shadow-md'
                                                    : 'border-gray-200 hover:border-teal-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 ${lensType === 'withPower' ? 'bg-teal-100' : 'bg-gray-100'
                                                    }`}>
                                                    👓
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">With Power / Single Vision</p>
                                                    <p className="text-sm text-gray-500">Standard lens • Prepaid only</p>
                                                </div>
                                            </div>
                                            <ChevronRight className={`w-5 h-5 transition-all ${lensType === 'withPower' ? 'text-teal-600' : 'text-gray-400 group-hover:text-gray-600'
                                                }`} />
                                        </button>

                                        {/* Zero Power */}
                                        <button
                                            onClick={() => setLensType('zeroPower')}
                                            className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left flex items-center justify-between group hover:shadow-md ${lensType === 'zeroPower'
                                                    ? 'border-teal-500 bg-teal-50 shadow-md'
                                                    : 'border-gray-200 hover:border-teal-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 ${lensType === 'zeroPower' ? 'bg-blue-100' : 'bg-gray-100'
                                                    }`}>
                                                    🔍
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">Zero Power</p>
                                                    <p className="text-sm text-gray-500">No prescription needed • Prepaid only</p>
                                                </div>
                                            </div>
                                            <ChevronRight className={`w-5 h-5 transition-all ${lensType === 'zeroPower' ? 'text-teal-600' : 'text-gray-400 group-hover:text-gray-600'
                                                }`} />
                                        </button>

                                        {/* Frame Only */}
                                        <button
                                            onClick={() => setLensType('frameOnly')}
                                            className={`w-full p-4 rounded-xl border-2 border-dashed transition-all duration-200 text-left flex items-center justify-between group hover:shadow-md ${lensType === 'frameOnly'
                                                    ? 'border-amber-500 bg-amber-50 shadow-md'
                                                    : 'border-amber-300 bg-amber-50/30 hover:border-amber-400'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 ${lensType === 'frameOnly' ? 'bg-amber-100' : 'bg-amber-50'
                                                    }`}>
                                                    🛒
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        Frame Only
                                                        <span className="ml-2 text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">Quick Add</span>
                                                    </p>
                                                    <p className="text-sm text-gray-500">Just the frame, no lenses</p>
                                                </div>
                                            </div>
                                            <ChevronRight className={`w-5 h-5 transition-all ${lensType === 'frameOnly' ? 'text-amber-600' : 'text-amber-400 group-hover:text-amber-600'
                                                }`} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Power Type */}
                            {step === 2 && (
                                <div className="space-y-4 animate-fadeIn">
                                    <div className="flex items-center gap-3">
                                        <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                                        </button>
                                        <h3 className="text-lg font-semibold text-gray-900">Choose Power Type</h3>
                                    </div>

                                    <div className="space-y-3">
                                        {Object.entries(lensSettings.powerTypes).map(([key, config], index) => {
                                            if (!config.enabled) return null
                                            const powerKey = key as PowerType
                                            const icons: Record<PowerType, string> = {
                                                antiGlare: '✨',
                                                blueBlock: '🔵',
                                                photochromic: '🌓',
                                                colour: '🎨'
                                            }
                                            const isMostCommon = powerKey === 'antiGlare' || powerKey === 'blueBlock'

                                            return (
                                                <button
                                                    key={key}
                                                    onClick={() => setPowerType(powerKey)}
                                                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left flex items-center justify-between group hover:shadow-md ${powerType === powerKey
                                                            ? 'border-teal-500 bg-teal-50 shadow-md'
                                                            : 'border-gray-200 hover:border-teal-300'
                                                        }`}
                                                    style={{ animationDelay: `${index * 50}ms` }}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl transition-transform group-hover:scale-110 ${powerType === powerKey ? 'border-teal-500 bg-teal-100' : 'border-gray-300 bg-gray-50'
                                                            }`}>
                                                            {icons[powerKey]}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900 flex items-center gap-2">
                                                                {config.label}
                                                                {isMostCommon && (
                                                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Popular</span>
                                                                )}
                                                            </p>
                                                            <p className="text-sm text-gray-500">Positive, Negative or Cylindrical</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-sm font-semibold ${powerType === powerKey ? 'text-teal-600' : 'text-gray-600'}`}>
                                                            ₹{config.price}
                                                        </span>
                                                        <ChevronRight className={`w-5 h-5 transition-all ${powerType === powerKey ? 'text-teal-600' : 'text-gray-400'
                                                            }`} />
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Lens Color */}
                            {step === 3 && (
                                <div className="space-y-4 animate-fadeIn">
                                    <div className="flex items-center gap-3">
                                        <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                                        </button>
                                        <h3 className="text-lg font-semibold text-gray-900">Choose Lens Color</h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 max-h-[350px] overflow-y-auto">
                                        {lensSettings.lensColors.map((color, index) => (
                                            <button
                                                key={color.name}
                                                onClick={() => setLensColor(color.name)}
                                                className={`p-3 rounded-xl border-2 transition-all duration-200 text-left group hover:shadow-md ${lensColor === color.name
                                                        ? 'border-teal-500 bg-teal-50 shadow-md'
                                                        : 'border-gray-200 hover:border-teal-300'
                                                    }`}
                                                style={{ animationDelay: `${index * 30}ms` }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`w-10 h-10 rounded-full border-2 transition-transform group-hover:scale-110 ${lensColor === color.name ? 'border-teal-500 ring-2 ring-teal-200' : 'border-gray-300'
                                                            }`}
                                                        style={{ backgroundColor: color.colorCode }}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-gray-900 text-sm truncate">{color.name}</p>
                                                        {color.price > 0 && (
                                                            <p className="text-xs text-teal-600">+₹{color.price}</p>
                                                        )}
                                                    </div>
                                                    {lensColor === color.name && (
                                                        <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                                                            <Check className="w-3 h-3 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Add Power */}
                            {step === 4 && (
                                <div className="space-y-5 animate-fadeIn">
                                    <div className="flex items-center gap-3">
                                        <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                                        </button>
                                        <h3 className="text-lg font-semibold text-gray-900">Add Your Power</h3>
                                    </div>

                                    {/* Power Range Selection */}
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-700">Select Power Range</p>
                                        {Object.entries(lensSettings.powerRanges).map(([key, config]) => {
                                            const rangeKey = key as PowerRange
                                            const isFree = config.price === 0

                                            return (
                                                <button
                                                    key={key}
                                                    onClick={() => setPowerRange(rangeKey)}
                                                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left flex items-center justify-between group hover:shadow-md ${powerRange === rangeKey
                                                            ? 'border-teal-500 bg-teal-50 shadow-md'
                                                            : 'border-gray-200 hover:border-teal-300'
                                                        }`}
                                                >
                                                    <p className="font-medium text-gray-900">{config.label}</p>
                                                    <div className="flex items-center gap-2">
                                                        {isFree ? (
                                                            <>
                                                                <span className="text-sm text-gray-400 line-through">₹399</span>
                                                                <span className="font-semibold text-green-600">FREE</span>
                                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Save ₹399</span>
                                                            </>
                                                        ) : (
                                                            <span className="font-semibold text-gray-900">₹{config.price}</span>
                                                        )}
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${powerRange === rangeKey
                                                                ? 'border-teal-500 bg-teal-500'
                                                                : 'border-gray-300'
                                                            }`}>
                                                            {powerRange === rangeKey && <Check className="w-3 h-3 text-white" />}
                                                        </div>
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>

                                    {/* Prescription Methods */}
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2">Add Your Prescription</p>
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => setPrescriptionMethod('upload')}
                                                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left flex items-center gap-3 group hover:shadow-md ${prescriptionMethod === 'upload'
                                                        ? 'border-teal-500 bg-teal-50 shadow-md'
                                                        : 'border-gray-200 hover:border-teal-300'
                                                    }`}
                                            >
                                                <Upload className={`w-5 h-5 ${prescriptionMethod === 'upload' ? 'text-teal-600' : 'text-gray-500'}`} />
                                                <span className="font-medium text-gray-900">Upload File</span>
                                                {prescriptionMethod === 'upload' && (
                                                    <Check className="w-4 h-4 text-teal-500 ml-auto" />
                                                )}
                                            </button>

                                            <button
                                                onClick={() => setShowPrescriptionForm(true)}
                                                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left flex items-center gap-3 group hover:shadow-md ${prescriptionMethod === 'manual'
                                                        ? 'border-teal-500 bg-teal-50 shadow-md'
                                                        : 'border-gray-200 hover:border-teal-300'
                                                    }`}
                                            >
                                                <Edit3 className={`w-5 h-5 ${prescriptionMethod === 'manual' ? 'text-teal-600' : 'text-gray-500'}`} />
                                                <span className="font-medium text-gray-900">Enter Manually</span>
                                                {prescriptionMethod === 'manual' && (
                                                    <Check className="w-4 h-4 text-teal-500 ml-auto" />
                                                )}
                                            </button>

                                            <button
                                                onClick={() => setPrescriptionMethod('emailLater')}
                                                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left flex items-center gap-3 group hover:shadow-md ${prescriptionMethod === 'emailLater'
                                                        ? 'border-teal-500 bg-teal-50 shadow-md'
                                                        : 'border-gray-200 hover:border-teal-300'
                                                    }`}
                                            >
                                                <Mail className={`w-5 h-5 ${prescriptionMethod === 'emailLater' ? 'text-teal-600' : 'text-gray-500'}`} />
                                                <span className="font-medium text-gray-900">Email Later</span>
                                                {prescriptionMethod === 'emailLater' && (
                                                    <Check className="w-4 h-4 text-teal-500 ml-auto" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer with pricing and action */}
                {!showPrescriptionForm && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50/80 backdrop-blur">
                        {/* Price summary */}
                        {(lensType && lensType !== 'frameOnly') && (
                            <div className="flex items-center justify-between mb-3 text-sm">
                                <span className="text-gray-600">Lens Price</span>
                                <span className="font-semibold text-teal-600">₹{calculateLensPrice()}</span>
                            </div>
                        )}

                        {step === 4 ? (
                            <Button
                                onClick={handleComplete}
                                disabled={isNextDisabled()}
                                className="w-full h-12 bg-gradient-to-r from-teal-600 to-teal-700 text-white hover:from-teal-700 hover:to-teal-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-200 transition-all"
                            >
                                <Check className="w-4 h-4 mr-2" />
                                Save and Continue
                            </Button>
                        ) : (
                            <Button
                                onClick={handleNext}
                                disabled={isNextDisabled()}
                                className={`w-full h-12 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all ${lensType === 'frameOnly'
                                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-amber-200'
                                        : 'bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 shadow-teal-200'
                                    }`}
                            >
                                {lensType === 'frameOnly' ? 'Add to Cart' : 'Continue'}
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* CSS for custom animations */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    )
}
