import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/Common/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import ChangePassword from './components/Auth/ChangePassword';
import AdminRegister from './components/Auth/AdminRegister';
import DirectAdminRegister from './components/Auth/DirectAdminRegister';
import AdminRegistrationSuccess from './components/Auth/AdminRegistrationSuccess';
import PublicRegister from './components/Auth/PublicRegister';
import PendingApprovals from './components/Admin/PendingApprovals';
import AdminDashboard from './components/Admin/AdminDashboard';
import UserRegistration from './components/Admin/UserRegistration';
import UserList from './components/Admin/UserList';
import Dashboard from './components/Dashboard/Dashboard';
import WaterManagement from './components/WaterManagement/WaterManagement';
import TankManagement from './components/WaterManagement/TankManagement';
import TankDetailsPage from './components/WaterManagement/TankDetailsPage';
import CanalManagement from './components/WaterManagement/CanalManagement'; // ✅ Updated Hierarchical Version
import PaddyFieldManagement from './components/WaterManagement/PaddyFieldManagement';
import ScheduleManagement from './components/WaterManagement/ScheduleManagement';
import NotificationCenter from './components/WaterManagement/NotificationCenter';
import Profile from './components/Common/Profile';
import ResponsiveDemo from './components/Test/ResponsiveDemo';
import './styles/globals.css';

// Dashboard Router Component
const DashboardRouter = () => {
  const { user } = useAuth();
  
  // Route Admin users to AdminDashboard, others to regular Dashboard
  if (user?.role === 'Admin') {
    return <AdminDashboard />;
  }
  
  return <Dashboard />;
};

function App() {
 return (
   <AuthProvider>
     <Router
       future={{
         v7_startTransition: true,
         v7_relativeSplatPath: true
       }}
     >
       <div className="App">
         {/* Enhanced Toast Configuration for Canal Notifications */}
         <Toaster 
           position="top-right"
           toastOptions={{
             duration: 4000,
             style: {
               background: '#363636',
               color: '#fff',
               fontSize: '14px'
             },
             success: {
               duration: 3000,
               iconTheme: {
                 primary: '#4ade80',
                 secondary: '#fff'
               }
             },
             error: {
               duration: 5000,
               iconTheme: {
                 primary: '#ef4444',
                 secondary: '#fff'
               }
             }
           }}
         />
         
         <Routes>
           {/* Public Routes */}
           <Route path="/login" element={<Login />} />
           <Route path="/forgot-password" element={<ForgotPassword />} />
           <Route path="/reset-password" element={<ResetPassword />} />
           <Route path="/register" element={<PublicRegister />} />
           <Route path="/admin-register" element={<DirectAdminRegister />} />
           <Route path="/admin-registration-success" element={<AdminRegistrationSuccess />} />
           
           {/* Protected Routes - Dashboard */}
           <Route path="/" element={
             <ProtectedRoute>
               <Layout>
                 <DashboardRouter />
               </Layout>
             </ProtectedRoute>
           } />
           
           {/* Water Management Routes - All roles can view */}
           <Route path="/water-management" element={
             <ProtectedRoute>
               <Layout>
                 <WaterManagement />
               </Layout>
             </ProtectedRoute>
           } />
           
           <Route path="/tanks" element={
             <ProtectedRoute>
               <Layout>
                 <TankManagement />
               </Layout>
             </ProtectedRoute>
           } />
           
           <Route path="/tanks/:tankId" element={
             <ProtectedRoute>
               <Layout>
                 <TankDetailsPage />
               </Layout>
             </ProtectedRoute>
           } />
           
           {/* ✅ HIERARCHICAL CANAL MANAGEMENT - Enhanced with Tree Structure */}
           <Route path="/canals" element={
             <ProtectedRoute>
               <Layout>
                 <CanalManagement />
               </Layout>
             </ProtectedRoute>
           } />
           
           {/* ✅ CANAL HIERARCHY DIRECT LINK - Alternative route for tree view */}
           <Route path="/canal-hierarchy" element={
             <ProtectedRoute>
               <Layout>
                 <CanalManagement />
               </Layout>
             </ProtectedRoute>
           } />
           
           {/* ✅ CANAL DETAILS ROUTE - For specific canal details */}
           <Route path="/canals/:canalId" element={
             <ProtectedRoute>
               <Layout>
                 <CanalManagement />
               </Layout>
             </ProtectedRoute>
           } />
           
           {/* <Route path="/paddy-fields" element={
             <ProtectedRoute>
               <Layout>
                 <PaddyFieldManagement />
               </Layout>
             </ProtectedRoute>
           } /> */}
           
           <Route path="/schedules" element={
             <ProtectedRoute>
               <Layout>
                 <ScheduleManagement />
               </Layout>
             </ProtectedRoute>
           } />
           
           <Route path="/notifications" element={
             <ProtectedRoute>
               <Layout>
                 <NotificationCenter />
               </Layout>
             </ProtectedRoute>
           } />
           
           {/* Demo Route - Responsive Layout */}
           <Route path="/demo/responsive" element={
             <ProtectedRoute>
               <Layout>
                 <ResponsiveDemo />
               </Layout>
             </ProtectedRoute>
           } />
           
           {/* Admin Routes */}
           <Route path="/admin/dashboard" element={
             <ProtectedRoute requiredRoles={['Admin']}>
               <Layout>
                 <AdminDashboard />
               </Layout>
             </ProtectedRoute>
           } />

           <Route path="/admin/register-user" element={
             <ProtectedRoute requiredRoles={['Admin']}>
               <Layout>
                 <UserRegistration />
               </Layout>
             </ProtectedRoute>
           } />

           <Route path="/admin/users" element={
             <ProtectedRoute requiredRoles={['Admin']}>
               <Layout>
                 <UserList />
               </Layout>
             </ProtectedRoute>
           } />
           
           <Route path="/admin/pending-approvals" element={
             <ProtectedRoute requiredRoles={['Admin']} requiredAdminLevel={['SuperAdmin']}>
               <Layout>
                 <PendingApprovals />
               </Layout>
             </ProtectedRoute>
           } />
           
           {/* User Settings */}
           <Route path="/profile" element={
             <ProtectedRoute>
               <Layout>
                 <Profile />
               </Layout>
             </ProtectedRoute>
           } />
           
           <Route path="/change-password" element={
             <ProtectedRoute>
               <Layout>
                 <ChangePassword />
               </Layout>
             </ProtectedRoute>
           } />
           
           {/* Redirect unknown routes to home */}
           <Route path="*" element={<Navigate to="/" replace />} />
         </Routes>
       </div>
     </Router>
   </AuthProvider>
 );
}

export default App;

// ========================================
// NAVIGATION MENU UPDATE
// ========================================

/*
UPDATE YOUR NAVIGATION MENU (Layout/Sidebar):

Add this to your navigation menu component:

import { Tree, Database, Activity } from 'lucide-react';

// In your navigation items:
{
  name: 'Canal Network',
  href: '/canals',
  icon: Tree,
  children: [
    {
      name: 'Hierarchy View',
      href: '/canals',
      icon: Database,
      description: 'Tree structure view'
    },
    {
      name: 'Canal Operations', 
      href: '/canal-hierarchy',
      icon: Activity,
      description: 'Manage flow operations'
    }
  ]
},

// OR simple single menu item:
{
  name: 'Canal Management',
  href: '/canals',
  icon: Tree,
  badge: 'NEW', // Optional badge for new feature
  description: 'Hierarchical canal network management'
}
*/

// ========================================
// DASHBOARD INTEGRATION
// ========================================

/*
ADD CANAL STATISTICS TO YOUR DASHBOARD:

// In your Dashboard.jsx or AdminDashboard.jsx, add:

import { Tree, Database, Activity, Droplets } from 'lucide-react';

// Add this to your dashboard stats:
const [canalStats, setCanalStats] = useState({
  totalTanks: 0,
  mainCanals: 0,
  branchCanals: 0,
  activeCanals: 0
});

// Fetch canal stats
useEffect(() => {
  fetchCanalStats();
}, []);

const fetchCanalStats = async () => {
  try {
    const response = await fetch('/api/ea/canals/hierarchy');
    if (response.ok) {
      const data = await response.json();
      const hierarchy = data.data || [];
      
      const stats = {
        totalTanks: hierarchy.length,
        mainCanals: hierarchy.reduce((count, tank) => count + (tank.children?.length || 0), 0),
        branchCanals: hierarchy.reduce((count, tank) => {
          return count + tank.children?.reduce((subCount, main) => 
            subCount + (main.children?.length || 0), 0) || 0;
        }, 0),
        activeCanals: countActiveCanals(hierarchy)
      };
      
      setCanalStats(stats);
    }
  } catch (error) {
    console.error('Failed to fetch canal stats:', error);
  }
};

// Add canal stats cards to your dashboard:
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
  <div className="bg-white rounded-lg shadow p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">Water Tanks</p>
        <p className="text-2xl font-bold text-blue-600">{canalStats.totalTanks}</p>
      </div>
      <Database className="h-8 w-8 text-blue-500" />
    </div>
  </div>
  
  <div className="bg-white rounded-lg shadow p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">Main Canals</p>
        <p className="text-2xl font-bold text-green-600">{canalStats.mainCanals}</p>
      </div>
      <Tree className="h-8 w-8 text-green-500" />
    </div>
  </div>
  
  <div className="bg-white rounded-lg shadow p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">Branch Canals</p>
        <p className="text-2xl font-bold text-yellow-600">{canalStats.branchCanals}</p>
      </div>
      <Activity className="h-8 w-8 text-yellow-500" />
    </div>
  </div>
  
  <div className="bg-white rounded-lg shadow p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">Active Flow</p>
        <p className="text-2xl font-bold text-purple-600">{canalStats.activeCanals}</p>
      </div>
      <Droplets className="h-8 w-8 text-purple-500" />
    </div>
  </div>
</div>

// Quick access to canal management:
<div className="mt-8">
  <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Link 
      to="/canals" 
      className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
    >
      <Tree className="h-8 w-8 text-green-600 mb-2" />
      <h4 className="font-medium text-green-900">Canal Network</h4>
      <p className="text-sm text-green-700">View hierarchical structure</p>
    </Link>
    
    <Link 
      to="/notifications" 
      className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
    >
      <Bell className="h-8 w-8 text-blue-600 mb-2" />
      <h4 className="font-medium text-blue-900">Notifications</h4>
      <p className="text-sm text-blue-700">Canal status updates</p>
    </Link>
    
    <Link 
      to="/schedules" 
      className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
    >
      <Calendar className="h-8 w-8 text-purple-600 mb-2" />
      <h4 className="font-medium text-purple-900">Water Schedules</h4>
      <p className="text-sm text-purple-700">Manage irrigation schedules</p>
    </Link>
  </div>
</div>
*/

// ========================================
// ENVIRONMENT VARIABLES
// ========================================

/*
ADD TO YOUR .env FILE:

# API Configuration
REACT_APP_API_URL=https://irebe.onrender.com/api
REACT_APP_SOCKET_URL=https://irebe.onrender.com

# Canal Management Features
REACT_APP_CANAL_HIERARCHY_ENABLED=true
REACT_APP_CANAL_NOTIFICATIONS_ENABLED=true

# Development
REACT_APP_ENVIRONMENT=development
REACT_APP_LOG_LEVEL=debug
*/