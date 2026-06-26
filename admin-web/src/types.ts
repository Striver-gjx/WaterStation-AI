/**
 * AquaFlow Pro Types
 */

export enum CustomerTier {
  VIP = 'VIP',
  Gold = '黄金',
  Standard = '普通'
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  tier: CustomerTier;
  outstandingBalance: number;
  activeTickets: number;
  lifetimeOrders: number;
  lastOrderDate: string;
}

export enum OrderStatus {
  Paid = '已支付',
  Pending = '待结算',
  Cancelled = '已取消'
}

export enum DeliveryStatus {
  Pending = '待派送',
  InTransit = '配送中',
  Delivered = '已送达'
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  status: OrderStatus;
  deliveryStatus: DeliveryStatus;
  orderDate: string;
  paymentMethod: string;
}

export interface TicketPackage {
  id: string;
  customerId: string;
  customerName: string;
  productName: string;
  productId: string;
  totalTickets: number;
  remainingTickets: number;
  purchaseDate: string;
  pricePaid: number;
  status: '使用中' | '已用完';
}

export interface RedemptionLog {
  id: string;
  packageId: string;
  customerId: string;
  customerName: string;
  productName: string;
  redeemedQty: number;
  remainingAfter: number;
  redemptionDate: string;
  driverName: string;
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  nameZh: string;
  category: '桶装水' | '箱装水' | '设备' | '套餐';
  volume: string;
  price: number;
  stock: number;
  maxStock: number;
  status: '有货' | '库存不足' | '缺货';
  imageUrl: string;
}

export interface AppState {
  customers: Customer[];
  orders: Order[];
  ticketPackages: TicketPackage[];
  redemptionLogs: RedemptionLog[];
  products: Product[];
  language: 'en' | 'zh';
  activeTab: string;
  selectedOrderId: string | null;
  selectedCustomerId: string | null;
}
