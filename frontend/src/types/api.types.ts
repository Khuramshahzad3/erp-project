export interface UserProfile {
  id: string;
  email: string;
  role: 'Admin' | 'Sales Manager' | 'Sales Representative';
  name: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: UserProfile;
  };
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  city: string;
  country: string;
  status: 'Active' | 'Inactive';
  notes?: string;
  orderCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerStats {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: string | null;
}

export interface CustomerDetailResponse {
  success: boolean;
  data: {
    customer: Customer;
    stats: CustomerStats;
    orders: SalesOrder[];
  };
}

export interface Product {
  _id: string;
  name: string;
  sku: string;
  description?: string;
  category: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  _id?: string;
  product: string | Product;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface SalesOrder {
  _id: string;
  orderNumber: string;
  customer: string | Customer;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  notes?: string;
  createdBy: string | UserProfile;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  _id: string;
  user?: UserProfile;
  action: string;
  entity: 'User' | 'Customer' | 'Product' | 'SalesOrder' | 'Auth';
  entityId?: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface DashboardStats {
  totalCustomers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
}

export interface SalesTrendItem {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface TopProductItem {
  name: string;
  sku: string;
  quantitySold: number;
  revenueGenerated: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface APIListResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

export interface APISingleResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
