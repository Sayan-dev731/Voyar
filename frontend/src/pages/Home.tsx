import { Hero } from '@/components/Hero'
import BentoGrid from '@/components/BentoGrid'
import { ProductGrid } from '@/components/ProductGrid'
import { ShopByGender } from '@/components/ShopByGender'
import { ContactCTA } from '@/components/ContactCTA'
import { Testimonials } from '@/components/Testimonials'
import { VirtualTryOn } from '@/components/VirtualTryOn'
import { useSmoothScroll } from '@/lib/smoothScroll'

export const Home = () => {
    useSmoothScroll()

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden transition-colors duration-300">
            {/* Hero with Bestsellers */}
            <Hero />

            {/* Explore Our Collections */}
            <ProductGrid />

            {/* Eyewear Features */}
            <BentoGrid />

            {/* Contact CTA */}
            <ContactCTA />

            {/* Customer Testimonials */}
            <Testimonials />

            {/* Shop by Gender - Men & Women */}
            <ShopByGender />

            {/* Virtual Try-On Preview */}
            <VirtualTryOn />
        </div>
    )
}
