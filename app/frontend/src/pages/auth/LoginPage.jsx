import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/stores';
import authService from '@/api/authService';

// Validation Schema
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, isAuthenticated } = useAuthStore();
  
  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  // Login Mutation
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (response) => {
      // Assuming response.data contains { user, token } or similar structure
      // Adjust based on actual API response
      console.log('Login Response:', response);
      const { user, accessToken } = response.data;
      console.log('User:', user, 'Token:', accessToken);
      setUser(user, accessToken);
      
      // Redirect to where they came from, or home
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    },
    onError: (error) => {
      console.error('Login failed:', error);
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  });

  const onSubmit = (data) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="heading-3 text-[#121216]">Welcome Back</h1>
        <p className="paragraph-2 text-[#8590a2] mt-2">
          Sign in to access your customized experience
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Global Error */}
        {loginMutation.isError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {loginMutation.error?.response?.data?.message || 'Invalid email or password. Please try again.'}
          </div>
        )}

        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#121216]">Email</label>
          <input
            {...register('email')}
            type="email"
            placeholder="Enter your email"
            className={`w-full p-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-[#dcdfe4]'} focus:outline-none focus:border-[#405741] transition-colors`}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#121216]">Password</label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className={`w-full p-3 rounded-lg border ${errors.password ? 'border-red-500' : 'border-[#dcdfe4]'} focus:outline-none focus:border-[#405741] transition-colors`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded border-gray-300 text-[#405741] focus:ring-[#405741]" />
            <span className="text-[#8590a2]">Remember me</span>
          </label>
          <Link to="/auth/forgot-password" className="text-[#405741] font-medium hover:underline">
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full bg-[#405741] text-white font-semibold py-3 rounded-lg hover:bg-[#2d3e2e] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loginMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>

        {/* Register Link */}
        <div className="text-center text-sm text-[#8590a2]">
          Don't have an account?{' '}
          <Link to="/auth/register" className="text-[#405741] font-medium hover:underline inline-flex items-center gap-1">
            Sign up <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
