import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCustomer, useCreateCustomer, useUpdateCustomer } from '../../hooks/useCustomers';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { triggerToast } from '../../components/feedback/Toast';
import { ArrowLeft } from 'lucide-react';

const customerFormSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Please enter a valid email address').trim(),
  phone: z.string().min(1, 'Phone number is required').trim(),
  company: z.string().min(1, 'Company/Organization is required').trim(),
  address: z.string().min(1, 'Address is required').trim(),
  city: z.string().min(1, 'City is required').trim(),
  country: z.string().min(1, 'Country is required').trim(),
  status: z.enum(['Active', 'Inactive']).default('Active'),
  notes: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

export const CustomerForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { data: detailRes, isLoading: fetchLoading } = useCustomer(id || '');

  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer(id || '');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema) as any,
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      address: '',
      city: '',
      country: 'USA',
      status: 'Active',
      notes: '',
    },
  });

  // Prepopulate form on edit
  useEffect(() => {
    if (isEditMode && detailRes?.data?.customer) {
      reset(detailRes.data.customer as any);
    }
  }, [isEditMode, detailRes, reset]);

  const onSubmit = async (data: CustomerFormValues) => {
    try {
      if (isEditMode) {
        await updateMutation.mutateAsync(data);
        triggerToast('Customer updated successfully!');
      } else {
        await createMutation.mutateAsync(data);
        triggerToast('Customer created successfully!');
      }
      navigate('/customers');
    } catch (err) {
      // API errors handled by axios interceptor toast
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
        <Button variant="ghost" size="sm" onClick={() => navigate('/customers')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <h1 className="text-xl font-bold text-gray-900">
          {isEditMode ? 'Edit Customer' : 'Add New Customer'}
        </h1>
      </div>

      {/* Form Container */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-xl border border-gray-150 shadow-sm space-y-6"
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Input
            label="Full Name"
            placeholder="John Doe"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Phone Number"
            placeholder="555-0199"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Input
            label="Company Name"
            placeholder="Acme Corp"
            error={errors.company?.message}
            {...register('company')}
          />

          <div className="sm:col-span-2">
            <Input
              label="Street Address"
              placeholder="123 Main St"
              error={errors.address?.message}
              {...register('address')}
            />
          </div>

          <Input
            label="City"
            placeholder="Seattle"
            error={errors.city?.message}
            {...register('city')}
          />

          <Input
            label="Country"
            placeholder="United States"
            error={errors.country?.message}
            {...register('country')}
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
              Internal Business Notes (Optional)
            </label>
            <textarea
              placeholder="Provide background context about this client relationship..."
              rows={3}
              className={`block w-full rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.notes ? 'border-rose-300 focus:ring-rose-500' : 'border-gray-300'
              }`}
              {...register('notes')}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-6">
          <Button variant="secondary" onClick={() => navigate('/customers')} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEditMode ? 'Save Changes' : 'Create Customer'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;
