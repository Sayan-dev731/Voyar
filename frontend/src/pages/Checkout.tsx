import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    MapPin,
    Plus,
    CreditCard,
    Check,
    Loader2,
    Shield,
    Package,
    AlertCircle,
    X,
    RefreshCw,
    PartyPopper,
    ShoppingBag,
    Truck,
    Mail,
    CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/config/api';

declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
    }
}

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: RazorpayResponse) => void;
    prefill: {
        name: string;
        email: string;
        contact: string;
    };
    notes: {
        orderId: string;
    };
    theme: {
        color: string;
    };
    modal?: {
        ondismiss?: () => void;
    };
}

interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

interface RazorpayInstance {
    open: () => void;
    close: () => void;
}

interface Address {
    _id: string;
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    type: 'home' | 'work' | 'other';
    isDefault: boolean;
}

interface AddressForm {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    type: 'home' | 'work' | 'other';
    isDefault: boolean;
}

const initialAddressForm: AddressForm = {
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    type: 'home',
    isDefault: false
};

// Helper function to convert Google Drive link
const convertGoogleDriveLink = (url: string): string => {
    if (!url) return url;
    if (url.includes('drive.google.com/thumbnail')) return url;

    const drivePatterns = [
        /https:\/\/drive\.google\.com\/file\/d\/([^/]+)\/view/,
        /https:\/\/drive\.google\.com\/file\/d\/([^/]+)/,
        /https:\/\/drive\.google\.com\/uc\?id=([^&]+)/,
    ];

    for (const pattern of drivePatterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
        }
    }
    return url;
};

