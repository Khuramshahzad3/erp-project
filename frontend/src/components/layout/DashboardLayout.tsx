import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  User
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      roles: ['Admin', 'Sales Manager', 'Sales Representative'],
    },
    {
      label: 'Customers',
      icon: Users,
      path: '/customers',
      roles: ['Admin', 'Sales Manager', 'Sales Representative'],
    },
    {
      label: 'Products',
      icon: Package,
      path: '/products',
      roles: ['Admin', 'Sales Manager', 'Sales Representative'],
    },
    {
      label: 'Sales Orders',
      icon: ShoppingBag,
      path: '/orders',
      roles: ['Admin', 'Sales Manager', 'Sales Representative'],
    },
    {
      label: 'Audit Logs',
      icon: ShieldCheck,
      path: '/audit-logs',
      roles: ['Admin'],
    },
  ];

  
  const allowedMenuItems = menuItems.filter((item) =>
    hasRole(item.roles as any)
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50/50 text-gray-900 overflow-hidden">
      {}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-gray-900/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-white border-r border-gray-100 transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {}
        <div className="flex h-16 items-center justify-between px-6 border-b border-gray-100 bg-gray-50/10">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20">
              EP
            </div>
            <span className="text-md font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ERP Sales Management
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1 hover:bg-gray-100 lg:hidden"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {}
        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
          {allowedMenuItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-sm shadow-blue-500/5'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {}
        <div className="border-t border-gray-100 p-4 bg-gray-50/10">
          <div className="flex items-center gap-3 px-2 py-1.5 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100">
              <User className="h-4.5 w-4.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.name || 'Anonymous User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.role || 'Guest'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors focus:outline-none"
          >
            <LogOut className="h-4.5 w-4.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {}
      <div className="flex flex-1 flex-col overflow-hidden">
        {}
        <header className="flex h-16 items-center justify-between border-b border-gray-100 bg-white px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-1.5 hover:bg-gray-100 lg:hidden focus:outline-none"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
            <h2 className="text-base font-semibold text-gray-800">
              {location.pathname === '/dashboard' && 'Overview Dashboard'}
              {location.pathname.startsWith('/customers') && 'Customer Database'}
              {location.pathname.startsWith('/products') && 'Products & Inventory'}
              {location.pathname.startsWith('/orders') && 'Sales Order Management'}
              {location.pathname.startsWith('/audit-logs') && 'System Audit Trail'}
            </h2>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
            <span>Date: {new Date().toLocaleDateString()}</span>
          </div>
        </header>

        {}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50/20">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
