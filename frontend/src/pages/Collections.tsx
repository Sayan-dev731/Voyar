import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Star, ArrowLeft, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { API_URL } from '@/config/api';
import type { Product } from '@/types/product';

// Helper function to convert Google Drive link to direct image URL
const convertGoogleDriveLink = (url: string): string => {
    if (!url) return url;

    if (url.includes('drive.google.com/thumbnail')) {
        return url;
    }

    const drivePatterns = [
        /https:\/\/drive\.google\.com\/file\/d\/([^/]+)\/view/,
        /https:\/\/drive\.google\.com\/file\/d\/([^/]+)/,
        /https:\/\/drive\.google\.com\/open\?id=([^&]+)/,
        /https:\/\/drive\.google\.com\/uc\?id=([^&]+)/,
        /https:\/\/drive\.google\.com\/uc\?export=view&id=([^&]+)/,
        /https:\/\/drive\.google\.com\/thumbnail\?id=([^&]+)/
    ];

    for (const pattern of drivePatterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
        }
    }

    return url;
};

export default function Collections() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [sortBy, setSortBy] = useState<'relevant' | 'price-low' | 'price-high' | 'rating'>('relevant');
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const navigate = useNavigate();

    // Sync search query from URL
    useEffect(() => {
        const query = searchParams.get('q') || '';
        setSearchQuery(query);
    }, [searchParams]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
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

    const categories = ['All', 'Sunglasses', 'Eyeglasses', 'Computer Glasses', 'Sports Glasses'];

    // Handle search input change
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        if (value.trim()) {
            setSearchParams({ q: value });
        } else {
            setSearchParams({});
        }
    };

    // Clear search
    const clearSearch = () => {
        setSearchQuery('');
        setSearchParams({});
    };

    // Filter and sort products
    const filteredProducts = useMemo(() => {
        const results = products.filter((product) => {
            // Filter by search query
            let matchesSearch = true;
            if (searchQuery.trim()) {
                const searchLower = searchQuery.toLowerCase();
                matchesSearch =
                    product.name.toLowerCase().includes(searchLower) ||
                    product.description.toLowerCase().includes(searchLower) ||
                    product.category.toLowerCase().includes(searchLower) ||
                    (product.detailedDescription?.toLowerCase().includes(searchLower) ?? false);
            }

            const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });

        // Sort results
        switch (sortBy) {
            case 'price-low':
                return [...results].sort((a, b) => a.price - b.price);
            case 'price-high':
                return [...results].sort((a, b) => b.price - a.price);
            case 'rating':
                return [...results].sort((a, b) => (b.rating || 0) - (a.rating || 0));
            default:
                return results;
        }
    }, [selectedCategory, sortBy, products, searchQuery]);

    return (
        <div className="min-h-screen pt-20 sm:pt-24 pb-16 bg-gradient-to-b from-white via-amber-50/30 to-white">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="mb-6 text-black/60 hover:text-amber-600 hover:bg-amber-50"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>

                <div className="mb-8">
                    <h1 className="text-4xl sm:text-5xl font-[600] text-black mb-2">
                        {searchQuery ? 'Search Results' : 'Our Collections'}
                    </h1>
                    <div className="flex items-center gap-2 text-black/60">
                        <Search className="h-4 w-4" />
                        <span>
                            {searchQuery
                                ? `${filteredProducts.length} results for "${searchQuery}"`
                                : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'} available`
                            }
                        </span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Filters Sidebar */}
                    <div className="lg:col-span-1 mb-6 lg:mb-0">
                        <Card className="border-amber-200/60 rounded-2xl lg:sticky lg:top-24">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <SlidersHorizontal className="h-5 w-5 text-amber-600" />
                                    <h2 className="text-lg font-[600] text-black">Filters</h2>
                                </div>

                                {/* Search Input */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-black mb-3">Search</h3>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => handleSearchChange(e.target.value)}
                                            placeholder="Search products..."
                                            className="w-full pl-10 pr-10 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400 text-sm"
                                        />
                                        {searchQuery && (
                                            <button
                                                onClick={clearSearch}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-amber-600"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Category Filter */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-black mb-3">Category</h3>
                                    <div className="space-y-2">
                                        {categories.map((category) => (
                                            <button
                                                key={category}
                                                onClick={() => setSelectedCategory(category)}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === category
                                                    ? 'bg-amber-100 text-amber-700 font-medium'
                                                    : 'text-black/60 hover:bg-amber-50 hover:text-amber-600'
                                                    }`}
                                            >
                                                {category}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Sort By */}
                                <div>
                                    <h3 className="text-sm font-medium text-black mb-3">Sort By</h3>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                                        className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400 text-sm"
                                    >
                                        <option value="relevant">Most Relevant</option>
                                        <option value="price-low">Price: Low to High</option>
                                        <option value="price-high">Price: High to Low</option>
                                        <option value="rating">Highest Rated</option>
                                    </select>
                                </div>

                                {/* Reset Filters */}
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSelectedCategory('All');
                                        setSortBy('relevant');
                                        clearSearch();
                                    }}
                                    className="w-full mt-6 border-amber-200 hover:border-amber-400 hover:bg-amber-50"
                                >
                                    Reset Filters
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Results Grid */}
                    <div className="lg:col-span-3">
                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600"></div>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-20">
                                <Search className="h-24 w-24 text-amber-200 mx-auto mb-6" />
                                <h2 className="text-2xl font-[600] text-black mb-4">No products found</h2>
                                <p className="text-black/60 mb-8">
                                    {searchQuery
                                        ? `No results found for "${searchQuery}". Try adjusting your search or filters.`
                                        : 'Try adjusting your filters to find what you\'re looking for.'
                                    }
                                </p>
                                <Button
                                    onClick={() => {
                                        setSelectedCategory('All');
                                        setSortBy('relevant');
                                        clearSearch();
                                    }}
                                    className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
                                >
                                    Reset Filters
                                </Button>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product._id || product.id} product={product} navigate={navigate} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

interface ProductCardProps {
    product: Product;
    navigate: (path: string) => void;
}

const ProductCard = ({ product, navigate }: ProductCardProps) => {
    return (
        <Card
            className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-amber-100/50 bg-white backdrop-blur-sm border-amber-200/60 hover:border-amber-400 rounded-2xl"
            onClick={() => navigate(`/product/${product._id || product.id}`)}
        >
            <CardContent className="p-0">
                <div className="aspect-[4/3] bg-gradient-to-br from-amber-50 to-white overflow-hidden">
                    <img
                        src={convertGoogleDriveLink(product.image)}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image'
                        }}
                    />
                </div>
                <div className="p-4 sm:p-6">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                            <h3 className="text-lg font-[600] text-black mb-1">
                                {product.name}
                            </h3>
                            <p className="text-xs text-black/50 mb-2">
                                {product.category}
                            </p>
                            {/* Rating */}
                            {product.rating && (
                                <div className="flex items-center gap-1 mb-2">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-3 w-3 ${i < Math.floor(product.rating!)
                                                    ? 'fill-amber-500 text-amber-500'
                                                    : 'text-amber-200'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    {product.reviews && (
                                        <span className="text-xs text-black/50">
                                            ({product.reviews})
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="text-lg font-[600] text-amber-600">
                            ${product.price}
                        </div>
                    </div>

                    <p className="text-xs text-black/60 mb-3 leading-relaxed line-clamp-2">
                        {product.description}
                    </p>

                    {/* Specifications Preview */}
                    {product.specifications && (
                        <div className="mb-4 pb-3 border-t border-amber-100 pt-3">
                            <h4 className="text-xs font-medium text-black mb-2">Specifications</h4>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                {product.specifications.material && (
                                    <div>
                                        <span className="text-black/40">Material:</span>
                                        <p className="text-black/70 font-medium">{product.specifications.material}</p>
                                    </div>
                                )}
                                {product.specifications.lensType && (
                                    <div>
                                        <span className="text-black/40">Lens:</span>
                                        <p className="text-black/70 font-medium">{product.specifications.lensType}</p>
                                    </div>
                                )}
                                {product.specifications.frameWidth && (
                                    <div>
                                        <span className="text-black/40">Frame:</span>
                                        <p className="text-black/70 font-medium">{product.specifications.frameWidth}</p>
                                    </div>
                                )}
                                {product.specifications.uvProtection && (
                                    <div>
                                        <span className="text-black/40">UV:</span>
                                        <p className="text-black/70 font-medium">{product.specifications.uvProtection}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Color Options */}
                    {product.colors && product.colors.length > 0 && (
                        <div className="mb-4">
                            <p className="text-xs text-black/50 mb-2">Available Colors:</p>
                            <div className="flex gap-2">
                                {product.colors.slice(0, 4).map((color, idx) => (
                                    <div
                                        key={idx}
                                        className="w-6 h-6 rounded-full border-2 border-amber-200"
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 h-10 text-sm font-medium transition-all duration-200 shadow-md shadow-amber-200">
                        View Full Details
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
