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
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { Toast } from '../components/Toast.js';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [specialOffers, setSpecialOffers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    happyCustomers: 0,
    satisfactionRate: 0,
    deliveryTime: 0
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'success' });
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
      setSpecialOffers([
        {
          id: 1,
          title: "Summer Sale",
          description: "Up to 50% off on electronics",
          discount: "50%",
          bgGradient: "from-orange-500 to-red-500",
          expires: "2024-12-31"
        },
        {
          id: 2,
          title: "Flash Deal",
          description: "Limited time offers on fashion",
          discount: "30%",
          bgGradient: "from-purple-500 to-pink-500",
          expires: "2024-12-25"
        }
      ]);
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
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback stats
      setStats({
        totalProducts: 1250,
        happyCustomers: 50000,
        satisfactionRate: 98,
        deliveryTime: 24
      });
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
    // Navigate to product detail page or open modal
    navigate(`/product/${product.id}`);
  };

  const handleAddReview = (product) => {
    if (!user) {
      showToast('Please login to add a review', 'error');
      return;
    }
    // Navigate to product page with review modal
    navigate(`/product/${product.id}?review=true`);
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
                  <div className="text-2xl font-bold text-white">{stats.totalProducts}+</div>
                  <div className="text-gray-400 text-sm">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{stats.happyCustomers}+</div>
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
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((item) => (
                    <motion.div
                      key={item}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="bg-white/10 rounded-2xl p-4 border border-white/20 backdrop-blur-sm"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center mb-3 mx-auto">
                        <TrendingUp className="text-white w-6 h-6" />
                      </div>
                      <div className="text-center">
                        <div className="text-white font-semibold">Feature {item}</div>
                        <div className="text-gray-400 text-sm mt-1">Amazing benefit</div>
                      </div>
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
              { icon: Award, value: `${stats.satisfactionRate}%`, label: 'Satisfaction Rate', color: 'from-green-500 to-emerald-500' },
              { icon: Users, value: `${stats.happyCustomers}+`, label: 'Happy Customers', color: 'from-blue-500 to-cyan-500' },
              { icon: Globe, value: 'Nationwide', label: 'Delivery Coverage', color: 'from-purple-500 to-pink-500' },
              { icon: Clock, value: `${stats.deliveryTime}h`, label: 'Avg Delivery Time', color: 'from-orange-500 to-red-500' }
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
            <h2 className="text-5xl font-black text-white mb-4 flex items-center justify-center gap-3">
              <Zap className="text-yellow-400" />
              Special Offers
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Don't miss out on these limited-time deals and exclusive discounts
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {specialOffers.map((offer, index) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className={`bg-gradient-to-r ${offer.bgGradient} rounded-3xl p-8 text-white shadow-2xl hover:shadow-2xl transition-all duration-300 cursor-pointer group`}
                onClick={() => navigate('/offers')}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{offer.title}</h3>
                    <p className="text-white/80 mb-4">{offer.description}</p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold"
                  >
                    {offer.discount} OFF
                  </motion.div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">Limited time offer</span>
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-2 text-white font-semibold"
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
              className="px-8 py-4 bg-white/10 backdrop-blur-md border border-cyan-400/30 hover:bg-white/20 text-white rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 mx-auto"
            >
              View All Offers
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-gray-800">
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

          {featuredProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white/5 rounded-3xl border border-cyan-500/20"
            >
              <div className="text-6xl mb-4">⭐</div>
              <h3 className="text-2xl font-semibold text-white mb-2">No Featured Products</h3>
              <p className="text-gray-400 mb-6">Check back later for featured items</p>
            </motion.div>
          ) : (
            <>
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
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

      {/* New Arrivals Section */}
      <section className="py-20">
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

          {newArrivals.length > 0 && (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
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
    </div>
  );
};

export default HomePage;