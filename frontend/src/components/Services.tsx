import { useRef } from 'react'

const services = [
    {
        id: 1,
        number: '01.',
        title: 'Prescription Lenses',
        image: '/images/20251013_024701.jpg',
    },
    {
        id: 2,
        number: '02.',
        title: 'Designer Frames',
        image: '/images/20251013_034812.jpg',
    },
    {
        id: 3,
        number: '03.',
        title: 'Eye Testing',
        image: '/images/20251013_035100.jpg',
    },
]

export const Services = () => {
    const sectionRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLDivElement>(null)
    const cardsRef = useRef<(HTMLDivElement | null)[]>([])

    return (
        <div ref={sectionRef} id="services" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white via-amber-50/30 to-white">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 sm:mb-20">
                    <h2 className="text-4xl sm:text-5xl lg:text-7xl font-[600] text-black tracking-tight mb-4">
                        Our Services
                    </h2>
                    <p className="text-sm sm:text-base text-black/60">
                        Comprehensive eyewear solutions for every need
                    </p>
                </div>

                <div ref={triggerRef} className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    {services.map((service, index) => (
                        <div
                            key={service.id}
                            ref={(el) => { cardsRef.current[index] = el }}
                            className="w-full"
                        >
                            <div className="bg-white backdrop-blur-sm border-2 border-amber-200 rounded-2xl overflow-hidden shadow-xl shadow-amber-100/50">
                                <div className="aspect-[16/10] bg-gradient-to-br from-amber-50 to-white overflow-hidden relative">
                                    <img
                                        src={service.image}
                                        alt={service.title}
                                        className="w-full h-full object-cover mix-blend-multiply opacity-90"
                                    />
                                    <div className="absolute top-6 left-6 sm:top-8 sm:left-8 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-lg border border-amber-200">
                                        <div className="text-xs sm:text-sm text-amber-600 font-semibold mb-1">{service.number}</div>
                                        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-[600] text-black">
                                            {service.title}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>                {/* Description below cards */}
                <div className="mt-10 sm:mt-12 max-w-3xl mx-auto text-center">
                    <p className="text-base sm:text-lg text-black/70 leading-relaxed mb-4">
                        We introduce methodologies, processes, and learnings to drive exceptional eyewear experiences.
                    </p>
                    <p className="text-sm text-black/50">
                        Ensuring impactful solutions that enhance your vision and style.
                    </p>
                </div>
            </div>
        </div>
    )
}
