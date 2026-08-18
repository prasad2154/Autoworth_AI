import client from './client';
import type { Vehicle, PaginatedResponse } from '../types';

export const vehiclesApi = {
  /** List vehicles with optional filters */
  list: (params?: {
    brand?: string;
    model?: string;
    fuel_type?: string;
    year_min?: number;
    year_max?: number;
    page?: number;
    page_size?: number;
  }) =>
    client.get<PaginatedResponse<Vehicle>>('/vehicles', { params }).then((r) => r.data),

  /** Get a single vehicle by ID */
  get: (id: number) =>
    client.get<Vehicle>(`/vehicles/${id}`).then((r) => r.data),

  /** Get distinct brands available in the database */
  getBrands: () =>
    client.get<string[]>('/vehicles/brands').then((r) => r.data),

  /** Get models for a given brand */
  getModels: (brand: string) =>
    client.get<string[]>('/vehicles/models', { params: { brand } }).then((r) => r.data),

  /** Get all available cities */
  getCities: () =>
    client.get<string[]>('/vehicles/cities').then((r) => r.data),

  /** Save a vehicle to the user's saved cars */
  save: (vehicleId: number, savedPrice?: number) =>
    client
      .post('/saved-cars', { vehicle_id: vehicleId, saved_price: savedPrice })
      .then((r) => r.data),

  /** Remove a vehicle from saved cars */
  unsave: (vehicleId: number) =>
    client.delete(`/saved-cars/${vehicleId}`).then((r) => r.data),

  /** List saved cars for the authenticated user */
  listSaved: () =>
    client.get('/saved-cars').then((r) => r.data),
};

export default vehiclesApi;
