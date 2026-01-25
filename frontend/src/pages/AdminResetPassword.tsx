import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff, KeyRound, ArrowRight, RefreshCw } from 'lucide-react';
import { API_URL } from '@/config/api';
import '@/styles/admin.css';

export default function AdminResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing reset token. Please request a new password reset link.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/admin/reset-password/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
            } else {
                setError(data.message || 'Something went wrong. Please try again.');
            }
        } catch {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="admin-layout min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 -right-32 w-96 h-96 bg-[#16a34a]/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 -left-32 w-80 h-80 bg-[#c9a227]/5 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 w-full max-w-md">
                    <div
                        className="bg-white rounded-2xl p-8 text-center shadow-xl"
                        style={{
                            border: '1px solid rgba(0,0,0,0.06)',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.08)'
                        }}
                    >
                        <div
                            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                            style={{
                                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                                boxShadow: '0 10px 40px rgba(22, 163, 74, 0.3)'
                            }}
                        >
                            <CheckCircle className="h-10 w-10 text-white" />
                        </div>

                        <h1
                            className="text-3xl mb-3 text-[#0d0d0d]"
                            style={{ fontFamily: 'Instrument Serif, Georgia, serif', letterSpacing: '-0.02em' }}
                        >
                            Password Updated
                        </h1>

                        <p
                            className="text-[#525252] mb-8"
                            style={{ fontFamily: 'DM Sans, sans-serif' }}
                        >
                            Your admin password has been successfully reset. You can now login with your new credentials.
                        </p>

                        <button
                            onClick={() => navigate('/admin')}
                            className="w-full py-4 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all"
                            style={{
                                background: 'linear-gradient(135deg, #0d0d0d 0%, #2a2a2a 100%)',
                                fontFamily: 'DM Sans, sans-serif',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                            }}
                        >
                            Continue to Login
                            <ArrowRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!token) {
        return (
            <div className="admin-layout min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 -right-32 w-96 h-96 bg-[#dc2626]/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 -left-32 w-80 h-80 bg-[#c9a227]/5 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 w-full max-w-md">
                    <div
                        className="bg-white rounded-2xl p-8 text-center shadow-xl"
                        style={{
                            border: '1px solid rgba(0,0,0,0.06)',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.08)'
                        }}
                    >
                        <div
                            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                            style={{
                                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                                boxShadow: '0 10px 40px rgba(220, 38, 38, 0.3)'
                            }}
                        >
                            <AlertCircle className="h-10 w-10 text-white" />
                        </div>

                        <h1
                            className="text-3xl mb-3 text-[#0d0d0d]"
                            style={{ fontFamily: 'Instrument Serif, Georgia, serif', letterSpacing: '-0.02em' }}
                        >
                            Invalid Link
                        </h1>

                        <p
                            className="text-[#525252] mb-8"
                            style={{ fontFamily: 'DM Sans, sans-serif' }}
                        >
                            This password reset link is invalid or has expired. Please request a new one to continue.
                        </p>

                        <Link to="/admin/forgot-password" className="block">
                            <button
                                className="w-full py-4 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all"
                                style={{
                                    background: 'linear-gradient(135deg, #c9a227 0%, #8b6f1b 100%)',
                                    fontFamily: 'DM Sans, sans-serif',
                                    boxShadow: '0 10px 40px rgba(201, 162, 39, 0.3)'
                                }}
                            >
                                <RefreshCw className="h-5 w-5" />
                                Request New Link
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-layout min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -right-32 w-96 h-96 bg-[#c9a227]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -left-32 w-80 h-80 bg-[#c9a227]/5 rounded-full blur-3xl" />
                <div className="absolute top-10 left-10 w-px h-32 bg-gradient-to-b from-[#c9a227]/20 to-transparent" />
                <div className="absolute bottom-10 right-10 w-32 h-px bg-gradient-to-l from-[#c9a227]/20 to-transparent" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Back Link */}
                <Link
                    to="/admin"
                    className="inline-flex items-center text-sm text-[#8a8a8a] hover:text-[#0d0d0d] mb-8 transition-colors"
                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Login
                </Link>

                {/* Header */}
                <div className="text-center mb-8">
                    <div
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
                        style={{
                            background: 'linear-gradient(135deg, rgba(201, 162, 39, 0.1) 0%, rgba(201, 162, 39, 0.2) 100%)',
                            border: '1px solid rgba(201, 162, 39, 0.2)'
                        }}
                    >
                        <KeyRound className="h-8 w-8 text-[#c9a227]" />
                    </div>
                    <h1
                        className="text-4xl mb-2 text-[#0d0d0d]"
                        style={{ fontFamily: 'Instrument Serif, Georgia, serif', letterSpacing: '-0.02em' }}
                    >
                        Create New Password
                    </h1>
                    <p
                        className="text-[#8a8a8a]"
                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                    >
                        Enter and confirm your new admin password
                    </p>
                </div>

                {/* Form Card */}
                <div
                    className="bg-white rounded-2xl p-8 shadow-xl"
                    style={{
                        border: '1px solid rgba(0,0,0,0.06)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.08)'
                    }}
                >
                    {error && (
                        <div
                            className="flex items-start gap-3 p-4 rounded-xl text-sm mb-6"
                            style={{
                                background: '#fef2f2',
                                border: '1px solid #fecaca'
                            }}
                        >
                            <AlertCircle className="h-5 w-5 text-[#dc2626] flex-shrink-0 mt-0.5" />
                            <p className="text-[#dc2626]" style={{ fontFamily: 'DM Sans, sans-serif' }}>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                className="block text-xs font-medium text-[#525252] mb-2 uppercase tracking-wider"
                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                            >
                                New Password
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8a8a8a] transition-colors group-focus-within:text-[#c9a227]" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-3.5 bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#c9a227] focus:bg-white transition-all"
                                    style={{
                                        fontFamily: 'DM Sans, sans-serif',
                                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
                                    }}
                                    placeholder="Enter new password"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8a8a8a] hover:text-[#525252] transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            <p className="text-xs text-[#8a8a8a] mt-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                Minimum 6 characters required
                            </p>
                        </div>

                        <div>
                            <label
                                className="block text-xs font-medium text-[#525252] mb-2 uppercase tracking-wider"
                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                            >
                                Confirm Password
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8a8a8a] transition-colors group-focus-within:text-[#c9a227]" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-3.5 bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#c9a227] focus:bg-white transition-all"
                                    style={{
                                        fontFamily: 'DM Sans, sans-serif',
                                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
                                    }}
                                    placeholder="Confirm new password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8a8a8a] hover:text-[#525252] transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                            style={{
                                background: loading ? '#525252' : 'linear-gradient(135deg, #c9a227 0%, #8b6f1b 100%)',
                                fontFamily: 'DM Sans, sans-serif',
                                boxShadow: loading ? 'none' : '0 10px 40px rgba(201, 162, 39, 0.3)'
                            }}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Updating Password...
                                </>
                            ) : (
                                <>
                                    Update Password
                                    <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Decorative footer line */}
                <div className="mt-12 flex items-center justify-center gap-4">
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#c9a227]/30" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#c9a227]/40" />
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#c9a227]/30" />
                </div>
            </div>
        </div>
    );
}
