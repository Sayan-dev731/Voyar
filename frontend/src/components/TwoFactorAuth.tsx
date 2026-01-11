import { useState, useEffect, useRef } from 'react';
import { X, Mail, RefreshCw, Shield } from 'lucide-react';
import { API_URL } from '../config/api';

interface User {
    id: string;
    name: string;
    email: string;
    isVerified: boolean;
}

interface TwoFactorAuthProps {
    userId: string;
    email: string;
    onSuccess: (token: string, user: User) => void;
    onCancel: () => void;
}

export default function TwoFactorAuth({ userId, email, onSuccess, onCancel }: TwoFactorAuthProps) {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [validationSuccess, setValidationSuccess] = useState(false);
    const [validationError, setValidationError] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Countdown timer for resend
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [countdown]);

    // Focus first input on mount
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (index: number, value: string) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all digits are entered
        if (newOtp.every(digit => digit !== '')) {
            handleVerify(newOtp.join(''));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);

        if (/^\d+$/.test(pastedData)) {
            const newOtp = pastedData.split('');
            setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')]);

            // Focus last filled input or next empty one
            const nextIndex = Math.min(newOtp.length, 5);
            inputRefs.current[nextIndex]?.focus();

            // Auto-submit if complete
            if (pastedData.length === 6) {
                handleVerify(pastedData);
            }
        }
    };

    const handleVerify = async (otpCode: string) => {
        setLoading(true);
        setError('');
        setValidationError(false);
        setValidationSuccess(false);

        try {
            const response = await fetch(`${API_URL}/users/verify-2fa`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    otp: otpCode
                }),
            });

            const data = await response.json();

            if (response.ok && data.token) {
                // Success animation
                setValidationSuccess(true);
                await new Promise(resolve => setTimeout(resolve, 800));
                onSuccess(data.token, data.user);
            } else {
                throw new Error(data.message || 'Invalid verification code');
            }
        } catch (err: unknown) {
            console.error('2FA verification error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Invalid verification code';
            setError(errorMessage);

            // Error animation
            setValidationError(true);
            await new Promise(resolve => setTimeout(resolve, 500));
            setValidationError(false);

            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/users/resend-2fa-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to resend code');
            }

            setCountdown(60);
            setCanResend(false);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to resend code';
            setError(errorMessage);
        } finally {
            setResending(false);
        }
    };

    const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + '*'.repeat(b.length) + c);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in slide-in-from-bottom-4 duration-300">
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X className="h-5 w-5 text-gray-500" />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="h-8 w-8 text-amber-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Two-Factor Authentication
                    </h2>
                    <p className="text-gray-600 text-sm">
                        We've sent a verification code to
                    </p>
                    <p className="text-amber-600 font-medium mt-1 flex items-center justify-center gap-2">
                        <Mail className="h-4 w-4" />
                        {maskedEmail}
                    </p>
                </div>

                {/* OTP Input */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                        Enter 6-digit code
                    </label>
                    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => { inputRefs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={e => handleChange(index, e.target.value)}
                                onKeyDown={e => handleKeyDown(index, e)}
                                className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 transition-all relative ${validationSuccess
                                    ? 'border-green-500 bg-green-50 animate-success-fill'
                                    : validationError
                                        ? 'border-red-500 bg-red-50 animate-shake'
                                        : error
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                            : 'border-gray-300 focus:border-amber-500 focus:ring-amber-200'
                                    }`}
                                style={{
                                    animationDelay: validationSuccess ? `${index * 100}ms` : '0ms'
                                }}
                                disabled={loading}
                            />
                        ))}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
                        {error}
                    </div>
                )}

                {/* Verify Button */}
                <button
                    onClick={() => handleVerify(otp.join(''))}
                    disabled={loading || otp.some(digit => digit === '')}
                    className="w-full py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mb-4"
                >
                    {loading ? (
                        <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Verifying...
                        </>
                    ) : (
                        'Verify & Login'
                    )}
                </button>

                {/* Resend Code */}
                <div className="text-center text-sm text-gray-600">
                    {canResend ? (
                        <button
                            onClick={handleResend}
                            disabled={resending}
                            className="text-amber-600 hover:text-amber-700 font-medium disabled:opacity-50"
                        >
                            {resending ? 'Sending...' : 'Resend Code'}
                        </button>
                    ) : (
                        <p>
                            Resend code in <span className="font-medium text-amber-600">{countdown}s</span>
                        </p>
                    )}
                </div>

                {/* Security Notice */}
                <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-800">
                        <strong>Security Notice:</strong> Never share this code with anyone. This code expires in 10 minutes.
                    </p>
                </div>
            </div>
        </div>
    );
}
