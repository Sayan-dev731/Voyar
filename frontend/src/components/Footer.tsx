import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, Heart, Clock } from 'lucide-react'

const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' },
]

export const Footer = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    }

    return (
        <footer className="bg-white border-t border-amber-100">
            {/* Main Footer Content */}
            <motion.div
                className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
            >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
                    {/* Brand & Social */}
                    <motion.div variants={itemVariants} className="col-span-2 md:col-span-1">
                        <Link to="/" className="inline-block mb-4">
                            <img
                                src="/images/logo.jpeg"
                                alt="Voyar"
                                className="h-10 w-auto"
                            />
                        </Link>
                        <p className="text-sm text-black/60 mb-5 leading-relaxed">
                            Get the perfect vision and style. Premium eyewear for modern living.
                        </p>
                        <div className="flex items-center gap-3">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 hover:bg-amber-100 hover:border-amber-300 transition-colors"
                                    aria-label={social.label}
                                >
                                    <social.icon className="h-5 w-5" />
                                </a>
                            ))}
                        </div>
                    </motion.div>

                    {/* Policies */}
                    <motion.div variants={itemVariants}>
                        <h4 className="text-sm font-semibold text-black uppercase tracking-wider mb-4">
                            Policies
                        </h4>
                        <ul className="space-y-3">
                            {[
                                { label: 'Privacy Policy', href: '/privacy' },
                                { label: 'Terms & Conditions', href: '/terms' },
                                { label: 'Delivery & Shipping', href: '/shipping' },
                                { label: 'Refund Policy', href: '/refund' },
                                { label: 'Frame Guide', href: '/frame-guide' },
                            ].map((link) => (
                                <li key={link.label}>
                                    <Link
                                        to={link.href}
                                        className="text-sm text-black/60 hover:text-amber-600 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Return & Exchange */}
                    <motion.div variants={itemVariants}>
                        <h4 className="text-sm font-semibold text-black uppercase tracking-wider mb-4">
                            Return & Exchange
                        </h4>
                        <ul className="space-y-3">
                            <li>
                                <Link
                                    to="/returns"
                                    className="text-sm text-black/60 hover:text-amber-600 transition-colors"
                                >
                                    Return Portal
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/orders"
                                    className="text-sm text-black/60 hover:text-amber-600 transition-colors"
                                >
                                    Track Your Order
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/contact"
                                    className="text-sm text-black/60 hover:text-amber-600 transition-colors"
                                >
                                    Contact Support
                                </Link>
                            </li>
                        </ul>
                    </motion.div>

                    {/* Contact Us */}
                    <motion.div variants={itemVariants}>
                        <h4 className="text-sm font-semibold text-black uppercase tracking-wider mb-4">
                            Contact Us
                        </h4>
                        <p className="text-sm text-black/60 mb-4">
                            Questions? We're here for you Monday - Friday 10am-6pm IST.
                        </p>
                        <ul className="space-y-3">
                            <li>
                                <a
                                    href="mailto:voyareyewear@gmail.com"
                                    className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
                                >
                                    <Mail className="h-4 w-4" />
                                    voyareyewear@gmail.com
                                </a>
                            </li>
                            <li>
                                <a
                                    href="tel:+919667194067"
                                    className="flex items-center gap-2 text-sm text-black/60 hover:text-amber-600 transition-colors"
                                >
                                    <Phone className="h-4 w-4" />
                                    +91 9667194067
                                </a>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-black/60">
                                <Clock className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                Mon - Fri: 10am - 6pm IST
                            </li>
                            <li className="flex items-start gap-2 text-sm text-black/60">
                                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                Patna City-800008, Bihar, India
                            </li>
                        </ul>
                    </motion.div>
                </div>
            </motion.div>

            {/* Bottom Bar */}
            <div className="border-t border-amber-100 bg-amber-50/50">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-black/50 flex items-center gap-1">
                            © 2024 Voyar Eyewear. Made with
                            <Heart className="h-3 w-3 text-red-400 fill-red-400" />
                            in India
                        </p>
                        <div className="flex items-center gap-6">
                            <span className="text-xs text-black/50">Secure Payments</span>
                            <div className="flex items-center gap-2">
                                {/* Payment Icons Placeholder */}
                                <div className="w-8 h-5 bg-amber-100 rounded flex items-center justify-center text-xs text-amber-600 font-medium">
                                    UPI
                                </div>
                                <div className="w-8 h-5 bg-amber-100 rounded flex items-center justify-center text-xs text-amber-600 font-medium">
                                    COD
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
