import { describe, it, expect, vi, beforeEach } from 'vitest';
import { driverApi } from '../api/driver';

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

describe('Driver API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('list() calls GET /drivers with status filter', async () => {
    const params = { status: 'ONLINE' };
    (request.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [] });

    await driverApi.list(params);

    expect(request.get).toHaveBeenCalledWith('/drivers', { params });
  });

  it('list() calls GET /drivers without params', async () => {
    (request.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [] });

    await driverApi.list();

    expect(request.get).toHaveBeenCalledWith('/drivers', { params: undefined });
  });

  it('get() calls GET /drivers/:id', async () => {
    (request.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { id: 1 } });

    await driverApi.get(1);

    expect(request.get).toHaveBeenCalledWith('/drivers/1');
  });

  it('create() calls POST /drivers with full data', async () => {
    const data = {
      name: '张师傅',
      phone: '13800001111',
      vehicleType: '电动三轮车',
      vehiclePlate: '京B12345',
      serviceArea: '朝阳区',
    };
    (request.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { id: 1 } });

    await driverApi.create(data);

    expect(request.post).toHaveBeenCalledWith('/drivers', data);
  });

  it('create() calls POST /drivers with minimal data', async () => {
    const data = { name: '李师傅', phone: '13800002222' };
    (request.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { id: 2 } });

    await driverApi.create(data);

    expect(request.post).toHaveBeenCalledWith('/drivers', data);
  });

  it('update() calls PUT /drivers/:id with partial data', async () => {
    const data = { name: '新名字', maxDailyOrders: 60 };
    (request.put as ReturnType<typeof vi.fn>).mockResolvedValue({ data: {} });

    await driverApi.update(3, data);

    expect(request.put).toHaveBeenCalledWith('/drivers/3', data);
  });

  it('updateStatus() calls PUT /drivers/:id/status', async () => {
    (request.put as ReturnType<typeof vi.fn>).mockResolvedValue({ data: {} });

    await driverApi.updateStatus(5, 'ONLINE');

    expect(request.put).toHaveBeenCalledWith('/drivers/5/status', { status: 'ONLINE' });
  });

  it('updateLocation() calls PUT /drivers/:id/location with coordinates', async () => {
    (request.put as ReturnType<typeof vi.fn>).mockResolvedValue({ data: {} });

    await driverApi.updateLocation(7, 39.908823, 116.397470);

    expect(request.put).toHaveBeenCalledWith('/drivers/7/location', {
      latitude: 39.908823,
      longitude: 116.397470,
    });
  });
});
