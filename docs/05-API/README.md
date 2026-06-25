# API 文档

## 概述

- 规范：OpenAPI 3.0.3
- 风格：RESTful
- 基础路径：`/api/v1`
- 认证：JWT Bearer Token（待实现）

## 统一响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

## 统一分页格式

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 100,
    "list": [...]
  }
}
```

## 模块划分

| 文件 | 模块 | 核心接口 |
|------|------|----------|
| `customer-api.yaml` | 客户管理 | CRUD + 还款 |
| `order-api.yaml` | 订单管理 | CRUD + 状态变更 + 派单 + 支付 |
| `product-api.yaml` | 产品/库存 | CRUD + 库存调整 + 变动记录 |
| `delivery-api.yaml` | 配送管理 | 配送员 CRUD + 取货 + 完成配送 |
| `ticket-api.yaml` | 水票管理 | 售卖套餐 + 兑换 + 桶管理 |

## 接口清单

### 客户模块 (6 接口)
- `GET /api/v1/customers` - 客户列表（分页/搜索/筛选）
- `POST /api/v1/customers` - 新增客户
- `GET /api/v1/customers/{id}` - 客户详情
- `PUT /api/v1/customers/{id}` - 更新客户
- `DELETE /api/v1/customers/{id}` - 删除客户
- `POST /api/v1/customers/{id}/payment` - 客户还款

### 订单模块 (6 接口)
- `GET /api/v1/orders` - 订单列表（分页/状态/日期筛选）
- `POST /api/v1/orders` - 创建订单
- `GET /api/v1/orders/{id}` - 订单详情
- `DELETE /api/v1/orders/{id}` - 删除订单
- `PUT /api/v1/orders/{id}/status` - 更新订单状态
- `POST /api/v1/orders/{id}/dispatch` - 派单
- `POST /api/v1/orders/{id}/pay` - 支付

### 产品/库存模块 (6 接口)
- `GET /api/v1/products` - 产品列表
- `POST /api/v1/products` - 新增产品
- `GET /api/v1/products/{id}` - 产品详情
- `PUT /api/v1/products/{id}` - 更新产品
- `DELETE /api/v1/products/{id}` - 删除产品
- `PUT /api/v1/products/{id}/stock` - 库存调整
- `GET /api/v1/inventory/logs` - 库存变动记录

### 配送模块 (7 接口)
- `GET /api/v1/drivers` - 配送员列表
- `POST /api/v1/drivers` - 新增配送员
- `GET /api/v1/drivers/{id}` - 配送员详情
- `PUT /api/v1/drivers/{id}` - 更新配送员
- `PUT /api/v1/drivers/{id}/status` - 更新状态
- `PUT /api/v1/drivers/{id}/location` - 上报位置
- `GET /api/v1/deliveries/{id}` - 配送记录详情
- `POST /api/v1/deliveries/{id}/pickup` - 取货
- `POST /api/v1/deliveries/{id}/complete` - 完成配送

### 水票模块 (7 接口)
- `GET /api/v1/tickets/packages` - 水票套餐列表
- `POST /api/v1/tickets/packages` - 售卖水票
- `GET /api/v1/tickets/packages/{id}` - 套餐详情
- `POST /api/v1/tickets/redeem` - 兑换水票
- `GET /api/v1/tickets/redemptions` - 兑换记录
- `GET /api/v1/tickets/buckets` - 桶管理列表
- `POST /api/v1/tickets/buckets/issue` - 发放桶
- `POST /api/v1/tickets/buckets/{id}/return` - 退桶
