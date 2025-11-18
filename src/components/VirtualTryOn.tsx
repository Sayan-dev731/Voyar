import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Button } from './ui/button'
import { Camera } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export const VirtualTryOn = () => {
    const sectionRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const imageRef = useRef<HTMLDivElement>(null)

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

    return (
        <div ref={sectionRef} className="py-24 sm:py-32 lg:py-40 bg-white">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    <div ref={contentRef}>
                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-[600] text-black tracking-tight mb-6">
                            Try Before You Buy
                        </h2>
                        <p className="text-base sm:text-lg text-black/60 mb-8 leading-relaxed max-w-xl">
                            Experience our cutting-edge virtual try-on technology. See how any frame looks on
                            you instantly using your camera. No more guesswork – find your perfect match from
                            the comfort of home.
                        </p>
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 font-[600] px-8 py-6 text-base rounded-xl shadow-lg shadow-amber-200"
                        >
                            <Camera className="mr-2 h-5 w-5" />
                            Start Virtual Try-On
                        </Button>
                    </div>
                    <div ref={imageRef} className="relative">
                        <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-amber-50 to-white border-2 border-amber-200 shadow-xl">
                            <img
                                src="/images/20251013_035609.jpg"
                                alt="Virtual Try-On Demo"
                                className="w-full h-full object-cover mix-blend-multiply"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
