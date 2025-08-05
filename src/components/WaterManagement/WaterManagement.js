import React, { useState, useEffect } from 'react';
import { 
  Droplets, 
  Users, 
  Calendar, 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Edit, 
  Save, 
  X, 
  RefreshCw,
  Plus,
  Eye,
  TrendingUp,
  Settings,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';

const WaterManagement = () => {
  // Mock user context - replace with your actual auth context
  const [user] = useState({ 
    role: 'EA', 
    id: '1', 
    firstName: 'John', 
    lastName: 'Doe',
    email: 'john@example.com'
  });

  const [waterData, setWaterData] = useState({
    tanks: [],
    canals: [],
    paddyFields: [],
    schedules: [],
    notifications: []
  });
  const [loading, setLoading] = useState(true);
  const [editingTank, setEditingTank] = useState(null);
  const [updatingLevel, setUpdatingLevel] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // API Base URL
  const API_BASE_URL = 'http://localhost:5000/api';

  // Determine if user can edit data
  const canEdit = ['DIA', 'DA', 'EA', 'FA', 'Irrigator'].includes(user?.role);
  const canCreateTanks = ['EA'].includes(user?.role);
  const canCreateFields = ['EA'].includes(user?.role);
  const isReadOnly = ['Farmer', 'Admin'].includes(user?.role);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
  };

  const getAuthToken = () => {
    // Replace with your actual token retrieval method
    return localStorage.getItem('token') || localStorage.getItem('authToken') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
  };

  useEffect(() => {
    fetchAllWaterData();
  }, []);

  const fetchAllWaterData = async () => {
    setLoading(true);
    await Promise.all([
      fetchTanks(),
      fetchCanals(),
      fetchPaddyFields(),
      fetchSchedules(),
      fetchNotifications()
    ]);
    setLoading(false);
  };

  // Fetch Tanks
  const fetchTanks = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/ea/tanks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const transformedTanks = (data.data.tanks || []).map(tank => ({
            id: tank._id,
            name: tank.name,
            capacity: tank.capacity,
            currentLevel: tank.currentWaterLevel,
            source: tank.waterSourceName || tank.waterSource,
            status: tank.status,
            waterLevelPercentage: tank.waterLevelPercentage,
            location: tank.location,
            lastUpdatedBy: tank.lastUpdatedBy,
            updatedAt: tank.updatedAt
          }));
          
          setWaterData(prev => ({ ...prev, tanks: transformedTanks }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch tanks:', error);
      // Mock fallback data
      setWaterData(prev => ({
        ...prev,
        tanks: [
          { 
            id: '1', 
            name: 'Main Storage Tank', 
            capacity: 75000, 
            currentLevel: 50000, 
            source: 'Mahaweli River',
            status: 'active',
            waterLevelPercentage: 67,
            location: 'Kandy District'
          }
        ]
      }));
    }
  };

  // Fetch Canals
  const fetchCanals = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/ea/canals`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const transformedCanals = (data.data.canals || []).map(canal => ({
            id: canal._id,
            name: canal.name,
            type: canal.type,
            code: canal.canalCode,
            flow: canal.currentFlowRate,
            maxCapacity: canal.maxFlowCapacity,
            status: canal.status,
            utilization: canal.flowUtilization,
            associatedTank: canal.associatedTank
          }));
          
          setWaterData(prev => ({ ...prev, canals: transformedCanals }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch canals:', error);
      // Mock fallback data
      setWaterData(prev => ({
        ...prev,
        canals: [
          { id: '1', name: 'Main Canal', type: 'main', flow: 1500, status: 'active' },
          { id: '2', name: 'Branch Canal 1', type: 'branch', flow: 800, status: 'active' }
        ]
      }));
    }
  };

  // Fetch Paddy Fields
  const fetchPaddyFields = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/ea/paddy-fields`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const transformedFields = (data.data.paddyFields || []).map(field => ({
            id: field._id,
            name: field.name,
            area: field.area,
            areaUnit: field.areaUnit,
            status: field.status,
            soilType: field.soilType,
            associatedTank: field.associatedTank
          }));
          
          setWaterData(prev => ({ ...prev, paddyFields: transformedFields }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch paddy fields:', error);
      // Mock fallback data
      setWaterData(prev => ({
        ...prev,
        paddyFields: [
          { id: '1', name: 'Paddy Field A1', area: 25.5, areaUnit: 'acres', status: 'active' }
        ]
      }));
    }
  };

  // Fetch Water Schedules (placeholder for future implementation)
  const fetchSchedules = async () => {
    try {
      // Future implementation: GET /api/ea/water-schedules
      setWaterData(prev => ({
        ...prev,
        schedules: [
          { id: '1', title: 'Morning Water Distribution', date: '2025-08-05', time: '06:00' },
          { id: '2', title: 'Evening Canal Closure', date: '2025-08-05', time: '18:00' }
        ]
      }));
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    }
  };

  // Fetch Notifications (placeholder for future implementation)
  const fetchNotifications = async () => {
    try {
      // Future implementation: GET /api/notifications
      setWaterData(prev => ({
        ...prev,
        notifications: [
          { 
            id: '1', 
            message: 'Tank water level updated by EA John Doe', 
            time: '2 hours ago', 
            type: 'update' 
          },
          { 
            id: '2', 
            message: 'New canal created: Branch Canal North', 
            time: '4 hours ago', 
            type: 'update' 
          }
        ]
      }));
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  // Update Tank Water Level
  const updateWaterLevel = async (tankId, newLevel, newCapacity = null) => {
    if (!canEdit) {
      showToast('You do not have permission to update water levels', 'error');
      return;
    }

    setUpdatingLevel(true);
    try {
      const token = getAuthToken();
      const requestBody = {
        currentWaterLevel: parseInt(newLevel)
      };
      
      if (newCapacity !== null && newCapacity !== undefined) {
        requestBody.capacity = parseInt(newCapacity);
      }
      
      const response = await fetch(`${API_BASE_URL}/ea/tanks/${tankId}/water-level`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update water level');
      }

      const data = await response.json();
      
      if (data.success) {
        const updatedTank = data.data;
        
        setWaterData(prev => ({
          ...prev,
          tanks: prev.tanks.map(tank => 
            tank.id === tankId 
              ? { 
                  ...tank, 
                  currentLevel: updatedTank.currentWaterLevel,
                  capacity: updatedTank.capacity,
                  waterLevelPercentage: updatedTank.waterLevelPercentage,
                  status: updatedTank.status,
                  lastUpdatedBy: updatedTank.lastUpdatedBy,
                  updatedAt: updatedTank.updatedAt
                }
              : tank
          )
        }));

        showToast('Tank water level updated successfully! 🌊');
        setEditingTank(null);
      }
    } catch (error) {
      console.error('Failed to update water level:', error);
      showToast(`Failed to update water level: ${error.message}`, 'error');
    } finally {
      setUpdatingLevel(false);
    }
  };

  // Create New Tank
  const createTank = async (tankData) => {
    if (!canCreateTanks) {
      showToast('You do not have permission to create tanks', 'error');
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/ea/tanks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tankData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          await fetchTanks(); // Refresh tanks list
          showToast('Tank created successfully! ✅');
        }
      }
    } catch (error) {
      console.error('Failed to create tank:', error);
      showToast(`Failed to create tank: ${error.message}`, 'error');
    }
  };

  // Create New Paddy Field
  const createPaddyField = async (fieldData) => {
    if (!canCreateFields) {
      showToast('You do not have permission to create paddy fields', 'error');
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/ea/paddy-fields`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fieldData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          await fetchPaddyFields(); // Refresh fields list
          showToast('Paddy field created successfully! ✅');
        }
      }
    } catch (error) {
      console.error('Failed to create paddy field:', error);
      showToast(`Failed to create paddy field: ${error.message}`, 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading water management data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-md ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center">
            {toast.type === 'success' ? 
              <CheckCircle className="h-5 w-5 mr-2" /> : 
              <AlertTriangle className="h-5 w-5 mr-2" />
            }
            {toast.message}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Water Management System</h1>
            <p className="mt-2 text-gray-600">
              Monitor and manage water resources across the irrigation network - {user?.role} Access
              {isReadOnly && <span className="text-orange-600 font-medium"> (Read Only)</span>}
            </p>
          </div>
          <button
            onClick={fetchAllWaterData}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Quick Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <Droplets className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Tanks</p>
              <p className="text-2xl font-bold text-gray-900">{waterData.tanks.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Canals</p>
              <p className="text-2xl font-bold text-gray-900">
                {waterData.canals.filter(c => c.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Paddy Fields</p>
              <p className="text-2xl font-bold text-gray-900">{waterData.paddyFields.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Schedules</p>
              <p className="text-2xl font-bold text-gray-900">{waterData.schedules.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <Bell className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Notifications</p>
              <p className="text-2xl font-bold text-gray-900">{waterData.notifications.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link
          to="/tanks"
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
        >
          <div className="flex items-center">
            <Droplets className="h-8 w-8 mr-4" />
            <div>
              <h3 className="text-xl font-bold">Tank Management</h3>
              <p className="text-blue-100">Monitor water levels and capacity</p>
            </div>
          </div>
        </Link>

        <Link
          to="/canals"
          className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
        >
          <div className="flex items-center">
            <Activity className="h-8 w-8 mr-4" />
            <div>
              <h3 className="text-xl font-bold">Canal Management</h3>
              <p className="text-green-100">Manage flow and canal operations</p>
            </div>
          </div>
        </Link>

        <Link
          to="/paddy-fields"
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105"
        >
          <div className="flex items-center">
            <Users className="h-8 w-8 mr-4" />
            <div>
              <h3 className="text-xl font-bold">Paddy Fields</h3>
              <p className="text-purple-100">Manage agricultural fields</p>
            </div>
          </div>
        </Link>

        <Link
          to="/schedules"
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105"
        >
          <div className="flex items-center">
            <Calendar className="h-8 w-8 mr-4" />
            <div>
              <h3 className="text-xl font-bold">Water Schedules</h3>
              <p className="text-orange-100">View and manage schedules</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tank Status - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Tank Status Overview</h3>
            <div className="flex items-center space-x-2">
              {canEdit && (
                <p className="text-xs text-gray-500">Click edit to update water levels</p>
              )}
              {canCreateTanks && (
                <button className="flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                  <Plus className="h-3 w-3 mr-1" />
                  Add Tank
                </button>
              )}
            </div>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {waterData.tanks.map((tank) => (
              <TankStatusCard
                key={tank.id}
                tank={tank}
                canEdit={canEdit}
                isEditing={editingTank === tank.id}
                onEdit={setEditingTank}
                onUpdate={updateWaterLevel}
                updating={updatingLevel}
              />
            ))}
            {waterData.tanks.length === 0 && (
              <div className="text-center py-8">
                <Droplets className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No tanks available</p>
                {canCreateTanks && (
                  <button className="mt-2 text-blue-600 hover:text-blue-700">
                    Create your first tank
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Side Panel - Recent Updates & Quick Stats */}
        <div className="space-y-6">
          {/* Canal Flow Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Canal Flow Status</h3>
            <div className="space-y-3">
              {waterData.canals.slice(0, 4).map((canal) => (
                <div key={canal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{canal.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{canal.type} Canal</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-600">{canal.flow} L/s</p>
                    <div className={`w-2 h-2 rounded-full ${
                      canal.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                </div>
              ))}
              {waterData.canals.length === 0 && (
                <p className="text-gray-500 text-center py-4">No canals available</p>
              )}
            </div>
          </div>

          {/* Recent Updates */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Updates</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {waterData.notifications.map((notification) => (
                <div key={notification.id} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                    <p className="text-xs text-gray-500">{notification.time}</p>
                  </div>
                </div>
              ))}
              {waterData.notifications.length === 0 && (
                <p className="text-gray-500 text-center py-4">No recent updates</p>
              )}
            </div>
          </div>

          {/* Paddy Fields Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Paddy Fields</h3>
            <div className="space-y-3">
              {waterData.paddyFields.slice(0, 3).map((field) => (
                <div key={field.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{field.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{field.soilType} soil</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">{field.area} {field.areaUnit}</p>
                    <div className={`w-2 h-2 rounded-full ${
                      field.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></div>
                  </div>
                </div>
              ))}
              {waterData.paddyFields.length === 0 && (
                <p className="text-gray-500 text-center py-4">No paddy fields available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Role-based access notice */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <Settings className="h-6 w-6 text-blue-600 mt-0.5" />
          <div className="ml-3">
            <h4 className="text-lg font-medium text-blue-900">Access Level: {user?.role}</h4>
            <div className="mt-3 text-sm text-blue-700">
              {user?.role === 'Admin' && (
                <p>✅ You can view all data but cannot edit water-related information. Use Admin Dashboard to manage users.</p>
              )}
              {user?.role === 'Farmer' && (
                <p>👁️ You have read-only access to monitor water schedules and tank levels.</p>
              )}
              {['DIA', 'DA'].includes(user?.role) && (
                <p>✅ You can update tank levels, schedules, sluice gates, and canal flow data.</p>
              )}
              {user?.role === 'EA' && (
                <p>✅ You can create tanks/fields, set dates, and update all water management data.</p>
              )}
              {['FA', 'Irrigator'].includes(user?.role) && (
                <p>✅ You can update canal flow data and water issue dates.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Tank Status Card Component
const TankStatusCard = ({ tank, canEdit, isEditing, onEdit, onUpdate, updating }) => {
  const [newLevel, setNewLevel] = useState(tank.currentLevel);
  const [newCapacity, setNewCapacity] = useState(tank.capacity);
  const levelPercentage = tank.waterLevelPercentage || Math.round((tank.currentLevel / tank.capacity) * 100);

  useEffect(() => {
    setNewLevel(tank.currentLevel);
    setNewCapacity(tank.capacity);
  }, [tank.currentLevel, tank.capacity]);

  const handleSave = () => {
    const levelChanged = Number(newLevel) !== Number(tank.currentLevel);
    const capacityChanged = Number(newCapacity) !== Number(tank.capacity);
    
    if (levelChanged || capacityChanged) {
      onUpdate(tank.id, newLevel, newCapacity);
    } else {
      onEdit(null);
    }
  };

  const handleCancel = () => {
    setNewLevel(tank.currentLevel);
    setNewCapacity(tank.capacity);
    onEdit(null);
  };

  const getStatusColor = () => {
    if (levelPercentage > 70) return 'text-green-600 bg-green-50';
    if (levelPercentage > 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className={`p-4 rounded-lg border-2 transition-all ${
      isEditing ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="text-lg font-semibold text-gray-900">{tank.name}</h4>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              tank.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {tank.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Source: {tank.source}</p>
          {tank.location && <p className="text-sm text-gray-500">Location: {tank.location}</p>}
        </div>
        
        <div className="flex items-center gap-4">
          {/* Water Level Display/Edit */}
          <div className="text-right">
            {isEditing ? (
                              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600 w-16">Level:</label>
                  <input
                    type="number"
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value)}
                    className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    min="0"
                    max={newCapacity}
                  />
                  <span className="text-sm text-gray-600">L</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600 w-16">Capacity:</label>
                  <input
                    type="number"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(e.target.value)}
                    className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    min={newLevel}
                  />
                  <span className="text-sm text-gray-600">L</span>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-lg font-bold text-gray-900">
                  {tank.currentLevel?.toLocaleString()}L / {tank.capacity?.toLocaleString()}L
                </p>
                <div className="w-32 bg-gray-200 rounded-full h-3 mt-2">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      levelPercentage > 70 ? 'bg-green-500' :
                      levelPercentage > 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(levelPercentage, 100)}%` }}
                  ></div>
                </div>
                <p className={`text-sm font-medium mt-1 ${getStatusColor()}`}>
                  {levelPercentage}% Full
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {canEdit && (
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={updating}
                    className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-full transition-colors disabled:opacity-50"
                    title="Save changes"
                  >
                    <Save className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={updating}
                    className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                    title="Cancel"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onEdit(tank.id)}
                    className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-full transition-colors"
                    title="Edit water level"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                    title="View details"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Last Updated Info */}
      {tank.lastUpdatedBy && tank.updatedAt && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Last updated by {tank.lastUpdatedBy.firstName} {tank.lastUpdatedBy.lastName} 
            on {new Date(tank.updatedAt).toLocaleDateString()} at {new Date(tank.updatedAt).toLocaleTimeString()}
          </p>
        </div>
      )}
      
      {updating && (
        <div className="mt-3 flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-blue-600">Updating...</span>
        </div>
      )}
    </div>
  );
};

export default WaterManagement;