import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { Mail, Sparkles, CheckCircle2, Gift } from 'lucide-react'

export const Newsletter = () => {
    const [email, setEmail] = useState('')
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [isFocused, setIsFocused] = useState(false)

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
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-amber-50/50 to-white dark:from-gray-950 dark:to-gray-900 transition-colors duration-300">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="max-w-2xl mx-auto"
                >
                    {/* Newsletter Card */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl lg:rounded-3xl p-8 sm:p-10 lg:p-12 border border-amber-100 dark:border-amber-900/30 shadow-xl text-center">
                        {/* Icon */}
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-lg shadow-amber-200/50 dark:shadow-amber-900/50 mb-6">
                            <Mail className="h-7 w-7" />
                        </div>

                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black dark:text-white mb-3">
                            Stay <span className="text-gradient-amber">Updated</span>
                        </h2>
                        <p className="text-black/60 dark:text-white/60 mb-6">
                            Subscribe for exclusive offers, new arrivals, and eyewear tips.
                        </p>

                        {/* Promo Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-medium mb-6">
                            <Gift className="h-4 w-4" />
                            Use Code - SAVE10 for ₹100 Off
                        </div>

                        {isSubmitted ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center justify-center gap-3 py-4"
                            >
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30">
                                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <span className="text-lg font-medium text-green-700 dark:text-green-400">Thanks for subscribing!</span>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                                <div className={`flex-1 relative transition-all duration-200 ${isFocused ? 'scale-[1.02]' : ''}`}>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() => setIsFocused(false)}
                                        placeholder="Enter your email"
                                        className={`w-full px-4 py-3 bg-amber-50 dark:bg-gray-800 border-2 rounded-xl text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 focus:outline-none transition-all duration-200 text-sm ${isFocused
                                            ? 'border-amber-400 bg-white dark:border-amber-500 dark:bg-gray-900 shadow-lg'
                                            : 'border-amber-200 dark:border-amber-900/50 hover:border-amber-300 dark:hover:border-amber-700'
                                            }`}
                                        required
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 font-semibold px-6 py-3 rounded-xl text-sm shadow-lg shadow-amber-200/50 dark:shadow-amber-900/50 transition-all duration-200 hover:scale-105"
                                >
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Subscribe
                                </Button>
                            </form>
                        )}

                        {/* Trust Badges */}
                        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-black/50 dark:text-white/50">
                            <span className="flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />
                                No spam
                            </span>
                            <span className="flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />
                                Unsubscribe anytime
                            </span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
