import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

// Pages lazy/direct imports
import Login from '../../features/auth/Login';
import Dashboard from '../../features/dashboard/Dashboard';
import CustomerList from '../../features/customers/CustomerList';
import CustomerDetails from '../../features/customers/CustomerDetails';
import CustomerForm from '../../features/customers/CustomerForm';
import ProductList from '../../features/products/ProductList';
import ProductForm from '../../features/products/ProductForm';
import OrderList from '../../features/orders/OrderList';
import OrderDetails from '../../features/orders/OrderDetails';
import OrderForm from '../../features/orders/OrderForm';
import AuditLogList from '../../features/auditLogs/AuditLogList';
import DashboardLayout from '../../components/layout/DashboardLayout';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const RoleProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles: ('Admin' | 'Sales Manager' | 'Sales Representative')[];
}> = ({ children, allowedRoles }) => {
  const { user, loading, hasRole } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user || !hasRole(allowedRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* Customer routes */}
        <Route path="customers" element={<CustomerList />} />
        <Route
          path="customers/new"
          element={
            <RoleProtectedRoute allowedRoles={['Admin', 'Sales Manager', 'Sales Representative']}>
              <CustomerForm />
            </RoleProtectedRoute>
          }
        />
        <Route path="customers/:id" element={<CustomerDetails />} />
        <Route
          path="customers/:id/edit"
          element={
            <RoleProtectedRoute allowedRoles={['Admin', 'Sales Manager', 'Sales Representative']}>
              <CustomerForm />
            </RoleProtectedRoute>
          }
        />

        {/* Product routes */}
        <Route path="products" element={<ProductList />} />
        <Route
          path="products/new"
          element={
            <RoleProtectedRoute allowedRoles={['Admin', 'Sales Manager', 'Sales Representative']}>
              <ProductForm />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="products/:id/edit"
          element={
            <RoleProtectedRoute allowedRoles={['Admin', 'Sales Manager', 'Sales Representative']}>
              <ProductForm />
            </RoleProtectedRoute>
          }
        />

        {/* Order routes */}
        <Route path="orders" element={<OrderList />} />
        <Route
          path="orders/new"
          element={
            <RoleProtectedRoute allowedRoles={['Admin', 'Sales Manager', 'Sales Representative']}>
              <OrderForm />
            </RoleProtectedRoute>
          }
        />
        <Route path="orders/:id" element={<OrderDetails />} />
        <Route
          path="orders/:id/edit"
          element={
            <RoleProtectedRoute allowedRoles={['Admin', 'Sales Manager', 'Sales Representative']}>
              <OrderForm />
            </RoleProtectedRoute>
          }
        />

        {/* Audit Logs route (Admin only) */}
        <Route
          path="audit-logs"
          element={
            <RoleProtectedRoute allowedRoles={['Admin']}>
              <AuditLogList />
            </RoleProtectedRoute>
          }
        />

        {/* Catch-all redirection */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
