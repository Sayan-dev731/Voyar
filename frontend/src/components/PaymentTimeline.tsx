import { useState, useEffect, useCallback } from 'react';
import {
    CheckCircle,
    Circle,
    CreditCard,
    RefreshCw,
    Clock,
    XCircle,
    ChevronDown,
    ChevronUp,
    Banknote,
    ArrowDownRight,
} from 'lucide-react';
import { API_URL } from '@/config/api';

interface TimelineEventDetails {
    paymentId?: string;
    refundId?: string;
    settlementId?: string;
    amount?: number;
    netAmount?: number;
    method?: string;
    bank?: string;
    vpa?: string;
    wallet?: string;
    cardLast4?: string;
    utr?: string;
    arn?: string;
    errorCode?: string;
    errorDescription?: string;
    status?: string;
}

interface TimelineEvent {
    event: string;
    title: string;
    description: string | null;
    timestamp: string;
    formattedTime: string;
    completed: boolean;
    details: TimelineEventDetails;
}

interface PaymentTimelineData {
    success: boolean;
    orderId: string;
    paymentId: string;
    razorpayOrderId: string;
    amount: number;
    paymentStatus: string;
    refundStatus: string;
    refundAmount?: number;
    refundId?: string;
    refundNotes?: string;
    timeline: TimelineEvent[];
    createdAt: string;
    syncedFromApi?: boolean;
}

interface PaymentTimelineProps {
    orderId: string;
    token: string;
    paymentStatus: string;
    refundStatus?: string;
    onStatusUpdate?: (newRefundStatus: string, newPaymentStatus: string) => void;
}

const getEventIcon = (event: string, completed: boolean) => {
    const baseClasses = "h-5 w-5";

    if (!completed) {
        return <Clock className={`${baseClasses} text-amber-500`} />;
    }

    switch (event) {
        case 'payment_created':
            return <CreditCard className={`${baseClasses} text-green-600`} />;
        case 'payment_authorized':
            return <CheckCircle className={`${baseClasses} text-green-600`} />;
        case 'payment_captured':
            return <CheckCircle className={`${baseClasses} text-green-600`} />;
        case 'payment_failed':
            return <XCircle className={`${baseClasses} text-red-600`} />;
        case 'settlement_processed':
            return <Banknote className={`${baseClasses} text-green-600`} />;
        case 'refund_created':
        case 'refund_processed':
            return <ArrowDownRight className={`${baseClasses} text-green-600`} />;
        case 'refund_failed':
            return <XCircle className={`${baseClasses} text-red-600`} />;
        default:
            return <Circle className={`${baseClasses} text-gray-400`} />;
    }
};

const getEventColor = (event: string, completed: boolean) => {
    if (!completed) {
        return 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20';
    }

    if (event.includes('failed')) {
        return 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20';
    }

    return 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20';
};

const getStatusLabel = (event: string, completed: boolean, details?: TimelineEventDetails) => {
    // For refund events, use the status from details if available
    if (event === 'refund_processed' || event === 'refund_created') {
        if (details?.status === 'Processed') {
            return { text: 'Processed', color: 'text-green-600 dark:text-green-400' };
        }
        if (details?.status === 'Processing') {
            return { text: 'Processing', color: 'text-amber-600 dark:text-amber-400' };
        }
    }

    if (!completed) {
        return { text: 'Processing', color: 'text-amber-600 dark:text-amber-400' };
    }

    if (event.includes('failed')) {
        return { text: 'Failed', color: 'text-red-600 dark:text-red-400' };
    }

    return { text: 'Completed', color: 'text-green-600 dark:text-green-400' };
};

const formatPaymentMethod = (details: TimelineEventDetails): string => {
    if (details.vpa) return `UPI: ${details.vpa}`;
    if (details.wallet) return `Wallet: ${details.wallet}`;
    if (details.bank) return `Netbanking: ${details.bank}`;
    if (details.cardLast4) return `Card: ****${details.cardLast4}`;
    if (details.method) return details.method.toUpperCase();
    return '';
};

