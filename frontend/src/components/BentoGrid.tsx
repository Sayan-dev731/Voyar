import { motion } from 'framer-motion'
import { Eye, Sparkles, Shield, Truck, Award, Star, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from './ui/button'

interface FeatureCardProps {
    title: string
    description: string
    icon: React.ReactNode
    index?: number
}

const FeatureCard = ({ title, description, icon, index = 0 }: FeatureCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="group relative bg-white rounded-2xl p-6 lg:p-8 border border-amber-100 hover:border-amber-300 hover:shadow-xl transition-all duration-300"
        >
            {/* Icon */}
            <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-lg shadow-amber-200/50 group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>

            <h3 className="text-lg font-semibold text-black mb-2 group-hover:text-amber-700 transition-colors">
                {title}
            </h3>
            <p className="text-sm text-black/60 leading-relaxed">
                {description}
            </p>

            {/* Hover accent */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-amber-50 to-transparent rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.div>
    )
}

const BentoGrid = () => {
    const features = [
        {
            title: "Premium Quality",
            description: "Handcrafted lenses with precision engineering for ultimate clarity and comfort",
            icon: <Award className="h-6 w-6" />,
        },
        {
            title: "UV Protection",
            description: "100% UV protection to keep your eyes safe from harmful rays",
            icon: <Shield className="h-6 w-6" />,
        },
        {
            title: "Virtual Try-On",
            description: "Experience our AI-powered virtual try-on technology",
            icon: <Eye className="h-6 w-6" />,
        },
        {
            title: "Free Shipping",
            description: "Complimentary shipping on all orders across India",
            icon: <Truck className="h-6 w-6" />,
        },
        {
            title: "Premium Materials",
            description: "Lightweight titanium and acetate frames built to last",
            icon: <Sparkles className="h-6 w-6" />,
        },
        {
            title: "5-Star Rated",
            description: "Trusted by over 10,000+ satisfied customers",
            icon: <Star className="h-6 w-6" />,
        },
    ]

    return (
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-amber-50/30 to-white">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-4">
                        <Heart className="h-4 w-4 fill-amber-600" />
                        Exclusively at VOYAR
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-4">
                        Why Choose <span className="text-gradient-amber">Voyar</span>
                    </h2>
                    <p className="text-black/60 max-w-2xl mx-auto">
                        Get the perfect vision and style. Experience the difference with our premium eyewear collection.
                    </p>
                </motion.div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-10">
                    {features.map((feature, index) => (
                        <FeatureCard key={feature.title} {...feature} index={index} />
                    ))}
                </div>

                {/* Call to Action */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="text-center"
                >
                    <Link to="/collections">
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 rounded-full px-8 py-6 text-base font-semibold shadow-lg shadow-amber-200/50 hover:shadow-amber-300/60 transition-all duration-300 hover:scale-105"
                        >
                            <Sparkles className="mr-2 h-5 w-5" />
                            Explore Collection
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}

export default BentoGrid
