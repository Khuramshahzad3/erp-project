import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useProducts, useDeleteProduct } from '../../hooks/useProducts';
import { useAuth } from '../../app/providers/AuthProvider';
import DataTable, { type Column } from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Plus, Search, FileDown, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { triggerToast } from '../../components/feedback/Toast';
import type { Product } from '../../types/api.types';

export const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState('');

  const { data: productRes, isLoading } = useProducts({
    page,
    limit,
    search,
    category,
    status,
    sortBy,
    sortOrder,
  });

  const deleteMutation = useDeleteProduct();

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
      triggerToast('Product deleted successfully!');
      setDeleteId(null);
    } catch (err: any) {
      setDeleteId(null);
    }
  };

  const handleExportCSV = () => {
    if (!productRes?.data) return;
    const headers = ['SKU', 'Name', 'Category', 'Price', 'Stock', 'Low Stock Threshold', 'Status', 'Description'];
    const rows = productRes.data.map((p) => [
      p.sku,
      p.name,
      p.category,
      p.price.toString(),
      p.stock.toString(),
      p.lowStockThreshold.toString(),
      p.status,
      p.description || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `erp_inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('CSV export started!');
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const columns: Column<Product>[] = [
    {
      header: 'SKU Code',
      key: 'sku',
      sortable: true,
      accessor: (row) => <span className="font-mono font-semibold text-gray-900">{row.sku}</span>,
    },
    {
      header: 'Product Name',
      key: 'name',
      sortable: true,
      accessor: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{row.name}</span>
          {row.description && <span className="text-xs text-gray-400 truncate max-w-xs">{row.description}</span>}
        </div>
      ),
    },
    {
      header: 'Category',
      key: 'category',
      sortable: true,
      accessor: (row) => row.category,
    },
    {
      header: 'Unit Price',
      key: 'price',
      sortable: true,
      accessor: (row) => formatCurrency(row.price),
    },
    {
      header: 'Stock Level',
      key: 'stock',
      sortable: true,
      accessor: (row) => {
        const isLowStock = row.stock <= row.lowStockThreshold;
        return (
          <div className="flex items-center gap-1.5">
            <span className={`font-semibold ${isLowStock ? 'text-rose-600' : 'text-gray-900'}`}>
              {row.stock}
            </span>
            {isLowStock && (
              <Badge variant="error" className="flex items-center gap-0.5 ml-1">
                <AlertTriangle className="h-3 w-3 shrink-0" /> Low Stock
              </Badge>
            )}
          </div>
        );
      },
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
          {hasRole(['Admin', 'Sales Manager', 'Sales Representative']) ? (
            <>
              <Link
                to={`/products/${row._id}/edit`}
                className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-blue-600 transition-colors"
                title="Edit Product"
              >
                <Edit className="h-4 w-4" />
              </Link>
              <button
                onClick={() => {
                  setDeleteId(row._id);
                  setDeleteName(row.name);
                }}
                className="p-1 hover:bg-rose-50 rounded text-gray-400 hover:text-rose-600 transition-colors"
                title="Delete Product"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          ) : (
            <span className="text-xs text-gray-400 italic">Read-only</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Products & Inventory</h1>
          <p className="text-sm text-gray-500">View and update stock levels, prices and SKU descriptions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExportCSV}>
            <FileDown className="h-4 w-4 mr-2" /> Export CSV
          </Button>
          {hasRole(['Admin', 'Sales Manager', 'Sales Representative']) && (
            <Button onClick={() => navigate('/products/new')}>
              <Plus className="h-4 w-4 mr-2" /> Add Product
            </Button>
          )}
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative col-span-2">
          <Input
            placeholder="Search products by SKU or Name..."
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
              { value: '', label: 'All Categories' },
              { value: 'Laptops', label: 'Laptops' },
              { value: 'Monitors', label: 'Monitors' },
              { value: 'Keyboards', label: 'Keyboards' },
              { value: 'Mice', label: 'Mice' },
              { value: 'Networking', label: 'Networking' },
              { value: 'Storage', label: 'Storage' },
              { value: 'Audio', label: 'Audio' },
              { value: 'Accessories', label: 'Accessories' },
              { value: 'Furniture', label: 'Furniture' },
            ]}
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          />
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

      {}
      <DataTable
        columns={columns}
        data={productRes?.data || []}
        loading={isLoading}
        emptyMessage="No products match your filter search."
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        pagination={productRes?.pagination}
        onPageChange={setPage}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
      />

      {}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Remove Product?"
        message={`Are you sure you want to permanently delete the catalog entry for ${deleteName}? This action is irreversible.`}
        confirmText="Yes, Delete"
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default ProductList;
