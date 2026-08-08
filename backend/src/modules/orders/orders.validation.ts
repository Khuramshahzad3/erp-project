import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    customer: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid customer ID'),
    items: z
      .array(
        z.object({
          product: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
          quantity: z.number().int().min(1, 'Quantity must be at least 1'),
        })
      )
      .min(1, 'Order must contain at least one item'),
    discount: z.number().min(0, 'Discount cannot be negative').default(0),
    notes: z.string().optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']),
  }),
});
