import { useState, useEffect } from 'react';
import {
    Package,
    Truck,
    MapPin,
    CheckCircle,
    Clock,
    AlertCircle,
    RefreshCw,
    ExternalLink,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { API_URL } from '@/config/api';

interface TrackingActivity {
    date: string;
    status: string;
    statusCode: string;
    activity: string;
    location: string;
}

interface TrackingData {
    awbCode: string;
    courierName: string;
    currentStatus: string;
    currentStatusId: number;
    estimatedDelivery: string | null;
    pickupDate: string | null;
    deliveredDate: string | null;
    activities: TrackingActivity[];
    trackUrl?: string;
}

interface ShiprocketData {
    orderId?: number;
    shipmentId?: number;
    awbCode?: string;
    courierName?: string;
    shipmentStatus?: string;
    estimatedDeliveryDate?: string;
    trackingHistory?: TrackingActivity[];
    lastTrackedAt?: string;
}

interface ShipmentTrackerProps {
    orderId: string;
    token: string;
    initialShiprocket?: ShiprocketData;
    orderStatus: string;
}

const ShipmentTracker = ({ orderId, token, initialShiprocket, orderStatus }: ShipmentTrackerProps) => {
    const [tracking, setTracking] = useState<TrackingData | null>(null);
    const [shiprocket, setShiprocket] = useState<ShiprocketData | null>(initialShiprocket || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState(false);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

    const fetchTracking = async () => {
        if (!orderId || !token) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/shiprocket/track/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();

            if (response.ok) {
                setTracking(data.tracking);
                setShiprocket(data.shiprocket);
                setLastRefresh(new Date());
            } else {
                setError(data.message || 'Failed to fetch tracking');
            }
        } catch (err) {
            setError('Failed to fetch tracking information');
            console.error('Tracking fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Only fetch if order is shipped or beyond
        if (['shipped', 'delivered'].includes(orderStatus) || shiprocket?.awbCode) {
            fetchTracking();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId, token, orderStatus]);

    const getStatusIcon = (status: string) => {
        const statusLower = status?.toLowerCase() || '';

        if (statusLower.includes('delivered')) {
            return <CheckCircle className="h-5 w-5 text-green-500" />;
        }
        if (statusLower.includes('out for delivery')) {
            return <Truck className="h-5 w-5 text-blue-500" />;
        }
        if (statusLower.includes('transit') || statusLower.includes('shipped')) {
            return <Truck className="h-5 w-5 text-amber-500" />;
        }
        if (statusLower.includes('picked')) {
            return <Package className="h-5 w-5 text-purple-500" />;
        }
        if (statusLower.includes('cancel') || statusLower.includes('rto')) {
            return <AlertCircle className="h-5 w-5 text-red-500" />;
        }
        return <Clock className="h-5 w-5 text-gray-500" />;
    };

    const getStatusColor = (status: string) => {
        const statusLower = status?.toLowerCase() || '';

        if (statusLower.includes('delivered')) {
            return 'bg-green-100 text-green-700 border-green-200';
        }
        if (statusLower.includes('out for delivery')) {
            return 'bg-blue-100 text-blue-700 border-blue-200';
        }
        if (statusLower.includes('transit') || statusLower.includes('shipped')) {
            return 'bg-amber-100 text-amber-700 border-amber-200';
        }
        if (statusLower.includes('cancel') || statusLower.includes('rto')) {
            return 'bg-red-100 text-red-700 border-red-200';
        }
        return 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // If no shipment created yet
    if (!shiprocket?.orderId && !['shipped', 'delivered'].includes(orderStatus)) {
        return (
            <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <div className="flex items-center gap-2 text-gray-600">
                    <Package className="h-5 w-5" />
                    <span className="text-sm">Shipment will be created once order is processed</span>
                </div>
            </div>
        );
    }

    // If shipment created but no AWB yet
    if (shiprocket?.orderId && !shiprocket?.awbCode) {
        return (
            <div className="bg-amber-50 rounded-lg p-4 mt-4 border border-amber-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-700">
                        <Clock className="h-5 w-5" />
                        <span className="text-sm font-medium">Shipment being prepared</span>
                    </div>
                    <span className="text-xs text-amber-600">
                        Order #{shiprocket.orderId}
                    </span>
                </div>
                <p className="text-xs text-amber-600 mt-2">
                    Tracking information will be available once the shipment is dispatched
                </p>
            </div>
        );
    }

    return (
        <Card className="mt-4 border-amber-200/60 overflow-hidden">
            <CardContent className="p-0">
                {/* Header */}
                <div
                    className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 cursor-pointer"
                    onClick={() => setExpanded(!expanded)}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Truck className="h-5 w-5 text-amber-600" />
                            <div>
                                <h4 className="font-semibold text-black">Shipment Tracking</h4>
                                {shiprocket?.courierName && (
                                    <p className="text-xs text-black/60">
                                        via {shiprocket.courierName}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {tracking?.currentStatus && (
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(tracking.currentStatus)}`}>
                                    {tracking.currentStatus}
                                </span>
                            )}
                            {expanded ? (
                                <ChevronUp className="h-5 w-5 text-gray-400" />
                            ) : (
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                        </div>
                    </div>

                    {/* AWB and Quick Info */}
                    <div className="mt-3 flex flex-wrap gap-4 text-sm">
                        {shiprocket?.awbCode && (
                            <div className="flex items-center gap-1 text-black/70">
                                <span className="font-medium">AWB:</span>
                                <span className="font-mono">{shiprocket.awbCode}</span>
                            </div>
                        )}
                        {tracking?.estimatedDelivery && (
                            <div className="flex items-center gap-1 text-black/70">
                                <span className="font-medium">Expected:</span>
                                <span>{formatDate(tracking.estimatedDelivery)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Expanded Content */}
                {expanded && (
                    <div className="p-4 border-t border-amber-100">
                        {/* Refresh Button */}
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs text-gray-500">
                                {lastRefresh && `Last updated: ${formatDate(lastRefresh.toISOString())}`}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchTracking}
                                disabled={loading}
                                className="text-amber-600 border-amber-300 hover:bg-amber-50"
                            >
                                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4">
                                {error}
                            </div>
                        )}

                        {/* Tracking Timeline */}
                        {tracking?.activities && tracking.activities.length > 0 ? (
                            <div className="space-y-0">
                                <h5 className="font-medium text-black mb-3">Tracking History</h5>
                                <div className="relative">
                                    {tracking.activities.slice(0, 10).map((activity, index) => (
                                        <div
                                            key={index}
                                            className="flex gap-3 pb-4 relative"
                                        >
                                            {/* Timeline line */}
                                            {index < tracking.activities.length - 1 && (
                                                <div className="absolute left-[9px] top-6 w-0.5 h-full bg-amber-200" />
                                            )}

                                            {/* Status icon */}
                                            <div className="relative z-10 flex-shrink-0">
                                                {getStatusIcon(activity.status || activity.activity)}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap justify-between gap-2">
                                                    <p className="font-medium text-sm text-black">
                                                        {activity.status || activity.activity}
                                                    </p>
                                                    <span className="text-xs text-gray-500">
                                                        {formatDate(activity.date)}
                                                    </span>
                                                </div>
                                                {activity.activity && activity.activity !== activity.status && (
                                                    <p className="text-xs text-black/60 mt-0.5">
                                                        {activity.activity}
                                                    </p>
                                                )}
                                                {activity.location && (
                                                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                                        <MapPin className="h-3 w-3" />
                                                        <span>{activity.location}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {tracking.activities.length > 10 && (
                                    <p className="text-xs text-gray-500 text-center pt-2">
                                        + {tracking.activities.length - 10} more updates
                                    </p>
                                )}
                            </div>
                        ) : shiprocket?.trackingHistory && shiprocket.trackingHistory.length > 0 ? (
                            <div className="space-y-0">
                                <h5 className="font-medium text-black mb-3">Tracking History</h5>
                                <div className="relative">
                                    {shiprocket.trackingHistory.slice(0, 10).map((activity, index) => (
                                        <div
                                            key={index}
                                            className="flex gap-3 pb-4 relative"
                                        >
                                            {index < shiprocket.trackingHistory!.length - 1 && (
                                                <div className="absolute left-[9px] top-6 w-0.5 h-full bg-amber-200" />
                                            )}
                                            <div className="relative z-10 flex-shrink-0">
                                                {getStatusIcon(activity.status)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap justify-between gap-2">
                                                    <p className="font-medium text-sm text-black">
                                                        {activity.status}
                                                    </p>
                                                    <span className="text-xs text-gray-500">
                                                        {formatDate(activity.date)}
                                                    </span>
                                                </div>
                                                {activity.activity && (
                                                    <p className="text-xs text-black/60 mt-0.5">
                                                        {activity.activity}
                                                    </p>
                                                )}
                                                {activity.location && (
                                                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                                        <MapPin className="h-3 w-3" />
                                                        <span>{activity.location}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 text-gray-500">
                                <Truck className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm">No tracking updates available yet</p>
                                <p className="text-xs mt-1">Check back later for updates</p>
                            </div>
                        )}

                        {/* External tracking link */}
                        {tracking?.trackUrl && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <a
                                    href={tracking.trackUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700"
                                >
                                    Track on courier website
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ShipmentTracker;
