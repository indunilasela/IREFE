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
import PendingApprovals from './components/Admin/PendingApprovals';
import AdminDashboard from './components/Admin/AdminDashboard';
import UserRegistration from './components/Admin/UserRegistration';
import UserList from './components/Admin/UserList';
import Dashboard from './components/Dashboard/Dashboard';
import WaterManagement from './components/WaterManagement/WaterManagement';
import TankManagement from './components/WaterManagement/TankManagement';
import CanalManagement from './components/WaterManagement/CanalManagement';
import PaddyFieldManagement from './components/WaterManagement/PaddyFieldManagement';
import ScheduleManagement from './components/WaterManagement/ScheduleManagement';
import NotificationCenter from './components/WaterManagement/NotificationCenter';
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
     <Router>
       <div className="App">
         <Toaster position="top-right" />
         <Routes>
           {/* Public Routes */}
           <Route path="/login" element={<Login />} />
           <Route path="/forgot-password" element={<ForgotPassword />} />
           <Route path="/reset-password" element={<ResetPassword />} />
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
           
           <Route path="/canals" element={
             <ProtectedRoute>
               <Layout>
                 <CanalManagement />
               </Layout>
             </ProtectedRoute>
           } />
           
           <Route path="/paddy-fields" element={
             <ProtectedRoute>
               <Layout>
                 <PaddyFieldManagement />
               </Layout>
             </ProtectedRoute>
           } />
           
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