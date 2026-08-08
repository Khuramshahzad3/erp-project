import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardService.getStats(),
  });
};

export const useSalesOverview = () => {
  return useQuery({
    queryKey: ['dashboard', 'sales-overview'],
    queryFn: () => dashboardService.getSalesOverview(),
  });
};

export const useTopProducts = () => {
  return useQuery({
    queryKey: ['dashboard', 'top-products'],
    queryFn: () => dashboardService.getTopProducts(),
  });
};
