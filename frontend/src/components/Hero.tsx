import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'

export const Hero = () => {
    const promoLeftImage = '/images/Special%20Offer%20Black%20Friday%20Instagram%20Post.svg'

    const promoRightImages = useMemo(
        () => [
            '/images/DSC00834.JPG',
        ],
        []
    )
    const [activePromoRightIndex, setActivePromoRightIndex] = useState(0)

    useEffect(() => {
        if (promoRightImages.length <= 1) return
        const intervalId = window.setInterval(() => {
            setActivePromoRightIndex((idx) => (idx + 1) % promoRightImages.length)
        }, 2000)
        return () => window.clearInterval(intervalId)
    }, [promoRightImages.length])

    const tiles = useMemo(
        () => ({
            eyeglasses: [
                { label: 'Men', img: '/images/20251013_035040.jpg' },
                { label: 'Women', img: '/images/woman.png' },
                { label: 'Black Friday', img: promoLeftImage },
                { label: 'Free lens', img: '/images/20251013_024018.jpg' },
            ],
            sunglasses: [
                { label: 'Men', img: '/images/20251013_040836.jpg' },
                { label: 'Women', img: '/images/20251013_040226.jpg' },
                { label: 'Black Friday', img: promoLeftImage },
                { label: "Kid's", img: '/images/20251017_021422.jpg' },
            ],
        }),
        [promoLeftImage]
    )

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
            transition: {
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1] as const,
            },
        },
    }

    const tileVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1] as const,
            },
        },
    }

    return (
        <section className="relative bg-gradient-to-b from-white via-amber-50/20 to-white pt-24 sm:pt-28 overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-200/30 to-amber-100/20 rounded-full blur-3xl animate-float-slow" />
                <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-tr from-amber-300/20 to-amber-200/10 rounded-full blur-3xl animate-float-reverse" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-amber-100/10 to-transparent rounded-full" />
            </div>

            <motion.div
                className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header Badge */}
                <motion.div variants={itemVariants} className="flex items-center gap-2 mb-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-100 to-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 border border-amber-200/60 shadow-sm">
                        <Sparkles className="h-4 w-4 text-amber-600 animate-pulse" />
                        <span>Final Price Drop Fest</span>
                        <ArrowRight className="h-3 w-3 text-amber-600" />
                    </div>
                </motion.div>

                {/* Main Promo Banners - Larger on Desktop */}
                <motion.div variants={itemVariants} className="mt-3 grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                    <motion.div
                        className="group relative overflow-hidden rounded-2xl lg:rounded-3xl bg-white border border-black/10 shadow-lg hover:shadow-2xl transition-all duration-500"
                        whileHover={{ scale: 1.02, y: -4 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="hero-overlay">
                            <img
                                src={promoLeftImage}
                                alt="Black Friday offer"
                                className="h-[190px] sm:h-[260px] lg:h-[340px] xl:h-[400px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                loading="eager"
                            />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </motion.div>

                    <motion.div
                        className="group relative overflow-hidden rounded-2xl lg:rounded-3xl bg-white border border-black/10 shadow-lg hover:shadow-2xl transition-all duration-500"
                        whileHover={{ scale: 1.02, y: -4 }}
                        transition={{ duration: 0.3 }}
                    >
                        {promoRightImages.map((src, idx) => (
                            <img
                                key={src}
                                src={src}
                                alt="Offer banner"
                                className={
                                    'absolute inset-0 h-full w-full object-cover transition-all duration-700 ' +
                                    (idx === activePromoRightIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105')
                                }
                                loading={idx === 0 ? 'eager' : 'lazy'}
                            />
                        ))}
                        <div className="absolute inset-0 ring-1 ring-inset ring-black/5" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Decorative corner accent */}
                        <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-white/30 rounded-tr-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </motion.div>
                </motion.div>

                {/* Decorative Divider */}
                <motion.div variants={itemVariants} className="mt-8 relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gradient-to-r from-transparent via-amber-200 to-transparent" />
                    </div>
                    <div className="relative flex justify-center">
                        <div className="bg-white px-4">
                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500" />
                        </div>
                    </div>
                </motion.div>

                {/* Eyeglasses Section */}
                <motion.div variants={itemVariants} className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-[800] text-black tracking-tight">
                            Eyeglasses
                        </h2>
                        <Link
                            to="/collections?category=eyeglasses"
                            className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-1 group"
                        >
                            View All
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                    <motion.div
                        className="flex gap-4 lg:gap-6 overflow-x-auto pb-2 scrollbar-hide"
                        variants={containerVariants}
                    >
                        {tiles.eyeglasses.map((item, index) => (
                            <motion.div
                                key={item.label}
                                variants={tileVariants}
                                custom={index}
                            >
                                <Link
                                    to="/collections"
                                    className="flex-shrink-0 w-[92px] sm:w-[110px] lg:w-[140px] group"
                                    aria-label={item.label}
                                >
                                    <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl border border-black/10 bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:border-amber-300">
                                        <div className="relative">
                                            <img
                                                src={item.img}
                                                alt={item.label}
                                                className="h-[76px] sm:h-[90px] lg:h-[110px] w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </div>
                                    </div>
                                    <div className="mt-2 text-center text-sm lg:text-base font-medium text-black/70 group-hover:text-amber-600 transition-colors">
                                        {item.label}
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Sunglasses Section */}
                <motion.div variants={itemVariants} className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-[800] text-black tracking-tight">
                            Sunglasses
                        </h2>
                        <Link
                            to="/collections?category=sunglasses"
                            className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-1 group"
                        >
                            View All
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                    <motion.div
                        className="flex gap-4 lg:gap-6 overflow-x-auto pb-2 scrollbar-hide"
                        variants={containerVariants}
                    >
                        {tiles.sunglasses.map((item, index) => (
                            <motion.div
                                key={item.label}
                                variants={tileVariants}
                                custom={index}
                            >
                                <Link
                                    to="/collections"
                                    className="flex-shrink-0 w-[92px] sm:w-[110px] lg:w-[140px] group"
                                    aria-label={item.label}
                                >
                                    <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl border border-black/10 bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:border-amber-300">
                                        <div className="relative">
                                            <img
                                                src={item.img}
                                                alt={item.label}
                                                className="h-[76px] sm:h-[90px] lg:h-[110px] w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </div>
                                    </div>
                                    <div className="mt-2 text-center text-sm lg:text-base font-medium text-black/70 group-hover:text-amber-600 transition-colors">
                                        {item.label}
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

                <div className="h-8 lg:h-12" />
            </motion.div>
        </section>
    )
}
