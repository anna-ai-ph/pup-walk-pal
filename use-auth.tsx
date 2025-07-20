
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';

export function useAuth() {
  const navigate = useNavigate();
  const { state, isLoading, logoutUser } = useApp();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    setIsAuthenticated(state.isRegistered);
  }, [state.isRegistered]);

  const handleLogout = () => {
    // Clear any pending redirections
    sessionStorage.removeItem('lastLoginAttempt');
    
    // Call the logoutUser function
    logoutUser();
    
    // Force a navigation to landing page
    navigate('/', { replace: true });
  };

  return {
    isAuthenticated,
    isLoading,
    logout: handleLogout,
  };
}
