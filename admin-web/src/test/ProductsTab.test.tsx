import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductsTab from '../components/ProductsTab';
import { Product } from '../types';

const mockProducts: Product[] = [
  {
    id: 'P001',
    name: 'Premium Spring Water',
    nameZh: '高端矿泉水',
    category: '桶装水',
    volume: '20L',
    price: 28,
    stock: 150,
    maxStock: 200,
    status: 'normal',
    imageUrl: '',
  },
  {
    id: 'P002',
    name: 'Office Pack',
    nameZh: '办公室套装',
    category: '箱装水',
    volume: '550ml x 24',
    price: 48,
    stock: 5,
    maxStock: 100,
    status: 'low_stock',
    imageUrl: '',
  },
  {
    id: 'P003',
    name: 'Dispenser',
    nameZh: '饮水机',
    category: '设备',
    volume: '-',
    price: 599,
    stock: 0,
    maxStock: 50,
    status: 'out_of_stock',
    imageUrl: '',
  },
];

describe('ProductsTab Component', () => {
  const defaultProps = {
    language: 'zh' as const,
    products: mockProducts,
    onAddProduct: vi.fn(),
    onUpdateProduct: vi.fn(),
    onDeleteProduct: vi.fn(),
  };

  it('renders all products', () => {
    render(<ProductsTab {...defaultProps} />);

    expect(screen.getByText('高端矿泉水')).toBeInTheDocument();
    expect(screen.getByText('办公室套装')).toBeInTheDocument();
    expect(screen.getByText('饮水机')).toBeInTheDocument();
  });

  it('displays product prices', () => {
    render(<ProductsTab {...defaultProps} />);

    expect(screen.getByText(/¥28/)).toBeInTheDocument();
    expect(screen.getByText(/¥48/)).toBeInTheDocument();
    expect(screen.getByText(/¥599/)).toBeInTheDocument();
  });

  it('filters products by search keyword', () => {
    render(<ProductsTab {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(/搜索/i);
    fireEvent.change(searchInput, { target: { value: '矿泉水' } });

    expect(screen.getByText('高端矿泉水')).toBeInTheDocument();
    expect(screen.queryByText('办公室套装')).not.toBeInTheDocument();
  });

  it('renders add product button', () => {
    render(<ProductsTab {...defaultProps} />);

    const addBtn = screen.getByRole('button', { name: /新增|添加/i });
    expect(addBtn).toBeInTheDocument();
  });

  it('shows stock information', () => {
    render(<ProductsTab {...defaultProps} />);

    expect(screen.getByText(/150/)).toBeInTheDocument();
  });
});
