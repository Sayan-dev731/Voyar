import { useRef } from 'react'
import { Eye, Shield, Truck, Award } from 'lucide-react'

const features = [
    {
        icon: Eye,
        title: 'Free Eye Test',
        description: 'Get your eyes tested at home by certified professionals',
        number: 500,
        suffix: '+',
    },
    {
        icon: Shield,
        title: '1 Year Warranty',
        description: 'Complete protection against manufacturing defects',
        number: 100,
        suffix: '%',
    },
    {
        icon: Truck,
        title: 'Free Shipping',
        description: 'Fast and free delivery on all orders above $50',
        number: 24,
        suffix: 'h',
    },
    {
        icon: Award,
        title: 'Premium Quality',
        description: 'All products are 100% authentic and certified',
        number: 10,
        suffix: 'M+',
    },
]

export const Features = () => {
    const sectionRef = useRef<HTMLDivElement>(null)
    const featuresRef = useRef<HTMLDivElement>(null)
    const counterRefs = useRef<(HTMLDivElement | null)[]>([])

    return (
        <div ref={sectionRef} className="py-20 sm:py-24 lg:py-32 bg-white border-y border-black/[0.08]">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div
                    ref={featuresRef}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12"
                >
                    {features.map((feature, index) => {
                        const Icon = feature.icon
                        return (
                            <div
                                key={index}
                                className="text-center p-6 sm:p-8 rounded-xl bg-gradient-to-br from-amber-50/80 to-white border border-amber-200/60 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-100/50 transition-all duration-300 why-us-card"
                            >
                                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl mb-5 shadow-md">
                                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                                </div>
                                <div className="text-4xl sm:text-5xl font-[600] text-black mb-3">
                                    <div
                                        ref={(el) => { counterRefs.current[index] = el }}
                                        className="number inline-block"
                                    >
                                        {feature.number}
                                    </div>
                                    <span>{feature.suffix}</span>
                                </div>
                                <h3 className="text-base sm:text-lg font-[600] text-black mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-black/60 leading-relaxed">{feature.description}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