// Load Razorpay script
const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
        if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export default function Checkout() {
    const navigate = useNavigate();
    const { items, totalPrice, clearCart } = useCart();
    const { user, token, isAuthenticated, refreshProfile } = useAuth();

    const [step, setStep] = useState<'address' | 'payment' | 'processing' | 'success'>('address');
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [showAddAddress, setShowAddAddress] = useState(false);
    const [addressForm, setAddressForm] = useState<AddressForm>(initialAddressForm);
    const [loading, setLoading] = useState(false);
    const [addressLoading, setAddressLoading] = useState(true);
    const [error, setError] = useState('');
    const [orderId, setOrderId] = useState('');

    // Payment mode selection
    const [paymentMode, setPaymentMode] = useState<'razorpay' | 'cod'>('razorpay');

    // CAPTCHA state
    const [captchaCode, setCaptchaCode] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [captchaError, setCaptchaError] = useState('');

    // Success modal state
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Site settings for charges
    const [siteSettings, setSiteSettings] = useState({
        platformCharges: 0,
        deliveryCharges: 0,
        codEnabled: true
    });

    const totalAmount = totalPrice + siteSettings.platformCharges + siteSettings.deliveryCharges;

    // Fetch site settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch(`${API_URL}/admin/settings/public`);
                if (response.ok) {
                    const data = await response.json();
                    setSiteSettings({
                        platformCharges: data.platformCharges || 0,
                        deliveryCharges: data.deliveryCharges || 0,
                        codEnabled: data.codEnabled !== false
                    });
                }
            } catch (error) {
                console.error('Failed to fetch site settings:', error);
            }
        };
        fetchSettings();
    }, []);

    // Generate CAPTCHA code
    const generateCaptcha = useCallback(() => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCaptchaCode(code);
        setCaptchaInput('');
        setCaptchaError('');
    }, []);

    // Generate CAPTCHA when payment step loads (for COD)
    useEffect(() => {
        if (step === 'payment' && paymentMode === 'cod') {
            generateCaptcha();
        }
    }, [step, paymentMode, generateCaptcha]);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/checkout' } });
            return;
        }

        // Don't redirect to cart if we're on success or processing step
        if (items.length === 0 && step !== 'success' && step !== 'processing') {
            navigate('/cart');
            return;
        }

        // Fetch addresses from API with loading state
        const fetchAddresses = async () => {
            setAddressLoading(true);
            try {
                const response = await fetch(`${API_URL}/users/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    const userAddresses = data.user.addresses || [];
                    setAddresses(userAddresses);
                    const defaultAddr = userAddresses.find((a: Address) => a.isDefault);
                    if (defaultAddr) {
                        setSelectedAddress(defaultAddr);
                    } else if (userAddresses.length > 0) {
                        setSelectedAddress(userAddresses[0]);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch addresses:', error);
                // Fallback to user context addresses
                if (user?.addresses) {
                    setAddresses(user.addresses);
                    const defaultAddr = user.addresses.find(a => a.isDefault);
                    if (defaultAddr) setSelectedAddress(defaultAddr);
                }
            } finally {
                setAddressLoading(false);
            }
        };

        fetchAddresses();
    }, [isAuthenticated, items, navigate, token, user, step]);

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/users/addresses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(addressForm)
            });

            const data = await response.json();

            if (response.ok) {
                await refreshProfile();
                setShowAddAddress(false);
                setAddressForm(initialAddressForm);
                // Refresh addresses
                if (data.addresses) {
                    setAddresses(data.addresses);
                    if (!selectedAddress && data.addresses.length > 0) {
                        setSelectedAddress(data.addresses[data.addresses.length - 1]);
                    }
                }
            } else {
                setError(data.message || 'Failed to add address');
            }
        } catch (err) {
            console.error('Add address error:', err);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleProceedToPayment = () => {
        if (!selectedAddress) {
            setError('Please select a delivery address');
            return;
        }
        setError('');
        setStep('payment');
    };

    // Razorpay Payment Handler
    const handleRazorpayPayment = async () => {
        setError('');
        setLoading(true);

        try {
            // Load Razorpay script
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                setError('Failed to load payment gateway. Please try again.');
                setLoading(false);
                return;
            }

            // Create Razorpay order on backend
            const orderData = {
                userId: user?.id,
                customerName: user?.name,
                customerEmail: user?.email,
                customerPhone: selectedAddress?.phone || user?.phone,
                items: items.map(item => ({
                    product: item._id || item.id,
                    productName: item.name,
                    productImage: item.image,
                    quantity: item.quantity,
                    price: (item.selectedColorPrice || item.price) + (item.lensConfig?.lensPrice || 0),
                    selectedColor: item.selectedColor,
                    lensConfig: item.lensConfig ? {
                        lensType: item.lensConfig.lensType,
                        powerType: item.lensConfig.powerType,
                        lensColor: item.lensConfig.lensColor,
                        powerRange: item.lensConfig.powerRange,
                        prescription: item.lensConfig.prescription,
                        prescriptionMethod: item.lensConfig.prescriptionMethod,
                        prescriptionFile: item.lensConfig.prescriptionFile,
                        lensPrice: item.lensConfig.lensPrice
                    } : undefined
                })),
                totalAmount: totalAmount,
                shippingAddress: {
                    name: selectedAddress?.name,
                    phone: selectedAddress?.phone,
                    street: selectedAddress?.street,
                    city: selectedAddress?.city,
                    state: selectedAddress?.state,
                    zipCode: selectedAddress?.zipCode,
                    country: selectedAddress?.country
                }
            };

            const response = await fetch(`${API_URL}/payment/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.insufficientStock) {
                    setError(`${data.message}. Please update your cart and try again.`);
                    setTimeout(() => navigate('/cart'), 3000);
                } else {
                    setError(data.message || 'Failed to create payment order');
                }
                setLoading(false);
                return;
            }

            // Configure Razorpay options
            const options: RazorpayOptions = {
                key: data.key,
                amount: data.amount,
                currency: data.currency,
                name: 'Voyar Eyewear',
                description: 'Premium Eyewear Purchase',
                order_id: data.razorpayOrderId,
                handler: async (response: RazorpayResponse) => {
                    // Payment successful - verify on backend
                    setStep('processing');
                    try {
                        const verifyResponse = await fetch(`${API_URL}/payment/verify`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                orderId: data.orderId
                            })
                        });

                        const verifyData = await verifyResponse.json();

                        if (verifyResponse.ok && verifyData.success) {
                            setOrderId(verifyData.orderId);
                            clearCart();
                            setStep('success');
                            setTimeout(() => setShowSuccessModal(true), 500);
                        } else {
                            setError(verifyData.message || 'Payment verification failed');
                            setStep('payment');
                        }
                    } catch (err) {
                        console.error('Payment verification error:', err);
                        setError('Payment verification failed. Please contact support.');
                        setStep('payment');
                    }
                },
                prefill: {
                    name: user?.name || '',
                    email: user?.email || '',
                    contact: selectedAddress?.phone || user?.phone || ''
                },
                notes: {
                    orderId: data.orderId
                },
                theme: {
                    color: '#f59e0b'
                },
                modal: {
                    ondismiss: async () => {
                        // Payment cancelled by user
                        try {
                            await fetch(`${API_URL}/payment/failure`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`
                                },
                                body: JSON.stringify({
                                    orderId: data.orderId,
                                    razorpay_order_id: data.razorpayOrderId,
                                    reason: 'Payment cancelled by user'
                                })
                            });
                        } catch (err) {
                            console.error('Failed to record payment cancellation:', err);
                        }
                        setLoading(false);
                    }
                }
            };

            // Open Razorpay checkout
            const razorpay = new window.Razorpay(options);
            razorpay.open();
            setLoading(false);

        } catch (err) {
            console.error('Razorpay payment error:', err);
            setError('Failed to initiate payment. Please try again.');
            setLoading(false);
        }
    };

    const handleCODPayment = async () => {
        // Validate CAPTCHA
        if (captchaInput.toLowerCase() !== captchaCode.toLowerCase()) {
            setCaptchaError('Invalid CAPTCHA. Please try again.');
            generateCaptcha();
            return;
        }

        setError('');
        setCaptchaError('');
        setStep('processing');

        // Create COD order
        try {
            const orderData = {
                userId: user?.id,
                customerName: user?.name,
                customerEmail: user?.email,
                customerPhone: selectedAddress?.phone || user?.phone,
                items: items.map(item => ({
                    product: item._id || item.id,
                    productName: item.name,
                    productImage: item.image,
                    quantity: item.quantity,
                    price: (item.selectedColorPrice || item.price) + (item.lensConfig?.lensPrice || 0),
                    selectedColor: item.selectedColor,
                    lensConfig: item.lensConfig ? {
                        lensType: item.lensConfig.lensType,
                        powerType: item.lensConfig.powerType,
                        lensColor: item.lensConfig.lensColor,
                        powerRange: item.lensConfig.powerRange,
                        prescription: item.lensConfig.prescription,
                        prescriptionMethod: item.lensConfig.prescriptionMethod,
                        prescriptionFile: item.lensConfig.prescriptionFile,
                        lensPrice: item.lensConfig.lensPrice
                    } : undefined
                })),
                totalAmount: totalAmount,
                shippingAddress: {
                    name: selectedAddress?.name,
                    phone: selectedAddress?.phone,
                    street: selectedAddress?.street,
                    city: selectedAddress?.city,
                    state: selectedAddress?.state,
                    zipCode: selectedAddress?.zipCode,
                    country: selectedAddress?.country
                }
            };

            const response = await fetch(`${API_URL}/payment/cod`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setOrderId(data.orderId);
                clearCart();
                setStep('success');
                setTimeout(() => setShowSuccessModal(true), 500);
            } else {
                if (data.insufficientStock) {
                    setError(`${data.message}. Please update your cart and try again.`);
                    setTimeout(() => navigate('/cart'), 3000);
                } else {
                    setError(data.message || 'Failed to create order');
                }
                setStep('payment');
            }
        } catch (err) {
            console.error('Order creation error:', err);
            setError('Failed to process order. Please try again.');
            setStep('payment');
        }
    };

    const handlePayment = () => {
        if (paymentMode === 'razorpay') {
            handleRazorpayPayment();
        } else {
            handleCODPayment();
        }
    };

    // Redirect if not authenticated or cart is empty
    // Don't render if not authenticated or if cart is empty AND not on success/processing step
    if (!isAuthenticated || (items.length === 0 && step !== 'success' && step !== 'processing')) {
        return null;
    }

    return (
        <div className="min-h-screen pt-20 sm:pt-24 pb-16 bg-gradient-to-b from-white via-amber-50/30 to-white">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => step === 'address' ? navigate('/cart') : setStep('address')}
                        className="mb-4 text-black/60 hover:text-amber-600 hover:bg-amber-50"
                        disabled={step === 'processing' || step === 'success'}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {step === 'address' ? 'Back to Cart' : 'Back to Address'}
                    </Button>
                    <h1 className="text-4xl sm:text-5xl font-[600] text-black">Checkout</h1>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    <div className={`flex items-center gap-2 ${step === 'address' ? 'text-amber-600' : 'text-green-600'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'address' ? 'bg-amber-600 text-white' : 'bg-green-600 text-white'
                            }`}>
                            {step !== 'address' ? <Check className="h-4 w-4" /> : '1'}
                        </div>
                        <span className="text-sm font-medium">Address</span>
                    </div>
                    <div className="w-12 h-px bg-amber-200" />
                    <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-amber-600' :
                        step === 'processing' || step === 'success' ? 'text-green-600' : 'text-black/40'
                        }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-amber-600 text-white' :
                            step === 'processing' || step === 'success' ? 'bg-green-600 text-white' : 'bg-gray-200 text-black/40'
                            }`}>
                            {step === 'success' ? <Check className="h-4 w-4" /> : '2'}
                        </div>
                        <span className="text-sm font-medium">Payment</span>
                    </div>
                    <div className="w-12 h-px bg-amber-200" />
                    <div className={`flex items-center gap-2 ${step === 'success' ? 'text-green-600' : 'text-black/40'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'success' ? 'bg-green-600 text-white' : 'bg-gray-200 text-black/40'
                            }`}>
                            {step === 'success' ? <Check className="h-4 w-4" /> : '3'}
                        </div>
                        <span className="text-sm font-medium">Complete</span>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
                        <AlertCircle className="h-5 w-5" />
                        {error}
                    </div>
                )}

                <div className={`grid ${step === 'success' ? 'grid-cols-1' : 'lg:grid-cols-3'} gap-8`}>
                    {/* Main Content */}
                    <div className={step === 'success' ? 'col-span-1' : 'lg:col-span-2'}>
                        {/* Address Step */}
                        {step === 'address' && (
                            <div className="space-y-6">
                                <Card className="border-amber-200/60 rounded-2xl">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xl font-[600] text-black flex items-center gap-2">
                                                <MapPin className="h-5 w-5 text-amber-600" />
                                                Delivery Address
                                            </h2>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setShowAddAddress(true)}
                                                className="border-amber-200 hover:border-amber-400"
                                                disabled={addressLoading}
                                            >
                                                <Plus className="h-4 w-4 mr-1" />
                                                Add New
                                            </Button>
                                        </div>

                                        {/* Address Loading Skeleton */}
                                        {addressLoading ? (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-center py-8">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
                                                        <p className="text-sm text-black/60">Loading your addresses...</p>
                                                    </div>
                                                </div>
                                                {/* Skeleton cards */}
                                                {[1, 2].map((i) => (
                                                    <div key={i} className="p-4 border-2 border-amber-100 rounded-xl animate-pulse">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1 space-y-2">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="h-5 w-32 bg-amber-100 rounded"></div>
                                                                    <div className="h-4 w-16 bg-amber-50 rounded-full"></div>
                                                                </div>
                                                                <div className="h-4 w-24 bg-amber-50 rounded"></div>
                                                                <div className="h-4 w-64 bg-amber-50 rounded"></div>
                                                                <div className="h-4 w-20 bg-amber-50 rounded"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : addresses.length === 0 ? (
                                            <div className="text-center py-8">
                                                <MapPin className="h-12 w-12 text-amber-200 mx-auto mb-3" />
                                                <p className="text-black/60 mb-4">No saved addresses</p>
                                                <Button
                                                    onClick={() => setShowAddAddress(true)}
                                                    className="bg-amber-600 text-white hover:bg-amber-700"
                                                >
                                                    Add Address
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="grid gap-4">
                                                {addresses.map((addr) => (
                                                    <div
                                                        key={addr._id}
                                                        onClick={() => setSelectedAddress(addr)}
                                                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedAddress?._id === addr._id
                                                            ? 'border-amber-500 bg-amber-50'
                                                            : 'border-amber-200/60 hover:border-amber-400'
                                                            }`}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="font-medium text-black">{addr.name}</span>
                                                                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full uppercase">
                                                                        {addr.type}
                                                                    </span>
                                                                    {addr.isDefault && (
                                                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                                                            Default
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-black/60">{addr.phone}</p>
                                                                <p className="text-sm text-black/60 mt-1">
                                                                    {addr.street}, {addr.city}, {addr.state} - {addr.zipCode}
                                                                </p>
                                                                <p className="text-sm text-black/60">{addr.country}</p>
                                                            </div>
                                                            {selectedAddress?._id === addr._id && (
                                                                <Check className="h-5 w-5 text-amber-600" />
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Button
                                    onClick={handleProceedToPayment}
                                    disabled={!selectedAddress}
                                    className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 text-base font-medium shadow-lg shadow-amber-200"
                                >
                                    Continue to Payment
                                </Button>
                            </div>
                        )}

                        {/* Payment Step */}
                        {step === 'payment' && (
                            <div className="space-y-6">
                                <Card className="border-amber-200/60 rounded-2xl">
                                    <CardContent className="p-6">
                                        <h2 className="text-xl font-[600] text-black flex items-center gap-2 mb-6">
                                            <CreditCard className="h-5 w-5 text-amber-600" />
                                            Payment Method
                                        </h2>

                                        {/* Payment Mode Selection */}
                                        <div className={`grid gap-4 mb-6 ${siteSettings.codEnabled ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                            <button
                                                onClick={() => setPaymentMode('razorpay')}
                                                className={`p-4 border-2 rounded-xl transition-all flex flex-col items-center gap-2 relative ${paymentMode === 'razorpay'
                                                    ? 'border-amber-500 bg-amber-50'
                                                    : 'border-amber-200 hover:border-amber-400'
                                                    }`}
                                            >
                                                <img
                                                    src="https://razorpay.com/favicon.png"
                                                    alt="Razorpay"
                                                    className="h-8 w-8"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                                <span className="font-medium text-black">Online Payment</span>
                                                <span className="text-xs text-black/60">Cards, UPI, Netbanking</span>
                                                {paymentMode === 'razorpay' && (
                                                    <CheckCircle2 className="h-5 w-5 text-amber-600 absolute top-2 right-2" />
                                                )}
                                            </button>
                                            {siteSettings.codEnabled && (
                                                <button
                                                    onClick={() => {
                                                        setPaymentMode('cod');
                                                        generateCaptcha();
                                                    }}
                                                    className={`p-4 border-2 rounded-xl transition-all flex flex-col items-center gap-2 relative ${paymentMode === 'cod'
                                                        ? 'border-amber-500 bg-amber-50'
                                                        : 'border-amber-200 hover:border-amber-400'
                                                        }`}
                                                >
                                                    <Truck className="h-8 w-8 text-amber-600" />
                                                    <span className="font-medium text-black">Cash on Delivery</span>
                                                    <span className="text-xs text-black/60">Pay when delivered</span>
                                                    {paymentMode === 'cod' && (
                                                        <CheckCircle2 className="h-5 w-5 text-amber-600 absolute top-2 right-2" />
                                                    )}
                                                </button>
                                            )}
                                        </div>

                                        {/* Razorpay Info */}
                                        {paymentMode === 'razorpay' && (
                                            <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-200">
                                                <div className="flex items-start gap-3">
                                                    <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                                                    <div>
                                                        <p className="font-medium text-blue-900">Secure Payment via Razorpay</p>
                                                        <p className="text-sm text-blue-700 mt-1">
                                                            Pay securely using Credit/Debit Cards, UPI, Net Banking, Wallets & more.
                                                            Your payment information is encrypted and secure.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* COD Payment Info */}
                                        {paymentMode === 'cod' && (
                                            <>
                                                <div className="bg-green-50 p-4 rounded-xl mb-6 border border-green-200">
                                                    <div className="flex items-start gap-3">
                                                        <Truck className="h-5 w-5 text-green-600 mt-0.5" />
                                                        <div>
                                                            <p className="font-medium text-green-900">Cash on Delivery</p>
                                                            <p className="text-sm text-green-700 mt-1">
                                                                Pay in cash when your order is delivered to your doorstep.
                                                                Please keep exact change ready for the delivery person.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* CAPTCHA Verification */}
                                                <div className="border border-amber-200 rounded-xl p-4">
                                                    <h3 className="text-sm font-medium text-black/70 mb-3 flex items-center gap-2">
                                                        <Shield className="h-4 w-4 text-amber-600" />
                                                        Security Verification
                                                    </h3>
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="flex-1 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg p-4 text-center select-none">
                                                            <span className="text-2xl font-mono font-bold tracking-[0.5em] text-amber-800" style={{
                                                                textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                                                                letterSpacing: '0.3em',
                                                                fontStyle: 'italic'
                                                            }}>
                                                                {captchaCode}
                                                            </span>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={generateCaptcha}
                                                            className="border-amber-200 hover:border-amber-400"
                                                        >
                                                            <RefreshCw className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={captchaInput}
                                                        onChange={(e) => {
                                                            setCaptchaInput(e.target.value);
                                                            setCaptchaError('');
                                                        }}
                                                        placeholder="Enter the code above"
                                                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${captchaError ? 'border-red-400 bg-red-50' : 'border-amber-200'
                                                            }`}
                                                    />
                                                    {captchaError && (
                                                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                                            <AlertCircle className="h-4 w-4" />
                                                            {captchaError}
                                                        </p>
                                                    )}
                                                </div>
                                            </>
                                        )}

                                        {/* Delivery Address Summary */}
                                        <div className="mt-6 pt-6 border-t border-amber-200">
                                            <h3 className="text-sm font-medium text-black/70 mb-2">Delivering to:</h3>
                                            <p className="text-sm text-black">{selectedAddress?.name}</p>
                                            <p className="text-sm text-black/60">
                                                {selectedAddress?.street}, {selectedAddress?.city}, {selectedAddress?.state} - {selectedAddress?.zipCode}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Button
                                    onClick={handlePayment}
                                    disabled={loading}
                                    className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 text-base font-medium shadow-lg shadow-amber-200"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Shield className="mr-2 h-5 w-5" />
                                            {paymentMode === 'razorpay' ? 'Pay with Razorpay' : 'Place COD Order'} - ₹{totalAmount.toFixed(2)}
                                        </>
                                    )}
                                </Button>

                                <p className="text-center text-xs text-black/50">
                                    {paymentMode === 'razorpay' ? 'Your payment is secure and encrypted' : 'Pay cash when your order arrives'}
                                </p>
                            </div>
                        )}

                        {/* Processing Step */}
                        {step === 'processing' && (
                            <Card className="border-amber-200/60 rounded-2xl">
                                <CardContent className="p-12 text-center">
                                    <Loader2 className="h-16 w-16 animate-spin text-amber-600 mx-auto mb-6" />
                                    <h2 className="text-2xl font-[600] text-black mb-2">Processing Payment</h2>
                                    <p className="text-black/60">Please wait while we verify your payment...</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Success Step */}
                        {step === 'success' && (
                            <Card className="border-amber-200/60 rounded-2xl overflow-hidden relative min-h-[600px]">
                                {/* Confetti Animation */}
                                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                                    {[...Array(50)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="confetti-piece absolute"
                                            style={{
                                                left: `${Math.random() * 100}%`,
                                                top: `-10px`,
                                                width: `${Math.random() * 10 + 5}px`,
                                                height: `${Math.random() * 10 + 5}px`,
                                                backgroundColor: ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'][Math.floor(Math.random() * 7)],
                                                borderRadius: Math.random() > 0.5 ? '50%' : '0',
                                                animation: `confetti-fall ${Math.random() * 3 + 2}s linear ${Math.random() * 2}s infinite`,
                                                transform: `rotate(${Math.random() * 360}deg)`,
                                            }}
                                        />
                                    ))}
                                </div>

                                <style>{`
                                    @keyframes confetti-fall {
                                        0% {
                                            transform: translateY(0) rotate(0deg);
                                            opacity: 1;
                                        }
                                        100% {
                                            transform: translateY(100vh) rotate(720deg);
                                            opacity: 0;
                                        }
                                    }
                                    @keyframes pulse-glow {
                                        0%, 100% {
                                            box-shadow: 0 0 20px rgba(34, 197, 94, 0.4);
                                        }
                                        50% {
                                            box-shadow: 0 0 40px rgba(34, 197, 94, 0.6);
                                        }
                                    }
                                    @keyframes bounce-in {
                                        0% {
                                            transform: scale(0);
                                            opacity: 0;
                                        }
                                        50% {
                                            transform: scale(1.2);
                                        }
                                        100% {
                                            transform: scale(1);
                                            opacity: 1;
                                        }
                                    }
                                    @keyframes slide-up {
                                        0% {
                                            transform: translateY(30px);
                                            opacity: 0;
                                        }
                                        100% {
                                            transform: translateY(0);
                                            opacity: 1;
                                        }
                                    }
                                `}</style>

                                <CardContent className="p-12 text-center relative z-10 bg-white">
                                    {/* Main Success Icon with Animation */}
                                    <div
                                        className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
                                        style={{ animation: 'bounce-in 0.6s ease-out, pulse-glow 2s ease-in-out infinite' }}
                                    >
                                        <CheckCircle2 className="h-12 w-12 text-white" />
                                    </div>

                                    {/* Payment Success Banner with Animation */}
                                    <div
                                        className="bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border-2 border-green-300 rounded-2xl p-8 mb-8 shadow-lg"
                                        style={{ animation: 'slide-up 0.5s ease-out 0.3s backwards' }}
                                    >
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <PartyPopper className="h-8 w-8 text-amber-500" />
                                                <span className="text-4xl">🎉</span>
                                                <PartyPopper className="h-8 w-8 text-amber-500 transform scale-x-[-1]" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-green-800 font-bold text-3xl mb-2">Payment Successful!</p>
                                                <p className="text-green-600 text-lg">Your payment has been processed successfully</p>
                                            </div>
                                            <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full">
                                                <Shield className="h-5 w-5 text-green-600" />
                                                <span className="text-green-700 font-medium text-sm">Secured by Razorpay</span>
                                            </div>
                                        </div>
                                    </div>

                                    <h2
                                        className="text-3xl font-[600] text-black mb-2"
                                        style={{ animation: 'slide-up 0.5s ease-out 0.5s backwards' }}
                                    >
                                        Order Placed Successfully! 🎉
                                    </h2>
                                    <p
                                        className="text-black/60 mb-6"
                                        style={{ animation: 'slide-up 0.5s ease-out 0.6s backwards' }}
                                    >
                                        Thank you for your purchase. Your order has been confirmed and placed successfully.
                                    </p>
                                    {orderId && (
                                        <p
                                            className="text-sm text-black/50 mb-6"
                                            style={{ animation: 'slide-up 0.5s ease-out 0.7s backwards' }}
                                        >
                                            Order ID: <span className="font-mono text-amber-600 bg-amber-50 px-2 py-1 rounded">{orderId}</span>
                                        </p>
                                    )}

                                    {/* What happens next */}
                                    <div
                                        className="bg-amber-50 rounded-xl p-6 mb-6 text-left"
                                        style={{ animation: 'slide-up 0.5s ease-out 0.8s backwards' }}
                                    >
                                        <h3 className="text-lg font-semibold text-black mb-4">What happens next?</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <Mail className="h-4 w-4 text-amber-700" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-black">Order Confirmation</p>
                                                    <p className="text-sm text-black/60">You'll receive an email with your order details</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <Package className="h-4 w-4 text-amber-700" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-black">Processing</p>
                                                    <p className="text-sm text-black/60">We'll prepare your order for shipping (1-2 days)</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <Truck className="h-4 w-4 text-amber-700" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-black">Shipping</p>
                                                    <p className="text-sm text-black/60">Your eyewear will be on its way! (3-5 business days)</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className="flex flex-col sm:flex-row gap-4 justify-center"
                                        style={{ animation: 'slide-up 0.5s ease-out 0.9s backwards' }}
                                    >
                                        <Button
                                            onClick={() => navigate('/orders')}
                                            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-lg text-lg px-8 py-6"
                                            size="lg"
                                        >
                                            <ShoppingBag className="mr-2 h-6 w-6" />
                                            Go to My Orders
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => navigate('/')}
                                            className="border-amber-300 hover:border-amber-500 hover:bg-amber-50 text-lg px-8 py-6"
                                            size="lg"
                                        >
                                            Continue Shopping
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Order Summary */}
                    {step !== 'success' && (
                        <div className="lg:col-span-1">
                            <Card className="border-amber-200/60 rounded-2xl lg:sticky lg:top-24">
                                <CardContent className="p-6">
                                    <h2 className="text-xl font-[600] text-black mb-4">Order Summary</h2>

                                    {/* Items */}
                                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                                        {items.map((item) => (
                                            <div key={item._id || item.id} className="flex gap-3">
                                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-amber-50 flex-shrink-0">
                                                    <img
                                                        src={convertGoogleDriveLink(item.image)}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-black truncate">{item.name}</p>
                                                    <p className="text-xs text-black/50">Qty: {item.quantity}</p>
                                                    <p className="text-sm font-medium text-amber-600">
                                                        ₹{(item.price * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t border-amber-200 pt-4 space-y-2">
                                        <div className="flex justify-between text-sm text-black/70">
                                            <span>Subtotal</span>
                                            <span>₹{totalPrice.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-black/70">
                                            <span>Platform Charges</span>
                                            <span>₹{siteSettings.platformCharges.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-black/70">
                                            <span>Delivery Charges</span>
                                            <span>{siteSettings.deliveryCharges > 0 ? `₹${siteSettings.deliveryCharges.toFixed(2)}` : <span className="text-green-600">Free</span>}</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-[600] text-black pt-2 border-t border-amber-200">
                                            <span>Total</span>
                                            <span className="text-amber-600">₹{totalAmount.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Address Modal */}
            {showAddAddress && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-lg border-amber-200/60 rounded-2xl">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-[600] text-black">Add New Address</h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowAddAddress(false)}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <form onSubmit={handleAddAddress} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-black/70 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={addressForm.name}
                                            onChange={(e) => setAddressForm(prev => ({ ...prev, name: e.target.value }))}
                                            required
                                            className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-black/70 mb-1">Phone</label>
                                        <input
                                            type="tel"
                                            value={addressForm.phone}
                                            onChange={(e) => setAddressForm(prev => ({ ...prev, phone: e.target.value }))}
                                            required
                                            className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-black/70 mb-1">Street Address</label>
                                    <input
                                        type="text"
                                        value={addressForm.street}
                                        onChange={(e) => setAddressForm(prev => ({ ...prev, street: e.target.value }))}
                                        required
                                        className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-black/70 mb-1">City</label>
                                        <input
                                            type="text"
                                            value={addressForm.city}
                                            onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                                            required
                                            className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-black/70 mb-1">State</label>
                                        <input
                                            type="text"
                                            value={addressForm.state}
                                            onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                                            required
                                            className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-black/70 mb-1">PIN Code</label>
                                        <input
                                            type="text"
                                            value={addressForm.zipCode}
                                            onChange={(e) => setAddressForm(prev => ({ ...prev, zipCode: e.target.value }))}
                                            required
                                            className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-black/70 mb-1">Address Type</label>
                                        <select
                                            value={addressForm.type}
                                            onChange={(e) => setAddressForm(prev => ({ ...prev, type: e.target.value as 'home' | 'work' | 'other' }))}
                                            className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                        >
                                            <option value="home">Home</option>
                                            <option value="work">Work</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isDefault"
                                        checked={addressForm.isDefault}
                                        onChange={(e) => setAddressForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                                        className="w-4 h-4 text-amber-600 border-amber-300 rounded"
                                    />
                                    <label htmlFor="isDefault" className="text-sm text-black/70">
                                        Set as default address
                                    </label>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowAddAddress(false)}
                                        className="flex-1 border-amber-200"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-amber-600 text-white hover:bg-amber-700"
                                    >
                                        {loading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            'Save Address'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Success Popup Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <Card className="w-full max-w-md border-amber-200/60 rounded-2xl animate-scaleIn">
                        <CardContent className="p-8 text-center relative overflow-hidden">
                            {/* Confetti effect */}
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute top-0 left-1/4 w-2 h-2 bg-amber-400 rounded-full animate-confetti1"></div>
                                <div className="absolute top-0 left-1/2 w-2 h-2 bg-green-400 rounded-full animate-confetti2"></div>
                                <div className="absolute top-0 left-3/4 w-2 h-2 bg-blue-400 rounded-full animate-confetti3"></div>
                                <div className="absolute top-0 left-1/3 w-2 h-2 bg-pink-400 rounded-full animate-confetti4"></div>
                                <div className="absolute top-0 left-2/3 w-2 h-2 bg-purple-400 rounded-full animate-confetti5"></div>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowSuccessModal(false)}
                                className="absolute top-4 right-4"
                            >
                                <X className="h-5 w-5" />
                            </Button>

                            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
                                <PartyPopper className="h-12 w-12 text-green-600" />
                            </div>

                            <h2 className="text-3xl font-bold text-black mb-2">🎉 Order Placed!</h2>
                            <p className="text-black/60 mb-4">
                                Congratulations! Your order has been successfully placed.
                            </p>

                            {orderId && (
                                <div className="bg-amber-50 rounded-lg p-3 mb-6">
                                    <p className="text-sm text-black/60">Order ID</p>
                                    <p className="font-mono font-bold text-amber-600 text-lg">{orderId}</p>
                                </div>
                            )}

                            <div className="space-y-3">
                                <Button
                                    onClick={() => {
                                        clearCart();
                                        setShowSuccessModal(false);
                                        navigate('/orders');
                                    }}
                                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
                                >
                                    <ShoppingBag className="mr-2 h-4 w-4" />
                                    Track Your Order
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        clearCart();
                                        setShowSuccessModal(false);
                                        navigate('/');
                                    }}
                                    className="w-full border-amber-200 hover:border-amber-400"
                                >
                                    Continue Shopping
                                </Button>
                            </div>

                            <p className="text-xs text-black/50 mt-4">
                                A confirmation email has been sent to your registered email address.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes confetti1 {
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(400px) rotate(720deg); opacity: 0; }
                }
                @keyframes confetti2 {
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(350px) rotate(-540deg); opacity: 0; }
                }
                @keyframes confetti3 {
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(420px) rotate(630deg); opacity: 0; }
                }
                @keyframes confetti4 {
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(380px) rotate(-450deg); opacity: 0; }
                }
                @keyframes confetti5 {
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(400px) rotate(540deg); opacity: 0; }
                }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
                .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
                .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
                .animate-confetti1 { animation: confetti1 2s ease-out infinite; }
                .animate-confetti2 { animation: confetti2 2.2s ease-out infinite; animation-delay: 0.1s; }
                .animate-confetti3 { animation: confetti3 1.8s ease-out infinite; animation-delay: 0.2s; }
                .animate-confetti4 { animation: confetti4 2.1s ease-out infinite; animation-delay: 0.15s; }
                .animate-confetti5 { animation: confetti5 1.9s ease-out infinite; animation-delay: 0.25s; }
            `}</style>
        </div>
    );
}
