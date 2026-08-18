import client from './client';
import type { PredictionRequest, PredictionResponse, ValuationHistory, NegotiationResponse, PaginatedResponse } from '../types';

export const predictionApi = {
  predict: async (data: PredictionRequest): Promise<PredictionResponse> => {
    const res = await client.post('/predict', data);
    return res.data;
  },

  simulate: async (
    idOrData: number | {
      brand: string; model: string; year: number;
      fuel_type: string; transmission: string;
      engine_cc?: number; scenarios: Array<Record<string, any>>;
    },
    simParams?: any
  ): Promise<any> => {
    if (typeof idOrData === 'number') {
      const res = await client.post('/simulation', { valuation_id: idOrData, scenarios: [simParams] });
      return { data: res.data?.scenarios?.[0] || res.data };
    }
    const res = await client.post('/simulation', idOrData);
    return res.data;
  },

  negotiate: async (
    idOrData: number | {
      predicted_price: number;
      asking_price: number;
      vehicle_details: Record<string, any>;
      valuation_id?: number;
    },
    options?: { seller_asking_price?: number; asking_price?: number }
  ): Promise<NegotiationResponse> => {
    if (typeof idOrData === 'number') {
      const asking = options?.seller_asking_price || options?.asking_price || 0;
      const res = await client.post('/negotiation', {
        valuation_id: idOrData,
        asking_price: asking,
        predicted_price: asking,
        vehicle_details: {}
      });
      const data = res.data;
      return { ...data, data };
    }
    const res = await client.post('/negotiation', idOrData);
    return res.data;
  },

  getHistory: async (page = 1, pageSize = 10): Promise<PaginatedResponse<ValuationHistory>> => {
    const res = await client.get('/valuations', { params: { page, page_size: pageSize } });
    return res.data;
  },

  getValuation: async (id: number): Promise<ValuationHistory> => {
    const res = await client.get(`/valuations/${id}`);
    return res.data;
  },

  deleteValuation: async (id: number | string) => {
    const res = await client.delete(`/valuations/${id}`);
    return res.data;
  },

  deleteHistory: async (id: number | string) => {
    const res = await client.delete(`/valuations/${id}`);
    return res.data;
  },
};

export default predictionApi;
