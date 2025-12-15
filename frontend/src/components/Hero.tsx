import { useEffect, useRef, useState } from 'react'
import { Button } from './ui/button'
import { ArrowRight } from 'lucide-react'
import gsap from 'gsap'
import { Link } from 'react-router-dom'

export const Hero = () => {
    const heroRef = useRef<HTMLDivElement>(null)
    const logoRef = useRef<HTMLDivElement>(null)
    const offerRef = useRef<HTMLDivElement>(null)
    const textRef = useRef<HTMLDivElement>(null)
    const imageRef = useRef<HTMLDivElement>(null)
    const detailsRef = useRef<HTMLDivElement>(null)

    const heroImages = [
        '/images/20251013_024158.jpg',
        '/images/20251013_024419.jpg',
        '/images/20251013_024701.jpg',
    ]
    const [activeImageIndex, setActiveImageIndex] = useState(0)

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

            tl.from(logoRef.current, {
                opacity: 0,
                y: -30,
                duration: 0.8,
                delay: 0.2,
            })
            .from(offerRef.current, {
                opacity: 0,
                y: 14,
                duration: 0.7,
            }, '-=0.35')
            .from(textRef.current, {
                opacity: 0,
                scale: 0.95,
                duration: 1.2,
            }, '-=0.5')
            .from(imageRef.current, {
                opacity: 0,
                y: 50,
                duration: 1,
            }, '-=0.8')
            .from(detailsRef.current, {
                opacity: 0,
                y: 30,
                duration: 0.8,
            }, '-=0.5')
        }, heroRef)

        return () => ctx.revert()
    }, [])

    useEffect(() => {
        if (heroImages.length <= 1) return

        const intervalId = window.setInterval(() => {
            setActiveImageIndex((idx) => (idx + 1) % heroImages.length)
        }, 2000)

        return () => window.clearInterval(intervalId)
    }, [heroImages.length])

    return (
        <div ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-b from-white via-amber-50/30 to-white pt-16 sm:pt-20">
            <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                <div className="relative overflow-hidden rounded-[32px] border border-amber-200/60 bg-white shadow-xl">
                    <div className="grid lg:grid-cols-2">
                        {/* Text Panel */}
                        <div className="relative p-6 sm:p-10 lg:p-12">
                            <div ref={logoRef} className="flex items-center gap-3 mb-6">
                                {/* <div className="h-10 w-10 rounded-2xl bg-black text-white flex items-center justify-center">
                                    <Eye className="h-5 w-5" />
                                </div>
                                <div className="leading-tight">
                                    <div className="text-sm font-[700] tracking-wide text-black">VOYAR</div>
                                    <div className="text-xs text-black/60">Premium eyewear collection</div>
                                </div> */}
                            </div>
                            <div ref={offerRef} className="mb-6">
                                {/* <div className="inline-flex flex-wrap items-center gap-2 rounded-full bg-amber-50 px-4 py-2 border border-amber-200/60">
                                    <span className="inline-flex h-2 w-2 rounded-full bg-amber-600" />
                                    <span className="text-xs sm:text-sm font-semibold tracking-tight text-black/80">
                                        <span className="text-amber-700">BUY 1 GET 1</span> offer is live
                                    </span>
                                    <Sparkles className="h-4 w-4 text-amber-600" />
                                </div> */}
                            </div>

                            <div ref={textRef}>
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-[900] tracking-tight text-black leading-[1.05]">
                                    Discover Your Signature Eyewear Look
                                </h1>
                                <p className="mt-4 text-base sm:text-lg text-black/70 max-w-xl">
                                    Explore our premium collection of frames and sunglasses—crafted for comfort, built to stand out.
                                </p>
                            </div>

                            {/* Bottom CTA (pill) */}
                            <div ref={detailsRef} className="mt-8">
                                <Link to="/collections" className="block">
                                    <Button
                                        className="w-full h-14 rounded-full bg-black text-white hover:bg-black/90 px-6 justify-between"
                                    >
                                        <span className="text-sm sm:text-base font-medium">Get Started</span>
                                        <span className="inline-flex items-center gap-2 text-white/80">
                                            <span className="text-xs sm:text-sm">Shop</span>
                                            <ArrowRight className="h-4 w-4" />
                                        </span>
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Image Panel */}
                        <div ref={imageRef} className="relative bg-gradient-to-br from-amber-50 to-white min-h-[320px] sm:min-h-[420px] lg:min-h-full overflow-hidden">
                            <div
                                className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
                                style={{ transform: `translateX(-${activeImageIndex * 100}%)` }}
                            >
                                {heroImages.map((src, idx) => (
                                    <div key={src} className="relative w-full flex-shrink-0">
                                        <img
                                            src={src}
                                            alt={idx === 0 ? 'Premium eyewear' : 'Premium eyewear variation'}
                                            className="absolute inset-0 w-full h-full object-contain p-8 sm:p-12 drop-shadow-2xl"
                                            loading={idx === 0 ? 'eager' : 'lazy'}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/10 to-transparent" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
