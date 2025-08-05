import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Bell, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  AlertTriangle,
  X,
  Send,
  MessageSquare,
  User,
  Clock,
  Filter,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';

const NotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSendMessage, setShowSendMessage] = useState(false);

  // Determine user permissions
  const canSendNotifications = ['DIA', 'DA', 'EA'].includes(user?.role);
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      // Replace with actual API call
      // const response = await fetch('/api/notifications');
      // const data = await response.json();
      // setNotifications(data);
      
      setNotifications([]);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      // Replace with actual API call
      // await fetch(`/api/notifications/${notificationId}/read`, { method: 'PATCH' });
      
      setNotifications(notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, status: 'read' }
          : notification
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      // Replace with actual API call
      // await fetch('/api/notifications/read-all', { method: 'PATCH' });
      
      setNotifications(notifications.map(notification => ({
        ...notification,
        status: 'read'
      })));
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      // Replace with actual API call
      // await fetch(`/api/notifications/${notificationId}`, { method: 'DELETE' });
      
      setNotifications(notifications.filter(notification => notification.id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const sendNotification = async (notificationData) => {
    if (!canSendNotifications) {
      toast.error('You do not have permission to send notifications');
      return;
    }

    try {
      // Replace with actual API call
      // const response = await fetch('/api/notifications', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(notificationData)
      // });
      // const newNotification = await response.json();

      const newNotification = {
        id: Date.now(),
        type: 'user_message',
        title: notificationData.title,
        message: notificationData.message,
        sender: `${user?.role} Officer`,
        recipientRole: notificationData.recipientRole,
        priority: notificationData.priority,
        status: 'unread',
        timestamp: new Date().getTime(),
        actionRequired: notificationData.actionRequired,
        relatedData: {}
      };

      setNotifications([newNotification, ...notifications]);
      toast.success('Notification sent successfully');
      setShowSendMessage(false);
    } catch (error) {
      console.error('Failed to send notification:', error);
      toast.error('Failed to send notification');
    }
  };

  const getNotificationIcon = (type, priority) => {
    if (priority === 'critical') return <AlertCircle className="h-5 w-5 text-red-500" />;
    if (priority === 'high') return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    
    switch (type) {
      case 'water_schedule':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'system_alert':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'maintenance':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'user_message':
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      case 'weather_alert':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'critical': 'border-l-red-500 bg-red-50',
      'high': 'border-l-orange-500 bg-orange-50',
      'normal': 'border-l-blue-500 bg-blue-50',
      'low': 'border-l-gray-500 bg-gray-50'
    };
    return colors[priority] || colors.normal;
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date().getTime();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const filteredNotifications = notifications
    .filter(notification => {
      if (filter === 'unread') return notification.status === 'unread';
      if (filter === 'action') return notification.actionRequired;
      if (filter === 'high') return ['high', 'critical'].includes(notification.priority);
      return true;
    })
    .filter(notification =>
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const unreadCount = notifications.filter(n => n.status === 'unread').length;
  const actionRequiredCount = notifications.filter(n => n.actionRequired && n.status === 'unread').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Bell className="h-8 w-8 mr-3 text-blue-600" />
            Notification Center
          </h1>
          <p className="mt-2 text-gray-600">
            Real-time updates and communications for water management system
          </p>
        </div>
        {canSendNotifications && (
          <button
            onClick={() => setShowSendMessage(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Send className="h-4 w-4 mr-2" />
            Send Message
          </button>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
            </div>
            <Bell className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-orange-600">{unreadCount}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Action Required</p>
              <p className="text-2xl font-bold text-red-600">{actionRequiredCount}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Read</p>
              <p className="text-2xl font-bold text-green-600">{notifications.length - unreadCount}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Notifications</option>
                <option value="unread">Unread Only</option>
                <option value="action">Action Required</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
            <p className="text-gray-600">
              {notifications.length === 0 
                ? "You have no notifications at the moment." 
                : "No notifications match your current filters."
              }
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
              getNotificationIcon={getNotificationIcon}
              getPriorityColor={getPriorityColor}
              formatTimestamp={formatTimestamp}
            />
          ))
        )}
      </div>

      {/* Send Message Modal */}
      {showSendMessage && (
        <SendMessageModal
          onClose={() => setShowSendMessage(false)}
          onSend={sendNotification}
          userRole={user?.role}
        />
      )}

      {/* User Permissions Notice */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-900">Your Permissions ({user?.role})</h4>
            <div className="mt-2 text-sm text-blue-700">
              {canSendNotifications && (
                <p>You can send notifications to all users and receive system alerts for your department.</p>
              )}
              {!canSendNotifications && (
                <p>You can view and respond to notifications relevant to your role. Contact DIA/DA/EA officers for urgent communications.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Notification Card Component
const NotificationCard = ({ 
  notification, 
  onMarkAsRead, 
  onDelete, 
  getNotificationIcon, 
  getPriorityColor, 
  formatTimestamp 
}) => {
  const isUnread = notification.status === 'unread';

  return (
    <div 
      className={`bg-white rounded-lg shadow border-l-4 p-4 ${getPriorityColor(notification.priority)} ${
        isUnread ? 'ring-2 ring-blue-200' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {getNotificationIcon(notification.type, notification.priority)}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className={`text-sm font-medium ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                {notification.title}
              </h3>
              {notification.actionRequired && (
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                  Action Required
                </span>
              )}
              {isUnread && (
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              )}
            </div>
            <p className={`text-sm mt-1 ${isUnread ? 'text-gray-800' : 'text-gray-600'}`}>
              {notification.message}
            </p>
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>{notification.sender}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{formatTimestamp(notification.timestamp)}</span>
              </div>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded">
                {notification.recipientRole}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {isUnread && (
            <button
              onClick={() => onMarkAsRead(notification.id)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Mark as read"
            >
              <CheckCircle className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(notification.id)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Send Message Modal Component
const SendMessageModal = ({ onClose, onSend, userRole }) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    recipientRole: 'All',
    priority: 'normal',
    actionRequired: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSend(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Send Notification</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Notification title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message *
            </label>
            <textarea
              required
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder="Enter your message..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Send To
              </label>
              <select
                value={formData.recipientRole}
                onChange={(e) => setFormData({...formData, recipientRole: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Users</option>
                <option value="Admin">Admin</option>
                <option value="DIA">DIA</option>
                <option value="DA">DA</option>
                <option value="EA">EA</option>
                <option value="FA">FA</option>
                <option value="Irrigator">Irrigator</option>
                <option value="Farmer">Farmer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="actionRequired"
              checked={formData.actionRequired}
              onChange={(e) => setFormData({...formData, actionRequired: e.target.checked})}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="actionRequired" className="ml-2 block text-sm text-gray-900">
              Action Required
            </label>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Send Notification
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

export default NotificationCenter;