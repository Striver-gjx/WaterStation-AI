-- ============================================================
-- WaterStation AI - Database Schema
-- Version: V001
-- Database: MySQL 8.0+
-- Charset: utf8mb4
-- ============================================================

-- -----------------------------------------------------------
-- 1. 客户表 (customer)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `customer` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '客户ID',
    `name` VARCHAR(100) NOT NULL COMMENT '客户姓名',
    `phone` VARCHAR(20) NOT NULL COMMENT '手机号',
    `address` VARCHAR(500) NOT NULL DEFAULT '' COMMENT '配送地址',
    `address_detail` VARCHAR(200) DEFAULT '' COMMENT '详细地址（楼层/门牌号）',
    `latitude` DECIMAL(10, 7) DEFAULT NULL COMMENT '纬度',
    `longitude` DECIMAL(10, 7) DEFAULT NULL COMMENT '经度',
    `tier` ENUM('REGULAR', 'VIP', 'ENTERPRISE') NOT NULL DEFAULT 'REGULAR' COMMENT '客户等级',
    `company_name` VARCHAR(200) DEFAULT NULL COMMENT '企业名称（企业客户）',
    `outstanding_balance` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT '未结余额',
    `active_tickets` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '当前持有水票数',
    `lifetime_orders` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '累计订单数',
    `total_spent` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT '累计消费金额',
    `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-正常 0-禁用',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_phone` (`phone`),
    KEY `idx_tier` (`tier`),
    KEY `idx_status` (`status`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户表';

-- -----------------------------------------------------------
-- 2. 产品表 (product)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `product` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '产品ID',
    `name` VARCHAR(200) NOT NULL COMMENT '产品名称',
    `category` VARCHAR(50) NOT NULL DEFAULT 'water' COMMENT '分类: water/dispenser/accessory',
    `specification` VARCHAR(100) DEFAULT NULL COMMENT '规格（如 20L、5L）',
    `unit_price` DECIMAL(10, 2) NOT NULL COMMENT '单价',
    `cost_price` DECIMAL(10, 2) DEFAULT NULL COMMENT '成本价',
    `stock` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '当前库存',
    `max_stock` INT UNSIGNED NOT NULL DEFAULT 1000 COMMENT '最大库存容量',
    `min_stock_alert` INT UNSIGNED NOT NULL DEFAULT 50 COMMENT '库存预警线',
    `image_url` VARCHAR(500) DEFAULT NULL COMMENT '产品图片',
    `description` TEXT DEFAULT NULL COMMENT '产品描述',
    `status` ENUM('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'DISCONTINUED') NOT NULL DEFAULT 'IN_STOCK' COMMENT '库存状态',
    `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序权重',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_category` (`category`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产品表';

-- -----------------------------------------------------------
-- 3. 配送员表 (driver)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `driver` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '配送员ID',
    `name` VARCHAR(100) NOT NULL COMMENT '姓名',
    `phone` VARCHAR(20) NOT NULL COMMENT '手机号',
    `id_card` VARCHAR(20) DEFAULT NULL COMMENT '身份证号',
    `avatar_url` VARCHAR(500) DEFAULT NULL COMMENT '头像',
    `vehicle_type` VARCHAR(50) DEFAULT NULL COMMENT '车辆类型',
    `vehicle_plate` VARCHAR(20) DEFAULT NULL COMMENT '车牌号',
    `service_area` VARCHAR(200) DEFAULT NULL COMMENT '服务区域',
    `max_daily_orders` INT UNSIGNED NOT NULL DEFAULT 50 COMMENT '每日最大接单数',
    `current_latitude` DECIMAL(10, 7) DEFAULT NULL COMMENT '当前纬度',
    `current_longitude` DECIMAL(10, 7) DEFAULT NULL COMMENT '当前经度',
    `status` ENUM('AVAILABLE', 'BUSY', 'OFFLINE') NOT NULL DEFAULT 'OFFLINE' COMMENT '状态',
    `total_deliveries` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '累计配送数',
    `rating` DECIMAL(3, 2) DEFAULT 5.00 COMMENT '评分',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_phone` (`phone`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='配送员表';

-- -----------------------------------------------------------
-- 4. 订单表 (order)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `order` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '订单ID',
    `order_no` VARCHAR(32) NOT NULL COMMENT '订单号',
    `customer_id` BIGINT UNSIGNED NOT NULL COMMENT '客户ID',
    `driver_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '配送员ID',
    `total_amount` DECIMAL(10, 2) NOT NULL COMMENT '订单总金额',
    `paid_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT '已支付金额',
    `status` ENUM('DRAFT', 'PENDING_PAYMENT', 'PAID', 'WAITING_DISPATCH', 'DISPATCHING', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDING', 'REFUNDED') NOT NULL DEFAULT 'DRAFT' COMMENT '订单状态',
    `payment_method` ENUM('WECHAT', 'CASH', 'TICKET', 'MONTHLY', 'CREDIT_CARD') DEFAULT NULL COMMENT '支付方式',
    `delivery_address` VARCHAR(500) NOT NULL COMMENT '配送地址',
    `delivery_latitude` DECIMAL(10, 7) DEFAULT NULL COMMENT '配送纬度',
    `delivery_longitude` DECIMAL(10, 7) DEFAULT NULL COMMENT '配送经度',
    `scheduled_date` DATE DEFAULT NULL COMMENT '预约配送日期',
    `scheduled_time_slot` VARCHAR(20) DEFAULT NULL COMMENT '预约时段（如 09:00-12:00）',
    `remark` VARCHAR(500) DEFAULT NULL COMMENT '订单备注',
    `cancel_reason` VARCHAR(500) DEFAULT NULL COMMENT '取消原因',
    `completed_at` DATETIME DEFAULT NULL COMMENT '完成时间',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_order_no` (`order_no`),
    KEY `idx_customer_id` (`customer_id`),
    KEY `idx_driver_id` (`driver_id`),
    KEY `idx_status` (`status`),
    KEY `idx_created_at` (`created_at`),
    KEY `idx_scheduled_date` (`scheduled_date`),
    CONSTRAINT `fk_order_customer` FOREIGN KEY (`customer_id`) REFERENCES `customer`(`id`),
    CONSTRAINT `fk_order_driver` FOREIGN KEY (`driver_id`) REFERENCES `driver`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- -----------------------------------------------------------
-- 5. 订单明细表 (order_item)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_item` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '明细ID',
    `order_id` BIGINT UNSIGNED NOT NULL COMMENT '订单ID',
    `product_id` BIGINT UNSIGNED NOT NULL COMMENT '产品ID',
    `product_name` VARCHAR(200) NOT NULL COMMENT '产品名称（快照）',
    `unit_price` DECIMAL(10, 2) NOT NULL COMMENT '单价（快照）',
    `quantity` INT UNSIGNED NOT NULL COMMENT '数量',
    `subtotal` DECIMAL(10, 2) NOT NULL COMMENT '小计',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_order_id` (`order_id`),
    KEY `idx_product_id` (`product_id`),
    CONSTRAINT `fk_item_order` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`),
    CONSTRAINT `fk_item_product` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单明细表';

-- -----------------------------------------------------------
-- 6. 配送记录表 (delivery)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `delivery` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '配送记录ID',
    `order_id` BIGINT UNSIGNED NOT NULL COMMENT '订单ID',
    `driver_id` BIGINT UNSIGNED NOT NULL COMMENT '配送员ID',
    `status` ENUM('PENDING', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVED', 'DELIVERED', 'FAILED') NOT NULL DEFAULT 'PENDING' COMMENT '配送状态',
    `pickup_time` DATETIME DEFAULT NULL COMMENT '取货时间',
    `delivered_time` DATETIME DEFAULT NULL COMMENT '送达时间',
    `delivery_photo_url` VARCHAR(500) DEFAULT NULL COMMENT '配送完成照片',
    `sign_photo_url` VARCHAR(500) DEFAULT NULL COMMENT '签收照片',
    `gps_latitude` DECIMAL(10, 7) DEFAULT NULL COMMENT '完成时GPS纬度',
    `gps_longitude` DECIMAL(10, 7) DEFAULT NULL COMMENT '完成时GPS经度',
    `empty_buckets_collected` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '回收空桶数',
    `customer_signed` TINYINT NOT NULL DEFAULT 0 COMMENT '客户是否签收: 1-是 0-否',
    `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_order_id` (`order_id`),
    KEY `idx_driver_id` (`driver_id`),
    KEY `idx_status` (`status`),
    CONSTRAINT `fk_delivery_order` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`),
    CONSTRAINT `fk_delivery_driver` FOREIGN KEY (`driver_id`) REFERENCES `driver`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='配送记录表';

-- -----------------------------------------------------------
-- 7. 桶管理表 (bucket)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `bucket` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '桶ID',
    `customer_id` BIGINT UNSIGNED NOT NULL COMMENT '客户ID',
    `bucket_type` VARCHAR(50) NOT NULL DEFAULT 'STANDARD_20L' COMMENT '桶类型',
    `deposit_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT '押金金额',
    `status` ENUM('WITH_CUSTOMER', 'RETURNED', 'DAMAGED', 'LOST') NOT NULL DEFAULT 'WITH_CUSTOMER' COMMENT '状态',
    `issued_date` DATE NOT NULL COMMENT '发放日期',
    `returned_date` DATE DEFAULT NULL COMMENT '归还日期',
    `remark` VARCHAR(200) DEFAULT NULL COMMENT '备注',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_customer_id` (`customer_id`),
    KEY `idx_status` (`status`),
    CONSTRAINT `fk_bucket_customer` FOREIGN KEY (`customer_id`) REFERENCES `customer`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='桶管理表';

-- -----------------------------------------------------------
-- 8. 水票套餐表 (ticket_package)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ticket_package` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '套餐ID',
    `customer_id` BIGINT UNSIGNED NOT NULL COMMENT '客户ID',
    `product_id` BIGINT UNSIGNED NOT NULL COMMENT '适用产品ID',
    `total_tickets` INT UNSIGNED NOT NULL COMMENT '总张数',
    `remaining_tickets` INT UNSIGNED NOT NULL COMMENT '剩余张数',
    `price_paid` DECIMAL(10, 2) NOT NULL COMMENT '购买金额',
    `unit_price` DECIMAL(10, 2) NOT NULL COMMENT '折合单价',
    `status` ENUM('ACTIVE', 'DEPLETED', 'EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE' COMMENT '状态',
    `purchase_date` DATE NOT NULL COMMENT '购买日期',
    `expire_date` DATE DEFAULT NULL COMMENT '过期日期',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_customer_id` (`customer_id`),
    KEY `idx_product_id` (`product_id`),
    KEY `idx_status` (`status`),
    KEY `idx_expire_date` (`expire_date`),
    CONSTRAINT `fk_ticket_customer` FOREIGN KEY (`customer_id`) REFERENCES `customer`(`id`),
    CONSTRAINT `fk_ticket_product` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='水票套餐表';

-- -----------------------------------------------------------
-- 9. 水票兑换记录表 (ticket_redemption)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ticket_redemption` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '兑换记录ID',
    `package_id` BIGINT UNSIGNED NOT NULL COMMENT '套餐ID',
    `customer_id` BIGINT UNSIGNED NOT NULL COMMENT '客户ID',
    `order_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '关联订单ID',
    `redeemed_qty` INT UNSIGNED NOT NULL COMMENT '兑换数量',
    `redemption_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '兑换时间',
    `remark` VARCHAR(200) DEFAULT NULL COMMENT '备注',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_package_id` (`package_id`),
    KEY `idx_customer_id` (`customer_id`),
    KEY `idx_order_id` (`order_id`),
    CONSTRAINT `fk_redeem_package` FOREIGN KEY (`package_id`) REFERENCES `ticket_package`(`id`),
    CONSTRAINT `fk_redeem_customer` FOREIGN KEY (`customer_id`) REFERENCES `customer`(`id`),
    CONSTRAINT `fk_redeem_order` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='水票兑换记录表';

-- -----------------------------------------------------------
-- 10. 支付记录表 (payment)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `payment` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '支付ID',
    `order_id` BIGINT UNSIGNED NOT NULL COMMENT '订单ID',
    `customer_id` BIGINT UNSIGNED NOT NULL COMMENT '客户ID',
    `amount` DECIMAL(10, 2) NOT NULL COMMENT '支付金额',
    `payment_method` ENUM('WECHAT', 'CASH', 'TICKET', 'MONTHLY', 'CREDIT_CARD') NOT NULL COMMENT '支付方式',
    `transaction_no` VARCHAR(64) DEFAULT NULL COMMENT '第三方交易号',
    `status` ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING' COMMENT '支付状态',
    `paid_at` DATETIME DEFAULT NULL COMMENT '支付时间',
    `remark` VARCHAR(200) DEFAULT NULL COMMENT '备注',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_order_id` (`order_id`),
    KEY `idx_customer_id` (`customer_id`),
    KEY `idx_status` (`status`),
    KEY `idx_transaction_no` (`transaction_no`),
    CONSTRAINT `fk_payment_order` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`),
    CONSTRAINT `fk_payment_customer` FOREIGN KEY (`customer_id`) REFERENCES `customer`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支付记录表';

-- -----------------------------------------------------------
-- 11. 库存变动记录表 (inventory_log)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `inventory_log` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '记录ID',
    `product_id` BIGINT UNSIGNED NOT NULL COMMENT '产品ID',
    `change_type` ENUM('IN', 'OUT', 'ADJUST') NOT NULL COMMENT '变动类型: IN-入库 OUT-出库 ADJUST-调整',
    `quantity` INT NOT NULL COMMENT '变动数量（正为增，负为减）',
    `before_stock` INT UNSIGNED NOT NULL COMMENT '变动前库存',
    `after_stock` INT UNSIGNED NOT NULL COMMENT '变动后库存',
    `reference_type` VARCHAR(50) DEFAULT NULL COMMENT '关联类型（ORDER/RETURN/MANUAL）',
    `reference_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '关联ID',
    `operator` VARCHAR(100) DEFAULT NULL COMMENT '操作人',
    `remark` VARCHAR(200) DEFAULT NULL COMMENT '备注',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_product_id` (`product_id`),
    KEY `idx_change_type` (`change_type`),
    KEY `idx_created_at` (`created_at`),
    CONSTRAINT `fk_invlog_product` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='库存变动记录表';

-- -----------------------------------------------------------
-- 12. 系统配置表 (sys_config)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sys_config` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '配置ID',
    `config_key` VARCHAR(100) NOT NULL COMMENT '配置键',
    `config_value` TEXT NOT NULL COMMENT '配置值',
    `description` VARCHAR(200) DEFAULT NULL COMMENT '说明',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';
