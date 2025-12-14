import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Button } from './ui/button'
import { Camera, Clock } from 'lucide-react'

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
        <div ref={sectionRef} className="py-12 sm:py-16 lg:py-20 bg-white">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    <div ref={contentRef}>
                        <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200/60 px-4 py-2 text-sm font-medium text-black/80 mb-6">
                            <Clock className="h-4 w-4 text-amber-700" />
                            Coming Soon
                        </div>
                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-[600] text-black tracking-tight mb-6">
                            Virtual Try-On
                        </h2>
                        <p className="text-base sm:text-lg text-black/60 mb-8 leading-relaxed max-w-xl">
                            We’re building a camera-powered try-on experience so you can preview frames instantly.
                            Stay tuned—this feature will be live soon.
                        </p>
                        <Button
                            size="lg"
                            disabled
                            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white font-[600] px-8 py-6 text-base rounded-xl shadow-lg shadow-amber-200 opacity-60 cursor-not-allowed"
                        >
                            <Camera className="mr-2 h-5 w-5" />
                            Start Virtual Try-On
                        </Button>
                    </div>
                    <div ref={imageRef} className="relative">
                        <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-amber-50 to-white border-2 border-amber-200 shadow-xl">
                            <div className="relative w-full h-full">
                                {tryOnImages.map((src, idx) => (
                                    <img
                                        key={src}
                                        src={src}
                                        alt={idx === 0 ? 'Virtual Try-On preview' : 'Virtual Try-On preview variation'}
                                        className={`absolute inset-0 w-full h-full object-cover mix-blend-multiply transition-opacity duration-700 ${
                                            idx === activeImageIndex ? 'opacity-80' : 'opacity-0'
                                        }`}
                                        loading={idx === 0 ? 'eager' : 'lazy'}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="absolute inset-0 flex items-end p-4 sm:p-6">
                            <div className="w-full rounded-xl bg-white/90 backdrop-blur-sm border border-amber-200/60 p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-black truncate">Virtual Try‑On is coming soon</p>
                                        <p className="text-xs text-black/60">Camera preview • Frame fit • Instant swap</p>
                                    </div>
                                    <span className="flex-shrink-0 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200/60 rounded-full px-3 py-1">
                                        Coming Soon
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
