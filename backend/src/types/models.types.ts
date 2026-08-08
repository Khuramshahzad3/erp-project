import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'Admin' | 'Sales Manager' | 'Sales Representative';
  isActive: boolean;
  comparePassword: (password: string) => Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICustomer extends Document {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  city: string;
  country: string;
  status: 'Active' | 'Inactive';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProduct extends Document {
  name: string;
  sku: string;
  description?: string;
  category: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  status: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderItem {
  product: Types.ObjectId | any;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ISalesOrder extends Document {
  orderNumber: string;
  customer: Types.ObjectId | any;
  items: IOrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  notes?: string;
  createdBy: Types.ObjectId | any;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuditLog extends Document {
  user: Types.ObjectId | any;
  action: string;
  entity: 'User' | 'Customer' | 'Product' | 'SalesOrder' | 'Auth';
  entityId?: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}
