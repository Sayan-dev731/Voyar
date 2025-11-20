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
    Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Product } from '@/types/product'
import { API_URL } from '@/config/api'

interface Order {
    _id: string
    customerName: string
    customerEmail: string
    items: Array<{
        productName: string
        quantity: number
        price: number
    }>
    totalAmount: number
    status: string
    createdAt: string
}

interface Stats {
    totalOrders: number
    pendingOrders: number
    completedOrders: number
    totalRevenue: number
}

export const AdminDashboard = () => {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders'>('overview')
    const [products, setProducts] = useState<Product[]>([])
    const [orders, setOrders] = useState<Order[]>([])
    const [stats, setStats] = useState<Stats>({
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalRevenue: 0
    })
    const [loading, setLoading] = useState(true)
    const [showAddProduct, setShowAddProduct] = useState(false)

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
                                onClick={() => setShowAddProduct(true)}
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
                                            />
                                        </div>
                                        <h3 className="font-[600] text-black mb-1">{product.name}</h3>
                                        <p className="text-sm text-black/60 mb-2">{product.category}</p>
                                        <p className="text-lg font-[600] text-amber-600 mb-4">${product.price}</p>
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
                                                onClick={() => alert('Edit functionality coming soon! For now, use the API directly.')}
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
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-[600] text-black">{order.customerName}</h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                        order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                                            order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                                                                'bg-orange-100 text-orange-700'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-black/60 mb-2">{order.customerEmail}</p>
                                                <p className="text-sm text-black/60">
                                                    {order.items.length} items • ${order.totalAmount}
                                                </p>
                                                <p className="text-xs text-black/40 mt-1">
                                                    {new Date(order.createdAt).toLocaleDateString()}
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
                        </div>
                    </div>
                )}
            </div>

            {/* Add Product Modal - Placeholder */}
            {showAddProduct && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl border-amber-200/60 rounded-2xl max-h-[90vh] overflow-y-auto">
                        <CardContent className="p-6">
                            <h2 className="text-2xl font-[600] text-black mb-4">Add New Product</h2>
                            <p className="text-black/60 mb-4">
                                Product form will be implemented here. For now, use the API directly or seed script.
                            </p>
                            <Button
                                onClick={() => setShowAddProduct(false)}
                                className="bg-amber-600 text-white hover:bg-amber-700"
                            >
                                Close
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
