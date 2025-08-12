import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { UserPlus, Mail, Phone, CreditCard } from 'lucide-react';
import api from '../../services/api';

const USER_ROLES = {
  DIA: 'DIA',
  DA: 'DA',
  EA: 'EA',
  FA: 'FA',
  IRRIGATOR: 'Irrigator',
  FARMER: 'Farmer'
};

const schema = yup.object({
  userType: yup.string().required('User type is required'),
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().when('userType', {
    is: USER_ROLES.FARMER,
    then: (schema) => schema,
    otherwise: (schema) => schema.required('Last name is required')
  }),
  email: yup.string().when('userType', {
    is: USER_ROLES.FARMER,
    then: (schema) => schema.email('Invalid email'),
    otherwise: (schema) => schema.email('Invalid email').required('Email is required')
  }),
  phoneNumber: yup.string().when('userType', {
    is: USER_ROLES.FARMER,
    then: (schema) => schema.required('Phone number is required for farmers'),
    otherwise: (schema) => schema.required('Phone number is required')
  }),
  idNumber: yup.string().when('userType', {
    is: USER_ROLES.FARMER,
    then: (schema) => schema,
    otherwise: (schema) => schema.required('ID number is required')
  })
});

const UserRegistration = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });

  const selectedUserType = watch('userType');
  const isFarmer = selectedUserType === USER_ROLES.FARMER;

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await api.post('/admin/register-user', data);
      
      toast.success(`${data.userType} registered successfully!`);
      
      // Show default password if no email provided
      if (!data.email && response.data.defaultPassword) {
        toast.success(`Default password: ${response.data.defaultPassword}`, {
          duration: 10000
        });
      }
      
      reset();
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleDescription = (role) => {
    const descriptions = {
      DIA: 'Divisional Irrigation Assistant',
      DA: 'Divisional Agrarian Officer',
      EA: 'Engineering Assistant',
      FA: 'Field Assistant',
      Irrigator: 'Irrigator',
      Farmer: 'Farmer'
    };
    return descriptions[role] || role;
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <UserPlus className="h-6 w-6 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Register New User</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* User Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Type *
            </label>
            <select
              {...register('userType')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.userType ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select user type</option>
              <option value={USER_ROLES.DIA}>DIA - Divisional Irrigation Assistant</option>
              <option value={USER_ROLES.DA}>DA - Divisional Agrarian Officer</option>
              <option value={USER_ROLES.EA}>EA - Engineering Assistant</option>
              <option value={USER_ROLES.FA}>FA - Field Assistant</option>
              <option value={USER_ROLES.IRRIGATOR}>Irrigator</option>
              <option value={USER_ROLES.FARMER}>Farmer</option>
            </select>
            {errors.userType && (
              <p className="mt-1 text-sm text-red-600">{errors.userType.message}</p>
            )}
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                {...register('firstName')}
                type="text"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.firstName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter first name"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name {!isFarmer && '*'}
              </label>
              <input
                {...register('lastName')}
                type="text"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.lastName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter last name"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <Mail className="h-4 w-4 mr-1" />
                Email {isFarmer ? '(Optional)' : '*'}
              </label>
              <input
                {...register('email')}
                type="email"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
              {isFarmer && (
                <p className="mt-1 text-xs text-gray-500">
                  Email is optional for farmers. If not provided, default password will be shown after registration.
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <Phone className="h-4 w-4 mr-1" />
                Phone Number *
              </label>
              <input
                {...register('phoneNumber')}
                type="tel"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="+94712345678"
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
              )}
            </div>

            {!isFarmer && (
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <CreditCard className="h-4 w-4 mr-1" />
                  ID Number *
                </label>
                <input
                  {...register('idNumber')}
                  type="text"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.idNumber ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter ID number"
                />
                {errors.idNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.idNumber.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Registration Info
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">Registration Information</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• A default password will be generated automatically</li>
              <li>• Password will be sent via email (if email provided)</li>
              <li>• User must change password on first login</li>
              <li>• User will have immediate access after registration</li>
            </ul>
          </div> */}

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Registering...
                </div>
              ) : (
                'Register User'
              )}
            </button>
            
            <button
              type="button"
              onClick={() => reset()}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Clear Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserRegistration;