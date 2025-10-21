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
import OrderSuccessPage from './pages/OrderSuccessPage.js';
import PaymentDemoPage from './pages/PaymentDemoPage.js';
import PaymentFailurePage from './pages/PaymentFailurePage.js';
import './index.css';


function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/order-success" element={<OrderSuccessPage />} />
                <Route path="/payment-demo" element={<PaymentDemoPage />} />
                <Route path="/payment-failure" element={<PaymentFailurePage />} />
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