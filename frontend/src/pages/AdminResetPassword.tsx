import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, ArrowLeft, Loader2, CheckCircle, AlertCircle, Eye, EyeOff, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { API_URL } from '@/config/api';

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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-amber-50/30 to-white px-4">
                <Card className="w-full max-w-md border-amber-200/60 rounded-2xl">
                    <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-black mb-4">Password Reset Successful!</h1>
                        <p className="text-black/60 mb-6">
                            Your admin password has been successfully reset. You can now login with your new password.
                        </p>
                        <Button
                            onClick={() => navigate('/admin')}
                            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
                        >
                            Go to Admin Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-amber-50/30 to-white px-4">
                <Card className="w-full max-w-md border-amber-200/60 rounded-2xl">
                    <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-black mb-4">Invalid Link</h1>
                        <p className="text-black/60 mb-6">
                            This password reset link is invalid or has expired. Please request a new one.
                        </p>
                        <Link to="/admin/forgot-password">
                            <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700">
                                Request New Link
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-amber-50/30 to-white px-4">
            <Card className="w-full max-w-md border-amber-200/60 rounded-2xl">
                <CardContent className="p-8">
                    <Link
                        to="/admin"
                        className="inline-flex items-center text-sm text-black/60 hover:text-amber-600 mb-6"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Login
                    </Link>

                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                            <Shield className="h-8 w-8 text-amber-600" />
                        </div>
                        <h1 className="text-3xl font-[600] text-black mb-2">Reset Password</h1>
                        <p className="text-black/60">
                            Enter your new admin password below.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-black mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400"
                                    placeholder="Enter new password"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/60"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-black mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400"
                                    placeholder="Confirm new password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/60"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 text-base font-medium shadow-lg shadow-amber-200"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                    Resetting Password...
                                </>
                            ) : (
                                'Reset Password'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
