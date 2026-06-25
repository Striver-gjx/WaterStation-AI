import request from './request';

export const ticketApi = {
  listPackages(params?: { customerId?: number; status?: string; page?: number; size?: number }) {
    return request.get('/tickets/packages', { params });
  },
  getPackage(id: number) {
    return request.get(`/tickets/packages/${id}`);
  },
  sellPackage(data: { customerId: number; productId: number; totalTickets: number; pricePaid: number }) {
    return request.post('/tickets/packages', data);
  },
  redeem(data: { packageId: number; redeemedQty: number; remark?: string }) {
    return request.post('/tickets/redeem', data);
  },
  listBuckets(params?: { customerId?: number; status?: string }) {
    return request.get('/tickets/buckets', { params });
  },
  issueBucket(data: { customerId: number; bucketType?: string; depositAmount?: number }) {
    return request.post('/tickets/buckets/issue', data);
  },
  returnBucket(id: number) {
    return request.post(`/tickets/buckets/${id}/return`);
  },
};
