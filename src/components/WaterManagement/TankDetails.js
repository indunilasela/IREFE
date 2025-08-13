import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Droplets, 
  Edit, 
  Calendar, 
  MapPin, 
  Save,
  Trash2,
  Building,
  Navigation
} from 'lucide-react';

// Tank Card Component
const TankCard = ({ 
  tank, 
  canUpdateAvailability, 
  canUpdateAllDetails, 
  canDelete,
  onEditDetails, 
  onEditAvailability,
  onUpdateDetails, 
  onUpdateAvailability,
  onDelete,
  isEditingDetails, 
  isEditingAvailability,
  clickable = true // New prop to control clickability
}) => {
  const navigate = useNavigate();
  const [editDetailsData, setEditDetailsData] = useState(tank);
  const [editAvailabilityData, setEditAvailabilityData] = useState(tank.availabilityCapacity);

  const handleSaveDetails = () => {
    onUpdateDetails(tank.id, editDetailsData);
  };

  const handleSaveAvailability = () => {
    onUpdateAvailability(tank.id, editAvailabilityData);
  };

  const handleCancelDetails = () => {
    setEditDetailsData(tank);
    onEditDetails(null);
  };

  const handleCancelAvailability = () => {
    setEditAvailabilityData(tank.availabilityCapacity);
    onEditAvailability(null);
  };

  const handleCardClick = (e) => {
    // Don't navigate if clicking on buttons or if editing
    if (e.target.closest('button') || isEditingDetails || isEditingAvailability || !clickable) {
      return;
    }
    navigate(`/tanks/${tank.id}`);
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-lg p-6 ${
        clickable ? 'cursor-pointer hover:shadow-xl transition-shadow duration-300' : ''
      }`}
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{tank.name}</h3>
            <span className={`px-2 py-1 text-xs rounded-full ${
              tank.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {tank.status?.charAt(0).toUpperCase() + tank.status?.slice(1)}
            </span>
          </div>
        </div>
        <div className="flex space-x-1">
          {canUpdateAllDetails && !isEditingDetails && !isEditingAvailability && (
            <button
              onClick={() => onEditDetails(tank)}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              title="Edit all details"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
          {canUpdateAvailability && !isEditingDetails && !isEditingAvailability && (
            <button
              onClick={() => onEditAvailability(tank)}
              className="p-2 text-gray-400 hover:text-green-600 transition-colors"
              title="Edit availability capacity"
            >
              <Droplets className="h-4 w-4" />
            </button>
          )}
          {canDelete && !isEditingDetails && !isEditingAvailability && (
            <button
              onClick={() => onDelete(tank.id, tank.name)}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete tank"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Availability Level Indicator */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Availability Level</span>
          <span>{tank.availabilityPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              tank.availabilityPercentage > 70 ? 'bg-green-500' :
              tank.availabilityPercentage > 40 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${tank.availabilityPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Tank Details */}
      <div className="space-y-3">
        {isEditingDetails ? (
          <EditDetailsForm 
            data={editDetailsData}
            onChange={setEditDetailsData}
            onSave={handleSaveDetails}
            onCancel={handleCancelDetails}
          />
        ) : isEditingAvailability ? (
          <EditAvailabilityForm 
            data={editAvailabilityData}
            fullCapacity={tank.fullCapacity}
            onChange={setEditAvailabilityData}
            onSave={handleSaveAvailability}
            onCancel={handleCancelAvailability}
          />
        ) : (
          <TankDetailsDisplay tank={tank} />
        )}
      </div>
    </div>
  );
};

// Edit Details Form Component
const EditDetailsForm = ({ data, onChange, onSave, onCancel }) => (
  <div className="space-y-3">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Name of Reservoir</label>
      <input
        type="text"
        value={data.name}
        onChange={(e) => onChange({...data, name: e.target.value})}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Range</label>
      <input
        type="text"
        value={data.range}
        onChange={(e) => onChange({...data, range: e.target.value})}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
      <input
        type="text"
        value={data.division}
        onChange={(e) => onChange({...data, division: e.target.value})}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Scheme</label>
      <input
        type="text"
        value={data.scheme}
        onChange={(e) => onChange({...data, scheme: e.target.value})}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Capacity</label>
        <input
          type="number"
          value={data.fullCapacity}
          onChange={(e) => onChange({...data, fullCapacity: parseInt(e.target.value)})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
        <input
          type="number"
          value={data.availabilityCapacity}
          onChange={(e) => onChange({...data, availabilityCapacity: parseInt(e.target.value)})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
      <select
        value={data.status}
        onChange={(e) => onChange({...data, status: e.target.value})}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="maintenance">Maintenance</option>
      </select>
    </div>
    <div className="flex space-x-2 pt-2">
      <button
        onClick={onSave}
        className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        <Save className="h-4 w-4 mr-1" />
        Save All
      </button>
      <button
        onClick={onCancel}
        className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
      >
        Cancel
      </button>
    </div>
  </div>
);

// Edit Availability Form Component
const EditAvailabilityForm = ({ data, fullCapacity, onChange, onSave, onCancel }) => (
  <div className="space-y-3">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Availability Capacity (Max: {fullCapacity})
      </label>
      <input
        type="number"
        value={data}
        max={fullCapacity}
        min="0"
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      <p className="text-xs text-gray-500 mt-1">
        Percentage: {Math.round((data / fullCapacity) * 100)}%
      </p>
    </div>
    <div className="flex space-x-2 pt-2">
      <button
        onClick={onSave}
        className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
      >
        <Save className="h-4 w-4 mr-1" />
        Update
      </button>
      <button
        onClick={onCancel}
        className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
      >
        Cancel
      </button>
    </div>
  </div>
);

// Tank Details Display Component
const TankDetailsDisplay = ({ tank }) => (
  <>
    <div className="flex items-center text-sm text-gray-600">
      <Navigation className="h-4 w-4 mr-2" />
      <span>Range: {tank.range}</span>
    </div>
    <div className="flex items-center text-sm text-gray-600">
      <Building className="h-4 w-4 mr-2" />
      <span>Division: {tank.division}</span>
    </div>
    <div className="flex items-center text-sm text-gray-600">
      <MapPin className="h-4 w-4 mr-2" />
      <span>Scheme: {tank.scheme}</span>
    </div>
    <div className="flex items-center text-sm text-gray-600">
      <Droplets className="h-4 w-4 mr-2" />
      <span>{tank.availabilityCapacity} / {tank.fullCapacity}</span>
    </div>
    <div className="text-xs text-gray-500 pt-2 border-t">
      <div className="flex items-center">
        <Calendar className="h-3 w-3 mr-1" />
        Last updated: {new Date(tank.lastUpdateDate).toLocaleString()}
      </div>
      {tank.lastUpdatedBy && (
        <div className="mt-1">
          Updated by: {tank.lastUpdatedBy.firstName} {tank.lastUpdatedBy.lastName} ({tank.lastUpdatedBy.role})
        </div>
      )}
    </div>
  </>
);

// Add Tank Modal Component
const AddTankModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    range: '',
    division: '',
    scheme: '',
    fullCapacity: '',
    availabilityCapacity: ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.range.trim()) newErrors.range = 'Range is required';
    if (!formData.division.trim()) newErrors.division = 'Division is required';
    if (!formData.scheme.trim()) newErrors.scheme = 'Scheme is required';
    if (!formData.fullCapacity || formData.fullCapacity <= 0) newErrors.fullCapacity = 'Full capacity must be greater than 0';
    if (formData.availabilityCapacity < 0) newErrors.availabilityCapacity = 'Availability capacity cannot be negative';
    if (parseInt(formData.availabilityCapacity) > parseInt(formData.fullCapacity)) {
      newErrors.availabilityCapacity = 'Availability capacity cannot exceed full capacity';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onAdd(formData);
    }
  };

  const availabilityPercentage = formData.fullCapacity && formData.availabilityCapacity 
    ? Math.round((formData.availabilityCapacity / formData.fullCapacity) * 100) 
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Tank</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name of Reservoir *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Mahaweli Main Tank"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Range *</label>
            <input
              type="text"
              required
              value={formData.range}
              onChange={(e) => setFormData({...formData, range: e.target.value})}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.range ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Kandy Range"
            />
            {errors.range && <p className="text-red-500 text-xs mt-1">{errors.range}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Division *</label>
            <input
              type="text"
              required
              value={formData.division}
              onChange={(e) => setFormData({...formData, division: e.target.value})}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.division ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Central Division"
            />
            {errors.division && <p className="text-red-500 text-xs mt-1">{errors.division}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Scheme *</label>
            <input
              type="text"
              required
              value={formData.scheme}
              onChange={(e) => setFormData({...formData, scheme: e.target.value})}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.scheme ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Mahaweli Scheme B"
            />
            {errors.scheme && <p className="text-red-500 text-xs mt-1">{errors.scheme}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Capacity *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.fullCapacity}
                onChange={(e) => setFormData({...formData, fullCapacity: e.target.value})}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.fullCapacity ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="100000"
              />
              {errors.fullCapacity && <p className="text-red-500 text-xs mt-1">{errors.fullCapacity}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Availability Capacity *
              </label>
              <input
                type="number"
                required
                min="0"
                max={formData.fullCapacity || undefined}
                value={formData.availabilityCapacity}
                onChange={(e) => setFormData({...formData, availabilityCapacity: e.target.value})}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.availabilityCapacity ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="75000"
              />
              {errors.availabilityCapacity && <p className="text-red-500 text-xs mt-1">{errors.availabilityCapacity}</p>}
            </div>
          </div>

          {/* Availability Percentage Display */}
          {formData.fullCapacity && formData.availabilityCapacity && (
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Availability Percentage</span>
                <span className="font-medium">{availabilityPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    availabilityPercentage > 70 ? 'bg-green-500' :
                    availabilityPercentage > 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(availabilityPercentage, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
          
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

export { TankCard, EditDetailsForm, EditAvailabilityForm, TankDetailsDisplay, AddTankModal };
