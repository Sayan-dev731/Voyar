import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, Search, X, Eye, ChevronDown, Bell, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { API_URL } from '@/config/api';
import { useWishlist } from '@/context/WishlistContext';
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
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

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

    // Helper to calculate total stock for a product
    const getProductStock = (product: ExtendedProduct): number => {
        // Check if product has color variants with stock
        if (product.colors && product.colors.length > 0) {
            return product.colors.reduce((total, color) => total + (color.quantity || 0), 0);
        }
        return product.stock || 0;
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

        // Sort products - out of stock items go to the bottom
        let sorted = [...results];

        switch (sortBy) {
            case 'price-low':
                sorted = sorted.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                sorted = sorted.sort((a, b) => b.price - a.price);
                break;
            default:
                // Keep original order for relevant
                break;
        }

        // Always move out-of-stock items to the bottom
        sorted = sorted.sort((a, b) => {
            const aStock = getProductStock(a);
            const bStock = getProductStock(b);
            if (aStock === 0 && bStock > 0) return 1;
            if (aStock > 0 && bStock === 0) return -1;
            return 0;
        });

        return sorted;
    }, [selectedCategory, sortBy, products, searchQuery]);

    return (
        <div className="min-h-screen pt-4 sm:pt-6 pb-16 bg-white dark:bg-gray-950 transition-colors duration-300">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-black/50 dark:text-white/50 mb-6">
                    <Link to="/" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Home</Link>
                    <span>/</span>
                    <span className="text-black dark:text-white">Collections</span>
                </div>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black dark:text-white mb-2">
                        {searchQuery ? 'Search Results' : selectedCategory === 'All' ? 'All Collections' : selectedCategory}
                    </h1>
                    <p className="text-black/60 dark:text-white/60">
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
                                : 'bg-amber-50 dark:bg-amber-900/30 text-black/70 dark:text-white/70 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-900/50'
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
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40 dark:text-white/40" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder="Search products..."
                            className="w-full pl-12 pr-10 py-3 bg-amber-50 dark:bg-gray-800 border border-amber-200 dark:border-amber-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 dark:text-white text-sm"
                        />
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40 hover:text-amber-600 dark:hover:text-amber-400"
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
                                className="appearance-none bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-900/50 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer text-black dark:text-white"
                            >
                                <option value="relevant">Most Relevant</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40 dark:text-white/40 pointer-events-none" />
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
                            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-amber-100 dark:border-amber-900/30 overflow-hidden">
                                <div className="aspect-square shimmer dark:bg-gray-800" />
                                <div className="p-4 space-y-3">
                                    <div className="h-4 shimmer dark:bg-gray-800 rounded w-3/4" />
                                    <div className="h-4 shimmer dark:bg-gray-800 rounded w-full" />
                                    <div className="h-3 shimmer dark:bg-gray-800 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <Search className="h-20 w-20 text-amber-200 dark:text-amber-900/30 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-black dark:text-white mb-4">No products found</h2>
                        <p className="text-black/60 dark:text-white/60 mb-8">
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
                        {filteredProducts.map((product) => {
                            const productStock = getProductStock(product);
                            const isOutOfStock = productStock === 0;
                            const productId = product._id || product.id;
                            const inWishlist = productId ? isInWishlist(productId) : false;

                            return (
                                <div
                                    key={product._id || product.id}
                                    className={`group bg-white dark:bg-gray-900 rounded-2xl border overflow-hidden transition-all duration-300 ${isOutOfStock
                                            ? 'border-gray-200 dark:border-gray-700 opacity-75'
                                            : 'border-amber-100 dark:border-amber-900/30 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-xl'
                                        }`}
                                >
                                    {/* Product Image */}
                                    <div
                                        className="relative aspect-square bg-amber-50 dark:bg-gray-800 overflow-hidden cursor-pointer"
                                        onClick={() => navigate(`/product/${product._id || product.id}`)}
                                    >
                                        {/* Wishlist Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (productId) {
                                                    if (inWishlist) {
                                                        removeFromWishlist(productId);
                                                    } else {
                                                        addToWishlist(product);
                                                    }
                                                }
                                            }}
                                            className={`absolute top-3 right-3 z-10 p-2 rounded-full shadow-md transition-all ${inWishlist
                                                    ? 'bg-red-500 text-white'
                                                    : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500'
                                                }`}
                                        >
                                            <Heart className={`h-4 w-4 ${inWishlist ? 'fill-white' : ''}`} />
                                        </button>

                                        {isOutOfStock ? (
                                            <span className="absolute top-3 left-3 z-10 px-2.5 py-1 text-xs font-semibold bg-gray-500 text-white rounded-md">
                                                Out of Stock
                                            </span>
                                        ) : (
                                            <span className="absolute top-3 left-3 z-10 px-2.5 py-1 text-xs font-semibold bg-amber-500 text-white rounded-md">
                                                Bestseller
                                            </span>
                                        )}

                                        {/* Quick View / Notify Overlay */}
                                        <div className={`absolute inset-0 ${isOutOfStock ? 'bg-black/40' : 'bg-black/20'} opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center`}>
                                            {isOutOfStock ? (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        // TODO: Implement notify me functionality
                                                        alert('We will notify you when this product is back in stock!');
                                                    }}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 rounded-full text-sm font-medium text-white shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:bg-amber-600"
                                                >
                                                    <Bell className="h-4 w-4" />
                                                    Notify Me
                                                </button>
                                            ) : (
                                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm font-medium text-black shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                    <Eye className="h-4 w-4" />
                                                    Quick View
                                                </span>
                                            )}
                                        </div>

                                        <img
                                            src={convertGoogleDriveLink(product.image)}
                                            alt={product.name}
                                            className={`w-full h-full object-cover transition-transform duration-500 ${isOutOfStock ? 'grayscale' : 'group-hover:scale-105'}`}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=No+Image';
                                            }}
                                        />
                                    </div>

                                    {/* Product Info */}
                                    <div
                                        className="p-4 cursor-pointer"
                                        onClick={() => navigate(`/product/${product._id || product.id}`)}
                                    >
                                        <p className={`text-xs font-medium mb-1 ${isOutOfStock ? 'text-gray-400 dark:text-gray-500' : 'text-amber-600 dark:text-amber-400'}`}>Voyar Eyewear</p>
                                        <h3 className={`text-sm font-semibold line-clamp-2 mb-2 min-h-[2.5rem] transition-colors ${isOutOfStock
                                                ? 'text-gray-500 dark:text-gray-400'
                                                : 'text-black dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400'
                                            }`}>
                                            {product.name}
                                        </h3>

                                        <div className="flex items-baseline gap-2 mb-1">
                                            <span className={`text-lg font-bold ${isOutOfStock ? 'text-gray-400 dark:text-gray-500' : 'text-black dark:text-white'}`}>₹{product.price}</span>
                                            {product.originalPrice && (
                                                <span className="text-sm text-black/40 dark:text-white/40 line-through">₹{product.originalPrice}</span>
                                            )}
                                        </div>

                                        {isOutOfStock ? (
                                            <p className="text-xs text-red-500 dark:text-red-400 font-medium">Currently unavailable</p>
                                        ) : (
                                            <p className="text-xs text-black/50 dark:text-white/50">Inclusive of all taxes</p>
                                        )}

                                        <div className="mt-3 pt-3 border-t border-amber-50 dark:border-amber-900/30 flex items-center justify-between">
                                            <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${isOutOfStock
                                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                                                    : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                                }`}>
                                                {product.category}
                                            </span>
                                            {isOutOfStock && (
                                                <span className="text-xs text-gray-400 dark:text-gray-500">Stock out</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
