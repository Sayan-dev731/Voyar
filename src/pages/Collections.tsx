import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Glasses, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { API_URL } from '@/config/api';

interface Product {
    _id: string;
    name: string;
    category: string;
    price: number;
    image: string;
    rating: number;
    inStock: boolean;
}

export default function Collections() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${API_URL}/products`);
                const data = await response.json();
                // Handle both array response and object with products array
                const productList = Array.isArray(data) ? data : (data.products || []);
                setProducts(productList);
            } catch (error) {
                console.error('Failed to fetch products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const categories = [
        { id: 'all', name: 'All Collections', icon: Sparkles },
        { id: 'eyeglasses', name: 'Eyeglasses', icon: Glasses },
        { id: 'sunglasses', name: 'Sunglasses', icon: Glasses },
        { id: 'computer-glasses', name: 'Computer Glasses', icon: Glasses },
    ];

    const filteredProducts = selectedCategory === 'all'
        ? products
        : products.filter(p => p.category === selectedCategory);

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50/30">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-amber-600 to-amber-700 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                            Explore Our Collections
                        </h1>
                        <p className="text-lg text-white/90 max-w-2xl mx-auto">
                            Discover our curated selection of premium eyewear. From classic frames to modern designs,
                            find the perfect pair that complements your style.
                        </p>
                    </div>
                </div>
            </div>

            {/* Category Filter */}
            <div className="sticky top-20 z-40 bg-white/95 backdrop-blur-md border-b border-black/10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map((category) => {
                            const Icon = category.icon;
                            return (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${selectedCategory === category.id
                                        ? 'bg-amber-600 text-white shadow-md'
                                        : 'bg-white text-black/70 hover:bg-amber-50 hover:text-amber-600 border border-black/10'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span className="font-medium text-sm">{category.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-black mb-2">
                        {categories.find(c => c.id === selectedCategory)?.name || 'All Collections'}
                    </h2>
                    <p className="text-black/60">
                        {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} available
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <Card key={i} className="animate-pulse">
                                <div className="aspect-square bg-gray-200 rounded-t-lg" />
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-16">
                        <Glasses className="h-16 w-16 text-black/20 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-black mb-2">No products found</h3>
                        <p className="text-black/60">Try selecting a different category</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                            <Card
                                key={product._id}
                                className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden"
                                onClick={() => navigate(`/product/${product._id}`)}
                            >
                                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-amber-50 to-white">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    {!product.inStock && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <span className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium">
                                                Out of Stock
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full capitalize">
                                            {product.category.replace('-', ' ')}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <span className="text-amber-500">★</span>
                                            <span className="text-xs font-medium text-black/70">{product.rating}</span>
                                        </div>
                                    </div>
                                    <h3 className="font-semibold text-black mb-2 group-hover:text-amber-600 transition-colors">
                                        {product.name}
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xl font-bold text-amber-600">
                                            ${product.price}
                                        </span>
                                        <Button
                                            size="sm"
                                            className="bg-amber-600 hover:bg-amber-700 text-white"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/product/${product._id}`);
                                            }}
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
