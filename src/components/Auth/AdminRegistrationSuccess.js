import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Mail, Clock, Droplets } from 'lucide-react';

const AdminRegistrationSuccess = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-600 mb-6">
            <Droplets className="h-6 w-6 text-white" />
          </div>
          
          <div className="mb-6">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Registration Submitted!
            </h2>
            <p className="text-gray-600">
              Your administrator registration has been successfully submitted.
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3">Next Steps:</h3>
            <div className="space-y-3 text-sm text-blue-800">
              <div className="flex items-start">
                <Mail className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium">Check Your Email</p>
                  <p>Click the verification link we sent to your email address</p>
                </div>
              </div>
              <div className="flex items-start">
                <Clock className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium">Wait for Approval</p>
                  <p>Existing administrators will review your registration</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> You must verify your email first, then wait for admin approval before you can access the system.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              to="/login"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 inline-block text-center"
            >
              Go to Login Page
            </Link>
            <Link
              to="/admin-register"
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 inline-block text-center"
            >
              Register Another Admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRegistrationSuccess;