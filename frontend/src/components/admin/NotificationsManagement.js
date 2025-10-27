import React, { useState, useEffect } from 'react';
import Toast from '../Toast.js';

const NotificationsManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [previewNotification, setPreviewNotification] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'system',
    image_url: '',
    expires_at: ''
  });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE}/api/admin/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
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

  const createNotification = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      // Prepare notification data
      const notificationData = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        image_url: formData.image_url || null,
        expires_at: formData.expires_at || null,
        target_users: 'all', // Always send to all users
        is_active: true
      };

      console.log('Sending notification data:', notificationData);

      const response = await fetch(`${API_BASE}/api/admin/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(notificationData)
      });

      const result = await response.json();
      console.log('Notification creation response:', result);

      if (response.ok && result.success) {
        setShowModal(false);
        setFormData({
          title: '',
          message: '',
          type: 'system',
          image_url: '',
          expires_at: ''
        });
        fetchNotifications();
        showToast('Notification created successfully!');
      } else {
        showToast(result.message || 'Error creating notification', 'error');
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      showToast('Error creating notification: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;

    try {
      const token = localStorage.getItem('token');
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE}/api/admin/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchNotifications();
        showToast('Notification deleted successfully!');
      } else {
        showToast('Error deleting notification', 'error');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      showToast('Error deleting notification', 'error');
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      'system': 'bg-blue-100 text-blue-800 border-blue-200',
      'order': 'bg-green-100 text-green-800 border-green-200',
      'payment': 'bg-purple-100 text-purple-800 border-purple-200',
      'promo': 'bg-pink-100 text-pink-800 border-pink-200',
      'offer': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[type] || colors.system;
  };

  const getTypeIcon = (type) => {
    const icons = {
      'system': '⚙️',
      'order': '📦',
      'payment': '💳',
      'promo': '🎫',
      'offer': '🎁'
    };
    return icons[type] || '🔔';
  };

  const isExpired = (notification) => {
    if (!notification.expires_at) return false;
    return new Date(notification.expires_at) < new Date();
  };

  const activeNotifications = notifications.filter(notification => !isExpired(notification)).length;

  const handlePreview = () => {
    if (!formData.title || !formData.message) {
      showToast('Please fill in title and message to preview', 'warning');
      return;
    }
    setPreviewNotification({
      ...formData,
      created_at: new Date().toISOString(),
      id: 'preview'
    });
  };

  const NotificationPreview = ({ notification }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-md mx-auto">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preview</h3>
      
      {/* Preview Card */}
      <div className={`p-4 rounded-lg border-l-4 ${
        notification.type === 'system' ? 'border-blue-400 bg-blue-50' :
        notification.type === 'order' ? 'border-green-400 bg-green-50' :
        notification.type === 'payment' ? 'border-purple-400 bg-purple-50' :
        notification.type === 'promo' ? 'border-pink-400 bg-pink-50' :
        'border-orange-400 bg-orange-50'
      }`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 text-2xl">
            {getTypeIcon(notification.type)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm mb-1">
              {notification.title}
            </h4>
            <p className="text-gray-700 text-sm mb-2">
              {notification.message}
            </p>
            
            {notification.image_url && (
              <div className="mt-2">
                <img
                  src={notification.image_url}
                  alt="Notification preview"
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    e.target.src = '/api/placeholder/200/100';
                  }}
                />
              </div>
            )}
            
            <div className="flex items-center justify-between mt-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                notification.type === 'system' ? 'bg-blue-200 text-blue-800' :
                notification.type === 'order' ? 'bg-green-200 text-green-800' :
                notification.type === 'payment' ? 'bg-purple-200 text-purple-800' :
                notification.type === 'promo' ? 'bg-pink-200 text-pink-800' :
                'bg-orange-200 text-orange-800'
              }`}>
                {notification.type}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(notification.created_at).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <button
          onClick={() => setPreviewNotification(null)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Close Preview
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Toast Notification */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ show: false, message: '', type: 'success' })} 
        />
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Notification Management</h2>
            <p className="text-gray-600 mt-2">Send notifications to all users</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-3 shadow-lg hover:shadow-xl transition-all duration-200 mt-4 lg:mt-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Create Notification</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Notifications</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{notifications.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-blue-600 text-xl">🔔</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Notifications</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{activeNotifications}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-green-600 text-xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expired Notifications</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {notifications.length - activeNotifications}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <span className="text-red-600 text-xl">⏰</span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading notifications...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Notification</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {notifications.map((notification) => {
                    const expired = isExpired(notification);
                    return (
                      <tr key={notification.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-start space-x-4">
                            {notification.image_url && (
                              <img 
                                src={notification.image_url} 
                                alt="Notification"
                                className="h-16 w-16 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                                onError={(e) => {
                                  e.target.src = '/api/placeholder/80/80';
                                }}
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                                {notification.title}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <span>All Users</span>
                                <span>•</span>
                                <span>{getTypeIcon(notification.type)} {notification.type}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(notification.type)}`}>
                            {getTypeIcon(notification.type)} {notification.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            expired 
                              ? 'bg-red-100 text-red-800 border border-red-200' 
                              : 'bg-green-100 text-green-800 border border-green-200'
                          }`}>
                            {expired ? 'Expired' : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>
                            <div>{new Date(notification.created_at).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-400">
                              {new Date(notification.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {notifications.length === 0 && (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg font-semibold">No notifications found</p>
                <p className="text-gray-400 mt-2 mb-6">Create your first notification to engage with users</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Create First Notification
                </button>
              </div>
            )}
          </div>
        )}

        {/* Create Notification Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Create Notification</h3>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setPreviewNotification(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {previewNotification ? (
                  <NotificationPreview notification={previewNotification} />
                ) : (
                  <form onSubmit={createNotification} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Form Section */}
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                          <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="New Feature Available"
                            maxLength={100}
                          />
                          <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100 characters</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                          <textarea
                            required
                            value={formData.message}
                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                            rows="4"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="We've launched a new feature that will enhance your shopping experience..."
                            maxLength={500}
                          />
                          <p className="text-xs text-gray-500 mt-1">{formData.message.length}/500 characters</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                          <select
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          >
                            <option value="system">System</option>
                            <option value="order">Order</option>
                            <option value="payment">Payment</option>
                            <option value="promo">Promotion</option>
                            <option value="offer">Special Offer</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                          <input
                            type="url"
                            value={formData.image_url}
                            onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="https://example.com/image.jpg"
                          />
                          <p className="text-xs text-gray-500 mt-1">Optional: Add an image to make notification more engaging</p>
                        </div>

                        <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">Expires At</label>
  <input
    type="datetime-local"
    min={new Date().toISOString().slice(0, 16)}
    value={formData.expires_at}
    onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
  />
  <p className="text-xs text-gray-500 mt-2">Leave empty for no expiration</p>
</div>
                      </div>

                      {/* Preview Section */}
                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded-xl p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Preview</h4>
                          
                          {/* Mini Preview */}
                          <div className={`p-3 rounded-lg border-l-4 ${
                            formData.type === 'system' ? 'border-blue-400 bg-blue-50' :
                            formData.type === 'order' ? 'border-green-400 bg-green-50' :
                            formData.type === 'payment' ? 'border-purple-400 bg-purple-50' :
                            formData.type === 'promo' ? 'border-pink-400 bg-pink-50' :
                            'border-orange-400 bg-orange-50'
                          }`}>
                            <div className="flex items-start space-x-2">
                              <div className="flex-shrink-0 text-lg">
                                {getTypeIcon(formData.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-gray-900 text-sm truncate">
                                  {formData.title || 'Notification Title'}
                                </h5>
                                <p className="text-gray-600 text-xs truncate">
                                  {formData.message || 'Notification message will appear here...'}
                                </p>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handlePreview}
                            disabled={!formData.title || !formData.message}
                            className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            View Full Preview
                          </button>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 text-yellow-600 text-lg">💡</div>
                            <div>
                              <h5 className="font-medium text-yellow-800 text-sm">Tips for Effective Notifications</h5>
                              <ul className="text-yellow-700 text-xs mt-2 space-y-1">
                                <li>• Keep titles short and descriptive</li>
                                <li>• Use clear, actionable language</li>
                                <li>• Add images to increase engagement</li>
                                <li>• Set expiration for time-sensitive offers</li>
                                <li>• Choose appropriate notification type</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading || !formData.title || !formData.message}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 font-medium shadow-lg transition-all duration-200"
                      >
                        {loading ? 'Sending...' : 'Send to All Users'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsManagement;