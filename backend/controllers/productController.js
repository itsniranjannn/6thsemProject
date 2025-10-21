const Product = require('../models/productModel');

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
};

// Get single product
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Error fetching product' });
  }
};

// Create product (Admin only)
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image_url, stock_quantity } = req.body;
    
    // Validate required fields
    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Name, price, and category are required' });
    }

    const result = await Product.create({
      name,
      description: description || '',
      price,
      category,
      image_url: image_url || 'https://via.placeholder.com/300',
      stock_quantity: stock_quantity || 0
    });
    
    res.status(201).json({ 
      message: 'Product created successfully', 
      productId: result.insertId 
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(400).json({ message: 'Error creating product' });
  }
};

// Update product (Admin only)
const updateProduct = async (req, res) => {
  try {
    await Product.update(req.params.id, req.body);
    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(400).json({ message: 'Error updating product' });
  }
};

// Delete product (Admin only)
const deleteProduct = async (req, res) => {
  try {
    await Product.delete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
};

// Search products
const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const products = await Product.searchProducts(q);
    res.json(products);
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ message: 'Error searching products' });
  }
};

// Get products by category
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.findByCategory(category);
    res.json(products);
  } catch (error) {
    console.error('Category products error:', error);
    res.status(500).json({ message: 'Error fetching category products' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductsByCategory
};