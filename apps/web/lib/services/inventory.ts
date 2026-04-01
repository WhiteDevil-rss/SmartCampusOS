import { api } from '../api';

export const inventoryService = {
  // Items
  getItems: async (universityId: string) => {
    const response = await api.get(`/v2/inventory/${universityId}/items`);
    return response.data;
  },
  createItem: async (universityId: string, data: any) => {
    const response = await api.post(`/v2/inventory/${universityId}/items`, data);
    return response.data;
  },
  updateItem: async (itemId: string, data: any) => {
    const response = await api.put(`/v2/inventory/items/${itemId}`, data);
    return response.data;
  },
  adjustStock: async (itemId: string, data: { quantity: number; type: 'IN' | 'OUT'; reason: string }) => {
    const response = await api.post(`/v2/inventory/items/${itemId}/adjust`, data);
    return response.data;
  },

  // Vendors
  getVendors: async (universityId: string) => {
    const response = await api.get(`/v2/inventory/${universityId}/vendors`);
    return response.data;
  },
  createVendor: async (universityId: string, data: any) => {
    const response = await api.post(`/v2/inventory/${universityId}/vendors`, data);
    return response.data;
  },

  // Procurement
  getProcurementRequests: async (universityId: string) => {
    const response = await api.get(`/v2/inventory/${universityId}/procurement`);
    return response.data;
  },
  createProcurementRequest: async (universityId: string, data: any) => {
    const response = await api.post(`/v2/inventory/${universityId}/procurement`, data);
    return response.data;
  },
  updateProcurementStatus: async (requestId: string, status: string) => {
    const response = await api.put(`/v2/inventory/procurement/${requestId}/status`, { status });
    return response.data;
  },

  // AI Forecasting
  getForecast: async (universityId: string) => {
    const response = await api.get(`/v2/inventory/${universityId}/forecast`);
    return response.data;
  }
};
