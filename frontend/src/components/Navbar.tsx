import { useState, useEffect } from 'react'
import { ShoppingBag, Search, Menu, X, User, LogOut } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
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
            {/* Main Navbar */}
            <nav
                className={cn(
                    'sticky top-0 left-0 right-0 z-50 transition-all duration-500',
                    isScrolled
                        ? 'bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.06)] border-b border-amber-100/50 dark:border-amber-900/20'
                        : 'bg-white dark:bg-gray-950 border-b border-amber-100/30 dark:border-amber-900/10'
                )}
            >
                <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-10">
                    {/* Mobile header */}
                    <div className="lg:hidden">
                        <div className="relative flex items-center h-[60px]">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 text-black/80 dark:text-white/80 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                            >
                                {isMobileMenuOpen ? (
                                    <X className="h-5 w-5" />
                                ) : (
                                    <Menu className="h-5 w-5" />
                                )}
                            </Button>

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

                            <div className="ml-auto flex items-center gap-0.5">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 text-black/80 dark:text-white/80 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                    onClick={() => setShowSearch(!showSearch)}
                                    aria-label="Search"
                                >
                                    <Search className="h-[18px] w-[18px]" />
                                </Button>

                                {isAuthenticated ? (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 text-black/80 dark:text-white/80 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                        onClick={() => navigate('/profile')}
                                        aria-label="Profile"
                                    >
                                        <User className="h-[18px] w-[18px]" />
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 text-black/80 dark:text-white/80 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                        onClick={() => navigate('/login')}
                                        aria-label="Login"
                                    >
                                        <User className="h-[18px] w-[18px]" />
                                    </Button>
                                )}

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 text-black/80 dark:text-white/80 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 relative"
                                    onClick={() => navigate('/cart')}
                                    aria-label="Cart"
                                >
                                    <ShoppingBag className="h-[18px] w-[18px]" />
                                    {totalItems > 0 && (
                                        <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-medium">
                                            {totalItems}
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Mobile Search bar */}
                        <div className={cn(
                            "overflow-hidden transition-all duration-300 ease-out",
                            showSearch ? "max-h-20 opacity-100 pb-3" : "max-h-0 opacity-0"
                        )}>
                            <form onSubmit={handleSearch} className="relative">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-11 bg-amber-50 dark:bg-gray-900 border border-amber-200 dark:border-amber-900/50 px-4 pr-12 text-sm text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 outline-none focus:border-amber-400 dark:focus:border-amber-500 transition-colors rounded-xl"
                                    autoFocus={showSearch}
                                />
                                <button
                                    type="submit"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-600 dark:text-amber-400"
                                    aria-label="Search"
                                >
                                    <Search className="h-4 w-4" />
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Desktop header */}
                    <div className="hidden lg:flex items-center justify-between h-[68px]">
                        {/* Left - Navigation */}
                        <div className="flex items-center gap-8">
                            <Link
                                to="/collections"
                                className="text-[13px] font-medium tracking-[0.04em] uppercase text-black/70 dark:text-white/70 hover:text-amber-600 dark:hover:text-amber-400 transition-colors duration-300 relative group"
                            >
                                Shop
                                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-amber-500 group-hover:w-full transition-all duration-300" />
                            </Link>
                            <Link
                                to="/contact"
                                className="text-[13px] font-medium tracking-[0.04em] uppercase text-black/70 dark:text-white/70 hover:text-amber-600 dark:hover:text-amber-400 transition-colors duration-300 relative group"
                            >
                                Contact
                                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-amber-500 group-hover:w-full transition-all duration-300" />
                            </Link>
                        </div>

                        {/* Center - Logo */}
                        <div className="absolute left-1/2 -translate-x-1/2 cursor-pointer" onClick={handleLogoClick}>
                            <img
                                src="/images/logo.jpeg"
                                alt="Voyar"
                                className="h-10 w-auto"
                                loading="eager"
                            />
                        </div>

                        {/* Right - Icons */}
                        <div className="flex items-center gap-1">
                            {/* Search */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 text-black/70 dark:text-white/70 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                                onClick={() => setShowSearch(!showSearch)}
                            >
                                <Search className="h-[18px] w-[18px]" />
                            </Button>

                            {/* User Menu */}
                            {isAuthenticated ? (
                                <div className="relative">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 text-black/70 dark:text-white/70 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                    >
                                        <User className="h-[18px] w-[18px]" />
                                    </Button>

                                    {showUserMenu && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-950 rounded-xl border border-amber-100 dark:border-amber-900/30 shadow-xl py-2 z-50 animate-scale-in">
                                            <div className="px-4 py-3 border-b border-amber-100 dark:border-amber-900/30">
                                                <p className="text-sm font-medium text-black dark:text-white truncate">{user?.name}</p>
                                                <p className="text-xs text-black/50 dark:text-white/50 truncate">{user?.email}</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    navigate('/profile')
                                                    setShowUserMenu(false)
                                                }}
                                                className="w-full text-left px-4 py-2.5 text-sm text-black/70 dark:text-white/70 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                                            >
                                                My Profile
                                            </button>
                                            <button
                                                onClick={() => {
                                                    navigate('/orders')
                                                    setShowUserMenu(false)
                                                }}
                                                className="w-full text-left px-4 py-2.5 text-sm text-black/70 dark:text-white/70 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                                            >
                                                My Orders
                                            </button>
                                            <div className="border-t border-amber-100 dark:border-amber-900/30 mt-1 pt-1">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                                                >
                                                    <LogOut className="h-4 w-4" />
                                                    Logout
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Button
                                    variant="ghost"
                                    className="text-[13px] font-medium tracking-[0.04em] uppercase text-black/70 dark:text-white/70 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                                    onClick={() => navigate('/login')}
                                >
                                    Sign In
                                </Button>
                            )}

                            {/* Cart - Bag Icon */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 text-black/70 dark:text-white/70 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors relative"
                                onClick={() => navigate('/cart')}
                            >
                                <ShoppingBag className="h-[18px] w-[18px]" />
                                {totalItems > 0 && (
                                    <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-medium">
                                        {totalItems}
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Desktop Search Bar */}
                <div className={cn(
                    "hidden lg:block border-t border-amber-100 dark:border-amber-900/30 overflow-hidden transition-all duration-400 ease-out",
                    showSearch ? "max-h-24 opacity-100" : "max-h-0 opacity-0 border-t-0"
                )}>
                    <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-10 py-4">
                        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
                            <input
                                type="text"
                                placeholder="Search for eyeglasses, sunglasses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-5 py-3 pl-12 bg-amber-50 dark:bg-gray-900 border border-amber-200 dark:border-amber-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all text-sm text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40"
                                autoFocus={showSearch}
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <button
                                type="button"
                                onClick={() => setShowSearch(false)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40 hover:text-amber-600 dark:hover:text-amber-400"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div className={cn(
                    "lg:hidden fixed inset-0 top-[60px] z-50 transition-all duration-500 ease-out",
                    isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                )}>
                    <div
                        className={cn(
                            "absolute inset-0 bg-black/20 transition-opacity duration-500",
                            isMobileMenuOpen ? "opacity-100" : "opacity-0"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    <div className={cn(
                        "absolute top-0 left-0 right-0 bg-white dark:bg-gray-950 transition-transform duration-500 ease-out shadow-xl",
                        isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"
                    )}>
                        <div className="px-6 py-8 space-y-1">
                            <Link
                                to="/collections"
                                className="block py-4 text-2xl font-light text-black dark:text-white border-b border-amber-100 dark:border-amber-900/30 hover:text-amber-600 dark:hover:text-amber-400 hover:pl-2 transition-all duration-300"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Shop
                            </Link>
                            <Link
                                to="/contact"
                                className="block py-4 text-2xl font-light text-black dark:text-white border-b border-amber-100 dark:border-amber-900/30 hover:text-amber-600 dark:hover:text-amber-400 hover:pl-2 transition-all duration-300"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Contact
                            </Link>
                            <Link
                                to="/orders"
                                className="block py-4 text-2xl font-light text-black dark:text-white border-b border-amber-100 dark:border-amber-900/30 hover:text-amber-600 dark:hover:text-amber-400 hover:pl-2 transition-all duration-300"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Track Order
                            </Link>

                            <div className="pt-6">
                                {isAuthenticated ? (
                                    <>
                                        <div className="pb-4 mb-4 border-b border-amber-100 dark:border-amber-900/30">
                                            <p className="text-sm font-medium text-black dark:text-white">{user?.name}</p>
                                            <p className="text-xs text-black/50 dark:text-white/50">{user?.email}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                navigate('/profile')
                                                setIsMobileMenuOpen(false)
                                            }}
                                            className="block py-3 text-lg text-black/70 dark:text-white/70 hover:text-amber-600 dark:hover:text-amber-400 transition-colors w-full text-left"
                                        >
                                            My Profile
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleLogout()
                                                setIsMobileMenuOpen(false)
                                            }}
                                            className="block py-3 text-lg text-red-600 dark:text-red-400 w-full text-left flex items-center gap-2"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => {
                                                navigate('/login')
                                                setIsMobileMenuOpen(false)
                                            }}
                                            className="flex-1 py-3 text-center text-sm font-medium uppercase tracking-wider border border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white transition-all duration-300 rounded-xl"
                                        >
                                            Sign In
                                        </button>
                                        <button
                                            onClick={() => {
                                                navigate('/signup')
                                                setIsMobileMenuOpen(false)
                                            }}
                                            className="flex-1 py-3 text-center text-sm font-medium uppercase tracking-wider bg-amber-500 text-white hover:bg-amber-600 transition-all duration-300 rounded-xl"
                                        >
                                            Sign Up
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    )
}
