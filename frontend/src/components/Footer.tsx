import { motion } from 'framer-motion'
import { Facebook, Twitter, Instagram, Youtube, Mail, MapPin, Heart } from 'lucide-react'

const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' },
]

export const Footer = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 },
        },
    }

    return (
        <footer className="relative bg-gradient-to-b from-white via-amber-50/30 to-amber-50/50 border-t border-amber-200/40 text-black/60 overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                <div className="absolute bottom-0 right-0 w-60 h-60 bg-amber-200/20 rounded-full blur-3xl translate-y-1/2 translate-x-1/2" />
            </div>

            <motion.div
                className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12">
                    {/* Company Info */}
                    <motion.div variants={itemVariants}>
                        <h3 className="text-2xl sm:text-3xl font-[600] text-black mb-4 tracking-tight">
                            <span className="text-gradient-amber">Voyar</span>
                        </h3>
                        <p className="mb-6 text-sm leading-relaxed">
                            Premium eyewear for modern living. Quality you can see, comfort you can feel.
                        </p>
                        <div className="flex space-x-3">
                            {socialLinks.map((social, index) => (
                                <motion.a
                                    key={social.label}
                                    href={social.href}
                                    className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-50 to-white border border-amber-200 flex items-center justify-center hover:bg-amber-100 hover:border-amber-400 transition-all duration-300 shadow-sm hover:shadow-md group"
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                    aria-label={social.label}
                                >
                                    <social.icon className="h-4 w-4 text-amber-600 group-hover:text-amber-700 transition-colors" />
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>

                    {/* Customer Service */}
                    <motion.div variants={itemVariants}>
                        <h4 className="text-black font-[600] mb-4 text-base">Customer Service</h4>
                        <ul className="space-y-2.5 text-sm">
                            {['24x7 Support', 'FAQs'].map((link) => (
                                <li key={link}>
                                    <a
                                        href="#"
                                        className="hover:text-amber-600 transition-colors inline-block animated-underline"
                                    >
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Contact Info */}
                    <motion.div variants={itemVariants}>
                        <h4 className="text-black font-[600] mb-4 text-base">Contact Us</h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start group">
                                <Mail className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-amber-500" />
                                <a
                                    href="mailto:voyareyewear@gmail.com"
                                    className="text-amber-600 font-[600] hover:text-amber-700 transition-colors"
                                >
                                    voyareyewear@gmail.com
                                </a>
                            </li>
                            <li className="flex items-start">
                                <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-amber-500" />
                                <span>Patna City-800008, Bihar, India</span>
                            </li>
                        </ul>
                    </motion.div>

                    {/* Newsletter Mini */}
                    <motion.div variants={itemVariants}>
                        <h4 className="text-black font-[600] mb-4 text-base">Stay Connected</h4>
                        <p className="text-sm mb-4">Get updates on new arrivals and exclusive offers.</p>
                        <a
                            href="#newsletter"
                            className="inline-flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors group"
                        >
                            Subscribe to Newsletter
                            <motion.span
                                animate={{ x: [0, 4, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                →
                            </motion.span>
                        </a>
                    </motion.div>
                </div>

                {/* Bottom Bar */}
                <motion.div
                    variants={itemVariants}
                    className="border-t border-amber-200/40 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
                >
                    <p className="text-xs text-black/50 flex items-center gap-1">
                        © 2024 Voyar. Made with{' '}
                        <motion.span
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        >
                            <Heart className="h-3 w-3 text-red-400 fill-red-400 inline" />
                        </motion.span>{' '}
                        in India
                    </p>
                    <div className="flex flex-wrap justify-center gap-6">
                        {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((link) => (
                            <a
                                key={link}
                                href="#"
                                className="text-xs text-black/50 hover:text-amber-600 transition-colors animated-underline"
                            >
                                {link}
                            </a>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </footer>
    )
}
