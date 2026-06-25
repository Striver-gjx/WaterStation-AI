/**
 * AquaFlow Pro Types
 */

export enum CustomerTier {
  VIP = 'VIP',
  Gold = 'Gold',
  Standard = 'Standard'
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
  Paid = 'Paid',
  Pending = 'Pending',
  Cancelled = 'Cancelled'
}

export enum DeliveryStatus {
  Pending = 'Pending',
  InTransit = 'In Transit',
  Delivered = 'Delivered'
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
  status: 'Active' | 'Depleted';
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
  category: 'Barrels' | 'Cases' | 'Equipment' | 'Bundles';
  volume: string;
  price: number;
  stock: number;
  maxStock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
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
