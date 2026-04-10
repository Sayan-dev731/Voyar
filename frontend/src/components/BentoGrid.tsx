import { motion } from 'framer-motion'
import { Shield, Droplets, Gem } from 'lucide-react'

interface FeatureCardProps {
    title: string
    description: string
    icon: React.ReactNode
    index?: number
}

const FeatureCard = ({ title, description, icon, index = 0 }: FeatureCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            className="group text-center p-8 sm:p-10"
        >
            {/* Icon */}
            <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 group-hover:border-amber-400 dark:group-hover:border-amber-700 transition-colors duration-500">
                {icon}
            </div>

            <h3 className="text-lg font-medium text-black dark:text-white mb-3 tracking-tight">
                {title}
            </h3>
            <p className="text-sm text-black/50 dark:text-white/50 leading-relaxed max-w-xs mx-auto">
                {description}
            </p>
        </motion.div>
    )
}

const BentoGrid = () => {
    const features = [
        {
            title: "UV Protection",
            description: "Keep your eyes safe from harmful UVA & UVB rays. Whether you're on the beach, driving, or outdoors, our lenses protect your vision.",
            icon: <Shield className="h-7 w-7 text-amber-600 dark:text-amber-400" />,
        },
        {
            title: "Anti-Glare Lenses",
            description: "No more glare from roads, water, or reflective surfaces. Polarized lenses enhance contrast and sharpen details for everyday life.",
            icon: <Droplets className="h-7 w-7 text-amber-600 dark:text-amber-400" />,
        },
        {
            title: "Scratch Resistant",
            description: "Life happens — but your lenses shouldn't suffer. Our scratch-resistant coating ensures durability, keeping your glasses looking brand new.",
            icon: <Gem className="h-7 w-7 text-amber-600 dark:text-amber-400" />,
        },
    ]

    return (
        <section className="py-16 sm:py-20 lg:py-28 bg-white dark:bg-gray-950 transition-colors duration-300">
            <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-10 sm:mb-16"
                >
                    <p className="text-[11px] tracking-[0.2em] uppercase text-amber-600 dark:text-amber-400 mb-3">
                        // Every pair is built with advanced technology and crafted details
                    </p>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-black dark:text-white tracking-tight mb-5">
                        Eyewear Designed for Clarity and Confidence
                    </h2>
                    <p className="text-base text-black/50 dark:text-white/50 max-w-3xl mx-auto leading-relaxed">
                        Our eyewear is more than just stylish frames — it's a blend of advanced lens technology, lightweight comfort, and premium craftsmanship. Designed to protect your eyes, elevate your look, and fit seamlessly into your lifestyle.
                    </p>
                </motion.div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-amber-200 dark:divide-amber-900/30 border border-amber-200 dark:border-amber-900/30 rounded-2xl overflow-hidden bg-white dark:bg-gray-900">
                    {features.map((feature, index) => (
                        <FeatureCard key={feature.title} {...feature} index={index} />
                    ))}
                </div>
            </div>
        </section>
    )
}

export default BentoGrid
