import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Droplets, Users, Calendar, Bell, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const WaterManagement = () => {
  const { user } = useAuth();
  const [waterData, setWaterData] = useState({
    tanks: [],
    canals: [],
    schedules: [],
    notifications: []
  });
  const [loading, setLoading] = useState(true);

  // Determine if user can edit data
  const canEdit = ['DIA', 'DA', 'EA', 'FA', 'Irrigator'].includes(user?.role);
  const isReadOnly = user?.role === 'Farmer' || user?.role === 'Admin';

  useEffect(() => {
    fetchWaterData();
  }, []);

  const fetchWaterData = async () => {
    try {
      // Mock data for now - replace with actual API calls
      setWaterData({
        tanks: [
          { id: 1, name: 'Main Tank A', capacity: 1000, currentLevel: 750, source: 'River A' },
          { id: 2, name: 'Tank B', capacity: 800, currentLevel: 600, source: 'Reservoir B' }
        ],
        canals: [
          { id: 1, name: 'Main Canal', type: 'Main', flow: 45, status: 'Open' },
          { id: 2, name: 'Branch Canal 1', type: 'Branch', flow: 25, status: 'Open' }
        ],
        schedules: [
          { id: 1, date: '2025-08-05', time: '06:00', type: 'Opening', canal: 'Main Canal' },
          { id: 2, date: '2025-08-07', time: '18:00', type: 'Closing', canal: 'Branch Canal 1' }
        ],
        notifications: [
          { id: 1, message: 'Tank A water level updated', time: '2 hours ago', type: 'update' }
        ]
      });
    } catch (error) {
      console.error('Failed to fetch water data:', error);
    } finally {
      setLoading(false);
    }
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Water Management System</h1>
        <p className="mt-2 text-gray-600">
          Monitor and manage water resources - {user?.role} Access
          {isReadOnly && <span className="text-orange-600 font-medium"> (Read Only)</span>}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Droplets className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Tanks</p>
              <p className="text-2xl font-bold text-gray-900">{waterData.tanks.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Open Canals</p>
              <p className="text-2xl font-bold text-gray-900">
                {waterData.canals.filter(c => c.status === 'Open').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
              <p className="text-2xl font-bold text-gray-900">{waterData.schedules.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Bell className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Notifications</p>
              <p className="text-2xl font-bold text-gray-900">{waterData.notifications.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link
          to="/tanks"
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all"
        >
          <div className="flex items-center">
            <Droplets className="h-8 w-8 mr-4" />
            <div>
              <h3 className="text-xl font-bold">Tank Management</h3>
              <p className="text-blue-100">Monitor water levels and capacity</p>
            </div>
          </div>
        </Link>

        <Link
          to="/canals"
          className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg hover:from-green-600 hover:to-green-700 transition-all"
        >
          <div className="flex items-center">
            <Users className="h-8 w-8 mr-4" />
            <div>
              <h3 className="text-xl font-bold">Canal Management</h3>
              <p className="text-green-100">Manage flow and canal operations</p>
            </div>
          </div>
        </Link>

        <Link
          to="/schedules"
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg hover:from-purple-600 hover:to-purple-700 transition-all"
        >
          <div className="flex items-center">
            <Calendar className="h-8 w-8 mr-4" />
            <div>
              <h3 className="text-xl font-bold">Water Schedules</h3>
              <p className="text-purple-100">View and manage water schedules</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tank Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tank Status Overview</h3>
          <div className="space-y-4">
            {waterData.tanks.map((tank) => (
              <div key={tank.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{tank.name}</h4>
                  <p className="text-sm text-gray-600">Source: {tank.source}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {tank.currentLevel}L / {tank.capacity}L
                  </p>
                  <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full ${
                        (tank.currentLevel / tank.capacity) > 0.7 ? 'bg-green-600' :
                        (tank.currentLevel / tank.capacity) > 0.4 ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${(tank.currentLevel / tank.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Updates */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Updates</h3>
          <div className="space-y-3">
            {waterData.notifications.map((notification) => (
              <div key={notification.id} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                  <p className="text-xs text-gray-500">{notification.time}</p>
                </div>
              </div>
            ))}
            {waterData.notifications.length === 0 && (
              <p className="text-gray-500 text-center py-4">No recent updates</p>
            )}
          </div>
        </div>
      </div>

      {/* Role-based access notice */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-900">Access Level: {user?.role}</h4>
            <div className="mt-2 text-sm text-blue-700">
              {user?.role === 'Admin' && (
                <p>You can view all data but cannot edit water-related information. Use Admin Dashboard to manage users.</p>
              )}
              {user?.role === 'Farmer' && (
                <p>You have read-only access to monitor water schedules and tank levels.</p>
              )}
              {['DIA', 'DA'].includes(user?.role) && (
                <p>You can update tank levels, schedules, sluice gates, and canal flow data.</p>
              )}
              {user?.role === 'EA' && (
                <p>You can add tank/field names, set dates, and update water levels and schedules.</p>
              )}
              {['FA', 'Irrigator'].includes(user?.role) && (
                <p>You can update canal flow data and water issue dates.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterManagement;
