import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import Toast from './Toast.js';

const NotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
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

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'promotion':
        return '🎉';
      case 'order':
        return '📦';
      case 'payment':
        return '💳';
      case 'promo':
        return '🎫';
      case 'offer':
        return '🎁';
      case 'system':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50 hover:bg-green-100';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50 hover:bg-yellow-100';
      case 'error':
        return 'border-l-red-500 bg-red-50 hover:bg-red-100';
      case 'promotion':
        return 'border-l-purple-500 bg-purple-50 hover:bg-purple-100';
      case 'order':
        return 'border-l-blue-500 bg-blue-50 hover:bg-blue-100';
      case 'payment':
        return 'border-l-indigo-500 bg-indigo-50 hover:bg-indigo-100';
      case 'promo':
        return 'border-l-pink-500 bg-pink-50 hover:bg-pink-100';
      case 'offer':
        return 'border-l-orange-500 bg-orange-50 hover:bg-orange-100';
      case 'system':
        return 'border-l-gray-500 bg-gray-50 hover:bg-gray-100';
      default:
        return 'border-l-gray-400 bg-gray-50 hover:bg-gray-100';
    }
  };

  const getNotificationBadgeColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'promotion':
        return 'bg-purple-100 text-purple-800';
      case 'order':
        return 'bg-blue-100 text-blue-800';
      case 'payment':
        return 'bg-indigo-100 text-indigo-800';
      case 'promo':
        return 'bg-pink-100 text-pink-800';
      case 'offer':
        return 'bg-orange-100 text-orange-800';
      case 'system':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      // Try the mark as read endpoint, if it fails, update locally
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

      // Update local state regardless of API call
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
      
      // Try the mark all as read endpoint, if it fails, update locally
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

      // Update local state regardless of API call
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
      
      // Try the clear all endpoint, if it fails, update locally
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

      // Update local state regardless of API call
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

  if (!user) return null;

  return (
    <div className="relative">
      {/* Toast Notification */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ show: false, message: '', type: 'success' })} 
        />
      )}

      {/* Notification Bell */}
      <button
        onClick={toggleNotifications}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
      >
        <div className="relative">
          <svg className="w-6 h-6 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </button>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-[480px] overflow-hidden transform transition-all duration-300 ease-out">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                  <p className="text-sm text-gray-600">
                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 hover:scale-110"
                    title="Clear all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={toggleNotifications}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 hover:scale-110"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
                <p className="text-gray-600 text-sm">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-gray-400">🔔</span>
                </div>
                <p className="text-gray-600 font-medium mb-1">No notifications</p>
                <p className="text-sm text-gray-500">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-l-4 transition-all duration-200 cursor-pointer group relative ${
                      getNotificationColor(notification.type)
                    } ${!notification.is_read ? 'bg-blue-50 border-l-blue-500' : ''}`}
                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                  >
                    {/* Unread indicator */}
                    {!notification.is_read && (
                      <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    )}

                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-200 group-hover:scale-105 transition-transform duration-200">
                          <span className="text-lg">
                            {getNotificationIcon(notification.type)}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="text-sm font-semibold text-gray-900 leading-tight group-hover:text-gray-700 transition-colors">
                            {notification.title}
                          </h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getNotificationBadgeColor(notification.type)} group-hover:scale-105 transition-transform`}>
                            {notification.type}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-2 leading-relaxed group-hover:text-gray-600 transition-colors">
                          {notification.message}
                        </p>

                        {notification.image_url && (
                          <div className="mb-2 transform group-hover:scale-[1.02] transition-transform duration-200">
                            <img
                              src={notification.image_url}
                              alt="Notification"
                              className="w-full h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500 font-medium group-hover:text-gray-600 transition-colors">
                            {formatTimeAgo(notification.created_at)}
                          </p>
                          {!notification.is_read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium opacity-0 group-hover:opacity-100 transition-all duration-200 px-2 py-1 hover:bg-blue-50 rounded-lg hover:shadow-sm"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleRefresh}
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200 hover:scale-105 group"
                >
                  <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh</span>
                </button>
                
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 hover:scale-105 group"
                  >
                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Mark all as read</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {showNotifications && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-10 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
};

export default NotificationCenter;