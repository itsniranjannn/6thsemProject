import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import NotificationCenter from './NotificationCenter.js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  Store, 
  Package,
  Users,
  Settings,
  Sparkles,
  Zap,
  LayoutDashboard
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: Store },
    { path: '/products', label: 'Products', icon: Package },
    { path: '/about', label: 'About Us', icon: Users },
  ];

  const menuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const itemVariants = {
    closed: { opacity: 0, x: -20 },
    open: { opacity: 1, x: 0 }
  };

  // Debug user data
  console.log('Navbar User Data:', {
    user,
    isAuthenticated,
    isAdmin,
    role: user?.role
  });

  return (
    <motion.nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
          : 'bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Enhanced Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-3"
          >
            <Link to="/" className="flex items-center space-x-3 no-underline">
              {/* Animated Logo Container */}
              <motion.div 
                className={`relative rounded-xl flex items-center justify-center ${
                  scrolled 
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg' 
                    : 'bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-blue-500/25'
                }`}
                whileHover={{ 
                  scale: 1.1,
                  rotate: [0, -5, 5, 0],
                  transition: { duration: 0.5 }
                }}
                transition={{ duration: 0.6 }}
              >
                {/* Main Logo Icon */}
                <div className="w-12 h-12 flex items-center justify-center relative">
                  {/* Central Nexus Symbol */}
                  <motion.div
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity }
                    }}
                    className="relative"
                  >
                    {/* Outer Ring */}
                    <div className={`w-8 h-8 rounded-full border-2 ${
                      scrolled ? 'border-white' : 'border-white'
                    }`} />
                    
                    {/* Center Dot */}
                    <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${
                      scrolled ? 'bg-white' : 'bg-yellow-300'
                    }`} />
                    
                    {/* Connection Lines */}
                    <div className={`absolute top-1/2 left-0 w-2 h-0.5 ${
                      scrolled ? 'bg-white' : 'bg-cyan-300'
                    }`} />
                    <div className={`absolute top-0 left-1/2 h-2 w-0.5 ${
                      scrolled ? 'bg-white' : 'bg-cyan-300'
                    }`} />
                  </motion.div>
                  
                  {/* Floating Particles */}
                  <motion.div
                    animate={{
                      y: [0, -4, 0],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className={`absolute -top-1 -right-1 w-1 h-1 rounded-full ${
                      scrolled ? 'bg-cyan-300' : 'bg-yellow-300'
                    }`}
                  />
                  <motion.div
                    animate={{
                      y: [0, 4, 0],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1
                    }}
                    className={`absolute -bottom-1 -left-1 w-1 h-1 rounded-full ${
                      scrolled ? 'bg-purple-300' : 'bg-pink-300'
                    }`}
                  />
                </div>
              </motion.div>

              {/* Logo Text */}
              <div className="flex flex-col">
                <motion.span 
                  className={`text-xl font-black tracking-tight ${
                    scrolled ? 'text-gray-500' : 'text-white'
                  }`}
                  whileHover={{ color: scrolled ? '#3B82F6' : '#60A5FA' }}
                >
                  NEXUS
                </motion.span>
                <motion.span 
                  className={`text-xs font-medium tracking-wider ${
                    scrolled ? 'text-gray-600' : 'text-blue-200'
                  }`}
                >
                  DIGITAL STORE
                </motion.span>
              </div>

              {/* Premium Badge */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-bold ${
                  scrolled 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' 
                    : 'bg-white/20 text-white backdrop-blur-sm'
                }`}
              >
                <Zap size={10} className="fill-current" />
                <span>PRO</span>
              </motion.div>
            </Link>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link, index) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              
              return (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={link.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 border ${
                      isActive
                        ? scrolled
                          ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm'
                          : 'bg-white/20 text-white border-white/30 shadow-lg'
                        : scrolled
                        ? 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 border-transparent hover:border-blue-200'
                        : 'text-white/80 hover:text-white hover:bg-white/10 border-transparent hover:border-white/20'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="font-semibold">{link.label}</span>
                  </Link>
                </motion.div>
              );
            })}

            {/* Cart Link - Always visible for authenticated users */}
            {isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <Link
                  to="/cart"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 border ${
                    scrolled
                      ? 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 border-transparent hover:border-blue-200'
                      : 'text-white/80 hover:text-white hover:bg-white/10 border-transparent hover:border-white/20'
                  }`}
                >
                  <ShoppingCart size={18} />
                  <span className="font-semibold">Cart</span>
                </Link>
              </motion.div>
            )}

            {/* Dashboard Link - Only for regular users (not admin) */}
            {isAuthenticated && user?.role === 'user' && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 border ${
                    scrolled
                      ? 'text-gray-600 hover:text-purple-600 hover:bg-gray-50 border-transparent hover:border-purple-200'
                      : 'text-white/80 hover:text-white hover:bg-white/10 border-transparent hover:border-white/20'
                  }`}
                >
                  <LayoutDashboard size={18} />
                  <span className="font-semibold">Dashboard</span>
                </Link>
              </motion.div>
            )}

            {/* Admin Panel Link - Only for admin users */}
            {isAuthenticated && user?.role === 'admin' && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <Link
                  to="/admin"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 border ${
                    scrolled
                      ? 'text-gray-600 hover:text-green-600 hover:bg-gray-50 border-transparent hover:border-green-200'
                      : 'text-white/80 hover:text-white hover:bg-white/10 border-transparent hover:border-white/20'
                  }`}
                >
                  <Settings size={18} />
                  <span className="font-semibold">Admin</span>
                </Link>
              </motion.div>
            )}

            {isAuthenticated ? (
              <motion.div 
                className="flex items-center space-x-3"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <NotificationCenter />
                
                {/* User Profile */}
                <motion.div 
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl border ${
                    scrolled 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-white/10 border-white/20 backdrop-blur-sm'
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    scrolled 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                      : 'bg-white/20'
                  }`}>
                    <User size={16} className="text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className={`font-semibold max-w-24 truncate text-sm ${
                      scrolled ? 'text-gray-700' : 'text-white'
                    }`}>
                      {user.name}
                    </span>
                    <span className={`text-xs ${
                      scrolled ? 'text-gray-500' : 'text-white/70'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </motion.div>
                
                {/* Logout Button */}
                <motion.button
                  onClick={handleLogout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 border ${
                    scrolled
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white border-transparent hover:shadow-lg'
                      : 'bg-white text-blue-900 border-white hover:bg-white/90 hover:shadow-lg'
                  }`}
                >
                  Logout
                </motion.button>
              </motion.div>
            ) : (
              <motion.div 
                className="flex items-center space-x-3"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 border ${
                    scrolled
                      ? 'text-gray-600 hover:text-blue-600 border-transparent'
                      : 'text-white/80 hover:text-white border-transparent'
                  }`}
                >
                  Login
                </Link>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/register"
                    className={`px-6 py-2 rounded-xl font-semibold transition-all duration-200 border ${
                      scrolled
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-transparent hover:shadow-lg'
                        : 'bg-white text-blue-900 border-white hover:bg-white/90 hover:shadow-lg'
                    }`}
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </div>

          {/* Mobile menu button */}
          <motion.div 
            className="md:hidden"
            whileTap={{ scale: 0.95 }}
          >
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-lg border ${
                scrolled 
                  ? 'text-gray-700 border-gray-300 hover:bg-gray-100' 
                  : 'text-white border-white/30 hover:bg-white/10'
              }`}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </motion.div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className={`md:hidden overflow-hidden ${
                scrolled 
                  ? 'bg-white/95 backdrop-blur-md border-t border-gray-200' 
                  : 'bg-gradient-to-b from-gray-900/95 to-blue-900/95 backdrop-blur-md border-t border-white/20'
              }`}
            >
              <div className="py-4 space-y-2">
                {navLinks.map((link, index) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  
                  return (
                    <motion.div
                      key={link.path}
                      variants={itemVariants}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={link.path}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg mx-2 transition-all duration-200 border ${
                          isActive
                            ? scrolled
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-white/20 text-white border-white/30'
                            : scrolled
                            ? 'text-gray-700 hover:bg-gray-100 border-transparent'
                            : 'text-white/80 hover:bg-white/10 border-transparent'
                        }`}
                      >
                        <Icon size={20} />
                        <span className="font-semibold">{link.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Cart Link - Mobile */}
                {isAuthenticated && (
                  <motion.div variants={itemVariants} transition={{ delay: 0.25 }}>
                    <Link
                      to="/cart"
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg mx-2 transition-all duration-200 border ${
                        scrolled
                          ? 'text-gray-700 hover:bg-gray-100 border-transparent'
                          : 'text-white/80 hover:bg-white/10 border-transparent'
                      }`}
                    >
                      <ShoppingCart size={20} />
                      <span className="font-semibold">Cart</span>
                    </Link>
                  </motion.div>
                )}

                {/* Dashboard Link - Mobile (Only for regular users) */}
                {isAuthenticated && user?.role === 'user' && (
                  <motion.div variants={itemVariants} transition={{ delay: 0.3 }}>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg mx-2 transition-all duration-200 border ${
                        scrolled
                          ? 'text-gray-700 hover:bg-gray-100 border-transparent'
                          : 'text-white/80 hover:bg-white/10 border-transparent'
                      }`}
                    >
                      <LayoutDashboard size={20} />
                      <span className="font-semibold">Dashboard</span>
                    </Link>
                  </motion.div>
                )}

                {/* Admin Panel Link - Mobile (Only for admin users) */}
                {isAuthenticated && user?.role === 'admin' && (
                  <motion.div variants={itemVariants} transition={{ delay: 0.35 }}>
                    <Link
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg mx-2 transition-all duration-200 border ${
                        scrolled
                          ? 'text-gray-700 hover:bg-gray-100 border-transparent'
                          : 'text-white/80 hover:bg-white/10 border-transparent'
                      }`}
                    >
                      <Settings size={20} />
                      <span className="font-semibold">Admin</span>
                    </Link>
                  </motion.div>
                )}

                <div className={`border-t mx-2 pt-4 mt-4 ${
                  scrolled ? 'border-gray-300' : 'border-white/30'
                }`}>
                  {isAuthenticated ? (
                    <motion.div variants={itemVariants} transition={{ delay: 0.5 }}>
                      <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg mx-2 ${
                        scrolled ? 'text-gray-700' : 'text-white'
                      }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          scrolled 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                            : 'bg-white/20'
                        }`}>
                          <User size={16} className="text-white" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold">Welcome, {user.name}</span>
                          <span className="text-sm opacity-75">Role: {user.role}</span>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 rounded-lg mx-2 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold border border-transparent hover:shadow-lg"
                      >
                        Logout
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div className="space-y-2" variants={itemVariants} transition={{ delay: 0.5 }}>
                      <Link
                        to="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className={`block px-4 py-3 rounded-lg mx-2 text-center border ${
                          scrolled
                            ? 'text-gray-700 hover:bg-gray-100 border-gray-300'
                            : 'text-white hover:bg-white/10 border-white/30'
                        }`}
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsMenuOpen(false)}
                        className="block px-4 py-3 rounded-lg mx-2 text-center bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold border border-transparent hover:shadow-lg"
                      >
                        Sign Up
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;