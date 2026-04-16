-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 12, 2026 at 05:58 PM
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
(1, 'Nexus Store', 'Hello! WELCOME to the store and thank you for joining us.', 'system', 'https://imgs.search.brave.com/tXFHByNr4_Z4yfrYF4A6OpMYQjRMwAO35XS8C4tQVuM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzL2NjLzhj/LzVlL2NjOGM1ZWFm/NjkzZTc3MTc2NDZk/NDFjMWVmYjNkZWE5/LmpwZw', 'all', NULL, '2026-04-30 06:00:00', 4, 0, '2026-04-12 12:07:48');

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
(1, 2, 1349.00, 'delivered', 'khalti', 'completed', '{\"fullName\":\"Nirrrr\",\"email\":\"katwalniranjan40@gmail.com\",\"address\":\"kathmandu\",\"city\":\"kathmandu\",\"postalCode\":\"44600\",\"phone\":\"9818958772\",\"country\":\"Nepal\",\"notes\":\"\"}', 'TRK1772020277245PDBZO', '2026-03-04', 1299.00, 50.00, NULL, '2026-02-25 11:51:00'),
(2, 2, 45050.00, 'cancelled', 'stripe', 'completed', '{\"fullName\":\"Nirrrr\",\"email\":\"katwalniranjan40@gmail.com\",\"address\":\"kathmandu\",\"city\":\"kathmandu\",\"postalCode\":\"44600\",\"phone\":\"9818958772\",\"country\":\"Nepal\",\"notes\":\"\"}', 'TRK1772020463014MOCDI', '2026-03-04', 50000.00, 50.00, 'WELCOME10', '2026-02-25 11:54:07'),
(3, 3, 50050.00, 'shipped', 'stripe', 'completed', '{\"fullName\":\"shiri\",\"email\":\"shirshikashrestha359@gmail.com\",\"address\":\"kathmandu\",\"city\":\"kathmandu\",\"postalCode\":\"44600\",\"phone\":\"9818958772\",\"country\":\"Nepal\",\"notes\":\"\"}', 'TRK1773027073138UN1D7', '2026-03-16', 50000.00, 50.00, NULL, '2026-03-09 03:30:32'),
(4, 3, 150.00, 'confirmed', 'esewa', 'completed', '{\"fullName\":\"shiri\",\"email\":\"shirshikashrestha359@gmail.com\",\"address\":\"ktm\",\"city\":\"kathmandu\",\"postalCode\":\"44600\",\"phone\":\"9818958772\",\"country\":\"Nepal\",\"notes\":\"\"}', 'TRK17731170463181C94G', '2026-03-17', 100.00, 50.00, NULL, '2026-03-10 04:28:48'),
(5, 2, 3549.00, 'pending', 'esewa', 'failed', '{\"fullName\":\"Nirrrr\",\"email\":\"katwalniranjan40@gmail.com\",\"address\":\"kathmandu\",\"city\":\"kathmandu\",\"postalCode\":\"44600\",\"phone\":\"9818958772\",\"country\":\"Nepal\",\"notes\":\"\"}', NULL, NULL, 3499.00, 50.00, NULL, '2026-04-07 12:06:41'),
(6, 2, 3549.00, 'confirmed', 'khalti', 'completed', '{\"fullName\":\"Nirrrr\",\"email\":\"katwalniranjan40@gmail.com\",\"address\":\"kathmandu\",\"city\":\"kathmandu\",\"postalCode\":\"44600\",\"phone\":\"9818958772\",\"country\":\"Nepal\",\"notes\":\"\"}', 'TRK1775564517084RQNFF', '2026-04-14', 3499.00, 50.00, NULL, '2026-04-07 12:21:19');

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

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price`) VALUES
(1, 6, 64, 1, 1299.00),
(2, 7, 20, 1, 50000.00),
(3, 5, 13, 1, 50000.00),
(4, 6, 45, 1, 100.00),
(5, 7, 20, 1, 3499.00),
(6, 8, 20, 1, 3499.00);

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
(1, 6, 'khalti', 'completed', 'esewa_dev_1773117046331', 1349.00, '{\"pidx\":\"7mgoxBRBVekz8ooH4woVnT\",\"payment_url\":\"https://test-pay.khalti.com/?pidx=7mgoxBRBVekz8ooH4woVnT\",\"expires_at\":\"2026-02-25T18:06:01.323669+05:45\",\"expires_in\":1800,\"discount\":0,\"promo_code\":null}', '2026-02-25 11:51:00'),
(2, 7, 'stripe', 'completed', 'pi_3T4gfYKHTLaIcnD705fUYwDE', 45050.00, '{\"session_id\":\"cs_test_a1KOqRTNyouJEillprhfxvYQG9kSRQkPf4Hj28ol2z0dIPp3soDPtvgrBL\",\"session_url\":\"https://checkout.stripe.com/c/pay/cs_test_a1KOqRTNyouJEillprhfxvYQG9kSRQkPf4Hj28ol2z0dIPp3soDPtvgrBL#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0Vk9QS0BOTVFJZExma0EyMEs2SDc9bV9PXUpsNlFycH9zVE1qXG99Vlx3RE9mSmlCQ2NzNWtSNm5XQ2FudmxpMzBkTHZEaTRiSWBKf05USTw2cklHM29CNTVHXXVnS1A2MicpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl\",\"discount\":5000,\"final_amount\":45050,\"promo_code\":\"WELCOME10\"}', '2026-02-25 11:54:08'),
(3, 5, 'stripe', 'completed', 'pi_3T8uXCKHTLaIcnD70sDA51wP', 50050.00, '{\"session_id\":\"cs_test_a1b8lXVS0bvVVusqXT4cmxFQu1rWMtTYmEObtkRTUyeVsKnrR4NZlsX6aW\",\"session_url\":\"https://checkout.stripe.com/c/pay/cs_test_a1b8lXVS0bvVVusqXT4cmxFQu1rWMtTYmEObtkRTUyeVsKnrR4NZlsX6aW#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0Vk9QS0BOTVFJZExma0EyMEs2SDc9bV9PXUpsNlFycH9zVE1qXG99Vlx3RE9mSmlCQ2NzNWtSNm5XQ2FudmxpMzBkTHZEaTRiSWBKf05USTw2cklHM29CNTVHXXVnS1A2MicpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl\",\"discount\":0,\"final_amount\":50050,\"promo_code\":null}', '2026-03-09 03:30:33'),
(4, 6, 'esewa', 'completed', 'esewa_dev_1773117046331', 150.00, '{\"amount\":\"150.00\",\"tax_amount\":\"0\",\"total_amount\":\"150.00\",\"transaction_uuid\":\"esewa_6_1773116928663\",\"product_code\":\"EPAYTEST\",\"product_service_charge\":\"0\",\"product_delivery_charge\":\"0\",\"success_url\":\"http://localhost:5000/api/payments/esewa/success?orderId=6\",\"failure_url\":\"http://localhost:3000/payment-failed?orderId=6&reason=payment_failed\",\"signed_field_names\":\"total_amount,transaction_uuid,product_code\",\"signature\":\"gmOMLUJ+TAqBGqgntckkUopTgHPSD0oJ/Xkvh+Y3T7A=\",\"discount\":0,\"promo_code\":null}', '2026-03-10 04:28:48'),
(5, 7, 'esewa', 'pending', 'esewa_7_1775563601742', 3549.00, '{\"amount\":\"3549.00\",\"tax_amount\":\"0\",\"total_amount\":\"3549.00\",\"transaction_uuid\":\"esewa_7_1775563601742\",\"product_code\":\"EPAYTEST\",\"product_service_charge\":\"0\",\"product_delivery_charge\":\"0\",\"success_url\":\"http://localhost:5000/api/payments/esewa/success?orderId=7\",\"failure_url\":\"http://localhost:3000/payment-failed?orderId=7&reason=payment_failed\",\"signed_field_names\":\"total_amount,transaction_uuid,product_code\",\"signature\":\"xwvKcQW+TTWYuy1CyNQYTL2A4/WlTgGbJno/ION7+yM=\",\"discount\":0,\"promo_code\":null}', '2026-04-07 12:06:41'),
(6, 8, 'khalti', 'completed', 'zyt7KRrLfKcwuXPPxz8Kd7', 3549.00, '{\"pidx\":\"zyt7KRrLfKcwuXPPxz8Kd7\",\"payment_url\":\"https://test-pay.khalti.com/?pidx=zyt7KRrLfKcwuXPPxz8Kd7\",\"expires_at\":\"2026-04-07T18:36:20.844678+05:45\",\"expires_in\":1800,\"discount\":0,\"promo_code\":null}', '2026-04-07 12:21:19');

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
(1, 'Denim Pants', 'Denim pants for male', 2000.00, 'Clothing', 'https://imgs.search.brave.com/gINnxyI7lokxrypFb3hXo0CdXoGt5fKtIUe-Hrh3SZo/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvOTE1/OTIzNDAwL3Bob3Rv/L2JsdWUtbWVucy1q/ZWFucy1kZW5pbS1w/YW50cy1vbi1vcmFu/Z2UtYmFja2dyb3Vu/ZC1jb250cmFzdC1z/YXR1cmF0ZWQtY29s/b3ItZmFzaGlvbi1j/bG90aGluZy5qcGc_/cz02MTJ4NjEyJnc9/MCZrPTIwJmM9TElz/MkFjLUtlY1hBcGs0/NG9wYTBybE9BVHE0/TEhrbDdlZnhzcEhV/Y2Z0VT0', '[\"https://imgs.search.brave.com/gINnxyI7lokxrypFb3hXo0CdXoGt5fKtIUe-Hrh3SZo/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvOTE1/OTIzNDAwL3Bob3Rv/L2JsdWUtbWVucy1q/ZWFucy1kZW5pbS1w/YW50cy1vbi1vcmFu/Z2UtYmFja2dyb3Vu/ZC1jb250cmFzdC1z/YXR1cmF0ZWQtY29s/b3ItZmFzaGlvbi1j/bG90aGluZy5qcGc_/cz02MTJ4NjEyJnc9/MCZrPTIwJmM9TElz/MkFjLUtlY1hBcGs0/NG9wYTBybE9BVHE0/TEhrbDdlZnhzcEhV/Y2Z0VT0\"]', '[\"denim\",\"jeans\"]', 0, 0, 0, 0.00, NULL, 92, 5, '2025-10-17 05:33:51', 4.50),
(2, 'Nike Dunk Low', 'Best Nike Shoes', 17000.00, 'Footwear', 'https://imgs.search.brave.com/qf6Q879gfWbNB4ZPPaMZvRh5TVvCeMYxbYp7zVcBMSI/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMubmlrZS5jb20v/YS9pbWFnZXMvdF93/ZWJfcHdfNTkyX3Yy/L2ZfYXV0by9lOGQ0/YWYyZi1lNWY4LTQ4/ZGUtYTczMC0yNzkw/NDlkMzg0YzYvTklL/RStEVU5LK0xPVytT/RS5wbmc', '[\"https://imgs.search.brave.com/qf6Q879gfWbNB4ZPPaMZvRh5TVvCeMYxbYp7zVcBMSI/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMubmlrZS5jb20v/YS9pbWFnZXMvdF93/ZWJfcHdfNTkyX3Yy/L2ZfYXV0by9lOGQ0/YWYyZi1lNWY4LTQ4/ZGUtYTczMC0yNzkw/NDlkMzg0YzYvTklL/RStEVU5LK0xPVytT/RS5wbmc\",\"https://imgs.search.brave.com/xinH4JbVcYMpSuG6r1vdkrmUPeNXNGJLqsHKaq7uze4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMubmlrZS5jb20v/YS9pbWFnZXMvdF9k/ZWZhdWx0LzBmNzZm/NzNlLTI1NzgtNGQ2/Mi1hYmFiLWM1NTYz/ZWE0Zjc4Yy9OSUtF/K0RVTksrTE9XK1JF/VFJPLnBuZw\",\"https://imgs.search.brave.com/xinH4JbVcYMpSuG6r1vdkrmUPeNXNGJLqsHKaq7uze4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMubmlrZS5jb20v/YS9pbWFnZXMvdF9k/ZWZhdWx0LzBmNzZm/NzNlLTI1NzgtNGQ2/Mi1hYmFiLWM1NTYz/ZWE0Zjc4Yy9OSUtF/K0RVTksrTE9XK1JF/VFJPLnBuZw\",\"https://imgs.search.brave.com/H4jQ6feLLSU0GfFRgmI_8QqthkxKP-5Jp7mrsTVa5GI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMubmlrZS5jb20v/YS9pbWFnZXMvdF9k/ZWZhdWx0LzE4MzRh/NjczLWRmYzItNDAx/YS04YWZhLTllYTIw/YWJjMjZjNS9XK05J/S0UrRFVOSytMT1cu/cG5n\"]', '[\"NIKE\"]', 1, 0, 1, 0.00, NULL, 34, 5, '2025-10-17 05:33:51', 4.50),
(3, 'Iphone 17', 'New launched', 233000.00, 'Mobile Phones', 'https://imgs.search.brave.com/3DaQJErST-2vEVjoLeMa5eDYTbJh6ORUD0jKOcrMtWI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5jbm4uY29tL2Fw/aS92MS9pbWFnZXMv/c3RlbGxhci9wcm9k/L2FwcGxlLWlwaG9u/ZS0xNy1wcm8tbWF4/LmpwZz9jPTE2eDkm/cT1oXzcyMCx3XzEy/ODAsY19maWxs', '[\"https://imgs.search.brave.com/3DaQJErST-2vEVjoLeMa5eDYTbJh6ORUD0jKOcrMtWI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5jbm4uY29tL2Fw/aS92MS9pbWFnZXMv/c3RlbGxhci9wcm9k/L2FwcGxlLWlwaG9u/ZS0xNy1wcm8tbWF4/LmpwZz9jPTE2eDkm/cT1oXzcyMCx3XzEy/ODAsY19maWxs\",\"https://imgs.search.brave.com/-UhD5gI00QPEMHOXSUc1IYkW4b2xkRk20l9oTtlTL5Q/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/aW5kaWFpc3RvcmUu/Y29tL3RoZW1lcy9m/cm9udGVuZC9jdXN0/b20vaW1hZ2VzL3By/b2R1Y3QvaXBob25l/LTE3LXByby1jb21p/bmctc29vbi9kZXNr/dG9wLzAxLmpwZw\",\"https://imgs.search.brave.com/GKtmIq60RRdMa1J7G5dJG-aUItLvmvUV9aqfyyGnjMM/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9mZG4u/Z3NtYXJlbmEuY29t/L2ltZ3Jvb3QvcmV2/aWV3cy8yNS9hcHBs/ZS1pcGhvbmUtMTct/cHJvLW1heC9saWZl/c3R5bGUvLTEwMjR3/Mi9nc21hcmVuYV8w/MjIuanBn\",\"http://localhost:5000/uploads/image-1761908272850-680854207.webp\"]', '[\"On demand\",\"Apple\"]', 1, 0, 1, 0.00, NULL, 19, 5, '2025-10-31 10:57:56', 4.50),
(4, 'iPhone 16 Pro Max', 'Latest Apple iPhone with A18 chip, 48MP camera, and Dynamic Island', 184999.00, 'Electronics', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500', '[\"https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500\",\"https://imgs.search.brave.com/RtkkGGUY5wmpdZ03OVZRYIat4tnMUChMwbjKlvwicxY/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4u/bW9zLmNtcy5mdXR1/cmVjZG4ubmV0L2N0/cFdvRXJHYWhiU3hR/SEd4aDNQM0EuanBn\",\"https://imgs.search.brave.com/HMIxlA4KUj4bHvCermsr469MnPJqC21Bk6KUK6uPWFk/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9waXNj/ZXMuYmJ5c3RhdGlj/LmNvbS9pbWFnZTIv/QmVzdEJ1eV9VUy9k/YW0vUkVGLTE2NTIz/NjItY3ltLWlwaG9u/ZTE2cHJvbWF4X0RF/Ui1iYjE3MDA3Yi01/NGJmLTQyNGItYmVm/My00MDg3YjA0ZTkx/YTEuanBn\"]', '[\"smartphone\",\"apple\",\"5G\",\"premium\"]', 1, 1, 1, 5.00, NULL, 24, 5, '2025-11-03 08:49:06', 5.00),
(5, 'Sony WH-1000XM5', 'Industry-leading noise canceling wireless headphones', 51999.00, 'Electronics', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', '[\"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500\", \"https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500\", \"https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500\"]', '[\"headphones\", \"wireless\", \"noise-canceling\", \"audio\"]', 0, 0, 0, 12.00, NULL, 38, 8, '2025-11-03 08:49:06', 4.50),
(6, 'iPad Air 5th Gen', 'Powerful tablet with M1 chip, Liquid Retina display, 5G support', 97999.00, 'Electronics', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500', '[\"https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500\", \"https://images.unsplash.com/photo-1561154464-82e9adf32764?w=500\", \"https://images.unsplash.com/photo-1542751110-97427bbecf20?w=500\"]', '[\"tablet\", \"apple\", \"portable\", \"creative\"]', 0, 0, 0, 7.50, NULL, 33, 6, '2025-11-03 08:49:06', 4.00),
(7, 'Premium Cotton Polo Shirt', '100% cotton polo shirt with embroidered logo, available in multiple colors', 5999.00, 'Clothing', 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500', '[\"https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500\", \"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500\", \"https://images.unsplash.com/photo-1501088459543-1b7b0cec6c4c?w=500\"]', '[\"polo\", \"cotton\", \"casual\", \"premium\"]', 0, 0, 0, 15.00, NULL, 79, 15, '2025-11-03 08:49:06', 3.50),
(8, 'Classic Denim Jeans', 'Slim fit denim jeans with stretch comfort, perfect for everyday wear', 11699.00, 'Clothing', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500', '[\"https://images.unsplash.com/photo-1542272604-787c3835535d?w=500\", \"https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=500\", \"https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500\"]', '[\"jeans\", \"denim\", \"slim-fit\", \"casual\"]', 0, 0, 0, 10.00, NULL, 59, 12, '2025-11-03 08:49:06', 4.50),
(9, 'Adidas Ultraboost 22', 'Responsive running shoes with Boost technology', 23399.00, 'Footwear', 'https://imgs.search.brave.com/d0zhQkAsWnxLqIotyCW9YrB6KcVmymDsojICAzAUM1s/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NzFMN3RHdlFjYkwu/anBn', '[\"https://imgs.search.brave.com/d0zhQkAsWnxLqIotyCW9YrB6KcVmymDsojICAzAUM1s/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NzFMN3RHdlFjYkwu/anBn\",\"https://imgs.search.brave.com/f8_dvQm5_lSgsUHIf12zH0X_HI7Z0wCLRVD4Qp-P1gY/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/cnVubWFnLmZyL19h/c3NldHMvc3R5bGVz/LzgxMC9wdWJsaWMv/cHJvZHVpdC8yMDIy/LTAzL2FkaWRhcy11/bHRyYWJvb3N0LTIy/LXJ1bm1hZy10YWxv/bi5qcGc\"]', '[\"running\",\"adidas\",\"ultraboost\",\"performance\"]', 1, 0, 0, 10.00, NULL, 40, 8, '2025-11-03 08:49:06', 4.50),
(10, 'Leather Formal Shoes', 'Classic leather oxford shoes for business and formal occasions', 16899.00, 'Footwear', 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500', '[\"https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500\", \"https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=500\", \"https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?w=500\"]', '[\"formal\", \"leather\", \"oxford\", \"business\"]', 0, 0, 0, 8.00, NULL, 30, 6, '2025-11-03 08:49:06', 4.50),
(11, 'Skechers Memory Foam', 'Comfort walking shoes with memory foam insoles', 11699.00, 'Footwear', 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500', '[\"https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500\", \"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500\", \"https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=500\"]', '[\"comfort\", \"walking\", \"memory-foam\", \"casual\"]', 0, 0, 0, 12.00, NULL, 65, 12, '2025-11-03 08:49:06', 4.50),
(12, 'Hiking Boots Waterproof', 'Durable hiking boots with waterproof membrane and ankle support', 20799.00, 'Footwear', 'https://imgs.search.brave.com/YPo7-exM8kZXoNYNYykkWTO95DM8t1Eqz7mR6U7D_kE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9kMW55/bWJrZW9tZW9xZy5j/bG91ZGZyb250Lm5l/dC9waG90b3MvMjUv/ODAvMzc5NTUzXzIy/NjAxX0wyLmpwZw', '[\"https://imgs.search.brave.com/YPo7-exM8kZXoNYNYykkWTO95DM8t1Eqz7mR6U7D_kE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9kMW55/bWJrZW9tZW9xZy5j/bG91ZGZyb250Lm5l/dC9waG90b3MvMjUv/ODAvMzc5NTUzXzIy/NjAxX0wyLmpwZw\",\"https://imgs.search.brave.com/aLpCtXdIiS4woJjdCyd5zj9RJKGOOPoKt0z8AHRat44/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/c3dpdGNoYmFja3Ry/YXZlbC5jb20vc2l0/ZXMvZGVmYXVsdC9m/aWxlcy9pbWFnZV9m/aWVsZHMvQmVzdCUy/ME9mJTIwR2VhciUy/MEFydGljbGVzL0hp/a2luZyUyMGFuZCUy/MEJhY2twYWNraW5n/L0hpa2luZyUyMEJv/b3RzL1NhbGV3YSUy/ME1vdW50YWluJTIw/VHJhaW5lciUyMExp/dGUlMjBNaWQlMjBH/VFglMjBoaWtpbmcl/MjBib290JTIwKGNs/b3NldXAlMjBvZiUy/MGJvb3RzKS5qcGVn\"]', '[\"hiking\",\"outdoor\",\"waterproof\",\"durable\"]', 1, 0, 0, 18.00, NULL, 35, 7, '2025-11-03 08:49:06', 4.50),
(13, 'Apple Watch Series 9', 'Advanced smartwatch with health monitoring and fitness tracking', 50000.00, 'Accessories', 'https://imgs.search.brave.com/zjOOmHC3IdaNoKIXsYVjOaMoFov4IpjstaeEEqb63ss/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4u/bW9zLmNtcy5mdXR1/cmVjZG4ubmV0L0JS/RXBKbXZVVGRGWUN2/WHpNbXNLcEsuanBn', '[\"https://imgs.search.brave.com/zjOOmHC3IdaNoKIXsYVjOaMoFov4IpjstaeEEqb63ss/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4u/bW9zLmNtcy5mdXR1/cmVjZG4ubmV0L0JS/RXBKbXZVVGRGWUN2/WHpNbXNLcEsuanBn\",\"https://imgs.search.brave.com/AAHs05d4dZXzcJ7A3wgdza6ts6O0E9tt0gYnuhhobV8/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMxLnBvY2tldG5v/d2ltYWdlcy5jb20v/d29yZHByZXNzL3dw/LWNvbnRlbnQvdXBs/b2Fkcy93bS8yMDIz/LzEwL2FwcGxlLXdh/dGNoLXNlcmllcy05/LXJldmlldy1pbWFn/ZS00LmpwZw\"]', '[\"smartwatch\",\"apple\",\"fitness\",\"health\"]', 1, 0, 1, 5.00, NULL, 30, 6, '2025-11-03 08:49:06', 4.50),
(14, 'XAGE Type c Earphone', 'Proper high quality earphones in cheap price', 800.00, 'Accessories', 'https://imgs.search.brave.com/OyzOmaqzC02EOMjLPTKo63Q7m3G2Xbtq4qJbZI3zCHU/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly94YWdl/bmVwYWwuY29tL21l/ZGlhL2ZpbGUtbWFu/YWdlci9waG90b3Mv/MS9Qcm9kdWN0cy9F/YXJwaG9uZXMvWFdF/MDUvWFdFMDUucG5n', '[\"https://imgs.search.brave.com/OyzOmaqzC02EOMjLPTKo63Q7m3G2Xbtq4qJbZI3zCHU/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly94YWdl/bmVwYWwuY29tL21l/ZGlhL2ZpbGUtbWFu/YWdlci9waG90b3Mv/MS9Qcm9kdWN0cy9F/YXJwaG9uZXMvWFdF/MDUvWFdFMDUucG5n\"]', '[\"sound\"]', 0, 0, 0, 0.00, NULL, 55, 10, '2025-11-03 08:49:06', 3.50),
(15, 'Google Pixel 8 Pro', 'Advanced AI camera system, Tensor G3 chip, 120Hz display', 129999.00, 'Mobile Phones', 'https://imgs.search.brave.com/B6dyNVDyZIYz0-PWUHbbLPHp9BnoHxjIKpPuKN78aYw/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9hbWF0/ZXVycGhvdG9ncmFw/aGVyLmNvbS93cC1j/b250ZW50L3VwbG9h/ZHMvc2l0ZXMvNy8y/MDIzLzEwL2dvb2ds/ZS1waXhlbC04LWJs/YWNrLUpXLUFQLVBB/MTYwMjA4LmpwZz93/PTkwMA', '[\"https://imgs.search.brave.com/B6dyNVDyZIYz0-PWUHbbLPHp9BnoHxjIKpPuKN78aYw/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9hbWF0/ZXVycGhvdG9ncmFw/aGVyLmNvbS93cC1j/b250ZW50L3VwbG9h/ZHMvc2l0ZXMvNy8y/MDIzLzEwL2dvb2ds/ZS1waXhlbC04LWJs/YWNrLUpXLUFQLVBB/MTYwMjA4LmpwZz93/PTkwMA\"]', '[\"android\",\"google\",\"camera\",\"AI\"]', 1, 1, 1, 12.00, NULL, 28, 6, '2025-11-03 08:49:06', 5.00),
(16, 'OnePlus 12', 'Flagship killer with Snapdragon 8 Gen 3, Hasselblad camera', 116999.00, 'Mobile Phones', 'https://imgs.search.brave.com/YGnKY7EqM1YVRlRn-IZ5EeWgpSs5a5AxkFQ-crkwoSg/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9iMmMt/Y29udGVudGh1Yi5j/b20vd3AtY29udGVu/dC91cGxvYWRzLzIw/MjUvMDEvT25lUGx1/cy0xMy1yZXZpZXct/aGVyby1jYW5hbC12/Mi5qcGc_cXVhbGl0/eT01MCZzdHJpcD1h/bGw', '[\"https://imgs.search.brave.com/YGnKY7EqM1YVRlRn-IZ5EeWgpSs5a5AxkFQ-crkwoSg/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9iMmMt/Y29udGVudGh1Yi5j/b20vd3AtY29udGVu/dC91cGxvYWRzLzIw/MjUvMDEvT25lUGx1/cy0xMy1yZXZpZXct/aGVyby1jYW5hbC12/Mi5qcGc_cXVhbGl0/eT01MCZzdHJpcD1h/bGw\"]', '[\"android\",\"oneplus\",\"flagship\",\"fast-charging\"]', 1, 0, 1, 8.50, NULL, 32, 7, '2025-11-03 08:49:06', 0.00),
(17, 'Xiaomi 17 PRO MAX', 'Leica camera partnership, 1-inch sensor, 120W fast charging', 142999.00, 'Mobile Phones', 'https://imgs.search.brave.com/nbScuTUrOViIgk5WFQHKkyVf_l3zXi3ZN7xoZhvokzk/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pLmVi/YXlpbWcuY29tL2lt/YWdlcy9nL0VMSUFB/ZVN3UkcxbzFoYlgv/cy1sNTAwLndlYnA', '[\"https://imgs.search.brave.com/nbScuTUrOViIgk5WFQHKkyVf_l3zXi3ZN7xoZhvokzk/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pLmVi/YXlpbWcuY29tL2lt/YWdlcy9nL0VMSUFB/ZVN3UkcxbzFoYlgv/cy1sNTAwLndlYnA\",\"https://imgs.search.brave.com/Cu85BvdMY0dX0B2td4IuoDkp679sghQ_W5QYp7t9xH8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zMi10/ZWNodHVkby5nbGJp/bWcuY29tL2FfMnp4/QUpnZmhZYzB0UWNX/LVpHWGVHbDdjST0v/MHgwOjEyMDB4NDg4/Lzk4NHgwL3NtYXJ0/L2ZpbHRlcnM6c3Ry/aXBfaWNjKCkvaS5z/My5nbGJpbWcuY29t/L3YxL0FVVEhfMDhm/YmY0OGJjMDUyNDg3/Nzk0M2ZlODZlNDMw/ODdlN2EvaW50ZXJu/YWxfcGhvdG9zL2Jz/LzIwMjUvby9FL0g0/QlVucVJUcXJTOFlL/dm41OUFRL3hpYW9t/aS0xNy1wcm8tbWF4/LTA0LmpwZw\"]', '[\"android\",\"xiaomi\",\"leica\",\"camera\"]', 0, 0, 0, 10.00, NULL, 22, 5, '2025-11-03 08:49:06', 0.00),
(18, 'Samsung Galaxy Z Flip5', 'Compact foldable smartphone with flexible display', 155999.00, 'Mobile Phones', 'https://imgs.search.brave.com/DtwtDEiQuv4x_ZR92fg1AEWigAVEUHnkc9rVC8KTG0U/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/MzE1UzBkciszVUwu/anBn', '[\"https://imgs.search.brave.com/DtwtDEiQuv4x_ZR92fg1AEWigAVEUHnkc9rVC8KTG0U/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/MzE1UzBkciszVUwu/anBn\"]', '[\"foldable\",\"samsung\",\"compact\",\"innovative\"]', 1, 1, 0, 5.00, NULL, 18, 4, '2025-11-03 08:49:06', 0.00),
(19, 'Samsung M52 5g', 'Best mid range phone', 45999.00, 'Mobile Phones', 'https://imgs.search.brave.com/rZGbVciF4g7ePw8V4m6GQ_u-TbLwS4L7Ca13tazpdIE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4u/Z2FkZ2V0Ynl0ZW5l/cGFsLmNvbS93cC1j/b250ZW50L3VwbG9h/ZHMvMjAyMi8wNC9T/YW1zdW5nLUdhbGF4/eS1NNTItNUctQmx1/ZS5qcGc', '[\"https://imgs.search.brave.com/rZGbVciF4g7ePw8V4m6GQ_u-TbLwS4L7Ca13tazpdIE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4u/Z2FkZ2V0Ynl0ZW5l/cGFsLmNvbS93cC1j/b250ZW50L3VwbG9h/ZHMvMjAyMi8wNC9T/YW1zdW5nLUdhbGF4/eS1NNTItNUctQmx1/ZS5qcGc\",\"https://imgs.search.brave.com/g-FjhkUZUCim3vbUQV3UTmy9FOOJmD_CuwuS3R6hQmw/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4u/bW9zLmNtcy5mdXR1/cmVjZG4ubmV0L3pl/NGt3bUNBcWM1TWhv/cjI5WDRNcGcuanBn\"]', '[\"large-screen\",\"premium\"]', 1, 0, 0, 7.00, NULL, 35, 8, '2025-11-03 08:49:06', 0.00),
(20, 'Electric Kettle 1.5L', 'Stainless steel electric kettle with auto shut-off', 3499.00, 'Home & Kitchen', 'https://imgs.search.brave.com/zJWIBY9ZrndaFW7nMibBCgeJ17aEwPhwYuIQbKy5OyE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jYi5z/Y2VuZTcuY29tL2lz/L2ltYWdlL0NyYXRl/L0hhZGVuU3RyYmtX/aHRFbGNLdGxBVjJT/U0YyNF9WTkQvJHdl/Yl9wbHBfY2FyZCQv/MjUxMDE5MDQ0ODAz/L0hhZGVuU3RyYmtX/aHRFbGNLdGxBVjJT/U0YyNF9WTkQuanBn', '[\"https://imgs.search.brave.com/zJWIBY9ZrndaFW7nMibBCgeJ17aEwPhwYuIQbKy5OyE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jYi5z/Y2VuZTcuY29tL2lz/L2ltYWdlL0NyYXRl/L0hhZGVuU3RyYmtX/aHRFbGNLdGxBVjJT/U0YyNF9WTkQvJHdl/Yl9wbHBfY2FyZCQv/MjUxMDE5MDQ0ODAz/L0hhZGVuU3RyYmtX/aHRFbGNLdGxBVjJT/U0YyNF9WTkQuanBn\",\"https://imgs.search.brave.com/zJWIBY9ZrndaFW7nMibBCgeJ17aEwPhwYuIQbKy5OyE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jYi5z/Y2VuZTcuY29tL2lz/L2ltYWdlL0NyYXRl/L0hhZGVuU3RyYmtX/aHRFbGNLdGxBVjJT/U0YyNF9WTkQvJHdl/Yl9wbHBfY2FyZCQv/MjUxMDE5MDQ0ODAz/L0hhZGVuU3RyYmtX/aHRFbGNLdGxBVjJT/U0YyNF9WTkQuanBn\",\"https://imgs.search.brave.com/zJWIBY9ZrndaFW7nMibBCgeJ17aEwPhwYuIQbKy5OyE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jYi5z/Y2VuZTcuY29tL2lz/L2ltYWdlL0NyYXRl/L0hhZGVuU3RyYmtX/aHRFbGNLdGxBVjJT/U0YyNF9WTkQvJHdl/Yl9wbHBfY2FyZCQv/MjUxMDE5MDQ0ODAz/L0hhZGVuU3RyYmtX/aHRFbGNLdGxBVjJT/U0YyNF9WTkQuanBn\",\"https://imgs.search.brave.com/zJWIBY9ZrndaFW7nMibBCgeJ17aEwPhwYuIQbKy5OyE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jYi5z/Y2VuZTcuY29tL2lz/L2ltYWdlL0NyYXRl/L0hhZGVuU3RyYmtX/aHRFbGNLdGxBVjJT/U0YyNF9WTkQvJHdl/Yl9wbHBfY2FyZCQv/MjUxMDE5MDQ0ODAz/L0hhZGVuU3RyYmtX/aHRFbGNLdGxBVjJT/U0YyNF9WTkQuanBn\"]', '[\"kettle\"]', 0, 0, 0, 8.00, NULL, 1, 10, '2025-11-03 09:22:19', 0.00),
(21, 'Vitamin C Face Serum', 'Brightening serum with vitamin C and hyaluronic acid', 2499.00, 'Beauty & Personal Care', 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500', '[\"https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500\",\"https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500\",\"https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500\"]', '[\"beauty\"]', 0, 1, 0, 20.00, NULL, 8, 15, '2025-11-03 09:22:19', 0.00),
(22, 'Luxury Perfume Set', 'Eau de toilette perfume set with 3 different fragrances', 9000.00, 'Beauty & Personal Care', 'https://imgs.search.brave.com/S6lnbfNlPzu2Q2dvOXBDMgRDdGDjdu0wzjeIysMGN8Q/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMucGV4ZWxzLmNv/bS9waG90b3MvMjUw/ODU1OC9wZXhlbHMt/cGhvdG8tMjUwODU1/OC5qcGVnP2F1dG89/Y29tcHJlc3MmY3M9/dGlueXNyZ2ImZHBy/PTEmdz01MDA', '[\"https://imgs.search.brave.com/S6lnbfNlPzu2Q2dvOXBDMgRDdGDjdu0wzjeIysMGN8Q/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMucGV4ZWxzLmNv/bS9waG90b3MvMjUw/ODU1OC9wZXhlbHMt/cGhvdG8tMjUwODU1/OC5qcGVnP2F1dG89/Y29tcHJlc3MmY3M9/dGlueXNyZ2ImZHBy/PTEmdz01MDA\",\"https://imgs.search.brave.com/eGjJach8xiRlq98BzdfwS-O56CBPrC31meTxukrKsVo/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4u/bW9zLmNtcy5mdXR1/cmVjZG4ubmV0L05L/dGFkQW5DeVZtS0dm/N0xIU0JtTEUuanBn\",\"data:image/jpeg;base64,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\"]', '[\"perfume\",\"fragrance\",\"luxury\",\"beauty\"]', 0, 0, 0, 25.00, NULL, 45, 8, '2025-11-03 09:22:19', 0.00),
(23, 'Facial Cleansing Brush', 'Waterproof electric facial cleansing brush with 3 modes', 3299.00, 'Beauty & Personal Care', 'https://imgs.search.brave.com/pI0nkVF3dd8EyfRX5NamZQwgGxKH6JOQNu2vBPRdFiM/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/aW5zdHlsZS5jb20v/dGhtYi9JU2l0dExR/T2p1Y2UtdnhRM0Zs/U2hIWDAwdWM9L2Zp/dC1pbi8xNTAweDQz/NTkvZmlsdGVyczpu/b191cHNjYWxlKCk6/bWF4X2J5dGVzKDE1/MDAwMCk6c3RyaXBf/aWNjKCkvaW5zLWZh/Y2lhbC1jbGVhbnNp/bmctYnJ1c2gtdGVz/dC1lemJhc2ljcy10/c3RhcGxlcy0xMTM5/LTM3MWRmMmU3M2Q1/NTQ2ZWZhMWExN2Rh/YTNkYTEzZDQ5Lmpw/Zw', '[\"https://imgs.search.brave.com/pI0nkVF3dd8EyfRX5NamZQwgGxKH6JOQNu2vBPRdFiM/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/aW5zdHlsZS5jb20v/dGhtYi9JU2l0dExR/T2p1Y2UtdnhRM0Zs/U2hIWDAwdWM9L2Zp/dC1pbi8xNTAweDQz/NTkvZmlsdGVyczpu/b191cHNjYWxlKCk6/bWF4X2J5dGVzKDE1/MDAwMCk6c3RyaXBf/aWNjKCkvaW5zLWZh/Y2lhbC1jbGVhbnNp/bmctYnJ1c2gtdGVz/dC1lemJhc2ljcy10/c3RhcGxlcy0xMTM5/LTM3MWRmMmU3M2Q1/NTQ2ZWZhMWExN2Rh/YTNkYTEzZDQ5Lmpw/Zw\",\"https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500\"]', '[\"skincare\",\"cleansing\",\"facial\",\"beauty\"]', 0, 0, 0, 12.00, NULL, 70, 14, '2025-11-03 09:22:19', 0.00),
(24, 'Dumbbell Set 20kg', 'Adjustable dumbbell set with storage rack', 12499.00, 'Sports & Outdoors', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500', '[\"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500\", \"https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500\", \"https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=500\"]', '[\"dumbbell\", \"weights\", \"fitness\", \"gym\"]', 0, 0, 0, 10.00, NULL, 30, 6, '2025-11-03 09:22:19', 0.00),
(25, 'Camping Tent 4-Person', 'Waterproof camping tent with rainfly and carry bag', 18999.00, 'Sports & Outdoors', 'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=500', '[\"https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=500\", \"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500\", \"https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500\"]', '[\"camping\", \"tent\", \"outdoor\", \"adventure\"]', 0, 0, 0, 20.00, NULL, 25, 5, '2025-11-03 09:22:19', 0.00),
(26, 'Running Shorts', 'Lightweight running shorts with moisture-wicking fabric', 1999.00, 'Sports & Outdoors', 'https://imgs.search.brave.com/WKqwnELuom2bkTFtV4LbnNd7StkyqGJAWqskMLdV8pg/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMtbmEuc3NsLWlt/YWdlcy1hbWF6b24u/Y29tL2ltYWdlcy9J/LzcxbXgxQ0JGZnBM/LmpwZw', '[\"https://imgs.search.brave.com/WKqwnELuom2bkTFtV4LbnNd7StkyqGJAWqskMLdV8pg/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMtbmEuc3NsLWlt/YWdlcy1hbWF6b24u/Y29tL2ltYWdlcy9J/LzcxbXgxQ0JGZnBM/LmpwZw\"]', '[\"running\",\"shorts\",\"athletic\",\"sports\"]', 0, 0, 0, 8.00, NULL, 90, 18, '2025-11-03 09:22:19', 0.00),
(27, 'Fitness Tracker Watch', 'Waterproof fitness tracker with heart rate monitor', 6599.00, 'Sports & Outdoors', 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500', '[\"https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500\"]', '[\"fitness\",\"tracker\",\"watch\",\"health\"]', 0, 0, 0, 12.00, NULL, 55, 11, '2025-11-03 09:22:19', 0.00),
(28, 'Best-Selling Novel Collection', 'Set of 5 bestselling fiction novels from popular authors', 3499.00, 'Books & Stationery', 'https://imgs.search.brave.com/zJQ0SkDGaTH6hyEk9vWToZ0N4q3ChOShVKeRD8G7LYU/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9qdW5p/cGVyYm9va3MuY29t/L2Nkbi9zaG9wL2Zp/bGVzL2JjZmZkOTE3/YWQ3YTM1MGZiZGE0/MDhjNjgwNzQ1MmYw/LmpwZz92PTE3Mzgz/NTUxMDkmd2lkdGg9/MzIw', '[\"https://imgs.search.brave.com/zJQ0SkDGaTH6hyEk9vWToZ0N4q3ChOShVKeRD8G7LYU/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9qdW5p/cGVyYm9va3MuY29t/L2Nkbi9zaG9wL2Zp/bGVzL2JjZmZkOTE3/YWQ3YTM1MGZiZGE0/MDhjNjgwNzQ1MmYw/LmpwZz92PTE3Mzgz/NTUxMDkmd2lkdGg9/MzIw\",\"https://imgs.search.brave.com/zJQ0SkDGaTH6hyEk9vWToZ0N4q3ChOShVKeRD8G7LYU/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9qdW5p/cGVyYm9va3MuY29t/L2Nkbi9zaG9wL2Zp/bGVzL2JjZmZkOTE3/YWQ3YTM1MGZiZGE0/MDhjNjgwNzQ1MmYw/LmpwZz92PTE3Mzgz/NTUxMDkmd2lkdGg9/MzIw\"]', '[\"books\",\"novels\",\"fiction\",\"reading\"]', 0, 1, 0, 25.00, NULL, 120, 25, '2025-11-03 09:22:19', 0.00),
(29, 'Premium Leather Journal', 'Handcrafted leather journal with lined pages', 2499.00, 'Books & Stationery', 'https://imgs.search.brave.com/KMQ-CV4Ah2gpcL4pPBQmM5oHidwpTcIxoBJuSwsZjIY/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NzFZVEs0bkVBakwu/anBn', '[\"https://imgs.search.brave.com/KMQ-CV4Ah2gpcL4pPBQmM5oHidwpTcIxoBJuSwsZjIY/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NzFZVEs0bkVBakwu/anBn\",\"https://imgs.search.brave.com/xTJpHF9OuBPKzeo37r3lvtOSJYFlZirFDYRC7eij358/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/OTFtWTRnNWJiMUwu/anBn\"]', '[\"journal\",\"notebook\",\"writing\",\"stationery\"]', 0, 0, 0, 15.00, NULL, 85, 17, '2025-11-03 09:22:19', 0.00),
(30, 'Art Supplies Kit', 'Complete art set with sketch pencils, colors and brushes', 4599.00, 'Books & Stationery', 'https://imgs.search.brave.com/_NpTyMH6_c2545IQCRKxXKWPNOJKTBvQEcCjSJYOmmI/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMtbmEuc3NsLWlt/YWdlcy1hbWF6b24u/Y29tL2ltYWdlcy9J/LzgxcVd4ZXJ2RFhM/LmpwZw', '[\"https://imgs.search.brave.com/_NpTyMH6_c2545IQCRKxXKWPNOJKTBvQEcCjSJYOmmI/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMtbmEuc3NsLWlt/YWdlcy1hbWF6b24u/Y29tL2ltYWdlcy9J/LzgxcVd4ZXJ2RFhM/LmpwZw\",\"https://imgs.search.brave.com/sOQ8MYRR2NU5TA36SZcQNmUPT9Z0v3qdIV0qexjYlDI/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMtbmEuc3NsLWlt/YWdlcy1hbWF6b24u/Y29tL2ltYWdlcy9J/LzgxZVgwLUJwaHlM/LmpwZw\"]', '[\"art\",\"supplies\",\"sketching\",\"creative\"]', 0, 0, 1, 20.00, NULL, 60, 12, '2025-11-03 09:22:19', 0.00),
(31, 'Fountain Pen Set', 'Luxury fountain pen set with ink cartridges', 1099.00, 'Books & Stationery', 'https://imgs.search.brave.com/FVdhoatpAZ3EyjobnwniR6qB2P7tnsTfCp6oT_vV1-4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NzF3YlZGaTBaREwu/anBn', '[\"https://imgs.search.brave.com/FVdhoatpAZ3EyjobnwniR6qB2P7tnsTfCp6oT_vV1-4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NzF3YlZGaTBaREwu/anBn\"]', '[\"pen\",\"writing\",\"luxury\",\"stationery\"]', 0, 0, 0, 18.00, NULL, 45, 9, '2025-11-03 09:22:19', 0.00),
(32, 'Pencil kit', 'Set of pencils', 2999.00, 'Books & Stationery', 'https://imgs.search.brave.com/-o5gpVfwXSrhiXHoasmCTHx9olX4cYOgibFY-rwT1xw/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMtbmEuc3NsLWlt/YWdlcy1hbWF6b24u/Y29tL2ltYWdlcy9J/LzgxMkVXQ0tiRXdM/LmpwZw', '[\"https://imgs.search.brave.com/-o5gpVfwXSrhiXHoasmCTHx9olX4cYOgibFY-rwT1xw/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMtbmEuc3NsLWlt/YWdlcy1hbWF6b24u/Y29tL2ltYWdlcy9J/LzgxMkVXQ0tiRXdM/LmpwZw\",\"https://imgs.search.brave.com/KYVe2rTWeZs68jiWlgJ9PdON8lFSJhx6V929rF3U2RM/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NTFYRlZzV3dZOUwu/anBn\"]', '[\"textbooks\",\"academic\",\"education\",\"learning\"]', 0, 0, 0, 30.00, NULL, 75, 15, '2025-11-03 09:22:19', 0.00),
(33, 'Asus Tuf F15 1tb 16GB 4060RTX', 'High-performance gaming laptop with 16GB RAM, 1TB SSD', 224999.00, 'Laptops & Computers', 'https://imgs.search.brave.com/eA11I7WJQ0l9fH9s9niKqHw0uRAhnM5U0wQWoOm4Yv4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9odHRw/Mi5tbHN0YXRpYy5j/b20vRF9RX05QXzJY/Xzc0MzA0NS1NTEI5/NTE3NjY5MTMwOF8x/MDIwMjUtRS1ub3Rl/Ym9vay1hc3VzLXR1/Zi1nYW1pbmctZjE1/LWk3LTY0Z2ItNTEy/Z2ItcnR4LTMwNTAt/MTQ0aHoud2VicA', '[\"https://imgs.search.brave.com/eA11I7WJQ0l9fH9s9niKqHw0uRAhnM5U0wQWoOm4Yv4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9odHRw/Mi5tbHN0YXRpYy5j/b20vRF9RX05QXzJY/Xzc0MzA0NS1NTEI5/NTE3NjY5MTMwOF8x/MDIwMjUtRS1ub3Rl/Ym9vay1hc3VzLXR1/Zi1nYW1pbmctZjE1/LWk3LTY0Z2ItNTEy/Z2ItcnR4LTMwNTAt/MTQ0aHoud2VicA\",\"https://imgs.search.brave.com/Wt5gKSXSS0IxRKh41gVJ805_1MneQhfZtjsxuvNdeKg/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS1pay5jcm9tYS5j/b20vcHJvZC9odHRw/czovL21lZGlhLnRh/dGFjcm9tYS5jb20v/Q3JvbWElMjBBc3Nl/dHMvQ29tcHV0ZXJz/JTIwUGVyaXBoZXJh/bHMvTGFwdG9wL0lt/YWdlcy8zMTM4NDVf/MV9wdzN2eWQucG5n\",\"https://imgs.search.brave.com/7A4jLj9unBiSl6FqdCepXmf9uL0dk2lhMper_0Jv29M/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9kbGNk/bndlYmltZ3MuYXN1/cy5jb20vZmlsZXMv/bWVkaWEvZGZlOTI1/ZDgtNGQ2Mi00Zjk4/LWFmOTctYWExMGFl/ZDhiYWFhL3YxL2lt/YWdlcy9tb2JpbGUv/a3Yva3YuanBn\",\"https://imgs.search.brave.com/V_XyVz3rijjg5sOEAUJz7PuGa07xaNoOSeWDlnlqBKk/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS1pay5jcm9tYS5j/b20vcHJvZC9odHRw/czovL21lZGlhLnRh/dGFjcm9tYS5jb20v/Q3JvbWElMjBBc3Nl/dHMvR2FtaW5nL0xh/cHRvcC9JbWFnZXMv/MzEzODQ1XzE4X2o5/bWcxeC5wbmc\"]', '[\"gaming\",\"laptop\",\"RTX\",\"performance\"]', 0, 1, 1, 12.00, NULL, 18, 4, '2025-11-03 09:22:19', 0.00);
INSERT INTO `products` (`id`, `name`, `description`, `price`, `category`, `image_url`, `image_urls`, `tags`, `is_featured`, `featured`, `is_new`, `discount_percentage`, `offer_valid_until`, `stock_quantity`, `min_stock_level`, `created_at`, `rating`) VALUES
(34, 'MAC Book M4 Apple', 'M4chip varient newly launched', 250000.00, 'Laptops & Computers', 'https://imgs.search.brave.com/1LqG2_MTmofPDNt_1PSt9UwY-SnveOsmX12g8L6r-gA/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9oZWxp/b3MtaS5tYXNoYWJs/ZS5jb20vaW1hZ2Vy/eS9hcnRpY2xlcy8w/MWE5aEMxbWE2cDBk/dmljRExvcUJ1Yi9o/ZXJvLWltYWdlLmZp/bGwuc2l6ZV8xMjQ4/eDcwMi52MTc1OTc0/ODgxMC5qcGc', '[\"https://imgs.search.brave.com/1LqG2_MTmofPDNt_1PSt9UwY-SnveOsmX12g8L6r-gA/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9oZWxp/b3MtaS5tYXNoYWJs/ZS5jb20vaW1hZ2Vy/eS9hcnRpY2xlcy8w/MWE5aEMxbWE2cDBk/dmljRExvcUJ1Yi9o/ZXJvLWltYWdlLmZp/bGwuc2l6ZV8xMjQ4/eDcwMi52MTc1OTc0/ODgxMC5qcGc\",\"https://imgs.search.brave.com/wuqJDPdPyvT0IVdT4KI4GVDKc0G9giS3KdrsuPyprTE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly85dG81/bWFjLmNvbS93cC1j/b250ZW50L3VwbG9h/ZHMvc2l0ZXMvNi8y/MDI1LzAzL3NreS1i/bHVlLW1hY2Jvb2st/YWlyLmpwZz9xdWFs/aXR5PTgyJnN0cmlw/PWFsbCZ3PTE2MDA\",\"data:image/jpeg;base64,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\"]', '[\"ultrabook\",\"portable\",\"lightweight\"]', 1, 0, 0, 8.00, NULL, 25, 5, '2025-11-03 09:22:19', 0.00),
(35, 'All-in-One Desktop PC', '27-inch all-in-one desktop with i7 processor, 16GB RAM', 189999.00, 'Laptops & Computers', 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500', '[\"https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500\", \"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500\", \"https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500\"]', '[\"desktop\", \"all-in-one\", \"computer\", \"workstation\"]', 0, 0, 1, 15.00, NULL, 15, 3, '2025-11-03 09:22:19', 0.00),
(36, 'Mechanical Gaming Keyboard', 'RGB mechanical keyboard with cherry MX switches', 12999.00, 'Laptops & Computers', 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500', '[\"https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500\", \"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500\", \"https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500\"]', '[\"keyboard\", \"gaming\", \"mechanical\", \"RGB\"]', 0, 0, 0, 20.00, NULL, 50, 10, '2025-11-03 09:22:19', 0.00),
(37, 'Washing Machine 8kg', 'Fully automatic front load washing machine', 67999.00, 'Home Appliances', 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=500', '[\"https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=500\", \"https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=500\", \"https://images.unsplash.com/photo-1581093458791-8a6b6d47e9d8?w=500\"]', '[\"washing-machine\", \"laundry\", \"home\", \"appliance\"]', 0, 0, 0, 12.00, NULL, 20, 4, '2025-11-03 09:22:19', 0.00),
(38, 'Air Conditioner 1.5Ton', 'Inverter split AC with 5-star energy rating', 84999.00, 'Home Appliances', 'https://imgs.search.brave.com/A8VrXWixR-k8Bjn9KYAnEdkWnY9F_bcm7VNn6LNhSv0/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9hc3Nl/dHMud2ZjZG4uY29t/L2ltLzYzMTY3NTUz/L3Jlc2l6ZS1oNDAw/LXc0MDBeY29tcHIt/cjg1LzM1NjAvMzU2/MDcxNTA3LzUsMDAw/K0JUVStXaW5kb3cr/QWlyK0NvbmRpdGlv/bmVyLCsxMTVWLmpw/Zw', '[\"https://imgs.search.brave.com/A8VrXWixR-k8Bjn9KYAnEdkWnY9F_bcm7VNn6LNhSv0/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9hc3Nl/dHMud2ZjZG4uY29t/L2ltLzYzMTY3NTUz/L3Jlc2l6ZS1oNDAw/LXc0MDBeY29tcHIt/cjg1LzM1NjAvMzU2/MDcxNTA3LzUsMDAw/K0JUVStXaW5kb3cr/QWlyK0NvbmRpdGlv/bmVyLCsxMTVWLmpw/Zw\",\"https://imgs.search.brave.com/1jIihjBGck6pcr4G8ZWszhxwzUlDibZV172GHKM-_IY/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTU3/MzM3Mjk4L3Bob3Rv/L2Fpci1jb25kaXRp/b25lci5qcGc_cz02/MTJ4NjEyJnc9MCZr/PTIwJmM9cjBfb0hR/S1h4cnVoQnJfQVJJ/VnZkUW54V1BYaFNQ/cklIamREOGI4MW5I/dz0\"]', '[\"AC\",\"air-conditioner\",\"cooling\",\"home\"]', 0, 0, 1, 18.00, NULL, 15, 3, '2025-11-03 09:22:19', 0.00),
(39, 'Microwave Oven', 'Convection microwave oven with grill function', 18999.00, 'Home Appliances', 'https://imgs.search.brave.com/KbCSmk-SWrt3MfYuCH3OBgJDuSpulRBwIa3ioHrOA2g/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvNTIz/NDY2NzAvcGhvdG8v/YS1zYW1zdW5nLW1p/Y3Jvd2F2ZS1vdmVu/LWZlYXR1cmVzLWEt/bnVtZXJpYy1rZXlw/YWQtYW5kLWEtZGln/aXRhbC1kaXNwbGF5/LXNjcmVlbi1jaXJj/YS0xOTg1LmpwZz9z/PTYxMng2MTImdz0w/Jms9MjAmYz1RT0dv/VlduOWdzVTRFSXNO/d2plc0I2eFlHeFN0/RmVyRndnRzFBcXhs/bXVBPQ', '[\"https://imgs.search.brave.com/KbCSmk-SWrt3MfYuCH3OBgJDuSpulRBwIa3ioHrOA2g/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvNTIz/NDY2NzAvcGhvdG8v/YS1zYW1zdW5nLW1p/Y3Jvd2F2ZS1vdmVu/LWZlYXR1cmVzLWEt/bnVtZXJpYy1rZXlw/YWQtYW5kLWEtZGln/aXRhbC1kaXNwbGF5/LXNjcmVlbi1jaXJj/YS0xOTg1LmpwZz9z/PTYxMng2MTImdz0w/Jms9MjAmYz1RT0dv/VlduOWdzVTRFSXNO/d2plc0I2eFlHeFN0/RmVyRndnRzFBcXhs/bXVBPQ\",\"https://imgs.search.brave.com/wUWbbOvWqh7iukatzbblvjEn3kMEMLvm-Ix5ZClfi_w/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTE0/NDk2MDUxOS9waG90/by9tb2Rlcm4ta2l0/Y2hlbi1taWNyb3dh/dmUtb3Zlbi5qcGc_/cz02MTJ4NjEyJnc9/MCZrPTIwJmM9MFZP/OGZBU1lhZUotenpC/OWxJSGRYdVJ0M1Jr/a2htRm5WZm54WTdj/Y3hUND0\"]', '[\"microwave\",\"oven\",\"kitchen\",\"cooking\"]', 0, 0, 0, 10.00, NULL, 35, 7, '2025-11-03 09:22:19', 0.00),
(40, 'Water Purifier', 'KENT RO deta he sabse sudh pani\nRO+UV water purifier with 7-liter storage', 15999.00, 'Home Appliances', 'https://imgs.search.brave.com/NHu-mha0-tOWOYSD1UoLBh2SHKH7gZ2gUrUJcIXp7F8/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NzF1eVdZYkpGWUwu/anBn', '[\"https://imgs.search.brave.com/NHu-mha0-tOWOYSD1UoLBh2SHKH7gZ2gUrUJcIXp7F8/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NzF1eVdZYkpGWUwu/anBn\"]', '[\"water-purifier\",\"RO\",\"health\",\"home\"]', 0, 0, 0, 15.00, NULL, 40, 8, '2025-11-03 09:22:19', 0.00),
(41, 'Basmati Rice', 'Premium quality organic basmati rice', 1299.00, 'Grocery', 'https://imgs.search.brave.com/yBZHfi1qOIBrIOIB0VsgOrKAN5lXrgAr-mF2SsXdNC8/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/a2hhZHlhbm5hLmNv/bS9zdG9yYWdlL3By/b2R1Y3RzLzIwMjMv/RmVicnVhcnkvMjIv/dGh1bWJuYWlscy81/NDA5Nl8xNjc3MDg1/MjcxLmpwZw', '[\"https://imgs.search.brave.com/yBZHfi1qOIBrIOIB0VsgOrKAN5lXrgAr-mF2SsXdNC8/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/a2hhZHlhbm5hLmNv/bS9zdG9yYWdlL3By/b2R1Y3RzLzIwMjMv/RmVicnVhcnkvMjIv/dGh1bWJuYWlscy81/NDA5Nl8xNjc3MDg1/MjcxLmpwZw\"]', '[\"rice\",\"organic\",\"grocery\",\"food\"]', 0, 1, 0, 10.00, NULL, 200, 40, '2025-11-03 09:22:19', 0.00),
(42, 'Extra Virgin Olive Oil', 'Cold-pressed extra virgin olive oil 1L', 1899.00, 'Grocery', 'https://imgs.search.brave.com/iQe4fYzzI0goRcc-bRrmABZq7BrclzePiWVVyeLpLTQ/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzJlLzcx/L2M3LzJlNzFjN2Y2/YmU0MDY1NjgyMWFk/ZmQxZmNlZDRlMTE5/LmpwZw', '[\"https://imgs.search.brave.com/iQe4fYzzI0goRcc-bRrmABZq7BrclzePiWVVyeLpLTQ/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzJlLzcx/L2M3LzJlNzFjN2Y2/YmU0MDY1NjgyMWFk/ZmQxZmNlZDRlMTE5/LmpwZw\"]', '[\"olive-oil\",\"cooking\",\"healthy\",\"grocery\"]', 0, 0, 0, 15.00, NULL, 150, 30, '2025-11-03 09:22:19', 0.00),
(43, 'Himalayan Honey', 'Pure natural honey from Himalayan region 500g', 999.00, 'Grocery', 'https://imgs.search.brave.com/E129N22uIQrAhX-h0nFVrMivxaCcg_39g46C8irTPlI/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9yb3Nl/c2FuZHR1bGlwLmNv/bS9jZG4vc2hvcC9m/aWxlcy8zXzQ2YWMw/YjVjLWE3NjYtNDNi/YS1hMjI3LTJmY2Y5/MzBkZDQzOC5wbmc_/dj0xNjg5NjE3ODk0/JndpZHRoPTEyMTQ', '[\"https://imgs.search.brave.com/E129N22uIQrAhX-h0nFVrMivxaCcg_39g46C8irTPlI/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9yb3Nl/c2FuZHR1bGlwLmNv/bS9jZG4vc2hvcC9m/aWxlcy8zXzQ2YWMw/YjVjLWE3NjYtNDNi/YS1hMjI3LTJmY2Y5/MzBkZDQzOC5wbmc_/dj0xNjg5NjE3ODk0/JndpZHRoPTEyMTQ\"]', '[\"honey\",\"natural\",\"healthy\",\"sweetener\"]', 0, 0, 0, 12.00, NULL, 180, 36, '2025-11-03 09:22:19', 0.00),
(44, 'ganji', 'yo garmi ma laune ho', 100.00, 'Clothing', 'https://imgs.search.brave.com/4V_Nr6oleqXGV5pPJcTKetH_u-UxH15DuwzeFwMOQtU/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wMjkv/MTk5Lzk0NC9zbWFs/bC9nZW5lcmF0aXZl/LWFpLWJsYW5rLXdo/aXRlLXRhbmstdG9w/LW1vY2stdXAtb24t/bWFsZS1tb2RlbC1z/aG93Y2FzZS15b3Vy/LWRlc2lnbnMtaW4t/c3R5bGUtcGhvdG8u/anBn', '[\"https://imgs.search.brave.com/4V_Nr6oleqXGV5pPJcTKetH_u-UxH15DuwzeFwMOQtU/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wMjkv/MTk5Lzk0NC9zbWFs/bC9nZW5lcmF0aXZl/LWFpLWJsYW5rLXdo/aXRlLXRhbmstdG9w/LW1vY2stdXAtb24t/bWFsZS1tb2RlbC1z/aG93Y2FzZS15b3Vy/LWRlc2lnbnMtaW4t/c3R5bGUtcGhvdG8u/anBn\",\"https://imgs.search.brave.com/r-ZuXPgF7yp9KSeA3zPGGlvA3rhwVy0lEJx9-LLCJRc/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/ODFzNVM3RWllakwu/anBn\"]', '[\"cloth\"]', 1, 0, 0, 5.00, NULL, 10, 5, '2026-03-10 04:09:59', 0.00),
(45, 'ghanti', 'tunglung ', 1000.00, 'Toys & Games', 'https://imgs.search.brave.com/hrPVtRL2tyJEIGEsP6thmzMD_qxwe4ahV5M7B9L6VAs/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NjFTRjBPM29PSUwu/anBn', '[\"https://imgs.search.brave.com/hrPVtRL2tyJEIGEsP6thmzMD_qxwe4ahV5M7B9L6VAs/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NjFTRjBPM29PSUwu/anBn\",\"data:image/jpeg;base64,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\"]', '[]', 0, 0, 0, 0.00, NULL, 10, 5, '2026-04-09 01:34:30', 0.00),
(46, 'Tulip Bracelet', 'Craved in a tulip shape with beautiful stone', 900.00, 'Accessories', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhl_3kmOu5vaC35ZJNnQdN7wgwRSAiS6QkwQ&s', '[\"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhl_3kmOu5vaC35ZJNnQdN7wgwRSAiS6QkwQ&s\",\"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwGnmI3gEyTXPvApad-3rMmOA0vKZmd4AIraQhX_9YAg&s\",\"data:image/jpeg;base64,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\",\"data:image/jpeg;base64,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\"]', '[\"women\"]', 1, 0, 0, 0.00, NULL, 18, 5, '2026-04-12 13:08:45', 0.00);

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
(1, 34, 'flat_discount', NULL, 10000.00, NULL, NULL, '2026-04-07 00:00:00', '2026-04-28 00:00:00', 1, 'Flat RS. 10000 off in new gaming laptop\n', '2026-04-07 10:18:29', '2026-04-07 16:17:48'),
(2, 45, 'bulk_discount', 50.00, NULL, 5, NULL, '2026-04-07 00:00:00', '2026-04-28 00:00:00', 1, '5 ota kinda 50 % ko off xa haii \nla ayo ganji ayo ganji', '2026-04-07 10:20:06', '2026-04-07 16:17:48'),
(3, 22, 'clearance_sale', 60.00, NULL, NULL, NULL, '2026-04-07 00:00:00', '2026-04-13 00:00:00', 1, NULL, '2026-04-07 11:12:05', '2026-04-07 16:17:48'),
(4, 27, 'Bogo', NULL, NULL, NULL, NULL, '2026-04-07 00:00:00', '2026-05-01 00:00:00', 1, 'aauta kinda arko free', '2026-04-07 11:36:14', '2026-04-07 16:17:48');

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
(1, 'WELCOME10', '10% off on your first order', 'percentage', 10.00, 500.00, 200.00, 1, 1, NULL, '2026-02-25 00:00:00', '2026-03-31 00:00:00', 1, '2026-02-25 05:46:50'),
(2, 'FREESHIP', 'Free shipping on all orders', 'free_shipping', 0.00, 300.00, NULL, NULL, 0, NULL, '2026-02-25 00:00:00', '2026-03-31 00:00:00', 1, '2026-02-25 05:46:50'),
(3, 'SAVE50', 'Rs. 50 off on orders above Rs. 1000', 'fixed', 50.00, 1000.00, 50.00, NULL, 0, NULL, '2026-02-25 00:00:00', '2026-03-31 00:00:00', 1, '2026-02-25 05:46:50'),
(4, 'ELECTRO15', '15% off on electronics', 'percentage', 15.00, 0.00, 500.00, NULL, 0, '[\"Electronics\"]', '2026-02-25 00:00:00', '2026-03-31 00:00:00', 1, '2026-02-25 05:46:50'),
(5, 'FLASH100', 'Rs. 100 off on all categories', 'fixed', 100.00, 500.00, 100.00, 100, 1, NULL, '2026-02-25 00:00:00', '2026-03-31 00:00:00', 1, '2022-10-21 05:46:50'),
(6, '10PERC', 'Use to get 10% off in certain category ---- its a sus', 'percentage', 10.00, 1000.00, NULL, NULL, 0, '[\"Electronics\",\"Footwear\",\"Books & Stationery\"]', '2026-04-10 00:00:00', '2026-04-24 00:00:00', 1, '2026-04-10 16:01:56'),
(7, 'FREESHIPPING', 'Use to have 0 shipping', 'free_shipping', 0.00, 300.00, NULL, 10, 0, NULL, '2026-04-10 00:00:00', '2026-04-30 00:00:00', 1, '2026-04-10 16:07:12'),
(8, 'DIS1000', 'Get 1000 off', 'fixed', 1000.00, 4000.00, NULL, 12, 0, '[\"Sports & Outdoors\",\"Books & Stationery\",\"Clothing\"]', '2026-04-10 00:00:00', '2026-04-20 00:00:00', 1, '2026-04-10 16:16:23');

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

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `user_id`, `product_id`, `rating`, `comment`, `user_name`, `created_at`) VALUES
(1, 2, 1, 4, 'Nice denim pants, comfortable fit.', 'Nirrrr', '2026-04-12 10:35:22'),
(2, 2, 2, 5, 'Best Nike shoes ever! Super comfortable.', 'Nirrrr', '2026-04-12 10:35:22'),
(3, 2, 3, 4, 'iPhone 17 looks premium but pricey.', 'Nirrrr', '2026-04-12 10:35:22'),
(4, 2, 4, 5, 'iPhone 16 Pro Max is a beast!', 'Nirrrr', '2026-04-12 10:35:22'),
(5, 2, 5, 4, 'Sony WH-1000XM5 – excellent noise cancellation.', 'Nirrrr', '2026-04-12 10:35:22'),
(6, 2, 6, 4, 'iPad Air is powerful, great for students.', 'Nirrrr', '2026-04-12 10:35:22'),
(7, 2, 7, 3, 'Polo shirt is okay, but price is high.', 'Nirrrr', '2026-04-12 10:35:22'),
(8, 2, 8, 4, 'Classic denim jeans – good quality.', 'Nirrrr', '2026-04-12 10:35:22'),
(9, 2, 9, 5, 'Adidas Ultraboost 22 – super comfy for running.', 'Nirrrr', '2026-04-12 10:35:22'),
(10, 2, 10, 4, 'Leather formal shoes look classy.', 'Nirrrr', '2026-04-12 10:35:22'),
(11, 2, 11, 4, 'Skechers memory foam – great for daily walks.', 'Nirrrr', '2026-04-12 10:35:22'),
(12, 2, 12, 5, 'Hiking boots are durable and waterproof.', 'Nirrrr', '2026-04-12 10:35:22'),
(13, 2, 13, 5, 'Apple Watch Series 9 – worth the money.', 'Nirrrr', '2026-04-12 10:35:22'),
(14, 2, 14, 3, 'XAGE earphones are average for the price.', 'Nirrrr', '2026-04-12 10:35:22'),
(15, 2, 15, 5, 'Google Pixel 8 Pro – amazing camera!', 'Nirrrr', '2026-04-12 10:35:22'),
(16, 3, 1, 5, 'Love these denim pants! Very stylish.', 'shiri', '2026-04-12 10:35:22'),
(17, 3, 2, 4, 'Nike Dunks look cool but need break-in.', 'shiri', '2026-04-12 10:35:22'),
(18, 3, 3, 5, 'iPhone 17 is fast and sleek.', 'shiri', '2026-04-12 10:35:22'),
(19, 3, 4, 5, 'Best iPhone ever! Camera is insane.', 'shiri', '2026-04-12 10:35:22'),
(20, 3, 5, 5, 'Sony headphones are a game-changer.', 'shiri', '2026-04-12 10:35:22'),
(21, 3, 6, 4, 'iPad Air is great for drawing.', 'shiri', '2026-04-12 10:35:22'),
(22, 3, 7, 4, 'Polo shirt material is soft.', 'shiri', '2026-04-12 10:35:22'),
(23, 3, 8, 5, 'Perfect jeans – fit and fabric.', 'shiri', '2026-04-12 10:35:22'),
(24, 3, 9, 4, 'Ultraboost 22 – good but expensive.', 'shiri', '2026-04-12 10:35:22'),
(25, 3, 10, 5, 'Very comfortable formal shoes.', 'shiri', '2026-04-12 10:35:22'),
(26, 3, 11, 5, 'Best walking shoes ever!', 'shiri', '2026-04-12 10:35:22'),
(27, 3, 12, 4, 'Hiking boots are heavy but solid.', 'shiri', '2026-04-12 10:35:22'),
(28, 3, 13, 4, 'Apple Watch is useful but battery could be better.', 'shiri', '2026-04-12 10:35:22'),
(29, 3, 14, 4, 'Good sound for the price.', 'shiri', '2026-04-12 10:35:22'),
(30, 3, 15, 5, 'Pixel 8 Pro – stock Android rocks!', 'shiri', '2026-04-12 10:35:22'),
(31, 3, 46, 5, 'so elegent so beatiful just looking like a wow!!!!', 'shiri', '2026-04-12 13:29:55');

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
(1, 'Admin', 'niranjanadmin@gmail.com', '9898989898', 'KaPan', 'KathManDu', 'NePaL', '$2b$12$wAknHxyJiJj4tslxbjiiPeVEybsOiadh0fZ2ro5J8f7ZyruGxLYiO', 'admin', 1, NULL, NULL, NULL, NULL, '2025-10-18 03:33:19', '2026-02-25 11:27:05'),
(2, 'Nirrrr', 'katwalniranjan40@gmail.com', '9818958772', 'ktm', 'kathmandu', 'Nepal', '$2b$12$MQ6rjS.ea7IzyrDkEeg0QeLUxOX5JtE9I.ivxPTxqBrjJMG14LyCy', 'user', 1, NULL, NULL, NULL, NULL, '2025-11-02 11:58:57', '2026-04-07 08:08:59'),
(3, 'shiri', 'shirshikashrestha359@gmail.com', '9898989898', 'kathmandu', 'kathmandu', 'Nepal', '$2b$12$t0pQad4AvJvpL.HILI4WaOYHc.g2s4jU/3xvQiwv48ixnZGMzOYya', 'user', 1, NULL, NULL, NULL, NULL, '2026-02-25 11:10:50', '2026-02-25 12:04:31'),
(4, 'AdminShirii', 'shiriadmin@gmail.com', '9800000000', 'kathmandu', 'kathmandu', 'Nepal', '$2b$12$g5GwEJwjlusYeHGVmEzoc.eU11sgPUlTa3i8/7vbPUi.bIjSvJItC', 'admin', 1, NULL, NULL, NULL, NULL, '2026-02-25 11:25:37', '2026-02-25 12:04:31');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `order_tracking`
--
ALTER TABLE `order_tracking`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `product_offers`
--
ALTER TABLE `product_offers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `promo_codes`
--
ALTER TABLE `promo_codes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `promo_usage`
--
ALTER TABLE `promo_usage`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_ibfk_3` FOREIGN KEY (`offer_id`) REFERENCES `product_offers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_cart_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_tracking`
--
ALTER TABLE `order_tracking`
  ADD CONSTRAINT `fk_order_tracking_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `promo_usage`
--
ALTER TABLE `promo_usage`
  ADD CONSTRAINT `fk_promo_usage_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_promo_usage_promo` FOREIGN KEY (`promo_code_id`) REFERENCES `promo_codes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_promo_usage_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
