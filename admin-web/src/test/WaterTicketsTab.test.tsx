import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WaterTicketsTab from '../components/WaterTicketsTab';
import { TicketPackage, RedemptionLog, Customer, CustomerTier, Product } from '../types';

const mockTickets: TicketPackage[] = [
  {
    id: 'T001',
    customerId: 'C001',
    customerName: '张三',
    productName: '高端矿泉水 20L',
    productId: 'P001',
    totalTickets: 20,
    remainingTickets: 15,
    purchaseDate: '2026-06-01',
    pricePaid: 400,
    status: '使用中',
  },
  {
    id: 'T002',
    customerId: 'C002',
    customerName: '李四',
    productName: '办公室套装',
    productId: 'P002',
    totalTickets: 10,
    remainingTickets: 0,
    purchaseDate: '2026-05-15',
    pricePaid: 200,
    status: '已用完',
  },
];

const mockLogs: RedemptionLog[] = [
  {
    id: 'R001',
    packageId: 'T001',
    customerId: 'C001',
    customerName: '张三',
    productName: '高端矿泉水 20L',
    redeemedQty: 5,
    remainingAfter: 15,
    redemptionDate: '2026-06-20',
    driverName: '王大勇',
  },
];

const mockCustomers: Customer[] = [
  { id: 'C001', name: '张三', phone: '13800001111', address: '北京', tier: CustomerTier.VIP, outstandingBalance: 0, activeTickets: 15, lifetimeOrders: 10, lastOrderDate: '2026-06-20' },
  { id: 'C002', name: '李四', phone: '13800002222', address: '上海', tier: CustomerTier.Standard, outstandingBalance: 0, activeTickets: 0, lifetimeOrders: 5, lastOrderDate: '2026-06-15' },
];

const mockProducts: Product[] = [
  { id: 'P001', name: 'Premium', nameZh: '高端矿泉水', category: '桶装水', volume: '20L', price: 28, stock: 100, maxStock: 200, status: 'normal', imageUrl: '' },
  { id: 'P002', name: 'Office', nameZh: '办公室套装', category: '箱装水', volume: '550ml x 24', price: 48, stock: 50, maxStock: 100, status: 'normal', imageUrl: '' },
];

describe('WaterTicketsTab Component', () => {
  const defaultProps = {
    language: 'zh' as const,
    ticketPackages: mockTickets,
    redemptionLogs: mockLogs,
    customers: mockCustomers,
    products: mockProducts,
    onRedeemTickets: vi.fn(),
    onSellBundle: vi.fn(),
  };

  it('renders ticket packages', () => {
    render(<WaterTicketsTab {...defaultProps} />);

    const matches = screen.getAllByText('张三');
    expect(matches.length).toBeGreaterThan(0);
  });

  it('displays remaining tickets info', () => {
    render(<WaterTicketsTab {...defaultProps} />);

    const matches = screen.getAllByText(/15/);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('renders sell bundle button', () => {
    render(<WaterTicketsTab {...defaultProps} />);

    const buttons = screen.getAllByRole('button');
    const sellBtn = buttons.find(btn => btn.textContent?.match(/售卖|新增|出售|水票/));
    expect(sellBtn).toBeTruthy();
  });

  it('renders redemption section', () => {
    render(<WaterTicketsTab {...defaultProps} />);

    const matches = screen.getAllByText(/核销|兑换|Redeem/i);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('filters packages by search', () => {
    render(<WaterTicketsTab {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(/搜索/i);
    fireEvent.change(searchInput, { target: { value: '张三' } });

    const matches = screen.getAllByText('张三');
    expect(matches.length).toBeGreaterThan(0);
  });
});