export default function PaymentTimeline({
    orderId,
    token,
    paymentStatus,
    refundStatus,
    onStatusUpdate,
}: PaymentTimelineProps) {
    const [timelineData, setTimelineData] = useState<PaymentTimelineData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState(true);

    const fetchTimeline = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/payment/timeline/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setTimelineData(data);
                setError(null);

                // Notify parent if status was synced from API and changed
                if (data.syncedFromApi && onStatusUpdate) {
                    onStatusUpdate(data.refundStatus, data.paymentStatus);
                }
            } else {
                setError(data.message || 'Failed to fetch timeline');
            }
        } catch (err) {
            setError('Failed to fetch payment timeline');
            console.error('Timeline fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [orderId, token, onStatusUpdate]);

    useEffect(() => {
        fetchTimeline();

        // Poll for updates if payment is pending or refund is processing
        const shouldPoll = paymentStatus === 'pending' || refundStatus === 'processing';

        if (shouldPoll) {
            const pollInterval = setInterval(() => fetchTimeline(), 15000); // Poll every 15 seconds
            return () => clearInterval(pollInterval);
        }
    }, [fetchTimeline, paymentStatus, refundStatus]);

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-5 w-5 animate-spin text-amber-600" />
                    <span className="text-gray-600 dark:text-gray-400">Loading timeline...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-900 p-6">
                <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
            </div>
        );
    }

    if (!timelineData || timelineData.timeline.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <p className="text-gray-500 dark:text-gray-400 text-center">
                    No payment timeline available yet
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div
                className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Payment Timeline</h3>
                </div>
                <div className="flex items-center gap-2">
                    {expanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                </div>
            </div>

            {/* Timeline Content */}
            {expanded && (
                <div className="p-4">
                    {/* Summary */}
                    {timelineData.paymentId && (
                        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex flex-wrap gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Payment ID:</span>
                                    <span className="ml-2 font-mono text-gray-700 dark:text-gray-300">
                                        {timelineData.paymentId}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                                    <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                                        ₹{timelineData.amount?.toFixed(2)}
                                    </span>
                                </div>
                                {timelineData.refundAmount && (
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Refunded:</span>
                                        <span className="ml-2 font-semibold text-green-600 dark:text-green-400">
                                            ₹{timelineData.refundAmount.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Timeline Events */}
                    <div className="relative">
                        {timelineData.timeline.map((event, index) => (
                            <div key={`${event.event}-${index}`} className="flex gap-4 mb-4 last:mb-0">
                                {/* Timeline Line */}
                                <div className="flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${getEventColor(event.event, event.completed)}`}>
                                        {getEventIcon(event.event, event.completed)}
                                    </div>
                                    {index < timelineData.timeline.length - 1 && (
                                        <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 mt-2" />
                                    )}
                                </div>

                                {/* Event Content */}
                                <div className="flex-1 pb-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                                {event.title}
                                                {event.event === 'refund_processed' && event.details.status && (
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${event.details.status === 'Processed'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                        }`}>
                                                        ({event.details.status})
                                                    </span>
                                                )}
                                            </h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                                {event.formattedTime}
                                            </p>
                                        </div>
                                        <span className={`text-xs font-medium ${getStatusLabel(event.event, event.completed, event.details).color}`}>
                                            {(!event.completed || (event.event === 'refund_created' && event.details?.status === 'Processing')) && (
                                                <span className="inline-flex items-center gap-1">
                                                    <Clock className="h-3 w-3 animate-pulse" />
                                                    {getStatusLabel(event.event, event.completed, event.details).text}
                                                </span>
                                            )}
                                        </span>
                                    </div>

                                    {/* Event Details */}
                                    {(event.description || event.details.amount || event.details.paymentId || formatPaymentMethod(event.details)) && (
                                        <div className="mt-2 space-y-1 text-sm">
                                            {event.description && (
                                                <p className="text-gray-600 dark:text-gray-300">{event.description}</p>
                                            )}

                                            {event.event === 'payment_created' && event.details.paymentId && (
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-500 dark:text-gray-400">
                                                    <span>ID: <span className="font-mono">{event.details.paymentId}</span></span>
                                                    {formatPaymentMethod(event.details) && (
                                                        <span>{formatPaymentMethod(event.details)}</span>
                                                    )}
                                                </div>
                                            )}

                                            {event.event === 'refund_processed' && event.details.refundId && (
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-500 dark:text-gray-400">
                                                    <span>ID: <span className="font-mono">{event.details.refundId}</span></span>
                                                    {event.details.arn && (
                                                        <span>ARN: <span className="font-mono">{event.details.arn}</span></span>
                                                    )}
                                                </div>
                                            )}

                                            {event.event === 'settlement_processed' && event.details.settlementId && (
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-500 dark:text-gray-400">
                                                    <span>ID: <span className="font-mono">{event.details.settlementId}</span></span>
                                                    {event.details.netAmount && (
                                                        <span>Net amount: ₹{event.details.netAmount.toFixed(2)}</span>
                                                    )}
                                                    {event.details.utr && (
                                                        <span>UTR: <span className="font-mono">{event.details.utr}</span></span>
                                                    )}
                                                </div>
                                            )}

                                            {event.details.errorDescription && (
                                                <p className="text-red-600 dark:text-red-400">
                                                    {event.details.errorDescription}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer Note - Use timeline data's refund status which is the most accurate */}
                    {(timelineData.refundStatus === 'processing' || timelineData.refundStatus === 'completed') && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {timelineData.refundStatus === 'processing'
                                    ? 'Refund is being processed. This usually takes 5-7 working days.'
                                    : 'Refund has been processed. Amount will reflect in your account within 5-7 working days.'}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
