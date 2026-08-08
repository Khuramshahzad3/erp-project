import apiClient from './api/axiosInstance';
import type { Customer, CustomerDetailResponse, APIListResponse, APISingleResponse } from '../types/api.types';

export const customersService = {
  getCustomers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<APIListResponse<Customer>> => {
    const response = await apiClient.get('/customers', { params });
    return response.data;
  },

  getCustomerById: async (id: string): Promise<CustomerDetailResponse> => {
    const response = await apiClient.get(`/customers/${id}`);
    return response.data;
  },

  createCustomer: async (customerData: Partial<Customer>): Promise<APISingleResponse<Customer>> => {
    const response = await apiClient.post('/customers', customerData);
    return response.data;
  },

  updateCustomer: async (id: string, customerData: Partial<Customer>): Promise<APISingleResponse<Customer>> => {
    const response = await apiClient.patch(`/customers/${id}`, customerData);
    return response.data;
  },

  deleteCustomer: async (id: string): Promise<APISingleResponse<{ id: string }>> => {
    const response = await apiClient.delete(`/customers/${id}`);
    return response.data;
  },
};
