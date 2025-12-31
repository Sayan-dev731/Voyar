import { Hero } from '@/components/Hero'
import BentoGrid from '@/components/BentoGrid'
import { ProductGrid } from '@/components/ProductGrid'
import { VirtualTryOn } from '@/components/VirtualTryOn'
import { Testimonials } from '@/components/Testimonials'
import { Newsletter } from '@/components/Newsletter'
import { useSmoothScroll } from '@/lib/smoothScroll'

export const Home = () => {
    useSmoothScroll()

    return (
        <div className="min-h-screen bg-white overflow-x-hidden">
            <Hero />
            <BentoGrid />
            <ProductGrid />
            <VirtualTryOn />
            <Testimonials />
            <Newsletter />
        </div>
    )
}
