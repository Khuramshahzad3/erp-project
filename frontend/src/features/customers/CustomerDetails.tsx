import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCustomer } from '../../hooks/useCustomers';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import {
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Calendar,
  ShoppingBag,
  CreditCard,
  TrendingUp,
  FileText
} from 'lucide-react';

export const CustomerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: detailRes, isLoading } = useCustomer(id || '');

  const customer = detailRes?.data?.customer;
  const stats = detailRes?.data?.stats;
  const orders = detailRes?.data?.orders || [];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

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

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-1 h-80 bg-white border border-gray-100 rounded-xl" />
          <div className="md:col-span-2 h-80 bg-white border border-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
        <p className="text-gray-500">Customer not found.</p>
        <Button className="mt-4" onClick={() => navigate('/customers')}>
          Back to List
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/customers')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <h1 className="text-xl font-bold text-gray-900">Customer Profile</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {}
        <div className="md:col-span-1 bg-white p-6 rounded-xl border border-gray-150 shadow-sm space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-2xl font-bold mb-4">
              {customer.name.charAt(0)}
            </div>
            <h2 className="text-lg font-bold text-gray-900">{customer.name}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{customer.company}</p>
            <Badge variant={customer.status === 'Active' ? 'success' : 'error'} className="mt-3">
              {customer.status}
            </Badge>
          </div>

          <div className="border-t border-gray-100 pt-6 space-y-4 text-sm">
            <div className="flex items-center gap-3 text-gray-600">
              <Mail className="h-4.5 w-4.5 text-gray-400 shrink-0" />
              <span className="truncate">{customer.email}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Phone className="h-4.5 w-4.5 text-gray-400 shrink-0" />
              <span>{customer.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Briefcase className="h-4.5 w-4.5 text-gray-400 shrink-0" />
              <span>{customer.company}</span>
            </div>
            <div className="flex items-start gap-3 text-gray-600">
              <MapPin className="h-4.5 w-4.5 text-gray-400 shrink-0 mt-0.5" />
              <span>
                {customer.address}, {customer.city}, {customer.country}
              </span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Calendar className="h-4.5 w-4.5 text-gray-400 shrink-0" />
              <span>Joined: {new Date(customer.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {customer.notes && (
            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Internal Notes</h4>
              <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100 leading-relaxed italic">
                "{customer.notes}"
              </p>
            </div>
          )}
        </div>

        {}
        <div className="md:col-span-2 space-y-6">
          {}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 text-blue-600">
                <ShoppingBag className="h-5 w-5" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Orders</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">{stats?.totalOrders || 0}</h3>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 text-emerald-600">
                <CreditCard className="h-5 w-5" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total Spent</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">
                {stats ? formatCurrency(stats.totalSpent) : '$0.00'}
              </h3>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 text-indigo-600">
                <TrendingUp className="h-5 w-5" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Avg Order</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">
                {stats ? formatCurrency(stats.averageOrderValue) : '$0.00'}
              </h3>
            </div>
          </div>

          {}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/10">
              <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400" /> Order History
              </h3>
              {stats?.lastOrderDate && (
                <span className="text-xs text-gray-400 font-medium">
                  Last order: {new Date(stats.lastOrderDate).toLocaleDateString()}
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
                <thead className="bg-gray-50/75 text-gray-500 font-medium">
                  <tr>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider">Order Number</th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider">Total Value</th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider">Date Created</th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                        No orders recorded for this customer yet.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-blue-600">
                          <Link to={`/orders/${order._id}`}>{order.orderNumber}</Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            to={`/orders/${order._id}`}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            View Order
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
      </div>
    </div>
  );
};

export default CustomerDetails;
