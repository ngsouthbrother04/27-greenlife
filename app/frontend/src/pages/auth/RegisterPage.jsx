import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/stores';
import authService from '@/api/authService';

// Validation Schema
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
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
    resolver: zodResolver(registerSchema),
  });

  // Register Mutation
  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (response) => {
      // Auto login after register
      const { user, token } = response.data;
      setUser(user, token);
      navigate('/');
    },
    onError: (error) => {
      console.error('Registration failed:', error);
    }
  });

  const onSubmit = (data) => {
    // API usually expects { name, email, password }
    const { confirmPassword, ...payload } = data;
    registerMutation.mutate(payload);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="heading-3 text-[#121216]">Create Account</h1>
        <p className="paragraph-2 text-[#8590a2] mt-2">
          Join GreenLife today and start your eco-journey
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Global Error */}
        {registerMutation.isError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {registerMutation.error?.response?.data?.message || 'Registration failed. Please try again.'}
          </div>
        )}

        {/* Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#121216]">Full Name</label>
          <input
            {...register('name')}
            type="text"
            placeholder="John Doe"
            className={`w-full p-3 rounded-lg border ${errors.name ? 'border-red-500' : 'border-[#dcdfe4]'} focus:outline-none focus:border-[#405741] transition-colors`}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

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
              placeholder="Create a password"
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

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#121216]">Confirm Password</label>
          <input
            {...register('confirmPassword')}
            type="password"
            placeholder="Confirm your password"
            className={`w-full p-3 rounded-lg border ${errors.confirmPassword ? 'border-red-500' : 'border-[#dcdfe4]'} focus:outline-none focus:border-[#405741] transition-colors`}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full bg-[#405741] text-white font-semibold py-3 rounded-lg hover:bg-[#2d3e2e] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating account...
            </>
          ) : (
            'Sign Up'
          )}
        </button>

        {/* Login Link */}
        <div className="text-center text-sm text-[#8590a2]">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-[#405741] font-medium hover:underline inline-flex items-center gap-1">
            Sign In <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
