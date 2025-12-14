import { useState, createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
    id: string
    message: string
    type: ToastType
    duration?: number
}

interface ToastContextType {
    showToast: (message: string, type: ToastType, duration?: number) => void
    showConfirm: (message: string, onConfirm: () => void) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within ToastProvider')
    }
    return context
}

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([])
    const [confirmDialog, setConfirmDialog] = useState<{ message: string; onConfirm: () => void } | null>(null)

    const showToast = (message: string, type: ToastType = 'info', duration = 5000) => {
        setToasts(prev => {
            const id = Date.now().toString(36) + Math.random().toString(36).substring(2)
            const newToast = { id, message, type, duration }

            if (duration > 0) {
                setTimeout(() => {
                    removeToast(id)
                }, duration)
            }

            return [...prev, newToast]
        })
    }

    const showConfirm = (message: string, onConfirm: () => void) => {
        setConfirmDialog({ message, onConfirm })
    }

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
    }

    const handleConfirm = () => {
        if (confirmDialog) {
            confirmDialog.onConfirm()
            setConfirmDialog(null)
        }
    }

    const handleCancel = () => {
        setConfirmDialog(null)
    }

    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-600" />
            case 'error':
                return <AlertCircle className="h-5 w-5 text-red-600" />
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-amber-600" />
            default:
                return <Info className="h-5 w-5 text-blue-600" />
        }
    }

    const getBackgroundColor = (type: ToastType) => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200'
            case 'error':
                return 'bg-red-50 border-red-200'
            case 'warning':
                return 'bg-amber-50 border-amber-200'
            default:
                return 'bg-blue-50 border-blue-200'
        }
    }

    return (
        <ToastContext.Provider value={{ showToast, showConfirm }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-4 left-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-md sm:left-auto sm:right-4 sm:w-auto">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={cn(
                            'flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-in slide-in-from-top-5 duration-300',
                            getBackgroundColor(toast.type)
                        )}
                    >
                        {getIcon(toast.type)}
                        <p className="flex-1 text-sm font-medium text-black">{toast.message}</p>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-black/40 hover:text-black transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Confirm Dialog */}
            {confirmDialog && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={handleCancel}
                    />
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-black mb-2">Confirm Action</h3>
                                <p className="text-sm text-black/70">{confirmDialog.message}</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 text-sm font-medium text-black/70 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ToastContext.Provider>
    )
}
