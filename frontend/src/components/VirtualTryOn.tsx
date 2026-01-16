import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { Camera, Clock, Sparkles, Bell } from 'lucide-react'

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
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white to-amber-50/30 overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-6">
                            <Clock className="h-4 w-4" />
                            Coming Soon
                        </div>

                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-5">
                            Virtual <span className="text-gradient-amber">Try-On</span>
                        </h2>
                        <p className="text-base sm:text-lg text-black/60 mb-8 leading-relaxed">
                            We're building a camera-powered try-on experience so you can preview frames instantly.
                            Stay tuned—this feature will be live soon.
                        </p>

                        {/* Feature highlights */}
                        <div className="grid grid-cols-3 gap-3 mb-8">
                            {[
                                { icon: Camera, label: 'Camera Preview' },
                                { icon: Sparkles, label: 'AI Powered' },
                                { icon: Clock, label: 'Instant Swap' },
                            ].map((feature) => (
                                <div
                                    key={feature.label}
                                    className="text-center p-4 rounded-xl bg-white border border-amber-100 hover:border-amber-200 transition-colors"
                                >
                                    <feature.icon className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                                    <span className="text-xs font-medium text-black/70">{feature.label}</span>
                                </div>
                            ))}
                        </div>

                        <Button
                            size="lg"
                            disabled
                            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold px-8 py-6 rounded-xl shadow-lg opacity-60 cursor-not-allowed"
                        >
                            <Bell className="mr-2 h-5 w-5" />
                            Notify Me When Ready
                        </Button>
                    </motion.div>

                    {/* Image Preview */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="aspect-square rounded-2xl lg:rounded-3xl overflow-hidden bg-amber-50 border-2 border-amber-200 shadow-xl">
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
                            <div className="absolute bottom-4 left-4 right-4">
                                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 border border-amber-100 shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-black">Virtual Try-On</p>
                                            <p className="text-xs text-black/50">Camera preview • Frame fit • Instant swap</p>
                                        </div>
                                        <span className="px-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                                            Soon
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Decorative corners */}
                        <div className="absolute -top-3 -right-3 w-16 h-16 border-t-2 border-r-2 border-amber-300 rounded-tr-2xl" />
                        <div className="absolute -bottom-3 -left-3 w-16 h-16 border-b-2 border-l-2 border-amber-300 rounded-bl-2xl" />
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
