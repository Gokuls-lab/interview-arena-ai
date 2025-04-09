
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roleRequired?: 'recruiter' | 'jobseeker';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roleRequired }) => {
  const { currentUser, isRecruiter, isJobSeeker } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (roleRequired) {
    if (roleRequired === 'recruiter' && !isRecruiter) {
      return <Navigate to="/dashboard" />;
    }

    if (roleRequired === 'jobseeker' && !isJobSeeker) {
      return <Navigate to="/dashboard" />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
