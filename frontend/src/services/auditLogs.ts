import apiClient from './api/axiosInstance';
import type { AuditLog, APIListResponse } from '../types/api.types';

export const auditLogsService = {
  getAuditLogs: async (params?: { page?: number; limit?: number }): Promise<APIListResponse<AuditLog>> => {
    const response = await apiClient.get('/audit-logs', { params });
    return response.data;
  },
};
