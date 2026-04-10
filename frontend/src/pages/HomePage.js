import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Star, 
  Shield, 
  Truck, 
  Zap, 
  Clock,
  ArrowRight,
  Sparkles,
  Award,
  TrendingUp,
  Users,
  Globe
} from 'lucide-react';
import ProductCard from '../components/ProductCard.js';
import ProductModal from '../components/ProductModal.js';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { Toast } from '../components/Toast.js';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [specialOffers, setSpecialOffers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: null,
    happyCustomers: null,
    satisfactionRate: null,
    deliveryTime: null
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productReviews, setProductReviews] = useState({});
  const [reviewsLoading, setReviewsLoading] = useState({});
  const { addToCart, getCartItemsCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const cartCount = getCartItemsCount();

  useEffect(() => {
    fetchHomePageData();
  }, []);

  const fetchHomePageData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchFeaturedProducts(),
        fetchSpecialOffers(),
        fetchNewArrivals(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching homepage data:', error);
      showToast('Failed to load some data. Please refresh.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products/featured?limit=8`
      );
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          const processedProducts = data.map(product => ({
            ...product,
            image_urls: processImageUrls(product.image_urls, product.image_url),
            rating: parseFloat(product.rating || 0).toFixed(1),
            reviewCount: product.reviewCount || 0
          }));
          setFeaturedProducts(processedProducts);
        }
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
    }
  };

  const fetchSpecialOffers = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/offers/active?limit=4`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.offers) {
          setSpecialOffers(data.offers.slice(0, 4));
        }
      }
    } catch (error) {
      console.error('Error fetching special offers:', error);
      // Fallback sample offers
      
    }
  };

  const fetchNewArrivals = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products/new-arrivals?limit=6`
      );
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          const processedProducts = data.map(product => ({
            ...product,
            image_urls: processImageUrls(product.image_urls, product.image_url),
            rating: parseFloat(product.rating || 0).toFixed(1),
            reviewCount: product.reviewCount || 0
          }));
          setNewArrivals(processedProducts);
        }
      }
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/stats/homepage`
      );
      if (!response.ok) {
        throw new Error(`Stats API failed: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setStats({
          totalProducts: Number(data.stats?.totalProducts ?? 0),
          happyCustomers: Number(data.stats?.happyCustomers ?? 0),
          satisfactionRate: Number(data.stats?.satisfactionRate ?? 0),
          deliveryTime: Number(data.stats?.deliveryTime ?? 0)
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const formatCount = (value) => (value === null ? '--' : `${value}+`);
  const formatPercent = (value) => (value === null ? '--' : `${value}%`);
  const formatHours = (value) => (value === null ? '--' : `${value}h`);

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

  const getOfferImage = (offer) => {
    if (offer.image_urls) {
      if (Array.isArray(offer.image_urls) && offer.image_urls[0]) {
        return offer.image_urls[0];
      }
      if (typeof offer.image_urls === 'string') {
        try {
          const parsed = JSON.parse(offer.image_urls);
          if (Array.isArray(parsed) && parsed[0]) {
            return parsed[0];
          }
        } catch {
          if (offer.image_urls.trim() !== '') {
            return offer.image_urls;
          }
        }
      }
    }
    if (offer.image_url && typeof offer.image_url === 'string' && offer.image_url.trim() !== '') {
      return offer.image_url;
    }
    return 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500';
  };

  const getOfferDiscountLabel = (offer) => {
    if (offer.offer_type === 'Bogo') return 'BOGO';
    if (offer.discount_percentage && Number(offer.discount_percentage) > 0) {
      return `${offer.discount_percentage}% OFF`;
    }
    if (offer.discount_amount && Number(offer.discount_amount) > 0) {
      return `Rs. ${offer.discount_amount} OFF`;
    }
    return 'Special Deal';
  };

  const getOfferTitle = (offer) => {
    if (offer.title) return offer.title;
    if (offer.product_name) return `${offer.product_name} Deal`;
    return 'Limited Time Offer';
  };

  const getOfferDescription = (offer) => {
    if (offer.description) return offer.description;
    if (offer.offer_type === 'Bogo') return 'Buy one and get one free for a limited time.';
    if (offer.discount_percentage && Number(offer.discount_percentage) > 0) {
      return `Save ${offer.discount_percentage}% on this product today.`;
    }
    if (offer.discount_amount && Number(offer.discount_amount) > 0) {
      return `Instant discount of Rs. ${offer.discount_amount} on this offer.`;
    }
    return 'Grab this curated offer before it ends.';
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

  const handleAddToCart = async (product) => {
    try {
      if (!user) {
        showToast('Please login to add items to cart', 'error');
        return;
      }

      const result = await addToCart(product);
      
      if (result && result.success) {
        showToast(`🛒 ${product.name} added to cart!`, 'success');
      } else {
        const errorMessage = result?.error || 'Failed to add to cart';
        showToast(errorMessage, 'error');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Error adding product to cart. Please try again.', 'error');
    }
  };

  const handleViewDetails = (product) => {
    loadProductDetails(product);
  };

  const handleAddReview = (product) => {
    if (!user) {
      showToast('Please login to add a review', 'error');
      return;
    }
    navigate(`/product/${product.id}?review=true`);
  };

  const fetchProductReviews = async (productId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/reviews/product/${productId}`);
      if (response.ok) {
        const data = await response.json();
        return {
          reviews: data.reviews || [],
          average_rating: data.average_rating || 0,
          total_reviews: data.total_reviews || 0
        };
      }
    } catch (error) {
      console.error('Error fetching product reviews:', error);
    }
    return {
      reviews: [],
      average_rating: 0,
      total_reviews: 0
    };
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading amazing shopping experience...</p>
        </div>
      </div>
    );
  }

  const heroFeatureProducts = (featuredProducts.length > 0 ? featuredProducts : newArrivals).slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10" />
          <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="w-20 h-20 mx-auto lg:mx-0 mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/25"
              >
                <Sparkles className="text-white" size={40} />
              </motion.div>
              
              <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-6 leading-tight">
                NEXUS
              </h1>
              <p className="text-2xl md:text-3xl text-gray-300 leading-relaxed font-light mb-8">
                Where <span className="text-cyan-300 font-semibold">Technology</span> Meets{' '}
                <span className="text-purple-300 font-semibold">Extraordinary Shopping</span>
              </p>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                Discover the future of e-commerce with AI-powered recommendations, 
                secure payments, and nationwide delivery.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <motion.button
                  onClick={() => navigate('/products')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <ShoppingCart className="w-6 h-6" />
                  Start Shopping
                </motion.button>
                <motion.button
                  onClick={() => navigate('/about')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/10 backdrop-blur-md border border-cyan-400/30 hover:bg-white/20 text-white rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3"
                >
                  Learn More
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Quick Stats */}
              <motion.div 
                className="grid grid-cols-2 gap-6 mt-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{formatCount(stats.totalProducts)}</div>
                  <div className="text-gray-400 text-sm">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{formatCount(stats.happyCustomers)}</div>
                  <div className="text-gray-400 text-sm">Happy Customers</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-3xl p-8 backdrop-blur-md border border-cyan-400/30 shadow-2xl">
                <div className="grid grid-cols-2 gap-5">
                  {(heroFeatureProducts.length > 0 ? heroFeatureProducts : [1, 2, 3, 4]).map((item, index) => (
                    <motion.div
                      key={typeof item === 'object' ? item.id : item}
                      whileHover={{ scale: 1.04, y: -6 }}
                      className="bg-white/10 rounded-2xl p-6 border border-white/20 backdrop-blur-sm cursor-pointer min-h-[210px] flex flex-col justify-center"
                      onClick={() => {
                        if (typeof item === 'object') {
                          navigate(`/product/${item.id}`);
                        }
                      }}
                    >
                      {typeof item === 'object' ? (
                        <>
                          <div className="w-28 h-28 rounded-2xl overflow-hidden mx-auto mb-4 border border-cyan-300/40">
                            <img
                              src={item.image_urls?.[0] || item.image_url || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500';
                              }}
                            />
                          </div>
                          <div className="text-center">
                            <div className="text-white font-semibold text-lg line-clamp-2 min-h-[3.4rem]">{item.name}</div>
                            <div className="text-cyan-300 text-lg mt-1 font-bold">Rs. {parseFloat(item.price || 0).toFixed(0)}</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                            <TrendingUp className="text-white w-7 h-7" />
                          </div>
                          <div className="text-center">
                            <div className="text-white font-semibold text-base">Feature {index + 1}</div>
                            <div className="text-gray-400 text-sm mt-1">Top picks for you</div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { icon: Award, value: formatPercent(stats.satisfactionRate), label: 'Satisfaction Rate', color: 'from-green-500 to-emerald-500' },
              { icon: Users, value: formatCount(stats.happyCustomers), label: 'Happy Customers', color: 'from-blue-500 to-cyan-500' },
              { icon: Globe, value: 'Nationwide', label: 'Delivery Coverage', color: 'from-purple-500 to-pink-500' },
              { icon: Clock, value: formatHours(stats.deliveryTime), label: 'Avg Delivery Time', color: 'from-orange-500 to-red-500' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center p-6 rounded-3xl bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600 hover:border-cyan-400/50 transition-all duration-300 group"
              >
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                  <stat.icon className="text-white" size={28} />
                </div>
                <div className="text-3xl font-black text-white mb-2">{stat.value}</div>
                <div className="text-gray-300 font-semibold">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Special Offers Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="relative overflow-hidden rounded-[2rem] border border-yellow-300/40 bg-gradient-to-br from-yellow-300 via-orange-400 to-amber-500 p-8 md:p-12 shadow-2xl">
              <div className="absolute -top-16 -left-10 w-48 h-48 rounded-full bg-yellow-200/40" />
              <div className="absolute -bottom-20 -right-8 w-56 h-56 rounded-full bg-orange-300/40" />
              <div className="absolute top-8 right-10 w-24 h-24 rounded-full bg-yellow-100/30" />

              <div className="relative max-w-3xl mx-auto">
                <motion.div
                  whileHover={{ rotate: -1, scale: 1.01 }}
                  className="relative mx-auto max-w-2xl"
                >
                  <div className="absolute inset-0 translate-y-3 rounded-2xl bg-purple-900/45" />
                  <div className="relative rounded-2xl bg-gradient-to-r from-purple-700 via-violet-600 to-fuchsia-600 px-6 py-7 md:px-10 md:py-9 shadow-xl">
                    <span className="absolute -top-7 left-5 inline-flex items-center rounded-full bg-orange-500 px-4 py-2 text-sm font-black uppercase tracking-wide text-yellow-100">
                      Special Offer
                    </span>
                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-wider text-white">
                      Big Deal
                    </h2>
                    <p className="mt-3 text-white/90 text-base md:text-lg font-semibold">
                      Don't miss out on these limited-time deals and exclusive discounts
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 mb-8">
            {specialOffers.map((offer, index) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-gradient-to-br from-fuchsia-500/20 via-blue-500/20 to-cyan-500/20 rounded-3xl p-6 md:p-7 text-white shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 cursor-pointer group border border-cyan-300/30 backdrop-blur-xl"
                onClick={() => navigate('/offers')}
              >
                <div className="flex gap-4 items-start">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border border-white/30 bg-white/10 shrink-0">
                    <img
                      src={getOfferImage(offer)}
                      alt={offer.product_name || getOfferTitle(offer)}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-3 mb-2">
                      <h3 className="text-2xl font-black">{getOfferTitle(offer)}</h3>
                      <motion.div
                        whileHover={{ scale: 1.08, rotate: 3 }}
                        className="bg-gradient-to-r from-yellow-300 to-orange-400 text-gray-900 px-4 py-2 rounded-full text-sm font-black shadow-lg"
                      >
                        {getOfferDiscountLabel(offer)}
                      </motion.div>
                    </div>
                    <p className="text-white/80 mb-4 leading-relaxed">{getOfferDescription(offer)}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {offer.offer_type && (
                        <span className="px-3 py-1 rounded-full bg-white/15 border border-white/20 font-semibold">
                          {offer.offer_type}
                        </span>
                      )}
                      {offer.valid_until && (
                        <span className="px-3 py-1 rounded-full bg-white/15 border border-white/20 font-semibold">
                          Valid till {new Date(offer.valid_until).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-5 pt-4 border-t border-white/15">
                  <span className="text-cyan-100 text-sm font-semibold">Limited-time offer</span>
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-2 text-white font-bold"
                  >
                    View Offer
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <motion.button
              onClick={() => navigate('/offers')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-2xl font-black text-lg transition-all duration-300 flex items-center justify-center gap-3 mx-auto shadow-xl"
            >
              View All Offers
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-5xl font-black text-white mb-4 flex items-center justify-center gap-3">
              <Sparkles className="text-cyan-400" />
              New Arrivals
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Freshly added products to explore and discover
            </p>
          </motion.div>

          {newArrivals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white/5 rounded-3xl border border-cyan-500/20"
            >
              <div className="text-6xl mb-4">✨</div>
              <h3 className="text-2xl font-semibold text-white mb-2">No New Arrivals Yet</h3>
              <p className="text-gray-400 mb-6">Check back soon for fresh products</p>
            </motion.div>
          ) : (
            <>
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                initial="hidden"
                whileInView="visible"
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
                {newArrivals.slice(0, 6).map((product, index) => (
                  <motion.div
                    key={product.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <ProductCard 
                      product={product}
                      onAddToCart={handleAddToCart}
                      onViewDetails={handleViewDetails}
                      onAddReview={handleAddReview}
                      compact={true}
                    />
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <motion.button
                  onClick={() => navigate('/products')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 flex items-center justify-center gap-3 mx-auto"
                >
                  View All Products
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </motion.div>
            </>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-5xl font-black text-white mb-4 flex items-center justify-center gap-3">
              <Star className="text-yellow-400" />
              Featured Products
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Handpicked selection of our most popular and high-quality products
            </p>
          </motion.div>

          {featuredProducts.length > 0 && (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              initial="hidden"
              whileInView="visible"
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
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ProductCard 
                    product={product}
                    onAddToCart={handleAddToCart}
                    onViewDetails={handleViewDetails}
                    onAddReview={handleAddReview}
                    compact={true}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-300/10 rounded-full blur-3xl animate-pulse" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative"
        >
          <h2 className="text-5xl md:text-7xl font-black text-white mb-8">
            READY TO
            <span className="block bg-gradient-to-r from-cyan-200 to-white bg-clip-text text-transparent">
              SHOP SMART?
            </span>
          </h2>
          <p className="text-xl text-cyan-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of satisfied customers experiencing the future of e-commerce today.
          </p>
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.button
              onClick={() => navigate('/products')}
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(6, 182, 212, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-5 bg-white text-cyan-600 rounded-2xl font-black text-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-white"
            >
              EXPLORE PRODUCTS
            </motion.button>
            <motion.button
              onClick={() => navigate('/about')}
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-5 bg-transparent border-2 border-white text-white rounded-2xl font-black text-lg hover:shadow-2xl transition-all duration-300"
            >
              LEARN MORE
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* Toast Notification */}
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: '', type: 'success' })} 
      />

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
    </div>
  );
};

export default HomePage;
