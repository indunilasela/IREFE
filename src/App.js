import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
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
import Dashboard from './components/Dashboard/Dashboard';
import './styles/globals.css';

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
           
           {/* Protected Routes */}
           <Route path="/" element={
             <ProtectedRoute>
               <Layout>
                 <Dashboard />
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
           
           <Route path="/admin/pending-approvals" element={
             <ProtectedRoute requiredRoles={['Admin']} requiredAdminLevel={['SuperAdmin']}>
               <Layout>
                 <PendingApprovals />
               </Layout>
             </ProtectedRoute>
           } />
           
           {/* Redirect */}
           <Route path="*" element={<Navigate to="/" replace />} />
         </Routes>
       </div>
     </Router>
   </AuthProvider>
 );
}

export default App;