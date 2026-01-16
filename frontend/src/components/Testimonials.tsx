import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Heart } from 'lucide-react'

const testimonials = [
    {
        name: 'Ujwal Singh',
        text: 'Best eyewear shopping experience! The virtual try-on feature is incredibly accurate and made choosing the perfect frames so easy.',
        image: '/images/DSC00767.JPG',
        rating: 5,
        location: 'Delhi',
    },
    {
        name: 'Raman Kumar',
        text: 'My blue light glasses have been a game-changer for long coding sessions. Quality is exceptional and customer service is outstanding.',
        image: '/images/DSC00817.JPG',
        rating: 5,
        location: 'Bangalore',
    },
    {
        name: 'Aman Gupta',
        text: "Voyar has the most stylish collection! I've bought three pairs and constantly get compliments. Fast shipping too!",
        image: '/images/DSC00834.JPG',
        rating: 5,
        location: 'Mumbai',
    },
]

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
            />
        ))}
    </div>
)

export const Testimonials = () => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState(0)
    const intervalRef = useRef<number | null>(null)

    useEffect(() => {
        intervalRef.current = window.setInterval(() => {
            setDirection(1)
            setCurrentIndex((prev) => (prev + 1) % testimonials.length)
        }, 5000)

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
            x: direction > 0 ? 100 : -100,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 100 : -100,
            opacity: 0,
        }),
    }

    return (
        <section className="py-12 sm:py-16 lg:py-20 bg-white">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-10"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-4">
                        <Heart className="h-4 w-4 fill-amber-600" />
                        Customers' Favorite
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-3">
                        Most <span className="text-gradient-amber">Loved</span>
                    </h2>
                    <p className="text-black/60">
                        Updated every 15 days based on customer reviews
                    </p>
                </motion.div>

                {/* Testimonial Carousel */}
                <div className="max-w-3xl mx-auto">
                    <div className="relative">
                        {/* Navigation Buttons */}
                        <button
                            onClick={handlePrev}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 lg:-translate-x-14 z-10 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white shadow-lg border border-amber-100 flex items-center justify-center text-amber-600 hover:bg-amber-50 hover:border-amber-200 transition-all duration-300"
                            aria-label="Previous testimonial"
                        >
                            <ChevronLeft className="h-5 w-5 lg:h-6 lg:w-6" />
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 lg:translate-x-14 z-10 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white shadow-lg border border-amber-100 flex items-center justify-center text-amber-600 hover:bg-amber-50 hover:border-amber-200 transition-all duration-300"
                            aria-label="Next testimonial"
                        >
                            <ChevronRight className="h-5 w-5 lg:h-6 lg:w-6" />
                        </button>

                        {/* Testimonial Card */}
                        <div className="relative overflow-hidden">
                            <AnimatePresence mode="wait" custom={direction}>
                                <motion.div
                                    key={currentIndex}
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                                    className="px-4"
                                >
                                    <div className="bg-amber-50 rounded-2xl lg:rounded-3xl p-6 sm:p-8 lg:p-10 border border-amber-100">
                                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                            {/* Profile Image */}
                                            <div className="flex-shrink-0">
                                                <div className="relative">
                                                    <div className="absolute -inset-1 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full opacity-75" />
                                                    <img
                                                        src={testimonials[currentIndex].image}
                                                        alt={testimonials[currentIndex].name}
                                                        className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white"
                                                    />
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 text-center sm:text-left">
                                                {/* Rating */}
                                                <div className="mb-3 flex justify-center sm:justify-start">
                                                    <StarRating rating={testimonials[currentIndex].rating} />
                                                </div>

                                                {/* Testimonial Text */}
                                                <p className="text-base sm:text-lg text-black/80 leading-relaxed mb-4">
                                                    "{testimonials[currentIndex].text}"
                                                </p>

                                                {/* Name & Location */}
                                                <div>
                                                    <h4 className="font-semibold text-black text-lg">
                                                        {testimonials[currentIndex].name}
                                                    </h4>
                                                    <p className="text-sm text-black/50">
                                                        {testimonials[currentIndex].location}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Dots */}
                        <div className="flex justify-center mt-6 gap-2">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setDirection(index > currentIndex ? 1 : -1)
                                        setCurrentIndex(index)
                                    }}
                                    className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                                            ? 'bg-amber-500 w-8'
                                            : 'bg-amber-200 hover:bg-amber-300 w-2'
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
