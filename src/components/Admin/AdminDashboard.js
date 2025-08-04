import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Activity, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch user statistics
      const statsResponse = await api.get('/admin/users/stats');
      setStats(statsResponse.data);

      // Fetch recent users
      const usersResponse = await api.get('/admin/users?limit=5');
      setRecentUsers(usersResponse.data.users);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage users and monitor system activity</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          to="/admin/register-user"
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all"
        >
          <div className="flex items-center">
            <UserPlus className="h-8 w-8 mr-4" />
            <div>
              <h3 className="text-xl font-bold">Register New User</h3>
              <p className="text-blue-100">Add DIA, DA, EA, FA, Irrigator, or Farmer</p>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/users"
          className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg hover:from-green-600 hover:to-green-700 transition-all"
        >
          <div className="flex items-center">
            <Users className="h-8 w-8 mr-4" />
            <div>
              <h3 className="text-xl font-bold">Manage Users</h3>
              <p className="text-green-100">View, search, and manage all users</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeUsers || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">New This Week</p>
              <p className="text-2xl font-bold text-gray-900">{stats.recentUsers || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inactive Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inactiveUsers || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Role Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Users by Role</h3>
          <div className="space-y-3">
            {stats.roleStats?.map((role) => (
              <div key={role._id} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">{role._id}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-900">{role.count}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(role.count / stats.totalUsers) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Registrations</h3>
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div key={user._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user.email || user.phoneNumber}</p>
                </div>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {user.role}
                </span>
              </div>
            ))}
          </div>
          <Link
            to="/admin/users"
            className="block mt-4 text-sm text-blue-600 hover:text-blue-500"
          >
            View all users →
          </Link>
        </div>
      </div>

      {/* Admin Capabilities */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Admin Capabilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">User Management:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Register users from all roles (DIA, DA, EA, FA, Irrigator, Farmer)</li>
              <li>• Send default passwords via email</li>
              <li>• Force password change on first login</li>
              <li>• Activate/deactivate user accounts</li>
              <li>• Reset user passwords</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">System Access:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• View all user and water data</li>
              <li>• Monitor system activity</li>
              <li>• Generate user reports</li>
              <li>• Manage system settings</li>
              <li>• Cannot edit field-level water data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;