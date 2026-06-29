import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CustomersTab from '../components/CustomersTab';
import { Customer, CustomerTier, Order, TicketPackage, Product, OrderStatus, DeliveryStatus } from '../types';

const mockCustomers: Customer[] = [
  {
    id: 'C001',
    name: '张三',
    phone: '13800001111',
    address: '北京市朝阳区',
    tier: CustomerTier.VIP,
    outstandingBalance: 100,
    activeTickets: 5,
    lifetimeOrders: 20,
    lastOrderDate: '2026-06-20',
  },
  {
    id: 'C002',
    name: '李四',
    phone: '13800002222',
    address: '上海市浦东区',
    tier: CustomerTier.Standard,
    outstandingBalance: 0,
    activeTickets: 0,
    lifetimeOrders: 3,
    lastOrderDate: '2026-06-15',
  },
];

const mockOrders: Order[] = [];
const mockTicketPackages: TicketPackage[] = [];
const mockProducts: Product[] = [];

describe('CustomersTab Component', () => {
  const defaultProps = {
    language: 'zh' as const,
    customers: mockCustomers,
    orders: mockOrders,
    ticketPackages: mockTicketPackages,
    products: mockProducts,
    onRegisterCustomer: vi.fn(),
    onRecordPayment: vi.fn(),
    onDeleteCustomer: vi.fn(),
  };

  it('renders customer list', () => {
    render(<CustomersTab {...defaultProps} />);

    expect(screen.getByText('张三')).toBeInTheDocument();
    expect(screen.getByText('李四')).toBeInTheDocument();
  });

  it('displays customer phone and address', () => {
    render(<CustomersTab {...defaultProps} />);

    expect(screen.getByText('13800001111')).toBeInTheDocument();
    expect(screen.getByText('北京市朝阳区')).toBeInTheDocument();
  });

  it('filters customers by search keyword', () => {
    render(<CustomersTab {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(/搜索/i);
    fireEvent.change(searchInput, { target: { value: '张三' } });

    expect(screen.getByText('张三')).toBeInTheDocument();
    expect(screen.queryByText('李四')).not.toBeInTheDocument();
  });

  it('filters customers by phone search', () => {
    render(<CustomersTab {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(/搜索/i);
    fireEvent.change(searchInput, { target: { value: '13800002222' } });

    expect(screen.queryByText('张三')).not.toBeInTheDocument();
    expect(screen.getByText('李四')).toBeInTheDocument();
  });

  it('shows empty state when no customers match filter', () => {
    render(<CustomersTab {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(/搜索/i);
    fireEvent.change(searchInput, { target: { value: '不存在的客户' } });

    expect(screen.queryByText('张三')).not.toBeInTheDocument();
    expect(screen.queryByText('李四')).not.toBeInTheDocument();
  });

  it('renders register button', () => {
    render(<CustomersTab {...defaultProps} />);

    const buttons = screen.getAllByRole('button');
    const addBtn = buttons.find(btn => btn.textContent?.match(/新增|添加|注册|客户/));
    expect(addBtn).toBeTruthy();
  });
});
