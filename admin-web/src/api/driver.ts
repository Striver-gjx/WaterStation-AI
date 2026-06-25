import request from './request';

export const driverApi = {
  list(params?: { status?: string }) {
    return request.get('/drivers', { params });
  },
  get(id: number) {
    return request.get(`/drivers/${id}`);
  },
  create(data: { name: string; phone: string; vehicleType?: string; vehiclePlate?: string; serviceArea?: string }) {
    return request.post('/drivers', data);
  },
  update(id: number, data: Record<string, unknown>) {
    return request.put(`/drivers/${id}`, data);
  },
  updateStatus(id: number, status: string) {
    return request.put(`/drivers/${id}/status`, { status });
  },
  updateLocation(id: number, latitude: number, longitude: number) {
    return request.put(`/drivers/${id}/location`, { latitude, longitude });
  },
};
