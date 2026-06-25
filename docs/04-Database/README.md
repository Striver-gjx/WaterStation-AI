# 数据库设计

## 概述

- 数据库：MySQL 8.0+
- 字符集：utf8mb4_unicode_ci
- 引擎：InnoDB
- 迁移方式：版本化 SQL 脚本（Flyway 命名规范）

## 表结构总览

| 表名 | 说明 | 核心字段 |
|------|------|----------|
| `customer` | 客户表 | name, phone, address, tier, active_tickets |
| `product` | 产品表 | name, category, unit_price, stock, status |
| `driver` | 配送员表 | name, phone, status, service_area, rating |
| `order` | 订单表 | order_no, customer_id, driver_id, status, total_amount |
| `order_item` | 订单明细 | order_id, product_id, quantity, subtotal |
| `delivery` | 配送记录 | order_id, driver_id, status, empty_buckets_collected |
| `bucket` | 桶管理 | customer_id, deposit_amount, status |
| `ticket_package` | 水票套餐 | customer_id, total_tickets, remaining_tickets |
| `ticket_redemption` | 水票兑换记录 | package_id, redeemed_qty |
| `payment` | 支付记录 | order_id, amount, payment_method, status |
| `inventory_log` | 库存变动记录 | product_id, change_type, quantity |
| `sys_config` | 系统配置 | config_key, config_value |

## ER 关系

```
customer 1──N order
customer 1──N bucket
customer 1──N ticket_package
order    1──N order_item
order    1──1 delivery
order    1──N payment
order_item N──1 product
delivery   N──1 driver
ticket_package 1──N ticket_redemption
product  1──N inventory_log
```

## 脚本文件

| 文件 | 说明 |
|------|------|
| `V001__init_schema.sql` | 初始化全部表结构 |
| `seed_data.sql` | 开发/测试环境种子数据 |

## 索引策略

- 主键：自增 BIGINT UNSIGNED
- 唯一索引：phone（客户/配送员）、order_no（订单号）、config_key（配置键）
- 普通索引：状态字段、外键字段、时间字段
- 复合查询优化：按业务查询频率后续添加
