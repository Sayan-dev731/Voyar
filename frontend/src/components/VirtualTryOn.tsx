import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Sparkles, Clock } from 'lucide-react'

export const VirtualTryOn = () => {
    const [activeImageIndex, setActiveImageIndex] = useState(0)

    const tryOnImages = [
        '/images/20251013_022418.jpg',
        '/images/20251013_023354.jpg',
        '/images/20251013_024018.jpg',
        '/images/20251013_024158.jpg',
        '/images/20251013_024419.jpg',
        '/images/20251013_024701.jpg',
    ]

    useEffect(() => {
        if (tryOnImages.length <= 1) return
        const intervalId = window.setInterval(() => {
            setActiveImageIndex((idx) => (idx + 1) % tryOnImages.length)
        }, 2500)
        return () => window.clearInterval(intervalId)
    }, [tryOnImages.length])

    return (
        <section className="py-16 sm:py-20 lg:py-28 bg-white dark:bg-gray-950 overflow-hidden transition-colors duration-300">
            <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 border border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 text-[11px] tracking-[0.15em] uppercase mb-8 rounded-full">
                            <Clock className="h-3.5 w-3.5" />
                            Coming Soon
                        </div>

                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-black dark:text-white tracking-tight mb-6">
                            Virtual Try-On
                        </h2>
                        <p className="text-base text-black/50 dark:text-white/50 mb-10 leading-relaxed max-w-lg">
                            We're building a camera-powered try-on experience so you can preview frames instantly.
                            Stay tuned — this feature will be live soon.
                        </p>

                        {/* Feature highlights */}
                        <div className="grid grid-cols-3 gap-4 mb-10">
                            {[
                                { icon: Camera, label: 'Camera Preview' },
                                { icon: Sparkles, label: 'AI Powered' },
                                { icon: Clock, label: 'Instant Swap' },
                            ].map((feature) => (
                                <div
                                    key={feature.label}
                                    className="text-center p-4 border border-amber-100 dark:border-amber-900/30 rounded-xl hover:border-amber-300 dark:hover:border-amber-700 transition-colors duration-300"
                                >
                                    <feature.icon className="h-5 w-5 text-amber-500 dark:text-amber-400 mx-auto mb-2.5" />
                                    <span className="text-[11px] tracking-[0.05em] text-black/50 dark:text-white/50">{feature.label}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            disabled
                            className="px-8 py-3.5 bg-amber-100 dark:bg-amber-900/20 text-amber-500 dark:text-amber-400 text-[13px] font-medium tracking-[0.04em] uppercase cursor-not-allowed rounded-full"
                        >
                            Notify Me When Ready
                        </button>
                    </motion.div>

                    {/* Image Preview */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="aspect-square overflow-hidden bg-gray-50 dark:bg-gray-900">
                            <div className="relative w-full h-full">
                                {tryOnImages.map((src, idx) => (
                                    <img
                                        key={src}
                                        src={src}
                                        alt="Virtual Try-On preview"
                                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${idx === activeImageIndex ? 'opacity-100' : 'opacity-0'
                                            }`}
                                        loading={idx === 0 ? 'eager' : 'lazy'}
                                    />
                                ))}
                            </div>

                            {/* Overlay Label */}
                            <div className="absolute bottom-0 left-0 right-0 p-5">
                                <div className="bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-black dark:text-white">Virtual Try-On</p>
                                            <p className="text-[11px] text-black/40 dark:text-white/40 tracking-wider">Camera preview • Frame fit • Instant swap</p>
                                        </div>
                                        <span className="px-3 py-1 border border-black/10 dark:border-white/10 text-[11px] tracking-[0.1em] uppercase text-black/50 dark:text-white/50">
                                            Soon
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
