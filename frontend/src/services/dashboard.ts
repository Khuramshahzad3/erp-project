import apiClient from './api/axiosInstance';
import type { DashboardStats, SalesTrendItem, TopProductItem, APISingleResponse } from '../types/api.types';

export const dashboardService = {
  getStats: async (): Promise<APISingleResponse<DashboardStats>> => {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  },

  getSalesOverview: async (): Promise<APISingleResponse<SalesTrendItem[]>> => {
    const response = await apiClient.get('/dashboard/sales-overview');
    return response.data;
  },

  getTopProducts: async (): Promise<APISingleResponse<TopProductItem[]>> => {
    const response = await apiClient.get('/dashboard/top-products');
    return response.data;
  },
};
