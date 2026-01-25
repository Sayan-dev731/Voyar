import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { API_URL } from '@/config/api'
import '@/styles/admin.css'

export const AdminLogin = () => {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

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
        <div className="admin-layout min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -right-32 w-96 h-96 bg-[#c9a227]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -left-32 w-80 h-80 bg-[#c9a227]/5 rounded-full blur-3xl" />
                <div className="absolute top-10 left-10 w-px h-32 bg-gradient-to-b from-[#c9a227]/20 to-transparent" />
                <div className="absolute bottom-10 right-10 w-32 h-px bg-gradient-to-l from-[#c9a227]/20 to-transparent" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo Mark */}
                <div className="text-center mb-8">
                    <div
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 shadow-lg"
                        style={{
                            background: 'linear-gradient(135deg, #c9a227 0%, #8b6f1b 100%)',
                            boxShadow: '0 10px 40px rgba(201, 162, 39, 0.3)'
                        }}
                    >
                        <span className="text-white text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>V</span>
                    </div>
                    <h1
                        className="text-4xl mb-2 text-[#0d0d0d]"
                        style={{ fontFamily: 'Instrument Serif, Georgia, serif', letterSpacing: '-0.02em' }}
                    >
                        Admin Portal
                    </h1>
                    <p
                        className="text-[#8a8a8a]"
                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                    >
                        Access the Voyar management dashboard
                    </p>
                </div>

                {/* Login Card */}
                <div
                    className="bg-white rounded-2xl p-8 shadow-xl"
                    style={{
                        border: '1px solid rgba(0,0,0,0.06)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.08)'
                    }}
                >
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div
                                className="flex items-center gap-3 p-4 rounded-xl text-sm"
                                style={{
                                    background: '#fef2f2',
                                    border: '1px solid #fecaca',
                                    color: '#dc2626',
                                    fontFamily: 'DM Sans, sans-serif'
                                }}
                            >
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                {error}
                            </div>
                        )}

                        <div>
                            <label
                                className="block text-xs font-medium text-[#525252] mb-2 uppercase tracking-wider"
                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                            >
                                Username
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
                                    placeholder="Enter your username"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                className="block text-xs font-medium text-[#525252] mb-2 uppercase tracking-wider"
                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                            >
                                Password
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
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8a8a8a] hover:text-[#525252] transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Link
                                to="/admin/forgot-password"
                                className="text-sm text-[#c9a227] hover:text-[#8b6f1b] font-medium transition-colors"
                                style={{ fontFamily: 'DM Sans, sans-serif' }}
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                            style={{
                                background: loading ? '#525252' : 'linear-gradient(135deg, #0d0d0d 0%, #2a2a2a 100%)',
                                fontFamily: 'DM Sans, sans-serif',
                                boxShadow: loading ? 'none' : '0 4px 20px rgba(0,0,0,0.15)'
                            }}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    Access Dashboard
                                    <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Back to site link */}
                <div className="mt-8 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-[#8a8a8a] hover:text-[#0d0d0d] text-sm font-medium transition-colors inline-flex items-center gap-2"
                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                    >
                        <ArrowRight className="h-4 w-4 rotate-180" />
                        Back to Website
                    </button>
                </div>

                {/* Decorative footer line */}
                <div className="mt-12 flex items-center justify-center gap-4">
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#c9a227]/30" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#c9a227]/40" />
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#c9a227]/30" />
                </div>
            </div>
        </div>
    )
}
