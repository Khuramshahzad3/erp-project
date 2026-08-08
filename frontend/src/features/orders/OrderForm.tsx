import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateOrder } from '../../hooks/useOrders';
import { useCustomers } from '../../hooks/useCustomers';
import { useProducts } from '../../hooks/useProducts';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import { triggerToast } from '../../components/feedback/Toast';
import { ArrowLeft, Plus, Trash2, AlertCircle } from 'lucide-react';
import type { Product } from '../../types/api.types';

interface SelectedItem {
  product: Product;
  quantity: number;
}

export const OrderForm: React.FC = () => {
  const navigate = useNavigate();
  
  
  const createMutation = useCreateOrder();
  const { data: customerRes } = useCustomers({ limit: 100, status: 'Active' });
  const { data: productRes } = useProducts({ limit: 100, status: 'Active' });

  const activeCustomers = customerRes?.data || [];
  const activeProducts = productRes?.data || [];

  
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [items, setItems] = useState<SelectedItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  
  const [tempProductId, setTempProductId] = useState('');
  const [tempQuantity, setTempQuantity] = useState<number>(1);
  const [stockError, setStockError] = useState<string | null>(null);

  
  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.product.price, 0);
  const taxRate = 0.1; 
  const tax = Math.round(subtotal * taxRate * 100) / 100;
  const total = Math.max(0, subtotal + tax - discount);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const handleAddItem = () => {
    setStockError(null);
    if (!tempProductId) {
      triggerToast('Please select a product first.', 'warning');
      return;
    }

    const product = activeProducts.find((p) => p._id === tempProductId);
    if (!product) return;

    
    const existingIndex = items.findIndex((i) => i.product._id === tempProductId);
    const existingQty = existingIndex !== -1 ? items[existingIndex].quantity : 0;
    const newQty = existingQty + tempQuantity;

    
    if (product.stock < newQty) {
      setStockError(
        `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${newQty}`
      );
      return;
    }

    if (existingIndex !== -1) {
      const updated = [...items];
      updated[existingIndex].quantity = newQty;
      setItems(updated);
    } else {
      setItems([...items, { product, quantity: tempQuantity }]);
    }

    
    setTempProductId('');
    setTempQuantity(1);
    setStockError(null);
  };

  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const handleQtyChange = (index: number, newQty: number) => {
    setStockError(null);
    if (newQty < 1) return;

    const item = items[index];
    if (item.product.stock < newQty) {
      triggerToast(
        `Insufficient stock for ${item.product.name}. Available: ${item.product.stock}`,
        'warning'
      );
      return;
    }

    const updated = [...items];
    updated[index].quantity = newQty;
    setItems(updated);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomerId) {
      triggerToast('Please select a customer.', 'warning');
      return;
    }

    if (items.length === 0) {
      triggerToast('Please add at least one product to the order.', 'warning');
      return;
    }

    const orderData = {
      customer: selectedCustomerId,
      items: items.map((i) => ({
        product: i.product._id,
        quantity: i.quantity,
      })),
      discount,
      notes,
    };

    try {
      await createMutation.mutateAsync(orderData);
      triggerToast('Sales Order created successfully!');
      navigate('/orders');
    } catch (err) {
      
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/orders')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <h1 className="text-xl font-bold text-gray-900">Create Sales Order</h1>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {}
        <div className="lg:col-span-2 space-y-6">
          {}
          <div className="bg-white p-6 rounded-xl border border-gray-150 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
              1. Customer Selection
            </h3>
            <Select
              label="Select Active Customer"
              options={[
                { value: '', label: '-- Select Customer --' },
                ...activeCustomers.map((c) => ({
                  value: c._id,
                  label: `${c.name} (${c.company})`,
                })),
              ]}
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              required
            />
          </div>

          {}
          <div className="bg-white p-6 rounded-xl border border-gray-150 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
              2. Add Products
            </h3>

            {stockError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 text-rose-800 text-xs border border-rose-100">
                <AlertCircle className="h-4.5 w-4.5 text-rose-600 shrink-0" />
                <span className="font-semibold">{stockError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 items-end">
              <div className="sm:col-span-2">
                <Select
                  label="Product"
                  options={[
                    { value: '', label: '-- Select Product --' },
                    ...activeProducts.map((p) => ({
                      value: p._id,
                      label: `${p.name} (SKU: ${p.sku}) - $${p.price} [Stock: ${p.stock}]`,
                    })),
                  ]}
                  value={tempProductId}
                  onChange={(e) => {
                    setTempProductId(e.target.value);
                    setStockError(null);
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Input
                  label="Quantity"
                  type="number"
                  min={1}
                  value={tempQuantity}
                  onChange={(e) => setTempQuantity(Number(e.target.value))}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0 h-10 mb-0.5"
                  onClick={handleAddItem}
                >
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
            </div>

            {}
            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                Items in Order
              </h4>
              {items.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-gray-200 rounded-lg text-sm text-gray-400">
                  No products added yet. Add a product above.
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gray-50 border border-gray-150 rounded-lg"
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-500 font-mono">SKU: {item.product.sku}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">Qty:</span>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => handleQtyChange(idx, Number(e.target.value))}
                            className="w-14 rounded border border-gray-200 px-2 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-800 w-20 text-right">
                          {formatCurrency(item.quantity * item.product.price)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 hover:bg-rose-50 rounded text-gray-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-150 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
              3. Order Summary
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-medium text-gray-800">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Sales Tax (10%)</span>
                <span className="font-medium text-gray-800">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-500 border-b border-gray-100 pb-3">
                <span>Discount ($)</span>
                <input
                  type="number"
                  min={0}
                  max={subtotal + tax}
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-20 rounded border border-gray-200 px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-3">
                <span>Grand Total</span>
                <span className="text-blue-600">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Fulfillment Notes
              </label>
              <textarea
                placeholder="E.g. ship to front desk, delivery instructions..."
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-4"
              size="lg"
              loading={createMutation.isPending}
            >
              Submit Order
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;
