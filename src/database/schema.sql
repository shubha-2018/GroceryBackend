-- Grocery Mart Database Schema for MySQL

CREATE DATABASE IF NOT EXISTS `grocery_mart_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `grocery_mart_db`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `role` ENUM('customer', 'admin') DEFAULT 'customer',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `image_url` VARCHAR(500) DEFAULT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Products Table
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(200) NOT NULL,
  `category_name` VARCHAR(100) NOT NULL,
  `qty` VARCHAR(50) NOT NULL,
  `price` VARCHAR(50) NOT NULL,
  `price_numeric` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `original_price` VARCHAR(50) DEFAULT NULL,
  `discount` VARCHAR(20) DEFAULT NULL,
  `rating` DECIMAL(2,1) DEFAULT 4.5,
  `image_url` MEDIUMTEXT NOT NULL,
  `description` TEXT DEFAULT NULL,
  `is_popular` BOOLEAN DEFAULT FALSE,
  `is_deal` BOOLEAN DEFAULT FALSE,
  `stock` INT DEFAULT 100,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(50) NOT NULL UNIQUE,
  `user_id` INT DEFAULT NULL,
  `customer_name` VARCHAR(100) NOT NULL,
  `customer_email` VARCHAR(150) NOT NULL,
  `customer_phone` VARCHAR(20) DEFAULT NULL,
  `delivery_address` TEXT DEFAULT NULL,
  `total_amount` VARCHAR(50) NOT NULL,
  `total_numeric` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `payment_method` VARCHAR(50) DEFAULT 'Cash on Delivery',
  `payment_status` ENUM('Pending', 'Paid', 'Failed') DEFAULT 'Pending',
  `order_status` ENUM('Order Placed', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled') DEFAULT 'Order Placed',
  `status_color` VARCHAR(20) DEFAULT '#ff9800',
  `eta` VARCHAR(100) DEFAULT 'Arriving in 10-15 mins',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Order Items Table
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `product_name` VARCHAR(200) NOT NULL,
  `qty` VARCHAR(50) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `price` VARCHAR(50) NOT NULL,
  `item_total` VARCHAR(50) DEFAULT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Offers & Deals Table (Best Offers For You)
CREATE TABLE IF NOT EXISTS `offers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(100) NOT NULL,
  `subtitle` VARCHAR(100) DEFAULT 'UP TO',
  `discount` VARCHAR(50) NOT NULL,
  `coupon_code` VARCHAR(50) DEFAULT NULL,
  `image_url` MEDIUMTEXT NOT NULL,
  `bg_class` VARCHAR(50) DEFAULT 'offer-green',
  `link_tab` VARCHAR(50) DEFAULT 'Offers',
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Contact / Help Messages Table
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `subject` VARCHAR(200) NOT NULL,
  `message` TEXT NOT NULL,
  `status` ENUM('Unread', 'Read', 'Resolved') DEFAULT 'Unread',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
