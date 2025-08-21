// components/UpdateCanalForm.jsx - CANAL UPDATE FORM WITH ASSIGNMENT EDITING
import React, { useState, useContext } from 'react';
import { Edit, X, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const UpdateCanalForm = ({ canal, onClose, onUpdate, availableFA, availableIrrigators }) => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    startDay: canal.startDay?.split ? canal.startDay.split('T')[0] : new Date(canal.startDay || Date.now()).toISOString().split('T')[0],
    endDay: canal.endDay?.split ? canal.endDay.split('T')[0] : new Date(canal.endDay || Date.now()).toISOString().split('T')[0],
    canal: canal.canalStatus || canal.status || 'close',
    flowRate: canal.flowRate || 0,
    sluiceOpeningSize: canal.sluiceOpeningSize || 0,
    // Add assignment fields - handle multiple field names and ensure string IDs
    selectFA: (canal.assignedFA?.map(fa => typeof fa === 'object' ? String(fa._id) : String(fa))) || [],
    selectIrrigator: ((canal.assignedIrrigators || canal.irrigators || canal.assignedIrrigator || [])?.map(irr => typeof irr === 'object' ? String(irr._id) : String(irr))) || []
  });
  const [isLoading, setIsLoading] = useState(false);

  // Check if current user is EA (only EA can manage assignments)
  const canManageAssignments = user?.role === 'EA';

  console.log('🔍 UpdateCanalForm - Canal:', canal);
  console.log('🔍 UpdateCanalForm - User role:', user?.role);
  console.log('🔍 UpdateCanalForm - Can manage assignments:', canManageAssignments);
  console.log('🔍 UpdateCanalForm - Available FA:', availableFA?.length);
  console.log('🔍 UpdateCanalForm - Available Irrigators:', availableIrrigators?.length);
  console.log('🔍 UpdateCanalForm - Current FA assignments:', formData.selectFA);
  console.log('🔍 UpdateCanalForm - Current Irrigator assignments:', formData.selectIrrigator);
  
  // Debug assignment data
  if (canal.assignedIrrigators) {
    console.log('🚿 Canal.assignedIrrigators raw:', canal.assignedIrrigators);
    console.log('🚿 Canal.assignedIrrigators processed:', canal.assignedIrrigators?.map(irr => typeof irr === 'object' ? String(irr._id) : String(irr)));
  }
  if (canal.assignedFA) {
    console.log('👥 Canal.assignedFA raw:', canal.assignedFA);
    console.log('👥 Canal.assignedFA processed:', canal.assignedFA?.map(fa => typeof fa === 'object' ? String(fa._id) : String(fa)));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const canalId = canal.id || canal._id;
    console.log('📝 Submitting canal update:', canalId, formData);
    
    try {
      // If user can manage assignments and assignments have changed, update them via separate endpoint
      if (canManageAssignments && assignmentChanged()) {
        console.log('👥 Updating canal assignments...');
        await updateCanalAssignments(canalId, {
          selectFA: formData.selectFA,
          selectIrrigator: formData.selectIrrigator
        });
      }
      
      // Update other canal details
      await onUpdate(canalId, formData);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if assignments have changed
  const assignmentChanged = () => {
    const currentFA = (canal.assignedFA?.map(fa => typeof fa === 'object' ? fa._id : fa)) || [];
    const currentIrrigators = (canal.assignedIrrigators?.map(irr => typeof irr === 'object' ? irr._id : irr)) || [];
    
    const faChanged = JSON.stringify(currentFA.sort()) !== JSON.stringify(formData.selectFA.sort());
    const irrigatorChanged = JSON.stringify(currentIrrigators.sort()) !== JSON.stringify(formData.selectIrrigator.sort());
    
    return faChanged || irrigatorChanged;
  };

  // Update canal user assignments via new endpoint
  const updateCanalAssignments = async (canalId, assignmentData) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/ea/canals/${canalId}/users`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assignmentData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Canal assignments updated:', result);
        return result;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update canal assignments');
      }
    } catch (error) {
      console.error('❌ Error updating canal assignments:', error);
      throw error;
    }
  };

  const handleFASelection = (faId) => {
    const currentFA = formData.selectFA || [];
    const stringFAId = String(faId); // Ensure string comparison
    const newFA = currentFA.includes(stringFAId) 
      ? currentFA.filter(id => id !== stringFAId)
      : [...currentFA, stringFAId];
    setFormData({...formData, selectFA: newFA});
    console.log('👥 FA selection changed:', newFA);
    console.log('👥 Clicked FA ID:', stringFAId);
    console.log('👥 Current selections:', currentFA);
  };

  const handleIrrigatorSelection = (irrId) => {
    const currentIrr = formData.selectIrrigator || [];
    const stringIrrId = String(irrId); // Ensure string comparison
    const newIrr = currentIrr.includes(stringIrrId) 
      ? currentIrr.filter(id => id !== stringIrrId)
      : [...currentIrr, stringIrrId];
    setFormData({...formData, selectIrrigator: newIrr});
    console.log('🚿 Irrigator selection changed:', newIrr);
    console.log('🚿 Clicked irrigator ID:', stringIrrId);
    console.log('🚿 Current selections:', currentIrr);
  };

  // Handle canal status change - auto set flow rate to 0 when closed
  const handleCanalStatusChange = (status) => {
    const newFormData = {
      ...formData, 
      canal: status
    };
    
    // If canal is closed, set flow rate and sluice opening size to 0
    if (status === 'close') {
      newFormData.flowRate = 0;
      newFormData.sluiceOpeningSize = 0;
    }
    
    setFormData(newFormData);
    console.log('🚰 Canal status changed to:', status, 'Flow rate:', newFormData.flowRate, 'Sluice opening size:', newFormData.sluiceOpeningSize);
  };

  const getStatusChangeMessage = () => {
    const currentStatus = canal.canalStatus || canal.status || 'close';
    if (formData.canal !== currentStatus) {
      const action = formData.canal === 'open' ? 'opening' : 'closing';
      return (
        <div className={`mt-3 p-3 rounded-lg ${formData.canal === 'open' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <p className="text-sm font-medium">
            ⚠️ You are {action} this canal. This will send notifications to all operational staff.
          </p>
        </div>
      );
    }
    return null;
  };

  const getAssignmentChangeMessage = () => {
    if (!canManageAssignments) return null;
    
    const currentFA = (canal.assignedFA?.map(fa => typeof fa === 'object' ? fa._id : fa)) || [];
    const currentIrrigators = (canal.assignedIrrigators?.map(irr => typeof irr === 'object' ? irr._id : irr)) || [];
    
    const faChanged = JSON.stringify(currentFA.sort()) !== JSON.stringify(formData.selectFA.sort());
    const irrigatorChanged = JSON.stringify(currentIrrigators.sort()) !== JSON.stringify(formData.selectIrrigator.sort());
    
    if (faChanged || irrigatorChanged) {
      return (
        <div className="mt-3 p-3 rounded-lg bg-blue-50 text-blue-800">
          <p className="text-sm font-medium">
            👥 Assignment changes detected. Updated users will receive notifications.
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Edit className="h-5 w-5 mr-2 text-orange-600" />
            Update Canal: {canal.name || canal.canalName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Canal Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Type:</p>
              <p className="font-medium capitalize">{canal.type || canal.canalType}</p>
            </div>
            <div>
              <p className="text-gray-600">Code:</p>
              <p className="font-medium font-mono">{canal.code || canal.canalCode}</p>
            </div>
            <div>
              <p className="text-gray-600">Current Status:</p>
              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                (canal.canalStatus || canal.status) === 'open' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {(canal.canalStatus || canal.status || 'close').toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-gray-600">Last Updated:</p>
              <p className="font-medium">
                {canal.lastUpdateDay 
                  ? new Date(canal.lastUpdateDay).toLocaleDateString()
                  : 'No updates'
                }
              </p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Operational Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Operational Settings</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Day *
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDay}
                  onChange={(e) => setFormData({...formData, startDay: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Day *
                </label>
                <input
                  type="date"
                  required
                  value={formData.endDay}
                  onChange={(e) => setFormData({...formData, endDay: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Canal Status *
                </label>
                <select
                  value={formData.canal}
                  onChange={(e) => handleCanalStatusChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="close">Close</option>
                  <option value="open">Open</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Flow Rate (cusec) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.flowRate}
                  onChange={(e) => setFormData({...formData, flowRate: Number(e.target.value)})}
                  disabled={formData.canal === 'close'}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    formData.canal === 'close' ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="0"
                />
                {formData.canal === 'close' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Flow rate is automatically set to 0 when canal is closed
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sluice Opening Size (inch) 
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  required
                  value={formData.sluiceOpeningSize}
                  onChange={(e) => setFormData({...formData, sluiceOpeningSize: Number(e.target.value)})}
                  disabled={formData.canal === 'close'}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    formData.canal === 'close' ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="0.0"
                />
                {formData.canal === 'close' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Sluice opening size is automatically set to 0 when canal is closed
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Assignment Settings - Only show for EA users */}
          {canManageAssignments && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Staff Assignments</h3>
              
              {/* FA Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Field Assistants (FA)
                </label>
                <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                  {(!availableFA || availableFA.length === 0) ? (
                    <p className="text-sm text-gray-500">No FA users available</p>
                  ) : (
                    availableFA.map(fa => (
                      <label key={fa._id} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={formData.selectFA.includes(String(fa._id))}
                          onChange={() => handleFASelection(fa._id)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-sm">
                          {fa.firstName} {fa.lastName} ({fa.district})
                        </span>
                      </label>
                    ))
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Selected: {formData.selectFA.length} FA(s) | Available: {availableFA?.length || 0}
                </p>
              </div>

              {/* Irrigator Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Irrigators
                </label>
                <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                  {(!availableIrrigators || availableIrrigators.length === 0) ? (
                    <p className="text-sm text-gray-500">No Irrigator users available</p>
                  ) : (
                    availableIrrigators.map(irr => (
                      <label key={irr._id} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={formData.selectIrrigator.includes(String(irr._id))}
                          onChange={() => handleIrrigatorSelection(irr._id)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-sm">
                          {irr.firstName} {irr.lastName} ({irr.district})
                        </span>
                      </label>
                    ))
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Selected: {formData.selectIrrigator.length} Irrigator(s) | Available: {availableIrrigators?.length || 0}
                </p>
              </div>
            </div>
          )}

          {/* Change notifications */}
          {getStatusChangeMessage()}
          {getAssignmentChangeMessage()}
          
          <div className="flex space-x-3 pt-6 border-t">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Canal
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
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

export default UpdateCanalForm;