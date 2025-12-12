import { useEffect, useRef, useState } from 'react'
import { Card, CardContent } from './ui/card'
import { Star } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const testimonials = [
    {
        name: 'Sarah Johnson',
        role: 'Marketing Director',
        rating: 5,
        text: 'Best eyewear shopping experience! The virtual try-on feature is incredibly accurate and made choosing the perfect frames so easy.',
        image: '/images/DSC00767.JPG',
    },
    {
        name: 'Michael Chen',
        role: 'Software Engineer',
        rating: 5,
        text: 'My blue light glasses have been a game-changer for long coding sessions. Quality is exceptional and customer service is outstanding.',
        image: '/images/DSC00817.JPG',
    },
    {
        name: 'Emily Rodriguez',
        role: 'Fashion Blogger',
        rating: 5,
        text: 'Voyar has the most stylish collection! I\'ve bought three pairs and constantly get compliments. Fast shipping too!',
        image: '/images/DSC00834.JPG',
    },
]

export const Testimonials = () => {
    const sectionRef = useRef<HTMLDivElement>(null)
    const titleRef = useRef<HTMLDivElement>(null)
    const [currentIndex, setCurrentIndex] = useState(0)

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
            setCurrentIndex((prev) => (prev + 1) % testimonials.length)
        }, 4000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div ref={sectionRef} id="testimonials" className="py-12 sm:py-16 lg:py-20 bg-white">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div ref={titleRef} className="text-center mb-16 sm:mb-20">
                    <h2 className="text-4xl sm:text-5xl lg:text-7xl font-[600] text-black tracking-tight mb-4">
                        What Our Customers Say
                    </h2>
                    <p className="text-sm sm:text-base text-black/60">
                        Join thousands of happy customers
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="relative overflow-hidden">
                        <div
                            className="flex transition-transform duration-700 ease-out"
                            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                        >
                            {testimonials.map((testimonial, index) => (
                                <div key={index} className="min-w-full px-4">
                                    <Card className="bg-gradient-to-br from-amber-50/50 to-white backdrop-blur-sm border-amber-200 rounded-2xl shadow-lg">
                                        <CardContent className="p-8 sm:p-12 text-center">
                                            <img
                                                src={testimonial.image}
                                                alt={testimonial.name}
                                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover mx-auto mb-6 border-2 border-amber-200"
                                            />
                                            <div className="flex justify-center mb-4">
                                                {[...Array(testimonial.rating)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className="w-4 h-4 fill-amber-400 text-amber-400 mx-0.5"
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-base sm:text-lg text-black/80 leading-relaxed mb-6 max-w-2xl mx-auto">
                                                "{testimonial.text}"
                                            </p>
                                            <h4 className="font-[600] text-black text-base sm:text-lg">
                                                {testimonial.name}
                                            </h4>
                                            <p className="text-xs sm:text-sm text-black/50 mt-1">{testimonial.role}</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Dots */}
                    <div className="flex justify-center mt-8 space-x-2">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-amber-600 w-8' : 'bg-black/30'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
