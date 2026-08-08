import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../app/providers/AuthProvider';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AlertCircle } from 'lucide-react';
import { triggerToast } from '../../components/feedback/Toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSelectCredentials = (email: string, pass: string) => {
    setValue('email', email);
    setValue('password', pass);
  };

  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  const onSubmit = async (data: LoginFormValues) => {
    setErrorMsg(null);
    try {
      await login(data);
      triggerToast('Logged in successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid credentials. Please try again.');
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/50">
        <div>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xl shadow-md shadow-blue-500/20">
            EP
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-gray-900">
            ERP Sales Management
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Sign in to manage customers, orders and inventory
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-rose-50 text-rose-800 text-sm border border-rose-100">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="admin@erp.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 select-none">
                Remember me
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="show-password"
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="show-password" 
                className="ml-2 block text-sm text-gray-600 select-none">
                Show password
              </label>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
            Sign In
          </Button>
        </form>

        <div className="border-t border-gray-100 pt-6">
          <p className="text-xs text-center text-gray-400 font-medium mb-3">Quick Demo Login (Click to Autofill):</p>
          <div className="grid grid-cols-3 gap-2.5 text-center font-sans">
            <div
              onClick={() => handleSelectCredentials('admin@erp.com', 'admin123')}
              className="bg-blue-50/20 hover:bg-blue-50 cursor-pointer p-2.5 rounded-lg border border-blue-100/50 hover:border-blue-200 transition-all flex flex-col items-center justify-center gap-0.5"
            >
              <span className="font-bold text-[11px] text-blue-700">Admin</span>
              <span className="text-[9px] text-gray-500 font-mono">admin@erp.com</span>
              <span className="text-[9px] text-gray-400">admin123</span>
            </div>
            <div
              onClick={() => handleSelectCredentials('manager@erp.com', 'manager123')}
              className="bg-indigo-50/20 hover:bg-indigo-50 cursor-pointer p-2.5 rounded-lg border border-indigo-100/50 hover:border-indigo-200 transition-all flex flex-col items-center justify-center gap-0.5"
            >
              <span className="font-bold text-[11px] text-indigo-700">Manager</span>
              <span className="text-[9px] text-gray-500 font-mono">manager@erp.com</span>
              <span className="text-[9px] text-gray-400">manager123</span>
            </div>
            <div
              onClick={() => handleSelectCredentials('rep@erp.com', 'rep123')}
              className="bg-sky-50/20 hover:bg-sky-50 cursor-pointer p-2.5 rounded-lg border border-sky-100/50 hover:border-sky-200 transition-all flex flex-col items-center justify-center gap-0.5"
            >
              <span className="font-bold text-[11px] text-sky-700">Rep</span>
              <span className="text-[9px] text-gray-500 font-mono">rep@erp.com</span>
              <span className="text-[9px] text-gray-400">rep123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
