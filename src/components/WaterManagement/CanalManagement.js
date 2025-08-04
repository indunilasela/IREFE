import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  Edit, 
  Save, 
  AlertTriangle, 
  Activity,
  ArrowUp,
  ArrowDown,
  Circle
} from 'lucide-react';
import toast from 'react-hot-toast';

const CanalManagement = () => {
  const { user } = useAuth();
  const [canals, setCanals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCanal, setEditingCanal] = useState(null);

  // Determine user permissions
  const canEditFlow = ['DIA', 'DA', 'EA', 'FA', 'Irrigator'].includes(user?.role);
  const canEditSluice = ['DIA', 'DA', 'EA'].includes(user?.role);
  const isReadOnly = ['Admin', 'Farmer'].includes(user?.role);

  useEffect(() => {
    fetchCanals();
  }, []);

  const fetchCanals = async () => {
    try {
      // Mock data - replace with actual API call
      setCanals([
        {
          id: 1,
          name: 'Main Canal',
          type: 'Main',
          flow: 45,
          sluiceGateSize: 1.2,
          status: 'Open',
          waterIssueDate: '2025-08-05',
          lastUpdated: '2025-08-03T10:30:00Z',
          connectedTanks: ['Main Tank A']
        },
        {
          id: 2,
          name: 'Branch Canal 1',
          type: 'Branch',
          flow: 25,
          sluiceGateSize: 0.8,
          status: 'Open',
          waterIssueDate: '2025-08-06',
          lastUpdated: '2025-08-03T09:15:00Z',
          connectedTanks: ['Main Tank A']
        },
        {
          id: 3,
          name: 'Distributor Canal A1',
          type: 'Distributor',
          flow: 15,
          sluiceGateSize: 0.5,
          status: 'Closed',
          waterIssueDate: '2025-08-07',
          lastUpdated: '2025-08-03T08:45:00Z',
          connectedTanks: ['Tank B']
        },
        {
          id: 4,
          name: 'Field Canal 1',
          type: 'Field',
          flow: 8,
          sluiceGateSize: 0.3,
          status: 'Open',
          waterIssueDate: '2025-08-05',
          lastUpdated: '2025-08-03T11:00:00Z',
          connectedTanks: ['Tank B']
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch canals:', error);
      toast.error('Failed to load canal data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCanal = async (canalId, updates) => {
    if (!canEditFlow && !canEditSluice) {
      toast.error('You do not have permission to edit canal data');
      return;
    }

    try {
      setCanals(canals.map(canal => 
        canal.id === canalId 
          ? { ...canal, ...updates, lastUpdated: new Date().toISOString() }
          : canal
      ));
      
      toast.success('Canal updated successfully');
      setEditingCanal(null);
      
      // Send notification to other users
      console.log('Notification sent: Canal data updated by', user?.role);
    } catch (error) {
      console.error('Failed to update canal:', error);
      toast.error('Failed to update canal');
    }
  };

  const getStatusIcon = (status) => {
    return status === 'Open' ? 
      <Circle className="h-4 w-4 text-green-500 fill-current" /> :
      <Circle className="h-4 w-4 text-red-500 fill-current" />;
  };

  const getTypeColor = (type) => {
    const colors = {
      'Main': 'bg-blue-100 text-blue-800',
      'Branch': 'bg-green-100 text-green-800',
      'Distributor': 'bg-yellow-100 text-yellow-800',
      'Field': 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
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
        <h1 className="text-3xl font-bold text-gray-900">Canal Management</h1>
        <p className="mt-2 text-gray-600">
          Monitor and manage canal flow and operations
          {isReadOnly && <span className="text-orange-600 font-medium"> (Read Only)</span>}
        </p>
      </div>

      {/* Canal Types Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {['Main', 'Branch', 'Distributor', 'Field'].map(type => {
          const typeCanals = canals.filter(c => c.type === type);
          const openCanals = typeCanals.filter(c => c.status === 'Open').length;
          
          return (
            <div key={type} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{type} Canals</p>
                  <p className="text-2xl font-bold text-gray-900">{typeCanals.length}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Open</p>
                  <p className="text-lg font-semibold text-green-600">{openCanals}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Canals List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Canals</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Canal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Flow (L/s)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sluice Gate (m)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {canals.map((canal) => (
                <CanalRow
                  key={canal.id}
                  canal={canal}
                  canEditFlow={canEditFlow}
                  canEditSluice={canEditSluice}
                  isEditing={editingCanal?.id === canal.id}
                  onEdit={setEditingCanal}
                  onUpdate={handleUpdateCanal}
                  getStatusIcon={getStatusIcon}
                  getTypeColor={getTypeColor}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Notice */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-900">Your Permissions ({user?.role})</h4>
            <div className="mt-2 text-sm text-blue-700">
              {['DIA', 'DA', 'EA'].includes(user?.role) && (
                <p>You can update flow data, sluice gate sizes, and water issue dates.</p>
              )}
              {['FA', 'Irrigator'].includes(user?.role) && (
                <p>You can update flow data and water issue dates.</p>
              )}
              {['Admin', 'Farmer'].includes(user?.role) && (
                <p>You have read-only access to view canal information.</p>
              )}
            </div>
          </div>
        </div>
      </div>
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
  onUpdate, 
  getStatusIcon, 
  getTypeColor 
}) => {
  const [editData, setEditData] = useState(canal);

  const handleSave = () => {
    onUpdate(canal.id, editData);
  };

  const handleCancel = () => {
    setEditData(canal);
    onEdit(null);
  };

  if (isEditing) {
    return (
      <tr className="bg-yellow-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div>
            <div className="text-sm font-medium text-gray-900">{canal.name}</div>
            <div className="text-sm text-gray-500">Connected: {canal.connectedTanks.join(', ')}</div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(canal.type)}`}>
            {canal.type}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <select
            value={editData.status}
            onChange={(e) => setEditData({...editData, status: e.target.value})}
            className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
          </select>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {canEditFlow ? (
            <input
              type="number"
              step="0.1"
              value={editData.flow}
              onChange={(e) => setEditData({...editData, flow: parseFloat(e.target.value)})}
              className="w-20 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <span className="text-sm text-gray-900">{canal.flow}</span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {canEditSluice ? (
            <input
              type="number"
              step="0.1"
              value={editData.sluiceGateSize}
              onChange={(e) => setEditData({...editData, sluiceGateSize: parseFloat(e.target.value)})}
              className="w-20 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <span className="text-sm text-gray-900">{canal.sluiceGateSize}</span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <input
            type="date"
            value={editData.waterIssueDate}
            onChange={(e) => setEditData({...editData, waterIssueDate: e.target.value})}
            className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="flex items-center px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <Save className="h-3 w-3 mr-1" />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
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
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">{canal.name}</div>
          <div className="text-sm text-gray-500">Connected: {canal.connectedTanks.join(', ')}</div>
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
          <span className="ml-2 text-sm text-gray-900">{canal.status}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <div className="flex items-center">
          <Activity className="h-4 w-4 mr-1 text-blue-500" />
          {canal.flow}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {canal.sluiceGateSize}m
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {canal.waterIssueDate}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        {(canEditFlow || canEditSluice) && (
          <button
            onClick={() => onEdit(canal)}
            className="flex items-center px-2 py-1 text-blue-600 hover:text-blue-900 transition-colors"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </button>
        )}
      </td>
    </tr>
  );
};

export default CanalManagement;
