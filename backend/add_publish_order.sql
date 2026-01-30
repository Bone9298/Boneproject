-- 請在 MySQL 中執行此 SQL 來添加 publish_order 欄位

USE fb_products;

-- 添加發布順序欄位
ALTER TABLE products 
ADD COLUMN publish_order INT NULL COMMENT '發布順序（1=最優先）';

-- 建立索引提升查詢效能
CREATE INDEX idx_pending_order ON products(pending, publish_order);

-- 確認欄位已添加
DESCRIBE products;
