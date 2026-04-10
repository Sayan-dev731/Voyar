import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const genderCategories = [
    {
        label: 'Men',
        description: 'Bold frames for the modern man',
        image: '/images/20251013_035040.jpg',
        href: '/collections?gender=men',
    },
    {
        label: 'Women',
        description: 'Elegant eyewear for every occasion',
        image: '/images/woman.png',
        href: '/collections?gender=women',
    },
]

export const ShopByGender = () => {
    return (
        <section className="py-16 sm:py-20 lg:py-28 bg-white dark:bg-gray-950 transition-colors duration-300">
            <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12 sm:mb-16"
                >
                    <p className="text-[11px] tracking-[0.2em] uppercase text-amber-600 dark:text-amber-400 mb-3">
                        Collections
                    </p>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-black dark:text-white tracking-tight">
                        Shop Eyewear for Everyone
                    </h2>
                </motion.div>

                {/* Gender Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {genderCategories.map((category, index) => (
                        <motion.div
                            key={category.label}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                        >
                            <Link
                                to={category.href}
                                className="group block relative aspect-[4/5] sm:aspect-[3/4] overflow-hidden"
                            >
                                {/* Background Image */}
                                <img
                                    src={category.image}
                                    alt={category.label}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1s] ease-out group-hover:scale-105"
                                />
                                
                                {/* Dark overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent transition-all duration-500 group-hover:from-black/70" />

                                {/* Content */}
                                <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-10">
                                    <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
                                        <h3 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white mb-2 tracking-tight">
                                            {category.label}
                                        </h3>
                                        <p className="text-white/60 text-sm mb-5">
                                            {category.description}
                                        </p>
                                        <span className="inline-flex items-center gap-2 text-white text-[13px] font-medium tracking-[0.04em] uppercase bg-amber-500 px-5 py-2.5 rounded-full group-hover:bg-amber-600 group-hover:gap-3 transition-all duration-300">
                                            Shop Now
                                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default ShopByGender
