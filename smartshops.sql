-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 03, 2025 at 06:22 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `smartshops`
--

-- --------------------------------------------------------

--
-- Table structure for table `cart`
--

CREATE TABLE `cart` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT 1,
  `offer_id` int(11) DEFAULT NULL,
  `offer_type` varchar(50) DEFAULT NULL,
  `original_price` decimal(10,2) DEFAULT NULL,
  `final_price` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL DEFAULT 'Notification',
  `message` text NOT NULL,
  `type` enum('info','success','warning','error','promotion','system','order','payment','promo','offer') DEFAULT 'info',
  `image_url` varchar(500) DEFAULT NULL,
  `target_users` enum('all','specific') DEFAULT 'all',
  `user_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`user_ids`)),
  `expires_at` datetime DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','confirmed','shipped','delivered','cancelled') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
  `shipping_address` text DEFAULT NULL,
  `tracking_number` varchar(100) DEFAULT NULL,
  `estimated_delivery` date DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT 0.00,
  `shipping_fee` decimal(10,2) DEFAULT 0.00,
  `promo_code` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `total_amount`, `status`, `payment_method`, `payment_status`, `shipping_address`, `tracking_number`, `estimated_delivery`, `subtotal`, `shipping_fee`, `promo_code`, `created_at`) VALUES
(3, 3, 90050.00, 'confirmed', 'stripe', 'completed', '{\"fullName\":\"Admin\",\"email\":\"niranjanadmin@gmail.com\",\"address\":\"kathmandu\",\"city\":\"kathmandu\",\"postalCode\":\"44600\",\"phone\":\"9818958772\",\"country\":\"Nepal\",\"notes\":\"\"}', 'TRK1761907682100NU8AH', '2025-11-07', 100000.00, 50.00, 'WELCOME10', '2025-10-31 10:47:38');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_tracking`
--

CREATE TABLE `order_tracking` (
  `id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_status` enum('pending','completed','failed') DEFAULT 'pending',
  `transaction_id` varchar(255) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `payment_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payment_data`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `order_id`, `payment_method`, `payment_status`, `transaction_id`, `amount`, `payment_data`, `created_at`) VALUES
(3, 3, 'stripe', 'completed', 'pi_3SOFt3KHTLaIcnD71BhlsLBQ', 90050.00, '{\"session_id\":\"cs_test_a1UizcA0Z2GXhMiVRBupqcQjISeYA37B9UrARjG1oc1mfNLrr8N8M1FeE3\",\"session_url\":\"https://checkout.stripe.com/c/pay/cs_test_a1UizcA0Z2GXhMiVRBupqcQjISeYA37B9UrARjG1oc1mfNLrr8N8M1FeE3#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0Vk9QS0BOTVFJZExma0EyMEs2SDc9bV9PXUpsNlFycH9zVE1qXG99Vlx3RE9mSmlCQ2NzNWtSNm5XQ2FudmxpMzBkTHZEaTRiSWBKf05USTw2cklHM29CNTVHXXVnS1A2MicpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl\",\"discount\":10000,\"final_amount\":90050,\"promo_code\":\"WELCOME10\"}', '2025-10-31 10:47:39');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `category` varchar(100) NOT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `image_urls` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`image_urls`)),
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `is_featured` tinyint(1) DEFAULT 0,
  `featured` tinyint(1) DEFAULT 0,
  `is_new` tinyint(1) DEFAULT 0,
  `discount_percentage` decimal(5,2) DEFAULT 0.00,
  `offer_valid_until` datetime DEFAULT NULL,
  `stock_quantity` int(11) DEFAULT 0,
  `min_stock_level` int(11) DEFAULT 5,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `rating` decimal(3,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `category`, `image_url`, `image_urls`, `tags`, `is_featured`, `featured`, `is_new`, `discount_percentage`, `offer_valid_until`, `stock_quantity`, `min_stock_level`, `created_at`, `rating`) VALUES
