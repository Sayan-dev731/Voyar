import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'

interface MoodCategory {
    label: string
    image: string
    href: string
}

const menMoods: MoodCategory[] = [
    { label: 'CEO Look', image: '/images/20251013_035040.jpg', href: '/collections?style=formal' },
    { label: 'Casual Wear', image: '/images/20251013_024018.jpg', href: '/collections?style=casual' },
    { label: 'Athletic Look', image: '/images/20251013_040836.jpg', href: '/collections?style=sports' },
    { label: 'College', image: '/images/DSC00817.JPG', href: '/collections?style=trendy' },
    { label: 'Party', image: '/images/DSC00834.JPG', href: '/collections?style=party' },
    { label: 'Travel', image: '/images/20251017_021422.jpg', href: '/collections?category=sunglasses' },
]

const womenMoods: MoodCategory[] = [
    { label: 'Boss Lady', image: '/images/woman.png', href: '/collections?style=professional' },
    { label: 'Glam Queen', image: '/images/20251013_040226.jpg', href: '/collections?style=fashion' },
    { label: 'Athletic Look', image: '/images/20251013_024701.jpg', href: '/collections?style=sports&gender=women' },
    { label: 'College', image: '/images/20251013_023354.jpg', href: '/collections?style=trendy&gender=women' },
    { label: 'Party', image: '/images/20251013_035631.jpg', href: '/collections?style=party&gender=women' },
    { label: 'Travel', image: '/images/20251013_035812.jpg', href: '/collections?category=sunglasses&gender=women' },
]

type GenderTab = 'men' | 'women'

export const MoodLook = () => {
    const [activeGender, setActiveGender] = useState<GenderTab>('men')
    const scrollRef = useRef<HTMLDivElement>(null)

    const moods = activeGender === 'men' ? menMoods : womenMoods

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 200
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            })
        }
    }

    return (
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white to-amber-50/30">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Section Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-2">
                                Today's Mood <span className="text-gradient-amber">Look</span>
                            </h2>
                            <p className="text-black/60">Discover every look, for every style</p>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Gender Toggle */}
                            <div className="flex bg-amber-100 rounded-full p-1">
                                <button
                                    onClick={() => setActiveGender('men')}
                                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeGender === 'men'
                                            ? 'bg-amber-500 text-white shadow-md'
                                            : 'text-black/60 hover:text-black'
                                        }`}
                                >
                                    Men
                                </button>
                                <button
                                    onClick={() => setActiveGender('women')}
                                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeGender === 'women'
                                            ? 'bg-amber-500 text-white shadow-md'
                                            : 'text-black/60 hover:text-black'
                                        }`}
                                >
                                    Women
                                </button>
                            </div>

                            {/* Navigation Arrows */}
                            <div className="hidden sm:flex items-center gap-2">
                                <button
                                    onClick={() => scroll('left')}
                                    className="p-2 rounded-full bg-white border border-amber-200 text-amber-600 hover:bg-amber-50 hover:border-amber-300 transition-colors"
                                    aria-label="Scroll left"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => scroll('right')}
                                    className="p-2 rounded-full bg-white border border-amber-200 text-amber-600 hover:bg-amber-50 hover:border-amber-300 transition-colors"
                                    aria-label="Scroll right"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>

                            <Link
                                to={`/collections?gender=${activeGender}`}
                                className="hidden sm:flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
                            >
                                Explore All
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Mood Cards Carousel */}
                    <div
                        ref={scrollRef}
                        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {moods.map((mood, index) => (
                            <motion.div
                                key={mood.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.3 }}
                            >
                                <Link
                                    to={mood.href}
                                    className="flex-shrink-0 group"
                                >
                                    <div className="w-[140px] sm:w-[160px] lg:w-[180px]">
                                        <div className="relative aspect-square rounded-2xl overflow-hidden bg-amber-100 border-2 border-transparent group-hover:border-amber-400 transition-all duration-300 shadow-md group-hover:shadow-xl">
                                            <img
                                                src={mood.image}
                                                alt={mood.label}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                            {/* Label on Image */}
                                            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                                                <span className="text-white text-sm sm:text-base font-semibold drop-shadow-lg">
                                                    {mood.label}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    {/* Mobile View All Link */}
                    <div className="sm:hidden mt-4 text-center">
                        <Link
                            to={`/collections?gender=${activeGender}`}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-full font-medium hover:bg-amber-600 transition-colors"
                        >
                            Explore All Looks
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

export default MoodLook
