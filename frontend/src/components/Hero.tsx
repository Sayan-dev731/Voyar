import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

export const Hero = () => {
    const promoLeftImage = '/images/Special%20Offer%20Black%20Friday%20Instagram%20Post.svg'

    const promoRightImages = useMemo(
        () => [
            '/images/DSC00834.JPG',
            '/images/20251013_034812.jpg',
            '/images/DSC00767.JPG',
        ],
        []
    )
    const [activePromoRightIndex, setActivePromoRightIndex] = useState(0)

    useEffect(() => {
        if (promoRightImages.length <= 1) return
        const intervalId = window.setInterval(() => {
            setActivePromoRightIndex((idx) => (idx + 1) % promoRightImages.length)
        }, 2000)
        return () => window.clearInterval(intervalId)
    }, [promoRightImages.length])

    const tiles = useMemo(
        () => ({
            eyeglasses: [
                { label: 'Men', img: '/images/20251013_035040.jpg' },
                { label: 'Women', img: '/images/woman.png' },
                { label: 'Black Friday', img: promoLeftImage },
                { label: 'Free lens', img: '/images/20251013_024018.jpg' },
            ],
            sunglasses: [
                { label: 'Men', img: '/images/20251013_040836.jpg' },
                { label: 'Women', img: '/images/20251013_040226.jpg' },
                { label: 'Black Friday', img: promoLeftImage },
                { label: "Kid's", img: '/images/20251017_021422.jpg' },
            ],
        }),
        [promoLeftImage]
    )

    return (
        <section className="bg-white pt-24 sm:pt-28">
            <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-sm sm:text-base font-semibold text-black/70">Final Price Drop Fest</div>

                <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="relative overflow-hidden rounded-2xl bg-white border border-black/10">
                        <img
                            src={promoLeftImage}
                            alt="Black Friday offer"
                            className="h-[190px] sm:h-[260px] w-full object-cover"
                            loading="eager"
                        />
                    </div>

                    <div className="relative overflow-hidden rounded-2xl bg-white border border-black/10">
                        {promoRightImages.map((src, idx) => (
                            <img
                                key={src}
                                src={src}
                                alt="Offer banner"
                                className={
                                    'absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ' +
                                    (idx === activePromoRightIndex ? 'opacity-100' : 'opacity-0')
                                }
                                loading={idx === 0 ? 'eager' : 'lazy'}
                            />
                        ))}
                        <div className="absolute inset-0 ring-1 ring-inset ring-black/5" />
                    </div>
                </div>

                <div className="mt-6 border-t border-black/10" />

                <div className="mt-5">
                    <h2 className="text-base sm:text-lg font-[800] text-black">Eyeglasses</h2>
                    <div className="mt-3 flex gap-4 overflow-x-auto pb-2">
                        {tiles.eyeglasses.map((item) => (
                            <Link
                                key={item.label}
                                to="/collections"
                                className="flex-shrink-0 w-[92px]"
                                aria-label={item.label}
                            >
                                <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-white">
                                    <img
                                        src={item.img}
                                        alt={item.label}
                                        className="h-[76px] w-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="mt-2 text-center text-sm font-medium text-black/70">{item.label}</div>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="mt-5">
                    <h2 className="text-base sm:text-lg font-[800] text-black">Sunglasses</h2>
                    <div className="mt-3 flex gap-4 overflow-x-auto pb-2">
                        {tiles.sunglasses.map((item) => (
                            <Link
                                key={item.label}
                                to="/collections"
                                className="flex-shrink-0 w-[92px]"
                                aria-label={item.label}
                            >
                                <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-white">
                                    <img
                                        src={item.img}
                                        alt={item.label}
                                        className="h-[76px] w-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="mt-2 text-center text-sm font-medium text-black/70">{item.label}</div>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="h-8" />
            </div>
        </section>
    )
}
