import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'

const testimonials = [
    {
        name: 'Ujwal Singh',
        text: "I've never owned glasses that feel this good. They're lightweight, stylish, and I can wear them all day without discomfort. Voyar nailed it.",
        image: '/images/DSC00767.JPG',
        location: 'Delhi',
    },
    {
        name: 'Raman Kumar',
        text: "I bought a pair for vacation, and now I wear them everywhere. People keep asking me where I got them — Voyar is officially my style secret.",
        image: '/images/DSC00817.JPG',
        location: 'Bangalore',
    },
    {
        name: 'Aman Gupta',
        text: "The attention to detail is unmatched. From the eco-friendly packaging to the crystal-clear lenses, every purchase feels premium. I'm a lifelong fan now.",
        image: '/images/DSC00834.JPG',
        location: 'Mumbai',
    },
    {
        name: 'Priya Sharma',
        text: "Voyar sunglasses completely changed how I see eyewear. They're stylish, lightweight, and I forget I'm even wearing them.",
        image: '/images/20251013_040226.jpg',
        location: 'Patna',
    },
    {
        name: 'Rohit Verma',
        text: "From customer service to quality, everything is top-notch. Voyar delivers an experience that feels personal and luxurious.",
        image: '/images/20251013_035040.jpg',
        location: 'Jaipur',
    },
]

export const Testimonials = () => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState(0)
    const intervalRef = useRef<number | null>(null)

    useEffect(() => {
        intervalRef.current = window.setInterval(() => {
            setDirection(1)
            setCurrentIndex((prev) => (prev + 1) % testimonials.length)
        }, 6000)

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [])

    const handlePrev = () => {
        setDirection(-1)
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    }

    const handleNext = () => {
        setDirection(1)
        setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 80 : -80,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 80 : -80,
            opacity: 0,
        }),
    }

    return (
        <section className="py-16 sm:py-20 lg:py-28 bg-gradient-to-b from-amber-50/30 to-white dark:from-gray-950 dark:to-gray-900 transition-colors duration-300">
            <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-14 sm:mb-20"
                >
                    <p className="text-[11px] tracking-[0.2em] uppercase text-amber-600 dark:text-amber-400 mb-3">
                        // Loved by thousands of happy customers worldwide.
                    </p>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-black dark:text-white tracking-tight">
                        Our Customers Are Saying
                    </h2>
                </motion.div>

                {/* Testimonial Carousel */}
                <div className="max-w-4xl mx-auto">
                    <div className="relative">
                        {/* Navigation Buttons */}
                        <button
                            onClick={handlePrev}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-16 z-10 w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center text-black/30 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors duration-300"
                            aria-label="Previous testimonial"
                        >
                            <ChevronLeft className="h-6 w-6 lg:h-8 lg:w-8" />
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-16 z-10 w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center text-black/30 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors duration-300"
                            aria-label="Next testimonial"
                        >
                            <ChevronRight className="h-6 w-6 lg:h-8 lg:w-8" />
                        </button>

                        {/* Testimonial Card */}
                        <div className="relative overflow-hidden min-h-[280px] sm:min-h-[240px]">
                            <AnimatePresence mode="wait" custom={direction}>
                                <motion.div
                                    key={currentIndex}
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                                    className="px-4 sm:px-8"
                                >
                                    <div className="text-center">
                                        {/* Quote icon */}
                                        <Quote className="h-8 w-8 text-amber-300 dark:text-amber-700 mx-auto mb-8 rotate-180" />

                                        {/* Testimonial Text */}
                                        <p className="text-lg sm:text-xl lg:text-2xl text-black/80 dark:text-white/80 leading-relaxed mb-8 font-light italic">
                                            "{testimonials[currentIndex].text}"
                                        </p>

                                        {/* Name & Location */}
                                        <div className="flex items-center justify-center gap-4">
                                            <div className="w-10 h-10 rounded-full overflow-hidden">
                                                <img
                                                    src={testimonials[currentIndex].image}
                                                    alt={testimonials[currentIndex].name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="text-left">
                                                <h4 className="text-sm font-medium text-black dark:text-white">
                                                    {testimonials[currentIndex].name}
                                                </h4>
                                                <p className="text-xs text-black/40 dark:text-white/40">
                                                    {testimonials[currentIndex].location}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Dots */}
                        <div className="flex justify-center mt-10 gap-2">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setDirection(index > currentIndex ? 1 : -1)
                                        setCurrentIndex(index)
                                    }}
                                    className={`transition-all duration-500 rounded-full ${index === currentIndex
                                        ? 'bg-amber-500 w-6 h-1.5'
                                        : 'bg-amber-200 dark:bg-amber-900/30 hover:bg-amber-300 dark:hover:bg-amber-800 w-1.5 h-1.5'
                                        }`}
                                    aria-label={`Go to testimonial ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
