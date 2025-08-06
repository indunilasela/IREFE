// components/MainCanalForm.jsx - MAIN CANAL CREATION FORM
import React, { useState } from 'react';
import { Folder as Tree, X } from 'lucide-react';

const MainCanalForm = ({ onClose, onCreate, availableTanks, availableFA, availableIrrigators }) => {
  const [formData, setFormData] = useState({
    canalName: '',
    tankName: '',
    selectFA: [],
    selectIrrigator: [],
    startDay: '',
    endDay: '',
    canal: 'close',
    flowRate: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  console.log('🔍 MainCanalForm - Available FA:', availableFA?.length);
  console.log('🔍 MainCanalForm - Available Irrigators:', availableIrrigators?.length);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('📝 Submitting main canal form:', formData);
    try {
      await onCreate(formData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFASelection = (faId) => {
    const currentFA = formData.selectFA || [];
    const newFA = currentFA.includes(faId) 
      ? currentFA.filter(id => id !== faId)
      : [...currentFA, faId];
    setFormData({...formData, selectFA: newFA});
  };

  const handleIrrigatorSelection = (irrId) => {
    const currentIrr = formData.selectIrrigator || [];
    const newIrr = currentIrr.includes(irrId) 
      ? currentIrr.filter(id => id !== irrId)
      : [...currentIrr, irrId];
    setFormData({...formData, selectIrrigator: newIrr});
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Tree className="h-5 w-5 mr-2 text-green-600" />
            Create Main Canal
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Canal Name *
            </label>
            <input
              type="text"
              required
              value={formData.canalName}
              onChange={(e) => setFormData({...formData, canalName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter canal name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Tank *
            </label>
            <select
              required
              value={formData.tankName}
              onChange={(e) => setFormData({...formData, tankName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Choose a tank...</option>
              {availableTanks.map(tank => (
                <option key={tank._id} value={tank.name}>
                  {tank.name} - {tank.location} 
                  {tank.currentWaterLevel && ` (${tank.currentWaterLevel}% full)`}
                </option>
              ))}
            </select>
            {availableTanks.length === 0 && (
              <p className="text-xs text-red-500 mt-1">No tanks available. Please create tanks first.</p>
            )}
          </div>

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
                      checked={formData.selectFA.includes(fa._id)}
                      onChange={() => handleFASelection(fa._id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                      checked={formData.selectIrrigator.includes(irr._id)}
                      onChange={() => handleIrrigatorSelection(irr._id)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                onChange={(e) => setFormData({...formData, canal: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="close">Close</option>
                <option value="open">Open</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Flow Rate (L/s) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.flowRate}
                onChange={(e) => setFormData({...formData, flowRate: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0"
              />
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isLoading || availableTanks.length === 0}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Main Canal'
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

export default MainCanalForm;