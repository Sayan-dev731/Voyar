import { motion } from 'framer-motion'
import { Eye, Sparkles, Shield, Truck, Award, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BentoCardProps {
    title: string
    description: string
    icon: React.ReactNode
    className?: string
    gradient?: string
}

const BentoCard = ({ title, description, icon, className, gradient }: BentoCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={cn(
                "group relative overflow-hidden rounded-3xl p-8 transition-all duration-300",
                "bg-gradient-to-br hover:shadow-2xl hover:scale-[1.02]",
                gradient,
                className
            )}
        >
            <div className="relative z-10">
                <div className="mb-4 inline-flex items-center justify-center rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
                    {icon}
                </div>
                <h3 className="mb-2 text-2xl font-bold text-white">{title}</h3>
                <p className="text-white/80">{description}</p>
            </div>

            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            {/* Floating particles effect */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute h-2 w-2 rounded-full bg-white/20"
                        animate={{
                            x: [0, 100, 0],
                            y: [0, -100, 0],
                            opacity: [0, 1, 0],
                        }}
                        transition={{
                            duration: 3 + i,
                            repeat: Infinity,
                            delay: i * 0.5,
                        }}
                        style={{
                            left: `${20 + i * 30}%`,
                            top: `${50 + i * 10}%`,
                        }}
                    />
                ))}
            </div>
        </motion.div>
    )
}

const BentoGrid = () => {
    const features = [
        {
            title: "Premium Quality",
            description: "Handcrafted lenses with precision engineering for ultimate clarity and comfort",
            icon: <Award className="h-8 w-8 text-white" />,
            gradient: "from-purple-600 to-pink-600",
            className: "md:col-span-2 md:row-span-2"
        },
        {
            title: "UV Protection",
            description: "100% UV protection to keep your eyes safe from harmful rays",
            icon: <Shield className="h-8 w-8 text-white" />,
            gradient: "from-blue-600 to-cyan-600",
            className: "md:col-span-1 md:row-span-1"
        },
        {
            title: "Virtual Try-On",
            description: "Experience our AI-powered virtual try-on technology",
            icon: <Eye className="h-8 w-8 text-white" />,
            gradient: "from-orange-600 to-red-600",
            className: "md:col-span-1 md:row-span-1"
        },
        {
            title: "Free Shipping",
            description: "Complimentary shipping on all orders over $50",
            icon: <Truck className="h-8 w-8 text-white" />,
            gradient: "from-green-600 to-teal-600",
            className: "md:col-span-1 md:row-span-1"
        },
        {
            title: "Premium Materials",
            description: "Lightweight titanium and acetate frames built to last",
            icon: <Sparkles className="h-8 w-8 text-white" />,
            gradient: "from-yellow-600 to-orange-600",
            className: "md:col-span-1 md:row-span-1"
        },
        {
            title: "5-Star Rated",
            description: "Trusted by over 50,000+ satisfied customers worldwide",
            icon: <Star className="h-8 w-8 text-white" />,
            gradient: "from-indigo-600 to-purple-600",
            className: "md:col-span-2 md:row-span-1"
        },
    ]

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white py-24">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem]" />

            <div className="container relative mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16 text-center"
                >
                    <h2 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
                        Why Choose <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Voyar</span>
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-gray-600">
                        Experience the perfect blend of style, comfort, and cutting-edge technology
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:grid-rows-3">
                    {features.map((feature, index) => (
                        <BentoCard key={index} {...feature} />
                    ))}
                </div>

                {/* Call to action */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="mt-16 text-center"
                >
                    <a
                        href="/collections"
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 text-lg font-semibold text-white transition-transform hover:scale-105"
                    >
                        Explore Collection
                        <Sparkles className="h-5 w-5" />
                    </a>
                </motion.div>
            </div>
        </section>
    )
}

export default BentoGrid
