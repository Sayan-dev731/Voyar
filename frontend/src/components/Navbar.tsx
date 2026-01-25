import { useState, useEffect, useRef } from 'react'
import { ShoppingCart, Search, Menu, X, User, LogOut, Heart, ChevronDown, Phone, MapPin, Package } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { useWishlist } from '@/context/WishlistContext'
import { ThemeToggle } from './ThemeToggle'

interface CategoryItem {
    label: string
    href: string
    badge?: string
}

interface MegaMenuData {
    eyeglasses: CategoryItem[]
    sunglasses: CategoryItem[]
}

const megaMenuData: MegaMenuData = {
    eyeglasses: [
        { label: 'Men', href: '/collections?category=eyeglasses&gender=men' },
        { label: 'Women', href: '/collections?category=eyeglasses&gender=women' },
        { label: '@999', href: '/collections?category=eyeglasses&price=999', badge: 'Sale' },
        { label: 'Sports', href: '/collections?category=eyeglasses&style=sports' },
    ],
    sunglasses: [
        { label: 'Men', href: '/collections?category=sunglasses&gender=men' },
        { label: 'Women', href: '/collections?category=sunglasses&gender=women' },
        { label: '@999', href: '/collections?category=sunglasses&price=999', badge: 'Sale' },
        { label: 'Sports', href: '/collections?category=sunglasses&style=sports' },
    ],
}

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [showSearch, setShowSearch] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [activeDropdown, setActiveDropdown] = useState<'eyeglasses' | 'sunglasses' | null>(null)
    const dropdownTimeoutRef = useRef<number | null>(null)
    const navigate = useNavigate()
    const { totalItems } = useCart()
    const { user, isAuthenticated, logout } = useAuth()
    const { totalItems: wishlistItems } = useWishlist()

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setActiveDropdown(null)
        }
        if (activeDropdown) {
            document.addEventListener('click', handleClickOutside)
            return () => document.removeEventListener('click', handleClickOutside)
        }
    }, [activeDropdown])

    const handleDropdownEnter = (menu: 'eyeglasses' | 'sunglasses') => {
        if (dropdownTimeoutRef.current) {
            clearTimeout(dropdownTimeoutRef.current)
        }
        setActiveDropdown(menu)
    }

    const handleDropdownLeave = () => {
        dropdownTimeoutRef.current = window.setTimeout(() => {
            setActiveDropdown(null)
        }, 150)
    }

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
            {/* Top Info Bar */}
            <div className="hidden lg:block bg-amber-50 dark:bg-gray-900 border-b border-amber-100 dark:border-amber-900/30 transition-colors duration-300">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-9 text-xs">
                        <div className="flex items-center gap-6 text-black/60 dark:text-white/60">
                            <a href="tel:+919667194067" className="flex items-center gap-1.5 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                                <Phone className="h-3 w-3" />
                                <span>+91 9667194067</span>
                            </a>
                            <span className="flex items-center gap-1.5">
                                <MapPin className="h-3 w-3" />
                                <span>Patna, Bihar</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-6 text-black/60 dark:text-white/60">
                            <Link to="/orders" className="flex items-center gap-1.5 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                                <Package className="h-3 w-3" />
                                <span>Track Order</span>
                            </Link>
                            <Link to="/contact" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                                Return & Exchange
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Navbar */}
            <nav
                className={cn(
                    'sticky top-0 left-0 right-0 z-50 transition-all duration-300',
                    isScrolled
                        ? 'bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-amber-100 dark:border-amber-900/30 shadow-sm'
                        : 'bg-white dark:bg-gray-950 border-b border-amber-100 dark:border-amber-900/30'
                )}
            >
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Mobile header */}
                    <div className="lg:hidden">
                        <div className="relative flex items-center h-16">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 text-black/70 dark:text-white/70 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                                >
                                    {isMobileMenuOpen ? (
                                        <X className="h-5 w-5" />
                                    ) : (
                                        <Menu className="h-5 w-5" />
                                    )}
                                </Button>
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
                                    className="h-10 w-10 text-black/70 dark:text-white/70 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                    onClick={() => setShowSearch(!showSearch)}
                                    aria-label="Search"
                                >
                                    <Search className="h-5 w-5" />
                                </Button>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 text-black/70 dark:text-white/70 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 relative"
                                    onClick={() => navigate('/profile?tab=wishlist')}
                                    aria-label="Wishlist"
                                >
                                    <Heart className="h-5 w-5" />
                                    {wishlistItems > 0 && (
                                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
                                            {wishlistItems > 9 ? '9+' : wishlistItems}
                                        </span>
                                    )}
                                </Button>

                                {isAuthenticated ? (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 text-black/70 dark:text-white/70 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                        onClick={() => navigate('/profile')}
                                        aria-label="Profile"
                                    >
                                        <User className="h-5 w-5" />
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 text-black/70 dark:text-white/70 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                        onClick={() => navigate('/login')}
                                        aria-label="Login"
                                    >
                                        <User className="h-5 w-5" />
                                    </Button>
                                )}

                                <ThemeToggle />

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 text-black/70 dark:text-white/70 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 relative"
                                    onClick={() => navigate('/cart')}
                                    aria-label="Cart"
                                >
                                    <ShoppingCart className="h-5 w-5" />
                                    {totalItems > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                            {totalItems}
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Mobile Search bar */}
                        {showSearch && (
                            <div className="pb-3">
                                <form onSubmit={handleSearch} className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full h-12 rounded-xl bg-amber-50 dark:bg-gray-800 border border-amber-200 dark:border-amber-900/50 px-4 pr-12 text-sm text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 outline-none focus-visible:ring-2 focus-visible:ring-amber-400 dark:focus-visible:ring-amber-500 focus-visible:border-amber-400"
                                        autoFocus
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-600 dark:text-amber-400"
                                        aria-label="Search"
                                    >
                                        <Search className="h-5 w-5" />
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Desktop header */}
                    <div className="hidden lg:flex items-center justify-between h-16">
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

                        {/* Desktop Navigation with Mega Menus */}
                        <div className="flex items-center space-x-1">
                            {/* Eyeglasses Dropdown */}
                            <div
                                className="relative"
                                onMouseEnter={() => handleDropdownEnter('eyeglasses')}
                                onMouseLeave={handleDropdownLeave}
                            >
                                <button
                                    className={cn(
                                        "flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors rounded-lg",
                                        activeDropdown === 'eyeglasses'
                                            ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20"
                                            : "text-black/70 dark:text-white/70 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                    )}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setActiveDropdown(activeDropdown === 'eyeglasses' ? null : 'eyeglasses')
                                    }}
                                >
                                    Eyeglasses
                                    <ChevronDown className={cn(
                                        "h-4 w-4 transition-transform duration-200",
                                        activeDropdown === 'eyeglasses' && "rotate-180"
                                    )} />
                                </button>

                                {/* Eyeglasses Mega Menu */}
                                {activeDropdown === 'eyeglasses' && (
                                    <div
                                        className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-amber-100 dark:border-amber-900/30 py-2 z-50"
                                        onMouseEnter={() => handleDropdownEnter('eyeglasses')}
                                        onMouseLeave={handleDropdownLeave}
                                    >
                                        <div className="px-3 py-2 border-b border-amber-100 dark:border-amber-900/30 mb-1">
                                            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Shop Eyeglasses</span>
                                        </div>
                                        {megaMenuData.eyeglasses.map((item) => (
                                            <Link
                                                key={item.label}
                                                to={item.href}
                                                className="flex items-center justify-between px-4 py-2.5 text-sm text-black/70 dark:text-white/70 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                                                onClick={() => setActiveDropdown(null)}
                                            >
                                                <span>{item.label}</span>
                                                {item.badge && (
                                                    <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-full">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </Link>
                                        ))}
                                        <div className="border-t border-amber-100 dark:border-amber-900/30 mt-1 pt-1">
                                            <Link
                                                to="/collections?category=eyeglasses"
                                                className="block px-4 py-2.5 text-sm font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                                                onClick={() => setActiveDropdown(null)}
                                            >
                                                View All Eyeglasses →
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sunglasses Dropdown */}
                            <div
                                className="relative"
                                onMouseEnter={() => handleDropdownEnter('sunglasses')}
                                onMouseLeave={handleDropdownLeave}
                            >
                                <button
                                    className={cn(
                                        "flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors rounded-lg",
                                        activeDropdown === 'sunglasses'
                                            ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20"
                                            : "text-black/70 dark:text-white/70 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                    )}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setActiveDropdown(activeDropdown === 'sunglasses' ? null : 'sunglasses')
                                    }}
                                >
                                    Sunglasses
                                    <ChevronDown className={cn(
                                        "h-4 w-4 transition-transform duration-200",
                                        activeDropdown === 'sunglasses' && "rotate-180"
                                    )} />
                                </button>

                                {/* Sunglasses Mega Menu */}
                                {activeDropdown === 'sunglasses' && (
                                    <div
                                        className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-amber-100 dark:border-amber-900/30 py-2 z-50"
                                        onMouseEnter={() => handleDropdownEnter('sunglasses')}
                                        onMouseLeave={handleDropdownLeave}
                                    >
                                        <div className="px-3 py-2 border-b border-amber-100 dark:border-amber-900/30 mb-1">
                                            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Shop Sunglasses</span>
                                        </div>
                                        {megaMenuData.sunglasses.map((item) => (
                                            <Link
                                                key={item.label}
                                                to={item.href}
                                                className="flex items-center justify-between px-4 py-2.5 text-sm text-black/70 dark:text-white/70 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                                                onClick={() => setActiveDropdown(null)}
                                            >
                                                <span>{item.label}</span>
                                                {item.badge && (
                                                    <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-full">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </Link>
                                        ))}
                                        <div className="border-t border-amber-100 dark:border-amber-900/30 mt-1 pt-1">
                                            <Link
                                                to="/collections?category=sunglasses"
                                                className="block px-4 py-2.5 text-sm font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                                                onClick={() => setActiveDropdown(null)}
                                            >
                                                View All Sunglasses →
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Other Nav Links */}
                            <Link
                                to="/collections"
                                className="px-4 py-2 text-sm font-medium text-black/70 dark:text-white/70 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors rounded-lg"
                            >
                                New Arrivals
                            </Link>
                            <Link
                                to="/contact"
                                className="px-4 py-2 text-sm font-medium text-black/70 dark:text-white/70 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors rounded-lg"
                            >
                                Contact
                            </Link>
                        </div>

                        {/* Right Side Icons */}
                        <div className="flex items-center space-x-1">
                            {/* Search */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 text-black/70 dark:text-white/70 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                                onClick={() => setShowSearch(!showSearch)}
                            >
                                <Search className="h-5 w-5" />
                            </Button>

                            {/* Wishlist */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 text-black/70 dark:text-white/70 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors relative"
                                onClick={() => navigate('/profile?tab=wishlist')}
                            >
                                <Heart className="h-5 w-5" />
                                {wishlistItems > 0 && (
                                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
                                        {wishlistItems > 9 ? '9+' : wishlistItems}
                                    </span>
                                )}
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
                                        <User className="h-5 w-5" />
                                    </Button>

                                    {showUserMenu && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-amber-100 dark:border-amber-900/30 py-2 z-50">
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
                                    className="text-sm font-medium text-black/70 dark:text-white/70 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                                    onClick={() => navigate('/login')}
                                >
                                    Sign In
                                </Button>
                            )}

                            {/* Theme Toggle */}
                            <ThemeToggle />

                            {/* Cart */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 text-black/70 dark:text-white/70 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors relative"
                                onClick={() => navigate('/cart')}
                            >
                                <ShoppingCart className="h-5 w-5" />
                                {totalItems > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                        {totalItems}
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Desktop Search Bar */}
                {showSearch && (
                    <div className="hidden lg:block border-t border-amber-100 dark:border-amber-900/30 bg-white dark:bg-gray-950">
                        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
                            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
                                <input
                                    type="text"
                                    placeholder="Search for eyeglasses, sunglasses..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-5 py-3 pl-12 pr-4 bg-amber-50 dark:bg-gray-800 border border-amber-200 dark:border-amber-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-500 focus:border-amber-400 transition-all text-sm text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40"
                                    autoFocus
                                />
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-600 dark:text-amber-400" />
                                <button
                                    type="button"
                                    onClick={() => setShowSearch(false)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40 hover:text-black/60 dark:hover:text-white/60"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden border-t border-amber-100 dark:border-amber-900/30 bg-white dark:bg-gray-950 shadow-lg max-h-[70vh] overflow-y-auto">
                        <div className="px-4 pt-4 pb-6">
                            {/* Eyeglasses Section */}
                            <div className="mb-4">
                                <h3 className="px-3 py-2 text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                                    Eyeglasses
                                </h3>
                                {megaMenuData.eyeglasses.map((item) => (
                                    <Link
                                        key={item.label}
                                        to={item.href}
                                        className="flex items-center justify-between px-3 py-3 text-base font-medium text-black/70 dark:text-white/70 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <span>{item.label}</span>
                                        {item.badge && (
                                            <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-full">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                ))}
                            </div>

                            {/* Sunglasses Section */}
                            <div className="mb-4 border-t border-amber-100 dark:border-amber-900/30 pt-4">
                                <h3 className="px-3 py-2 text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                                    Sunglasses
                                </h3>
                                {megaMenuData.sunglasses.map((item) => (
                                    <Link
                                        key={item.label}
                                        to={item.href}
                                        className="flex items-center justify-between px-3 py-3 text-base font-medium text-black/70 dark:text-white/70 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <span>{item.label}</span>
                                        {item.badge && (
                                            <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-full">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                ))}
                            </div>

                            {/* Other Links */}
                            <div className="border-t border-amber-100 dark:border-amber-900/30 pt-4 space-y-1">
                                <Link
                                    to="/collections"
                                    className="block px-3 py-3 text-base font-medium text-black/70 dark:text-white/70 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    New Arrivals
                                </Link>
                                <Link
                                    to="/orders"
                                    className="block px-3 py-3 text-base font-medium text-black/70 dark:text-white/70 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Track Order
                                </Link>
                                <Link
                                    to="/contact"
                                    className="block px-3 py-3 text-base font-medium text-black/70 dark:text-white/70 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Contact Us
                                </Link>
                            </div>

                            {/* Mobile User Options */}
                            <div className="border-t border-amber-100 dark:border-amber-900/30 mt-4 pt-4">
                                {isAuthenticated ? (
                                    <>
                                        <div className="px-3 py-2 mb-2">
                                            <p className="text-sm font-medium text-black dark:text-white truncate">{user?.name}</p>
                                            <p className="text-xs text-black/50 dark:text-white/50 truncate">{user?.email}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                navigate('/profile')
                                                setIsMobileMenuOpen(false)
                                            }}
                                            className="w-full text-left px-3 py-3 text-base font-medium text-black/70 dark:text-white/70 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                                        >
                                            My Profile
                                        </button>
                                        <button
                                            onClick={() => {
                                                navigate('/orders')
                                                setIsMobileMenuOpen(false)
                                            }}
                                            className="w-full text-left px-3 py-3 text-base font-medium text-black/70 dark:text-white/70 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                                        >
                                            My Orders
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleLogout()
                                                setIsMobileMenuOpen(false)
                                            }}
                                            className="w-full text-left px-3 py-3 text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2"
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
                                            className="w-full text-left px-3 py-3 text-base font-medium text-black/70 dark:text-white/70 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                                        >
                                            Sign In
                                        </button>
                                        <button
                                            onClick={() => {
                                                navigate('/signup')
                                                setIsMobileMenuOpen(false)
                                            }}
                                            className="w-full text-left px-3 py-3 text-base font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                                        >
                                            Create Account
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
