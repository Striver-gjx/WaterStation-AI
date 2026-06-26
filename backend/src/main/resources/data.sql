-- Seed data: only insert if tables are empty (preserves user data across restarts)

INSERT INTO product (id, name, category, specification, unit_price, cost_price, stock, max_stock, min_stock_alert, description, status, sort_order)
SELECT 1, '大同优质矿泉水', 'water', '20L', 18.00, 8.00, 500, 1000, 50, '天然矿泉水源，富含多种矿物质', 'IN_STOCK', 1
WHERE NOT EXISTS (SELECT 1 FROM product);

INSERT INTO product (id, name, category, specification, unit_price, cost_price, stock, max_stock, min_stock_alert, description, status, sort_order)
SELECT 2, '大同纯净水', 'water', '20L', 15.00, 6.00, 800, 1000, 50, '多重过滤，纯净安全', 'IN_STOCK', 2
WHERE NOT EXISTS (SELECT 1 FROM product WHERE id = 2);

INSERT INTO product (id, name, category, specification, unit_price, cost_price, stock, max_stock, min_stock_alert, description, status, sort_order)
SELECT 3, '大同山泉水', 'water', '5L', 8.00, 3.50, 300, 500, 30, '小桶装山泉水，方便家用', 'IN_STOCK', 3
WHERE NOT EXISTS (SELECT 1 FROM product WHERE id = 3);

INSERT INTO product (id, name, category, specification, unit_price, cost_price, stock, max_stock, min_stock_alert, description, status, sort_order)
SELECT 4, '大同苏打水', 'water', '20L', 22.00, 10.00, 200, 500, 30, '弱碱性苏打水，适合养生', 'IN_STOCK', 4
WHERE NOT EXISTS (SELECT 1 FROM product WHERE id = 4);

INSERT INTO driver (id, name, phone, vehicle_type, vehicle_plate, service_area, max_daily_orders, status, rating)
SELECT 1, '张师傅', '13800001001', '电动三轮车', '京A·E001', '朝阳区东部', 40, 'AVAILABLE', 4.90
WHERE NOT EXISTS (SELECT 1 FROM driver);

INSERT INTO driver (id, name, phone, vehicle_type, vehicle_plate, service_area, max_daily_orders, status, rating)
SELECT 2, '李师傅', '13800001002', '小型货车', '京B·F002', '海淀区', 50, 'AVAILABLE', 4.85
WHERE NOT EXISTS (SELECT 1 FROM driver WHERE id = 2);

INSERT INTO driver (id, name, phone, vehicle_type, vehicle_plate, service_area, max_daily_orders, status, rating)
SELECT 3, '王师傅', '13800001003', '电动三轮车', '京A·E003', '朝阳区西部', 35, 'BUSY', 4.92
WHERE NOT EXISTS (SELECT 1 FROM driver WHERE id = 3);

INSERT INTO customer (id, name, phone, address, tier, outstanding_balance, active_tickets, lifetime_orders, total_spent)
SELECT 1, '张三', '13900001001', '朝阳区建国路88号院3号楼', 'REGULAR', 0.00, 0, 5, 90.00
WHERE NOT EXISTS (SELECT 1 FROM customer);

INSERT INTO customer (id, name, phone, address, tier, outstanding_balance, active_tickets, lifetime_orders, total_spent)
SELECT 2, '李四', '13900001002', '海淀区中关村大街1号', 'VIP', 0.00, 50, 35, 680.00
WHERE NOT EXISTS (SELECT 1 FROM customer WHERE id = 2);

INSERT INTO customer (id, name, phone, address, tier, outstanding_balance, active_tickets, lifetime_orders, total_spent)
SELECT 3, '北京科技有限公司', '13900001003', '朝阳区望京SOHO T1 15层', 'ENTERPRISE', 360.00, 200, 120, 5400.00
WHERE NOT EXISTS (SELECT 1 FROM customer WHERE id = 3);

INSERT INTO customer (id, name, phone, address, tier, outstanding_balance, active_tickets, lifetime_orders, total_spent)
SELECT 4, '王五', '13900001004', '丰台区丰台路12号', 'REGULAR', 36.00, 10, 8, 144.00
WHERE NOT EXISTS (SELECT 1 FROM customer WHERE id = 4);
