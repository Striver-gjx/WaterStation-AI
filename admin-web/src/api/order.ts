import request from './request';

export const orderApi = {
  list(params?: { page?: number; size?: number; status?: string; customerId?: number }) {
    return request.get('/orders', { params });
  },
  get(id: number) {
    return request.get(`/orders/${id}`);
  },
  create(data: {
    customerId: number;
    deliveryAddress: string;
    items: { productId: number; quantity: number }[];
    paymentMethod?: string;
    remark?: string;
  }) {
    return request.post('/orders', data);
  },
  updateStatus(id: number, status: string, cancelReason?: string) {
    return request.put(`/orders/${id}/status`, { status, cancelReason });
  },
  dispatch(id: number, driverId: number) {
    return request.post(`/orders/${id}/dispatch`, { driverId });
  },
  delete(id: number) {
    return request.delete(`/orders/${id}`);
  },
};
