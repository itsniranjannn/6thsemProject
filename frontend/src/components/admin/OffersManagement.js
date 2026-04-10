import React, { useState, useEffect } from 'react';
import Toast from '../Toast.js';

const OffersManagement = () => {
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState({
    product_id: '',
    offer_type: 'flat_discount', // ✅ Use valid ENUM value as default
    discount_percentage: '',
    discount_amount: '',
    min_quantity: '',
    max_quantity: '',
    valid_from: '',
    valid_until: '',
    is_active: true,
    description: ''
  });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // ✅ UPDATED: All offer types matching database ENUM with descriptions
  const offerTypes = [
    {
      value: 'Bogo',
      label: 'BOGO - Buy One Get One Free',
      description: 'Customer pays for 1 item but receives 2 items',
      icon: '🎁',
      color: 'from-purple-500 to-pink-500'
    },
    {
      value: 'percentage_discount',
      label: 'Percentage Discount',
      description: 'Discount by percentage (e.g., 10% off, 25% off)',
      icon: '📊', 
      color: 'from-red-500 to-orange-500'
    },
    {
      value: 'flat_discount',
      label: 'Flat Discount',
      description: 'Fixed amount off (e.g., Rs. 500 off, Rs. 1000 off)',
      icon: '🏷️',
      color: 'from-green-500 to-emerald-500'
    },
    {
      value: 'bulk_discount',
      label: 'Bulk Discount',
      description: 'Discount for buying in quantity (e.g., Buy 5+ get 20% off)',
      icon: '📦',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      value: 'clearance_sale',
      label: 'Clearance Sale',
      description: 'Heavy discounts to clear stock (usually 50%+ off)',
      icon: '🔥',
      color: 'from-orange-500 to-red-500'
    },
    {
      value: 'flash_sale',
      label: 'Flash Sale',
      description: 'Time-limited offers with high discounts (24-48 hours)',
      icon: '⚡',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  // Legacy suggestions for backward compatibility
  const offerTypeSuggestions = offerTypes.map(type => type.value);
  const categories = [...new Set(products.map(product => product.category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const filteredProducts = selectedCategory
    ? products.filter(product => product.category === selectedCategory)
    : [];

  useEffect(() => {
    fetchOffers();
    fetchProducts();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE}/api/offers/admin/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOffers(data.offers || []);
      } else {
        showToast('Failed to fetch offers', 'error');
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
      showToast('Error fetching offers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE}/api/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : (data.products || []));
      } else {
        showToast('Failed to fetch products', 'error');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      showToast('Error fetching products', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const url = editingOffer 
        ? `${API_BASE}/api/offers/${editingOffer.id}`
        : `${API_BASE}/api/offers`;
      
      const method = editingOffer ? 'PUT' : 'POST';

      // Prepare offer data - handle both ENUM and custom types - FIXED PRECISION
      const offerData = {
        ...formData,
        // FIXED: Round percentage to whole numbers to prevent decimal precision issues
        discount_percentage: formData.discount_percentage ? Math.round(parseFloat(formData.discount_percentage)) : null,
        discount_amount: formData.discount_amount ? parseFloat(formData.discount_amount) : null,
        min_quantity: formData.min_quantity ? parseInt(formData.min_quantity) : null,
        max_quantity: formData.max_quantity ? parseInt(formData.max_quantity) : null
      };

      // If offer_type is one of the ENUM values, use it as is
      // Otherwise, it will be stored as a custom type in the database
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(offerData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setShowModal(false);
        setFormData({
          product_id: '',
          offer_type: 'flat_discount', // ✅ Use valid ENUM value
          discount_percentage: '',
          discount_amount: '',
          min_quantity: '',
          max_quantity: '',
          valid_from: new Date().toISOString().split('T')[0],
          valid_until: '',
          is_active: true,
          description: ''
        });
        fetchOffers();
        showToast(`Offer ${editingOffer ? 'updated' : 'created'} successfully!`);
      } else {
        showToast(result.message || `Error ${editingOffer ? 'updating' : 'creating'} offer`, 'error');
      }
    } catch (error) {
      console.error('Error saving offer:', error);
      showToast(`Error ${editingOffer ? 'updating' : 'creating'} offer`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (offerId) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;

    try {
      const token = localStorage.getItem('token');
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE}/api/offers/${offerId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchOffers();
        showToast('Offer deleted successfully!');
      } else {
        showToast('Error deleting offer', 'error');
      }
    } catch (error) {
      console.error('Error deleting offer:', error);
      showToast('Error deleting offer', 'error');
    }
  };

  const openCreateModal = () => {
    setEditingOffer(null);
    setSelectedCategory('');
    setFormData({
      product_id: '',
      offer_type: 'flat_discount', // ✅ Use valid ENUM value as default
      discount_percentage: '',
      discount_amount: '',
      min_quantity: '',
      max_quantity: '',
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: '',
      is_active: true,
      description: ''
    });
    setShowModal(true);
  };

  const openEditModal = (offer) => {
    setEditingOffer(offer);
    const selectedProduct = products.find(p => String(p.id) === String(offer.product_id));
    setSelectedCategory(selectedProduct?.category || '');
    setFormData({
      product_id: offer.product_id,
      offer_type: offer.offer_type,
      discount_percentage: offer.discount_percentage || '',
      discount_amount: offer.discount_amount || '',
      min_quantity: offer.min_quantity || '',
      max_quantity: offer.max_quantity || '',
      valid_from: offer.valid_from ? offer.valid_from.split('T')[0] : new Date().toISOString().split('T')[0],
      valid_until: offer.valid_until ? offer.valid_until.split('T')[0] : '',
      is_active: offer.is_active,
      description: offer.description || ''
    });
    setShowModal(true);
  };

  const isOfferActive = (offer) => {
    const now = new Date();
    const validFrom = new Date(offer.valid_from);
    const validUntil = new Date(offer.valid_until);
    return offer.is_active && now >= validFrom && now <= validUntil;
  };

  const getOfferTypeColor = (type) => {
    const colors = {
      'discount': 'bg-blue-100 text-blue-800 border-blue-200',
      'percentage_off': 'bg-green-100 text-green-800 border-green-200',
      'flat_discount': 'bg-purple-100 text-purple-800 border-purple-200',
      'buy_one_get_one': 'bg-orange-100 text-orange-800 border-orange-200',
      'Bogo': 'bg-orange-100 text-orange-800 border-orange-200',
      'bogo': 'bg-orange-100 text-orange-800 border-orange-200',
      'bulk_discount': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'free_shipping': 'bg-pink-100 text-pink-800 border-pink-200',
      'clearance_sale': 'bg-red-100 text-red-800 border-red-200',
      'seasonal_offer': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'flash_sale': 'bg-red-100 text-red-800 border-red-200',
      'limited_time': 'bg-purple-100 text-purple-800 border-purple-200',
      'special_offer': 'bg-green-100 text-green-800 border-green-200',
      'summer_sale': 'bg-blue-100 text-blue-800 border-blue-200',
      'winter_sale': 'bg-gray-100 text-gray-800 border-gray-200',
      'festival_offer': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'anniversary_sale': 'bg-pink-100 text-pink-800 border-pink-200',
      'clearance': 'bg-red-100 text-red-800 border-red-200',
      'end_of_season': 'bg-gray-100 text-gray-800 border-gray-200',
      'new_arrival': 'bg-green-100 text-green-800 border-green-200',
      'hot_deal': 'bg-red-100 text-red-800 border-red-200'
    };
    
    // Check if we have a specific color for this type
    if (colors[type]) {
      return colors[type];
    }
    
    // For custom types, use a default color based on the first character
    const firstChar = type?.charAt(0)?.toLowerCase();
    const defaultColors = {
      'a': 'bg-blue-100 text-blue-800 border-blue-200',
      'b': 'bg-green-100 text-green-800 border-green-200',
      'c': 'bg-purple-100 text-purple-800 border-purple-200',
      'd': 'bg-orange-100 text-orange-800 border-orange-200',
      'e': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'f': 'bg-pink-100 text-pink-800 border-pink-200',
      'g': 'bg-red-100 text-red-800 border-red-200',
      'h': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'i': 'bg-blue-100 text-blue-800 border-blue-200',
      'j': 'bg-green-100 text-green-800 border-green-200',
      'k': 'bg-purple-100 text-purple-800 border-purple-200',
      'l': 'bg-orange-100 text-orange-800 border-orange-200',
      'm': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'n': 'bg-pink-100 text-pink-800 border-pink-200',
      'o': 'bg-red-100 text-red-800 border-red-200',
      'p': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'q': 'bg-blue-100 text-blue-800 border-blue-200',
      'r': 'bg-green-100 text-green-800 border-green-200',
      's': 'bg-purple-100 text-purple-800 border-purple-200',
      't': 'bg-orange-100 text-orange-800 border-orange-200',
      'u': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'v': 'bg-pink-100 text-pink-800 border-pink-200',
      'w': 'bg-red-100 text-red-800 border-red-200',
      'x': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'y': 'bg-blue-100 text-blue-800 border-blue-200',
      'z': 'bg-green-100 text-green-800 border-green-200'
    };
    
    return defaultColors[firstChar] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getOfferDescription = (offer) => {
    if (offer.description) return offer.description;
    
    // Handle both ENUM and custom offer types
    switch (offer.offer_type) {
      case 'discount':
      case 'percentage_off':
        return offer.discount_percentage 
          ? `${offer.discount_percentage}% off`
          : `Rs. ${offer.discount_amount} off`;
      case 'flat_discount':
        return `Flat Rs. ${offer.discount_amount} off`;
      case 'buy_one_get_one':
      case 'bogo':
        return 'Buy One Get One';
      case 'bulk_discount':
      case 'bulk_discount':
        return `Bulk discount (min ${offer.min_quantity})`;
      case 'free_shipping':
        return 'Free Shipping';
      case 'clearance_sale':
      case 'clearance':
        return 'Clearance Sale';
      case 'seasonal_offer':
        return 'Seasonal Offer';
      case 'flash_sale':
        return 'Flash Sale';
      case 'limited_time':
        return 'Limited Time Offer';
      case 'special_offer':
        return 'Special Offer';
      case 'summer_sale':
        return 'Summer Sale';
      case 'winter_sale':
        return 'Winter Sale';
      case 'festival_offer':
        return 'Festival Offer';
      case 'anniversary_sale':
        return 'Anniversary Sale';
      case 'end_of_season':
        return 'End of Season Sale';
      case 'new_arrival':
        return 'New Arrival Offer';
      case 'hot_deal':
        return 'Hot Deal';
      default:
        // For custom offer types, format them nicely
        return offer.offer_type 
          ? offer.offer_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          : 'Special Offer';
    }
  };

  const activeOffers = offers.filter(offer => isOfferActive(offer)).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
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
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Offers Management</h2>
            <p className="text-gray-600 mt-1 text-sm lg:text-base">Create and manage special offers and discounts</p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg lg:rounded-xl font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200 mt-4 lg:mt-0 text-sm lg:text-base"
          >
            <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Create Offer</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6">
          <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs lg:text-sm font-medium">Total Offers</p>
                <p className="text-xl lg:text-3xl font-bold text-gray-900 mt-1">{offers.length}</p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg lg:rounded-xl flex items-center justify-center">
                <span className="text-blue-600 text-lg lg:text-xl">🎁</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs lg:text-sm font-medium">Active Offers</p>
                <p className="text-xl lg:text-3xl font-bold text-gray-900 mt-1">{activeOffers}</p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg lg:rounded-xl flex items-center justify-center">
                <span className="text-green-600 text-lg lg:text-xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs lg:text-sm font-medium">Expired Offers</p>
                <p className="text-xl lg:text-3xl font-bold text-gray-900 mt-1">
                  {offers.length - activeOffers}
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-100 rounded-lg lg:rounded-xl flex items-center justify-center">
                <span className="text-red-600 text-lg lg:text-xl">⏰</span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 lg:py-12">
            <div className="animate-spin rounded-full h-8 w-8 lg:h-12 lg:w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-600 mt-2 lg:mt-4 text-sm lg:text-base">Loading offers...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl lg:rounded-2xl shadow border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Offer Details</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Validity</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {offers.map(offer => {
                    const product = products.find(p => p.id === offer.product_id);
                    const isActive = isOfferActive(offer);
                    
                    return (
                      <tr key={offer.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 lg:px-6 py-4">
                          <div>
                            <div className="flex items-center space-x-2 lg:space-x-3 mb-2">
                              <span className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium border ${getOfferTypeColor(offer.offer_type)}`}>
                                {offer.offer_type.replace(/_/g, ' ').toUpperCase()}
                              </span>
                              {!isActive && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-gray-900">
                              {getOfferDescription(offer)}
                            </p>
                            {offer.description && (
                              <p className="text-sm text-gray-500 mt-1">{offer.description}</p>
                            )}
                            {(offer.discount_percentage || offer.discount_amount) && (
                              <div className="flex items-center space-x-2 mt-1">
                                {offer.discount_percentage && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                    {offer.discount_percentage}% OFF
                                  </span>
                                )}
                                {offer.discount_amount && (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    Rs. {offer.discount_amount} OFF
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          {product ? (
                            <div className="flex items-center space-x-2 lg:space-x-3">
                              <img 
                                src={product.image_url || '/api/placeholder/60/60'} 
                                alt={product.name}
                                className="h-8 w-8 lg:h-10 lg:w-10 rounded-lg object-cover border border-gray-200"
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                <p className="text-xs text-gray-500">{product.category}</p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">Product not found</p>
                          )}
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <div className="text-sm text-gray-900">
                            <div>From: {new Date(offer.valid_from).toLocaleDateString()}</div>
                            <div>To: {new Date(offer.valid_until).toLocaleDateString()}</div>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <span className={`inline-flex items-center px-2 lg:px-3 py-1 rounded-full text-xs font-medium ${
                            isActive 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <div className="flex items-center space-x-2 lg:space-x-3">
                            <button
                              onClick={() => openEditModal(offer)}
                              className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 lg:px-3 py-1 lg:py-2 rounded text-xs lg:text-sm transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(offer.id)}
                              className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-2 lg:px-3 py-1 lg:py-2 rounded text-xs lg:text-sm transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {offers.length === 0 && (
              <div className="text-center py-8 lg:py-16">
                <div className="text-gray-400 mb-3 lg:mb-4">
                  <svg className="w-16 h-16 lg:w-20 lg:h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 14l-4-4m0 0l4-4m-4 4h12a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg font-semibold">No offers found</p>
                <p className="text-gray-400 mt-1 lg:mt-2 mb-4 lg:mb-6 text-sm lg:text-base">Create your first offer to boost sales</p>
                <button
                  onClick={openCreateModal}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium transition-colors text-sm lg:text-base"
                >
                  Create First Offer
                </button>
              </div>
            )}
          </div>
        )}

        {/* Create/Edit Offer Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl lg:rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-4 lg:p-6 border-b border-gray-200">
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
                  {editingOffer ? 'Edit Offer' : 'Create New Offer'}
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="p-4 lg:p-6 space-y-4 lg:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select
                      required
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setFormData({ ...formData, product_id: '' });
                      }}
                      className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    >
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product *</label>
                    <select
                      required
                      value={formData.product_id}
                      onChange={(e) => setFormData({...formData, product_id: e.target.value})}
                      disabled={!selectedCategory}
                      className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    >
                      <option value="">{selectedCategory ? 'Select a product' : 'Select category first'}</option>
                      {filteredProducts.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} - Rs. {product.price}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Offer Type *</label>
                    <select
                      required
                      value={formData.offer_type}
                      onChange={(e) => setFormData({...formData, offer_type: e.target.value})}
                      className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    >
                      <option value="">Select Offer Type</option>
                      {offerTypes.map(offerType => (
                        <option key={offerType.value} value={offerType.value}>
                          {offerType.icon} {offerType.label}
                        </option>
                      ))}
                    </select>
                    
                    {/* Show description of selected offer type */}
                    {formData.offer_type && (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        {(() => {
                          const selectedType = offerTypes.find(type => type.value === formData.offer_type);
                          return selectedType ? (
                            <div className="flex items-start space-x-2">
                              <span className="text-lg">{selectedType.icon}</span>
                              <div>
                                <p className="text-sm font-medium text-blue-800">{selectedType.label}</p>
                                <p className="text-xs text-blue-600">{selectedType.description}</p>
                              </div>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Percentage Discount Fields */}
                  {formData.offer_type === 'percentage_discount' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount Percentage *
                        <span className="text-xs text-gray-500">(whole numbers only, e.g., 10, 25, 50)</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        required
                        value={formData.discount_percentage}
                        onChange={(e) => {
                          // Only allow whole numbers for percentage
                          const value = e.target.value;
                          if (value === '' || (Number.isInteger(Number(value)) && Number(value) >= 0 && Number(value) <= 100)) {
                            setFormData({...formData, discount_percentage: value});
                          }
                        }}
                        className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        placeholder="10"
                      />
                      <p className="text-xs text-green-600 mt-1">Enter whole numbers only (10% not 10.5%)</p>
                    </div>
                  )}

                  {/* Flat Discount Fields */}
                  {formData.offer_type === 'flat_discount' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount Amount (Rs.) *
                        <span className="text-xs text-gray-500">(fixed amount off)</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={formData.discount_amount}
                        onChange={(e) => setFormData({...formData, discount_amount: e.target.value})}
                        className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        placeholder="500"
                      />
                      <p className="text-xs text-gray-600 mt-1">Fixed amount discount (e.g., Rs. 100 off, Rs. 500 off)</p>
                    </div>
                  )}

                  {/* Bulk Discount Fields */}
                  {formData.offer_type === 'bulk_discount' && (
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Discount Percentage *
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          required
                          value={formData.discount_percentage}
                          onChange={(e) => setFormData({...formData, discount_percentage: e.target.value})}
                          className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          placeholder="20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Quantity *
                        </label>
                        <input
                          type="number"
                          min="2"
                          required
                          value={formData.min_quantity}
                          onChange={(e) => setFormData({...formData, min_quantity: e.target.value})}
                          className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          placeholder="5"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Maximum Quantity
                          <span className="text-xs text-gray-500">(optional)</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formData.max_quantity}
                          onChange={(e) => setFormData({...formData, max_quantity: e.target.value})}
                          className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          placeholder="50"
                        />
                      </div>
                    </div>
                  )}

                  {/* Clearance Sale Fields */}
                  {formData.offer_type === 'clearance_sale' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Clearance Discount Percentage *
                        <span className="text-xs text-gray-500">(typically 50%+ for clearance)</span>
                      </label>
                      <input
                        type="number"
                        min="30"
                        max="90"
                        step="1"
                        required
                        value={formData.discount_percentage}
                        onChange={(e) => setFormData({...formData, discount_percentage: e.target.value})}
                        className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        placeholder="60"
                      />
                      <p className="text-xs text-orange-600 mt-1">Clearance sales typically offer 50-80% discounts</p>
                    </div>
                  )}

                  {/* Flash Sale Fields */}
                  {formData.offer_type === 'flash_sale' && (
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Flash Sale Discount *
                        </label>
                        <input
                          type="number"
                          min="10"
                          max="80"
                          step="1"
                          required
                          value={formData.discount_percentage}
                          onChange={(e) => setFormData({...formData, discount_percentage: e.target.value})}
                          className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          placeholder="30"
                        />
                        <p className="text-xs text-yellow-600 mt-1">Flash sales are time-limited (24-48 hours typically). Use the date fields below to set duration.</p>
                      </div>
                    </div>
                  )}

                  {/* BOGO Information Section */}
                  {formData.offer_type === 'Bogo' && (
                    <div className="md:col-span-2">
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">🎁</span>
                          <h4 className="text-sm font-medium text-orange-800">BOGO - Buy One Get One Free</h4>
                        </div>
                        <p className="text-xs text-orange-700">
                          Customer pays for 1 item but receives 2 items. No additional settings needed.
                        </p>
                        <p className="text-xs text-orange-600 mt-1">
                          Example: Buy 1 T-shirt, get 1 T-shirt FREE (customer pays for 1, gets 2 items)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Valid From *</label>
    <input
      type="date"
      required
      min={new Date().toISOString().split('T')[0]}
      value={formData.valid_from}
      onChange={(e) => setFormData({...formData, valid_from: e.target.value})}
      className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
    />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Valid Until *</label>
    <input
      type="date"
      required
      min={formData.valid_from || new Date().toISOString().split('T')[0]}
      value={formData.valid_until}
      onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
      className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
    />
  </div>
</div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="3"
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="Describe this offer..."
                  />
                </div>

                {/* Offer Preview */}
                <div className="bg-gray-50 rounded-lg lg:rounded-xl p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Offer Preview</h4>
                  <div className={`p-3 rounded-lg border-l-4 ${
                    formData.offer_type.includes('discount') ? 'border-blue-400 bg-blue-50' :
                    formData.offer_type.includes('bogo') ? 'border-orange-400 bg-orange-50' :
                    formData.offer_type.includes('bulk') ? 'border-indigo-400 bg-indigo-50' :
                    formData.offer_type.includes('free') ? 'border-pink-400 bg-pink-50' :
                    'border-green-400 bg-green-50'
                  }`}>
                    <div className="flex items-start space-x-2">
                      <div className="flex-shrink-0 text-lg">
                        {formData.offer_type.includes('discount') ? '💰' :
                         formData.offer_type.includes('bogo') ? '🎁' :
                         formData.offer_type.includes('bulk') ? '📦' :
                         formData.offer_type.includes('free') ? '🚚' : '🎯'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-gray-900 text-sm">
                          {formData.offer_type ? formData.offer_type.replace(/_/g, ' ').toUpperCase() : 'OFFER'}
                        </h5>
                        <p className="text-gray-600 text-xs">
                          {getOfferDescription(formData)}
                        </p>
                        {formData.product_id && (
                          <p className="text-gray-500 text-xs mt-1">
                            Product: {products.find(p => p.id === formData.product_id)?.name || 'Selected product'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500 h-4 w-4"
                  />
                  <span className="text-sm font-medium text-gray-700">Active Offer</span>
                </div>

                <div className="flex justify-end space-x-3 lg:space-x-4 pt-4 lg:pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 lg:px-6 py-2 lg:py-3 border border-gray-300 rounded-lg lg:rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors text-sm lg:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg lg:rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 font-medium shadow-lg transition-all duration-200 text-sm lg:text-base"
                  >
                    {loading ? 'Saving...' : (editingOffer ? 'Update Offer' : 'Create Offer')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OffersManagement;
