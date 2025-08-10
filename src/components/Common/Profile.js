import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();
  
  // For now, redirect User and PublicUser to change password
  // In the future, this could show a dedicated profile page
  if (user?.role === 'User' || user?.role === 'PublicUser') {
    return <Navigate to="/change-password" replace />;
  }
  
  // For other roles, also redirect to change password for now
  return <Navigate to="/change-password" replace />;
};

export default Profile;
