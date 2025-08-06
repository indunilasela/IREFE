import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Calendar, 
  Upload, 
  Download, 
  FileText, 
  Clock, 
  AlertTriangle,
  Plus,
  Edit,
  Save,
  X,
  Filter,
  Search,
  CheckCircle,
  Eye,
  RefreshCw,
  Users,
  MapPin,
  Droplets,
  Settings,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:5000/api';

const ScheduleManagement = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [suggestedTanks, setSuggestedTanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    gateStatus: 'all',
    searchTerm: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalCount: 0
  });
  const [summary, setSummary] = useState({
    totalSchedules: 0,
    activeSchedules: 0,
    openGates: 0,
    totalDailyFlow: 0
  });

  // Determine user permissions based on new role structure
  const canCreateSchedules = user?.role === 'EA'; // Only EA can create schedules
  const canEditSchedules = ['DIA', 'DA', 'EA'].includes(user?.role);
  const canUpdateGates = ['DIA', 'DA', 'EA', 'FA', 'Irrigator'].includes(user?.role);
  const isReadOnly = ['Admin', 'Farmer'].includes(user?.role);

  useEffect(() => {
    fetchSchedules();
    if (canCreateSchedules) {
      fetchSuggestedTanks();
    }
  }, [filters, pagination.page]);

  // Get auth token helper
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // Fetch schedules from API
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      if (filters.status !== 'all') {
        queryParams.append('status', filters.status);
      }
      if (filters.gateStatus !== 'all') {
        queryParams.append('gateStatus', filters.gateStatus);
      }
      if (filters.searchTerm) {
        queryParams.append('search', filters.searchTerm);
      }

      const response = await fetch(`${API_BASE_URL}/ea/water-schedules?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSchedules(data.data.schedules || []);
          setSummary(data.data.summary || {
            totalSchedules: 0,
            activeSchedules: 0,
            openGates: 0,
            totalDailyFlow: 0
          });
          setPagination(prev => ({
            ...prev,
            totalPages: data.data.pagination?.totalPages || 1,
            totalCount: data.data.pagination?.totalCount || 0
          }));
        }
      } else {
        throw new Error('Failed to fetch schedules');
      }
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
      toast.error('Failed to load schedules');
      
      // Initialize with empty data
      setSchedules([]);
      setSummary({
        totalSchedules: 0,
        activeSchedules: 0,
        openGates: 0,
        totalDailyFlow: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch suggested tanks for EA users
  const fetchSuggestedTanks = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/ea/water-schedules/suggested-tanks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSuggestedTanks(data.data.tanks || []);
        }
      } else {
        throw new Error('Failed to fetch suggested tanks');
      }
    } catch (error) {
      console.error('Failed to fetch suggested tanks:', error);
      setSuggestedTanks([]);
    }
  };

  // Create new water schedule with PDF upload
  const createSchedule = async (formData) => {
    if (!canCreateSchedules) {
      toast.error('Only EA users can create water schedules');
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/ea/water-schedules`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData // FormData object with file
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Water schedule created successfully! 📅');
          await fetchSchedules(); // Refresh the list
          setShowAddForm(false);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create schedule');
      }
    } catch (error) {
      console.error('Failed to create schedule:', error);
      toast.error(`Failed to create schedule: ${error.message}`);
    }
  };

  // Update gate operations only
  const updateGateOperations = async (scheduleId, operations) => {
    if (!canUpdateGates) {
      toast.error('You do not have permission to update gate operations');
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/ea/water-schedules/${scheduleId}/gate-operations`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(operations)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Gate operations updated successfully! ⚙️');
          await fetchSchedules(); // Refresh the list
          setEditingSchedule(null);
          
          // Show changes summary
          if (data.data.changes && data.data.changes.length > 0) {
            const changesMessage = data.data.changes.join('\n');
            toast.success(`Changes applied:\n${changesMessage}`, { duration: 5000 });
          }
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update gate operations');
      }
    } catch (error) {
      console.error('Failed to update gate operations:', error);
      toast.error(`Failed to update gate operations: ${error.message}`);
    }
  };

  // Replace PDF schedule file
  const replaceSchedulePDF = async (scheduleId, newPdfFile, gateUpdates = {}) => {
    if (!canEditSchedules) {
      toast.error('You do not have permission to replace schedule files');
      return;
    }

    try {
      const token = getAuthToken();
      const uploadData = new FormData();
      uploadData.append('scheduleFile', newPdfFile);

      // Optional gate operation updates
      Object.keys(gateUpdates).forEach(key => {
        uploadData.append(key, gateUpdates[key]);
      });

      const response = await fetch(`${API_BASE_URL}/ea/water-schedules/${scheduleId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadData
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Schedule PDF updated successfully! 📄');
          await fetchSchedules(); // Refresh the list
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to replace PDF');
      }
    } catch (error) {
      console.error('Failed to replace PDF:', error);
      toast.error(`Failed to replace PDF: ${error.message}`);
    }
  };

  // Download PDF schedule
  const downloadSchedulePDF = async (scheduleId) => {
    try {
      const schedule = schedules.find(s => s._id === scheduleId);
      if (schedule?.scheduleFile?.url) {
        // Create download link
        const link = document.createElement('a');
        link.href = schedule.scheduleFile.url;
        link.download = schedule.scheduleFile.originalName || 'water-schedule.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('PDF download started! 📥');
      } else {
        toast.error('No PDF file available for this schedule');
      }
    } catch (error) {
      console.error('Failed to download PDF:', error);
      toast.error('Failed to download PDF file');
    }
  };

  // Filter schedules based on search and filters
  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = !filters.searchTerm || 
      schedule.title?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      schedule.associatedTank?.name?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      schedule.associatedTank?.location?.toLowerCase().includes(filters.searchTerm.toLowerCase());

    const matchesStatus = filters.status === 'all' || schedule.status === filters.status;
    const matchesGateStatus = filters.gateStatus === 'all' || schedule.gateOperations?.statusToday === filters.gateStatus;

    return matchesSearch && matchesStatus && matchesGateStatus;
  });

  // Helper functions
  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'completed': 'bg-blue-100 text-blue-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getGateStatusColor = (status) => {
    return status === 'open' ? 'text-green-600' : 'text-red-600';
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Water Schedule Management</h1>
          <p className="mt-2 text-gray-600">
            Manage tank water schedules, gate operations, and PDF distribution
            {isReadOnly && <span className="text-orange-600 font-medium"> (Read Only)</span>}
          </p>
        </div>
        {canCreateSchedules && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Schedule
          </button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Schedules
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tanks, locations..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schedule Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gate Status
            </label>
            <select
              value={filters.gateStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, gateStatus: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Gates</option>
              <option value="open">Open Gates</option>
              <option value="close">Closed Gates</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: 'all', gateStatus: 'all', searchTerm: '' })}
              className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Schedules Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Water Schedules ({filteredSchedules.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule & Tank Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gate Operations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status & PDF
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSchedules.map((schedule) => (
                <ScheduleRow
                  key={schedule._id}
                  schedule={schedule}
                  canEdit={canEditSchedules}
                  canUpdateGates={canUpdateGates}
                  isEditing={editingSchedule?._id === schedule._id}
                  onEdit={setEditingSchedule}
                  onUpdateGates={updateGateOperations}
                  onReplacePDF={replaceSchedulePDF}
                  onDownloadPDF={downloadSchedulePDF}
                  getStatusColor={getStatusColor}
                  getGateStatusColor={getGateStatusColor}
                />
              ))}
            </tbody>
          </table>
          
          {filteredSchedules.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No water schedules found</p>
              <p className="text-gray-400">
                {schedules.length === 0 
                  ? (canCreateSchedules ? 'Create your first water schedule to get started' : 'No schedules available')
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing page {pagination.page} of {pagination.totalPages} 
            ({pagination.totalCount} total schedules)
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create Schedule Modal */}
      {showAddForm && (
        <CreateScheduleModal
          onClose={() => setShowAddForm(false)}
          onCreate={createSchedule}
          suggestedTanks={suggestedTanks}
        />
      )}

      {/* Role-based access notice */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <AlertTriangle className="h-6 w-6 text-blue-600 mt-0.5" />
          <div className="ml-3">
            <h4 className="text-lg font-medium text-blue-900">Access Level: {user?.role}</h4>
            <div className="mt-3 text-sm text-blue-700">
              {user?.role === 'EA' && (
                <p>✅ You can create schedules, upload PDFs, and manage all schedule operations including gate controls.</p>
              )}
              {['DIA', 'DA'].includes(user?.role) && (
                <p>✅ You can update gate operations, replace PDFs, but cannot create new schedules.</p>
              )}
              {['FA', 'Irrigator'].includes(user?.role) && (
                <p>✅ You can update gate operations for operational control and download PDF files.</p>
              )}
              {user?.role === 'Admin' && (
                <p>👁️ You have read-only access to view all schedules and download PDF files.</p>
              )}
              {user?.role === 'Farmer' && (
                <p>👁️ You have read-only access to view schedules and download PDF files relevant to your area.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Schedule Row Component for Table
const ScheduleRow = ({ 
  schedule, 
  canEdit, 
  canUpdateGates,
  isEditing, 
  onEdit, 
  onUpdateGates, 
  onReplacePDF,
  onDownloadPDF, 
  getStatusColor,
  getGateStatusColor
}) => {
  const [tempGateData, setTempGateData] = useState({
    startDate: schedule.gateOperations?.startDate?.slice(0, 10) || '',
    endDate: schedule.gateOperations?.endDate?.slice(0, 10) || '',
    statusToday: schedule.gateOperations?.statusToday || 'close',
    dailyFlow: schedule.gateOperations?.dailyFlow || 0
  });
  const [replacingPDF, setReplacingPDF] = useState(false);
  const [newPDFFile, setNewPDFFile] = useState(null);

  const handleSaveGateOperations = () => {
    onUpdateGates(schedule._id, tempGateData);
    onEdit(null);
  };

  const handlePDFReplace = async () => {
    if (newPDFFile) {
      await onReplacePDF(schedule._id, newPDFFile);
      setReplacingPDF(false);
      setNewPDFFile(null);
    }
  };



  

  return (
    <tr key={schedule._id} className="hover:bg-gray-50">
      {/* Schedule & Tank Details */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div>
            <div className="text-sm font-medium text-gray-900">
              {schedule.title}
            </div>
            <div className="text-sm text-gray-500">
              Tank: {schedule.associatedTank?.name || 'N/A'}
            </div>
            <div className="text-xs text-gray-400">
              📍 {schedule.associatedTank?.location || 'Location not specified'}
            </div>
          </div>
        </div>
      </td>

      {/* Gate Operations */}
      <td className="px-6 py-4 whitespace-nowrap">
        {isEditing && canUpdateGates ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <select
                value={tempGateData.statusToday}
                onChange={(e) => setTempGateData(prev => ({ 
                  ...prev, 
                  statusToday: e.target.value,
                  dailyFlow: e.target.value === 'close' ? 0 : prev.dailyFlow
                }))}
                className="text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="open">Open</option>
                <option value="close">Close</option>
              </select>
              <input
                type="number"
                min="0"
                value={tempGateData.dailyFlow}
                onChange={(e) => setTempGateData(prev => ({ ...prev, dailyFlow: parseInt(e.target.value) || 0 }))}
                disabled={tempGateData.statusToday === 'close'}
                placeholder="Flow rate"
                className="text-xs border border-gray-300 rounded px-2 py-1 disabled:bg-gray-100"
              />
            </div>
            <div className="flex space-x-1">
              <button
                onClick={handleSaveGateOperations}
                className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
              >
                <CheckCircle className="h-3 w-3" />
              </button>
              <button
                onClick={() => onEdit(null)}
                className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className={`text-sm font-medium ${getGateStatusColor(schedule.gateOperations?.statusToday)}`}>
              Gate: {schedule.gateOperations?.statusToday?.toUpperCase() || 'CLOSED'}
            </div>
            <div className="text-sm text-gray-500">
              Branch: {schedule.gateOperations?.mainBranch || 'maingateA'}
            </div>
            <div className="text-xs text-gray-400">
              Flow: {schedule.gateOperations?.dailyFlow || 0} ft/s
            </div>
          </div>
        )}
      </td>

      {/* Schedule Period */}
      <td className="px-6 py-4 whitespace-nowrap">
        {isEditing && canUpdateGates ? (
          <div className="space-y-2">
            <input
              type="date"
              value={tempGateData.startDate}
              onChange={(e) => setTempGateData(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full text-xs border border-gray-300 rounded px-2 py-1"
            />
            <input
              type="date"
              value={tempGateData.endDate}
              onChange={(e) => setTempGateData(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full text-xs border border-gray-300 rounded px-2 py-1"
            />
          </div>
        ) : (
          <div>
            <div className="text-sm text-gray-900">
              {schedule.gateOperations?.startDate 
                ? new Date(schedule.gateOperations.startDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })
                : 'Not scheduled'
              }
            </div>
            <div className="text-sm text-gray-500">
              to {schedule.gateOperations?.endDate 
                ? new Date(schedule.gateOperations.endDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })
                : 'TBD'
              }
            </div>
          </div>
        )}
      </td>

      {/* Status & PDF */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="space-y-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
            {schedule.status?.toUpperCase() || 'INACTIVE'}
          </span>
          {schedule.scheduleFile && (
            <div className="flex items-center text-xs text-blue-600">
              <FileText className="h-3 w-3 mr-1" />
              {schedule.scheduleFile.originalName}
            </div>
          )}
          {replacingPDF && (
            <div className="space-y-2">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setNewPDFFile(e.target.files[0])}
                className="text-xs"
              />
              <div className="flex space-x-1">
                <button
                  onClick={handlePDFReplace}
                  disabled={!newPDFFile}
                  className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                >
                  Upload
                </button>
                <button
                  onClick={() => setReplacingPDF(false)}
                  className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center space-x-2">
          {canUpdateGates && !isEditing && (
            <button
              onClick={() => onEdit(schedule)}
              className="text-blue-600 hover:text-blue-900"
              title="Edit gate operations"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
          
          {canEdit && schedule.scheduleFile && !replacingPDF && (
            <button
              onClick={() => setReplacingPDF(true)}
              className="text-orange-600 hover:text-orange-900"
              title="Replace PDF"
            >
              <Upload className="h-4 w-4" />
            </button>
          )}

          {schedule.scheduleFile && (
            <button
              onClick={() => onDownloadPDF(schedule._id)}
              className="text-green-600 hover:text-green-900"
              title="Download PDF"
            >
              <Download className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={() => window.location.href = `/water-schedules/${schedule._id}`}
            className="text-gray-600 hover:text-gray-900"
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// Create Schedule Modal Component
const CreateScheduleModal = ({ onClose, onCreate, suggestedTanks }) => {
  const [formData, setFormData] = useState({
    associatedTank: '',
    mainBranch: 'maingateA',
    startDate: '',
    endDate: '',
    statusToday: 'close',
    dailyFlow: 0,
    scheduleFile: null
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      if (file.type !== 'application/pdf') {
        toast.error('Please select a PDF file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB');
        return;
      }
      setFormData(prev => ({ ...prev, scheduleFile: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Create FormData for file upload
    const submitData = new FormData();
    submitData.append('associatedTank', formData.associatedTank);
    submitData.append('mainBranch', formData.mainBranch);
    submitData.append('startDate', formData.startDate);
    submitData.append('endDate', formData.endDate);
    submitData.append('statusToday', formData.statusToday);
    submitData.append('dailyFlow', formData.dailyFlow.toString());
    
    if (formData.scheduleFile) {
      submitData.append('scheduleFile', formData.scheduleFile);
    }

    try {
      await onCreate(submitData);
      onClose();
    } catch (error) {
      console.error('Failed to create schedule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Create New Water Schedule</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tank Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Associated Tank * <span className="text-xs text-gray-500">(EA Role Required)</span>
            </label>
            <select
              required
              value={formData.associatedTank}
              onChange={(e) => setFormData({...formData, associatedTank: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a tank...</option>
              {suggestedTanks.map(tank => (
                <option key={tank._id} value={tank._id}>
                  {tank.name} - {tank.location} 
                  {tank.waterLevelPercentage && ` (${tank.waterLevelPercentage}% full)`}
                  {tank.suggestionReason && ` - ${tank.suggestionReason}`}
                </option>
              ))}
            </select>
            {suggestedTanks.length === 0 && (
              <p className="mt-1 text-xs text-gray-500">No tanks available. Contact admin if you need access to tank data.</p>
            )}
          </div>

          {/* Gate Operations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Main Branch *
              </label>
              <input
                type="text"
                required
                value={formData.mainBranch}
                onChange={(e) => setFormData({ ...formData, mainBranch: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter main branch name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Initial Gate Status
              </label>
              <select
                value={formData.statusToday}
                onChange={(e) => setFormData({
                  ...formData, 
                  statusToday: e.target.value,
                  dailyFlow: e.target.value === 'close' ? 0 : formData.dailyFlow
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="close">Closed</option>
                <option value="open">Open</option>
              </select>
            </div>
          </div>

          {/* Schedule Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={formData.startDate || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Daily Flow Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Daily Flow Rate (ft/s) *
            </label>
            <input
              type="number"
              required
              value={formData.dailyFlow}
              onChange={(e) =>
                setFormData({ ...formData, dailyFlow: parseFloat(e.target.value) || 0})
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter flow rate"
            />
            <p className="mt-1 text-xs text-gray-500">
              Please enter the daily water flow rate in feet per second.
            </p>
          </div>

          {/* PDF Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Schedule PDF *
            </label>
            <input
              type="file"
              accept=".pdf"
              required
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formData.scheduleFile && (
              <p className="mt-2 text-sm text-green-600 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Selected: {formData.scheduleFile.name}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              PDF files only, maximum 10MB. This will be distributed to farmers automatically.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-6 border-t">
            <button
              type="submit"
              disabled={isLoading || !formData.scheduleFile}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Schedule...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Create Water Schedule
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Info Notice */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-900">Automatic Features</h4>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Schedule title will be auto-generated based on tank and date</li>
                  <li>SMS notifications will be sent to farmers automatically</li>
                  <li>Gate operations can be updated later by authorized users</li>
                  <li>PDF can be replaced/updated after creation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleManagement;