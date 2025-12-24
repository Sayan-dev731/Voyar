import { useState, useEffect } from 'react'
import { ShoppingCart, Search, Menu, X, User, LogOut, Heart, Gift } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [showSearch, setShowSearch] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)
    const navigate = useNavigate()
    const { totalItems } = useCart()
    const { user, isAuthenticated, logout } = useAuth()

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navLinks = [
        { name: 'Eyeglasses', href: '/#eyeglasses' },
        { name: 'Sunglasses', href: '/#sunglasses' },
        { name: 'Collections', href: '/collections' },
        { name: 'Contact', href: '/contact' },
        { name: 'About', href: '/#about' },
    ]

    const handleLogout = () => {
        logout()
        setShowUserMenu(false)
        navigate('/')
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/collections?q=${encodeURIComponent(searchQuery)}`)
            setShowSearch(false)
            setSearchQuery('')
        }
    }

    const handleLogoClick = () => {
        navigate('/')
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <>
            <nav
                className={cn(
                    'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
                    isScrolled ? 'bg-black border-b border-white/10 shadow-sm' : 'bg-black'
                )}
            >
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Mobile header (matches reference) */}
                    <div className="lg:hidden">
                        <div className="relative flex items-center h-16">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 text-white/90 hover:text-white hover:bg-white/10"
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                                >
                                    {isMobileMenuOpen ? (
                                        <X className="h-5 w-5" />
                                    ) : (
                                        <Menu className="h-5 w-5" />
                                    )}
                                </Button>

                                <div className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-3 py-2 text-sm font-semibold text-black">
                                    <Gift className="h-4 w-4" />
                                    <span>₹899</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="absolute left-1/2 -translate-x-1/2 flex items-center"
                                onClick={handleLogoClick}
                                aria-label="Go to home"
                            >
                                <img
                                    src="/images/logo.jpeg"
                                    alt="Voyar"
                                    className="h-8 w-auto"
                                    loading="eager"
                                />
                            </button>

                            <div className="ml-auto flex items-center gap-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 text-white/90 hover:text-white hover:bg-white/10"
                                    aria-label="Wishlist"
                                >
                                    <Heart className="h-5 w-5" />
                                </Button>

                                {isAuthenticated ? (
                                    <div className="relative">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-10 w-10 text-white/90 hover:text-white hover:bg-white/10"
                                            onClick={() => setShowUserMenu(!showUserMenu)}
                                            aria-label="User menu"
                                        >
                                            <User className="h-5 w-5" />
                                        </Button>

                                        {showUserMenu && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-black/10 py-1 z-50">
                                                <div className="px-4 py-2 border-b border-black/10">
                                                    <p className="text-sm font-medium text-black truncate">{user?.name}</p>
                                                    <p className="text-xs text-black/60 truncate">{user?.email}</p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        navigate('/profile')
                                                        setShowUserMenu(false)
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm text-black/80 hover:bg-amber-50 hover:text-amber-600"
                                                >
                                                    My Profile
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        navigate('/orders')
                                                        setShowUserMenu(false)
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm text-black/80 hover:bg-amber-50 hover:text-amber-600"
                                                >
                                                    My Orders
                                                </button>
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                >
                                                    <LogOut className="h-4 w-4" />
                                                    Logout
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 text-white/90 hover:text-white hover:bg-white/10"
                                        onClick={() => navigate('/login')}
                                        aria-label="Login"
                                    >
                                        <User className="h-5 w-5" />
                                    </Button>
                                )}

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 text-white/90 hover:text-white hover:bg-white/10 relative"
                                    onClick={() => navigate('/cart')}
                                    aria-label="Cart"
                                >
                                    <ShoppingCart className="h-5 w-5" />
                                    {totalItems > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                            {totalItems}
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Search bar (always visible on mobile) */}
                        <div className="pb-3">
                            <form onSubmit={handleSearch} className="relative">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-12 rounded-2xl bg-white border border-black/10 px-4 pr-12 text-sm text-black placeholder:text-black/40 outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/50"
                                    aria-label="Search"
                                >
                                    <Search className="h-5 w-5" />
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Desktop header (keep existing behavior) */}
                    <div className="hidden lg:flex items-center justify-between h-20">
                        {/* Logo */}
                        <div className="flex-shrink-0 cursor-pointer" onClick={handleLogoClick}>
                            <div className="flex items-center gap-2">
                                <img
                                    src="/images/logo.jpeg"
                                    alt="Voyar"
                                    className="h-10 w-auto"
                                    loading="eager"
                                />
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center space-x-8">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="text-sm font-medium text-white/80 hover:text-amber-400 transition-colors duration-200"
                                >
                                    {link.name}
                                </a>
                            ))}
                        </div>

                        {/* Right Side Icons */}
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="hidden md:flex h-10 w-10 text-white/80 hover:text-amber-400 hover:bg-white/10 transition-colors"
                                onClick={() => setShowSearch(!showSearch)}
                            >
                                <Search className="h-4 w-4" />
                            </Button>

                            {/* User Menu */}
                            {isAuthenticated ? (
                                <div className="relative">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 text-white/80 hover:text-amber-400 hover:bg-white/10 transition-colors flex"
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                    >
                                        <User className="h-4 w-4" />
                                    </Button>

                                    {showUserMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-black/10 py-1 z-50">
                                            <div className="px-4 py-2 border-b border-black/10">
                                                <p className="text-sm font-medium text-black truncate">{user?.name}</p>
                                                <p className="text-xs text-black/60 truncate">{user?.email}</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    navigate('/profile')
                                                    setShowUserMenu(false)
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-black/80 hover:bg-amber-50 hover:text-amber-600"
                                            >
                                                My Profile
                                            </button>
                                            <button
                                                onClick={() => {
                                                    navigate('/orders')
                                                    setShowUserMenu(false)
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-black/80 hover:bg-amber-50 hover:text-amber-600"
                                            >
                                                My Orders
                                            </button>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <Button
                                        variant="ghost"
                                        className="hidden sm:flex text-sm font-medium text-white/80 hover:text-amber-400 hover:bg-white/10 transition-colors"
                                        onClick={() => navigate('/login')}
                                    >
                                        Login
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="flex sm:hidden h-10 w-10 text-white/80 hover:text-amber-400 hover:bg-white/10 transition-colors"
                                        onClick={() => navigate('/login')}
                                    >
                                        <User className="h-4 w-4" />
                                    </Button>
                                </>
                            )}

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 text-white/80 hover:text-amber-400 hover:bg-white/10 transition-colors relative"
                                onClick={() => navigate('/cart')}
                            >
                                <ShoppingCart className="h-4 w-4" />
                                {totalItems > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                        {totalItems}
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                {showSearch && (
                    <div className="hidden lg:block border-t border-white/10 bg-black">
                        <div className="px-4 py-4">
                            <form onSubmit={handleSearch} className="relative">
                                <input
                                    type="text"
                                    placeholder="Search for eyeglasses, sunglasses..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-3 pl-10 pr-4 bg-white/10 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400 transition-all text-sm text-white placeholder:text-white/50"
                                    autoFocus
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                            </form>
                        </div>
                    </div>
                )}

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden border-t border-white/10 bg-black shadow-lg">
                        <div className="px-4 pt-4 pb-6 space-y-1">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="block px-4 py-3 text-base font-medium text-white/85 hover:text-amber-400 hover:bg-white/10 rounded-lg transition-colors duration-150"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </a>
                            ))}

                            {/* Mobile User Options */}
                            <div className="border-t border-white/10 mt-4 pt-4">
                                {isAuthenticated ? (
                                    <>
                                        <div className="px-4 py-2 mb-2">
                                            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                                            <p className="text-xs text-white/60 truncate">{user?.email}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                navigate('/profile')
                                                setIsMobileMenuOpen(false)
                                            }}
                                            className="w-full text-left px-4 py-3 text-base font-medium text-white/85 hover:text-amber-400 hover:bg-white/10 rounded-lg transition-colors duration-150"
                                        >
                                            My Profile
                                        </button>
                                        <button
                                            onClick={() => {
                                                navigate('/orders')
                                                setIsMobileMenuOpen(false)
                                            }}
                                            className="w-full text-left px-4 py-3 text-base font-medium text-white/85 hover:text-amber-400 hover:bg-white/10 rounded-lg transition-colors duration-150"
                                        >
                                            My Orders
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleLogout()
                                                setIsMobileMenuOpen(false)
                                            }}
                                            className="w-full text-left px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150 flex items-center gap-2"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => {
                                                navigate('/login')
                                                setIsMobileMenuOpen(false)
                                            }}
                                            className="w-full text-left px-4 py-3 text-base font-medium text-white/85 hover:text-amber-400 hover:bg-white/10 rounded-lg transition-colors duration-150"
                                        >
                                            Login
                                        </button>
                                        <button
                                            onClick={() => {
                                                navigate('/signup')
                                                setIsMobileMenuOpen(false)
                                            }}
                                            className="w-full text-left px-4 py-3 text-base font-medium text-amber-400 hover:bg-white/10 rounded-lg transition-colors duration-150"
                                        >
                                            Sign Up
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </>
    )
}
