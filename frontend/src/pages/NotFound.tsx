import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Home, Search, ShoppingBag, ArrowLeft, Sparkles, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'

const NotFound = () => {
    const navigate = useNavigate()

    // Generate sparkle positions once
    const [sparklePositions] = useState(() =>
        [...Array(6)].map(() => ({
            top: `${20 + Math.random() * 60}%`,
            left: `${20 + Math.random() * 60}%`,
        }))
    )

    const floatingAnimation = {
        y: [0, -20, 0],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut" as const
        }
    }

    const glassesAnimation = {
        rotate: [0, 5, -5, 0],
        scale: [1, 1.05, 1],
        transition: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut" as const
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center px-4 py-20 overflow-hidden relative transition-colors duration-300">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-amber-200/30 to-orange-200/30 dark:from-amber-900/10 dark:to-orange-900/10 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        rotate: [360, 180, 0],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-br from-pink-200/30 to-purple-200/30 dark:from-pink-900/10 dark:to-purple-900/10 rounded-full blur-3xl"
                />
            </div>

            <div className="max-w-5xl mx-auto text-center relative z-10">
                {/* Animated 404 with Glasses */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative mb-12"
                >
                    <motion.div
                        animate={floatingAnimation}
                        className="relative inline-block"
                    >
                        {/* Large 404 Text */}
                        <h1 className="text-[180px] md:text-[280px] font-[900] leading-none">
                            <span className="text-transparent bg-clip-text bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500">
                                4
                            </span>
                            <span className="relative inline-block">
                                <span className="text-transparent bg-clip-text bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500">
                                    0
                                </span>
                                {/* Animated Glasses on the 0 */}
                                <motion.div
                                    animate={glassesAnimation}
                                    className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                >
                                    <Eye className="w-16 h-16 md:w-24 md:h-24 text-amber-600" />
                                </motion.div>
                            </span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500">
                                4
                            </span>
                        </h1>
                    </motion.div>

                    {/* Sparkle Effects */}
                    {sparklePositions.map((position, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                                opacity: [0, 1, 0],
                                scale: [0, 1, 0],
                                rotate: [0, 180, 360]
                            }}
                            transition={{
                                duration: 2,
                                delay: i * 0.3,
                                repeat: Infinity,
                                repeatDelay: 1
                            }}
                            className="absolute"
                            style={position}
                        >
                            <Sparkles className="w-6 h-6 text-amber-400" />
                        </motion.div>
                    ))}
                </motion.div>

                {/* Text Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="mb-12"
                >
                    <h2 className="text-4xl md:text-6xl font-[700] text-black dark:text-white mb-6">
                        Oops! Page Not Found
                    </h2>
                    <p className="text-xl md:text-2xl text-black/60 dark:text-white/60 mb-4 max-w-2xl mx-auto">
                        Looks like this page took off its glasses and got lost!
                    </p>
                    <p className="text-lg text-black/50 dark:text-white/50 max-w-xl mx-auto">
                        Don't worry, we'll help you find your way back to something spectacular.
                    </p>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
                >
                    <Button
                        onClick={() => navigate('/')}
                        className="group bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-6 rounded-2xl text-lg font-[600] shadow-xl hover:shadow-2xl transition-all"
                    >
                        <Home className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                        Back to Home
                    </Button>

                    <Button
                        onClick={() => navigate(-1)}
                        variant="outline"
                        className="border-2 border-amber-300 dark:border-amber-700 hover:border-amber-500 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-black dark:text-white px-8 py-6 rounded-2xl text-lg font-[600] transition-all"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Go Back
                    </Button>
                </motion.div>

                {/* Quick Links */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto"
                >
                    <motion.div
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 border-amber-200 dark:border-amber-900/50 rounded-2xl p-6 cursor-pointer shadow-lg hover:shadow-xl transition-all"
                        onClick={() => navigate('/collections')}
                    >
                        <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Eye className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-lg font-[700] text-black dark:text-white mb-2">Browse Collections</h3>
                        <p className="text-sm text-black/60 dark:text-white/60">
                            Explore our stunning eyewear collection
                        </p>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-900/50 rounded-2xl p-6 cursor-pointer shadow-lg hover:shadow-xl transition-all"
                        onClick={() => navigate('/collections')}
                    >
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Search className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-lg font-[700] text-black dark:text-white mb-2">Search Products</h3>
                        <p className="text-sm text-black/60 dark:text-white/60">
                            Find the perfect frames for you
                        </p>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 border-green-200 dark:border-green-900/50 rounded-2xl p-6 cursor-pointer shadow-lg hover:shadow-xl transition-all"
                        onClick={() => navigate('/cart')}
                    >
                        <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <ShoppingBag className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-lg font-[700] text-black dark:text-white mb-2">View Cart</h3>
                        <p className="text-sm text-black/60 dark:text-white/60">
                            Check out your saved items
                        </p>
                    </motion.div>
                </motion.div>

                {/* Fun Message */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="mt-16"
                >
                    <p className="text-black/40 dark:text-white/40 italic">
                        "The only thing we didn't see coming was you ending up here!"
                    </p>
                </motion.div>
            </div>
        </div>
    )
}

export default NotFound
