import React, { useState, useEffect } from 'react';
import { Users, Search, Eye, RotateCcw, UserX, UserCheck, UserPlus, Trash2, RefreshCw, Edit3, AlertTriangle, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({});
  
  // New modal states for admin features
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [replaceFormData, setReplaceFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    idNumber: '',
    role: ''
  });
  const [updateFormData, setUpdateFormData] = useState({});

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [currentPage, selectedRole, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(selectedRole !== 'all' && { role: selectedRole }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await api.get(`/admin/users?${params}`);
      setUsers(response.data.users);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error('Fetch users error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/users/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, {
        isActive: !currentStatus
      });
      
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
      fetchStats();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const resetUserPassword = async (userId, userEmail) => {
    if (!window.confirm('Are you sure you want to reset this user\'s password?')) {
      return;
    }

    try {
      const response = await api.post(`/admin/users/${userId}/reset-password`);
      
      if (!userEmail) {
        toast.success(`Password reset! New password: ${response.data.newPassword}`, {
          duration: 10000
        });
      } else {
        toast.success('Password reset! New password sent via email.');
      }
      
      fetchUsers();
    } catch (error) {
      toast.error('Failed to reset password');
    }
  };

  // 🗑️ Delete User Permanently
  const deleteUserPermanently = async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}/permanent`);
      toast.success('User deleted permanently with all data cleanup');
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  // 🔄 Replace User (Transfer Ownership)
  const replaceUser = async (oldUserId, newUserData) => {
    try {
      const response = await api.post(`/admin/users/${oldUserId}/replace`, newUserData);
      toast.success(`User replaced successfully! New user: ${response.data.newUser.firstName} ${response.data.newUser.lastName}`);
      setShowReplaceModal(false);
      setSelectedUser(null);
      setReplaceFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        idNumber: '',
        role: ''
      });
      fetchUsers();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to replace user');
    }
  };

  // 📝 Universal Update User
  const updateUserUniversal = async (userId, updateData) => {
    try {
      await api.put(`/admin/users/${userId}/universal`, updateData);
      toast.success('User updated successfully');
      setShowUpdateModal(false);
      setSelectedUser(null);
      setUpdateFormData({});
      fetchUsers();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  // Modal handlers
  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const openReplaceModal = (user) => {
    setSelectedUser(user);
    setReplaceFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      idNumber: '',
      role: user.role // Keep same role by default
    });
    setShowReplaceModal(true);
  };

  const openUpdateModal = (user) => {
    setSelectedUser(user);
    setUpdateFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      idNumber: user.idNumber,
      role: user.role
    });
    setShowUpdateModal(true);
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      Admin: 'bg-purple-100 text-purple-800',
      DIA: 'bg-blue-100 text-blue-800',
      DA: 'bg-green-100 text-green-800',
      EA: 'bg-yellow-100 text-yellow-800',
      FA: 'bg-orange-100 text-orange-800',
      Irrigator: 'bg-indigo-100 text-indigo-800',
      Farmer: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Users className="h-6 w-6 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        </div>
        <div className="text-sm text-gray-600">
          Showing all users registered by any admin
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
          <p className="text-2xl font-bold text-green-600">{stats.activeUsers || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Inactive Users</h3>
          <p className="text-2xl font-bold text-red-600">{stats.inactiveUsers || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Recent (7 days)</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.recentUsers || 0}</p>
        </div>
      </div>

      {/* Admin Registration Stats */}
      {stats.adminStats && stats.adminStats.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Users Registered by Admin</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.adminStats.map((admin, index) => (
              <div key={admin._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{admin.adminName}</p>
                  <p className="text-xs text-gray-500">{admin.adminEmail}</p>
                </div>
                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  <UserPlus className="h-3 w-3 mr-1" />
                  {admin.usersRegistered}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Users
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="DIA">DIA</option>
              <option value="DA">DA</option>
              <option value="EA">EA</option>
              <option value="FA">FA</option>
              <option value="Irrigator">Irrigator</option>
              <option value="Farmer">Farmer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedRole !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'No users have been registered yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {user.idNumber || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-400">
                          Registered: {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email || 'No email'}</div>
                      <div className="text-sm text-gray-500">{user.phoneNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.registeredBy 
                          ? `${user.registeredBy.firstName} ${user.registeredBy.lastName}`
                          : 'System'
                        }
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.registeredBy?.role || 'Auto-registered'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => toggleUserStatus(user._id, user.isActive)}
                          className={`inline-flex items-center px-2 py-1 text-xs rounded ${
                            user.isActive
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {user.isActive ? <UserX className="h-3 w-3 mr-1" /> : <UserCheck className="h-3 w-3 mr-1" />}
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        
                        <button
                          onClick={() => resetUserPassword(user._id, user.email)}
                          className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Reset Password
                        </button>

                        {/* New Admin Features */}
                        <button
                          onClick={() => openUpdateModal(user)}
                          className="inline-flex items-center px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                          title="Universal Update - Edit any field"
                        >
                          <Edit3 className="h-3 w-3 mr-1" />
                          Update User
                        </button>

                        <button
                          onClick={() => openReplaceModal(user)}
                          className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                          title="Replace User - Transfer ownership to new user"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Replace User
                        </button>

                        <button
                          onClick={() => openDeleteModal(user)}
                          className="inline-flex items-center px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                          title="Delete Permanently - Remove user and cleanup all data"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete Forever
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between">
              <button
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              
              <span className="relative inline-flex items-center px-4 py-2 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete User Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Delete User Permanently</h3>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Are you sure you want to permanently delete:
              </p>
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="font-medium text-red-900">
                  {selectedUser.firstName} {selectedUser.lastName}
                </p>
                <p className="text-sm text-red-700">{selectedUser.email}</p>
                <p className="text-sm text-red-700">Role: {selectedUser.role}</p>
              </div>
              
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Warning:</strong> This action will:
                </p>
                <ul className="text-xs text-yellow-700 mt-1 list-disc list-inside">
                  <li>Permanently delete the user account</li>
                  <li>Remove all associated data ownership</li>
                  <li>Clean up references from tanks, canals, schedules</li>
                  <li>This action cannot be undone</li>
                </ul>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteUserPermanently(selectedUser._id)}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Replace User Modal */}
      {showReplaceModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center mb-4">
              <RefreshCw className="h-6 w-6 text-purple-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Replace User</h3>
            </div>
            
            <div className="mb-4">
              <div className="bg-purple-50 border border-purple-200 rounded p-3 mb-4">
                <p className="text-sm text-purple-800">
                  <strong>Replacing:</strong> {selectedUser.firstName} {selectedUser.lastName} ({selectedUser.role})
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  All ownership will be transferred to the new user
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={replaceFormData.firstName}
                    onChange={(e) => setReplaceFormData({...replaceFormData, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={replaceFormData.lastName}
                    onChange={(e) => setReplaceFormData({...replaceFormData, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={replaceFormData.email}
                  onChange={(e) => setReplaceFormData({...replaceFormData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={replaceFormData.phoneNumber}
                    onChange={(e) => setReplaceFormData({...replaceFormData, phoneNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Number
                  </label>
                  <input
                    type="text"
                    value={replaceFormData.idNumber}
                    onChange={(e) => setReplaceFormData({...replaceFormData, idNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  value={replaceFormData.role}
                  onChange={(e) => setReplaceFormData({...replaceFormData, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="Admin">Admin</option>
                  <option value="DIA">DIA</option>
                  <option value="DA">DA</option>
                  <option value="EA">EA</option>
                  <option value="FA">FA</option>
                  <option value="Irrigator">Irrigator</option>
                  <option value="Farmer">Farmer</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowReplaceModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => replaceUser(selectedUser._id, replaceFormData)}
                disabled={!replaceFormData.firstName || !replaceFormData.lastName || !replaceFormData.phoneNumber || !replaceFormData.role}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                Replace User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update User Modal */}
      {showUpdateModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center mb-4">
              <Edit3 className="h-6 w-6 text-yellow-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Update User</h3>
            </div>
            
            <div className="mb-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Updating:</strong> {selectedUser.firstName} {selectedUser.lastName}
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  You can update any field for any role
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={updateFormData.firstName || ''}
                    onChange={(e) => setUpdateFormData({...updateFormData, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={updateFormData.lastName || ''}
                    onChange={(e) => setUpdateFormData({...updateFormData, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={updateFormData.email || ''}
                  onChange={(e) => setUpdateFormData({...updateFormData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={updateFormData.phoneNumber || ''}
                    onChange={(e) => setUpdateFormData({...updateFormData, phoneNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Number
                  </label>
                  <input
                    type="text"
                    value={updateFormData.idNumber || ''}
                    onChange={(e) => setUpdateFormData({...updateFormData, idNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={updateFormData.role || ''}
                  onChange={(e) => setUpdateFormData({...updateFormData, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="">Select Role</option>
                  <option value="Admin">Admin</option>
                  <option value="DIA">DIA</option>
                  <option value="DA">DA</option>
                  <option value="EA">EA</option>
                  <option value="FA">FA</option>
                  <option value="Irrigator">Irrigator</option>
                  <option value="Farmer">Farmer</option>
                </select>
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="flex items-center mb-2">
                  <Shield className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-800">Universal Update Features</span>
                </div>
                <ul className="text-xs text-blue-700 list-disc list-inside">
                  <li>Update any field for any role</li>
                  <li>Role change validation with business rules</li>
                  <li>Comprehensive field validation</li>
                  <li>Changes are applied immediately</li>
                </ul>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => updateUserUniversal(selectedUser._id, updateFormData)}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700"
              >
                Update User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;