import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  Droplets, 
  Navigation, 
  Building, 
  MapPin, 
  Calendar,
  Activity,
  User,
  Trash2
} from 'lucide-react';

// Mock auth context for demonstration
const useAuth = () => ({
  user: {
    firstName: 'John',
    lastName: 'Doe',
    role: 'EA', // Change this to test different roles: 'EA', 'DIA', 'DA', 'Admin', 'Farmer', 'FA', 'Irrigator'
    isFirstLogin: false
  }
});

const TankDetailsPage = () => {
  const { tankId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tank, setTank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingDetails, setEditingDetails] = useState(false);
  const [editingAvailability, setEditingAvailability] = useState(false);
  const [editDetailsData, setEditDetailsData] = useState({});
  const [editAvailabilityData, setEditAvailabilityData] = useState(0);

  // Determine user permissions
  const canUpdateAvailability = ['DIA', 'DA', 'EA'].includes(user?.role);
  const canUpdateAllDetails = user?.role === 'EA';
  const canDeleteTanks = ['Admin', 'EA'].includes(user?.role);
  const canAddTanks = user?.role === 'EA';

  useEffect(() => {
    fetchTankDetails();
  }, [tankId]);

  const fetchTankDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/ea/tanks/${tankId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tank details');
      }

      const data = await response.json();
      
      // Transform backend data
      const tankData = data.data || data;
      const transformedTank = {
        id: tankData._id || tankData.id,
        name: tankData.name,
        range: tankData.range,
        division: tankData.division,
        scheme: tankData.scheme,
        fullCapacity: tankData.fullCapacity,
        availabilityCapacity: tankData.availabilityCapacity,
        availabilityPercentage: tankData.availabilityPercentage || Math.round((tankData.availabilityCapacity / tankData.fullCapacity) * 100),
        status: tankData.status || 'active',
        lastUpdateDate: tankData.lastUpdateDate || tankData.updatedAt || new Date().toISOString(),
        createdBy: tankData.createdBy,
        lastUpdatedBy: tankData.lastUpdatedBy,
        availabilityHistory: tankData.availabilityHistory || []
      };

      setTank(transformedTank);
      setEditDetailsData(transformedTank);
      setEditAvailabilityData(transformedTank.availabilityCapacity);
    } catch (error) {
      console.error('Failed to fetch tank details:', error);
      // You might want to show an error message or redirect
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAvailability = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/ea/tanks/${tankId}/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ availabilityCapacity: parseInt(editAvailabilityData) })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update availability');
      }

      const data = await response.json();
      
      // Update local state
      setTank(prevTank => ({
        ...prevTank,
        availabilityCapacity: data.data.availabilityCapacity,
        availabilityPercentage: data.data.availabilityPercentage,
        lastUpdateDate: data.data.lastUpdateDate || data.data.updatedAt,
        lastUpdatedBy: data.data.lastUpdatedBy || {
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      }));
      
      setEditingAvailability(false);
      alert('Availability capacity updated successfully');
    } catch (error) {
      console.error('Failed to update availability:', error);
      alert(`Failed to update availability: ${error.message}`);
    }
  };

  const handleUpdateTankDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/ea/tanks/${tankId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editDetailsData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update tank');
      }

      const data = await response.json();
      
      // Update local state
      setTank(prevTank => ({
        ...prevTank,
        ...editDetailsData,
        availabilityPercentage: data.data.availabilityPercentage || Math.round((editDetailsData.availabilityCapacity / editDetailsData.fullCapacity) * 100),
        lastUpdateDate: data.data.lastUpdateDate || data.data.updatedAt,
        lastUpdatedBy: data.data.lastUpdatedBy || {
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      }));
      
      setEditingDetails(false);
      alert('Tank details updated successfully');
    } catch (error) {
      console.error('Failed to update tank details:', error);
      alert(`Failed to update tank: ${error.message}`);
    }
  };

  const handleDeleteTank = async () => {
    if (!confirm(`Are you sure you want to delete tank "${tank.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/ea/tanks/${tankId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete tank');
      }

      alert('Tank deleted successfully');
      navigate('/tanks'); // Navigate back to tank management
    } catch (error) {
      console.error('Failed to delete tank:', error);
      alert(`Failed to delete tank: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading tank details...</span>
      </div>
    );
  }

  if (!tank) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Tank Not Found</h2>
          <p className="text-red-600 mb-4">The requested tank could not be found.</p>
          <button
            onClick={() => navigate('/tanks')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Tank Management
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/tanks')}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{tank.name}</h1>
            <p className="text-gray-600">Tank Details & Management</p>
          </div>
        </div>
        
      </div>

      {/* Tank Information Card */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-900">Tank Information</h2>
            <span className={`px-3 py-1 text-sm rounded-full ${
              tank.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {tank.status?.charAt(0).toUpperCase() + tank.status?.slice(1)}
            </span>
          </div>
          
          <div className="flex space-x-2">
            {/* {canUpdateAllDetails && !editingDetails && !editingAvailability && (
              <button
                onClick={() => setEditingDetails(true)}
                className="flex items-center px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit Details
              </button>
            )}
            {canUpdateAvailability && !editingDetails && !editingAvailability && (
              <button
                onClick={() => setEditingAvailability(true)}
                className="flex items-center px-3 py-2 text-gray-600 hover:text-green-600 transition-colors"
              >
                <Droplets className="h-4 w-4 mr-1" />
                Update Availability
              </button>
            )} */}
          </div>
        </div>

        {/* Availability Level Indicator */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Availability Level</span>
            <span>{tank.availabilityPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all duration-300 ${
                tank.availabilityPercentage > 70 ? 'bg-green-500' :
                tank.availabilityPercentage > 40 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${tank.availabilityPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Tank Details */}
        {editingDetails ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name of Reservoir</label>
                <input
                  type="text"
                  value={editDetailsData.name}
                  onChange={(e) => setEditDetailsData({...editDetailsData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Range</label>
                <input
                  type="text"
                  value={editDetailsData.range}
                  onChange={(e) => setEditDetailsData({...editDetailsData, range: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                <input
                  type="text"
                  value={editDetailsData.division}
                  onChange={(e) => setEditDetailsData({...editDetailsData, division: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scheme</label>
                <input
                  type="text"
                  value={editDetailsData.scheme}
                  onChange={(e) => setEditDetailsData({...editDetailsData, scheme: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Capacity</label>
                <input
                  type="number"
                  value={editDetailsData.fullCapacity}
                  onChange={(e) => setEditDetailsData({...editDetailsData, fullCapacity: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                <input
                  type="number"
                  value={editDetailsData.availabilityCapacity}
                  onChange={(e) => setEditDetailsData({...editDetailsData, availabilityCapacity: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={editDetailsData.status}
                onChange={(e) => setEditDetailsData({...editDetailsData, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleUpdateTankDetails}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Save className="h-4 w-4 mr-1" />
                Save Changes
              </button>
              <button
                onClick={() => {
                  setEditingDetails(false);
                  setEditDetailsData(tank);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : editingAvailability ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Availability Capacity (Max: {tank.fullCapacity})
              </label>
              <input
                type="number"
                value={editAvailabilityData}
                max={tank.fullCapacity}
                min="0"
                onChange={(e) => setEditAvailabilityData(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Percentage: {Math.round((editAvailabilityData / tank.fullCapacity) * 100)}%
              </p>
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleUpdateAvailability}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Save className="h-4 w-4 mr-1" />
                Update Availability
              </button>
              <button
                onClick={() => {
                  setEditingAvailability(false);
                  setEditAvailabilityData(tank.availabilityCapacity);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center text-gray-700">
                <Navigation className="h-5 w-5 mr-3" />
                <div>
                  <span className="font-medium">Range:</span>
                  <span className="ml-2">{tank.range}</span>
                </div>
              </div>
              <div className="flex items-center text-gray-700">
                <Building className="h-5 w-5 mr-3" />
                <div>
                  <span className="font-medium">Division:</span>
                  <span className="ml-2">{tank.division}</span>
                </div>
              </div>
              <div className="flex items-center text-gray-700">
                <MapPin className="h-5 w-5 mr-3" />
                <div>
                  <span className="font-medium">Scheme:</span>
                  <span className="ml-2">{tank.scheme}</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center text-gray-700">
                <Droplets className="h-5 w-5 mr-3" />
                <div>
                  <span className="font-medium">Capacity:</span>
                  <span className="ml-2">{tank.availabilityCapacity} / {tank.fullCapacity}</span>
                </div>
              </div>
              <div className="flex items-center text-gray-700">
                <Activity className="h-5 w-5 mr-3" />
                <div>
                  <span className="font-medium">Status:</span>
                  <span className="ml-2 capitalize">{tank.status}</span>
                </div>
              </div>
              <div className="flex items-center text-gray-700">
                <Calendar className="h-5 w-5 mr-3" />
                <div>
                  <span className="font-medium">Last Updated:</span>
                  <span className="ml-2">{new Date(tank.lastUpdateDate).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Created By */}
        {tank.createdBy && (
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Created By
            </h3>
            <div className="text-sm text-gray-600">
              <p>{tank.createdBy.firstName} {tank.createdBy.lastName}</p>
              <p className="text-xs">Role: {tank.createdBy.role}</p>
            </div>
          </div>
        )}

        {/* Last Updated By */}
        {tank.lastUpdatedBy && (
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Last Updated By
            </h3>
            <div className="text-sm text-gray-600">
              <p>{tank.lastUpdatedBy.firstName} {tank.lastUpdatedBy.lastName}</p>
              <p className="text-xs">Role: {tank.lastUpdatedBy.role}</p>
            </div>
          </div>
        )}
      </div>

      {/* Availability History */}
      {tank.availabilityHistory && tank.availabilityHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            Availability History
          </h3>
          <div className="space-y-3">
            {tank.availabilityHistory.slice(-5).reverse().map((history, index) => (
              <div key={history._id || index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <span className="text-sm font-medium">{history.capacity} ({history.percentage}%)</span>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(history.updatedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TankDetailsPage;
