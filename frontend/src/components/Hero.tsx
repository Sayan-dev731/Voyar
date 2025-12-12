import { useEffect, useRef, useState } from 'react'
import { Button } from './ui/button'
import { Eye, Sparkles } from 'lucide-react'
import gsap from 'gsap'
import { Link } from 'react-router-dom'

export const Hero = () => {
    const heroRef = useRef<HTMLDivElement>(null)
    const logoRef = useRef<HTMLDivElement>(null)
    const offerRef = useRef<HTMLDivElement>(null)
    const textRef = useRef<HTMLDivElement>(null)
    const imageRef = useRef<HTMLDivElement>(null)
    const detailsRef = useRef<HTMLDivElement>(null)
    const [selectedSize, setSelectedSize] = useState('M')

    const sizes = ['XS', 'S', 'M', 'L', 'XL']

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

    return (
        <div ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#F5F1E8] pt-16 sm:pt-20">
            <div className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 py-12 sm:py-16">
                
                {/* Brand Logo and Info - Top Left */}
                <div ref={logoRef} className="absolute top-6 left-4 sm:top-12 sm:left-12 z-10">
                    <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-lg shadow-sm border border-black/5">
                        <div className="flex items-center gap-3 mb-3">
                            <Eye className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600" strokeWidth={1.5} />
                        </div>
                        <div className="text-xs text-black/60 max-w-[160px] sm:max-w-[180px] leading-relaxed">
                            <div className="font-medium text-black mb-1">VOYAR</div>
                            Premium eyewear collection featuring cutting-edge design
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="relative flex flex-col items-center justify-center min-h-[70vh]">

                    {/* Offer Banner */}
                    <div ref={offerRef} className="mb-8 sm:mb-10 px-2">
                        <div className="inline-flex max-w-[92vw] flex-wrap items-center justify-center gap-2 rounded-full bg-white/80 backdrop-blur-sm px-4 sm:px-5 py-2 shadow-sm border border-black/5 text-center">
                            <span className="inline-flex h-2 w-2 rounded-full bg-amber-500" />
                            <span className="text-xs sm:text-sm font-semibold tracking-tight text-black/80">
                                <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">BUY 1 GET 1</span>{' '}
                                offer is live on Voyar
                            </span>
                            <Sparkles className="h-4 w-4 text-amber-600" />
                        </div>
                    </div>
                    
                    {/* Large VOYAR Text */}
                    <div ref={textRef} className="relative w-full max-w-5xl mx-auto mb-0">
                        <h1 className="text-[clamp(4rem,15vw,16rem)] leading-[0.85] font-[900] text-black tracking-tighter text-center select-none">
                            <span className="inline-block" style={{ 
                                letterSpacing: '-0.05em',
                                fontFamily: 'system-ui, -apple-system, sans-serif',
                                fontWeight: 900
                            }}>
                                VOYAR
                            </span>
                        </h1>
                    </div>

                    {/* Product Image - Integrated with text */}
                    <div ref={imageRef} className="relative -mt-12 sm:-mt-20 lg:-mt-32 z-20">
                        <div className="relative w-[300px] sm:w-[400px] lg:w-[500px] h-[200px] sm:h-[250px] lg:h-[300px]">
                            <img 
                                src="/images/20251013_024158.jpg" 
                                alt="Premium eyewear" 
                                className="w-full h-full object-contain drop-shadow-2xl"
                            />
                        </div>
                    </div>
                </div>

                {/* Product Details - Bottom Bar */}
                <div ref={detailsRef} className="relative mt-10 sm:mt-12 md:absolute md:mt-0 md:bottom-8 left-0 right-0 px-4 sm:px-12">
                    <div className="max-w-[1400px] mx-auto">
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-black/5 p-6 sm:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,auto,auto] gap-6 items-center">
                                
                                {/* Product Info */}
                                <div>
                                    <div className="text-xs text-black/50 mb-1 uppercase tracking-wider">Featured Collection</div>
                                    <h3 className="text-lg sm:text-xl font-semibold text-black mb-1">
                                        Premium Aviator / <span className="text-black/60">Luxury Frames</span>
                                    </h3>
                                    <p className="text-xs text-black/50">Frame Size: <span className="text-black/70 font-medium">{selectedSize} (52-20-145 mm)</span></p>
                                </div>

                                {/* Size Selector */}
                                <div className="flex items-center gap-3 md:border-l md:border-black/10 md:pl-6">
                                    <span className="text-xs text-black/50 uppercase tracking-wider">Size</span>
                                    <div className="flex flex-wrap gap-2">
                                        {sizes.map((size) => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`w-10 h-10 rounded-lg text-xs font-medium transition-all ${
                                                    selectedSize === size
                                                        ? 'bg-black text-white'
                                                        : 'bg-black/5 text-black/60 hover:bg-black/10'
                                                }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="md:border-l md:border-black/10 md:pl-6">
                                    <div className="text-xs text-black/50 mb-1">Price</div>
                                    <div className="text-2xl font-bold text-black">₹1,699</div>
                                </div>

                                {/* Add to Bag Button */}
                                <Link to="/collections">
                                    <Button 
                                        size="lg" 
                                        className="bg-black text-white hover:bg-black/90 h-14 px-10 text-sm font-medium rounded-xl shadow-lg transition-all hover:scale-105"
                                    >
                                        SHOP NOW
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
