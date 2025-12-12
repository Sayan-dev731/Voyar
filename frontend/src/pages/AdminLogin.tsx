import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Lock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { API_URL } from '@/config/api'

export const AdminLogin = () => {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await fetch(`${API_URL}/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            })

            const data = await response.json()

            if (response.ok) {
                localStorage.setItem('adminToken', data.token)
                localStorage.setItem('adminUser', JSON.stringify(data.admin))
                navigate('/admin/dashboard')
            } else {
                setError(data.message || 'Login failed')
            }
        } catch {
            setError('Connection error. Please make sure the server is running.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-amber-50/30 to-white px-4">
            <Card className="w-full max-w-md border-amber-200/60 rounded-2xl">
                <CardContent className="p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                            <Lock className="h-8 w-8 text-amber-600" />
                        </div>
                        <h1 className="text-3xl font-[600] text-black mb-2">Admin Login</h1>
                        <p className="text-black/60">Access the Voyar admin dashboard</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-black mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400"
                                    placeholder="Enter username"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-black mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400"
                                    placeholder="Enter password"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Link
                                to="/admin/forgot-password"
                                className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 text-base font-medium shadow-lg shadow-amber-200"
                        >
                            {loading ? 'Logging in...' : 'Login to Dashboard'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/')}
                            className="text-black/60 hover:text-amber-600"
                        >
                            Back to Website
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
