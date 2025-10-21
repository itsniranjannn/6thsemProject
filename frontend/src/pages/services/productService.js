import API from './api';

export const productService = {
  getAllProducts: () => API.get('/products'),
  getProductById: (id) => API.get(`/products/${id}`),
  searchProducts: (query) => API.get(`/products/search?q=${query}`),
  getProductsByCategory: (category) => API.get(`/products/category/${category}`),
  getRecommendations: (productId) => API.get(`/recommendations/${productId}`),
  
  // Admin only
  createProduct: (productData) => API.post('/products', productData),
  updateProduct: (id, productData) => API.put(`/products/${id}`, productData),
  deleteProduct: (id) => API.delete(`/products/${id}`),
};