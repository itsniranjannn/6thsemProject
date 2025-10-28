// frontend/src/components/CategoryNavbar.js
import React, { useState, useEffect } from 'react';

const CategoryNavbar = ({ onCategorySelect, selectedCategory = 'all' }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products/categories`
      );
      if (response.ok) {
        const data = await response.json();
        setCategories(['all', ...data]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories(['all', 'Electronics', 'Clothing', 'Home', 'Sports', 'Books']);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-4 py-3 overflow-x-auto">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="w-24 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex space-x-1 py-3 overflow-x-auto scrollbar-hide">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => onCategorySelect(category)}
              className={`flex-shrink-0 px-6 py-2 rounded-full font-medium text-sm transition-all duration-300 transform hover:scale-105 whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 border border-gray-200'
              }`}
            >
              {category === 'all' ? '🌟 All Products' : category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryNavbar;