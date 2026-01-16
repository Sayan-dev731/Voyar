import { Hero } from '@/components/Hero'
import BentoGrid from '@/components/BentoGrid'
import { ProductGrid } from '@/components/ProductGrid'
import { MoodLook } from '@/components/MoodLook'
import { VirtualTryOn } from '@/components/VirtualTryOn'
import { Testimonials } from '@/components/Testimonials'
import { Newsletter } from '@/components/Newsletter'
import { useSmoothScroll } from '@/lib/smoothScroll'

export const Home = () => {
    useSmoothScroll()

    return (
        <div className="min-h-screen bg-white overflow-x-hidden">
            {/* Hero with Bestsellers & Category Tabs */}
            <Hero />

            {/* Featured Products Carousel */}
            <ProductGrid />

            {/* Today's Mood Look - Lifestyle Categories */}
            <MoodLook />

            {/* Most Loved - Customer Testimonials */}
            <Testimonials />

            {/* Why Choose Voyar - Features */}
            <BentoGrid />

            {/* Virtual Try-On Preview */}
            <VirtualTryOn />

            {/* Newsletter Subscription */}
            <Newsletter />
        </div>
    )
}
