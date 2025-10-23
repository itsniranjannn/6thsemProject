import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard.js';
import SearchBar from '../components/SearchBar.js';
import ProductModal from '../components/ProductModal.js';
import ReviewModal from '../components/ReviewModal.js';
import SupportWidget from '../components/SupportWidget.js';
import { Toast } from '../components/Toast.js';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [error, setError] = useState('');
  const { addToCart, getCartItemsCount } = useCart();
  const { user } = useAuth();

  // Toast state
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [currentMaxPrice, setCurrentMaxPrice] = useState(1000);
  const [sortBy, setSortBy] = useState('featured');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [activeAlgorithm, setActiveAlgorithm] = useState('ml');
  
  // Modal states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Animation states
  const [animateProducts, setAnimateProducts] = useState(false);
  const [cartPulse, setCartPulse] = useState(false);

  // Reviews state
  const [productReviews, setProductReviews] = useState({});
  const [reviewsLoading, setReviewsLoading] = useState({});

  // Get cart count for badge
  const cartCount = getCartItemsCount();

  // Show toast function
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 3000);
  };

  // Get unique categories from products
  const categories = ['all', ...new Set(products.map(p => p?.category).filter(Boolean))];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, selectedCategory, minPrice, maxPrice, sortBy, ratingFilter]);

  useEffect(() => {
    if (filteredProducts.length > 0) {
      fetchRecommendations();
    }
  }, [filteredProducts, activeAlgorithm]);

  // Animation trigger when products load
  useEffect(() => {
    if (!loading && filteredProducts.length > 0) {
      setAnimateProducts(true);
      const timer = setTimeout(() => setAnimateProducts(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, filteredProducts]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('http://localhost:5000/api/products');
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        // Calculate max price for range slider - set to 1000 or actual max, whichever is higher
        const prices = data.map(p => parseFloat(p.price));
        const actualMaxPrice = Math.ceil(Math.max(...prices));
        const calculatedMaxPrice = Math.max(actualMaxPrice, 1000);
        
        setCurrentMaxPrice(calculatedMaxPrice);
        setMaxPrice(calculatedMaxPrice);

        // Fetch reviews for each product
        const productsWithRealReviews = await Promise.all(
          data.map(async (product) => {
            const reviewsData = await fetchProductReviews(product.id);
            return {
              ...product,
              // Use real review data from database
              rating: reviewsData.average_rating || "0.0",
              reviewCount: reviewsData.total_reviews || 0,
              isFeatured: product.is_featured || product.featured || false,
              isNew: checkIfProductIsNew(product.created_at),
              reviews: reviewsData.reviews || []
            };
          })
        );
        setProducts(productsWithRealReviews);
      } else {
        setError('No products found');
        setProducts(getSampleProducts());
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Using sample data.');
      setProducts(getSampleProducts());
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if product is new (within 30 days)
  const checkIfProductIsNew = (createdAt) => {
    if (!createdAt) return false;
    const createdDate = new Date(createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate > thirtyDaysAgo;
  };

  const fetchProductReviews = async (productId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reviews/product/${productId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return {
            reviews: data.reviews || [],
            average_rating: data.stats?.average_rating ? 
              parseFloat(data.stats.average_rating).toFixed(1) : "0.0",
            total_reviews: data.stats?.total_reviews || 0,
            stats: data.stats || {
              total_reviews: 0,
              average_rating: 0,
              five_star: 0,
              four_star: 0,
              three_star: 0,
              two_star: 0,
              one_star: 0
            }
          };
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
    // Return empty reviews if API fails
    return { 
      reviews: [], 
      average_rating: "0.0", 
      total_reviews: 0, 
      stats: {
        total_reviews: 0,
        average_rating: 0,
        five_star: 0,
        four_star: 0,
        three_star: 0,
        two_star: 0,
        one_star: 0
      }
    };
  };

  const fetchRecommendations = async () => {
    try {
      setRecommendationsLoading(true);
      
      if (filteredProducts.length > 0) {
        const firstProduct = filteredProducts[0];
        
        let apiUrl = '';
        
        switch (activeAlgorithm) {
          case 'ml':
            apiUrl = `http://localhost:5000/api/recommendations/product/${firstProduct.id}?algorithm=ml&limit=4`;
            break;
          case 'content':
            apiUrl = `http://localhost:5000/api/recommendations/product/${firstProduct.id}?algorithm=content&limit=4`;
            break;
          case 'collaborative':
            if (user) {
              apiUrl = `http://localhost:5000/api/recommendations/user/personalized?limit=4`;
            } else {
              apiUrl = `http://localhost:5000/api/recommendations/product/${firstProduct.id}?algorithm=content&limit=4`;
            }
            break;
          case 'popular':
            apiUrl = `http://localhost:5000/api/recommendations/popular?limit=4`;
            break;
          default:
            apiUrl = `http://localhost:5000/api/recommendations/product/${firstProduct.id}?algorithm=ml&limit=4`;
        }

        const response = await fetch(apiUrl, {
          headers: user && activeAlgorithm === 'collaborative' ? {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          } : {}
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.recommendations.length > 0) {
            console.log(`Using ${data.algorithm} recommendations algorithm`);
            setRecommendations(data.recommendations);
          } else {
            throw new Error('No recommendations found');
          }
        } else {
          throw new Error('Failed to fetch recommendations');
        }
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // Fallback to featured products
      const featured = products.filter(p => p.isFeatured);
      setRecommendations(featured.length >= 4 ? featured.slice(0, 4) : products.slice(0, 4));
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category && product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Price range filter
    filtered = filtered.filter(product => 
      parseFloat(product.price) >= minPrice && parseFloat(product.price) <= maxPrice
    );

    // Rating filter
    if (ratingFilter > 0) {
      filtered = filtered.filter(product => parseFloat(product.rating) >= ratingFilter);
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'rating':
        filtered.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'featured':
        filtered.sort((a, b) => (b.isFeatured === a.isFeatured) ? 0 : b.isFeatured ? 1 : -1);
        break;
      default:
        filtered.sort((a, b) => {
          if (b.isFeatured !== a.isFeatured) return b.isFeatured ? 1 : -1;
          return parseFloat(b.rating) - parseFloat(a.rating);
        });
        break;
    }

    setFilteredProducts(filtered);
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      applyFilters();
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/products/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setFilteredProducts(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Search error:', error);
      const filtered = products.filter(product =>
        product.name?.toLowerCase().includes(query.toLowerCase()) ||
        product.description?.toLowerCase().includes(query.toLowerCase()) ||
        product.category?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  const loadProductDetails = async (product) => {
    setSelectedProduct(product);
    
    if (!productReviews[product.id]) {
      setReviewsLoading(prev => ({ ...prev, [product.id]: true }));
      const reviewsData = await fetchProductReviews(product.id);
      setProductReviews(prev => ({ 
        ...prev, 
        [product.id]: reviewsData 
      }));
      setReviewsLoading(prev => ({ ...prev, [product.id]: false }));
    }
    
    setShowProductModal(true);
  };

  const handleAddReview = (product) => {
    if (!user) {
      showToast('Please login to add a review', 'error');
      return;
    }
    setSelectedProduct(product);
    setShowReviewModal(true);
  };

  const handleReviewSubmitted = async (productId) => {
    // Refresh reviews for this product
    const reviewsData = await fetchProductReviews(productId);
    setProductReviews(prev => ({ 
      ...prev, 
      [productId]: reviewsData 
    }));
    
    // Update product in list with real review data
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { 
            ...product, 
            rating: reviewsData.average_rating || product.rating,
            reviewCount: reviewsData.total_reviews || product.reviewCount
          }
        : product
    ));
    
    showToast('Review submitted successfully!');
  };

  // Enhanced cart function with toast notifications
  const handleAddToCart = async (product) => {
    try {
      if (!user) {
        showToast('Please login to add items to cart', 'error');
        return;
      }

      const result = await addToCart(product);
      
      if (result && result.success) {
        showToast(`🛒 ${product.name} added to cart!`, 'success');
        // Trigger cart animation
        setCartPulse(true);
        setTimeout(() => setCartPulse(false), 600);
      } else {
        const errorMessage = result?.error || 'Failed to add to cart';
        showToast(errorMessage, 'error');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Error adding product to cart. Please try again.', 'error');
    }
  };

  // Enhanced sample products with proper structure
  const getSampleProducts = () => [
    {
      id: 1,
      name: "Wireless Bluetooth Headphones",
      description: "High-quality wireless headphones with noise cancellation technology",
      price: 99.99,
      category: "Electronics",
      image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
      stock_quantity: 50,
      rating: "0.0",
      reviewCount: 0,
      isFeatured: true,
      isNew: false,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: "Smartphone XYZ Pro",
      description: "Latest smartphone with advanced camera and 5G connectivity",
      price: 699.99,
      category: "Electronics",
      image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500",
      stock_quantity: 30,
      rating: "0.0",
      reviewCount: 0,
      isFeatured: true,
      isNew: true,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      name: "Running Shoes",
      description: "Professional running shoes with advanced cushion technology",
      price: 129.99,
      category: "Footwear",
      image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      stock_quantity: 40,
      rating: "0.0",
      reviewCount: 0,
      isFeatured: false,
      isNew: false,
      created_at: new Date('2023-01-15').toISOString()
    }
  ];

  const handleMinPriceChange = (value) => {
    const newMin = Math.min(Number(value), maxPrice - 1);
    setMinPrice(newMin);
  };

  const handleMaxPriceChange = (value) => {
    const newMax = Math.max(Number(value), minPrice + 1);
    setMaxPrice(Math.min(newMax, currentMaxPrice));
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setMinPrice(0);
    setMaxPrice(currentMaxPrice);
    setRatingFilter(0);
    setSortBy('featured');
    showToast('Filters reset successfully');
  };

  const getAlgorithmInfo = () => {
    switch (activeAlgorithm) {
      case 'ml':
        return {
          name: 'Machine Learning',
          description: 'AI-powered recommendations based on product similarity',
          color: 'from-purple-500 to-pink-500',
          icon: '🧠'
        };
      case 'content':
        return {
          name: 'Content-Based',
          description: 'Similar products based on categories and features',
          color: 'from-blue-500 to-cyan-500',
          icon: '📊'
        };
      case 'collaborative':
        return {
          name: 'Collaborative',
          description: 'Products liked by similar users',
          color: 'from-green-500 to-emerald-500',
          icon: '👥'
        };
      case 'popular':
        return {
          name: 'Popular',
          description: 'Trending products based on sales',
          color: 'from-orange-500 to-red-500',
          icon: '🔥'
        };
      default:
        return {
          name: 'AI Recommendations',
          description: 'Smart product suggestions',
          color: 'from-purple-500 to-pink-500',
          icon: '🧠'
        };
    }
  };

  const algorithmInfo = getAlgorithmInfo();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading amazing products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header with Cart Badge */}
        <div className="text-center mb-12 relative">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Smart Shopping Experience
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powered by advanced AI recommendation algorithms
          </p>
          
          {/* Cart Badge */}
          {cartCount > 0 && (
            <div className={`absolute top-0 right-0 ${
              cartPulse ? 'animate-ping' : ''
            }`}>
              <div className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg transform hover:scale-110 transition-transform">
                {cartCount}
              </div>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Algorithm Selector */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">🎯 Recommendation Algorithm</h3>
              <p className="text-gray-600 text-sm">Choose how we suggest products</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveAlgorithm('ml')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                  activeAlgorithm === 'ml'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🧠 ML AI
              </button>
              <button
                onClick={() => setActiveAlgorithm('content')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                  activeAlgorithm === 'content'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📊 Content
              </button>
              <button
                onClick={() => setActiveAlgorithm('collaborative')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                  activeAlgorithm === 'collaborative'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                👥 Collaborative
              </button>
              <button
                onClick={() => setActiveAlgorithm('popular')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                  activeAlgorithm === 'popular'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🔥 Popular
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 transition-all duration-300 ${
            showFilters ? 'block animate-slide-in-left' : 'hidden'
          } lg:block`}>
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filters & Sort</h3>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ✕
                </button>
              </div>

             <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-hide">
  {categories.map(category => {
    const categoryCount = products.filter(p => 
      category === 'all' || p.category === category
    ).length;
    
    return (
      <button
        key={category}
        onClick={() => setSelectedCategory(category)}
        className={`block w-full text-left px-3 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
          selectedCategory === category
            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
            : 'text-gray-700 hover:bg-blue-50 hover:border-blue-200 border border-transparent'
        }`}
      >
        <span className="font-medium">
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </span>
        <span className="text-sm opacity-70 ml-2">
          ({categoryCount})
        </span>
      </button>
    );
  })}
</div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <span>💰</span> Price Range
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Rs. {minPrice}</span>
                    <span>Rs. {maxPrice}</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600 w-16">Min:</label>
                      <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => handleMinPriceChange(e.target.value)}
                        min="0"
                        max={maxPrice - 1}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600 w-16">Max:</label>
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => handleMaxPriceChange(e.target.value)}
                        min={minPrice + 1}
                        max={currentMaxPrice}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="bg-gray-200 rounded-full h-2 relative">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300" 
                      style={{ 
                        width: `${((maxPrice - minPrice) / currentMaxPrice) * 100}%`,
                        marginLeft: `${(minPrice / currentMaxPrice) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Ratings Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <span>⭐</span> Customer Ratings
                </h4>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setRatingFilter(ratingFilter === rating ? 0 : rating)}
                      className={`flex items-center w-full text-left px-3 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                        ratingFilter === rating
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-300 shadow-sm'
                          : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <span className="flex text-yellow-400 mr-2">
                        {'★'.repeat(rating)}{'☆'.repeat(5-rating)}
                      </span>
                      <span className="text-sm">& above</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={resetFilters}
                className="w-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-sm border border-gray-200"
              >
                🗑️ Clear All Filters
              </button>
            </div>
          </div>

          {/* Products Section */}
          <div className="flex-1">
            {/* Controls Bar */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowFilters(true)}
                    className="lg:hidden bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    ☰ Show Filters
                  </button>
                  <p className="text-gray-600 text-lg">
                    Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> products
                    {filteredProducts.length !== products.length && (
                      <button
                        onClick={resetFilters}
                        className="text-blue-500 hover:text-blue-700 text-sm font-medium ml-2 transition-colors"
                      >
                        (Show all)
                      </button>
                    )}
                  </p>
                </div>
                
                {/* Cart Count Display */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                    <span className="text-blue-600 font-semibold">🛒</span>
                    <span className="text-blue-800 font-bold">{cartCount}</span>
                    <span className="text-blue-600 text-sm">items in cart</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 text-sm">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                    >
                      <option value="featured">Featured</option>
                      <option value="newest">Newest</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Top Rated</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-xl border border-gray-100">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
                <button
                  onClick={resetFilters}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-12 ${
                  animateProducts ? 'animate-fade-in-up' : ''
                }`}>
                  {filteredProducts.map((product, index) => (
                    <div 
                      key={product.id}
                      className="transform transition-all duration-300 hover:scale-105"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <ProductCard 
                        product={product}
                        onAddToCart={handleAddToCart}
                        onViewDetails={() => loadProductDetails(product)}
                        onAddReview={() => handleAddReview(product)}
                      />
                    </div>
                  ))}
                </div>

                {/* AI-Powered Recommendations Section */}
                {recommendations.length > 0 && (
                  <div className="animate-fade-in mt-12">
                    <div className="text-center mb-8">
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                        {algorithmInfo.icon} {algorithmInfo.name} Recommendations
                      </h3>
                      <p className="text-gray-600 text-lg mb-4">
                        {algorithmInfo.description}
                      </p>
                      {recommendationsLoading ? (
                        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-800"></div>
                          Generating smart recommendations...
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                          AI Recommendations Active
                        </div>
                      )}
                    </div>
                    
                    {recommendationsLoading ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="bg-white rounded-2xl shadow-lg p-4 animate-pulse">
                            <div className="bg-gray-300 h-40 rounded-lg mb-4"></div>
                            <div className="bg-gray-300 h-4 rounded mb-2"></div>
                            <div className="bg-gray-300 h-3 rounded w-3/4"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {recommendations.map(product => (
                          <ProductCard 
                            key={product.id}
                            product={product}
                            onAddToCart={handleAddToCart}
                            onViewDetails={() => loadProductDetails(product)}
                            onAddReview={() => handleAddReview(product)}
                            compact={true}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: '', type: 'success' })} 
      />

      {/* Product Detail Modal */}
      {showProductModal && selectedProduct && (
        <ProductModal
          product={selectedProduct}
          reviews={productReviews[selectedProduct.id]}
          reviewsLoading={reviewsLoading[selectedProduct.id]}
          onClose={() => setShowProductModal(false)}
          onAddToCart={handleAddToCart}
          onAddReview={() => {
            setShowProductModal(false);
            handleAddReview(selectedProduct);
          }}
        />
      )}

      {/* Review Modal */}
      {showReviewModal && selectedProduct && (
        <ReviewModal
          product={selectedProduct}
          onClose={() => setShowReviewModal(false)}
          onReviewSubmitted={() => handleReviewSubmitted(selectedProduct.id)}
        />
      )}

      {/* Support Widget */}
      <SupportWidget />

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes slide-in-left {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fade-in-up {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.3s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProductPage;