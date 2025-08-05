import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Edit, 
  Save, 
  AlertTriangle, 
  Activity,
  ArrowUp,
  ArrowDown,
  Circle,
  Plus,
  RefreshCw,
  Eye,
  TrendingUp,
  Droplets,
  Settings
} from 'lucide-react';

const CanalManagement = () => {
  // Mock user context - replace with your actual auth context
  const [user] = useState({ role: 'EA', id: '1' }); // Change role to test different permissions
  
  const [canals, setCanals] = useState([]);
  const [tanks, setTanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCanal, setEditingCanal] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // API Base URL - adjust to match your backend
  const API_BASE_URL = 'http://localhost:5000/api';

  // Determine user permissions based on your role system
  const canCreateCanals = ['EA'].includes(user?.role);
  const canEditFlow = ['DIA', 'DA', 'EA', 'FA', 'Irrigator'].includes(user?.role);
  const canEditSluice = ['DIA', 'DA', 'EA'].includes(user?.role);
  const isReadOnly = ['Admin', 'Farmer'].includes(user?.role);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
  };

  useEffect(() => {
    fetchCanals();
    fetchTanks();
  }, []);

  const getAuthToken = () => {
    // Replace with your actual token retrieval method
    return localStorage.getItem('authToken') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
  };

  const fetchCanals = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/ea/canals`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setCanals(data.data.canals || []);
        console.log('Canals fetched successfully:', data.data.canals?.length);
      } else {
        throw new Error(data.error || 'Failed to fetch canals');
      }
    } catch (error) {
      console.error('Failed to fetch canals:', error);
      showToast(`Failed to load canal data: ${error.message}`, 'error');
      
      // Fallback to mock data for demo purposes
      setCanals([
        {
          _id: '1',
          name: 'Main Canal - Mahaweli Left Bank',
          canalCode: 'MC-A1B2',
          type: 'main',
          currentFlowRate: 1500,
          maxFlowCapacity: 2000,
          status: 'active',
          associatedTank: { name: 'Main Storage Tank', _id: 'tank1' },
          startLocation: 'Main Tank Outlet',
          endLocation: 'Distribution Point A',
          flowUtilization: 75,
          lastUpdatedBy: { firstName: 'John', lastName: 'Doe', role: 'EA' },
          updatedAt: new Date().toISOString()
        },
        {
          _id: '2', 
          name: 'Branch Canal - North Section',
          canalCode: 'BC-X3Y4',
          type: 'branch',
          currentFlowRate: 800,
          maxFlowCapacity: 1200,
          status: 'active',
          associatedTank: { name: 'Main Storage Tank', _id: 'tank1' },
          parentCanal: { name: 'Main Canal - Mahaweli Left Bank', _id: '1' },
          startLocation: 'Main Canal Km 2.5',
          endLocation: 'North Distribution Area',
          flowUtilization: 67,
          lastUpdatedBy: { firstName: 'Jane', lastName: 'Smith', role: 'DIA' },
          updatedAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

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
          setTanks(data.data.tanks || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch tanks:', error);
      // Mock tank data for demo
      setTanks([
        { _id: 'tank1', name: 'Main Storage Tank', location: 'Kandy District' },
        { _id: 'tank2', name: 'Secondary Tank', location: 'Matale District' }
      ]);
    }
  };

  const handleUpdateFlow = async (canalId, newFlowRate, notes = '') => {
    if (!canEditFlow) {
      showToast('You do not have permission to edit canal flow data', 'error');
      return;
    }

    try {
      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/ea/canals/${canalId}/flow`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentFlowRate: newFlowRate,
          notes: notes || 'Flow updated via web interface',
          weather: 'sunny'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update local state
        setCanals(canals.map(canal => 
          canal._id === canalId 
            ? { 
                ...canal, 
                currentFlowRate: newFlowRate,
                flowUtilization: Math.round((newFlowRate / canal.maxFlowCapacity) * 100),
                lastUpdatedBy: { firstName: user.firstName, lastName: user.lastName, role: user.role },
                updatedAt: new Date().toISOString()
              }
            : canal
        ));
        
        showToast('Canal flow updated successfully! 🌊');
        setEditingCanal(null);
      } else {
        throw new Error(data.error || 'Failed to update canal flow');
      }
    } catch (error) {
      console.error('Failed to update canal flow:', error);
      showToast(`Failed to update canal flow: ${error.message}`, 'error');
    }
  };

  const handleCreateCanal = async (canalData) => {
    if (!canCreateCanals) {
      showToast('You do not have permission to create canals', 'error');
      return;
    }

    try {
      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/ea/canals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(canalData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCanals([data.data, ...canals]);
        showToast('Canal created successfully! ✅');
        setShowCreateForm(false);
      } else {
        throw new Error(data.error || 'Failed to create canal');
      }
    } catch (error) {
      console.error('Failed to create canal:', error);
      showToast(`Failed to create canal: ${error.message}`, 'error');
    }
  };

  const getStatusIcon = (status) => {
    const isActive = status === 'active';
    return isActive ? 
      <Circle className="h-4 w-4 text-green-500 fill-current" /> :
      <Circle className="h-4 w-4 text-red-500 fill-current" />;
  };

  const getTypeColor = (type) => {
    const colors = {
      'main': 'bg-blue-100 text-blue-800',
      'branch': 'bg-green-100 text-green-800',
      'distributor': 'bg-yellow-100 text-yellow-800',
      'field': 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getFlowColor = (utilization) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading canal data...</p>
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
              <Circle className="h-5 w-5 mr-2 fill-current" /> : 
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
            <h1 className="text-3xl font-bold text-gray-900">Canal Management</h1>
            <p className="mt-2 text-gray-600">
              Monitor and manage canal flow operations across the irrigation network
              {isReadOnly && <span className="text-orange-600 font-medium"> (Read Only Access)</span>}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={fetchCanals}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            {canCreateCanals && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Canal
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Canal Types Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {['main', 'branch', 'distributor', 'field'].map(type => {
          const typeCanals = canals.filter(c => c.type === type);
          const activeCanals = typeCanals.filter(c => c.status === 'active').length;
          const totalFlow = typeCanals.reduce((sum, canal) => sum + (canal.currentFlowRate || 0), 0);
          
          return (
            <div key={type} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 capitalize">{type} Canals</p>
                  <p className="text-2xl font-bold text-gray-900">{typeCanals.length}</p>
                </div>
                <div className={`p-3 rounded-full ${getTypeColor(type)}`}>
                  <Droplets className="h-6 w-6" />
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <div>
                  <p className="text-gray-600">Active</p>
                  <p className="font-semibold text-green-600">{activeCanals}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Flow</p>
                  <p className="font-semibold text-blue-600">{totalFlow.toLocaleString()} L/s</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Filter by Type:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="main">Main</option>
              <option value="branch">Branch</option>
              <option value="distributor">Distributor</option>
              <option value="field">Field</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            Showing {canals.filter(c => !selectedType || c.type === selectedType).length} of {canals.length} canals
          </div>
        </div>
      </div>

      {/* Canals List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Canal Network Overview</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Canal Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Flow Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {canals
                .filter(canal => !selectedType || canal.type === selectedType)
                .map((canal) => (
                <CanalRow
                  key={canal._id}
                  canal={canal}
                  canEditFlow={canEditFlow}
                  canEditSluice={canEditSluice}
                  isEditing={editingCanal?._id === canal._id}
                  onEdit={setEditingCanal}
                  onUpdateFlow={handleUpdateFlow}
                  getStatusIcon={getStatusIcon}
                  getTypeColor={getTypeColor}
                  getFlowColor={getFlowColor}
                  formatDate={formatDate}
                />
              ))}
            </tbody>
          </table>
          
          {canals.filter(c => !selectedType || c.type === selectedType).length === 0 && (
            <div className="text-center py-12">
              <Droplets className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No canals found</p>
              <p className="text-gray-400">
                {canCreateCanals ? 'Create your first canal to get started' : 'No canals match your current filter'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Permissions Notice */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Settings className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-900">Your Permissions ({user?.role})</h4>
            <div className="mt-2 text-sm text-blue-700">
              {canCreateCanals && <p>✅ Create new canals and manage canal network structure</p>}
              {['DIA', 'DA', 'EA'].includes(user?.role) && (
                <p>✅ Update flow rates, sluice gate operations, and water scheduling</p>
              )}
              {['FA', 'Irrigator'].includes(user?.role) && (
                <p>✅ Update canal flow rates and monitor water distribution</p>
              )}
              {['Admin', 'Farmer'].includes(user?.role) && (
                <p>👁️ View-only access to canal information and flow data</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Canal Modal */}
      {showCreateForm && (
        <CreateCanalModal
          tanks={tanks}
          canals={canals}
          onClose={() => setShowCreateForm(false)}
          onCreate={handleCreateCanal}
        />
      )}
    </div>
  );
};

// Canal Row Component
const CanalRow = ({ 
  canal, 
  canEditFlow, 
  canEditSluice, 
  isEditing, 
  onEdit, 
  onUpdateFlow, 
  getStatusIcon, 
  getTypeColor,
  getFlowColor,
  formatDate
}) => {
  const [editData, setEditData] = useState({ flowRate: canal.currentFlowRate, notes: '' });

  const handleSave = () => {
    onUpdateFlow(canal._id, editData.flowRate, editData.notes);
  };

  const handleCancel = () => {
    setEditData({ flowRate: canal.currentFlowRate, notes: '' });
    onEdit(null);
  };

  if (isEditing) {
    return (
      <tr className="bg-yellow-50 border-l-4 border-yellow-400">
        <td className="px-6 py-4">
          <div>
            <div className="text-sm font-medium text-gray-900">{canal.name}</div>
            <div className="text-xs text-gray-500">{canal.canalCode}</div>
            <div className="text-xs text-gray-500">
              {canal.associatedTank?.name} → {canal.endLocation}
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(canal.type)}`}>
            {canal.type}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            {getStatusIcon(canal.status)}
            <span className="ml-2 text-sm text-gray-900 capitalize">{canal.status}</span>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {canEditFlow ? (
            <div className="space-y-2">
              <input
                type="number"
                step="0.1"
                min="0"
                max={canal.maxFlowCapacity}
                value={editData.flowRate}
                onChange={(e) => setEditData({...editData, flowRate: parseFloat(e.target.value) || 0})}
                className="w-24 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="L/s"
              />
              <input
                type="text"
                value={editData.notes}
                onChange={(e) => setEditData({...editData, notes: e.target.value})}
                className="w-32 text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Notes (optional)"
              />
            </div>
          ) : (
            <span className="text-sm text-gray-900">{canal.currentFlowRate} L/s</span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {canal.maxFlowCapacity} L/s
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`text-sm font-medium ${getFlowColor(canal.flowUtilization || 0)}`}>
            {canal.flowUtilization || 0}%
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
          {formatDate(canal.updatedAt)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <Save className="h-3 w-3 mr-1" />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div>
          <div className="text-sm font-medium text-gray-900">{canal.name}</div>
          <div className="text-xs text-gray-500">{canal.canalCode}</div>
          <div className="text-xs text-gray-500">
            {canal.associatedTank?.name}
            {canal.parentCanal && ` ← ${canal.parentCanal.name}`}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(canal.type)}`}>
          {canal.type}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {getStatusIcon(canal.status)}
          <span className="ml-2 text-sm text-gray-900 capitalize">{canal.status}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <Activity className="h-4 w-4 mr-1 text-blue-500" />
          <span className="text-sm font-medium text-gray-900">{canal.currentFlowRate} L/s</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {canal.maxFlowCapacity} L/s
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
            <div 
              className={`h-2 rounded-full ${
                (canal.flowUtilization || 0) >= 90 ? 'bg-red-500' :
                (canal.flowUtilization || 0) >= 70 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(canal.flowUtilization || 0, 100)}%` }}
            ></div>
          </div>
          <span className={`text-sm font-medium ${getFlowColor(canal.flowUtilization || 0)}`}>
            {canal.flowUtilization || 0}%
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-xs text-gray-500">
          {formatDate(canal.updatedAt)}
          {canal.lastUpdatedBy && (
            <div className="text-xs text-gray-400">
              by {canal.lastUpdatedBy.firstName} {canal.lastUpdatedBy.lastName}
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex space-x-2">
          {canEditFlow && (
            <button
              onClick={() => onEdit(canal)}
              className="flex items-center px-2 py-1 text-blue-600 hover:text-blue-900 transition-colors"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit Flow
            </button>
          )}
          <button className="flex items-center px-2 py-1 text-gray-600 hover:text-gray-900 transition-colors">
            <Eye className="h-3 w-3 mr-1" />
            Details
          </button>
        </div>
      </td>
    </tr>
  );
};

// Create Canal Modal Component
const CreateCanalModal = ({ tanks, canals, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'main',
    parentCanal: '',
    associatedTank: '',
    length: '',
    width: '',
    depth: '',
    maxFlowCapacity: '',
    startLocation: '',
    endLocation: '',
    operationalSeason: 'year_round'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const canalData = {
      ...formData,
      length: parseFloat(formData.length),
      width: parseFloat(formData.width),
      depth: parseFloat(formData.depth),
      maxFlowCapacity: parseFloat(formData.maxFlowCapacity),
      parentCanal: formData.type === 'main' ? null : formData.parentCanal
    };

    onCreate(canalData);
  };

  const getValidParentCanals = () => {
    const validParentTypes = {
      'branch': ['main'],
      'distributor': ['main', 'branch'],
      'field': ['branch', 'distributor']
    };
    
    if (formData.type === 'main') return [];
    
    return canals.filter(canal => 
      validParentTypes[formData.type]?.includes(canal.type)
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto m-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Create New Canal</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Canal Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Main Canal - Left Bank"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Canal Type *</label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value, parentCanal: ''})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="main">Main Canal</option>
                <option value="branch">Branch Canal</option>
                <option value="distributor">Distributor Canal</option>
                <option value="field">Field Canal</option>
              </select>
            </div>

            {formData.type !== 'main' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Canal *</label>
                <select
                  required
                  value={formData.parentCanal}
                  onChange={(e) => setFormData({...formData, parentCanal: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Parent Canal</option>
                  {getValidParentCanals().map(canal => (
                    <option key={canal._id} value={canal._id}>
                      {canal.name} ({canal.type})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Associated Tank *</label>
              <select
                required
                value={formData.associatedTank}
                onChange={(e) => setFormData({...formData, associatedTank: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Tank</option>
                {tanks.map(tank => (
                  <option key={tank._id} value={tank._id}>
                    {tank.name} - {tank.location}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Length (meters) *</label>
              <input
                type="number"
                required
                min="1"
                step="0.1"
                value={formData.length}
                onChange={(e) => setFormData({...formData, length: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 5000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Width (meters) *</label>
              <input
                type="number"
                required
                min="0.1"
                step="0.1"
                value={formData.width}
                onChange={(e) => setFormData({...formData, width: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 8.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Depth (meters) *</label>
              <input
                type="number"
                required
                min="0.1"
                step="0.1"
                value={formData.depth}
                onChange={(e) => setFormData({...formData, depth: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Flow Capacity (L/s) *</label>
              <input
                type="number"
                required
                min="1"
                step="0.1"
                value={formData.maxFlowCapacity}
                onChange={(e) => setFormData({...formData, maxFlowCapacity: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Location *</label>
              <input
                type="text"
                required
                value={formData.startLocation}
                onChange={(e) => setFormData({...formData, startLocation: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Tank Outlet"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Location *</label>
              <input
                type="text"
                required
                value={formData.endLocation}
                onChange={(e) => setFormData({...formData, endLocation: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Distribution Point A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Operational Season</label>
              <select
                value={formData.operationalSeason}
                onChange={(e) => setFormData({...formData, operationalSeason: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="year_round">Year Round</option>
                <option value="maha_only">Maha Season Only</option>
                <option value="yala_only">Yala Season Only</option>
                <option value="seasonal">Seasonal</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Canal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CanalManagement;