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
  Save
} from 'lucide-react';
import toast from 'react-hot-toast';

const ScheduleManagement = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Determine user permissions
  const canEditSchedules = ['DIA', 'DA', 'EA'].includes(user?.role);
  const isReadOnly = ['Admin', 'Farmer', 'FA', 'Irrigator'].includes(user?.role);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      // Mock data - replace with actual API call
      setSchedules([
        {
          id: 1,
          title: 'Main Canal Water Release',
          date: '2025-08-05',
          time: '06:00',
          type: 'Opening',
          canal: 'Main Canal',
          duration: '12 hours',
          pdfFile: 'schedule_main_canal_aug5.pdf',
          notes: 'Regular water release for paddy fields',
          status: 'Scheduled',
          createdBy: 'DIA Officer',
          lastUpdated: '2025-08-03T10:30:00Z'
        },
        {
          id: 2,
          title: 'Branch Canal Maintenance',
          date: '2025-08-07',
          time: '18:00',
          type: 'Closing',
          canal: 'Branch Canal 1',
          duration: '6 hours',
          pdfFile: 'maintenance_schedule_aug7.pdf',
          notes: 'Routine maintenance and cleaning',
          status: 'Confirmed',
          createdBy: 'EA Officer',
          lastUpdated: '2025-08-03T09:15:00Z'
        },
        {
          id: 3,
          title: 'Field Canal Water Distribution',
          date: '2025-08-06',
          time: '08:00',
          type: 'Opening',
          canal: 'Field Canal 1',
          duration: '8 hours',
          pdfFile: null,
          notes: 'Water distribution for Zone A paddy fields',
          status: 'Draft',
          createdBy: 'DA Officer',
          lastUpdated: '2025-08-03T11:00:00Z'
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
      toast.error('Failed to load schedule data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSchedule = async (scheduleId, updates) => {
    if (!canEditSchedules) {
      toast.error('You do not have permission to edit schedules');
      return;
    }

    try {
      setSchedules(schedules.map(schedule => 
        schedule.id === scheduleId 
          ? { ...schedule, ...updates, lastUpdated: new Date().toISOString() }
          : schedule
      ));
      
      toast.success('Schedule updated successfully');
      setEditingSchedule(null);
      
      // Send notification to farmers via SMS
      console.log('SMS notification sent to farmers about schedule update');
    } catch (error) {
      console.error('Failed to update schedule:', error);
      toast.error('Failed to update schedule');
    }
  };

  const handleAddSchedule = async (scheduleData) => {
    if (!canEditSchedules) {
      toast.error('Only DIA, DA, and EA users can add schedules');
      return;
    }

    try {
      const newSchedule = {
        id: Date.now(),
        ...scheduleData,
        status: 'Draft',
        createdBy: `${user?.role} Officer`,
        lastUpdated: new Date().toISOString()
      };
      
      setSchedules([...schedules, newSchedule]);
      toast.success('Schedule added successfully');
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add schedule:', error);
      toast.error('Failed to add schedule');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'bg-gray-100 text-gray-800',
      'Scheduled': 'bg-blue-100 text-blue-800',
      'Confirmed': 'bg-green-100 text-green-800',
      'Completed': 'bg-purple-100 text-purple-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type) => {
    return type === 'Opening' ? 'text-green-600' : 'text-red-600';
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
            Manage water issue schedules and canal operations
            {isReadOnly && <span className="text-orange-600 font-medium"> (Read Only)</span>}
          </p>
        </div>
        {canEditSchedules && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Schedule
          </button>
        )}
      </div>

      {/* Schedule Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {['Scheduled', 'Confirmed', 'Draft', 'Completed'].map(status => {
          const count = schedules.filter(s => s.status === status).length;
          
          return (
            <div key={status} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{status}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedules List */}
      <div className="space-y-4">
        {schedules.map((schedule) => (
          <ScheduleCard
            key={schedule.id}
            schedule={schedule}
            canEdit={canEditSchedules}
            isEditing={editingSchedule?.id === schedule.id}
            onEdit={setEditingSchedule}
            onUpdate={handleUpdateSchedule}
            getStatusColor={getStatusColor}
            getTypeColor={getTypeColor}
          />
        ))}
      </div>

      {/* Add Schedule Modal */}
      {showAddForm && (
        <AddScheduleModal
          onClose={() => setShowAddForm(false)}
          onAdd={handleAddSchedule}
        />
      )}

      {/* Permissions Notice */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-900">Your Permissions ({user?.role})</h4>
            <div className="mt-2 text-sm text-blue-700">
              {['DIA', 'DA', 'EA'].includes(user?.role) && (
                <p>You can create, edit, and upload PDF schedules. Changes will send SMS notifications to farmers.</p>
              )}
              {['FA', 'Irrigator', 'Admin', 'Farmer'].includes(user?.role) && (
                <p>You have read-only access to view water schedules and download PDF files.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Schedule Card Component
const ScheduleCard = ({ 
  schedule, 
  canEdit, 
  isEditing, 
  onEdit, 
  onUpdate, 
  getStatusColor, 
  getTypeColor 
}) => {
  const [editData, setEditData] = useState(schedule);

  const handleSave = () => {
    onUpdate(schedule.id, editData);
  };

  const handleCancel = () => {
    setEditData(schedule);
    onEdit(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData({...editData, title: e.target.value})}
              className="text-lg font-semibold text-gray-900 w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <h3 className="text-lg font-semibold text-gray-900">{schedule.title}</h3>
          )}
          <p className="text-sm text-gray-600 mt-1">Created by {schedule.createdBy}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(schedule.status)}`}>
            {schedule.status}
          </span>
          {canEdit && !isEditing && (
            <button
              onClick={() => onEdit(schedule)}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Date & Time</p>
            {isEditing ? (
              <div className="space-y-1">
                <input
                  type="date"
                  value={editData.date}
                  onChange={(e) => setEditData({...editData, date: e.target.value})}
                  className="text-sm font-medium w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="time"
                  value={editData.time}
                  onChange={(e) => setEditData({...editData, time: e.target.value})}
                  className="text-sm w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ) : (
              <>
                <p className="text-sm font-medium">{schedule.date}</p>
                <p className="text-sm text-gray-600">{schedule.time}</p>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Type & Duration</p>
            {isEditing ? (
              <div className="space-y-1">
                <select
                  value={editData.type}
                  onChange={(e) => setEditData({...editData, type: e.target.value})}
                  className="text-sm w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Opening">Opening</option>
                  <option value="Closing">Closing</option>
                </select>
                <input
                  type="text"
                  value={editData.duration}
                  onChange={(e) => setEditData({...editData, duration: e.target.value})}
                  className="text-sm w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 8 hours"
                />
              </div>
            ) : (
              <>
                <p className={`text-sm font-medium ${getTypeColor(schedule.type)}`}>
                  {schedule.type}
                </p>
                <p className="text-sm text-gray-600">{schedule.duration}</p>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div>
            <p className="text-xs text-gray-500">Canal</p>
            {isEditing ? (
              <input
                type="text"
                value={editData.canal}
                onChange={(e) => setEditData({...editData, canal: e.target.value})}
                className="text-sm font-medium w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-sm font-medium">{schedule.canal}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">PDF Schedule</p>
            {schedule.pdfFile ? (
              <button className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                <Download className="h-3 w-3 inline mr-1" />
                Download
              </button>
            ) : (
              <p className="text-sm text-gray-400">No file</p>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-1">Notes</p>
        {isEditing ? (
          <textarea
            value={editData.notes}
            onChange={(e) => setEditData({...editData, notes: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="2"
          />
        ) : (
          <p className="text-sm text-gray-700">{schedule.notes}</p>
        )}
      </div>

      {isEditing && (
        <div className="flex space-x-3 pt-4 border-t">
          <button
            onClick={handleSave}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Save className="h-4 w-4 mr-1" />
            Save Changes
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="text-xs text-gray-500 pt-2 border-t">
        Last updated: {new Date(schedule.lastUpdated).toLocaleDateString()}
      </div>
    </div>
  );
};

// Add Schedule Modal Component
const AddScheduleModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    type: 'Opening',
    canal: '',
    duration: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Schedule</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Schedule Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time *
              </label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Opening">Opening</option>
                <option value="Closing">Closing</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 8 hours"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Canal *
            </label>
            <input
              type="text"
              required
              value={formData.canal}
              onChange={(e) => setFormData({...formData, canal: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Main Canal, Branch Canal 1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Additional notes or instructions"
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Schedule
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

export default ScheduleManagement;
