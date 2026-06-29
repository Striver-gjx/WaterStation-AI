import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardTab from '../components/DashboardTab';
import { Customer, CustomerTier, Order, OrderStatus, DeliveryStatus, TicketPackage, RedemptionLog, Product } from '../types';

const mockCustomers: Customer[] = [
  { id: 'C001', name: '张三', phone: '13800001111', address: '北京', tier: CustomerTier.VIP, outstandingBalance: 100, activeTickets: 5, lifetimeOrders: 20, lastOrderDate: '2026-06-25' },
  { id: 'C002', name: '李四', phone: '13800002222', address: '上海', tier: CustomerTier.Standard, outstandingBalance: 0, activeTickets: 0, lifetimeOrders: 3, lastOrderDate: '2026-06-20' },
];

const mockOrders: Order[] = [
  { id: 'ORD001', customerId: 'C001', customerName: '张三', productId: 'P001', productName: '矿泉水', quantity: 5, totalAmount: 140, status: OrderStatus.Paid, deliveryStatus: DeliveryStatus.Delivered, orderDate: '2026-06-25', paymentMethod: '微信' },
];

const mockTickets: TicketPackage[] = [
  { id: 'T001', customerId: 'C001', customerName: '张三', productName: '矿泉水', productId: 'P001', totalTickets: 20, remainingTickets: 15, purchaseDate: '2026-06-01', pricePaid: 400, status: '使用中' },
];

const mockLogs: RedemptionLog[] = [];
const mockProducts: Product[] = [
  { id: 'P001', name: 'Water', nameZh: '矿泉水', category: '桶装水', volume: '20L', price: 28, stock: 100, maxStock: 200, status: 'normal', imageUrl: '' },
];

describe('DashboardTab Component', () => {
  const defaultProps = {
    language: 'zh' as const,
    customers: mockCustomers,
    orders: mockOrders,
    ticketPackages: mockTickets,
    redemptionLogs: mockLogs,
    products: mockProducts,
    onNavigate: vi.fn(),
  };

  it('renders dashboard metrics', () => {
    render(<DashboardTab {...defaultProps} />);

    const matches = screen.getAllByText(/客户/);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('displays customer count', () => {
    render(<DashboardTab {...defaultProps} />);

    const matches = screen.getAllByText('2');
    expect(matches.length).toBeGreaterThan(0);
  });

  it('renders chart section', () => {
    render(<DashboardTab {...defaultProps} />);

    const container = document.querySelector('.recharts-responsive-container');
    expect(container || screen.getAllByText(/趋势|销售|收入/i).length > 0).toBeTruthy();
  });

  it('renders order statistics', () => {
    render(<DashboardTab {...defaultProps} />);

    const matches = screen.getAllByText(/订单|Orders/i);
    expect(matches.length).toBeGreaterThan(0);
  });
});
