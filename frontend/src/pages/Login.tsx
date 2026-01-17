import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { API_URL } from '@/config/api';
import TwoFactorAuth from '@/components/TwoFactorAuth';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [show2FA, setShow2FA] = useState(false);
    const [twoFAData, setTwoFAData] = useState<{ userId: string; email: string } | null>(null);
    const navigate = useNavigate();
    const { login } = useAuth();
    const { syncCartWithServer } = useCart();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Check if 2FA is required
            if (data.requires2FA) {
                setTwoFAData({ userId: data.userId, email: data.email });
                setShow2FA(true);
                setLoading(false);
                return;
            }

            // Normal login without 2FA
            login(data.token, data.user);

            // Sync cart with server after login
            await syncCartWithServer();

            navigate('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    interface User {
        id: string;
        name: string;
        email: string;
        isVerified: boolean;
    }

    const handle2FASuccess = async (token: string, user: User) => {
        login(token, user);
        await syncCartWithServer();
        setShow2FA(false);
        navigate('/');
    };

    const handle2FACancel = () => {
        setShow2FA(false);
        setTwoFAData(null);
        setPassword('');
    };

    return (
        <>
            {show2FA && twoFAData && (
                <TwoFactorAuth
                    userId={twoFAData.userId}
                    email={twoFAData.email}
                    onSuccess={handle2FASuccess}
                    onCancel={handle2FACancel}
                />
            )}

            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4 transition-colors duration-300">
                <Card className="w-full max-w-md p-8 shadow-xl bg-white dark:bg-gray-900 border-amber-100 dark:border-amber-900/30">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-black dark:text-white mb-2">Welcome Back</h1>
                        <p className="text-black/60 dark:text-white/60">Login to your Voyar account</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-black/80 dark:text-white/80 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40 dark:text-white/40" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-black/20 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800 text-black dark:text-white"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-black/80 dark:text-white/80 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40 dark:text-white/40" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-black/20 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800 text-black dark:text-white"
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <Link
                                to="/forgot-password"
                                className="text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 font-medium"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-6 text-base font-medium"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                    Logging in...
                                </>
                            ) : (
                                'Login'
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-black/60 dark:text-white/60">
                            Don't have an account?{' '}
                            <Link
                                to="/signup"
                                className="text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 font-medium"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </Card>
            </div>
        </>
    );
}
