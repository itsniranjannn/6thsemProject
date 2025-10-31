import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { CartProvider } from './context/CartContext.js';
import Navbar from './components/Navbar.js';
import Footer from './components/Footer.js';
import HomePage from './pages/HomePage.js';
import ProductPage from './pages/ProductPage.js';
import CartPage from './pages/CartPage.js';
import CheckoutPage from './pages/CheckoutPage.js';
import AdminDashboard from './pages/AdminDashboard.js';
import LoginPage from './pages/LoginPage.js';
import RegisterPage from './pages/RegisterPage.js';
import PasswordResetPage from './pages/PasswordResetPage.js';
import OrderSuccessPage from './pages/OrderSuccessPage.js';
import PaymentFailedPage from './pages/PaymentFailedPage.js';
import EsewaPaymentPage from './pages/EsewaPaymentPage.js'; 
import OffersPage from './pages/OffersPage.js';
import AboutPage from './pages/AboutPage.js';
import UserDashboard from './pages/UserDashboard.js';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App min-h-screen flex flex-col">
            {/* Navbar is always visible but content has proper spacing */}
            <Navbar />
            
            {/* Main content with proper top padding */}
            <main className="flex-1 pt-16"> {/* Added pt-16 for navbar height */}
              <Routes>
                {/* All routes now have proper spacing */}
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/order-success" element={<OrderSuccessPage />} />
                <Route path="/esewa-payment" element={<EsewaPaymentPage />} />
                <Route path="/payment-failure" element={<PaymentFailedPage />} />
                <Route path="/offers" element={<OffersPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/dashboard" element={<UserDashboard />} />
                
                {/* Auth pages with proper spacing too */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/reset-password" element={<PasswordResetPage />} />
              </Routes>
            </main>
            
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;