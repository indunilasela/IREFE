// components/CanalTree.jsx - TREE VIEW COMPONENT
import React from 'react';
import { 
  Folder as Tree, 
  Edit, 
  Calendar, 
  Droplets, 
  Activity,
  ChevronRight,
  ChevronDown,
  MapPin,
  Clock,
  AlertCircle,
  Plus,
  Database,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

const CanalTree = ({
  canalHierarchy,
  myAssignedCanals,
  showMyAssigned,
  expandedNodes,
  toggleNode,
  onCanalSelect,
  onCanalDelete,
  user,
  canCreate,
  setShowMainCanalForm,
  setShowSubCanalForm
}) => {

  // Enhanced Permission System - Only EA, DIA, DA can see edit icons in hierarchy
  const canShowEditInHierarchy = ['DIA', 'DA', 'EA'].includes(user?.role);
  const canUpdate = ['DIA', 'DA', 'EA', 'SA'].includes(user?.role);
  const isOperational = ['FA', 'Irrigator'].includes(user?.role);

  // Check if current user can update specific canal (for hierarchy view)
  const canUpdateCanal = (canal) => {
    // Only EA, DIA, DA roles can update canals in hierarchy view
    if (['DIA', 'DA', 'EA'].includes(user?.role)) {
      return true;
    }
    
    return false;
  };

  // Enhanced permission check specifically for assigned canals
  const canUpdateAssignedCanal = (canal) => {
    // Management roles can update all canals
    if (['DIA', 'DA', 'EA', 'SA'].includes(user?.role)) {
      return true;
    }
    
    // For operational users, if this canal appears in myAssignedCanals, they can update it
    if (['FA', 'Irrigator'].includes(user?.role)) {
      const isAssigned = myAssignedCanals.some(assignedCanal => 
        assignedCanal._id === canal._id || 
        assignedCanal.id === canal.id ||
        assignedCanal._id === canal.id ||
        assignedCanal.id === canal._id
      );
      return isAssigned;
    }
    
    return false;
  };

  const handleNodeClick = (node) => {
    console.log('🖱️ Node clicked:', node.name, node.type);
    
    // Only toggle node expansion/collapse on click, don't open edit form
    toggleNode(node.id);
  };

  const handleAssignedCanalClick = (node) => {
    console.log('🖱️ Assigned canal clicked:', node.name || node.canalName, node.type);
    
    // Only toggle node expansion/collapse on click, don't open edit form
    toggleNode(node.id || node._id);
  };

  // Render assignment badges
  const renderAssignmentBadges = (canal) => {
    if (canal.type === 'tank') return null;
    
    const assignedFA = canal.assignedFA || [];
    const assignedIrrigators = canal.assignedIrrigators || [];
    
    return (
      <div className="flex items-center space-x-2 mt-1">
        {assignedFA.length > 0 && (
          <div className="flex items-center">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-semibold border border-blue-300">
              FA ({assignedFA.length})
            </span>
          </div>
        )}
        {assignedIrrigators.length > 0 && (
          <div className="flex items-center">
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold border border-green-300">
              IRR ({assignedIrrigators.length})
            </span>
          </div>
        )}
      </div>
    );
  };

  // Render assigned user names
  const renderAssignedUsers = (canal) => {
    if (canal.type === 'tank') return null;
    
    const assignedFA = canal.assignedFA || [];
    const assignedIrrigators = canal.assignedIrrigators || [];
    
    if (assignedFA.length === 0 && assignedIrrigators.length === 0) {
      return (
        <div className="text-xs text-gray-400 mt-1">
          No users assigned
        </div>
      );
    }
    
    return (
      <div className="text-xs text-gray-600 mt-1 space-y-1">
        {assignedFA.length > 0 && (
          <div className="flex items-center space-x-1">
            <span className="text-blue-600 font-medium">FA:</span>
            <span>{assignedFA.map(fa => typeof fa === 'object' ? `${fa.firstName} ${fa.lastName}` : fa).join(', ')}</span>
          </div>
        )}
        {assignedIrrigators.length > 0 && (
          <div className="flex items-center space-x-1">
            <span className="text-green-600 font-medium">IRR:</span>
            <span>{assignedIrrigators.map(irr => typeof irr === 'object' ? `${irr.firstName} ${irr.lastName}` : irr).join(', ')}</span>
          </div>
        )}
      </div>
    );
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
            
            {/* Assignment badges and user names */}
            {renderAssignmentBadges(node)}
            {renderAssignedUsers(node)}
          </div>
          
          {/* Only show edit button for EA, DIA, DA in hierarchy view */}
          <div className="flex items-center space-x-2">
            {canShowEditInHierarchy && canUpdateCanal(node) && node.type !== 'tank' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('✏️ Edit button clicked for:', node.name);
                  onCanalSelect(node);
                }}
                className="ml-3 p-2 hover:bg-white hover:shadow-md rounded-lg transition-all duration-200"
                title="Edit canal"
              >
                <Edit className="h-4 w-4 text-blue-500 hover:text-blue-700" />
              </button>
            )}
            
            {/* Delete button - EA only */}
            {user?.role === 'EA' && node.type !== 'tank' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('🗑️ Delete button clicked for:', node.name);
                  onCanalDelete(node);
                }}
                className="p-2 hover:bg-red-50 hover:shadow-md rounded-lg transition-all duration-200"
                title="Delete canal (EA only)"
              >
                <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
              </button>
            )}
          </div>
        </div>
        
        {isExpanded && hasChildren && (
          <div className="mt-2 space-y-1">
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Separate render function for assigned canals
  const renderAssignedCanalNode = (node, level = 0) => {
    const nodeId = node.id || node._id;
    const isExpanded = expandedNodes.has(nodeId);
    const hasChildren = node.children && node.children.length > 0;
    const indent = level * 24;

    return (
      <div key={nodeId} className="select-none">
        <div 
          className={`flex items-center py-3 px-4 cursor-pointer hover:bg-gray-50 rounded-lg mb-1 transition-colors ${
            node.type === 'tank' ? 'bg-blue-50 border border-blue-200' : 
            node.type === 'main' || node.canalType === 'main' ? 'bg-green-50 border border-green-200' : 
            'bg-yellow-50 border border-yellow-200'
          }`}
          style={{ marginLeft: indent }}
          onClick={() => handleAssignedCanalClick(node)}
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
            {(node.type === 'main' || node.canalType === 'main') && <Tree className="h-6 w-6 text-green-600" />}
            {(node.type === 'branch' || node.canalType === 'branch') && <Activity className="h-6 w-6 text-yellow-600" />}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <span className="font-semibold text-gray-900">
                {node.name || node.canalName}
              </span>
              
              {(node.code || node.canalCode) && (
                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full font-mono">
                  {node.code || node.canalCode}
                </span>
              )}
              
              {node.type !== 'tank' && (
                <div className="flex items-center space-x-3 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    (node.canalStatus || node.status) === 'open' 
                      ? 'bg-green-100 text-green-800 border border-green-300' 
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}>
                    {(node.canalStatus || node.status || 'close').toUpperCase()}
                  </span>
                  
                  <div className="flex items-center text-blue-600">
                    <Droplets className="h-4 w-4 mr-1" />
                    <span className="font-medium">{node.flowRate || 0} L/s</span>
                  </div>
                  
                  <div className="flex items-center text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>
                      {node.lastUpdateDay 
                        ? new Date(node.lastUpdateDay).toLocaleDateString()
                        : 'No updates'
                      }
                    </span>
                  </div>
                </div>
              )}
              
              {node.type === 'tank' && (
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{node.location || 'Unknown location'}</span>
                  </div>
                  <div className="flex items-center text-blue-600">
                    <Droplets className="h-4 w-4 mr-1" />
                    <span className="font-medium">{node.currentWaterLevel || 0}%</span>
                  </div>
                  <div className="text-gray-500">
                    <span>Cap: {((node.capacity || 0) / 1000).toFixed(0)}K L</span>
                  </div>
                </div>
              )}
            </div>
            
            {node.type !== 'tank' && (
              <div className="text-xs text-gray-500 mt-1 flex items-center space-x-4">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>
                    {node.startDay && node.endDay ? (
                      `${new Date(node.startDay).toLocaleDateString()} → ${new Date(node.endDay).toLocaleDateString()}`
                    ) : (
                      'No schedule set'
                    )}
                  </span>
                </div>
                {(node.canalStatus || node.status) === 'open' && (
                  <div className="flex items-center text-green-600">
                    <Activity className="h-3 w-3 mr-1" />
                    <span>Active Flow</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Show assignment indicator for assigned canals */}
            {node.type !== 'tank' && (
              <div className="text-xs text-blue-600 mt-1 flex items-center">
                <span className="px-2 py-1 bg-blue-100 rounded-full">
                  ✅ Assigned to you
                </span>
              </div>
            )}
          </div>
          
          {/* Show edit button for assigned canals if user has permission */}
          <div className="flex items-center space-x-2">
            {canUpdateAssignedCanal(node) && node.type !== 'tank' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('✏️ Edit button clicked for assigned canal:', node.name || node.canalName);
                  onCanalSelect(node);
                }}
                className="ml-3 p-2 hover:bg-white hover:shadow-md rounded-lg transition-all duration-200"
                title="Edit assigned canal"
              >
                <Edit className="h-4 w-4 text-blue-500 hover:text-blue-700" />
              </button>
            )}
            
            {/* Delete button - EA only (even for assigned canals) */}
            {user?.role === 'EA' && node.type !== 'tank' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('🗑️ Delete button clicked for assigned canal:', node.name || node.canalName);
                  onCanalDelete(node);
                }}
                className="p-2 hover:bg-red-50 hover:shadow-md rounded-lg transition-all duration-200"
                title="Delete canal (EA only)"
              >
                <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
              </button>
            )}
          </div>
        </div>
        
        {isExpanded && hasChildren && (
          <div className="mt-2 space-y-1">
            {node.children.map(child => renderAssignedCanalNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <Tree className="h-5 w-5 mr-2 text-green-600" />
          {showMyAssigned ? 'My Assigned Canals' : 'Canal Network Hierarchy'}
        </h2>
        
        <div className="text-sm text-gray-500">
          {showMyAssigned 
            ? `${myAssignedCanals.length} canals assigned to you`
            : expandedNodes.size > 0 ? `${expandedNodes.size} nodes expanded` : 'Click to expand nodes'
          }
        </div>
      </div>
      
      {/* Show assigned canals or full hierarchy */}
      {showMyAssigned ? (
        myAssignedCanals.length === 0 ? (
          <div className="text-center py-16">
            <AlertCircle className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Canals Assigned</h3>
            <p className="text-gray-600 mb-6">
              You haven't been assigned to any canals yet. Contact your EA for canal assignments.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {myAssignedCanals.map(canal => renderAssignedCanalNode(canal, 0))}
          </div>
        )
      ) : (
        // Original hierarchy view
        canalHierarchy.length === 0 ? (
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
      )
      )}

      {/* Navigation Legend */}
      <div className="mt-6 bg-gray-50 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Navigation Guide:</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
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
            <Edit className="h-4 w-4 text-blue-500 mr-2" />
            <span>Click Edit to Update</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanalTree;