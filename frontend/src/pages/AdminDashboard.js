import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingPromo, setEditingPromo] = useState(null);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    todayOrders: 0,
    lowStockProducts: 0,
    pendingPayments: 0,
    activePromoCodes: 0,
    monthlyGrowth: 0
  });

  // Enhanced product form with multiple images and tags
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock_quantity: '',
    image_urls: ['', '', '', ''],
    tags: [],
    is_featured: false,
    is_new: false,
    discount_percentage: 0,
    offer_valid_until: ''
  });

  // Promo code form
  const [promoForm, setPromoForm] = useState({
    code: '',
    description: '',
    discount_type: 'percentage', // percentage or fixed
    discount_value: '',
    min_order_amount: '',
    max_uses: '',
    valid_from: '',
    valid_until: '',
    is_active: true
  });

  // Enhanced categories with icons
  const categories = [
    { name: 'Electronics', icon: '📱', color: 'blue' },
    { name: 'Clothing', icon: '👕', color: 'purple' },
    { name: 'Footwear', icon: '👟', color: 'green' },
    { name: 'Home & Kitchen', icon: '🏠', color: 'orange' },
    { name: 'Beauty & Personal Care', icon: '💄', color: 'pink' },
    { name: 'Sports & Outdoors', icon: '⚽', color: 'red' },
    { name: 'Books & Stationery', icon: '📚', color: 'indigo' },
    { name: 'Mobile Phones', icon: '📱', color: 'blue' },
    { name: 'Laptops & Computers', icon: '💻', color: 'gray' },
    { name: 'Accessories', icon: '🎧', color: 'yellow' }
  ];

  // Order status options with colors
  const orderStatuses = [
    { value: 'payment_required', label: 'Payment Required', color: 'red', icon: '💳' },
    { value: 'payment_pending', label: 'Payment Pending', color: 'orange', icon: '⏳' },
    { value: 'payment_done', label: 'Payment Done', color: 'yellow', icon: '✅' },
    { value: 'processing', label: 'Processing', color: 'blue', icon: '⚙️' },
    { value: 'shipped', label: 'Shipped', color: 'indigo', icon: '🚚' },
    { value: 'delivered', label: 'Delivered', color: 'green', icon: '📦' },
    { value: 'cancelled', label: 'Cancelled', color: 'gray', icon: '❌' }
  ];

  // Animation states
  const [animateStats, setAnimateStats] = useState(false);
  const [animateCards, setAnimateCards] = useState(false);

  // Fetch real data from API
  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData();
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchDashboardData, 30000);
      return () => clearInterval(interval);
    }
  }, [isAdmin, activeTab]);

  const fetchDashboardData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      // Fetch products
      if (activeTab === 'products' || activeTab === 'overview') {
        const productsResponse = await fetch('http://localhost:5000/api/products', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setProducts(Array.isArray(productsData) ? productsData : []);
        }
      }

      // Fetch users
      if (activeTab === 'users' || activeTab === 'overview') {
        const usersResponse = await fetch('http://localhost:5000/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(Array.isArray(usersData) ? usersData : []);
        } else {
          // Fallback
          const allUsersResponse = await fetch('http://localhost:5000/api/users', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (allUsersResponse.ok) {
            const allUsersData = await allUsersResponse.json();
            setUsers(Array.isArray(allUsersData) ? allUsersData : []);
          }
        }
      }

      // Fetch orders
      if (activeTab === 'orders' || activeTab === 'overview') {
        const ordersResponse = await fetch('http://localhost:5000/api/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (ordersResponse.ok) {
          let ordersData = await ordersResponse.json();
          ordersData = Array.isArray(ordersData) ? ordersData : [];
          
          // Auto-update order statuses based on time
          const updatedOrders = ordersData.map(order => autoUpdateOrderStatus(order));
          setOrders(updatedOrders);
        }
      }

      // Fetch promo codes for promo tab
      if (activeTab === 'promocodes' || activeTab === 'overview') {
        const promoResponse = await fetch('http://localhost:5000/api/promo', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (promoResponse.ok) {
          const promoData = await promoResponse.json();
          setPromoCodes(Array.isArray(promoData) ? promoData : []);
        }
      }

      // Calculate stats
      calculateStats();

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-update order status based on time
  const autoUpdateOrderStatus = (order) => {
    const orderDate = new Date(order.created_at);
    const now = new Date();
    const daysSinceOrder = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));

    let newStatus = order.status;

    if (order.status === 'payment_done' && daysSinceOrder >= 1) {
      newStatus = 'processing';
    } else if (order.status === 'processing' && daysSinceOrder >= 2) {
      newStatus = 'shipped';
    } else if (order.status === 'shipped' && daysSinceOrder >= 3) {
      newStatus = 'delivered';
    }

    // Update in database if status changed
    if (newStatus !== order.status) {
      updateOrderStatus(order.id, newStatus);
    }

    return { ...order, status: newStatus };
  };

  const updateOrderStatus = async (orderId, status) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const calculateStats = () => {
    const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const totalUsers = users.length;
    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at).toDateString();
      const today = new Date().toDateString();
      return orderDate === today;
    }).length;
    const lowStockProducts = products.filter(product => product.stock_quantity < 10).length;
    const pendingPayments = orders.filter(order => 
      order.status === 'payment_required' || order.status === 'payment_pending'
    ).length;

    setStats({
      totalRevenue,
      totalOrders,
      totalProducts,
      totalUsers,
      todayOrders,
      lowStockProducts,
      pendingPayments
    });
  };

  // Product Management Functions
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const productData = {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        category: productForm.category,
        stock_quantity: parseInt(productForm.stock_quantity),
        image_urls: productForm.image_urls.filter(url => url.trim() !== ''),
        is_featured: productForm.is_featured,
        is_new: productForm.is_new
      };

      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        setShowProductModal(false);
        resetProductForm();
        fetchDashboardData();
        alert('Product added successfully!');
      } else {
        const error = await response.json();
        alert('Error adding product: ' + error.message);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product');
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const productData = {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        category: productForm.category,
        stock_quantity: parseInt(productForm.stock_quantity),
        image_urls: productForm.image_urls.filter(url => url.trim() !== ''),
        is_featured: productForm.is_featured,
        is_new: productForm.is_new
      };

      const response = await fetch(`http://localhost:5000/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        setShowProductModal(false);
        setEditingProduct(null);
        resetProductForm();
        fetchDashboardData();
        alert('Product updated successfully!');
      } else {
        const error = await response.json();
        alert('Error updating product: ' + error.message);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchDashboardData();
        alert('Product deleted successfully!');
      } else {
        const error = await response.json();
        alert('Error deleting product: ' + error.message);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchDashboardData();
        alert('User deleted successfully!');
      } else {
        alert('User deletion endpoint not implemented yet');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchDashboardData();
        alert('Order status updated successfully!');
      } else {
        const error = await response.json();
        alert('Error updating order status: ' + error.message);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status');
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      category: '',
      stock_quantity: '',
      image_urls: ['', '', ''],
      image_files: [null, null, null],
      is_featured: false,
      is_new: false
    });
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stock_quantity: product.stock_quantity.toString(),
      image_urls: product.image_urls || [product.image_url || '', '', ''],
      image_files: [null, null, null],
      is_featured: product.is_featured || false,
      is_new: product.is_new || false
    });
    setShowProductModal(true);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    resetProductForm();
    setShowProductModal(true);
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  // Format currency in Nepali Rupees
  const formatNPR = (amount) => {
    return `Rs. ${parseFloat(amount || 0).toLocaleString('en-NP')}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      payment_required: 'bg-red-100 text-red-800',
      payment_pending: 'bg-orange-100 text-orange-800',
      payment_done: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="card p-8 text-center max-w-md transform hover:scale-105 transition-transform duration-300">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-4">Access Denied</h2>
          <p className="text-gray-600 text-lg">You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊', color: 'blue' },
    { id: 'products', name: 'Products', icon: '🛍️', color: 'purple' },
    { id: 'orders', name: 'Orders', icon: '📦', color: 'green' },
    { id: 'users', name: 'Users', icon: '👥', color: 'orange' },
    { id: 'promocodes', name: 'Promo Codes', icon: '🎫', color: 'pink' },
    { id: 'analytics', name: 'Analytics', icon: '📈', color: 'indigo' }
  ];

  // Add missing functions
  const openEditPromoModal = (promo) => {
    console.log('Edit promo:', promo);
    // TODO: Implement edit promo modal
  };

  const openAddPromoModal = () => {
    console.log('Add promo modal');
    // TODO: Implement add promo modal
  };

  const handleDeletePromoCode = (promoId) => {
    console.log('Delete promo:', promoId);
    // TODO: Implement delete promo
  };

  // Load data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Professional Header */}
      <div className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Status Indicator */}
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-md text-sm font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>System Online</span>
              </div>
              
              {/* Refresh Button */}
              <button 
                onClick={fetchDashboardData}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
              
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Professional Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Revenue Card */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNPR(stats.totalRevenue)}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">{stats.todayOrders} orders today</span>
              <span className="text-sm font-medium text-green-600">+{stats.monthlyGrowth}%</span>
            </div>
          </div>

          {/* Orders Card */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">{stats.pendingPayments} pending</span>
              <span className="text-sm font-medium text-yellow-600">Processing</span>
            </div>
          </div>

          {/* Products Card */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">{stats.lowStockProducts} low stock</span>
              <span className="text-sm font-medium text-red-600">Alert</span>
            </div>
          </div>

          {/* Users Card */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">{users.filter(u => u.role === 'admin').length} admins</span>
              <span className="text-sm font-medium text-blue-600">Active</span>
            </div>
          </div>
        </div>

        {/* Professional Main Content */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          {/* Professional Tabs Navigation */}
          <div className="bg-gray-50 border-b border-gray-200">
            <nav className="flex space-x-1 p-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? (tab.color === 'blue' ? 'bg-blue-600 text-white shadow-sm' :
                         tab.color === 'purple' ? 'bg-purple-600 text-white shadow-sm' :
                         tab.color === 'green' ? 'bg-green-600 text-white shadow-sm' :
                         tab.color === 'orange' ? 'bg-orange-600 text-white shadow-sm' :
                         tab.color === 'pink' ? 'bg-pink-600 text-white shadow-sm' :
                         'bg-indigo-600 text-white shadow-sm')
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content with Enhanced Animations */}
          <div className="p-8">
            {loading ? (
              <div className="text-center py-16">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
                </div>
                <p className="text-gray-600 mt-6 text-lg font-medium">Loading dashboard data...</p>
                <div className="mt-4 flex justify-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            ) : (
              <div className={`${animateCards ? 'animate-fade-in-up' : ''}`}>
                {activeTab === 'overview' && <EnhancedOverviewTab products={products} orders={orders} users={users} formatNPR={formatNPR} getStatusColor={getStatusColor} />}
                {activeTab === 'products' && <EnhancedProductsTab products={products} onEdit={openEditModal} onDelete={handleDeleteProduct} onAdd={openAddModal} formatNPR={formatNPR} categories={categories} />}
                {activeTab === 'orders' && <EnhancedOrdersTab orders={orders} users={users} formatNPR={formatNPR} getStatusColor={getStatusColor} onViewDetails={openOrderDetails} onUpdateStatus={handleUpdateOrderStatus} orderStatuses={orderStatuses} />}
                {activeTab === 'users' && <EnhancedUsersTab users={users} onDelete={handleDeleteUser} />}
                {activeTab === 'promocodes' && <EnhancedPromoCodesTab promoCodes={promoCodes} onEdit={openEditPromoModal} onDelete={handleDeletePromoCode} onAdd={openAddPromoModal} />}
                {activeTab === 'analytics' && <EnhancedAnalyticsTab stats={stats} orders={orders} formatNPR={formatNPR} />}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <ProductModal
          product={editingProduct}
          form={productForm}
          setForm={setProductForm}
          categories={categories}
          onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
          onClose={() => {
            setShowProductModal(false);
            setEditingProduct(null);
            resetProductForm();
          }}
        />
      )}

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <OrderModal
          order={selectedOrder}
          users={users}
          formatNPR={formatNPR}
          getStatusColor={getStatusColor}
          onClose={() => {
            setShowOrderModal(false);
            setSelectedOrder(null);
          }}
          onUpdateStatus={handleUpdateOrderStatus}
          orderStatuses={orderStatuses}
        />
      )}

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        
        .card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

