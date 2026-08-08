import apiClient from './api/axiosInstance';
import type { SalesOrder, APIListResponse, APISingleResponse } from '../types/api.types';

export const ordersService = {
  getOrders: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    customer?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<APIListResponse<SalesOrder>> => {
    const response = await apiClient.get('/orders', { params });
    return response.data;
  },

  getOrderById: async (id: string): Promise<APISingleResponse<SalesOrder>> => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  createOrder: async (orderData: {
    customer: string;
    items: { product: string; quantity: number }[];
    discount?: number;
    notes?: string;
  }): Promise<APISingleResponse<SalesOrder>> => {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  },

  updateOrderStatus: async (
    id: string,
    status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'
  ): Promise<APISingleResponse<SalesOrder>> => {
    const response = await apiClient.patch(`/orders/${id}/status`, { status });
    return response.data;
  },
};
