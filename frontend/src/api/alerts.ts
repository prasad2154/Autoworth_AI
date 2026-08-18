import client from './client';
import type { PriceAlert } from '../types';

export const alertsApi = {
  /** List all price alerts for the authenticated user */
  list: () =>
    client.get<PriceAlert[]>('/alerts').then((r) => r.data),

  /** Create a new price alert */
  create: (data: {
    vehicle_id?: number;
    brand: string;
    model: string;
    year: number;
    fuel_type: string;
    target_price: number;
    notify_email: boolean;
    notify_in_app: boolean;
  }) =>
    client.post<PriceAlert>('/alerts', data).then((r) => r.data),

  /** Update an existing alert */
  update: (
    alertId: number,
    data: Partial<{
      target_price: number;
      is_active: boolean;
      notify_email: boolean;
      notify_in_app: boolean;
    }>
  ) =>
    client.patch<PriceAlert>(`/alerts/${alertId}`, data).then((r) => r.data),

  /** Delete an alert */
  delete: (alertId: number) =>
    client.delete(`/alerts/${alertId}`).then((r) => r.data),

  /** Toggle alert active state */
  toggle: (alertId: number, isActive: boolean) =>
    client
      .patch<PriceAlert>(`/alerts/${alertId}`, { is_active: isActive })
      .then((r) => r.data),

  /** Mark alert as triggered (admin / system use) */
  markTriggered: (alertId: number, triggeredPrice: number) =>
    client
      .post(`/alerts/${alertId}/trigger`, { triggered_price: triggeredPrice })
      .then((r) => r.data),
};

export default alertsApi;
