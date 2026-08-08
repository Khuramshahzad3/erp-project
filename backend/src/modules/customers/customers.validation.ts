import { z } from 'zod';

export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').trim(),
    email: z.string().email('Please enter a valid email address').trim(),
    phone: z.string().min(1, 'Phone is required').trim(),
    company: z.string().min(1, 'Company name is required').trim(),
    address: z.string().min(1, 'Address is required').trim(),
    city: z.string().min(1, 'City is required').trim(),
    country: z.string().min(1, 'Country is required').trim(),
    status: z.enum(['Active', 'Inactive']).default('Active'),
    notes: z.string().optional(),
  }),
});

export const updateCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').trim().optional(),
    email: z.string().email('Please enter a valid email address').trim().optional(),
    phone: z.string().min(1, 'Phone is required').trim().optional(),
    company: z.string().min(1, 'Company name is required').trim().optional(),
    address: z.string().min(1, 'Address is required').trim().optional(),
    city: z.string().min(1, 'City is required').trim().optional(),
    country: z.string().min(1, 'Country is required').trim().optional(),
    status: z.enum(['Active', 'Inactive']).optional(),
    notes: z.string().optional(),
  }),
});