(1, 'Denim Pants', 'Denim pants for male', 2000.00, 'Clothing', 'https://imgs.search.brave.com/gINnxyI7lokxrypFb3hXo0CdXoGt5fKtIUe-Hrh3SZo/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvOTE1/OTIzNDAwL3Bob3Rv/L2JsdWUtbWVucy1q/ZWFucy1kZW5pbS1w/YW50cy1vbi1vcmFu/Z2UtYmFja2dyb3Vu/ZC1jb250cmFzdC1z/YXR1cmF0ZWQtY29s/b3ItZmFzaGlvbi1j/bG90aGluZy5qcGc_/cz02MTJ4NjEyJnc9/MCZrPTIwJmM9TElz/MkFjLUtlY1hBcGs0/NG9wYTBybE9BVHE0/TEhrbDdlZnhzcEhV/Y2Z0VT0', '[\"https://imgs.search.brave.com/gINnxyI7lokxrypFb3hXo0CdXoGt5fKtIUe-Hrh3SZo/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvOTE1/OTIzNDAwL3Bob3Rv/L2JsdWUtbWVucy1q/ZWFucy1kZW5pbS1w/YW50cy1vbi1vcmFu/Z2UtYmFja2dyb3Vu/ZC1jb250cmFzdC1z/YXR1cmF0ZWQtY29s/b3ItZmFzaGlvbi1j/bG90aGluZy5qcGc_/cz02MTJ4NjEyJnc9/MCZrPTIwJmM9TElz/MkFjLUtlY1hBcGs0/NG9wYTBybE9BVHE0/TEhrbDdlZnhzcEhV/Y2Z0VT0\"]', '[\"denim\",\"jeans\"]', 0, 0, 0, 0.00, NULL, 92, 5, '2025-10-17 05:33:51', 0.00),
(2, 'Nike Dunk Low', 'Best Nike Shoes', 17000.00, 'Footwear', 'https://imgs.search.brave.com/qf6Q879gfWbNB4ZPPaMZvRh5TVvCeMYxbYp7zVcBMSI/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMubmlrZS5jb20v/YS9pbWFnZXMvdF93/ZWJfcHdfNTkyX3Yy/L2ZfYXV0by9lOGQ0/YWYyZi1lNWY4LTQ4/ZGUtYTczMC0yNzkw/NDlkMzg0YzYvTklL/RStEVU5LK0xPVytT/RS5wbmc', '[\"https://imgs.search.brave.com/qf6Q879gfWbNB4ZPPaMZvRh5TVvCeMYxbYp7zVcBMSI/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMubmlrZS5jb20v/YS9pbWFnZXMvdF93/ZWJfcHdfNTkyX3Yy/L2ZfYXV0by9lOGQ0/YWYyZi1lNWY4LTQ4/ZGUtYTczMC0yNzkw/NDlkMzg0YzYvTklL/RStEVU5LK0xPVytT/RS5wbmc\",\"https://imgs.search.brave.com/xinH4JbVcYMpSuG6r1vdkrmUPeNXNGJLqsHKaq7uze4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMubmlrZS5jb20v/YS9pbWFnZXMvdF9k/ZWZhdWx0LzBmNzZm/NzNlLTI1NzgtNGQ2/Mi1hYmFiLWM1NTYz/ZWE0Zjc4Yy9OSUtF/K0RVTksrTE9XK1JF/VFJPLnBuZw\",\"https://imgs.search.brave.com/xinH4JbVcYMpSuG6r1vdkrmUPeNXNGJLqsHKaq7uze4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMubmlrZS5jb20v/YS9pbWFnZXMvdF9k/ZWZhdWx0LzBmNzZm/NzNlLTI1NzgtNGQ2/Mi1hYmFiLWM1NTYz/ZWE0Zjc4Yy9OSUtF/K0RVTksrTE9XK1JF/VFJPLnBuZw\",\"https://imgs.search.brave.com/H4jQ6feLLSU0GfFRgmI_8QqthkxKP-5Jp7mrsTVa5GI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMubmlrZS5jb20v/YS9pbWFnZXMvdF9k/ZWZhdWx0LzE4MzRh/NjczLWRmYzItNDAx/YS04YWZhLTllYTIw/YWJjMjZjNS9XK05J/S0UrRFVOSytMT1cu/cG5n\"]', '[\"NIKE\"]', 1, 0, 1, 0.00, NULL, 35, 5, '2025-10-17 05:33:51', 0.00),
(3, 'Laptop Backpack', 'Durable laptop backpack with multiple compartments', 1200.00, 'Accessories', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', NULL, NULL, 1, 0, 0, 0.00, NULL, 73, 5, '2025-10-17 05:33:51', 0.00),
(4, 'Iphone 17', 'New launched', 233000.00, 'Mobile Phones', 'https://imgs.search.brave.com/3DaQJErST-2vEVjoLeMa5eDYTbJh6ORUD0jKOcrMtWI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5jbm4uY29tL2Fw/aS92MS9pbWFnZXMv/c3RlbGxhci9wcm9k/L2FwcGxlLWlwaG9u/ZS0xNy1wcm8tbWF4/LmpwZz9jPTE2eDkm/cT1oXzcyMCx3XzEy/ODAsY19maWxs', '[\"https://imgs.search.brave.com/3DaQJErST-2vEVjoLeMa5eDYTbJh6ORUD0jKOcrMtWI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5jbm4uY29tL2Fw/aS92MS9pbWFnZXMv/c3RlbGxhci9wcm9k/L2FwcGxlLWlwaG9u/ZS0xNy1wcm8tbWF4/LmpwZz9jPTE2eDkm/cT1oXzcyMCx3XzEy/ODAsY19maWxs\",\"https://imgs.search.brave.com/-UhD5gI00QPEMHOXSUc1IYkW4b2xkRk20l9oTtlTL5Q/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/aW5kaWFpc3RvcmUu/Y29tL3RoZW1lcy9m/cm9udGVuZC9jdXN0/b20vaW1hZ2VzL3By/b2R1Y3QvaXBob25l/LTE3LXByby1jb21p/bmctc29vbi9kZXNr/dG9wLzAxLmpwZw\",\"https://imgs.search.brave.com/GKtmIq60RRdMa1J7G5dJG-aUItLvmvUV9aqfyyGnjMM/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9mZG4u/Z3NtYXJlbmEuY29t/L2ltZ3Jvb3QvcmV2/aWV3cy8yNS9hcHBs/ZS1pcGhvbmUtMTct/cHJvLW1heC9saWZl/c3R5bGUvLTEwMjR3/Mi9nc21hcmVuYV8w/MjIuanBn\",\"http://localhost:5000/uploads/image-1761908272850-680854207.webp\"]', '[\"On demand\",\"Apple\"]', 1, 0, 1, 0.00, NULL, 21, 5, '2025-10-31 10:57:56', 0.00),
(5, 'iPhone 16 Pro Max', 'Latest Apple iPhone with A18 chip, 48MP camera, and Dynamic Island', 184999.00, 'Electronics', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500', '[\"https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500\",\"https://imgs.search.brave.com/RtkkGGUY5wmpdZ03OVZRYIat4tnMUChMwbjKlvwicxY/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4u/bW9zLmNtcy5mdXR1/cmVjZG4ubmV0L2N0/cFdvRXJHYWhiU3hR/SEd4aDNQM0EuanBn\",\"https://imgs.search.brave.com/HMIxlA4KUj4bHvCermsr469MnPJqC21Bk6KUK6uPWFk/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9waXNj/ZXMuYmJ5c3RhdGlj/LmNvbS9pbWFnZTIv/QmVzdEJ1eV9VUy9k/YW0vUkVGLTE2NTIz/NjItY3ltLWlwaG9u/ZTE2cHJvbWF4X0RF/Ui1iYjE3MDA3Yi01/NGJmLTQyNGItYmVm/My00MDg3YjA0ZTkx/YTEuanBn\"]', '[\"smartphone\",\"apple\",\"5G\",\"premium\"]', 1, 1, 1, 5.00, NULL, 25, 5, '2025-11-03 08:49:06', 4.80),
(6, 'Samsung Galaxy S24 Ultra', 'Powerful Android phone with S-Pen, 200MP camera, and AI features', 159999.00, 'Electronics', 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500', '[\"https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500\", \"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500\", \"https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=500\"]', '[\"android\", \"samsung\", \"S-Pen\", \"camera\"]', 1, 0, 1, 8.00, NULL, 30, 5, '2025-11-03 08:49:06', 4.70),
(7, 'Sony WH-1000XM5', 'Industry-leading noise canceling wireless headphones', 51999.00, 'Electronics', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', '[\"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500\", \"https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500\", \"https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500\"]', '[\"headphones\", \"wireless\", \"noise-canceling\", \"audio\"]', 0, 0, 0, 12.00, NULL, 40, 8, '2025-11-03 08:49:06', 4.60),
(8, 'iPad Air 5th Gen', 'Powerful tablet with M1 chip, Liquid Retina display, 5G support', 97999.00, 'Electronics', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500', '[\"https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500\", \"https://images.unsplash.com/photo-1561154464-82e9adf32764?w=500\", \"https://images.unsplash.com/photo-1542751110-97427bbecf20?w=500\"]', '[\"tablet\", \"apple\", \"portable\", \"creative\"]', 0, 0, 0, 7.50, NULL, 35, 6, '2025-11-03 08:49:06', 4.50),
(9, 'Premium Cotton Polo Shirt', '100% cotton polo shirt with embroidered logo, available in multiple colors', 5999.00, 'Clothing', 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500', '[\"https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500\", \"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500\", \"https://images.unsplash.com/photo-1501088459543-1b7b0cec6c4c?w=500\"]', '[\"polo\", \"cotton\", \"casual\", \"premium\"]', 1, 0, 0, 15.00, NULL, 80, 15, '2025-11-03 08:49:06', 4.30),
(10, 'Classic Denim Jeans', 'Slim fit denim jeans with stretch comfort, perfect for everyday wear', 11699.00, 'Clothing', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500', '[\"https://images.unsplash.com/photo-1542272604-787c3835535d?w=500\", \"https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=500\", \"https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500\"]', '[\"jeans\", \"denim\", \"slim-fit\", \"casual\"]', 0, 0, 0, 10.00, NULL, 60, 12, '2025-11-03 08:49:06', 4.40),
(11, 'Wool Blend Winter Jacket', 'Warm and stylish winter jacket with waterproof coating', 25999.00, 'Clothing', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500', '[\"https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500\", \"https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500\", \"https://images.unsplash.com/photo-1539533018447-63fcce2678e5?w=500\"]', '[\"jacket\", \"winter\", \"wool\", \"waterproof\"]', 0, 1, 0, 20.00, NULL, 25, 5, '2025-11-03 08:49:06', 4.70),
(12, 'Linen Summer Dress', 'Lightweight linen dress perfect for summer occasions', 10399.00, 'Clothing', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500', '[\"https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500\"]', '[\"dress\",\"linen\",\"summer\",\"elegant\"]', 0, 0, 1, 12.50, NULL, 45, 8, '2025-11-03 08:49:06', 4.50),
(13, 'Tshirts collection', 'Moisture-wicking athletic t-shirt for workouts and sports', 2000.00, 'Clothing', 'https://imgs.search.brave.com/RZyiRIAZ9ZPLHOAvR8fGyIWYGb5qVPNZXRDAklt-cvI/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/cHJlbWl1bS1waG90/by9jb2xsZWN0aW9u/LWJhc2ljLWNvbG9y/cy10c2hpcnRzLWlz/b2xhdGVkLXdoaXRl/LWJhY2tncm91bmQt/ZmxhdC1sYXktdGVl/cy10ZW1wbGF0ZV85/MjYxOTktNDM0MzA4/OS5qcGc_c2VtdD1h/aXNfaHlicmlkJnc9/NzQwJnE9ODA', '[\"https://imgs.search.brave.com/RZyiRIAZ9ZPLHOAvR8fGyIWYGb5qVPNZXRDAklt-cvI/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/cHJlbWl1bS1waG90/by9jb2xsZWN0aW9u/LWJhc2ljLWNvbG9y/cy10c2hpcnRzLWlz/b2xhdGVkLXdoaXRl/LWJhY2tncm91bmQt/ZmxhdC1sYXktdGVl/cy10ZW1wbGF0ZV85/MjYxOTktNDM0MzA4/OS5qcGc_c2VtdD1h/aXNfaHlicmlkJnc9/NzQwJnE9ODA\",\"https://imgs.search.brave.com/xyecHkS1jHdVsPQc_4x12HHN1oucqQStnxuG-78LDnk/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMtbmEuc3NsLWlt/YWdlcy1hbWF6b24u/Y29tL2ltYWdlcy9J/LzYxN3Q4anFYYzNM/LmpwZw\"]', '[\"sports\",\"athletic\",\"performance\",\"moisture-wicking\"]', 0, 0, 0, 5.00, NULL, 100, 20, '2025-11-03 08:49:06', 4.20),
(14, 'Nike Air Max 270', 'Comfortable running shoes with Max Air cushioning', 19499.00, 'Footwear', 'https://imgs.search.brave.com/ujgUPwTR3-yb1QQ6qdjnBo4vTw9H08MBIPdNEKHt2VA/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/ZS5nb2F0LmNvbS90/cmFuc2Zvcm0vdjEv/YXR0YWNobWVudHMv/cHJvZHVjdF90ZW1w/bGF0ZV9waWN0dXJl/cy9pbWFnZXMvMDc5/LzMyNS8zMDcvb3Jp/Z2luYWwvNTIyNzUz/XzAwLnBuZy5wbmc_/YWN0aW9uPWNyb3Am/d2lkdGg9NzUw', '[\"https://imgs.search.brave.com/ujgUPwTR3-yb1QQ6qdjnBo4vTw9H08MBIPdNEKHt2VA/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/ZS5nb2F0LmNvbS90/cmFuc2Zvcm0vdjEv/YXR0YWNobWVudHMv/cHJvZHVjdF90ZW1w/bGF0ZV9waWN0dXJl/cy9pbWFnZXMvMDc5/LzMyNS8zMDcvb3Jp/Z2luYWwvNTIyNzUz/XzAwLnBuZy5wbmc_/YWN0aW9uPWNyb3Am/d2lkdGg9NzUw\",\"https://imgs.search.brave.com/YNd6a3A1gJwpsVbbATx_X2fVZlYmF5NuB-uvQRrHSnI/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4u/cnVucmVwZWF0LmNv/bS9zdG9yYWdlL2dh/bGxlcnkvcHJvZHVj/dF9jb250ZW50LzM0/Mjc1L25pa2UyMGFp/cjIwbWF4MjByZWFj/dDIwMjcwMjAtMTUw/MDkyMjAtbWFpbi5q/cGc\"]', '[\"running\",\"nike\",\"air-max\",\"sports\"]', 1, 1, 0, 15.00, NULL, 50, 10, '2025-11-03 08:49:06', 4.60),
(15, 'Adidas Ultraboost 22', 'Responsive running shoes with Boost technology', 23399.00, 'Footwear', 'https://imgs.search.brave.com/d0zhQkAsWnxLqIotyCW9YrB6KcVmymDsojICAzAUM1s/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NzFMN3RHdlFjYkwu/anBn', '[\"https://imgs.search.brave.com/d0zhQkAsWnxLqIotyCW9YrB6KcVmymDsojICAzAUM1s/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NzFMN3RHdlFjYkwu/anBn\",\"https://imgs.search.brave.com/f8_dvQm5_lSgsUHIf12zH0X_HI7Z0wCLRVD4Qp-P1gY/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/cnVubWFnLmZyL19h/c3NldHMvc3R5bGVz/LzgxMC9wdWJsaWMv/cHJvZHVpdC8yMDIy/LTAzL2FkaWRhcy11/bHRyYWJvb3N0LTIy/LXJ1bm1hZy10YWxv/bi5qcGc\"]', '[\"running\",\"adidas\",\"ultraboost\",\"performance\"]', 1, 0, 0, 10.00, NULL, 40, 8, '2025-11-03 08:49:06', 4.80),
(16, 'Leather Formal Shoes', 'Classic leather oxford shoes for business and formal occasions', 16899.00, 'Footwear', 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500', '[\"https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500\", \"https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=500\", \"https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?w=500\"]', '[\"formal\", \"leather\", \"oxford\", \"business\"]', 0, 0, 0, 8.00, NULL, 30, 6, '2025-11-03 08:49:06', 4.40),
(17, 'Skechers Memory Foam', 'Comfort walking shoes with memory foam insoles', 11699.00, 'Footwear', 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500', '[\"https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500\", \"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500\", \"https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=500\"]', '[\"comfort\", \"walking\", \"memory-foam\", \"casual\"]', 0, 0, 0, 12.00, NULL, 65, 12, '2025-11-03 08:49:06', 4.50),
(18, 'Hiking Boots Waterproof', 'Durable hiking boots with waterproof membrane and ankle support', 20799.00, 'Footwear', 'https://imgs.search.brave.com/YPo7-exM8kZXoNYNYykkWTO95DM8t1Eqz7mR6U7D_kE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9kMW55/bWJrZW9tZW9xZy5j/bG91ZGZyb250Lm5l/dC9waG90b3MvMjUv/ODAvMzc5NTUzXzIy/NjAxX0wyLmpwZw', '[\"https://imgs.search.brave.com/YPo7-exM8kZXoNYNYykkWTO95DM8t1Eqz7mR6U7D_kE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9kMW55/bWJrZW9tZW9xZy5j/bG91ZGZyb250Lm5l/dC9waG90b3MvMjUv/ODAvMzc5NTUzXzIy/NjAxX0wyLmpwZw\",\"https://imgs.search.brave.com/aLpCtXdIiS4woJjdCyd5zj9RJKGOOPoKt0z8AHRat44/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/c3dpdGNoYmFja3Ry/YXZlbC5jb20vc2l0/ZXMvZGVmYXVsdC9m/aWxlcy9pbWFnZV9m/aWVsZHMvQmVzdCUy/ME9mJTIwR2VhciUy/MEFydGljbGVzL0hp/a2luZyUyMGFuZCUy/MEJhY2twYWNraW5n/L0hpa2luZyUyMEJv/b3RzL1NhbGV3YSUy/ME1vdW50YWluJTIw/VHJhaW5lciUyMExp/dGUlMjBNaWQlMjBH/VFglMjBoaWtpbmcl/MjBib290JTIwKGNs/b3NldXAlMjBvZiUy/MGJvb3RzKS5qcGVn\"]', '[\"hiking\",\"outdoor\",\"waterproof\",\"durable\"]', 1, 0, 0, 18.00, NULL, 35, 7, '2025-11-03 08:49:06', 4.70),
(19, 'Leather Laptop Messenger Bag', 'Professional leather bag with laptop compartment and multiple pockets', 16899.00, 'Accessories', 'https://imgs.search.brave.com/tqLopYLiN-ok8c4abAMD8O_TXiE8ZMdHbw2xYlSDL3o/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pNS53/YWxtYXJ0aW1hZ2Vz/LmNvbS9zZW8vTWVu/LXMtQnVzaW5lc3Mt/VHJhdmVsLUJyaWVm/Y2FzZS1MZWF0aGVy/LUhhbmRtYWRlLU1l/c3Nlbmdlci1CYWdz/LUxhcHRvcC1CYWdf/MjZjY2Y0ZjgtY2Rk/Ni00ZTc3LThjMTEt/ZDI2Zjk2ZGJkMDc3/LmRiMGJmMTQ2Njky/MTI0YTM3ZGFiZjY3/MDM0N2MwOWVjLmpw/ZWc_b2RuSGVpZ2h0/PTU4MCZvZG5XaWR0/aD01ODAmb2RuQmc9/RkZGRkZG', '[\"https://imgs.search.brave.com/tqLopYLiN-ok8c4abAMD8O_TXiE8ZMdHbw2xYlSDL3o/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pNS53/YWxtYXJ0aW1hZ2Vz/LmNvbS9zZW8vTWVu/LXMtQnVzaW5lc3Mt/VHJhdmVsLUJyaWVm/Y2FzZS1MZWF0aGVy/LUhhbmRtYWRlLU1l/c3Nlbmdlci1CYWdz/LUxhcHRvcC1CYWdf/MjZjY2Y0ZjgtY2Rk/Ni00ZTc3LThjMTEt/ZDI2Zjk2ZGJkMDc3/LmRiMGJmMTQ2Njky/MTI0YTM3ZGFiZjY3/MDM0N2MwOWVjLmpw/ZWc_b2RuSGVpZ2h0/PTU4MCZvZG5XaWR0/aD01ODAmb2RuQmc9/RkZGRkZG\",\"https://imgs.search.brave.com/Vju3zvDIEVFv2w-uMxthuKm8A_IgD98ZRQjboeFJI6o/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/cnVzdGljdG93bi5j/b20vY2RuL3Nob3Av/ZmlsZXMvbGVhdGhl/cnRyYXZlbG1lc3Nl/bmdlcmJhZzEud2Vi/cD92PTE3NDgzMjkw/NjQmd2lkdGg9MjAw/MA\"]', '[\"bag\",\"laptop\",\"leather\",\"professional\"]', 1, 1, 1, 10.00, NULL, 40, 8, '2025-11-03 08:49:06', 4.50),
(20, 'Apple Watch Series 9', 'Advanced smartwatch with health monitoring and fitness tracking', 50000.00, 'Accessories', 'https://imgs.search.brave.com/zjOOmHC3IdaNoKIXsYVjOaMoFov4IpjstaeEEqb63ss/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4u/bW9zLmNtcy5mdXR1/cmVjZG4ubmV0L0JS/RXBKbXZVVGRGWUN2/WHpNbXNLcEsuanBn', '[\"https://imgs.search.brave.com/zjOOmHC3IdaNoKIXsYVjOaMoFov4IpjstaeEEqb63ss/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4u/bW9zLmNtcy5mdXR1/cmVjZG4ubmV0L0JS/RXBKbXZVVGRGWUN2/WHpNbXNLcEsuanBn\",\"https://imgs.search.brave.com/AAHs05d4dZXzcJ7A3wgdza6ts6O0E9tt0gYnuhhobV8/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMxLnBvY2tldG5v/d2ltYWdlcy5jb20v/d29yZHByZXNzL3dw/LWNvbnRlbnQvdXBs/b2Fkcy93bS8yMDIz/LzEwL2FwcGxlLXdh/dGNoLXNlcmllcy05/LXJldmlldy1pbWFn/ZS00LmpwZw\"]', '[\"smartwatch\",\"apple\",\"fitness\",\"health\"]', 1, 0, 1, 5.00, NULL, 30, 6, '2025-11-03 08:49:06', 4.70),
(21, 'Wireless Charging Pad', 'Fast wireless charging pad compatible with all Qi-enabled devices', 2000.00, 'Accessories', 'https://imgs.search.brave.com/BVjn5-OcKDfA2FVgZ7WbUnE-J_VrYck7XBZfXyUJgfs/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NTFwYkt6ckFkOUwu/anBn', '[\"https://imgs.search.brave.com/BVjn5-OcKDfA2FVgZ7WbUnE-J_VrYck7XBZfXyUJgfs/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NTFwYkt6ckFkOUwu/anBn\"]', '[\"charging\",\"wireless\",\"tech\",\"accessory\"]', 0, 0, 0, 15.00, NULL, 75, 15, '2025-11-03 08:49:06', 4.20),
(22, 'XAGE Type c Earphone', 'Proper high quality earphones in cheap price', 800.00, 'Accessories', 'https://imgs.search.brave.com/o5XoV4u5VefzHaKfjJtFKSOegDCBkKjIBJPLSp8awBE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly94YWdl/bmVwYWwuY29tL2Zp/bGUtbWFuYWdlci9w/aG90b3MvMS9Qcm9k/dWN0cy9FYXJwaG9u/ZXMvWFdFMDUvWFdF/MDUucG5n', '[\"https://imgs.search.brave.com/o5XoV4u5VefzHaKfjJtFKSOegDCBkKjIBJPLSp8awBE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly94YWdl/bmVwYWwuY29tL2Zp/bGUtbWFuYWdlci9w/aG90b3MvMS9Qcm9k/dWN0cy9FYXJwaG9u/ZXMvWFdFMDUvWFdF/MDUucG5n\"]', '[\"sound\"]', 0, 0, 1, 0.00, NULL, 55, 10, '2025-11-03 08:49:06', 4.40),
(23, 'Stainless Steel Water Bottle', 'Insulated stainless steel bottle keeps drinks hot/cold for 24 hours', 4549.00, 'Accessories', 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500', '[\"https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500\", \"https://images.unsplash.com/photo-1523362628745-0c100150b504?w=500\", \"https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500\"]', '[\"bottle\", \"eco-friendly\", \"insulated\", \"travel\"]', 0, 0, 0, 8.00, NULL, 90, 18, '2025-11-03 08:49:06', 4.30),
(24, 'Google Pixel 8 Pro', 'Advanced AI camera system, Tensor G3 chip, 120Hz display', 129999.00, 'Mobile Phones', 'https://imgs.search.brave.com/B6dyNVDyZIYz0-PWUHbbLPHp9BnoHxjIKpPuKN78aYw/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9hbWF0/ZXVycGhvdG9ncmFw/aGVyLmNvbS93cC1j/b250ZW50L3VwbG9h/ZHMvc2l0ZXMvNy8y/MDIzLzEwL2dvb2ds/ZS1waXhlbC04LWJs/YWNrLUpXLUFQLVBB/MTYwMjA4LmpwZz93/PTkwMA', '[\"https://imgs.search.brave.com/B6dyNVDyZIYz0-PWUHbbLPHp9BnoHxjIKpPuKN78aYw/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9hbWF0/ZXVycGhvdG9ncmFw/aGVyLmNvbS93cC1j/b250ZW50L3VwbG9h/ZHMvc2l0ZXMvNy8y/MDIzLzEwL2dvb2ds/ZS1waXhlbC04LWJs/YWNrLUpXLUFQLVBB/MTYwMjA4LmpwZz93/PTkwMA\"]', '[\"android\",\"google\",\"camera\",\"AI\"]', 1, 1, 1, 12.00, NULL, 28, 6, '2025-11-03 08:49:06', 4.60),
(25, 'OnePlus 12', 'Flagship killer with Snapdragon 8 Gen 3, Hasselblad camera', 116999.00, 'Mobile Phones', 'https://imgs.search.brave.com/YGnKY7EqM1YVRlRn-IZ5EeWgpSs5a5AxkFQ-crkwoSg/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9iMmMt/Y29udGVudGh1Yi5j/b20vd3AtY29udGVu/dC91cGxvYWRzLzIw/MjUvMDEvT25lUGx1/cy0xMy1yZXZpZXct/aGVyby1jYW5hbC12/Mi5qcGc_cXVhbGl0/eT01MCZzdHJpcD1h/bGw', '[\"https://imgs.search.brave.com/YGnKY7EqM1YVRlRn-IZ5EeWgpSs5a5AxkFQ-crkwoSg/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9iMmMt/Y29udGVudGh1Yi5j/b20vd3AtY29udGVu/dC91cGxvYWRzLzIw/MjUvMDEvT25lUGx1/cy0xMy1yZXZpZXct/aGVyby1jYW5hbC12/Mi5qcGc_cXVhbGl0/eT01MCZzdHJpcD1h/bGw\"]', '[\"android\",\"oneplus\",\"flagship\",\"fast-charging\"]', 1, 0, 1, 8.50, NULL, 32, 7, '2025-11-03 08:49:06', 4.50),
(26, 'Xiaomi 17 PRO MAX', 'Leica camera partnership, 1-inch sensor, 120W fast charging', 142999.00, 'Mobile Phones', 'https://imgs.search.brave.com/nbScuTUrOViIgk5WFQHKkyVf_l3zXi3ZN7xoZhvokzk/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pLmVi/YXlpbWcuY29tL2lt/YWdlcy9nL0VMSUFB/ZVN3UkcxbzFoYlgv/cy1sNTAwLndlYnA', '[\"https://imgs.search.brave.com/nbScuTUrOViIgk5WFQHKkyVf_l3zXi3ZN7xoZhvokzk/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pLmVi/YXlpbWcuY29tL2lt/YWdlcy9nL0VMSUFB/ZVN3UkcxbzFoYlgv/cy1sNTAwLndlYnA\",\"https://imgs.search.brave.com/Cu85BvdMY0dX0B2td4IuoDkp679sghQ_W5QYp7t9xH8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zMi10/ZWNodHVkby5nbGJp/bWcuY29tL2FfMnp4/QUpnZmhZYzB0UWNX/LVpHWGVHbDdjST0v/MHgwOjEyMDB4NDg4/Lzk4NHgwL3NtYXJ0/L2ZpbHRlcnM6c3Ry/aXBfaWNjKCkvaS5z/My5nbGJpbWcuY29t/L3YxL0FVVEhfMDhm/YmY0OGJjMDUyNDg3/Nzk0M2ZlODZlNDMw/ODdlN2EvaW50ZXJu/YWxfcGhvdG9zL2Jz/LzIwMjUvby9FL0g0/QlVucVJUcXJTOFlL/dm41OUFRL3hpYW9t/aS0xNy1wcm8tbWF4/LTA0LmpwZw\"]', '[\"android\",\"xiaomi\",\"leica\",\"camera\"]', 0, 0, 0, 10.00, NULL, 22, 5, '2025-11-03 08:49:06', 4.40),
(27, 'Samsung Galaxy Z Flip5', 'Compact foldable smartphone with flexible display', 155999.00, 'Mobile Phones', 'https://imgs.search.brave.com/DtwtDEiQuv4x_ZR92fg1AEWigAVEUHnkc9rVC8KTG0U/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/MzE1UzBkciszVUwu/anBn', '[\"https://imgs.search.brave.com/DtwtDEiQuv4x_ZR92fg1AEWigAVEUHnkc9rVC8KTG0U/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/MzE1UzBkciszVUwu/anBn\"]', '[\"foldable\",\"samsung\",\"compact\",\"innovative\"]', 1, 1, 0, 5.00, NULL, 18, 4, '2025-11-03 08:49:06', 4.70),
(28, 'Samsung M52 5g', 'Best mid range phone', 45999.00, 'Mobile Phones', 'https://imgs.search.brave.com/rZGbVciF4g7ePw8V4m6GQ_u-TbLwS4L7Ca13tazpdIE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4u/Z2FkZ2V0Ynl0ZW5l/cGFsLmNvbS93cC1j/b250ZW50L3VwbG9h/ZHMvMjAyMi8wNC9T/YW1zdW5nLUdhbGF4/eS1NNTItNUctQmx1/ZS5qcGc', '[\"https://imgs.search.brave.com/rZGbVciF4g7ePw8V4m6GQ_u-TbLwS4L7Ca13tazpdIE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4u/Z2FkZ2V0Ynl0ZW5l/cGFsLmNvbS93cC1j/b250ZW50L3VwbG9h/ZHMvMjAyMi8wNC9T/YW1zdW5nLUdhbGF4/eS1NNTItNUctQmx1/ZS5qcGc\",\"https://imgs.search.brave.com/g-FjhkUZUCim3vbUQV3UTmy9FOOJmD_CuwuS3R6hQmw/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4u/bW9zLmNtcy5mdXR1/cmVjZG4ubmV0L3pl/NGt3bUNBcWM1TWhv/cjI5WDRNcGcuanBn\"]', '[\"large-screen\",\"premium\"]', 1, 0, 0, 7.00, NULL, 35, 8, '2025-11-03 08:49:06', 4.60),
(29, 'Non-Stick Cookware Set', '8-piece non-stick cookware set with ceramic coating', 12499.00, 'Home & Kitchen', 'https://imgs.search.brave.com/hPHDc9Y6jel8VXRH5avNSAoC5uC_ieNrp8BM9DFAJ8w/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMtbmEuc3NsLWlt/YWdlcy1hbWF6b24u/Y29tL2ltYWdlcy9J/Lzcxb2gzQ2lWK0RM/LmpwZw', '[\"https://imgs.search.brave.com/hPHDc9Y6jel8VXRH5avNSAoC5uC_ieNrp8BM9DFAJ8w/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMtbmEuc3NsLWlt/YWdlcy1hbWF6b24u/Y29tL2ltYWdlcy9J/Lzcxb2gzQ2lWK0RM/LmpwZw\",\"https://imgs.search.brave.com/38nmBK2ra_gh5GdAT8hvnXxN4VlHGqqsp12nrFkmuF0/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9hbm9s/b24uY29tL2Nkbi9z/aG9wL3Byb2R1Y3Rz/LzAzMmE1ZTBlMDhl/MjBhY2ViMmFlMjhk/MGM4NGExNDk1ZDM2/Mzg5YjVfbWVkaXVt/LmpwZz92PTE3NDg4/ODE4ODI\"]', '[]', 0, 1, 0, 15.00, NULL, 45, 8, '2025-11-03 09:22:19', 4.50),
(30, 'Stainless Steel Mixer Grinder', '750W powerful mixer grinder with 3 jars', 8999.00, 'Home & Kitchen', 'https://imgs.search.brave.com/-1ABZ91tYlFWd5RdrjfAh9AMqMVnmQRy0KL7p3xJtYA/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NTF6V1d2STZwR0wu/anBn', '[\"https://imgs.search.brave.com/-1ABZ91tYlFWd5RdrjfAh9AMqMVnmQRy0KL7p3xJtYA/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NTF6V1d2STZwR0wu/anBn\",\"https://imgs.search.brave.com/TAyHKUVnQOLWs7lFmSpZPOskRI00CpQLCuBeqfp7I2E/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/dmlkaWVtbWl4ZXIu/Y29tL2Nkbi9zaG9w/L2ZpbGVzL0Jyb256/ZTEuanBnP3Y9MTY5/NTEzMDI1NyZ3aWR0/aD01MzM\"]', '[\"mixer\",\"grinder\",\"kitchen-appliance\",\"cooking\"]', 0, 0, 0, 10.00, NULL, 35, 6, '2025-11-03 09:22:19', 4.30),
(31, 'Glass Dinnerware Set', '20-piece transparent glass dinner set for 4 people', 6599.00, 'Home & Kitchen', 'https://imgs.search.brave.com/IA2v3DgyRnn91v6HdctfyHWS8b_6tsMI-kHIsEiWVHQ/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NzFnRjZSMHR6b0wu/anBn', '[\"https://imgs.search.brave.com/IA2v3DgyRnn91v6HdctfyHWS8b_6tsMI-kHIsEiWVHQ/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NzFnRjZSMHR6b0wu/anBn\"]', '[\"dinnerware\",\"glass\",\"tableware\",\"serving\"]', 0, 0, 0, 12.00, NULL, 60, 12, '2025-11-03 09:22:19', 4.40),
(32, 'Electric Kettle 1.5L', 'Stainless steel electric kettle with auto shut-off', 3499.00, 'Home & Kitchen', 'https://imgs.search.brave.com/zJWIBY9ZrndaFW7nMibBCgeJ17aEwPhwYuIQbKy5OyE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jYi5z/Y2VuZTcuY29tL2lz/L2ltYWdlL0NyYXRl/L0hhZGVuU3RyYmtX/aHRFbGNLdGxBVjJT/U0YyNF9WTkQvJHdl/Yl9wbHBfY2FyZCQv/MjUxMDE5MDQ0ODAz/L0hhZGVuU3RyYmtX/aHRFbGNLdGxBVjJT/U0YyNF9WTkQuanBn', '[\"https://imgs.search.brave.com/zJWIBY9ZrndaFW7nMibBCgeJ17aEwPhwYuIQbKy5OyE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jYi5z/Y2VuZTcuY29tL2lz/L2ltYWdlL0NyYXRl/L0hhZGVuU3RyYmtX/aHRFbGNLdGxBVjJT/U0YyNF9WTkQvJHdl/Yl9wbHBfY2FyZCQv/MjUxMDE5MDQ0ODAz/L0hhZGVuU3RyYmtX/aHRFbGNLdGxBVjJT/U0YyNF9WTkQuanBn\"]', '[\"kettle\",\"electric\",\"kitchen\",\"appliance\"]', 0, 0, 0, 8.00, NULL, 55, 10, '2025-11-03 09:22:19', 4.20),
(33, 'Kitchen Knife Set', '6-piece professional kitchen knife set with wooden block', 7799.00, 'Home & Kitchen', 'https://imgs.search.brave.com/QUwJxiO2Kt7g3FjAela5OGJ0So1WGkfrTQlvHz_Z48U/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMtbmEuc3NsLWlt/YWdlcy1hbWF6b24u/Y29tL2ltYWdlcy9J/LzgxMElqd1NPV1pM/LmpwZw', '[\"https://imgs.search.brave.com/QUwJxiO2Kt7g3FjAela5OGJ0So1WGkfrTQlvHz_Z48U/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMtbmEuc3NsLWlt/YWdlcy1hbWF6b24u/Y29tL2ltYWdlcy9J/LzgxMElqd1NPV1pM/LmpwZw\"]', '[\"knives\",\"cutlery\",\"kitchen\",\"cooking\"]', 0, 0, 0, 18.00, NULL, 40, 8, '2025-11-03 09:22:19', 4.60),
(34, 'Vitamin C Face Serum', 'Brightening serum with vitamin C and hyaluronic acid', 2499.00, 'Beauty & Personal Care', 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500', '[\"https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500\", \"https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500\", \"https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500\"]', '[\"skincare\", \"serum\", \"vitamin-c\", \"beauty\"]', 0, 1, 0, 20.00, NULL, 80, 15, '2025-11-03 09:22:19', 4.70),
(35, 'Electric Hair Trimmer', 'Cordless hair trimmer with multiple length settings', 4599.00, 'Beauty & Personal Care', 'https://imgs.search.brave.com/UKC-qQppoIzCEIEBugGigNX9eBW-4hMycUyLkUnwxJM/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zbGlt/YWdlcy5tYWN5c2Fz/c2V0cy5jb20vaXMv/aW1hZ2UvTUNZL3By/b2R1Y3RzLzQvb3B0/aW1pemVkLzI3NDU5/MjM0X2ZweC50aWY_/cWx0PTgwLDAmcmVz/TW9kZT1zaGFycDIm/b3BfdXNtPTEuNzUs/MC4zLDIsMCZmbXQ9/anBlZyZ3aWQ9MzQy/JmhlaT00MTc', '[\"https://imgs.search.brave.com/UKC-qQppoIzCEIEBugGigNX9eBW-4hMycUyLkUnwxJM/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zbGlt/YWdlcy5tYWN5c2Fz/c2V0cy5jb20vaXMv/aW1hZ2UvTUNZL3By/b2R1Y3RzLzQvb3B0/aW1pemVkLzI3NDU5/MjM0X2ZweC50aWY_/cWx0PTgwLDAmcmVz/TW9kZT1zaGFycDIm/b3BfdXNtPTEuNzUs/MC4zLDIsMCZmbXQ9/anBlZyZ3aWQ9MzQy/JmhlaT00MTc\"]', '[\"trimmer\",\"grooming\",\"hair-care\",\"personal\"]', 0, 0, 0, 15.00, NULL, 65, 12, '2025-11-03 09:22:19', 4.40),
(36, 'Luxury Perfume Set', 'Eau de toilette perfume set with 3 different fragrances', 8999.00, 'Beauty & Personal Care', 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500', '[\"https://images.unsplash.com/photo-1541643600914-78b084683601?w=500\", \"https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500\", \"https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500\"]', '[\"perfume\", \"fragrance\", \"luxury\", \"beauty\"]', 0, 0, 0, 25.00, NULL, 45, 8, '2025-11-03 09:22:19', 4.60),
(37, 'Facial Cleansing Brush', 'Waterproof electric facial cleansing brush with 3 modes', 3299.00, 'Beauty & Personal Care', 'https://imgs.search.brave.com/pI0nkVF3dd8EyfRX5NamZQwgGxKH6JOQNu2vBPRdFiM/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/aW5zdHlsZS5jb20v/dGhtYi9JU2l0dExR/T2p1Y2UtdnhRM0Zs/U2hIWDAwdWM9L2Zp/dC1pbi8xNTAweDQz/NTkvZmlsdGVyczpu/b191cHNjYWxlKCk6/bWF4X2J5dGVzKDE1/MDAwMCk6c3RyaXBf/aWNjKCkvaW5zLWZh/Y2lhbC1jbGVhbnNp/bmctYnJ1c2gtdGVz/dC1lemJhc2ljcy10/c3RhcGxlcy0xMTM5/LTM3MWRmMmU3M2Q1/NTQ2ZWZhMWExN2Rh/YTNkYTEzZDQ5Lmpw/Zw', '[\"https://imgs.search.brave.com/pI0nkVF3dd8EyfRX5NamZQwgGxKH6JOQNu2vBPRdFiM/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/aW5zdHlsZS5jb20v/dGhtYi9JU2l0dExR/T2p1Y2UtdnhRM0Zs/U2hIWDAwdWM9L2Zp/dC1pbi8xNTAweDQz/NTkvZmlsdGVyczpu/b191cHNjYWxlKCk6/bWF4X2J5dGVzKDE1/MDAwMCk6c3RyaXBf/aWNjKCkvaW5zLWZh/Y2lhbC1jbGVhbnNp/bmctYnJ1c2gtdGVz/dC1lemJhc2ljcy10/c3RhcGxlcy0xMTM5/LTM3MWRmMmU3M2Q1/NTQ2ZWZhMWExN2Rh/YTNkYTEzZDQ5Lmpw/Zw\",\"https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500\"]', '[\"skincare\",\"cleansing\",\"facial\",\"beauty\"]', 0, 0, 0, 12.00, NULL, 70, 14, '2025-11-03 09:22:19', 4.30),
(38, 'Hair Dryer Professional', '2000W professional hair dryer with ionic technology', 5799.00, 'Beauty & Personal Care', 'https://imgs.search.brave.com/U76hYCmNxVTO0DuhgQnANZUvlTruhYj0DNvHMnrTsWc/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9oYWly/LWRyeWVyLWhhbmdp/bmctd2FsbC1iYXRo/cm9vbS1ob3RlbC1y/b29tLWJsYWNrLWhh/aXItZHJ5ZXItaGFu/Z2luZy13YWxsLW1v/dW50LWJhdGhyb29t/LWhvdGVsLXJvb20t/cmVhZHktMzY3ODM1/MDU2LmpwZw', '[\"https://imgs.search.brave.com/U76hYCmNxVTO0DuhgQnANZUvlTruhYj0DNvHMnrTsWc/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9oYWly/LWRyeWVyLWhhbmdp/bmctd2FsbC1iYXRo/cm9vbS1ob3RlbC1y/b29tLWJsYWNrLWhh/aXItZHJ5ZXItaGFu/Z2luZy13YWxsLW1v/dW50LWJhdGhyb29t/LWhvdGVsLXJvb20t/cmVhZHktMzY3ODM1/MDU2LmpwZw\"]', '[\"hair-dryer\",\"styling\",\"beauty\",\"personal-care\"]', 0, 0, 1, 18.00, NULL, 50, 10, '2025-11-03 09:22:19', 4.50),
(39, 'Yoga Mat Premium', 'Non-slip TPE yoga mat with carrying strap', 2999.00, 'Sports & Outdoors', 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500', '[\"https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500\", \"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500\", \"https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=500\"]', '[\"yoga\", \"fitness\", \"exercise\", \"sports\"]', 1, 1, 0, 15.00, NULL, 75, 15, '2025-11-03 09:22:19', 4.60),
(40, 'Dumbbell Set 20kg', 'Adjustable dumbbell set with storage rack', 12499.00, 'Sports & Outdoors', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500', '[\"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500\", \"https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500\", \"https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=500\"]', '[\"dumbbell\", \"weights\", \"fitness\", \"gym\"]', 1, 0, 0, 10.00, NULL, 30, 6, '2025-11-03 09:22:19', 4.40),
(41, 'Camping Tent 4-Person', 'Waterproof camping tent with rainfly and carry bag', 18999.00, 'Sports & Outdoors', 'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=500', '[\"https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=500\", \"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500\", \"https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500\"]', '[\"camping\", \"tent\", \"outdoor\", \"adventure\"]', 0, 0, 0, 20.00, NULL, 25, 5, '2025-11-03 09:22:19', 4.70),
(42, 'Running Shorts', 'Lightweight running shorts with moisture-wicking fabric', 1999.00, 'Sports & Outdoors', 'https://imgs.search.brave.com/WKqwnELuom2bkTFtV4LbnNd7StkyqGJAWqskMLdV8pg/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMtbmEuc3NsLWlt/YWdlcy1hbWF6b24u/Y29tL2ltYWdlcy9J/LzcxbXgxQ0JGZnBM/LmpwZw', '[\"https://imgs.search.brave.com/WKqwnELuom2bkTFtV4LbnNd7StkyqGJAWqskMLdV8pg/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMtbmEuc3NsLWlt/YWdlcy1hbWF6b24u/Y29tL2ltYWdlcy9J/LzcxbXgxQ0JGZnBM/LmpwZw\"]', '[\"running\",\"shorts\",\"athletic\",\"sports\"]', 0, 0, 0, 8.00, NULL, 90, 18, '2025-11-03 09:22:19', 4.20),
(43, 'Fitness Tracker Watch', 'Waterproof fitness tracker with heart rate monitor', 6599.00, 'Sports & Outdoors', 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500', '[\"https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500\"]', '[\"fitness\",\"tracker\",\"watch\",\"health\"]', 0, 0, 0, 12.00, NULL, 55, 11, '2025-11-03 09:22:19', 4.50),
(44, 'Best-Selling Novel Collection', 'Set of 5 bestselling fiction novels from popular authors', 3499.00, 'Books & Stationery', 'https://imgs.search.brave.com/zJQ0SkDGaTH6hyEk9vWToZ0N4q3ChOShVKeRD8G7LYU/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9qdW5p/cGVyYm9va3MuY29t/L2Nkbi9zaG9wL2Zp/bGVzL2JjZmZkOTE3/YWQ3YTM1MGZiZGE0/MDhjNjgwNzQ1MmYw/LmpwZz92PTE3Mzgz/NTUxMDkmd2lkdGg9/MzIw', '[\"https://imgs.search.brave.com/zJQ0SkDGaTH6hyEk9vWToZ0N4q3ChOShVKeRD8G7LYU/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9qdW5p/cGVyYm9va3MuY29t/L2Nkbi9zaG9wL2Zp/bGVzL2JjZmZkOTE3/YWQ3YTM1MGZiZGE0/MDhjNjgwNzQ1MmYw/LmpwZz92PTE3Mzgz/NTUxMDkmd2lkdGg9/MzIw\",\"https://imgs.search.brave.com/zJQ0SkDGaTH6hyEk9vWToZ0N4q3ChOShVKeRD8G7LYU/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9qdW5p/cGVyYm9va3MuY29t/L2Nkbi9zaG9wL2Zp/bGVzL2JjZmZkOTE3/YWQ3YTM1MGZiZGE0/MDhjNjgwNzQ1MmYw/LmpwZz92PTE3Mzgz/NTUxMDkmd2lkdGg9/MzIw\"]', '[\"books\",\"novels\",\"fiction\",\"reading\"]', 1, 1, 0, 25.00, NULL, 120, 25, '2025-11-03 09:22:19', 4.80),
(45, 'Premium Leather Journal', 'Handcrafted leather journal with lined pages', 2499.00, 'Books & Stationery', 'https://imgs.search.brave.com/KMQ-CV4Ah2gpcL4pPBQmM5oHidwpTcIxoBJuSwsZjIY/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NzFZVEs0bkVBakwu/anBn', '[\"https://imgs.search.brave.com/KMQ-CV4Ah2gpcL4pPBQmM5oHidwpTcIxoBJuSwsZjIY/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NzFZVEs0bkVBakwu/anBn\",\"https://imgs.search.brave.com/xTJpHF9OuBPKzeo37r3lvtOSJYFlZirFDYRC7eij358/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/OTFtWTRnNWJiMUwu/anBn\"]', '[\"journal\",\"notebook\",\"writing\",\"stationery\"]', 1, 0, 0, 15.00, NULL, 85, 17, '2025-11-03 09:22:19', 4.60),
(46, 'Art Supplies Kit', 'Complete art set with sketch pencils, colors and brushes', 4599.00, 'Books & Stationery', 'https://imgs.search.brave.com/_NpTyMH6_c2545IQCRKxXKWPNOJKTBvQEcCjSJYOmmI/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMtbmEuc3NsLWlt/YWdlcy1hbWF6b24u/Y29tL2ltYWdlcy9J/LzgxcVd4ZXJ2RFhM/LmpwZw', '[\"https://imgs.search.brave.com/_NpTyMH6_c2545IQCRKxXKWPNOJKTBvQEcCjSJYOmmI/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMtbmEuc3NsLWlt/YWdlcy1hbWF6b24u/Y29tL2ltYWdlcy9J/LzgxcVd4ZXJ2RFhM/LmpwZw\",\"https://imgs.search.brave.com/sOQ8MYRR2NU5TA36SZcQNmUPT9Z0v3qdIV0qexjYlDI/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMtbmEuc3NsLWlt/YWdlcy1hbWF6b24u/Y29tL2ltYWdlcy9J/LzgxZVgwLUJwaHlM/LmpwZw\"]', '[\"art\",\"supplies\",\"sketching\",\"creative\"]', 0, 0, 1, 20.00, NULL, 60, 12, '2025-11-03 09:22:19', 4.40),
(47, 'Fountain Pen Set', 'Luxury fountain pen set with ink cartridges', 1099.00, 'Books & Stationery', 'https://imgs.search.brave.com/FVdhoatpAZ3EyjobnwniR6qB2P7tnsTfCp6oT_vV1-4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NzF3YlZGaTBaREwu/anBn', '[\"https://imgs.search.brave.com/FVdhoatpAZ3EyjobnwniR6qB2P7tnsTfCp6oT_vV1-4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NzF3YlZGaTBaREwu/anBn\"]', '[\"pen\",\"writing\",\"luxury\",\"stationery\"]', 0, 0, 0, 18.00, NULL, 45, 9, '2025-11-03 09:22:19', 4.70),
(48, 'Pencil kit', 'Set of pencils', 2999.00, 'Books & Stationery', 'https://imgs.search.brave.com/-o5gpVfwXSrhiXHoasmCTHx9olX4cYOgibFY-rwT1xw/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMtbmEuc3NsLWlt/YWdlcy1hbWF6b24u/Y29tL2ltYWdlcy9J/LzgxMkVXQ0tiRXdM/LmpwZw', '[\"https://imgs.search.brave.com/-o5gpVfwXSrhiXHoasmCTHx9olX4cYOgibFY-rwT1xw/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMtbmEuc3NsLWlt/YWdlcy1hbWF6b24u/Y29tL2ltYWdlcy9J/LzgxMkVXQ0tiRXdM/LmpwZw\",\"https://imgs.search.brave.com/KYVe2rTWeZs68jiWlgJ9PdON8lFSJhx6V929rF3U2RM/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NTFYRlZzV3dZOUwu/anBn\"]', '[\"textbooks\",\"academic\",\"education\",\"learning\"]', 0, 0, 0, 30.00, NULL, 75, 15, '2025-11-03 09:22:19', 4.30),
(49, 'Asus Tuf F15 1tb 16GB 4060RTX', 'High-performance gaming laptop with 16GB RAM, 1TB SSD', 224999.00, 'Laptops & Computers', 'https://imgs.search.brave.com/eA11I7WJQ0l9fH9s9niKqHw0uRAhnM5U0wQWoOm4Yv4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9odHRw/Mi5tbHN0YXRpYy5j/b20vRF9RX05QXzJY/Xzc0MzA0NS1NTEI5/NTE3NjY5MTMwOF8x/MDIwMjUtRS1ub3Rl/Ym9vay1hc3VzLXR1/Zi1nYW1pbmctZjE1/LWk3LTY0Z2ItNTEy/Z2ItcnR4LTMwNTAt/MTQ0aHoud2VicA', '[\"https://imgs.search.brave.com/eA11I7WJQ0l9fH9s9niKqHw0uRAhnM5U0wQWoOm4Yv4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9odHRw/Mi5tbHN0YXRpYy5j/b20vRF9RX05QXzJY/Xzc0MzA0NS1NTEI5/NTE3NjY5MTMwOF8x/MDIwMjUtRS1ub3Rl/Ym9vay1hc3VzLXR1/Zi1nYW1pbmctZjE1/LWk3LTY0Z2ItNTEy/Z2ItcnR4LTMwNTAt/MTQ0aHoud2VicA\",\"https://imgs.search.brave.com/Wt5gKSXSS0IxRKh41gVJ805_1MneQhfZtjsxuvNdeKg/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS1pay5jcm9tYS5j/b20vcHJvZC9odHRw/czovL21lZGlhLnRh/dGFjcm9tYS5jb20v/Q3JvbWElMjBBc3Nl/dHMvQ29tcHV0ZXJz/JTIwUGVyaXBoZXJh/bHMvTGFwdG9wL0lt/YWdlcy8zMTM4NDVf/MV9wdzN2eWQucG5n\",\"https://imgs.search.brave.com/7A4jLj9unBiSl6FqdCepXmf9uL0dk2lhMper_0Jv29M/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9kbGNk/bndlYmltZ3MuYXN1/cy5jb20vZmlsZXMv/bWVkaWEvZGZlOTI1/ZDgtNGQ2Mi00Zjk4/LWFmOTctYWExMGFl/ZDhiYWFhL3YxL2lt/YWdlcy9tb2JpbGUv/a3Yva3YuanBn\",\"https://imgs.search.brave.com/V_XyVz3rijjg5sOEAUJz7PuGa07xaNoOSeWDlnlqBKk/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS1pay5jcm9tYS5j/b20vcHJvZC9odHRw/czovL21lZGlhLnRh/dGFjcm9tYS5jb20v/Q3JvbWElMjBBc3Nl/dHMvR2FtaW5nL0xh/cHRvcC9JbWFnZXMv/MzEzODQ1XzE4X2o5/bWcxeC5wbmc\"]', '[\"gaming\",\"laptop\",\"RTX\",\"performance\"]', 0, 1, 1, 12.00, NULL, 18, 4, '2025-11-03 09:22:19', 4.80),
(50, 'MAC Book M4 Apple', 'M4chip varient newly launched', 249999.00, 'Laptops & Computers', 'https://imgs.search.brave.com/1LqG2_MTmofPDNt_1PSt9UwY-SnveOsmX12g8L6r-gA/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9oZWxp/b3MtaS5tYXNoYWJs/ZS5jb20vaW1hZ2Vy/eS9hcnRpY2xlcy8w/MWE5aEMxbWE2cDBk/dmljRExvcUJ1Yi9o/ZXJvLWltYWdlLmZp/bGwuc2l6ZV8xMjQ4/eDcwMi52MTc1OTc0/ODgxMC5qcGc', '[\"https://imgs.search.brave.com/1LqG2_MTmofPDNt_1PSt9UwY-SnveOsmX12g8L6r-gA/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9oZWxp/b3MtaS5tYXNoYWJs/ZS5jb20vaW1hZ2Vy/eS9hcnRpY2xlcy8w/MWE5aEMxbWE2cDBk/dmljRExvcUJ1Yi9o/ZXJvLWltYWdlLmZp/bGwuc2l6ZV8xMjQ4/eDcwMi52MTc1OTc0/ODgxMC5qcGc\"]', '[\"ultrabook\",\"portable\",\"business\",\"lightweight\"]', 1, 0, 0, 8.00, NULL, 25, 5, '2025-11-03 09:22:19', 4.60),
(51, 'All-in-One Desktop PC', '27-inch all-in-one desktop with i7 processor, 16GB RAM', 189999.00, 'Laptops & Computers', 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500', '[\"https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500\", \"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500\", \"https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500\"]', '[\"desktop\", \"all-in-one\", \"computer\", \"workstation\"]', 0, 0, 1, 15.00, NULL, 15, 3, '2025-11-03 09:22:19', 4.70),
(52, 'Mechanical Gaming Keyboard', 'RGB mechanical keyboard with cherry MX switches', 12999.00, 'Laptops & Computers', 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500', '[\"https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500\", \"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500\", \"https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500\"]', '[\"keyboard\", \"gaming\", \"mechanical\", \"RGB\"]', 0, 0, 0, 20.00, NULL, 50, 10, '2025-11-03 09:22:19', 4.50),
(53, 'Wireless Mouse & Pad', 'Ergonomic wireless mouse with extended mouse pad', 3499.00, 'Laptops & Computers', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500', '[\"https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500\", \"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500\", \"https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500\"]', '[\"mouse\", \"wireless\", \"ergonomic\", \"computer\"]', 0, 0, 0, 10.00, NULL, 65, 13, '2025-11-03 09:22:19', 4.40),
(54, 'Designer Handbag', 'Luxury leather handbag with gold hardware', 25999.00, 'Fashion', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500', '[\"https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500\",\"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500\"]', '[\"handbag\",\"luxury\",\"fashion\",\"accessory\"]', 1, 1, 0, 25.00, NULL, 35, 7, '2025-11-03 09:22:19', 4.70),
(55, 'Silk Scarf Collection', 'Set of 3 premium silk scarves in different patterns', 8999.00, 'Fashion', 'https://imgs.search.brave.com/cMlCf_d-hE86i4pWYYsMxdzLYwCKwspX0ma_rcpkL_Q/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zaWxr/c2lsa3kuY29tL2Nk/bi9zaG9wL2ZpbGVz/L1AwNzRfU2lsa1Np/bGt5X1B1cmVfU2ls/a19TY2FyZl8wMDJf/Qy0yNTAyMjEwMDMu/anBnP3Y9MTc1Mjgw/OTIzNCZ3aWR0aD02/MDA', '[\"https://imgs.search.brave.com/cMlCf_d-hE86i4pWYYsMxdzLYwCKwspX0ma_rcpkL_Q/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zaWxr/c2lsa3kuY29tL2Nk/bi9zaG9wL2ZpbGVz/L1AwNzRfU2lsa1Np/bGt5X1B1cmVfU2ls/a19TY2FyZl8wMDJf/Qy0yNTAyMjEwMDMu/anBnP3Y9MTc1Mjgw/OTIzNCZ3aWR0aD02/MDA\",\"https://imgs.search.brave.com/J-IpxQgG-y-u5nG5Ze6K0yAsy3K9YN8bQvChf4MTDAw/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/ODFubFg5bG8rcUwu/anBn\"]', '[\"scarf\",\"silk\",\"fashion\",\"accessory\"]', 1, 0, 0, 20.00, NULL, 60, 12, '2025-11-03 09:22:19', 4.50),
(56, 'Leather Wallet for Men', 'Genuine leather wallet with multiple card slots', 5499.00, 'Fashion', 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500', '[\"https://images.unsplash.com/photo-1627123424574-724758594e93?w=500\", \"https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500\", \"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500\"]', '[\"wallet\", \"leather\", \"mens\", \"fashion\"]', 0, 0, 1, 15.00, NULL, 75, 15, '2025-11-03 09:22:19', 4.40),
(57, 'Fashion Sunglasses', 'Trendy sunglasses with UV400 protection', 6999.00, 'Fashion', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500', '[\"https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500\"]', '[\"sunglasses\",\"fashion\",\"accessory\",\"style\"]', 0, 0, 0, 18.00, NULL, 80, 16, '2025-11-03 09:22:19', 4.30),
(58, 'Designer Belt', 'Genuine leather belt with metal buckle', 4299.00, 'Fashion', 'https://imgs.search.brave.com/bhS7dUJeUIxq9YGkevR3oZVkdeHtyoKlPDuxkn1nJ2c/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/ODFsUzJ5QUQ3ckwu/anBn', '[\"https://imgs.search.brave.com/bhS7dUJeUIxq9YGkevR3oZVkdeHtyoKlPDuxkn1nJ2c/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/ODFsUzJ5QUQ3ckwu/anBn\",\"https://imgs.search.brave.com/fwq5zbCarH_2S4pxE25QavvBcW7_ZKicvJF1hh7el-M/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/YnVsbGhpZGViZWx0/cy5jb20vY2RuL3No/b3AvcHJvZHVjdHMv/cHJvXzIwMl9ibGFj/a19waWMxLW1pbl80/MDB4LnBuZz92PTE3/MzkyMTI5NzM\"]', '[\"belt\",\"leather\",\"fashion\",\"accessory\"]', 0, 0, 0, 12.00, NULL, 65, 13, '2025-11-03 09:22:19', 4.60),
(59, 'Smart Refrigerator', 'Double door smart refrigerator with Wi-Fi connectivity', 124999.00, 'Home Appliances', 'https://imgs.search.brave.com/5R45I0NOUBgx7rVcXuVsNsuMK2QRUFzU0rMJml3ulCo/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zLmFs/aWNkbi5jb20vQHNj/MDQva2YvQTM0ZWI3/MDk1NzYyZjQzY2U4/NDA3YmZjZDVkOWNh/NTA5SC5wbmdfMzAw/eDMwMC5qcGc', '[\"https://imgs.search.brave.com/5R45I0NOUBgx7rVcXuVsNsuMK2QRUFzU0rMJml3ulCo/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zLmFs/aWNkbi5jb20vQHNj/MDQva2YvQTM0ZWI3/MDk1NzYyZjQzY2U4/NDA3YmZjZDVkOWNh/NTA5SC5wbmdfMzAw/eDMwMC5qcGc\"]', '[\"refrigerator\",\"smart\",\"kitchen\",\"appliance\"]', 1, 1, 0, 15.00, NULL, 12, 3, '2025-11-03 09:22:19', 4.80),
(60, 'Washing Machine 8kg', 'Fully automatic front load washing machine', 67999.00, 'Home Appliances', 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=500', '[\"https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=500\", \"https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=500\", \"https://images.unsplash.com/photo-1581093458791-8a6b6d47e9d8?w=500\"]', '[\"washing-machine\", \"laundry\", \"home\", \"appliance\"]', 1, 0, 0, 12.00, NULL, 20, 4, '2025-11-03 09:22:19', 4.60),
(61, 'Air Conditioner 1.5Ton', 'Inverter split AC with 5-star energy rating', 84999.00, 'Home Appliances', 'https://imgs.search.brave.com/A8VrXWixR-k8Bjn9KYAnEdkWnY9F_bcm7VNn6LNhSv0/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9hc3Nl/dHMud2ZjZG4uY29t/L2ltLzYzMTY3NTUz/L3Jlc2l6ZS1oNDAw/LXc0MDBeY29tcHIt/cjg1LzM1NjAvMzU2/MDcxNTA3LzUsMDAw/K0JUVStXaW5kb3cr/QWlyK0NvbmRpdGlv/bmVyLCsxMTVWLmpw/Zw', '[\"https://imgs.search.brave.com/A8VrXWixR-k8Bjn9KYAnEdkWnY9F_bcm7VNn6LNhSv0/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9hc3Nl/dHMud2ZjZG4uY29t/L2ltLzYzMTY3NTUz/L3Jlc2l6ZS1oNDAw/LXc0MDBeY29tcHIt/cjg1LzM1NjAvMzU2/MDcxNTA3LzUsMDAw/K0JUVStXaW5kb3cr/QWlyK0NvbmRpdGlv/bmVyLCsxMTVWLmpw/Zw\",\"https://imgs.search.brave.com/1jIihjBGck6pcr4G8ZWszhxwzUlDibZV172GHKM-_IY/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTU3/MzM3Mjk4L3Bob3Rv/L2Fpci1jb25kaXRp/b25lci5qcGc_cz02/MTJ4NjEyJnc9MCZr/PTIwJmM9cjBfb0hR/S1h4cnVoQnJfQVJJ/VnZkUW54V1BYaFNQ/cklIamREOGI4MW5I/dz0\"]', '[\"AC\",\"air-conditioner\",\"cooling\",\"home\"]', 0, 0, 1, 18.00, NULL, 15, 3, '2025-11-03 09:22:19', 4.70),
(62, 'Microwave Oven', 'Convection microwave oven with grill function', 18999.00, 'Home Appliances', 'https://imgs.search.brave.com/KbCSmk-SWrt3MfYuCH3OBgJDuSpulRBwIa3ioHrOA2g/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvNTIz/NDY2NzAvcGhvdG8v/YS1zYW1zdW5nLW1p/Y3Jvd2F2ZS1vdmVu/LWZlYXR1cmVzLWEt/bnVtZXJpYy1rZXlw/YWQtYW5kLWEtZGln/aXRhbC1kaXNwbGF5/LXNjcmVlbi1jaXJj/YS0xOTg1LmpwZz9z/PTYxMng2MTImdz0w/Jms9MjAmYz1RT0dv/VlduOWdzVTRFSXNO/d2plc0I2eFlHeFN0/RmVyRndnRzFBcXhs/bXVBPQ', '[\"https://imgs.search.brave.com/KbCSmk-SWrt3MfYuCH3OBgJDuSpulRBwIa3ioHrOA2g/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvNTIz/NDY2NzAvcGhvdG8v/YS1zYW1zdW5nLW1p/Y3Jvd2F2ZS1vdmVu/LWZlYXR1cmVzLWEt/bnVtZXJpYy1rZXlw/YWQtYW5kLWEtZGln/aXRhbC1kaXNwbGF5/LXNjcmVlbi1jaXJj/YS0xOTg1LmpwZz9z/PTYxMng2MTImdz0w/Jms9MjAmYz1RT0dv/VlduOWdzVTRFSXNO/d2plc0I2eFlHeFN0/RmVyRndnRzFBcXhs/bXVBPQ\",\"https://imgs.search.brave.com/wUWbbOvWqh7iukatzbblvjEn3kMEMLvm-Ix5ZClfi_w/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTE0/NDk2MDUxOS9waG90/by9tb2Rlcm4ta2l0/Y2hlbi1taWNyb3dh/dmUtb3Zlbi5qcGc_/cz02MTJ4NjEyJnc9/MCZrPTIwJmM9MFZP/OGZBU1lhZUotenpC/OWxJSGRYdVJ0M1Jr/a2htRm5WZm54WTdj/Y3hUND0\"]', '[\"microwave\",\"oven\",\"kitchen\",\"cooking\"]', 0, 0, 0, 10.00, NULL, 35, 7, '2025-11-03 09:22:19', 4.40),
(63, 'Water Purifier', 'KENT RO deta he sabse sudh pani\nRO+UV water purifier with 7-liter storage', 15999.00, 'Home Appliances', 'https://imgs.search.brave.com/NHu-mha0-tOWOYSD1UoLBh2SHKH7gZ2gUrUJcIXp7F8/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NzF1eVdZYkpGWUwu/anBn', '[\"https://imgs.search.brave.com/NHu-mha0-tOWOYSD1UoLBh2SHKH7gZ2gUrUJcIXp7F8/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NzF1eVdZYkpGWUwu/anBn\"]', '[\"water-purifier\",\"RO\",\"health\",\"home\"]', 0, 0, 1, 15.00, NULL, 40, 8, '2025-11-03 09:22:19', 4.50),
(64, 'Basmati Rice', 'Premium quality organic basmati rice', 1299.00, 'Grocery', 'https://imgs.search.brave.com/a5edo0JrwyDruHOhLa-zMxNteQxh37lLl7zyGOyhdOQ/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/bWlsYW53aG9sZXNh/bGUuY29tL3N0b3Jh/Z2UvcHJvZHVjdHMv/MjAyNC9BdWd1c3Qv/MTkvdGh1bWJuYWls/cy8xXzE3MjQwNTE1/NzcuanBlZw', '[\"https://imgs.search.brave.com/a5edo0JrwyDruHOhLa-zMxNteQxh37lLl7zyGOyhdOQ/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/bWlsYW53aG9sZXNh/bGUuY29tL3N0b3Jh/Z2UvcHJvZHVjdHMv/MjAyNC9BdWd1c3Qv/MTkvdGh1bWJuYWls/cy8xXzE3MjQwNTE1/NzcuanBlZw\"]', '[\"rice\",\"organic\",\"grocery\",\"food\"]', 1, 1, 0, 10.00, NULL, 200, 40, '2025-11-03 09:22:19', 4.70),
(65, 'Extra Virgin Olive Oil', 'Cold-pressed extra virgin olive oil 1L', 1899.00, 'Grocery', 'https://imgs.search.brave.com/iQe4fYzzI0goRcc-bRrmABZq7BrclzePiWVVyeLpLTQ/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzJlLzcx/L2M3LzJlNzFjN2Y2/YmU0MDY1NjgyMWFk/ZmQxZmNlZDRlMTE5/LmpwZw', '[\"https://imgs.search.brave.com/iQe4fYzzI0goRcc-bRrmABZq7BrclzePiWVVyeLpLTQ/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzJlLzcx/L2M3LzJlNzFjN2Y2/YmU0MDY1NjgyMWFk/ZmQxZmNlZDRlMTE5/LmpwZw\"]', '[\"olive-oil\",\"cooking\",\"healthy\",\"grocery\"]', 1, 0, 0, 15.00, NULL, 150, 30, '2025-11-03 09:22:19', 4.60),
(66, 'Assorted Dry Fruits', 'Premium mixed dry fruits and nuts 500g', 2499.00, 'Grocery', 'https://imgs.search.brave.com/gX-s0eRZOSxSkuaMcYlpIlFfllhc40bBgU6CLXKyQQ4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9ydWtt/aW5pbTIuZmxpeGNh/cnQuY29tL2ltYWdl/LzYxMi82MTIveGlm/MHEvbnV0LWRyeS1m/cnVpdC9iL2Evdy8x/LW1peC1kcnktZnJ1/aXRzLWFuZC1udXRz/LWFsbW9uZHMtcGlz/dGFjaGlvcy1jYXNo/ZXctYXByaWNvdC0x/a2ctb3JpZ2luYWwt/aW1haGNjeDk4cTdx/bmhyei5qcGVnP3E9/NzA', '[\"https://imgs.search.brave.com/gX-s0eRZOSxSkuaMcYlpIlFfllhc40bBgU6CLXKyQQ4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9ydWtt/aW5pbTIuZmxpeGNh/cnQuY29tL2ltYWdl/LzYxMi82MTIveGlm/MHEvbnV0LWRyeS1m/cnVpdC9iL2Evdy8x/LW1peC1kcnktZnJ1/aXRzLWFuZC1udXRz/LWFsbW9uZHMtcGlz/dGFjaGlvcy1jYXNo/ZXctYXByaWNvdC0x/a2ctb3JpZ2luYWwt/aW1haGNjeDk4cTdx/bmhyei5qcGVnP3E9/NzA\",\"https://imgs.search.brave.com/s3tMHr2CPP2vQ3vsNL9fNb6rRouxZ1AqFhjBMPqlCiA/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzA5LzU1LzA4Lzc3/LzM2MF9GXzk1NTA4/Nzc4M191SEVpTG9p/NkljWkFYb1dmRnBI/MVcxNEUyaVJ3WFZs/cC5qcGc\"]', '[\"dry-fruits\",\"nuts\",\"healthy\",\"snacks\"]', 0, 0, 1, 20.00, NULL, 120, 25, '2025-11-03 09:22:19', 4.80),
(67, 'Himalayan Honey', 'Pure natural honey from Himalayan region 500g', 999.00, 'Grocery', 'https://imgs.search.brave.com/E129N22uIQrAhX-h0nFVrMivxaCcg_39g46C8irTPlI/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9yb3Nl/c2FuZHR1bGlwLmNv/bS9jZG4vc2hvcC9m/aWxlcy8zXzQ2YWMw/YjVjLWE3NjYtNDNi/YS1hMjI3LTJmY2Y5/MzBkZDQzOC5wbmc_/dj0xNjg5NjE3ODk0/JndpZHRoPTEyMTQ', '[\"https://imgs.search.brave.com/E129N22uIQrAhX-h0nFVrMivxaCcg_39g46C8irTPlI/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9yb3Nl/c2FuZHR1bGlwLmNv/bS9jZG4vc2hvcC9m/aWxlcy8zXzQ2YWMw/YjVjLWE3NjYtNDNi/YS1hMjI3LTJmY2Y5/MzBkZDQzOC5wbmc_/dj0xNjg5NjE3ODk0/JndpZHRoPTEyMTQ\"]', '[\"honey\",\"natural\",\"healthy\",\"sweetener\"]', 0, 0, 0, 12.00, NULL, 180, 36, '2025-11-03 09:22:19', 4.50);
INSERT INTO `products` (`id`, `name`, `description`, `price`, `category`, `image_url`, `image_urls`, `tags`, `is_featured`, `featured`, `is_new`, `discount_percentage`, `offer_valid_until`, `stock_quantity`, `min_stock_level`, `created_at`, `rating`) VALUES
(68, 'Nepali Masala Collection', 'Set of 10 essential Indian spices in glass jars', 2999.00, 'Grocery', 'https://imgs.search.brave.com/pEtoH0Ed2OFRtOG2iLnJABO-IixRN-uJa-4GoL4HmlA/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9ibG9n/Z2VyLmdvb2dsZXVz/ZXJjb250ZW50LmNv/bS9pbWcvYi9SMjl2/WjJ4bC9BVnZYc0Vq/NTJNOHpuTnp3cTA1/cjVRenNfYVhpMlYy/WXdrT1ZrZFE1aXUt/RXZwdE1Sblc0WGw1/bW4wcVgxaHA2WnFk/NTZEX1h2RjJZZ2Fo/Vnc2VFNKWTg5d3R1/UHlYbVRwNzZ3QXJV/V2FfcUM3SVFpcHNQ/MWh0VjRVSnNMVVFs/ZXJRUDRVNTdRSU5X/YU1tY1FKNTgvczE2/MDAvMS1JTUdfMDE0/OC5KUEc', '[\"https://imgs.search.brave.com/pEtoH0Ed2OFRtOG2iLnJABO-IixRN-uJa-4GoL4HmlA/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9ibG9n/Z2VyLmdvb2dsZXVz/ZXJjb250ZW50LmNv/bS9pbWcvYi9SMjl2/WjJ4bC9BVnZYc0Vq/NTJNOHpuTnp3cTA1/cjVRenNfYVhpMlYy/WXdrT1ZrZFE1aXUt/RXZwdE1Sblc0WGw1/bW4wcVgxaHA2WnFk/NTZEX1h2RjJZZ2Fo/Vnc2VFNKWTg5d3R1/UHlYbVRwNzZ3QXJV/V2FfcUM3SVFpcHNQ/MWh0VjRVSnNMVVFs/ZXJRUDRVNTdRSU5X/YU1tY1FKNTgvczE2/MDAvMS1JTUdfMDE0/OC5KUEc\",\"https://imgs.search.brave.com/pEtoH0Ed2OFRtOG2iLnJABO-IixRN-uJa-4GoL4HmlA/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9ibG9n/Z2VyLmdvb2dsZXVz/ZXJjb250ZW50LmNv/bS9pbWcvYi9SMjl2/WjJ4bC9BVnZYc0Vq/NTJNOHpuTnp3cTA1/cjVRenNfYVhpMlYy/WXdrT1ZrZFE1aXUt/RXZwdE1Sblc0WGw1/bW4wcVgxaHA2WnFk/NTZEX1h2RjJZZ2Fo/Vnc2VFNKWTg5d3R1/UHlYbVRwNzZ3QXJV/V2FfcUM3SVFpcHNQ/MWh0VjRVSnNMVVFs/ZXJRUDRVNTdRSU5X/YU1tY1FKNTgvczE2/MDAvMS1JTUdfMDE0/OC5KUEc\"]', '[\"spices\"]', 0, 0, 1, 25.00, NULL, 90, 18, '2025-11-03 09:22:19', 4.70),
(69, 'LEGO Creator Set', '300-piece LEGO building blocks set for creative play', 4999.00, 'Toys & Games', 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500', '[\"https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500\"]', '[\"LEGO\",\"building\",\"creative\",\"toys\"]', 0, 1, 0, 20.00, NULL, 80, 16, '2025-11-03 09:22:19', 4.80),
(70, 'Remote Control Car', '2.4GHz remote control car with rechargeable battery', 3499.00, 'Toys & Games', 'https://imgs.search.brave.com/WnkuelYcPcTad2V643JRIndrK7KSg3FA7Bj2aTbGimU/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/cGFyZW50cy5jb20v/dGhtYi9NM2xMRGVI/d0lCc3Rlel9wVjJ3/RVQwbG1IT3c9L2Zp/dC1pbi8xNTAweDI2/NjcvZmlsdGVyczpu/b191cHNjYWxlKCk6/bWF4X2J5dGVzKDE1/MDAwMCk6c3RyaXBf/aWNjKCkvcHJ0LW9y/cmVudGUtb2ZmLXJv/YWQtcmVtb3ZlLWNv/bnRyb2wtY2FyLTQt/ZGVkNGNkNDdjNzgz/NDM5MDllYjQ4NWVh/ZjVlOTZkNDQuanBl/Zw', '[\"https://imgs.search.brave.com/WnkuelYcPcTad2V643JRIndrK7KSg3FA7Bj2aTbGimU/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/cGFyZW50cy5jb20v/dGhtYi9NM2xMRGVI/d0lCc3Rlel9wVjJ3/RVQwbG1IT3c9L2Zp/dC1pbi8xNTAweDI2/NjcvZmlsdGVyczpu/b191cHNjYWxlKCk6/bWF4X2J5dGVzKDE1/MDAwMCk6c3RyaXBf/aWNjKCkvcHJ0LW9y/cmVudGUtb2ZmLXJv/YWQtcmVtb3ZlLWNv/bnRyb2wtY2FyLTQt/ZGVkNGNkNDdjNzgz/NDM5MDllYjQ4NWVh/ZjVlOTZkNDQuanBl/Zw\",\"https://imgs.search.brave.com/296cDXOV5YDMNkQWmH_eJrPIcwsSlMxDbuZElt0LfOc/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/cGFyZW50cy5jb20v/dGhtYi9qUzEtR3ZW/SW1SQnROSXNpak5m/VFBkR0VhSE09L2Zp/dC1pbi8xNTAweDI2/NjcvZmlsdGVyczpu/b191cHNjYWxlKCk6/bWF4X2J5dGVzKDE1/MDAwMCk6c3RyaXBf/aWNjKCkvcHJ0LW9y/cmVudGUtb2ZmLXJv/YWQtcmVtb3ZlLWNv/bnRyb2wtY2FyLTEt/ZTlmNGZlNTE1ZTFk/NDZiODhmZTZkOWVl/NmQ2ZDY3NTQuanBl/Zw\"]', '[\"RC-car\",\"remote-control\",\"toys\",\"fun\"]', 1, 0, 0, 15.00, NULL, 65, 13, '2025-11-03 09:22:19', 4.60),
(71, 'Educational Board Games', 'Set of 3 educational board games for family fun', 2799.00, 'Toys & Games', 'https://imgs.search.brave.com/umehBF09sF61woRug5DXRWUuGvShKy8r14hxDApoGtQ/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jb29s/bW9tcGlja3MuY29t/L3dwLWNvbnRlbnQv/dXBsb2Fkcy8yMDIw/LzA4L2JvYXJkLWdh/bWVzLWZvci1ob21l/c2Nob29sLXRpbWVs/aW5lLWNoYWxsZW5n/ZS5qcGc', '[\"https://imgs.search.brave.com/umehBF09sF61woRug5DXRWUuGvShKy8r14hxDApoGtQ/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jb29s/bW9tcGlja3MuY29t/L3dwLWNvbnRlbnQv/dXBsb2Fkcy8yMDIw/LzA4L2JvYXJkLWdh/bWVzLWZvci1ob21l/c2Nob29sLXRpbWVs/aW5lLWNoYWxsZW5n/ZS5qcGc\"]', '[\"board-games\",\"educational\",\"family\",\"fun\"]', 0, 0, 0, 18.00, NULL, 45, 9, '2025-11-03 09:22:19', 4.50),
(72, 'Plush Teddy Bear', 'Soft and cuddly teddy bear 18-inch height', 1999.00, 'Toys & Games', 'https://imgs.search.brave.com/wP8oXp2uyUye_VdDssqbNhCNpnfuBfY-TLIzGbVQy9U/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/c2h1dHRlcnN0b2Nr/LmNvbS9pbWFnZS1w/aG90by9jdXRlLWJy/b3duLXRlZGR5LWJl/YXItb24tMjYwbnct/MjQwODAxMjE0OS5q/cGc', '[\"https://imgs.search.brave.com/wP8oXp2uyUye_VdDssqbNhCNpnfuBfY-TLIzGbVQy9U/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/c2h1dHRlcnN0b2Nr/LmNvbS9pbWFnZS1w/aG90by9jdXRlLWJy/b3duLXRlZGR5LWJl/YXItb24tMjYwbnct/MjQwODAxMjE0OS5q/cGc\",\"https://imgs.search.brave.com/Bo8v-EBW5m1Qe0tTsXCYNN2I78_7vX3dtcwLM9G7xhs/rs:fit:0:180:1:0/g:ce/aHR0cHM6Ly93YXJt/aWVzLmNvbS9jZG4v/c2hvcC9jb2xsZWN0/aW9ucy8yMDAweDUz/My1CZWFyLUNvbGxl/Y3Rpb24tUGFnZS1E/ZXNrdG9wLmpwZz92/PTE3NjExNDcyMDkm/d2lkdGg9MjAwMA\"]', '[\"teddy-bear\",\"plush\",\"soft-toy\",\"gift\"]', 0, 0, 1, 10.00, NULL, 120, 24, '2025-11-03 09:22:19', 4.70),
(73, 'Puzzle Set 1000 Pieces', 'Challenging 1000-piece jigsaw puzzle with beautiful artwork', 2299.00, 'Toys & Games', 'https://imgs.search.brave.com/ZXkJe1mOr2li6Z_10KMMpmMMaLN88j2j3I_vVaZE-NM/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pNS53/YWxtYXJ0aW1hZ2Vz/LmNvbS9zZW8vTWFz/dGVyUGllY2VzLUpp/Z3Nhdy1QdXp6bGUt/MTItUGFjay1CdW5k/bGUtU2V0LUFydGlz/dC1HYWxsZXJ5LUNv/bGxlY3Rpb24tTGFu/ZHNjYXBlLWFuZC1B/bmltYWwtUHV6emxl/cy1GYW1pbHktRnVu/LWZvci1BZHVsdHMt/YW5kLUtpZHNfNzJl/Yzc5NzQtMWQ4OC00/ZjEyLWFkYjctODRi/NzkzMGQ1YTBlLmE4/OGVhMmRhNTFhNmQy/NGNlMDk3N2NjNTlh/OTE1MzI0LmpwZWc_/b2RuSGVpZ2h0PTU4/MCZvZG5XaWR0aD01/ODAmb2RuQmc9RkZG/RkZG', '[\"https://imgs.search.brave.com/ZXkJe1mOr2li6Z_10KMMpmMMaLN88j2j3I_vVaZE-NM/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pNS53/YWxtYXJ0aW1hZ2Vz/LmNvbS9zZW8vTWFz/dGVyUGllY2VzLUpp/Z3Nhdy1QdXp6bGUt/MTItUGFjay1CdW5k/bGUtU2V0LUFydGlz/dC1HYWxsZXJ5LUNv/bGxlY3Rpb24tTGFu/ZHNjYXBlLWFuZC1B/bmltYWwtUHV6emxl/cy1GYW1pbHktRnVu/LWZvci1BZHVsdHMt/YW5kLUtpZHNfNzJl/Yzc5NzQtMWQ4OC00/ZjEyLWFkYjctODRi/NzkzMGQ1YTBlLmE4/OGVhMmRhNTFhNmQy/NGNlMDk3N2NjNTlh/OTE1MzI0LmpwZWc_/b2RuSGVpZ2h0PTU4/MCZvZG5XaWR0aD01/ODAmb2RuQmc9RkZG/RkZG\"]', '[\"puzzle\",\"jigsaw\",\"challenge\",\"games\"]', 0, 0, 0, 12.00, NULL, 75, 15, '2025-11-03 09:22:19', 4.40);

-- --------------------------------------------------------

--
-- Table structure for table `product_offers`
--

CREATE TABLE `product_offers` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `offer_type` enum('Bogo','flat_discount','percentage_discount','bulk_discount','clearance_sale','flash_sale') DEFAULT 'flat_discount',
  `discount_percentage` decimal(5,2) DEFAULT NULL,
  `discount_amount` decimal(10,2) DEFAULT NULL,
  `min_quantity` int(11) DEFAULT NULL,
  `max_quantity` int(11) DEFAULT NULL,
  `valid_from` datetime DEFAULT current_timestamp(),
  `valid_until` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_offers`
--

INSERT INTO `product_offers` (`id`, `product_id`, `offer_type`, `discount_percentage`, `discount_amount`, `min_quantity`, `max_quantity`, `valid_from`, `valid_until`, `is_active`, `description`, `created_at`, `updated_at`) VALUES
(1, 22, 'Bogo', 0.00, 0.00, NULL, NULL, '2025-11-03 00:00:00', '2025-11-25 00:00:00', 1, 'Tihar special offer', '2025-10-25 05:31:38', '2025-11-03 17:20:44'),
(2, 4, 'flat_discount', NULL, 30000.00, NULL, NULL, '2025-11-03 00:00:00', '2025-11-28 00:00:00', 1, 'NEW launched iphone 17 pro max is on sale', '2025-11-03 16:34:16', '2025-11-03 17:20:15');

-- --------------------------------------------------------

--
-- Table structure for table `promo_codes`
--

CREATE TABLE `promo_codes` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `discount_type` enum('percentage','fixed','free_shipping') DEFAULT 'fixed',
  `discount_value` decimal(10,2) DEFAULT 0.00,
  `min_order_amount` decimal(10,2) DEFAULT 0.00,
  `max_discount_amount` decimal(10,2) DEFAULT NULL,
  `usage_limit` int(11) DEFAULT NULL,
  `used_count` int(11) DEFAULT 0,
  `categories` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`categories`)),
  `valid_from` datetime DEFAULT current_timestamp(),
  `valid_until` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `promo_codes`
--

INSERT INTO `promo_codes` (`id`, `code`, `description`, `discount_type`, `discount_value`, `min_order_amount`, `max_discount_amount`, `usage_limit`, `used_count`, `categories`, `valid_from`, `valid_until`, `is_active`, `created_at`) VALUES
(1, 'WELCOME10', '10% off on your first order', 'percentage', 10.00, 500.00, 200.00, 1, 1, NULL, '2025-10-21 17:16:50', '2025-12-31 23:59:59', 1, '2025-10-21 05:46:50'),
(2, 'FREESHIP', 'Free shipping on all orders', 'free_shipping', 0.00, 300.00, NULL, NULL, 0, NULL, '2025-10-21 17:16:50', '2025-12-31 23:59:59', 1, '2025-10-21 05:46:50'),
(3, 'SAVE50', 'Rs. 50 off on orders above Rs. 1000', 'fixed', 50.00, 1000.00, 50.00, NULL, 0, NULL, '2025-10-21 17:16:50', '2025-12-31 23:59:59', 1, '2025-10-21 05:46:50'),
(4, 'ELECTRO15', '15% off on electronics', 'percentage', 15.00, 0.00, 500.00, NULL, 0, '[\"Electronics\"]', '2025-10-21 17:16:50', '2025-12-31 23:59:59', 1, '2025-10-21 05:46:50'),
(5, 'FLASH100', 'Rs. 100 off on all categories', 'fixed', 100.00, 500.00, 100.00, 100, 1, NULL, '2025-10-21 17:16:50', '2025-10-25 23:59:59', 1, '2025-10-21 05:46:50');

-- --------------------------------------------------------

--
-- Table structure for table `promo_usage`
--

CREATE TABLE `promo_usage` (
  `id` int(11) NOT NULL,
  `promo_code_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `order_id` int(11) DEFAULT NULL,
  `used_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `comment` text DEFAULT NULL,
  `user_name` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT 'Nepal',
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `email_verified` tinyint(1) DEFAULT 0,
  `email_verification_token` varchar(6) DEFAULT NULL,
  `email_verification_expires` datetime DEFAULT NULL,
  `password_reset_token` varchar(6) DEFAULT NULL,
  `password_reset_expires` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `address`, `city`, `country`, `password`, `role`, `email_verified`, `email_verification_token`, `email_verification_expires`, `password_reset_token`, `password_reset_expires`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'niranjanadmin@gmail.com', '9898989898', 'KaPan', 'KathManDu', 'NePaL', '$2b$12$wAknHxyJiJj4tslxbjiiPeVEybsOiadh0fZ2ro5J8f7ZyruGxLYiO', 'admin', 1, '121212', NULL, NULL, NULL, '2025-10-18 03:33:19', '2025-11-02 12:04:24'),
(11, 'Nirrrr', 'katwalniranjan40@gmail.com', '9818958772', 'ktm', 'kathmandu', 'Nepal', '$2b$12$jvRCgMkIweDzF9Ww8RFJfuK0XPWQwrUqStjQZwFSeSVn2fd8B.Dau', 'user', 1, NULL, NULL, NULL, NULL, '2025-11-02 11:58:57', '2025-11-02 12:07:32');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`,`product_id`,`offer_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `offer_id` (`offer_id`),
  ADD KEY `idx_cart_user_id` (`user_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_items_order_id` (`order_id`),
  ADD KEY `idx_order_items_product_id` (`product_id`);

--
-- Indexes for table `order_tracking`
--
ALTER TABLE `order_tracking`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_payments_order_id` (`order_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `product_offers`
--
ALTER TABLE `product_offers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_product_offers_product_id` (`product_id`),
  ADD KEY `idx_product_offers_active` (`is_active`),
  ADD KEY `idx_product_offers_valid_dates` (`valid_from`,`valid_until`);

--
-- Indexes for table `promo_codes`
--
ALTER TABLE `promo_codes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD UNIQUE KEY `idx_unique_promo_code` (`code`);

--
-- Indexes for table `promo_usage`
--
ALTER TABLE `promo_usage`
  ADD PRIMARY KEY (`id`),
  ADD KEY `promo_code_id` (`promo_code_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cart`
--
ALTER TABLE `cart`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `order_tracking`
--
ALTER TABLE `order_tracking`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=78;

--
-- AUTO_INCREMENT for table `product_offers`
--
ALTER TABLE `product_offers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `promo_codes`
--
ALTER TABLE `promo_codes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `promo_usage`
--
ALTER TABLE `promo_usage`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_ibfk_3` FOREIGN KEY (`offer_id`) REFERENCES `product_offers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_tracking`
--
ALTER TABLE `order_tracking`
  ADD CONSTRAINT `order_tracking_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_offers`
--
ALTER TABLE `product_offers`
  ADD CONSTRAINT `product_offers_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `promo_usage`
--
ALTER TABLE `promo_usage`
  ADD CONSTRAINT `promo_usage_ibfk_1` FOREIGN KEY (`promo_code_id`) REFERENCES `promo_codes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `promo_usage_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `promo_usage_ibfk_3` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
