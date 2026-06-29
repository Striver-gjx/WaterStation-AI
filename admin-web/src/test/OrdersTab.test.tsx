import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OrdersTab from '../components/OrdersTab';
import { Order, OrderStatus, DeliveryStatus, Customer, Product } from '../types';

const mockOrders: Order[] = [
  {
    id: 'ORD001',
    customerId: 'C001',
    customerName: '张三',
    productId: 'P001',
    productName: '高端矿泉水 20L',
    quantity: 5,
    totalAmount: 140,
    status: OrderStatus.Paid,
    deliveryStatus: DeliveryStatus.Pending,
    orderDate: '2026-06-25',
    paymentMethod: '微信支付',
  },
  {
    id: 'ORD002',
    customerId: 'C002',
    customerName: '李四',
    productId: 'P002',
    productName: '办公室套装',
    quantity: 2,
    totalAmount: 96,
    status: OrderStatus.Pending,
    deliveryStatus: DeliveryStatus.InTransit,
    orderDate: '2026-06-24',
    paymentMethod: '现金',
  },
];

const mockCustomers: Customer[] = [
  { id: 'C001', name: '张三', phone: '13800001111', address: '北京', tier: '普通' as never, outstandingBalance: 0, activeTickets: 0, lifetimeOrders: 5, lastOrderDate: '2026-06-25' },
  { id: 'C002', name: '李四', phone: '13800002222', address: '上海', tier: '普通' as never, outstandingBalance: 0, activeTickets: 0, lifetimeOrders: 3, lastOrderDate: '2026-06-24' },
];

const mockProducts: Product[] = [
  { id: 'P001', name: 'Premium', nameZh: '高端矿泉水', category: '桶装水', volume: '20L', price: 28, stock: 100, maxStock: 200, status: 'normal', imageUrl: '' },
  { id: 'P002', name: 'Office', nameZh: '办公室套装', category: '箱装水', volume: '550ml x 24', price: 48, stock: 50, maxStock: 100, status: 'normal', imageUrl: '' },
];

describe('OrdersTab Component', () => {
  const defaultProps = {
    language: 'zh' as const,
    orders: mockOrders,
    customers: mockCustomers,
    products: mockProducts,
    onCreateOrder: vi.fn(),
    onUpdateOrderStatus: vi.fn(),
    onUpdateDeliveryStatus: vi.fn(),
    onDeleteOrder: vi.fn(),
  };

  it('renders order list', () => {
    render(<OrdersTab {...defaultProps} />);

    expect(screen.getByText('张三')).toBeInTheDocument();
    expect(screen.getByText('李四')).toBeInTheDocument();
  });

  it('displays order amounts', () => {
    render(<OrdersTab {...defaultProps} />);

    expect(screen.getByText(/140/)).toBeInTheDocument();
    expect(screen.getByText(/96/)).toBeInTheDocument();
  });

  it('filters orders by customer name search', () => {
    render(<OrdersTab {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(/搜索/i);
    fireEvent.change(searchInput, { target: { value: '张三' } });

    expect(screen.getByText('张三')).toBeInTheDocument();
    expect(screen.queryByText('李四')).not.toBeInTheDocument();
  });

  it('filters orders by order ID search', () => {
    render(<OrdersTab {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(/搜索/i);
    fireEvent.change(searchInput, { target: { value: 'ORD002' } });

    expect(screen.queryByText(/张三/)).not.toBeInTheDocument();
    expect(screen.getByText('李四')).toBeInTheDocument();
  });

  it('renders create order button', () => {
    render(<OrdersTab {...defaultProps} />);

    const createBtn = screen.getByRole('button', { name: /新增|创建|新建/i });
    expect(createBtn).toBeInTheDocument();
  });
});
