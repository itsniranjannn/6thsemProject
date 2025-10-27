import React, { useState, useEffect } from 'react';
import Toast from '../Toast.js';

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchOrders();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE}/api/admin/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        console.error('Failed to fetch orders');
        showToast('Failed to fetch orders', 'error');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToast('Error fetching orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus, statusType = 'order') => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      console.log(`Updating ${statusType} status for order ${orderId} to ${newStatus}`);
      
      const response = await fetch(`${API_BASE}/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: newStatus,
          statusType: statusType
        })
      });

      const result = await response.json();
      console.log('Update response:', result);

      if (response.ok && result.success) {
        // Show appropriate success message based on status changes
        let successMessage = `${statusType === 'payment' ? 'Payment' : 'Order'} status updated successfully!`;
        
        // Add synchronization details to the message
        if (statusType === 'payment') {
          if (newStatus === 'completed') {
            successMessage = 'Payment marked as completed and order confirmed!';
          } else if (newStatus === 'failed') {
            successMessage = 'Payment marked as failed and order set to pending!';
          } else if (newStatus === 'refunded') {
            successMessage = 'Payment refunded and order cancelled!';
          } else if (newStatus === 'pending') {
            successMessage = 'Payment status set to pending!';
          }
        }
        
        showToast(successMessage);
        
        // Update local state with the returned order data
        if (result.order) {
          setOrders(prevOrders => 
            prevOrders.map(order => 
              order.id === orderId ? result.order : order
            )
          );
        } else {
          // Fallback: refresh orders
          setTimeout(() => {
            fetchOrders();
          }, 500);
        }
      } else {
        showToast(result.message || `Error updating ${statusType} status`, 'error');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showToast(`Error updating ${statusType} status`, 'error');
    }
  };

  const formatNPR = (amount) => {
    return `Rs. ${parseFloat(amount || 0).toLocaleString('en-NP')}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'confirmed': 'bg-blue-100 text-blue-800 border-blue-200',
      'shipped': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'delivered': 'bg-green-100 text-green-800 border-green-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'completed': 'bg-green-100 text-green-800 border-green-200',
      'failed': 'bg-red-100 text-red-800 border-red-200',
      'refunded': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPaymentMethodColor = (method) => {
    const colors = {
      'COD': 'bg-orange-100 text-orange-800 border-orange-200',
      'Khalti': 'bg-purple-100 text-purple-800 border-purple-200',
      'eSewa': 'bg-blue-100 text-blue-800 border-blue-200',
      'Stripe': 'bg-green-100 text-green-800 border-green-200',
      'cod': 'bg-orange-100 text-orange-800 border-orange-200',
      'khalti': 'bg-purple-100 text-purple-800 border-purple-200',
      'esewa': 'bg-blue-100 text-blue-800 border-blue-200',
      'stripe': 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[method] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const orderStatuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const paymentStatuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' }
  ];

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.payment_status === paymentFilter;
    return matchesStatus && matchesPayment;
  });

  // Calculate statistics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const completedOrders = orders.filter(order => 
    order.payment_status === 'completed'
  ).length;
  
  const totalRevenue = orders
    .filter(order => order.payment_status === 'completed')
    .reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);

  // Get status synchronization info for tooltips
  const getPaymentStatusInfo = (status) => {
    const info = {
      'completed': 'Auto-confirms order',
      'failed': 'Auto-sets order to pending',
      'refunded': 'Auto-cancels order',
      'pending': 'Keeps order pending'
    };
    return info[status] || '';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Toast Notification */}
        {toast.show && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast({ show: false, message: '', type: 'success' })} 
          />
        )}

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Order Management</h2>
            <p className="text-gray-600 mt-1 text-sm lg:text-base">
              Track and manage customer orders • Payment status changes auto-update order status
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg lg:rounded-xl font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200 mt-4 lg:mt-0 text-sm lg:text-base"
          >
            <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh Orders</span>
          </button>
        </div>

        {/* Status Synchronization Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 text-blue-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-800">Automatic Status Synchronization</h4>
              <p className="text-sm text-blue-700 mt-1">
                Payment status changes automatically update order status: 
                <span className="font-semibold"> Completed → Confirmed</span>, 
                <span className="font-semibold"> Failed → Pending</span>, 
                <span className="font-semibold"> Refunded → Cancelled</span>, 
                <span className="font-semibold"> Pending → Pending</span>
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
          <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs lg:text-sm font-medium">Total Orders</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900 mt-1">{totalOrders}</p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg lg:rounded-xl flex items-center justify-center">
                <span className="text-blue-600 text-lg lg:text-xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs lg:text-sm font-medium">Pending Orders</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900 mt-1">{pendingOrders}</p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-yellow-100 rounded-lg lg:rounded-xl flex items-center justify-center">
                <span className="text-yellow-600 text-lg lg:text-xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs lg:text-sm font-medium">Completed Payments</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900 mt-1">{completedOrders}</p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg lg:rounded-xl flex items-center justify-center">
                <span className="text-green-600 text-lg lg:text-xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs lg:text-sm font-medium">Total Revenue</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900 mt-1">{formatNPR(totalRevenue)}</p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-lg lg:rounded-xl flex items-center justify-center">
                <span className="text-purple-600 text-lg lg:text-xl">💳</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl lg:rounded-2xl shadow border border-gray-100 p-4 lg:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="all">All Statuses</option>
                {orderStatuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="all">All Payments</option>
                {paymentStatuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setPaymentFilter('all');
                }}
                className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 text-gray-700 rounded-lg lg:rounded-xl hover:bg-gray-50 font-medium transition-colors text-sm lg:text-base"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 lg:py-12">
            <div className="animate-spin rounded-full h-8 w-8 lg:h-12 lg:w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2 lg:mt-4 text-sm lg:text-base">Loading orders...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl lg:rounded-2xl shadow border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order & Customer</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment Details</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order Status</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment Status</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-start space-x-3 lg:space-x-4">
                          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg lg:rounded-xl flex items-center justify-center shadow-sm">
                            <span className="text-white font-bold text-xs lg:text-sm">#{order.id}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {order.user_name || 'Customer'}
                              </p>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {order.items?.length || 0} items
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 truncate">{order.user_email}</p>
                            <p className="text-xs lg:text-sm text-gray-400 mt-1">
                              {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                            </p>
                            <p className="text-base lg:text-lg font-bold text-gray-900 mt-2">
                              {formatNPR(order.total_amount)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 lg:px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium border ${getPaymentMethodColor(order.payment_method)}`}>
                              {order.payment_method?.toUpperCase() || 'N/A'}
                            </span>
                          </div>
                          {order.promo_code && (
                            <div className="text-sm text-gray-600">
                              Promo: <span className="font-mono text-purple-600">{order.promo_code}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-4 lg:px-6 py-4">
                        <select
                          value={order.status || 'pending'}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value, 'order')}
                          className={`w-full px-2 lg:px-3 py-1 lg:py-2 rounded-lg text-sm font-semibold border-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${getStatusColor(order.status)}`}
                        >
                          {orderStatuses.map(status => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1 lg:mt-2">
                          Updated: {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </td>

                      <td className="px-4 lg:px-6 py-4">
                        {(order.payment_status === 'completed') ? (
                          <div className="text-center">
                            <span className={`inline-flex items-center px-2 lg:px-3 py-1 lg:py-2 rounded-full text-xs lg:text-sm font-semibold border ${getPaymentStatusColor(order.payment_status)}`}>
                              ✅ Completed
                            </span>
                            <p className="text-xs text-gray-500 mt-1">Order auto-confirmed</p>
                          </div>
                        ) : (
                          <div className="relative group">
                            <select
                              value={order.payment_status || 'pending'}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value, 'payment')}
                              className={`w-full px-2 lg:px-3 py-1 lg:py-2 rounded-lg text-sm font-semibold border-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${getPaymentStatusColor(order.payment_status)}`}
                            >
                              {paymentStatuses.map(status => (
                                <option key={status.value} value={status.value}>
                                  {status.label}
                                </option>
                              ))}
                            </select>
                            {getPaymentStatusInfo(order.payment_status) && (
                              <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                                {getPaymentStatusInfo(order.payment_status)}
                                <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-800"></div>
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 lg:px-4 py-1 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors flex items-center space-x-1 lg:space-x-2 justify-center"
                          >
                            <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>Details</span>
                          </button>
                          {order.status !== 'cancelled' && order.status !== 'delivered' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'cancelled', 'order')}
                              className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-2 lg:px-4 py-1 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors flex items-center space-x-1 lg:space-x-2 justify-center"
                            >
                              <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              <span>Cancel</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-8 lg:py-16">
                <div className="text-gray-400 mb-3 lg:mb-4">
                  <svg className="w-16 h-16 lg:w-20 lg:h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg font-semibold">No orders found</p>
                <p className="text-gray-400 mt-1 lg:mt-2 text-sm lg:text-base">Try adjusting your filters or check back later</p>
              </div>
            )}
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl lg:rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-4 lg:p-8">
                <div className="flex justify-between items-center mb-4 lg:mb-6">
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
                    Order Details #{selectedOrder.id}
                  </h3>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
                  {/* Customer Information */}
                  <div className="space-y-4 lg:space-y-6">
                    <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 lg:mb-4">Customer Information</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Name</p>
                          <p className="text-base lg:text-lg font-semibold text-gray-900">{selectedOrder.user_name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Email</p>
                          <p className="text-base lg:text-lg text-gray-900">{selectedOrder.user_email || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Order Date</p>
                          <p className="text-base lg:text-lg text-gray-900">
                            {new Date(selectedOrder.created_at).toLocaleDateString()} at {' '}
                            {new Date(selectedOrder.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 lg:mb-4">Order Summary</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-semibold">{formatNPR(selectedOrder.total_amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Method</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPaymentMethodColor(selectedOrder.payment_method)}`}>
                            {selectedOrder.payment_method?.toUpperCase() || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Status</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                            {selectedOrder.payment_status || 'pending'}
                          </span>
                        </div>
                        {selectedOrder.promo_code && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Promo Code</span>
                            <span className="font-mono text-purple-600">{selectedOrder.promo_code}</span>
                          </div>
                        )}
                        <div className="border-t pt-3 mt-3">
                          <div className="flex justify-between text-base lg:text-lg font-bold">
                            <span>Total</span>
                            <span className="text-blue-600">{formatNPR(selectedOrder.total_amount)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-4 lg:space-y-6">
                    <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 lg:mb-4">Order Items</h4>
                      <div className="space-y-3 lg:space-y-4">
                        {selectedOrder.items && selectedOrder.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 lg:p-4 bg-white rounded-lg border border-gray-200">
                            <div className="flex items-center space-x-3 lg:space-x-4">
                              <img 
                                src={item.image_url || '/api/placeholder/60/60'} 
                                alt={item.name}
                                className="h-12 w-12 lg:h-16 lg:w-16 rounded-lg object-cover border border-gray-200"
                              />
                              <div>
                                <p className="font-medium text-gray-900 text-sm lg:text-base">{item.name}</p>
                                <p className="text-xs lg:text-sm text-gray-500">Qty: {item.quantity}</p>
                                <p className="text-xs lg:text-sm text-gray-500">Price: {formatNPR(item.price)}</p>
                              </div>
                            </div>
                            <p className="font-semibold text-gray-900 text-sm lg:text-base">
                              {formatNPR(item.price * item.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Status Timeline */}
                    <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 lg:mb-4">Order Status</h4>
                      <div className="space-y-3 lg:space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Current Status</span>
                          <span className={`px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium border ${getStatusColor(selectedOrder.status)}`}>
                            {selectedOrder.status || 'pending'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Payment Status</span>
                          <span className={`px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium border ${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                            {selectedOrder.payment_status || 'pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 lg:space-x-4 pt-4 lg:pt-6 mt-4 lg:mt-6 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 lg:px-6 py-2 lg:py-3 border border-gray-300 rounded-lg lg:rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors text-sm lg:text-base"
                  >
                    Close
                  </button>
                  {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                    <button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, 'cancelled', 'order');
                        setSelectedOrder(null);
                      }}
                      className="px-4 lg:px-6 py-2 lg:py-3 bg-red-600 text-white rounded-lg lg:rounded-xl hover:bg-red-700 font-medium transition-colors text-sm lg:text-base"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersManagement;