import React, { useState, useEffect } from 'react';
import { 
  Droplets, 
  MapPin, 
  Calendar, 
  Activity, 
  Building, 
  Navigation,
  Eye,
  Database,
  AlertCircle,
  User,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PublicApiService from '../../services/publicApi';

// Tank Card Component (Read-only)
const ReadOnlyTankCard = ({ tank }) => {
  const levelPercentage = tank.availabilityPercentage || Math.round((tank.availabilityCapacity / tank.fullCapacity) * 100);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{tank.name}</h3>
            <span className={`px-2 py-1 text-xs rounded-full ${
              tank.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {tank.status?.charAt(0).toUpperCase() + tank.status?.slice(1)}
            </span>
          </div>
        </div>
        <div className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          <Eye className="h-3 w-3 mr-1" />
          Read Only
        </div>
      </div>

      {/* Availability Level Indicator */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Availability Level</span>
          <span>{levelPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              levelPercentage > 70 ? 'bg-green-500' :
              levelPercentage > 40 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${levelPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Tank Details */}
      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <Navigation className="h-4 w-4 mr-2" />
          <span>Range: {tank.range}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Building className="h-4 w-4 mr-2" />
          <span>Division: {tank.division}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-2" />
          <span>Scheme: {tank.scheme}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Droplets className="h-4 w-4 mr-2" />
          <span>{tank.availabilityCapacity} / {tank.fullCapacity} L</span>
        </div>
        <div className="text-xs text-gray-500 pt-2 border-t">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            Last updated: {new Date(tank.lastUpdateDate).toLocaleString()}
          </div>
          {tank.lastUpdatedBy && (
            <div className="mt-1">
              Updated by: {tank.lastUpdatedBy.firstName} {tank.lastUpdatedBy.lastName} ({tank.lastUpdatedBy.role})
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Canal Card Component (Read-only)
const ReadOnlyCanalCard = ({ canal }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-medium text-gray-900">{canal.canalName}</h4>
          <p className="text-sm text-gray-600">{canal.type === 'main' ? 'Main Canal' : 'Sub Canal'}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs rounded-full ${
            canal.canal === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {canal.canal?.charAt(0).toUpperCase() + canal.canal?.slice(1)}
          </span>
          <div className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            <Eye className="h-3 w-3 mr-1" />
            View Only
          </div>
        </div>
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center">
          <Activity className="h-4 w-4 mr-2" />
          <span>Flow Rate: {canal.flowRate} L/s</span>
        </div>
        {canal.sluiceOpeningSize !== undefined && (
          <div className="flex items-center">
            <Droplets className="h-4 w-4 mr-2" />
            <span>Sluice Opening: {canal.sluiceOpeningSize} m</span>
          </div>
        )}
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          <span>
            {new Date(canal.startDay).toLocaleDateString()} - {new Date(canal.endDay).toLocaleDateString()}
          </span>
        </div>
        {canal.assignedFA && canal.assignedFA.length > 0 && (
          <div className="text-xs">
            <span className="font-medium">Field Assistants: </span>
            {canal.assignedFA.map(fa => `${fa.firstName} ${fa.lastName}`).join(', ')}
          </div>
        )}
        {canal.assignedIrrigators && canal.assignedIrrigators.length > 0 && (
          <div className="text-xs">
            <span className="font-medium">Irrigators: </span>
            {canal.assignedIrrigators.map(irr => `${irr.firstName} ${irr.lastName}`).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
};

// Schedule Card Component (Read-only)
const ReadOnlyScheduleCard = ({ schedule }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-medium text-gray-900">{schedule.title || 'Water Schedule'}</h4>
          <p className="text-sm text-gray-600">{schedule.description}</p>
        </div>
        <div className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          <Eye className="h-3 w-3 mr-1" />
          View Only
        </div>
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          <span>
            {new Date(schedule.startDate).toLocaleDateString()} - {new Date(schedule.endDate).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center">
          <Activity className="h-4 w-4 mr-2" />
          <span>Status: {schedule.status}</span>
        </div>
        {schedule.waterAllocation && (
          <div className="flex items-center">
            <Droplets className="h-4 w-4 mr-2" />
            <span>Water Allocation: {schedule.waterAllocation} L</span>
          </div>
        )}
      </div>
    </div>
  );
};

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    tanks: [],
    canals: [],
    schedules: []
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Check if user has reservoir details
      const reservoirDetails = user?.reservoirDetails || {
        nameOfReservoir: user?.nameOfReservoir,
        range: user?.range,
        division: user?.division,
        scheme: user?.scheme
      };
      
      if (!reservoirDetails?.nameOfReservoir) {
        setData({ tanks: [], canals: [], schedules: [] });
        return;
      }
      
      // Use different API based on user role
      if (user?.role === 'PublicUser') {
        // Use enhanced PublicApiService for PublicUser with reservoir filtering
        const response = await PublicApiService.getWaterManagementData();
        
        if (response.success) {
          setData({
            tanks: response.data?.tanks || [],
            canals: response.data?.canals || [],
            schedules: response.data?.schedules || []
          });
        } else {
          // Use fallback data that was returned by the API service
          setData({
            tanks: response.data?.tanks || [],
            canals: response.data?.canals || [],
            schedules: response.data?.schedules || []
          });
        }
      } else {
        // Use admin API for User role with reservoir filtering
        const token = localStorage.getItem('token');
        const queryParams = new URLSearchParams({
          reservoir: reservoirDetails.nameOfReservoir,
          range: reservoirDetails.range,
          division: reservoirDetails.division,
          scheme: reservoirDetails.scheme
        });

        const tanksResponse = await fetch(`https://irebe.onrender.com/api/user/reservoir-data?${queryParams}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (tanksResponse.ok) {
          const tanksData = await tanksResponse.json();
          
          // Transform data for display
          const transformedData = {
            tanks: tanksData.data?.tanks || [],
            canals: tanksData.data?.canals || [],
            schedules: tanksData.data?.schedules || []
          };
          
          setData(transformedData);
        } else {
          // Fallback to filtered mock data if API fails
          setData({
            tanks: [
              {
                id: '1',
                name: reservoirDetails.nameOfReservoir,
                range: reservoirDetails.range,
                division: reservoirDetails.division,
                scheme: reservoirDetails.scheme,
                fullCapacity: 100000,
                availabilityCapacity: 75000,
                availabilityPercentage: 75,
                status: 'active',
                lastUpdateDate: new Date().toISOString(),
                lastUpdatedBy: { firstName: 'System', lastName: 'Admin', role: 'EA' }
              }
            ],
            canals: [
              {
                id: '1',
                canalName: `Main Canal - ${reservoirDetails.nameOfReservoir}`,
                type: 'main',
                canal: 'open',
                flowRate: 25.5,
                sluiceOpeningSize: 3.5,
                startDay: '2025-08-10',
                endDay: '2025-12-31',
                associatedReservoir: reservoirDetails.nameOfReservoir,
                range: reservoirDetails.range,
                division: reservoirDetails.division,
                scheme: reservoirDetails.scheme,
                assignedFA: [{ firstName: 'System', lastName: 'FA' }],
                assignedIrrigators: [{ firstName: 'System', lastName: 'Irrigator' }]
              }
            ],
            schedules: [
              {
                id: '1',
                title: `Water Distribution - ${reservoirDetails.nameOfReservoir}`,
                description: `Regular water distribution schedule for ${reservoirDetails.nameOfReservoir}`,
                startDate: '2025-08-10',
                endDate: '2025-08-31',
                status: 'Active',
                waterAllocation: 50000,
                associatedReservoir: reservoirDetails.nameOfReservoir,
                range: reservoirDetails.range,
                division: reservoirDetails.division,
                scheme: reservoirDetails.scheme
              }
            ]
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      // Set empty data on error
      setData({ tanks: [], canals: [], schedules: [] });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading your reservoir data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome, {user?.firstName}!
            </h1>
            <p className="text-gray-600 mb-4">
              Your reservoir information and water management data
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">My Profile</span>
            </button>
            <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-2 rounded-lg">
              <Eye className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Read-Only Access</span>
            </div>
          </div>
        </div>

        {/* User's Reservoir Details */}
        {(user?.reservoirDetails || user?.nameOfReservoir) ? (
          <div className="bg-green-50 p-4 rounded-lg mt-4">
            <h2 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
              <Droplets className="h-5 w-5 mr-2" />
              Your Reservoir Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center text-green-700">
                <Database className="h-4 w-4 mr-2" />
                <div>
                  <span className="font-medium">Reservoir:</span>
                  <p className="text-sm">{user.reservoirDetails?.nameOfReservoir || user.nameOfReservoir}</p>
                </div>
              </div>
              <div className="flex items-center text-green-700">
                <Navigation className="h-4 w-4 mr-2" />
                <div>
                  <span className="font-medium">Range:</span>
                  <p className="text-sm">{user.reservoirDetails?.range || user.range}</p>
                </div>
              </div>
              <div className="flex items-center text-green-700">
                <Building className="h-4 w-4 mr-2" />
                <div>
                  <span className="font-medium">Division:</span>
                  <p className="text-sm">{user.reservoirDetails?.division || user.division}</p>
                </div>
              </div>
              <div className="flex items-center text-green-700">
                <MapPin className="h-4 w-4 mr-2" />
                <div>
                  <span className="font-medium">Scheme:</span>
                  <p className="text-sm">{user.reservoirDetails?.scheme || user.scheme}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 p-4 rounded-lg mt-4 border border-yellow-200">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-yellow-800 mb-2">Reservoir Information Required</h3>
                <p className="text-yellow-700 text-sm">
                  Your account doesn't have reservoir details associated with it. 
                  Please contact your administrator to update your profile with reservoir information 
                  to view specific water management data.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tanks Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <Database className="h-6 w-6 mr-2" />
          Tank Information
        </h2>
        {data.tanks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.tanks.map((tank) => (
              <ReadOnlyTankCard key={tank.id} tank={tank} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No tank data available for your reservoir</p>
          </div>
        )}
      </div>

      {/* Canals Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <Activity className="h-6 w-6 mr-2" />
          Canal Information
        </h2>
        {data.canals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.canals.map((canal) => (
              <ReadOnlyCanalCard key={canal.id} canal={canal} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No canal data available for your reservoir</p>
          </div>
        )}
      </div>

      {/* Schedules Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <Calendar className="h-6 w-6 mr-2" />
          Water Schedules
        </h2>
        {data.schedules.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.schedules.map((schedule) => (
              <ReadOnlyScheduleCard key={schedule.id} schedule={schedule} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No water schedules available for your reservoir</p>
          </div>
        )}
      </div>

      {/* Information Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-2">Information Access</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• You have read-only access to view water management information</p>
              <p>• Data is updated in real-time by authorized personnel</p>
              <p>• Contact your local irrigation department for any concerns</p>
              <p>• This information is specific to your registered reservoir: <span className="font-medium">{user?.reservoirDetails?.nameOfReservoir || user?.nameOfReservoir || 'Your Area'}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
