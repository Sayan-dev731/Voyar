import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/components/ui/toast'
import {
    Package,
    ShoppingBag,
    DollarSign,
    Users,
    Plus,
    Edit,
    Edit2,
    Trash2,
    LogOut,
    Eye,
    X,
    Image,
    Link,
    AlertCircle,
    Check,
    Settings,
    Shield,
    RefreshCw,
    Calendar,
    Mail,
    Phone,
    Clock,
    Activity,
    UserCheck,
    UserX,
    Download,
    MapPin,
    Save,
    Search,
    Filter,
    SlidersHorizontal,
    Truck,
    Navigation,
    FileText,
    Send,
    ExternalLink,
    TrendingUp
} from 'lucide-react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts'
import type { Product } from '@/types/product'
import { API_URL } from '@/config/api'
import PaymentTimeline from '@/components/PaymentTimeline'

interface ShiprocketData {
    orderId?: number
    shipmentId?: number
    awbCode?: string
    courierCompanyId?: number
    courierName?: string
    pickupScheduledDate?: string
    pickupTokenNumber?: string
    labelUrl?: string
    manifestUrl?: string
    invoiceUrl?: string
    shipmentStatus?: string
    shipmentStatusId?: number
    estimatedDeliveryDate?: string
    trackingHistory?: Array<{
        date: string
        status: string
        statusCode: string
        activity: string
        location: string
    }>
    lastTrackedAt?: string
    lastWebhookUpdate?: string
}

interface TrackingActivity {
    date: string
    status?: string
    statusCode?: string
    activity?: string
    location?: string
    'sr-status-label'?: string
}

interface TrackingDataResponse {
    tracking: {
        currentStatus?: string
        awbCode?: string
        courierName?: string
        estimatedDelivery?: string
        pickupDate?: string
        trackUrl?: string
        activities?: TrackingActivity[]
    }
    shiprocket?: ShiprocketData
    message?: string
}

interface LensConfigOrder {
    lensType: 'withPower' | 'zeroPower' | 'frameOnly'
    powerType?: 'antiGlare' | 'blueBlock' | 'photochromic' | 'colour'
    lensColor?: string
    powerRange?: 'upto5' | 'upto10'
    prescription?: {
        rightEye: { sph: string; cyl: string; axis: string }
        leftEye: { sph: string; cyl: string; axis: string }
    }
    prescriptionMethod?: 'upload' | 'manual' | 'emailLater'
    prescriptionFile?: string
    lensPrice: number
}

interface Order {
    _id: string
    customerName: string
    customerEmail: string
    customerPhone?: string
    items: Array<{
        productName: string
        productImage?: string
        quantity: number
        price: number
        selectedColor?: string
        lensConfig?: LensConfigOrder
        product?: {
            _id: string
            name: string
            category?: string
            brand?: string
            images?: string[]
            description?: string
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
            features?: string[]
        }
    }>
    totalAmount: number
    status: string
    paymentStatus?: string
    paymentMethod?: string
    paymentId?: string
    refundStatus?: 'not_applicable' | 'pending' | 'processing' | 'completed' | 'failed'
    refundId?: string
    refundAmount?: number
    refundInitiatedAt?: string
    refundCompletedAt?: string
    refundNotes?: string
    shippingAddress?: {
        name: string
        phone: string
        street: string
        city: string
        state: string
        zipCode: string
        country: string
    }
    shiprocket?: ShiprocketData
    createdAt: string
}

interface User {
    _id: string
    name: string
    email: string
    phone?: string
    isVerified: boolean
    createdAt: string
    addresses?: Array<{
        city: string
        state: string
    }>
}

interface Stats {
    totalOrders: number
    pendingOrders: number
    completedOrders: number
    totalRevenue: number
}

interface ProductFormData {
    name: string
    category: string
    image: string
    images: string[]
    description: string
    detailedDescription: string
    features: string[]
    specifications: {
        frameWidth: string
        lensWidth: string
        bridgeWidth: string
        templeLength: string
        material: string
        weight: string
        lensType: string
        uvProtection: string
    }
    colors: { name: string; value: string; price: string; quantity: string; inStock: boolean }[]
}

const initialProductForm: ProductFormData = {
    name: '',
    category: 'Sunglasses',
    image: '',
    images: [],
    description: '',
    detailedDescription: '',
    features: [''],
    specifications: {
        frameWidth: '',
        lensWidth: '',
        bridgeWidth: '',
        templeLength: '',
        material: '',
        weight: '',
        lensType: '',
        uvProtection: ''
    },
    colors: [{ name: '', value: '#000000', price: '', quantity: '0', inStock: true }]
}

// Helper function to convert Google Drive link to direct CDN URL (no CORS issues)
const convertGoogleDriveLink = (url: string, size = 'w1000'): string => {
    if (!url) return url;

    const drivePatterns = [
        /https:\/\/drive\.google\.com\/file\/d\/([^/?]+)/,
        /https:\/\/drive\.google\.com\/open\?id=([^&]+)/,
        /https:\/\/drive\.google\.com\/uc\?(?:export=view&)?id=([^&]+)/,
        /https:\/\/drive\.google\.com\/thumbnail\?(?:[^&]*&)?id=([^&]+)/,
        /https:\/\/lh3\.googleusercontent\.com\/d\/([^=?&]+)/,
    ];

    for (const pattern of drivePatterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return `https://lh3.googleusercontent.com/d/${match[1]}=${size}`;
        }
    }

    return url;
}

