import { useRef } from 'react'

const brands = [
    'Ray-Ban',
    'Oakley',
    'Persol',
    'Vogue',
    'Prada',
    'Gucci',
    'Tom Ford',
    'Versace',
]

export const BrandShowcase = () => {
    const sectionRef = useRef<HTMLDivElement>(null)
    const titleRef = useRef<HTMLHeadingElement>(null)
    const brandsRef = useRef<HTMLDivElement>(null)

    return (
        <div ref={sectionRef} className="py-20 sm:py-24 lg:py-32 bg-gradient-to-b from-amber-50/30 via-white to-amber-50/30 border-y border-amber-200/40">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <h2
                    ref={titleRef}
                    className="text-3xl sm:text-4xl lg:text-5xl font-[600] text-black text-center mb-12 sm:mb-16 tracking-tight"
                >
                    Premium Brands
                </h2>
                <div
                    ref={brandsRef}
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10"
                >
                    {brands.map((brand, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-center p-8 sm:p-10 bg-white border border-amber-200/60 rounded-xl hover:bg-amber-50 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-100/50 transition-all duration-300"
                        >
                            <span className="text-lg sm:text-xl font-[600] text-black">{brand}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
