import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-gradient-to-r from-primary-900 to-primary-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">6</span>
            </div>
            <span className="text-xl font-bold">6thShop</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="hover:text-accent-500 transition-colors duration-200">
              Home
            </Link>
            <Link to="/products" className="hover:text-accent-500 transition-colors duration-200">
              Products
            </Link>
            
            {isAuthenticated && (
              <Link to="/cart" className="hover:text-accent-500 transition-colors duration-200">
                Cart
              </Link>
            )}

            {isAdmin && (
              <Link to="/admin" className="hover:text-accent-500 transition-colors duration-200">
                Admin
              </Link>
            )}

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-accent-500">Welcome, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-accent-500 hover:bg-accent-600 px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="hover:text-accent-500 transition-colors duration-200">
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-accent-500 hover:bg-accent-600 px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-accent-500 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-primary-600">
            <Link to="/" className="block hover:text-accent-500">Home</Link>
            <Link to="/products" className="block hover:text-accent-500">Products</Link>
            {isAuthenticated && <Link to="/cart" className="block hover:text-accent-500">Cart</Link>}
            {isAdmin && <Link to="/admin" className="block hover:text-accent-500">Admin</Link>}
            
            {isAuthenticated ? (
              <div className="pt-4 border-t border-primary-600">
                <span className="block text-accent-500 mb-2">Welcome, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-accent-500 hover:bg-accent-600 px-4 py-2 rounded-lg w-full text-center"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-primary-600 space-y-2">
                <Link to="/login" className="block hover:text-accent-500">Login</Link>
                <Link to="/register" className="block bg-accent-500 hover:bg-accent-600 px-4 py-2 rounded-lg text-center">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;