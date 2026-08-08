import apiClient from './api/axiosInstance';
import type { Product, APIListResponse, APISingleResponse } from '../types/api.types';

export const productsService = {
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<APIListResponse<Product>> => {
    const response = await apiClient.get('/products', { params });
    return response.data;
  },

  getProductById: async (id: string): Promise<APISingleResponse<Product>> => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  createProduct: async (productData: Partial<Product>): Promise<APISingleResponse<Product>> => {
    const response = await apiClient.post('/products', productData);
    return response.data;
  },

  updateProduct: async (id: string, productData: Partial<Product>): Promise<APISingleResponse<Product>> => {
    const response = await apiClient.patch(`/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id: string): Promise<APISingleResponse<{ id: string }>> => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },
};
