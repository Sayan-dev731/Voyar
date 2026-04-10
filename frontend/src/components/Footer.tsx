import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Facebook, Instagram, Youtube, Mail } from 'lucide-react'

const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' },
]

const footerLinks = {
    shop: [
        { label: 'Men', href: '/collections?gender=men' },
        { label: 'Women', href: '/collections?gender=women' },
        { label: 'New Arrivals', href: '/collections' },
        { label: 'Bestsellers', href: '/collections?sort=popular' },
    ],
    company: [
        { label: 'About Us', href: '/about' },
        { label: 'Contact', href: '/contact' },
        { label: 'Blog', href: '/blog' },
    ],
    support: [
        { label: 'Track Order', href: '/orders' },
        { label: 'Shipping Policy', href: '/shipping' },
        { label: 'Returns & Exchanges', href: '/returns' },
        { label: 'Privacy Policy', href: '/privacy' },
    ],
}

export const Footer = () => {
    const [email, setEmail] = useState('')
    const [subscribed, setSubscribed] = useState(false)

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault()
        if (email.trim()) {
            setSubscribed(true)
            setEmail('')
            setTimeout(() => setSubscribed(false), 3000)
        }
    }

    return (
        <footer className="bg-black text-white">
            {/* Newsletter Strip */}
            <div className="border-b border-white/10">
                <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-10 py-12 sm:py-16">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                        <div>
                            <h3 className="text-2xl sm:text-3xl font-light tracking-tight mb-2">
                                Ready to Find Your Perfect Pair?
                            </h3>
                            <p className="text-white/40 text-sm">
                                Subscribe for exclusive offers, new arrivals, and eyewear tips.
                            </p>
                        </div>

                        {subscribed ? (
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm text-white/60"
                            >
                                Thank you for subscribing!
                            </motion.p>
                        ) : (
                            <form onSubmit={handleSubscribe} className="flex w-full lg:w-auto">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="flex-1 lg:w-[300px] px-5 py-3.5 bg-transparent border border-amber-500/30 text-white placeholder:text-white/30 text-sm outline-none focus:border-amber-400 transition-colors rounded-l-xl"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="px-6 py-3.5 bg-amber-500 text-white text-[13px] font-medium tracking-[0.04em] uppercase hover:bg-amber-600 transition-colors shrink-0 rounded-r-xl"
                                >
                                    Subscribe
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-10 py-12 sm:py-16">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-10 lg:gap-16">
                    {/* Brand */}
                    <div className="col-span-2">
                        <Link to="/" className="inline-block mb-5">
                            <img
                                src="/images/logo.jpeg"
                                alt="Voyar"
                                className="h-10 w-auto brightness-0 invert"
                            />
                        </Link>
                        <p className="text-white/40 text-sm mb-6 leading-relaxed max-w-xs">
                            Premium eyewear for the modern individual. Crafted with precision, designed with purpose.
                        </p>
                        <div className="flex items-center gap-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    className="w-9 h-9 rounded-full border border-amber-500/20 flex items-center justify-center text-amber-400/60 hover:text-amber-400 hover:border-amber-400/50 transition-all duration-300"
                                    aria-label={social.label}
                                >
                                    <social.icon className="h-4 w-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Shop */}
                    <div>
                        <h4 className="text-[11px] tracking-[0.2em] uppercase text-amber-400/50 mb-5">
                            Shop
                        </h4>
                        <ul className="space-y-3">
                            {footerLinks.shop.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        to={link.href}
                                        className="text-sm text-white/50 hover:text-amber-400 transition-colors duration-300"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="text-[11px] tracking-[0.2em] uppercase text-amber-400/50 mb-5">
                            Company
                        </h4>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        to={link.href}
                                        className="text-sm text-white/50 hover:text-amber-400 transition-colors duration-300"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-[11px] tracking-[0.2em] uppercase text-amber-400/50 mb-5">
                            Support
                        </h4>
                        <ul className="space-y-3">
                            {footerLinks.support.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        to={link.href}
                                        className="text-sm text-white/50 hover:text-amber-400 transition-colors duration-300"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10">
                <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-10 py-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-white/30">
                            © 2025 Voyar Eyewear. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6 text-xs text-white/30">
                            <Link to="/privacy" className="hover:text-amber-400/60 transition-colors">Privacy</Link>
                            <Link to="/terms" className="hover:text-amber-400/60 transition-colors">Terms</Link>
                            <a href="mailto:voyareyewear@gmail.com" className="flex items-center gap-1 hover:text-amber-400/60 transition-colors">
                                <Mail className="h-3 w-3" />
                                voyareyewear@gmail.com
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
