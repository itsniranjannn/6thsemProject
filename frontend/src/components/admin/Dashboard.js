import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    todayOrders: 0,
    pendingPayments: 0,
    lowStockProducts: 0,
    paymentAnalytics: {
      paymentMethodStats: [],
      orderStatusStats: []
    }
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [newUsers, setNewUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('today');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      // Fetch stats
      const statsResponse = await fetch(`${API_BASE}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }

      // Fetch recent orders
      const ordersResponse = await fetch(`${API_BASE}/api/admin/orders?limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setRecentOrders((ordersData.orders || []).slice(0, 5));
      }

      // Fetch new users
      const usersResponse = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setNewUsers((usersData.users || []).slice(0, 4));
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
      'cancelled': 'bg-red-100 text-red-800 border-red-200',
      'paid': 'bg-green-100 text-green-800 border-green-200',
      'failed': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPaymentMethodColor = (method) => {
    const colors = {
      'COD': 'bg-orange-100 text-orange-800 border-orange-200',
      'Khalti': 'bg-purple-100 text-purple-800 border-purple-200',
      'eSewa': 'bg-blue-100 text-blue-800 border-blue-200',
      'Stripe': 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[method] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPaymentMethodIcon = (method) => {
    // Using actual images from public folder
    const methodLower = method?.toLowerCase() || '';
    
    if (methodLower.includes('stripe')) {
      return <img src="/images/stripe.png" alt="Stripe" className="w-6 h-6 lg:w-8 lg:h-8 object-contain" />;
    } else if (methodLower.includes('khalti')) {
      return <img src="/images/khalti.png" alt="Khalti" className="w-6 h-6 lg:w-8 lg:h-8 object-contain" />;
    } else if (methodLower.includes('esewa')) {
      return <img src="/images/esewa.png" alt="eSewa" className="w-6 h-6 lg:w-8 lg:h-8 object-contain" />;
    } else if (methodLower.includes('cod')) {
      return <img src="/images/cod.png" alt="COD" className="w-6 h-6 lg:w-8 lg:h-8 object-contain" />;
    } else {
      return <span className="text-lg lg:text-xl">💳</span>;
    }
  };

  // Calculate additional statistics
  const totalRevenue = stats.totalRevenue || 0;
  const revenueGrowth = 12.5; // This would come from your backend in a real app
  const orderGrowth = 8.2;
  const userGrowth = 15.7;
  const conversionRate = 3.2;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-6 lg:h-8 bg-gray-200 rounded w-1/4 mb-4 lg:mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 lg:h-24 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard Overview</h2>
            <p className="text-gray-600 mt-1 text-sm lg:text-base">Welcome to your admin dashboard</p>
          </div>
          <div className="flex items-center space-x-2 lg:space-x-4 mt-4 lg:mt-0">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 lg:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base bg-white"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <button
              onClick={fetchDashboardData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 lg:px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors text-sm lg:text-base"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl lg:rounded-2xl p-4 lg:p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs lg:text-sm font-medium">Total Revenue</p>
                <p className="text-xl lg:text-2xl font-bold mt-1">{formatNPR(totalRevenue)}</p>
                <div className="flex items-center mt-1 lg:mt-2">
                  <span className="text-blue-100 text-xs">↑ {revenueGrowth}% this month</span>
                </div>
              </div>
              <div className="w-10 h-10 lg:w-14 lg:h-14 bg-white bg-opacity-20 rounded-lg lg:rounded-xl flex items-center justify-center">
                <span className="text-lg lg:text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl lg:rounded-2xl p-4 lg:p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs lg:text-sm font-medium">Total Orders</p>
                <p className="text-xl lg:text-2xl font-bold mt-1">{stats.totalOrders}</p>
                <div className="flex items-center mt-1 lg:mt-2">
                  <span className="text-green-100 text-xs">↑ {orderGrowth}% growth</span>
                </div>
              </div>
              <div className="w-10 h-10 lg:w-14 lg:h-14 bg-white bg-opacity-20 rounded-lg lg:rounded-xl flex items-center justify-center">
                <span className="text-lg lg:text-2xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl lg:rounded-2xl p-4 lg:p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs lg:text-sm font-medium">Total Users</p>
                <p className="text-xl lg:text-2xl font-bold mt-1">{stats.totalUsers}</p>
                <div className="flex items-center mt-1 lg:mt-2">
                  <span className="text-purple-100 text-xs">↑ {userGrowth}% this month</span>
                </div>
              </div>
              <div className="w-10 h-10 lg:w-14 lg:h-14 bg-white bg-opacity-20 rounded-lg lg:rounded-xl flex items-center justify-center">
                <span className="text-lg lg:text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl lg:rounded-2xl p-4 lg:p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-xs lg:text-sm font-medium">Products</p>
                <p className="text-xl lg:text-2xl font-bold mt-1">{stats.totalProducts}</p>
                <div className="flex items-center mt-1 lg:mt-2">
                  <span className="text-orange-100 text-xs">{stats.lowStockProducts} low stock</span>
                </div>
              </div>
              <div className="w-10 h-10 lg:w-14 lg:h-14 bg-white bg-opacity-20 rounded-lg lg:rounded-xl flex items-center justify-center">
                <span className="text-lg lg:text-2xl">🛍️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 mb-6 lg:mb-8">
          {/* Payment Methods */}
          <div className="bg-white rounded-xl lg:rounded-2xl shadow border border-gray-200 p-4 lg:p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900">Payment Methods Analytics</h3>
              <span className="text-xs lg:text-sm text-gray-500">Revenue distribution</span>
            </div>
            <div className="space-y-3 lg:space-y-4">
              {stats.paymentAnalytics?.paymentMethodStats?.slice(0, 4).map((payment, index) => {
                const percentage = stats.totalRevenue > 0 ? ((payment.total_amount / stats.totalRevenue) * 100) : 0;
                return (
                  <div key={index} className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-lg lg:rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3 lg:space-x-4 flex-1">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        {getPaymentMethodIcon(payment.payment_method)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm lg:text-base">{payment.payment_method}</p>
                        <p className="text-xs lg:text-sm text-gray-500">{payment.count} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-sm lg:text-lg">{formatNPR(payment.total_amount)}</p>
                      <div className="flex items-center justify-end space-x-2">
                        <div className="w-16 lg:w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs lg:text-sm text-green-600 font-medium">
                          {percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {(!stats.paymentAnalytics?.paymentMethodStats || stats.paymentAnalytics.paymentMethodStats.length === 0) && (
                <div className="text-center py-4 lg:py-8">
                  <div className="text-gray-400 mb-2 lg:mb-3">
                    <svg className="w-8 h-8 lg:w-12 lg:h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm lg:text-base">No payment data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl lg:rounded-2xl shadow border border-gray-200 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900">Quick Stats</h3>
              <span className="text-xs lg:text-sm text-gray-500">Today</span>
            </div>
            <div className="space-y-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl lg:text-3xl font-bold text-blue-600">{stats.todayOrders}</p>
                <p className="text-sm text-blue-800">Orders Today</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl lg:text-3xl font-bold text-green-600">{conversionRate}%</p>
                <p className="text-sm text-green-800">Conversion Rate</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl lg:text-3xl font-bold text-orange-600">{stats.lowStockProducts}</p>
                <p className="text-sm text-orange-800">Low Stock Items</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Status & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 mb-6 lg:mb-8">
          {/* Order Status */}
          <div className="bg-white rounded-xl lg:rounded-2xl shadow border border-gray-200 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900">Order Status Distribution</h3>
              <span className="text-xs lg:text-sm text-gray-500">All orders</span>
            </div>
            <div className="space-y-3 lg:space-y-4">
              {stats.paymentAnalytics?.orderStatusStats?.slice(0, 5).map((status, index) => {
                const percentage = stats.totalOrders > 0 ? ((status.count / stats.totalOrders) * 100) : 0;
                return (
                  <div key={index} className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-lg lg:rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3 lg:space-x-4">
                      <span className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status.status)}`}>
                        {status.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-sm lg:text-lg">{status.count}</p>
                      <p className="text-xs lg:text-sm text-gray-500">{percentage.toFixed(1)}% of total</p>
                    </div>
                  </div>
                );
              })}
              {(!stats.paymentAnalytics?.orderStatusStats || stats.paymentAnalytics.orderStatusStats.length === 0) && (
                <div className="text-center py-4 lg:py-8">
                  <div className="text-gray-400 mb-2 lg:mb-3">
                    <svg className="w-8 h-8 lg:w-12 lg:h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm lg:text-base">No order status data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl lg:rounded-2xl shadow border border-gray-200">
            <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900">Recent Orders</h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                Last 5 orders
              </span>
            </div>
            <div className="p-4 lg:p-6">
              {recentOrders.length > 0 ? (
                <div className="space-y-3 lg:space-y-4">
                  {recentOrders.slice(0, 5).map(order => (
                    <div key={order.id} className="flex items-center justify-between p-3 lg:p-4 border border-gray-100 rounded-lg lg:rounded-xl hover:bg-gray-50 transition-all duration-200">
                      <div className="flex items-center space-x-3 lg:space-x-4">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg lg:rounded-xl flex items-center justify-center shadow-sm">
                          <span className="text-white font-bold text-xs lg:text-sm">#{order.id}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 text-sm lg:text-base truncate">{order.user_name || 'Customer'}</p>
                          <p className="text-xs lg:text-sm text-gray-500 truncate">{order.user_email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full border ${getPaymentMethodColor(order.payment_method)}`}>
                              {order.payment_method}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(order.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 text-sm lg:text-base">{formatNPR(order.total_amount)}</p>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 lg:py-8">
                  <div className="text-gray-400 mb-2 lg:mb-3">
                    <svg className="w-8 h-8 lg:w-12 lg:h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm lg:text-base">No recent orders found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* New Users */}
        <div className="bg-white rounded-xl lg:rounded-2xl shadow border border-gray-200">
          <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900">New Users</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              Last 4 users
            </span>
          </div>
          <div className="p-4 lg:p-6">
            {newUsers.length > 0 ? (
              <div className="space-y-3 lg:space-y-4">
                {newUsers.slice(0, 4).map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 lg:p-4 border border-gray-100 rounded-lg lg:rounded-xl hover:bg-gray-50 transition-all duration-200">
                    <div className="flex items-center space-x-3 lg:space-x-4">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-white font-semibold text-sm">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 text-sm lg:text-base truncate">{user.name}</p>
                        <p className="text-xs lg:text-sm text-gray-500 truncate">{user.email}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Joined {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                        {user.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 lg:py-8">
                <div className="text-gray-400 mb-2 lg:mb-3">
                  <svg className="w-8 h-8 lg:w-12 lg:h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm lg:text-base">No new users found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;