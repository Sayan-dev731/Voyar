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
    SlidersHorizontal
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Product } from '@/types/product'
import { API_URL } from '@/config/api'

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
    price: string
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
    colors: { name: string; value: string; price: string; quantity: string }[]
    stock: string
    inStock: boolean
}

const initialProductForm: ProductFormData = {
    name: '',
    category: 'Sunglasses',
    price: '',
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
    colors: [{ name: '', value: '#000000', price: '', quantity: '' }],
    stock: '0',
    inStock: true
}

// Helper function to convert Google Drive link to direct image URL
const convertGoogleDriveLink = (url: string): string => {
    if (!url) return url;

    // Check if it's already in thumbnail format
    if (url.includes('drive.google.com/thumbnail')) {
        return url;
    }

    // Patterns to extract Google Drive file ID
    const drivePatterns = [
        /https:\/\/drive\.google\.com\/file\/d\/([^/]+)\/view/,
        /https:\/\/drive\.google\.com\/file\/d\/([^/]+)/,
        /https:\/\/drive\.google\.com\/open\?id=([^&]+)/,
        /https:\/\/drive\.google\.com\/uc\?id=([^&]+)/,
        /https:\/\/drive\.google\.com\/uc\?export=view&id=([^&]+)/,
        /https:\/\/drive\.google\.com\/thumbnail\?id=([^&]+)/
    ];

    for (const pattern of drivePatterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            // Use thumbnail format which works better for rendering
            return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
        }
    }

    // Return original URL if not a Google Drive link
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
    const [saving, setSaving] = useState(false)
    const [showChangePassword, setShowChangePassword] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [showUserModal, setShowUserModal] = useState(false)
    const [editingUser, setEditingUser] = useState(false)
    const [userForm, setUserForm] = useState({ name: '', email: '', phone: '' })

    // Site settings state
    const [siteSettings, setSiteSettings] = useState({
        recoveryEmail: 'sayancodder731@gmail.com',
        siteName: 'Voyar Eyewear',
        supportEmail: 'support@voyar.com',
        platformCharges: 0,
        deliveryCharges: 0,
        codEnabled: true
    })
    const [showEditSettings, setShowEditSettings] = useState(false)
    const [settingsForm, setSettingsForm] = useState({
        recoveryEmail: '',
        siteName: '',
        supportEmail: '',
        platformCharges: 0,
        deliveryCharges: 0,
        codEnabled: true
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
            }

            // Fetch site settings
            const settingsRes = await fetch(`${API_URL}/admin/settings`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (settingsRes.ok) {
                const settingsData = await settingsRes.json()
                setSiteSettings(settingsData)
                setSettingsForm(settingsData)
            }
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
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
                codEnabled: settingsForm.codEnabled
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
    }

    const openAddProductModal = () => {
        resetProductForm()
        setShowAddProduct(true)
    }

    const openEditProductModal = (product: Product) => {
        console.log('Opening edit modal for product:', product._id || product.id, product.name)
        setEditingProduct(product)
        setProductForm({
            name: product.name || '',
            category: product.category || 'Sunglasses',
            price: String(product.price || ''),
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
                quantity: String(c.quantity || '0')
            })) : [{ name: '', value: '#000000', price: String(product.price || ''), quantity: '0' }],
            stock: String(product.stock || '0'),
            inStock: product.inStock !== false
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
        setProductForm(prev => ({
            ...prev,
            colors: [...prev.colors, { name: '', value: '#000000', price: prev.price, quantity: '0' }]
        }))
    }

    const handleRemoveColor = (index: number) => {
        setProductForm(prev => ({
            ...prev,
            colors: prev.colors.filter((_, i) => i !== index)
        }))
    }

    const handleColorChange = (index: number, field: 'name' | 'value' | 'price' | 'quantity', value: string) => {
        setProductForm(prev => ({
            ...prev,
            colors: prev.colors.map((c, i) => i === index ? { ...c, [field]: value } : c)
        }))
    }

    const handleSubmitProduct = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError('')
        setFormSuccess('')

        // Validation
        if (!productForm.name.trim()) {
            setFormError('Product name is required')
            return
        }
        if (!productForm.price || isNaN(Number(productForm.price)) || Number(productForm.price) <= 0) {
            setFormError('Valid price is required')
            return
        }
        if (!productForm.image.trim()) {
            setFormError('Main product image is required')
            return
        }
        if (!productForm.description.trim()) {
            setFormError('Description is required')
            return
        }

        setSaving(true)
        const token = localStorage.getItem('adminToken')

        // Prepare data
        const productData = {
            name: productForm.name.trim(),
            category: productForm.category,
            price: Number(productForm.price),
            image: convertGoogleDriveLink(productForm.image.trim()),
            images: productForm.images.filter(img => img.trim()),
            description: productForm.description.trim(),
            detailedDescription: productForm.detailedDescription.trim(),
            features: productForm.features.filter(f => f.trim()),
            specifications: productForm.specifications,
            colors: productForm.colors.filter(c => c.name.trim()).map(c => ({
                name: c.name.trim(),
                value: c.value,
                price: Number(c.price) || Number(productForm.price),
                quantity: Number(c.quantity) || 0
            })),
            stock: Number(productForm.stock) || 0,
            inStock: productForm.inStock
        }

        try {
            const productId = editingProduct?._id || editingProduct?.id
            const url = editingProduct
                ? `${API_URL}/products/${productId}`
                : `${API_URL}/products`

            console.log('Submitting product:', editingProduct ? 'UPDATE' : 'CREATE', url, productData)

            const response = await fetch(url, {
                method: editingProduct ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(productData)
            })

            const data = await response.json()
            console.log('Response:', response.status, data)

            if (response.ok) {
                setFormSuccess(editingProduct ? 'Product updated successfully!' : 'Product added successfully!')
                showToast(editingProduct ? 'Product updated successfully!' : 'Product added successfully!', 'success')
                await fetchData() // Wait for data to refresh
                setTimeout(() => {
                    closeProductModal()
                }, 1500)
            } else {
                setFormError(data.message || 'Failed to save product')
                showToast(data.message || 'Failed to save product', 'error')
            }
        } catch (error) {
            console.error('Error saving product:', error)
            setFormError('Network error. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
                    <p className="mt-4 text-black/60">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-amber-50/30 to-white">
            {/* Header */}
            <div className="bg-white border-b border-amber-200/60 sticky top-0 z-50">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <h1 className="text-2xl font-[600] text-black">Voyar Admin</h1>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                onClick={handleRefresh}
                                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                title="Refresh Data"
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={handleLogout}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto">
                    <Button
                        onClick={() => setActiveTab('overview')}
                        className={`${activeTab === 'overview'
                            ? 'bg-amber-600 text-white'
                            : 'bg-white text-black/60 hover:bg-amber-50'
                            }`}
                    >
                        <Package className="mr-2 h-4 w-4" />
                        Overview
                    </Button>
                    <Button
                        onClick={() => setActiveTab('products')}
                        className={`${activeTab === 'products'
                            ? 'bg-amber-600 text-white'
                            : 'bg-white text-black/60 hover:bg-amber-50'
                            }`}
                    >
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Products ({products.length})
                    </Button>
                    <Button
                        onClick={() => setActiveTab('orders')}
                        className={`${activeTab === 'orders'
                            ? 'bg-amber-600 text-white'
                            : 'bg-white text-black/60 hover:bg-amber-50'
                            }`}
                    >
                        <Users className="mr-2 h-4 w-4" />
                        Orders ({orders.length})
                    </Button>
                    <Button
                        onClick={() => setActiveTab('users')}
                        className={`${activeTab === 'users'
                            ? 'bg-amber-600 text-white'
                            : 'bg-white text-black/60 hover:bg-amber-50'
                            }`}
                    >
                        <Users className="mr-2 h-4 w-4" />
                        Users ({users.length})
                    </Button>
                    <Button
                        onClick={() => setActiveTab('settings')}
                        className={`${activeTab === 'settings'
                            ? 'bg-amber-600 text-white'
                            : 'bg-white text-black/60 hover:bg-amber-50'
                            }`}
                    >
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </Button>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card className="border-amber-200/60 rounded-2xl">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-black/60 mb-1">Total Orders</p>
                                            <p className="text-3xl font-[600] text-black">{stats.totalOrders}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                                            <ShoppingBag className="h-6 w-6 text-amber-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-amber-200/60 rounded-2xl">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-black/60 mb-1">Pending</p>
                                            <p className="text-3xl font-[600] text-black">{stats.pendingOrders}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                            <Package className="h-6 w-6 text-orange-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-amber-200/60 rounded-2xl">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-black/60 mb-1">Completed</p>
                                            <p className="text-3xl font-[600] text-black">{stats.completedOrders}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                            <Package className="h-6 w-6 text-green-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-amber-200/60 rounded-2xl">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-black/60 mb-1">Revenue</p>
                                            <p className="text-3xl font-[600] text-black">₹{stats.totalRevenue.toFixed(2)}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                            <DollarSign className="h-6 w-6 text-green-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="border-amber-200/60 rounded-2xl">
                            <CardContent className="p-6">
                                <h3 className="text-xl font-[600] text-black mb-4">Recent Orders</h3>
                                <div className="space-y-4">
                                    {orders.slice(0, 5).map((order) => (
                                        <div key={order._id} className="flex items-center justify-between p-4 bg-amber-50/50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-black">{order.customerName}</p>
                                                <p className="text-sm text-black/60">{order.customerEmail}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-[600] text-amber-600">₹{order.totalAmount}</p>
                                                <p className="text-sm text-black/60">{order.status}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <div>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <h2 className="text-2xl font-[600] text-black">Manage Products</h2>
                            <Button
                                onClick={openAddProductModal}
                                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Product
                            </Button>
                        </div>

                        {/* Search and Filter Bar for Products */}
                        <div className="bg-amber-50/50 rounded-2xl p-4 mb-6 border border-amber-200/60">
                            <div className="flex flex-col lg:flex-row gap-4">
                                {/* Search Input */}
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
                                    <input
                                        type="text"
                                        placeholder="Search products by name, category, or description..."
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 bg-white"
                                    />
                                </div>

                                {/* Category Filter */}
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-black/40" />
                                    <select
                                        value={productCategoryFilter}
                                        onChange={(e) => setProductCategoryFilter(e.target.value)}
                                        className="px-3 py-2.5 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 bg-white min-w-[150px]"
                                    >
                                        <option value="all">All Categories</option>
                                        {productCategories.map(category => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Stock Filter */}
                                <div className="flex items-center gap-2">
                                    <SlidersHorizontal className="h-4 w-4 text-black/40" />
                                    <select
                                        value={productStockFilter}
                                        onChange={(e) => setProductStockFilter(e.target.value)}
                                        className="px-3 py-2.5 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 bg-white min-w-[140px]"
                                    >
                                        <option value="all">All Stock</option>
                                        <option value="inStock">In Stock</option>
                                        <option value="outOfStock">Out of Stock</option>
                                    </select>
                                </div>

                                {/* Clear Filters */}
                                {(productSearch || productCategoryFilter !== 'all' || productStockFilter !== 'all') && (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setProductSearch('')
                                            setProductCategoryFilter('all')
                                            setProductStockFilter('all')
                                        }}
                                        className="border-amber-200 hover:bg-amber-50 text-black/70"
                                    >
                                        <X className="mr-1 h-4 w-4" />
                                        Clear
                                    </Button>
                                )}
                            </div>

                            {/* Results count */}
                            <div className="mt-3 text-sm text-black/60">
                                Showing {filteredProducts.length} of {products.length} products
                                {productSearch && ` matching "${productSearch}"`}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map((product) => (
                                <Card key={product.id || product._id} className="border-amber-200/60 rounded-2xl">
                                    <CardContent className="p-4">
                                        <div className="aspect-[4/3] bg-gradient-to-br from-amber-50 to-white rounded-xl overflow-hidden mb-4">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover mix-blend-multiply"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=No+Image'
                                                }}
                                            />
                                        </div>
                                        <h3 className="font-[600] text-black mb-1">{product.name}</h3>
                                        <p className="text-sm text-black/60 mb-2">{product.category}</p>
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-lg font-[600] text-amber-600">₹{product.price}</p>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.inStock !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {product.inStock !== false ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-black/50 mb-4">
                                            Stock: {product.colors && product.colors.length > 0
                                                ? product.colors.reduce((sum, c) => sum + (c.quantity || 0), 0)
                                                : (product.stock || 0)} units
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigate(`/product/${product.id || product._id}`)}
                                                className="flex-1 border-amber-200 hover:border-amber-400 hover:bg-amber-50"
                                            >
                                                <Eye className="mr-1 h-3 w-3" />
                                                View
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openEditProductModal(product)}
                                                className="flex-1 border-amber-200 hover:border-amber-400 hover:bg-amber-50"
                                            >
                                                <Edit className="mr-1 h-3 w-3" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteProduct(product.id || product._id!)}
                                                className="border-red-200 hover:border-red-400 hover:bg-red-50 text-red-600"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Empty state for products */}
                        {filteredProducts.length === 0 && (
                            <div className="text-center py-12 text-black/40">
                                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>{products.length === 0 ? 'No products yet' : 'No products match your search criteria'}</p>
                                {products.length > 0 && (productSearch || productCategoryFilter !== 'all' || productStockFilter !== 'all') && (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setProductSearch('')
                                            setProductCategoryFilter('all')
                                            setProductStockFilter('all')
                                        }}
                                        className="mt-4 border-amber-200 hover:bg-amber-50"
                                    >
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <h2 className="text-2xl font-[600] text-black">Manage Orders</h2>
                            <Button
                                onClick={() => exportToCSV('orders')}
                                className="bg-amber-600 hover:bg-amber-700 text-white"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export Orders
                            </Button>
                        </div>

                        {/* Search and Filter Bar for Orders */}
                        <div className="bg-amber-50/50 rounded-2xl p-4 mb-6 border border-amber-200/60">
                            <div className="flex flex-col lg:flex-row gap-4">
                                {/* Search Input */}
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
                                    <input
                                        type="text"
                                        placeholder="Search by customer name, email, phone, or order ID..."
                                        value={orderSearch}
                                        onChange={(e) => setOrderSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 bg-white"
                                    />
                                </div>

                                {/* Status Filter */}
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-black/40" />
                                    <select
                                        value={orderStatusFilter}
                                        onChange={(e) => setOrderStatusFilter(e.target.value)}
                                        className="px-3 py-2.5 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 bg-white min-w-[140px]"
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
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-black/40" />
                                    <select
                                        value={orderPaymentFilter}
                                        onChange={(e) => setOrderPaymentFilter(e.target.value)}
                                        className="px-3 py-2.5 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 bg-white min-w-[130px]"
                                    >
                                        <option value="all">All Payments</option>
                                        <option value="paid">Paid</option>
                                        <option value="pending">Pending</option>
                                        <option value="failed">Failed</option>
                                    </select>
                                </div>

                                {/* Date Filter */}
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-black/40" />
                                    <select
                                        value={orderDateFilter}
                                        onChange={(e) => setOrderDateFilter(e.target.value)}
                                        className="px-3 py-2.5 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 bg-white min-w-[120px]"
                                    >
                                        <option value="all">All Time</option>
                                        <option value="today">Today</option>
                                        <option value="week">Last 7 Days</option>
                                        <option value="month">Last 30 Days</option>
                                    </select>
                                </div>

                                {/* Clear Filters */}
                                {(orderSearch || orderStatusFilter !== 'all' || orderPaymentFilter !== 'all' || orderDateFilter !== 'all') && (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setOrderSearch('')
                                            setOrderStatusFilter('all')
                                            setOrderPaymentFilter('all')
                                            setOrderDateFilter('all')
                                        }}
                                        className="border-amber-200 hover:bg-amber-50 text-black/70"
                                    >
                                        <X className="mr-1 h-4 w-4" />
                                        Clear
                                    </Button>
                                )}
                            </div>

                            {/* Results count */}
                            <div className="mt-3 text-sm text-black/60">
                                Showing {filteredOrders.length} of {orders.length} orders
                                {orderSearch && ` matching "${orderSearch}"`}
                            </div>
                        </div>

                        <div className="space-y-6">
                            {filteredOrders.map((order) => (
                                <Card key={order._id} className="border-amber-200/60 rounded-2xl overflow-hidden shadow-lg">
                                    <CardContent className="p-0">
                                        {/* Order Header */}
                                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 border-b border-amber-200/60">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-xl font-[600] text-black">{order.customerName}</h3>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-[600] ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                            order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                                                order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                                                                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                                        'bg-orange-100 text-orange-700'
                                                            }`}>
                                                            {order.status.toUpperCase()}
                                                        </span>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-[600] ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                                                            order.paymentStatus === 'failed' ? 'bg-red-100 text-red-700' :
                                                                order.paymentStatus === 'refunded' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {(order.paymentStatus || 'pending').toUpperCase()}
                                                        </span>
                                                        {/* Refund Status Badge */}
                                                        {order.refundStatus && order.refundStatus !== 'not_applicable' && (
                                                            <span className={`px-3 py-1 rounded-full text-xs font-[600] ${order.refundStatus === 'completed' ? 'bg-green-100 text-green-700' :
                                                                    order.refundStatus === 'processing' ? 'bg-amber-100 text-amber-700' :
                                                                        order.refundStatus === 'failed' ? 'bg-red-100 text-red-700' :
                                                                            'bg-blue-100 text-blue-700'
                                                                }`}>
                                                                REFUND: {order.refundStatus.toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-black/70">
                                                        <span className="flex items-center gap-1">
                                                            <Mail className="h-4 w-4" />
                                                            {order.customerEmail}
                                                        </span>
                                                        {order.customerPhone && (
                                                            <span className="flex items-center gap-1">
                                                                <Phone className="h-4 w-4" />
                                                                {order.customerPhone}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-black/50 mt-2 flex items-center gap-1">
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
                                                            className={`px-4 py-2 border-2 border-amber-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white w-full ${statusUpdateLoading === order._id ? 'opacity-50 cursor-wait' : ''}`}
                                                        >
                                                            <option value="pending">Pending</option>
                                                            <option value="processing">Processing</option>
                                                            <option value="shipped">Shipped</option>
                                                            <option value="delivered">Delivered</option>
                                                            <option value="cancelled">Cancelled</option>
                                                        </select>
                                                        {statusUpdateLoading === order._id && (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                                                                <div className="animate-spin h-5 w-5 border-2 border-amber-500 border-t-transparent rounded-full"></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedOrder(order)
                                                                setShowOrderDetailsModal(true)
                                                            }}
                                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                                                        >
                                                            <Eye className="mr-1 h-3 w-3" />
                                                            View
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleDeleteOrder(order._id)}
                                                            className="bg-red-600 hover:bg-red-700 text-white text-xs px-2"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleGenerateBill(order._id)}
                                                        className="w-full bg-green-600 hover:bg-green-700 text-white text-xs"
                                                    >
                                                        <Mail className="mr-1 h-3 w-3" />
                                                        Generate Bill
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Content Grid */}
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                                            {/* Left Column - Items to Ship */}
                                            <div className="lg:col-span-2 space-y-4">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Package className="h-5 w-5 text-amber-600" />
                                                    <h4 className="text-lg font-[600] text-black">Items to Ship ({order.items.length})</h4>
                                                </div>
                                                <div className="space-y-3">
                                                    {order.items.map((item, index) => (
                                                        <div key={index} className="flex items-center gap-4 p-4 bg-white border-2 border-amber-100 rounded-xl hover:border-amber-300 transition-colors">
                                                            <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                                {item.productImage ? (
                                                                    <img
                                                                        src={item.productImage.includes('drive.google.com')
                                                                            ? `https://drive.google.com/thumbnail?id=${item.productImage.match(/\/d\/([^/]+)/)?.[1] || item.productImage.match(/id=([^&]+)/)?.[1]}&sz=w200`
                                                                            : item.productImage
                                                                        }
                                                                        alt={item.productName}
                                                                        className="w-full h-full object-cover"
                                                                        onError={(e) => {
                                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                                            (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="flex items-center justify-center w-full h-full"><svg class="h-8 w-8 text-amber-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg></div>';
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <Package className="h-8 w-8 text-amber-600" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h5 className="font-[600] text-black truncate">{item.productName}</h5>
                                                                <div className="flex items-center gap-4 mt-1">
                                                                    <span className="text-sm text-black/60">Qty: <span className="font-[600] text-black">{item.quantity}</span></span>
                                                                    <span className="text-sm text-black/60">Price: <span className="font-[600] text-amber-600">₹{item.price.toFixed(2)}</span></span>
                                                                </div>
                                                                <div className="text-sm font-[600] text-black mt-1">
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
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {filteredOrders.length === 0 && (
                                <div className="text-center py-12 text-black/40">
                                    <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>{orders.length === 0 ? 'No orders yet' : 'No orders match your search criteria'}</p>
                                    {orders.length > 0 && (orderSearch || orderStatusFilter !== 'all' || orderPaymentFilter !== 'all' || orderDateFilter !== 'all') && (
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setOrderSearch('')
                                                setOrderStatusFilter('all')
                                                setOrderPaymentFilter('all')
                                                setOrderDateFilter('all')
                                            }}
                                            className="mt-4 border-amber-200 hover:bg-amber-50"
                                        >
                                            Clear Filters
                                        </Button>
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
                            <h2 className="text-2xl font-[600] text-black">Manage Users</h2>
                            <Button
                                onClick={() => exportToCSV('users')}
                                className="bg-amber-600 hover:bg-amber-700 text-white"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export Users
                            </Button>
                        </div>

                        {/* Search and Filter Bar for Users */}
                        <div className="bg-amber-50/50 rounded-2xl p-4 mb-6 border border-amber-200/60">
                            <div className="flex flex-col lg:flex-row gap-4">
                                {/* Search Input */}
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, or phone..."
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 bg-white"
                                    />
                                </div>

                                {/* Verification Filter */}
                                <div className="flex items-center gap-2">
                                    <UserCheck className="h-4 w-4 text-black/40" />
                                    <select
                                        value={userVerificationFilter}
                                        onChange={(e) => setUserVerificationFilter(e.target.value)}
                                        className="px-3 py-2.5 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 bg-white min-w-[150px]"
                                    >
                                        <option value="all">All Users</option>
                                        <option value="verified">Verified</option>
                                        <option value="unverified">Unverified</option>
                                    </select>
                                </div>

                                {/* Clear Filters */}
                                {(userSearch || userVerificationFilter !== 'all') && (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setUserSearch('')
                                            setUserVerificationFilter('all')
                                        }}
                                        className="border-amber-200 hover:bg-amber-50 text-black/70"
                                    >
                                        <X className="mr-1 h-4 w-4" />
                                        Clear
                                    </Button>
                                )}
                            </div>

                            {/* Results count */}
                            <div className="mt-3 text-sm text-black/60">
                                Showing {filteredUsers.length} of {users.length} users
                                {userSearch && ` matching "${userSearch}"`}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredUsers.map((user) => (
                                <Card key={user._id} className="border-amber-200/60 rounded-2xl hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-[600] text-black truncate">{user.name}</h3>
                                                    {user.isVerified ? (
                                                        <UserCheck className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                    ) : (
                                                        <UserX className="h-4 w-4 text-red-600 flex-shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-sm text-black/60 flex items-center gap-1 mt-1 truncate">
                                                    <Mail className="h-3 w-3" />
                                                    {user.email}
                                                </p>
                                                {user.phone && (
                                                    <p className="text-sm text-black/60 flex items-center gap-1 mt-1">
                                                        <Phone className="h-3 w-3" />
                                                        {user.phone}
                                                    </p>
                                                )}
                                                <p className="text-xs text-black/40 flex items-center gap-1 mt-2">
                                                    <Calendar className="h-3 w-3" />
                                                    Joined {new Date(user.createdAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                                <div className="flex gap-2 mt-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.isVerified
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {user.isVerified ? 'Verified' : 'Unverified'}
                                                    </span>
                                                    {user.addresses && user.addresses.length > 0 && (
                                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                            {user.addresses.length} Address{user.addresses.length > 1 ? 'es' : ''}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex gap-2 mt-4">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleViewUser(user)}
                                                        className="flex-1 border-amber-200 hover:bg-amber-50 hover:border-amber-300"
                                                    >
                                                        <Eye className="h-3 w-3 mr-1" />
                                                        View
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteUser(user._id)}
                                                        className="border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        {filteredUsers.length === 0 && (
                            <div className="text-center py-12 text-black/40">
                                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>{users.length === 0 ? 'No users found' : 'No users match your search criteria'}</p>
                                {users.length > 0 && (userSearch || userVerificationFilter !== 'all') && (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setUserSearch('')
                                            setUserVerificationFilter('all')
                                        }}
                                        className="mt-4 border-amber-200 hover:bg-amber-50"
                                    >
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div>
                        <h2 className="text-2xl font-[600] text-black mb-6">Admin Settings</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Admin Profile */}
                            <Card className="border-amber-200/60 rounded-2xl">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Shield className="h-5 w-5 text-amber-600" />
                                        <h3 className="text-lg font-[600] text-black">Admin Profile</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                                            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                A
                                            </div>
                                            <div>
                                                <p className="font-[600] text-black">Administrator</p>
                                                <p className="text-sm text-black/60">Full Access</p>
                                            </div>
                                        </div>
                                        <div className="text-sm text-black/60">
                                            <p className="flex items-center gap-2 py-1">
                                                <Clock className="h-4 w-4" />
                                                Session started: {new Date().toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Site Settings */}
                            <Card className="border-amber-200/60 rounded-2xl">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-5 w-5 text-amber-600" />
                                            <h3 className="text-lg font-[600] text-black">Site Settings</h3>
                                        </div>
                                        <Button
                                            onClick={() => {
                                                setSettingsForm(siteSettings)
                                                setShowEditSettings(!showEditSettings)
                                            }}
                                            variant="outline"
                                            size="sm"
                                            className="border-amber-200 hover:bg-amber-50"
                                        >
                                            {showEditSettings ? 'Cancel' : 'Edit'}
                                        </Button>
                                    </div>
                                    {showEditSettings ? (
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-sm font-medium text-black/70 mb-1 block">Recovery Email</label>
                                                <input
                                                    type="email"
                                                    placeholder="Recovery Email"
                                                    value={settingsForm.recoveryEmail}
                                                    onChange={(e) => setSettingsForm({ ...settingsForm, recoveryEmail: e.target.value })}
                                                    className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-black/70 mb-1 block">Site Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="Site Name"
                                                    value={settingsForm.siteName}
                                                    onChange={(e) => setSettingsForm({ ...settingsForm, siteName: e.target.value })}
                                                    className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-black/70 mb-1 block">Support Email</label>
                                                <input
                                                    type="email"
                                                    placeholder="Support Email"
                                                    value={settingsForm.supportEmail}
                                                    onChange={(e) => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                                                    className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-black/70 mb-1 block">Platform Charges (₹)</label>
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    min="0"
                                                    value={settingsForm.platformCharges}
                                                    onChange={(e) => setSettingsForm({ ...settingsForm, platformCharges: Number(e.target.value) || 0 })}
                                                    className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-black/70 mb-1 block">Delivery Charges (₹)</label>
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    min="0"
                                                    value={settingsForm.deliveryCharges}
                                                    onChange={(e) => setSettingsForm({ ...settingsForm, deliveryCharges: Number(e.target.value) || 0 })}
                                                    className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                                                <div>
                                                    <label className="text-sm font-medium text-black/70">Cash on Delivery</label>
                                                    <p className="text-xs text-black/50">Enable or disable COD payment option</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setSettingsForm({ ...settingsForm, codEnabled: !settingsForm.codEnabled })}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settingsForm.codEnabled ? 'bg-amber-600' : 'bg-gray-300'}`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settingsForm.codEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                                                    />
                                                </button>
                                            </div>
                                            <Button
                                                onClick={handleUpdateSettings}
                                                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                                            >
                                                Save Settings
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between items-center p-2 bg-amber-50 rounded-lg">
                                                <span className="text-black/60">Recovery Email:</span>
                                                <span className="font-medium text-black truncate max-w-[180px]">{siteSettings.recoveryEmail}</span>
                                            </div>
                                            <div className="flex justify-between items-center p-2 bg-amber-50 rounded-lg">
                                                <span className="text-black/60">Site Name:</span>
                                                <span className="font-medium text-black">{siteSettings.siteName}</span>
                                            </div>
                                            <div className="flex justify-between items-center p-2 bg-amber-50 rounded-lg">
                                                <span className="text-black/60">Support Email:</span>
                                                <span className="font-medium text-black truncate max-w-[180px]">{siteSettings.supportEmail}</span>
                                            </div>
                                            <div className="flex justify-between items-center p-2 bg-amber-50 rounded-lg">
                                                <span className="text-black/60">Platform Charges:</span>
                                                <span className="font-medium text-black">₹{siteSettings.platformCharges}</span>
                                            </div>
                                            <div className="flex justify-between items-center p-2 bg-amber-50 rounded-lg">
                                                <span className="text-black/60">Delivery Charges:</span>
                                                <span className="font-medium text-black">₹{siteSettings.deliveryCharges}</span>
                                            </div>
                                            <div className="flex justify-between items-center p-2 bg-amber-50 rounded-lg">
                                                <span className="text-black/60">Cash on Delivery:</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${siteSettings.codEnabled !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {siteSettings.codEnabled !== false ? 'Enabled' : 'Disabled'}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Security Settings */}
                            <Card className="border-amber-200/60 rounded-2xl">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Shield className="h-5 w-5 text-amber-600" />
                                        <h3 className="text-lg font-[600] text-black">Security</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <Button
                                            onClick={() => setShowChangePassword(!showChangePassword)}
                                            variant="outline"
                                            className="w-full justify-start border-amber-200 hover:bg-amber-50"
                                        >
                                            Change Password
                                        </Button>
                                        {showChangePassword && (
                                            <div className="space-y-3 p-4 bg-amber-50/50 rounded-lg">
                                                <input
                                                    type="password"
                                                    placeholder="Current Password"
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                                />
                                                <input
                                                    type="password"
                                                    placeholder="New Password (min 6 characters)"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                                />
                                                <Button
                                                    onClick={handleChangePassword}
                                                    className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                                                >
                                                    Update Password
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Stats */}
                            <Card className="border-amber-200/60 rounded-2xl">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Activity className="h-5 w-5 text-amber-600" />
                                        <h3 className="text-lg font-[600] text-black">Quick Stats</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-amber-50 rounded-lg text-center">
                                            <p className="text-2xl font-[600] text-amber-600">{products.length}</p>
                                            <p className="text-xs text-black/60">Products</p>
                                        </div>
                                        <div className="p-3 bg-amber-50 rounded-lg text-center">
                                            <p className="text-2xl font-[600] text-amber-600">{orders.length}</p>
                                            <p className="text-xs text-black/60">Orders</p>
                                        </div>
                                        <div className="p-3 bg-amber-50 rounded-lg text-center">
                                            <p className="text-2xl font-[600] text-amber-600">{users.length}</p>
                                            <p className="text-xs text-black/60">Users</p>
                                        </div>
                                        <div className="p-3 bg-amber-50 rounded-lg text-center">
                                            <p className="text-2xl font-[600] text-amber-600">₹{stats.totalRevenue?.toLocaleString() || 0}</p>
                                            <p className="text-xs text-black/60">Revenue</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Data Management */}
                            <Card className="border-amber-200/60 rounded-2xl">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Download className="h-5 w-5 text-amber-600" />
                                        <h3 className="text-lg font-[600] text-black">Data Export</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <Button
                                            onClick={() => exportToCSV('products')}
                                            variant="outline"
                                            className="w-full justify-start border-amber-200 hover:bg-amber-50"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Export Products (CSV)
                                        </Button>
                                        <Button
                                            onClick={() => exportToCSV('orders')}
                                            variant="outline"
                                            className="w-full justify-start border-amber-200 hover:bg-amber-50"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Export Orders (CSV)
                                        </Button>
                                        <Button
                                            onClick={() => exportToCSV('users')}
                                            variant="outline"
                                            className="w-full justify-start border-amber-200 hover:bg-amber-50"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Export Users (CSV)
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>

            {/* Add/Edit Product Modal */}
            {showAddProduct && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-4xl border-amber-200/60 rounded-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-amber-200/60 flex items-center justify-between">
                            <h2 className="text-2xl font-[600] text-black">
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={closeProductModal}
                                className="hover:bg-amber-50"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <form onSubmit={handleSubmitProduct} className="overflow-y-auto flex-1 p-6">
                            {/* Error/Success Messages */}
                            {formError && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                                    <AlertCircle className="h-4 w-4" />
                                    {formError}
                                </div>
                            )}
                            {formSuccess && (
                                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                                    <Check className="h-4 w-4" />
                                    {formSuccess}
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    {/* Basic Info */}
                                    <div className="space-y-4">
                                        <h3 className="font-[600] text-black border-b border-amber-200/60 pb-2">Basic Information</h3>

                                        <div>
                                            <label className="block text-sm font-medium text-black/70 mb-1">Product Name *</label>
                                            <input
                                                type="text"
                                                value={productForm.name}
                                                onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                                                className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                                placeholder="Enter product name"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-black/70 mb-1">Category *</label>
                                                <select
                                                    value={productForm.category}
                                                    onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                                                    className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                                >
                                                    <option value="Sunglasses">Sunglasses</option>
                                                    <option value="Eyeglasses">Eyeglasses</option>
                                                    <option value="Computer Glasses">Computer Glasses</option>
                                                    <option value="Sports Glasses">Sports Glasses</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-black/70 mb-1">Base Price (₹) *</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={productForm.price}
                                                    onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                                                    className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={productForm.inStock}
                                                    onChange={(e) => setProductForm(prev => ({ ...prev, inStock: e.target.checked }))}
                                                    className="w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
                                                />
                                                <span className="text-sm font-medium text-black/70">In Stock</span>
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <label className="text-sm font-medium text-black/70">Stock Qty:</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={productForm.stock}
                                                    onChange={(e) => setProductForm(prev => ({
                                                        ...prev,
                                                        stock: e.target.value,
                                                        inStock: Number(e.target.value) > 0
                                                    }))}
                                                    className="w-24 px-3 py-1 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-black/70 mb-1">Short Description *</label>
                                            <textarea
                                                value={productForm.description}
                                                onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                                                rows={2}
                                                className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                                                placeholder="Brief product description"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-black/70 mb-1">Detailed Description</label>
                                            <textarea
                                                value={productForm.detailedDescription}
                                                onChange={(e) => setProductForm(prev => ({ ...prev, detailedDescription: e.target.value }))}
                                                rows={3}
                                                className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                                                placeholder="Detailed product description"
                                            />
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-[600] text-black">Features</h3>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleAddFeature}
                                                className="border-amber-200 hover:border-amber-400"
                                            >
                                                <Plus className="h-3 w-3 mr-1" />
                                                Add
                                            </Button>
                                        </div>
                                        {productForm.features.map((feature, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={feature}
                                                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                                                    className="flex-1 px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                                    placeholder="Feature description"
                                                />
                                                {productForm.features.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleRemoveFeature(index)}
                                                        className="border-red-200 hover:border-red-400 text-red-600"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Colors */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-[600] text-black">Color Variants (Price & Quantity per Color)</h3>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleAddColor}
                                                className="border-amber-200 hover:border-amber-400"
                                            >
                                                <Plus className="h-3 w-3 mr-1" />
                                                Add
                                            </Button>
                                        </div>
                                        {productForm.colors.map((color, index) => (
                                            <div key={index} className="p-3 bg-amber-50/50 rounded-lg border border-amber-200/60 space-y-2">
                                                <div className="flex gap-2 items-center">
                                                    <input
                                                        type="text"
                                                        value={color.name}
                                                        onChange={(e) => handleColorChange(index, 'name', e.target.value)}
                                                        className="flex-1 px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                                        placeholder="Color name"
                                                    />
                                                    <input
                                                        type="color"
                                                        value={color.value}
                                                        onChange={(e) => handleColorChange(index, 'value', e.target.value)}
                                                        className="w-10 h-10 border border-amber-200 rounded-lg cursor-pointer"
                                                    />
                                                    {productForm.colors.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleRemoveColor(index)}
                                                            className="border-red-200 hover:border-red-400 text-red-600"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="block text-xs text-black/60 mb-1">Price (₹)</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={color.price}
                                                            onChange={(e) => handleColorChange(index, 'price', e.target.value)}
                                                            className="w-full px-3 py-1.5 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                                                            placeholder="Price for this color"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-black/60 mb-1">Quantity</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={color.quantity}
                                                            onChange={(e) => handleColorChange(index, 'quantity', e.target.value)}
                                                            className="w-full px-3 py-1.5 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                                                            placeholder="Stock quantity"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    {/* Images Section */}
                                    <div className="space-y-4">
                                        <h3 className="font-[600] text-black border-b border-amber-200/60 pb-2">
                                            <div className="flex items-center gap-2">
                                                <Image className="h-4 w-4" />
                                                Product Images
                                            </div>
                                        </h3>

                                        <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-200/60">
                                            <p className="text-sm text-black/60 mb-3">
                                                <strong>How to add images:</strong> Upload your images to Google Drive,
                                                make them public (Anyone with the link), and paste the share link below.
                                            </p>

                                            {/* Main Image */}
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-black/70 mb-1">
                                                    Main Image URL *
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={productForm.image}
                                                        onChange={(e) => setProductForm(prev => ({ ...prev, image: e.target.value }))}
                                                        className="flex-1 px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                                        placeholder="Paste Google Drive or image URL"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => setProductForm(prev => ({ ...prev, image: convertGoogleDriveLink(prev.image) }))}
                                                        className="border-amber-200 hover:border-amber-400"
                                                    >
                                                        <Link className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Main Image Preview */}
                                            {productForm.image && (
                                                <div className="mb-4">
                                                    <p className="text-sm font-medium text-black/70 mb-2">Main Image Preview:</p>
                                                    <div className="w-32 h-24 bg-white rounded-lg border border-amber-200 overflow-hidden">
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
                                                <label className="block text-sm font-medium text-black/70 mb-1">
                                                    Additional Images
                                                </label>
                                                <div className="flex gap-2 mb-3">
                                                    <input
                                                        type="text"
                                                        value={newImageUrl}
                                                        onChange={(e) => setNewImageUrl(e.target.value)}
                                                        className="flex-1 px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                                        placeholder="Paste image URL and click Add"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault()
                                                                handleAddImageUrl()
                                                            }
                                                        }}
                                                    />
                                                    <Button
                                                        type="button"
                                                        onClick={handleAddImageUrl}
                                                        className="bg-amber-600 text-white hover:bg-amber-700"
                                                    >
                                                        <Plus className="h-4 w-4 mr-1" />
                                                        Add
                                                    </Button>
                                                </div>

                                                {/* Additional Images Grid */}
                                                {productForm.images.length > 0 && (
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {productForm.images.map((img, index) => (
                                                            <div key={index} className="relative group">
                                                                <div className="aspect-square bg-white rounded-lg border border-amber-200 overflow-hidden">
                                                                    <img
                                                                        src={img}
                                                                        alt={`Product ${index + 1}`}
                                                                        className="w-full h-full object-cover"
                                                                        onError={(e) => {
                                                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=Error'
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        onClick={() => handleSetMainImage(img)}
                                                                        className="bg-green-600 hover:bg-green-700 text-white p-1 h-7 w-7"
                                                                        title="Set as main image"
                                                                    >
                                                                        <Check className="h-3 w-3" />
                                                                    </Button>
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        onClick={() => handleRemoveImage(index)}
                                                                        className="bg-red-600 hover:bg-red-700 text-white p-1 h-7 w-7"
                                                                        title="Remove image"
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </Button>
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
                                        <h3 className="font-[600] text-black border-b border-amber-200/60 pb-2">Specifications</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-black/70 mb-1">Frame Width</label>
                                                <input
                                                    type="text"
                                                    value={productForm.specifications.frameWidth}
                                                    onChange={(e) => setProductForm(prev => ({
                                                        ...prev,
                                                        specifications: { ...prev.specifications, frameWidth: e.target.value }
                                                    }))}
                                                    className="w-full px-3 py-1.5 text-sm border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                                    placeholder="e.g., 140mm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-black/70 mb-1">Lens Width</label>
                                                <input
                                                    type="text"
                                                    value={productForm.specifications.lensWidth}
                                                    onChange={(e) => setProductForm(prev => ({
                                                        ...prev,
                                                        specifications: { ...prev.specifications, lensWidth: e.target.value }
                                                    }))}
                                                    className="w-full px-3 py-1.5 text-sm border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                                    placeholder="e.g., 52mm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-black/70 mb-1">Bridge Width</label>
                                                <input
                                                    type="text"
                                                    value={productForm.specifications.bridgeWidth}
                                                    onChange={(e) => setProductForm(prev => ({
                                                        ...prev,
                                                        specifications: { ...prev.specifications, bridgeWidth: e.target.value }
                                                    }))}
                                                    className="w-full px-3 py-1.5 text-sm border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                                    placeholder="e.g., 18mm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-black/70 mb-1">Temple Length</label>
                                                <input
                                                    type="text"
                                                    value={productForm.specifications.templeLength}
                                                    onChange={(e) => setProductForm(prev => ({
                                                        ...prev,
                                                        specifications: { ...prev.specifications, templeLength: e.target.value }
                                                    }))}
                                                    className="w-full px-3 py-1.5 text-sm border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                                    placeholder="e.g., 145mm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-black/70 mb-1">Material</label>
                                                <input
                                                    type="text"
                                                    value={productForm.specifications.material}
                                                    onChange={(e) => setProductForm(prev => ({
                                                        ...prev,
                                                        specifications: { ...prev.specifications, material: e.target.value }
                                                    }))}
                                                    className="w-full px-3 py-1.5 text-sm border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                                    placeholder="e.g., Titanium"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-black/70 mb-1">Weight</label>
                                                <input
                                                    type="text"
                                                    value={productForm.specifications.weight}
                                                    onChange={(e) => setProductForm(prev => ({
                                                        ...prev,
                                                        specifications: { ...prev.specifications, weight: e.target.value }
                                                    }))}
                                                    className="w-full px-3 py-1.5 text-sm border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                                    placeholder="e.g., 25g"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-black/70 mb-1">Lens Type</label>
                                                <input
                                                    type="text"
                                                    value={productForm.specifications.lensType}
                                                    onChange={(e) => setProductForm(prev => ({
                                                        ...prev,
                                                        specifications: { ...prev.specifications, lensType: e.target.value }
                                                    }))}
                                                    className="w-full px-3 py-1.5 text-sm border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                                    placeholder="e.g., Polarized"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-black/70 mb-1">UV Protection</label>
                                                <input
                                                    type="text"
                                                    value={productForm.specifications.uvProtection}
                                                    onChange={(e) => setProductForm(prev => ({
                                                        ...prev,
                                                        specifications: { ...prev.specifications, uvProtection: e.target.value }
                                                    }))}
                                                    className="w-full px-3 py-1.5 text-sm border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                                    placeholder="e.g., UV400"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-amber-200/60">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeProductModal}
                                    className="border-amber-200 hover:border-amber-400"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 min-w-[120px]"
                                >
                                    {saving ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Saving...
                                        </span>
                                    ) : (
                                        editingProduct ? 'Update Product' : 'Add Product'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* User Details Modal */}
            {showUserModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl border-amber-200/60 rounded-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-amber-200/60 flex items-center justify-between">
                            <h2 className="text-2xl font-[600] text-black">User Details</h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowUserModal(false)}
                                className="hover:bg-amber-50"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="overflow-y-auto flex-1 p-6">
                            <div className="space-y-6">
                                {/* User Avatar & Basic Info */}
                                <div className="flex items-center gap-4 pb-6 border-b border-amber-200/60">
                                    <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                                        {selectedUser.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-[600] text-black">{selectedUser.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            {selectedUser.isVerified ? (
                                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1">
                                                    <UserCheck className="h-3 w-3" />
                                                    Verified
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1">
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
                                            <label className="block text-sm font-medium text-black/70 mb-1">Name</label>
                                            <input
                                                type="text"
                                                value={userForm.name}
                                                onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                                                className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-black/70 mb-1">Email</label>
                                            <input
                                                type="email"
                                                value={userForm.email}
                                                onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                                                className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-black/70 mb-1">Phone</label>
                                            <input
                                                type="tel"
                                                value={userForm.phone}
                                                onChange={(e) => setUserForm(prev => ({ ...prev, phone: e.target.value }))}
                                                className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-3 bg-amber-50/50 rounded-lg">
                                            <Mail className="h-5 w-5 text-amber-600" />
                                            <div>
                                                <p className="text-xs text-black/60">Email</p>
                                                <p className="font-medium text-black">{selectedUser.email}</p>
                                            </div>
                                        </div>
                                        {selectedUser.phone && (
                                            <div className="flex items-center gap-3 p-3 bg-amber-50/50 rounded-lg">
                                                <Phone className="h-5 w-5 text-amber-600" />
                                                <div>
                                                    <p className="text-xs text-black/60">Phone</p>
                                                    <p className="font-medium text-black">{selectedUser.phone}</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3 p-3 bg-amber-50/50 rounded-lg">
                                            <Calendar className="h-5 w-5 text-amber-600" />
                                            <div>
                                                <p className="text-xs text-black/60">Joined</p>
                                                <p className="font-medium text-black">
                                                    {new Date(selectedUser.createdAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        {selectedUser.addresses && selectedUser.addresses.length > 0 && (
                                            <div className="p-3 bg-amber-50/50 rounded-lg">
                                                <p className="text-xs text-black/60 mb-2 flex items-center gap-1">
                                                    <MapPin className="h-4 w-4 text-amber-600" />
                                                    Saved Addresses ({selectedUser.addresses.length})
                                                </p>
                                                <div className="space-y-2">
                                                    {selectedUser.addresses.map((addr, index) => (
                                                        <div key={index} className="text-sm text-black/80 pl-5">
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

                        <div className="p-6 border-t border-amber-200/60 flex justify-between">
                            <Button
                                variant="outline"
                                onClick={() => handleDeleteUser(selectedUser._id)}
                                className="border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete User
                            </Button>
                            <div className="flex gap-2">
                                {editingUser ? (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setEditingUser(false)
                                                setUserForm({ name: selectedUser.name, email: selectedUser.email, phone: selectedUser.phone || '' })
                                            }}
                                            className="border-amber-200 hover:border-amber-400"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleEditUser}
                                            className="bg-amber-600 hover:bg-amber-700 text-white"
                                        >
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Changes
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        onClick={() => setEditingUser(true)}
                                        className="bg-amber-600 hover:bg-amber-700 text-white"
                                    >
                                        <Edit2 className="h-4 w-4 mr-2" />
                                        Edit User
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Order Details Modal */}
            {showOrderDetailsModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto border-amber-200/60 rounded-2xl">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-[600] text-black">Order Details</h2>
                                <Button
                                    onClick={() => setShowOrderDetailsModal(false)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-black/60 hover:text-black"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            {/* Order Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="p-4 bg-amber-50 rounded-lg">
                                    <p className="text-sm text-black/60 mb-1">Order ID</p>
                                    <p className="font-mono text-sm text-black">{selectedOrder._id}</p>
                                </div>
                                <div className="p-4 bg-amber-50 rounded-lg">
                                    <p className="text-sm text-black/60 mb-1">Order Date</p>
                                    <p className="font-medium text-black">
                                        {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <p className="text-sm text-black/60 mb-1">Total Amount</p>
                                    <p className="text-2xl font-[700] text-green-600">₹{selectedOrder.totalAmount.toFixed(2)}</p>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-black/60 mb-1">Payment Status</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-[600] ${selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                                        selectedOrder.paymentStatus === 'failed' ? 'bg-red-100 text-red-700' :
                                            selectedOrder.paymentStatus === 'refunded' ? 'bg-blue-100 text-blue-700' :
                                                'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {(selectedOrder.paymentStatus || 'pending').toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            {/* Customer Details */}
                            <div className="mb-6">
                                <h3 className="text-lg font-[600] text-black mb-3 flex items-center gap-2">
                                    <Users className="h-5 w-5 text-amber-600" />
                                    Customer Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-amber-50/50 rounded-lg">
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
                                <h3 className="text-lg font-[600] text-black mb-3 flex items-center gap-2">
                                    <Package className="h-5 w-5 text-amber-600" />
                                    Products ({selectedOrder.items.length})
                                </h3>
                                <div className="space-y-3">
                                    {selectedOrder.items.map((item, index: number) => {
                                        const product = item.product
                                        const imageUrl = item.productImage || product?.images?.[0];
                                        const processedImageUrl = imageUrl?.includes('drive.google.com')
                                            ? `https://drive.google.com/thumbnail?id=${imageUrl.match(/\/d\/([^/]+)/)?.[1] || imageUrl.match(/id=([^&]+)/)?.[1]}&sz=w200`
                                            : imageUrl;
                                        return (
                                            <div key={index} className="flex gap-4 p-4 bg-white border-2 border-amber-100 rounded-xl">
                                                <div className="w-24 h-24 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                    {processedImageUrl ? (
                                                        <img
                                                            src={processedImageUrl}
                                                            alt={item.productName || product?.name}
                                                            className="w-full h-full object-cover rounded-lg"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                                (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="flex items-center justify-center w-full h-full"><svg class="h-8 w-8 text-amber-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg></div>';
                                                            }}
                                                        />
                                                    ) : (
                                                        <Package className="h-8 w-8 text-amber-600" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-[600] text-black text-lg">{item.productName}</h4>
                                                    {product?.category && (
                                                        <p className="text-sm text-black/60 mt-1">Category: {product.category}</p>
                                                    )}
                                                    {product?.brand && (
                                                        <p className="text-sm text-black/60">Brand: {product.brand}</p>
                                                    )}
                                                    {item.selectedColor && (
                                                        <p className="text-sm text-black/60">Color: {item.selectedColor}</p>
                                                    )}
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <span className="text-sm text-black/60">
                                                            Quantity: <span className="font-[600] text-black">{item.quantity}</span>
                                                        </span>
                                                        <span className="text-sm text-black/60">
                                                            Price: <span className="font-[600] text-amber-600">₹{item.price.toFixed(2)}</span>
                                                        </span>
                                                        <span className="text-sm font-[600] text-black">
                                                            Subtotal: ₹{(item.price * item.quantity).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    {product?.description && (
                                                        <p className="text-sm text-black/60 mt-2 line-clamp-2">{product.description}</p>
                                                    )}

                                                    {/* Product Specifications */}
                                                    {product?.specifications && Object.keys(product.specifications).length > 0 && (
                                                        <div className="mt-3 p-3 bg-amber-50/50 rounded-lg border border-amber-200">
                                                            <h5 className="text-xs font-[600] text-amber-700 mb-2 uppercase">Specifications</h5>
                                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                                {product.specifications.frameWidth && (
                                                                    <div>
                                                                        <span className="text-black/60">Frame Width: </span>
                                                                        <span className="font-medium text-black">{product.specifications.frameWidth}</span>
                                                                    </div>
                                                                )}
                                                                {product.specifications.lensWidth && (
                                                                    <div>
                                                                        <span className="text-black/60">Lens Width: </span>
                                                                        <span className="font-medium text-black">{product.specifications.lensWidth}</span>
                                                                    </div>
                                                                )}
                                                                {product.specifications.bridgeWidth && (
                                                                    <div>
                                                                        <span className="text-black/60">Bridge: </span>
                                                                        <span className="font-medium text-black">{product.specifications.bridgeWidth}</span>
                                                                    </div>
                                                                )}
                                                                {product.specifications.templeLength && (
                                                                    <div>
                                                                        <span className="text-black/60">Temple: </span>
                                                                        <span className="font-medium text-black">{product.specifications.templeLength}</span>
                                                                    </div>
                                                                )}
                                                                {product.specifications.material && (
                                                                    <div>
                                                                        <span className="text-black/60">Material: </span>
                                                                        <span className="font-medium text-black">{product.specifications.material}</span>
                                                                    </div>
                                                                )}
                                                                {product.specifications.weight && (
                                                                    <div>
                                                                        <span className="text-black/60">Weight: </span>
                                                                        <span className="font-medium text-black">{product.specifications.weight}</span>
                                                                    </div>
                                                                )}
                                                                {product.specifications.lensType && (
                                                                    <div>
                                                                        <span className="text-black/60">Lens Type: </span>
                                                                        <span className="font-medium text-black">{product.specifications.lensType}</span>
                                                                    </div>
                                                                )}
                                                                {product.specifications.uvProtection && (
                                                                    <div>
                                                                        <span className="text-black/60">UV Protection: </span>
                                                                        <span className="font-medium text-black">{product.specifications.uvProtection}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Product Features */}
                                                    {product?.features && product.features.length > 0 && (
                                                        <div className="mt-2">
                                                            <h5 className="text-xs font-[600] text-black/70 mb-1">Features:</h5>
                                                            <ul className="text-xs text-black/60 space-y-1 ml-4">
                                                                {product.features.map((feature: string, idx: number) => (
                                                                    <li key={idx} className="list-disc">{feature}</li>
                                                                ))}
                                                            </ul>
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
                                    <h3 className="text-lg font-[600] text-black mb-3 flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-amber-600" />
                                        Shipping Address
                                    </h3>
                                    <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                                        {selectedOrder.shippingAddress.name && (
                                            <p className="font-[600] text-black mb-2">{selectedOrder.shippingAddress.name}</p>
                                        )}
                                        <p className="text-black/80">{selectedOrder.shippingAddress.street}</p>
                                        <p className="text-black/80">
                                            {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}
                                        </p>
                                        <p className="text-black/80">
                                            {selectedOrder.shippingAddress.country} - {selectedOrder.shippingAddress.zipCode}
                                        </p>
                                        {selectedOrder.shippingAddress.phone && (
                                            <p className="mt-2 pt-2 border-t border-blue-200 flex items-center gap-1 text-black/80">
                                                <Phone className="h-4 w-4" />
                                                {selectedOrder.shippingAddress.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Payment Details */}
                            <div>
                                <h3 className="text-lg font-[600] text-black mb-3 flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-amber-600" />
                                    Payment Information
                                </h3>
                                <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                                    {selectedOrder.paymentMethod && (
                                        <div className="flex justify-between mb-2">
                                            <span className="text-black/60">Payment Method:</span>
                                            <span className="font-[600] text-black">{selectedOrder.paymentMethod}</span>
                                        </div>
                                    )}
                                    {selectedOrder.paymentId && (
                                        <div className="flex justify-between mb-2">
                                            <span className="text-black/60">Payment ID:</span>
                                            <span className="font-mono text-xs text-black/70">{selectedOrder.paymentId}</span>
                                        </div>
                                    )}
                                    <div className="pt-3 border-t-2 border-green-200 flex justify-between items-center">
                                        <span className="text-lg font-[600] text-black">Total Amount:</span>
                                        <span className="text-3xl font-[700] text-green-600">₹{selectedOrder.totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Refund Information Section */}
                                {selectedOrder.refundStatus && selectedOrder.refundStatus !== 'not_applicable' && (
                                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                                        <h4 className="font-[600] text-black mb-3 flex items-center gap-2">
                                            <RefreshCw className="h-4 w-4 text-blue-600" />
                                            Refund Details
                                        </h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-black/60">Refund Status:</span>
                                                <span className={`font-[600] px-2 py-0.5 rounded-full text-sm ${selectedOrder.refundStatus === 'completed' ? 'bg-green-100 text-green-700' :
                                                        selectedOrder.refundStatus === 'processing' ? 'bg-amber-100 text-amber-700' :
                                                            selectedOrder.refundStatus === 'failed' ? 'bg-red-100 text-red-700' :
                                                                'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {selectedOrder.refundStatus.charAt(0).toUpperCase() + selectedOrder.refundStatus.slice(1)}
                                                </span>
                                            </div>
                                            {selectedOrder.refundAmount && (
                                                <div className="flex justify-between">
                                                    <span className="text-black/60">Refund Amount:</span>
                                                    <span className="font-[600] text-green-600">₹{selectedOrder.refundAmount.toFixed(2)}</span>
                                                </div>
                                            )}
                                            {selectedOrder.refundId && (
                                                <div className="flex justify-between">
                                                    <span className="text-black/60">Refund ID:</span>
                                                    <span className="font-mono text-xs text-black/70">{selectedOrder.refundId}</span>
                                                </div>
                                            )}
                                            {selectedOrder.refundInitiatedAt && (
                                                <div className="flex justify-between">
                                                    <span className="text-black/60">Initiated:</span>
                                                    <span className="text-sm text-black/70">
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
                                                    <span className="text-black/60">Completed:</span>
                                                    <span className="text-sm text-black/70">
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
                                                <div className="mt-2 pt-2 border-t border-blue-200">
                                                    <p className="text-xs text-black/60">{selectedOrder.refundNotes}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Status Update Confirmation Modal */}
            {showStatusModal?.isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all">
                        <div className="p-6">
                            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
                                <AlertCircle className="h-8 w-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-center text-black mb-2">Cancel Order & Initiate Refund?</h3>
                            <p className="text-black/70 text-center mb-4">
                                This order was paid via Razorpay. Cancelling it will automatically initiate a refund to the customer's original payment method.
                            </p>
                            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 mb-6">
                                <div className="flex items-center gap-2 text-amber-800 mb-2">
                                    <Clock className="h-5 w-5" />
                                    <span className="font-semibold">Refund Timeline</span>
                                </div>
                                <p className="text-sm text-amber-700">
                                    The refund will be processed within <strong>5-7 working days</strong> and credited back to the customer's account.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    onClick={() => setShowStatusModal(null)}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-black"
                                    disabled={statusUpdateLoading !== null}
                                >
                                    Keep Order
                                </Button>
                                <Button
                                    onClick={() => showStatusModal && handleUpdateOrderStatus(showStatusModal.orderId, showStatusModal.newStatus, true)}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                    disabled={statusUpdateLoading !== null}
                                >
                                    {statusUpdateLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                            Processing...
                                        </div>
                                    ) : (
                                        'Cancel & Refund'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
