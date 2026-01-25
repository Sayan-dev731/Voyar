import { useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info, X } from 'lucide-react';
import { Button } from './button';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'success' | 'info';
    loading?: boolean;
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'warning',
    loading = false
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'danger':
                return <XCircle className="h-12 w-12 text-red-500" />;
            case 'success':
                return <CheckCircle className="h-12 w-12 text-green-500" />;
            case 'info':
                return <Info className="h-12 w-12 text-blue-500" />;
            default:
                return <AlertTriangle className="h-12 w-12 text-amber-500" />;
        }
    };

    const getConfirmButtonClass = () => {
        switch (type) {
            case 'danger':
                return 'bg-red-600 hover:bg-red-700 text-white';
            case 'success':
                return 'bg-green-600 hover:bg-green-700 text-white';
            default:
                return 'bg-amber-600 hover:bg-amber-700 text-white';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Content */}
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        {getIcon()}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {title}
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {message}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3 justify-center">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                            className="min-w-[100px] border-gray-300"
                        >
                            {cancelText}
                        </Button>
                        <Button
                            onClick={onConfirm}
                            disabled={loading}
                            className={`min-w-[100px] ${getConfirmButtonClass()}`}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processing...
                                </span>
                            ) : (
                                confirmText
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Toast notification component
interface ToastProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
}

export function Toast({ isOpen, onClose, message, type = 'info', duration = 3000 }: ToastProps) {
    useEffect(() => {
        if (isOpen && duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [isOpen, duration, onClose]);

    if (!isOpen) return null;

    const getToastStyle = () => {
        switch (type) {
            case 'success':
                return 'bg-green-600';
            case 'error':
                return 'bg-red-600';
            case 'warning':
                return 'bg-amber-600';
            default:
                return 'bg-blue-600';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-5 w-5" />;
            case 'error':
                return <XCircle className="h-5 w-5" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5" />;
            default:
                return <Info className="h-5 w-5" />;
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className={`${getToastStyle()} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3`}>
                {getIcon()}
                <span className="font-medium">{message}</span>
                <button
                    onClick={onClose}
                    className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

// Success modal for payment success, order actions, etc.
interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    actionText?: string;
    onAction?: () => void;
    secondaryActionText?: string;
    onSecondaryAction?: () => void;
}

export function SuccessModal({
    isOpen,
    onClose,
    title,
    message,
    actionText,
    onAction,
    secondaryActionText,
    onSecondaryAction
}: SuccessModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
                {/* Success Animation */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-12 w-12 text-green-600" />
                        </div>
                        <div className="absolute inset-0 w-20 h-20 border-4 border-green-600 rounded-full animate-ping opacity-30" />
                    </div>
                </div>

                {/* Content */}
                <div className="text-center">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                        {title}
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {message}
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        {actionText && onAction && (
                            <Button
                                onClick={onAction}
                                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                            >
                                {actionText}
                            </Button>
                        )}
                        {secondaryActionText && onSecondaryAction && (
                            <Button
                                variant="outline"
                                onClick={onSecondaryAction}
                                className="w-full border-amber-200 hover:border-amber-400 hover:bg-amber-50"
                            >
                                {secondaryActionText}
                            </Button>
                        )}
                        {!actionText && !secondaryActionText && (
                            <Button
                                onClick={onClose}
                                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                            >
                                Got it
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
