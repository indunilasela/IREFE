import { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'https://irebe.onrender.com';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://irebe.onrender.com/api';

export const useNotifications = () => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  // Get auth token helper
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // Initialize socket connection
  useEffect(() => {
    if (user) {
      console.log('🔌 Initializing Socket.IO connection...');
      
      const newSocket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      setSocket(newSocket);

      // Join with user information
      newSocket.emit('join', {
        userId: user.id || user._id,
        role: user.role,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || 'Unknown User'
      });

      // Connection events
      newSocket.on('connect', () => {
        console.log('✅ Connected to notification server');
        setIsConnected(true);
        toast.success('🔔 Real-time notifications enabled', { 
          duration: 2000,
          position: 'top-right' 
        });
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        setIsConnected(false);
        // Don't show error toast on initial connection failure
      });

      newSocket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from notification server:', reason);
        setIsConnected(false);
        if (reason === 'io server disconnect') {
          // Server disconnected us, try to reconnect
          newSocket.connect();
        }
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Reconnected after', attemptNumber, 'attempts');
        setIsConnected(true);
        toast.success('Reconnected to notification server', { duration: 2000 });
      });

      // Listen for new notifications
      newSocket.on('newNotification', (notification) => {
        console.log('🔔 New notification received:', notification);
        
        // Add to notifications list (ensure unique)
        setNotifications(prev => {
          const exists = prev.find(n => n.id === notification.id);
          if (exists) return prev;
          return [notification, ...prev];
        });
        
        // Update unread count
        setUnreadCount(prev => prev + 1);
        
        // Show toast notification
        showNotificationToast(notification);
      });

      // Listen for notification marked as read from other devices
      newSocket.on('notificationMarkedRead', (notificationId) => {
        console.log('📖 Notification marked as read:', notificationId);
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, status: 'read' }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      });

      return () => {
        console.log('🔌 Cleaning up socket connection');
        newSocket.close();
      };
    }
  }, [user]);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        console.log('❌ No auth token found');
        setNotifications([]);
        setUnreadCount(0);
        return;
      }
      
      console.log('📡 Fetching notifications from API...');
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Notifications API response:', data);
        
        if (data.success) {
          const notificationsList = Array.isArray(data.data) ? data.data : [];
          setNotifications(notificationsList);
          
          // Calculate unread count
          const unread = notificationsList.filter(n => n.status === 'unread').length;
          setUnreadCount(data.unreadCount || unread);
          
          console.log(`📊 Loaded ${notificationsList.length} notifications, ${unread} unread`);
        } else {
          console.log('⚠️ API returned success: false:', data.error || 'Unknown error');
          setNotifications([]);
          setUnreadCount(0);
        }
      } else if (response.status === 401) {
        console.log('❌ Authentication failed - invalid token');
        toast.error('Please log in again to view notifications');
        setNotifications([]);
        setUnreadCount(0);
      } else if (response.status === 404) {
        console.log('⚠️ Notifications endpoint not found - using empty state');
        setNotifications([]);
        setUnreadCount(0);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      
      // Only show error toast if it's not a network/404 error
      if (!error.message.includes('404') && !error.message.includes('NetworkError')) {
        toast.error('Failed to load notifications');
      }
      
      // Set fallback empty state
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch notifications on mount and when user changes
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Show toast notification based on priority
  const showNotificationToast = (notification) => {
    const toastOptions = {
      duration: notification.priority === 'critical' ? 6000 : 4000,
      position: 'top-right'
    };

    switch (notification.priority) {
      case 'critical':
        toast.error(`🚨 ${notification.title}`, toastOptions);
        break;
      case 'high':
        toast.error(`⚠️ ${notification.title}`, toastOptions);
        break;
      case 'normal':
        toast.success(`🔔 ${notification.title}`, toastOptions);
        break;
      case 'low':
        toast.success(`💬 ${notification.title}`, toastOptions);
        break;
      default:
        toast.success(`🔔 ${notification.title}`, toastOptions);
    }
  };

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        toast.error('Please log in to mark notifications as read');
        return;
      }
      
      console.log('📖 Marking notification as read:', notificationId);
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Emit to socket for real-time sync
        if (socket && socket.connected) {
          socket.emit('markNotificationRead', notificationId);
        }
        
        // Update local state immediately
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, status: 'read' }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        console.log('✅ Notification marked as read successfully');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to mark as read`);
      }
    } catch (error) {
      console.error('❌ Failed to mark notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  }, [socket]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        toast.error('Please log in to mark notifications as read');
        return;
      }
      
      console.log('📖 Marking all notifications as read...');
      const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, status: 'read' }))
        );
        setUnreadCount(0);
        toast.success('All notifications marked as read');
        console.log('✅ All notifications marked as read successfully');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to mark all as read`);
      }
    } catch (error) {
      console.error('❌ Failed to mark all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        toast.error('Please log in to delete notifications');
        return;
      }
      
      console.log('🗑️ Deleting notification:', notificationId);
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const deletedNotification = notifications.find(n => n.id === notificationId);
        
        // Remove from local state
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        
        // Update unread count if deleted notification was unread
        if (deletedNotification?.status === 'unread') {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        
        toast.success('Notification deleted');
        console.log('✅ Notification deleted successfully');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to delete notification`);
      }
    } catch (error) {
      console.error('❌ Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  }, [notifications]);

  // Send notification
  const sendNotification = useCallback(async (notificationData) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        toast.error('Please log in to send notifications');
        return false;
      }
      
      console.log('📤 Sending notification:', notificationData);
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationData)
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Notification sent successfully! 🎉');
        console.log('✅ Notification sent successfully:', result);
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to send notification`);
      }
    } catch (error) {
      console.error('❌ Failed to send notification:', error);
      toast.error(`Failed to send notification: ${error.message}`);
      return false;
    }
  }, []);

  // Refetch notifications
  const refetch = useCallback(async () => {
    console.log('🔄 Refreshing notifications...');
    await fetchNotifications();
    toast.success('Notifications refreshed');
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isConnected,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    sendNotification,
    refetch,
    socket
  };
};