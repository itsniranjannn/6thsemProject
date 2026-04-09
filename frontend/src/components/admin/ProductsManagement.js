import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminProductModal from './AdminProductModal.js';
import Toast from '../Toast.js';

const ProductsManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    fetchProducts();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE}/api/admin/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched products:', data.products);
        setProducts(data.products || []);
        setCurrentPage(1); // Reset to first page when products change
      } else {
        console.error('Failed to fetch products');
        showToast('Failed to fetch products', 'error');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      showToast('Error fetching products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

    try {
      const token = localStorage.getItem('token');
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE}/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchProducts();
        showToast('Product deleted successfully!');
      } else {
        showToast('Error deleting product', 'error');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      showToast('Error deleting product', 'error');
    }
  };

  const toggleProductStatus = async (productId, currentStatus, statusType) => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      console.log(`Toggling ${statusType} for product ${productId}, current: ${currentStatus}`);
      
      const newStatus = !currentStatus;
      const updateData = {};
      
      if (statusType === 'featured') {
        updateData.is_featured = newStatus;
      } else if (statusType === 'new') {
        updateData.is_new = newStatus;
      }

      const response = await fetch(`${API_BASE}/api/admin/products/${productId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();
      console.log('Status update response:', result);

      if (response.ok && result.success) {
        fetchProducts();
        showToast(`Product ${statusType} status ${newStatus ? 'enabled' : 'disabled'}!`);
      } else {
        showToast(result.message || `Error updating ${statusType} status`, 'error');
      }
    } catch (error) {
      console.error('Error updating product status:', error);
      showToast(`Error updating ${statusType} status`, 'error');
    }
  };

  const openEditModal = (product) => {
    console.log('Editing product:', product);
    setEditingProduct(product);
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleProductSave = () => {
    fetchProducts();
    handleModalClose();
    showToast(`Product ${editingProduct ? 'updated' : 'created'} successfully!`);
  };

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.stock_quantity <= 10).length;
  const outOfStockCount = products.filter(p => p.stock_quantity === 0).length;

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.category?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      
      let matchesStock = true;
      if (stockFilter === 'low') {
        matchesStock = product.stock_quantity <= 10 && product.stock_quantity > 0;
      } else if (stockFilter === 'out') {
        matchesStock = product.stock_quantity === 0;
      } else if (stockFilter === 'adequate') {
        matchesStock = product.stock_quantity > 10;
      }
      
      return matchesSearch && matchesCategory && matchesStock;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'stock-low':
          return a.stock_quantity - b.stock_quantity;
        case 'stock-high':
          return b.stock_quantity - a.stock_quantity;
        case 'newest':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

  // Pagination calculations
  const totalFilteredProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalFilteredProducts / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  const formatNPR = (amount) => {
    return `Rs. ${parseFloat(amount || 0).toLocaleString('en-NP')}`;
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-800 border-red-200' };
    if (quantity <= 10) return { text: 'Low Stock', color: 'bg-orange-100 text-orange-800 border-orange-200' };
    return { text: 'In Stock', color: 'bg-green-100 text-green-800 border-green-200' };
  };

  const parseTags = (tags) => {
    if (!tags) return [];
    try {
      if (Array.isArray(tags)) return tags;
      if (typeof tags === 'string') {
        const parsed = JSON.parse(tags);
        return Array.isArray(parsed) ? parsed : [tags];
      }
      return [];
    } catch {
      return typeof tags === 'string' ? [tags] : [];
    }
  };

  const parseImageUrls = (imageUrls) => {
    if (!imageUrls) return [];
    try {
      if (Array.isArray(imageUrls)) return imageUrls;
      if (typeof imageUrls === 'string') {
        const parsed = JSON.parse(imageUrls);
        return Array.isArray(parsed) ? parsed : [imageUrls];
      }
      return [];
    } catch {
      return typeof imageUrls === 'string' ? [imageUrls] : [];
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  return (
    <div className="p-8">
      {/* Toast Notification */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ show: false, message: '', type: 'success' })} 
        />
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">Product Management</h2>
          <p className="text-white mt-2">Manage your product catalog and inventory</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-3 shadow-lg hover:shadow-xl transition-all duration-200 mt-4 lg:mt-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add New Product</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div 
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20"
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Total Products</p>
              <p className="text-2xl font-bold text-white mt-1">{totalProducts}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
              <span className="text-blue-400 text-xl">🛍️</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20"
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">In Stock</p>
              <p className="text-2xl font-bold text-white mt-1">{totalProducts - outOfStockCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center border border-green-500/30">
              <span className="text-green-400 text-xl">✅</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20"
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Low Stock</p>
              <p className="text-2xl font-bold text-white mt-1">{lowStockCount}</p>
            </div>
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center border border-orange-500/30">
              <span className="text-orange-400 text-xl">⚠️</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20"
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Out of Stock</p>
              <p className="text-2xl font-bold text-white mt-1">{outOfStockCount}</p>
            </div>
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center border border-red-500/30">
              <span className="text-red-400 text-xl">❌</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search Products</label>
            <input
              type="text"
              placeholder="Search by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors backdrop-blur-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors backdrop-blur-sm"
            >
              <option value="all" className="bg-gray-800">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category} className="bg-gray-800">{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Stock Status</label>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors backdrop-blur-sm"
            >
              <option value="all" className="bg-gray-800">All Stock</option>
              <option value="adequate" className="bg-gray-800">Adequate Stock</option>
              <option value="low" className="bg-gray-800">Low Stock</option>
              <option value="out" className="bg-gray-800">Out of Stock</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors backdrop-blur-sm"
            >
              <option value="newest" className="bg-gray-800">Newest First</option>
              <option value="name" className="bg-gray-800">Name A-Z</option>
              <option value="price-low" className="bg-gray-800">Price: Low to High</option>
              <option value="price-high" className="bg-gray-800">Price: High to Low</option>
              <option value="stock-low" className="bg-gray-800">Stock: Low to High</option>
              <option value="stock-high" className="bg-gray-800">Stock: High to Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Items Per Page</label>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors backdrop-blur-sm"
            >
              <option value="5" className="bg-gray-800">5 per page</option>
              <option value="10" className="bg-gray-800">10 per page</option>
              <option value="20" className="bg-gray-800">20 per page</option>
              <option value="50" className="bg-gray-800">50 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-300">
          Showing {startIndex + 1}-{Math.min(endIndex, totalFilteredProducts)} of {totalFilteredProducts} products
          {searchTerm && (
            <span className="ml-2">
              for "<span className="font-semibold text-white">{searchTerm}</span>"
            </span>
          )}
        </div>
        
        {totalPages > 1 && (
          <div className="text-sm text-gray-300">
            Page {currentPage} of {totalPages}
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-300 mt-4">Loading products...</p>
        </div>
      ) : (
        <>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Category & Tags</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Price & Stock</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white/5 divide-y divide-white/10">
                  {currentProducts.map(product => {
                    const stockStatus = getStockStatus(product.stock_quantity);
                    const productTags = parseTags(product.tags);
                    const productImages = parseImageUrls(product.image_urls);
                    const mainImage = product.image_url || productImages[0] || '/api/placeholder/80/80';
                    
                    return (
                      <motion.tr 
                        key={product.id} 
                        className="hover:bg-white/10 transition-colors group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img 
                              src={mainImage} 
                              alt={product.name}
                              className="h-14 w-14 rounded-xl object-cover border border-white/20 shadow-lg"
                              onError={(e) => {
                                e.target.src = '/api/placeholder/80/80';
                              }}
                            />
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-400">ID: {product.id}</div>
                              {product.description && (
                                <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                                  {product.description}
                                </div>
                              )}
                              {productImages.length > 1 && (
                                <div className="text-xs text-blue-400 mt-1">
                                  +{productImages.length - 1} more images
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              {product.category || 'Uncategorized'}
                            </span>
                            {productTags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {productTags.slice(0, 3).map((tag, index) => (
                                  <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-white/10 text-gray-300">
                                    {tag}
                                  </span>
                                ))}
                                {productTags.length > 3 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-white/10 text-gray-400">
                                    +{productTags.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-2">
                            <div className="text-sm font-bold text-white">
                              {formatNPR(product.price)}
                              {product.discount_percentage > 0 && (
                                <span className="ml-2 text-xs text-green-300 bg-green-500/20 px-2 py-1 rounded-full border border-green-500/30">
                                  -{product.discount_percentage}%
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                                product.stock_quantity === 0 
                                  ? 'bg-red-500/20 text-red-300 border-red-500/30'
                                  : product.stock_quantity <= 10
                                  ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                                  : 'bg-green-500/20 text-green-300 border-green-500/30'
                              }`}>
                                {stockStatus.text}
                              </span>
                              <span className="text-xs text-gray-400">
                                {product.stock_quantity} units
                              </span>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => toggleProductStatus(product.id, product.is_featured, 'featured')}
                              className={`inline-flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                product.is_featured 
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30' 
                                  : 'bg-white/10 text-gray-400 border border-white/20 hover:bg-white/20'
                              }`}
                            >
                              ⭐ {product.is_featured ? 'Featured' : 'Mark Featured'}
                            </button>
                            <button
                              onClick={() => toggleProductStatus(product.id, product.is_new, 'new')}
                              className={`inline-flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                product.is_new 
                                  ? 'bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30' 
                                  : 'bg-white/10 text-gray-400 border border-white/20 hover:bg-white/20'
                              }`}
                            >
                              🆕 {product.is_new ? 'New Arrival' : 'Mark New'}
                            </button>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-3">
                            <motion.button
                              onClick={() => openEditModal(product)}
                              className="text-blue-300 hover:text-blue-400 bg-blue-500/20 hover:bg-blue-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 border border-blue-500/30"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <span>Edit</span>
                            </motion.button>
                            <motion.button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-300 hover:text-red-400 bg-red-500/20 hover:bg-red-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 border border-red-500/30"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span>Delete</span>
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {currentProducts.length === 0 && (
              <div className="text-center py-16">
                <div className="text-gray-500 mb-4">
                  <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-8V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1M9 7h6" />
                  </svg>
                </div>
                <p className="text-gray-400 text-lg font-semibold">No products found</p>
                <p className="text-gray-500 mt-2 mb-6">Try adjusting your search filters or add a new product</p>
                <motion.button
                  onClick={openAddModal}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Add New Product
                </motion.button>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                <div className="text-sm text-gray-300">
                  Showing {startIndex + 1}-{Math.min(endIndex, totalFilteredProducts)} of {totalFilteredProducts} products
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Previous Button */}
                  <motion.button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                      currentPage === 1
                        ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30'
                    }`}
                    whileHover={currentPage !== 1 ? { scale: 1.05 } : {}}
                    whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Previous</span>
                  </motion.button>

                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {getPageNumbers().map(page => (
                      <motion.button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {page}
                      </motion.button>
                    ))}
                    
                    {/* Ellipsis for many pages */}
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <span className="px-2 text-gray-500">...</span>
                    )}
                    
                    {totalPages > 5 && currentPage < totalPages - 1 && (
                      <motion.button
                        onClick={() => goToPage(totalPages)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                          currentPage === totalPages
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {totalPages}
                      </motion.button>
                    )}
                  </div>

                  {/* Next Button */}
                  <motion.button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                      currentPage === totalPages
                        ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30'
                    }`}
                    whileHover={currentPage !== totalPages ? { scale: 1.05 } : {}}
                    whileTap={currentPage !== totalPages ? { scale: 0.95 } : {}}
                  >
                    <span>Next</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                </div>

                {/* Items Per Page Selector */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-300">Show:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(e.target.value)}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors backdrop-blur-sm"
                  >
                    <option value="5" className="bg-gray-800">5</option>
                    <option value="10" className="bg-gray-800">10</option>
                    <option value="20" className="bg-gray-800">20</option>
                    <option value="50" className="bg-gray-800">50</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {showModal && (
          <AdminProductModal
            product={editingProduct}
            onClose={handleModalClose}
            onSave={handleProductSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductsManagement;