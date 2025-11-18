import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { Features } from './components/Features'
import { ProductGrid } from './components/ProductGrid'
import { Services } from './components/Services'
import { VirtualTryOn } from './components/VirtualTryOn'
import { BrandShowcase } from './components/BrandShowcase'
import { Testimonials } from './components/Testimonials'
import { Newsletter } from './components/Newsletter'
import { Footer } from './components/Footer'
import { useSmoothScroll } from './lib/smoothScroll'
import './App.css'

function App() {
  useSmoothScroll()

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <Features />
      <ProductGrid />
      <Services />
      <VirtualTryOn />
      <BrandShowcase />
      <Testimonials />
      <Newsletter />
      <Footer />
    </div>
  )
}

export default App
