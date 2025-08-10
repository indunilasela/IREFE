/*
 * Tank Management Component
 * 
 * Backend API Integration: Connected to backend server running on port 5000
 * API Base URL: http://localhost:5000/api
 * Tank Endpoints: 
 * - GET /api/ea/tanks (fetch all tanks)
 * - POST /api/ea/tanks (create new tank)
 * - PUT /api/ea/tanks/:id (update tank details)
 * - PUT /api/ea/tanks/:id/availability (update availability)
 * - DELETE /api/ea/tanks/:id (delete tank)
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  AlertTriangle, 
  Database
} from 'lucide-react';
import { TankCard, AddTankModal } from './TankDetails';

// Mock auth context for demonstration
const useAuth = () => ({
  user: {
    firstName: 'John',
    lastName: 'Doe',
    role: 'EA', // Change this to test different roles: 'EA', 'DIA', 'DA', 'Admin', 'Farmer', 'FA', 'Irrigator'
    isFirstLogin: false
  }
});

const TankManagement = () => {
  const { user } = useAuth();
  const [tanks, setTanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTank, setEditingTank] = useState(null);
  const [editingAvailability, setEditingAvailability] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Determine user permissions based on updated requirements
  const canUpdateAvailability = ['DIA', 'DA', 'EA'].includes(user?.role);
  const canUpdateAllDetails = user?.role === 'EA';
  const canAddTanks = user?.role === 'EA';
  const canDeleteTanks = ['Admin', 'EA'].includes(user?.role);
  const isReadOnly = ['Farmer', 'FA', 'Irrigator'].includes(user?.role);

  useEffect(() => {
    fetchTanks();
  }, []);

  const fetchTanks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/ea/tanks', {
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
      const tanksList = data.data?.tanks || data.data || [];
      const transformedTanks = Array.isArray(tanksList) ? tanksList.map(tank => ({
        id: tank._id || tank.id,
        name: tank.name,
        range: tank.range,
        division: tank.division,
        scheme: tank.scheme,
        fullCapacity: tank.fullCapacity,
        availabilityCapacity: tank.availabilityCapacity,
        availabilityPercentage: tank.availabilityPercentage || Math.round((tank.availabilityCapacity / tank.fullCapacity) * 100),
        status: tank.status || 'active',
        lastUpdateDate: tank.lastUpdateDate || tank.updatedAt || new Date().toISOString(),
        createdBy: tank.createdBy,
        lastUpdatedBy: tank.lastUpdatedBy,
        availabilityHistory: tank.availabilityHistory || []
      })) : [];

      setTanks(transformedTanks);
    } catch (error) {
      console.error('Failed to fetch tanks:', error);
      // Fallback to mock data if API fails
      const mockTanks = [
        {
          id: '1',
          name: 'Mahaweli Main Tank',
          range: 'Kandy Range',
          division: 'Central Division',
          scheme: 'Mahaweli Scheme B',
          fullCapacity: 100000,
          availabilityCapacity: 75000,
          availabilityPercentage: 75,
          status: 'active',
          lastUpdateDate: new Date().toISOString(),
          createdBy: { firstName: 'System', lastName: 'Admin', role: 'Admin' },
          lastUpdatedBy: { firstName: 'John', lastName: 'Doe', role: 'EA' },
          availabilityHistory: []
        }
      ];
      setTanks(mockTanks);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAvailability = async (tankId, availabilityCapacity) => {
    if (!canUpdateAvailability) {
      alert('You do not have permission to update availability capacity');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/ea/tanks/${tankId}/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ availabilityCapacity: parseInt(availabilityCapacity) })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update availability');
      }

      const data = await response.json();
      
      // Update local state
      setTanks(prevTanks => 
        prevTanks.map(tank => 
          tank.id === tankId 
            ? { 
                ...tank, 
                availabilityCapacity: data.data.availabilityCapacity,
                availabilityPercentage: data.data.availabilityPercentage,
                lastUpdateDate: data.data.lastUpdateDate || data.data.updatedAt,
                lastUpdatedBy: data.data.lastUpdatedBy || {
                  firstName: user.firstName,
                  lastName: user.lastName,
                  role: user.role
                }
              }
            : tank
        )
      );
      
      setEditingAvailability(null);
      alert('Availability capacity updated successfully');
    } catch (error) {
      console.error('Failed to update availability:', error);
      alert(`Failed to update availability: ${error.message}`);
    }
  };

  const handleUpdateTankDetails = async (tankId, updates) => {
    if (!canUpdateAllDetails) {
      alert('Only EA users can update tank details');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/ea/tanks/${tankId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update tank');
      }

      const data = await response.json();
      
      // Update local state
      setTanks(prevTanks => 
        prevTanks.map(tank => 
          tank.id === tankId 
            ? { 
                ...tank, 
                ...updates,
                availabilityPercentage: data.data.availabilityPercentage || Math.round((updates.availabilityCapacity / updates.fullCapacity) * 100),
                lastUpdateDate: data.data.lastUpdateDate || data.data.updatedAt,
                lastUpdatedBy: data.data.lastUpdatedBy || {
                  firstName: user.firstName,
                  lastName: user.lastName,
                  role: user.role
                }
              }
            : tank
        )
      );
      
      setEditingTank(null);
      alert('Tank details updated successfully');
    } catch (error) {
      console.error('Failed to update tank details:', error);
      alert(`Failed to update tank: ${error.message}`);
    }
  };

  const handleAddTank = async (tankData) => {
    if (!canAddTanks) {
      alert('Only EA users can add new tanks');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/ea/tanks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: tankData.name,
          range: tankData.range,
          division: tankData.division,
          scheme: tankData.scheme,
          fullCapacity: parseInt(tankData.fullCapacity),
          availabilityCapacity: parseInt(tankData.availabilityCapacity)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add tank');
      }

      const data = await response.json();
      
      // Transform and add the new tank to local state
      const newTank = {
        id: data.data._id,
        name: data.data.name,
        range: data.data.range,
        division: data.data.division,
        scheme: data.data.scheme,
        fullCapacity: data.data.fullCapacity,
        availabilityCapacity: data.data.availabilityCapacity,
        availabilityPercentage: data.data.availabilityPercentage,
        status: data.data.status,
        lastUpdateDate: data.data.lastUpdateDate || data.data.updatedAt,
        createdBy: data.data.createdBy,
        lastUpdatedBy: data.data.lastUpdatedBy,
        availabilityHistory: data.data.availabilityHistory || []
      };
      
      setTanks([...tanks, newTank]);
      alert('Tank added successfully');
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add tank:', error);
      alert(`Failed to add tank: ${error.message}`);
    }
  };

  const handleDeleteTank = async (tankId, tankName) => {
    if (!canDeleteTanks) {
      alert('You do not have permission to delete tanks');
      return;
    }

    if (!confirm(`Are you sure you want to delete tank "${tankName}"? This action cannot be undone.`)) {
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

      // Remove tank from local state
      setTanks(prevTanks => prevTanks.filter(tank => tank.id !== tankId));
      alert('Tank deleted successfully');
    } catch (error) {
      console.error('Failed to delete tank:', error);
      alert(`Failed to delete tank: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading tanks...</span>
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
            Monitor and manage reservoir tank capacity and availability
            {isReadOnly && <span className="text-orange-600 font-medium"> (Read Only Access)</span>}
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
        {tanks.length > 0 ? (
          tanks.map((tank) => (
            <TankCard
              key={tank.id}
              tank={tank}
              canUpdateAvailability={canUpdateAvailability}
              canUpdateAllDetails={canUpdateAllDetails}
              canDelete={canDeleteTanks}
              onEditDetails={setEditingTank}
              onEditAvailability={setEditingAvailability}
              onUpdateDetails={handleUpdateTankDetails}
              onUpdateAvailability={handleUpdateAvailability}
              onDelete={handleDeleteTank}
              isEditingDetails={editingTank?.id === tank.id}
              isEditingAvailability={editingAvailability?.id === tank.id}
              clickable={true}
            />
          ))
        ) : (
          <div className="col-span-full bg-white rounded-lg shadow p-12 text-center">
            <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No tanks found</p>
            <p className="text-gray-400 text-sm mt-2">
              {canAddTanks ? 'Click "Add Tank" to create your first tank' : 'No tanks available to display'}
            </p>
          </div>
        )}
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
                <p>You can create tanks, update all tank details, update availability capacity, and delete tanks.</p>
              )}
              {['DIA', 'DA'].includes(user?.role) && (
                <p>You can update tank availability capacity only.</p>
              )}
              {user?.role === 'Admin' && (
                <p>You can view all tanks and delete tanks.</p>
              )}
              {['Farmer', 'FA', 'Irrigator'].includes(user?.role) && (
                <p>You have read-only access to view tank information.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TankManagement;