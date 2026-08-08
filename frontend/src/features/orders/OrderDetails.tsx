import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useOrder, useUpdateOrderStatus } from '../../hooks/useOrders';
import { useAuth } from '../../app/providers/AuthProvider';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import {
  ArrowLeft,
  Calendar,
  User,
  Building,
  FileText,
  Clock,
  Printer,
  ChevronRight,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { triggerToast } from '../../components/feedback/Toast';

export const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [targetedStatus, setTargetedStatus] = React.useState<string | null>(null);

  const { data: orderRes, isLoading } = useOrder(id || '');
  const order = orderRes?.data;
  const statusMutation = useUpdateOrderStatus(id || '');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const handleStatusChange = async (newStatus: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled') => {
    setTargetedStatus(newStatus);
    try {
      await statusMutation.mutateAsync(newStatus);
      triggerToast(`Order status updated to ${newStatus}!`);
    } catch (err) {
      
    } finally {
      setTargetedStatus(null);
    }
  };

  
  const handlePrintInvoice = () => {
    if (!order) return;

    const customerInfo = typeof order.customer === 'object' ? order.customer : null;
    const creatorInfo = typeof order.createdBy === 'object' ? order.createdBy : null;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      triggerToast('Popup blocked! Please enable popups to download/print invoices.', 'error');
      return;
    }

    const html = `
      <html>
        <head>
          <title>Invoice - ${order.orderNumber}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 40px; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
            .title { font-size: 28px; text-transform: uppercase; color: #111; text-align: right; }
            .meta-section { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .meta-col { width: 45%; }
            .meta-col h3 { font-size: 14px; text-transform: uppercase; color: #999; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            .meta-col p { margin: 4px 0; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th { background-color: #f9fafb; text-align: left; padding: 12px; font-size: 12px; text-transform: uppercase; color: #666; border-bottom: 2px solid #eee; }
            td { padding: 12px; font-size: 14px; border-bottom: 1px solid #eee; }
            .text-right { text-align: right; }
            .totals-container { display: flex; justify-content: flex-end; }
            .totals-table { width: 300px; margin-bottom: 0; }
            .totals-table td { border-bottom: none; padding: 8px 12px; }
            .totals-table tr.grand-total td { font-weight: bold; font-size: 16px; border-top: 2px solid #eee; padding-top: 12px; color: #2563eb; }
            .footer { text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; margin-top: 60px; }
            @media print {
              body { margin: 20px; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">ERP Sales Management</div>
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Corporate Headquarters</p>
            </div>
            <div>
              <div class="title">Invoice</div>
              <p style="margin: 5px 0 0 0; font-size: 14px; text-align: right;">Invoice #: <b>${order.orderNumber}</b></p>
              <p style="margin: 3px 0 0 0; font-size: 12px; text-align: right; color: #666;">Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div class="meta-section">
            <div class="meta-col">
              <h3>Billed To</h3>
              <p><b>${customerInfo?.name || 'Walk-in Customer'}</b></p>
              <p>${customerInfo?.company || ''}</p>
              <p>${customerInfo?.address || ''}</p>
              <p>${customerInfo?.city || ''}, ${customerInfo?.country || ''}</p>
              <p>${customerInfo?.phone || ''}</p>
              <p>${customerInfo?.email || ''}</p>
            </div>
            <div class="meta-col">
              <h3>Order Details</h3>
              <p><b>Status:</b> ${order.status}</p>
              <p><b>Payment Terms:</b> Net 30</p>
              <p><b>Created By:</b> ${creatorInfo?.name || 'System'}</p>
              <p><b>Reference:</b> ${order._id}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Product Description</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
                .map(
                  (item) => `
                <tr>
                  <td>
                    <b>${typeof item.product === 'object' ? item.product.name : 'Product'}</b>
                    <br/><span style="font-size: 11px; color:#888;">SKU: ${typeof item.product === 'object' ? item.product.sku : ''}</span>
                  </td>
                  <td class="text-right">${item.quantity}</td>
                  <td class="text-right">${formatCurrency(item.unitPrice)}</td>
                  <td class="text-right">${formatCurrency(item.total)}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          <div class="totals-container">
            <table class="totals-table">
              <tr>
                <td>Subtotal:</td>
                <td class="text-right">${formatCurrency(order.subtotal)}</td>
              </tr>
              <tr>
                <td>Sales Tax (10%):</td>
                <td class="text-right">${formatCurrency(order.tax)}</td>
              </tr>
              ${
                order.discount > 0
                  ? `<tr>
                <td>Discount:</td>
                <td class="text-right" style="color: #dc2626;">-${formatCurrency(order.discount)}</td>
              </tr>`
                  : ''
              }
              <tr class="grand-total">
                <td>Total:</td>
                <td class="text-right">${formatCurrency(order.total)}</td>
              </tr>
            </table>
          </div>

          ${
            order.notes
              ? `<div style="margin-top: 40px; font-size: 13px; border-left: 3px solid #eee; padding-left: 15px; color: #666;">
            <b>Fulfillment Notes:</b><br/>${order.notes}
          </div>`
              : ''
          }

          <div class="footer">
            Thank you for your business! If you have any questions, please contact billing@erp.com
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const getStatusStepClass = (stepName: string) => {
    if (!order) return '';
    const statuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
    const currentIdx = statuses.indexOf(order.status);
    const stepIdx = statuses.indexOf(stepName);

    if (order.status === 'Cancelled') {
      return 'text-rose-600 bg-rose-50 border-rose-200';
    }

    if (stepIdx === -1) return '';

    if (stepIdx < currentIdx) {
      return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    } else if (stepIdx === currentIdx) {
      return 'text-blue-700 bg-blue-50 border-blue-200 font-bold';
    } else {
      return 'text-gray-400 bg-gray-50 border-gray-150';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        <div className="h-32 bg-white rounded-xl border" />
        <div className="h-80 bg-white rounded-xl border" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
        <p className="text-gray-500">Order record not found.</p>
        <Button className="mt-4" onClick={() => navigate('/orders')}>
          Back to Registry
        </Button>
      </div>
    );
  }

  const customer = typeof order.customer === 'object' ? order.customer : null;
  const creator = typeof order.createdBy === 'object' ? order.createdBy : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/orders')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h1 className="text-xl font-bold text-gray-900 font-mono">Order {order.orderNumber}</h1>
          <Badge
            variant={
              order.status === 'Delivered'
                ? 'success'
                : order.status === 'Cancelled'
                ? 'error'
                : 'warning'
            }
          >
            {order.status}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handlePrintInvoice}>
            <Printer className="h-4 w-4 mr-2" /> Download / Print Invoice
          </Button>
        </div>
      </div>

      {}
      <div className="bg-white p-6 rounded-xl border border-gray-150 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" /> Order Fulfillment Status
        </h3>

        {order.status === 'Cancelled' ? (
          <div className="flex items-center gap-2 text-rose-600 bg-rose-50/50 p-4 border border-rose-100 rounded-lg">
            <XCircle className="h-5 w-5" />
            <span className="text-sm font-semibold">This sales order has been Cancelled.</span>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0 pt-2">
            {['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'].map((step, idx) => (
              <React.Fragment key={step}>
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs ${getStatusStepClass(
                    step
                  )}`}
                >
                  <CheckCircle className="h-4 w-4" /> {step}
                </div>
                {idx < 4 && <ChevronRight className="hidden md:block h-4 w-4 text-gray-300" />}
              </React.Fragment>
            ))}
          </div>
        )}

        {}
        {hasRole(['Admin', 'Sales Manager', 'Sales Representative']) && order.status !== 'Cancelled' && order.status !== 'Delivered' && (
          <div className="border-t border-gray-100 pt-4 flex flex-wrap gap-2.5 items-center">
            <span className="text-xs text-gray-500 font-medium">Update Status:</span>
             {order.status === 'Pending' && (
              <Button size="sm" onClick={() => handleStatusChange('Confirmed')} loading={statusMutation.isPending && targetedStatus === 'Confirmed'}>
                Confirm Order
              </Button>
            )}
            {order.status === 'Confirmed' && (
              <Button size="sm" onClick={() => handleStatusChange('Processing')} loading={statusMutation.isPending && targetedStatus === 'Processing'}>
                Start Processing
              </Button>
            )}
            {order.status === 'Processing' && (
              <Button size="sm" onClick={() => handleStatusChange('Shipped')} loading={statusMutation.isPending && targetedStatus === 'Shipped'}>
                Ship Order
              </Button>
            )}
            {order.status === 'Shipped' && (
              <Button size="sm" onClick={() => handleStatusChange('Delivered')} loading={statusMutation.isPending && targetedStatus === 'Delivered'}>
                Complete Delivery
              </Button>
            )}
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleStatusChange('Cancelled')}
              loading={statusMutation.isPending && targetedStatus === 'Cancelled'}
            >
              Cancel Order
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {}
        <div className="md:col-span-2 space-y-6">
          {}
          <div className="bg-white rounded-xl border border-gray-150 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/10">
              <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400" /> Products Purchased
              </h3>
            </div>
            <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
              <thead className="bg-gray-50/75 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-3">Product Name</th>
                  <th className="px-6 py-3 text-right">Quantity</th>
                  <th className="px-6 py-3 text-right">Unit Price</th>
                  <th className="px-6 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {typeof item.product === 'object' ? item.product.name : 'Unknown Product'}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">
                          SKU: {typeof item.product === 'object' ? item.product.sku : ''}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-700">{item.quantity}</td>
                    <td className="px-6 py-4 text-right text-gray-600">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {order.notes && (
            <div className="bg-white p-6 rounded-xl border border-gray-150 shadow-sm space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Order Notes / Memo</h4>
              <p className="text-sm text-gray-600 italic bg-gray-50 p-4 border border-gray-100 rounded-lg">
                "{order.notes}"
              </p>
            </div>
          )}
        </div>

        {}
        <div className="space-y-6">
          {}
          <div className="bg-white p-6 rounded-xl border border-gray-150 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Building className="h-4.5 w-4.5 text-gray-400" /> Customer Information
            </h3>
            {customer ? (
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-bold text-gray-900">{customer.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{customer.company}</p>
                </div>
                <div className="border-t border-gray-100 pt-3 space-y-2 text-gray-600">
                  <p>Email: {customer.email}</p>
                  <p>Phone: {customer.phone}</p>
                  <p className="leading-relaxed">
                    Address: {customer.address}, {customer.city}, {customer.country}
                  </p>
                </div>
                <Link
                  to={`/customers/${customer._id}`}
                  className="block text-center text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50/50 hover:bg-blue-50 py-2 rounded border border-blue-100 transition-colors mt-2"
                >
                  View Customer Profile
                </Link>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No customer details resolved.</p>
            )}
          </div>

          {}
          <div className="bg-white p-6 rounded-xl border border-gray-150 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Payment Summary
            </h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-medium text-gray-800">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Sales Tax (10%)</span>
                <span className="font-medium text-gray-800">{formatCurrency(order.tax)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>Discount</span>
                  <span className="font-semibold text-rose-600">-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-base font-bold text-gray-900 border-t border-gray-100 pt-3">
                <span>Grand Total</span>
                <span className="text-blue-600 text-lg">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {}
          <div className="bg-white p-6 rounded-xl border border-gray-150 shadow-sm space-y-3 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              <span>Created By: {creator?.name || 'System'} ({creator?.role || ''})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>Date: {new Date(order.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
