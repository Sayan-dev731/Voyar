import { useState } from 'react'
import { Mail, Phone, MapPin, Send, CheckCircle, Clock, MessageSquare } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    })
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Simulate API call
        setTimeout(() => {
            setLoading(false)
            setSubmitted(true)
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' })

            setTimeout(() => setSubmitted(false), 5000)
        }, 1500)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-amber-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-20 px-4 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-5xl md:text-6xl font-[700] text-black dark:text-white mb-6">
                        Get In <span className="text-amber-600 dark:text-amber-400">Touch</span>
                    </h1>
                    <p className="text-xl text-black/60 dark:text-white/60 max-w-2xl mx-auto">
                        Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {/* Contact Cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="border-2 border-amber-200 dark:border-amber-900/30 rounded-2xl h-full hover:shadow-xl transition-shadow bg-white dark:bg-gray-900">
                            <CardContent className="p-6">
                                <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg">
                                    <Mail className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-[700] text-black dark:text-white mb-2">Email Us</h3>
                                <p className="text-black/60 dark:text-white/60 mb-4">Send us an email anytime!</p>
                                <a href="mailto:voyareyewear@gmail.com" className="text-amber-600 dark:text-amber-400 font-[600] hover:text-amber-700 dark:hover:text-amber-300 transition-colors">
                                    voyareyewear@gmail.com
                                </a>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="border-2 border-blue-200 dark:border-blue-900/30 rounded-2xl h-full hover:shadow-xl transition-shadow bg-white dark:bg-gray-900">
                            <CardContent className="p-6">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg">
                                    <Phone className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-[700] text-black dark:text-white mb-2">Call Us</h3>
                                <p className="text-black/60 dark:text-white/60 mb-4">Mon-Sat from 9am to 7pm</p>
                                <a href="tel:+911234567890" className="text-blue-600 dark:text-blue-400 font-[600] hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                                    +91 123 456 7890
                                </a>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="border-2 border-green-200 dark:border-green-900/30 rounded-2xl h-full hover:shadow-xl transition-shadow bg-white dark:bg-gray-900">
                            <CardContent className="p-6">
                                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg">
                                    <MapPin className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-[700] text-black dark:text-white mb-2">Visit Us</h3>
                                <p className="text-black/60 dark:text-white/60 mb-4">Come say hello at our office</p>
                                <p className="text-green-600 dark:text-green-400 font-[600]">
                                    123 Fashion Street, Mumbai, India
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Contact Form */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="border-2 border-amber-200 dark:border-amber-900/30 rounded-3xl shadow-2xl overflow-hidden bg-white dark:bg-gray-900">
                            <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-8 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                                <MessageSquare className="w-12 h-12 mb-4 relative z-10" />
                                <h2 className="text-3xl font-[700] mb-2 relative z-10">Send us a message</h2>
                                <p className="text-white/90 relative z-10">Fill out the form and we'll get back to you within 24 hours</p>
                            </div>
                            <CardContent className="p-8">
                                {submitted ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-12"
                                    >
                                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                                        </div>
                                        <h3 className="text-2xl font-[700] text-black dark:text-white mb-3">Message Sent!</h3>
                                        <p className="text-black/60 dark:text-white/60">
                                            Thank you for contacting us. We'll get back to you soon!
                                        </p>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-[600] text-black dark:text-gray-200 mb-2">
                                                Your Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:border-amber-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900/50 outline-none transition-all dark:text-white"
                                                placeholder="John Doe"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-[600] text-black dark:text-gray-200 mb-2">
                                                    Email Address *
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:border-amber-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900/50 outline-none transition-all dark:text-white"
                                                    placeholder="john@example.com"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-[600] text-black dark:text-gray-200 mb-2">
                                                    Phone Number
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:border-amber-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900/50 outline-none transition-all dark:text-white"
                                                    placeholder="+91 1234567890"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-[600] text-black dark:text-gray-200 mb-2">
                                                Subject *
                                            </label>
                                            <select
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:border-amber-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900/50 outline-none transition-all dark:text-white"
                                            >
                                                <option value="">Select a subject</option>
                                                <option value="general">General Inquiry</option>
                                                <option value="product">Product Question</option>
                                                <option value="order">Order Status</option>
                                                <option value="support">Technical Support</option>
                                                <option value="feedback">Feedback</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-[600] text-black dark:text-gray-200 mb-2">
                                                Message *
                                            </label>
                                            <textarea
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                required
                                                rows={5}
                                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:border-amber-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900/50 outline-none transition-all resize-none dark:text-white"
                                                placeholder="Tell us how we can help you..."
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-6 rounded-xl font-[600] text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                                        >
                                            {loading ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    Sending...
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center gap-2">
                                                    <Send className="w-5 h-5" />
                                                    Send Message
                                                </span>
                                            )}
                                        </Button>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Additional Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-8"
                    >
                        <div>
                            <h3 className="text-3xl font-[700] text-black dark:text-white mb-6">Frequently Asked Questions</h3>
                            <div className="space-y-4">
                                <Card className="border-2 border-gray-200 dark:border-gray-800 rounded-2xl hover:border-amber-300 dark:hover:border-amber-700 transition-colors bg-white dark:bg-gray-900">
                                    <CardContent className="p-6">
                                        <h4 className="font-[700] text-black dark:text-white mb-2">What are your business hours?</h4>
                                        <p className="text-black/60 dark:text-white/60">
                                            Our customer support is available Monday to Saturday, 9:00 AM to 7:00 PM IST. We typically respond to emails within 24 hours.
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="border-2 border-gray-200 dark:border-gray-800 rounded-2xl hover:border-amber-300 dark:hover:border-amber-700 transition-colors bg-white dark:bg-gray-900">
                                    <CardContent className="p-6">
                                        <h4 className="font-[700] text-black dark:text-white mb-2">Do you offer in-person consultations?</h4>
                                        <p className="text-black/60 dark:text-white/60">
                                            Yes! Visit our store at 123 Fashion Street, Mumbai, or book an appointment online for a personalized eyewear consultation.
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="border-2 border-gray-200 dark:border-gray-800 rounded-2xl hover:border-amber-300 dark:hover:border-amber-700 transition-colors bg-white dark:bg-gray-900">
                                    <CardContent className="p-6">
                                        <h4 className="font-[700] text-black dark:text-white mb-2">How long does shipping take?</h4>
                                        <p className="text-black/60 dark:text-white/60">
                                            Standard delivery takes 2-3 business days. Express shipping is available for next-day delivery in major cities.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        <Card className="border-2 border-purple-200 dark:border-purple-900/30 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                            <CardContent className="p-8">
                                <Clock className="w-12 h-12 text-purple-600 dark:text-purple-400 mb-4" />
                                <h3 className="text-2xl font-[700] text-black dark:text-white mb-3">Response Time</h3>
                                <p className="text-black/70 dark:text-white/70 mb-4">
                                    We pride ourselves on quick response times. Most inquiries are answered within:
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
                                        <span className="text-black/70 dark:text-white/70">Email: <span className="font-[600] text-black dark:text-white">Within 24 hours</span></span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
                                        <span className="text-black/70 dark:text-white/70">Phone: <span className="font-[600] text-black dark:text-white">Immediate</span></span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
                                        <span className="text-black/70 dark:text-white/70">Live Chat: <span className="font-[600] text-black dark:text-white">Real-time</span></span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default Contact
