const Product = require('../models/productModel');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    
    // Process products to ensure proper data format
    const processedProducts = products.map(product => {
      // Handle image_urls format
      let imageUrls = [];
      if (product.image_urls) {
        if (typeof product.image_urls === 'string') {
          try {
            imageUrls = JSON.parse(product.image_urls);
          } catch {
            imageUrls = [product.image_urls];
          }
        } else if (Array.isArray(product.image_urls)) {
          imageUrls = product.image_urls;
        }
      }
      
      // Fallback to single image_url
      if (imageUrls.length === 0 && product.image_url) {
        imageUrls = [product.image_url];
      }
      
      // Handle tags format
      let tags = [];
      if (product.tags) {
        if (typeof product.tags === 'string') {
          try {
            tags = JSON.parse(product.tags);
          } catch {
            tags = product.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
          }
        } else if (Array.isArray(product.tags)) {
          tags = product.tags;
        }
      }
      
      return {
        ...product,
        image_urls: imageUrls,
        tags: tags,
        rating: parseFloat(product.rating || 0).toFixed(1),
        reviewCount: product.reviewCount || 0
      };
    });
    
    res.json(processedProducts);
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
      // Process product data format
      let imageUrls = [];
      if (product.image_urls) {
        if (typeof product.image_urls === 'string') {
          try {
            imageUrls = JSON.parse(product.image_urls);
          } catch {
            imageUrls = [product.image_urls];
          }
        } else if (Array.isArray(product.image_urls)) {
          imageUrls = product.image_urls;
        }
      }
      
      if (imageUrls.length === 0 && product.image_url) {
        imageUrls = [product.image_url];
      }
      
      let tags = [];
      if (product.tags) {
        if (typeof product.tags === 'string') {
          try {
            tags = JSON.parse(product.tags);
          } catch {
            tags = product.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
          }
        } else if (Array.isArray(product.tags)) {
          tags = product.tags;
        }
      }
      
      const processedProduct = {
        ...product,
        image_urls: imageUrls,
        tags: tags,
        rating: parseFloat(product.rating || 0).toFixed(1),
        reviewCount: product.reviewCount || 0
      };
      
      res.json(processedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Error fetching product' });
  }
};

