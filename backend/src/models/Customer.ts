import { Schema, model } from 'mongoose';
import { ICustomer } from '../types/models.types';

const customerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true, trim: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
      index: true,
    },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);


customerSchema.index({ name: 'text', company: 'text', email: 'text' });

export const Customer = model<ICustomer>('Customer', customerSchema);
export default Customer;
