import { motion, useMotionValue, useSpring } from 'framer-motion'
import { Eye, Sparkles, Shield, Truck, Award, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { Button } from './ui/button'
import { useCallback, useRef, useState } from 'react'

interface BentoCardProps {
    title: string
    description: string
    icon: React.ReactNode
    className?: string
    gradient?: string
    index?: number
}

const BentoCard = ({ title, description, icon, className, gradient, index = 0 }: BentoCardProps) => {
    const cardRef = useRef<HTMLDivElement>(null)
    const mouseX = useMotionValue(0.5)
    const mouseY = useMotionValue(0.5)

    const springX = useSpring(mouseX, { stiffness: 200, damping: 30 })
    const springY = useSpring(mouseY, { stiffness: 200, damping: 30 })

    const [particleAnimations] = useState(() =>
        [...Array(5)].map(() => ({
            xEnd: 50 + Math.random() * 50,
            yEnd: -50 - Math.random() * 50,
            duration: 2 + Math.random() * 2
        }))
    )

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const card = cardRef.current
        if (!card) return
        const rect = card.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width
        const y = (e.clientY - rect.top) / rect.height
        mouseX.set(x)
        mouseY.set(y)
    }, [mouseX, mouseY])

    const handleMouseLeave = useCallback(() => {
        mouseX.set(0.5)
        mouseY.set(0.5)
    }, [mouseX, mouseY])

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={cn(
                "bento-card group relative overflow-hidden rounded-3xl p-8 lg:p-10 transition-all duration-500",
                "bg-gradient-to-br hover:shadow-2xl hover:scale-[1.02]",
                "ring-1 ring-white/15",
                gradient,
                className
            )}
            style={{
                '--mouse-x': `${springX.get() * 100}%`,
                '--mouse-y': `${springY.get() * 100}%`,
            } as React.CSSProperties}
        >
            {/* Mouse-follow glow effect */}
            <motion.div
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                    background: `radial-gradient(600px circle at ${springX.get() * 100}% ${springY.get() * 100}%, rgba(255,255,255,0.15), transparent 40%)`,
                }}
            />

            <div className="relative z-10">
                <motion.div
                    className="mb-4 inline-flex items-center justify-center rounded-2xl bg-white/10 p-4 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-white/20"
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.5 }}
                >
                    {icon}
                </motion.div>
                <h3 className="mb-3 text-xl lg:text-2xl font-bold text-white">{title}</h3>
                <p className="text-white/80 text-sm lg:text-base leading-relaxed">{description}</p>
            </div>

            {/* Floating particles effect */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                {particleAnimations.map((animation, i) => (
                    <motion.div
                        key={i}
                        className="absolute h-1.5 w-1.5 rounded-full bg-white/30"
                        animate={{
                            x: [0, animation.xEnd, 0],
                            y: [0, animation.yEnd, 0],
                            opacity: [0, 1, 0],
                        }}
                        transition={{
                            duration: animation.duration,
                            repeat: Infinity,
                            delay: i * 0.3,
                        }}
                        style={{
                            left: `${20 + i * 15}%`,
                            top: `${50 + i * 8}%`,
                        }}
                    />
                ))}
            </div>

            {/* Corner accent */}
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-white/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </motion.div>
    )
}

const BentoGrid = () => {
    const features = [
        {
            title: "Premium Quality",
            description: "Handcrafted lenses with precision engineering for ultimate clarity and comfort",
            icon: <Award className="h-8 w-8 lg:h-10 lg:w-10 text-white" />,
            gradient: "from-amber-500 to-amber-600",
            className: "md:col-span-2 md:row-span-2"
        },
        {
            title: "UV Protection",
            description: "100% UV protection to keep your eyes safe from harmful rays",
            icon: <Shield className="h-8 w-8 text-white" />,
            gradient: "from-amber-400 to-amber-600",
            className: "md:col-span-1 md:row-span-1"
        },
        {
            title: "Virtual Try-On",
            description: "Experience our AI-powered virtual try-on technology",
            icon: <Eye className="h-8 w-8 text-white" />,
            gradient: "from-amber-500 to-amber-700",
            className: "md:col-span-1 md:row-span-1"
        },
        {
            title: "Free Shipping",
            description: "Complimentary shipping on all orders over $50",
            icon: <Truck className="h-8 w-8 text-white" />,
            gradient: "from-amber-500 to-amber-700",
            className: "md:col-span-1 md:row-span-1"
        },
        {
            title: "Premium Materials",
            description: "Lightweight titanium and acetate frames built to last",
            icon: <Sparkles className="h-8 w-8 text-white" />,
            gradient: "from-amber-400 to-amber-500",
            className: "md:col-span-1 md:row-span-1"
        },
        {
            title: "5-Star Rated",
            description: "Trusted by over 50,000+ satisfied customers worldwide",
            icon: <Star className="h-8 w-8 text-white" />,
            gradient: "from-amber-500 to-amber-700",
            className: "md:col-span-2 md:row-span-1"
        },
    ]

    return (
        <section className="relative overflow-hidden py-20 sm:py-28 lg:py-36 bg-gradient-to-b from-white via-amber-50/30 to-white">
            {/* Background decorations */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl animate-float-slow" />
                <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-amber-300/30 blur-3xl animate-float-reverse" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-amber-100/20 to-transparent rounded-full" />
            </div>

            <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-12 lg:mb-20 text-center"
                >
                    <motion.div
                        className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-sm px-5 py-2.5 text-xs font-semibold text-black/70 ring-1 ring-black/5 shadow-sm"
                        whileHover={{ scale: 1.05 }}
                    >
                        <Sparkles className="h-4 w-4 text-amber-600" />
                        Built for comfort, designed for style
                    </motion.div>
                    <h2 className="mb-5 text-4xl sm:text-5xl lg:text-6xl font-[700] text-black tracking-tight">
                        Why Choose{' '}
                        <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 bg-clip-text text-transparent bg-size-200 animate-gradient">
                            Voyar
                        </span>
                    </h2>
                    <p className="mx-auto max-w-2xl text-base sm:text-lg lg:text-xl text-black/60">
                        Experience the perfect blend of style, comfort, and cutting-edge technology
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 md:grid-rows-3">
                    {features.map((feature, index) => (
                        <BentoCard key={index} {...feature} index={index} />
                    ))}
                </div>

                {/* Call to action */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="mt-12 lg:mt-20 text-center"
                >
                    <Link to="/collections" className="inline-flex">
                        <Button
                            size="lg"
                            className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 px-10 py-7 text-base lg:text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-amber-200/50 hover:shadow-amber-300/60"
                        >
                            Explore Collection
                            <Sparkles className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}

export default BentoGrid
