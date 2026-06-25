import { useEffect, useState, useCallback } from 'react';
import { customerApi } from '../api/customer';
import { productApi } from '../api/product';
import { orderApi } from '../api/order';
import { Customer, Product, Order, OrderStatus, DeliveryStatus, CustomerTier } from '../types';

interface UseBackendDataReturn {
  customers: Customer[];
  products: Product[];
  orders: Order[];
  loading: boolean;
  error: string | null;
  refreshCustomers: () => Promise<void>;
  refreshProducts: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  createCustomer: (data: Omit<Customer, 'id' | 'lastOrderDate' | 'lifetimeOrders'>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  recordPayment: (customerId: string, amount: number) => Promise<void>;
  createProduct: (data: Omit<Product, 'id' | 'status'>) => Promise<void>;
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  createOrder: (data: Omit<Order, 'id' | 'orderDate'>) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
}

function mapBackendCustomer(c: any): Customer {
  const tierMap: Record<string, CustomerTier> = {
    'REGULAR': CustomerTier.Standard,
    'VIP': CustomerTier.VIP,
    'ENTERPRISE': CustomerTier.Gold,
  };
  return {
    id: `CUST-${String(c.id).padStart(3, '0')}`,
    name: c.name,
    phone: c.phone,
    address: c.address,
    tier: tierMap[c.tier] || CustomerTier.Standard,
    outstandingBalance: c.outstandingBalance || 0,
    activeTickets: c.activeTickets || 0,
    lifetimeOrders: c.lifetimeOrders || 0,
    lastOrderDate: c.createdAt?.split('T')[0] || '2026-06-25',
  };
}

function mapBackendProduct(p: any): Product {
  return {
    id: `PROD-${String(p.id).padStart(3, '0')}`,
    name: p.name,
    nameZh: p.name,
    category: 'Barrels',
    volume: p.specification || '20L',
    price: p.unitPrice,
    stock: p.stock,
    maxStock: p.maxStock,
    status: p.status === 'IN_STOCK' ? 'In Stock' : p.status === 'LOW_STOCK' ? 'Low Stock' : 'Out of Stock',
    imageUrl: p.imageUrl || '',
  };
}

function mapBackendOrder(o: any): Order {
  const statusMap: Record<string, OrderStatus> = {
    'PENDING_PAYMENT': OrderStatus.Pending,
    'PAID': OrderStatus.Paid,
    'COMPLETED': OrderStatus.Paid,
    'CANCELLED': OrderStatus.Cancelled,
    'DELIVERED': OrderStatus.Paid,
  };

  return {
    id: o.orderNo || `ORD-${o.id}`,
    customerId: `CUST-${String(o.customerId).padStart(3, '0')}`,
    customerName: o.customerName || '',
    productId: `PROD-001`,
    productName: '',
    quantity: 1,
    totalAmount: o.totalAmount,
    status: statusMap[o.status] || OrderStatus.Pending,
    deliveryStatus: DeliveryStatus.Pending,
    orderDate: o.createdAt?.split('T')[0] || '2026-06-25',
    paymentMethod: o.paymentMethod || 'Cash',
  };
}

function extractNumericId(prefixedId: string): number {
  const match = prefixedId.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

export function useBackendData(): UseBackendDataReturn {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshCustomers = useCallback(async () => {
    try {
      const res: any = await customerApi.list({ page: 1, size: 100 });
      setCustomers(res.data.list.map(mapBackendCustomer));
    } catch (e: any) {
      console.error('Failed to fetch customers:', e);
    }
  }, []);

  const refreshProducts = useCallback(async () => {
    try {
      const res: any = await productApi.list();
      setProducts(res.data.map(mapBackendProduct));
    } catch (e: any) {
      console.error('Failed to fetch products:', e);
    }
  }, []);

  const refreshOrders = useCallback(async () => {
    try {
      const res: any = await orderApi.list({ page: 1, size: 100 });
      setOrders(res.data.list.map(mapBackendOrder));
    } catch (e: any) {
      console.error('Failed to fetch orders:', e);
    }
  }, []);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        await Promise.all([refreshCustomers(), refreshProducts(), refreshOrders()]);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [refreshCustomers, refreshProducts, refreshOrders]);

  const createCustomer = useCallback(async (data: Omit<Customer, 'id' | 'lastOrderDate' | 'lifetimeOrders'>) => {
    const tierMap: Record<string, string> = {
      [CustomerTier.Standard]: 'REGULAR',
      [CustomerTier.VIP]: 'VIP',
      [CustomerTier.Gold]: 'ENTERPRISE',
    };
    await customerApi.create({
      name: data.name,
      phone: data.phone,
      address: data.address,
      tier: tierMap[data.tier] || 'REGULAR',
    });
    await refreshCustomers();
  }, [refreshCustomers]);

  const deleteCustomer = useCallback(async (id: string) => {
    await customerApi.delete(extractNumericId(id));
    await refreshCustomers();
  }, [refreshCustomers]);

  const recordPayment = useCallback(async (customerId: string, amount: number) => {
    await customerApi.recordPayment(extractNumericId(customerId), amount);
    await refreshCustomers();
  }, [refreshCustomers]);

  const createProduct = useCallback(async (data: Omit<Product, 'id' | 'status'>) => {
    await productApi.create({
      name: data.name,
      unitPrice: data.price,
      category: data.category?.toLowerCase() || 'water',
      specification: data.volume,
      stock: data.stock,
    });
    await refreshProducts();
  }, [refreshProducts]);

  const updateProduct = useCallback(async (productId: string, updates: Partial<Product>) => {
    const backendUpdates: Record<string, unknown> = {};
    if (updates.name) backendUpdates.name = updates.name;
    if (updates.price) backendUpdates.unitPrice = updates.price;
    if (updates.stock !== undefined) backendUpdates.stock = updates.stock;
    await productApi.update(extractNumericId(productId), backendUpdates);
    await refreshProducts();
  }, [refreshProducts]);

  const deleteProduct = useCallback(async (productId: string) => {
    await productApi.delete(extractNumericId(productId));
    await refreshProducts();
  }, [refreshProducts]);

  const createOrder = useCallback(async (data: Omit<Order, 'id' | 'orderDate'>) => {
    const customerId = extractNumericId(data.customerId);
    const productId = extractNumericId(data.productId);
    const customer = customers.find(c => c.id === data.customerId);
    await orderApi.create({
      customerId,
      deliveryAddress: customer?.address || '',
      items: [{ productId, quantity: data.quantity }],
      paymentMethod: data.paymentMethod === 'Water Ticket' ? 'TICKET' : 'CASH',
    });
    await refreshOrders();
    await refreshCustomers();
    await refreshProducts();
  }, [customers, refreshOrders, refreshCustomers, refreshProducts]);

  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    const statusMap: Record<string, string> = {
      [OrderStatus.Pending]: 'PENDING_PAYMENT',
      [OrderStatus.Paid]: 'PAID',
      [OrderStatus.Cancelled]: 'CANCELLED',
    };
    const numId = orderId.replace(/\D/g, '');
    if (numId) {
      await orderApi.updateStatus(parseInt(numId), statusMap[status] || 'PENDING_PAYMENT');
      await refreshOrders();
    }
  }, [refreshOrders]);

  const deleteOrder = useCallback(async (orderId: string) => {
    const numId = orderId.replace(/\D/g, '');
    if (numId) {
      await orderApi.delete(parseInt(numId));
      await refreshOrders();
    }
  }, [refreshOrders]);

  return {
    customers, products, orders,
    loading, error,
    refreshCustomers, refreshProducts, refreshOrders,
    createCustomer, deleteCustomer, recordPayment,
    createProduct, updateProduct, deleteProduct,
    createOrder, updateOrderStatus, deleteOrder,
  };
}
