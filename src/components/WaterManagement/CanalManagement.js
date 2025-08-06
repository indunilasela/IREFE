// components/CanalManagement.jsx - HIERARCHICAL TREE VERSION
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Folder as Tree, 
  Plus, 
  Edit, 
  Calendar, 
  Droplets, 
  Activity,
  ChevronRight,
  ChevronDown,
  Settings,
  MapPin,
  Clock,
  AlertCircle,
  RefreshCw,
  Save,
  X,
  Eye,
  Database
} from 'lucide-react';
import toast from 'react-hot-toast';

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

 // CURRENT (Admin & Farmer are read-only):
const canCreate = user?.role === 'EA';
const canUpdate = ['DIA', 'DA', 'EA', 'FA', 'Irrigator', 'SA'].includes(user?.role);
const isReadOnly = ['Admin', 'Farmer'].includes(user?.role);

  useEffect(() => {
    fetchCanalHierarchy();
    if (canCreate) {
      fetchAvailableTanks();
      fetchAvailableParents();
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
      
      // Mock data for demo/development
      setCanalHierarchy([
        {
          id: 'tank1',
          name: 'Main Storage Tank',
          type: 'tank',
          location: 'Kandy District',
          capacity: 75000,
          currentWaterLevel: 85,
          children: [
            {
              id: 'main1',
              name: 'Main Canal North',
              code: 'MC-A1B2',
              type: 'main',
              startDay: new Date('2025-08-10'),
              endDay: new Date('2025-08-20'),
              canalStatus: 'open',
              flowRate: 1500,
              lastUpdateDay: new Date(),
              children: [
                {
                  id: 'branch1',
                  name: 'Branch Canal 1A',
                  code: 'BC-C3D4',
                  type: 'branch',
                  startDay: new Date('2025-08-10'),
                  endDay: new Date('2025-08-20'),
                  canalStatus: 'close',
                  flowRate: 0,
                  lastUpdateDay: new Date(),
                  children: [
                    {
                      id: 'branch2',
                      name: 'Sub Branch 1A-1',
                      code: 'BC-E5F6',
                      type: 'branch',
                      startDay: new Date('2025-08-12'),
                      endDay: new Date('2025-08-18'),
                      canalStatus: 'open',
                      flowRate: 300,
                      lastUpdateDay: new Date(),
                      children: []
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]);
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
      }
    } catch (error) {
      console.error('Error fetching tanks:', error);
      setAvailableTanks([
        { _id: 'tank1', name: 'Main Storage Tank', location: 'Kandy District', currentWaterLevel: 85 }
      ]);
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
      }
    } catch (error) {
      console.error('Error fetching parent canals:', error);
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

  const handleNodeClick = (node) => {
    console.log('🖱️ Node clicked:', node.name, node.type);
    
    if (node.type === 'tank') {
      // Tank clicked - expand/collapse
      toggleNode(node.id);
    } else {
      // Canal clicked - can edit if authorized
      if (canUpdate) {
        console.log('✏️ Opening edit form for canal:', node.name);
        setSelectedCanal(node);
        setShowUpdateForm(true);
      }
      toggleNode(node.id);
    }
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

  const renderTreeNode = (node, level = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const indent = level * 24;

    return (
      <div key={node.id} className="select-none">
        <div 
          className={`flex items-center py-3 px-4 cursor-pointer hover:bg-gray-50 rounded-lg mb-1 transition-colors ${
            node.type === 'tank' ? 'bg-blue-50 border border-blue-200' : 
            node.type === 'main' ? 'bg-green-50 border border-green-200' : 
            'bg-yellow-50 border border-yellow-200'
          }`}
          style={{ marginLeft: indent }}
          onClick={() => handleNodeClick(node)}
        >
          {hasChildren && (
            <div className="mr-3">
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-gray-600" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-600" />
              )}
            </div>
          )}
          
          <div className="flex items-center mr-4">
            {node.type === 'tank' && <Database className="h-6 w-6 text-blue-600" />}
            {node.type === 'main' && <Tree className="h-6 w-6 text-green-600" />}
            {node.type === 'branch' && <Activity className="h-6 w-6 text-yellow-600" />}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <span className="font-semibold text-gray-900">{node.name}</span>
              
              {node.code && (
                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full font-mono">
                  {node.code}
                </span>
              )}
              
              {node.type !== 'tank' && (
                <div className="flex items-center space-x-3 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    node.canalStatus === 'open' 
                      ? 'bg-green-100 text-green-800 border border-green-300' 
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}>
                    {node.canalStatus?.toUpperCase()}
                  </span>
                  
                  <div className="flex items-center text-blue-600">
                    <Droplets className="h-4 w-4 mr-1" />
                    <span className="font-medium">{node.flowRate} L/s</span>
                  </div>
                  
                  <div className="flex items-center text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{new Date(node.lastUpdateDay).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
              
              {node.type === 'tank' && (
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{node.location}</span>
                  </div>
                  <div className="flex items-center text-blue-600">
                    <Droplets className="h-4 w-4 mr-1" />
                    <span className="font-medium">{node.currentWaterLevel}%</span>
                  </div>
                  <div className="text-gray-500">
                    <span>Cap: {(node.capacity / 1000).toFixed(0)}K L</span>
                  </div>
                </div>
              )}
            </div>
            
            {node.type !== 'tank' && (
              <div className="text-xs text-gray-500 mt-1 flex items-center space-x-4">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>
                    {new Date(node.startDay).toLocaleDateString()} → {new Date(node.endDay).toLocaleDateString()}
                  </span>
                </div>
                {node.canalStatus === 'open' && (
                  <div className="flex items-center text-green-600">
                    <Activity className="h-3 w-3 mr-1" />
                    <span>Active Flow</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {canUpdate && node.type !== 'tank' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('✏️ Edit button clicked for:', node.name);
                setSelectedCanal(node);
                setShowUpdateForm(true);
              }}
              className="ml-3 p-2 hover:bg-white hover:shadow-md rounded-lg transition-all duration-200"
              title="Edit canal"
            >
              <Edit className="h-4 w-4 text-blue-500 hover:text-blue-700" />
            </button>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('👁️ View details for:', node.name);
            }}
            className="ml-2 p-2 hover:bg-white hover:shadow-md rounded-lg transition-all duration-200"
            title="View details"
          >
            <Eye className="h-4 w-4 text-gray-500 hover:text-gray-700" />
          </button>
        </div>
        
        {isExpanded && hasChildren && (
          <div className="mt-2 space-y-1">
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
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
              <p className="text-sm font-medium text-gray-600">Active Canals</p>
              <p className="text-2xl font-bold text-purple-600">
                {/* Calculate active canals from hierarchy */}
                {(() => {
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

      {/* Canal Hierarchy Tree */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Tree className="h-5 w-5 mr-2 text-green-600" />
            Canal Network Hierarchy
          </h2>
          
          <div className="text-sm text-gray-500">
            {expandedNodes.size > 0 ? `${expandedNodes.size} nodes expanded` : 'Click to expand nodes'}
          </div>
        </div>
        
        {canalHierarchy.length === 0 ? (
          <div className="text-center py-16">
            <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Canal Network Found</h3>
            <p className="text-gray-600 mb-6">
              {canCreate 
                ? 'Create your first main canal to start building the irrigation network' 
                : 'No canal network has been set up yet'
              }
            </p>
            {canCreate && (
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowMainCanalForm(true)}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Main Canal
                </button>
                <button
                  onClick={() => setShowSubCanalForm(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Sub Canal
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {canalHierarchy.map(tank => renderTreeNode(tank))}
          </div>
        )}
      </div>

      {/* Navigation Legend */}
      <div className="mt-6 bg-gray-50 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Navigation Guide:</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
          <div className="flex items-center">
            <Database className="h-5 w-5 text-blue-600 mr-2" />
            <span>Water Tank</span>
          </div>
          <div className="flex items-center">
            <Tree className="h-5 w-5 text-green-600 mr-2" />
            <span>Main Canal</span>
          </div>
          <div className="flex items-center">
            <Activity className="h-5 w-5 text-yellow-600 mr-2" />
            <span>Branch Canal</span>
          </div>
          <div className="flex items-center">
            <ChevronRight className="h-4 w-4 text-gray-500 mr-2" />
            <span>Click to Expand</span>
          </div>
          <div className="flex items-center">
            <Edit className="h-4 w-4 text-blue-500 mr-2" />
            <span>Click to Edit</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-3 bg-green-100 border border-green-300 rounded mr-2"></div>
            <span>Canal Open</span>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showMainCanalForm && (
        <MainCanalForm
          onClose={() => setShowMainCanalForm(false)}
          onCreate={createMainCanal}
          availableTanks={availableTanks}
        />
      )}

      {showSubCanalForm && (
        <SubCanalForm
          onClose={() => setShowSubCanalForm(false)}
          onCreate={createSubCanal}
          availableParents={availableParents}
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
        />
      )}

      {/* User Permissions Notice */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-900">Your Access Level: {user?.role}</h4>
            <div className="mt-2 text-sm text-blue-700">
              {canCreate && (
                <p>✅ You can create new main canals and sub canals, and update all canal operations.</p>
              )}
              {canUpdate && !canCreate && (
                <p>✅ You can update canal schedules, flow rates, and operational status.</p>
              )}
              {isReadOnly && (
                <p>👁️ You have read-only access to view the canal network structure.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========================================
// MODAL COMPONENTS
// ========================================

// Main Canal Creation Form
const MainCanalForm = ({ onClose, onCreate, availableTanks }) => {
  const [formData, setFormData] = useState({
    canalName: '',
    tankName: '',
    startDay: '',
    endDay: '',
    canal: 'close',
    flowRate: 0
  });
  const [isLoading, setIsLoading] = useState(false);

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
              disabled={isLoading}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
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

// Sub Canal Creation Form
const SubCanalForm = ({ onClose, onCreate, availableParents }) => {
  const [formData, setFormData] = useState({
    canalName: '',
    mainCanal: '',
    startDay: '',
    endDay: '',
    canal: 'close',
    flowRate: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('📝 Submitting sub canal form:', formData);
    try {
      await onCreate(formData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-yellow-600" />
            Create Sub Canal (Branch)
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter canal name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parent Canal *
            </label>
            <select
              required
              value={formData.mainCanal}
              onChange={(e) => setFormData({...formData, mainCanal: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose parent canal...</option>
              {availableParents.map(canal => (
                <option key={canal._id} value={canal._id}>
                  {canal.canalName} ({canal.canalType}) - {canal.canalCode}
                  {canal.associatedTank && ` - ${canal.associatedTank.name}`}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Sub canals can branch from main canals or other branches
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Sub Canal'
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

// Canal Update Form
const UpdateCanalForm = ({ canal, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    startDay: canal.startDay?.split ? canal.startDay.split('T')[0] : new Date(canal.startDay).toISOString().split('T')[0],
    endDay: canal.endDay?.split ? canal.endDay.split('T')[0] : new Date(canal.endDay).toISOString().split('T')[0],
    canal: canal.canalStatus || 'close',
    flowRate: canal.flowRate || 0
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('📝 Submitting canal update:', canal.id, formData);
    try {
      await onUpdate(canal.id, formData);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusChangeMessage = () => {
    if (formData.canal !== canal.canalStatus) {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Edit className="h-5 w-5 mr-2 text-orange-600" />
            Update Canal: {canal.name}
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
              <p className="font-medium capitalize">{canal.type}</p>
            </div>
            <div>
              <p className="text-gray-600">Code:</p>
              <p className="font-medium font-mono">{canal.code}</p>
            </div>
            <div>
              <p className="text-gray-600">Current Status:</p>
              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                canal.canalStatus === 'open' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {canal.canalStatus?.toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-gray-600">Last Updated:</p>
              <p className="font-medium">{new Date(canal.lastUpdateDay).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
                onChange={(e) => setFormData({...formData, canal: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="0"
              />
            </div>
          </div>

          {getStatusChangeMessage()}
          
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

export default CanalManagement;

// ========================================
// USAGE EXAMPLE IN APP.JS
// ========================================

/*
// Add this to your App.js routing:

import CanalManagement from './components/CanalManagement';

// In your routes:
<Route path="/canals" element={<CanalManagement />} />

// Add to your navigation menu:
<Link to="/canals" className="nav-link">
  <Tree className="h-5 w-5 mr-2" />
  Canal Management
</Link>
*/