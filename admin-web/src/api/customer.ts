import request from './request';

export interface CustomerVO {
  id: number;
  name: string;
  phone: string;
  address: string;
  tier: string;
  outstandingBalance: number;
  activeTickets: number;
  lifetimeOrders: number;
  totalSpent: number;
  status: number;
  createdAt: string;
}

export const customerApi = {
  list(params?: { page?: number; size?: number; keyword?: string; tier?: string }) {
    return request.get('/customers', { params });
  },
  get(id: number) {
    return request.get(`/customers/${id}`);
  },
  create(data: { name: string; phone: string; address: string; tier?: string; companyName?: string }) {
    return request.post('/customers', data);
  },
  update(id: number, data: Partial<CustomerVO>) {
    return request.put(`/customers/${id}`, data);
  },
  delete(id: number) {
    return request.delete(`/customers/${id}`);
  },
  recordPayment(id: number, amount: number) {
    return request.post(`/customers/${id}/payment`, { amount });
  },
};
