import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ticketApi } from '../api/ticket';

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

describe('Ticket API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('listPackages() calls GET /tickets/packages with params', async () => {
    const params = { customerId: 1, status: 'ACTIVE', page: 1, size: 10 };
    (request.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { list: [], total: 0 } });

    await ticketApi.listPackages(params);

    expect(request.get).toHaveBeenCalledWith('/tickets/packages', { params });
  });

  it('listPackages() works without params', async () => {
    (request.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { list: [], total: 0 } });

    await ticketApi.listPackages();

    expect(request.get).toHaveBeenCalledWith('/tickets/packages', { params: undefined });
  });

  it('getPackage() calls GET /tickets/packages/:id', async () => {
    (request.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { id: 5 } });

    await ticketApi.getPackage(5);

    expect(request.get).toHaveBeenCalledWith('/tickets/packages/5');
  });

  it('sellPackage() calls POST /tickets/packages with sell data', async () => {
    const data = { customerId: 1, productId: 2, totalTickets: 20, pricePaid: 300 };
    (request.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { id: 1 } });

    await ticketApi.sellPackage(data);

    expect(request.post).toHaveBeenCalledWith('/tickets/packages', data);
  });

  it('redeem() calls POST /tickets/redeem with redeem data', async () => {
    const data = { packageId: 1, redeemedQty: 5, remark: '上门送水' };
    (request.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: {} });

    await ticketApi.redeem(data);

    expect(request.post).toHaveBeenCalledWith('/tickets/redeem', data);
  });

  it('redeem() works without optional remark', async () => {
    const data = { packageId: 1, redeemedQty: 3 };
    (request.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: {} });

    await ticketApi.redeem(data);

    expect(request.post).toHaveBeenCalledWith('/tickets/redeem', data);
  });

  it('listBuckets() calls GET /tickets/buckets with params', async () => {
    const params = { customerId: 2, status: 'OUT' };
    (request.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [] });

    await ticketApi.listBuckets(params);

    expect(request.get).toHaveBeenCalledWith('/tickets/buckets', { params });
  });

  it('issueBucket() calls POST /tickets/buckets/issue with data', async () => {
    const data = { customerId: 3, bucketType: 'STANDARD', depositAmount: 50 };
    (request.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { id: 1 } });

    await ticketApi.issueBucket(data);

    expect(request.post).toHaveBeenCalledWith('/tickets/buckets/issue', data);
  });

  it('returnBucket() calls POST /tickets/buckets/:id/return', async () => {
    (request.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: {} });

    await ticketApi.returnBucket(8);

    expect(request.post).toHaveBeenCalledWith('/tickets/buckets/8/return');
  });
});
