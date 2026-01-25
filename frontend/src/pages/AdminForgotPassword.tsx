import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, ArrowLeft, CheckCircle, AlertCircle, Mail, ArrowRight } from 'lucide-react';
import { API_URL } from '@/config/api';
import '@/styles/admin.css';

export default function AdminForgotPassword() {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/admin/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username }),
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
                            Check Your Email
                        </h1>

                        <p
                            className="text-[#525252] mb-6"
                            style={{ fontFamily: 'DM Sans, sans-serif' }}
                        >
                            If an admin account exists with the username <strong className="text-[#0d0d0d]">{username}</strong>, a password reset link has been sent to the configured recovery email.
                        </p>

                        <div
                            className="p-4 rounded-xl mb-6 text-left"
                            style={{
                                background: 'linear-gradient(135deg, #f5ecd4 0%, #fef3c7 100%)',
                                border: '1px solid rgba(201, 162, 39, 0.3)'
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <Mail className="h-5 w-5 text-[#c9a227] mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-[#8b6f1b]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                    <strong>Note:</strong> The reset link is sent to the admin panel's recovery email, not to your personal email.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    setSuccess(false);
                                    setUsername('');
                                }}
                                className="w-full py-3.5 rounded-xl font-medium transition-all border border-[rgba(0,0,0,0.12)] hover:border-[#0d0d0d] text-[#525252] hover:text-[#0d0d0d]"
                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                            >
                                Try Another Username
                            </button>
                            <Link to="/admin" className="block">
                                <button
                                    className="w-full py-3.5 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all"
                                    style={{
                                        background: 'linear-gradient(135deg, #0d0d0d 0%, #2a2a2a 100%)',
                                        fontFamily: 'DM Sans, sans-serif',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                                    }}
                                >
                                    Back to Admin Login
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </Link>
                        </div>
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
                        <Mail className="h-8 w-8 text-[#c9a227]" />
                    </div>
                    <h1
                        className="text-4xl mb-2 text-[#0d0d0d]"
                        style={{ fontFamily: 'Instrument Serif, Georgia, serif', letterSpacing: '-0.02em' }}
                    >
                        Reset Password
                    </h1>
                    <p
                        className="text-[#8a8a8a]"
                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                    >
                        Enter your admin username to receive a reset link
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
                                Admin Username
                            </label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8a8a8a] transition-colors group-focus-within:text-[#c9a227]" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-[#faf9f7] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#c9a227] focus:bg-white transition-all"
                                    style={{
                                        fontFamily: 'DM Sans, sans-serif',
                                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
                                    }}
                                    placeholder="Enter admin username"
                                    required
                                />
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
                                    Sending Reset Link...
                                </>
                            ) : (
                                <>
                                    Send Reset Link
                                    <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-[#8a8a8a]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                            Remember your password?{' '}
                            <Link
                                to="/admin"
                                className="text-[#c9a227] hover:text-[#8b6f1b] font-medium transition-colors"
                            >
                                Login
                            </Link>
                        </p>
                    </div>
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
