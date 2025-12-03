import { useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { ArrowRight } from 'lucide-react'
import gsap from 'gsap'

export const Hero = () => {
    const heroRef = useRef<HTMLDivElement>(null)
    const title1Ref = useRef<HTMLHeadingElement>(null)
    const title2Ref = useRef<HTMLHeadingElement>(null)
    const title3Ref = useRef<HTMLHeadingElement>(null)
    const descRef = useRef<HTMLDivElement>(null)
    const whatsappUrl = 'https://wa.me/6204834003?text=Hi%20Voyar%2C%20I%27d%20like%20to%20book%20an%20offline%20eye%20test.'

    const heroGalleryRows = [
        [
            '/images/20251013_022418.jpg',
            '/images/20251013_024158.jpg',
            '/images/20251013_024532.jpg',
            '/images/20251013_024701.jpg',
            '/images/20251013_040008.jpg',
            '/images/20251017_021422.jpg',
        ],
        [
            '/images/20251013_024419.jpg',
            '/images/20251013_035040.jpg',
            '/images/20251013_035100.jpg',
            '/images/20251013_035609.jpg',
            '/images/20251013_035631.jpg',
            '/images/20251013_040226.jpg',
        ],
    ]

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

            tl.from([title1Ref.current, title2Ref.current, title3Ref.current], {
                y: 100,
                opacity: 0,
                duration: 1,
                stagger: 0.1,
                delay: 0.3,
            }).from(descRef.current, {
                y: 30,
                opacity: 0,
                duration: 0.8,
            }, '-=0.5')
        }, heroRef)

        return () => ctx.revert()
    }, [])

    const handleEyeTestClick = () => {
        if (typeof window === 'undefined') return
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    }

    return (
        <div ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white via-amber-50/20 to-white">
            {/* Auto-scrolling image gallery background */}
            <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
                <div className="absolute inset-x-0 top-1/4 flex flex-col gap-8 opacity-60">
                    {heroGalleryRows.map((row, rowIndex) => (
                        <div
                            key={rowIndex}
                            className={`hero-marquee ${rowIndex % 2 === 1 ? 'hero-marquee--reverse' : ''}`}
                        >
                            {[...row, ...row].map((src, idx) => (
                                <div key={`${rowIndex}-${idx}`} className="hero-marquee-card">
                                    <img src={src} alt="Eyewear style" className="h-full w-full object-cover" loading="lazy" />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Subtle gradient overlay to keep text legible */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(217,156,41,0.08)_0%,_transparent_70%)]"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-white via-white/70 to-white"></div>

            <div className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-32 sm:py-40 lg:py-48">
                {/* Large Typography - Test.html style */}
                <div className="text-center space-y-2">
                    <div className="overflow-hidden">
                        <h1 ref={title1Ref} className="text-[clamp(3rem,12vw,12rem)] leading-[0.9] font-[600] text-black tracking-tight">
                            See the
                        </h1>
                    </div>
                    <div className="overflow-hidden">
                        <h1 ref={title2Ref} className="text-[clamp(3rem,12vw,12rem)] leading-[0.9] font-[600] text-black tracking-tight">
                            world in
                        </h1>
                    </div>
                    <div className="overflow-hidden">
                        <h1 ref={title3Ref} className="text-[clamp(3rem,12vw,12rem)] leading-[0.9] font-[600] bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 bg-clip-text text-transparent tracking-tight">
                            perfect clarity
                        </h1>
                    </div>
                </div>

                {/* Description */}
                <div ref={descRef} className="mt-12 sm:mt-16 max-w-2xl mx-auto text-center">
                    <p className="text-sm sm:text-base text-black/60 leading-relaxed">
                        Premium eyewear designed for modern living. Experience unmatched comfort, style, and precision.
                    </p>
                </div>

                {/* CTA Buttons */}
                <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button size="lg" className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 h-12 sm:h-14 px-8 sm:px-10 text-sm font-medium group shadow-lg shadow-amber-200">
                        Shop Now
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        className="border-black/20 text-black hover:bg-amber-50 hover:border-amber-600 h-12 sm:h-14 px-8 sm:px-10 text-sm font-medium"
                        onClick={handleEyeTestClick}
                    >
                        Take Eye Test Offline
                    </Button>
                </div>

                {/* Stats */}
                <div className="mt-20 sm:mt-24 grid grid-cols-3 gap-8 sm:gap-12 max-w-3xl mx-auto">
                    <div className="text-center">
                        <div className="text-3xl sm:text-5xl font-[600] text-black mb-2">10M+</div>
                        <div className="text-xs sm:text-sm text-black/50">Happy Customers</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl sm:text-5xl font-[600] text-black mb-2">5000+</div>
                        <div className="text-xs sm:text-sm text-black/50">Designs</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl sm:text-5xl font-[600] text-black mb-2">24/7</div>
                        <div className="text-xs sm:text-sm text-black/50">Support</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
