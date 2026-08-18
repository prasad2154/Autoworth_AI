import client from './client';
import type { MarketSummary, SavedCar, PriceAlert, AdminStats, ModelVersion } from '../types';

export const marketApi = {
  getSummary: async (): Promise<MarketSummary> => {
    const res = await client.get('/market-summary');
    return res.data;
  },
  getBrands: async (): Promise<string[]> => {
    const res = await client.get('/market/brands');
    return res.data.brands;
  },
  getCities: async (): Promise<string[]> => {
    const res = await client.get('/market/cities');
    return res.data.cities;
  },
  compare: async (vehicleIds: number[]) => {
    const res = await client.post('/compare', vehicleIds);
    return res.data;
  },
};

export const savedCarsApi = {
  save: async (vehicleId: number): Promise<SavedCar> => {
    const res = await client.post('/saved-cars', { vehicle_id: vehicleId });
    return res.data;
  },
  getAll: async (): Promise<SavedCar[]> => {
    const res = await client.get('/saved-cars');
    return res.data;
  },
  getSavedCars: async (): Promise<SavedCar[]> => {
    const res = await client.get('/saved-cars');
    return res.data;
  },
  remove: async (savedId: number | string) => {
    const res = await client.delete(`/saved-cars/${savedId}`);
    return res.data;
  },
};

export const alertsApi = {
  create: async (data: {
    vehicle_id?: number;
    target_price?: number;
    targetValue?: number;
    percentage_change?: number;
    alert_type?: string;
    type?: string;
    brand?: string;
    model?: string;
    year?: number;
    fuel_type?: string;
    notify_email?: boolean;
    notify_in_app?: boolean;
  }) => {
    const payload = {
      vehicle_id: data.vehicle_id,
      brand: data.brand || 'General',
      model: data.model || 'General',
      year: data.year || 2022,
      fuel_type: data.fuel_type || 'Petrol',
      target_price: data.target_price || data.targetValue || 0,
      notify_email: data.notify_email ?? true,
      notify_in_app: data.notify_in_app ?? true,
      ...data,
    };
    const res = await client.post('/alerts', payload);
    return res.data as PriceAlert;
  },
  getAll: async (): Promise<PriceAlert[]> => {
    const res = await client.get('/alerts');
    return res.data;
  },
  getAlerts: async (): Promise<PriceAlert[]> => {
    const res = await client.get('/alerts');
    return res.data;
  },
  list: async (): Promise<PriceAlert[]> => {
    const res = await client.get('/alerts');
    return res.data;
  },
  update: async (id: number | string, data: { is_active?: boolean; active?: boolean; target_price?: number }) => {
    const payload = {
      is_active: data.is_active ?? data.active,
      target_price: data.target_price,
    };
    const res = await client.patch(`/alerts/${id}`, payload);
    return res.data as PriceAlert;
  },
  delete: async (id: number | string) => {
    const res = await client.delete(`/alerts/${id}`);
    return res.data;
  },
};

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const res = await client.get('/admin/stats');
    return res.data;
  },
  getUsers: async () => {
    const res = await client.get('/admin/users');
    return res.data;
  },
  getModelVersions: async (): Promise<ModelVersion[]> => {
    const res = await client.get('/admin/model-versions');
    return res.data;
  },
  activateModel: async (versionId: number) => {
    const res = await client.post(`/admin/model-versions/${versionId}/activate`);
    return res.data;
  },
  getModelInfo: async () => {
    const res = await client.get('/admin/model-info');
    return res.data;
  },
};

export default marketApi;
