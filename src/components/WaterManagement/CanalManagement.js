// components/CanalManagement.jsx - MAIN COMPONENT
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Folder as Tree, 
  Plus, 
  RefreshCw,
  Settings,
  Database,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

// Import child components
import CanalTree from './CanalTree';
import MainCanalForm from './MainCanalForm';
import SubCanalForm from './SubCanalForm';
import UpdateCanalForm from './UpdateCanalForm';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CanalManagement = () => {
  const { user } = useAuth();
  const [canalHierarchy, setCanalHierarchy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [showMainCanalForm, setShowMainCanalForm] = useState(false);
  const [showSubCanalForm, setShowSubCanalForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectedCanal, setSelectedCanal] = useState(null);
  const [availableTanks, setAvailableTanks] = useState([]);
  const [availableParents, setAvailableParents] = useState([]);
  const [availableFA, setAvailableFA] = useState([]);
  const [availableIrrigators, setAvailableIrrigators] = useState([]);
  const [showMyAssigned, setShowMyAssigned] = useState(false);
  const [myAssignedCanals, setMyAssignedCanals] = useState([]);

  // Enhanced Permission System
  const canCreate = user?.role === 'EA';
  const canUpdate = ['DIA', 'DA', 'EA', 'SA'].includes(user?.role);
  const isOperational = ['FA', 'Irrigator'].includes(user?.role);
  const isReadOnly = ['Admin', 'Farmer'].includes(user?.role);

  useEffect(() => {
    fetchCanalHierarchy();
    if (canCreate) {
      fetchAvailableTanks();
      fetchAvailableParents();
    }
    // Always fetch FA and Irrigators for assignments
    fetchAvailableFA();
    fetchAvailableIrrigators();
    
    if (isOperational) {
      fetchMyAssignedCanals();
    }
  }, []);

  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  const fetchCanalHierarchy = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/ea/canals/hierarchy`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCanalHierarchy(data.data || []);
        console.log('📊 Canal hierarchy loaded:', data.data?.length, 'tanks');
      } else {
        throw new Error('Failed to fetch canal hierarchy');
      }
    } catch (error) {
      console.error('Error fetching canal hierarchy:', error);
      toast.error('Failed to load canal hierarchy');
      setCanalHierarchy([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTanks = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/ea/canals/available-tanks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableTanks(data.data || []);
      } else {
        throw new Error('Failed to fetch available tanks');
      }
    } catch (error) {
      console.error('Error fetching tanks:', error);
      toast.error('Failed to load available tanks');
      setAvailableTanks([]);
    }
  };

  const fetchAvailableParents = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/ea/canals/available-parents`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableParents(data.data || []);
      } else {
        throw new Error('Failed to fetch parent canals');
      }
    } catch (error) {
      console.error('Error fetching parent canals:', error);
      toast.error('Failed to load parent canals');
      setAvailableParents([]);
    }
  };

  const fetchAvailableFA = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/ea/canals/available-fa`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableFA(data.data || []);
        console.log('👥 Available FA loaded:', data.data?.length);
      } else {
        console.log('⚠️ Failed to fetch FA users - might not have permission');
        setAvailableFA([]);
      }
    } catch (error) {
      console.error('Error fetching FA users:', error);
      setAvailableFA([]);
    }
  };

  const fetchAvailableIrrigators = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/ea/canals/available-irrigators`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableIrrigators(data.data || []);
        console.log('🚿 Available Irrigators loaded:', data.data?.length);
      } else {
        console.log('⚠️ Failed to fetch Irrigator users - might not have permission');
        setAvailableIrrigators([]);
      }
    } catch (error) {
      console.error('Error fetching Irrigators:', error);
      setAvailableIrrigators([]);
    }
  };

  const fetchMyAssignedCanals = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/ea/canals/my-assigned`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMyAssignedCanals(data.data.canals || []);
        console.log('📋 My assigned canals loaded:', data.data.canals?.length);
      }
    } catch (error) {
      console.error('Error fetching assigned canals:', error);
    }
  };

  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const createMainCanal = async (formData) => {
    try {
      const token = getAuthToken();
      console.log('🏗️ Creating main canal:', formData);
      
      const response = await fetch(`${API_BASE_URL}/ea/canals/main`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Main canal created successfully! 🚰');
        console.log('✅ Main canal created:', result.data);
        await fetchCanalHierarchy();
        await fetchMyAssignedCanals();
        setShowMainCanalForm(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create main canal');
      }
    } catch (error) {
      console.error('❌ Error creating main canal:', error);
      toast.error(`Failed to create main canal: ${error.message}`);
    }
  };

  const createSubCanal = async (formData) => {
    try {
      const token = getAuthToken();
      console.log('🌊 Creating sub canal:', formData);
      
      const response = await fetch(`${API_BASE_URL}/ea/canals/sub`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Sub canal created successfully! 🌊');
        console.log('✅ Sub canal created:', result.data);
        await fetchCanalHierarchy();
        await fetchMyAssignedCanals();
        setShowSubCanalForm(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create sub canal');
      }
    } catch (error) {
      console.error('❌ Error creating sub canal:', error);
      toast.error(`Failed to create sub canal: ${error.message}`);
    }
  };

  const updateCanal = async (canalId, formData) => {
    try {
      const token = getAuthToken();
      console.log('🔄 Updating canal:', canalId, formData);
      
      const response = await fetch(`${API_BASE_URL}/ea/canals/${canalId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Canal updated successfully! ✅');
        console.log('✅ Canal updated:', result.data);
        await fetchCanalHierarchy();
        await fetchMyAssignedCanals();
        setShowUpdateForm(false);
        setSelectedCanal(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update canal');
      }
    } catch (error) {
      console.error('❌ Error updating canal:', error);
      toast.error(`Failed to update canal: ${error.message}`);
    }
  };

  const handleCanalSelect = (canal) => {
    setSelectedCanal(canal);
    setShowUpdateForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading canal network...</p>
          <p className="text-gray-400 text-sm mt-2">Building hierarchy tree...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Tree className="h-8 w-8 mr-3 text-green-600" />
            Canal Management System
          </h1>
          <p className="mt-2 text-gray-600">
            Hierarchical canal network with real-time flow control and notifications
          </p>
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <Database className="h-4 w-4 mr-1" />
            <span>Click any tank to expand → Click any canal to edit</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* My Assigned Canals Toggle for Operational Users */}
          {isOperational && (
            <div className="flex items-center bg-gray-100 rounded-lg">
              <button
                onClick={() => setShowMyAssigned(false)}
                className={`px-4 py-2 rounded-l-lg transition-colors ${
                  !showMyAssigned 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-transparent text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Canals
              </button>
              <button
                onClick={() => setShowMyAssigned(true)}
                className={`px-4 py-2 rounded-r-lg transition-colors ${
                  showMyAssigned 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-transparent text-gray-700 hover:bg-gray-200'
                }`}
              >
                My Assigned ({myAssignedCanals.length})
              </button>
            </div>
          )}
          
          <button
            onClick={fetchCanalHierarchy}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            title="Refresh hierarchy"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          
          {canCreate && (
            <>
              <button
                onClick={() => {
                  console.log('🏗️ Opening main canal form');
                  setShowMainCanalForm(true);
                }}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Main Canal
              </button>
              
              <button
                onClick={() => {
                  console.log('🌊 Opening sub canal form');
                  setShowSubCanalForm(true);
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Sub Canal
              </button>
            </>
          )}
        </div>
      </div>

      {/* Network Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tanks</p>
              <p className="text-2xl font-bold text-blue-600">{canalHierarchy.length}</p>
            </div>
            <Database className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Main Canals</p>
              <p className="text-2xl font-bold text-green-600">
                {canalHierarchy.reduce((count, tank) => count + (tank.children?.length || 0), 0)}
              </p>
            </div>
            <Tree className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Branch Canals</p>
              <p className="text-2xl font-bold text-yellow-600">
                {canalHierarchy.reduce((count, tank) => {
                  return count + tank.children?.reduce((subCount, main) => 
                    subCount + (main.children?.length || 0), 0) || 0;
                }, 0)}
              </p>
            </div>
            <Activity className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {showMyAssigned ? 'My Assigned' : 'Active Canals'}
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {showMyAssigned ? myAssignedCanals.length : (() => {
                  const countActive = (nodes) => {
                    let count = 0;
                    nodes.forEach(node => {
                      if (node.type !== 'tank' && node.canalStatus === 'open') count++;
                      if (node.children) count += countActive(node.children);
                    });
                    return count;
                  };
                  return countActive(canalHierarchy);
                })()}
              </p>
            </div>
            <Settings className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Canal Tree Component */}
      <CanalTree
        canalHierarchy={canalHierarchy}
        myAssignedCanals={myAssignedCanals}
        showMyAssigned={showMyAssigned}
        expandedNodes={expandedNodes}
        toggleNode={toggleNode}
        onCanalSelect={handleCanalSelect}
        user={user}
        canCreate={canCreate}
        setShowMainCanalForm={setShowMainCanalForm}
        setShowSubCanalForm={setShowSubCanalForm}
      />

      {/* Modals */}
      {showMainCanalForm && (
        <MainCanalForm
          onClose={() => setShowMainCanalForm(false)}
          onCreate={createMainCanal}
          availableTanks={availableTanks}
          availableFA={availableFA}
          availableIrrigators={availableIrrigators}
        />
      )}

      {showSubCanalForm && (
        <SubCanalForm
          onClose={() => setShowSubCanalForm(false)}
          onCreate={createSubCanal}
          availableParents={availableParents}
          availableFA={availableFA}
          availableIrrigators={availableIrrigators}
        />
      )}

      {showUpdateForm && selectedCanal && (
        <UpdateCanalForm
          canal={selectedCanal}
          onClose={() => {
            setShowUpdateForm(false);
            setSelectedCanal(null);
          }}
          onUpdate={updateCanal}
          availableFA={availableFA}
          availableIrrigators={availableIrrigators}
        />
      )}
    </div>
  );
};

export default CanalManagement;