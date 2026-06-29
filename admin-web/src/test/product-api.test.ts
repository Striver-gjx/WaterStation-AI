import { describe, it, expect, vi, beforeEach } from 'vitest';
import { productApi } from '../api/product';

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

describe('Product API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('list() calls GET /products with filter params', async () => {
    vi.mocked(request.get).mockResolvedValue({ code: 200, data: [] });

    await productApi.list({ category: 'water', status: 'IN_STOCK' });

    expect(request.get).toHaveBeenCalledWith('/products', {
      params: { category: 'water', status: 'IN_STOCK' },
    });
  });

  it('get() calls GET /products/:id', async () => {
    vi.mocked(request.get).mockResolvedValue({ code: 200, data: { id: 1 } });

    await productApi.get(1);

    expect(request.get).toHaveBeenCalledWith('/products/1');
  });

  it('create() calls POST /products with body', async () => {
    const data = { name: '矿泉水', unitPrice: 15 };
    vi.mocked(request.post).mockResolvedValue({ code: 200, data: { id: 1 } });

    await productApi.create(data);

    expect(request.post).toHaveBeenCalledWith('/products', data);
  });

  it('adjustStock() calls PUT /products/:id/stock', async () => {
    vi.mocked(request.put).mockResolvedValue({ code: 200 });

    await productApi.adjustStock(1, 'IN', 50, '补货');

    expect(request.put).toHaveBeenCalledWith('/products/1/stock', {
      changeType: 'IN',
      quantity: 50,
      remark: '补货',
    });
  });

  it('delete() calls DELETE /products/:id', async () => {
    vi.mocked(request.delete).mockResolvedValue({ code: 200 });

    await productApi.delete(1);

    expect(request.delete).toHaveBeenCalledWith('/products/1');
  });
});
