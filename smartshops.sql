-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 02, 2025 at 11:56 AM
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

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `title`, `message`, `type`, `image_url`, `target_users`, `user_ids`, `expires_at`, `created_by`, `is_read`, `created_at`) VALUES
(1, 'hello', 'this is me', 'system', 'https://imgs.search.brave.com/fslDzeLxDi1W6-N35BetoHMHoNm11hEnpnHrpOvQWK4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzFjL2E3/Lzk3LzFjYTc5Nzdk/NTYzNTYyNTM5NTkz/YmE5ZjU3ZDU5Zjg2/LmpwZw', 'all', NULL, '2025-10-31 16:36:00', 3, 0, '2025-10-30 10:52:07');

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
(2, 'Smartphone XYZ Pro', 'Latest smartphone with advanced camera and 5G connectivity', 699.99, 'Electronics', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500', '[\"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500\",\"https://imgs.search.brave.com/-UhD5gI00QPEMHOXSUc1IYkW4b2xkRk20l9oTtlTL5Q/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/aW5kaWFpc3RvcmUu/Y29tL3RoZW1lcy9m/cm9udGVuZC9jdXN0/b20vaW1hZ2VzL3By/b2R1Y3QvaXBob25l/LTE3LXByby1jb21p/bmctc29vbi9kZXNr/dG9wLzAxLmpwZw\"]', '[]', 1, 0, 0, 0.00, NULL, 27, 5, '2025-10-17 05:33:51', 0.00),
(3, 'Cotton T-Shirt', 'Comfortable 100% cotton t-shirt for everyday wear', 19.99, 'Clothing', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', NULL, NULL, 0, 0, 0, 0.00, NULL, 92, 5, '2025-10-17 05:33:51', 0.00),
(4, 'Running Shoes', 'Professional running shoes with advanced cushion technology', 129.99, 'Footwear', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', NULL, NULL, 0, 0, 0, 0.00, NULL, 35, 5, '2025-10-17 05:33:51', 0.00),
(5, 'Laptop Backpack', 'Durable laptop backpack with multiple compartments', 49.99, 'Accessories', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', NULL, NULL, 1, 0, 0, 0.00, NULL, 73, 5, '2025-10-17 05:33:51', 0.00),
(7, 'Iphone 17', 'New launched', 10000.00, 'Mobile Phones', 'https://imgs.search.brave.com/3DaQJErST-2vEVjoLeMa5eDYTbJh6ORUD0jKOcrMtWI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5jbm4uY29tL2Fw/aS92MS9pbWFnZXMv/c3RlbGxhci9wcm9k/L2FwcGxlLWlwaG9u/ZS0xNy1wcm8tbWF4/LmpwZz9jPTE2eDkm/cT1oXzcyMCx3XzEy/ODAsY19maWxs', '[\"https://imgs.search.brave.com/3DaQJErST-2vEVjoLeMa5eDYTbJh6ORUD0jKOcrMtWI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5jbm4uY29tL2Fw/aS92MS9pbWFnZXMv/c3RlbGxhci9wcm9k/L2FwcGxlLWlwaG9u/ZS0xNy1wcm8tbWF4/LmpwZz9jPTE2eDkm/cT1oXzcyMCx3XzEy/ODAsY19maWxs\",\"https://imgs.search.brave.com/-UhD5gI00QPEMHOXSUc1IYkW4b2xkRk20l9oTtlTL5Q/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/aW5kaWFpc3RvcmUu/Y29tL3RoZW1lcy9m/cm9udGVuZC9jdXN0/b20vaW1hZ2VzL3By/b2R1Y3QvaXBob25l/LTE3LXByby1jb21p/bmctc29vbi9kZXNr/dG9wLzAxLmpwZw\",\"https://imgs.search.brave.com/GKtmIq60RRdMa1J7G5dJG-aUItLvmvUV9aqfyyGnjMM/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9mZG4u/Z3NtYXJlbmEuY29t/L2ltZ3Jvb3QvcmV2/aWV3cy8yNS9hcHBs/ZS1pcGhvbmUtMTct/cHJvLW1heC9saWZl/c3R5bGUvLTEwMjR3/Mi9nc21hcmVuYV8w/MjIuanBn\",\"http://localhost:5000/uploads/image-1761908272850-680854207.webp\"]', '[\"Ondemand\"]', 0, 0, 0, 0.00, NULL, 2, 5, '2025-10-31 10:57:56', 0.00);

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
(1, 3, 'Bogo', 0.00, 0.00, NULL, NULL, '2025-10-30 00:00:00', '2025-11-05 00:00:00', 1, 'Tihar special offer', '2025-10-25 05:31:38', '2025-10-30 03:59:58');

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `address`, `city`, `country`, `password`, `role`, `email_verified`, `email_verification_token`, `email_verification_expires`, `password_reset_token`, `password_reset_expires`, `created_at`) VALUES
(1, 'Admin', 'niranjanadmin@gmail.com', NULL, NULL, NULL, 'Nepal', '$2b$12$wAknHxyJiJj4tslxbjiiPeVEybsOiadh0fZ2ro5J8f7ZyruGxLYiO', 'admin', 0, NULL, NULL, NULL, NULL, '2025-10-18 03:33:19'),
(8, 'niranjan katwal', 'katwalniranjan40@gmail.com', NULL, NULL, NULL, 'Nepal', '$2b$12$Z7zBedt6S/6Ov.Q9K74hI.mGnqVwCstD8JxTnpUL7ilqBgIPFWP0K', 'user', 0, '278946', '2025-11-02 14:55:15', NULL, NULL, '2025-11-02 09:00:15');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `product_offers`
--
ALTER TABLE `product_offers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

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
