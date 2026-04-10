import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export const ContactCTA = () => {
    return (
        <section className="relative py-24 sm:py-32 lg:py-40 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0">
                <img
                    src="/images/20251013_024158.jpg"
                    alt=""
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50" />
            </div>

            {/* Content */}
            <div className="relative max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-3xl mx-auto text-center"
                >
                    <p className="text-amber-400 text-[11px] tracking-[0.3em] uppercase mb-6">
                        Voyar Eyewear
                    </p>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-white leading-[1.15] tracking-tight mb-10">
                        Reach out today and let's start the conversation
                    </h2>
                    <Link
                        to="/contact"
                        className="group inline-flex items-center gap-3 bg-amber-500 text-white px-8 py-4 text-[13px] font-medium tracking-[0.08em] uppercase hover:bg-amber-600 transition-all duration-300 rounded-full"
                    >
                        Contact Us
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}

export default ContactCTA