// Create product (Admin only) with enhanced features and file upload
const createProduct = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      category, 
      image_urls, 
      stock_quantity, 
      tags, 
      is_featured, 
      is_new, 
      discount_percentage, 
      offer_valid_until 
    } = req.body;
    
    // Validate required fields
    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Name, price, and category are required' });
    }

    // Handle image URLs - support both file uploads and URLs
    let finalImageUrls = [];
    
    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      const fileUrls = req.files.map(file => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`);
      finalImageUrls = [...finalImageUrls, ...fileUrls];
    }
    
    // Handle URL images
    if (image_urls) {
      let urlImages = [];
      if (typeof image_urls === 'string') {
        try {
          urlImages = JSON.parse(image_urls);
        } catch {
          urlImages = [image_urls];
        }
      } else if (Array.isArray(image_urls)) {
        urlImages = image_urls;
      }
      finalImageUrls = [...finalImageUrls, ...urlImages.filter(url => url && url.trim() !== '')];
    }
    
    // Remove duplicates and ensure at least one image
    finalImageUrls = [...new Set(finalImageUrls)];
    if (finalImageUrls.length === 0) {
      finalImageUrls = ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'];
    }

    // Handle tags
    let finalTags = [];
    if (tags) {
      if (typeof tags === 'string') {
        try {
          finalTags = JSON.parse(tags);
        } catch {
          finalTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }
      } else if (Array.isArray(tags)) {
        finalTags = tags;
      }
    }

    const result = await Product.create({
      name,
      description: description || '',
      price: parseFloat(price),
      category,
      image_urls: JSON.stringify(finalImageUrls), // Store as JSON string
      stock_quantity: parseInt(stock_quantity) || 0,
      tags: JSON.stringify(finalTags), // Store as JSON string
      is_featured: is_featured === 'true' || is_featured === true,
      is_new: is_new === 'true' || is_new === true,
      discount_percentage: parseFloat(discount_percentage) || 0,
      offer_valid_until: offer_valid_until || null
    });
    
    res.status(201).json({ 
      success: true,
      message: 'Product created successfully', 
      productId: result.insertId 
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(400).json({ message: 'Error creating product: ' + error.message });
  }
};

// Update product (Admin only)
const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const updateData = { ...req.body };
    
    // Handle image URLs
    if (updateData.image_urls) {
      let imageUrls = [];
      if (typeof updateData.image_urls === 'string') {
        try {
          imageUrls = JSON.parse(updateData.image_urls);
        } catch {
          imageUrls = [updateData.image_urls];
        }
      } else if (Array.isArray(updateData.image_urls)) {
        imageUrls = updateData.image_urls;
      }
      updateData.image_urls = JSON.stringify(imageUrls);
    }
    
    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      const fileUrls = req.files.map(file => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`);
      let existingImages = [];
      
      if (updateData.image_urls) {
        try {
          existingImages = JSON.parse(updateData.image_urls);
        } catch {
          existingImages = [updateData.image_urls];
        }
      }
      
      const allImages = [...existingImages, ...fileUrls];
      updateData.image_urls = JSON.stringify([...new Set(allImages)]);
    }
    
    // Handle tags
    if (updateData.tags) {
      let tags = [];
      if (typeof updateData.tags === 'string') {
        try {
          tags = JSON.parse(updateData.tags);
        } catch {
          tags = updateData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }
      } else if (Array.isArray(updateData.tags)) {
        tags = updateData.tags;
      }
      updateData.tags = JSON.stringify(tags);
    }
    
    // Convert boolean strings to actual booleans
    if (updateData.is_featured !== undefined) {
      updateData.is_featured = updateData.is_featured === 'true' || updateData.is_featured === true;
    }
    if (updateData.is_new !== undefined) {
      updateData.is_new = updateData.is_new === 'true' || updateData.is_new === true;
    }
    
    // Convert numeric fields
    if (updateData.price !== undefined) {
      updateData.price = parseFloat(updateData.price);
    }
    if (updateData.stock_quantity !== undefined) {
      updateData.stock_quantity = parseInt(updateData.stock_quantity);
    }
    if (updateData.discount_percentage !== undefined) {
      updateData.discount_percentage = parseFloat(updateData.discount_percentage);
    }
    
    await Product.update(productId, updateData);
    res.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(400).json({ message: 'Error updating product: ' + error.message });
  }
};

// Delete product (Admin only)
const deleteProduct = async (req, res) => {
  try {
    await Product.delete(req.params.id);
    res.json({ success: true, message: 'Product deleted successfully' });
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
    
    // Process products for consistent format
    const processedProducts = products.map(product => {
      let imageUrls = [];
      if (product.image_urls) {
        if (typeof product.image_urls === 'string') {
          try {
            imageUrls = JSON.parse(product.image_urls);
          } catch {
            imageUrls = [product.image_urls];
          }
        } else if (Array.isArray(product.image_urls)) {
          imageUrls = product.image_urls;
        }
      }
      
      if (imageUrls.length === 0 && product.image_url) {
        imageUrls = [product.image_url];
      }
      
      return {
        ...product,
        image_urls: imageUrls,
        rating: parseFloat(product.rating || 0).toFixed(1)
      };
    });
    
    res.json(processedProducts);
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
    
    // Process products for consistent format
    const processedProducts = products.map(product => {
      let imageUrls = [];
      if (product.image_urls) {
        if (typeof product.image_urls === 'string') {
          try {
            imageUrls = JSON.parse(product.image_urls);
          } catch {
            imageUrls = [product.image_urls];
          }
        } else if (Array.isArray(product.image_urls)) {
          imageUrls = product.image_urls;
        }
      }
      
      if (imageUrls.length === 0 && product.image_url) {
        imageUrls = [product.image_url];
      }
      
      return {
        ...product,
        image_urls: imageUrls,
        rating: parseFloat(product.rating || 0).toFixed(1)
      };
    });
    
    res.json(processedProducts);
  } catch (error) {
    console.error('Category products error:', error);
    res.status(500).json({ message: 'Error fetching category products' });
  }
};

// Upload product image
const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: 'Error uploading image' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct: [upload.array('images', 5), createProduct],
  updateProduct: [upload.array('images', 5), updateProduct],
  deleteProduct,
  searchProducts,
  getProductsByCategory,
  uploadProductImage: [upload.single('image'), uploadProductImage]
};