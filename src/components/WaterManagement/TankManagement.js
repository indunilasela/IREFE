import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Droplets, 
  Plus, 
  Edit, 
  Calendar, 
  MapPin, 
  AlertTriangle, 
  Save,
  Upload
} from 'lucide-react';
import toast from 'react-hot-toast';

const TankManagement = () => {
  const { user } = useAuth();
  const [tanks, setTanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTank, setEditingTank] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Determine user permissions
  const canEdit = ['DIA', 'DA', 'EA'].includes(user?.role);
  const canAddTanks = user?.role === 'EA';
  const isReadOnly = ['Admin', 'Farmer'].includes(user?.role);

  useEffect(() => {
    fetchTanks();
  }, []);

  const fetchTanks = async () => {
    try {
      // Mock data - replace with actual API call
      setTanks([
        {
          id: 1,
          name: 'Main Tank A',
          capacity: 1000,
          currentLevel: 750,
          source: 'River A',
          openingDate: '2025-08-01',
          closingDate: '2025-08-31',
          location: 'North Section',
          status: 'Active',
          lastUpdated: '2025-08-03T10:30:00Z'
        },
        {
          id: 2,
          name: 'Tank B',
          capacity: 800,
          currentLevel: 600,
          source: 'Reservoir B',
          openingDate: '2025-08-05',
          closingDate: '2025-08-30',
          location: 'South Section',
          status: 'Active',
          lastUpdated: '2025-08-03T09:15:00Z'
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch tanks:', error);
      toast.error('Failed to load tank data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTank = async (tankId, updates) => {
    if (!canEdit) {
      toast.error('You do not have permission to edit tank data');
      return;
    }

    try {
      // Update tank data
      setTanks(tanks.map(tank => 
        tank.id === tankId 
          ? { ...tank, ...updates, lastUpdated: new Date().toISOString() }
          : tank
      ));
      
      toast.success('Tank updated successfully');
      setEditingTank(null);
      
      // Send notification to other users (mock)
      // In real app, this would be handled by the backend
      console.log('Notification sent: Tank data updated by', user?.role);
    } catch (error) {
      console.error('Failed to update tank:', error);
      toast.error('Failed to update tank');
    }
  };

  const handleAddTank = async (tankData) => {
    if (!canAddTanks) {
      toast.error('Only EA users can add new tanks');
      return;
    }

    try {
      const newTank = {
        id: Date.now(),
        ...tankData,
        status: 'Active',
        lastUpdated: new Date().toISOString()
      };
      
      setTanks([...tanks, newTank]);
      toast.success('Tank added successfully');
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add tank:', error);
      toast.error('Failed to add tank');
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tank Management</h1>
          <p className="mt-2 text-gray-600">
            Monitor and manage water tank levels and capacity
            {isReadOnly && <span className="text-orange-600 font-medium"> (Read Only)</span>}
          </p>
        </div>
        {canAddTanks && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Tank
          </button>
        )}
      </div>

      {/* Tanks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tanks.map((tank) => (
          <TankCard
            key={tank.id}
            tank={tank}
            canEdit={canEdit}
            onEdit={setEditingTank}
            onUpdate={handleUpdateTank}
            isEditing={editingTank?.id === tank.id}
          />
        ))}
      </div>

      {/* Add Tank Modal */}
      {showAddForm && (
        <AddTankModal
          onClose={() => setShowAddForm(false)}
          onAdd={handleAddTank}
        />
      )}

      {/* Permissions Notice */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-900">Your Permissions ({user?.role})</h4>
            <div className="mt-2 text-sm text-blue-700">
              {user?.role === 'EA' && (
                <p>You can add tanks, set opening/closing dates, and update water levels.</p>
              )}
              {['DIA', 'DA'].includes(user?.role) && (
                <p>You can update tank water levels and capacity.</p>
              )}
              {['Admin', 'Farmer'].includes(user?.role) && (
                <p>You have read-only access to view tank information.</p>
              )}
              {['FA', 'Irrigator'].includes(user?.role) && (
                <p>You can view tank data but cannot make changes to tank information.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tank Card Component
const TankCard = ({ tank, canEdit, onEdit, onUpdate, isEditing }) => {
  const [editData, setEditData] = useState(tank);
  const levelPercentage = (tank.currentLevel / tank.capacity) * 100;

  const handleSave = () => {
    onUpdate(tank.id, editData);
  };

  const handleCancel = () => {
    setEditData(tank);
    onEdit(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{tank.name}</h3>
          <p className="text-sm text-gray-600">{tank.location}</p>
        </div>
        {canEdit && !isEditing && (
          <button
            onClick={() => onEdit(tank)}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <Edit className="h-4 w-4" />
          </button>
        )}
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
              <span>Source: {tank.source}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{tank.openingDate} - {tank.closingDate}</span>
            </div>
            <div className="text-xs text-gray-500 pt-2 border-t">
              Last updated: {new Date(tank.lastUpdated).toLocaleDateString()}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Add Tank Modal Component
const AddTankModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    currentLevel: '',
    source: '',
    openingDate: '',
    closingDate: '',
    location: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      ...formData,
      capacity: parseInt(formData.capacity),
      currentLevel: parseInt(formData.currentLevel)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Tank</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tank Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Water Source *
            </label>
            <input
              type="text"
              required
              value={formData.source}
              onChange={(e) => setFormData({...formData, source: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., River A, Reservoir B"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity (L) *
              </label>
              <input
                type="number"
                required
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Level (L) *
              </label>
              <input
                type="number"
                required
                value={formData.currentLevel}
                onChange={(e) => setFormData({...formData, currentLevel: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opening Date
              </label>
              <input
                type="date"
                value={formData.openingDate}
                onChange={(e) => setFormData({...formData, openingDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Closing Date
              </label>
              <input
                type="date"
                value={formData.closingDate}
                onChange={(e) => setFormData({...formData, closingDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Tank
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TankManagement;
