import { Facebook, Twitter, Instagram, Youtube, Mail, MapPin } from 'lucide-react'

export const Footer = () => {
    return (
        <footer className="bg-gradient-to-b from-white to-amber-50/20 border-t border-amber-200/40 text-black/60">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12">
                    {/* Company Info */}
                    <div>
                        <h3 className="text-2xl sm:text-3xl font-[600] text-black mb-4 tracking-tight">
                            Voyar
                        </h3>
                        <p className="mb-6 text-sm leading-relaxed">
                            Premium eyewear for modern living. Quality you can see, comfort you can feel.
                        </p>
                        <div className="flex space-x-3">
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center hover:bg-amber-100 hover:border-amber-400 transition-all duration-300"
                            >
                                <Facebook className="h-4 w-4 text-amber-600" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center hover:bg-amber-100 hover:border-amber-400 transition-all duration-300"
                            >
                                <Twitter className="h-4 w-4 text-amber-600" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center hover:bg-amber-100 hover:border-amber-400 transition-all duration-300"
                            >
                                <Instagram className="h-4 w-4 text-amber-600" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center hover:bg-amber-100 hover:border-amber-400 transition-all duration-300"
                            >
                                <Youtube className="h-4 w-4 text-amber-600" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    {/* <div>
                        <h4 className="text-black font-[600] mb-4 text-base">Quick Links</h4>
                        <ul className="space-y-2.5 text-sm">
                            {['About Us', 'Our Stores', 'Careers', 'Press', 'Blog'].map((link) => (
                                <li key={link}>
                                    <a href="#" className="hover:text-amber-600 transition-colors">
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div> */}

                    {/* Customer Service */}
                    <div>
                        <h4 className="text-black font-[600] mb-4 text-base">Customer Service</h4>
                        <ul className="space-y-2.5 text-sm">
                            {['24x7 Support', 'FAQs'].map(
                                (link) => (
                                    <li key={link}>
                                        <a href="#" className="hover:text-amber-600 transition-colors">
                                            {link}
                                        </a>
                                    </li>
                                )
                            )}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-black font-[600] mb-4 text-base">Contact Us</h4>
                        
                        <ul className="space-y-3 text-sm">
                            {/* <li className="flex items-start">
                                <Phone className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                <span>1800-123-4567</span>
                            </li> */}
                            <li className="flex items-start">
                                <Mail className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                <a href="mailto:voyareyewear@gmail.com" className="text-amber-600 font-[600] hover:text-amber-700 transition-colors ">
                                    voyareyewear@gmail.com
                                </a>
                            </li>
                            <li className="flex items-start">
                                <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                <span>Patna City-800008, Bihar, India</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-amber-200/40 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-black/50">© 2024 Voyar. All rights reserved.</p>
                    <div className="flex flex-wrap justify-center gap-6">
                        <a href="#" className="text-xs text-black/50 hover:text-amber-600 transition-colors">
                            Privacy Policy
                        </a>
                        <a href="#" className="text-xs text-black/50 hover:text-amber-600 transition-colors">
                            Terms of Service
                        </a>
                        <a href="#" className="text-xs text-black/50 hover:text-amber-600 transition-colors">
                            Cookie Policy
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
