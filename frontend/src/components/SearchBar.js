// frontend/src/components/SearchBar.js - FIXED CLEAR ALL FUNCTIONALITY
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp, Filter } from 'lucide-react';

const SearchBar = ({ onSearch, placeholder = "Search products, categories, brands...", className = "" }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load search history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setSearchHistory(Array.isArray(parsedHistory) ? parsedHistory : []);
      } catch (error) {
        console.error('Error parsing search history:', error);
        setSearchHistory([]);
      }
    }
  }, []);

  // Fetch trending searches from backend
  const fetchTrendingSearches = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products/trending-searches`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.trendingSearches) {
          setTrendingSearches(data.trendingSearches);
        }
      }
    } catch (error) {
      console.error('Error fetching trending searches:', error);
      // Fallback trending searches
      setTrendingSearches(['smartphone', 'laptop', 'headphones', 'watch', 'camera']);
    }
  };

  // Save search to history - FIXED: Proper state and localStorage update
  const saveToSearchHistory = (searchTerm) => {
    if (!searchTerm.trim()) return;
    
    const cleanTerm = searchTerm.trim().toLowerCase();
    if (!cleanTerm) return;

    setSearchHistory(prevHistory => {
      const updatedHistory = [
        cleanTerm,
        ...prevHistory.filter(term => term.toLowerCase() !== cleanTerm)
      ].slice(0, 5); // Keep only last 5 searches
      
      // Update localStorage immediately
      localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
      return updatedHistory;
    });
  };

  // Handle search submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    saveToSearchHistory(query.trim());
    
    try {
      await onSearch(query.trim());
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
      setIsFocused(false);
    }
  };

  // Handle quick search from history or trending
  const handleQuickSearch = (searchTerm) => {
    setQuery(searchTerm);
    saveToSearchHistory(searchTerm);
    setIsLoading(true);
    
    setTimeout(() => {
      onSearch(searchTerm);
      setIsLoading(false);
      setIsFocused(false);
    }, 300);
  };

  // Clear search input
  const handleClearSearch = () => {
    setQuery('');
    onSearch(''); // Clear search results
    setIsFocused(false);
  };

  // Clear ALL search history - FIXED: Proper state and localStorage update
  const clearSearchHistory = () => {
    console.log('Clearing search history...'); // Debug log
    
    // Clear localStorage first
    localStorage.removeItem('searchHistory');
    
    // Then update state
    setSearchHistory([]);
    
    // Force re-render if needed
    setTimeout(() => {
      console.log('Search history cleared. Current state:', searchHistory); // Debug log
    }, 100);
  };

  // Clear single search history item
  const clearSingleSearchItem = (termToRemove, e) => {
    e.stopPropagation(); // Prevent triggering the search
    
    setSearchHistory(prevHistory => {
      const updatedHistory = prevHistory.filter(term => term !== termToRemove);
      localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
      return updatedHistory;
    });
  };

  // Keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.key === '/' || e.key === 'k') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        document.querySelector('input[type="text"]')?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className={`relative w-full max-w-2xl mx-auto ${className}`}>
      {/* Search Form */}
      <motion.form 
        onSubmit={handleSubmit}
        className="relative"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={`relative flex items-center bg-white/10 backdrop-blur-md border-2 transition-all duration-300 rounded-2xl overflow-hidden ${
          isFocused ? 'border-cyan-400 shadow-lg shadow-cyan-500/20' : 'border-cyan-500/30 hover:border-cyan-400/50'
        }`}>
          {/* Search Icon */}
          <div className="pl-4 pr-2">
            <Search className={`w-5 h-5 transition-colors duration-300 ${
              isFocused ? 'text-cyan-400' : 'text-gray-400'
            }`} />
          </div>
          
          {/* Search Input */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder={placeholder}
            className="w-full py-4 px-2 bg-transparent text-white placeholder-gray-400 outline-none text-lg font-medium"
            aria-label="Search products"
          />
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="pr-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full"
              />
            </div>
          )}
          
          {/* Clear Button */}
          {query && !isLoading && (
            <motion.button
              type="button"
              onClick={handleClearSearch}
              className="pr-3 text-gray-400 hover:text-white transition-colors duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Clear search"
            >
              <X className="w-5 h-5" />
            </motion.button>
          )}
          
          {/* Search Button */}
          <motion.button
            type="submit"
            disabled={!query.trim() || isLoading}
            className={`px-6 py-4 font-semibold transition-all duration-300 flex items-center gap-2 ${
              query.trim() && !isLoading
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
            whileHover={query.trim() && !isLoading ? { scale: 1.02 } : {}}
            whileTap={query.trim() && !isLoading ? { scale: 0.98 } : {}}
          >
            <Search className="w-4 h-4" />
            Search
          </motion.button>
        </div>
      </motion.form>

      {/* Search Suggestions Dropdown */}
      <AnimatePresence>
        {isFocused && (searchHistory.length > 0 || trendingSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-lg border border-cyan-500/30 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden"
          >
            {/* Search History */}
            {searchHistory.length > 0 && (
              <div className="p-4 border-b border-gray-700/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    Recent Searches
                  </h3>
                  <motion.button
                    onClick={clearSearchHistory}
                    className="text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="w-3 h-3" />
                    Clear all
                  </motion.button>
                </div>
                <div className="space-y-1">
                  {searchHistory.map((term, index) => (
                    <motion.div
                      key={`${term}-${index}`}
                      className="flex items-center justify-between group hover:bg-white/10 rounded-lg transition-all duration-200"
                      whileHover={{ x: 5 }}
                    >
                      <button
                        onClick={() => handleQuickSearch(term)}
                        className="flex-1 text-left px-3 py-2 rounded-lg flex items-center gap-3"
                      >
                        <Clock className="w-4 h-4 text-gray-500 group-hover:text-cyan-400" />
                        <span className="text-white group-hover:text-cyan-300 truncate">{term}</span>
                      </button>
                      <motion.button
                        onClick={(e) => clearSingleSearchItem(term, e)}
                        className="pr-3 text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label={`Remove ${term} from history`}
                      >
                        <X className="w-3 h-3" />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Searches */}
            {trendingSearches.length > 0 && (
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  Trending Now
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((term, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleQuickSearch(term)}
                      className="px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 rounded-full text-cyan-300 hover:text-cyan-200 text-sm transition-all duration-200 backdrop-blur-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      #{term}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Tips */}
            <div className="p-4 bg-black/20 border-t border-gray-700/50">
              <p className="text-xs text-gray-400 text-center">
                💡 Press Enter to search or select from suggestions
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Results Info (when searching) */}
      {query && !isFocused && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-center"
        >
          <p className="text-cyan-300 text-sm font-medium">
            🔍 Searching for: <span className="text-white font-semibold">"{query}"</span>
          </p>
        </motion.div>
      )}

      {/* Keyboard Shortcut Hint */}
      {!isFocused && !query && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-2 text-center"
        >
          <p className="text-gray-500 text-xs">
            Press <kbd className="px-2 py-1 bg-gray-700 rounded text-xs mx-1">/</kbd> 
            or <kbd className="px-2 py-1 bg-gray-700 rounded text-xs mx-1">Ctrl+K</kbd> to focus search
          </p>
        </motion.div>
      )}

    </div>
  );
};

export default SearchBar;