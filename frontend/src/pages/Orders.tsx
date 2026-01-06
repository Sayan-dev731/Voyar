import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Package,
    ArrowLeft,
    ChevronDown,
    ChevronUp,
    Truck,
    CheckCircle,
    Clock,
    XCircle,
    MapPin,
    CreditCard,
    ShoppingBag,
    Trash2,
    Ban,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/config/api';
import { ConfirmationModal, Toast } from '@/components/ui/ConfirmationModal';

interface OrderItem {
    product: string;
    productName: string;
    productImage: string;
    quantity: number;
    price: number;
    selectedColor?: string;
}

interface Order {
    _id: string;
    items: OrderItem[];
    totalAmount: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'confirmed';
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    paymentMethod: string;
    paymentId?: string;
    refundStatus?: 'not_applicable' | 'pending' | 'processing' | 'completed' | 'failed';
    refundId?: string;
    refundAmount?: number;
    refundInitiatedAt?: string;
    refundNotes?: string;
    shippingAddress: {
        name: string;
        phone: string;
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    createdAt: string;
    updatedAt: string;
}

// Helper function to convert Google Drive link
const convertGoogleDriveLink = (url: string): string => {
    if (!url) return '/placeholder-image.jpg';
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

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'delivered':
            return <CheckCircle className="h-5 w-5 text-green-600" />;
        case 'shipped':
            return <Truck className="h-5 w-5 text-blue-600" />;
        case 'processing':
            return <Clock className="h-5 w-5 text-amber-600" />;
        case 'cancelled':
            return <XCircle className="h-5 w-5 text-red-600" />;
        default:
            return <Package className="h-5 w-5 text-gray-600" />;
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'delivered':
            return 'bg-green-100 text-green-700 border-green-200';
        case 'shipped':
            return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'processing':
            return 'bg-amber-100 text-amber-700 border-amber-200';
        case 'cancelled':
            return 'bg-red-100 text-red-700 border-red-200';
        default:
            return 'bg-gray-100 text-gray-700 border-gray-200';
    }
};

const getPaymentStatusColor = (status: string) => {
    switch (status) {
        case 'paid':
            return 'bg-green-100 text-green-700';
        case 'failed':
            return 'bg-red-100 text-red-700';
        case 'refunded':
            return 'bg-blue-100 text-blue-700';
        default:
            return 'bg-yellow-100 text-yellow-700';
    }
};

// Helper function for refund status badge
const getRefundStatusBadge = (refundStatus?: string) => {
    switch (refundStatus) {
        case 'processing':
            return { color: 'bg-amber-100 text-amber-700 border-amber-200', text: 'Refund Processing' };
        case 'completed':
            return { color: 'bg-green-100 text-green-700 border-green-200', text: 'Refund Completed' };
        case 'failed':
            return { color: 'bg-red-100 text-red-700 border-red-200', text: 'Refund Failed' };
        case 'pending':
            return { color: 'bg-blue-100 text-blue-700 border-blue-200', text: 'Refund Pending' };
        default:
            return null;
    }
};

