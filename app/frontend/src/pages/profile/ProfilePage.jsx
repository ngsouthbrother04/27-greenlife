import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/stores';
import authService from '@/api/authService';
import { Loader2, Save, User } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

// Schema Validation
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email(), // Read-only but good to validate structure
  address: z.string().min(5, 'Address must be at least 5 characters').optional().or(z.literal('')),
});

const ProfilePage = () => {
  const { user, updateUser } = useAuthStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      address: user?.address || '',
    },
  });

  // Mutation for update profile
  const updateProfileMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (data, variables) => {
      // Update local store
      updateUser({
        name: variables.name,
        address: variables.address
      });
      alert('Profile updated successfully!');
    },
    onError: (error) => {
      console.error(error);
      alert('Failed to update profile.');
    },
  });

  const onSubmit = (data) => {
    updateProfileMutation.mutate(data);
  };

  return (
    <div className="container-custom py-12 px-4 lg:px-[130px]">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-['Poppins'] font-bold text-[#1D364D] mb-8 flex items-center gap-3">
          <User className="w-8 h-8 text-[#405741]" />
          Edit Profile
        </h1>

        <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email (Read Only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                {...register('email')}
                disabled
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-500 cursor-not-allowed focus:outline-none"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                {...register('name')}
                className={`w-full px-4 py-3 rounded-lg bg-white border outline-none transition-all ${
                  errors.name 
                    ? 'border-red-500 focus:ring-2 focus:ring-red-100' 
                    : 'border-gray-200 focus:border-[#405741] focus:ring-2 focus:ring-[#405741]/10'
                }`}
                placeholder="Enter your full name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                {...register('address')}
                rows="3"
                className={`w-full px-4 py-3 rounded-lg bg-white border outline-none transition-all ${
                  errors.address 
                    ? 'border-red-500 focus:ring-2 focus:ring-red-100' 
                    : 'border-gray-200 focus:border-[#405741] focus:ring-2 focus:ring-[#405741]/10'
                }`}
                placeholder="Enter your shipping address"
              />
              {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>}
            </div>

            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="w-full sm:w-auto px-8 bg-[#405741] text-white font-semibold py-3 rounded-lg hover:bg-[#2d3e2e] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
