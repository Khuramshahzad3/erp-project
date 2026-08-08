import React from 'react';
import { useDashboardStats, useSalesOverview, useTopProducts } from '../../hooks/useDashboard';
import { useOrders } from '../../hooks/useOrders';
import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import {
  Users,
  Package,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import Badge from '../../components/ui/Badge';

export const Dashboard: React.FC = () => {
  const { data: statsRes, isLoading: statsLoading } = useDashboardStats();
  const { data: salesRes, isLoading: salesLoading } = useSalesOverview();
  const { data: topProductsRes, isLoading: productsLoading } = useTopProducts();
  const { data: ordersRes, isLoading: ordersLoading } = useOrders({ page: 1, limit: 5 });

  const stats = statsRes?.data;
  const salesData = salesRes?.data || [];
  const topProducts = topProductsRes?.data || [];
  const recentOrders = ordersRes?.data || [];

  
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: stats ? formatCurrency(stats.totalRevenue) : '$0.00',
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      title: 'Active Customers',
      value: stats ? stats.totalCustomers.toString() : '0',
      icon: Users,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      title: 'Total Orders',
      value: stats ? stats.totalOrders.toString() : '0',
      icon: ShoppingBag,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
    {
      title: 'Products Catalog',
      value: stats ? stats.totalProducts.toString() : '0',
      icon: Package,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      title: 'Pending Orders',
      value: stats ? stats.pendingOrders.toString() : '0',
      icon: TrendingUp,
      color: 'bg-purple-50 text-purple-600 border-purple-100',
    },
    {
      title: 'Low Stock Alerts',
      value: stats ? stats.lowStockProducts.toString() : '0',
      icon: AlertTriangle,
      color: stats?.lowStockProducts && stats.lowStockProducts > 0 
        ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse'
        : 'bg-gray-50 text-gray-400 border-gray-100',
    },
  ];

  
  const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#c084fc'];

  
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, 'success' | 'warning' | 'info' | 'error' | 'default'> = {
      Pending: 'warning',
      Confirmed: 'info',
      Processing: 'info',
      Shipped: 'info',
      Delivered: 'success',
      Cancelled: 'error',
    };
    return <Badge variant={statusMap[status] || 'default'}>{status}</Badge>;
  };

  const isLoading = statsLoading || salesLoading || productsLoading || ordersLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-28 bg-white border border-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-96 bg-white border border-gray-100 rounded-xl animate-pulse" />
          <div className="h-96 bg-white border border-gray-100 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`flex items-center justify-between p-6 bg-white rounded-xl border border-gray-100 shadow-sm`}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {card.title}
                </p>
                <h3 className="mt-2 text-2xl font-bold text-gray-900">{card.value}</h3>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${card.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
              Sales Revenue Trend (Last 30 Days)
            </h3>
          </div>
          <div className="h-72">
            {salesData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">
                No sales data recorded in this period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #f3f4f6' }}
                    formatter={(value: any) => [formatCurrency(Number(value)), 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-6">
            Top Products (Units Sold)
          </h3>
          <div className="h-72">
            {topProducts.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">
                No sales recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#4b5563"
                    fontSize={11}
                    width={90}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #f3f4f6' }}
                    formatter={(value: any) => [value, 'Units Sold']}
                  />
                  <Bar dataKey="quantitySold" radius={[0, 4, 4, 0]} barSize={16}>
                    {topProducts.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
            Recent Sales Orders
          </h3>
          <Link
            to="/orders"
            className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            All Orders <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
            <thead className="bg-gray-50/75 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider">Order Number</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider">Total Value</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider">Created By</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    No orders created yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-blue-600">
                      <Link to={`/orders/${order._id}`}>{order.orderNumber}</Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-medium text-gray-900">
                          {typeof order.customer === 'object' ? order.customer.name : 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {typeof order.customer === 'object' ? order.customer.company : ''}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {typeof order.createdBy === 'object' ? order.createdBy.name : 'System'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/orders/${order._id}`}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