export default function Orders() {
    const navigate = useNavigate();
    const { token, isAuthenticated } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    // Modal states
    const [cancelModal, setCancelModal] = useState<{ isOpen: boolean; orderId: string | null }>({
        isOpen: false,
        orderId: null
    });
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; orderId: string | null }>({
        isOpen: false,
        orderId: null
    });
    const [actionLoading, setActionLoading] = useState(false);

    // Toast state
    const [toast, setToast] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
        isOpen: false,
        message: '',
        type: 'success'
    });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/orders' } });
            return;
        }

        const fetchOrders = async () => {
            try {
                const response = await fetch(`${API_URL}/orders/my-orders`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                if (response.ok) {
                    setOrders(data);
                }
            } catch (error) {
                console.error('Failed to fetch orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [isAuthenticated, navigate, token]);

    const toggleOrderExpand = (orderId: string) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    // Cancel order handler
    const handleCancelOrder = async () => {
        if (!cancelModal.orderId) return;
        setActionLoading(true);

        try {
            const response = await fetch(`${API_URL}/orders/${cancelModal.orderId}/cancel`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();

            if (response.ok) {
                // Update order in state with refund info
                setOrders(orders.map(order =>
                    order._id === cancelModal.orderId
                        ? {
                            ...order,
                            status: 'cancelled' as const,
                            refundStatus: data.order?.refundStatus,
                            refundId: data.order?.refundId,
                            refundAmount: data.order?.refundAmount,
                            refundInitiatedAt: data.order?.refundInitiatedAt,
                            refundNotes: data.order?.refundNotes
                        }
                        : order
                ));

                // Show appropriate success message
                let successMessage = data.message || 'Order cancelled successfully';
                if (data.refundInfo?.success) {
                    successMessage = 'Order cancelled! Refund will be processed in 5-7 working days.';
                }

                setToast({
                    isOpen: true,
                    message: successMessage,
                    type: 'success'
                });
            } else {
                setToast({
                    isOpen: true,
                    message: data.message || 'Failed to cancel order',
                    type: 'error'
                });
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            setToast({
                isOpen: true,
                message: 'Failed to cancel order. Please try again.',
                type: 'error'
            });
        } finally {
            setActionLoading(false);
            setCancelModal({ isOpen: false, orderId: null });
        }
    };

    // Delete order handler (soft delete - removes from user view)
    const handleDeleteOrder = async () => {
        if (!deleteModal.orderId) return;
        setActionLoading(true);

        try {
            const response = await fetch(`${API_URL}/orders/${deleteModal.orderId}/user-delete`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();

            if (response.ok) {
                setOrders(orders.filter(order => order._id !== deleteModal.orderId));
                setToast({
                    isOpen: true,
                    message: 'Order removed from your history',
                    type: 'success'
                });
            } else {
                setToast({
                    isOpen: true,
                    message: data.message || 'Failed to delete order',
                    type: 'error'
                });
            }
        } catch (error) {
            console.error('Error deleting order:', error);
            setToast({
                isOpen: true,
                message: 'Failed to delete order. Please try again.',
                type: 'error'
            });
        } finally {
            setActionLoading(false);
            setDeleteModal({ isOpen: false, orderId: null });
        }
    };

    // Check if order can be cancelled (only pending, processing, or confirmed)
    const canCancelOrder = (status: string) => {
        return ['pending', 'processing', 'confirmed'].includes(status);
    };

    // Check if order can be deleted (only after delivered or cancelled)
    const canDeleteOrder = (status: string) => {
        return ['delivered', 'cancelled'].includes(status);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen pt-20 sm:pt-24 pb-16 bg-gradient-to-b from-white via-amber-50/30 to-white">
            <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/profile')}
                        className="mb-4 text-black/60 hover:text-amber-600 hover:bg-amber-50"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Profile
                    </Button>
                    <h1 className="text-4xl sm:text-5xl font-[600] text-black">My Orders</h1>
                    <p className="text-black/60 mt-2">Track and manage your orders</p>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-black/60">Loading your orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <Card className="border-amber-200/60 rounded-2xl">
                        <CardContent className="p-12 text-center">
                            <ShoppingBag className="h-16 w-16 text-amber-200 mx-auto mb-4" />
                            <h2 className="text-2xl font-[600] text-black mb-2">No Orders Yet</h2>
                            <p className="text-black/60 mb-6">
                                Looks like you haven't placed any orders yet.
                            </p>
                            <Button
                                onClick={() => navigate('/collections')}
                                className="bg-amber-600 text-white hover:bg-amber-700"
                            >
                                Start Shopping
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <Card
                                key={order._id}
                                className="border-amber-200/60 rounded-2xl overflow-hidden"
                            >
                                {/* Order Header - Always Visible */}
                                <div
                                    className="p-4 sm:p-6 cursor-pointer hover:bg-amber-50/50 transition-colors"
                                    onClick={() => toggleOrderExpand(order._id)}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                {getStatusIcon(order.status)}
                                                <span className="font-[600] text-black">
                                                    Order #{order._id.slice(-8).toUpperCase()}
                                                </span>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                                        order.status
                                                    )}`}
                                                >
                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                </span>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                                                        order.paymentStatus
                                                    )}`}
                                                >
                                                    {order.paymentStatus === 'paid' ? 'Paid' :
                                                        order.paymentStatus === 'refunded' ? 'Refunded' :
                                                            order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                                                </span>
                                                {/* Refund Status Badge */}
                                                {getRefundStatusBadge(order.refundStatus) && (
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRefundStatusBadge(order.refundStatus)?.color}`}>
                                                        {getRefundStatusBadge(order.refundStatus)?.text}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-black/60">
                                                Placed on {formatDate(order.createdAt)}
                                            </p>
                                            <p className="text-sm text-black/60 mt-1">
                                                {order.items.length} item{order.items.length > 1 ? 's' : ''} •{' '}
                                                <span className="font-medium text-amber-600">
                                                    ₹{order.totalAmount.toFixed(2)}
                                                </span>
                                            </p>
                                        </div>

                                        {/* Product Thumbnails */}
                                        <div className="flex items-center gap-2">
                                            <div className="flex -space-x-3">
                                                {order.items.slice(0, 3).map((item, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="w-12 h-12 rounded-lg border-2 border-white bg-amber-50 overflow-hidden shadow-sm"
                                                    >
                                                        <img
                                                            src={convertGoogleDriveLink(item.productImage)}
                                                            alt={item.productName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ))}
                                                {order.items.length > 3 && (
                                                    <div className="w-12 h-12 rounded-lg border-2 border-white bg-amber-100 flex items-center justify-center shadow-sm">
                                                        <span className="text-xs font-medium text-amber-700">
                                                            +{order.items.length - 3}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-2">
                                                {expandedOrder === order._id ? (
                                                    <ChevronUp className="h-5 w-5 text-black/40" />
                                                ) : (
                                                    <ChevronDown className="h-5 w-5 text-black/40" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Order Details */}
                                {expandedOrder === order._id && (
                                    <div className="border-t border-amber-200/60 bg-amber-50/30">
                                        {/* Order Items */}
                                        <div className="p-4 sm:p-6 border-b border-amber-200/60">
                                            <h3 className="font-[600] text-black mb-4">Order Items</h3>
                                            <div className="space-y-4">
                                                {order.items.map((item, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex gap-4 p-3 bg-white rounded-xl border border-amber-100"
                                                    >
                                                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-amber-50 flex-shrink-0">
                                                            <img
                                                                src={convertGoogleDriveLink(item.productImage)}
                                                                alt={item.productName}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-medium text-black truncate">
                                                                {item.productName}
                                                            </h4>
                                                            {item.selectedColor && (
                                                                <p className="text-sm text-black/60">
                                                                    Color: {item.selectedColor}
                                                                </p>
                                                            )}
                                                            <p className="text-sm text-black/60">
                                                                Qty: {item.quantity}
                                                            </p>
                                                            <p className="font-medium text-amber-600 mt-1">
                                                                ₹{(item.price * item.quantity).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Shipping & Payment Info */}
                                        <div className="p-4 sm:p-6 grid sm:grid-cols-2 gap-6">
                                            {/* Shipping Address */}
                                            <div>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <MapPin className="h-4 w-4 text-amber-600" />
                                                    <h3 className="font-[600] text-black">Shipping Address</h3>
                                                </div>
                                                <div className="bg-white p-4 rounded-xl border border-amber-100">
                                                    <p className="font-medium text-black">
                                                        {order.shippingAddress.name}
                                                    </p>
                                                    <p className="text-sm text-black/60 mt-1">
                                                        {order.shippingAddress.phone}
                                                    </p>
                                                    <p className="text-sm text-black/60 mt-2">
                                                        {order.shippingAddress.street}
                                                    </p>
                                                    <p className="text-sm text-black/60">
                                                        {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                                                        - {order.shippingAddress.zipCode}
                                                    </p>
                                                    <p className="text-sm text-black/60">
                                                        {order.shippingAddress.country}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Payment Info */}
                                            <div>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <CreditCard className="h-4 w-4 text-amber-600" />
                                                    <h3 className="font-[600] text-black">Payment Details</h3>
                                                </div>
                                                <div className="bg-white p-4 rounded-xl border border-amber-100 space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-black/60">Method</span>
                                                        <span className="text-sm font-medium text-black capitalize">
                                                            {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-black/60">Status</span>
                                                        <span
                                                            className={`text-sm font-medium capitalize ${order.paymentStatus === 'paid'
                                                                ? 'text-green-600'
                                                                : order.paymentStatus === 'failed'
                                                                    ? 'text-red-600'
                                                                    : 'text-yellow-600'
                                                                }`}
                                                        >
                                                            {order.paymentStatus}
                                                        </span>
                                                    </div>
                                                    {order.paymentId && (
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-black/60">
                                                                Transaction ID
                                                            </span>
                                                            <span className="text-sm font-mono text-black/70">
                                                                {order.paymentId.slice(0, 15)}...
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="border-t border-amber-100 pt-2 mt-2">
                                                        <div className="flex justify-between">
                                                            <span className="font-medium text-black">Total</span>
                                                            <span className="font-[600] text-amber-600">
                                                                ₹{order.totalAmount.toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Refund Information */}
                                                    {order.refundStatus && order.refundStatus !== 'not_applicable' && (
                                                        <div className="border-t border-amber-100 pt-3 mt-3">
                                                            <h4 className="text-sm font-semibold text-black mb-2">Refund Information</h4>
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between">
                                                                    <span className="text-sm text-black/60">Refund Status</span>
                                                                    <span className={`text-sm font-medium capitalize ${order.refundStatus === 'completed' ? 'text-green-600' :
                                                                            order.refundStatus === 'processing' ? 'text-amber-600' :
                                                                                order.refundStatus === 'failed' ? 'text-red-600' :
                                                                                    'text-blue-600'
                                                                        }`}>
                                                                        {order.refundStatus}
                                                                    </span>
                                                                </div>
                                                                {order.refundAmount && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-sm text-black/60">Refund Amount</span>
                                                                        <span className="text-sm font-medium text-green-600">₹{order.refundAmount.toFixed(2)}</span>
                                                                    </div>
                                                                )}
                                                                {order.refundId && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-sm text-black/60">Refund ID</span>
                                                                        <span className="text-sm font-mono text-black/70">{order.refundId.slice(0, 15)}...</span>
                                                                    </div>
                                                                )}
                                                                {order.refundStatus === 'processing' && (
                                                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
                                                                        <p className="text-xs text-amber-800">
                                                                            <Clock className="h-3 w-3 inline mr-1" />
                                                                            Your refund is being processed. It will be credited to your original payment method within 5-7 working days.
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                {order.refundStatus === 'completed' && (
                                                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                                                                        <p className="text-xs text-green-800">
                                                                            <CheckCircle className="h-3 w-3 inline mr-1" />
                                                                            Refund has been successfully credited to your account.
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Timeline */}
                                        <div className="p-4 sm:p-6 border-t border-amber-200/60">
                                            <h3 className="font-[600] text-black mb-4">Order Timeline</h3>
                                            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                                                {['pending', 'processing', 'shipped', 'delivered'].map(
                                                    (status, idx) => {
                                                        const statusOrder = [
                                                            'pending',
                                                            'processing',
                                                            'shipped',
                                                            'delivered',
                                                        ];
                                                        const currentIdx = statusOrder.indexOf(order.status);
                                                        const isCompleted =
                                                            order.status !== 'cancelled' && idx <= currentIdx;
                                                        const isCurrent =
                                                            order.status !== 'cancelled' && idx === currentIdx;

                                                        return (
                                                            <div key={status} className="flex items-center">
                                                                <div
                                                                    className={`flex flex-col items-center ${idx > 0 ? 'ml-2' : ''
                                                                        }`}
                                                                >
                                                                    <div
                                                                        className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted
                                                                            ? 'bg-amber-600 text-white'
                                                                            : 'bg-gray-200 text-gray-400'
                                                                            } ${isCurrent ? 'ring-4 ring-amber-200' : ''}`}
                                                                    >
                                                                        {isCompleted ? (
                                                                            <CheckCircle className="h-4 w-4" />
                                                                        ) : (
                                                                            <span className="text-xs">{idx + 1}</span>
                                                                        )}
                                                                    </div>
                                                                    <span
                                                                        className={`text-xs mt-1 capitalize whitespace-nowrap ${isCompleted
                                                                            ? 'text-amber-600 font-medium'
                                                                            : 'text-gray-400'
                                                                            }`}
                                                                    >
                                                                        {status}
                                                                    </span>
                                                                </div>
                                                                {idx < 3 && (
                                                                    <div
                                                                        className={`w-12 h-1 mx-1 rounded ${isCompleted && idx < currentIdx
                                                                            ? 'bg-amber-600'
                                                                            : 'bg-gray-200'
                                                                            }`}
                                                                    />
                                                                )}
                                                            </div>
                                                        );
                                                    }
                                                )}
                                                {order.status === 'cancelled' && (
                                                    <div className="flex items-center ml-4">
                                                        <div className="flex flex-col items-center">
                                                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-600 text-white">
                                                                <XCircle className="h-4 w-4" />
                                                            </div>
                                                            <span className="text-xs mt-1 text-red-600 font-medium">
                                                                Cancelled
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Order Actions */}
                                        <div className="p-4 sm:p-6 border-t border-amber-200/60 flex flex-wrap gap-3">
                                            <Button
                                                variant="outline"
                                                className="border-amber-200 hover:border-amber-400 hover:bg-amber-50"
                                                onClick={() => navigate('/collections')}
                                            >
                                                Buy Again
                                            </Button>
                                            {order.status === 'delivered' && (
                                                <Button
                                                    variant="outline"
                                                    className="border-amber-200 hover:border-amber-400 hover:bg-amber-50"
                                                >
                                                    Write a Review
                                                </Button>
                                            )}

                                            {/* Cancel Order - Only for pending/processing */}
                                            {canCancelOrder(order.status) && (
                                                <Button
                                                    variant="outline"
                                                    className="border-orange-200 hover:border-orange-400 hover:bg-orange-50 text-orange-600"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setCancelModal({ isOpen: true, orderId: order._id });
                                                    }}
                                                >
                                                    <Ban className="mr-2 h-4 w-4" />
                                                    Cancel Order
                                                </Button>
                                            )}

                                            {/* Delete Order - Only for delivered/cancelled */}
                                            {canDeleteOrder(order.status) && (
                                                <Button
                                                    variant="outline"
                                                    className="border-red-200 hover:border-red-400 hover:bg-red-50 text-red-600"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeleteModal({ isOpen: true, orderId: order._id });
                                                    }}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Remove from History
                                                </Button>
                                            )}

                                            {/* Info text for shipped orders */}
                                            {order.status === 'shipped' && (
                                                <p className="text-xs text-blue-600 w-full mt-2 flex items-center gap-1">
                                                    <Truck className="h-3 w-3" />
                                                    Order is on the way! You can remove it from history after delivery.
                                                </p>
                                            )}

                                            <p className="text-xs text-black/40 w-full mt-2">
                                                Last updated: {formatDateTime(order.updatedAt)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Cancel Order Confirmation Modal */}
            <ConfirmationModal
                isOpen={cancelModal.isOpen}
                onClose={() => setCancelModal({ isOpen: false, orderId: null })}
                onConfirm={handleCancelOrder}
                title="Cancel Order?"
                message={
                    cancelModal.orderId && orders.find(o => o._id === cancelModal.orderId)?.paymentMethod === 'razorpay' && orders.find(o => o._id === cancelModal.orderId)?.paymentStatus === 'paid'
                        ? "Are you sure you want to cancel this order? A refund will be automatically initiated and processed within 5-7 working days to your original payment method."
                        : "Are you sure you want to cancel this order? This action cannot be undone."
                }
                confirmText="Yes, Cancel Order"
                cancelText="Keep Order"
                type="warning"
                loading={actionLoading}
            />

            {/* Delete Order Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, orderId: null })}
                onConfirm={handleDeleteOrder}
                title="Remove from History?"
                message="This order will be removed from your order history. You won't be able to see it anymore, but the order record will be kept in our system."
                confirmText="Yes, Remove"
                cancelText="Keep in History"
                type="danger"
                loading={actionLoading}
            />

            {/* Toast Notification */}
            <Toast
                isOpen={toast.isOpen}
                onClose={() => setToast({ ...toast, isOpen: false })}
                message={toast.message}
                type={toast.type}
            />
        </div>
    );
}
