import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Button } from './ui/button'
import { Camera, Clock, Sparkles } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export const VirtualTryOn = () => {
    const sectionRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const imageRef = useRef<HTMLDivElement>(null)

    const tryOnImages = [
        '/images/20251013_022418.jpg',
        '/images/20251013_023354.jpg',
        '/images/20251013_024018.jpg',
        '/images/20251013_024158.jpg',
        '/images/20251013_024419.jpg',
        '/images/20251013_024701.jpg',
        '/images/20251013_034812.jpg',
        '/images/20251013_035040.jpg',
        '/images/20251013_035100.jpg',
        '/images/20251013_035609.jpg',
        '/images/20251013_035631.jpg',
        '/images/20251013_035812.jpg',
        '/images/20251013_040008.jpg',
        '/images/20251013_040226.jpg',
        '/images/20251013_040836.jpg',
        '/images/20251017_021422.jpg',
        '/images/20251017_021641.jpg',
        '/images/DSC00767.JPG',
        '/images/DSC00817.JPG',
        '/images/DSC00834.JPG',
    ]
    const [activeImageIndex, setActiveImageIndex] = useState(0)

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(contentRef.current, {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                },
                x: -50,
                opacity: 0,
                duration: 1,
                ease: 'power3.out',
            })

            gsap.from(imageRef.current, {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                },
                x: 50,
                opacity: 0,
                duration: 1,
                ease: 'power3.out',
            })
        }, sectionRef)

        return () => ctx.revert()
    }, [])

    useEffect(() => {
        if (tryOnImages.length <= 1) return

        const intervalId = window.setInterval(() => {
            setActiveImageIndex((idx) => (idx + 1) % tryOnImages.length)
        }, 2000)

        return () => window.clearInterval(intervalId)
    }, [tryOnImages.length])

    return (
        <div ref={sectionRef} className="relative py-16 sm:py-20 lg:py-28 bg-gradient-to-b from-white via-amber-50/20 to-white overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-20 right-20 w-80 h-80 bg-amber-100/30 rounded-full blur-3xl animate-float-slow" />
                <div className="absolute -bottom-20 left-20 w-60 h-60 bg-amber-200/20 rounded-full blur-3xl animate-float-reverse" />
            </div>

            <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <motion.div
                        ref={contentRef}
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        {/* Badge */}
                        <motion.div
                            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-100 to-amber-50 border border-amber-200/60 px-4 py-2 text-sm font-medium text-amber-800 mb-6 shadow-sm"
                            whileHover={{ scale: 1.05 }}
                        >
                            <Clock className="h-4 w-4 text-amber-700" />
                            Coming Soon
                        </motion.div>

                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-[600] text-black tracking-tight mb-6">
                            Virtual <span className="text-gradient-amber">Try-On</span>
                        </h2>
                        <p className="text-base sm:text-lg lg:text-xl text-black/60 mb-8 leading-relaxed max-w-xl">
                            We're building a camera-powered try-on experience so you can preview frames instantly.
                            Stay tuned—this feature will be live soon.
                        </p>

                        {/* Feature highlights */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            {[
                                { icon: Camera, label: 'Camera Preview' },
                                { icon: Sparkles, label: 'AI Powered' },
                                { icon: Clock, label: 'Instant Swap' },
                            ].map((feature, i) => (
                                <motion.div
                                    key={feature.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 + i * 0.1 }}
                                    className="text-center p-3 rounded-xl bg-amber-50/50 border border-amber-100"
                                >
                                    <feature.icon className="h-5 w-5 text-amber-600 mx-auto mb-2" />
                                    <span className="text-xs font-medium text-black/70">{feature.label}</span>
                                </motion.div>
                            ))}
                        </div>

                        <Button
                            size="lg"
                            disabled
                            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white font-[600] px-8 py-6 text-base rounded-xl shadow-lg shadow-amber-200/50 opacity-60 cursor-not-allowed"
                        >
                            <Camera className="mr-2 h-5 w-5" />
                            Start Virtual Try-On
                        </Button>
                    </motion.div>

                    <motion.div
                        ref={imageRef}
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-amber-50 to-white border-2 border-amber-200 shadow-2xl shadow-amber-100/50">
                            <div className="relative w-full h-full">
                                {tryOnImages.map((src, idx) => (
                                    <motion.img
                                        key={src}
                                        src={src}
                                        alt={idx === 0 ? 'Virtual Try-On preview' : 'Virtual Try-On preview variation'}
                                        className="absolute inset-0 w-full h-full object-cover"
                                        initial={false}
                                        animate={{
                                            opacity: idx === activeImageIndex ? 0.85 : 0,
                                            scale: idx === activeImageIndex ? 1 : 1.05,
                                        }}
                                        transition={{ duration: 0.7 }}
                                        loading={idx === 0 ? 'eager' : 'lazy'}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Floating UI overlay */}
                        <motion.div
                            className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 }}
                        >
                            <div className="w-full rounded-2xl bg-white/95 backdrop-blur-md border border-amber-200/60 p-4 shadow-xl">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-black truncate">Virtual Try‑On is coming soon</p>
                                        <p className="text-xs text-black/60">Camera preview • Frame fit • Instant swap</p>
                                    </div>
                                    <motion.span
                                        className="flex-shrink-0 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200/60 rounded-full px-3 py-1.5"
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        Coming Soon
                                    </motion.span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Decorative elements */}
                        <div className="absolute -top-4 -right-4 w-24 h-24 border-t-2 border-r-2 border-amber-300 rounded-tr-3xl" />
                        <div className="absolute -bottom-4 -left-4 w-24 h-24 border-b-2 border-l-2 border-amber-300 rounded-bl-3xl" />
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
