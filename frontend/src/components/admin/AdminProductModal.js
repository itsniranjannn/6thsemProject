import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Toast from '../Toast.js';

const INITIAL_FORM_DATA = {
  name: '',
  description: '',
  price: '',
  category: '',
  image_url: '',
  stock_quantity: '',
  is_featured: false,
  is_new: false,
  discount_percentage: '',
  tags: ''
};

const INITIAL_IMAGE_URLS = ['', '', '', ''];

const AdminProductModal = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState(INITIAL_IMAGE_URLS);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [activeTab, setActiveTab] = useState('url'); // 'url' or 'upload'
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const handleModalWheel = (e) => {
    const modal = e.currentTarget;
    const atTop = modal.scrollTop <= 0;
    const atBottom = modal.scrollTop + modal.clientHeight >= modal.scrollHeight - 1;
    const scrollingUp = e.deltaY < 0;
    const scrollingDown = e.deltaY > 0;

    if ((atTop && scrollingUp) || (atBottom && scrollingDown)) {
      e.preventDefault();
    }
    e.stopPropagation();
  };

  useEffect(() => {
    if (product) {
      // Parse existing image URLs
      let existingImages = [];
      if (product.image_urls) {
        if (Array.isArray(product.image_urls)) {
          existingImages = [...product.image_urls];
        } else if (typeof product.image_urls === 'string') {
          try {
            const parsed = JSON.parse(product.image_urls);
            existingImages = Array.isArray(parsed) ? parsed : [product.image_urls];
          } catch {
            existingImages = [product.image_urls];
          }
        }
      } else if (product.image_url) {
        existingImages = [product.image_url];
      }

      // Fill image URLs array – always start fresh (bug fix)
      const newImageUrls = [...INITIAL_IMAGE_URLS];
      existingImages.forEach((url, index) => {
        if (index < 4) {
          newImageUrls[index] = url;
        }
      });
      setImageUrls(newImageUrls);

      // Parse tags
      let tagsString = '';
      if (product.tags) {
        if (Array.isArray(product.tags)) {
          tagsString = product.tags.join(', ');
        } else if (typeof product.tags === 'string') {
          try {
            const parsed = JSON.parse(product.tags);
            tagsString = Array.isArray(parsed) ? parsed.join(', ') : product.tags;
          } catch {
            tagsString = product.tags;
          }
        }
      }

      setFormData({
        ...INITIAL_FORM_DATA,
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || '',
        image_url: product.image_url || '',
        stock_quantity: product.stock_quantity || '',
        is_featured: product.is_featured || false,
        is_new: product.is_new || false,
        discount_percentage: product.discount_percentage || '',
        tags: tagsString
      });
      setUploadedImages([]);
      setActiveTab('url');
    } else {
      // Reset form when adding new product (improvement)
      setFormData(INITIAL_FORM_DATA);
      setImageUrls(INITIAL_IMAGE_URLS);
      setUploadedImages([]);
      setActiveTab('url');
    }
  }, [product]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const allImageUrls = [
        ...imageUrls.filter(url => url.trim() !== ''),
        ...uploadedImages
      ];

      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        discount_percentage: formData.discount_percentage ? parseFloat(formData.discount_percentage) : 0,
        image_url: allImageUrls[0] || '',
        image_urls: allImageUrls,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        is_featured: Boolean(formData.is_featured),
        is_new: Boolean(formData.is_new)
      };

      const url = product 
        ? `${API_BASE}/api/admin/products/${product.id}`
        : `${API_BASE}/api/admin/products`;
      const method = product ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        onSave();
      } else {
        showToast(result.message || `Error ${product ? 'updating' : 'creating'} product`, 'error');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      showToast(`Error ${product ? 'updating' : 'creating'} product`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file, index = null) => {
    setUploadLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE}/api/admin/products/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (index !== null) {
          const newUploadedImages = [...uploadedImages];
          newUploadedImages[index] = result.imageUrl;
          setUploadedImages(newUploadedImages);
        } else {
          setUploadedImages(prev => [...prev, result.imageUrl]);
        }
        showToast('Image uploaded successfully!');
      } else {
        showToast(result.message || 'Error uploading image', 'error');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      showToast('Error uploading image', 'error');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleImageUrlChange = (index, value) => {
    const newImageUrls = [...imageUrls];
    newImageUrls[index] = value;
    setImageUrls(newImageUrls);
  };

  const removeUploadedImage = (index) => {
    const newUploadedImages = [...uploadedImages];
    newUploadedImages.splice(index, 1);
    setUploadedImages(newUploadedImages);
  };

  const removeImageUrl = (index) => {
    const newImageUrls = [...imageUrls];
    newImageUrls[index] = '';
    setImageUrls(newImageUrls);
  };

  const categories = [
    'Electronics', 'Clothing', 'Footwear', 'Home & Kitchen',
    'Beauty & Personal Care', 'Sports & Outdoors', 'Books & Stationery',
    'Mobile Phones', 'Laptops & Computers', 'Accessories', 'Fashion',
    'Home Appliances', 'Grocery', 'Toys & Games'
  ];

  const allImages = [...uploadedImages, ...imageUrls.filter(url => url.trim() !== '')];

  return (
    <motion.div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 overflow-y-auto overscroll-y-contain [scrollbar-gutter:stable]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ show: false, message: '', type: 'success' })} 
        />
      )}

      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div 
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto overscroll-y-contain custom-scrollbar border border-white/20 shadow-2xl"
          initial={{ scale: 0.9, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 50, opacity: 0 }}
          transition={{ type: "spring", damping: 32, stiffness: 260, mass: 0.9 }}
          onWheel={handleModalWheel}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <motion.h3 
                className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {product ? 'Edit Product' : 'Add New Product'}
              </motion.h3>
              <motion.button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Form fields – same as original */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Product Name *</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors backdrop-blur-sm" placeholder="Enter product name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                  <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors backdrop-blur-sm">
                    <option value="" className="bg-gray-800">Select a category</option>
                    {categories.map(category => <option key={category} value={category} className="bg-gray-800">{category}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="4" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors backdrop-blur-sm" placeholder="Enter product description" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Price (NPR) *</label>
                  <input type="number" required step="0.01" min="0" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors backdrop-blur-sm" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Stock Quantity *</label>
                  <input type="number" required min="0" value={formData.stock_quantity} onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors backdrop-blur-sm" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Discount %</label>
                  <input type="number" step="0.01" min="0" max="100" value={formData.discount_percentage} onChange={(e) => setFormData({...formData, discount_percentage: e.target.value})} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors backdrop-blur-sm" placeholder="0" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                  <input type="text" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors backdrop-blur-sm" placeholder="tag1, tag2, tag3" />
                  <p className="text-sm text-gray-400 mt-1">Separate tags with commas</p>
                </div>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({...formData, is_featured: e.target.checked})} className="rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-500 h-5 w-5" />
                    <span className="text-sm font-medium text-gray-300">Featured Product</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="checkbox" checked={formData.is_new} onChange={(e) => setFormData({...formData, is_new: e.target.checked})} className="rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-500 h-5 w-5" />
                    <span className="text-sm font-medium text-gray-300">New Arrival</span>
                  </label>
                </div>
              </div>

              {/* Image Management – same as bottom version */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Product Images</label>
                <div className="flex border-b border-white/20 mb-4">
                  <button type="button" onClick={() => setActiveTab('url')} className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'url' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-300'}`}>Image URLs</button>
                  <button type="button" onClick={() => setActiveTab('upload')} className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'upload' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-300'}`}>Upload Images</button>
                </div>

                {activeTab === 'url' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input type="url" value={url} onChange={(e) => handleImageUrlChange(index, e.target.value)} className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors backdrop-blur-sm" placeholder={`Image URL ${index + 1}`} />
                            {url && <button type="button" onClick={() => removeImageUrl(index)} className="px-3 py-2 text-red-300 hover:text-red-400 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all border border-red-500/30">Remove</button>}
                          </div>
                          {url && (
                            <div className="flex items-center space-x-3 p-2 bg-white/5 rounded-lg border border-white/10">
                              <img src={url} alt={`Preview ${index + 1}`} className="w-16 h-16 object-cover rounded border border-white/20" onError={(e) => e.target.style.display = 'none'} />
                              <span className="text-sm text-gray-400">Preview</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'upload' && (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center bg-white/5 hover:bg-white/10 transition-colors">
                      <input type="file" id="image-upload" accept="image/*" onChange={(e) => { const file = e.target.files[0]; if (file) handleImageUpload(file); }} className="hidden" />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <svg className="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm text-gray-300">{uploadLoading ? 'Uploading...' : 'Click to upload images from your device'}</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG up to 5MB</p>
                      </label>
                    </div>
                    {uploadedImages.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {uploadedImages.map((imageUrl, index) => (
                          <div key={index} className="relative group">
                            <img src={imageUrl} alt={`Uploaded ${index + 1}`} className="w-full h-24 object-cover rounded-lg border border-white/20" />
                            <button type="button" onClick={() => removeUploadedImage(index)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {allImages.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-300 mb-3">All Product Images ({allImages.length})</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {allImages.map((imageUrl, index) => (
                        <div key={index} className="relative">
                          <img src={imageUrl} alt={`Product ${index + 1}`} className="w-full h-24 object-cover rounded-lg border border-white/20" onError={(e) => e.target.src = '/api/placeholder/100/100'} />
                          {index === 0 && <span className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">Main</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-white/20">
                <motion.button type="button" onClick={onClose} className="px-6 py-3 border border-white/20 rounded-lg text-gray-300 hover:bg-white/10 font-medium transition-all backdrop-blur-sm" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Cancel</motion.button>
                <motion.button type="submit" disabled={loading} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 font-medium shadow-lg transition-all duration-200" whileHover={{ scale: loading ? 1 : 1.05 }} whileTap={{ scale: loading ? 1 : 0.95 }}>
                  {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminProductModal;
