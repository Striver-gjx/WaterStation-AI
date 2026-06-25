import request from './request';

export const productApi = {
  list(params?: { category?: string; status?: string }) {
    return request.get('/products', { params });
  },
  get(id: number) {
    return request.get(`/products/${id}`);
  },
  create(data: { name: string; unitPrice: number; category?: string; specification?: string; stock?: number }) {
    return request.post('/products', data);
  },
  update(id: number, data: Record<string, unknown>) {
    return request.put(`/products/${id}`, data);
  },
  delete(id: number) {
    return request.delete(`/products/${id}`);
  },
  adjustStock(id: number, changeType: string, quantity: number, remark?: string) {
    return request.put(`/products/${id}/stock`, { changeType, quantity, remark });
  },
};
