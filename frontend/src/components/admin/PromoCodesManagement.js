import React, { useState, useEffect } from 'react';
import Toast from '../Toast.js';

const PromoCodesManagement = () => {
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_amount: '',
    max_discount_amount: '',
    usage_limit: '',
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: '',
    is_active: true,
    categories: []
  });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const categories = [
    'Electronics',
    'Clothing',
    'Footwear',
    'Home & Kitchen',
    'Beauty & Personal Care',
    'Sports & Outdoors',
    'Books & Stationery',
    'Mobile Phones',
    'Laptops & Computers',
    'Accessories'
  ];

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchPromoCodes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE}/api/admin/promo-codes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPromoCodes(data.promoCodes || []);
      } else {
        showToast('Failed to fetch promo codes', 'error');
      }
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      showToast('Error fetching promo codes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const url = editingPromo 
        ? `${API_BASE}/api/admin/promo-codes/${editingPromo.id}`
        : `${API_BASE}/api/admin/promo-codes`;
      
      const method = editingPromo ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          discount_value: parseFloat(formData.discount_value),
          min_order_amount: parseFloat(formData.min_order_amount || 0),
          max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
          usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
          categories: formData.categories.length > 0 ? formData.categories : []
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setShowModal(false);
        setFormData({
          code: '',
          description: '',
          discount_type: 'percentage',
          discount_value: '',
          min_order_amount: '',
          max_discount_amount: '',
          usage_limit: '',
          valid_from: new Date().toISOString().split('T')[0],
          valid_until: '',
          is_active: true,
          categories: []
        });
        setEditingPromo(null);
        fetchPromoCodes();
        showToast(`Promo code ${editingPromo ? 'updated' : 'created'} successfully!`);
      } else {
        showToast(result.message || `Error ${editingPromo ? 'updating' : 'creating'} promo code`, 'error');
      }
    } catch (error) {
      console.error('Error saving promo code:', error);
      showToast(`Error ${editingPromo ? 'updating' : 'creating'} promo code`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const deletePromoCode = async (promoId) => {
    if (!window.confirm('Are you sure you want to delete this promo code?')) return;

    try {
      const token = localStorage.getItem('token');
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE}/api/admin/promo-codes/${promoId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        fetchPromoCodes();
        showToast('Promo code deleted successfully!');
      } else {
        showToast(result.message || 'Error deleting promo code', 'error');
      }
    } catch (error) {
      console.error('Error deleting promo code:', error);
      showToast('Error deleting promo code', 'error');
    }
  };

  const openCreateModal = () => {
    setEditingPromo(null);
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      min_order_amount: '',
      max_discount_amount: '',
      usage_limit: '',
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: '',
      is_active: true,
      categories: []
    });
    setShowModal(true);
  };

  const openEditModal = (promo) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code,
      description: promo.description || '',
      discount_type: promo.discount_type,
      discount_value: promo.discount_value,
      min_order_amount: promo.min_order_amount || '',
      max_discount_amount: promo.max_discount_amount || '',
      usage_limit: promo.usage_limit || '',
      valid_from: promo.valid_from ? promo.valid_from.split('T')[0] : new Date().toISOString().split('T')[0],
      valid_until: promo.valid_until ? promo.valid_until.split('T')[0] : '',
      is_active: promo.is_active,
      categories: promo.categories ? JSON.parse(promo.categories) : []
    });
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isActive = (promo) => {
    const now = new Date();
    const validFrom = new Date(promo.valid_from);
    const validUntil = new Date(promo.valid_until);
    return promo.is_active && now >= validFrom && now <= validUntil;
  };

  const getDiscountText = (promo) => {
    if (promo.discount_type === 'percentage') {
      return `${promo.discount_value}% off`;
    } else if (promo.discount_type === 'fixed') {
      return `Rs. ${promo.discount_value} off`;
    } else {
      return 'Free Shipping';
    }
  };

  const toggleCategory = (category) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const toggleAllCategories = () => {
    if (formData.categories.length === categories.length) {
      setFormData(prev => ({ ...prev, categories: [] }));
    } else {
      setFormData(prev => ({ ...prev, categories: [...categories] }));
    }
  };

  const activePromos = promoCodes.filter(promo => isActive(promo)).length;
  const totalUsage = promoCodes.reduce((sum, promo) => sum + (promo.used_count || 0), 0);

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
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Promo Code Management</h2>
            <p className="text-gray-600 mt-1 text-sm lg:text-base">Create and manage discount codes for your store</p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg lg:rounded-xl font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200 mt-4 lg:mt-0 text-sm lg:text-base"
          >
            <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Create Promo Code</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6">
          <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs lg:text-sm font-medium">Total Promo Codes</p>
                <p className="text-xl lg:text-3xl font-bold text-gray-900 mt-1">{promoCodes.length}</p>
              </div>
              <div className="bg-purple-100 p-2 lg:p-3 rounded-lg lg:rounded-xl">
                <svg className="w-6 h-6 lg:w-8 lg:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01m12-.01a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs lg:text-sm font-medium">Active Promo Codes</p>
                <p className="text-xl lg:text-3xl font-bold text-green-600 mt-1">{activePromos}</p>
              </div>
              <div className="bg-green-100 p-2 lg:p-3 rounded-lg lg:rounded-xl">
                <svg className="w-6 h-6 lg:w-8 lg:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs lg:text-sm font-medium">Total Usage</p>
                <p className="text-xl lg:text-3xl font-bold text-blue-600 mt-1">{totalUsage}</p>
              </div>
              <div className="bg-blue-100 p-2 lg:p-3 rounded-lg lg:rounded-xl">
                <svg className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Promo Codes Table */}
        <div className="bg-white rounded-xl lg:rounded-2xl shadow border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center p-8 lg:p-12">
              <div className="animate-spin rounded-full h-8 w-8 lg:h-12 lg:w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Promo Code</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Discount</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Usage</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Validity</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {promoCodes.map((promo) => (
                    <tr key={promo.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 lg:px-6 py-4">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{promo.code}</div>
                          <div className="text-sm text-gray-500">{promo.description}</div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{getDiscountText(promo)}</div>
                        {promo.min_order_amount > 0 && (
                          <div className="text-xs text-gray-500">Min order: Rs. {promo.min_order_amount}</div>
                        )}
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {promo.used_count || 0} / {promo.usage_limit || '∞'}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-500">
                        <div>From: {formatDate(promo.valid_from)}</div>
                        <div>To: {formatDate(promo.valid_until)}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <span className={`inline-flex px-2 lg:px-3 py-1 text-xs font-semibold rounded-full ${
                          isActive(promo)
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {isActive(promo) ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm font-medium">
                        <div className="flex space-x-2 lg:space-x-3">
                          <button
                            onClick={() => openEditModal(promo)}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 lg:px-3 py-1 lg:py-2 rounded text-xs lg:text-sm transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deletePromoCode(promo.id)}
                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-2 lg:px-3 py-1 lg:py-2 rounded text-xs lg:text-sm transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl lg:rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-4 lg:p-6 border-b border-gray-200">
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
                  {editingPromo ? 'Edit Promo Code' : 'Create New Promo Code'}
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="p-4 lg:p-6 space-y-4 lg:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  {/* Code */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Promo Code *</label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                      className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                      placeholder="e.g., WELCOME20"
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows="2"
                      className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                      placeholder="Enter promo code description..."
                    />
                  </div>

                  {/* Discount Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type *</label>
                    <select
                      value={formData.discount_type}
                      onChange={(e) => setFormData({...formData, discount_type: e.target.value})}
                      className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                      <option value="free_shipping">Free Shipping</option>
                    </select>
                  </div>

                  {/* Discount Value */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {formData.discount_type === 'percentage' ? 'Discount Percentage *' : 
                       formData.discount_type === 'fixed' ? 'Discount Amount *' : 'Free Shipping'}
                    </label>
                    {formData.discount_type !== 'free_shipping' && (
                      <input
                        type="number"
                        required
                        min="0"
                        step={formData.discount_type === 'percentage' ? "0.01" : "1"}
                        value={formData.discount_value}
                        onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
                        className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                        placeholder={formData.discount_type === 'percentage' ? "10" : "100"}
                      />
                    )}
                  </div>

                  {/* Min Order Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Order Amount</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.min_order_amount}
                      onChange={(e) => setFormData({...formData, min_order_amount: e.target.value})}
                      className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                      placeholder="0"
                    />
                  </div>

                  {/* Max Discount Amount */}
                  {formData.discount_type === 'percentage' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Discount Amount</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.max_discount_amount}
                        onChange={(e) => setFormData({...formData, max_discount_amount: e.target.value})}
                        className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                        placeholder="No limit"
                      />
                    </div>
                  )}

                  {/* Usage Limit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Usage Limit</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.usage_limit}
                      onChange={(e) => setFormData({...formData, usage_limit: e.target.value})}
                      className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                      placeholder="No limit"
                    />
                  </div>

                  {/* Valid From */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Valid From *</label>
    <input
      type="date"
      required
      min={new Date().toISOString().split('T')[0]}
      value={formData.valid_from}
      onChange={(e) => setFormData({...formData, valid_from: e.target.value})}
      className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
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
      className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
    />
  </div>
</div>
                </div>

                {/* Categories */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">Applicable Categories</label>
                    <button
                      type="button"
                      onClick={toggleAllCategories}
                      className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                    >
                      {formData.categories.length === categories.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 lg:gap-3 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                    {categories.map(category => (
                      <label key={category} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.categories.includes(category)}
                          onChange={() => toggleCategory(category)}
                          className="w-3 h-3 lg:w-4 lg:h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-xs lg:text-sm text-gray-700">{category}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.categories.length === 0 ? 'Applied to all categories' : 
                     `Applied to ${formData.categories.length} categor${formData.categories.length === 1 ? 'y' : 'ies'}`}
                  </p>
                </div>

                {/* Active Status */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    id="is_active"
                  />
                  <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                    Active Promo Code
                  </label>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 lg:space-x-4 pt-4 lg:pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 lg:px-6 py-2 lg:py-3 border border-gray-300 text-gray-700 rounded-lg lg:rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm lg:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg lg:rounded-xl font-medium disabled:opacity-50 transition-all duration-200 text-sm lg:text-base"
                  >
                    {loading ? 'Saving...' : (editingPromo ? 'Update Promo Code' : 'Create Promo Code')}
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

export default PromoCodesManagement;