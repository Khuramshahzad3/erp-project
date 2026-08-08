import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCustomers, useDeleteCustomer } from '../../hooks/useCustomers';
import { useAuth } from '../../app/providers/AuthProvider';
import DataTable, { type Column } from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Plus, Search, FileDown, Eye, Edit, Trash2 } from 'lucide-react';
import { triggerToast } from '../../components/feedback/Toast';
import type { Customer } from '../../types/api.types';

export const CustomerList: React.FC = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  // Search, Sort and Pagination states
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Deletion Confirm Dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState('');

  const { data: customerRes, isLoading } = useCustomers({
    page,
    limit,
    search,
    status,
    sortBy,
    sortOrder,
  });

  const deleteMutation = useDeleteCustomer();

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      triggerToast('Customer deleted successfully!');
      setDeleteId(null);
    } catch (err: any) {
      // Error is already alerted by Axios interceptor, but we still close modal
      setDeleteId(null);
    }
  };

  // CSV Export handler
  const handleExportCSV = () => {
    if (!customerRes?.data) return;
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Address', 'City', 'Country', 'Status', 'Notes'];
    const rows = customerRes.data.map((c) => [
      c.name,
      c.email,
      c.phone,
      c.company,
      c.address,
      c.city,
      c.country,
      c.status,
      c.notes || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `erp_customers_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('CSV export started!');
  };

  // Table Columns config
  const columns: Column<Customer>[] = [
    {
      header: 'Customer Name',
      key: 'name',
      sortable: true,
      accessor: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{row.name}</span>
          <span className="text-xs text-gray-400 font-mono">{row._id.substring(18)}</span>
        </div>
      ),
    },
    {
      header: 'Email Address',
      key: 'email',
      sortable: true,
      accessor: (row) => row.email,
    },
    {
      header: 'Company / Org',
      key: 'company',
      sortable: true,
      accessor: (row) => row.company,
    },
    {
      header: 'Phone',
      key: 'phone',
      accessor: (row) => row.phone,
    },
    {
      header: 'Total Orders',
      key: 'orderCount',
      accessor: (row) => <span className="font-medium text-gray-900">{row.orderCount || 0}</span>,
    },
    {
      header: 'Status',
      key: 'status',
      sortable: true,
      accessor: (row) => (
        <Badge variant={row.status === 'Active' ? 'success' : 'error'}>{row.status}</Badge>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/customers/${row._id}`}
            className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-blue-600 transition-colors"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <Link
            to={`/customers/${row._id}/edit`}
            className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-blue-600 transition-colors"
            title="Edit Details"
          >
            <Edit className="h-4 w-4" />
          </Link>
          {hasRole(['Admin', 'Sales Manager']) && (
            <button
              onClick={() => {
                setDeleteId(row._id);
                setDeleteName(row.name);
              }}
              className="p-1 hover:bg-rose-50 rounded text-gray-400 hover:text-rose-600 transition-colors"
              title="Delete Customer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Customers Database</h1>
          <p className="text-sm text-gray-500">Manage client profiles, contact information and history</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExportCSV}>
            <FileDown className="h-4 w-4 mr-2" /> Export CSV
          </Button>
          <Button onClick={() => navigate('/customers/new')}>
            <Plus className="h-4 w-4 mr-2" /> Add Customer
          </Button>
        </div>
      </div>

      {/* Filters & Search Control */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative col-span-2">
          <Input
            placeholder="Search by name, company, or email..."
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
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={customerRes?.data || []}
        loading={isLoading}
        emptyMessage="No customers found. Try adjusting your filters or add a new customer."
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        pagination={customerRes?.pagination}
        onPageChange={setPage}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Customer Profile?"
        message={`Are you sure you want to permanently delete the profile of ${deleteName}? This action is irreversible.`}
        confirmText="Yes, Delete"
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default CustomerList;
