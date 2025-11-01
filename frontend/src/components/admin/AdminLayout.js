import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Package, 
  Gift, 
  ShoppingCart, 
  Users, 
  Ticket, 
  Bell,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Shield,
  Settings,
  Home
} from 'lucide-react';

const AdminLayout = ({ children, activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const tabs = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      icon: BarChart3, 
      color: 'cyan',
      description: 'Analytics Overview'
    },
    { 
      id: 'products', 
      name: 'Products', 
      icon: Package, 
      color: 'emerald',
      description: 'Manage Inventory'
    },
    { 
      id: 'offers', 
      name: 'Offers', 
      icon: Gift, 
      color: 'orange',
      description: 'Deals & Promotions'
    },
    { 
      id: 'orders', 
      name: 'Orders', 
      icon: ShoppingCart, 
      color: 'purple',
      description: 'Order Management'
    },
    { 
      id: 'users', 
      name: 'Users', 
      icon: Users, 
      color: 'blue',
      description: 'Customer Management'
    },
    { 
      id: 'promocodes', 
      name: 'Promo Codes', 
      icon: Ticket, 
      color: 'pink',
      description: 'Discount Codes'
    },
    { 
      id: 'notifications', 
      name: 'Notifications', 
      icon: Bell, 
      color: 'red',
      description: 'Alerts & Messages'
    }
  ];

  const getTabColor = (tabId) => {
    const colors = {
      'dashboard': 'from-cyan-500 to-blue-500',
      'products': 'from-emerald-500 to-green-500',
      'offers': 'from-orange-500 to-amber-500',
      'orders': 'from-purple-500 to-violet-500',
      'users': 'from-blue-500 to-indigo-500',
      'promocodes': 'from-pink-500 to-rose-500',
      'notifications': 'from-red-500 to-orange-500'
    };
    return colors[tabId] || 'from-gray-500 to-gray-600';
  };

  const getTabIconColor = (tabId) => {
    const colors = {
      'dashboard': 'text-cyan-400',
      'products': 'text-emerald-400',
      'offers': 'text-orange-400',
      'orders': 'text-purple-400',
      'users': 'text-blue-400',
      'promocodes': 'text-pink-400',
      'notifications': 'text-red-400'
    };
    return colors[tabId] || 'text-gray-400';
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Enhanced Header */}
      <motion.div 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-gray-900/95 backdrop-blur-md shadow-2xl border-b border-cyan-500/20' 
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Left Section - Logo & Menu */}
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <motion.button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-200 backdrop-blur-sm border border-white/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.button>
              
              {/* Logo */}
              <motion.div 
                className="flex items-center space-x-3 cursor-pointer"
                onClick={() => window.location.href = '/'}
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Admin Panel
                  </h1>
                  <p className="text-sm text-gray-400">Welcome back, {user?.name}</p>
                </div>
                <div className="sm:hidden">
                  <h1 className="text-xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Admin
                  </h1>
                  <p className="text-xs text-gray-400">{user?.name}</p>
                </div>
              </motion.div>
            </div>
            
            {/* Right Section - User Info & Actions */}
            <div className="flex items-center space-x-4">
              {/* Quick Actions */}
              <div className="hidden md:flex items-center space-x-2">
                <motion.button
                  onClick={() => window.location.href = '/'}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Home className="w-4 h-4" />
                  <span className="text-sm font-medium">Store</span>
                </motion.button>
                
                <motion.button
                  className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm font-medium">Settings</span>
                </motion.button>
              </div>

              {/* User Profile */}
              <motion.div 
                className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-2xl p-2 border border-white/20"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-right hidden md:block">
                  <p className="text-sm font-semibold text-white">{user?.name}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
                
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
                    <span className="text-white font-bold text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 border-2 border-gray-900 rounded-full animate-pulse"></div>
                </div>
                
                <motion.button
                  onClick={handleLogout}
                  className="hidden sm:flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors border border-transparent hover:border-white/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 30 }}
            className="fixed top-0 left-0 h-full w-80 bg-gray-900/95 backdrop-blur-xl shadow-2xl border-r border-cyan-500/20 z-50 lg:hidden"
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-6 border-b border-cyan-500/20">
              <h2 className="text-xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Navigation
              </h2>
              <motion.button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
            
            {/* Navigation Items */}
            <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-120px)]">
              {tabs.map(tab => {
                const IconComponent = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center space-x-4 px-4 py-4 rounded-2xl text-sm font-semibold 
                      transition-all duration-300 backdrop-blur-sm border
                      ${activeTab === tab.id
                        ? `bg-gradient-to-r ${getTabColor(tab.id)} text-white shadow-2xl border-transparent`
                        : 'text-gray-400 hover:text-white hover:bg-white/10 border-white/10'
                      }
                    `}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <IconComponent className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : getTabIconColor(tab.id)}`} />
                    <div className="text-left flex-1">
                      <div className="font-semibold">{tab.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{tab.description}</div>
                    </div>
                    {activeTab === tab.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 bg-white rounded-full"
                      />
                    )}
                  </motion.button>
                );
              })}
              
              {/* Mobile logout button */}
              <motion.button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-3 px-4 py-4 text-gray-400 hover:text-white hover:bg-red-500/20 rounded-2xl transition-colors border border-white/10 mt-6 backdrop-blur-sm"
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogOut className="w-5 h-5" />
                <span className="font-semibold">Logout</span>
              </motion.button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Sidebar */}
          <motion.div 
            className="hidden lg:block lg:w-80 bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-cyan-500/20 p-6 h-fit sticky top-24"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <nav className="space-y-2">
              {tabs.map(tab => {
                const IconComponent = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center space-x-4 px-4 py-4 rounded-2xl text-sm font-semibold 
                      transition-all duration-300 backdrop-blur-sm border group
                      ${activeTab === tab.id
                        ? `bg-gradient-to-r ${getTabColor(tab.id)} text-white shadow-2xl border-transparent`
                        : 'text-gray-400 hover:text-white hover:bg-white/10 border-white/10'
                      }
                    `}
                    whileHover={{ x: 5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <IconComponent className={`w-5 h-5 transition-colors ${
                      activeTab === tab.id ? 'text-white' : getTabIconColor(tab.id)
                    }`} />
                    <div className="text-left flex-1">
                      <div className="font-semibold">{tab.name}</div>
                      <div className="text-xs text-gray-500 mt-1 group-hover:text-gray-400 transition-colors">
                        {tab.description}
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${
                      activeTab === tab.id ? 'rotate-90 text-white' : 'text-gray-500'
                    }`} />
                  </motion.button>
                );
              })}
            </nav>

            {/* Sidebar Footer */}
            <div className="mt-8 pt-6 border-t border-cyan-500/20">
              <div className="text-center text-gray-500 text-sm">
                <p>Admin Panel </p>
                <p className="text-xs mt-1">Secure Management System</p>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1 min-w-0 w-full">
            <motion.div 
              className="bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-cyan-500/20 overflow-hidden min-h-[calc(100vh-12rem)]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {children}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <motion.div 
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-cyan-500/20 py-3 px-4 z-40"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex justify-around items-center">
          {tabs.slice(0, 4).map(tab => {
            const IconComponent = tab.icon;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex flex-col items-center p-2 rounded-2xl transition-all duration-200 backdrop-blur-sm
                  ${activeTab === tab.id
                    ? `bg-gradient-to-r ${getTabColor(tab.id)} text-white shadow-lg`
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }
                `}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <IconComponent className="w-5 h-5" />
                <span className="text-xs mt-1 font-medium">{tab.name}</span>
              </motion.button>
            );
          })}
          <motion.button
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center p-2 rounded-2xl text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Menu className="w-5 h-5" />
            <span className="text-xs mt-1 font-medium">More</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLayout;