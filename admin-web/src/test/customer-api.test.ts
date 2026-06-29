import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { customerApi } from '../api/customer';

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

describe('Customer API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('list() calls GET /customers with params', async () => {
    const mockResponse = { code: 200, data: { total: 1, list: [] } };
    vi.mocked(request.get).mockResolvedValue(mockResponse);

    await customerApi.list({ page: 1, size: 20, keyword: '张' });

    expect(request.get).toHaveBeenCalledWith('/customers', {
      params: { page: 1, size: 20, keyword: '张' },
    });
  });

  it('get() calls GET /customers/:id', async () => {
    const mockResponse = { code: 200, data: { id: 1, name: '张三' } };
    vi.mocked(request.get).mockResolvedValue(mockResponse);

    await customerApi.get(1);

    expect(request.get).toHaveBeenCalledWith('/customers/1');
  });

  it('create() calls POST /customers with body', async () => {
    const data = { name: '新客户', phone: '13800138000', address: '北京市' };
    vi.mocked(request.post).mockResolvedValue({ code: 200, data: { id: 1 } });

    await customerApi.create(data);

    expect(request.post).toHaveBeenCalledWith('/customers', data);
  });

  it('update() calls PUT /customers/:id with partial data', async () => {
    vi.mocked(request.put).mockResolvedValue({ code: 200 });

    await customerApi.update(1, { name: '新名字' });

    expect(request.put).toHaveBeenCalledWith('/customers/1', { name: '新名字' });
  });

  it('delete() calls DELETE /customers/:id', async () => {
    vi.mocked(request.delete).mockResolvedValue({ code: 200 });

    await customerApi.delete(1);

    expect(request.delete).toHaveBeenCalledWith('/customers/1');
  });

  it('recordPayment() calls POST /customers/:id/payment', async () => {
    vi.mocked(request.post).mockResolvedValue({ code: 200 });

    await customerApi.recordPayment(1, 50.00);

    expect(request.post).toHaveBeenCalledWith('/customers/1/payment', { amount: 50.00 });
  });
});
