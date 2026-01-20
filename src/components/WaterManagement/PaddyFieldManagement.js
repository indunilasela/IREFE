import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Edit, 
  Save, 
  X, 
  Plus, 
  RefreshCw, 
  Eye, 
  MapPin, 
  Droplets, 
  Calendar, 
  Leaf,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Search,
  Filter
} from 'lucide-react';

const PaddyFieldManagement = () => {
  // Mock user context - replace with your actual auth context
  const [user] = useState({ 
    role: 'EA', 
    id: '1', 
    firstName: 'John', 
    lastName: 'Doe' 
  });

  const [paddyFields, setPaddyFields] = useState([]);
  const [tanks, setTanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    soilType: '',
    associatedTank: '',
    currentCropSeason: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // API Base URL
  const API_BASE_URL = 'https://irebe.onrender.com/api';

  // User permissions
  const canCreateFields = ['EA'].includes(user?.role);
  const canEditFields = ['EA'].includes(user?.role);
  const canViewAll = true; // All authenticated users can view

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
  };

  const getAuthToken = () => {
    return localStorage.getItem('token') || localStorage.getItem('authToken') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
  };

  useEffect(() => {
    fetchPaddyFields();
    fetchTanks();
  }, []);

  const fetchPaddyFields = async () => {
    try {
      setLoading(true);
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
          setPaddyFields(data.data.paddyFields || []);
          console.log('Paddy fields fetched:', data.data.paddyFields?.length);
        }
      } else {
        throw new Error('Failed to fetch paddy fields');
      }
    } catch (error) {
      console.error('Failed to fetch paddy fields:', error);
      showToast(`Failed to load paddy fields: ${error.message}`, 'error');
      
      // Mock data fallback
      setPaddyFields([
        {
          _id: '1',
          name: 'Paddy Field A1',
          location: 'Kandy District, Block A',
          area: 25.5,
          areaUnit: 'acres',
          soilType: 'clay',
          cropType: 'rice',
          currentCropSeason: 'maha',
          irrigationMethod: 'flood',
          status: 'active',
          waterRequirement: 500,
          associatedTank: {
            _id: 'tank1',
            name: 'Main Storage Tank',
            location: 'Kandy District'
          },
          createdBy: {
            firstName: 'John',
            lastName: 'Doe',
            role: 'EA'
          },
          updatedAt: new Date().toISOString()
        },
        {
          _id: '2',
          name: 'Paddy Field B2',
          location: 'Matale District, Section B',
          area: 18.0,
          areaUnit: 'acres',
          soilType: 'loam',
          cropType: 'rice',
          currentCropSeason: 'yala',
          irrigationMethod: 'sprinkler',
          status: 'under_cultivation',
          waterRequirement: 350,
          associatedTank: {
            _id: 'tank2',
            name: 'Secondary Tank',
            location: 'Matale District'
          },
          createdBy: {
            firstName: 'Jane',
            lastName: 'Smith',
            role: 'EA'
          },
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
      // Mock tanks for demo
      setTanks([
        { _id: 'tank1', name: 'Main Storage Tank', location: 'Kandy District' },
        { _id: 'tank2', name: 'Secondary Tank', location: 'Matale District' }
      ]);
    }
  };

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

      const data = await response.json();

      if (response.ok && data.success) {
        setPaddyFields([data.data, ...paddyFields]);
        showToast('Paddy field created successfully! 🌾');
        setShowCreateForm(false);
      } else {
        throw new Error(data.error || 'Failed to create paddy field');
      }
    } catch (error) {
      console.error('Failed to create paddy field:', error);
      showToast(`Failed to create paddy field: ${error.message}`, 'error');
    }
  };

  const updatePaddyField = async (fieldId, updateData) => {
    if (!canEditFields) {
      showToast('You do not have permission to edit paddy fields', 'error');
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/ea/paddy-fields/${fieldId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPaddyFields(paddyFields.map(field => 
          field._id === fieldId ? data.data : field
        ));
        showToast('Paddy field updated successfully! ✅');
        setEditingField(null);
      } else {
        throw new Error(data.error || 'Failed to update paddy field');
      }
    } catch (error) {
      console.error('Failed to update paddy field:', error);
      showToast(`Failed to update paddy field: ${error.message}`, 'error');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'under_cultivation': 'bg-blue-100 text-blue-800',
      'fallow': 'bg-yellow-100 text-yellow-800',
      'preparation': 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getSoilTypeColor = (soilType) => {
    const colors = {
      'clay': 'bg-red-100 text-red-800',
      'loam': 'bg-green-100 text-green-800',
      'sandy': 'bg-yellow-100 text-yellow-800',
      'mixed': 'bg-purple-100 text-purple-800'
    };
    return colors[soilType] || 'bg-gray-100 text-gray-800';
  };

  const getSeasonColor = (season) => {
    const colors = {
      'maha': 'bg-blue-100 text-blue-800',
      'yala': 'bg-orange-100 text-orange-800',
      'off_season': 'bg-gray-100 text-gray-800',
      'none': 'bg-gray-100 text-gray-800'
    };
    return colors[season] || 'bg-gray-100 text-gray-800';
  };

  const filteredFields = paddyFields.filter(field => {
    const matchesSearch = field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         field.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filters.status || field.status === filters.status;
    const matchesSoilType = !filters.soilType || field.soilType === filters.soilType;
    const matchesTank = !filters.associatedTank || field.associatedTank?._id === filters.associatedTank;
    const matchesSeason = !filters.currentCropSeason || field.currentCropSeason === filters.currentCropSeason;

    return matchesSearch && matchesStatus && matchesSoilType && matchesTank && matchesSeason;
  });

  // Calculate summary statistics
  const summaryStats = {
    totalFields: paddyFields.length,
    totalArea: paddyFields.reduce((sum, field) => sum + (field.area || 0), 0),
    activeFields: paddyFields.filter(f => f.status === 'active').length,
    underCultivation: paddyFields.filter(f => f.status === 'under_cultivation').length,
    averageArea: paddyFields.length > 0 ? (paddyFields.reduce((sum, field) => sum + (field.area || 0), 0) / paddyFields.length).toFixed(1) : 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading paddy field data...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Paddy Field Management</h1>
            <p className="mt-2 text-gray-600">
              Manage agricultural paddy fields and cultivation data across the irrigation network
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={fetchPaddyFields}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            {canCreateFields && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Paddy Field
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Fields</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.totalFields}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <MapPin className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Area</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.totalArea}</p>
              <p className="text-xs text-gray-500">acres</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Leaf className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Fields</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.activeFields}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Under Cultivation</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.underCultivation}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Area</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.averageArea}</p>
              <p className="text-xs text-gray-500">acres</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search paddy fields..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="under_cultivation">Under Cultivation</option>
              <option value="fallow">Fallow</option>
              <option value="preparation">Preparation</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={filters.soilType}
              onChange={(e) => setFilters({...filters, soilType: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Soil Types</option>
              <option value="clay">Clay</option>
              <option value="loam">Loam</option>
              <option value="sandy">Sandy</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={filters.currentCropSeason}
              onChange={(e) => setFilters({...filters, currentCropSeason: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Seasons</option>
              <option value="maha">Maha</option>
              <option value="yala">Yala</option>
              <option value="off_season">Off Season</option>
              <option value="none">None</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            Showing {filteredFields.length} of {paddyFields.length} fields
          </div>
        </div>
      </div>

      {/* Paddy Fields Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Paddy Fields Overview</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Field Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Area & Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Soil & Crop
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Season & Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Water & Tank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFields.map((field) => (
                <PaddyFieldRow
                  key={field._id}
                  field={field}
                  canEdit={canEditFields}
                  isEditing={editingField?._id === field._id}
                  onEdit={setEditingField}
                  onUpdate={updatePaddyField}
                  getStatusColor={getStatusColor}
                  getSoilTypeColor={getSoilTypeColor}
                  getSeasonColor={getSeasonColor}
                />
              ))}
            </tbody>
          </table>
          
          {filteredFields.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No paddy fields found</p>
              <p className="text-gray-400">
                {paddyFields.length === 0 
                  ? (canCreateFields ? 'Create your first paddy field to get started' : 'No paddy fields available')
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Paddy Field Modal */}
      {showCreateForm && (
        <CreatePaddyFieldModal
          tanks={tanks}
          onClose={() => setShowCreateForm(false)}
          onCreate={createPaddyField}
        />
      )}
    </div>
  );
};

// Paddy Field Row Component
const PaddyFieldRow = ({ 
  field, 
  canEdit, 
  isEditing, 
  onEdit, 
  onUpdate,
  getStatusColor,
  getSoilTypeColor,
  getSeasonColor
}) => {
  const [editData, setEditData] = useState({
    status: field.status,
    currentCropSeason: field.currentCropSeason,
    waterRequirement: field.waterRequirement,
    cropType: field.cropType,
    irrigationMethod: field.irrigationMethod
  });

  const handleSave = () => {
    onUpdate(field._id, editData);
  };

  const handleCancel = () => {
    setEditData({
      status: field.status,
      currentCropSeason: field.currentCropSeason,
      waterRequirement: field.waterRequirement,
      cropType: field.cropType,
      irrigationMethod: field.irrigationMethod
    });
    onEdit(null);
  };

  if (isEditing) {
    return (
      <tr className="bg-yellow-50 border-l-4 border-yellow-400">
        <td className="px-6 py-4">
          <div>
            <div className="text-sm font-medium text-gray-900">{field.name}</div>
            <div className="text-xs text-gray-500">Created by {field.createdBy?.firstName} {field.createdBy?.lastName}</div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">{field.area} {field.areaUnit}</div>
          <div className="text-xs text-gray-500">{field.location}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSoilTypeColor(field.soilType)}`}>
            {field.soilType}
          </span>
          <div className="text-xs text-gray-500 mt-1 capitalize">{field.cropType}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="space-y-2">
            <select
              value={editData.status}
              onChange={(e) => setEditData({...editData, status: e.target.value})}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="active">Active</option>
              <option value="under_cultivation">Under Cultivation</option>
              <option value="fallow">Fallow</option>
              <option value="preparation">Preparation</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={editData.currentCropSeason}
              onChange={(e) => setEditData({...editData, currentCropSeason: e.target.value})}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="maha">Maha</option>
              <option value="yala">Yala</option>
              <option value="off_season">Off Season</option>
              <option value="none">None</option>
            </select>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <input
            type="number"
            min="0"
            value={editData.waterRequirement}
            onChange={(e) => setEditData({...editData, waterRequirement: parseInt(e.target.value) || 0})}
            className="w-20 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="L/day"
          />
          <div className="text-xs text-gray-500 mt-1">{field.associatedTank?.name}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
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
          <div className="text-sm font-medium text-gray-900">{field.name}</div>
          <div className="text-xs text-gray-500">
            by {field.createdBy?.firstName} {field.createdBy?.lastName} ({field.createdBy?.role})
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{field.area} {field.areaUnit}</div>
        <div className="text-xs text-gray-500">{field.location}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSoilTypeColor(field.soilType)}`}>
          {field.soilType}
        </span>
        <div className="text-xs text-gray-500 mt-1 capitalize">{field.cropType} · {field.irrigationMethod}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(field.status)}`}>
          {field.status.replace('_', ' ')}
        </span>
        <div className="mt-1">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeasonColor(field.currentCropSeason)}`}>
            {field.currentCropSeason}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <Droplets className="h-4 w-4 mr-1 text-blue-500" />
          <span className="text-sm font-medium text-gray-900">{field.waterRequirement} L/day</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">{field.associatedTank?.name}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex space-x-2">
          {canEdit && (
            <button
              onClick={() => onEdit(field)}
              className="flex items-center px-2 py-1 text-green-600 hover:text-green-900 transition-colors"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
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

// Create Paddy Field Modal Component
const CreatePaddyFieldModal = ({ tanks, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    area: '',
    areaUnit: 'acres',
    associatedTank: '',
    soilType: 'loam',
    cropType: 'rice',
    currentCropSeason: 'none',
    irrigationMethod: 'flood',
    waterRequirement: '',
    lastCultivationDate: '',
    nextCultivationDate: ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Field name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.area || formData.area <= 0) newErrors.area = 'Valid area is required';
    if (!formData.associatedTank) newErrors.associatedTank = 'Associated tank is required';
    if (formData.waterRequirement && formData.waterRequirement < 0) newErrors.waterRequirement = 'Water requirement cannot be negative';
    
    // Date validation
    if (formData.lastCultivationDate && formData.nextCultivationDate) {
      if (new Date(formData.nextCultivationDate) <= new Date(formData.lastCultivationDate)) {
        newErrors.nextCultivationDate = 'Next cultivation date must be after last cultivation date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const fieldData = {
      ...formData,
      area: parseFloat(formData.area),
      waterRequirement: formData.waterRequirement ? parseInt(formData.waterRequirement) : 0,
      lastCultivationDate: formData.lastCultivationDate || null,
      nextCultivationDate: formData.nextCultivationDate || null
    };

    onCreate(fieldData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Create New Paddy Field</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="md:col-span-2">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Field Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Paddy Field A1"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.location ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Kandy District, Block A"
              />
              {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Area *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  required
                  min="0.1"
                  step="0.1"
                  value={formData.area}
                  onChange={(e) => setFormData({...formData, area: e.target.value})}
                  className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.area ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="25.5"
                />
                <select
                  value={formData.areaUnit}
                  onChange={(e) => setFormData({...formData, areaUnit: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="acres">Acres</option>
                  <option value="hectares">Hectares</option>
                </select>
              </div>
              {errors.area && <p className="mt-1 text-sm text-red-600">{errors.area}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Associated Tank *
              </label>
              <select
                required
                value={formData.associatedTank}
                onChange={(e) => setFormData({...formData, associatedTank: e.target.value})}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.associatedTank ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select Tank</option>
                {tanks.map(tank => (
                  <option key={tank._id} value={tank._id}>
                    {tank.name} - {tank.location}
                  </option>
                ))}
              </select>
              {errors.associatedTank && <p className="mt-1 text-sm text-red-600">{errors.associatedTank}</p>}
            </div>

            {/* Agricultural Information */}
            <div className="md:col-span-2 mt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Agricultural Information</h4>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Soil Type
              </label>
              <select
                value={formData.soilType}
                onChange={(e) => setFormData({...formData, soilType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="clay">Clay</option>
                <option value="loam">Loam</option>
                <option value="sandy">Sandy</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Crop Type
              </label>
              <select
                value={formData.cropType}
                onChange={(e) => setFormData({...formData, cropType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="rice">Rice</option>
                <option value="paddy">Paddy</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Crop Season
              </label>
              <select
                value={formData.currentCropSeason}
                onChange={(e) => setFormData({...formData, currentCropSeason: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="none">None</option>
                <option value="maha">Maha (Oct-Mar)</option>
                <option value="yala">Yala (Apr-Sep)</option>
                <option value="off_season">Off Season</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Irrigation Method
              </label>
              <select
                value={formData.irrigationMethod}
                onChange={(e) => setFormData({...formData, irrigationMethod: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="flood">Flood Irrigation</option>
                <option value="sprinkler">Sprinkler</option>
                <option value="drip">Drip Irrigation</option>
                <option value="mixed">Mixed Methods</option>
              </select>
            </div>

            {/* Water Management */}
            <div className="md:col-span-2 mt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Water Management</h4>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Water Requirement (L/day)
              </label>
              <input
                type="number"
                min="0"
                value={formData.waterRequirement}
                onChange={(e) => setFormData({...formData, waterRequirement: e.target.value})}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.waterRequirement ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="500"
              />
              {errors.waterRequirement && <p className="mt-1 text-sm text-red-600">{errors.waterRequirement}</p>}
            </div>

            <div></div> {/* Empty div for spacing */}

            {/* Cultivation Dates */}
            <div className="md:col-span-2 mt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Cultivation Schedule</h4>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Cultivation Date
              </label>
              <input
                type="date"
                value={formData.lastCultivationDate}
                onChange={(e) => setFormData({...formData, lastCultivationDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Next Cultivation Date
              </label>
              <input
                type="date"
                value={formData.nextCultivationDate}
                onChange={(e) => setFormData({...formData, nextCultivationDate: e.target.value})}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.nextCultivationDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.nextCultivationDate && <p className="mt-1 text-sm text-red-600">{errors.nextCultivationDate}</p>}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Paddy Field
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaddyFieldManagement;