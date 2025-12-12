import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, ArrowLeft, Loader2, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { API_URL } from '@/config/api';

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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-amber-50/30 to-white px-4">
                <Card className="w-full max-w-md border-amber-200/60 rounded-2xl">
                    <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-black mb-4">Check Recovery Email</h1>
                        <p className="text-black/60 mb-6">
                            If an admin account exists with the username <strong>{username}</strong>, a password reset link has been sent to the configured recovery email.
                        </p>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-amber-800">
                                <strong>Note:</strong> The reset link is sent to the admin panel's recovery email, not to your personal email.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <Button
                                onClick={() => {
                                    setSuccess(false);
                                    setUsername('');
                                }}
                                variant="outline"
                                className="w-full border-amber-200"
                            >
                                Try Another Username
                            </Button>
                            <Link to="/admin">
                                <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700">
                                    Back to Admin Login
                                </Button>
                            </Link>
                        </div>
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
                        <h1 className="text-3xl font-[600] text-black mb-2">Forgot Password?</h1>
                        <p className="text-black/60">
                            Enter your admin username to receive a reset link
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
                                Admin Username
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400"
                                    placeholder="Enter admin username"
                                    required
                                />
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
                                    Sending Reset Link...
                                </>
                            ) : (
                                'Send Reset Link'
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-black/60">
                            Remember your password?{' '}
                            <Link
                                to="/admin"
                                className="text-amber-600 hover:text-amber-700 font-medium"
                            >
                                Login
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