export const AdminDashboard = () => {
    const navigate = useNavigate()
    const { showToast, showConfirm } = useToast()
    const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'users' | 'settings'>('overview')
    const [products, setProducts] = useState<Product[]>([])
    const [orders, setOrders] = useState<Order[]>([])
    const [users, setUsers] = useState<User[]>([])
    const [stats, setStats] = useState<Stats>({
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalRevenue: 0
    })
    const [loading, setLoading] = useState(true)
    const [showAddProduct, setShowAddProduct] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [productForm, setProductForm] = useState<ProductFormData>(initialProductForm)
    const [newImageUrl, setNewImageUrl] = useState('')
    const [formError, setFormError] = useState('')
    const [formSuccess, setFormSuccess] = useState('')
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    const [saving, setSaving] = useState(false)
    const [showChangePassword, setShowChangePassword] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [showUserModal, setShowUserModal] = useState(false)
    const [editingUser, setEditingUser] = useState(false)
    const [userForm, setUserForm] = useState({ name: '', email: '', phone: '' })

    // Bulk selection state
    const [selectedProducts, setSelectedProducts] = useState<string[]>([])

    // Site settings state
    const [siteSettings, setSiteSettings] = useState({
        recoveryEmail: 'sayancodder731@gmail.com',
        siteName: 'Voyar Eyewear',
        supportEmail: 'support@voyar.com',
        platformCharges: 0,
        deliveryCharges: 0,
        codEnabled: true,
        pickupAddressConfigured: false,
        pickupAddress: {
            pickupLocationName: '',
            name: '',
            email: '',
            phone: '',
            address: '',
            address2: '',
            city: '',
            state: '',
            country: 'India',
            pincode: ''
        }
    })
    const [showEditSettings, setShowEditSettings] = useState(false)
    const [showEditPickupAddress, setShowEditPickupAddress] = useState(false)
    const [settingsForm, setSettingsForm] = useState({
        recoveryEmail: '',
        siteName: '',
        supportEmail: '',
        platformCharges: 0,
        deliveryCharges: 0,
        codEnabled: true,
        pickupAddress: {
            pickupLocationName: '',
            name: '',
            email: '',
            phone: '',
            address: '',
            address2: '',
            city: '',
            state: '',
            country: 'India',
            pincode: ''
        }
    })

    // Order details modal state
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false)

    // Order status update loading state
    const [statusUpdateLoading, setStatusUpdateLoading] = useState<string | null>(null)
    const [showStatusModal, setShowStatusModal] = useState<{ isOpen: boolean; orderId: string; newStatus: string; currentStatus: string } | null>(null)

    // Search and filter state for Products
    const [productSearch, setProductSearch] = useState('')
    const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all')
    const [productStockFilter, setProductStockFilter] = useState<string>('all')

    // Search and filter state for Orders
    const [orderSearch, setOrderSearch] = useState('')
    const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all')
    const [orderPaymentFilter, setOrderPaymentFilter] = useState<string>('all')
    const [orderDateFilter, setOrderDateFilter] = useState<string>('all')

    // Search and filter state for Users
    const [userSearch, setUserSearch] = useState('')
    const [userVerificationFilter, setUserVerificationFilter] = useState<string>('all')

    // Shiprocket shipment management state
    const [shipmentLoading, setShipmentLoading] = useState<string | null>(null)
    const [showTrackingModal, setShowTrackingModal] = useState<{ isOpen: boolean; order: Order | null }>({ isOpen: false, order: null })
    const [trackingData, setTrackingData] = useState<TrackingDataResponse | null>(null)
    const [trackingLoading, setTrackingLoading] = useState(false)

    // Lens settings state
    const [showEditLensSettings, setShowEditLensSettings] = useState(false)
    const [lensSettingsForm, setLensSettingsForm] = useState({
        powerTypes: {
            antiGlare: { enabled: true, price: 499, label: 'Anti Glare Lenses' },
            blueBlock: { enabled: true, price: 699, label: 'Blue Block Lenses' },
            photochromic: { enabled: true, price: 1299, label: 'Photochromic Lens' },
            colour: { enabled: true, price: 899, label: 'Colour Lenses' }
        },
        powerRanges: {
            upto5: { price: 0, label: 'UPTO +/- 5' },
            upto10: { price: 899, label: 'UPTO +/- 10' }
        }
    })


    // Chart data state
    const [revenueChartData, setRevenueChartData] = useState([
        { date: 'Jan 02', thisWeek: 0, lastWeek: 0, day: 'Day 1' },
        { date: 'Jan 03', thisWeek: 0, lastWeek: 0, day: 'Day 2' },
        { date: 'Jan 04', thisWeek: 0, lastWeek: 0, day: 'Day 3' },
        { date: 'Jan 05', thisWeek: 0, lastWeek: 0, day: 'Day 4' },
        { date: 'Jan 06', thisWeek: 0, lastWeek: 0, day: 'Day 5' },
        { date: 'Jan 07', thisWeek: 0, lastWeek: 0, day: 'Day 6' },
        { date: 'Jan 08', thisWeek: 0, lastWeek: 0, day: 'Day 7' }
    ])

    // Filtered data
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
            product.category.toLowerCase().includes(productSearch.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(productSearch.toLowerCase()))

        const matchesCategory = productCategoryFilter === 'all' || product.category === productCategoryFilter

        const matchesStock = productStockFilter === 'all' ||
            (productStockFilter === 'inStock' && product.inStock !== false) ||
            (productStockFilter === 'outOfStock' && product.inStock === false)

        return matchesSearch && matchesCategory && matchesStock
    })

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
            order.customerEmail.toLowerCase().includes(orderSearch.toLowerCase()) ||
            order._id.toLowerCase().includes(orderSearch.toLowerCase()) ||
            (order.customerPhone && order.customerPhone.includes(orderSearch))

        const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter

        const matchesPayment = orderPaymentFilter === 'all' || order.paymentStatus === orderPaymentFilter

        const orderDate = new Date(order.createdAt)
        const now = new Date()
        let matchesDate = true
        if (orderDateFilter === 'today') {
            matchesDate = orderDate.toDateString() === now.toDateString()
        } else if (orderDateFilter === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            matchesDate = orderDate >= weekAgo
        } else if (orderDateFilter === 'month') {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            matchesDate = orderDate >= monthAgo
        }

        return matchesSearch && matchesStatus && matchesPayment && matchesDate
    })

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
            user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
            (user.phone && user.phone.includes(userSearch))

        const matchesVerification = userVerificationFilter === 'all' ||
            (userVerificationFilter === 'verified' && user.isVerified) ||
            (userVerificationFilter === 'unverified' && !user.isVerified)

        return matchesSearch && matchesVerification
    })

    // Get unique categories from products
    const productCategories = [...new Set(products.map(p => p.category))].filter(Boolean)

    useEffect(() => {
        const token = localStorage.getItem('adminToken')
        if (!token) {
            navigate('/admin')
            return
        }
        fetchData()
    }, [navigate])

    const fetchData = async () => {
        const token = localStorage.getItem('adminToken')
        try {
            // Fetch products
            const productsRes = await fetch(`${API_URL}/products`)
            const productsData = await productsRes.json()
            const productList = Array.isArray(productsData) ? productsData : (productsData.products || [])
            setProducts(productList)

            // Fetch orders
            const ordersRes = await fetch(`${API_URL}/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (ordersRes.ok) {
                const ordersData = await ordersRes.json()
                setOrders(ordersData)
            }

            // Fetch users
            const usersRes = await fetch(`${API_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (usersRes.ok) {
                const usersData = await usersRes.json()
                setUsers(usersData.users || [])
            }

            // Fetch stats
            const statsRes = await fetch(`${API_URL}/orders/stats/summary`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (statsRes.ok) {
                const statsData = await statsRes.json()
                setStats(statsData)
                // Update chart data with real revenue data
                if (statsData.chartData && statsData.chartData.length > 0) {
                    setRevenueChartData(statsData.chartData)
                }
            }

            // Fetch site settings
            const settingsRes = await fetch(`${API_URL}/admin/settings`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (settingsRes.ok) {
                const settingsData = await settingsRes.json()
                setSiteSettings(settingsData)
                setSettingsForm(settingsData)
                // Load lens settings if available
                if (settingsData.lensSettings) {
                    setLensSettingsForm(settingsData.lensSettings)
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    // Custom tooltip for the chart
    const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; payload: { date: string; thisWeek: number; lastWeek: number } }> }) => {
        if (active && payload && payload.length) {
            const currentData = payload[0]?.payload
            const thisWeekValue = payload[0]?.value || 0
            const lastWeekValue = payload[1]?.value || 0

            return (
                <div
                    className="bg-white rounded-lg shadow-xl border border-gray-200 p-4"
                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                >
                    <p className="text-sm font-medium text-[#0d0d0d] mb-2">
                        {currentData?.date}
                    </p>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ background: '#3b82f6' }}></div>
                                <span className="text-xs text-[#525252]">This Week</span>
                            </div>
                            <span className="text-sm font-semibold text-[#0d0d0d]">
                                ₹{thisWeekValue.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ background: '#94a3b8' }}></div>
                                <span className="text-xs text-[#525252]">Last Week</span>
                            </div>
                            <span className="text-sm font-semibold text-[#0d0d0d]">
                                ₹{lastWeekValue.toLocaleString()}
                            </span>
                        </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-[#8a8a8a]">Change</span>
                            <span className={`text-xs font-medium ${thisWeekValue > lastWeekValue
                                ? 'text-[#16a34a]'
                                : 'text-[#dc2626]'
                                }`}>
                                {lastWeekValue > 0
                                    ? `${(((thisWeekValue - lastWeekValue) / lastWeekValue) * 100).toFixed(1)}%`
                                    : 'N/A'
                                }
                            </span>
                        </div>
                    </div>
                </div>
            )
        }
        return null
    }

    // Handle chart click
    const handleChartClick = (event?: unknown) => {
        const data = event as { activePayload?: Array<{ payload: { date: string; thisWeek: number; lastWeek: number } }> } | undefined
        if (data && data.activePayload && data.activePayload.length > 0) {
            const clickedData = data.activePayload[0].payload
            showToast(
                `${clickedData.date}: ₹${clickedData.thisWeek.toLocaleString()} revenue`,
                'info'
            )
        }
    }

    const handleUpdateSettings = async () => {
        const token = localStorage.getItem('adminToken')
        try {
            // Only send allowed fields to avoid validation errors
            const allowedSettings = {
                recoveryEmail: settingsForm.recoveryEmail,
                siteName: settingsForm.siteName,
                supportEmail: settingsForm.supportEmail,
                platformCharges: settingsForm.platformCharges,
                deliveryCharges: settingsForm.deliveryCharges,
                codEnabled: settingsForm.codEnabled,
                pickupAddress: settingsForm.pickupAddress
            }

            const res = await fetch(`${API_URL}/admin/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(allowedSettings)
            })
            if (res.ok) {
                const data = await res.json()
                setSiteSettings(data.settings)
                setShowEditSettings(false)
                setShowEditPickupAddress(false)
                showToast('Settings updated successfully!', 'success')
            } else {
                const error = await res.json()
                showToast(error.message || 'Failed to update settings', 'error')
            }
        } catch (error) {
            console.error('Error updating settings:', error)
            showToast('Error updating settings', 'error')
        }
    }

    const handleSaveLensSettings = async () => {
        const token = localStorage.getItem('adminToken')
        try {
            const res = await fetch(`${API_URL}/admin/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ lensSettings: lensSettingsForm })
            })
            if (res.ok) {
                const data = await res.json()
                setSiteSettings(data.settings)
                setShowEditLensSettings(false)
                showToast('Lens settings updated successfully!', 'success')
            } else {
                const error = await res.json()
                showToast(error.message || 'Failed to update lens settings', 'error')
            }
        } catch (error) {
            console.error('Error updating lens settings:', error)
            showToast('Error updating lens settings', 'error')
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
        navigate('/admin')
    }

    const handleDeleteProduct = async (id: number | string) => {
        showConfirm('Are you sure you want to delete this product?', async () => {
            const token = localStorage.getItem('adminToken')
            try {
                const response = await fetch(`${API_URL}/products/${id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (response.ok) {
                    fetchData()
                    showToast('Product deleted successfully', 'success')
                } else {
                    showToast('Failed to delete product', 'error')
                }
            } catch (error) {
                console.error('Error deleting product:', error)
                showToast('Error deleting product', 'error')
            }
        })
    }

    const handleUpdateOrderStatus = async (orderId: string, newStatus: string, skipConfirmation = false) => {
        const token = localStorage.getItem('adminToken')

        // Get the current order to check for cancellation warning
        const currentOrder = orders.find(o => o._id === orderId)

        // If changing to cancelled and it's a razorpay paid order, show confirmation first
        if (!skipConfirmation && newStatus === 'cancelled' && currentOrder?.paymentMethod === 'razorpay' && currentOrder?.paymentStatus === 'paid') {
            setShowStatusModal({
                isOpen: true,
                orderId,
                newStatus,
                currentStatus: currentOrder.status
            })
            return
        }

        setStatusUpdateLoading(orderId)
        try {
            const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            })

            const data = await response.json()

            if (response.ok) {
                // Check if refund was initiated
                if (data.refundInfo?.success) {
                    showToast('Order cancelled and refund initiated! It will be processed in 5-7 working days.', 'success')
                } else if (newStatus === 'cancelled' && data.refundInfo && !data.refundInfo.success) {
                    showToast(`Order cancelled. ${data.refundInfo.message || 'Refund could not be processed.'}`, 'warning')
                } else {
                    showToast('Order status updated successfully!', 'success')
                }
                fetchData()
            } else {
                showToast(data.message || 'Failed to update order status', 'error')
            }
        } catch (error) {
            console.error('Error updating order:', error)
            showToast('Error updating order status', 'error')
        } finally {
            setStatusUpdateLoading(null)
            setShowStatusModal(null)
        }
    }

    const handleDeleteOrder = async (orderId: string) => {
        showConfirm('Are you sure you want to delete this order? This action cannot be undone.', async () => {
            const token = localStorage.getItem('adminToken')
            try {
                const response = await fetch(`${API_URL}/orders/${orderId}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                })

                if (response.ok) {
                    showToast('Order deleted successfully!', 'success')
                    fetchData()
                } else {
                    const data = await response.json()
                    showToast(data.message || 'Failed to delete order', 'error')
                }
            } catch (error) {
                console.error('Error deleting order:', error)
                showToast('Error deleting order', 'error')
            }
        })
    }

    const handleGenerateBill = async (orderId: string) => {
        const token = localStorage.getItem('adminToken')
        try {
            showToast('Generating bill...', 'success')
            const response = await fetch(`${API_URL}/orders/${orderId}/generate-bill`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            })

            if (response.ok) {
                await response.json()
                showToast('Bill generated and sent to customer successfully!', 'success')
            } else {
                const data = await response.json()
                showToast(data.message || 'Failed to generate bill', 'error')
            }
        } catch (error) {
            console.error('Error generating bill:', error)
            showToast('Error generating bill', 'error')
        }
    }

    // ==================== Shiprocket Shipment Management ====================

    // Quick Ship - Create shipment, assign courier, and schedule pickup in one click
    const handleQuickShip = async (orderId: string) => {
        const token = localStorage.getItem('adminToken')
        setShipmentLoading(orderId)
        try {
            showToast('Creating shipment...', 'success')
            const response = await fetch(`${API_URL}/shiprocket/orders/${orderId}/quick-ship`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            })

            const data = await response.json()

            if (response.ok) {
                showToast(`Shipment created! AWB: ${data.shiprocket?.awbCode || 'Pending'}`, 'success')
                fetchData() // Refresh orders to get updated shiprocket data
            } else {
                showToast(data.message || 'Failed to create shipment', 'error')
            }
        } catch (error) {
            console.error('Error creating shipment:', error)
            showToast('Error creating shipment', 'error')
        } finally {
            setShipmentLoading(null)
        }
    }

    // Create Shipment Only
    const handleCreateShipment = async (orderId: string) => {
        const token = localStorage.getItem('adminToken')
        setShipmentLoading(orderId)
        try {
            const response = await fetch(`${API_URL}/shiprocket/orders/${orderId}/create-shipment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            })

            const data = await response.json()

            if (response.ok) {
                showToast('Shipment created in Shiprocket!', 'success')
                fetchData()
            } else {
                showToast(data.message || 'Failed to create shipment', 'error')
            }
        } catch (error) {
            console.error('Error creating shipment:', error)
            showToast('Error creating shipment', 'error')
        } finally {
            setShipmentLoading(null)
        }
    }

    // Generate Shipping Label
    const handleGenerateLabel = async (orderId: string) => {
        const token = localStorage.getItem('adminToken')
        setShipmentLoading(orderId)
        try {
            const response = await fetch(`${API_URL}/shiprocket/orders/${orderId}/generate-label`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            })

            const data = await response.json()

            if (response.ok && data.labelUrl) {
                window.open(data.labelUrl, '_blank')
                showToast('Label generated!', 'success')
                fetchData()
            } else {
                showToast(data.message || 'Failed to generate label', 'error')
            }
        } catch (error) {
            console.error('Error generating label:', error)
            showToast('Error generating label', 'error')
        } finally {
            setShipmentLoading(null)
        }
    }

    // View Tracking Details
    const handleViewTracking = async (order: Order) => {
        setShowTrackingModal({ isOpen: true, order })
        setTrackingLoading(true)
        setTrackingData(null)

        const token = localStorage.getItem('adminToken')
        try {
            const response = await fetch(`${API_URL}/shiprocket/admin/track/${order._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            const data = await response.json()

            if (response.ok) {
                setTrackingData(data)
            } else {
                showToast(data.message || 'Failed to fetch tracking', 'error')
            }
        } catch (error) {
            console.error('Error fetching tracking:', error)
            showToast('Error fetching tracking', 'error')
        } finally {
            setTrackingLoading(false)
        }
    }

    // Cancel Shipment
    const handleCancelShipment = async (orderId: string) => {
        showConfirm('Are you sure you want to cancel this shipment?', async () => {
            const token = localStorage.getItem('adminToken')
            setShipmentLoading(orderId)
            try {
                const response = await fetch(`${API_URL}/shiprocket/orders/${orderId}/cancel-shipment`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` }
                })

                const data = await response.json()

                if (response.ok) {
                    showToast('Shipment cancelled!', 'success')
                    fetchData()
                } else {
                    showToast(data.message || 'Failed to cancel shipment', 'error')
                }
            } catch (error) {
                console.error('Error cancelling shipment:', error)
                showToast('Error cancelling shipment', 'error')
            } finally {
                setShipmentLoading(null)
            }
        })
    }

    // Get shipment status badge color
    const getShipmentStatusColor = (status?: string) => {
        if (!status || status === 'not_created') return 'bg-gray-100 text-gray-600'
        if (status === 'delivered') return 'bg-green-100 text-green-700'
        if (status === 'shipped' || status === 'in_transit' || status === 'out_for_delivery') return 'bg-blue-100 text-blue-700'
        if (status === 'picked_up' || status === 'pickup_scheduled') return 'bg-purple-100 text-purple-700'
        if (status === 'awb_assigned' || status === 'label_generated') return 'bg-amber-100 text-amber-700'
        if (status === 'cancelled' || status === 'rto_initiated') return 'bg-red-100 text-red-700'
        return 'bg-gray-100 text-gray-600'
    }

    // ==================== End Shiprocket Functions ====================

    // Refresh data
    const handleRefresh = () => {
        fetchData()
    }

    // Export data to CSV
    const exportToCSV = (type: 'products' | 'orders' | 'users') => {
        let csvContent = ''
        let filename = ''

        if (type === 'products') {
            csvContent = 'ID,Name,Category,Price,Status\n'
            products.forEach(p => {
                csvContent += `"${p._id || p.id}","${p.name}","${p.category}","${p.price}","${p.inStock ? 'In Stock' : 'Out of Stock'}"\n`
            })
            filename = 'products_export.csv'
        } else if (type === 'orders') {
            csvContent = 'Order ID,Customer,Email,Total,Status,Date\n'
            orders.forEach(o => {
                csvContent += `"${o._id}","${o.customerName || 'N/A'}","${o.customerEmail || 'N/A'}","₹${o.totalAmount}","${o.status}","${new Date(o.createdAt).toLocaleDateString()}"\n`
            })
            filename = 'orders_export.csv'
        } else if (type === 'users') {
            csvContent = 'ID,Name,Email,Phone,Verified,Joined\n'
            users.forEach(u => {
                csvContent += `"${u._id}","${u.name}","${u.email}","${u.phone || 'N/A'}","${u.isVerified ? 'Yes' : 'No'}","${new Date(u.createdAt).toLocaleDateString()}"\n`
            })
            filename = 'users_export.csv'
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = filename
        link.click()
    }

    // Bulk Product Actions
    const handleSelectProduct = (productId: string) => {
        setSelectedProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        )
    }

    const handleSelectAllProducts = () => {
        if (selectedProducts.length === filteredProducts.length) {
            setSelectedProducts([])
        } else {
            setSelectedProducts(filteredProducts.map(p => String(p._id || p.id)))
        }
    }

    const handleBulkDeleteProducts = async () => {
        if (selectedProducts.length === 0) return
        showConfirm(`Are you sure you want to delete ${selectedProducts.length} product(s)? This action cannot be undone.`, async () => {
            const token = localStorage.getItem('adminToken')
            let successCount = 0
            let failCount = 0

            for (const productId of selectedProducts) {
                try {
                    const response = await fetch(`${API_URL}/products/${productId}`, {
                        method: 'DELETE',
                        headers: { Authorization: `Bearer ${token}` }
                    })
                    if (response.ok) {
                        successCount++
                    } else {
                        failCount++
                    }
                } catch {
                    failCount++
                }
            }

            if (successCount > 0) {
                showToast(`${successCount} product(s) deleted successfully!`, 'success')
                setSelectedProducts([])
                fetchData()
            }
            if (failCount > 0) {
                showToast(`Failed to delete ${failCount} product(s)`, 'error')
            }
        })
    }

    const handleExportProducts = () => {
        const productsToExport = selectedProducts.length > 0
            ? products.filter(p => selectedProducts.includes(String(p._id || p.id)))
            : filteredProducts

        const headers = ['Name', 'Category', 'Price', 'Stock', 'In Stock', 'Description', 'Colors']
        const rows = productsToExport.map(product => [
            `"${product.name}"`,
            `"${product.category}"`,
            product.price,
            product.colors?.reduce((sum, c) => sum + (c.quantity || 0), 0) || product.stock || 0,
            product.inStock !== false ? 'Yes' : 'No',
            `"${(product.description || '').replace(/"/g, '""')}"`,
            `"${product.colors?.map(c => `${c.name}(${c.quantity})`).join('; ') || ''}"`
        ])

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `voyar-products-${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        showToast(`Exported ${productsToExport.length} product(s)!`, 'success')
    }

    const handleBulkStockUpdate = async (inStock: boolean) => {
        if (selectedProducts.length === 0) return
        const token = localStorage.getItem('adminToken')
        let successCount = 0

        for (const productId of selectedProducts) {
            try {
                const response = await fetch(`${API_URL}/products/${productId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ inStock, stock: inStock ? 1 : 0 })
                })
                if (response.ok) successCount++
            } catch {
                // Continue with other products
            }
        }

        if (successCount > 0) {
            showToast(`Updated ${successCount} product(s) to ${inStock ? 'In Stock' : 'Out of Stock'}!`, 'success')
            setSelectedProducts([])
            fetchData()
        }
    }

    // User management functions
    const handleViewUser = (user: User) => {
        setSelectedUser(user)
        setUserForm({ name: user.name, email: user.email, phone: user.phone || '' })
        setEditingUser(false)
        setShowUserModal(true)
    }

    const handleEditUser = async () => {
        if (!selectedUser) return
        const token = localStorage.getItem('adminToken')
        try {
            const response = await fetch(`${API_URL}/admin/users/${selectedUser._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(userForm)
            })
            if (response.ok) {
                const data = await response.json()
                setUsers(users.map(u => u._id === selectedUser._id ? data.user : u))
                setShowUserModal(false)
                showToast('User updated successfully!', 'success')
                fetchData()
            } else {
                const data = await response.json()
                showToast(data.message || 'Failed to update user', 'error')
            }
        } catch (error) {
            console.error('Error updating user:', error)
            showToast('Error updating user', 'error')
        }
    }

    const handleDeleteUser = async (userId: string) => {
        showConfirm('Are you sure you want to delete this user? This action cannot be undone.', async () => {
            const token = localStorage.getItem('adminToken')
            try {
                const response = await fetch(`${API_URL}/admin/users/${userId}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (response.ok) {
                    setUsers(users.filter(u => u._id !== userId))
                    setShowUserModal(false)
                    showToast('User deleted successfully!', 'success')
                } else {
                    const data = await response.json()
                    showToast(data.message || 'Failed to delete user', 'error')
                }
            } catch (error) {
                console.error('Error deleting user:', error)
                showToast('Error deleting user', 'error')
            }
        })
    }

    // Change admin password
    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword) {
            showToast('Please fill in both password fields', 'warning')
            return
        }
        if (newPassword.length < 6) {
            showToast('New password must be at least 6 characters', 'warning')
            return
        }

        const token = localStorage.getItem('adminToken')
        try {
            const response = await fetch(`${API_URL}/admin/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            })
            const data = await response.json()
            if (response.ok) {
                showToast('Password changed successfully!', 'success')
                setCurrentPassword('')
                setNewPassword('')
                setShowChangePassword(false)
            } else {
                showToast(data.message || 'Failed to change password', 'error')
            }
        } catch (error) {
            console.error('Error changing password:', error)
            showToast('Error changing password', 'error')
        }
    }

    // Product Form Handlers
    const resetProductForm = () => {
        setProductForm(initialProductForm)
        setEditingProduct(null)
        setFormError('')
        setFormSuccess('')
        setNewImageUrl('')
        setFieldErrors({})
    }

    const openAddProductModal = () => {
        resetProductForm()
        setShowAddProduct(true)
    }

    const openEditProductModal = (product: Product) => {
        setEditingProduct(product)
        setFieldErrors({})
        setProductForm({
            name: product.name || '',
            category: product.category || 'Sunglasses',
            image: product.image || '',
            images: product.images || [],
            description: product.description || '',
            detailedDescription: product.detailedDescription || '',
            features: product.features?.length ? product.features : [''],
            specifications: {
                frameWidth: product.specifications?.frameWidth || '',
                lensWidth: product.specifications?.lensWidth || '',
                bridgeWidth: product.specifications?.bridgeWidth || '',
                templeLength: product.specifications?.templeLength || '',
                material: product.specifications?.material || '',
                weight: product.specifications?.weight || '',
                lensType: product.specifications?.lensType || '',
                uvProtection: product.specifications?.uvProtection || ''
            },
            colors: product.colors?.length ? product.colors.map(c => ({
                name: c.name || '',
                value: c.value || '#000000',
                price: String(c.price || product.price || ''),
                quantity: String(c.quantity || '0'),
                inStock: c.inStock !== false && (c.quantity || 0) > 0
            })) : [{ name: '', value: '#000000', price: String(product.price || ''), quantity: '0', inStock: false }]
        })
        setFormError('')
        setFormSuccess('')
        setShowAddProduct(true)
    }

    const closeProductModal = () => {
        setShowAddProduct(false)
        resetProductForm()
    }

    const handleAddImageUrl = () => {
        if (!newImageUrl.trim()) return
        const convertedUrl = convertGoogleDriveLink(newImageUrl.trim())
        setProductForm(prev => ({
            ...prev,
            images: [...prev.images, convertedUrl]
        }))
        setNewImageUrl('')
    }

    const handleRemoveImage = (index: number) => {
        setProductForm(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }))
    }

    const handleSetMainImage = (url: string) => {
        setProductForm(prev => ({ ...prev, image: url }))
    }

    const handleAddFeature = () => {
        setProductForm(prev => ({
            ...prev,
            features: [...prev.features, '']
        }))
    }

    const handleRemoveFeature = (index: number) => {
        setProductForm(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }))
    }

    const handleFeatureChange = (index: number, value: string) => {
        setProductForm(prev => ({
            ...prev,
            features: prev.features.map((f, i) => i === index ? value : f)
        }))
    }

    const handleAddColor = () => {
        // Get the first color's price as default, or empty
        const defaultPrice = productForm.colors.length > 0 && productForm.colors[0].price ? productForm.colors[0].price : ''
        setProductForm(prev => ({
            ...prev,
            colors: [...prev.colors, { name: '', value: '#000000', price: defaultPrice, quantity: '0', inStock: false }]
        }))
    }

    const handleRemoveColor = (index: number) => {
        setProductForm(prev => ({
            ...prev,
            colors: prev.colors.filter((_, i) => i !== index)
        }))
    }

    const handleColorChange = (index: number, field: 'name' | 'value' | 'price' | 'quantity' | 'inStock', value: string | boolean) => {
        setProductForm(prev => ({
            ...prev,
            colors: prev.colors.map((c, i) => {
                if (i !== index) return c
                // Auto-update inStock based on quantity
                if (field === 'quantity') {
                    const qty = Number(value) || 0
                    return { ...c, quantity: value as string, inStock: qty > 0 }
                }
                return { ...c, [field]: value }
            })
        }))
    }

    const handleSubmitProduct = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError('')
        setFormSuccess('')
        setFieldErrors({})

        // Detailed validation with field tracking
        const errors: Record<string, string> = {}

        if (!productForm.name.trim()) {
            errors.name = 'Product name is required'
        }
        if (!productForm.category) {
            errors.category = 'Category is required'
        }

        // Validate color variants - at least one color with name and price required
        const validColors = productForm.colors.filter(c => c.name.trim())
        if (validColors.length === 0) {
            errors.colors = 'At least one color variant with name is required'
        } else {
            const hasValidPrice = validColors.some(c => c.price && Number(c.price) > 0)
            if (!hasValidPrice) {
                errors.colors = 'At least one color variant must have a valid price (greater than 0)'
            }
        }

        if (!productForm.image.trim()) {
            errors.image = 'Main product image URL is required'
        }
        if (!productForm.description.trim()) {
            errors.description = 'Description is required'
        } else if (productForm.description.trim().length < 10) {
            errors.description = 'Description must be at least 10 characters'
        } else if (productForm.description.trim().length > 2000) {
            errors.description = 'Description must not exceed 2000 characters'
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors)
            setFormError(`Validation failed. Please check your input.`)
            // Scroll to first error field
            const firstErrorField = Object.keys(errors)[0]
            const element = document.querySelector(`[data-field="${firstErrorField}"]`)
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            return
        }

        setSaving(true)
        const token = localStorage.getItem('adminToken')

        // Prepare color variants with proper data
        const colorVariants = productForm.colors.filter(c => c.name.trim()).map(c => ({
            name: c.name.trim(),
            value: c.value,
            price: Number(c.price) || 0,
            quantity: Number(c.quantity) || 0,
            inStock: c.inStock
        }))

        // Calculate base price as the minimum price from colors (or first color's price)
        const basePrice = Math.min(...colorVariants.filter(c => c.price > 0).map(c => c.price)) || colorVariants[0]?.price || 0

        // Calculate total stock from all color variants
        const totalStock = colorVariants.reduce((sum, c) => sum + c.quantity, 0)

        // Product is in stock if any color variant has quantity > 0
        const isInStock = colorVariants.some(c => c.quantity > 0)

        // Prepare data
        const productData = {
            name: productForm.name.trim(),
            category: productForm.category,
            price: basePrice,
            image: convertGoogleDriveLink(productForm.image.trim()),
            images: productForm.images.filter(img => img.trim()),
            description: productForm.description.trim(),
            detailedDescription: productForm.detailedDescription.trim(),
            features: productForm.features.filter(f => f.trim()),
            specifications: productForm.specifications,
            colors: colorVariants,
            stock: totalStock,
            inStock: isInStock
        }

        try {
            const productId = editingProduct?._id || editingProduct?.id
            const url = editingProduct
                ? `${API_URL}/products/${productId}`
                : `${API_URL}/products`

            const response = await fetch(url, {
                method: editingProduct ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(productData)
            })

            const data = await response.json()

            if (response.ok) {
                setFormSuccess(editingProduct ? 'Product updated successfully!' : 'Product added successfully!')
                showToast(editingProduct ? 'Product updated successfully!' : 'Product added successfully!', 'success')
                await fetchData()
                setTimeout(() => {
                    closeProductModal()
                }, 1500)
            } else {
                // Handle backend validation errors
                if (data.errors && Array.isArray(data.errors)) {
                    const backendErrors: Record<string, string> = {}
                    data.errors.forEach((err: { field?: string; message: string }) => {
                        if (err.field) {
                            backendErrors[err.field] = err.message
                        }
                    })
                    setFieldErrors(backendErrors)
                    // Create a detailed error message
                    const errorMessages = data.errors.map((err: { message: string }) => err.message).join('. ')
                    setFormError(errorMessages)
                    showToast(errorMessages, 'error')
                } else {
                    setFormError(data.message || 'Failed to save product')
                    showToast(data.message || 'Failed to save product', 'error')
                }
            }
        } catch {
            setFormError('Network error. Please check your connection and try again.')
            showToast('Network error. Please try again.', 'error')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="admin-layout min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                        style={{
                            background: 'linear-gradient(135deg, rgba(201, 162, 39, 0.1) 0%, rgba(201, 162, 39, 0.2) 100%)',
                            border: '1px solid rgba(201, 162, 39, 0.2)'
                        }}
                    >
                        <div className="w-8 h-8 border-2 border-[#c9a227]/30 border-t-[#c9a227] rounded-full animate-spin" />
                    </div>
                    <p className="text-[#525252]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="admin-layout min-h-screen" style={{ background: '#faf9f7' }}>
            {/* Header */}
            <div
                className="bg-white sticky top-0 z-50"
                style={{
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}
            >
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{
                                    background: 'linear-gradient(135deg, #c9a227 0%, #8b6f1b 100%)',
                                    boxShadow: '0 4px 12px rgba(201, 162, 39, 0.25)'
                                }}
                            >
                                <Shield className="h-5 w-5 text-white" />
                            </div>
                            <h1
                                className="text-xl text-[#0d0d0d]"
                                style={{ fontFamily: 'Instrument Serif, Georgia, serif', letterSpacing: '-0.02em' }}
                            >
                                Voyar Admin
                            </h1>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleRefresh}
                                className="p-2.5 rounded-xl text-[#525252] hover:text-[#c9a227] hover:bg-[#c9a227]/5 transition-all"
                                title="Refresh Data"
                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                            >
                                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[#dc2626] hover:bg-[#dc2626]/5 transition-all font-medium"
                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tabs */}
                <div
                    className="flex gap-1 p-1.5 mb-8 overflow-x-auto rounded-2xl"
                    style={{
                        background: 'white',
                        border: '1px solid rgba(0,0,0,0.06)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                    }}
                >
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${activeTab === 'overview'
                            ? 'text-white shadow-lg'
                            : 'text-[#525252] hover:text-[#0d0d0d] hover:bg-[#faf9f7]'
                            }`}
                        style={{
                            fontFamily: 'DM Sans, sans-serif',
                            ...(activeTab === 'overview' ? {
                                background: 'linear-gradient(135deg, #0d0d0d 0%, #2a2a2a 100%)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            } : {})
                        }}
                    >
                        <Activity className="h-4 w-4" />
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${activeTab === 'products'
                            ? 'text-white shadow-lg'
                            : 'text-[#525252] hover:text-[#0d0d0d] hover:bg-[#faf9f7]'
                            }`}
                        style={{
                            fontFamily: 'DM Sans, sans-serif',
                            ...(activeTab === 'products' ? {
                                background: 'linear-gradient(135deg, #0d0d0d 0%, #2a2a2a 100%)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            } : {})
                        }}
                    >
                        <ShoppingBag className="h-4 w-4" />
                        Products
                        <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                                background: activeTab === 'products' ? 'rgba(255,255,255,0.2)' : 'rgba(201, 162, 39, 0.15)',
                                color: activeTab === 'products' ? 'white' : '#c9a227'
                            }}
                        >
                            {products.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${activeTab === 'orders'
                            ? 'text-white shadow-lg'
                            : 'text-[#525252] hover:text-[#0d0d0d] hover:bg-[#faf9f7]'
                            }`}
                        style={{
                            fontFamily: 'DM Sans, sans-serif',
                            ...(activeTab === 'orders' ? {
                                background: 'linear-gradient(135deg, #0d0d0d 0%, #2a2a2a 100%)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            } : {})
                        }}
                    >
                        <Package className="h-4 w-4" />
                        Orders
                        <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                                background: activeTab === 'orders' ? 'rgba(255,255,255,0.2)' : 'rgba(201, 162, 39, 0.15)',
                                color: activeTab === 'orders' ? 'white' : '#c9a227'
                            }}
                        >
                            {orders.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${activeTab === 'users'
                            ? 'text-white shadow-lg'
                            : 'text-[#525252] hover:text-[#0d0d0d] hover:bg-[#faf9f7]'
                            }`}
                        style={{
                            fontFamily: 'DM Sans, sans-serif',
                            ...(activeTab === 'users' ? {
                                background: 'linear-gradient(135deg, #0d0d0d 0%, #2a2a2a 100%)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            } : {})
                        }}
                    >
                        <Users className="h-4 w-4" />
                        Users
                        <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                                background: activeTab === 'users' ? 'rgba(255,255,255,0.2)' : 'rgba(201, 162, 39, 0.15)',
                                color: activeTab === 'users' ? 'white' : '#c9a227'
                            }}
                        >
                            {users.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${activeTab === 'settings'
                            ? 'text-white shadow-lg'
                            : 'text-[#525252] hover:text-[#0d0d0d] hover:bg-[#faf9f7]'
                            }`}
                        style={{
                            fontFamily: 'DM Sans, sans-serif',
                            ...(activeTab === 'settings' ? {
                                background: 'linear-gradient(135deg, #0d0d0d 0%, #2a2a2a 100%)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            } : {})
                        }}
                    >
                        <Settings className="h-4 w-4" />
                        Settings
                    </button>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Top Metrics Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Revenue Card */}
                            <div
                                className="bg-white rounded-2xl p-6 group hover:shadow-lg transition-all cursor-pointer"
                                style={{
                                    border: '1px solid rgba(0,0,0,0.06)',
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
                                }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p
                                                className="text-sm font-medium text-[#525252]"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            >
                                                Total Revenue
                                            </p>
                                            <div
                                                className="px-2 py-0.5 rounded-md text-xs font-medium"
                                                style={{
                                                    background: 'rgba(22, 163, 74, 0.1)',
                                                    color: '#16a34a',
                                                    fontFamily: 'DM Sans, sans-serif'
                                                }}
                                            >
                                                +12%
                                            </div>
                                        </div>
                                        <p
                                            className="text-[2.5rem] leading-tight font-medium text-[#0d0d0d] mb-1"
                                            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, letterSpacing: '-0.02em' }}
                                        >
                                            ₹{stats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                        <p
                                            className="text-xs text-[#8a8a8a]"
                                            style={{ fontFamily: 'DM Sans, sans-serif' }}
                                        >
                                            ₹{(stats.totalRevenue * 0.12).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} more than last week
                                        </p>
                                    </div>
                                </div>
                                {/* Mini sparkline */}
                                <div className="h-16 mt-2 relative">
                                    <svg className="w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" style={{ stopColor: '#c9a227', stopOpacity: 0.3 }} />
                                                <stop offset="100%" style={{ stopColor: '#c9a227', stopOpacity: 0 }} />
                                            </linearGradient>
                                        </defs>
                                        <path
                                            d="M0,45 L25,38 L50,42 L75,35 L100,28 L125,32 L150,18 L175,22 L200,15"
                                            fill="none"
                                            stroke="#c9a227"
                                            strokeWidth="2"
                                        />
                                        <path
                                            d="M0,45 L25,38 L50,42 L75,35 L100,28 L125,32 L150,18 L175,22 L200,15 L200,60 L0,60 Z"
                                            fill="url(#revenueGradient)"
                                        />
                                    </svg>
                                </div>
                            </div>

                            {/* Orders Card */}
                            <div
                                className="bg-white rounded-2xl p-6 group hover:shadow-lg transition-all cursor-pointer"
                                style={{
                                    border: '1px solid rgba(0,0,0,0.06)',
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
                                }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p
                                                className="text-sm font-medium text-[#525252]"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            >
                                                Orders
                                            </p>
                                            <div
                                                className="px-2 py-0.5 rounded-md text-xs font-medium"
                                                style={{
                                                    background: 'rgba(59, 130, 246, 0.1)',
                                                    color: '#3b82f6',
                                                    fontFamily: 'DM Sans, sans-serif'
                                                }}
                                            >
                                                +8%
                                            </div>
                                        </div>
                                        <p
                                            className="text-[2.5rem] leading-tight font-medium text-[#0d0d0d] mb-1"
                                            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, letterSpacing: '-0.02em' }}
                                        >
                                            {stats.totalOrders}
                                        </p>
                                        <p
                                            className="text-xs text-[#8a8a8a]"
                                            style={{ fontFamily: 'DM Sans, sans-serif' }}
                                        >
                                            {Math.round(stats.totalOrders * 0.08)} more than last week
                                        </p>
                                    </div>
                                </div>
                                {/* Mini sparkline */}
                                <div className="h-16 mt-2 relative">
                                    <svg className="w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id="ordersGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.3 }} />
                                                <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0 }} />
                                            </linearGradient>
                                        </defs>
                                        <path
                                            d="M0,50 L25,45 L50,38 L75,40 L100,35 L125,30 L150,25 L175,20 L200,18"
                                            fill="none"
                                            stroke="#3b82f6"
                                            strokeWidth="2"
                                        />
                                        <path
                                            d="M0,50 L25,45 L50,38 L75,40 L100,35 L125,30 L150,25 L175,20 L200,18 L200,60 L0,60 Z"
                                            fill="url(#ordersGradient)"
                                        />
                                    </svg>
                                </div>
                            </div>

                            {/* Customers Card */}
                            <div
                                className="bg-white rounded-2xl p-6 group hover:shadow-lg transition-all cursor-pointer"
                                style={{
                                    border: '1px solid rgba(0,0,0,0.06)',
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
                                }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p
                                                className="text-sm font-medium text-[#525252]"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            >
                                                Customers
                                            </p>
                                            <div
                                                className="px-2 py-0.5 rounded-md text-xs font-medium"
                                                style={{
                                                    background: 'rgba(147, 51, 234, 0.1)',
                                                    color: '#9333ea',
                                                    fontFamily: 'DM Sans, sans-serif'
                                                }}
                                            >
                                                +15%
                                            </div>
                                        </div>
                                        <p
                                            className="text-[2.5rem] leading-tight font-medium text-[#0d0d0d] mb-1"
                                            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, letterSpacing: '-0.02em' }}
                                        >
                                            {users.length}
                                        </p>
                                        <p
                                            className="text-xs text-[#8a8a8a]"
                                            style={{ fontFamily: 'DM Sans, sans-serif' }}
                                        >
                                            {Math.round(users.length * 0.15)} new this week
                                        </p>
                                    </div>
                                </div>
                                {/* Mini sparkline */}
                                <div className="h-16 mt-2 relative">
                                    <svg className="w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id="customersGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" style={{ stopColor: '#9333ea', stopOpacity: 0.3 }} />
                                                <stop offset="100%" style={{ stopColor: '#9333ea', stopOpacity: 0 }} />
                                            </linearGradient>
                                        </defs>
                                        <path
                                            d="M0,55 L25,48 L50,50 L75,43 L100,38 L125,35 L150,28 L175,25 L200,20"
                                            fill="none"
                                            stroke="#9333ea"
                                            strokeWidth="2"
                                        />
                                        <path
                                            d="M0,55 L25,48 L50,50 L75,43 L100,38 L125,35 L150,28 L175,25 L200,20 L200,60 L0,60 Z"
                                            fill="url(#customersGradient)"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Large Revenue Chart */}
                        <div
                            className="bg-white rounded-2xl overflow-hidden"
                            style={{
                                border: '1px solid rgba(0,0,0,0.06)',
                                boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
                            }}
                        >
                            <div className="p-6 border-b border-[rgba(0,0,0,0.06)] flex items-center justify-between">
                                <div>
                                    <h3
                                        className="text-lg font-medium text-[#0d0d0d]"
                                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                                    >
                                        Revenue Overview
                                    </h3>
                                    <p className="text-sm text-[#8a8a8a] mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                        Last 7 days performance
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ background: '#3b82f6' }}></div>
                                        <span className="text-sm text-[#525252]" style={{ fontFamily: 'DM Sans, sans-serif' }}>This Week</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ background: '#e2e8f0' }}></div>
                                        <span className="text-sm text-[#525252]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Last Week</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="h-64 relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart
                                            data={revenueChartData}
                                            onClick={handleChartClick}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <defs>
                                                <linearGradient id="colorThisWeek" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                                                </linearGradient>
                                                <linearGradient id="colorLastWeek" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.05} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                            <XAxis
                                                dataKey="date"
                                                stroke="#8a8a8a"
                                                style={{ fontSize: '12px', fontFamily: 'DM Sans, sans-serif' }}
                                                tick={{ fill: '#8a8a8a' }}
                                            />
                                            <YAxis
                                                stroke="#8a8a8a"
                                                style={{ fontSize: '12px', fontFamily: 'DM Sans, sans-serif' }}
                                                tick={{ fill: '#8a8a8a' }}
                                                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area
                                                type="monotone"
                                                dataKey="lastWeek"
                                                stroke="#94a3b8"
                                                strokeWidth={2}
                                                fill="url(#colorLastWeek)"
                                                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="thisWeek"
                                                stroke="#3b82f6"
                                                strokeWidth={3}
                                                fill="url(#colorThisWeek)"
                                                activeDot={{ r: 8, strokeWidth: 2, stroke: '#fff' }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Payment Success Rate */}
                            <div
                                className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer"
                                style={{
                                    border: '1px solid rgba(0,0,0,0.06)',
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
                                }}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(22, 163, 74, 0.1)' }}>
                                        <Check className="h-5 w-5 text-[#16a34a]" />
                                    </div>
                                    <TrendingUp className="h-4 w-4 text-[#16a34a]" />
                                </div>
                                <p
                                    className="text-sm font-medium text-[#525252] mb-1"
                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                >
                                    Success Rate
                                </p>
                                <p
                                    className="text-3xl font-semibold text-[#0d0d0d]"
                                    style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}
                                >
                                    98.5%
                                </p>
                                <p
                                    className="text-xs text-[#16a34a] mt-2"
                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                >
                                    +2.1% from last month
                                </p>
                            </div>

                            {/* Avg Order Value */}
                            <div
                                className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer"
                                style={{
                                    border: '1px solid rgba(0,0,0,0.06)',
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
                                }}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(201, 162, 39, 0.1)' }}>
                                        <DollarSign className="h-5 w-5 text-[#c9a227]" />
                                    </div>
                                    <TrendingUp className="h-4 w-4 text-[#16a34a]" />
                                </div>
                                <p
                                    className="text-sm font-medium text-[#525252] mb-1"
                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                >
                                    Avg Order Value
                                </p>
                                <p
                                    className="text-3xl font-semibold text-[#0d0d0d]"
                                    style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}
                                >
                                    ₹{stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders).toLocaleString('en-IN') : '0'}
                                </p>
                                <p
                                    className="text-xs text-[#16a34a] mt-2"
                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                >
                                    +5.3% from last month
                                </p>
                            </div>

                            {/* Pending Orders */}
                            <div
                                className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer"
                                style={{
                                    border: '1px solid rgba(0,0,0,0.06)',
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
                                }}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(234, 88, 12, 0.1)' }}>
                                        <Clock className="h-5 w-5 text-[#ea580c]" />
                                    </div>
                                    <div className="text-xs text-[#8a8a8a]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                        {stats.totalOrders > 0 ? Math.round((stats.pendingOrders / stats.totalOrders) * 100) : 0}%
                                    </div>
                                </div>
                                <p
                                    className="text-sm font-medium text-[#525252] mb-1"
                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                >
                                    Pending Orders
                                </p>
                                <p
                                    className="text-3xl font-semibold text-[#0d0d0d]"
                                    style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}
                                >
                                    {stats.pendingOrders}
                                </p>
                                <p
                                    className="text-xs text-[#8a8a8a] mt-2"
                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                >
                                    Requires attention
                                </p>
                            </div>

                            {/* Completed */}
                            <div
                                className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer"
                                style={{
                                    border: '1px solid rgba(0,0,0,0.06)',
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
                                }}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                                        <Package className="h-5 w-5 text-[#3b82f6]" />
                                    </div>
                                    <TrendingUp className="h-4 w-4 text-[#16a34a]" />
                                </div>
                                <p
                                    className="text-sm font-medium text-[#525252] mb-1"
                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                >
                                    Completed
                                </p>
                                <p
                                    className="text-3xl font-semibold text-[#0d0d0d]"
                                    style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}
                                >
                                    {stats.completedOrders}
                                </p>
                                <p
                                    className="text-xs text-[#16a34a] mt-2"
                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                >
                                    {stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}% completion rate
                                </p>
                            </div>
                        </div>

                        {/* Top Insights Section */}
                        <div
                            className="bg-white rounded-2xl p-6"
                            style={{
                                border: '1px solid rgba(0,0,0,0.06)',
                                boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
                            }}
                        >
                            <h3
                                className="text-lg font-medium text-[#0d0d0d] mb-6"
                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                            >
                                Top Insights
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Payment Count */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full" style={{ background: '#3b82f6' }}></div>
                                        <p className="text-sm text-[#525252]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Payment Count</p>
                                    </div>
                                    <p className="text-2xl font-semibold text-[#0d0d0d]" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>
                                        {stats.completedOrders}
                                    </p>
                                    <p className="text-xs text-[#8a8a8a]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                        Successful transactions
                                    </p>
                                </div>

                                {/* Payment Failure */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full" style={{ background: '#dc2626' }}></div>
                                        <p className="text-sm text-[#525252]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Payment Failures</p>
                                    </div>
                                    <p className="text-2xl font-semibold text-[#0d0d0d]" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>
                                        {Math.round(stats.totalOrders * 0.015)}
                                    </p>
                                    <p className="text-xs text-[#8a8a8a]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                        1.5% failure rate
                                    </p>
                                </div>

                                {/* Refund Count */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full" style={{ background: '#f59e0b' }}></div>
                                        <p className="text-sm text-[#525252]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Refund Requests</p>
                                    </div>
                                    <p className="text-2xl font-semibold text-[#0d0d0d]" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>
                                        {orders.filter(o => o.status === 'cancelled').length}
                                    </p>
                                    <p className="text-xs text-[#8a8a8a]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                        {stats.totalOrders > 0 ? ((orders.filter(o => o.status === 'cancelled').length / stats.totalOrders) * 100).toFixed(1) : '0'}% of total orders
                                    </p>
                                </div>

                                {/* Average Processing Time */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full" style={{ background: '#9333ea' }}></div>
                                        <p className="text-sm text-[#525252]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Avg Processing</p>
                                    </div>
                                    <p className="text-2xl font-semibold text-[#0d0d0d]" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>
                                        2.4h
                                    </p>
                                    <p className="text-xs text-[#8a8a8a]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                        Order processing time
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Orders */}
                        <div
                            className="bg-white rounded-2xl overflow-hidden"
                            style={{
                                border: '1px solid rgba(0,0,0,0.06)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                            }}
                        >
                            <div className="p-6 border-b border-[rgba(0,0,0,0.06)]">
                                <h3
                                    className="text-xl text-[#0d0d0d]"
                                    style={{ fontFamily: 'Instrument Serif, Georgia, serif', letterSpacing: '-0.02em' }}
                                >
                                    Recent Orders
                                </h3>
                            </div>
                            <div className="p-4">
                                <div className="space-y-3">
                                    {orders.slice(0, 5).map((order) => (
                                        <div
                                            key={order._id}
                                            className="flex items-center justify-between p-4 rounded-xl hover:bg-[#faf9f7] transition-colors cursor-pointer"
                                            onClick={() => {
                                                setSelectedOrder(order)
                                                setShowOrderDetailsModal(true)
                                            }}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                                                    style={{
                                                        background: 'linear-gradient(135deg, #0d0d0d 0%, #2a2a2a 100%)',
                                                        fontFamily: 'DM Sans, sans-serif'
                                                    }}
                                                >
                                                    {order.customerName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p
                                                        className="font-medium text-[#0d0d0d]"
                                                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                    >
                                                        {order.customerName}
                                                    </p>
                                                    <p
                                                        className="text-sm text-[#8a8a8a]"
                                                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                    >
                                                        {order.customerEmail}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p
                                                    className="font-semibold text-[#c9a227]"
                                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                >
                                                    ₹{order.totalAmount.toLocaleString('en-IN')}
                                                </p>
                                                <span
                                                    className="inline-block text-xs px-2 py-1 rounded-full mt-1"
                                                    style={{
                                                        fontFamily: 'DM Sans, sans-serif',
                                                        background: order.status === 'Delivered' ? 'rgba(22, 163, 74, 0.1)' :
                                                            order.status === 'Pending' ? 'rgba(234, 88, 12, 0.1)' :
                                                                order.status === 'Processing' ? 'rgba(59, 130, 246, 0.1)' :
                                                                    'rgba(0,0,0,0.05)',
                                                        color: order.status === 'Delivered' ? '#16a34a' :
                                                            order.status === 'Pending' ? '#ea580c' :
                                                                order.status === 'Processing' ? '#3b82f6' :
                                                                    '#525252'
                                                    }}
                                                >
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {orders.length === 0 && (
                                        <div className="text-center py-12">
                                            <Package className="h-12 w-12 text-[#8a8a8a] mx-auto mb-4" />
                                            <p className="text-[#525252]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                                No orders yet
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <div>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <h2
                                className="text-2xl text-[#0d0d0d]"
                                style={{ fontFamily: 'Instrument Serif, Georgia, serif', letterSpacing: '-0.02em' }}
                            >
                                Manage Products
                            </h2>
                            <div className="flex items-center gap-3">
                                {/* Export Button */}
                                <button
                                    onClick={handleExportProducts}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[rgba(0,0,0,0.12)] text-[#525252] hover:text-[#0d0d0d] hover:border-[#0d0d0d] transition-all"
                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                >
                                    <Download className="h-4 w-4" />
                                    Export CSV
                                </button>
                                <button
                                    onClick={openAddProductModal}
                                    className="flex items-center gap-2 px-5 py-3 rounded-xl text-white font-medium transition-all"
                                    style={{
                                        background: 'linear-gradient(135deg, #c9a227 0%, #8b6f1b 100%)',
                                        fontFamily: 'DM Sans, sans-serif',
                                        boxShadow: '0 4px 16px rgba(201, 162, 39, 0.25)'
                                    }}
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Product
                                </button>
                            </div>
                        </div>

                        {/* Quick Stats for Products */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white rounded-xl p-4 border border-[rgba(0,0,0,0.06)]">
                                <p className="text-2xl font-semibold text-[#0d0d0d]" style={{ fontFamily: 'Instrument Serif' }}>{products.length}</p>
                                <p className="text-xs text-[#8a8a8a] uppercase tracking-wider" style={{ fontFamily: 'DM Sans' }}>Total Products</p>
                            </div>
                            <div className="bg-white rounded-xl p-4 border border-[rgba(0,0,0,0.06)]">
                                <p className="text-2xl font-semibold text-green-600" style={{ fontFamily: 'Instrument Serif' }}>{products.filter(p => p.inStock !== false).length}</p>
                                <p className="text-xs text-[#8a8a8a] uppercase tracking-wider" style={{ fontFamily: 'DM Sans' }}>In Stock</p>
                            </div>
                            <div className="bg-white rounded-xl p-4 border border-[rgba(0,0,0,0.06)]">
                                <p className="text-2xl font-semibold text-red-600" style={{ fontFamily: 'Instrument Serif' }}>{products.filter(p => p.inStock === false).length}</p>
                                <p className="text-xs text-[#8a8a8a] uppercase tracking-wider" style={{ fontFamily: 'DM Sans' }}>Out of Stock</p>
                            </div>
                            <div className="bg-white rounded-xl p-4 border border-[rgba(0,0,0,0.06)]">
                                <p className="text-2xl font-semibold text-[#c9a227]" style={{ fontFamily: 'Instrument Serif' }}>{[...new Set(products.map(p => p.category))].length}</p>
                                <p className="text-xs text-[#8a8a8a] uppercase tracking-wider" style={{ fontFamily: 'DM Sans' }}>Categories</p>
                            </div>
                        </div>

                        {/* Search and Filter Bar for Products */}
                        <div
                            className="bg-white rounded-2xl p-5 mb-6"
                            style={{
                                border: '1px solid rgba(0,0,0,0.06)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                            }}
                        >
                            <div className="flex flex-col lg:flex-row gap-4">
                                {/* Select All Checkbox */}
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                                        onChange={handleSelectAllProducts}
                                        className="w-4 h-4 accent-[#c9a227] rounded"
                                    />
                                    <span className="text-sm text-[#525252]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                        Select All
                                    </span>
                                </label>

                                {/* Search Input */}
                                <div className="flex-1 relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a8a8a] transition-colors group-focus-within:text-[#c9a227]" />
                                    <input
                                        type="text"
                                        placeholder="Search products by name, category, or description..."
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#c9a227] focus:bg-white transition-all text-[#0d0d0d]"
                                        style={{ fontFamily: 'DM Sans, sans-serif', color: '#0d0d0d' }}
                                    />
                                </div>

                                {/* Category Filter */}
                                <div className="flex items-center gap-3">
                                    <Filter className="h-4 w-4 text-[#8a8a8a]" />
                                    <select
                                        value={productCategoryFilter}
                                        onChange={(e) => setProductCategoryFilter(e.target.value)}
                                        className="px-4 py-3 bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#c9a227] min-w-[150px] cursor-pointer text-[#0d0d0d]"
                                        style={{ fontFamily: 'DM Sans, sans-serif', color: '#0d0d0d' }}
                                    >
                                        <option value="all">All Categories</option>
                                        {productCategories.map(category => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Stock Filter */}
                                <div className="flex items-center gap-3">
                                    <SlidersHorizontal className="h-4 w-4 text-[#8a8a8a]" />
                                    <select
                                        value={productStockFilter}
                                        onChange={(e) => setProductStockFilter(e.target.value)}
                                        className="px-4 py-3 bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#c9a227] min-w-[140px] cursor-pointer text-[#0d0d0d]"
                                        style={{ fontFamily: 'DM Sans, sans-serif', color: '#0d0d0d' }}
                                    >
                                        <option value="all">All Stock</option>
                                        <option value="inStock">In Stock</option>
                                        <option value="outOfStock">Out of Stock</option>
                                    </select>
                                </div>

                                {/* Clear Filters */}
                                {(productSearch || productCategoryFilter !== 'all' || productStockFilter !== 'all') && (
                                    <button
                                        onClick={() => {
                                            setProductSearch('')
                                            setProductCategoryFilter('all')
                                            setProductStockFilter('all')
                                        }}
                                        className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[rgba(0,0,0,0.12)] text-[#525252] hover:text-[#0d0d0d] hover:border-[#0d0d0d] transition-all"
                                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                                    >
                                        <X className="h-4 w-4" />
                                        Clear
                                    </button>
                                )}
                            </div>

                            {/* Results count */}
                            <div
                                className="mt-4 text-sm text-[#8a8a8a]"
                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                            >
                                Showing <span className="text-[#0d0d0d] font-medium">{filteredProducts.length}</span> of {products.length} products
                                {productSearch && <span> matching "<span className="text-[#c9a227]">{productSearch}</span>"</span>}
                                {selectedProducts.length > 0 && <span className="ml-2">• <span className="text-[#c9a227] font-medium">{selectedProducts.length} selected</span></span>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map((product) => (
                                <div
                                    key={product.id || product._id}
                                    className={`bg-white rounded-2xl overflow-hidden group hover:shadow-xl transition-all relative ${selectedProducts.includes(String(product._id || product.id)) ? 'ring-2 ring-[#c9a227]' : ''}`}
                                    style={{
                                        border: '1px solid rgba(0,0,0,0.06)',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                                    }}
                                >
                                    {/* Selection Checkbox */}
                                    <div className="absolute top-4 left-4 z-10">
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.includes(String(product._id || product.id))}
                                            onChange={() => handleSelectProduct(String(product._id || product.id))}
                                            className="w-5 h-5 accent-[#c9a227] rounded cursor-pointer"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <div
                                            className="aspect-[4/3] rounded-xl overflow-hidden mb-4 relative"
                                            style={{ background: 'linear-gradient(135deg, #faf9f7 0%, #f0ede5 100%)' }}
                                        >
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=No+Image'
                                                }}
                                            />
                                            <span
                                                className="absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-medium"
                                                style={{
                                                    fontFamily: 'DM Sans, sans-serif',
                                                    background: product.inStock !== false ? 'rgba(22, 163, 74, 0.9)' : 'rgba(220, 38, 38, 0.9)',
                                                    color: 'white'
                                                }}
                                            >
                                                {product.inStock !== false ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            <h3
                                                className="font-medium text-[#0d0d0d] line-clamp-1"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            >
                                                {product.name}
                                            </h3>
                                            <p
                                                className="text-xs text-[#8a8a8a] uppercase tracking-wider"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            >
                                                {product.category}
                                            </p>
                                            <div className="flex items-center justify-between pt-2">
                                                <p
                                                    className="text-xl text-[#c9a227]"
                                                    style={{ fontFamily: 'Instrument Serif, Georgia, serif' }}
                                                >
                                                    ₹{product.price.toLocaleString('en-IN')}
                                                </p>
                                                <p
                                                    className="text-xs text-[#8a8a8a]"
                                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                >
                                                    {product.colors && product.colors.length > 0
                                                        ? product.colors.reduce((sum, c) => sum + (c.quantity || 0), 0)
                                                        : (product.stock || 0)} units
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 mt-4 pt-4 border-t border-[rgba(0,0,0,0.06)]">
                                            <button
                                                onClick={() => navigate(`/product/${product.id || product._id}`)}
                                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl border border-[rgba(0,0,0,0.08)] text-[#525252] hover:text-[#0d0d0d] hover:border-[#0d0d0d] transition-all text-sm font-medium"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                                View
                                            </button>
                                            <button
                                                onClick={() => openEditProductModal(product)}
                                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl border border-[rgba(0,0,0,0.08)] text-[#525252] hover:text-[#c9a227] hover:border-[#c9a227] transition-all text-sm font-medium"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            >
                                                <Edit className="h-3.5 w-3.5" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(product.id || product._id!)}
                                                className="flex items-center justify-center px-3 py-2.5 rounded-xl border border-[rgba(220,38,38,0.2)] text-[#dc2626] hover:bg-[#dc2626]/5 hover:border-[#dc2626] transition-all"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Bulk Actions Bar - Fixed at bottom */}
                        {selectedProducts.length > 0 && (
                            <div
                                className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0d0d0d] text-white px-6 py-4 rounded-2xl flex items-center gap-6 z-50"
                                style={{
                                    boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                                    fontFamily: 'DM Sans, sans-serif',
                                    animation: 'slideUp 300ms ease-out'
                                }}
                            >
                                <span className="text-sm">
                                    <span className="font-semibold text-[#c9a227]">{selectedProducts.length}</span> product(s) selected
                                </span>
                                <div className="h-6 w-px bg-white/20" />
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleBulkStockUpdate(true)}
                                        className="px-3 py-1.5 text-sm rounded-lg border border-green-500/50 text-green-400 hover:bg-green-500/10 transition-all"
                                    >
                                        Mark In Stock
                                    </button>
                                    <button
                                        onClick={() => handleBulkStockUpdate(false)}
                                        className="px-3 py-1.5 text-sm rounded-lg border border-orange-500/50 text-orange-400 hover:bg-orange-500/10 transition-all"
                                    >
                                        Mark Out of Stock
                                    </button>
                                    <button
                                        onClick={handleExportProducts}
                                        className="px-3 py-1.5 text-sm rounded-lg border border-blue-500/50 text-blue-400 hover:bg-blue-500/10 transition-all flex items-center gap-1"
                                    >
                                        <Download className="h-3 w-3" />
                                        Export
                                    </button>
                                    <button
                                        onClick={handleBulkDeleteProducts}
                                        className="px-3 py-1.5 text-sm rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-1"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                        Delete
                                    </button>
                                </div>
                                <button
                                    onClick={() => setSelectedProducts([])}
                                    className="p-1.5 rounded-lg hover:bg-white/10 transition-all"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        )}

                        {/* Empty state for products */}
                        {filteredProducts.length === 0 && (
                            <div
                                className="bg-white rounded-2xl p-16 text-center"
                                style={{
                                    border: '1px solid rgba(0,0,0,0.06)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                                }}
                            >
                                <div
                                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(201, 162, 39, 0.1) 0%, rgba(201, 162, 39, 0.2) 100%)',
                                        border: '1px solid rgba(201, 162, 39, 0.2)'
                                    }}
                                >
                                    <Package className="h-8 w-8 text-[#c9a227]" />
                                </div>
                                <p
                                    className="text-[#525252] mb-4"
                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                >
                                    {products.length === 0 ? 'No products yet' : 'No products match your search criteria'}
                                </p>
                                {products.length > 0 && (productSearch || productCategoryFilter !== 'all' || productStockFilter !== 'all') && (
                                    <button
                                        onClick={() => {
                                            setProductSearch('')
                                            setProductCategoryFilter('all')
                                            setProductStockFilter('all')
                                        }}
                                        className="px-5 py-2.5 rounded-xl border border-[rgba(0,0,0,0.12)] text-[#525252] hover:text-[#0d0d0d] hover:border-[#0d0d0d] transition-all font-medium"
                                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <h2
                                className="text-2xl text-[#0d0d0d]"
                                style={{ fontFamily: 'Instrument Serif, Georgia, serif', letterSpacing: '-0.02em' }}
                            >
                                Manage Orders
                            </h2>
                            <button
                                onClick={() => exportToCSV('orders')}
                                className="flex items-center gap-2 px-5 py-3 rounded-xl text-white font-medium transition-all"
                                style={{
                                    background: 'linear-gradient(135deg, #0d0d0d 0%, #2a2a2a 100%)',
                                    fontFamily: 'DM Sans, sans-serif',
                                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)'
                                }}
                            >
                                <Download className="h-4 w-4" />
                                Export Orders
                            </button>
                        </div>

                        {/* Search and Filter Bar for Orders */}
                        <div
                            className="bg-white rounded-2xl p-5 mb-6"
                            style={{
                                border: '1px solid rgba(0,0,0,0.06)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                            }}
                        >
                            <div className="flex flex-col lg:flex-row gap-4">
                                {/* Search Input */}
                                <div className="flex-1 relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a8a8a] transition-colors group-focus-within:text-[#c9a227]" />
                                    <input
                                        type="text"
                                        placeholder="Search by customer name, email, phone, or order ID..."
                                        value={orderSearch}
                                        onChange={(e) => setOrderSearch(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#c9a227] focus:bg-white transition-all"
                                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                                    />
                                </div>

                                {/* Status Filter */}
                                <div className="flex items-center gap-3">
                                    <Filter className="h-4 w-4 text-[#8a8a8a]" />
                                    <select
                                        value={orderStatusFilter}
                                        onChange={(e) => setOrderStatusFilter(e.target.value)}
                                        className="px-4 py-3 bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#c9a227] min-w-[140px] cursor-pointer"
                                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                                    >
                                        <option value="all">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>

                                {/* Payment Filter */}
                                <div className="flex items-center gap-3">
                                    <DollarSign className="h-4 w-4 text-[#8a8a8a]" />
                                    <select
                                        value={orderPaymentFilter}
                                        onChange={(e) => setOrderPaymentFilter(e.target.value)}
                                        className="px-4 py-3 bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#c9a227] min-w-[130px] cursor-pointer"
                                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                                    >
                                        <option value="all">All Payments</option>
                                        <option value="paid">Paid</option>
                                        <option value="pending">Pending</option>
                                        <option value="failed">Failed</option>
                                    </select>
                                </div>

                                {/* Date Filter */}
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4 text-[#8a8a8a]" />
                                    <select
                                        value={orderDateFilter}
                                        onChange={(e) => setOrderDateFilter(e.target.value)}
                                        className="px-4 py-3 bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#c9a227] min-w-[120px] cursor-pointer"
                                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                                    >
                                        <option value="all">All Time</option>
                                        <option value="today">Today</option>
                                        <option value="week">Last 7 Days</option>
                                        <option value="month">Last 30 Days</option>
                                    </select>
                                </div>

                                {/* Clear Filters */}
                                {(orderSearch || orderStatusFilter !== 'all' || orderPaymentFilter !== 'all' || orderDateFilter !== 'all') && (
                                    <button
                                        onClick={() => {
                                            setOrderSearch('')
                                            setOrderStatusFilter('all')
                                            setOrderPaymentFilter('all')
                                            setOrderDateFilter('all')
                                        }}
                                        className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[rgba(0,0,0,0.12)] text-[#525252] hover:text-[#0d0d0d] hover:border-[#0d0d0d] transition-all"
                                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                                    >
                                        <X className="h-4 w-4" />
                                        Clear
                                    </button>
                                )}
                            </div>

                            {/* Results count */}
                            <div
                                className="mt-4 text-sm text-[#8a8a8a]"
                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                            >
                                Showing <span className="text-[#0d0d0d] font-medium">{filteredOrders.length}</span> of {orders.length} orders
                                {orderSearch && <span> matching "<span className="text-[#c9a227]">{orderSearch}</span>"</span>}
                            </div>
                        </div>

                        <div className="space-y-6">
                            {filteredOrders.map((order) => (
                                <div
                                    key={order._id}
                                    className="bg-white rounded-2xl overflow-hidden"
                                    style={{
                                        border: '1px solid rgba(0,0,0,0.06)',
                                        boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
                                    }}
                                >
                                    {/* Order Header */}
                                    <div
                                        className="p-6"
                                        style={{
                                            background: 'linear-gradient(135deg, #faf9f7 0%, #f5f2eb 100%)',
                                            borderBottom: '1px solid rgba(0,0,0,0.06)'
                                        }}
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                    <h3
                                                        className="text-xl text-[#0d0d0d]"
                                                        style={{ fontFamily: 'Instrument Serif, Georgia, serif', letterSpacing: '-0.02em' }}
                                                    >
                                                        {order.customerName}
                                                    </h3>
                                                    <span
                                                        className="px-3 py-1 rounded-full text-xs font-medium"
                                                        style={{
                                                            fontFamily: 'DM Sans, sans-serif',
                                                            background: order.status === 'delivered' ? 'rgba(22, 163, 74, 0.1)' :
                                                                order.status === 'processing' ? 'rgba(59, 130, 246, 0.1)' :
                                                                    order.status === 'shipped' ? 'rgba(147, 51, 234, 0.1)' :
                                                                        order.status === 'cancelled' ? 'rgba(220, 38, 38, 0.1)' :
                                                                            'rgba(234, 88, 12, 0.1)',
                                                            color: order.status === 'delivered' ? '#16a34a' :
                                                                order.status === 'processing' ? '#3b82f6' :
                                                                    order.status === 'shipped' ? '#9333ea' :
                                                                        order.status === 'cancelled' ? '#dc2626' :
                                                                            '#ea580c'
                                                        }}
                                                    >
                                                        {order.status.toUpperCase()}
                                                    </span>
                                                    <span
                                                        className="px-3 py-1 rounded-full text-xs font-medium"
                                                        style={{
                                                            fontFamily: 'DM Sans, sans-serif',
                                                            background: order.paymentStatus === 'paid' ? 'rgba(22, 163, 74, 0.1)' :
                                                                order.paymentStatus === 'failed' ? 'rgba(220, 38, 38, 0.1)' :
                                                                    order.paymentStatus === 'refunded' ? 'rgba(59, 130, 246, 0.1)' :
                                                                        'rgba(234, 179, 8, 0.1)',
                                                            color: order.paymentStatus === 'paid' ? '#16a34a' :
                                                                order.paymentStatus === 'failed' ? '#dc2626' :
                                                                    order.paymentStatus === 'refunded' ? '#3b82f6' :
                                                                        '#ca8a04'
                                                        }}
                                                    >
                                                        {(order.paymentStatus || 'pending').toUpperCase()}
                                                    </span>
                                                    {/* Refund Status Badge */}
                                                    {order.refundStatus && order.refundStatus !== 'not_applicable' && (
                                                        <span
                                                            className="px-3 py-1 rounded-full text-xs font-medium"
                                                            style={{
                                                                fontFamily: 'DM Sans, sans-serif',
                                                                background: order.refundStatus === 'completed' ? 'rgba(22, 163, 74, 0.1)' :
                                                                    order.refundStatus === 'processing' ? 'rgba(201, 162, 39, 0.1)' :
                                                                        order.refundStatus === 'failed' ? 'rgba(220, 38, 38, 0.1)' :
                                                                            'rgba(59, 130, 246, 0.1)',
                                                                color: order.refundStatus === 'completed' ? '#16a34a' :
                                                                    order.refundStatus === 'processing' ? '#c9a227' :
                                                                        order.refundStatus === 'failed' ? '#dc2626' :
                                                                            '#3b82f6'
                                                            }}
                                                        >
                                                            REFUND: {order.refundStatus.toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div
                                                    className="flex items-center gap-4 text-sm text-[#525252] flex-wrap"
                                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                >
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="h-4 w-4 text-[#8a8a8a]" />
                                                        {order.customerEmail}
                                                    </span>
                                                    {order.customerPhone && (
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="h-4 w-4 text-[#8a8a8a]" />
                                                            {order.customerPhone}
                                                        </span>
                                                    )}
                                                </div>
                                                <p
                                                    className="text-xs text-[#8a8a8a] mt-2 flex items-center gap-1"
                                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                >
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className="relative">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                                                        disabled={statusUpdateLoading === order._id}
                                                        className="px-4 py-2.5 bg-white border border-[rgba(0,0,0,0.12)] rounded-xl focus:outline-none focus:border-[#c9a227] w-full cursor-pointer"
                                                        style={{
                                                            fontFamily: 'DM Sans, sans-serif',
                                                            opacity: statusUpdateLoading === order._id ? 0.5 : 1
                                                        }}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="processing">Processing</option>
                                                        <option value="shipped">Shipped</option>
                                                        <option value="delivered">Delivered</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                    {statusUpdateLoading === order._id && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
                                                            <div className="w-5 h-5 border-2 border-[#c9a227]/30 border-t-[#c9a227] rounded-full animate-spin"></div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedOrder(order)
                                                            setShowOrderDetailsModal(true)
                                                        }}
                                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl text-white text-xs font-medium transition-all"
                                                        style={{
                                                            background: 'linear-gradient(135deg, #0d0d0d 0%, #2a2a2a 100%)',
                                                            fontFamily: 'DM Sans, sans-serif'
                                                        }}
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteOrder(order._id)}
                                                        className="flex items-center justify-center px-3 py-2.5 rounded-xl border border-[rgba(220,38,38,0.2)] text-[#dc2626] hover:bg-[#dc2626]/5 hover:border-[#dc2626] transition-all"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => handleGenerateBill(order._id)}
                                                    className="w-full flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl text-white text-xs font-medium transition-all"
                                                    style={{
                                                        background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                                                        fontFamily: 'DM Sans, sans-serif'
                                                    }}
                                                >
                                                    <Mail className="h-3 w-3" />
                                                    Generate Bill
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Content Grid */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                                        {/* Left Column - Items to Ship */}
                                        <div className="lg:col-span-2 space-y-4">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Package className="h-5 w-5 text-[#c9a227]" />
                                                <h4
                                                    className="text-lg text-[#0d0d0d]"
                                                    style={{ fontFamily: 'Instrument Serif, Georgia, serif' }}
                                                >
                                                    Items to Ship ({order.items.length})
                                                </h4>
                                            </div>
                                            <div className="space-y-3">
                                                {order.items.map((item, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-4 p-4 rounded-xl hover:shadow-md transition-all"
                                                        style={{
                                                            background: '#faf9f7',
                                                            border: '1px solid rgba(0,0,0,0.04)'
                                                        }}
                                                    >
                                                        <div
                                                            className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                                                            style={{ background: 'linear-gradient(135deg, #f5f2eb 0%, #ebe6da 100%)' }}
                                                        >
                                                            {item.productImage ? (
                                                                <img
                                                                    src={convertGoogleDriveLink(item.productImage, 'w200')}
                                                                    alt={item.productName}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                                        (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="flex items-center justify-center w-full h-full"><svg class="h-8 w-8 text-[#c9a227]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg></div>';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <Package className="h-8 w-8 text-[#c9a227]" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h5
                                                                className="font-medium text-[#0d0d0d] truncate"
                                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                            >
                                                                {item.productName}
                                                            </h5>
                                                            <div
                                                                className="flex items-center gap-4 mt-1 text-sm text-[#525252]"
                                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                            >
                                                                <span>Qty: <span className="font-medium text-[#0d0d0d]">{item.quantity}</span></span>
                                                                <span>Price: <span className="font-medium text-[#c9a227]">₹{item.price.toFixed(2)}</span></span>
                                                            </div>
                                                            {/* Lens Configuration Badge */}
                                                            {item.lensConfig && (
                                                                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                                                    <span
                                                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                                                                        style={{
                                                                            background: 'rgba(59,130,246,0.1)',
                                                                            color: '#3b82f6',
                                                                            fontWeight: 500
                                                                        }}
                                                                    >
                                                                        <Eye className="h-3 w-3" />
                                                                        {item.lensConfig.lensType === 'withPower' ? 'With Power' :
                                                                            item.lensConfig.lensType === 'zeroPower' ? 'Zero Power' : 'Frame Only'}
                                                                    </span>
                                                                    {item.lensConfig.powerType && (
                                                                        <span
                                                                            className="px-2 py-0.5 rounded-full text-xs"
                                                                            style={{
                                                                                background: 'rgba(147,51,234,0.1)',
                                                                                color: '#9333ea',
                                                                                fontWeight: 500
                                                                            }}
                                                                        >
                                                                            {item.lensConfig.powerType === 'antiGlare' ? 'Anti Glare' :
                                                                                item.lensConfig.powerType === 'blueBlock' ? 'Blue Block' :
                                                                                    item.lensConfig.powerType === 'photochromic' ? 'Photochromic' : 'Colour'}
                                                                        </span>
                                                                    )}
                                                                    {item.lensConfig.powerRange && (
                                                                        <span
                                                                            className="px-2 py-0.5 rounded-full text-xs"
                                                                            style={{
                                                                                background: 'rgba(234,88,12,0.1)',
                                                                                color: '#ea580c',
                                                                                fontWeight: 500
                                                                            }}
                                                                        >
                                                                            {item.lensConfig.powerRange === 'upto5' ? '±5' : '±10'}
                                                                        </span>
                                                                    )}
                                                                    {item.lensConfig.lensPrice > 0 && (
                                                                        <span
                                                                            className="px-2 py-0.5 rounded-full text-xs"
                                                                            style={{
                                                                                background: 'rgba(22,163,74,0.1)',
                                                                                color: '#16a34a',
                                                                                fontWeight: 600
                                                                            }}
                                                                        >
                                                                            +₹{item.lensConfig.lensPrice}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                            <div
                                                                className="text-sm font-medium text-[#0d0d0d] mt-1"
                                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                            >
                                                                Subtotal: ₹{(item.price * item.quantity).toFixed(2)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Right Column - Order Details */}
                                        <div className="space-y-4">
                                            {/* Shipping Address */}
                                            {order.shippingAddress && (
                                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <MapPin className="h-5 w-5 text-blue-600" />
                                                        <h5 className="font-[600] text-black">Shipping Address</h5>
                                                    </div>
                                                    <div className="text-sm text-black/80 space-y-1">
                                                        {order.shippingAddress.name && <p className="font-[600]">{order.shippingAddress.name}</p>}
                                                        <p>{order.shippingAddress.street}</p>
                                                        <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                                                        <p>{order.shippingAddress.country} - {order.shippingAddress.zipCode}</p>
                                                        {order.shippingAddress.phone && (
                                                            <p className="pt-2 border-t border-blue-200 flex items-center gap-1">
                                                                <Phone className="h-3 w-3" />
                                                                {order.shippingAddress.phone}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Payment Details */}
                                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <DollarSign className="h-5 w-5 text-green-600" />
                                                    <h5 className="font-[600] text-black">Payment Details</h5>
                                                </div>
                                                <div className="space-y-2 text-sm">
                                                    {order.paymentMethod && (
                                                        <div className="flex justify-between">
                                                            <span className="text-black/60">Method:</span>
                                                            <span className="font-[600] text-black">{order.paymentMethod}</span>
                                                        </div>
                                                    )}
                                                    {order.paymentId && (
                                                        <div className="flex justify-between">
                                                            <span className="text-black/60">ID:</span>
                                                            <span className="font-mono text-xs text-black/70">{order.paymentId}</span>
                                                        </div>
                                                    )}
                                                    <div className="pt-3 border-t-2 border-green-200 flex justify-between items-center">
                                                        <span className="font-[600] text-black">Total Amount:</span>
                                                        <span className="text-2xl font-[700] text-green-600">₹{order.totalAmount.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Order ID */}
                                            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                                                <p className="text-xs text-black/60 mb-1">Order ID</p>
                                                <p className="font-mono text-xs text-black/80">{order._id}</p>
                                            </div>

                                            {/* Shiprocket Shipment Management */}
                                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-200">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Truck className="h-5 w-5 text-purple-600" />
                                                    <h5 className="font-[600] text-black">Shipment</h5>
                                                    {order.shiprocket?.shipmentStatus && (
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getShipmentStatusColor(order.shiprocket.shipmentStatus)}`}>
                                                            {order.shiprocket.shipmentStatus.replace(/_/g, ' ').toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>

                                                {order.shiprocket?.awbCode ? (
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-black/60">AWB:</span>
                                                            <span className="font-mono font-[600] text-black">{order.shiprocket.awbCode}</span>
                                                        </div>
                                                        {order.shiprocket.courierName && (
                                                            <div className="flex justify-between">
                                                                <span className="text-black/60">Courier:</span>
                                                                <span className="font-[600] text-black">{order.shiprocket.courierName}</span>
                                                            </div>
                                                        )}
                                                        {order.shiprocket.estimatedDeliveryDate && (
                                                            <div className="flex justify-between">
                                                                <span className="text-black/60">ETA:</span>
                                                                <span className="text-black">
                                                                    {new Date(order.shiprocket.estimatedDeliveryDate).toLocaleDateString('en-IN', {
                                                                        day: 'numeric',
                                                                        month: 'short'
                                                                    })}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div className="pt-2 flex flex-wrap gap-2" style={{ borderTop: '1px solid rgba(147,51,234,0.2)' }}>
                                                            <button
                                                                onClick={() => handleViewTracking(order)}
                                                                className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 flex items-center justify-center"
                                                                style={{ background: '#9333ea', color: 'white' }}
                                                                disabled={shipmentLoading === order._id}
                                                            >
                                                                <Navigation className="mr-1 h-3 w-3" />
                                                                Track
                                                            </button>
                                                            {order.shiprocket.labelUrl ? (
                                                                <button
                                                                    onClick={() => window.open(order.shiprocket?.labelUrl, '_blank')}
                                                                    className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center"
                                                                    style={{ background: '#4f46e5', color: 'white' }}
                                                                >
                                                                    <FileText className="mr-1 h-3 w-3" />
                                                                    Label
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleGenerateLabel(order._id)}
                                                                    className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 flex items-center justify-center"
                                                                    style={{ background: '#4f46e5', color: 'white' }}
                                                                    disabled={shipmentLoading === order._id}
                                                                >
                                                                    <FileText className="mr-1 h-3 w-3" />
                                                                    Get Label
                                                                </button>
                                                            )}
                                                        </div>
                                                        {order.shiprocket.shipmentStatus !== 'delivered' && order.shiprocket.shipmentStatus !== 'cancelled' && (
                                                            <button
                                                                onClick={() => handleCancelShipment(order._id)}
                                                                className="w-full mt-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 flex items-center justify-center"
                                                                style={{ border: '1px solid rgba(220,38,38,0.3)', color: '#dc2626', background: 'transparent' }}
                                                                disabled={shipmentLoading === order._id}
                                                            >
                                                                <X className="mr-1 h-3 w-3" />
                                                                Cancel Shipment
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : order.shiprocket?.orderId && order.status !== 'cancelled' && order.status !== 'delivered' ? (
                                                    <div className="space-y-2 text-sm">
                                                        <p className="text-[#525252] text-xs">Shiprocket order created. Assign courier to get AWB.</p>
                                                        <button
                                                            onClick={() => handleQuickShip(order._id)}
                                                            className="w-full px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 flex items-center justify-center"
                                                            style={{ background: '#9333ea', color: 'white' }}
                                                            disabled={shipmentLoading === order._id}
                                                        >
                                                            {shipmentLoading === order._id ? (
                                                                <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                                                            ) : (
                                                                <Send className="mr-1 h-3 w-3" />
                                                            )}
                                                            Assign Courier
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {['confirmed', 'processing'].includes(order.status) && order.status !== 'cancelled' ? (
                                                            <>
                                                                <p className="text-[#525252] text-xs">No shipment created yet</p>
                                                                <button
                                                                    onClick={() => handleQuickShip(order._id)}
                                                                    className="w-full px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 flex items-center justify-center"
                                                                    style={{ background: '#9333ea', color: 'white' }}
                                                                    disabled={shipmentLoading === order._id}
                                                                >
                                                                    {shipmentLoading === order._id ? (
                                                                        <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                                                                    ) : (
                                                                        <Truck className="mr-1 h-3 w-3" />
                                                                    )}
                                                                    Quick Ship
                                                                </button>
                                                                <button
                                                                    onClick={() => handleCreateShipment(order._id)}
                                                                    className="w-full px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 flex items-center justify-center"
                                                                    style={{ border: '1px solid rgba(147,51,234,0.3)', color: '#9333ea', background: 'transparent' }}
                                                                    disabled={shipmentLoading === order._id}
                                                                >
                                                                    Create Shipment Only
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <p className="text-[#525252] text-xs">
                                                                {order.status === 'pending' ? 'Confirm order to create shipment' :
                                                                    order.status === 'cancelled' ? 'Order cancelled' :
                                                                        order.status === 'delivered' ? 'Order delivered' : 'Cannot create shipment'}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredOrders.length === 0 && (
                                <div
                                    className="bg-white rounded-2xl p-16 text-center"
                                    style={{
                                        border: '1px solid rgba(0,0,0,0.06)',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                                    }}
                                >
                                    <div
                                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(201, 162, 39, 0.1) 0%, rgba(201, 162, 39, 0.2) 100%)',
                                            border: '1px solid rgba(201, 162, 39, 0.2)'
                                        }}
                                    >
                                        <ShoppingBag className="h-8 w-8 text-[#c9a227]" />
                                    </div>
                                    <p
                                        className="text-[#525252] mb-4"
                                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                                    >
                                        {orders.length === 0 ? 'No orders yet' : 'No orders match your search criteria'}
                                    </p>
                                    {orders.length > 0 && (orderSearch || orderStatusFilter !== 'all' || orderPaymentFilter !== 'all' || orderDateFilter !== 'all') && (
                                        <button
                                            onClick={() => {
                                                setOrderSearch('')
                                                setOrderStatusFilter('all')
                                                setOrderPaymentFilter('all')
                                                setOrderDateFilter('all')
                                            }}
                                            className="px-5 py-2.5 rounded-xl border border-[rgba(0,0,0,0.12)] text-[#525252] hover:text-[#0d0d0d] hover:border-[#0d0d0d] transition-all font-medium"
                                            style={{ fontFamily: 'DM Sans, sans-serif' }}
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <h2
                                className="text-2xl text-[#0d0d0d]"
                                style={{ fontFamily: 'Instrument Serif, Georgia, serif', letterSpacing: '-0.02em' }}
                            >
                                Manage Users
                            </h2>
                            <button
                                onClick={() => exportToCSV('users')}
                                className="flex items-center gap-2 px-5 py-3 rounded-xl text-white font-medium transition-all"
                                style={{
                                    background: 'linear-gradient(135deg, #0d0d0d 0%, #2a2a2a 100%)',
                                    fontFamily: 'DM Sans, sans-serif',
                                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)'
                                }}
                            >
                                <Download className="h-4 w-4" />
                                Export Users
                            </button>
                        </div>

                        {/* Search and Filter Bar for Users */}
                        <div
                            className="bg-white rounded-2xl p-5 mb-6"
                            style={{
                                border: '1px solid rgba(0,0,0,0.06)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                            }}
                        >
                            <div className="flex flex-col lg:flex-row gap-4">
                                {/* Search Input */}
                                <div className="flex-1 relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a8a8a] transition-colors group-focus-within:text-[#c9a227]" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, or phone..."
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#c9a227] focus:bg-white transition-all"
                                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                                    />
                                </div>

                                {/* Verification Filter */}
                                <div className="flex items-center gap-3">
                                    <UserCheck className="h-4 w-4 text-[#8a8a8a]" />
                                    <select
                                        value={userVerificationFilter}
                                        onChange={(e) => setUserVerificationFilter(e.target.value)}
                                        className="px-4 py-3 bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#c9a227] min-w-[150px] cursor-pointer"
                                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                                    >
                                        <option value="all">All Users</option>
                                        <option value="verified">Verified</option>
                                        <option value="unverified">Unverified</option>
                                    </select>
                                </div>

                                {/* Clear Filters */}
                                {(userSearch || userVerificationFilter !== 'all') && (
                                    <button
                                        onClick={() => {
                                            setUserSearch('')
                                            setUserVerificationFilter('all')
                                        }}
                                        className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[rgba(0,0,0,0.12)] text-[#525252] hover:text-[#0d0d0d] hover:border-[#0d0d0d] transition-all"
                                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                                    >
                                        <X className="h-4 w-4" />
                                        Clear
                                    </button>
                                )}
                            </div>

                            {/* Results count */}
                            <div
                                className="mt-4 text-sm text-[#8a8a8a]"
                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                            >
                                Showing <span className="text-[#0d0d0d] font-medium">{filteredUsers.length}</span> of {users.length} users
                                {userSearch && <span> matching "<span className="text-[#c9a227]">{userSearch}</span>"</span>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredUsers.map((user) => (
                                <div
                                    key={user._id}
                                    className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all"
                                    style={{
                                        border: '1px solid rgba(0,0,0,0.06)',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                                    }}
                                >
                                    <div className="flex items-start gap-4">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-medium text-lg"
                                            style={{
                                                background: 'linear-gradient(135deg, #c9a227 0%, #8b6f1b 100%)',
                                                fontFamily: 'DM Sans, sans-serif'
                                            }}
                                        >
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3
                                                    className="font-medium text-[#0d0d0d] truncate"
                                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                >
                                                    {user.name}
                                                </h3>
                                                {user.isVerified ? (
                                                    <UserCheck className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                ) : (
                                                    <UserX className="h-4 w-4 text-red-600 flex-shrink-0" />
                                                )}
                                            </div>
                                            <p
                                                className="text-sm text-[#525252] flex items-center gap-1 mt-1 truncate"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            >
                                                <Mail className="h-3 w-3" />
                                                {user.email}
                                            </p>
                                            {user.phone && (
                                                <p
                                                    className="text-sm text-[#525252] flex items-center gap-1 mt-1"
                                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                >
                                                    <Phone className="h-3 w-3" />
                                                    {user.phone}
                                                </p>
                                            )}
                                            <p
                                                className="text-xs text-[#8a8a8a] flex items-center gap-1 mt-2"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            >
                                                <Calendar className="h-3 w-3" />
                                                Joined {new Date(user.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                            <div className="flex gap-2 mt-3">
                                                <span
                                                    className="px-2.5 py-1 rounded-lg text-xs font-medium"
                                                    style={{
                                                        fontFamily: 'DM Sans, sans-serif',
                                                        background: user.isVerified ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                                                        color: user.isVerified ? '#16a34a' : '#dc2626'
                                                    }}
                                                >
                                                    {user.isVerified ? 'Verified' : 'Unverified'}
                                                </span>
                                                {user.addresses && user.addresses.length > 0 && (
                                                    <span
                                                        className="px-2.5 py-1 rounded-lg text-xs font-medium"
                                                        style={{
                                                            fontFamily: 'DM Sans, sans-serif',
                                                            background: 'rgba(59, 130, 246, 0.1)',
                                                            color: '#3b82f6'
                                                        }}
                                                    >
                                                        {user.addresses.length} Address{user.addresses.length > 1 ? 'es' : ''}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-2 mt-4">
                                                <button
                                                    onClick={() => handleViewUser(user)}
                                                    className="flex-1 px-3 py-2 rounded-xl border border-[rgba(0,0,0,0.12)] text-[#525252] hover:text-[#0d0d0d] hover:border-[#0d0d0d] transition-all text-sm flex items-center justify-center gap-1"
                                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                >
                                                    <Eye className="h-3 w-3" />
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user._id)}
                                                    className="px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {filteredUsers.length === 0 && (
                            <div
                                className="bg-white rounded-2xl p-16 text-center"
                                style={{
                                    border: '1px solid rgba(0,0,0,0.06)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                                }}
                            >
                                <div
                                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(201, 162, 39, 0.1) 0%, rgba(201, 162, 39, 0.2) 100%)',
                                        border: '1px solid rgba(201, 162, 39, 0.2)'
                                    }}
                                >
                                    <Users className="h-8 w-8 text-[#c9a227]" />
                                </div>
                                <p
                                    className="text-[#525252] mb-4"
                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                >
                                    {users.length === 0 ? 'No users found' : 'No users match your search criteria'}
                                </p>
                                {users.length > 0 && (userSearch || userVerificationFilter !== 'all') && (
                                    <button
                                        onClick={() => {
                                            setUserSearch('')
                                            setUserVerificationFilter('all')
                                        }}
                                        className="px-5 py-2.5 rounded-xl border border-[rgba(0,0,0,0.12)] text-[#525252] hover:text-[#0d0d0d] hover:border-[#0d0d0d] transition-all font-medium"
                                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div>
                        <h2
                            className="text-2xl text-[#0d0d0d] mb-6"
                            style={{ fontFamily: 'Instrument Serif, Georgia, serif', letterSpacing: '-0.02em' }}
                        >
                            Admin Settings
                        </h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Admin Profile */}
                            <div
                                className="bg-white rounded-2xl p-6"
                                style={{
                                    border: '1px solid rgba(0,0,0,0.06)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                                }}
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <Shield className="h-5 w-5 text-[#c9a227]" />
                                    <h3
                                        className="text-lg font-medium text-[#0d0d0d]"
                                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                                    >
                                        Admin Profile
                                    </h3>
                                </div>
                                <div className="space-y-3">
                                    <div
                                        className="flex items-center gap-3 p-4 rounded-xl"
                                        style={{ background: '#faf9f7' }}
                                    >
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                                            style={{
                                                background: 'linear-gradient(135deg, #c9a227 0%, #8b6f1b 100%)',
                                                fontFamily: 'DM Sans, sans-serif'
                                            }}
                                        >
                                            A
                                        </div>
                                        <div>
                                            <p
                                                className="font-medium text-[#0d0d0d]"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            >
                                                Administrator
                                            </p>
                                            <p
                                                className="text-sm text-[#525252]"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            >
                                                Full Access
                                            </p>
                                        </div>
                                    </div>
                                    <div
                                        className="text-sm text-[#525252]"
                                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                                    >
                                        <p className="flex items-center gap-2 py-1">
                                            <Clock className="h-4 w-4" />
                                            Session started: {new Date().toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Site Settings */}
                            <div
                                className="bg-white rounded-2xl p-6"
                                style={{
                                    border: '1px solid rgba(0,0,0,0.06)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                                }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-5 w-5 text-[#c9a227]" />
                                        <h3
                                            className="text-lg font-medium text-[#0d0d0d]"
                                            style={{ fontFamily: 'DM Sans, sans-serif' }}
                                        >
                                            Site Settings
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSettingsForm(siteSettings)
                                            setShowEditSettings(!showEditSettings)
                                        }}
                                        className="px-4 py-2 rounded-xl border border-[rgba(0,0,0,0.12)] text-[#525252] hover:text-[#0d0d0d] hover:border-[#0d0d0d] transition-all text-sm"
                                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                                    >
                                        {showEditSettings ? 'Cancel' : 'Edit'}
                                    </button>
                                </div>
                                {showEditSettings ? (
                                    <div className="space-y-3">
                                        <div>
                                            <label
                                                className="text-sm font-medium text-[#525252] mb-1 block"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            >
                                                Recovery Email
                                            </label>
                                            <input
                                                type="email"
                                                placeholder="Recovery Email"
                                                value={settingsForm.recoveryEmail}
                                                onChange={(e) => setSettingsForm({ ...settingsForm, recoveryEmail: e.target.value })}
                                                className="w-full px-4 py-3 bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#c9a227] focus:bg-white transition-all"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            />
                                        </div>
                                        <div>
                                            <label
                                                className="text-sm font-medium text-[#525252] mb-1 block"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            >
                                                Site Name
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Site Name"
                                                value={settingsForm.siteName}
                                                onChange={(e) => setSettingsForm({ ...settingsForm, siteName: e.target.value })}
                                                className="w-full px-4 py-3 bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#c9a227] focus:bg-white transition-all"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            />
                                        </div>
                                        <div>
                                            <label
                                                className="text-sm font-medium text-[#525252] mb-1 block"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            >
                                                Support Email
                                            </label>
                                            <input
                                                type="email"
                                                placeholder="Support Email"
                                                value={settingsForm.supportEmail}
                                                onChange={(e) => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                                                className="w-full px-4 py-3 bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#c9a227] focus:bg-white transition-all"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            />
                                        </div>
                                        <div>
                                            <label
                                                className="text-sm font-medium text-[#525252] mb-1 block"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            >
                                                Platform Charges (₹)
                                            </label>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                min="0"
                                                value={settingsForm.platformCharges}
                                                onChange={(e) => setSettingsForm({ ...settingsForm, platformCharges: Number(e.target.value) || 0 })}
                                                className="w-full px-4 py-3 bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#c9a227] focus:bg-white transition-all"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            />
                                        </div>
                                        <div>
                                            <label
                                                className="text-sm font-medium text-[#525252] mb-1 block"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            >
                                                Delivery Charges (₹)
                                            </label>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                min="0"
                                                value={settingsForm.deliveryCharges}
                                                onChange={(e) => setSettingsForm({ ...settingsForm, deliveryCharges: Number(e.target.value) || 0 })}
                                                className="w-full px-4 py-3 bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#c9a227] focus:bg-white transition-all"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            />
                                        </div>
                                        <div
                                            className="flex items-center justify-between p-4 rounded-xl"
                                            style={{ background: '#faf9f7' }}
                                        >
                                            <div>
                                                <label
                                                    className="text-sm font-medium text-[#525252]"
                                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                >
                                                    Cash on Delivery
                                                </label>
                                                <p
                                                    className="text-xs text-[#8a8a8a]"
                                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                >
                                                    Enable or disable COD payment option
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setSettingsForm({ ...settingsForm, codEnabled: !settingsForm.codEnabled })}
                                                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                                                style={{ background: settingsForm.codEnabled ? '#c9a227' : '#d1d5db' }}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settingsForm.codEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                                                />
                                            </button>
                                        </div>
                                        <button
                                            onClick={handleUpdateSettings}
                                            className="w-full px-5 py-3 rounded-xl text-white font-medium transition-all"
                                            style={{
                                                background: 'linear-gradient(135deg, #c9a227 0%, #8b6f1b 100%)',
                                                fontFamily: 'DM Sans, sans-serif',
                                                boxShadow: '0 4px 16px rgba(201, 162, 39, 0.3)'
                                            }}
                                        >
                                            Save Settings
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2 text-sm">
                                        <div
                                            className="flex justify-between items-center p-3 rounded-xl"
                                            style={{ background: '#faf9f7', fontFamily: 'DM Sans, sans-serif' }}
                                        >
                                            <span className="text-[#525252]">Recovery Email:</span>
                                            <span className="font-medium text-[#0d0d0d] truncate max-w-[180px]">{siteSettings.recoveryEmail}</span>
                                        </div>
                                        <div
                                            className="flex justify-between items-center p-3 rounded-xl"
                                            style={{ background: '#faf9f7', fontFamily: 'DM Sans, sans-serif' }}
                                        >
                                            <span className="text-[#525252]">Site Name:</span>
                                            <span className="font-medium text-[#0d0d0d]">{siteSettings.siteName}</span>
                                        </div>
                                        <div
                                            className="flex justify-between items-center p-3 rounded-xl"
                                            style={{ background: '#faf9f7', fontFamily: 'DM Sans, sans-serif' }}
                                        >
                                            <span className="text-[#525252]">Support Email:</span>
                                            <span className="font-medium text-[#0d0d0d] truncate max-w-[180px]">{siteSettings.supportEmail}</span>
                                        </div>
                                        <div
                                            className="flex justify-between items-center p-3 rounded-xl"
                                            style={{ background: '#faf9f7', fontFamily: 'DM Sans, sans-serif' }}
                                        >
                                            <span className="text-[#525252]">Platform Charges:</span>
                                            <span className="font-medium text-[#0d0d0d]">₹{siteSettings.platformCharges}</span>
                                        </div>
                                        <div
                                            className="flex justify-between items-center p-3 rounded-xl"
                                            style={{ background: '#faf9f7', fontFamily: 'DM Sans, sans-serif' }}
                                        >
                                            <span className="text-[#525252]">Delivery Charges:</span>
                                            <span className="font-medium text-[#0d0d0d]">₹{siteSettings.deliveryCharges}</span>
                                        </div>
                                        <div
                                            className="flex justify-between items-center p-3 rounded-xl"
                                            style={{ background: '#faf9f7', fontFamily: 'DM Sans, sans-serif' }}
                                        >
                                            <span className="text-[#525252]">Cash on Delivery:</span>
                                            <span
                                                className="px-2.5 py-1 rounded-lg text-xs font-medium"
                                                style={{
                                                    background: siteSettings.codEnabled !== false ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                                                    color: siteSettings.codEnabled !== false ? '#16a34a' : '#dc2626'
                                                }}
                                            >
                                                {siteSettings.codEnabled !== false ? 'Enabled' : 'Disabled'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Security Settings */}
                            <div
                                className="bg-white rounded-2xl p-6"
                                style={{
                                    border: '1px solid rgba(0,0,0,0.06)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                                }}
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <Shield className="h-5 w-5 text-[#c9a227]" />
                                    <h3
                                        className="text-lg font-medium text-[#0d0d0d]"
                                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                                    >
                                        Security
                                    </h3>
                                </div>
                                <div className="space-y-4">
                                    <button
                                        onClick={() => setShowChangePassword(!showChangePassword)}
                                        className="w-full px-4 py-3 rounded-xl border border-[rgba(0,0,0,0.12)] text-[#525252] hover:text-[#0d0d0d] hover:border-[#0d0d0d] transition-all text-left"
                                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                                    >
                                        Change Password
                                    </button>
                                    {showChangePassword && (
                                        <div
                                            className="space-y-3 p-4 rounded-xl"
                                            style={{ background: '#faf9f7' }}
                                        >
                                            <input
                                                type="password"
                                                placeholder="Current Password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#c9a227] transition-all"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            />
                                            <input
                                                type="password"
                                                placeholder="New Password (min 6 characters)"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#c9a227] transition-all"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            />
                                            <button
                                                onClick={handleChangePassword}
                                                className="w-full px-5 py-3 rounded-xl text-white font-medium transition-all"
                                                style={{
                                                    background: 'linear-gradient(135deg, #c9a227 0%, #8b6f1b 100%)',
                                                    fontFamily: 'DM Sans, sans-serif',
                                                    boxShadow: '0 4px 16px rgba(201, 162, 39, 0.3)'
                                                }}
                                            >
                                                Update Password
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div
                                className="bg-white rounded-2xl p-6"
                                style={{
                                    border: '1px solid rgba(0,0,0,0.06)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                                }}
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <Activity className="h-5 w-5 text-[#c9a227]" />
                                    <h3
                                        className="text-lg font-medium text-[#0d0d0d]"
                                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                                    >
                                        Quick Stats
                                    </h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div
                                        className="p-4 rounded-xl text-center"
                                        style={{ background: '#faf9f7' }}
                                    >
                                        <p
                                            className="text-2xl font-semibold text-[#c9a227]"
                                            style={{ fontFamily: 'DM Sans, sans-serif' }}
                                        >
                                            {products.length}
                                        </p>
                                        <p
                                            className="text-xs text-[#525252]"
                                            style={{ fontFamily: 'DM Sans, sans-serif' }}
                                        >
                                            Products
                                        </p>
                                    </div>
                                    <div
                                        className="p-4 rounded-xl text-center"
                                        style={{ background: '#faf9f7' }}
                                    >
                                        <p
                                            className="text-2xl font-semibold text-[#c9a227]"
                                            style={{ fontFamily: 'DM Sans, sans-serif' }}
                                        >
                                            {orders.length}
                                        </p>
                                        <p
                                            className="text-xs text-[#525252]"
                                            style={{ fontFamily: 'DM Sans, sans-serif' }}
                                        >
                                            Orders
                                        </p>
                                    </div>
                                    <div
                                        className="p-4 rounded-xl text-center"
                                        style={{ background: '#faf9f7' }}
                                    >
                                        <p
                                            className="text-2xl font-semibold text-[#c9a227]"
                                            style={{ fontFamily: 'DM Sans, sans-serif' }}
                                        >
                                            {users.length}
                                        </p>
                                        <p
                                            className="text-xs text-[#525252]"
                                            style={{ fontFamily: 'DM Sans, sans-serif' }}
                                        >
                                            Users
                                        </p>
                                    </div>
                                    <div
                                        className="p-4 rounded-xl text-center"
                                        style={{ background: '#faf9f7' }}
                                    >
                                        <p
                                            className="text-2xl font-semibold text-[#c9a227]"
                                            style={{ fontFamily: 'DM Sans, sans-serif' }}
                                        >
                                            ₹{stats.totalRevenue?.toLocaleString() || 0}
                                        </p>
                                        <p
                                            className="text-xs text-[#525252]"
                                            style={{ fontFamily: 'DM Sans, sans-serif' }}
                                        >
                                            Revenue
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Shiprocket Pickup Address */}
                            <div
                                className="bg-white rounded-2xl p-6 lg:col-span-2"
                                style={{
                                    border: '1px solid rgba(0,0,0,0.06)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                                }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Truck className="h-5 w-5 text-[#9333ea]" />
                                        <h3
                                            className="text-lg font-medium text-[#0d0d0d]"
                                            style={{ fontFamily: 'DM Sans, sans-serif' }}
                                        >
                                            Shiprocket Pickup Address
                                        </h3>
                                        {siteSettings.pickupAddressConfigured ? (
                                            <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-green-100 text-green-700">Configured</span>
                                        ) : (
                                            <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-orange-100 text-orange-700">Not Configured</span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSettingsForm({
                                                ...settingsForm,
                                                pickupAddress: siteSettings.pickupAddress || {
                                                    pickupLocationName: 'Primary',
                                                    name: '',
                                                    email: '',
                                                    phone: '',
                                                    address: '',
                                                    address2: '',
                                                    city: '',
                                                    state: '',
                                                    country: 'India',
                                                    pincode: ''
                                                }
                                            })
                                            setShowEditPickupAddress(!showEditPickupAddress)
                                        }}
                                        className="px-4 py-2 rounded-xl border border-[rgba(0,0,0,0.12)] text-[#525252] hover:text-[#0d0d0d] hover:border-[#0d0d0d] transition-all text-sm"
                                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                                    >
                                        {showEditPickupAddress ? 'Cancel' : siteSettings.pickupAddressConfigured ? 'Edit' : 'Add'}
                                    </button>
                                </div>
                                <p className="text-sm text-[#8a8a8a] mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                    Configure the pickup address for Shiprocket shipments. This address will be used for all order pickups.
                                </p>
                                {showEditPickupAddress ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-[#525252] mb-1 block" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                                Pickup Location Name*
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g., Primary, Warehouse"
                                                value={settingsForm.pickupAddress?.pickupLocationName || ''}
                                                onChange={(e) => setSettingsForm({
                                                    ...settingsForm,
                                                    pickupAddress: { ...settingsForm.pickupAddress, pickupLocationName: e.target.value }
                                                })}
                                                className="w-full px-4 py-3 bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#9333ea] focus:bg-white transition-all"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-[#525252] mb-1 block" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                                Contact Name*
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Contact person name"
                                                value={settingsForm.pickupAddress?.name || ''}
                                                onChange={(e) => setSettingsForm({
                                                    ...settingsForm,
                                                    pickupAddress: { ...settingsForm.pickupAddress, name: e.target.value }
                                                })}
                                                className="w-full px-4 py-3 bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#9333ea] focus:bg-white transition-all"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-[#525252] mb-1 block" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                                Phone Number*
                                            </label>
                                            <input
                                                type="tel"
                                                placeholder="10 digit mobile number"
                                                value={settingsForm.pickupAddress?.phone || ''}
                                                onChange={(e) => setSettingsForm({
                                                    ...settingsForm,
                                                    pickupAddress: { ...settingsForm.pickupAddress, phone: e.target.value }
                                                })}
                                                className="w-full px-4 py-3 bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#9333ea] focus:bg-white transition-all"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-[#525252] mb-1 block" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                placeholder="Email address"
                                                value={settingsForm.pickupAddress?.email || ''}
                                                onChange={(e) => setSettingsForm({
                                                    ...settingsForm,
                                                    pickupAddress: { ...settingsForm.pickupAddress, email: e.target.value }
                                                })}
                                                className="w-full px-4 py-3 bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#9333ea] focus:bg-white transition-all"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-sm font-medium text-[#525252] mb-1 block" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                                Address Line 1*
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Street address, building name"
                                                value={settingsForm.pickupAddress?.address || ''}
                                                onChange={(e) => setSettingsForm({
                                                    ...settingsForm,
                                                    pickupAddress: { ...settingsForm.pickupAddress, address: e.target.value }
                                                })}
                                                className="w-full px-4 py-3 bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#9333ea] focus:bg-white transition-all"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-sm font-medium text-[#525252] mb-1 block" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                                Address Line 2 (Landmark)
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Landmark, area"
                                                value={settingsForm.pickupAddress?.address2 || ''}
                                                onChange={(e) => setSettingsForm({
                                                    ...settingsForm,
                                                    pickupAddress: { ...settingsForm.pickupAddress, address2: e.target.value }
                                                })}
                                                className="w-full px-4 py-3 bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#9333ea] focus:bg-white transition-all"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-[#525252] mb-1 block" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                                City*
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="City"
                                                value={settingsForm.pickupAddress?.city || ''}
                                                onChange={(e) => setSettingsForm({
                                                    ...settingsForm,
                                                    pickupAddress: { ...settingsForm.pickupAddress, city: e.target.value }
                                                })}
                                                className="w-full px-4 py-3 bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#9333ea] focus:bg-white transition-all"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-[#525252] mb-1 block" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                                State*
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="State"
                                                value={settingsForm.pickupAddress?.state || ''}
                                                onChange={(e) => setSettingsForm({
                                                    ...settingsForm,
                                                    pickupAddress: { ...settingsForm.pickupAddress, state: e.target.value }
                                                })}
                                                className="w-full px-4 py-3 bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#9333ea] focus:bg-white transition-all"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-[#525252] mb-1 block" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                                Pincode*
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="6 digit pincode"
                                                value={settingsForm.pickupAddress?.pincode || ''}
                                                onChange={(e) => setSettingsForm({
                                                    ...settingsForm,
                                                    pickupAddress: { ...settingsForm.pickupAddress, pincode: e.target.value }
                                                })}
                                                className="w-full px-4 py-3 bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#9333ea] focus:bg-white transition-all"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-[#525252] mb-1 block" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                                Country
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Country"
                                                value={settingsForm.pickupAddress?.country || 'India'}
                                                onChange={(e) => setSettingsForm({
                                                    ...settingsForm,
                                                    pickupAddress: { ...settingsForm.pickupAddress, country: e.target.value }
                                                })}
                                                className="w-full px-4 py-3 bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#9333ea] focus:bg-white transition-all"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <button
                                                onClick={() => handleUpdateSettings()}
                                                className="w-full px-5 py-3 rounded-xl text-white font-medium transition-all"
                                                style={{
                                                    background: 'linear-gradient(135deg, #9333ea 0%, #6b21a8 100%)',
                                                    fontFamily: 'DM Sans, sans-serif',
                                                    boxShadow: '0 4px 16px rgba(147, 51, 234, 0.3)'
                                                }}
                                            >
                                                Save Pickup Address
                                            </button>
                                        </div>
                                        <div className="md:col-span-2 pt-2">
                                            <p className="text-xs text-[#8a8a8a] mb-2 p-3 rounded-lg bg-[#faf9f7]">
                                                <strong>Important:</strong> The "Pickup Location Name" must match exactly with a pickup location you've created in your Shiprocket dashboard.
                                                Go to <a href="https://app.shiprocket.in/settings/pickup-addresses" target="_blank" rel="noopener noreferrer" className="text-[#9333ea] underline">Shiprocket → Settings → Pickup Addresses</a> to add or verify your pickup locations.
                                            </p>
                                        </div>
                                    </div>
                                ) : siteSettings.pickupAddressConfigured && siteSettings.pickupAddress ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div className="p-3 rounded-xl" style={{ background: '#faf9f7' }}>
                                            <span className="text-[#8a8a8a] text-xs">Location Name</span>
                                            <p className="font-medium text-[#0d0d0d]">{siteSettings.pickupAddress.pickupLocationName || 'Primary'}</p>
                                        </div>
                                        <div className="p-3 rounded-xl" style={{ background: '#faf9f7' }}>
                                            <span className="text-[#8a8a8a] text-xs">Contact Name</span>
                                            <p className="font-medium text-[#0d0d0d]">{siteSettings.pickupAddress.name}</p>
                                        </div>
                                        <div className="p-3 rounded-xl" style={{ background: '#faf9f7' }}>
                                            <span className="text-[#8a8a8a] text-xs">Phone</span>
                                            <p className="font-medium text-[#0d0d0d]">{siteSettings.pickupAddress.phone}</p>
                                        </div>
                                        <div className="p-3 rounded-xl" style={{ background: '#faf9f7' }}>
                                            <span className="text-[#8a8a8a] text-xs">Pincode</span>
                                            <p className="font-medium text-[#0d0d0d]">{siteSettings.pickupAddress.pincode}</p>
                                        </div>
                                        <div className="p-3 rounded-xl md:col-span-2" style={{ background: '#faf9f7' }}>
                                            <span className="text-[#8a8a8a] text-xs">Address</span>
                                            <p className="font-medium text-[#0d0d0d]">
                                                {siteSettings.pickupAddress.address}
                                                {siteSettings.pickupAddress.address2 && `, ${siteSettings.pickupAddress.address2}`}
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-xl" style={{ background: '#faf9f7' }}>
                                            <span className="text-[#8a8a8a] text-xs">City</span>
                                            <p className="font-medium text-[#0d0d0d]">{siteSettings.pickupAddress.city}</p>
                                        </div>
                                        <div className="p-3 rounded-xl" style={{ background: '#faf9f7' }}>
                                            <span className="text-[#8a8a8a] text-xs">State</span>
                                            <p className="font-medium text-[#0d0d0d]">{siteSettings.pickupAddress.state}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-[#8a8a8a]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                        <Truck className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                        <p>No pickup address configured yet.</p>
                                        <p className="text-sm mt-1">Click "Add" to configure your Shiprocket pickup address.</p>
                                    </div>
                                )}
                            </div>

                            {/* Lens Pricing Settings */}
                            <div
                                className="bg-white rounded-2xl p-6 lg:col-span-2"
                                style={{
                                    border: '1px solid rgba(0,0,0,0.06)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                                }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Eye className="h-5 w-5 text-[#3b82f6]" />
                                        <h3
                                            className="text-lg font-medium text-[#0d0d0d]"
                                            style={{ fontFamily: 'DM Sans, sans-serif' }}
                                        >
                                            Lens Pricing Settings
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => setShowEditLensSettings(!showEditLensSettings)}
                                        className="px-4 py-2 rounded-xl border border-[rgba(0,0,0,0.12)] text-[#525252] hover:text-[#0d0d0d] hover:border-[#0d0d0d] transition-all text-sm"
                                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                                    >
                                        {showEditLensSettings ? 'Cancel' : 'Edit Pricing'}
                                    </button>
                                </div>

                                {showEditLensSettings ? (
                                    <div className="space-y-6">
                                        {/* Power Types Pricing */}
                                        <div>
                                            <h4 className="text-sm font-medium text-[#525252] mb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                                Lens Power Types
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Anti Glare */}
                                                <div className="p-4 rounded-xl" style={{ background: '#faf9f7' }}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium text-[#0d0d0d]">Anti Glare</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setLensSettingsForm({
                                                                ...lensSettingsForm,
                                                                powerTypes: {
                                                                    ...lensSettingsForm.powerTypes,
                                                                    antiGlare: { ...lensSettingsForm.powerTypes.antiGlare, enabled: !lensSettingsForm.powerTypes.antiGlare.enabled }
                                                                }
                                                            })}
                                                            className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                                                            style={{ background: lensSettingsForm.powerTypes.antiGlare.enabled ? '#3b82f6' : '#d1d5db' }}
                                                        >
                                                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${lensSettingsForm.powerTypes.antiGlare.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-[#8a8a8a]">₹</span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={lensSettingsForm.powerTypes.antiGlare.price}
                                                            onChange={(e) => setLensSettingsForm({
                                                                ...lensSettingsForm,
                                                                powerTypes: {
                                                                    ...lensSettingsForm.powerTypes,
                                                                    antiGlare: { ...lensSettingsForm.powerTypes.antiGlare, price: Number(e.target.value) || 0 }
                                                                }
                                                            })}
                                                            className="flex-1 px-3 py-2 bg-white border border-[rgba(0,0,0,0.08)] rounded-lg focus:outline-none focus:border-[#3b82f6] text-sm"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Blue Block */}
                                                <div className="p-4 rounded-xl" style={{ background: '#faf9f7' }}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium text-[#0d0d0d]">Blue Block</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setLensSettingsForm({
                                                                ...lensSettingsForm,
                                                                powerTypes: {
                                                                    ...lensSettingsForm.powerTypes,
                                                                    blueBlock: { ...lensSettingsForm.powerTypes.blueBlock, enabled: !lensSettingsForm.powerTypes.blueBlock.enabled }
                                                                }
                                                            })}
                                                            className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                                                            style={{ background: lensSettingsForm.powerTypes.blueBlock.enabled ? '#3b82f6' : '#d1d5db' }}
                                                        >
                                                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${lensSettingsForm.powerTypes.blueBlock.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-[#8a8a8a]">₹</span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={lensSettingsForm.powerTypes.blueBlock.price}
                                                            onChange={(e) => setLensSettingsForm({
                                                                ...lensSettingsForm,
                                                                powerTypes: {
                                                                    ...lensSettingsForm.powerTypes,
                                                                    blueBlock: { ...lensSettingsForm.powerTypes.blueBlock, price: Number(e.target.value) || 0 }
                                                                }
                                                            })}
                                                            className="flex-1 px-3 py-2 bg-white border border-[rgba(0,0,0,0.08)] rounded-lg focus:outline-none focus:border-[#3b82f6] text-sm"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Photochromic */}
                                                <div className="p-4 rounded-xl" style={{ background: '#faf9f7' }}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium text-[#0d0d0d]">Photochromic</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setLensSettingsForm({
                                                                ...lensSettingsForm,
                                                                powerTypes: {
                                                                    ...lensSettingsForm.powerTypes,
                                                                    photochromic: { ...lensSettingsForm.powerTypes.photochromic, enabled: !lensSettingsForm.powerTypes.photochromic.enabled }
                                                                }
                                                            })}
                                                            className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                                                            style={{ background: lensSettingsForm.powerTypes.photochromic.enabled ? '#3b82f6' : '#d1d5db' }}
                                                        >
                                                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${lensSettingsForm.powerTypes.photochromic.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-[#8a8a8a]">₹</span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={lensSettingsForm.powerTypes.photochromic.price}
                                                            onChange={(e) => setLensSettingsForm({
                                                                ...lensSettingsForm,
                                                                powerTypes: {
                                                                    ...lensSettingsForm.powerTypes,
                                                                    photochromic: { ...lensSettingsForm.powerTypes.photochromic, price: Number(e.target.value) || 0 }
                                                                }
                                                            })}
                                                            className="flex-1 px-3 py-2 bg-white border border-[rgba(0,0,0,0.08)] rounded-lg focus:outline-none focus:border-[#3b82f6] text-sm"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Colour */}
                                                <div className="p-4 rounded-xl" style={{ background: '#faf9f7' }}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium text-[#0d0d0d]">Colour Lenses</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setLensSettingsForm({
                                                                ...lensSettingsForm,
                                                                powerTypes: {
                                                                    ...lensSettingsForm.powerTypes,
                                                                    colour: { ...lensSettingsForm.powerTypes.colour, enabled: !lensSettingsForm.powerTypes.colour.enabled }
                                                                }
                                                            })}
                                                            className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                                                            style={{ background: lensSettingsForm.powerTypes.colour.enabled ? '#3b82f6' : '#d1d5db' }}
                                                        >
                                                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${lensSettingsForm.powerTypes.colour.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-[#8a8a8a]">₹</span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={lensSettingsForm.powerTypes.colour.price}
                                                            onChange={(e) => setLensSettingsForm({
                                                                ...lensSettingsForm,
                                                                powerTypes: {
                                                                    ...lensSettingsForm.powerTypes,
                                                                    colour: { ...lensSettingsForm.powerTypes.colour, price: Number(e.target.value) || 0 }
                                                                }
                                                            })}
                                                            className="flex-1 px-3 py-2 bg-white border border-[rgba(0,0,0,0.08)] rounded-lg focus:outline-none focus:border-[#3b82f6] text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Power Ranges Pricing */}
                                        <div>
                                            <h4 className="text-sm font-medium text-[#525252] mb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                                Power Range Additional Charges
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-4 rounded-xl" style={{ background: '#faf9f7' }}>
                                                    <span className="font-medium text-[#0d0d0d] block mb-2">Upto ±5</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-[#8a8a8a]">₹</span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={lensSettingsForm.powerRanges.upto5.price}
                                                            onChange={(e) => setLensSettingsForm({
                                                                ...lensSettingsForm,
                                                                powerRanges: {
                                                                    ...lensSettingsForm.powerRanges,
                                                                    upto5: { ...lensSettingsForm.powerRanges.upto5, price: Number(e.target.value) || 0 }
                                                                }
                                                            })}
                                                            className="flex-1 px-3 py-2 bg-white border border-[rgba(0,0,0,0.08)] rounded-lg focus:outline-none focus:border-[#3b82f6] text-sm"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="p-4 rounded-xl" style={{ background: '#faf9f7' }}>
                                                    <span className="font-medium text-[#0d0d0d] block mb-2">Upto ±10</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-[#8a8a8a]">₹</span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={lensSettingsForm.powerRanges.upto10.price}
                                                            onChange={(e) => setLensSettingsForm({
                                                                ...lensSettingsForm,
                                                                powerRanges: {
                                                                    ...lensSettingsForm.powerRanges,
                                                                    upto10: { ...lensSettingsForm.powerRanges.upto10, price: Number(e.target.value) || 0 }
                                                                }
                                                            })}
                                                            className="flex-1 px-3 py-2 bg-white border border-[rgba(0,0,0,0.08)] rounded-lg focus:outline-none focus:border-[#3b82f6] text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleSaveLensSettings}
                                            className="w-full px-5 py-3 rounded-xl text-white font-medium transition-all"
                                            style={{
                                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                                fontFamily: 'DM Sans, sans-serif',
                                                boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)'
                                            }}
                                        >
                                            Save Lens Settings
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div className="p-3 rounded-xl" style={{ background: '#faf9f7' }}>
                                            <span className="text-[#8a8a8a] text-xs">Anti Glare</span>
                                            <p className="font-medium text-[#0d0d0d]">₹{lensSettingsForm.powerTypes.antiGlare.price}</p>
                                        </div>
                                        <div className="p-3 rounded-xl" style={{ background: '#faf9f7' }}>
                                            <span className="text-[#8a8a8a] text-xs">Blue Block</span>
                                            <p className="font-medium text-[#0d0d0d]">₹{lensSettingsForm.powerTypes.blueBlock.price}</p>
                                        </div>
                                        <div className="p-3 rounded-xl" style={{ background: '#faf9f7' }}>
                                            <span className="text-[#8a8a8a] text-xs">Photochromic</span>
                                            <p className="font-medium text-[#0d0d0d]">₹{lensSettingsForm.powerTypes.photochromic.price}</p>
                                        </div>
                                        <div className="p-3 rounded-xl" style={{ background: '#faf9f7' }}>
                                            <span className="text-[#8a8a8a] text-xs">Colour Lenses</span>
                                            <p className="font-medium text-[#0d0d0d]">₹{lensSettingsForm.powerTypes.colour.price}</p>
                                        </div>
                                        <div className="p-3 rounded-xl" style={{ background: 'rgba(59,130,246,0.06)' }}>
                                            <span className="text-[#8a8a8a] text-xs">Power ±5 Extra</span>
                                            <p className="font-medium text-[#3b82f6]">₹{lensSettingsForm.powerRanges.upto5.price}</p>
                                        </div>
                                        <div className="p-3 rounded-xl" style={{ background: 'rgba(59,130,246,0.06)' }}>
                                            <span className="text-[#8a8a8a] text-xs">Power ±10 Extra</span>
                                            <p className="font-medium text-[#3b82f6]">₹{lensSettingsForm.powerRanges.upto10.price}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Data Management */}
                            <div
                                className="bg-white rounded-2xl p-6"
                                style={{
                                    border: '1px solid rgba(0,0,0,0.06)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                                }}
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <Download className="h-5 w-5 text-[#c9a227]" />
                                    <h3
                                        className="text-lg font-medium text-[#0d0d0d]"
                                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                                    >
                                        Data Export
                                    </h3>
                                </div>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => exportToCSV('products')}
                                        className="w-full px-4 py-3 rounded-xl border border-[rgba(0,0,0,0.12)] text-[#525252] hover:text-[#0d0d0d] hover:border-[#0d0d0d] transition-all text-left flex items-center gap-2"
                                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                                    >
                                        <Download className="h-4 w-4" />
                                        Export Products (CSV)
                                    </button>
                                    <button
                                        onClick={() => exportToCSV('orders')}
                                        className="w-full px-4 py-3 rounded-xl border border-[rgba(0,0,0,0.12)] text-[#525252] hover:text-[#0d0d0d] hover:border-[#0d0d0d] transition-all text-left flex items-center gap-2"
                                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                                    >
                                        <Download className="h-4 w-4" />
                                        Export Orders (CSV)
                                    </button>
                                    <button
                                        onClick={() => exportToCSV('users')}
                                        className="w-full px-4 py-3 rounded-xl border border-[rgba(0,0,0,0.12)] text-[#525252] hover:text-[#0d0d0d] hover:border-[#0d0d0d] transition-all text-left flex items-center gap-2"
                                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                                    >
                                        <Download className="h-4 w-4" />
                                        Export Users (CSV)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add/Edit Product Modal */}
            {showAddProduct && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div
                        className="w-full max-w-4xl bg-white rounded-2xl max-h-[90vh] overflow-hidden flex flex-col"
                        style={{
                            border: '1px solid rgba(0,0,0,0.06)',
                            boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
                        }}
                    >
                        <div
                            className="p-6 flex items-center justify-between"
                            style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
                        >
                            <h2
                                className="text-2xl text-[#0d0d0d]"
                                style={{ fontFamily: 'Instrument Serif, Georgia, serif', letterSpacing: '-0.02em' }}
                            >
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h2>
                            <button
                                onClick={closeProductModal}
                                className="p-2 rounded-xl hover:bg-[#faf9f7] transition-colors"
                            >
                                <X className="h-5 w-5 text-[#525252]" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitProduct} className="overflow-y-auto flex-1 p-6">
                            {/* Error/Success Messages */}
                            {formError && (
                                <div
                                    className="mb-4 p-4 rounded-xl flex items-center gap-2"
                                    style={{
                                        background: 'rgba(220, 38, 38, 0.1)',
                                        border: '1px solid rgba(220, 38, 38, 0.2)',
                                        color: '#dc2626',
                                        fontFamily: 'DM Sans, sans-serif'
                                    }}
                                >
                                    <AlertCircle className="h-4 w-4" />
                                    {formError}
                                </div>
                            )}
                            {formSuccess && (
                                <div
                                    className="mb-4 p-4 rounded-xl flex items-center gap-2"
                                    style={{
                                        background: 'rgba(22, 163, 74, 0.1)',
                                        border: '1px solid rgba(22, 163, 74, 0.2)',
                                        color: '#16a34a',
                                        fontFamily: 'DM Sans, sans-serif'
                                    }}
                                >
                                    <Check className="h-4 w-4" />
                                    {formSuccess}
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    {/* Basic Info */}
                                    <div className="space-y-4">
                                        <h3
                                            className="font-medium text-[#0d0d0d] pb-2"
                                            style={{ fontFamily: 'DM Sans, sans-serif', borderBottom: '1px solid rgba(0,0,0,0.06)' }}
                                        >
                                            Basic Information
                                        </h3>

                                        <div data-field="name">
                                            <label
                                                className="block text-sm font-medium text-[#525252] mb-2"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            >
                                                Product Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={productForm.name}
                                                onChange={(e) => {
                                                    setProductForm(prev => ({ ...prev, name: e.target.value }))
                                                    if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: '' }))
                                                }}
                                                className={`w-full px-4 py-3 bg-[#faf9f7] border rounded-xl focus:outline-none focus:border-[#c9a227] focus:bg-white transition-all text-[#0d0d0d] ${fieldErrors.name ? 'border-red-500 bg-red-50' : 'border-[rgba(0,0,0,0.08)]'}`}
                                                style={{ fontFamily: 'DM Sans, sans-serif', color: '#0d0d0d' }}
                                                placeholder="Enter product name"
                                            />
                                            {fieldErrors.name && <p className="text-red-500 text-xs mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>{fieldErrors.name}</p>}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div data-field="category">
                                                <label
                                                    className="block text-sm font-medium text-[#525252] mb-2"
                                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                >
                                                    Category *
                                                </label>
                                                <select
                                                    value={productForm.category}
                                                    onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                                                    className="w-full px-4 py-3 bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#c9a227] cursor-pointer text-[#0d0d0d]"
                                                    style={{ fontFamily: 'DM Sans, sans-serif', color: '#0d0d0d' }}
                                                >
                                                    <option value="Sunglasses">Sunglasses</option>
                                                    <option value="Eyeglasses">Eyeglasses</option>
                                                    <option value="Computer Glasses">Computer Glasses</option>
                                                    <option value="Sports Glasses">Sports Glasses</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div data-field="description">
                                            <div className="flex items-center justify-between mb-2">
                                                <label
                                                    className="text-sm font-medium text-[#525252]"
                                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                >
                                                    Description * (min 10 characters)
                                                </label>
                                                <span
                                                    className={`text-xs ${productForm.description.length < 10 ? 'text-red-500' : productForm.description.length > 2000 ? 'text-red-500' : 'text-[#8a8a8a]'}`}
                                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                >
                                                    {productForm.description.length}/2000
                                                </span>
                                            </div>
                                            <textarea
                                                value={productForm.description}
                                                onChange={(e) => {
                                                    setProductForm(prev => ({ ...prev, description: e.target.value }))
                                                    if (fieldErrors.description) setFieldErrors(prev => ({ ...prev, description: '' }))
                                                }}
                                                rows={3}
                                                maxLength={2000}
                                                className={`w-full px-4 py-3 bg-[#faf9f7] border rounded-xl focus:outline-none focus:border-[#c9a227] focus:bg-white transition-all resize-none text-[#0d0d0d] ${fieldErrors.description ? 'border-red-500 bg-red-50' : 'border-[rgba(0,0,0,0.08)]'}`}
                                                style={{ fontFamily: 'DM Sans, sans-serif', color: '#0d0d0d' }}
                                                placeholder="Enter product description (minimum 10 characters required)"
                                            />
                                            {fieldErrors.description && <p className="text-red-500 text-xs mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>{fieldErrors.description}</p>}
                                        </div>

                                        <div>
                                            <label
                                                className="block text-sm font-medium text-[#525252] mb-2"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            >
                                                Detailed Description
                                            </label>
                                            <textarea
                                                value={productForm.detailedDescription}
                                                onChange={(e) => setProductForm(prev => ({ ...prev, detailedDescription: e.target.value }))}
                                                rows={3}
                                                className="w-full px-4 py-3 bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#c9a227] focus:bg-white transition-all resize-none text-[#0d0d0d]"
                                                style={{ fontFamily: 'DM Sans, sans-serif', color: '#0d0d0d' }}
                                                placeholder="Detailed product description"
                                            />
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h3
                                                className="font-medium text-[#0d0d0d]"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            >
                                                Features
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={handleAddFeature}
                                                className="px-3 py-1.5 rounded-lg border border-[rgba(0,0,0,0.12)] text-[#525252] hover:text-[#0d0d0d] hover:border-[#0d0d0d] transition-all text-sm flex items-center gap-1"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            >
                                                <Plus className="h-3 w-3" />
                                                Add
                                            </button>
                                        </div>
                                        {productForm.features.map((feature, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={feature}
                                                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                                                    className="flex-1 px-4 py-2.5 bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#c9a227] text-[#0d0d0d]"
                                                    style={{ fontFamily: 'DM Sans, sans-serif', color: '#0d0d0d' }}
                                                    placeholder="Feature description"
                                                />
                                                {productForm.features.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveFeature(index)}
                                                        className="px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-all"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Colors */}
                                    <div className="space-y-3" data-field="colors">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3
                                                    className="font-medium text-[#0d0d0d]"
                                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                >
                                                    Color Variants (Price & Stock per Color) *
                                                </h3>
                                                <p className="text-xs text-[#8a8a8a] mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                                    Set price and stock for each color. Base price & total stock will be calculated automatically.
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleAddColor}
                                                className="px-3 py-1.5 rounded-lg border border-[rgba(0,0,0,0.12)] text-[#525252] hover:text-[#0d0d0d] hover:border-[#0d0d0d] transition-all text-sm flex items-center gap-1"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            >
                                                <Plus className="h-3 w-3" />
                                                Add Color
                                            </button>
                                        </div>
                                        {fieldErrors.colors && <p className="text-red-500 text-xs" style={{ fontFamily: 'DM Sans, sans-serif' }}>{fieldErrors.colors}</p>}
                                        {productForm.colors.map((color, index) => (
                                            <div
                                                key={index}
                                                className={`p-4 rounded-xl space-y-3 ${color.inStock ? 'ring-1 ring-green-300' : ''}`}
                                                style={{ background: '#faf9f7', border: '1px solid rgba(0,0,0,0.06)' }}
                                            >
                                                <div className="flex gap-2 items-center">
                                                    <input
                                                        type="text"
                                                        value={color.name}
                                                        onChange={(e) => handleColorChange(index, 'name', e.target.value)}
                                                        className="flex-1 px-4 py-2.5 bg-white border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#c9a227] text-[#0d0d0d]"
                                                        style={{ fontFamily: 'DM Sans, sans-serif', color: '#0d0d0d' }}
                                                        placeholder="Color name (e.g., Matte Black)"
                                                    />
                                                    <input
                                                        type="color"
                                                        value={color.value}
                                                        onChange={(e) => handleColorChange(index, 'value', e.target.value)}
                                                        className="w-10 h-10 border border-[rgba(0,0,0,0.08)] rounded-xl cursor-pointer"
                                                        title="Pick color"
                                                    />
                                                    {productForm.colors.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveColor(index)}
                                                            className="px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-all"
                                                            title="Remove color"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div>
                                                        <label
                                                            className="block text-xs text-[#525252] mb-1"
                                                            style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                        >
                                                            Price (₹) *
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={color.price}
                                                            onChange={(e) => handleColorChange(index, 'price', e.target.value)}
                                                            className="w-full px-3 py-2 bg-white border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#c9a227] text-sm text-[#0d0d0d]"
                                                            style={{ fontFamily: 'DM Sans, sans-serif', color: '#0d0d0d' }}
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label
                                                            className="block text-xs text-[#525252] mb-1"
                                                            style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                        >
                                                            Stock Quantity
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={color.quantity}
                                                            onChange={(e) => handleColorChange(index, 'quantity', e.target.value)}
                                                            className="w-full px-3 py-2 bg-white border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#c9a227] text-sm text-[#0d0d0d]"
                                                            style={{ fontFamily: 'DM Sans, sans-serif', color: '#0d0d0d' }}
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                    <div className="flex items-end pb-1">
                                                        <label
                                                            className="flex items-center gap-2 cursor-pointer"
                                                            style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={color.inStock}
                                                                onChange={(e) => handleColorChange(index, 'inStock', e.target.checked)}
                                                                className="w-4 h-4 accent-[#c9a227] rounded"
                                                            />
                                                            <span className={`text-xs font-medium ${color.inStock ? 'text-green-600' : 'text-[#8a8a8a]'}`}>
                                                                {color.inStock ? 'In Stock' : 'Out of Stock'}
                                                            </span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {/* Summary of all colors */}
                                        {productForm.colors.filter(c => c.name.trim()).length > 0 && (
                                            <div className="p-3 rounded-lg bg-[#f5f5f5] border border-[rgba(0,0,0,0.04)]">
                                                <div className="flex justify-between text-xs" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                                    <span className="text-[#8a8a8a]">
                                                        Total Colors: <span className="text-[#0d0d0d] font-medium">{productForm.colors.filter(c => c.name.trim()).length}</span>
                                                    </span>
                                                    <span className="text-[#8a8a8a]">
                                                        Total Stock: <span className="text-[#0d0d0d] font-medium">{productForm.colors.reduce((sum, c) => sum + (Number(c.quantity) || 0), 0)}</span>
                                                    </span>
                                                    <span className="text-[#8a8a8a]">
                                                        Min Price: <span className="text-[#0d0d0d] font-medium">₹{Math.min(...productForm.colors.filter(c => c.price && Number(c.price) > 0).map(c => Number(c.price))) || 0}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    {/* Images Section */}
                                    <div className="space-y-4">
                                        <h3
                                            className="font-medium text-[#0d0d0d] pb-2"
                                            style={{ fontFamily: 'DM Sans, sans-serif', borderBottom: '1px solid rgba(0,0,0,0.06)' }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Image className="h-4 w-4" />
                                                Product Images
                                            </div>
                                        </h3>

                                        <div
                                            className="p-4 rounded-xl"
                                            style={{ background: '#faf9f7', border: '1px solid rgba(0,0,0,0.06)' }}
                                        >
                                            <p
                                                className="text-sm text-[#525252] mb-4"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            >
                                                <strong className="text-[#0d0d0d]">How to add images:</strong> Upload your images to Google Drive,
                                                make them public (Anyone with the link), and paste the share link below.
                                            </p>

                                            {/* Main Image */}
                                            <div className="mb-4" data-field="image">
                                                <label
                                                    className="block text-sm font-medium text-[#525252] mb-2"
                                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                >
                                                    Main Image URL *
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={productForm.image}
                                                        onChange={(e) => {
                                                            setProductForm(prev => ({ ...prev, image: e.target.value }))
                                                            if (fieldErrors.image) setFieldErrors(prev => ({ ...prev, image: '' }))
                                                        }}
                                                        className={`flex-1 px-4 py-2.5 bg-white border rounded-xl focus:outline-none focus:border-[#c9a227] text-[#0d0d0d] ${fieldErrors.image ? 'border-red-500 bg-red-50' : 'border-[rgba(0,0,0,0.08)]'}`}
                                                        style={{ fontFamily: 'DM Sans, sans-serif', color: '#0d0d0d' }}
                                                        placeholder="Paste Google Drive or image URL"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setProductForm(prev => ({ ...prev, image: convertGoogleDriveLink(prev.image) }))}
                                                        className="px-3 py-2 rounded-xl border border-[rgba(0,0,0,0.12)] text-[#525252] hover:text-[#0d0d0d] hover:border-[#0d0d0d] transition-all"
                                                    >
                                                        <Link className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                {fieldErrors.image && <p className="text-red-500 text-xs mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>{fieldErrors.image}</p>}
                                            </div>

                                            {/* Main Image Preview */}
                                            {productForm.image && (
                                                <div className="mb-4">
                                                    <p
                                                        className="text-sm font-medium text-[#525252] mb-2"
                                                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                    >
                                                        Main Image Preview:
                                                    </p>
                                                    <div className="w-32 h-24 bg-white rounded-xl border border-[rgba(0,0,0,0.08)] overflow-hidden">
                                                        <img
                                                            src={convertGoogleDriveLink(productForm.image)}
                                                            alt="Main preview"
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128x96?text=Invalid+URL'
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Additional Images */}
                                            <div>
                                                <label
                                                    className="block text-sm font-medium text-[#525252] mb-2"
                                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                >
                                                    Additional Images
                                                </label>
                                                <div className="flex gap-2 mb-3">
                                                    <input
                                                        type="text"
                                                        value={newImageUrl}
                                                        onChange={(e) => setNewImageUrl(e.target.value)}
                                                        className="flex-1 px-4 py-2.5 bg-white border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#c9a227] text-[#0d0d0d]"
                                                        style={{ fontFamily: 'DM Sans, sans-serif', color: '#0d0d0d' }}
                                                        placeholder="Paste image URL and click Add"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault()
                                                                handleAddImageUrl()
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleAddImageUrl}
                                                        className="px-4 py-2.5 rounded-xl text-white font-medium transition-all flex items-center gap-1"
                                                        style={{
                                                            background: 'linear-gradient(135deg, #c9a227 0%, #8b6f1b 100%)',
                                                            fontFamily: 'DM Sans, sans-serif'
                                                        }}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                        Add
                                                    </button>
                                                </div>

                                                {/* Additional Images Grid */}
                                                {productForm.images.length > 0 && (
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {productForm.images.map((img, index) => (
                                                            <div key={index} className="relative group">
                                                                <div className="aspect-square bg-white rounded-xl border border-[rgba(0,0,0,0.08)] overflow-hidden">
                                                                    <img
                                                                        src={img}
                                                                        alt={`Product ${index + 1}`}
                                                                        className="w-full h-full object-cover"
                                                                        onError={(e) => {
                                                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=Error'
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-1">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleSetMainImage(img)}
                                                                        className="bg-green-600 hover:bg-green-700 text-white p-1.5 rounded-lg"
                                                                        title="Set as main image"
                                                                    >
                                                                        <Check className="h-3 w-3" />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveImage(index)}
                                                                        className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-lg"
                                                                        title="Remove image"
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Specifications */}
                                    <div className="space-y-3">
                                        <h3
                                            className="font-medium text-[#0d0d0d] pb-2"
                                            style={{ fontFamily: 'DM Sans, sans-serif', borderBottom: '1px solid rgba(0,0,0,0.06)' }}
                                        >
                                            Specifications
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label
                                                    className="block text-xs font-medium text-[#525252] mb-1"
                                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                >
                                                    Frame Width
                                                </label>
                                                <input
                                                    type="text"
                                                    value={productForm.specifications.frameWidth}
                                                    onChange={(e) => setProductForm(prev => ({
                                                        ...prev,
                                                        specifications: { ...prev.specifications, frameWidth: e.target.value }
                                                    }))}
                                                    className="w-full px-3 py-2 text-sm bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#c9a227]"
                                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                    placeholder="e.g., 140mm"
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    className="block text-xs font-medium text-[#525252] mb-1"
                                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                >
                                                    Lens Width
                                                </label>
                                                <input
                                                    type="text"
                                                    value={productForm.specifications.lensWidth}
                                                    onChange={(e) => setProductForm(prev => ({
                                                        ...prev,
                                                        specifications: { ...prev.specifications, lensWidth: e.target.value }
                                                    }))}
                                                    className="w-full px-3 py-2 text-sm bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#c9a227]"
                                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                    placeholder="e.g., 52mm"
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    className="block text-xs font-medium text-[#525252] mb-1"
                                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                >
                                                    Bridge Width
                                                </label>
                                                <input
                                                    type="text"
                                                    value={productForm.specifications.bridgeWidth}
                                                    onChange={(e) => setProductForm(prev => ({
                                                        ...prev,
                                                        specifications: { ...prev.specifications, bridgeWidth: e.target.value }
                                                    }))}
                                                    className="w-full px-3 py-2 text-sm bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#c9a227]"
                                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                    placeholder="e.g., 18mm"
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    className="block text-xs font-medium text-[#525252] mb-1"
                                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                >
                                                    Temple Length
                                                </label>
                                                <input
                                                    type="text"
                                                    value={productForm.specifications.templeLength}
                                                    onChange={(e) => setProductForm(prev => ({
                                                        ...prev,
                                                        specifications: { ...prev.specifications, templeLength: e.target.value }
                                                    }))}
                                                    className="w-full px-3 py-2 text-sm bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#c9a227]"
                                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                    placeholder="e.g., 145mm"
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    className="block text-xs font-medium text-[#525252] mb-1"
                                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                >
                                                    Material
                                                </label>
                                                <input
                                                    type="text"
                                                    value={productForm.specifications.material}
                                                    onChange={(e) => setProductForm(prev => ({
                                                        ...prev,
                                                        specifications: { ...prev.specifications, material: e.target.value }
                                                    }))}
                                                    className="w-full px-3 py-2 text-sm bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#c9a227]"
                                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                    placeholder="e.g., Titanium"
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    className="block text-xs font-medium text-[#525252] mb-1"
                                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                >
                                                    Weight
                                                </label>
                                                <input
                                                    type="text"
                                                    value={productForm.specifications.weight}
                                                    onChange={(e) => setProductForm(prev => ({
                                                        ...prev,
                                                        specifications: { ...prev.specifications, weight: e.target.value }
                                                    }))}
                                                    className="w-full px-3 py-2 text-sm bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#c9a227]"
                                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                    placeholder="e.g., 25g"
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    className="block text-xs font-medium text-[#525252] mb-1"
                                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                >
                                                    Lens Type
                                                </label>
                                                <input
                                                    type="text"
                                                    value={productForm.specifications.lensType}
                                                    onChange={(e) => setProductForm(prev => ({
                                                        ...prev,
                                                        specifications: { ...prev.specifications, lensType: e.target.value }
                                                    }))}
                                                    className="w-full px-3 py-2 text-sm bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#c9a227]"
                                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                    placeholder="e.g., Polarized"
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    className="block text-xs font-medium text-[#525252] mb-1"
                                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                >
                                                    UV Protection
                                                </label>
                                                <input
                                                    type="text"
                                                    value={productForm.specifications.uvProtection}
                                                    onChange={(e) => setProductForm(prev => ({
                                                        ...prev,
                                                        specifications: { ...prev.specifications, uvProtection: e.target.value }
                                                    }))}
                                                    className="w-full px-3 py-2 text-sm bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#c9a227]"
                                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                    placeholder="e.g., UV400"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div
                                className="flex justify-end gap-3 mt-6 pt-4"
                                style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
                            >
                                <button
                                    type="button"
                                    onClick={closeProductModal}
                                    className="px-5 py-2.5 rounded-xl border border-[rgba(0,0,0,0.12)] text-[#525252] hover:text-[#0d0d0d] hover:border-[#0d0d0d] transition-all font-medium"
                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2.5 rounded-xl text-white font-medium transition-all min-w-[120px]"
                                    style={{
                                        background: saving ? '#8a8a8a' : 'linear-gradient(135deg, #c9a227 0%, #8b6f1b 100%)',
                                        fontFamily: 'DM Sans, sans-serif',
                                        boxShadow: saving ? 'none' : '0 4px 16px rgba(201, 162, 39, 0.3)'
                                    }}
                                >
                                    {saving ? (
                                        <span className="flex items-center gap-2 justify-center">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Saving...
                                        </span>
                                    ) : (
                                        editingProduct ? 'Update Product' : 'Add Product'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* User Details Modal */}
            {showUserModal && selectedUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div
                        className="w-full max-w-2xl bg-white rounded-2xl max-h-[90vh] overflow-hidden flex flex-col"
                        style={{
                            border: '1px solid rgba(0,0,0,0.06)',
                            boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
                        }}
                    >
                        <div
                            className="p-6 flex items-center justify-between"
                            style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
                        >
                            <h2
                                className="text-2xl text-[#0d0d0d]"
                                style={{ fontFamily: 'Instrument Serif, Georgia, serif', letterSpacing: '-0.02em' }}
                            >
                                User Details
                            </h2>
                            <button
                                onClick={() => setShowUserModal(false)}
                                className="p-2 rounded-xl hover:bg-[#faf9f7] transition-colors"
                            >
                                <X className="h-5 w-5 text-[#525252]" />
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 p-6">
                            <div className="space-y-6">
                                {/* User Avatar & Basic Info */}
                                <div
                                    className="flex items-center gap-4 pb-6"
                                    style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
                                >
                                    <div
                                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl"
                                        style={{
                                            background: 'linear-gradient(135deg, #c9a227 0%, #8b6f1b 100%)',
                                            fontFamily: 'DM Sans, sans-serif'
                                        }}
                                    >
                                        {selectedUser.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3
                                            className="text-xl font-medium text-[#0d0d0d]"
                                            style={{ fontFamily: 'DM Sans, sans-serif' }}
                                        >
                                            {selectedUser.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            {selectedUser.isVerified ? (
                                                <span
                                                    className="px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1"
                                                    style={{
                                                        background: 'rgba(22, 163, 74, 0.1)',
                                                        color: '#16a34a',
                                                        fontFamily: 'DM Sans, sans-serif'
                                                    }}
                                                >
                                                    <UserCheck className="h-3 w-3" />
                                                    Verified
                                                </span>
                                            ) : (
                                                <span
                                                    className="px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1"
                                                    style={{
                                                        background: 'rgba(220, 38, 38, 0.1)',
                                                        color: '#dc2626',
                                                        fontFamily: 'DM Sans, sans-serif'
                                                    }}
                                                >
                                                    <UserX className="h-3 w-3" />
                                                    Unverified
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Editable Form */}
                                {editingUser ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label
                                                className="block text-sm font-medium text-[#525252] mb-2"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            >
                                                Name
                                            </label>
                                            <input
                                                type="text"
                                                value={userForm.name}
                                                onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                                                className="w-full px-4 py-3 bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#c9a227] focus:bg-white transition-all"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            />
                                        </div>
                                        <div>
                                            <label
                                                className="block text-sm font-medium text-[#525252] mb-2"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            >
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={userForm.email}
                                                onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                                                className="w-full px-4 py-3 bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#c9a227] focus:bg-white transition-all"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            />
                                        </div>
                                        <div>
                                            <label
                                                className="block text-sm font-medium text-[#525252] mb-2"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            >
                                                Phone
                                            </label>
                                            <input
                                                type="tel"
                                                value={userForm.phone}
                                                onChange={(e) => setUserForm(prev => ({ ...prev, phone: e.target.value }))}
                                                className="w-full px-4 py-3 bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#c9a227] focus:bg-white transition-all"
                                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div
                                            className="flex items-center gap-3 p-4 rounded-xl"
                                            style={{ background: '#faf9f7' }}
                                        >
                                            <Mail className="h-5 w-5 text-[#c9a227]" />
                                            <div>
                                                <p
                                                    className="text-xs text-[#8a8a8a]"
                                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                >
                                                    Email
                                                </p>
                                                <p
                                                    className="font-medium text-[#0d0d0d]"
                                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                >
                                                    {selectedUser.email}
                                                </p>
                                            </div>
                                        </div>
                                        {selectedUser.phone && (
                                            <div
                                                className="flex items-center gap-3 p-4 rounded-xl"
                                                style={{ background: '#faf9f7' }}
                                            >
                                                <Phone className="h-5 w-5 text-[#c9a227]" />
                                                <div>
                                                    <p
                                                        className="text-xs text-[#8a8a8a]"
                                                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                    >
                                                        Phone
                                                    </p>
                                                    <p
                                                        className="font-medium text-[#0d0d0d]"
                                                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                    >
                                                        {selectedUser.phone}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        <div
                                            className="flex items-center gap-3 p-4 rounded-xl"
                                            style={{ background: '#faf9f7' }}
                                        >
                                            <Calendar className="h-5 w-5 text-[#c9a227]" />
                                            <div>
                                                <p
                                                    className="text-xs text-[#8a8a8a]"
                                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                >
                                                    Joined
                                                </p>
                                                <p
                                                    className="font-medium text-[#0d0d0d]"
                                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                >
                                                    {new Date(selectedUser.createdAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        {selectedUser.addresses && selectedUser.addresses.length > 0 && (
                                            <div
                                                className="p-4 rounded-xl"
                                                style={{ background: '#faf9f7' }}
                                            >
                                                <p
                                                    className="text-xs text-[#8a8a8a] mb-2 flex items-center gap-1"
                                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                >
                                                    <MapPin className="h-4 w-4 text-[#c9a227]" />
                                                    Saved Addresses ({selectedUser.addresses.length})
                                                </p>
                                                <div className="space-y-2">
                                                    {selectedUser.addresses.map((addr, index) => (
                                                        <div
                                                            key={index}
                                                            className="text-sm text-[#525252] pl-5"
                                                            style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                        >
                                                            {addr.city}, {addr.state}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div
                            className="p-6 flex justify-between"
                            style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
                        >
                            <button
                                onClick={() => handleDeleteUser(selectedUser._id)}
                                className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all flex items-center gap-2"
                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete User
                            </button>
                            <div className="flex gap-2">
                                {editingUser ? (
                                    <>
                                        <button
                                            onClick={() => {
                                                setEditingUser(false)
                                                setUserForm({ name: selectedUser.name, email: selectedUser.email, phone: selectedUser.phone || '' })
                                            }}
                                            className="px-5 py-2.5 rounded-xl border border-[rgba(0,0,0,0.12)] text-[#525252] hover:text-[#0d0d0d] hover:border-[#0d0d0d] transition-all font-medium"
                                            style={{ fontFamily: 'DM Sans, sans-serif' }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleEditUser}
                                            className="px-5 py-2.5 rounded-xl text-white font-medium transition-all flex items-center gap-2"
                                            style={{
                                                background: 'linear-gradient(135deg, #c9a227 0%, #8b6f1b 100%)',
                                                fontFamily: 'DM Sans, sans-serif',
                                                boxShadow: '0 4px 16px rgba(201, 162, 39, 0.3)'
                                            }}
                                        >
                                            <Save className="h-4 w-4" />
                                            Save Changes
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setEditingUser(true)}
                                        className="px-5 py-2.5 rounded-xl text-white font-medium transition-all flex items-center gap-2"
                                        style={{
                                            background: 'linear-gradient(135deg, #c9a227 0%, #8b6f1b 100%)',
                                            fontFamily: 'DM Sans, sans-serif',
                                            boxShadow: '0 4px 16px rgba(201, 162, 39, 0.3)'
                                        }}
                                    >
                                        <Edit2 className="h-4 w-4" />
                                        Edit User
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Details Modal */}
            {showOrderDetailsModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div
                        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl"
                        style={{
                            border: '1px solid rgba(0,0,0,0.06)',
                            boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
                        }}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2
                                    className="text-2xl text-[#0d0d0d]"
                                    style={{ fontFamily: 'Instrument Serif, Georgia, serif', letterSpacing: '-0.02em' }}
                                >
                                    Order Details
                                </h2>
                                <button
                                    onClick={() => setShowOrderDetailsModal(false)}
                                    className="p-2 rounded-xl hover:bg-[#faf9f7] transition-colors"
                                >
                                    <X className="h-5 w-5 text-[#525252]" />
                                </button>
                            </div>

                            {/* Order Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div
                                    className="p-4 rounded-xl"
                                    style={{ background: '#faf9f7' }}
                                >
                                    <p
                                        className="text-sm text-[#8a8a8a] mb-1"
                                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                                    >
                                        Order ID
                                    </p>
                                    <p
                                        className="font-mono text-sm text-[#0d0d0d]"
                                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                                    >
                                        {selectedOrder._id}
                                    </p>
                                </div>
                                <div
                                    className="p-4 rounded-xl"
                                    style={{ background: '#faf9f7' }}
                                >
                                    <p
                                        className="text-sm text-[#8a8a8a] mb-1"
                                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                                    >
                                        Order Date
                                    </p>
                                    <p
                                        className="font-medium text-[#0d0d0d]"
                                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                                    >
                                        {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <div
                                    className="p-4 rounded-xl"
                                    style={{ background: 'rgba(22, 163, 74, 0.06)' }}
                                >
                                    <p
                                        className="text-sm text-[#8a8a8a] mb-1"
                                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                                    >
                                        Total Amount
                                    </p>
                                    <p
                                        className="text-2xl font-semibold text-[#16a34a]"
                                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                                    >
                                        ₹{selectedOrder.totalAmount.toFixed(2)}
                                    </p>
                                </div>
                                <div
                                    className="p-4 rounded-xl"
                                    style={{ background: 'rgba(59, 130, 246, 0.06)' }}
                                >
                                    <p
                                        className="text-sm text-[#8a8a8a] mb-1"
                                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                                    >
                                        Payment Status
                                    </p>
                                    <span
                                        className="inline-block px-3 py-1 rounded-lg text-sm font-medium"
                                        style={{
                                            fontFamily: 'DM Sans, sans-serif',
                                            background: selectedOrder.paymentStatus === 'paid' ? 'rgba(22, 163, 74, 0.1)' :
                                                selectedOrder.paymentStatus === 'failed' ? 'rgba(220, 38, 38, 0.1)' :
                                                    selectedOrder.paymentStatus === 'refunded' ? 'rgba(59, 130, 246, 0.1)' :
                                                        'rgba(234, 88, 12, 0.1)',
                                            color: selectedOrder.paymentStatus === 'paid' ? '#16a34a' :
                                                selectedOrder.paymentStatus === 'failed' ? '#dc2626' :
                                                    selectedOrder.paymentStatus === 'refunded' ? '#3b82f6' :
                                                        '#ea580c'
                                        }}
                                    >
                                        {(selectedOrder.paymentStatus || 'pending').toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            {/* Customer Details */}
                            <div className="mb-6">
                                <h3
                                    className="text-lg font-medium text-[#0d0d0d] mb-3 flex items-center gap-2"
                                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                                >
                                    <Users className="h-5 w-5 text-[#c9a227]" />
                                    Customer Information
                                </h3>
                                <div
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl"
                                    style={{ background: '#faf9f7' }}
                                >
                                    <div>
                                        <p className="text-sm text-black/60">Name</p>
                                        <p className="font-medium text-black">{selectedOrder.customerName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-black/60">Email</p>
                                        <p className="font-medium text-black">{selectedOrder.customerEmail}</p>
                                    </div>
                                    {selectedOrder.customerPhone && (
                                        <div>
                                            <p className="text-sm text-black/60">Phone</p>
                                            <p className="font-medium text-black">{selectedOrder.customerPhone}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Products Details */}
                            <div className="mb-6">
                                <h3 className="text-lg mb-3 flex items-center gap-2" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: '#0d0d0d' }}>
                                    <Package className="h-5 w-5 text-[#c9a227]" />
                                    Products ({selectedOrder.items.length})
                                </h3>
                                <div className="space-y-3">
                                    {selectedOrder.items.map((item, index: number) => {
                                        const product = item.product
                                        const imageUrl = item.productImage || product?.images?.[0];
                                        const processedImageUrl = convertGoogleDriveLink(imageUrl || '', 'w200') || undefined;
                                        return (
                                            <div
                                                key={index}
                                                className="flex gap-4 p-4 rounded-xl"
                                                style={{ background: '#faf9f7', border: '1px solid rgba(0,0,0,0.06)' }}
                                            >
                                                <div
                                                    className="w-24 h-24 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
                                                    style={{ background: 'rgba(201,162,39,0.08)' }}
                                                >
                                                    {processedImageUrl ? (
                                                        <img
                                                            src={processedImageUrl}
                                                            alt={item.productName || product?.name}
                                                            className="w-full h-full object-cover rounded-lg"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                                (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="flex items-center justify-center w-full h-full"><svg class="h-8 w-8 text-[#c9a227]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg></div>';
                                                            }}
                                                        />
                                                    ) : (
                                                        <Package className="h-8 w-8 text-[#c9a227]" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-lg" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: '#0d0d0d' }}>{item.productName}</h4>
                                                    {product?.category && (
                                                        <p className="text-sm text-[#525252] mt-1">Category: {product.category}</p>
                                                    )}
                                                    {product?.brand && (
                                                        <p className="text-sm text-[#525252]">Brand: {product.brand}</p>
                                                    )}
                                                    {item.selectedColor && (
                                                        <p className="text-sm text-[#525252]">Color: {item.selectedColor}</p>
                                                    )}
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <span className="text-sm text-[#525252]">
                                                            Quantity: <span style={{ fontWeight: 600, color: '#0d0d0d' }}>{item.quantity}</span>
                                                        </span>
                                                        <span className="text-sm text-[#525252]">
                                                            Price: <span style={{ fontWeight: 600, color: '#c9a227' }}>₹{item.price.toFixed(2)}</span>
                                                        </span>
                                                        <span className="text-sm" style={{ fontWeight: 600, color: '#0d0d0d' }}>
                                                            Subtotal: ₹{(item.price * item.quantity).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    {product?.description && (
                                                        <p className="text-sm text-[#525252] mt-2 line-clamp-2">{product.description}</p>
                                                    )}

                                                    {/* Product Specifications */}
                                                    {product?.specifications && Object.keys(product.specifications).length > 0 && (
                                                        <div
                                                            className="mt-3 p-3 rounded-lg"
                                                            style={{ background: 'rgba(201,162,39,0.06)', border: '1px solid rgba(201,162,39,0.15)' }}
                                                        >
                                                            <h5 className="text-xs mb-2 uppercase" style={{ fontWeight: 600, color: '#8b6f1b', letterSpacing: '0.05em' }}>Specifications</h5>
                                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                                {product.specifications.frameWidth && (
                                                                    <div>
                                                                        <span className="text-[#8a8a8a]">Frame Width: </span>
                                                                        <span className="font-medium text-[#0d0d0d]">{product.specifications.frameWidth}</span>
                                                                    </div>
                                                                )}
                                                                {product.specifications.lensWidth && (
                                                                    <div>
                                                                        <span className="text-[#8a8a8a]">Lens Width: </span>
                                                                        <span className="font-medium text-[#0d0d0d]">{product.specifications.lensWidth}</span>
                                                                    </div>
                                                                )}
                                                                {product.specifications.bridgeWidth && (
                                                                    <div>
                                                                        <span className="text-[#8a8a8a]">Bridge: </span>
                                                                        <span className="font-medium text-[#0d0d0d]">{product.specifications.bridgeWidth}</span>
                                                                    </div>
                                                                )}
                                                                {product.specifications.templeLength && (
                                                                    <div>
                                                                        <span className="text-[#8a8a8a]">Temple: </span>
                                                                        <span className="font-medium text-[#0d0d0d]">{product.specifications.templeLength}</span>
                                                                    </div>
                                                                )}
                                                                {product.specifications.material && (
                                                                    <div>
                                                                        <span className="text-[#8a8a8a]">Material: </span>
                                                                        <span className="font-medium text-[#0d0d0d]">{product.specifications.material}</span>
                                                                    </div>
                                                                )}
                                                                {product.specifications.weight && (
                                                                    <div>
                                                                        <span className="text-[#8a8a8a]">Weight: </span>
                                                                        <span className="font-medium text-[#0d0d0d]">{product.specifications.weight}</span>
                                                                    </div>
                                                                )}
                                                                {product.specifications.lensType && (
                                                                    <div>
                                                                        <span className="text-[#8a8a8a]">Lens Type: </span>
                                                                        <span className="font-medium text-[#0d0d0d]">{product.specifications.lensType}</span>
                                                                    </div>
                                                                )}
                                                                {product.specifications.uvProtection && (
                                                                    <div>
                                                                        <span className="text-[#8a8a8a]">UV Protection: </span>
                                                                        <span className="font-medium text-[#0d0d0d]">{product.specifications.uvProtection}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Product Features */}
                                                    {product?.features && product.features.length > 0 && (
                                                        <div className="mt-2">
                                                            <h5 className="text-xs mb-1" style={{ fontWeight: 600, color: '#525252' }}>Features:</h5>
                                                            <ul className="text-xs text-[#525252] space-y-1 ml-4">
                                                                {product.features.map((feature: string, idx: number) => (
                                                                    <li key={idx} className="list-disc">{feature}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {/* Lens Configuration Details */}
                                                    {item.lensConfig && (
                                                        <div
                                                            className="mt-3 p-3 rounded-lg"
                                                            style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}
                                                        >
                                                            <h5 className="text-xs mb-2 uppercase flex items-center gap-1" style={{ fontWeight: 600, color: '#3b82f6', letterSpacing: '0.05em' }}>
                                                                <Eye className="h-3 w-3" />
                                                                Lens Configuration
                                                            </h5>
                                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                                <div>
                                                                    <span className="text-[#8a8a8a]">Lens Type: </span>
                                                                    <span className="font-medium text-[#0d0d0d]">
                                                                        {item.lensConfig.lensType === 'withPower' ? 'With Power' :
                                                                            item.lensConfig.lensType === 'zeroPower' ? 'Zero Power' : 'Frame Only'}
                                                                    </span>
                                                                </div>
                                                                {item.lensConfig.powerType && (
                                                                    <div>
                                                                        <span className="text-[#8a8a8a]">Power Type: </span>
                                                                        <span className="font-medium text-[#0d0d0d]">
                                                                            {item.lensConfig.powerType === 'antiGlare' ? 'Anti Glare' :
                                                                                item.lensConfig.powerType === 'blueBlock' ? 'Blue Block' :
                                                                                    item.lensConfig.powerType === 'photochromic' ? 'Photochromic' : 'Colour'}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {item.lensConfig.lensColor && (
                                                                    <div>
                                                                        <span className="text-[#8a8a8a]">Lens Color: </span>
                                                                        <span className="font-medium text-[#0d0d0d]">{item.lensConfig.lensColor}</span>
                                                                    </div>
                                                                )}
                                                                {item.lensConfig.powerRange && (
                                                                    <div>
                                                                        <span className="text-[#8a8a8a]">Power Range: </span>
                                                                        <span className="font-medium text-[#0d0d0d]">
                                                                            {item.lensConfig.powerRange === 'upto5' ? 'Upto +/- 5' : 'Upto +/- 10'}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {item.lensConfig.prescriptionMethod && (
                                                                    <div>
                                                                        <span className="text-[#8a8a8a]">Prescription: </span>
                                                                        <span className="font-medium text-[#0d0d0d]">
                                                                            {item.lensConfig.prescriptionMethod === 'manual' ? 'Manual Entry' :
                                                                                item.lensConfig.prescriptionMethod === 'upload' ? 'Uploaded' : 'Email Later'}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {item.lensConfig.lensPrice > 0 && (
                                                                    <div>
                                                                        <span className="text-[#8a8a8a]">Lens Price: </span>
                                                                        <span className="font-medium text-[#16a34a]">₹{item.lensConfig.lensPrice}</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Prescription Details */}
                                                            {item.lensConfig.prescription && item.lensConfig.prescriptionMethod === 'manual' && (
                                                                <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(59,130,246,0.2)' }}>
                                                                    <h6 className="text-xs mb-2" style={{ fontWeight: 600, color: '#3b82f6' }}>Prescription Details</h6>
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div className="p-2 rounded" style={{ background: 'rgba(59,130,246,0.05)' }}>
                                                                            <p className="text-xs font-medium text-[#3b82f6] mb-1">Right Eye (OD)</p>
                                                                            <div className="grid grid-cols-3 gap-1 text-xs">
                                                                                <div>
                                                                                    <span className="text-[#8a8a8a]">SPH: </span>
                                                                                    <span className="font-medium">{item.lensConfig.prescription.rightEye.sph || '-'}</span>
                                                                                </div>
                                                                                <div>
                                                                                    <span className="text-[#8a8a8a]">CYL: </span>
                                                                                    <span className="font-medium">{item.lensConfig.prescription.rightEye.cyl || '-'}</span>
                                                                                </div>
                                                                                <div>
                                                                                    <span className="text-[#8a8a8a]">AXIS: </span>
                                                                                    <span className="font-medium">{item.lensConfig.prescription.rightEye.axis || '-'}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="p-2 rounded" style={{ background: 'rgba(59,130,246,0.05)' }}>
                                                                            <p className="text-xs font-medium text-[#3b82f6] mb-1">Left Eye (OS)</p>
                                                                            <div className="grid grid-cols-3 gap-1 text-xs">
                                                                                <div>
                                                                                    <span className="text-[#8a8a8a]">SPH: </span>
                                                                                    <span className="font-medium">{item.lensConfig.prescription.leftEye.sph || '-'}</span>
                                                                                </div>
                                                                                <div>
                                                                                    <span className="text-[#8a8a8a]">CYL: </span>
                                                                                    <span className="font-medium">{item.lensConfig.prescription.leftEye.cyl || '-'}</span>
                                                                                </div>
                                                                                <div>
                                                                                    <span className="text-[#8a8a8a]">AXIS: </span>
                                                                                    <span className="font-medium">{item.lensConfig.prescription.leftEye.axis || '-'}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Prescription File Link */}
                                                            {item.lensConfig.prescriptionFile && item.lensConfig.prescriptionMethod === 'upload' && (
                                                                <div className="mt-2">
                                                                    <a
                                                                        href={item.lensConfig.prescriptionFile}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-xs text-[#3b82f6] hover:underline flex items-center gap-1"
                                                                    >
                                                                        <FileText className="h-3 w-3" />
                                                                        View Uploaded Prescription
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Shipping Address */}
                            {selectedOrder.shippingAddress && (
                                <div className="mb-6">
                                    <h3 className="text-lg mb-3 flex items-center gap-2" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: '#0d0d0d' }}>
                                        <MapPin className="h-5 w-5 text-[#c9a227]" />
                                        Shipping Address
                                    </h3>
                                    <div
                                        className="p-4 rounded-xl"
                                        style={{ background: '#faf9f7', border: '1px solid rgba(0,0,0,0.06)' }}
                                    >
                                        {selectedOrder.shippingAddress.name && (
                                            <p className="mb-2" style={{ fontWeight: 600, color: '#0d0d0d' }}>{selectedOrder.shippingAddress.name}</p>
                                        )}
                                        <p className="text-[#525252]">{selectedOrder.shippingAddress.street}</p>
                                        <p className="text-[#525252]">
                                            {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}
                                        </p>
                                        <p className="text-[#525252]">
                                            {selectedOrder.shippingAddress.country} - {selectedOrder.shippingAddress.zipCode}
                                        </p>
                                        {selectedOrder.shippingAddress.phone && (
                                            <p
                                                className="mt-2 pt-2 flex items-center gap-1 text-[#525252]"
                                                style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
                                            >
                                                <Phone className="h-4 w-4 text-[#c9a227]" />
                                                {selectedOrder.shippingAddress.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Payment Details */}
                            <div>
                                <h3 className="text-lg mb-3 flex items-center gap-2" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: '#0d0d0d' }}>
                                    <DollarSign className="h-5 w-5 text-[#c9a227]" />
                                    Payment Information
                                </h3>
                                <div
                                    className="p-4 rounded-xl"
                                    style={{ background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.15)' }}
                                >
                                    {selectedOrder.paymentMethod && (
                                        <div className="flex justify-between mb-2">
                                            <span className="text-[#525252]">Payment Method:</span>
                                            <span style={{ fontWeight: 600, color: '#0d0d0d' }}>{selectedOrder.paymentMethod}</span>
                                        </div>
                                    )}
                                    {selectedOrder.paymentId && (
                                        <div className="flex justify-between mb-2">
                                            <span className="text-[#525252]">Payment ID:</span>
                                            <span className="font-mono text-xs text-[#525252]">{selectedOrder.paymentId}</span>
                                        </div>
                                    )}
                                    <div
                                        className="pt-3 flex justify-between items-center"
                                        style={{ borderTop: '1px solid rgba(22,163,74,0.2)' }}
                                    >
                                        <span className="text-lg" style={{ fontWeight: 600, color: '#0d0d0d' }}>Total Amount:</span>
                                        <span className="text-3xl" style={{ fontWeight: 700, color: '#16a34a' }}>₹{selectedOrder.totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Refund Information Section */}
                                {selectedOrder.refundStatus && selectedOrder.refundStatus !== 'not_applicable' && (
                                    <div
                                        className="mt-4 p-4 rounded-xl"
                                        style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="flex items-center gap-2" style={{ fontWeight: 600, color: '#0d0d0d' }}>
                                                <RefreshCw className="h-4 w-4 text-[#3b82f6]" />
                                                Refund Details
                                            </h4>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-[#525252]">Refund Status:</span>
                                                <span
                                                    className="px-2 py-0.5 rounded-full text-sm"
                                                    style={{
                                                        fontWeight: 600,
                                                        background: selectedOrder.refundStatus === 'completed' ? 'rgba(22,163,74,0.1)' :
                                                            selectedOrder.refundStatus === 'processing' ? 'rgba(201,162,39,0.1)' :
                                                                selectedOrder.refundStatus === 'failed' ? 'rgba(220,38,38,0.1)' : 'rgba(59,130,246,0.1)',
                                                        color: selectedOrder.refundStatus === 'completed' ? '#16a34a' :
                                                            selectedOrder.refundStatus === 'processing' ? '#8b6f1b' :
                                                                selectedOrder.refundStatus === 'failed' ? '#dc2626' : '#3b82f6'
                                                    }}
                                                >
                                                    {selectedOrder.refundStatus.charAt(0).toUpperCase() + selectedOrder.refundStatus.slice(1)}
                                                </span>
                                            </div>
                                            {selectedOrder.refundAmount && (
                                                <div className="flex justify-between">
                                                    <span className="text-[#525252]">Refund Amount:</span>
                                                    <span style={{ fontWeight: 600, color: '#16a34a' }}>₹{selectedOrder.refundAmount.toFixed(2)}</span>
                                                </div>
                                            )}
                                            {selectedOrder.refundId && (
                                                <div className="flex justify-between">
                                                    <span className="text-[#525252]">Refund ID:</span>
                                                    <span className="font-mono text-xs text-[#525252]">{selectedOrder.refundId}</span>
                                                </div>
                                            )}
                                            {selectedOrder.refundInitiatedAt && (
                                                <div className="flex justify-between">
                                                    <span className="text-[#525252]">Initiated:</span>
                                                    <span className="text-sm text-[#525252]">
                                                        {new Date(selectedOrder.refundInitiatedAt).toLocaleDateString('en-IN', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                            )}
                                            {selectedOrder.refundCompletedAt && (
                                                <div className="flex justify-between">
                                                    <span className="text-[#525252]">Completed:</span>
                                                    <span className="text-sm text-[#525252]">
                                                        {new Date(selectedOrder.refundCompletedAt).toLocaleDateString('en-IN', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                            )}
                                            {selectedOrder.refundNotes && (
                                                <div
                                                    className="mt-2 pt-2"
                                                    style={{ borderTop: '1px solid rgba(59,130,246,0.2)' }}
                                                >
                                                    <p className="text-xs text-[#525252]">{selectedOrder.refundNotes}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Payment Timeline Section - For Razorpay orders */}
                                {selectedOrder.paymentMethod === 'razorpay' && selectedOrder.paymentStatus !== 'pending' && (
                                    <div className="mt-6">
                                        <h3 className="mb-4" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: '#0d0d0d', fontSize: '1.125rem' }}>
                                            Payment Timeline
                                        </h3>
                                        <PaymentTimeline
                                            orderId={selectedOrder._id}
                                            token={localStorage.getItem('adminToken') || ''}
                                            paymentStatus={selectedOrder.paymentStatus || 'pending'}
                                            refundStatus={selectedOrder.refundStatus}
                                            onStatusUpdate={(newRefundStatus, newPaymentStatus) => {
                                                // Update local selected order and orders list when timeline syncs
                                                setSelectedOrder(prev => prev ? {
                                                    ...prev,
                                                    refundStatus: newRefundStatus as Order['refundStatus'],
                                                    paymentStatus: newPaymentStatus as Order['paymentStatus']
                                                } : null);
                                                setOrders(prevOrders =>
                                                    prevOrders.map(o =>
                                                        o._id === selectedOrder._id
                                                            ? { ...o, refundStatus: newRefundStatus as Order['refundStatus'], paymentStatus: newPaymentStatus as Order['paymentStatus'] }
                                                            : o
                                                    )
                                                );
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Shipment Tracking Section from Webhook Data */}
                                {selectedOrder.shiprocket && selectedOrder.shiprocket.awbCode && (
                                    <div className="mt-6">
                                        <h3 className="mb-4" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: '#0d0d0d', fontSize: '1.125rem' }}>
                                            Shipment Tracking
                                        </h3>
                                        <div
                                            className="p-5 rounded-xl"
                                            style={{ background: 'linear-gradient(135deg, rgba(201,162,39,0.08) 0%, rgba(201,162,39,0.04) 100%)', border: '1px solid rgba(201,162,39,0.2)' }}
                                        >
                                            {/* Current Status Header */}
                                            <div className="flex items-center justify-between mb-4 pb-4" style={{ borderBottom: '1px solid rgba(201,162,39,0.15)' }}>
                                                <div className="flex items-center gap-2">
                                                    <Truck className="h-5 w-5 text-[#c9a227]" />
                                                    <span style={{ fontWeight: 600, color: '#0d0d0d' }}>Current Status</span>
                                                </div>
                                                <div
                                                    className="px-3 py-1 rounded-full text-sm font-medium"
                                                    style={{
                                                        background: selectedOrder.shiprocket.shipmentStatus === 'delivered' ? 'rgba(22, 163, 74, 0.1)' :
                                                            selectedOrder.shiprocket.shipmentStatus === 'in_transit' ? 'rgba(59, 130, 246, 0.1)' :
                                                                selectedOrder.shiprocket.shipmentStatus === 'picked_up' ? 'rgba(234, 88, 12, 0.1)' :
                                                                    'rgba(147, 51, 234, 0.1)',
                                                        color: selectedOrder.shiprocket.shipmentStatus === 'delivered' ? '#16a34a' :
                                                            selectedOrder.shiprocket.shipmentStatus === 'in_transit' ? '#3b82f6' :
                                                                selectedOrder.shiprocket.shipmentStatus === 'picked_up' ? '#ea580c' :
                                                                    '#9333ea'
                                                    }}
                                                >
                                                    {selectedOrder.shiprocket.shipmentStatus?.replace(/_/g, ' ').toUpperCase()}
                                                </div>
                                            </div>

                                            {/* Shipment Details Grid */}
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <span className="text-sm text-[#8a8a8a]">AWB Code:</span>
                                                    <p className="font-mono text-sm mt-1" style={{ fontWeight: 600, color: '#0d0d0d' }}>
                                                        {selectedOrder.shiprocket.awbCode}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-sm text-[#8a8a8a]">Courier:</span>
                                                    <p className="text-sm mt-1" style={{ fontWeight: 600, color: '#0d0d0d' }}>
                                                        {selectedOrder.shiprocket.courierName || 'Not Assigned'}
                                                    </p>
                                                </div>
                                                {selectedOrder.shiprocket.pickupScheduledDate && (
                                                    <div>
                                                        <span className="text-sm text-[#8a8a8a]">Pickup Date:</span>
                                                        <p className="text-sm mt-1" style={{ fontWeight: 600, color: '#0d0d0d' }}>
                                                            {new Date(selectedOrder.shiprocket.pickupScheduledDate).toLocaleDateString('en-IN', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                )}
                                                {selectedOrder.shiprocket.estimatedDeliveryDate && (
                                                    <div>
                                                        <span className="text-sm text-[#8a8a8a]">Estimated Delivery:</span>
                                                        <p className="text-sm mt-1" style={{ fontWeight: 600, color: '#16a34a' }}>
                                                            {new Date(selectedOrder.shiprocket.estimatedDeliveryDate).toLocaleDateString('en-IN', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Last Updated */}
                                            {selectedOrder.shiprocket.lastWebhookUpdate && (
                                                <div className="flex items-center gap-2 text-xs text-[#8a8a8a] mt-3 pt-3" style={{ borderTop: '1px solid rgba(201,162,39,0.15)' }}>
                                                    <Clock className="h-3 w-3" />
                                                    Last updated: {new Date(selectedOrder.shiprocket.lastWebhookUpdate).toLocaleString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Tracking Timeline */}
                                        {selectedOrder.shiprocket.trackingHistory && selectedOrder.shiprocket.trackingHistory.length > 0 && (
                                            <div className="mt-6">
                                                <h4 className="mb-4 text-sm" style={{ fontWeight: 600, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    Tracking History
                                                </h4>
                                                <div className="space-y-0 relative">
                                                    {selectedOrder.shiprocket.trackingHistory.map((scan: { date: string; status: string; statusCode?: string; activity?: string; location?: string; srStatus?: string; srStatusLabel?: string }, index: number) => (
                                                        <div key={index} className="flex gap-3 pb-4 relative">
                                                            {/* Timeline connector */}
                                                            {index < (selectedOrder.shiprocket?.trackingHistory?.length ?? 0) - 1 && (
                                                                <div
                                                                    className="absolute left-[9px] top-6 w-0.5 h-full"
                                                                    style={{ background: 'rgba(201,162,39,0.25)' }}
                                                                />
                                                            )}

                                                            {/* Timeline dot */}
                                                            <div
                                                                className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center z-10"
                                                                style={{
                                                                    background: index === 0 ? 'linear-gradient(135deg, #c9a227 0%, #8b6f1b 100%)' : 'rgba(201,162,39,0.15)',
                                                                    border: index === 0 ? '2px solid #c9a227' : '2px solid rgba(201,162,39,0.3)'
                                                                }}
                                                            >
                                                                {index === 0 && (
                                                                    <div className="w-2 h-2 bg-white rounded-full" />
                                                                )}
                                                            </div>

                                                            {/* Scan details */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex flex-wrap justify-between gap-2 items-start">
                                                                    <div className="flex-1">
                                                                        <p
                                                                            className="font-medium text-sm"
                                                                            style={{
                                                                                color: index === 0 ? '#8b6f1b' : '#0d0d0d',
                                                                                fontFamily: 'DM Sans, sans-serif'
                                                                            }}
                                                                        >
                                                                            {scan.srStatusLabel || scan.status}
                                                                        </p>
                                                                        {scan.activity && scan.activity !== scan.srStatusLabel && (
                                                                            <p className="text-xs text-[#525252] mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                                                                {scan.activity}
                                                                            </p>
                                                                        )}
                                                                        {scan.location && (
                                                                            <div className="flex items-center gap-1 mt-1.5 text-xs text-[#8a8a8a]">
                                                                                <MapPin className="h-3 w-3" />
                                                                                <span>{scan.location}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <span
                                                                        className="text-xs text-[#8a8a8a] whitespace-nowrap"
                                                                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                                                                    >
                                                                        {new Date(scan.date).toLocaleString('en-IN', {
                                                                            day: 'numeric',
                                                                            month: 'short',
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })}
                                                                    </span>
                                                                </div>
                                                                {scan.statusCode && (
                                                                    <div className="mt-1">
                                                                        <code
                                                                            className="text-xs px-2 py-0.5 rounded"
                                                                            style={{
                                                                                background: 'rgba(0,0,0,0.05)',
                                                                                color: '#525252',
                                                                                fontFamily: 'monospace'
                                                                            }}
                                                                        >
                                                                            {scan.statusCode}
                                                                        </code>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Show all scans count */}
                                                {selectedOrder.shiprocket.trackingHistory.length > 10 && (
                                                    <div className="text-center mt-4 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                                                        <p className="text-xs text-[#8a8a8a]">
                                                            Showing all {selectedOrder.shiprocket.trackingHistory.length} tracking events
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="mt-6 flex gap-3">
                                            {selectedOrder.shiprocket.labelUrl && (
                                                <a
                                                    href={selectedOrder.shiprocket.labelUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                                                    style={{
                                                        background: 'white',
                                                        border: '1px solid rgba(0,0,0,0.12)',
                                                        color: '#525252'
                                                    }}
                                                >
                                                    <FileText className="h-4 w-4" />
                                                    View Label
                                                </a>
                                            )}
                                            <button
                                                onClick={() => handleViewTracking(selectedOrder)}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                                                style={{
                                                    background: 'linear-gradient(135deg, #c9a227 0%, #8b6f1b 100%)',
                                                    color: 'white'
                                                }}
                                            >
                                                <RefreshCw className="h-4 w-4" />
                                                Refresh Tracking
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Shipment Tracking Modal */}
            {showTrackingModal.isOpen && showTrackingModal.order && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div
                        className="bg-white rounded-2xl max-w-2xl w-full transform transition-all max-h-[90vh] overflow-hidden flex flex-col"
                        style={{ boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}
                    >
                        <div
                            className="p-6 flex items-center justify-between"
                            style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
                        >
                            <div>
                                <h3 style={{ fontFamily: 'Instrument Serif, Georgia, serif', fontSize: '1.5rem', fontWeight: 400, color: '#0d0d0d' }}>Shipment Tracking</h3>
                                <p className="text-sm text-[#8a8a8a] mt-1">
                                    Order #{showTrackingModal.order._id.slice(-8).toUpperCase()}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowTrackingModal({ isOpen: false, order: null })}
                                className="p-2 rounded-full hover:bg-[#faf9f7] transition-colors"
                            >
                                <X className="h-5 w-5 text-[#525252]" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            {trackingLoading ? (
                                <div className="text-center py-12">
                                    <div
                                        className="h-10 w-10 rounded-full mx-auto mb-4 animate-spin"
                                        style={{ border: '3px solid rgba(201,162,39,0.2)', borderTopColor: '#c9a227' }}
                                    ></div>
                                    <p className="text-[#525252]">Loading tracking information...</p>
                                </div>
                            ) : trackingData?.tracking ? (
                                <div className="space-y-6">
                                    {/* Current Status */}
                                    <div
                                        className="p-4 rounded-xl"
                                        style={{ background: 'linear-gradient(135deg, rgba(201,162,39,0.08) 0%, rgba(201,162,39,0.04) 100%)', border: '1px solid rgba(201,162,39,0.2)' }}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <Truck className="h-5 w-5 text-[#c9a227]" />
                                                <span style={{ fontWeight: 600, color: '#0d0d0d' }}>Current Status</span>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getShipmentStatusColor(trackingData.shiprocket?.shipmentStatus)}`}>
                                                {trackingData.tracking.currentStatus || 'Processing'}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-[#8a8a8a]">AWB Code:</span>
                                                <p className="font-mono" style={{ fontWeight: 600, color: '#0d0d0d' }}>{trackingData.tracking.awbCode}</p>
                                            </div>
                                            <div>
                                                <span className="text-[#8a8a8a]">Courier:</span>
                                                <p style={{ fontWeight: 600, color: '#0d0d0d' }}>{trackingData.tracking.courierName}</p>
                                            </div>
                                            {trackingData.tracking.estimatedDelivery && (
                                                <div>
                                                    <span className="text-[#8a8a8a]">Expected Delivery:</span>
                                                    <p style={{ fontWeight: 600, color: '#0d0d0d' }}>
                                                        {new Date(trackingData.tracking.estimatedDelivery).toLocaleDateString('en-IN', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            )}
                                            {trackingData.tracking.pickupDate && (
                                                <div>
                                                    <span className="text-[#8a8a8a]">Pickup Date:</span>
                                                    <p style={{ fontWeight: 600, color: '#0d0d0d' }}>
                                                        {new Date(trackingData.tracking.pickupDate).toLocaleDateString('en-IN', {
                                                            day: 'numeric',
                                                            month: 'short'
                                                        })}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        {trackingData.tracking.trackUrl && (
                                            <a
                                                href={trackingData.tracking.trackUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-sm text-[#c9a227] hover:text-[#8b6f1b] mt-3 transition-colors"
                                            >
                                                Track on courier website
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        )}
                                    </div>

                                    {/* Tracking Timeline */}
                                    {trackingData.tracking.activities && trackingData.tracking.activities.length > 0 && (
                                        <div>
                                            <h4 className="mb-4" style={{ fontWeight: 600, color: '#0d0d0d' }}>Tracking History</h4>
                                            <div className="space-y-0 relative">
                                                {trackingData.tracking.activities.slice(0, 15).map((activity: TrackingActivity, index: number) => (
                                                    <div key={index} className="flex gap-3 pb-4 relative">
                                                        {index < (trackingData.tracking.activities?.length ?? 0) - 1 && (
                                                            <div
                                                                className="absolute left-[9px] top-6 w-0.5 h-full"
                                                                style={{ background: 'rgba(201,162,39,0.3)' }}
                                                            />
                                                        )}
                                                        <div
                                                            className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center z-10"
                                                            style={{
                                                                background: index === 0 ? '#c9a227' : 'rgba(201,162,39,0.2)'
                                                            }}
                                                        >
                                                            {index === 0 ? (
                                                                <div className="w-2 h-2 bg-white rounded-full" />
                                                            ) : (
                                                                <div className="w-2 h-2 rounded-full" style={{ background: '#c9a227' }} />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex flex-wrap justify-between gap-2">
                                                                <p
                                                                    className="font-medium text-sm"
                                                                    style={{ color: index === 0 ? '#8b6f1b' : '#0d0d0d' }}
                                                                >
                                                                    {activity['sr-status-label'] || activity.status || activity.activity}
                                                                </p>
                                                                <span className="text-xs text-[#8a8a8a]">
                                                                    {new Date(activity.date).toLocaleDateString('en-IN', {
                                                                        day: 'numeric',
                                                                        month: 'short',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </span>
                                                            </div>
                                                            {activity.activity && (
                                                                <p className="text-xs text-[#525252] mt-0.5">{activity.activity}</p>
                                                            )}
                                                            {activity.location && (
                                                                <div className="flex items-center gap-1 mt-1 text-xs text-[#8a8a8a]">
                                                                    <MapPin className="h-3 w-3" />
                                                                    <span>{activity.location}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Truck className="h-12 w-12 text-[#e5e5e5] mx-auto mb-4" />
                                    <p className="text-[#525252] mb-2">No tracking information available</p>
                                    <p className="text-sm text-[#8a8a8a]">
                                        {trackingData?.message || 'Tracking updates will appear once the shipment is dispatched'}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div
                            className="p-4 flex justify-end gap-3"
                            style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
                        >
                            <button
                                onClick={() => handleViewTracking(showTrackingModal.order!)}
                                disabled={trackingLoading}
                                className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                                style={{
                                    border: '1px solid rgba(0,0,0,0.12)',
                                    color: '#525252',
                                    background: 'transparent'
                                }}
                            >
                                <RefreshCw className={`h-4 w-4 ${trackingLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                            <button
                                onClick={() => setShowTrackingModal({ isOpen: false, order: null })}
                                className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                                style={{
                                    background: 'linear-gradient(135deg, #c9a227 0%, #8b6f1b 100%)',
                                    color: 'white'
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Update Confirmation Modal */}
            {showStatusModal?.isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div
                        className="bg-white rounded-2xl max-w-md w-full transform transition-all"
                        style={{ boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}
                    >
                        <div className="p-6">
                            <div
                                className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4"
                                style={{ background: 'rgba(220,38,38,0.1)' }}
                            >
                                <AlertCircle className="h-8 w-8 text-[#dc2626]" />
                            </div>
                            <h3
                                className="text-center mb-2"
                                style={{ fontFamily: 'Instrument Serif, Georgia, serif', fontSize: '1.5rem', fontWeight: 400, color: '#0d0d0d' }}
                            >
                                Cancel Order & Initiate Refund?
                            </h3>
                            <p className="text-[#525252] text-center mb-4">
                                This order was paid via Razorpay. Cancelling it will automatically initiate a refund to the customer's original payment method.
                            </p>
                            <div
                                className="rounded-xl p-4 mb-6"
                                style={{ background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.2)' }}
                            >
                                <div className="flex items-center gap-2 text-[#8b6f1b] mb-2">
                                    <Clock className="h-5 w-5" />
                                    <span style={{ fontWeight: 600 }}>Refund Timeline</span>
                                </div>
                                <p className="text-sm text-[#525252]">
                                    The refund will be processed within <strong>5-7 working days</strong> and credited back to the customer's account.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowStatusModal(null)}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50"
                                    style={{
                                        background: '#faf9f7',
                                        color: '#0d0d0d',
                                        border: '1px solid rgba(0,0,0,0.06)'
                                    }}
                                    disabled={statusUpdateLoading !== null}
                                >
                                    Keep Order
                                </button>
                                <button
                                    onClick={() => showStatusModal && handleUpdateOrderStatus(showStatusModal.orderId, showStatusModal.newStatus, true)}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50"
                                    style={{
                                        background: '#dc2626',
                                        color: 'white'
                                    }}
                                    disabled={statusUpdateLoading !== null}
                                >
                                    {statusUpdateLoading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div
                                                className="h-4 w-4 rounded-full animate-spin"
                                                style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }}
                                            ></div>
                                            Processing...
                                        </div>
                                    ) : (
                                        'Cancel & Refund'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
