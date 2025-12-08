import { Hero } from '@/components/Hero'
import { Features } from '@/components/Features'
import { ProductGrid } from '@/components/ProductGrid'
import { Services } from '@/components/Services'
import { VirtualTryOn } from '@/components/VirtualTryOn'
import { BrandShowcase } from '@/components/BrandShowcase'
import { Testimonials } from '@/components/Testimonials'
import { Newsletter } from '@/components/Newsletter'
import BentoGrid from '@/components/BentoGrid'
import { useSmoothScroll } from '@/lib/smoothScroll'

export const Home = () => {
    useSmoothScroll()

    return (
        <div className="min-h-screen bg-white overflow-x-hidden">
            <Hero />
            <Features />
            <BentoGrid />
            <ProductGrid />
            <Services />
            <VirtualTryOn />
            <BrandShowcase />
            <Testimonials />
            <Newsletter />
        </div>
    )
}
