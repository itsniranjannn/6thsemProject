import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import PaymentFailedPage from './pages/PaymentFailedPage.js';
import EsewaPaymentPage from './pages/EsewaPaymentPage.js';
import OffersPage from './pages/OffersPage.js';
import AboutPage from './pages/AboutPage.js';
import UserDashboard from './pages/UserDashboard.js';
import './index.css';

// ✅ Layout wrapper with conditional Navbar/Footer
function Layout({ children }) {
  const location = useLocation();

  // Hide Navbar/Footer on admin, login, and register pages
  const hideLayout =
    location.pathname.startsWith('/admin') ||
    location.pathname === '/login' ||
    location.pathname === '/register';

  return (
    <div className="App min-h-screen flex flex-col">
      {!hideLayout && <Navbar />}
      <main className={`flex-1 ${!hideLayout ? 'pt-16' : ''}`}>{children}</main>
      {!hideLayout && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Layout>
            <Routes>
              {/* User routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-success" element={<OrderSuccessPage />} />
              <Route path="/esewa-payment" element={<EsewaPaymentPage />} />
              <Route path="/payment-failure" element={<PaymentFailedPage />} />
              <Route path="/offers" element={<OffersPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/dashboard" element={<UserDashboard />} />

              {/* Auth routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Admin route */}
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </Layout>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
