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

// Get all products - FIXED: Proper error handling and array validation
const getProducts = async (req, res) => {
  try {
    console.log('🔄 Fetching products from database...');
    const products = await Product.findAll();
    
    console.log('📦 Raw products data:', products);
    
    // FIXED: Ensure products is always an array
    if (!products || !Array.isArray(products)) {
      console.log('⚠️ Products is not an array, returning empty array');
      return res.json([]);
    }
    
    if (products.length === 0) {
      console.log('ℹ️ No products found in database');
      return res.json([]);
    }
    
    // Process products to ensure proper data format
    const processedProducts = products.map(product => {
      // Handle image_urls format
      let imageUrls = [];
      if (product.image_urls) {
        if (typeof product.image_urls === 'string') {
          try {
            const parsed = JSON.parse(product.image_urls);
            imageUrls = Array.isArray(parsed) ? parsed : [parsed];
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
      
      // Final fallback
      if (imageUrls.length === 0) {
        imageUrls = ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'];
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
      
      // Get real reviews data
      const rating = product.average_rating ? parseFloat(product.average_rating).toFixed(1) : "0.0";
      const reviewCount = product.review_count || 0;
      
      return {
        ...product,
        image_urls: imageUrls,
        tags: tags,
        rating: rating,
        reviewCount: reviewCount,
        is_featured: Boolean(product.is_featured),
        is_new: Boolean(product.is_new)
      };
    });
    
    console.log(`✅ Successfully processed ${processedProducts.length} products`);
    res.json(processedProducts);
  } catch (error) {
    console.error('❌ Get products error:', error);
    res.status(500).json({ 
      message: 'Error fetching products',
      error: error.message 
    });
  }
};

// Get single product with reviews
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
      
      // Final fallback
      if (imageUrls.length === 0) {
        imageUrls = ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'];
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
      
      // Get product reviews stats
      const reviews = await Product.getProductReviews(req.params.id);
      
      const processedProduct = {
        ...product,
        image_urls: imageUrls,
        tags: tags,
        rating: reviews.average_rating || "0.0",
        reviewCount: reviews.total_reviews || 0,
        reviews: reviews.reviews || []
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

// Get product categories - FIXED
const getProductCategories = async (req, res) => {
  try {
    const categories = await Product.getCategories();
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
};

// Get featured products with reviews
const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    const products = await Product.getFeaturedProducts(parseInt(limit));
    
    const processedProducts = await Promise.all(products.map(async (product) => {
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
      
      if (imageUrls.length === 0) {
        imageUrls = ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'];
      }
      
      // Get real reviews data for each product
      const reviews = await Product.getProductReviews(product.id);
      
      return {
        ...product,
        image_urls: imageUrls,
        rating: reviews.average_rating || "0.0",
        reviewCount: reviews.total_reviews || 0
      };
    }));
    
    res.json(processedProducts);
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ message: 'Error fetching featured products' });
  }
};

// Get new arrivals with reviews
const getNewArrivals = async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    const products = await Product.getNewArrivals(parseInt(limit));
    
    const processedProducts = await Promise.all(products.map(async (product) => {
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
      
      if (imageUrls.length === 0) {
        imageUrls = ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'];
      }
      
      // Get real reviews data for each product
      const reviews = await Product.getProductReviews(product.id);
      
      return {
        ...product,
        image_urls: imageUrls,
        rating: reviews.average_rating || "0.0",
        reviewCount: reviews.total_reviews || 0
      };
    }));
    
    res.json(processedProducts);
  } catch (error) {
    console.error('Get new arrivals error:', error);
    res.status(500).json({ message: 'Error fetching new arrivals' });
  }
};

// Get product offers
const getProductOffers = async (req, res) => {
  try {
    const offers = await Product.getActiveOffers();
    res.json(offers);
  } catch (error) {
    console.error('Get product offers error:', error);
    res.status(500).json({ message: 'Error fetching product offers' });
  }
};

// Create product (Admin only)
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
      discount_percentage
    } = req.body;
    
    // Validate required fields
    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Name, price, and category are required' });
    }

    // Handle image URLs
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
      image_urls: finalImageUrls,
      stock_quantity: parseInt(stock_quantity) || 0,
      tags: finalTags,
      is_featured: is_featured === 'true' || is_featured === true,
      is_new: is_new === 'true' || is_new === true,
      discount_percentage: parseFloat(discount_percentage) || 0
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
      updateData.image_urls = imageUrls;
    }
    
    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      const fileUrls = req.files.map(file => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`);
      let existingImages = updateData.image_urls || [];
      
      if (typeof existingImages === 'string') {
        try {
          existingImages = JSON.parse(existingImages);
        } catch {
          existingImages = [existingImages];
        }
      }
      
      const allImages = [...existingImages, ...fileUrls];
      updateData.image_urls = [...new Set(allImages)];
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
      updateData.tags = tags;
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
    
    const products = await Product.search(q);
    
    if (!Array.isArray(products)) {
      return res.json([]);
    }
    
    // Process products for consistent format
    const processedProducts = await Promise.all(products.map(async (product) => {
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
      
      if (imageUrls.length === 0) {
        imageUrls = ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'];
      }
      
      // Get real reviews data
      const reviews = await Product.getProductReviews(product.id);
      
      return {
        ...product,
        image_urls: imageUrls,
        rating: reviews.average_rating || "0.0",
        reviewCount: reviews.total_reviews || 0
      };
    }));
    
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
    
    if (!Array.isArray(products)) {
      return res.json([]);
    }
    
    // Process products for consistent format
    const processedProducts = await Promise.all(products.map(async (product) => {
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
      
      if (imageUrls.length === 0) {
        imageUrls = ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'];
      }
      
      // Get real reviews data
      const reviews = await Product.getProductReviews(product.id);
      
      return {
        ...product,
        image_urls: imageUrls,
        rating: reviews.average_rating || "0.0",
        reviewCount: reviews.total_reviews || 0
      };
    }));
    
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
  getProductCategories,
  getFeaturedProducts,
  getNewArrivals,
  getProductOffers,
  createProduct: [upload.array('images', 5), createProduct],
  updateProduct: [upload.array('images', 5), updateProduct],
  deleteProduct,
  searchProducts,
  getProductsByCategory,
  uploadProductImage: [upload.single('image'), uploadProductImage]
};