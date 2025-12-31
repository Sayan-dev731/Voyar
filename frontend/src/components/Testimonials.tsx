import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from './ui/card'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const testimonials = [
    {
        name: 'Ujwal Singh',
        text: 'Best eyewear shopping experience! The virtual try-on feature is incredibly accurate and made choosing the perfect frames so easy.',
        image: '/images/DSC00767.JPG',
        rating: 5,
    },
    {
        name: 'Raman Kumar',
        text: 'My blue light glasses have been a game-changer for long coding sessions. Quality is exceptional and customer service is outstanding.',
        image: '/images/DSC00817.JPG',
        rating: 5,
    },
    {
        name: 'Aman Gupta',
        text: "Voyar has the most stylish collection! I've bought three pairs and constantly get compliments. Fast shipping too!",
        image: '/images/DSC00834.JPG',
        rating: 5,
    },
]

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
            <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
            >
                <Star
                    className={`h-5 w-5 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                />
            </motion.div>
        ))}
    </div>
)

export const Testimonials = () => {
    const sectionRef = useRef<HTMLDivElement>(null)
    const titleRef = useRef<HTMLDivElement>(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState(0)

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(titleRef.current, {
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

    useEffect(() => {
        const interval = setInterval(() => {
            setDirection(1)
            setCurrentIndex((prev) => (prev + 1) % testimonials.length)
        }, 5000)

        return () => clearInterval(interval)
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
            x: direction > 0 ? 300 : -300,
            opacity: 0,
            scale: 0.95,
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 300 : -300,
            opacity: 0,
            scale: 0.95,
        }),
    }

    return (
        <div ref={sectionRef} id="testimonials" className="relative py-16 sm:py-20 lg:py-28 bg-gradient-to-b from-white via-amber-50/20 to-white overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 left-10 w-64 h-64 bg-amber-100/30 rounded-full blur-3xl animate-float-slow" />
                <div className="absolute bottom-20 right-10 w-56 h-56 bg-amber-200/20 rounded-full blur-3xl animate-float-reverse" />
            </div>

            <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    ref={titleRef}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12 sm:mb-16 lg:mb-20"
                >
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-[600] text-black tracking-tight mb-4">
                        What Our <span className="text-gradient-amber">Customers</span> Say
                    </h2>
                    <p className="text-sm sm:text-base lg:text-lg text-black/60">
                        Join thousands of happy customers
                    </p>
                </motion.div>

                <div className="max-w-4xl mx-auto">
                    <div className="relative">
                        {/* Navigation Buttons */}
                        <button
                            onClick={handlePrev}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-16 z-10 w-12 h-12 rounded-full bg-white shadow-lg border border-amber-100 flex items-center justify-center text-amber-600 hover:bg-amber-50 hover:border-amber-200 transition-all duration-300 hover:scale-110"
                            aria-label="Previous testimonial"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-16 z-10 w-12 h-12 rounded-full bg-white shadow-lg border border-amber-100 flex items-center justify-center text-amber-600 hover:bg-amber-50 hover:border-amber-200 transition-all duration-300 hover:scale-110"
                            aria-label="Next testimonial"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>

                        {/* Testimonial Carousel */}
                        <div className="relative overflow-hidden">
                            <AnimatePresence mode="wait" custom={direction}>
                                <motion.div
                                    key={currentIndex}
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                                    className="px-4"
                                >
                                    <Card className="bg-white/80 backdrop-blur-sm border-2 border-amber-100 rounded-3xl shadow-xl shadow-amber-100/30 overflow-hidden">
                                        <CardContent className="p-8 sm:p-12 lg:p-16 text-center relative">
                                            {/* Quote Icon */}
                                            <motion.div
                                                initial={{ opacity: 0, y: -20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                                className="absolute top-6 left-6 lg:top-8 lg:left-8"
                                            >
                                                <Quote className="h-10 w-10 lg:h-14 lg:w-14 text-amber-200 fill-amber-100" />
                                            </motion.div>

                                            {/* Profile Image */}
                                            <motion.div
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ delay: 0.1, duration: 0.4 }}
                                                className="relative inline-block mb-6"
                                            >
                                                <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 rounded-full animate-gradient opacity-75" />
                                                <img
                                                    src={testimonials[currentIndex].image}
                                                    alt={testimonials[currentIndex].name}
                                                    className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full object-cover border-4 border-white shadow-lg"
                                                />
                                            </motion.div>

                                            {/* Star Rating */}
                                            <div className="flex justify-center">
                                                <StarRating rating={testimonials[currentIndex].rating} />
                                            </div>

                                            {/* Testimonial Text */}
                                            <motion.p
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 }}
                                                className="text-lg sm:text-xl lg:text-2xl text-black/80 leading-relaxed mb-6 max-w-2xl mx-auto font-medium"
                                            >
                                                "{testimonials[currentIndex].text}"
                                            </motion.p>

                                            {/* Name */}
                                            <motion.h4
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.4 }}
                                                className="font-[600] text-black text-lg sm:text-xl"
                                            >
                                                {testimonials[currentIndex].name}
                                            </motion.h4>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Dots */}
                    <div className="flex justify-center mt-8 lg:mt-10 gap-3">
                        {testimonials.map((_, index) => (
                            <motion.button
                                key={index}
                                onClick={() => {
                                    setDirection(index > currentIndex ? 1 : -1)
                                    setCurrentIndex(index)
                                }}
                                className={`h-2.5 rounded-full transition-all duration-300 ${index === currentIndex
                                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 w-10'
                                    : 'bg-black/20 hover:bg-black/30 w-2.5'
                                    }`}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
