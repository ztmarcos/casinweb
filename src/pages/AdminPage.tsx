import { useState, useEffect } from 'react';
import AdminLogin from '../components/AdminLogin';
import AdminDashboard from '../components/AdminDashboard';
import { useClientConfig } from '../hooks/useClientConfig';

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const config = useClientConfig();

  useEffect(() => {
    const authenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
    setIsAuthenticated(authenticated);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return <AdminDashboard config={config} />;
};

export default AdminPage;

