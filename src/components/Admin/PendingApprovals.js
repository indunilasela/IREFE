import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Eye, User, Building, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const PendingApprovals = () => {
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchPendingAdmins();
  }, []);

  const fetchPendingAdmins = async () => {
    try {
      const response = await api.get('/public/pending-admins');
      setPendingAdmins(response.data);
    } catch (error) {
      toast.error('Failed to fetch pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (adminId) => {
    setActionLoading(adminId);
    try {
      await api.post(`/public/approve-admin/${adminId}`, {});
      toast.success('Administrator approved successfully');
      fetchPendingAdmins();
    } catch (error) {
      toast.error('Failed to approve administrator');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (adminId) => {
    setActionLoading(adminId);
    try {
      await api.post(`/public/reject-admin/${adminId}`, {
        rejectionReason
      });
      toast.success('Administrator registration rejected');
      setSelectedAdmin(null);
      setRejectionReason('');
      fetchPendingAdmins();
    } catch (error) {
      toast.error('Failed to reject administrator');
    } finally {
      setActionLoading(null);
    }
  };

  const getAdminLevelColor = (level) => {
    switch (level) {
      case 'SuperAdmin': return 'bg-purple-100 text-purple-800';
      case 'RegionalAdmin': return 'bg-blue-100 text-blue-800';
      case 'TankAdmin': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pending Administrator Approvals</h1>
        <p className="text-gray-600">Review and approve new administrator registrations</p>
      </div>

      {pendingAdmins.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Approvals</h3>
          <p className="text-gray-600">All administrator registrations have been reviewed.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingAdmins.map((admin) => (
            <div key={admin._id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {admin.firstName} {admin.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{admin.email}</p>
                    </div>
                    <span className={`ml-4 px-3 py-1 rounded-full text-xs font-medium ${getAdminLevelColor(admin.adminLevel)}`}>
                      {admin.adminLevel}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Building className="h-4 w-4 mr-2" />
                      <div>
                        <p className="font-medium">Organization</p>
                        <p>{admin.organizationName}</p>
                      </div>
                    </div>
                    
                    {admin.assignedRegion && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <div>
                          <p className="font-medium">Region</p>
                          <p>{admin.assignedRegion}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <div>
                        <p className="font-medium">Registered</p>
                        <p>{new Date(admin.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Registration Reason:</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {admin.registrationReason}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(admin._id)}
                      disabled={actionLoading === admin._id}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {actionLoading === admin._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Approve
                    </button>
                    
                    <button
                      onClick={() => setSelectedAdmin(admin)}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </button>
                    
                    <button
                      onClick={() => setSelectedAdmin(admin)}
                      className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Reject Administrator Registration
            </h3>
            
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to reject <strong>{selectedAdmin.firstName} {selectedAdmin.lastName}</strong>'s registration?
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason (Optional)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Provide a reason for rejection..."
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => handleReject(selectedAdmin._id)}
                disabled={actionLoading === selectedAdmin._id}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                {actionLoading === selectedAdmin._id ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Rejecting...
                  </div>
                ) : (
                  'Confirm Rejection'
                )}
              </button>
              
              <button
                onClick={() => {
                  setSelectedAdmin(null);
                  setRejectionReason('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingApprovals;