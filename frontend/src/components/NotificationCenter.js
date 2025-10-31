import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.js';
import Toast from './Toast.js';
import { 
  Bell, 
  X, 
  CheckCircle, 
  Trash2, 
  RefreshCw, 
  AlertTriangle,
  Info,
  ShoppingBag,
  CreditCard,
  Gift,
  Star,
  Package,
  Zap,
  MessageCircle
} from 'lucide-react';

const NotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE_URL}/api/admin/user-notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const userNotifications = result.notifications || [];
          setNotifications(userNotifications);
          
          // Count unread notifications
          const unread = userNotifications.filter(notification => !notification.is_read).length;
          setUnreadCount(unread);
        }
      } else {
        showToast('Failed to fetch notifications', 'error');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      showToast('Error fetching notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const getNotificationConfig = (type) => {
    const configs = {
      success: {
        icon: CheckCircle,
        gradient: 'from-emerald-500 to-green-500',
        bg: 'bg-gradient-to-br from-emerald-50 to-green-50',
        border: 'border-l-4 border-emerald-500',
        text: 'text-emerald-900',
        badge: 'bg-emerald-100 text-emerald-800',
        iconBg: 'bg-emerald-500',
        glow: 'shadow-[0_0_20px_rgba(16,185,129,0.1)]'
      },
      warning: {
        icon: AlertTriangle,
        gradient: 'from-amber-500 to-orange-500',
        bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
        border: 'border-l-4 border-amber-500',
        text: 'text-amber-900',
        badge: 'bg-amber-100 text-amber-800',
        iconBg: 'bg-amber-500',
        glow: 'shadow-[0_0_20px_rgba(245,158,11,0.1)]'
      },
      error: {
        icon: X,
        gradient: 'from-red-500 to-rose-500',
        bg: 'bg-gradient-to-br from-red-50 to-rose-50',
        border: 'border-l-4 border-red-500',
        text: 'text-red-900',
        badge: 'bg-red-100 text-red-800',
        iconBg: 'bg-red-500',
        glow: 'shadow-[0_0_20px_rgba(239,68,68,0.1)]'
      },
      promotion: {
        icon: Gift,
        gradient: 'from-purple-500 to-pink-500',
        bg: 'bg-gradient-to-br from-purple-50 to-pink-50',
        border: 'border-l-4 border-purple-500',
        text: 'text-purple-900',
        badge: 'bg-purple-100 text-purple-800',
        iconBg: 'bg-purple-500',
        glow: 'shadow-[0_0_20px_rgba(168,85,247,0.1)]'
      },
      order: {
        icon: ShoppingBag,
        gradient: 'from-blue-500 to-cyan-500',
        bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
        border: 'border-l-4 border-blue-500',
        text: 'text-blue-900',
        badge: 'bg-blue-100 text-blue-800',
        iconBg: 'bg-blue-500',
        glow: 'shadow-[0_0_20px_rgba(59,130,246,0.1)]'
      },
      payment: {
        icon: CreditCard,
        gradient: 'from-indigo-500 to-violet-500',
        bg: 'bg-gradient-to-br from-indigo-50 to-violet-50',
        border: 'border-l-4 border-indigo-500',
        text: 'text-indigo-900',
        badge: 'bg-indigo-100 text-indigo-800',
        iconBg: 'bg-indigo-500',
        glow: 'shadow-[0_0_20px_rgba(99,102,241,0.1)]'
      },
      promo: {
        icon: Star,
        gradient: 'from-yellow-500 to-amber-500',
        bg: 'bg-gradient-to-br from-yellow-50 to-amber-50',
        border: 'border-l-4 border-yellow-500',
        text: 'text-yellow-900',
        badge: 'bg-yellow-100 text-yellow-800',
        iconBg: 'bg-yellow-500',
        glow: 'shadow-[0_0_20px_rgba(234,179,8,0.1)]'
      },
      offer: {
        icon: Zap,
        gradient: 'from-orange-500 to-red-500',
        bg: 'bg-gradient-to-br from-orange-50 to-red-50',
        border: 'border-l-4 border-orange-500',
        text: 'text-orange-900',
        badge: 'bg-orange-100 text-orange-800',
        iconBg: 'bg-orange-500',
        glow: 'shadow-[0_0_20px_rgba(249,115,22,0.1)]'
      },
      system: {
        icon: Info,
        gradient: 'from-gray-500 to-slate-500',
        bg: 'bg-gradient-to-br from-gray-50 to-slate-50',
        border: 'border-l-4 border-gray-500',
        text: 'text-gray-900',
        badge: 'bg-gray-100 text-gray-800',
        iconBg: 'bg-gray-500',
        glow: 'shadow-[0_0_20px_rgba(107,114,128,0.1)]'
      },
      info: {
        icon: MessageCircle,
        gradient: 'from-sky-500 to-blue-500',
        bg: 'bg-gradient-to-br from-sky-50 to-blue-50',
        border: 'border-l-4 border-sky-500',
        text: 'text-sky-900',
        badge: 'bg-sky-100 text-sky-800',
        iconBg: 'bg-sky-500',
        glow: 'shadow-[0_0_20px_rgba(14,165,233,0.1)]'
      }
    };
    return configs[type] || configs.info;
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          console.warn('Mark as read endpoint not available, updating locally');
        }
      } catch (apiError) {
        console.warn('Mark as read API call failed, updating locally');
      }

      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      showToast('Notification marked as read', 'success');
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
      showToast('Error marking notification as read', 'error');
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/notifications/mark-all-read`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          console.warn('Mark all as read endpoint not available, updating locally');
        }
      } catch (apiError) {
        console.warn('Mark all as read API call failed, updating locally');
      }

      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      setUnreadCount(0);
      showToast('All notifications marked as read', 'success');
      
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      showToast('Error marking all notifications as read', 'error');
    }
  };

  const clearAllNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/notifications/clear-all`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          console.warn('Clear all endpoint not available, updating locally');
        }
      } catch (apiError) {
        console.warn('Clear all API call failed, updating locally');
      }

      setNotifications([]);
      setUnreadCount(0);
      showToast('All notifications cleared', 'success');
      
    } catch (error) {
      console.error('Error clearing notifications:', error);
      showToast('Error clearing notifications', 'error');
    }
  };

  const handleClearAll = () => {
    if (notifications.length === 0) return;
    
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      clearAllNotifications();
    }
  };

  const handleRefresh = async () => {
    await fetchNotifications();
    showToast('Notifications refreshed', 'success');
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  const NotificationItem = ({ notification, index }) => {
    const config = getNotificationConfig(notification.type);
    const IconComponent = config.icon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ delay: index * 0.05 }}
        className={`p-4 ${config.bg} ${config.border} ${config.glow} cursor-pointer transition-all duration-300 group hover:shadow-lg relative overflow-hidden`}
        onClick={() => !notification.is_read && markAsRead(notification.id)}
      >
        {/* Unread indicator */}
        {!notification.is_read && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-4 right-4 w-3 h-3 bg-blue-500 rounded-full animate-pulse ring-2 ring-white"
          />
        )}

        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="flex items-start space-x-4 relative z-10">
          {/* Icon with gradient background */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`flex-shrink-0 w-12 h-12 ${config.iconBg} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}
          >
            <IconComponent size={20} className="text-white" />
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Header with title and badge */}
            <div className="flex items-start justify-between">
              <motion.h4 
                className="text-sm font-bold text-gray-900 leading-tight pr-2"
                whileHover={{ color: config.text }}
              >
                {notification.title}
              </motion.h4>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${config.badge} shadow-sm flex-shrink-0`}>
                {notification.type}
              </span>
            </div>
            
            {/* Message */}
            <motion.p 
              className="text-sm text-gray-700 leading-relaxed"
              whileHover={{ color: '#374151' }}
            >
              {notification.message}
            </motion.p>

            {/* Image if available */}
            {notification.image_url && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-2 overflow-hidden rounded-xl border border-gray-200 shadow-sm"
              >
                <img
                  src={notification.image_url}
                  alt="Notification"
                  className="w-full h-32 object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </motion.div>
            )}

            {/* Footer with timestamp and actions */}
            <div className="flex items-center justify-between pt-2">
              <motion.p 
                className="text-xs text-gray-500 font-medium"
                whileHover={{ scale: 1.05 }}
              >
                {formatTimeAgo(notification.created_at)}
              </motion.p>
              
              {!notification.is_read && (
                <motion.button
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(notification.id);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-3 py-1.5 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-300 hover:shadow-sm"
                >
                  Mark read
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Toast Notification */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ show: false, message: '', type: 'success' })} 
        />
      )}

      {/* Notification Bell */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleNotifications}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
      >
        <div className="relative">
          <motion.div
            animate={{ 
              rotate: showNotifications ? [0, -10, 10, 0] : 0,
              scale: showNotifications ? [1, 1.1, 1] : 1
            }}
            transition={{ duration: 0.5 }}
          >
            <Bell className="w-6 h-6 transition-colors" />
          </motion.div>
          
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg ring-2 ring-white"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </div>
      </motion.button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {showNotifications && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-10 z-40"
              onClick={() => setShowNotifications(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute right-0 mt-2 w-96 bg-white rounded-3xl shadow-2xl border border-gray-200 z-50 max-h-[520px] overflow-hidden"
            >
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center space-x-4">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg"
                    >
                      <Bell size={24} className="text-white" />
                    </motion.div>
                    <div>
                      <motion.h3
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-xl font-bold"
                      >
                        Notifications
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-blue-100 text-sm"
                      >
                        {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                      </motion.p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {notifications.length > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleClearAll}
                        className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm"
                        title="Clear all"
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={toggleNotifications}
                      className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm"
                    >
                      <X size={18} />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent mx-auto mb-4"
                    />
                    <p className="text-gray-600 text-sm font-medium">Loading notifications...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 text-center"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Bell size={32} className="text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-bold text-lg mb-2">No notifications</p>
                    <p className="text-sm text-gray-500">You're all caught up with your notifications!</p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.1 }}
                    className="divide-y divide-gray-100/50"
                  >
                    {notifications.map((notification, index) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        index={index}
                      />
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Footer Actions */}
              {notifications.length > 0 && (
                <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/50">
                  <div className="flex items-center justify-between">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleRefresh}
                      className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 font-semibold transition-colors duration-200 px-3 py-2 hover:bg-white rounded-xl"
                    >
                      <RefreshCw size={16} />
                      <span>Refresh</span>
                    </motion.button>
                    
                    {unreadCount > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={markAllAsRead}
                        className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200 px-3 py-2 hover:bg-blue-50 rounded-xl"
                      >
                        <CheckCircle size={16} />
                        <span>Mark all as read</span>
                      </motion.button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;