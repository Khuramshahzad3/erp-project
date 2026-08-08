import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import { useCustomers } from '../../hooks/useCustomers';
import DataTable, { type Column } from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import { Plus, Search, FileDown, Eye } from 'lucide-react';
import { triggerToast } from '../../components/feedback/Toast';
import type { SalesOrder } from '../../types/api.types';

export const OrderList: React.FC = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [customer, setCustomer] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load customers for filter list
  const { data: customerRes } = useCustomers({ limit: 100 });
  const customersList = customerRes?.data || [];

  const { data: ordersRes, isLoading } = useOrders({
    page,
    limit,
    search,
    status,
    customer,
    sortBy,
    sortOrder,
  });

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const getStatusBadge = (orderStatus: string) => {
    const statusMap: Record<string, 'success' | 'warning' | 'info' | 'error' | 'default'> = {
      Pending: 'warning',
      Confirmed: 'info',
      Processing: 'info',
      Shipped: 'info',
      Delivered: 'success',
      Cancelled: 'error',
    };
    return <Badge variant={statusMap[orderStatus] || 'default'}>{orderStatus}</Badge>;
  };

  const handleExportCSV = () => {
    if (!ordersRes?.data) return;
    const headers = ['Order Number', 'Customer', 'Company', 'Subtotal', 'Tax', 'Discount', 'Total', 'Status', 'Created By', 'Date'];
    const rows = ordersRes.data.map((o) => [
      o.orderNumber,
      typeof o.customer === 'object' ? o.customer.name : 'Unknown',
      typeof o.customer === 'object' ? o.customer.company : '',
      o.subtotal.toString(),
      o.tax.toString(),
      o.discount.toString(),
      o.total.toString(),
      o.status,
      typeof o.createdBy === 'object' ? o.createdBy.name : 'System',
      new Date(o.createdAt).toLocaleDateString(),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `erp_orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('CSV export started!');
  };

  const columns: Column<SalesOrder>[] = [
    {
      header: 'Order #',
      key: 'orderNumber',
      sortable: true,
      accessor: (row) => <span className="font-semibold text-blue-600 font-mono">{row.orderNumber}</span>,
    },
    {
      header: 'Customer',
      key: 'customerName',
      accessor: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">
            {typeof row.customer === 'object' ? row.customer.name : 'Unknown'}
          </span>
          <span className="text-xs text-gray-400">
            {typeof row.customer === 'object' ? row.customer.company : ''}
          </span>
        </div>
      ),
    },
    {
      header: 'Items Count',
      key: 'itemsCount',
      accessor: (row) => row.items.reduce((acc, item) => acc + item.quantity, 0),
    },
    {
      header: 'Total Order Value',
      key: 'total',
      sortable: true,
      accessor: (row) => formatCurrency(row.total),
    },
    {
      header: 'Status',
      key: 'status',
      sortable: true,
      accessor: (row) => getStatusBadge(row.status),
    },
    {
      header: 'Created By',
      key: 'createdBy',
      accessor: (row) => (typeof row.createdBy === 'object' ? row.createdBy.name : 'System'),
    },
    {
      header: 'Order Date',
      key: 'createdAt',
      sortable: true,
      accessor: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      header: 'Actions',
      key: 'actions',
      accessor: (row) => (
        <Link
          to={`/orders/${row._id}`}
          className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-blue-600 transition-colors inline-flex"
          title="View Details"
        >
          <Eye className="h-4 w-4" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Sales Order Registry</h1>
          <p className="text-sm text-gray-500">Track business sales, order fulfillment, status workflows and totals</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExportCSV}>
            <FileDown className="h-4 w-4 mr-2" /> Export CSV
          </Button>
          <Button onClick={() => navigate('/orders/new')}>
            <Plus className="h-4 w-4 mr-2" /> Create Sales Order
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative col-span-2">
          <Input
            placeholder="Search by Order number (e.g. SO-1001) or customer name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
        <div>
          <Select
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Confirmed', label: 'Confirmed' },
              { value: 'Processing', label: 'Processing' },
              { value: 'Shipped', label: 'Shipped' },
              { value: 'Delivered', label: 'Delivered' },
              { value: 'Cancelled', label: 'Cancelled' },
            ]}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div>
          <Select
            options={[
              { value: '', label: 'All Customers' },
              ...customersList.map((c) => ({ value: c._id, label: c.name })),
            ]}
            value={customer}
            onChange={(e) => {
              setCustomer(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={ordersRes?.data || []}
        loading={isLoading}
        emptyMessage="No sales orders match your criteria. Add a new sales order to get started."
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        pagination={ordersRes?.pagination}
        onPageChange={setPage}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
      />
    </div>
  );
};

export default OrderList;
