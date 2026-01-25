import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { API_URL } from '@/config/api';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
        !token ? 'error' : 'loading'
    );
    const [message, setMessage] = useState(
        !token ? 'Invalid verification link. No token provided.' : ''
    );
    const verificationAttempted = useRef(false);

    useEffect(() => {
        if (!token) {
            return;
        }

        // Prevent double execution in React Strict Mode
        if (verificationAttempted.current) {
            return;
        }
        verificationAttempted.current = true;

        const verifyEmail = async () => {
            try {
                console.log('Verifying email with token:', token);
                const response = await fetch(`${API_URL}/users/verify-email/${token}`);
                const data = await response.json();

                console.log('Verification response:', response.status, data);

                // Check for success - either response.ok OR data.success
                if (data.success === true) {
                    setStatus('success');
                    setMessage(data.message || 'Email verified successfully!');
                    setTimeout(() => navigate('/login'), 3000);
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Verification failed. Please try again.');
                }
            } catch (err) {
                console.error('Verification error:', err);
                setStatus('error');
                setMessage(err instanceof Error ? err.message : 'Network error. Please try again.');
            }
        };

        verifyEmail();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4 transition-colors duration-300">
            <Card className="w-full max-w-md p-8 shadow-xl text-center bg-white dark:bg-gray-900 dark:border-amber-900/30">
                {status === 'loading' && (
                    <>
                        <Loader2 className="h-16 w-16 animate-spin text-amber-600 dark:text-amber-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-black dark:text-white mb-2">Verifying Email</h1>
                        <p className="text-black/60 dark:text-white/60">Please wait while we verify your email address...</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-black dark:text-white mb-2">Email Verified!</h1>
                        <p className="text-black/60 dark:text-white/60 mb-6">{message}</p>
                        <p className="text-sm text-black/60 dark:text-white/60 mb-4">Redirecting to login page in 3 seconds...</p>
                        <Button
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                            onClick={() => navigate('/login')}
                        >
                            Go to Login Now
                        </Button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <XCircle className="h-16 w-16 text-red-600 dark:text-red-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-black dark:text-white mb-2">Verification Failed</h1>
                        <p className="text-black/60 dark:text-white/60 mb-6">{message}</p>
                        <div className="space-y-3">
                            <Button
                                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                                onClick={() => navigate('/login')}
                            >
                                Go to Login
                            </Button>
                            <Link
                                to="/signup"
                                className="block text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium"
                            >
                                Create a new account
                            </Link>
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
}
