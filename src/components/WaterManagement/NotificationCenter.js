import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { 
  Bell, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  AlertTriangle,
  X,
  MessageSquare,
  User,
  Clock,
  Filter,
  Search,
  Wifi,
  WifiOff,
  RefreshCw,
  Zap
} from 'lucide-react';

const NotificationCenter = () => {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    isConnected,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch
  } = useNotifications();

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Get notification icon
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
      case 'update':
        return <Zap className="h-5 w-5 text-blue-500" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      'critical': 'border-l-red-500 bg-red-50',
      'high': 'border-l-orange-500 bg-orange-50',
      'normal': 'border-l-blue-500 bg-blue-50',
      'low': 'border-l-gray-500 bg-gray-50'
    };
    return colors[priority] || colors.normal;
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const now = new Date().getTime();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  // Filter notifications
  const filteredNotifications = notifications
    .filter(notification => {
      if (filter === 'unread') return notification.status === 'unread';
      if (filter === 'action') return notification.actionRequired;
      if (filter === 'high') return ['high', 'critical'].includes(notification.priority);
      return true;
    })
    .filter(notification =>
      notification.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const actionRequiredCount = notifications.filter(n => n.actionRequired && n.status === 'unread').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
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
            {/* Connection Status */}
            <div className="ml-4 flex items-center">
              {isConnected ? (
                <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <Wifi className="h-4 w-4 mr-1" />
                  <span className="text-xs font-medium">Live</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600 bg-red-50 px-2 py-1 rounded-full">
                  <WifiOff className="h-4 w-4 mr-1" />
                  <span className="text-xs font-medium">Offline</span>
                </div>
              )}
            </div>
          </h1>
          <p className="mt-2 text-gray-600">
            Real-time updates and communications for water management system
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={refetch}
            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            title="Refresh notifications"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* System Status Banner */}
      <div className={`mb-6 p-4 rounded-lg ${isConnected ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
        <div className="flex items-center">
          {isConnected ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">Real-time notifications active</span>
              <span className="text-green-600 text-sm ml-2">• Connected to server</span>
            </>
          ) : (
            <>
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="text-yellow-800 font-medium">Real-time notifications unavailable</span>
              <span className="text-yellow-600 text-sm ml-2">• Using cached data</span>
            </>
          )}
        </div>
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
              Mark All as Read ({unreadCount})
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {notifications.length === 0 ? 'No notifications yet' : 'No matching notifications'}
            </h3>
            <p className="text-gray-600">
              {notifications.length === 0 
                ? "You're all caught up! New notifications will appear here." 
                : "Try adjusting your search or filter criteria."
              }
            </p>
            {!isConnected && (
              <button
                onClick={refetch}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry Connection
              </button>
            )}
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

      {/* User Role Display */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-900">Your Role: {user?.role}</h4>
            <div className="mt-2 text-sm text-blue-700">
              <p>👁️ You can view and respond to notifications relevant to your role.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========================================
// NOTIFICATION CARD COMPONENT
// ========================================

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
              {notification.recipientRole && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded">
                  {notification.recipientRole}
                </span>
              )}
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

export default NotificationCenter;