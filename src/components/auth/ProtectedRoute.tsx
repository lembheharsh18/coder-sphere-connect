
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { verifyToken } from '@/api/auth';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Verify token on protected routes
    const checkToken = async () => {
      if (isAuthenticated) {
        const token = localStorage.getItem('authToken');
        if (token) {
          const isValid = await verifyToken(token);
          if (!isValid) {
            toast.error('Your session has expired. Please log in again.');
            logout();
          }
        }
      }
    };
    
    checkToken();
  }, [isAuthenticated, logout, location.pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login and remember where they were trying to go
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
