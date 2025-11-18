import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Button } from './ui/button'

gsap.registerPlugin(ScrollTrigger)

export const Newsletter = () => {
    const sectionRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const [email, setEmail] = useState('')

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(contentRef.current, {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                },
                y: 50,
                opacity: 0,
                duration: 1,
            })
        }, sectionRef)

        return () => ctx.revert()
    }, [])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Newsletter signup:', email)
        setEmail('')
    }

    return (
        <div ref={sectionRef} className="py-24 sm:py-32 lg:py-40 bg-gradient-to-b from-amber-50/30 to-white">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div
                    ref={contentRef}
                    className="max-w-3xl mx-auto text-center bg-gradient-to-br from-white to-amber-50/50 backdrop-blur-sm border-2 border-amber-200 rounded-3xl p-10 sm:p-14 lg:p-16 shadow-xl"
                >
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[600] text-black mb-5 tracking-tight">
                        Stay Updated
                    </h2>
                    <p className="text-base sm:text-lg text-black/60 mb-8 max-w-2xl mx-auto">
                        Subscribe to our newsletter for exclusive offers, new arrivals, and eyewear tips.
                    </p>
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="flex-1 px-5 py-3 bg-white border border-amber-200 rounded-xl text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-sm sm:text-base"
                            required
                        />
                        <Button
                            type="submit"
                            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 font-[600] px-8 py-3 rounded-xl text-sm sm:text-base shadow-md shadow-amber-200"
                        >
                            Subscribe
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
