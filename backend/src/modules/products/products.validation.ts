import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').trim(),
    sku: z.string().min(1, 'SKU is required').uppercase().trim(),
    description: z.string().optional(),
    category: z.string().min(1, 'Category is required').trim(),
    price: z.number().min(0, 'Price must be non-negative'),
    stock: z.number().int().min(0, 'Stock must be non-negative'),
    lowStockThreshold: z.number().int().min(0, 'Low Stock Threshold must be non-negative').default(5),
    status: z.enum(['Active', 'Inactive']).default('Active'),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').trim().optional(),
    sku: z.string().min(1, 'SKU is required').uppercase().trim().optional(),
    description: z.string().optional(),
    category: z.string().min(1, 'Category is required').trim().optional(),
    price: z.number().min(0, 'Price must be non-negative').optional(),
    stock: z.number().int().min(0, 'Stock must be non-negative').optional(),
    lowStockThreshold: z.number().int().min(0, 'Low Stock Threshold must be non-negative').optional(),
    status: z.enum(['Active', 'Inactive']).optional(),
  }),
});
