// Recommendation utility functions
export const getRecommendations = async (productId) => {
  try {
    const response = await fetch(`http://localhost:5000/api/recommendations/${productId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
};

export const calculateSimilarity = (product1, product2) => {
  // Simple similarity calculation
  let score = 0;
  
  if (product1.category === product2.category) {
    score += 0.5;
  }
  
  const priceDiff = Math.abs(product1.price - product2.price);
  const maxPrice = Math.max(product1.price, product2.price);
  if (maxPrice > 0) {
    score += 0.3 * (1 - priceDiff / maxPrice);
  }
  
  return score;
};