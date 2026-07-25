# SmartShop - Multi-Category E-Commerce System

## Comprehensive Technical Documentation

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Directory Structure](#directory-structure)
4. [Database Schema](#database-schema)
5. [Backend Architecture](#backend-architecture)
6. [Frontend Architecture](#frontend-architecture)
7. [Authentication System](#authentication-system)
8. [Payment Integration](#payment-integration)
9. [Recommendation Engine](#recommendation-engine)
10. [API Reference](#api-reference)
11. [Workflows](#workflows)
12. [Security Features](#security-features)

---

## 🎯 System Overview

SmartShop (Nexus Store) is a full-stack multi-category e-commerce platform built with **React.js** frontend and **Node.js/Express** backend, using **MySQL** as the database. The system supports multiple product categories including Electronics, Mobile Phones, Clothing, Footwear, Accessories, Home & Kitchen, Beauty & Personal Care, and Sports & Outdoors.

### Key Features:

- 🛍️ Multi-category product browsing with search functionality
- 🔐 JWT-based authentication with email verification (6-digit codes)
- 🛒 Shopping cart with offer/discount support (BOGO, flat, percentage, bulk, clearance, flash)
- 💳 Multiple payment gateways (Stripe, eSewa, Khalti, COD)
- 📧 Transactional email notifications (order confirmations, etc.)
- 🤖 ML-powered product recommendations
- 📊 Admin dashboard for product, order, and user management
- 🧾 Category-aware promo logic with eligible-item discount breakdown
- 🛡️ Admin purchase/cart restrictions enforced at API layer
- 📱 Responsive design with Tailwind CSS
- 📄 PDF invoice generation

---

## 🛠️ Technology Stack

### Backend

| Technology | Version | Purpose                      |
| ---------- | ------- | ---------------------------- |
| Node.js    | -       | Runtime environment          |
| Express.js | 5.1.0   | Web framework                |
| MySQL      | -       | Database (via mysql2 3.15.2) |
| JWT        | 9.0.2   | Authentication tokens        |
| bcryptjs   | 3.0.2   | Password hashing             |
| Multer     | 2.0.2   | File upload handling         |
| Stripe     | 19.1.0  | Payment processing           |
| Nodemailer | 7.0.9   | Email service                |
| PDFKit     | 0.17.2  | Invoice generation           |
| Axios      | 1.12.2  | HTTP client                  |

### Frontend

| Technology       | Version  | Purpose             |
| ---------------- | -------- | ------------------- |
| React            | 18.3.1   | UI library          |
| React Router DOM | 7.9.4    | Client-side routing |
| Tailwind CSS     | 3.4.18   | Styling framework   |
| Framer Motion    | 12.23.24 | Animations          |
| Lucide React     | 0.548.0  | Icons               |
| Axios            | 1.12.2   | HTTP client         |

---

## 📁 Directory Structure

```
smartshop/
├── backend/
│   ├── config/
│   │   └── db.js                    # MySQL connection pool configuration
│   │
│   ├── controllers/
│   │   ├── cartController.js        # Cart CRUD operations
│   │   ├── emailController.js       # Email sending logic (verification, orders)
│   │   ├── offerController.js       # Product offers management
│   │   ├── orderController.js       # Order creation, status, analytics
│   │   ├── paymentController.js     # Stripe, eSewa, Khalti, COD processing
│   │   ├── productController.js     # Product CRUD, search, categories
│   │   ├── promoController.js       # Promo code management
│   │   ├── reviewController.js      # Product reviews
│   │   ├── userController.js        # Registration, login, profile
│   │   └── userDashboardController.js # User order history, stats
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT verification, admin check
│   │   └── uploadMiddleware.js      # Multer configuration for images
│   │
│   ├── migrations/                  # Database migration files
│   │
│   ├── models/
│   │   ├── cartModel.js             # Cart operations with offer calculations
│   │   ├── orderModel.js            # Order creation, items, tracking
│   │   ├── paymentModel.js          # Payment records
│   │   ├── productModel.js          # Product queries with reviews
│   │   ├── promoModel.js            # Promo code validation
│   │   ├── reviewModel.js           # Review CRUD
│   │   └── userModel.js             # User authentication, verification
│   │
│   ├── routes/
│   │   ├── adminRoutes.js           # Admin-only endpoints
│   │   ├── cartRoutes.js            # /api/cart/*
│   │   ├── emailRoutes.js           # Email endpoints
│   │   ├── offerRoutes.js           # /api/offers/*
│   │   ├── orderRoutes.js           # /api/orders/*
│   │   ├── paymentRoutes.js         # /api/payments/*
│   │   ├── productRoutes.js         # /api/products/*
│   │   ├── promoRoutes.js           # /api/promo/*
│   │   ├── recommendationRoutes.js  # /api/recommendations/*
│   │   ├── reviewRoutes.js          # /api/reviews/*
│   │   ├── userDashboardRoutes.js   # /api/user-dashboard/*
│   │   └── userRoutes.js            # /api/users/*
│   │
│   ├── utils/
│   │   └── recommendation.js        # ML recommendation engine
│   │
│   ├── uploads/                     # Uploaded product images
│   ├── server.js                    # Express app entry point
│   ├── package.json
│   └── .env                         # Environment variables
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   │   ├── AdminLayout.js           # Admin sidebar navigation
│   │   │   │   ├── AdminProductModal.js     # Product edit/create modal
│   │   │   │   ├── Dashboard.js             # Admin overview stats
│   │   │   │   ├── NotificationsManagement.js
│   │   │   │   ├── OffersManagement.js      # BOGO, discounts management
│   │   │   │   ├── OrdersManagement.js      # Order status updates
│   │   │   │   ├── ProductsManagement.js    # Product CRUD interface
│   │   │   │   ├── PromoCodesManagement.js  # Promo codes CRUD
│   │   │   │   └── UsersManagement.js       # User list/management
│   │   │   │
│   │   │   ├── CategoryNavbar.js    # Category filter navigation
│   │   │   ├── ConfirmationModel.js # Confirmation dialogs
│   │   │   ├── Footer.js            # Site footer
│   │   │   ├── Navbar.js            # Main navigation with cart count
│   │   │   ├── NotificationCenter.js # User notifications
│   │   │   ├── ProductCard.js       # Product display component
│   │   │   ├── ProductModal.js      # Quick view modal
│   │   │   ├── ReviewModal.js       # Product review form
│   │   │   ├── SearchBar.js         # Global search component
│   │   │   ├── SupportWidget.js     # Customer support chat widget
│   │   │   └── Toast.js             # Notification toasts
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.js       # Authentication state management
│   │   │   └── CartContext.js       # Cart state management
│   │   │
│   │   ├── pages/
│   │   │   ├── services/
│   │   │   │   ├── api.js           # API base configuration
│   │   │   │   └── productService.js # Product API calls
│   │   │   │
│   │   │   ├── AboutPage.js         # About us page
│   │   │   ├── AdminDashboard.js    # Admin panel container
│   │   │   ├── CartPage.js          # Shopping cart view
│   │   │   ├── CheckoutPage.js      # Checkout process
│   │   │   ├── EsewaPaymentPage.js  # eSewa payment handling
│   │   │   ├── HomePage.js          # Landing page with featured products
│   │   │   ├── LoginPage.js         # Login with verification
│   │   │   ├── OffersPage.js        # Active offers/deals page
│   │   │   ├── OrderSuccessPage.js  # Order confirmation
│   │   │   ├── PaymentFailedPage.js # Payment failure handler
│   │   │   ├── ProductPage.js       # Product listing/details
│   │   │   ├── RegisterPage.js      # Registration with email verify
│   │   │   └── UserDashboard.js     # User profile, order history
│   │   │
│   │   ├── utils/
│   │   │   └── recommendation.js    # Frontend recommendation helpers
│   │   │
│   │   ├── App.js                   # Main app with routing
│   │   ├── App.css
│   │   ├── index.js                 # React entry point
│   │   └── index.css                # Tailwind imports
│   │
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env
│
├── smartshops.sql                   # Complete database schema with sample data
├── smartsh.sql                      # Alternative SQL dump
└── README.md
```

---

## 🗄️ Database Schema

### Core Tables

#### `users`

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,           -- bcrypt hashed
  role ENUM('user', 'admin') DEFAULT 'user',
  email_verified TINYINT(1) DEFAULT 0,
  email_verification_token VARCHAR(10),      -- 6-digit code
  email_verification_expires DATETIME,
  password_reset_token VARCHAR(10),
  password_reset_expires DATETIME,
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Nepal',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `products`

```sql
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  image_url VARCHAR(500),
  image_urls JSON,                           -- Multiple product images
  tags JSON,                                 -- Product tags for search
  is_featured TINYINT(1) DEFAULT 0,
  is_new TINYINT(1) DEFAULT 0,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  stock_quantity INT DEFAULT 0,
  min_stock_level INT DEFAULT 5,
  rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `orders`

```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT REFERENCES users(id),
  total_amount DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) DEFAULT 0,
  shipping_fee DECIMAL(10,2) DEFAULT 0,
  status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  shipping_address TEXT,                     -- JSON stored as text
  tracking_number VARCHAR(100),
  estimated_delivery DATE,
  promo_code VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `order_items`

```sql
CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT REFERENCES orders(id),
  product_id INT REFERENCES products(id),
  quantity INT,
  price DECIMAL(10,2)
);
```

#### `cart`

```sql
CREATE TABLE cart (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT REFERENCES users(id),
  product_id INT REFERENCES products(id),
  quantity INT DEFAULT 1,
  offer_id INT REFERENCES product_offers(id),
  offer_type VARCHAR(50),
  original_price DECIMAL(10,2),
  final_price DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `product_offers`

```sql
CREATE TABLE product_offers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT REFERENCES products(id),
  offer_type ENUM('Bogo', 'flat_discount', 'percentage_discount', 'bulk_discount', 'clearance_sale', 'flash_sale'),
  discount_percentage DECIMAL(5,2),
  discount_amount DECIMAL(10,2),
  min_quantity INT DEFAULT 1,
  max_quantity INT,
  valid_from DATETIME,
  valid_until DATETIME,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `promo_codes`

```sql
CREATE TABLE promo_codes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type ENUM('percentage', 'fixed', 'free_shipping'),
  discount_value DECIMAL(10,2),
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_uses INT,
  valid_from DATETIME,
  valid_until DATETIME,
  is_active TINYINT(1) DEFAULT 1,
  categories JSON,                           -- Category restrictions
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `reviews`

```sql
CREATE TABLE reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT REFERENCES users(id),
  product_id INT REFERENCES products(id),
  rating INT CHECK(rating BETWEEN 1 AND 5),
  comment TEXT,
  user_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `payments`

```sql
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT REFERENCES orders(id),
  payment_method VARCHAR(50),
  payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  transaction_id VARCHAR(255),
  amount DECIMAL(10,2),
  payment_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `notifications`

```sql
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) DEFAULT 'Notification',
  message TEXT NOT NULL,
  type ENUM('info', 'success', 'warning', 'error', 'promotion', 'system', 'order', 'payment', 'promo', 'offer'),
  image_url VARCHAR(500),
  target_users ENUM('all', 'specific') DEFAULT 'all',
  user_ids JSON,
  expires_at DATETIME,
  created_by INT REFERENCES users(id),
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## ⚙️ Backend Architecture

### Server Configuration (`server.js`)

```javascript
// Key configuration points:
- Express 5.1 with modern features
- CORS enabled for cross-origin requests
- Stripe webhook route BEFORE JSON parsing (raw body required)
- Static file serving for uploads
- Health check endpoint at /api/health
- Production mode serves React build files
- Keep-alive timeout extended to 120s
```

### Middleware

#### Authentication (`authMiddleware.js`)

```javascript
// JWT Token Verification Flow:
1. Extract Bearer token from Authorization header
2. Verify token using JWT_SECRET
3. Fetch user from database by decoded ID
4. Attach user object to request (req.user)
5. Admin middleware checks req.user.role === 'admin'
```

#### File Upload (`uploadMiddleware.js`)

```javascript
// Multer Configuration:
- Storage: disk storage in /uploads directory
- Filename: unique timestamp + random string + original extension
- File filter: only image/* MIME types allowed
- Size limit: 5MB maximum
```

### Model Layer Pattern

All models follow a **static class pattern** with async/await:

```javascript
class Model {
  static async create(data) { ... }
  static async findById(id) { ... }
  static async findAll(limit, offset) { ... }
  static async update(id, data) { ... }
  static async delete(id) { ... }
}
```

### Key Algorithms

#### Password Hashing

```javascript
// Using bcryptjs with 12 salt rounds
const hashedPassword = await bcrypt.hash(password, 12);
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

#### 6-Digit Verification Code Generation

```javascript
const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
const expiresIn = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
```

#### Tracking Number Generation

```javascript
const trackingNumber = `TRK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
```

---

## 🎨 Frontend Architecture

### State Management

The application uses **React Context API** for global state:

#### AuthContext

```javascript
// Provides:
- user: Current user object
- login(email, password): Async login function
- register(name, email, password, ...): Async registration
- verifyEmail(code, email): Email verification
- resetPassword(code, newPassword, email): Password reset
- logout(): Clear session
- updateProfile(data): Update user info
- isAuthenticated: Boolean
- isAdmin: Boolean
- isEmailVerified: Boolean
```

#### CartContext

```javascript
// Provides:
- cartItems: Array of cart items
- addToCart(product, quantity): Add item with offer support
- updateCartItem(productId, quantity, offerId): Update quantity
- removeFromCart(productId, offerId): Remove item
- clearCart(): Empty cart after order
- getCartTotal(): Calculate total price
- getCartSummary(): Get subtotal, shipping, total
- forceRefreshCart(): Sync with server
```

### Routing Structure

```javascript
// App.js Routes:
<Routes>
  {/* Public */}
  <Route path="/" element={<HomePage />} />
  <Route path="/products" element={<ProductPage />} />
  <Route path="/offers" element={<OffersPage />} />
  <Route path="/about" element={<AboutPage />} />

  {/* Auth */}
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />

  {/* Protected */}
  <Route path="/cart" element={<CartPage />} />
  <Route path="/checkout" element={<CheckoutPage />} />
  <Route path="/dashboard" element={<UserDashboard />} />
  <Route path="/order-success" element={<OrderSuccessPage />} />

  {/* Payment */}
  <Route path="/esewa-payment" element={<EsewaPaymentPage />} />
  <Route path="/payment-failure" element={<PaymentFailedPage />} />
  <Route path="/payment-failed" element={<PaymentFailedPage />} />

  {/* Admin */}
  <Route path="/admin" element={<AdminDashboard />} />
</Routes>
```

### Layout System

```javascript
// Conditional layout wrapper:
- Hides Navbar/Footer on: /admin, /login, /register
- Adds pt-16 padding when Navbar is visible
- Footer appears at bottom of all public pages
```

---

## 🔐 Authentication System

### Registration Flow

```
1. User submits registration form
   ↓
2. Backend validates required fields (name, email, password)
   ↓
3. Check if email already exists
   ↓
4. Hash password with bcrypt (12 rounds)
   ↓
5. Generate 6-digit verification code
   ↓
6. Store user with email_verified = false
   ↓
7. Send verification email via Nodemailer
   ↓
8. Return JWT token + user data + requiresVerification flag
   ↓
9. Frontend redirects to verification input
   ↓
10. User enters 6-digit code
   ↓
11. Backend verifies code + email + expiry (10 min)
   ↓
12. Set email_verified = true, clear token
   ↓
13. Send welcome email
   ↓
14. User can now login
```

### Login Flow

```
1. User submits email + password
   ↓
2. Find user by email
   ↓
3. Compare password with bcrypt
   ↓
4. Check email_verified status
   ↓
5. If not verified → return requiresVerification error
   ↓
6. Generate JWT token (30 day expiry)
   ↓
7. Return user data + token
   ↓
8. Frontend stores in localStorage
```

### Password Reset Flow

```
1. User requests reset via email
   ↓
2. Generate 6-digit reset code (10 min expiry)
   ↓
3. Store in password_reset_token field
   ↓
4. Send reset email
   ↓
5. User enters code + new password
   ↓
6. Verify code + email + expiry
   ↓
7. Hash new password, update user
   ↓
8. Clear reset token
   ↓
9. Send password changed confirmation email
```

---

## 💳 Payment Integration

### Supported Payment Methods

| Method           | Status    | Integration Type        |
| ---------------- | --------- | ----------------------- |
| Stripe           | ✅ Active | Server-side, Webhook    |
| eSewa            | ✅ Active | Form redirect, Callback |
| Khalti           | ✅ Active | API integration         |
| Cash on Delivery | ✅ Active | Direct order creation   |

### Stripe Payment Flow

```
1. Frontend calls /api/payments/stripe
   ↓
2. Backend creates Stripe Checkout Session with:
   - Line items from cart
   - Success/Cancel URLs
   - Metadata (orderId, userId)
   ↓
3. Return session.url to frontend
   ↓
4. Redirect user to Stripe Checkout
   ↓
5. User completes payment
   ↓
6. Stripe sends webhook to /api/payments/stripe/webhook
   ↓
7. Verify webhook signature
   ↓
8. On checkout.session.completed:
   - Update order status → 'confirmed'
   - Update payment_status → 'completed'
   - Generate tracking number
   - Deduct stock only when payment_status is completed and order status is confirmed
   - Clear user's cart
   - Send order confirmation email
   ↓
9. Redirect to /order-success
```

### eSewa Payment Flow

```
1. Frontend calls /api/payments/esewa/initiate
   ↓
2. Backend generates HMAC-SHA256 signature:
   message = "total_amount=${amount},transaction_uuid=${uuid},product_code=EPAYTEST"
   signature = HMAC(secretKey, message).base64()
   ↓
3. Return form data for POST to eSewa
   ↓
4. Frontend auto-submits form to eSewa gateway
   ↓
5. User completes payment on eSewa
   ↓
6. eSewa redirects to success/failure URL with params
   ↓
7. Backend verifies signature (or bypasses in dev mode)
   ↓
8. Process order completion
```

### eSewa Signature Generation

```javascript
const generateEsewaSignature = (data) => {
  const { total_amount, transaction_uuid, product_code = "EPAYTEST" } = data;
  const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;

  return crypto
    .createHmac("sha256", secretKey)
    .update(message)
    .digest("base64");
};
```

---

## 🤖 Recommendation Engine

### Algorithm Types

The system implements **three recommendation strategies**:

#### 1. Content-Based Filtering (`getRelatedProducts`)

```javascript
// Finds similar products based on:
- Category match (weight: 3)
- Price similarity within 30% range (weight: 2)
- Excludes current product
- Fallback to popular products if no matches
```

#### 2. Collaborative Filtering (`getUserRecommendations`)

```javascript
// Based on user purchase history:
1. Get user's purchased product IDs
2. Find other users who bought same products
3. Get products those users also bought (but current user hasn't)
4. Rank by purchase count
5. Fallback to popular products if no data and include algorithm_used metadata
```

#### 3. ML-Based Recommendations (`getMLRecommendations`)

```javascript
// Enhanced feature vector approach:

createEnhancedProductVectors(products):
  For each product, create vector with:
  1. Category one-hot encoding (N categories)
  2. Normalized price (0-1)
  3. Featured flag (0/1)
  4. New product flag (0/1)
  5. Normalized stock quantity (0-1)
  6. Discount percentage (0-1)
  7. Product age factor (newer = higher)
  8. Price tier (budget=0, mid=0.5, premium=1)

cosineSimilarity(vecA, vecB):
  dotProduct = Σ(vecA[i] * vecB[i])
  normA = √Σ(vecA[i]²)
  normB = √Σ(vecB[i]²)
  return dotProduct / (normA * normB)

// Filter recommendations with similarity > 0.1
// Return top N matches sorted by similarity
```

#### 4. Hybrid Recommendations (`getHybridRecommendations`)

```javascript
// Combines all three methods:
1. Get ML recommendations
2. Get content-based recommendations
3. Get popular products
4. Merge and deduplicate
5. Return top N unique results
```

### Popularity Score Formula

```javascript
popularity_score =
  purchase_count * 2 + (is_featured ? 3 : 0) + (is_new ? 2 : 0);
```

---

## 📡 API Reference

### User Endpoints

| Method | Endpoint                         | Auth | Description            |
| ------ | -------------------------------- | ---- | ---------------------- |
| POST   | `/api/users/register`            | ❌   | Register new user      |
| POST   | `/api/users/login`               | ❌   | Login user             |
| POST   | `/api/users/verify-email`        | ❌   | Verify 6-digit code    |
| POST   | `/api/users/resend-verification` | ❌   | Resend verification    |
| POST   | `/api/users/forgot-password`     | ❌   | Request password reset |
| POST   | `/api/users/reset-password`      | ❌   | Reset with code        |
| GET    | `/api/users/profile`             | ✅   | Get user profile       |
| PUT    | `/api/users/profile`             | ✅   | Update profile         |

### Product Endpoints

| Method | Endpoint                           | Auth  | Description           |
| ------ | ---------------------------------- | ----- | --------------------- |
| GET    | `/api/products`                    | ❌    | Get all products      |
| GET    | `/api/products/:id`                | ❌    | Get single product    |
| GET    | `/api/products/categories`         | ❌    | Get all categories    |
| GET    | `/api/products/featured`           | ❌    | Get featured products |
| GET    | `/api/products/new-arrivals`       | ❌    | Get new products      |
| GET    | `/api/products/search?q=`          | ❌    | Search products       |
| GET    | `/api/products/category/:category` | ❌    | Filter by category    |
| POST   | `/api/products`                    | Admin | Create product        |
| PUT    | `/api/products/:id`                | Admin | Update product        |
| DELETE | `/api/products/:id`                | Admin | Delete product        |

### Cart Endpoints

| Method | Endpoint                      | Auth | Description       |
| ------ | ----------------------------- | ---- | ----------------- |
| GET    | `/api/cart`                   | ✅   | Get user's cart   |
| POST   | `/api/cart/add`               | ✅   | Add item to cart  |
| PUT    | `/api/cart/update/:productId` | ✅   | Update quantity   |
| DELETE | `/api/cart/remove/:productId` | ✅   | Remove item       |
| DELETE | `/api/cart/clear`             | ✅   | Clear entire cart |
| POST   | `/api/cart/validate`          | ✅   | Validate stock    |

**Note:** Admin accounts are blocked from cart mutation endpoints (`add`, `update`, `remove`, `clear`, `merge`).

### Order Endpoints

| Method | Endpoint                           | Auth  | Description       |
| ------ | ---------------------------------- | ----- | ----------------- |
| POST   | `/api/orders`                      | ✅    | Create order      |
| GET    | `/api/orders/my-orders`            | ✅    | Get user's orders |
| GET    | `/api/orders/:id`                  | ✅    | Get order details |
| GET    | `/api/orders`                      | Admin | Get all orders    |
| PUT    | `/api/orders/:id/status`           | Admin | Update status     |
| POST   | `/api/orders/:id/generate-invoice` | ✅    | Generate PDF      |

### Payment Endpoints

| Method | Endpoint                                       | Auth | Description       |
| ------ | ---------------------------------------------- | ---- | ----------------- |
| POST   | `/api/payments/stripe`                         | ✅   | Stripe checkout   |
| POST   | `/api/payments/stripe/webhook`                 | ❌   | Stripe webhook    |
| GET    | `/api/payments/stripe/success`                 | ❌   | Stripe callback   |
| POST   | `/api/payments/esewa`                          | ✅   | eSewa initiation  |
| GET    | `/api/payments/esewa/success`                  | ❌   | eSewa callback    |
| POST   | `/api/payments/khalti`                         | ✅   | Khalti initiation |
| GET    | `/api/payments/khalti/callback`                | ❌   | Khalti callback   |
| POST   | `/api/payments/khalti/verify`                  | ✅   | Khalti verify     |
| POST   | `/api/payments/cod`                            | ✅   | Cash on Delivery  |

**Note:** Admin accounts are blocked from payment creation endpoints (`stripe`, `khalti`, `esewa`, `cod`).

### Recommendation Endpoints

| Method | Endpoint                                 | Auth | Description            |
| ------ | ---------------------------------------- | ---- | ---------------------- |
| GET    | `/api/recommendations/product/:id`       | ❌   | Product-based recs     |
| GET    | `/api/recommendations/hybrid/:id`        | ❌   | Hybrid recommendations |
| GET    | `/api/recommendations/user/personalized` | ✅   | User-based recs        |
| GET    | `/api/recommendations/popular`           | ❌   | Popular products       |
| GET    | `/api/recommendations/health`            | ❌   | Service health check   |

**Recommendation response guarantees**
- `rating` and `reviewCount` are always included.
- `image_urls` is normalized; fallback order: `image_urls` → `image_url` → `/placeholder.jpg`.
- `limit` is clamped to 1..50 (default 8).
- `algorithm=collaborative` without logged-in user returns `algorithm_used: "content (fallback)"`.

---

## 🔄 Workflows

### Complete Order Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER JOURNEY                              │
└─────────────────────────────────────────────────────────────┘

1. BROWSE PRODUCTS
   └── HomePage → ProductPage → ProductCard
       └── Click product → ProductModal (quick view)
       └── View details → Product reviews, images, related items

2. ADD TO CART
   └── Click "Add to Cart"
       └── If offer exists → Apply BOGO/discount pricing
       └── CartContext.addToCart()
       └── API: POST /api/cart/add
       └── Toast notification: "Added to cart!"

3. VIEW CART
   └── CartPage → List all items
       └── Update quantities → PUT /api/cart/update/:id
       └── Remove items → DELETE /api/cart/remove/:id
       └── Calculate subtotal + Rs.50 shipping

4. CHECKOUT
   └── CheckoutPage
       └── Enter/confirm shipping address
       └── Select payment method:
           ├── Stripe → Redirect to Stripe Checkout
           ├── eSewa → Form POST to eSewa gateway
           ├── Khalti → Khalti payment widget
           └── COD → Direct order creation

5. PAYMENT PROCESSING
   └── On success:
       ├── Create order record
       ├── Add order items
       ├── Update stock quantities only for successful confirmed orders
       ├── Clear user's cart
       ├── Generate tracking number
       ├── Send confirmation email
       └── Redirect to OrderSuccessPage

6. POST-ORDER
   └── UserDashboard
       ├── View order history
       ├── Track order status
       ├── Download invoice (PDF)
       └── Leave product reviews
```

### Admin Product Management

```
1. Login as admin → AdminDashboard
   ↓
2. ProductsManagement component
   ↓
3. CREATE PRODUCT:
   - Fill form (name, price, category, description)
   - Upload images (up to 5)
   - Set featured/new flags
   - Set discount percentage
   - Submit → POST /api/products
   ↓
4. UPDATE PRODUCT:
   - Click edit on product row
   - AdminProductModal opens
   - Modify fields
   - Submit → PUT /api/products/:id
   ↓
5. DELETE PRODUCT:
   - Click delete
   - Confirmation modal
   - Confirm → DELETE /api/products/:id
```

### Offer/Discount Application

```
BOGO (Buy One Get One) Calculation:

quantity = 2, price = Rs. 1000

paidItems = Math.ceil(quantity / 2) = 1
finalPrice = price * paidItems = Rs. 1000
unitPrice = finalPrice / quantity = Rs. 500

Display: "Pay Rs. 1000 for 2 items (Rs. 500 each)"
Savings: Rs. 1000 (50% off)
```

---

## 🔒 Security Features

### Password Security

- **bcryptjs** with 12 salt rounds
- Minimum 6 character requirement
- Password reset via time-limited codes

### Authentication Security

- **JWT tokens** with 30-day expiry
- Token stored in localStorage (consider httpOnly cookies for production)
- Admin routes protected by role check

### API Security

- CORS configured for allowed origins
- Request body validation
- SQL injection prevention via prepared statements
- File upload restrictions (type, size)

### Payment Security

- Stripe webhook signature verification
- eSewa HMAC-SHA256 signature
- Sensitive keys in environment variables
- Transaction IDs logged for audit

### Email Verification

- 6-digit codes with 10-minute expiry
- Rate limiting recommended for production
- Codes cleared after successful verification

---

## 🚀 Environment Variables

### Backend (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=smartshops

# Authentication
JWT_SECRET=your-super-secret-jwt-key

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# eSewa (Test)
ESEWA_MERCHANT_CODE=EPAYTEST
ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q

# Khalti
KHALTI_SECRET_KEY=...

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:5000
```

---

## 📊 Product Categories

The system supports the following categories (configurable):

| Category               | Sample Products                          |
| ---------------------- | ---------------------------------------- |
| Electronics            | iPhone, iPad, Sony Headphones            |
| Mobile Phones          | Google Pixel, OnePlus, Samsung, Xiaomi   |
| Clothing               | Polo Shirts, Denim Jeans                 |
| Footwear               | Nike, Adidas, Hiking Boots, Formal Shoes |
| Accessories            | Apple Watch, Earphones                   |
| Home & Kitchen         | Electric Kettle, Knife Sets              |
| Beauty & Personal Care | Face Serum, Perfume, Cleansing Brush     |
| Sports & Outdoors      | Dumbbell Sets, Yoga Mats                 |

---

## 📞 Support & Contact

- **Store Name**: Nexus Store / SmartShop
- **Support Email**: support@NexusStore.com
- **Default Country**: Nepal
- **Default Shipping**: Rs. 50 flat rate

