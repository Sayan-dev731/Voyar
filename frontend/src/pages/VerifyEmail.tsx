import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { API_URL } from '@/config/api';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link');
            return;
        }

        const verifyEmail = async () => {
            try {
                const response = await fetch(`${API_URL}/users/verify-email/${token}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Verification failed');
                }

                setStatus('success');
                setMessage(data.message);
                setTimeout(() => navigate('/login'), 3000);
            } catch (err) {
                setStatus('error');
                setMessage(err instanceof Error ? err.message : 'Verification failed');
            }
        };

        verifyEmail();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50/30 flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-8 shadow-xl text-center">
                {status === 'loading' && (
                    <>
                        <Loader2 className="h-16 w-16 animate-spin text-amber-600 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-black mb-2">Verifying Email</h1>
                        <p className="text-black/60">Please wait while we verify your email address...</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-black mb-2">Email Verified!</h1>
                        <p className="text-black/60 mb-6">{message}</p>
                        <p className="text-sm text-black/60">Redirecting to login page...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-black mb-2">Verification Failed</h1>
                        <p className="text-black/60 mb-6">{message}</p>
                        <div className="space-y-3">
                            <Button
                                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                                onClick={() => navigate('/login')}
                            >
                                Go to Login
                            </Button>
                            <Link
                                to="/signup"
                                className="block text-sm text-amber-600 hover:text-amber-700 font-medium"
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
