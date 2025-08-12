import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const USER_ROLES = {
  DIA: 'DIA',
  DA: 'DA',
  EA: 'EA',
  FA: 'FA',
  IRRIGATOR: 'Irrigator',
  FARMER: 'Farmer',
  EXTERNAL_FARMER: 'ExternalFarmer'
};

const schema = yup.object({
  userType: yup.string().required('User type is required'),
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().when('userType', {
    is: (val) => val !== USER_ROLES.EXTERNAL_FARMER,
    then: (schema) => schema.required('Last name is required'),
    otherwise: (schema) => schema
  }),
  email: yup.string().when('userType', {
    is: (val) => val === USER_ROLES.FARMER,
    then: (schema) => schema.email('Invalid email'),
    otherwise: (schema) => schema.when('userType', {
      is: (val) => val !== USER_ROLES.EXTERNAL_FARMER,
      then: (schema) => schema.email('Invalid email').required('Email is required'),
      otherwise: (schema) => schema.email('Invalid email')
    })
  }),
  phoneNumber: yup.string().when('userType', {
    is: (val) => [USER_ROLES.FARMER, USER_ROLES.EXTERNAL_FARMER].includes(val),
    then: (schema) => schema.required('Phone number is required'),
    otherwise: (schema) => schema
  }),
  idNumber: yup.string().when('userType', {
    is: (val) => val !== USER_ROLES.EXTERNAL_FARMER,
    then: (schema) => schema.required('ID number is required'),
    otherwise: (schema) => schema
  })
});

const Register = () => {
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(schema)
  });

  const selectedUserType = watch('userType');

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      toast.success('User registered successfully!');
      reset();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Register New User</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* User Type */}
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
              <option value={USER_ROLES.DIA}>DIA (Divisional Irrigation Assistant)</option>
              <option value={USER_ROLES.DA}>DA (Divisional Agrarian Officer)</option>
              <option value={USER_ROLES.EA}>EA (Engineering Assistant)</option>
              <option value={USER_ROLES.FA}>FA (Field Assistant)</option>
              <option value={USER_ROLES.IRRIGATOR}>Irrigator</option>
              <option value={USER_ROLES.FARMER}>Farmer</option>
              <option value={USER_ROLES.EXTERNAL_FARMER}>External Farmer</option>
            </select>
            {errors.userType && (
              <p className="mt-1 text-sm text-red-600">{errors.userType.message}</p>
            )}
          </div>

          {/* First Name */}
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

          {/* Last Name */}
          {selectedUserType !== USER_ROLES.EXTERNAL_FARMER && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name {selectedUserType !== USER_ROLES.EXTERNAL_FARMER && '*'}
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
          )}

          {/* Email */}
          {selectedUserType !== USER_ROLES.EXTERNAL_FARMER && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email {selectedUserType === USER_ROLES.FARMER ? '(Optional)' : '*'}
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
            </div>
          )}

          {/* Phone Number */}
          {[USER_ROLES.FARMER, USER_ROLES.EXTERNAL_FARMER].includes(selectedUserType) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                {...register('phoneNumber')}
                type="tel"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter phone number (e.g., +94712345678)"
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
              )}
            </div>
          )}

          {/* ID Number */}
          {selectedUserType && selectedUserType !== USER_ROLES.EXTERNAL_FARMER && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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

          {/* Submit Button */}
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
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;