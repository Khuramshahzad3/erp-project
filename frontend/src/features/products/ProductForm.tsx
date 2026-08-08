import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProduct, useCreateProduct, useUpdateProduct } from '../../hooks/useProducts';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { triggerToast } from '../../components/feedback/Toast';
import { ArrowLeft } from 'lucide-react';

const productFormSchema = z.object({
  name: z.string().min(1, 'Product name is required').trim(),
  sku: z.string().min(1, 'SKU code is required').uppercase().trim(),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required').trim(),
  price: z.coerce.number().min(0, 'Price must be non-negative'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  lowStockThreshold: z.coerce.number().int().min(0, 'Low Stock Threshold cannot be negative').default(5),
  status: z.enum(['Active', 'Inactive']).default('Active'),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export const ProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { data: detailRes, isLoading: fetchLoading } = useProduct(id || '');

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct(id || '');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema) as any,
    defaultValues: {
      name: '',
      sku: '',
      description: '',
      category: 'Laptops',
      price: 0,
      stock: 0,
      lowStockThreshold: 5,
      status: 'Active',
    },
  });

  useEffect(() => {
    if (isEditMode && detailRes?.data) {
      reset(detailRes.data as any);
    }
  }, [isEditMode, detailRes, reset]);

  const onSubmit = async (data: ProductFormValues) => {
    try {
      if (isEditMode) {
        await updateMutation.mutateAsync(data);
        triggerToast('Product updated successfully!');
      } else {
        await createMutation.mutateAsync(data);
        triggerToast('Product created successfully!');
      }
      navigate('/products');
    } catch (err) {
      // API errors handled by axios interceptor
    }
  };

  if (isEditMode && fetchLoading) {
    return (
      <div className="flex h-64 items-center justify-center animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/products')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <h1 className="text-xl font-bold text-gray-900">
          {isEditMode ? 'Edit Product Details' : 'Add New Product'}
        </h1>
      </div>

      {/* Form Container */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-xl border border-gray-150 shadow-sm space-y-6"
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Input
            label="Product Name"
            placeholder="Lenovo ThinkPad L14"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="SKU Code"
            placeholder="LAP-THINKL14"
            error={errors.sku?.message}
            disabled={isEditMode} // Usually SKU codes shouldn't change
            {...register('sku')}
          />

          <div>
            <Select
              label="Category"
              options={[
                { value: 'Laptops', label: 'Laptops' },
                { value: 'Monitors', label: 'Monitors' },
                { value: 'Keyboards', label: 'Keyboards' },
                { value: 'Mice', label: 'Mice' },
                { value: 'Networking', label: 'Networking' },
                { value: 'Storage', label: 'Storage' },
                { value: 'Audio', label: 'Audio' },
                { value: 'Accessories', label: 'Accessories' },
                { value: 'Furniture', label: 'Furniture' },
              ]}
              error={errors.category?.message}
              {...register('category')}
            />
          </div>

          <Input
            label="Unit Price ($)"
            type="number"
            step="0.01"
            placeholder="999.99"
            error={errors.price?.message}
            {...register('price')}
          />

          <Input
            label="Current Stock Quantity"
            type="number"
            placeholder="50"
            error={errors.stock?.message}
            {...register('stock')}
          />

          <Input
            label="Low Stock Warning Threshold"
            type="number"
            placeholder="5"
            error={errors.lowStockThreshold?.message}
            {...register('lowStockThreshold')}
          />

          <div>
            <Select
              label="Status"
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
              ]}
              error={errors.status?.message}
              {...register('status')}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Product Description
            </label>
            <textarea
              placeholder="Provide a detailed description of the product and packaging..."
              rows={3}
              className={`block w-full rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-rose-300 focus:ring-rose-500' : 'border-gray-300'
              }`}
              {...register('description')}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-6">
          <Button variant="secondary" onClick={() => navigate('/products')} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEditMode ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