// Enhanced Overview Tab Component
const EnhancedOverviewTab = ({ products, orders, users, formatNPR, getStatusColor }) => {
  const recentOrders = orders.slice(0, 5);
  const lowStockProducts = products.filter(p => p.stock_quantity < 10);
  const recentUsers = users.slice(0, 8);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-semibold">Today's Revenue</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatNPR(orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).reduce((sum, o) => sum + parseFloat(o.total_amount), 0))}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-semibold">Active Users</p>
              <p className="text-2xl font-bold text-green-900">{users.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-semibold">Total Products</p>
              <p className="text-2xl font-bold text-purple-900">{products.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">🛍️</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enhanced Recent Orders */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
            <h3 className="text-lg font-bold text-white flex items-center">
              <span className="text-xl mr-3">📦</span>
              Recent Orders
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {recentOrders.map((order, index) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">#{order.id}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{order.user_name || 'Customer'}</p>
                    <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatNPR(order.total_amount)}</p>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Low Stock Products */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-pink-600 p-4">
            <h3 className="text-lg font-bold text-white flex items-center">
              <span className="text-xl mr-3">⚠️</span>
              Low Stock Alert
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {lowStockProducts.slice(0, 5).map(product => (
              <div key={product.id} className="flex items-center justify-between p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors border border-red-200">
                <div className="flex items-center space-x-3">
                  <img className="w-12 h-12 rounded-xl object-cover border-2 border-red-300" src={product.image_urls?.[0] || product.image_url} alt={product.name} />
                  <div>
                    <p className="font-semibold text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-bold animate-pulse">
                    {product.stock_quantity} left
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Recent Users */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4">
          <h3 className="text-lg font-bold text-white flex items-center">
            <span className="text-xl mr-3">👥</span>
            Recent Users
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {recentUsers.map(user => (
              <div key={user.id} className="text-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-110 border border-gray-200">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <span className="text-white font-bold text-lg">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                <span className={`text-xs px-2 py-1 rounded-full mt-2 font-semibold ${
                  user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Products Tab Component
const ProductsTab = ({ products, onEdit, onDelete, onAdd, formatNPR }) => {
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Product Management</h3>
        <button 
          onClick={onAdd}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add New Product</span>
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img className="h-14 w-14 rounded-xl object-cover border border-gray-200" src={product.image_urls?.[0] || product.image_url} alt={product.name} />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">ID: {product.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {formatNPR(product.price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    product.stock_quantity > 20 ? 'bg-green-100 text-green-800' :
                    product.stock_quantity > 10 ? 'bg-blue-100 text-blue-800' :
                    product.stock_quantity > 0 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {product.stock_quantity} units
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-1">
                    {product.is_featured && (
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">Featured</span>
                    )}
                    {product.is_new && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">New</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button 
                    onClick={() => onEdit(product)}
                    className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => onDelete(product.id)}
                    className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Orders Tab Component
const OrdersTab = ({ orders, users, formatNPR, getStatusColor, onViewDetails, onUpdateStatus }) => {
  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  return (
    <div className="animate-fade-in">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Order Management</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{order.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.user_name || getUserName(order.user_id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {formatNPR(order.total_amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                  {order.payment_method || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button 
                    onClick={() => onViewDetails(order)}
                    className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-lg transition-colors"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Users Tab Component
const UsersTab = ({ users, onDelete }) => {
  return (
    <div className="animate-fade-in">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">User Management</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm font-medium">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {user.role !== 'admin' && (
                    <button 
                      onClick={() => onDelete(user.id)}
                      className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Analytics Tab Component
const AnalyticsTab = ({ stats, orders, formatNPR }) => {
  const monthlyRevenue = orders.reduce((acc, order) => {
    const month = new Date(order.created_at).toLocaleString('default', { month: 'long' });
    acc[month] = (acc[month] || 0) + parseFloat(order.total_amount);
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Monthly Revenue</h3>
          <div className="space-y-4">
            {Object.entries(monthlyRevenue).map(([month, revenue]) => (
              <div key={month} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{month}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1000" 
                      style={{ width: `${(revenue / Math.max(...Object.values(monthlyRevenue))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 min-w-20 text-right">
                    {formatNPR(revenue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Order Status</h3>
          <div className="space-y-4">
            {['payment_required', 'payment_pending', 'payment_done', 'processing', 'shipped', 'delivered'].map(status => {
              const count = orders.filter(order => order.status === status).length;
              const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{status.replace('_', ' ')}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-1000 ${
                          status === 'delivered' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                          status === 'shipped' ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
                          status === 'processing' ? 'bg-gradient-to-r from-yellow-500 to-orange-600' :
                          status.includes('payment') ? 'bg-gradient-to-r from-red-500 to-pink-600' :
                          'bg-gradient-to-r from-gray-500 to-gray-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 min-w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Product Modal Component
const ProductModal = ({ product, form, setForm, categories, onSubmit, onClose }) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleImageUrlChange = (index, value) => {
    const newImageUrls = [...form.image_urls];
    newImageUrls[index] = value;
    setForm(prev => ({ ...prev, image_urls: newImageUrls }));
  };

  const handleFileChange = (index, file) => {
    const newImageFiles = [...form.image_files];
    newImageFiles[index] = file;
    const newImageUrls = [...form.image_urls];
    if (file) {
      newImageUrls[index] = URL.createObjectURL(file);
    }
    setForm(prev => ({ 
      ...prev, 
      image_files: newImageFiles,
      image_urls: newImageUrls
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {product ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors transform hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter product name"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.name} value={category.name}>
                      {`${category.icon} ${category.name}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (NPR) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="0.00"
                />
              </div>

              {/* Stock Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  name="stock_quantity"
                  value={form.stock_quantity}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="0"
                />
              </div>

              {/* Featured & New Checkboxes */}
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={form.is_featured}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Featured Product</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="is_new"
                    checked={form.is_new}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">New Arrival</span>
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter product description"
              />
            </div>

            {/* Multiple Image URLs */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Product Images (3 required)
              </label>
              {[0, 1, 2].map(index => (
                <div key={index} className="flex space-x-4 items-start">
                  <div className="flex-1">
                    <input
                      type="url"
                      value={form.image_urls[index]}
                      onChange={(e) => handleImageUrlChange(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder={`Image URL ${index + 1}`}
                    />
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(index, e.target.files[0])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  {form.image_urls[index] && (
                    <img
                      src={form.image_urls[index]}
                      alt={`Preview ${index + 1}`}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors font-medium shadow-lg"
              >
                {product ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Order Modal Component
const OrderModal = ({ order, users, formatNPR, getStatusColor, onClose, onUpdateStatus, orderStatuses }) => {
  const getUser = (userId) => {
    return users.find(u => u.id === userId) || {};
  };

  const user = getUser(order.user_id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Order Details #{order.id}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors transform hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Order Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {user.name || 'N/A'}</p>
                  <p><strong>Email:</strong> {user.email || 'N/A'}</p>
                  <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Information</h3>
                <div className="space-y-2">
                  <p><strong>Total Amount:</strong> {formatNPR(order.total_amount)}</p>
                  <p><strong>Payment Method:</strong> {order.payment_method || 'N/A'}</p>
                  <p><strong>Order Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shipping_address && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Shipping Address</h3>
                <p className="text-gray-700">{order.shipping_address}</p>
              </div>
            )}

            {/* Status Update */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Update Order Status</h3>
              <div className="flex space-x-3">
                <select
                  value={order.status}
                  onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {orderStatuses.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <span className={`px-4 py-2 rounded-lg ${getStatusColor(order.status)}`}>
                  Current: {order.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Items</h3>
              <div className="space-y-3">
                {order.items && order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={item.image_url || '/placeholder-image.jpg'} 
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900">{formatNPR(item.price)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Promo Codes Tab Component
const EnhancedPromoCodesTab = ({ promoCodes, onEdit, onDelete, onAdd }) => {
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">🎫 Promo Code Management</h3>
          <p className="text-gray-600">Create and manage discount codes for your customers</p>
        </div>
        <button 
          onClick={onAdd}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Create Promo Code</span>
        </button>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4">
          <h4 className="text-lg font-bold text-white">Active Promo Codes</h4>
        </div>
        <div className="p-6">
          {promoCodes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promoCodes.map(promo => (
                <div key={promo.id} className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-lg font-bold text-lg">
                      {promo.code}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      promo.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {promo.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{promo.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Discount:</span>
                      <span className="font-semibold text-green-600">
                        {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `Rs. ${promo.discount_value}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Min Order:</span>
                      <span className="font-semibold">Rs. {promo.min_order_amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Max Uses:</span>
                      <span className="font-semibold">{promo.max_uses || 'Unlimited'}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => onEdit(promo)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors text-sm"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => onDelete(promo.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎫</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Promo Codes Yet</h3>
              <p className="text-gray-600 mb-6">Create your first promo code to start offering discounts</p>
              <button 
                onClick={onAdd}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                Create First Promo Code
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced Products Tab Component
const EnhancedProductsTab = ({ products, onEdit, onDelete, onAdd, formatNPR, categories }) => {
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">🛍️ Product Management</h3>
          <p className="text-gray-600">Manage your product catalog with advanced features</p>
        </div>
        <button 
          onClick={onAdd}
          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add New Product</span>
        </button>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4">
          <h4 className="text-lg font-bold text-white">Product Catalog</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img className="h-16 w-16 rounded-2xl object-cover border-2 border-gray-200 shadow-sm" src={product.image_urls?.[0] || product.image_url} alt={product.name} />
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">ID: {product.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {formatNPR(product.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.stock_quantity > 20 ? 'bg-green-100 text-green-800' :
                      product.stock_quantity > 10 ? 'bg-blue-100 text-blue-800' :
                      product.stock_quantity > 0 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {product.stock_quantity} units
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-1">
                      {product.is_featured && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">⭐ Featured</span>
                      )}
                      {product.is_new && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">🆕 New</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      onClick={() => onEdit(product)}
                      className="text-blue-600 hover:text-blue-900 bg-blue-50 px-4 py-2 rounded-lg transition-colors font-semibold"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => onDelete(product.id)}
                      className="text-red-600 hover:text-red-900 bg-red-50 px-4 py-2 rounded-lg transition-colors font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Enhanced Orders Tab Component
const EnhancedOrdersTab = ({ orders, users, formatNPR, getStatusColor, onViewDetails, onUpdateStatus, orderStatuses }) => {
  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">📦 Order Management</h3>
          <p className="text-gray-600">Track and manage customer orders efficiently</p>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4">
          <h4 className="text-lg font-bold text-white">Order History</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.user_name || getUserName(order.user_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {formatNPR(order.total_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {order.payment_method || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      onClick={() => onViewDetails(order)}
                      className="text-blue-600 hover:text-blue-900 bg-blue-50 px-4 py-2 rounded-lg transition-colors font-semibold"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Enhanced Users Tab Component
const EnhancedUsersTab = ({ users, onDelete }) => {
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">👥 User Management</h3>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4">
          <h4 className="text-lg font-bold text-white">User Accounts</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-sm font-bold">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {user.role !== 'admin' && (
                      <button 
                        onClick={() => onDelete(user.id)}
                        className="text-red-600 hover:text-red-900 bg-red-50 px-4 py-2 rounded-lg transition-colors font-semibold"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Enhanced Analytics Tab Component
const EnhancedAnalyticsTab = ({ stats, orders, formatNPR }) => {
  const monthlyRevenue = orders.reduce((acc, order) => {
    const month = new Date(order.created_at).toLocaleString('default', { month: 'long' });
    acc[month] = (acc[month] || 0) + parseFloat(order.total_amount);
    return acc;
  }, {});

  // Payment method breakdown
  const paymentMethods = orders.reduce((acc, order) => {
    const method = (order.payment_method || 'unknown').toLowerCase();
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {});

  // Payment status summary
  const paymentStatuses = orders.reduce((acc, order) => {
    const status = (order.payment_status || 'pending').toLowerCase();
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const codCount = orders.filter(o => (o.payment_method || '').toLowerCase() === 'cod').length;
  const withTracking = orders.filter(o => o.tracking_number).length;
  const withPromo = orders.filter(o => o.promo_code).length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sales Chart */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-2xl mr-3">📈</span>
            Monthly Revenue
          </h3>
          <div className="space-y-4">
            {Object.entries(monthlyRevenue).map(([month, revenue]) => (
              <div key={month} className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-600">{month}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1000" 
                      style={{ width: `${(revenue / Math.max(...Object.values(monthlyRevenue))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 min-w-20 text-right">
                    {formatNPR(revenue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-2xl mr-3">📊</span>
            Order Status Distribution
          </h3>
          <div className="space-y-4">
            {['payment_required', 'payment_pending', 'payment_done', 'processing', 'shipped', 'delivered'].map(status => {
              const count = orders.filter(order => order.status === status).length;
              const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-600 capitalize">{status.replace('_', ' ')}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-1000 ${
                          status === 'delivered' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                          status === 'shipped' ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
                          status === 'processing' ? 'bg-gradient-to-r from-yellow-500 to-orange-600' :
                          status.includes('payment') ? 'bg-gradient-to-r from-red-500 to-pink-600' :
                          'bg-gradient-to-r from-gray-500 to-gray-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-gray-900 min-w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Payments and Tracking Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-3">💳</span>
            Payment Methods
          </h3>
          <div className="space-y-3">
            {Object.entries(paymentMethods).map(([method, count]) => (
              <div key={method} className="flex items-center justify-between">
                <span className="capitalize text-sm text-gray-600">{method}</span>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-3">🧾</span>
            Payment Status
          </h3>
          <div className="space-y-3">
            {Object.entries(paymentStatuses).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="capitalize text-sm text-gray-600">{status}</span>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-3">🚚</span>
            Shipment & Offers
          </h3>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span>COD Orders</span>
              <span className="font-semibold">{codCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Orders with Tracking</span>
              <span className="font-semibold">{withTracking}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Orders with Promo Code</span>
              <span className="font-semibold">{withPromo}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;