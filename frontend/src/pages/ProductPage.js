import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard.js';
import SearchBar from '../components/SearchBar.js';
import ProductModal from '../components/ProductModal.js';
import ReviewModal from '../components/ReviewModal.js';
import SupportWidget from '../components/SupportWidget.js';
import CategoryNavbar from '../components/CategoryNavbar.js';
import { Toast } from '../components/Toast.js';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, 
  X, 
  ShoppingCart, 
  Sparkles, 
  Zap,
  TrendingUp,
  Star,
  Shield,
  Truck,
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  Eye,
  Heart,
  Share2,
  Clock,
  Award,
  Crown,
  Rocket,
  Brain,
  Users,
  Flame,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [error, setError] = useState('');
  const { addToCart, getCartItemsCount } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Enhanced state management
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [currentMaxPrice, setCurrentMaxPrice] = useState(1000);
  const [sortBy, setSortBy] = useState('featured');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [activeAlgorithm, setActiveAlgorithm] = useState('ml');
  const [algorithmPerformance, setAlgorithmPerformance] = useState({});
  const [showAlgorithmDetails, setShowAlgorithmDetails] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [animateProducts, setAnimateProducts] = useState(false);
  const [cartPulse, setCartPulse] = useState(false);
  const [productReviews, setProductReviews] = useState({});
  const [reviewsLoading, setReviewsLoading] = useState({});
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [expandedCategories, setExpandedCategories] = useState(true);
  const [autoRotateRecommendations, setAutoRotateRecommendations] = useState(true);
  const [currentRecommendationIndex, setCurrentRecommendationIndex] = useState(0);

  const cartCount = getCartItemsCount();

  // Enhanced toast function with emojis
  const showToast = (message, type = 'success') => {
    const emojis = {
      success: '🎉',
      error: '❌',
      info: '💡',
      warning: '⚠️'
    };
    setToast({ message: `${emojis[type]} ${message}`, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

  const categories = ['all', ...new Set(products.map(p => p?.category).filter(Boolean))];

  // Enhanced useEffect for auto-rotating recommendations
  useEffect(() => {
    let interval;
    if (autoRotateRecommendations && recommendations.length > 0) {
      interval = setInterval(() => {
        setCurrentRecommendationIndex(prev => 
          prev < recommendations.length - 4 ? prev + 1 : 0
        );
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [autoRotateRecommendations, recommendations]);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, selectedCategory, minPrice, maxPrice, sortBy, ratingFilter]);

  useEffect(() => {
    if (filteredProducts.length > 0) {
      fetchRecommendations();
    }
  }, [filteredProducts, activeAlgorithm]);

  useEffect(() => {
    if (!loading && filteredProducts.length > 0) {
      setAnimateProducts(true);
      const timer = setTimeout(() => setAnimateProducts(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, filteredProducts]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError('');
      await fetchProducts();
    } catch (error) {
      console.error('Error fetching all data:', error);
      setError('Failed to load some data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products`);
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        const prices = data.map(p => parseFloat(p.price || 0));
        const actualMaxPrice = Math.ceil(Math.max(...prices));
        const calculatedMaxPrice = Math.max(actualMaxPrice, 1000);
        
        setCurrentMaxPrice(calculatedMaxPrice);
        setMaxPrice(calculatedMaxPrice);

        const processedProducts = data.map(product => ({
          ...product,
          image_urls: processImageUrls(product.image_urls, product.image_url),
          tags: processTags(product.tags),
          rating: product.rating ? parseFloat(product.rating).toFixed(1) : "0.0",
          reviewCount: product.reviewCount || 0,
          is_featured: Boolean(product.is_featured || product.featured || false),
          is_new: checkIfProductIsNew(product.created_at),
          stock_quantity: product.stock_quantity || 0,
          discount_percentage: product.discount_percentage || 0
        }));

        setProducts(processedProducts);
      } else {
        setError('No products found');
        setProducts(getSampleProducts());
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Using sample data.');
      setProducts(getSampleProducts());
    }
  };

  const processImageUrls = (image_urls, fallback_image_url) => {
    let imageUrls = [];
    
    if (image_urls) {
      if (Array.isArray(image_urls)) {
        imageUrls = image_urls.filter(url => url && url.trim() !== '');
      } else if (typeof image_urls === 'string') {
        try {
          const parsed = JSON.parse(image_urls);
          imageUrls = Array.isArray(parsed) ? parsed.filter(url => url && url.trim() !== '') : [image_urls];
        } catch {
          imageUrls = [image_urls];
        }
      }
    }
    
    if (imageUrls.length === 0 && fallback_image_url) {
      imageUrls = [fallback_image_url];
    }
    
    if (imageUrls.length === 0) {
      imageUrls = ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'];
    }
    
    return imageUrls;
  };

  const processTags = (tags) => {
    let processedTags = [];
    
    if (tags) {
      if (Array.isArray(tags)) {
        processedTags = tags.filter(tag => tag && tag.trim() !== '');
      } else if (typeof tags === 'string') {
        try {
          const parsed = JSON.parse(tags);
          processedTags = Array.isArray(parsed) ? parsed.filter(tag => tag && tag.trim() !== '') : tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        } catch {
          processedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }
      }
    }
    
    return processedTags;
  };

  const checkIfProductIsNew = (createdAt) => {
    if (!createdAt) return false;
    const createdDate = new Date(createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate > thirtyDaysAgo;
  };

  const fetchProductReviews = async (productId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/reviews/product/${productId}`);
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
      const startTime = performance.now();
      
      if (filteredProducts.length > 0) {
        const firstProduct = filteredProducts[0];
        
        let apiUrl = '';
        const headers = {};
        const token = localStorage.getItem('token');
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        switch (activeAlgorithm) {
          case 'ml':
            apiUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/recommendations/product/${firstProduct.id}?algorithm=ml&limit=8`;
            break;
          case 'content':
            apiUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/recommendations/product/${firstProduct.id}?algorithm=content&limit=8`;
            break;
          case 'collaborative':
            if (user) {
              apiUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/recommendations/user/personalized?limit=8`;
            } else {
              apiUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/recommendations/product/${firstProduct.id}?algorithm=content&limit=8`;
            }
            break;
          case 'popular':
            apiUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/recommendations/popular?limit=8`;
            break;
          default:
            apiUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/recommendations/product/${firstProduct.id}?algorithm=ml&limit=8`;
        }

        const response = await fetch(apiUrl, { headers });
        
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.recommendations && data.recommendations.length > 0) {
            const processedRecommendations = data.recommendations.map(rec => ({
              ...rec,
              image_urls: processImageUrls(rec.image_urls, rec.image_url),
              mainImage: processImageUrls(rec.image_urls, rec.image_url)[0],
              rating: parseFloat(rec.rating || 0).toFixed(1),
              reviewCount: rec.reviewCount || 0
            }));

            setRecommendations(processedRecommendations);
            
            setAlgorithmPerformance(prev => ({
              ...prev,
              [activeAlgorithm]: {
                responseTime,
                recommendationCount: processedRecommendations.length,
                lastUsed: new Date().toISOString(),
                success: true
              }
            }));
          } else {
            throw new Error('No recommendations found');
          }
        } else {
          throw new Error('Failed to fetch recommendations');
        }
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      const featured = products
        .filter(p => p.is_featured)
        .slice(0, 8)
        .map(p => ({
          ...p,
          mainImage: p.image_urls[0]
        }));
      
      setRecommendations(featured);
      
      setAlgorithmPerformance(prev => ({
        ...prev,
        [activeAlgorithm]: {
          responseTime: 0,
          recommendationCount: 0,
          lastUsed: new Date().toISOString(),
          success: false,
          error: error.message
        }
      }));
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category && product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    filtered = filtered.filter(product => 
      parseFloat(product.price || 0) >= minPrice && parseFloat(product.price || 0) <= maxPrice
    );

    if (ratingFilter > 0) {
      filtered = filtered.filter(product => parseFloat(product.rating || 0) >= ratingFilter);
    }

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => parseFloat(a.price || 0) - parseFloat(b.price || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        break;
      case 'featured':
        filtered.sort((a, b) => (b.is_featured === a.is_featured) ? 0 : b.is_featured ? 1 : -1);
        break;
      default:
        filtered.sort((a, b) => {
          if (b.is_featured !== a.is_featured) return b.is_featured ? 1 : -1;
          return parseFloat(b.rating || 0) - parseFloat(a.rating || 0);
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
      setIsLoading(true);
      
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products/search?q=${encodeURIComponent(query)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        let searchResults = [];
        
        if (Array.isArray(data)) {
          searchResults = data;
        } else if (data.products && Array.isArray(data.products)) {
          searchResults = data.products;
        } else if (data.success && data.results) {
          searchResults = data.results;
        }
        
        const processedResults = searchResults.map(product => ({
          ...product,
          image_urls: processImageUrls(product.image_urls, product.image_url),
          rating: parseFloat(product.rating || 0).toFixed(1),
          reviewCount: product.reviewCount || 0
        }));
        
        setFilteredProducts(processedResults);
        
        showToast(`🔍 Found ${processedResults.length} products for "${query}"`, 'info');
      } else {
        throw new Error('Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      
      const filtered = products.filter(product =>
        product.name?.toLowerCase().includes(query.toLowerCase()) ||
        product.description?.toLowerCase().includes(query.toLowerCase()) ||
        product.category?.toLowerCase().includes(query.toLowerCase()) ||
        (product.tags && Array.isArray(product.tags) && 
         product.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())))
      );
      
      setFilteredProducts(filtered);
      showToast(`🔍 Found ${filtered.length} products for "${query}"`, 'info');
    } finally {
      setIsLoading(false);
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
      showToast('🔐 Please login to add a review', 'error');
      return;
    }
    setSelectedProduct(product);
    setShowReviewModal(true);
  };

  const handleReviewSubmitted = async (productId) => {
    const reviewsData = await fetchProductReviews(productId);
    setProductReviews(prev => ({ 
      ...prev, 
      [productId]: reviewsData 
    }));
    
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { 
            ...product, 
            rating: reviewsData.average_rating || product.rating,
            reviewCount: reviewsData.total_reviews || product.reviewCount
          }
        : product
    ));
    
    showToast('⭐ Review submitted successfully!');
  };

  const handleAddToCart = async (product) => {
    try {
      if (!user) {
        showToast('🔐 Please login to add items to cart', 'error');
        return;
      }

      const result = await addToCart(product);
      
      if (result && result.success) {
        showToast(`🛒 ${product.name} added to cart!`, 'success');
        setCartPulse(true);
        setTimeout(() => setCartPulse(false), 600);
      } else {
        const errorMessage = result?.error || 'Failed to add to cart';
        showToast(errorMessage, 'error');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('❌ Error adding product to cart. Please try again.', 'error');
    }
  };

  const getSampleProducts = () => [
    {
      id: 1,
      name: "Wireless Bluetooth Headphones",
      description: "High-quality wireless headphones with noise cancellation technology",
      price: 99.99,
      category: "Electronics",
      image_urls: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"],
      stock_quantity: 50,
      rating: "4.5",
      reviewCount: 23,
      is_featured: true,
      is_new: false,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: "Smartphone XYZ Pro",
      description: "Latest smartphone with advanced camera and 5G connectivity",
      price: 699.99,
      category: "Electronics",
      image_urls: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500"],
      stock_quantity: 30,
      rating: "4.2",
      reviewCount: 15,
      is_featured: true,
      is_new: true,
      created_at: new Date().toISOString()
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
    showToast('🔄 Filters reset successfully');
  };

  const getAlgorithmInfo = (algorithm = activeAlgorithm) => {
    switch (algorithm) {
      case 'ml':
        return {
          name: 'Neural Network AI',
          description: 'Deep learning algorithms analyze product patterns and user behavior',
          color: 'from-purple-500 to-pink-500',
          icon: '🧠',
          gradient: 'bg-gradient-to-r from-purple-500 to-pink-500'
        };
      case 'content':
        return {
          name: 'Content Analysis',
          description: 'Semantic analysis of product features and descriptions',
          color: 'from-blue-500 to-cyan-500',
          icon: '📊',
          gradient: 'bg-gradient-to-r from-blue-500 to-cyan-500'
        };
      case 'collaborative':
        return {
          name: 'Collaborative Filtering',
          description: 'Recommendations based on similar users preferences',
          color: 'from-green-500 to-emerald-500',
          icon: '👥',
          gradient: 'bg-gradient-to-r from-green-500 to-emerald-500'
        };
      case 'popular':
        return {
          name: 'Trending Analytics',
          description: 'Real-time trending products based on sales velocity',
          color: 'from-orange-500 to-red-500',
          icon: '🔥',
          gradient: 'bg-gradient-to-r from-orange-500 to-red-500'
        };
      default:
        return {
          name: 'AI Recommendations',
          description: 'Smart product suggestions',
          color: 'from-purple-500 to-pink-500',
          icon: '🧠',
          gradient: 'bg-gradient-to-r from-purple-500 to-pink-500'
        };
    }
  };

  const algorithmInfo = getAlgorithmInfo();

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    showToast(`📁 Showing ${category === 'all' ? 'all products' : category}`, 'info');
  };

  // Enhanced loading component
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative inline-block mb-6">
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1.5, repeat: Infinity }
                }}
                className="w-20 h-20 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto"
              />
              <motion.div
                animate={{ 
                  rotate: -360,
                  scale: [1.2, 1, 1.2]
                }}
                transition={{ 
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity }
                }}
                className="absolute inset-0 w-20 h-20 border-4 border-purple-500 border-b-transparent rounded-full"
              />
            </div>
            <motion.h2 
              className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Curating Amazing Products
            </motion.h2>
            <motion.p 
              className="text-gray-300 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Loading the finest collection just for you...
            </motion.p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Enhanced Category Navigation Bar */}
      <CategoryNavbar 
        onCategorySelect={handleCategorySelect}
        selectedCategory={selectedCategory}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced Header with Particles Effect */}
        <motion.div 
          className="text-center mb-12 relative"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Animated Background Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-cyan-400 rounded-full opacity-20"
                animate={{
                  y: [0, -30, 0],
                  x: [0, Math.sin(i) * 20, 0],
                  opacity: [0.2, 0.8, 0.2],
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                style={{
                  left: `${(i * 5) % 100}%`,
                  top: `${20 + (i * 3) % 60}%`,
                }}
              />
            ))}
          </div>

          <motion.h1 
            className="text-6xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-6 relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Discover Excellence
            <motion.div 
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: 128 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            />
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Explore our premium collection with <span className="text-cyan-300 font-semibold">AI-powered</span> recommendations and <span className="text-purple-300 font-semibold">smart filtering</span>
          </motion.p>
          
          {/* Enhanced Cart Icon with Floating Animation */}
          <motion.button
            onClick={handleCartClick}
            whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
            whileTap={{ scale: 0.95 }}
            className="absolute top-0 right-0 bg-white/10 backdrop-blur-md rounded-2xl p-4 shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 border border-cyan-500/30 group"
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              y: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          >
            <div className="relative">
              <ShoppingCart className="w-8 h-8 text-white group-hover:text-cyan-300 transition-colors duration-300" />
              {cartCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold border-2 border-white shadow-lg ${
                    cartPulse ? 'animate-ping' : ''
                  }`}
                >
                  {cartCount}
                </motion.span>
              )}
            </div>
          </motion.button>
        </motion.div>

        {/* Enhanced Search Bar */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <SearchBar onSearch={handleSearch} />
        </motion.div>

        {/* Main Content Grid */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Enhanced Filters Sidebar */}
          <motion.div 
            className="lg:w-80 flex-shrink-0"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sticky top-24 border border-cyan-500/20 h-fit shadow-2xl">
              {/* Header with Expand/Collapse */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl">
                    <SlidersHorizontal className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Smart Filters</h3>
                </div>
                <button 
                  onClick={() => setExpandedCategories(!expandedCategories)}
                  className="text-gray-300 hover:text-white transition-colors bg-white/10 p-2 rounded-xl"
                >
                  {expandedCategories ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              <AnimatePresence>
                {expandedCategories && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Categories */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="text-cyan-300">📂</span> 
                        Product Categories
                        <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full ml-auto">
                          {categories.length}
                        </span>
                      </h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                        {categories.map(category => {
                          const categoryCount = products.filter(p => 
                            category === 'all' || p.category === category
                          ).length;
                          
                          return (
                            <motion.button
                              key={category}
                              onClick={() => setSelectedCategory(category)}
                              whileHover={{ scale: 1.02, x: 4 }}
                              whileTap={{ scale: 0.98 }}
                              className={`block w-full text-left px-4 py-3 rounded-xl transition-all duration-300 border-2 ${
                                selectedCategory === category
                                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg border-cyan-400'
                                  : 'text-gray-300 hover:bg-white/10 hover:text-white border-transparent hover:border-cyan-500/30'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium capitalize">
                                  {category === 'all' ? 'All Products' : category}
                                </span>
                                <span className={`text-sm px-2 py-1 rounded-full ${
                                  selectedCategory === category 
                                    ? 'bg-white/20' 
                                    : 'bg-white/10'
                                }`}>
                                  {categoryCount}
                                </span>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="text-cyan-300">💰</span> 
                        Price Range
                      </h4>
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-cyan-300 font-medium">Rs. {minPrice}</span>
                          <span className="text-cyan-300 font-medium">Rs. {maxPrice}</span>
                        </div>
                        
                        <div className="relative pt-4">
                          <div className="bg-gray-600 rounded-full h-3 relative">
                            <motion.div 
                              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full shadow-lg"
                              initial={{ width: 0 }}
                              animate={{ 
                                width: `${((maxPrice - minPrice) / currentMaxPrice) * 100}%`,
                                marginLeft: `${(minPrice / currentMaxPrice) * 100}%`
                              }}
                              transition={{ duration: 0.8 }}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-300 mb-1 block">Min Price</label>
                            <input
                              type="number"
                              value={minPrice}
                              onChange={(e) => handleMinPriceChange(e.target.value)}
                              min="0"
                              max={maxPrice - 1}
                              className="w-full px-3 py-2 bg-white/10 border border-cyan-500/30 rounded-xl text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-300 mb-1 block">Max Price</label>
                            <input
                              type="number"
                              value={maxPrice}
                              onChange={(e) => handleMaxPriceChange(e.target.value)}
                              min={minPrice + 1}
                              max={currentMaxPrice}
                              className="w-full px-3 py-2 bg-white/10 border border-cyan-500/30 rounded-xl text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ratings Filter */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        Customer Ratings
                      </h4>
                      <div className="space-y-2">
                        {[4, 3, 2, 1].map(rating => (
                          <motion.button
                            key={rating}
                            onClick={() => setRatingFilter(ratingFilter === rating ? 0 : rating)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex items-center w-full text-left px-4 py-3 rounded-xl transition-all duration-300 border-2 ${
                              ratingFilter === rating
                                ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400 shadow-lg'
                                : 'text-gray-300 hover:bg-white/10 border-transparent hover:border-yellow-500/30'
                            }`}
                          >
                            <span className="flex text-yellow-400 mr-3 text-lg">
                              {'★'.repeat(rating)}{'☆'.repeat(5-rating)}
                            </span>
                            <span className="text-sm font-medium">& above</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Sort Options */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="text-cyan-300">🔃</span> 
                        Sort By
                      </h4>
                      <div className="relative">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-full bg-white/10 border border-cyan-500/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all appearance-none"
                        >
                          <option value="featured" className="bg-gray-800">🌟 Featured</option>
                          <option value="newest" className="bg-gray-800">🆕 Newest</option>
                          <option value="price-low" className="bg-gray-800">💰 Price: Low to High</option>
                          <option value="price-high" className="bg-gray-800">💎 Price: High to Low</option>
                          <option value="rating" className="bg-gray-800">⭐ Top Rated</option>
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-300 pointer-events-none">
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Clear Filters Button */}
              <motion.button
                onClick={resetFilters}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-white py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg border border-cyan-500/30 flex items-center justify-center gap-3 group"
              >
                <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                Reset All Filters
              </motion.button>
            </div>
          </motion.div>

          {/* Enhanced Products Section */}
          <div className="flex-1">
            {/* Enhanced Controls Bar */}
            <motion.div 
              className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-6 border border-cyan-500/20 shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  {/* View Mode Toggle */}
                  <div className="flex bg-white/10 rounded-xl p-1 border border-cyan-500/20">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        viewMode === 'grid' 
                          ? 'bg-cyan-500 text-white shadow-lg' 
                          : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      <Grid3X3 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        viewMode === 'list' 
                          ? 'bg-cyan-500 text-white shadow-lg' 
                          : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Results Count */}
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    <p className="text-gray-300 text-lg">
                      <span className="font-bold text-white">{filteredProducts.length}</span> products found
                    </p>
                    {filteredProducts.length !== products.length && (
                      <button
                        onClick={resetFilters}
                        className="text-cyan-300 hover:text-cyan-200 text-sm font-medium transition-colors flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Show all
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Enhanced Cart Count Display */}
                <motion.div 
                  className="flex items-center gap-4"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center gap-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-4 py-3 rounded-xl border border-cyan-400/30 shadow-lg">
                    <div className="relative">
                      <ShoppingCart className="text-cyan-300 w-6 h-6" />
                      {cartCount > 0 && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity }}
                          className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"
                        />
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold text-lg">{cartCount}</div>
                      <div className="text-cyan-200 text-xs">in cart</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Products Grid/List View */}
            {filteredProducts.length === 0 ? (
              <motion.div 
                className="text-center py-20 bg-white/10 backdrop-blur-md rounded-3xl border border-cyan-500/20 shadow-2xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="text-8xl mb-6"
                >
                  🔍
                </motion.div>
                <h3 className="text-3xl font-bold text-white mb-4">No Products Found</h3>
                <p className="text-gray-300 mb-8 text-lg">Try adjusting your filters or search terms</p>
                <motion.button
                  onClick={resetFilters}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 flex items-center gap-3"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset All Filters
                </motion.button>
              </motion.div>
            ) : (
              <>
                <motion.div 
                  className={`${
                    viewMode === 'grid' 
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-12'
                      : 'space-y-4 mb-12'
                  }`}
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1
                      }
                    }
                  }}
                >
                  {filteredProducts.map((product, index) => (
                    <motion.div 
                      key={product.id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                      }}
                      transition={{ 
                        duration: 0.5, 
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 100
                      }}
                      layout
                    >
                      <ProductCard 
                        product={product}
                        onAddToCart={handleAddToCart}
                        onViewDetails={() => loadProductDetails(product)}
                        onAddReview={() => handleAddReview(product)}
                        viewMode={viewMode}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </>
            )}
          </div>
        </div>

        {/* Enhanced AI Recommendations Section */}
        {recommendations.length > 0 && (
          <motion.section 
            className="mt-16"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Enhanced Header */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-4 mb-6"
              >
                <div className="relative">
                  <motion.div
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity }
                    }}
                    className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl"
                  >
                    <span className="text-2xl">{algorithmInfo.icon}</span>
                  </motion.div>
                  <motion.div
                    animate={{ 
                      rotate: -360,
                      scale: [1.1, 1, 1.1]
                    }}
                    transition={{ 
                      rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                      scale: { duration: 3, repeat: Infinity }
                    }}
                    className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl opacity-50 blur-sm"
                  />
                </div>
                <div>
                  <h3 className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    {algorithmInfo.name}
                  </h3>
                  <p className="text-gray-300 text-lg mt-2">
                    {algorithmInfo.description}
                  </p>
                </div>
              </motion.div>

              {/* Enhanced Algorithm Controls */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {[
                  { id: 'ml', name: 'AI Neural', icon: Brain, color: 'from-purple-500 to-pink-500' },
                  { id: 'content', name: 'Content AI', icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
                  { id: 'collaborative', name: 'Social AI', icon: Users, color: 'from-green-500 to-emerald-500' },
                  { id: 'popular', name: 'Trending', icon: Flame, color: 'from-orange-500 to-red-500' }
                ].map(algo => {
                  const Icon = algo.icon;
                  return (
                    <motion.button
                      key={algo.id}
                      onClick={() => setActiveAlgorithm(algo.id)}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-6 py-4 rounded-2xl font-bold transition-all duration-300 shadow-xl backdrop-blur-sm border-2 ${
                        activeAlgorithm === algo.id
                          ? `bg-gradient-to-r ${algo.color} text-white shadow-2xl border-white/20`
                          : 'bg-white/10 text-white hover:bg-white/20 border-white/10 hover:border-cyan-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span>{algo.name}</span>
                        {algorithmPerformance[algo.id]?.success && (
                          <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                            {algorithmPerformance[algo.id].responseTime}ms
                          </span>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Enhanced Status Bar */}
              <div className="flex flex-wrap justify-center gap-6 mb-8">
                {recommendationsLoading ? (
                  <motion.div 
                    className="inline-flex items-center gap-3 bg-cyan-500/20 text-cyan-300 px-6 py-3 rounded-2xl text-sm font-medium border border-cyan-400/30 shadow-lg"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ 
                            duration: 0.6, 
                            repeat: Infinity,
                            delay: i * 0.2 
                          }}
                          className="w-2 h-2 bg-cyan-400 rounded-full"
                        />
                      ))}
                    </div>
                    AI is generating smart recommendations...
                  </motion.div>
                ) : (
                  <>
                    <div className="inline-flex items-center gap-3 bg-green-500/20 text-green-300 px-6 py-3 rounded-2xl text-sm font-medium border border-green-400/30 shadow-lg">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      AI Recommendations Active
                    </div>
                    <div className="inline-flex items-center gap-3 bg-purple-500/20 text-purple-300 px-6 py-3 rounded-2xl text-sm font-medium border border-purple-400/30 shadow-lg">
                      <span>🎯</span>
                      {recommendations.length} smart suggestions
                    </div>
                    <button
                      onClick={() => setAutoRotateRecommendations(!autoRotateRecommendations)}
                      className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl text-sm font-medium border shadow-lg transition-all ${
                        autoRotateRecommendations
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30'
                          : 'bg-gray-500/20 text-gray-300 border-gray-400/30'
                      }`}
                    >
                      {autoRotateRecommendations ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      Auto-rotate: {autoRotateRecommendations ? 'ON' : 'OFF'}
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* Enhanced Recommendations Carousel */}
            {recommendationsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white/10 rounded-3xl p-6 animate-pulse border border-cyan-500/20"
                  >
                    <div className="bg-gray-600 h-48 rounded-2xl mb-4"></div>
                    <div className="bg-gray-600 h-4 rounded mb-2"></div>
                    <div className="bg-gray-600 h-3 rounded w-3/4"></div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="relative">
                {/* Navigation Arrows */}
                {recommendations.length > 4 && (
                  <>
                    <button
                      onClick={() => setCurrentRecommendationIndex(prev => Math.max(0, prev - 1))}
                      className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white/20 backdrop-blur-md text-white p-3 rounded-full shadow-2xl border border-cyan-500/30 hover:bg-white/30 transition-all z-10"
                    >
                      <ChevronDown className="w-6 h-6 transform -rotate-90" />
                    </button>
                    <button
                      onClick={() => setCurrentRecommendationIndex(prev => 
                        Math.min(recommendations.length - 4, prev + 1)
                      )}
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white/20 backdrop-blur-md text-white p-3 rounded-full shadow-2xl border border-cyan-500/30 hover:bg-white/30 transition-all z-10"
                    >
                      <ChevronDown className="w-6 h-6 transform rotate-90" />
                    </button>
                  </>
                )}

                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 overflow-hidden"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1
                      }
                    }
                  }}
                >
                  {recommendations
                    .slice(currentRecommendationIndex, currentRecommendationIndex + 4)
                    .map((product, index) => (
                    <motion.div
                      key={product.id}
                      variants={{
                        hidden: { opacity: 0, scale: 0.8, y: 20 },
                        visible: { opacity: 1, scale: 1, y: 0 }
                      }}
                      transition={{ 
                        duration: 0.5, 
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 100
                      }}
                      whileHover={{ 
                        y: -8,
                        transition: { duration: 0.3 }
                      }}
                    >
                      <ProductCard 
                        product={product}
                        onAddToCart={handleAddToCart}
                        onViewDetails={() => loadProductDetails(product)}
                        onAddReview={() => handleAddReview(product)}
                        compact={true}
                        featured={true}
                      />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Carousel Indicators */}
                {recommendations.length > 4 && (
                  <div className="flex justify-center gap-2 mt-6">
                    {Array.from({ length: Math.ceil(recommendations.length / 4) }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentRecommendationIndex(index * 4)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          currentRecommendationIndex === index * 4
                            ? 'bg-cyan-400 scale-125'
                            : 'bg-gray-600 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.section>
        )}
      </div>

      {/* Enhanced Toast Notification */}
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
    </div>
  );
};

export default ProductPage;