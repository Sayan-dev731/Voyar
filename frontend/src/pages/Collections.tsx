import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, Search, X, Eye, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { API_URL } from '@/config/api';
import type { Product } from '@/types/product';

// Helper function to convert Google Drive link to direct image URL
const convertGoogleDriveLink = (url: string): string => {
    if (!url) return url;
    if (url.includes('drive.google.com/thumbnail')) return url;
    const drivePatterns = [
        /https:\/\/drive\.google\.com\/file\/d\/([^/]+)\/view/,
        /https:\/\/drive\.google\.com\/file\/d\/([^/]+)/,
    ];
    for (const pattern of drivePatterns) {
        const match = url.match(pattern);
        if (match?.[1]) {
            return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
        }
    }
    return url;
};

interface ExtendedProduct extends Product {
    originalPrice?: number;
}

export default function Collections() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState<ExtendedProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [sortBy, setSortBy] = useState<'relevant' | 'price-low' | 'price-high'>('relevant');
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [showFilters, setShowFilters] = useState(false);
    const navigate = useNavigate();

    // Sync search query from URL
    useEffect(() => {
        const query = searchParams.get('q') || '';
        setSearchQuery(query);
        const category = searchParams.get('category');
        if (category) {
            setSelectedCategory(category.charAt(0).toUpperCase() + category.slice(1));
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/products`);
                const data = await response.json();
                const productList = Array.isArray(data) ? data : (data.products || []);
                // Add mock original prices
                const productsWithPrices = productList.map((p: Product) => ({
                    ...p,
                    originalPrice: Math.round(p.price * 2.5),
                }));
                setProducts(productsWithPrices);
            } catch (error) {
                console.error('Failed to fetch products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const categories = ['All', 'Sunglasses', 'Eyeglasses', 'Computer Glasses', 'Sports Glasses'];

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        if (value.trim()) {
            setSearchParams({ q: value });
        } else {
            setSearchParams({});
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchParams({});
    };

    const filteredProducts = useMemo(() => {
        const results = products.filter((product) => {
            let matchesSearch = true;
            if (searchQuery.trim()) {
                const searchLower = searchQuery.toLowerCase();
                matchesSearch =
                    product.name.toLowerCase().includes(searchLower) ||
                    product.description.toLowerCase().includes(searchLower) ||
                    product.category.toLowerCase().includes(searchLower);
            }
            const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });

        switch (sortBy) {
            case 'price-low':
                return [...results].sort((a, b) => a.price - b.price);
            case 'price-high':
                return [...results].sort((a, b) => b.price - a.price);
            default:
                return results;
        }
    }, [selectedCategory, sortBy, products, searchQuery]);

    return (
        <div className="min-h-screen pt-4 sm:pt-6 pb-16 bg-white">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-black/50 mb-6">
                    <Link to="/" className="hover:text-amber-600 transition-colors">Home</Link>
                    <span>/</span>
                    <span className="text-black">Collections</span>
                </div>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-2">
                        {searchQuery ? 'Search Results' : selectedCategory === 'All' ? 'All Collections' : selectedCategory}
                    </h1>
                    <p className="text-black/60">
                        {searchQuery
                            ? `${filteredProducts.length} results for "${searchQuery}"`
                            : `${filteredProducts.length} products available`}
                    </p>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${selectedCategory === category
                                ? 'bg-amber-500 text-white shadow-md'
                                : 'bg-amber-50 text-black/70 hover:bg-amber-100 border border-amber-200'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder="Search products..."
                            className="w-full pl-12 pr-10 py-3 bg-amber-50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-sm"
                        />
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-amber-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>

                    {/* Sort & Filter */}
                    <div className="flex gap-3">
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                                className="appearance-none bg-white border border-amber-200 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                            >
                                <option value="relevant">Most Relevant</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40 pointer-events-none" />
                        </div>

                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="border-amber-200 hover:border-amber-400 hover:bg-amber-50 lg:hidden"
                        >
                            <SlidersHorizontal className="h-4 w-4 mr-2" />
                            Filters
                        </Button>
                    </div>
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-amber-100 overflow-hidden">
                                <div className="aspect-square shimmer" />
                                <div className="p-4 space-y-3">
                                    <div className="h-4 shimmer rounded w-3/4" />
                                    <div className="h-4 shimmer rounded w-full" />
                                    <div className="h-3 shimmer rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <Search className="h-20 w-20 text-amber-200 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-black mb-4">No products found</h2>
                        <p className="text-black/60 mb-8">
                            {searchQuery
                                ? `No results for "${searchQuery}". Try different keywords.`
                                : 'Try adjusting your filters.'}
                        </p>
                        <Button
                            onClick={() => {
                                setSelectedCategory('All');
                                setSortBy('relevant');
                                clearSearch();
                            }}
                            className="bg-amber-500 text-white hover:bg-amber-600"
                        >
                            Reset Filters
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {filteredProducts.map((product) => (
                            <div
                                key={product._id || product.id}
                                className="group bg-white rounded-2xl border border-amber-100 overflow-hidden hover:border-amber-300 hover:shadow-xl transition-all duration-300 cursor-pointer"
                                onClick={() => navigate(`/product/${product._id || product.id}`)}
                            >
                                {/* Product Image */}
                                <div className="relative aspect-square bg-amber-50 overflow-hidden">
                                    <span className="absolute top-3 left-3 z-10 px-2.5 py-1 text-xs font-semibold bg-amber-500 text-white rounded-md">
                                        Bestseller
                                    </span>

                                    {/* Quick View */}
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm font-medium text-black shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                            <Eye className="h-4 w-4" />
                                            Quick View
                                        </span>
                                    </div>

                                    <img
                                        src={convertGoogleDriveLink(product.image)}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=No+Image';
                                        }}
                                    />
                                </div>

                                {/* Product Info */}
                                <div className="p-4">
                                    <p className="text-xs text-amber-600 font-medium mb-1">Voyar Eyewear</p>
                                    <h3 className="text-sm font-semibold text-black line-clamp-2 mb-2 min-h-[2.5rem] group-hover:text-amber-700 transition-colors">
                                        {product.name}
                                    </h3>

                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="text-lg font-bold text-black">₹{product.price}</span>
                                        {product.originalPrice && (
                                            <span className="text-sm text-black/40 line-through">₹{product.originalPrice}</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-black/50">Inclusive of all taxes</p>

                                    <div className="mt-3 pt-3 border-t border-amber-50">
                                        <span className="inline-block px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
                                            {product.category}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
