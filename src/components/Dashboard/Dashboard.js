import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Save, Droplets, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import UserDashboard from './UserDashboard';

// Tank Card Component
const TankCard = ({ tank, canEdit, onEdit, onUpdate, isEditing }) => {
  const navigate = useNavigate();
  const [editData, setEditData] = useState(tank);
  const levelPercentage = tank.waterLevelPercentage || Math.round((tank.currentLevel / tank.capacity) * 100);

  const handleSave = () => {
    onUpdate(tank.id, editData);
  };

  const handleCancel = () => {
    setEditData(tank);
    onEdit(null);
  };

  const handleCardClick = (e) => {
    // Don't navigate if clicking on buttons or if editing
    if (e.target.closest('button') || isEditing) {
      return;
    }
    navigate(`/tanks/${tank.id}`);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow duration-300"
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">{tank.name}</h3>
            <span className={`px-2 py-1 text-xs rounded-full ${
              tank.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {tank.status?.charAt(0).toUpperCase() + tank.status?.slice(1) || 'Active'}
            </span>
          </div>
          <p className="text-sm text-gray-600">{tank.location}</p>
        </div>

      </div>

      {/* Water Level Indicator */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Water Level</span>
          <span>{Math.round(levelPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              levelPercentage > 70 ? 'bg-green-500' :
              levelPercentage > 40 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${levelPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Tank Details */}
      <div className="space-y-3">
        {isEditing ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Level (L)
              </label>
              <input
                type="number"
                value={editData.currentLevel}
                onChange={(e) => setEditData({...editData, currentLevel: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity (L)
              </label>
              <input
                type="number"
                value={editData.capacity}
                onChange={(e) => setEditData({...editData, capacity: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-2 pt-2">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center text-sm text-gray-600">
              <Droplets className="h-4 w-4 mr-2" />
              <span>{tank.currentLevel}L / {tank.capacity}L</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              <span>Scheme: {tank.waterSourceName || tank.source}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Location: {tank.location}</span>
            </div>
            <div className="text-xs text-gray-500 pt-2 border-t">
              <div>Last updated: {new Date(tank.lastUpdated).toLocaleDateString()}</div>
              {tank.lastUpdatedBy && (
                <div>Updated by: {tank.lastUpdatedBy.firstName} {tank.lastUpdatedBy.lastName} ({tank.lastUpdatedBy.role})</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Route to UserDashboard for User and PublicUser roles
  if (user?.role === 'User' || user?.role === 'PublicUser') {
    return <UserDashboard />;
  }
  
  const [editingTank, setEditingTank] = useState(null);
  const [tanks, setTanks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch tanks from API
  const fetchTanks = async () => {
    try {
      const response = await fetch('https://irebe.onrender.com/api/ea/tanks', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tanks');
      }

      const data = await response.json();
      
      // Transform backend data to match frontend expectations
      const tanksList = data.data?.tanks || data.tanks || (data.data ? [data.data] : []);
      const transformedTanks = tanksList.map(tank => ({
        id: tank._id || tank.id,
        name: tank.name,
        capacity: tank.fullCapacity,
        currentLevel: tank.availabilityCapacity,
        source: tank.scheme,
        waterSourceName: tank.scheme,
        openingDate: '',
        closingDate: '',
        location: `${tank.range}, ${tank.division}`,
        status: tank.status || 'active',
        lastUpdated: tank.updatedAt || tank.lastUpdateDate || new Date().toISOString(),
        waterLevelPercentage: tank.availabilityPercentage || Math.round((tank.availabilityCapacity / tank.fullCapacity) * 100),
        createdBy: tank.createdBy,
        lastUpdatedBy: tank.lastUpdatedBy
      }));

      setTanks(transformedTanks);
    } catch (error) {
      console.error('Failed to fetch tanks:', error);
      // Note: toast functionality would need to be imported/implemented
      // toast.error('Failed to load tank data');
      
      // Fallback to empty array if API fails
      setTanks([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch tanks on component mount
  useEffect(() => {
    fetchTanks();
  }, []);

  const handleEditTank = (tank) => {
    setEditingTank(tank?.id || null);
  };

  const handleUpdateTank = (tankId, updatedData) => {
    setTanks(prevTanks => 
      prevTanks.map(tank => 
        tank.id === tankId 
          ? { 
              ...tank, 
              ...updatedData, 
              lastUpdated: new Date().toISOString(),
              lastUpdatedBy: {
                firstName: user.firstName,
                lastName: "User",
                role: user.role
              }
            }
          : tank
      )
    );
    setEditingTank(null);
  };

  const canEditTanks = user?.role === 'Administrator' || user?.role === 'Operator';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome, {user?.firstName}!
          </h1>
          <p className="text-gray-600">
            You are logged in as {user?.role}. 
            {user?.isFirstLogin && (
              <span className="text-orange-600 font-medium">
                {' '}Please change your default password for security.
              </span>
            )}
          </p>
        </div>



        {/* Tank Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tanks.map(tank => (
            <TankCard
              key={tank.id}
              tank={tank}
              canEdit={canEditTanks}
              onEdit={handleEditTank}
              onUpdate={handleUpdateTank}
              isEditing={editingTank === tank.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;