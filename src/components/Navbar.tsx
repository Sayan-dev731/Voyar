import { useState, useEffect } from 'react'
import { ShoppingCart, Search, Menu, X } from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navLinks = [
        { name: 'Eyeglasses', href: '#eyeglasses' },
        { name: 'Sunglasses', href: '#sunglasses' },
        { name: 'Collection', href: '#collection' },
        { name: 'About', href: '#about' },
    ]

    return (
        <>
            <nav
                className={cn(
                    'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
                    isScrolled ? 'bg-white/95 backdrop-blur-xl border-b border-black/10 shadow-sm' : 'bg-white/80 backdrop-blur-md'
                )}
            >
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <h1 className="text-xl sm:text-2xl font-[600] tracking-tight text-black">
                                Voyar
                            </h1>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center space-x-8">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="text-sm font-medium text-black/60 hover:text-amber-600 transition-colors duration-200"
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
                                className="hidden md:flex h-10 w-10 text-black/60 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                                <Search className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 text-black/60 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                                <ShoppingCart className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="lg:hidden h-10 w-10 text-black/60 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                {isMobileMenuOpen ? (
                                    <X className="h-5 w-5" />
                                ) : (
                                    <Menu className="h-5 w-5" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden border-t border-black/10 bg-white backdrop-blur-xl shadow-lg">
                        <div className="px-4 pt-4 pb-6 space-y-1">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="block px-4 py-3 text-base font-medium text-black/80 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors duration-150"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </nav>
        </>
    )
}
