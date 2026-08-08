import { useQuery } from '@tanstack/react-query';
import { auditLogsService } from '../services/auditLogs';

export const useAuditLogs = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => auditLogsService.getAuditLogs(params),
  });
};
