import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Package,
    ShoppingBag,
    DollarSign,
    Users,
    Plus,
    Edit,
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
    Download
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
        quantity: number
        price: number
    }>
    totalAmount: number
    status: string
    paymentStatus?: string
    paymentMethod?: string
    paymentId?: string
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
    colors: { name: string; value: string }[]
    inStock: boolean
    rating: string
    reviews: string
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
    colors: [{ name: '', value: '#000000' }],
    inStock: true,
    rating: '0',
    reviews: '0'
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
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
        navigate('/admin')
    }

    const handleDeleteProduct = async (id: number | string) => {
        if (!confirm('Are you sure you want to delete this product?')) return

        const token = localStorage.getItem('adminToken')
        try {
            const response = await fetch(`${API_URL}/products/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            })
            if (response.ok) {
                fetchData()
            }
        } catch (error) {
            console.error('Error deleting product:', error)
        }
    }

    const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
        const token = localStorage.getItem('adminToken')
        try {
            const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            })
            if (response.ok) {
                fetchData()
            }
        } catch (error) {
            console.error('Error updating order:', error)
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

    // Change admin password
    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword) {
            alert('Please fill in both password fields')
            return
        }
        if (newPassword.length < 6) {
            alert('New password must be at least 6 characters')
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
                alert('Password changed successfully!')
                setCurrentPassword('')
                setNewPassword('')
                setShowChangePassword(false)
            } else {
                alert(data.message || 'Failed to change password')
            }
        } catch (error) {
            console.error('Error changing password:', error)
            alert('Error changing password')
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
            colors: product.colors?.length ? product.colors : [{ name: '', value: '#000000' }],
            inStock: product.inStock !== false,
            rating: String(product.rating || '0'),
            reviews: String(product.reviews || '0')
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
            colors: [...prev.colors, { name: '', value: '#000000' }]
        }))
    }

    const handleRemoveColor = (index: number) => {
        setProductForm(prev => ({
            ...prev,
            colors: prev.colors.filter((_, i) => i !== index)
        }))
    }

    const handleColorChange = (index: number, field: 'name' | 'value', value: string) => {
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
            colors: productForm.colors.filter(c => c.name.trim()),
            inStock: productForm.inStock,
            rating: Number(productForm.rating) || 0,
            reviews: Number(productForm.reviews) || 0
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
                await fetchData() // Wait for data to refresh
                setTimeout(() => {
                    closeProductModal()
                }, 1500)
            } else {
                setFormError(data.message || 'Failed to save product')
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
                                            <p className="text-3xl font-[600] text-black">${stats.totalRevenue.toFixed(2)}</p>
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
                                                <p className="font-[600] text-amber-600">${order.totalAmount}</p>
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
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-[600] text-black">Manage Products</h2>
                            <Button
                                onClick={openAddProductModal}
                                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Product
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product) => (
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
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-lg font-[600] text-amber-600">${product.price}</p>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.inStock !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {product.inStock !== false ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                        </div>
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
                    </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div>
                        <h2 className="text-2xl font-[600] text-black mb-6">Manage Orders</h2>
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <Card key={order._id} className="border-amber-200/60 rounded-2xl">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                    <h3 className="font-[600] text-black">{order.customerName}</h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                        order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                                            order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                                                                order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                                    'bg-orange-100 text-orange-700'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                                                        order.paymentStatus === 'failed' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {order.paymentStatus || 'pending'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-black/60 mb-1">{order.customerEmail}</p>
                                                {order.customerPhone && (
                                                    <p className="text-sm text-black/60 mb-2">{order.customerPhone}</p>
                                                )}
                                                <p className="text-sm text-black/60">
                                                    {order.items.length} items • ${order.totalAmount.toFixed(2)}
                                                </p>
                                                {order.shippingAddress && (
                                                    <p className="text-xs text-black/40 mt-2">
                                                        📍 {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}
                                                    </p>
                                                )}
                                                <p className="text-xs text-black/40 mt-1">
                                                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                                                    className="px-3 py-2 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="processing">Processing</option>
                                                    <option value="shipped">Shipped</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {orders.length === 0 && (
                                <div className="text-center py-12 text-black/40">
                                    <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No orders yet</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-4 flex justify-end">
                            <Button
                                onClick={() => exportToCSV('orders')}
                                className="bg-amber-600 hover:bg-amber-700 text-white"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export Orders
                            </Button>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-[600] text-black">Manage Users</h2>
                            <Button
                                onClick={() => exportToCSV('users')}
                                className="bg-amber-600 hover:bg-amber-700 text-white"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export Users
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {users.map((user) => (
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
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        {users.length === 0 && (
                            <div className="text-center py-12 text-black/40">
                                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No users found</p>
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
                                                <label className="block text-sm font-medium text-black/70 mb-1">Price ($) *</label>
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

                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-black/70 mb-1">Rating</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    max="5"
                                                    value={productForm.rating}
                                                    onChange={(e) => setProductForm(prev => ({ ...prev, rating: e.target.value }))}
                                                    className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-black/70 mb-1">Reviews</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={productForm.reviews}
                                                    onChange={(e) => setProductForm(prev => ({ ...prev, reviews: e.target.value }))}
                                                    className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={productForm.inStock}
                                                        onChange={(e) => setProductForm(prev => ({ ...prev, inStock: e.target.checked }))}
                                                        className="w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
                                                    />
                                                    <span className="text-sm font-medium text-black/70">In Stock</span>
                                                </label>
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
                                            <h3 className="font-[600] text-black">Colors</h3>
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
                                            <div key={index} className="flex gap-2 items-center">
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
        </div>
    )
}
