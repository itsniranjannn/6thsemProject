// Enhanced Recommendation utility functions
export const getRecommendations = async (productId, algorithm = 'ml', limit = 8) => {
  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let url = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/recommendations/product/${productId}?algorithm=${algorithm}&limit=${limit}`;
    
    // Use hybrid approach for better results
    if (algorithm === 'ml') {
      url = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/recommendations/hybrid/${productId}?limit=${limit}`;
    }

    console.log(`🔄 Fetching ${algorithm} recommendations from:`, url);

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to get recommendations');
    }

    console.log(`✅ Received ${data.recommendations?.length || 0} ${algorithm} recommendations`);
    
    return data;
  } catch (error) {
    console.error('❌ Error fetching recommendations:', error);
    
    // Return fallback data
    return {
      success: false,
      algorithm,
      recommendations: [],
      count: 0,
      error: error.message
    };
  }
};

export const getPersonalizedRecommendations = async (limit = 8) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(
      `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/recommendations/user/personalized?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching personalized recommendations:', error);
    return { success: false, recommendations: [] };
  }
};

export const getPopularProducts = async (limit = 8) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/recommendations/popular?limit=${limit}`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching popular products:', error);
    return { success: false, recommendations: [] };
  }
};

// Enhanced similarity calculation with more features
export const calculateSimilarity = (product1, product2) => {
  let score = 0;
  
  // Category match (highest weight)
  if (product1.category === product2.category) {
    score += 0.4;
  }
  
  // Price similarity
  const priceDiff = Math.abs((product1.price || 0) - (product2.price || 0));
  const maxPrice = Math.max(product1.price || 0, product2.price || 0);
  if (maxPrice > 0) {
    score += 0.3 * (1 - priceDiff / maxPrice);
  }
  
  // Featured products bonus
  if (product1.is_featured && product2.is_featured) {
    score += 0.15;
  }
  
  // New products bonus
  if (product1.is_new && product2.is_new) {
    score += 0.15;
  }
  
  return Math.min(1, score);
};

// Health check for recommendation service
export const checkRecommendationHealth = async () => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/recommendations/health`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Recommendation health check failed:', error);
    return { success: false, status: 'unreachable' };
  }
};