import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { products } from '@/data/products'

export const ProductGrid = () => {
    const sectionRef = useRef<HTMLDivElement>(null)
    const titleRef = useRef<HTMLHeadingElement>(null)
    const cardsRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()

    return (
        <div ref={sectionRef} id="collection" className="py-24 sm:py-32 lg:py-40 bg-gradient-to-b from-white via-amber-50/30 to-white">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div ref={titleRef} className="text-center mb-16 sm:mb-20 lg:mb-24">
                    <h2 className="text-4xl sm:text-5xl lg:text-7xl font-[600] text-black tracking-tight mb-4">
                        Our Collection
                    </h2>
                    <p className="text-sm sm:text-base text-black/60 max-w-2xl mx-auto">
                        Handpicked styles to match your personality
                    </p>
                </div>

                <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {products.map((product) => (
                        <Card
                            key={product.id}
                            className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-amber-100/50 bg-white backdrop-blur-sm border-amber-200/60 hover:border-amber-400 rounded-2xl"
                        >
                            <CardContent className="p-0">
                                <div className="aspect-[4/3] bg-gradient-to-br from-amber-50 to-white overflow-hidden">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
                                    />
                                </div>
                                <div className="p-6 sm:p-7">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="text-lg sm:text-xl font-[600] text-black mb-1">
                                                {product.name}
                                            </h3>
                                            <p className="text-xs sm:text-sm text-black/50">
                                                {product.category}
                                            </p>
                                        </div>
                                        <div className="text-lg sm:text-xl font-[600] text-amber-600">
                                            ${product.price}
                                        </div>
                                    </div>
                                    <p className="text-xs sm:text-sm text-black/60 mb-5 leading-relaxed">
                                        {product.description}
                                    </p>
                                    <Button
                                        onClick={() => navigate(`/product/${product.id}`)}
                                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 h-11 text-sm font-medium transition-all duration-200 shadow-md shadow-amber-200"
                                    >
                                        View Details
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
