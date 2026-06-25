# Business Rules

## 订单状态流转

```
Draft → Pending Payment → Paid → Waiting Dispatch → Dispatching → Delivered → Completed
```

异常状态：`Cancelled` / `Refunding` / `Refunded`

---

## 配送规则

- 一个订单只能绑定一个配送员
- 配送完成必须：
  - 上传现场图片
  - 填写回收空桶数量
  - GPS 定位打卡
  - 客户签收确认

---

## 桶管理规则

| 场景 | 规则 |
|------|------|
| 首次购买 | 收取桶押金 |
| 日常配送 | 空桶换满桶 |
| 退桶 | 退还押金 |

---

## 水票规则

| 操作 | 规则 |
|------|------|
| 购买 | 按张数购买（如 100 张） |
| 兑换 | remaining-- |
| 耗尽 | remaining = 0 时自动失效 |
| 过期 | 支持设置有效期 |

---

## 支付方式

- 微信支付
- 水票抵扣
- 现金
- 月结（企业客户）

---

## 客户等级

| 等级 | 条件 |
|------|------|
| Regular | 默认 |
| VIP | 累计消费 > 500 或订单 > 20 |
| Enterprise | 企业客户，支持月结 |
