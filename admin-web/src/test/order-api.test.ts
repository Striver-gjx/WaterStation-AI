import { describe, it, expect, vi, beforeEach } from 'vitest';
import { orderApi } from '../api/order';

vi.mock('../api/request', () => {
  const mockRequest = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };
  return { default: mockRequest };
});

import request from '../api/request';

describe('Order API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('list() calls GET /orders with params', async () => {
    const params = { page: 1, size: 20, status: 'PENDING_PAYMENT', customerId: 5 };
    (request.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { list: [], total: 0 } });

    await orderApi.list(params);

    expect(request.get).toHaveBeenCalledWith('/orders', { params });
  });

  it('list() calls GET /orders without params when none given', async () => {
    (request.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { list: [], total: 0 } });

    await orderApi.list();

    expect(request.get).toHaveBeenCalledWith('/orders', { params: undefined });
  });

  it('get() calls GET /orders/:id', async () => {
    (request.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { id: 1 } });

    await orderApi.get(1);

    expect(request.get).toHaveBeenCalledWith('/orders/1');
  });

  it('create() calls POST /orders with full payload', async () => {
    const data = {
      customerId: 10,
      deliveryAddress: '北京市海淀区',
      items: [{ productId: 1, quantity: 3 }],
      paymentMethod: '微信支付',
      remark: '加急',
    };
    (request.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { id: 1 } });

    await orderApi.create(data);

    expect(request.post).toHaveBeenCalledWith('/orders', data);
  });

  it('updateStatus() calls PUT /orders/:id/status with status and cancelReason', async () => {
    (request.put as ReturnType<typeof vi.fn>).mockResolvedValue({ data: {} });

    await orderApi.updateStatus(5, 'CANCELLED', '客户取消');

    expect(request.put).toHaveBeenCalledWith('/orders/5/status', {
      status: 'CANCELLED',
      cancelReason: '客户取消',
    });
  });

  it('updateStatus() passes undefined cancelReason when not provided', async () => {
    (request.put as ReturnType<typeof vi.fn>).mockResolvedValue({ data: {} });

    await orderApi.updateStatus(5, 'PAID');

    expect(request.put).toHaveBeenCalledWith('/orders/5/status', {
      status: 'PAID',
      cancelReason: undefined,
    });
  });

  it('dispatch() calls POST /orders/:id/dispatch with driverId', async () => {
    (request.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: {} });

    await orderApi.dispatch(3, 7);

    expect(request.post).toHaveBeenCalledWith('/orders/3/dispatch', { driverId: 7 });
  });

  it('delete() calls DELETE /orders/:id', async () => {
    (request.delete as ReturnType<typeof vi.fn>).mockResolvedValue({ data: {} });

    await orderApi.delete(9);

    expect(request.delete).toHaveBeenCalledWith('/orders/9');
  });
});
