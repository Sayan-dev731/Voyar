import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Button } from './ui/button'
import { Mail, Sparkles, CheckCircle2 } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export const Newsletter = () => {
    const sectionRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const [email, setEmail] = useState('')
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [isFocused, setIsFocused] = useState(false)

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
        setIsSubmitted(true)
        setTimeout(() => {
            setIsSubmitted(false)
            setEmail('')
        }, 3000)
    }

    return (
        <div ref={sectionRef} className="relative py-16 sm:py-20 lg:py-28 bg-gradient-to-b from-amber-50/30 to-white overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-amber-200/30 to-amber-100/10 rounded-full blur-3xl animate-float-slow" />
                <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-tr from-amber-300/20 to-amber-200/10 rounded-full blur-3xl animate-float-reverse" />

                {/* Floating Particles */}
                <div className="particle" style={{ left: '15%', top: '25%', animationDelay: '0s' }} />
                <div className="particle" style={{ left: '25%', top: '65%', animationDelay: '1s' }} />
                <div className="particle" style={{ left: '75%', top: '35%', animationDelay: '2s' }} />
                <div className="particle" style={{ left: '85%', top: '75%', animationDelay: '3s' }} />
                <div className="particle" style={{ left: '55%', top: '45%', animationDelay: '4s' }} />
            </div>

            <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    ref={contentRef}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-3xl mx-auto text-center"
                >
                    {/* Glassmorphism Card */}
                    <div className="relative bg-white/80 backdrop-blur-xl border-2 border-amber-200/60 rounded-3xl lg:rounded-[2rem] p-10 sm:p-14 lg:p-16 shadow-2xl shadow-amber-100/50 overflow-hidden">
                        {/* Gradient Border Effect */}
                        <div className="absolute inset-0 rounded-3xl lg:rounded-[2rem] p-[2px] bg-gradient-to-br from-amber-300 via-amber-200 to-amber-400 opacity-50 -z-10" />

                        {/* Inner Glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-transparent to-amber-100/30 pointer-events-none" />

                        {/* Icon Badge */}
                        <motion.div
                            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg shadow-amber-300/50 mb-6"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <Mail className="h-8 w-8 text-white" />
                        </motion.div>

                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[600] text-black mb-5 tracking-tight">
                            Stay <span className="text-gradient-amber">Updated</span>
                        </h2>
                        <p className="text-base sm:text-lg text-black/60 mb-8 max-w-xl mx-auto">
                            Subscribe to our newsletter for exclusive offers, new arrivals, and eyewear tips.
                        </p>

                        {isSubmitted ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center justify-center gap-3 py-4"
                            >
                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
                                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                                </div>
                                <span className="text-lg font-medium text-green-700">Thanks for subscribing!</span>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                                <div className={`flex-1 relative transition-all duration-300 ${isFocused ? 'scale-[1.02]' : ''}`}>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() => setIsFocused(false)}
                                        placeholder="Enter your email"
                                        className={`w-full px-5 py-4 bg-white border-2 rounded-xl text-black placeholder-black/40 focus:outline-none transition-all duration-300 text-sm sm:text-base ${isFocused
                                                ? 'border-amber-400 shadow-lg shadow-amber-100/50 ring-4 ring-amber-100'
                                                : 'border-amber-200 hover:border-amber-300'
                                            }`}
                                        required
                                    />
                                    {isFocused && (
                                        <motion.div
                                            className="absolute -inset-1 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 rounded-xl opacity-20 -z-10"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 0.2 }}
                                        />
                                    )}
                                </div>
                                <Button
                                    type="submit"
                                    className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 font-[600] px-8 py-4 rounded-xl text-sm sm:text-base shadow-lg shadow-amber-200/50 transition-all duration-300 hover:shadow-amber-300/60 hover:scale-105 flex items-center gap-2"
                                >
                                    <Sparkles className="h-4 w-4" />
                                    Subscribe
                                </Button>
                            </form>
                        )}

                        {/* Trust Badges */}
                        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-black/50">
                            <span className="flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />
                                No spam
                            </span>
                            <span className="flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />
                                Unsubscribe anytime
                            </span>
                            <span className="flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />
                                Weekly updates
                            </span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
