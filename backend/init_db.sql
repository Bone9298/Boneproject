-- ==========================================
-- FB 商品管理系統資料庫初始化
-- ==========================================

-- 建立資料庫
CREATE DATABASE IF NOT EXISTS fb_products 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 使用資料庫
USE fb_products;

-- 商品主表
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specs VARCHAR(500),
    price VARCHAR(50) NOT NULL,
    quantity VARCHAR(50),
    category ENUM('1', '2') DEFAULT '1' COMMENT '1=常溫, 2=冷凍',
    branch VARCHAR(50) COMMENT '分店',
    priority BOOLEAN DEFAULT FALSE,
    image LONGTEXT COMMENT 'Base64 圖片',
    selected BOOLEAN DEFAULT FALSE,
    pending BOOLEAN DEFAULT FALSE,
    customer_reserved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_branch (branch),
    INDEX idx_pending (pending),
    INDEX idx_selected (selected),
    INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 操作歷史表（可選）
CREATE TABLE IF NOT EXISTS product_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(36),
    action ENUM('create', 'update', 'delete', 'publish', 'reserve') NOT NULL,
    changes JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_product (product_id),
    INDEX idx_action (action),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 建立用戶並授權
CREATE USER IF NOT EXISTS 'fb_user'@'localhost' IDENTIFIED BY '9298';
GRANT ALL PRIVILEGES ON fb_products.* TO 'fb_user'@'localhost';
FLUSH PRIVILEGES;

SELECT 'Database initialization completed!' AS Status;
